-- Admin-only view of who holds each seat on an engagement and whether they've
-- actually logged in yet — so the attorney can see, at a glance, that a client
-- joined (and when they were last seen) vs. is still sitting on an open invite.
-- SECURITY DEFINER (reads auth.users for last sign-in), gated by is_admin(),
-- search_path pinned. Matches the other admin_* RPCs. Applied to prod via MCP.
create or replace function public.admin_list_engagement_members(p_engagement_id uuid)
returns table (
  email text,
  role text,
  status text,
  joined boolean,
  invited_at timestamptz,
  accepted_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return query
  select
    om.email,
    om.role::text,
    om.status::text,
    (om.user_id is not null) as joined,
    om.invited_at,
    om.accepted_at,
    u.last_sign_in_at
  from public.org_members om
  left join auth.users u on u.id = om.user_id
  where om.org_id = (select e.org_id from public.engagements e where e.id = p_engagement_id)
  order by om.role, om.email;
end;
$$;

revoke execute on function public.admin_list_engagement_members(uuid) from anon;
grant execute on function public.admin_list_engagement_members(uuid) to authenticated;
