-- Waitlist signups for community programs (Sidebar, YLab), captured by the
-- Ava chat function via [WAITLIST: {...}] tokens. Follows the ai_act_assessments
-- lead-capture pattern, but stricter: inserts happen server-side in the edge
-- function with the service role, so NO public policies at all.
-- Applied to prod 2026-07-02 via MCP (create_waitlist_signups).
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  program text not null check (program in ('sidebar', 'ylab')),
  name text not null,
  email text not null,
  interest text,
  note text,
  user_id uuid references auth.users (id) on delete set null,
  source text not null default 'ava',
  status text not null default 'new' check (status in ('new', 'contacted', 'joined', 'closed'))
);

comment on table public.waitlist_signups is
  'Community-program waitlist (Sidebar attorney community, YLab teen founders). Rows inserted by the allora-chat edge function (service role) when Ava captures a signup. Service-role only — no client access.';

alter table public.waitlist_signups enable row level security;
-- No policies on purpose: service-role bypasses RLS; anon/authed clients get nothing.

create index waitlist_signups_program_status_idx
  on public.waitlist_signups (program, status, created_at desc);
