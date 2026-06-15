-- Engagement admin controls (2026-06-15).
-- The attorney-side console RPCs: list engagements, drive phases, post status
-- notes, request documents, mark uploads reviewed, release deliverables.
-- Every function is admin-gated (is_admin) + SECURITY DEFINER (so it bypasses
-- table grants the way the existing admin RPCs do) and appends an
-- engagement_events row for the audit trail.

-- ---------------------------------------------------------------------------
-- admin_list_engagements(): one row per engagement for the console list, with
-- the org name, the designated contact, and the at-a-glance counts that tell
-- the attorney where each engagement needs attention.
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_engagements()
returns table (
  id uuid,
  org_id uuid,
  org_name text,
  title text,
  status public.engagement_status,
  fee_cents integer,
  contact_email text,
  phases_total integer,
  phases_complete integer,
  docs_outstanding integer,
  docs_to_review integer,
  last_activity_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  select
    e.id, e.org_id, o.name, e.title, e.status, e.fee_cents,
    (
      select om.email from public.org_members om
      where om.org_id = e.org_id and om.status <> 'revoked'
      order by (om.role = 'champion') desc, om.invited_at asc
      limit 1
    ) as contact_email,
    (select count(*)::int from public.engagement_phases p where p.engagement_id = e.id),
    (select count(*)::int from public.engagement_phases p where p.engagement_id = e.id and p.status = 'complete'),
    (select count(*)::int from public.engagement_documents d where d.engagement_id = e.id and d.state = 'needed'),
    (select count(*)::int from public.engagement_documents d where d.engagement_id = e.id and d.state = 'received'),
    greatest(
      e.updated_at,
      coalesce((select max(n.posted_at) from public.engagement_status_notes n where n.engagement_id = e.id), e.updated_at),
      coalesce((select max(ev.created_at) from public.engagement_events ev where ev.engagement_id = e.id), e.updated_at)
    ) as last_activity_at,
    e.created_at
  from public.engagements e
  join public.orgs o on o.id = e.org_id
  order by e.created_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_set_engagement_status()
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_engagement_status(
  p_engagement_id uuid,
  p_status public.engagement_status
)
returns public.engagements
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagements;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.engagements
  set status = p_status,
      kickoff_at = case when p_status = 'active' and kickoff_at is null then now()::date else kickoff_at end
  where id = p_engagement_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Engagement % not found', p_engagement_id using errcode = '02000';
  end if;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (p_engagement_id, 'engagement.status_changed', jsonb_build_object('status', p_status));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_set_phase_status(): drives the client-facing tracker. Manages the
-- started_at / completed_at timestamps so the attorney only picks a status.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_phase_status(
  p_phase_id uuid,
  p_status public.engagement_phase_status
)
returns public.engagement_phases
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagement_phases;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.engagement_phases
  set status = p_status,
      started_at = case
        when p_status in ('in_progress', 'waiting_on_client', 'complete') and started_at is null
        then now() else started_at end,
      completed_at = case
        when p_status = 'complete' then now()
        else null end
  where id = p_phase_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Phase % not found', p_phase_id using errcode = '02000';
  end if;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (v_row.engagement_id, 'phase.status_changed',
          jsonb_build_object('phase_id', p_phase_id, 'key', v_row.key, 'status', p_status));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_post_status_note(): the standing "notes from your attorney" surface.
-- ---------------------------------------------------------------------------
create or replace function public.admin_post_status_note(
  p_engagement_id uuid,
  p_body text
)
returns public.engagement_status_notes
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagement_status_notes;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_body is null or length(btrim(p_body)) = 0 then
    raise exception 'Note body is required' using errcode = '22023';
  end if;

  insert into public.engagement_status_notes (engagement_id, body)
  values (p_engagement_id, btrim(p_body))
  returning * into v_row;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (p_engagement_id, 'status_note.posted', jsonb_build_object('note_id', v_row.id));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_add_document_request(): adds a "Needed" card to the document room.
-- ---------------------------------------------------------------------------
create or replace function public.admin_add_document_request(
  p_engagement_id uuid,
  p_label text,
  p_description text default null
)
returns public.engagement_documents
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagement_documents;
  v_next_pos integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_label is null or length(btrim(p_label)) = 0 then
    raise exception 'A document label is required' using errcode = '22023';
  end if;

  select coalesce(max(position), 0) + 1 into v_next_pos
  from public.engagement_documents where engagement_id = p_engagement_id;

  insert into public.engagement_documents (engagement_id, label, description, state, position)
  values (p_engagement_id, btrim(p_label), nullif(btrim(coalesce(p_description, '')), ''), 'needed', v_next_pos)
  returning * into v_row;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (p_engagement_id, 'document.requested', jsonb_build_object('document_id', v_row.id, 'label', v_row.label));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_set_document_reviewed(): closes the loop on an uploaded document.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_document_reviewed(
  p_document_id uuid
)
returns public.engagement_documents
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagement_documents;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.engagement_documents
  set state = 'reviewed', reviewed_at = now()
  where id = p_document_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Document % not found', p_document_id using errcode = '02000';
  end if;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (v_row.engagement_id, 'document.reviewed', jsonb_build_object('document_id', p_document_id, 'label', v_row.label));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_add_deliverable(): stage a deliverable, optionally releasing it now.
-- Clients only ever see released rows (RLS), so p_release=false stages it
-- silently until the attorney is ready.
-- ---------------------------------------------------------------------------
create or replace function public.admin_add_deliverable(
  p_engagement_id uuid,
  p_title text,
  p_description text default null,
  p_phase_id uuid default null,
  p_release boolean default false
)
returns public.deliverables
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.deliverables;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_title is null or length(btrim(p_title)) = 0 then
    raise exception 'A deliverable title is required' using errcode = '22023';
  end if;

  insert into public.deliverables (engagement_id, phase_id, title, description, status, released_at)
  values (
    p_engagement_id, p_phase_id, btrim(p_title),
    nullif(btrim(coalesce(p_description, '')), ''),
    case when p_release then 'released'::public.deliverable_status else 'draft'::public.deliverable_status end,
    case when p_release then now() else null end
  )
  returning * into v_row;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (p_engagement_id,
          case when p_release then 'deliverable.released' else 'deliverable.drafted' end,
          jsonb_build_object('deliverable_id', v_row.id, 'title', v_row.title));

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_set_deliverable_released(): flip a staged draft to released.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_deliverable_released(
  p_deliverable_id uuid
)
returns public.deliverables
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.deliverables;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.deliverables
  set status = 'released', released_at = coalesce(released_at, now())
  where id = p_deliverable_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Deliverable % not found', p_deliverable_id using errcode = '02000';
  end if;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (v_row.engagement_id, 'deliverable.released', jsonb_build_object('deliverable_id', p_deliverable_id, 'title', v_row.title));

  return v_row;
end;
$$;

-- Grants: authenticated (the attorney's own session) + service_role; never anon.
revoke execute on function public.admin_list_engagements() from public, anon;
grant execute on function public.admin_list_engagements() to authenticated, service_role;
revoke execute on function public.admin_set_engagement_status(uuid, public.engagement_status) from public, anon;
grant execute on function public.admin_set_engagement_status(uuid, public.engagement_status) to authenticated, service_role;
revoke execute on function public.admin_set_phase_status(uuid, public.engagement_phase_status) from public, anon;
grant execute on function public.admin_set_phase_status(uuid, public.engagement_phase_status) to authenticated, service_role;
revoke execute on function public.admin_post_status_note(uuid, text) from public, anon;
grant execute on function public.admin_post_status_note(uuid, text) to authenticated, service_role;
revoke execute on function public.admin_add_document_request(uuid, text, text) from public, anon;
grant execute on function public.admin_add_document_request(uuid, text, text) to authenticated, service_role;
revoke execute on function public.admin_set_document_reviewed(uuid) from public, anon;
grant execute on function public.admin_set_document_reviewed(uuid) to authenticated, service_role;
revoke execute on function public.admin_add_deliverable(uuid, text, text, uuid, boolean) from public, anon;
grant execute on function public.admin_add_deliverable(uuid, text, text, uuid, boolean) to authenticated, service_role;
revoke execute on function public.admin_set_deliverable_released(uuid) from public, anon;
grant execute on function public.admin_set_deliverable_released(uuid) to authenticated, service_role;
