-- Matters ledger — internal record of legal work handled by the firm.
--
-- Populated by four paths:
--   (1) one-time backfill from ~/Documents/Claude/Projects/Allora (source='backfill')
--   (2) Allora project auto-log on deliverable completion       (source='allora')
--   (3) Engagement-agreement skill auto-log on new client       (source='ea-skill')
--   (4) Manual entry from the admin dashboard / chat logging    (source='manual' | 'dashboard')
--
-- The public homepage reads ONLY aggregate counts via the get-matters-stats
-- Edge Function (service role). Raw rows stay locked down behind RLS.
--
-- Apply with: supabase db push  (or via the Supabase dashboard SQL editor)

create table if not exists public.matters (
  id uuid primary key default gen_random_uuid(),

  -- Internal client + matter identifiers. NEVER published.
  client_code text not null,
  matter_code text not null,

  -- Public category bucket — powers the homepage practice snapshot.
  -- Keep this enum short; granularity belongs in matter_subtype.
  matter_type text not null check (matter_type in (
    'engagement',
    'contract_drafting',
    'contract_review',
    'advisory',
    'governance',
    'litigation_support',
    'entity_formation',
    'employment',
    'dispute_resolution',
    'other'
  )),

  -- Specific form of the matter, used for the practice-area tag cloud.
  -- Free text but normalize to lowercase_snake_case. Avoid anything that
  -- could identify a specific client or deal.
  matter_subtype text,

  -- Jurisdiction. US state postal code (e.g. 'CO'), or 'Multi' / 'Federal'.
  state text,

  -- Lifecycle
  status text not null default 'active'
    check (status in ('active', 'closed', 'on_hold')),

  opened_at timestamptz not null default now(),
  closed_at timestamptz,

  -- Provenance — where the row came from. Useful for dedup and audit.
  source text not null default 'manual'
    check (source in ('allora', 'ea-skill', 'manual', 'backfill', 'dashboard')),

  -- v2 case-study opt-in. Flipped to true only via signed consent in
  -- Exhibit A of the Engagement Agreement. Dormant at launch.
  consent_to_publish boolean not null default false,

  -- Admin-only pointers. Never served to the public surface.
  internal_ref text,        -- e.g., Allora filename or folder hint
  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dedup: (client_code, matter_code) is the natural key for a matter.
create unique index if not exists matters_client_matter_idx
  on public.matters (client_code, matter_code);

-- Query helpers for the stats function and admin dashboard.
create index if not exists matters_opened_at_idx
  on public.matters (opened_at desc);
create index if not exists matters_status_idx
  on public.matters (status);
create index if not exists matters_matter_type_idx
  on public.matters (matter_type);
create index if not exists matters_state_idx
  on public.matters (state);

-- updated_at auto-touch trigger
create or replace function public.touch_matters_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists matters_touch_updated_at on public.matters;
create trigger matters_touch_updated_at
  before update on public.matters
  for each row execute function public.touch_matters_updated_at();

-- RLS: full lockdown. Only the service role (which bypasses RLS) can
-- read or write. No anon/authenticated policies are defined on purpose —
-- absence of policy = denial.
alter table public.matters enable row level security;

comment on table public.matters is
  'Internal ledger of legal matters. Powers PracticeSnapshotSection on '
  'the homepage via aggregate-only reads through get-matters-stats '
  'Edge Function. Raw rows are service-role only. Never expose '
  'client_code, matter_code, internal_ref, or internal_notes publicly.';
