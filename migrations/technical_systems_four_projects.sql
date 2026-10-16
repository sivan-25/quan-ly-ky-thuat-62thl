-- ESTA | Share only "Thông tin hệ thống" equipment records with the four live projects.
-- Retain all existing NANGCAP profiles; each project is isolated by building_id and RLS.
-- Other operating modules/tables are intentionally unchanged.
begin;

alter table public.building_equipment_profiles_nangcap
  drop constraint if exists upgrade_equipment_single_project;
alter table public.building_equipment_profiles_nangcap
  drop constraint if exists upgrade_equipment_allowed_project;
alter table public.building_equipment_profiles_nangcap
  add constraint upgrade_equipment_allowed_project
  check (building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH'));

drop policy if exists upgrade_equipment_read on public.building_equipment_profiles_nangcap;
create policy upgrade_equipment_read on public.building_equipment_profiles_nangcap
  for select to authenticated
  using (
    building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH')
    and private.can_access_building(building_id)
  );

drop policy if exists upgrade_equipment_insert on public.building_equipment_profiles_nangcap;
create policy upgrade_equipment_insert on public.building_equipment_profiles_nangcap
  for insert to authenticated
  with check (
    building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH')
    and private.can_access_building(building_id,true)
  );

drop policy if exists upgrade_equipment_update on public.building_equipment_profiles_nangcap;
create policy upgrade_equipment_update on public.building_equipment_profiles_nangcap
  for update to authenticated
  using (
    building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH')
    and private.can_access_building(building_id,true)
  )
  with check (
    building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH')
    and private.can_access_building(building_id,true)
  );

drop policy if exists upgrade_equipment_delete on public.building_equipment_profiles_nangcap;
create policy upgrade_equipment_delete on public.building_equipment_profiles_nangcap
  for delete to authenticated
  using (
    building_id in ('NANGCAP','68PĐL','62THL','127HH','130HH')
    and private.can_access_building(building_id,true)
  );
commit;
