-- Engagement marketing consents (2026-07-14).
-- Builds the close-of-engagement marketing asks into the product so they are
-- part of every engagement's SOP, not a thing to remember: (1) a testimonial,
-- (2) permission to post it — with the client choosing named vs. anonymous,
-- (3) permission to list the firm's name on availablelaw.com as a
-- FAIIR-certified firm. Captured self-serve on the Certification page at
-- issuance (the celebration moment), revocable any time (the client can
-- re-save with different choices), and stored as a written consent record
-- (who granted, when, exactly what) — the substantiation Colo. RPC 7.1 wants
-- before any name or quote appears in marketing.
--
-- Conventions follow the workspace schema: reads via is_engagement_member()/
-- is_admin(); the client write path is a SECURITY DEFINER RPC.

create type public.testimonial_display as enum ('undecided', 'named', 'anonymous', 'none');

create table public.engagement_marketing_consents (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  testimonial text,
  testimonial_display public.testimonial_display not null default 'undecided',
  directory_listing boolean,          -- null = undecided; true = may list firm name on the site
  granted_by uuid not null,           -- auth.uid() of the person who saved
  granted_by_email text not null,
  granted_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id)
);
comment on table public.engagement_marketing_consents is
  'Written record of each engagement''s marketing consents: testimonial text, named/anonymous/none display choice, and firm-name directory-listing permission. One row per engagement, updated in place (latest choice governs; consent is revocable). Check this table before publishing any client name or quote.';

create index engagement_marketing_consents_org_idx on public.engagement_marketing_consents (org_id);

create trigger engagement_marketing_consents_touch_updated_at
  before update on public.engagement_marketing_consents
  for each row execute function public.set_updated_at();

alter table public.engagement_marketing_consents enable row level security;
revoke all on public.engagement_marketing_consents from anon;

create policy "org members read own marketing consents" on public.engagement_marketing_consents
  for select using (public.is_engagement_member(engagement_id) or public.is_admin());
create policy "admin writes marketing consents" on public.engagement_marketing_consents
  for all using (public.is_admin()) with check (public.is_admin());

-- Client-facing save path. Member-only; upserts the engagement's single row so
-- the latest choice always governs; logs an audit event.
create or replace function public.save_marketing_preferences(
  p_engagement_id uuid,
  p_testimonial text default null,
  p_display text default 'undecided',
  p_directory_listing boolean default null,
  p_granted_by_name text default null
)
returns public.engagement_marketing_consents
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_org_id uuid;
  v_email text;
  v_display public.testimonial_display;
  v_row public.engagement_marketing_consents;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if not public.is_engagement_member(p_engagement_id) then
    raise exception 'Not authorized for this engagement' using errcode = '42501';
  end if;

  begin
    v_display := coalesce(p_display, 'undecided')::public.testimonial_display;
  exception when invalid_text_representation then
    raise exception 'Invalid display choice' using errcode = '22023';
  end;

  -- A testimonial marked for posting must actually contain one.
  if v_display in ('named', 'anonymous')
     and (p_testimonial is null or length(btrim(p_testimonial)) < 10) then
    raise exception 'Please write a short testimonial before choosing to share it' using errcode = '22023';
  end if;

  select org_id into v_org_id from public.engagements where id = p_engagement_id;
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  insert into public.engagement_marketing_consents
    (engagement_id, org_id, testimonial, testimonial_display, directory_listing,
     granted_by, granted_by_email, granted_by_name)
  values
    (p_engagement_id, v_org_id, nullif(btrim(coalesce(p_testimonial, '')), ''), v_display,
     p_directory_listing, auth.uid(), v_email, nullif(btrim(coalesce(p_granted_by_name, '')), ''))
  on conflict (engagement_id) do update set
    testimonial = excluded.testimonial,
    testimonial_display = excluded.testimonial_display,
    directory_listing = excluded.directory_listing,
    granted_by = excluded.granted_by,
    granted_by_email = excluded.granted_by_email,
    granted_by_name = excluded.granted_by_name
  returning * into v_row;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (
    p_engagement_id,
    'marketing.consent_updated',
    jsonb_build_object(
      'display', v_display,
      'directory_listing', p_directory_listing,
      'has_testimonial', v_row.testimonial is not null,
      'by', v_email
    )
  );

  return v_row;
end;
$$;

revoke execute on function public.save_marketing_preferences(uuid, text, text, boolean, text) from public, anon;
grant execute on function public.save_marketing_preferences(uuid, text, text, boolean, text) to authenticated, service_role;
