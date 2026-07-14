-- Status-note → client-email notification.
-- When an engagement status note is posted with notify=true, fire the
-- notify-event edge function, which emails the engagement's client seat(s)
-- the note body + a CTA to their workspace.
-- Applied to prod via MCP 2026-07-13; this file keeps the repo in sync.

-- Async HTTP so the DB can invoke the notify-event edge function
create extension if not exists pg_net;

-- Per-note "email the client" flag (default false = existing behavior unchanged)
alter table public.engagement_status_notes
  add column if not exists notify boolean not null default false;

-- RPC gains an optional p_notify flag (drop old 2-arg signature, recreate)
drop function if exists public.admin_post_status_note(uuid, text);

create or replace function public.admin_post_status_note(
  p_engagement_id uuid,
  p_body text,
  p_notify boolean default false
)
returns public.engagement_status_notes
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.engagement_status_notes;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_body is null or length(btrim(p_body)) = 0 then
    raise exception 'Note body is required' using errcode = '22023';
  end if;

  insert into public.engagement_status_notes (engagement_id, body, notify)
  values (p_engagement_id, btrim(p_body), coalesce(p_notify, false))
  returning * into v_row;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (p_engagement_id, 'status_note.posted',
          jsonb_build_object('note_id', v_row.id, 'notify', coalesce(p_notify, false)));

  return v_row;
end;
$$;

revoke execute on function public.admin_post_status_note(uuid, text, boolean) from public, anon;
grant execute on function public.admin_post_status_note(uuid, text, boolean) to authenticated, service_role;

-- When a note is posted with notify=true, fire the notify-event edge function.
-- Auth: the project's legacy anon JWT (public — same key the browser ships) so
-- notify-event's verify_jwt check passes. notify-event fetches the note body and
-- resolves recipients from org_members by engagement → org.
create or replace function public.tg_status_note_notify()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.notify then
    perform net.http_post(
      url := 'https://ndxejojdxzzcjrnkscos.supabase.co/functions/v1/notify-event',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keGVqb2pkeHp6Y2pybmtzY29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDcxOTQsImV4cCI6MjA5MTMyMzE5NH0.VYwOydmZ4BAsTmiAOVV_XGkEqOxhzZZUE6k_mASvI5M'
      ),
      body := jsonb_build_object(
        'event_type', 'status_note.posted',
        'data', jsonb_build_object(
          'engagement_id', new.engagement_id,
          'note_id', new.id
        )
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists status_note_notify on public.engagement_status_notes;
create trigger status_note_notify
  after insert on public.engagement_status_notes
  for each row execute function public.tg_status_note_notify();
