-- The FAIIR Brief — delivery rail
-- Applied to project ndxejojdxzzcjrnkscos ("Available Law") on 2026-06-08.
-- Adds newsletter opt-in + tokenized unsubscribe to members, an issue archive,
-- and a per-recipient send log. All additive and idempotent.

-- 1. Members: opt-in flag, consent timestamp, unsubscribe token
alter table public.members
  add column if not exists newsletter_opt_in boolean not null default true;
alter table public.members
  add column if not exists newsletter_opt_in_at timestamptz default now();
alter table public.members
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

comment on column public.members.newsletter_opt_in is 'Whether this member receives The FAIIR Brief. Members can toggle in the dashboard; unsubscribe link flips it to false.';
comment on column public.members.unsubscribe_token is 'Opaque per-member token used in the Brief unsubscribe URL. Looked up by the brief-unsubscribe Edge Function (service role).';

-- Backfill consent timestamp to the true signup date for existing rows
update public.members set newsletter_opt_in_at = created_at where newsletter_opt_in_at is not null;

-- 2. Issue archive — one row per Brief issue
create table if not exists public.faiir_brief_issues (
  id uuid primary key default gen_random_uuid(),
  issue_number int unique not null,
  issue_date date,
  subject_line text not null,
  preheader text,
  html text not null,
  markdown text,
  status text not null default 'draft' check (status in ('draft','sending','sent','failed')),
  recipient_count int not null default 0,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.faiir_brief_issues is 'Archive of every FAIIR Brief issue (source for sends and the future /debrief archive page). Service-role only.';

-- 3. Per-recipient send log — audit trail + idempotency (no double-sends)
create table if not exists public.faiir_brief_sends (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.faiir_brief_issues(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  resend_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  unique (issue_id, email)
);
comment on table public.faiir_brief_sends is 'One row per (issue, recipient). Powers idempotent resends and a delivery audit trail. Service-role only.';

create index if not exists idx_faiir_brief_sends_issue on public.faiir_brief_sends(issue_id);
create index if not exists idx_members_unsubscribe_token on public.members(unsubscribe_token);

-- 4. RLS: internal tables, deny-by-default (no policies => service role only)
alter table public.faiir_brief_issues enable row level security;
alter table public.faiir_brief_sends enable row level security;
