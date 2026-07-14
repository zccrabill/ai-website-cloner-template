-- Public social proof for the /faiir landing page (2026-07-14).
-- The display side of the close-of-engagement marketing asks: exposes ONLY
-- what a client has affirmatively consented to in engagement_marketing_consents
-- (which stays RLS-locked — this SECURITY DEFINER function is the single,
-- narrow public window):
--   - certified_firms: firm name + cert year, only while a cert is ACTIVE and
--     unexpired AND the firm checked the directory-listing box. Consent revoked
--     or cert lapsed → the firm disappears on the next page load.
--   - testimonials: only rows the client marked shareable; 'named' attributes
--     the firm, 'anonymous' attributes honestly by state ("A Colorado law
--     firm") without identifying details.
-- Test data is inherently excluded: no consent row, no exposure.

create or replace function public.get_faiir_social_proof()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
select jsonb_build_object(
  'certified_firms', coalesce((
    select jsonb_agg(jsonb_build_object('firm_name', t.name, 'year', t.yr) order by t.name)
    from (
      select distinct on (c.org_id) o.name, extract(year from c.issued_at)::int as yr
      from public.faiir_certifications c
      join public.orgs o on o.id = c.org_id
      where c.status = 'active'
        and c.expires_at > now()
        and exists (
          select 1 from public.engagement_marketing_consents m
          where m.org_id = c.org_id and m.directory_listing = true
        )
      order by c.org_id, c.issued_at desc
    ) t
  ), '[]'::jsonb),
  'testimonials', coalesce((
    select jsonb_agg(jsonb_build_object(
      'quote', m.testimonial,
      'attribution', case
        when m.testimonial_display = 'named' then o.name
        else case o.hq_state
          when 'CO' then 'A Colorado law firm'
          when 'NM' then 'A New Mexico law firm'
          when 'WY' then 'A Wyoming law firm'
          else 'A client firm'
        end
      end,
      'named', m.testimonial_display = 'named'
    ) order by m.updated_at desc)
    from public.engagement_marketing_consents m
    join public.orgs o on o.id = m.org_id
    where m.testimonial is not null
      and m.testimonial_display in ('named', 'anonymous')
  ), '[]'::jsonb)
);
$$;

revoke all on function public.get_faiir_social_proof() from public;
grant execute on function public.get_faiir_social_proof() to anon, authenticated, service_role;
