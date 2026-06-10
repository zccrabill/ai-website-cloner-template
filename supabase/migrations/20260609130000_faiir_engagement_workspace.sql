-- FAIIR engagement workspace — schema v1 (2026-06-09).
-- First-client cut of FAIIR/onboarding-portal/FAIIR-Onboarding-Portal-Blueprint.md:
-- engagements + 8-phase tracker + document room records + staged deliverables +
-- status notes + append-only event log, all keyed to the existing orgs spine.
-- Conventions follow orgs/org_members: reads via is_org_member()/is_admin(),
-- writes via is_admin(); helper functions are SECURITY DEFINER with pinned
-- search_path. Client write paths (doc upload) arrive with the storage work.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.engagement_status as enum ('draft', 'invited', 'active', 'closed');
create type public.engagement_phase_status as enum ('pending', 'in_progress', 'waiting_on_client', 'complete');
create type public.engagement_doc_state as enum ('needed', 'received', 'reviewed');
create type public.deliverable_status as enum ('draft', 'released');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  recipe text not null default 'aligned_engagement',
  title text not null,
  status public.engagement_status not null default 'draft',
  fee_cents integer,
  engagement_letter_signed_at timestamptz,
  kickoff_at date,
  target_close_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.engagements is
  'One FAIIR engagement per client firm. The engagement letter itself is signed offline (countersigned PDF) for now; engagement_letter_signed_at records it.';

create table public.engagement_phases (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  position integer not null,
  key text not null,
  title text not null,
  client_summary text,
  status public.engagement_phase_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (engagement_id, position),
  unique (engagement_id, key)
);
comment on table public.engagement_phases is
  'The client-facing 8-phase tracker. client_summary is attorney-voiced copy shown in the workspace.';

create table public.engagement_documents (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  label text not null,
  description text,
  state public.engagement_doc_state not null default 'needed',
  storage_path text,
  uploaded_by uuid,
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.engagement_documents is
  'Document room cards (Needed / Received / Reviewed). storage_path points into the private engagement-docs bucket; file access is via short-lived signed URLs only.';

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  phase_id uuid references public.engagement_phases(id) on delete set null,
  title text not null,
  description text,
  storage_path text,
  status public.deliverable_status not null default 'draft',
  released_at timestamptz,
  created_at timestamptz not null default now()
);
comment on table public.deliverables is
  'Staged deliverables. Clients only ever see status = released; drafts are attorney-side.';

create table public.engagement_status_notes (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  body text not null,
  author text not null default 'Zachariah Crabill',
  posted_at timestamptz not null default now()
);
comment on table public.engagement_status_notes is
  'The standing status surface (replaces the Friday email into the void). Short, named, attorney-voiced.';

create table public.engagement_events (
  id bigint generated always as identity primary key,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
comment on table public.engagement_events is
  'Append-only log. The future intake.submitted automation contract lands here. Never client-readable.';

create index engagements_org_idx on public.engagements (org_id);
create index engagement_phases_order_idx on public.engagement_phases (engagement_id, position);
create index engagement_documents_order_idx on public.engagement_documents (engagement_id, position);
create index deliverables_engagement_idx on public.deliverables (engagement_id);
create index engagement_status_notes_recent_idx on public.engagement_status_notes (engagement_id, posted_at desc);
create index engagement_events_recent_idx on public.engagement_events (engagement_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger engagements_touch_updated_at
  before update on public.engagements
  for each row execute function public.set_updated_at();

create trigger engagement_phases_touch_updated_at
  before update on public.engagement_phases
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helper: does the caller belong to the org that owns this engagement?
-- ---------------------------------------------------------------------------
create or replace function public.is_engagement_member(p_engagement uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.engagements e
    where e.id = p_engagement
      and public.is_org_member(e.org_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.engagements enable row level security;
alter table public.engagement_phases enable row level security;
alter table public.engagement_documents enable row level security;
alter table public.deliverables enable row level security;
alter table public.engagement_status_notes enable row level security;
alter table public.engagement_events enable row level security;

-- No anonymous access to any workspace table, at the privilege layer.
revoke all on public.engagements,
              public.engagement_phases,
              public.engagement_documents,
              public.deliverables,
              public.engagement_status_notes,
              public.engagement_events
from anon;

create policy "org members read own engagements" on public.engagements
  for select using (public.is_org_member(org_id) or public.is_admin());
create policy "admin writes engagements" on public.engagements
  for all using (public.is_admin()) with check (public.is_admin());

create policy "org members read own phases" on public.engagement_phases
  for select using (public.is_engagement_member(engagement_id) or public.is_admin());
create policy "admin writes phases" on public.engagement_phases
  for all using (public.is_admin()) with check (public.is_admin());

create policy "org members read own document cards" on public.engagement_documents
  for select using (public.is_engagement_member(engagement_id) or public.is_admin());
create policy "admin writes document cards" on public.engagement_documents
  for all using (public.is_admin()) with check (public.is_admin());

create policy "org members read released deliverables" on public.deliverables
  for select using (
    (status = 'released' and public.is_engagement_member(engagement_id))
    or public.is_admin()
  );
create policy "admin writes deliverables" on public.deliverables
  for all using (public.is_admin()) with check (public.is_admin());

create policy "org members read own status notes" on public.engagement_status_notes
  for select using (public.is_engagement_member(engagement_id) or public.is_admin());
create policy "admin writes status notes" on public.engagement_status_notes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin reads events" on public.engagement_events
  for select using (public.is_admin());
create policy "admin writes events" on public.engagement_events
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- claim_org_memberships(): called after login. Converts an emailed invite
-- (org_members row with user_id null, status invited) into an active seat for
-- the authenticated caller, matched by email. Idempotent; returns rows claimed.
-- Each person gets their own seat — forwarding a magic link does NOT transfer
-- a seat, because claiming matches the *authenticated* email.
-- ---------------------------------------------------------------------------
create or replace function public.claim_org_memberships()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_email text;
  v_count integer;
begin
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if auth.uid() is null or v_email = '' then
    return 0;
  end if;

  update public.org_members om
  set user_id = auth.uid(),
      status = 'active',
      accepted_at = now()
  where om.user_id is null
    and om.status = 'invited'
    and lower(om.email) = v_email;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.claim_org_memberships() from public, anon;
grant execute on function public.claim_org_memberships() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- create_faiir_engagement(): admin-only one-call setup — org (new or existing),
-- the designated contact's invited seat, the engagement, the 8-phase tracker,
-- and the created event. The invite email itself is sent by the app, not here.
-- ---------------------------------------------------------------------------
create or replace function public.create_faiir_engagement(
  p_org_name text,
  p_contact_email text,
  p_contact_role public.member_role default 'champion',
  p_title text default 'AI Governance — Aligned Engagement',
  p_recipe text default 'aligned_engagement',
  p_fee_cents integer default null,
  p_hq_state text default null,
  p_headcount integer default null,
  p_holds_phi boolean default false,
  p_org_id uuid default null
)
returns public.engagements
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_org_id uuid;
  v_engagement public.engagements;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_contact_email is null or position('@' in p_contact_email) = 0 then
    raise exception 'A valid contact email is required' using errcode = '22023';
  end if;

  if p_org_id is not null then
    v_org_id := p_org_id;
  else
    if p_org_name is null or length(btrim(p_org_name)) = 0 then
      raise exception 'org name is required when no org_id is given' using errcode = '22023';
    end if;
    insert into public.orgs (name, slug, hq_state, headcount, holds_phi, industry)
    values (
      btrim(p_org_name),
      regexp_replace(lower(btrim(p_org_name)), '[^a-z0-9]+', '-', 'g'),
      p_hq_state,
      p_headcount,
      p_holds_phi,
      'legal'
    )
    returning id into v_org_id;
  end if;

  -- The designated contact gets their own invited seat (claimed on first login).
  -- Idempotent: re-running for the same org + email does not create a second seat.
  if not exists (
    select 1 from public.org_members om
    where om.org_id = v_org_id
      and lower(om.email) = lower(btrim(p_contact_email))
      and om.status <> 'revoked'
  ) then
    insert into public.org_members (org_id, email, role, status, invited_by)
    values (v_org_id, lower(btrim(p_contact_email)), p_contact_role, 'invited', auth.uid());
  end if;

  insert into public.engagements (org_id, recipe, title, status, fee_cents)
  values (v_org_id, p_recipe, p_title, 'draft', p_fee_cents)
  returning * into v_engagement;

  insert into public.engagement_phases (engagement_id, position, key, title, client_summary) values
    (v_engagement.id, 1, 'intake', 'Intake & Documents',
     'We collect how your firm uses AI today — tools, accounts, agreements — and you upload the documents that drive everything else.'),
    (v_engagement.id, 2, 'vendor_review', 'Vendor & Data Review',
     'We review where your client data actually goes: vendor terms, retention, training use, and BAA status for each tool.'),
    (v_engagement.id, 3, 'impact_assessments', 'Impact Assessments',
     'We assess the highest-risk uses we found, in plain terms your partners and your carrier can rely on.'),
    (v_engagement.id, 4, 'policy', 'Policy',
     'Your AI policy gets rebuilt to cover data handling — vendor whitelist, prohibited uses, confidentiality protocol, client-disclosure language.'),
    (v_engagement.id, 5, 'tools_memo', 'Tools & Procurement Memo',
     'Concrete guidance on the right tier and configuration for each tool, so the fix is purchasable, not theoretical.'),
    (v_engagement.id, 6, 'training', 'Training',
     'Attorney and staff sessions scheduled around your team, with reference cards your people will actually use.'),
    (v_engagement.id, 7, 'final_deliverables', 'Final Deliverables',
     'Everything assembled, attorney-reviewed, and released into your library.'),
    (v_engagement.id, 8, 'close', 'Close & Certification Path',
     'Closing readout, your archive package, and what the path to FAIIR certification looks like from here.');

  insert into public.engagement_events (engagement_id, kind, payload)
  values (
    v_engagement.id,
    'engagement.created',
    jsonb_build_object('org_id', v_org_id, 'recipe', p_recipe, 'contact_email', lower(btrim(p_contact_email)))
  );

  return v_engagement;
end;
$$;

revoke execute on function public.create_faiir_engagement(text, text, public.member_role, text, text, integer, text, integer, boolean, uuid) from public, anon;
grant execute on function public.create_faiir_engagement(text, text, public.member_role, text, text, integer, text, integer, boolean, uuid) to authenticated, service_role;

-- is_engagement_member mirrors the grant posture of is_org_member (RLS helper).
revoke execute on function public.is_engagement_member(uuid) from public;
grant execute on function public.is_engagement_member(uuid) to anon, authenticated, service_role;
