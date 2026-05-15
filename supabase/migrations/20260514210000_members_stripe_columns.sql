-- Add the two Stripe-subscription tracking columns the stripe-webhook Edge
-- Function depends on. Verified 2026-05-14 against production schema —
-- members already has stripe_customer_id, subscription_tier, subscription_status,
-- but is missing the subscription_id and period-end fields.
--
-- Idempotent: re-running is safe. ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- skips existing columns.

alter table public.members
  add column if not exists stripe_subscription_id text;

alter table public.members
  add column if not exists current_period_end timestamptz;

-- Lookup index for the webhook's update-by-customer-id path.
-- Already exists in production via the original members migration, but
-- creating idempotently here so this file can serve as the complete
-- "what stripe-webhook depends on" reference.
create index if not exists members_stripe_customer_id_idx
  on public.members (stripe_customer_id)
  where stripe_customer_id is not null;

comment on column public.members.stripe_subscription_id is
  'Stripe subscription ID for the active subscription. Written by stripe-webhook on checkout.session.completed and subscription lifecycle events.';
comment on column public.members.current_period_end is
  'ISO timestamp of when the current Stripe billing period ends. Used in the dashboard to show next-billing-cycle dates and to compute usage-period boundaries.';
