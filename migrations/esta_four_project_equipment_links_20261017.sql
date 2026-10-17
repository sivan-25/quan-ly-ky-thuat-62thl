-- ESTA | Four building equipment ↔ maintenance links, preserving legacy data.
-- The old 130HH-only CHECK contradicts the four-project UI. The composite
-- foreign key and building-specific RLS continue to reject cross-building links.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.esta_maintenance_plan_items
  DROP CONSTRAINT IF EXISTS esta_pm_130_equipment_scope;
ALTER TABLE public.esta_maintenance_plan_items
  DROP CONSTRAINT IF EXISTS esta_pm_equipment_operating_projects;
ALTER TABLE public.esta_maintenance_plan_items
  ADD CONSTRAINT esta_pm_equipment_operating_projects
  CHECK (
    equipment_profile_id IS NULL
    OR building_id IN ('68PĐL','62THL','127HH','130HH')
  );

-- 127HH still stores one verified equipment profile in its older register.
-- Copy, do not move or delete: historical links and the original remain intact.
INSERT INTO public.building_equipment_profiles_nangcap
 (id,building_id,system_group,equipment_type,name,code,brand,model,
  location,quantity,status,install_year,specs,note,created_by,created_at,updated_at)
SELECT l.id,l.building_id,l.system_group,l.equipment_type,l.name,l.code,
       l.brand,l.model,l.location,l.quantity,l.status,l.install_year,
       COALESCE(l.specs,'{}'::jsonb),l.note,l.created_by,l.created_at,l.updated_at
FROM public.building_equipment_profiles_127 AS l
WHERE l.building_id = '127HH'
  AND NOT EXISTS (
    SELECT 1 FROM public.building_equipment_profiles_nangcap AS n
    WHERE n.id = l.id
  )
ON CONFLICT (id) DO NOTHING;
COMMIT;
