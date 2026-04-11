-- Colorado AI Act Readiness Assessment — lead capture table
--
-- Populated by anonymous visitors completing the /ai-act-checker flow.
-- The front-end inserts one row per completed assessment after email capture.
-- Only the service role can read rows; public can only insert.
--
-- Apply with: supabase db push  (or via the Supabase dashboard SQL editor)

create table if not exists public.ai_act_assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contact info captured at the email gate
  email text not null,
  name text,
  company text,
  role text,

  -- Raw answers keyed by question id ({ai_use: "best", ...})
  answers jsonb not null,

  -- Computed at submission time
  score int not null check (score between 0 and 100),
  rag_status text not null check (rag_status in ('green', 'amber', 'red')),

  -- Provenance / lifecycle
  source text not null default 'ai-act-checker',
  contacted boolean not null default false,
  contact_notes text,
  user_agent text,
  referrer text
);

-- Index on created_at for dashboard queries and email sequencing
create index if not exists ai_act_assessments_created_at_idx
  on public.ai_act_assessments (created_at desc);

create index if not exists ai_act_assessments_email_idx
  on public.ai_act_assessments (lower(email));

-- Row-level security: anyone can INSERT, nobody can SELECT/UPDATE/DELETE
-- except the service role (which bypasses RLS automatically).
alter table public.ai_act_assessments enable row level security;

drop policy if exists "anyone can submit an assessment"
  on public.ai_act_assessments;

create policy "anyone can submit an assessment"
  on public.ai_act_assessments
  for insert
  to anon, authenticated
  with check (true);

comment on table public.ai_act_assessments is
  'Lead-capture table for the Colorado AI Act Readiness Checker. One row per completed assessment. Public inserts allowed via RLS; reads restricted to service role.';
