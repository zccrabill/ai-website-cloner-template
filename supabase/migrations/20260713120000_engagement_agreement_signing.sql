-- In-portal engagement-agreement signing (2026-07-13).
-- Replaces the offline countersigned-PDF flow for FAIIR engagement clients with
-- a click-to-agree e-signature captured inside the workspace: the client sets a
-- password, reads their firm-specific agreement rendered in-app, types their
-- name, and adopts it as their signature. ESIGN/UETA-sound — intent (an
-- affirmative "I agree and adopt this as my signature" action), attribution
-- (authenticated user + email + typed name), a retained record (the exact
-- agreement text and its SHA-256), and a timestamp.
--
-- Conventions follow the engagement workspace (20260609130000): reads via
-- is_engagement_member()/is_admin(); the signing write path is a SECURITY
-- DEFINER RPC (members cannot write these tables directly). Acceptances are an
-- immutable evidentiary record.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- The in-app, click-to-sign version of a client's engagement letter. One
-- published row per engagement is the agreement currently offered for
-- signature; superseded drafts stay for history under earlier versions.
create table public.engagement_agreements (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  version integer not null default 1,
  title text not null default 'Engagement Agreement',
  effective_date text,          -- display string, e.g. 'July 2026'
  signatory_name text,          -- expected signer (prefill / display)
  signatory_title text,
  fee_text text,                -- display string, e.g. '$2,500 (flat)'
  body_md text not null,        -- the full agreement, rendered in-app as markdown
  body_sha256 text not null,    -- hash of body_md at publish — the evidence anchor
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id, version)
);
comment on table public.engagement_agreements is
  'Firm-specific engagement letters rendered in the portal for click-to-sign. body_md is the exact text the client sees; body_sha256 anchors it for the signature record. At most one published row per engagement.';

-- At most one agreement is offered for signature per engagement at a time.
create unique index engagement_agreements_one_published
  on public.engagement_agreements (engagement_id) where published;

-- Immutable e-signature evidence. Written only by accept_engagement_agreement().
create table public.engagement_agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.engagement_agreements(id) on delete restrict,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  signed_by uuid not null,            -- auth.uid() of the signer
  signer_email text not null,         -- authenticated email at signing
  signer_name text not null,          -- typed full name adopted as signature
  signer_title text,                  -- typed / confirmed title
  agreement_version integer not null,
  agreement_sha256 text not null,     -- hash of the exact text the signer saw
  accepted_at timestamptz not null default now(),
  ip inet,                            -- best-effort; may be edge/pooler IP
  user_agent text
);
comment on table public.engagement_agreement_acceptances is
  'Append-only e-signature record for engagement agreements. One row per signing; retains signer identity, the agreement version + SHA-256, timestamp, and UA.';

create index engagement_agreements_engagement_idx on public.engagement_agreements (engagement_id);
create index engagement_agreement_acceptances_engagement_idx on public.engagement_agreement_acceptances (engagement_id);

create trigger engagement_agreements_touch_updated_at
  before update on public.engagement_agreements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Evidentiary integrity: once an agreement has been signed, its text is frozen.
-- A change to a signed agreement must be a new version, never an in-place edit.
-- ---------------------------------------------------------------------------
create or replace function public.guard_signed_agreement_immutable()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if exists (select 1 from public.engagement_agreement_acceptances a where a.agreement_id = old.id) then
    raise exception 'This agreement has been signed and cannot be modified or removed; publish a new version instead'
      using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger engagement_agreements_freeze_when_signed
  before update or delete on public.engagement_agreements
  for each row execute function public.guard_signed_agreement_immutable();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.engagement_agreements enable row level security;
alter table public.engagement_agreement_acceptances enable row level security;

revoke all on public.engagement_agreements, public.engagement_agreement_acceptances from anon;

-- Clients read only their own engagement's published agreement; admin sees all.
create policy "org members read own published agreement" on public.engagement_agreements
  for select using (
    (published and public.is_engagement_member(engagement_id)) or public.is_admin()
  );
create policy "admin writes agreements" on public.engagement_agreements
  for all using (public.is_admin()) with check (public.is_admin());

-- Clients read their own acceptance record; admin sees all. No client writes:
-- inserts happen only inside the SECURITY DEFINER RPC below.
create policy "org members read own acceptances" on public.engagement_agreement_acceptances
  for select using (public.is_engagement_member(engagement_id) or public.is_admin());
create policy "admin writes acceptances" on public.engagement_agreement_acceptances
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- accept_engagement_agreement(): the client-facing signing RPC. Member-only,
-- idempotent (a second call returns the existing acceptance), stamps the
-- engagement as letter-signed, advances draft -> active, and logs the event.
-- ---------------------------------------------------------------------------
create or replace function public.accept_engagement_agreement(
  p_agreement_id uuid,
  p_signer_name text,
  p_signer_title text default null,
  p_user_agent text default null
)
returns public.engagement_agreement_acceptances
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_agreement public.engagement_agreements;
  v_email text;
  v_acceptance public.engagement_agreement_acceptances;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_agreement from public.engagement_agreements where id = p_agreement_id;
  if not found then
    raise exception 'Agreement not found' using errcode = 'P0002';
  end if;
  if not v_agreement.published then
    raise exception 'This agreement is not available for signature' using errcode = '42501';
  end if;
  if not public.is_engagement_member(v_agreement.engagement_id) then
    raise exception 'Not authorized for this engagement' using errcode = '42501';
  end if;
  if p_signer_name is null or length(btrim(p_signer_name)) < 2 then
    raise exception 'A typed full name is required to sign' using errcode = '22023';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  -- Idempotent: if this engagement already has a signature, return it unchanged.
  select * into v_acceptance
  from public.engagement_agreement_acceptances
  where engagement_id = v_agreement.engagement_id
  order by accepted_at asc
  limit 1;
  if found then
    return v_acceptance;
  end if;

  insert into public.engagement_agreement_acceptances
    (agreement_id, engagement_id, signed_by, signer_email, signer_name, signer_title,
     agreement_version, agreement_sha256, ip, user_agent)
  values
    (v_agreement.id, v_agreement.engagement_id, auth.uid(), v_email, btrim(p_signer_name),
     nullif(btrim(p_signer_title), ''), v_agreement.version, v_agreement.body_sha256,
     inet_client_addr(), nullif(btrim(p_user_agent), ''))
  returning * into v_acceptance;

  update public.engagements
  set engagement_letter_signed_at = coalesce(engagement_letter_signed_at, now()),
      status = case when status = 'draft' then 'active'::public.engagement_status else status end
  where id = v_agreement.engagement_id;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (
    v_agreement.engagement_id,
    'engagement_agreement.signed',
    jsonb_build_object(
      'acceptance_id', v_acceptance.id,
      'signer_email', v_email,
      'signer_name', btrim(p_signer_name),
      'agreement_version', v_agreement.version,
      'sha256', v_agreement.body_sha256
    )
  );

  return v_acceptance;
end;
$$;

revoke execute on function public.accept_engagement_agreement(uuid, text, text, text) from public, anon;
grant execute on function public.accept_engagement_agreement(uuid, text, text, text) to authenticated, service_role;
