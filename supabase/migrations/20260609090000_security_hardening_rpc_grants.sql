-- Security hardening ahead of first FAIIR client onboarding (2026-06-09).
-- Applied to production via MCP the same day; this file keeps the repo in sync.
--
-- 1) get_usage_this_period: was callable by anyone with any user_id (cross-tenant
--    usage leak). Now returns data only for the caller's own user_id, or any
--    user_id when the caller is admin/attorney (the /dashboard/review use case).
create or replace function public.get_usage_this_period(p_user_id uuid)
returns integer
language sql
security definer
set search_path to 'public'
as $$
  select coalesce(count(*), 0)::integer
  from public.usage_events
  where user_id = p_user_id
    and billing_period = date_trunc('month', (now() at time zone 'utc'))::date
    and is_overage = false
    and (
      p_user_id = auth.uid()
      or exists (
        select 1 from public.members m
        where m.user_id = auth.uid()
          and m.role in ('admin', 'attorney')
      )
    );
$$;

-- 2) Remove the anonymous/public EXECUTE surface on SECURITY DEFINER RPCs.
--    The admin RPCs are internally guarded, but there is no reason for them to
--    be invocable by anon at all. get_matters_snapshot is only consumed via the
--    get-matters-stats Edge Function (service role), never from the browser.
revoke execute on function public.get_matters_snapshot() from public, anon, authenticated;
grant execute on function public.get_matters_snapshot() to service_role;

revoke execute on function public.get_usage_this_period(uuid) from public, anon;
grant execute on function public.get_usage_this_period(uuid) to authenticated, service_role;

revoke execute on function public.list_admin_clients() from public, anon;
grant execute on function public.list_admin_clients() to authenticated, service_role;

revoke execute on function public.get_admin_dashboard_stats() from public, anon;
grant execute on function public.get_admin_dashboard_stats() to authenticated, service_role;

revoke execute on function public.get_admin_activity_stream(integer) from public, anon;
grant execute on function public.get_admin_activity_stream(integer) to authenticated, service_role;

revoke execute on function public.create_manual_client(text, text, text, text, text, text, date, text) from public, anon;
grant execute on function public.create_manual_client(text, text, text, text, text, text, date, text) to authenticated, service_role;

revoke execute on function public.update_manual_client(uuid, text, text, text, text, text, text, text, date, text) from public, anon;
grant execute on function public.update_manual_client(uuid, text, text, text, text, text, text, text, date, text) to authenticated, service_role;

revoke execute on function public.close_manual_client(uuid) from public, anon;
grant execute on function public.close_manual_client(uuid) to authenticated, service_role;

-- 3) Pin search_path on the one trigger function the linter flagged.
alter function public.touch_matters_updated_at() set search_path = 'public';
