-- Client review collection flow (availablelaw.com/review).
-- Rows are inserted server-side by the client-review edge function with the
-- service role, so there are NO public insert policies. Admin/attorney can
-- read + moderate via is_admin(); the public reads ONLY approved reviews
-- through the get_published_reviews() RPC, which exposes display fields only
-- (never names, emails-adjacent fields, or the original AI draft).
-- Applied to prod 2026-07-21 via MCP (client_reviews).

create table public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- What the client said
  rating integer not null check (rating between 1 and 5),
  chips text[] not null default '{}',
  practice_area text,
  review_text text not null check (char_length(review_text) between 5 and 2000),

  -- AI drafting audit trail: the original generated draft is stored
  -- separately from the final adopted text, plus a flag for whether the
  -- draft path was used at all.
  ai_drafting_used boolean not null default false,
  ai_draft_text text,

  -- Who they are (always collected for the consent record, even when the
  -- chosen consent level publishes anonymously or not at all)
  first_name text not null,
  last_name text not null,
  business_name text,

  -- Consent record (Colorado attorney-advertising audit trail): the level
  -- they chose, the exact attestation text they agreed to, when they agreed,
  -- and the display name computed from the consent level at submit time.
  consent_level text not null check (consent_level in ('full', 'first_initial', 'anonymous', 'private')),
  consent_text text not null,
  consent_agreed_at timestamptz not null default now(),
  display_name text not null,

  -- Moderation. Nothing publishes automatically: reviews land 'pending' and
  -- only 'approved' rows are exposed by get_published_reviews().
  status text not null default 'pending' check (status in ('pending', 'approved', 'archived')),
  published_text text,
  admin_edited boolean not null default false,
  reconsent_needed boolean not null default false,
  approved_at timestamptz,

  -- Abuse tracing for the public endpoint (hashed, same scheme as ai_usage)
  ip_hash text
);

comment on table public.client_reviews is
  'Client reviews collected at /review. Inserted by the client-review edge function (service role). Pending until Zachariah approves in /dashboard/reviews; only approved rows are publicly readable, via get_published_reviews().';

alter table public.client_reviews enable row level security;

-- Moderation surface: admin/attorney read + update via the existing helper.
create policy "Admins select client reviews"
  on public.client_reviews for select
  using (public.is_admin());

create policy "Admins update client reviews"
  on public.client_reviews for update
  using (public.is_admin())
  with check (public.is_admin());

-- No insert/delete policies on purpose: inserts come from the edge function
-- with the service role (bypasses RLS); nothing is ever hard-deleted, rows
-- are archived via status instead.

create index client_reviews_status_idx
  on public.client_reviews (status, created_at desc);

-- Public read path: display fields of approved reviews only.
create or replace function public.get_published_reviews()
returns table (
  id uuid,
  rating integer,
  practice_area text,
  display_name text,
  review_text text,
  approved_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    cr.id,
    cr.rating,
    cr.practice_area,
    cr.display_name,
    coalesce(cr.published_text, cr.review_text) as review_text,
    cr.approved_at
  from public.client_reviews cr
  where cr.status = 'approved'
  order by cr.approved_at desc
$$;

revoke all on function public.get_published_reviews() from public;
grant execute on function public.get_published_reviews() to anon, authenticated;
