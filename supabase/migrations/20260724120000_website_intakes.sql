-- Sitecraft website-build project briefs, captured by the public /sitecraft
-- landing page intake form (WebsiteIntakeForm.tsx).
--
-- Follows the faiir_intakes lead-capture pattern: anonymous visitors may
-- INSERT a brief, but only admins may read them back. The client does a
-- bare insert (no .select() chain) so it never trips the admin-only SELECT
-- policy. A row insert also fans out a website.intake_received email to the
-- firm via the notify-event edge function (fired client-side, fail-open).
--
-- NOTE: apply to prod via the Supabase MCP / CLI before promoting the page
-- (the form fails-open with an "email us directly" fallback until then).

create table if not exists public.website_intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  website_url text,
  industry text,
  project_types text[] not null default '{}',
  budget text,
  timeline text,
  notes text,
  source text not null default 'sitecraft_landing',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'scoped', 'won', 'closed'))
);

comment on table public.website_intakes is
  'Website-build project briefs from the public /sitecraft (Sitecraft) landing form. Anonymous INSERT allowed; SELECT/UPDATE admin-only. Notifies the firm via notify-event (website.intake_received).';

alter table public.website_intakes enable row level security;

-- Anyone (anon or authenticated) may submit a brief. WITH CHECK (true)
-- mirrors the faiir_intakes INSERT policy — the form supplies all columns
-- and unspecified ones fall back to their defaults.
create policy "anyone can submit a website intake"
  on public.website_intakes
  for insert
  to anon, authenticated
  with check (true);

-- Only admins can read or triage submitted briefs.
create policy "admins read website intakes"
  on public.website_intakes
  for select
  using (public.is_admin());

create policy "admins update website intakes"
  on public.website_intakes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create index website_intakes_status_created_idx
  on public.website_intakes (status, created_at desc);
