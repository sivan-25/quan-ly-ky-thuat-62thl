-- ESTA | Index the three maintenance relationships flagged by Supabase advisors.
-- Data-neutral: no rows or RLS policies are modified.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE INDEX IF NOT EXISTS esta_maintenance_audit_building_lookup_idx
 ON public.esta_maintenance_audit (building_id);
CREATE INDEX IF NOT EXISTS esta_maintenance_plan_equipment_fk_lookup_idx
 ON public.esta_maintenance_plan_items (equipment_profile_id,building_id);
CREATE INDEX IF NOT EXISTS esta_maintenance_occurrence_plan_fk_lookup_idx
 ON public.esta_maintenance_plan_occurrences (item_id,building_id);
COMMIT;
