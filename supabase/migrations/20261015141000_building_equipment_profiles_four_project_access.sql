-- Policy-only; run after verified independent database backup. No data are moved.
-- Existing 127HH records remain in building_equipment_profiles_127.
begin;
drop policy if exists building_equipment_profiles_read on public.building_equipment_profiles;
create policy building_equipment_profiles_read on public.building_equipment_profiles
for select to authenticated using (
 building_id in ('62THL','68PĐL','130HH') and private.can_access_building(building_id)
);
drop policy if exists building_equipment_profiles_insert on public.building_equipment_profiles;
create policy building_equipment_profiles_insert on public.building_equipment_profiles
for insert to authenticated with check (
 building_id in ('62THL','68PĐL','130HH') and private.can_access_building(building_id,true)
);
drop policy if exists building_equipment_profiles_update on public.building_equipment_profiles;
create policy building_equipment_profiles_update on public.building_equipment_profiles
for update to authenticated using (
 building_id in ('62THL','68PĐL','130HH') and private.can_access_building(building_id,true)
) with check (
 building_id in ('62THL','68PĐL','130HH') and private.can_access_building(building_id,true)
);
drop policy if exists building_equipment_profiles_delete on public.building_equipment_profiles;
create policy building_equipment_profiles_delete on public.building_equipment_profiles
for delete to authenticated using (
 building_id in ('62THL','68PĐL','130HH') and private.can_access_building(building_id,true)
);
commit;
