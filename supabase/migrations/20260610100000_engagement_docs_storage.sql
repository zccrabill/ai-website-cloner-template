-- Engagement document room — storage layer (2026-06-10).
-- Private bucket for client uploads + deliverable files. Object paths are
-- namespaced by engagement: <engagement_id>/<document_id>/<filename>, and
-- every policy derives access from that first path segment via
-- is_engagement_member(), so a client can only ever touch their own
-- engagement's folder. Files are served via short-lived signed URLs only.

insert into storage.buckets (id, name, public, file_size_limit)
values ('engagement-docs', 'engagement-docs', false, 26214400) -- 25 MB cap
on conflict (id) do nothing;

create policy "engagement members upload to own engagement"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'engagement-docs'
    and (
      public.is_admin()
      or public.is_engagement_member(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "engagement members read own engagement docs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'engagement-docs'
    and (
      public.is_admin()
      or public.is_engagement_member(((storage.foldername(name))[1])::uuid)
    )
  );

-- No client UPDATE/DELETE: re-uploads write a new timestamped object, and
-- evidence files never disappear out from under the attorney.

-- ---------------------------------------------------------------------------
-- mark_document_received(): called by the client right after a successful
-- storage upload. Flips the document card Needed -> Received, records who/when,
-- and logs the event. Re-upload over a Received card is allowed (replaces the
-- pointer, not the old object); Reviewed cards are locked.
-- ---------------------------------------------------------------------------
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
  if position(v_doc.engagement_id::text || '/' in p_storage_path) <> 1 then
    raise exception 'storage path must live under the engagement folder' using errcode = '22023';
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
    jsonb_build_object(
      'document_id', p_document_id,
      'label', v_doc.label,
      'storage_path', p_storage_path,
      'uploaded_by', auth.uid()
    )
  );

  return v_doc;
end;
$$;

revoke execute on function public.mark_document_received(uuid, text) from public, anon;
grant execute on function public.mark_document_received(uuid, text) to authenticated, service_role;
