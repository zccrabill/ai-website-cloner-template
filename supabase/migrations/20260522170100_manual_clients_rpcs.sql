-- RPCs for the admin clients CRM view.
--
-- All SECURITY DEFINER + caller-is-admin check, mirroring the pattern
-- established in get_admin_dashboard_stats / get_admin_activity_stream.
--
-- - create_manual_client    → insert a non-subscription client record
-- - update_manual_client    → edit an existing manual client
-- - close_manual_client     → soft-close (status='closed') a manual client
-- - list_admin_clients      → unified subscription + manual list with last
--                              touch + aging signals for the dashboard CRM
-- - get_admin_dashboard_stats is updated to include manual_clients count
--   (drops + recreates because postgres won't overload a function whose
--    return type changes without an explicit drop).

-- ---------------------------------------------------------------------------
-- create_manual_client
-- ---------------------------------------------------------------------------
create or replace function public.create_manual_client(
  p_full_name         text,
  p_email             text,
  p_business_name     text default null,
  p_phone             text default null,
  p_matter_description text default null,
  p_fee_arrangement   text default null,
  p_start_date        date default null,
  p_notes             text default null
)
returns public.members
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  v_row public.members;
begin
  select role into caller_role from public.members where user_id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_full_name is null or length(btrim(p_full_name)) = 0 then
    raise exception 'full_name is required' using errcode = '22023';
  end if;
  if p_email is null or length(btrim(p_email)) = 0 then
    raise exception 'email is required' using errcode = '22023';
  end if;

  insert into public.members (
    kind,
    user_id,
    role,
    email,
    full_name,
    business_name,
    phone,
    matter_description,
    fee_arrangement,
    client_status,
    start_date,
    notes,
    onboarding_complete
  )
  values (
    'manual',
    null,
    'member',
    lower(btrim(p_email)),
    btrim(p_full_name),
    nullif(btrim(coalesce(p_business_name, '')), ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_matter_description, '')), ''),
    p_fee_arrangement,
    'active',
    p_start_date,
    nullif(btrim(coalesce(p_notes, '')), ''),
    true
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_manual_client(text, text, text, text, text, text, date, text)
  to authenticated;

comment on function public.create_manual_client(text, text, text, text, text, text, date, text) is
  'Admin/attorney-only: insert a non-subscription client record. kind=manual, '
  'user_id=null, role=member, client_status=active by default. Returns the '
  'inserted row.';

-- ---------------------------------------------------------------------------
-- update_manual_client
-- ---------------------------------------------------------------------------
create or replace function public.update_manual_client(
  p_id                uuid,
  p_full_name         text default null,
  p_email             text default null,
  p_business_name     text default null,
  p_phone             text default null,
  p_matter_description text default null,
  p_fee_arrangement   text default null,
  p_client_status     text default null,
  p_start_date        date default null,
  p_notes             text default null
)
returns public.members
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  v_row public.members;
begin
  select role into caller_role from public.members where user_id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  -- Only patch fields the caller actually sent. COALESCE keeps prior values
  -- when the caller passed NULL, which is the intuitive "leave it alone"
  -- semantic for an admin form.
  update public.members
  set
    full_name         = coalesce(nullif(btrim(p_full_name), ''), full_name),
    email             = coalesce(nullif(lower(btrim(p_email)), ''), email),
    business_name     = case
                          when p_business_name is null then business_name
                          else nullif(btrim(p_business_name), '')
                        end,
    phone             = case
                          when p_phone is null then phone
                          else nullif(btrim(p_phone), '')
                        end,
    matter_description = case
                          when p_matter_description is null then matter_description
                          else nullif(btrim(p_matter_description), '')
                        end,
    fee_arrangement   = coalesce(p_fee_arrangement, fee_arrangement),
    client_status     = coalesce(p_client_status, client_status),
    start_date        = coalesce(p_start_date, start_date),
    notes             = case
                          when p_notes is null then notes
                          else nullif(btrim(p_notes), '')
                        end
  where id = p_id
    and kind = 'manual'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Manual client % not found', p_id using errcode = '02000';
  end if;

  return v_row;
end;
$$;

grant execute on function public.update_manual_client(uuid, text, text, text, text, text, text, text, date, text)
  to authenticated;

comment on function public.update_manual_client(uuid, text, text, text, text, text, text, text, date, text) is
  'Admin/attorney-only: patch a manual client. Only updates fields whose '
  'parameter is non-null (intuitive "leave it alone" semantic for the admin '
  'form). Refuses if the target row is not kind=manual.';

-- ---------------------------------------------------------------------------
-- close_manual_client
-- ---------------------------------------------------------------------------
create or replace function public.close_manual_client(p_id uuid)
returns public.members
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  v_row public.members;
begin
  select role into caller_role from public.members where user_id = auth.uid();
  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.members
  set client_status = 'closed'
  where id = p_id and kind = 'manual'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Manual client % not found', p_id using errcode = '02000';
  end if;

  return v_row;
end;
$$;

grant execute on function public.close_manual_client(uuid) to authenticated;

comment on function public.close_manual_client(uuid) is
  'Admin/attorney-only: soft-close a manual client by setting client_status '
  '= closed. Use this instead of DELETE so the matter history stays intact.';

-- ---------------------------------------------------------------------------
-- list_admin_clients
--
-- Unified clients list — subscription members and manual clients in one
-- result set. Includes a derived `last_touch_at` (greatest of member
-- updated_at, latest document upload, latest draft activity) so the CRM
-- view can show aging signals without N+1 queries.
-- ---------------------------------------------------------------------------
create or replace function public.list_admin_clients()
returns table (
  id                  uuid,
  kind                text,
  user_id             uuid,
  full_name           text,
  email               text,
  business_name       text,
  phone               text,
  role                text,
  -- Subscription fields (NULL for manual)
  subscription_tier   text,
  subscription_status text,
  current_period_end  timestamptz,
  -- Manual fields (NULL for subscription)
  matter_description  text,
  fee_arrangement     text,
  client_status       text,
  start_date          date,
  notes               text,
  -- Timeline
  created_at          timestamptz,
  updated_at          timestamptz,
  last_touch_at       timestamptz,
  days_since_touch    int
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller_role text;
begin
  select members.role into caller_role
  from public.members
  where members.user_id = auth.uid();

  if caller_role is null or caller_role not in ('admin', 'attorney') then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  with member_touch as (
    select
      m.id as member_id,
      greatest(
        m.updated_at,
        coalesce(
          (select max(d.uploaded_at) from public.documents d where d.user_id = m.user_id),
          m.updated_at
        ),
        coalesce(
          (select max(coalesce(dr.sent_at, dr.created_at)) from public.drafts dr where dr.user_id = m.user_id),
          m.updated_at
        )
      ) as latest_touch
    from public.members m
  )
  select
    m.id,
    m.kind,
    m.user_id,
    m.full_name,
    m.email,
    m.business_name,
    m.phone,
    m.role,
    m.subscription_tier,
    m.subscription_status,
    m.current_period_end,
    m.matter_description,
    m.fee_arrangement,
    m.client_status,
    m.start_date,
    m.notes,
    m.created_at,
    m.updated_at,
    mt.latest_touch as last_touch_at,
    greatest(0, (extract(epoch from (now() - mt.latest_touch)) / 86400)::int) as days_since_touch
  from public.members m
  join member_touch mt on mt.member_id = m.id
  -- Closed manual clients sink to the bottom; everyone else by recency.
  order by
    case when m.kind = 'manual' and m.client_status = 'closed' then 1 else 0 end,
    mt.latest_touch desc nulls last;
end;
$$;

grant execute on function public.list_admin_clients() to authenticated;

comment on function public.list_admin_clients() is
  'Admin/attorney-only: unified list of all clients (subscription members + '
  'manual clients), with derived last_touch_at and days_since_touch for the '
  'CRM dashboard aging signals. Closed manual clients sink to the bottom.';

-- ---------------------------------------------------------------------------
-- get_admin_dashboard_stats — extend with manual_clients count
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
  v_manual_clients int;
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
    where kind = 'subscription'
      and subscription_status in ('active', 'trialing')
      and coalesce(subscription_tier, 'explore') <> 'explore';

  select count(*) into v_total_members
    from public.members
    where kind = 'subscription'
      and onboarding_complete = true;

  select count(*) into v_manual_clients
    from public.members
    where kind = 'manual'
      and coalesce(client_status, 'active') <> 'closed';

  return jsonb_build_object(
    'pending_reviews', v_pending_reviews,
    'new_intakes', v_new_intakes,
    'paying_members', v_paying_members,
    'total_members', v_total_members,
    'manual_clients', v_manual_clients
  );
end;
$$;
