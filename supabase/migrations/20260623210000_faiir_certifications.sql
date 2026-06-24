-- FAIIR certifications (2026-06-23).
-- The payoff of a completed engagement: a firm-specific, annually-renewing
-- certification the client can display. One row per issuance; the client reads
-- their own org's cert, the attorney issues it. Annual expiry feeds the
-- renewal/retention motion.

create table public.faiir_certifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  firm_name text not null,
  certificate_number text not null unique,
  tier text not null default 'FAIIR Starter Assessment',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active', -- active | expired | revoked
  certificate_path text,                 -- optional signed-PDF in engagement-docs
  created_at timestamptz not null default now()
);
comment on table public.faiir_certifications is
  'Issued FAIIR certifications. Firm-specific, annual. Client reads own org; attorney issues.';

create index faiir_certifications_org_idx on public.faiir_certifications (org_id);

alter table public.faiir_certifications enable row level security;
revoke all on public.faiir_certifications from anon;

create policy "org members read own certification" on public.faiir_certifications
  for select using (public.is_org_member(org_id) or public.is_admin());
create policy "admin writes certifications" on public.faiir_certifications
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- admin_issue_certification(): the attorney issues a firm's certification.
-- Generates the next certificate number (FAIIR-YYYY-NNNN), sets a 12-month
-- (or p_valid_months) validity window, logs the event.
-- ---------------------------------------------------------------------------
create or replace function public.admin_issue_certification(
  p_org_id uuid,
  p_engagement_id uuid,
  p_firm_name text,
  p_tier text default 'FAIIR Starter Assessment',
  p_valid_months integer default 12
)
returns public.faiir_certifications
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.faiir_certifications;
  v_year text := to_char(now(), 'YYYY');
  v_seq integer;
  v_number text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_firm_name is null or length(btrim(p_firm_name)) = 0 then
    raise exception 'A firm name is required for the certificate' using errcode = '22023';
  end if;

  select count(*) + 1 into v_seq
  from public.faiir_certifications
  where to_char(issued_at, 'YYYY') = v_year;
  v_number := 'FAIIR-' || v_year || '-' || lpad(v_seq::text, 4, '0');

  insert into public.faiir_certifications
    (org_id, engagement_id, firm_name, certificate_number, tier, expires_at)
  values (
    p_org_id, p_engagement_id, btrim(p_firm_name), v_number, p_tier,
    now() + (p_valid_months || ' months')::interval
  )
  returning * into v_row;

  if p_engagement_id is not null then
    insert into public.engagement_events (engagement_id, kind, payload)
    values (p_engagement_id, 'certification.issued',
            jsonb_build_object('certificate_number', v_number, 'firm_name', btrim(p_firm_name)));
  end if;

  return v_row;
end;
$$;

revoke execute on function public.admin_issue_certification(uuid, uuid, text, text, integer) from public, anon;
grant execute on function public.admin_issue_certification(uuid, uuid, text, text, integer) to authenticated, service_role;
