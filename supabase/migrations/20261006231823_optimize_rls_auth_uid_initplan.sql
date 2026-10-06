-- Optimize RLS policies so auth.uid() is evaluated once per query.
alter policy profile_read on public.profiles
  using ((id = (select auth.uid())) or private.is_qlkt_admin());

alter policy member_read on public.building_members
  using ((user_id = (select auth.uid())) or private.is_qlkt_admin());

alter policy task_insert on public.tasks
  with check (((created_by = (select auth.uid())) and private.can_access_building(building_id, true)));

alter policy energy_logs_insert on public.energy_logs
  with check ((private.can_access_building(building_id, true) and (created_by = (select auth.uid()))));

alter policy project_snapshots_insert on public.project_snapshots
  with check ((private.can_access_building(building_id, true) and (updated_by = (select auth.uid()))));

alter policy project_snapshots_update on public.project_snapshots
  using (private.can_access_building(building_id, true))
  with check ((private.can_access_building(building_id, true) and (updated_by = (select auth.uid()))));
