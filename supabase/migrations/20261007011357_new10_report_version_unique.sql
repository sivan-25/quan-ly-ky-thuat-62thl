-- Scope the version guarantee to the NEW10 pilot. Existing reports and
-- permissions for operational projects remain unchanged.
create unique index if not exists report_registry_new10_version_unique
on public.report_registry (building_id, report_type, period_from, period_to, version)
nulls not distinct
where building_id = 'NEW10' and file_ref is not null;
