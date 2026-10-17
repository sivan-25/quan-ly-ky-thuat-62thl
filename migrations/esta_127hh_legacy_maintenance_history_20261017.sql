-- ESTA | Import verified legacy history for 127 Hồng Hà only.
-- Source records remain unchanged; never infer exact hours, evidence or pass/fail result.
-- Each imported occurrence keeps a deterministic, project-scoped event_key.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';

WITH legacy AS (
  SELECT a.id,a.building_id,a.code,a.name,a.system_type,a.location,a.assigned_to,
         MIN(r.service_date) AS first_date
  FROM public.maintenance_assets a
  JOIN public.maintenance_records r
    ON r.asset_id=a.id AND r.building_id=a.building_id
  WHERE a.building_id='127HH'
  GROUP BY a.id
)
INSERT INTO public.esta_maintenance_plan_items
 (building_id,plan_year,plan_code,system_group,subsystem,work_title,
  assigned_to,original_assignee,source_notes,plan_months,cadence,work_type,asset_code,plan_status)
SELECT building_id,EXTRACT(YEAR FROM first_date)::int,
       'LEGACY-127HH-'||replace(id::text,'-',''),
       COALESCE(NULLIF(TRIM(system_type),''),'Khác'),
       COALESCE(location,''),name,
       COALESCE(NULLIF(TRIM(assigned_to),''),'Kỹ thuật'),
       COALESCE(assigned_to,''),
       'LỊCH SỬ - nhập từ maintenance_assets / maintenance_records, tài sản gốc '||id::text||
       '. Cần đối chiếu hồ sơ cũ trước khi xác nhận chu kỳ và minh chứng.',
       ARRAY[EXTRACT(MONTH FROM first_date)::int],
       'Không lặp','PM',COALESCE(code,''),'Có lịch'
FROM legacy
ON CONFLICT (building_id,plan_year,plan_code) DO NOTHING;

INSERT INTO public.esta_maintenance_plan_occurrences
 (item_id,building_id,event_key,planned_month,planned_date,due_date,
  location,source_kind,status,result_note,completed_by,result_code,
  image_paths,needs_review,review_note)
SELECT p.id,r.building_id,'LEGACY-HISTORY-'||r.id::text,
       date_trunc('month',r.service_date)::date,r.service_date,r.service_date,
       COALESCE(a.location,''),'year',
       CASE WHEN lower(trim(r.result_status)) IN ('hoàn thành','đã hoàn thành','completed')
            THEN 'completed' ELSE 'planned' END,
       CONCAT_WS(' · ',NULLIF(TRIM(r.work_done),''),NULLIF(TRIM(r.note),'')),
       COALESCE(r.performer,''),NULL,
       '[]'::jsonb,true,
       'Nhập từ maintenance_records/'||r.id::text||
       '; lịch sử thiếu ảnh và giờ bắt đầu/kết thúc. Không tự suy diễn kết quả kiểm tra.'
FROM public.maintenance_records r
JOIN public.maintenance_assets a
  ON a.id=r.asset_id AND a.building_id=r.building_id
JOIN public.esta_maintenance_plan_items p
  ON p.building_id=a.building_id
 AND p.plan_code='LEGACY-127HH-'||replace(a.id::text,'-','')
WHERE r.building_id='127HH'
ON CONFLICT (building_id,event_key) DO NOTHING;

-- The next scheduled date is copied exactly from the old register.
-- We intentionally do NOT generate 90-day/3-month recurrence:
-- the saved next_due_date may differ from the declared frequency_days.
INSERT INTO public.esta_maintenance_plan_occurrences
 (item_id,building_id,event_key,planned_month,planned_date,due_date,
  location,source_kind,status,needs_review,review_note)
SELECT p.id,a.building_id,'LEGACY-NEXT-DUE-'||a.id::text,
       date_trunc('month',a.next_due_date)::date,a.next_due_date,a.next_due_date,
       COALESCE(a.location,''),'year','planned',true,
       'Ngày dự kiến sao chép từ maintenance_assets; cần xác nhận lại chu kỳ bảo trì và ngày hạn.'
FROM public.maintenance_assets a
JOIN public.esta_maintenance_plan_items p
  ON p.building_id=a.building_id
 AND p.plan_code='LEGACY-127HH-'||replace(a.id::text,'-','')
WHERE a.building_id='127HH' AND a.next_due_date IS NOT NULL
  AND a.next_due_date > (SELECT MAX(r.service_date) FROM public.maintenance_records r
                          WHERE r.asset_id=a.id AND r.building_id=a.building_id)
ON CONFLICT (building_id,event_key) DO NOTHING;
COMMIT;
