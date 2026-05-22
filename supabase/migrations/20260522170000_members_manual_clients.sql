-- Manual (non-subscription) client support on the members table.
--
-- The admin dashboard needs to track project-based clients who don't have a
-- Stripe subscription — flat-fee, hourly, or pro-bono engagements — alongside
-- the existing subscription members. The two shapes are similar enough that
-- one table with a `kind` discriminator is cleaner than a parallel `clients`
-- table that would need to be UNIONed everywhere downstream.
--
-- Schema changes:
--   - Add `kind` discriminator with CHECK ('subscription' | 'manual'),
--     defaulting existing rows to 'subscription'.
--   - Drop NOT NULL on `user_id` so manual clients can exist without an
--     auth.users row. The FK + UNIQUE constraints stay — Postgres allows
--     multiple NULLs in UNIQUE and skips FK validation on NULL.
--   - Add a CHECK forcing subscription rows to keep a non-null user_id
--     (so we can't accidentally turn a real member into a manual record).
--   - Add manual-client-only fields: phone, matter_description,
--     fee_arrangement (CHECK), client_status (CHECK), start_date, notes.
--   - business_name doubles as "company" — no new column needed.
--   - Index on (kind) for the unified clients list query.
--
-- Idempotent: re-running this migration is safe. Every change uses
-- IF NOT EXISTS / IF EXISTS guards.

-- ---------------------------------------------------------------------------
-- 1. Discriminator column
-- ---------------------------------------------------------------------------
alter table public.members
  add column if not exists kind text not null default 'subscription';

-- Idempotent CHECK constraint: drop-then-add so re-runs don't error on the
-- "constraint already exists" path.
alter table public.members
  drop constraint if exists members_kind_check;

alter table public.members
  add constraint members_kind_check
  check (kind in ('subscription', 'manual'));

create index if not exists members_kind_idx on public.members (kind);

comment on column public.members.kind is
  'Discriminator. "subscription" rows are Stripe-linked auth members; '
  '"manual" rows are attorney-managed project clients without portal access.';

-- ---------------------------------------------------------------------------
-- 2. Make user_id nullable (manual clients have no auth.users row)
-- ---------------------------------------------------------------------------
alter table public.members
  alter column user_id drop not null;

-- Subscription rows still require user_id. Without this check, a faulty
-- import could turn an active subscription record into an orphan.
alter table public.members
  drop constraint if exists members_user_id_required_for_subscription;

alter table public.members
  add constraint members_user_id_required_for_subscription
  check (kind = 'manual' or user_id is not null);

-- ---------------------------------------------------------------------------
-- 3. Manual-client fields
-- ---------------------------------------------------------------------------
alter table public.members
  add column if not exists phone text;

alter table public.members
  add column if not exists matter_description text;

alter table public.members
  add column if not exists fee_arrangement text;

alter table public.members
  drop constraint if exists members_fee_arrangement_check;

alter table public.members
  add constraint members_fee_arrangement_check
  check (
    fee_arrangement is null
    or fee_arrangement in ('flat_fee', 'hourly', 'pro_bono', 'other')
  );

alter table public.members
  add column if not exists client_status text;

alter table public.members
  drop constraint if exists members_client_status_check;

alter table public.members
  add constraint members_client_status_check
  check (
    client_status is null
    or client_status in ('active', 'on_hold', 'closed')
  );

alter table public.members
  add column if not exists start_date date;

alter table public.members
  add column if not exists notes text;

comment on column public.members.phone is
  'Phone number for manual clients. Subscription members typically use email; '
  'this is for projects we coordinate by call/text.';
comment on column public.members.matter_description is
  'One-to-two-sentence description of the project/matter for manual clients. '
  'Shown in the admin clients list and on the per-client detail view.';
comment on column public.members.fee_arrangement is
  'Billing model for manual clients: flat_fee, hourly, pro_bono, other. '
  'NULL for subscription members (their billing lives in stripe_*).';
comment on column public.members.client_status is
  'Lifecycle status for manual clients: active, on_hold, closed. NULL for '
  'subscription members (their status lives in subscription_status).';
comment on column public.members.start_date is
  'When the manual client engagement began (date, not timestamp). NULL for '
  'subscription members (use created_at).';
comment on column public.members.notes is
  'Free-text notes about the client. Attorney-only.';

-- ---------------------------------------------------------------------------
-- 4. Touch updated_at on every change so the dashboard's freshness signals
--    (last touchpoint, aging) have a single canonical column to read from.
-- ---------------------------------------------------------------------------
create or replace function public.members_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists members_touch_updated_at_trg on public.members;

create trigger members_touch_updated_at_trg
before update on public.members
for each row execute function public.members_touch_updated_at();

comment on function public.members_touch_updated_at() is
  'Forces members.updated_at = now() on every row update. Powers the admin '
  'dashboard staleness signals (aging dots, "last touch" column).';
