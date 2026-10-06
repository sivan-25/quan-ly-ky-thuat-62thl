insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('report-files','report-files',false,52428800,array['application/pdf']::text[])
on conflict (id) do update
set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

alter table public.report_registry
  add column if not exists file_ref text,
  add column if not exists file_size bigint,
  add column if not exists version integer not null default 1,
  add column if not exists checksum text not null default '',
  add column if not exists mime_type text not null default 'application/pdf';

create index if not exists report_registry_building_period_version_idx
on public.report_registry(building_id,report_type,period_from,period_to,version desc);

drop policy if exists qlkt_report_file_read on storage.objects;
create policy qlkt_report_file_read on storage.objects
for select to authenticated
using (bucket_id='report-files' and private.can_access_project_file(name,false));

drop policy if exists qlkt_report_file_insert on storage.objects;
create policy qlkt_report_file_insert on storage.objects
for insert to authenticated
with check (bucket_id='report-files' and private.can_access_project_file(name,true));

drop policy if exists qlkt_report_file_update on storage.objects;
create policy qlkt_report_file_update on storage.objects
for update to authenticated
using (bucket_id='report-files' and private.can_access_project_file(name,true))
with check (bucket_id='report-files' and private.can_access_project_file(name,true));

drop policy if exists qlkt_report_file_delete on storage.objects;
create policy qlkt_report_file_delete on storage.objects
for delete to authenticated
using (bucket_id='report-files' and private.can_access_project_file(name,true));