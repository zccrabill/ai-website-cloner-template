-- Deliverable-release → client-email notification (2026-07-15).
-- admin_set_deliverable_released gains p_notify: when true, fire the
-- notify-event edge function (deliverable.released) so the engagement's client
-- seat(s) get a "your deliverable is ready" email with a workspace CTA.
-- Same pg_net rail as the status-note notification (20260713190000).
-- Default false — existing callers keep releasing silently.

create extension if not exists pg_net;

drop function if exists public.admin_set_deliverable_released(uuid);

create or replace function public.admin_set_deliverable_released(
  p_deliverable_id uuid,
  p_notify boolean default false
)
returns public.deliverables
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.deliverables;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.deliverables
  set status = 'released', released_at = coalesce(released_at, now())
  where id = p_deliverable_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Deliverable % not found', p_deliverable_id using errcode = '02000';
  end if;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (v_row.engagement_id, 'deliverable.released',
          jsonb_build_object('deliverable_id', p_deliverable_id,
                             'title', v_row.title,
                             'notify', coalesce(p_notify, false)));

  -- Auth: the project's legacy anon JWT (public — same key the browser ships)
  -- so notify-event's verify_jwt check passes. notify-event resolves the
  -- deliverable + recipients itself from the ids.
  if coalesce(p_notify, false) then
    perform net.http_post(
      url := 'https://ndxejojdxzzcjrnkscos.supabase.co/functions/v1/notify-event',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keGVqb2pkeHp6Y2pybmtzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDcxOTQsImV4cCI6MjA5MTMyMzE5NH0.VYwOydmZ4BAsTmiAOVV_XGkEqOxhzZZUE6k_mASvI5M'
      ),
      body := jsonb_build_object(
        'event_type', 'deliverable.released',
        'data', jsonb_build_object(
          'engagement_id', v_row.engagement_id,
          'deliverable_id', v_row.id
        )
      )
    );
  end if;

  return v_row;
end;
$$;

revoke execute on function public.admin_set_deliverable_released(uuid, boolean) from public, anon;
grant execute on function public.admin_set_deliverable_released(uuid, boolean) to authenticated, service_role;
