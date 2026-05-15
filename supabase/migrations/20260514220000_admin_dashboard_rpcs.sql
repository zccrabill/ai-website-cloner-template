-- RPCs that power the admin/attorney view of /dashboard.
--
-- Both functions are SECURITY DEFINER so they can read across all members,
-- drafts, intakes, etc. — bypassing the owner-scoped RLS on those tables.
-- Each function asserts caller is admin/attorney before returning anything,
-- so the SECURITY DEFINER privilege is properly gated.
--
-- Apply with: supabase db push

-- ---------------------------------------------------------------------------
-- get_admin_dashboard_stats() → jsonb
--
-- Returns the four headline counters the admin home page shows at the top:
--   { pending_reviews, new_intakes, paying_members, total_members }
-- Cheap query (all are aggregate counts on tables with indexed columns).
-- ---------------------------------------------------------------------------
create or replace function public.get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller_role text;
  v_pending_reviews int;
  v_new_intakes int;
  v_paying_members int;
  v_total_members int;
begin
  select role into caller_role from public.members where user_id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select count(*) into v_pending_reviews
    from public.drafts where status = 'pending_review';

  select count(*) into v_new_intakes
    from public.faiir_intakes where status = 'new';

  select count(*) into v_paying_members
    from public.members
    where subscription_status in ('active', 'trialing')
      and coalesce(subscription_tier, 'explore') <> 'explore';

  select count(*) into v_total_members
    from public.members where onboarding_complete = true;

  return jsonb_build_object(
    'pending_reviews', v_pending_reviews,
    'new_intakes', v_new_intakes,
    'paying_members', v_paying_members,
    'total_members', v_total_members
  );
end;
$$;

grant execute on function public.get_admin_dashboard_stats() to authenticated;

comment on function public.get_admin_dashboard_stats() is
  'Headline stats for the admin dashboard. Asserts caller is admin/attorney. '
  'Returns { pending_reviews, new_intakes, paying_members, total_members }.';

-- ---------------------------------------------------------------------------
-- get_admin_activity_stream(p_limit int) → setof rows
--
-- Returns the most recent N events across all the firm-facing tables, fused
-- into one timeline. Each branch is per-source-limited first so the outer
-- limit isn't fed an unbounded scan.
--
-- Columns:
--   kind        text — event type (member.onboarded, document.uploaded, …)
--   occurred_at timestamptz — when the event happened (for sorting + display)
--   label       text — primary headline (e.g. "New member: Jane Doe")
--   sublabel    text — context line (tier, business, email, etc.)
--   link        text — destination when the row is clicked
-- ---------------------------------------------------------------------------
create or replace function public.get_admin_activity_stream(p_limit int default 20)
returns table (
  kind text,
  occurred_at timestamptz,
  label text,
  sublabel text,
  link text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller_role text;
begin
  select role into caller_role from public.members where user_id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  with recent_members as (
    select 'member.onboarded'::text as kind,
      m.created_at as occurred_at,
      ('New member: ' || coalesce(nullif(m.full_name, ''), m.email))::text as label,
      nullif(
        concat_ws(
          ' · ',
          nullif(m.business_name, ''),
          case when coalesce(m.subscription_tier, 'explore') = 'explore'
               then 'Explore (free)'
               else initcap(m.subscription_tier) end
        ),
        ''
      )::text as sublabel,
      '/dashboard/review'::text as link
    from public.members m
    where m.onboarding_complete = true
    order by m.created_at desc nulls last
    limit p_limit
  ),
  recent_uploads as (
    select 'document.uploaded'::text,
      d.uploaded_at,
      ('Document uploaded: ' || d.filename)::text,
      (
        select coalesce(nullif(m.full_name, ''), m.email)
        from public.members m where m.user_id = d.user_id
      )::text,
      '/dashboard/review'::text
    from public.documents d
    where d.source = 'client_upload'
    order by d.uploaded_at desc nulls last
    limit p_limit
  ),
  recent_drafts_sent as (
    select 'draft.sent'::text,
      dr.sent_at,
      ('Draft sent: ' || dr.title)::text,
      (
        select coalesce(nullif(m.full_name, ''), m.email)
        from public.members m where m.user_id = dr.user_id
      )::text,
      '/dashboard/review'::text
    from public.drafts dr
    where dr.status = 'sent' and dr.sent_at is not null
    order by dr.sent_at desc nulls last
    limit p_limit
  ),
  recent_drafts_pending as (
    select 'draft.pending'::text,
      dr.created_at,
      ('Draft awaiting review: ' || dr.title)::text,
      (
        select coalesce(nullif(m.full_name, ''), m.email)
        from public.members m where m.user_id = dr.user_id
      )::text,
      '/dashboard/review'::text
    from public.drafts dr
    where dr.status = 'pending_review'
    order by dr.created_at desc nulls last
    limit p_limit
  ),
  recent_faiir_intakes as (
    select 'faiir.intake_received'::text,
      fi.created_at,
      ('FAIIR intake: ' || fi.full_name)::text,
      fi.email::text,
      '/dashboard/review'::text
    from public.faiir_intakes fi
    order by fi.created_at desc nulls last
    limit p_limit
  ),
  recent_aiact_leads as (
    select 'ai_act.lead'::text,
      a.created_at,
      ('AI Act lead: ' || coalesce(nullif(a.name, ''), a.email))::text,
      nullif(
        concat_ws(
          ' · ',
          nullif(a.company, ''),
          'score ' || a.score::text || '/100',
          a.rag_status
        ),
        ''
      )::text,
      '/dashboard/review'::text
    from public.ai_act_assessments a
    order by a.created_at desc nulls last
    limit p_limit
  ),
  recent_assessment_leads as (
    select 'assessment.lead'::text,
      ar.created_at,
      ('Assessment lead: ' || coalesce(nullif(ar.email, ''), '(no email)'))::text,
      concat_ws(
        ' · ',
        ar.assessment_id::text,
        ar.overall_tier::text,
        ar.overall_score::text || '/' || ar.overall_max::text
      )::text,
      '/dashboard/review'::text
    from public.assessment_responses ar
    where ar.email is not null
    order by ar.created_at desc nulls last
    limit p_limit
  ),
  all_events as (
    select * from recent_members
    union all select * from recent_uploads
    union all select * from recent_drafts_sent
    union all select * from recent_drafts_pending
    union all select * from recent_faiir_intakes
    union all select * from recent_aiact_leads
    union all select * from recent_assessment_leads
  )
  select e.kind, e.occurred_at, e.label, e.sublabel, e.link
  from all_events e
  order by e.occurred_at desc nulls last
  limit p_limit;
end;
$$;

grant execute on function public.get_admin_activity_stream(int) to authenticated;

comment on function public.get_admin_activity_stream(int) is
  'Merged activity timeline across signups, uploads, draft lifecycle, FAIIR '
  'intakes, AI Act leads, and generic assessment leads. SECURITY DEFINER + '
  'role check so it can read across all members. Default limit 20.';
