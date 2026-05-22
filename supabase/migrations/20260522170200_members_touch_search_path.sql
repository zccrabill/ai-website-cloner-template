-- Pin the search_path on the members_touch_updated_at trigger function so
-- the Supabase linter doesn't flag it as "function_search_path_mutable".
-- This is the same hardening the SECURITY DEFINER RPCs already have; the
-- trigger function was created without it in the prior migration.

alter function public.members_touch_updated_at()
  set search_path = public, pg_temp;
