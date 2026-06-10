-- Lock down which columns a member may write on public.members.
--
-- BEFORE: anon/authenticated held INSERT+UPDATE on EVERY column, and the RLS
-- UPDATE policy had no WITH CHECK. A signed-in member could therefore run
--   update members set role = 'admin' where user_id = auth.uid();
-- and then call the role-gated admin RPCs (list_admin_clients,
-- get_admin_activity_stream, get_admin_dashboard_stats, *_manual_client) which
-- only check members.role — exposing every client's name, email, business,
-- matter description, and notes. For a law firm that is a client-confidentiality
-- breach.
--
-- AFTER: members may write only their own profile/consent columns (allowlist).
-- role, kind, subscription_*, stripe_*, current_period_end and the manual-client
-- fields are no longer client-writable. The stripe-webhook (service_role) and
-- the SECURITY DEFINER admin RPCs bypass column grants, so billing sync and the
-- admin console are unaffected.
--
-- Reversible: re-running GRANT INSERT/UPDATE on public.members to authenticated
-- restores the previous (insecure) behavior.

revoke insert, update on table public.members from anon;
revoke insert, update on table public.members from authenticated;

grant insert (
  user_id, email, full_name, business_name, business_type, industry, state,
  referral_source, phone, tos_agreed_at, privacy_agreed_at,
  engagement_agreed_at, engagement_signature, onboarding_complete,
  newsletter_opt_in, newsletter_opt_in_at
) on table public.members to authenticated;

grant update (
  email, full_name, business_name, business_type, industry, state,
  referral_source, phone, tos_agreed_at, privacy_agreed_at,
  engagement_agreed_at, engagement_signature, onboarding_complete,
  newsletter_opt_in, newsletter_opt_in_at
) on table public.members to authenticated;

-- Enforce ownership on the NEW row too, so an UPDATE can never re-point a
-- member row to a different user_id.
drop policy if exists "Users can update own profile" on public.members;
create policy "Users can update own profile"
  on public.members for update to public
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
