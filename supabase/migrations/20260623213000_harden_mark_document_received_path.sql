-- Defense-in-depth (portal review M3): require the upload path to live under
-- this document's own folder (<engagement_id>/<document_id>/...), not merely
-- somewhere in the engagement. Cross-engagement was already blocked by
-- is_engagement_member; this closes intra-engagement card-to-card path
-- spoofing for orgs that ever have multiple distinct human clients.
-- Applied to prod via MCP the same day; this file keeps the repo in sync.
create or replace function public.mark_document_received(
  p_document_id uuid,
  p_storage_path text
)
returns public.engagement_documents
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_doc public.engagement_documents;
begin
  select * into v_doc from public.engagement_documents where id = p_document_id;
  if v_doc.id is null then
    raise exception 'Document % not found', p_document_id using errcode = '02000';
  end if;
  if not (public.is_engagement_member(v_doc.engagement_id) or public.is_admin()) then
    raise exception 'Not your engagement' using errcode = '42501';
  end if;
  if position(v_doc.engagement_id::text || '/' || p_document_id::text || '/' in p_storage_path) <> 1 then
    raise exception 'storage path must live under this document''s own folder' using errcode = '22023';
  end if;
  if v_doc.state = 'reviewed' then
    raise exception 'This document has already been reviewed — contact your attorney to replace it' using errcode = '22023';
  end if;

  update public.engagement_documents
  set state = 'received',
      storage_path = p_storage_path,
      uploaded_by = auth.uid(),
      uploaded_at = now()
  where id = p_document_id
  returning * into v_doc;

  insert into public.engagement_events (engagement_id, kind, payload)
  values (
    v_doc.engagement_id,
    'document.received',
    jsonb_build_object('document_id', p_document_id, 'label', v_doc.label,
                       'storage_path', p_storage_path, 'uploaded_by', auth.uid())
  );

  return v_doc;
end;
$$;
