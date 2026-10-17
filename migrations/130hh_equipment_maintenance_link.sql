-- ESTA · Pilot: 130 Hồng Hà, one technical profile -> many maintenance plans.
-- Nullable, no backfill and no changes to existing work orders or maintenance history.
ALTER TABLE public.esta_maintenance_plan_items
 ADD COLUMN IF NOT EXISTS equipment_profile_id uuid;

-- Equipment must belong to the same building; other projects cannot write links
-- until explicitly migrated later. Keep all legacy plan rows untouched.
CREATE UNIQUE INDEX IF NOT EXISTS ue_profile_id_building_uniq_idx
 ON public.building_equipment_profiles_nangcap (id, building_id);
CREATE INDEX IF NOT EXISTS esta_pm_equipment_profile_lookup_idx
 ON public.esta_maintenance_plan_items (building_id, equipment_profile_id)
 WHERE equipment_profile_id IS NOT NULL;

ALTER TABLE public.esta_maintenance_plan_items
 ADD CONSTRAINT esta_pm_130_equipment_scope
 CHECK (equipment_profile_id IS NULL OR building_id = '130HH');
ALTER TABLE public.esta_maintenance_plan_items
 ADD CONSTRAINT esta_pm_equipment_profile_building_fk
 FOREIGN KEY (equipment_profile_id, building_id)
 REFERENCES public.building_equipment_profiles_nangcap (id, building_id)
 ON DELETE RESTRICT;

-- Existing RLS continues to enforce project access on both tables.
