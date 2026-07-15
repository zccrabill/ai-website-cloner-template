-- Litigation assistant v1 (2026-07-14).
--
-- Attorney-only workspace for Available Law litigation matters:
--   litigation_matters            — the case file spine
--   litigation_deadlines          — rule-computed + manual deadlines, with an
--                                   explicit attorney_confirmed review gate
--   litigation_deadline_notices   — audit log of reminder emails sent
--   litigation_drafts             — pleading/motion drafting queue; every
--                                   AI-assisted draft must pass attorney review
--                                   before it can be marked final
--   litigation_compliance_items   — per-matter ethics/AI-compliance checklist,
--                                   seeded automatically on matter creation
--   litigation_settings           — singleton (ICS feed token, notice email)
--
-- Access model: everything here is Zachariah-only (is_admin()). No client
-- visibility in v1, so plain RLS + direct table access (no RPC layer needed —
-- there is no cross-tenant surface).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Matters
-- ---------------------------------------------------------------------------

create table public.litigation_matters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  caption text not null,
  client_name text not null,
  case_number text,
  court text,
  jurisdiction text not null default 'co_state'
    check (jurisdiction in ('co_state','d_colo','tenth_cir','other')),
  judge text,
  division text,
  matter_type text,
  side text check (side in ('plaintiff','defendant','other')),
  status text not null default 'prospective'
    check (status in ('prospective','active','stayed','settled','closed')),
  adverse_party text,
  opposing_counsel text,
  trial_date date,
  ai_disclosure_required boolean not null default false,
  ai_disclosure_notes text,
  notes text
);

-- ---------------------------------------------------------------------------
-- Deadlines
-- ---------------------------------------------------------------------------

create table public.litigation_deadlines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  matter_id uuid not null references public.litigation_matters(id) on delete cascade,
  title text not null,
  rule_ref text,
  -- Human-readable audit trail from the compute engine ("21 days after ...;
  -- rolled off holiday ..."), or 'Entered manually'.
  basis text,
  trigger_event text,
  trigger_date date,
  due_date date not null,
  computed boolean not null default false,
  -- Review gate: computed dates are suggestions until the attorney confirms.
  -- Unconfirmed deadlines still appear in feeds/notices (fail-loud beats
  -- fail-silent for dates), but are labeled UNCONFIRMED everywhere.
  attorney_confirmed boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending','done','vacated')),
  completed_at timestamptz,
  -- Lead times (days before due_date) at which reminder emails fire.
  reminder_lead_days int[] not null default '{45,30,14,7,3,1}',
  notes text
);

create index litigation_deadlines_due_idx
  on public.litigation_deadlines (status, due_date);

-- Audit log of sent reminders; the unique key makes the notice function
-- idempotent (a rerun can never double-send the same reminder).
create table public.litigation_deadline_notices (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references public.litigation_deadlines(id) on delete cascade,
  lead_days int not null,
  sent_at timestamptz not null default now(),
  unique (deadline_id, lead_days)
);

-- ---------------------------------------------------------------------------
-- Drafting queue
-- ---------------------------------------------------------------------------

create table public.litigation_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  matter_id uuid not null references public.litigation_matters(id) on delete cascade,
  title text not null,
  doc_type text not null default 'motion'
    check (doc_type in ('pleading','motion','response','reply','discovery','correspondence','other')),
  status text not null default 'requested'
    check (status in ('requested','in_progress','ai_draft','attorney_review','revisions','final','filed','abandoned')),
  deadline_id uuid references public.litigation_deadlines(id) on delete set null,
  content text,
  ai_assisted boolean not null default true,
  ai_tool text,
  attorney_reviewed_at timestamptz,
  review_notes text
);

-- RPC 5.1/5.3 guard, enforced in the database rather than trusted to the UI:
-- an AI-assisted draft cannot become final/filed without a recorded attorney
-- review. Deliberately a hard block, not a warning.
create or replace function public.tg_litigation_draft_review_gate()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.status in ('final','filed')
     and new.ai_assisted
     and new.attorney_reviewed_at is null then
    raise exception
      'AI-assisted draft cannot be marked % without attorney review (set attorney_reviewed_at)', new.status
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger litigation_draft_review_gate
  before insert or update on public.litigation_drafts
  for each row execute function public.tg_litigation_draft_review_gate();

-- ---------------------------------------------------------------------------
-- Compliance checklist
-- ---------------------------------------------------------------------------

create table public.litigation_compliance_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  matter_id uuid not null references public.litigation_matters(id) on delete cascade,
  category text not null default 'other'
    check (category in ('ai_disclosure','ethics','confidentiality','insurance','court_order','other')),
  item text not null,
  detail text,
  status text not null default 'open'
    check (status in ('open','satisfied','na')),
  resolved_at timestamptz,
  notes text
);

-- Seed the standard ethics/AI checklist on every new matter. Content mirrors
-- Colo. RPC duties + ABA Formal Op. 512; keep in sync with the Compliance tab
-- copy in /dashboard/litigation.
create or replace function public.tg_litigation_seed_compliance()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  insert into public.litigation_compliance_items (matter_id, category, item, detail) values
    (new.id, 'court_order', 'Check judge''s AI standing order / practice standards',
     'Several D. Colo. judges and some state divisions require disclosure or certification of generative-AI use in filings. Check the assigned judge''s practice standards at assignment and again at reassignment; record the result on the matter (AI disclosure toggle).'),
    (new.id, 'ai_disclosure', 'Determine AI-disclosure obligations for filings',
     'If the court requires it, add the certification to every affected filing. Even absent an order, Colo. RPC 3.3 candor duties apply to everything filed.'),
    (new.id, 'ethics', 'Verify every authority cited in AI-assisted drafts',
     'Colo. RPC 1.1, 3.1, 3.3. Every citation in an AI-assisted draft must be independently pulled and read before filing — no exceptions.'),
    (new.id, 'confidentiality', 'Confirm AI tools used on this matter meet RPC 1.6',
     'Only enter client confidences into tools with no-training commitments and adequate security; record which tools are approved for this matter.'),
    (new.id, 'ethics', 'Client consent / engagement-letter AI provision reviewed',
     'Per ABA Op. 512, boilerplate consent is insufficient for self-education uses; confirm the engagement letter''s AI provision actually covers the intended uses on this matter.'),
    (new.id, 'insurance', 'Confirm malpractice coverage for this matter type',
     'Verify the policy covers this practice area and any AI-assisted-work exclusions before the matter goes active.'),
    (new.id, 'ethics', 'Deadlines independently verified against current rules',
     'Computed dates are suggestions. Confirm each against the current rule text and any case management or standing order before relying on it.');
  return new;
end;
$$;

create trigger litigation_seed_compliance
  after insert on public.litigation_matters
  for each row execute function public.tg_litigation_seed_compliance();

-- ---------------------------------------------------------------------------
-- Settings singleton (calendar-feed token, notice recipient)
-- ---------------------------------------------------------------------------

create table public.litigation_settings (
  id boolean primary key default true check (id), -- singleton row
  ics_token text not null default encode(gen_random_bytes(24), 'hex'),
  notice_email text not null default 'zachariah@availablelaw.com',
  created_at timestamptz not null default now()
);

insert into public.litigation_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.tg_litigation_touch_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger litigation_matters_touch before update on public.litigation_matters
  for each row execute function public.tg_litigation_touch_updated_at();
create trigger litigation_deadlines_touch before update on public.litigation_deadlines
  for each row execute function public.tg_litigation_touch_updated_at();
create trigger litigation_drafts_touch before update on public.litigation_drafts
  for each row execute function public.tg_litigation_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — attorney-only, both admin concepts satisfied via is_admin()
-- ---------------------------------------------------------------------------

alter table public.litigation_matters enable row level security;
alter table public.litigation_deadlines enable row level security;
alter table public.litigation_deadline_notices enable row level security;
alter table public.litigation_drafts enable row level security;
alter table public.litigation_compliance_items enable row level security;
alter table public.litigation_settings enable row level security;

create policy litigation_matters_admin on public.litigation_matters
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy litigation_deadlines_admin on public.litigation_deadlines
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy litigation_deadline_notices_admin on public.litigation_deadline_notices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy litigation_drafts_admin on public.litigation_drafts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy litigation_compliance_items_admin on public.litigation_compliance_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy litigation_settings_admin on public.litigation_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.litigation_matters,
              public.litigation_deadlines,
              public.litigation_deadline_notices,
              public.litigation_drafts,
              public.litigation_compliance_items,
              public.litigation_settings
  from anon;

grant select, insert, update, delete
  on public.litigation_matters,
     public.litigation_deadlines,
     public.litigation_deadline_notices,
     public.litigation_drafts,
     public.litigation_compliance_items
  to authenticated;
grant select, update on public.litigation_settings to authenticated;

-- ---------------------------------------------------------------------------
-- Daily deadline-notice cron (6:00 AM Mountain ≈ 12:00 UTC; MST winter drift
-- to 5:00 AM is acceptable for a reminder email).
-- Same pg_net + legacy anon JWT pattern as tg_status_note_notify.
-- ---------------------------------------------------------------------------

create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.schedule(
  'litigation-deadline-notices-daily',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://ndxejojdxzzcjrnkscos.supabase.co/functions/v1/litigation-deadline-notices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keGVqb2pkeHp6Y2pybmtzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDcxOTQsImV4cCI6MjA5MTMyMzE5NH0.VYwOydmZ4BAsTmiAOVV_XGkEqOxhzZZUE6k_mASvI5M'
    ),
    body := '{}'::jsonb
  );
  $$
);
