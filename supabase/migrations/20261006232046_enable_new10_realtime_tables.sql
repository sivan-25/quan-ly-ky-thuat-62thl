-- Enable Postgres Changes for the NEW10 operations tables.
-- Client subscriptions remain filtered by building_id=NEW10 and RLS still applies.
alter publication supabase_realtime add table
  public.project_snapshots,
  public.building_people,
  public.incidents,
  public.inspections,
  public.technical_documents,
  public.report_registry,
  public.inventory_materials,
  public.inventory_material_transactions,
  public.inventory_tools,
  public.maintenance_assets,
  public.maintenance_records,
  public.contractors,
  public.contractor_jobs,
  public.construction_materials,
  public.construction_material_logs,
  public.construction_material_transactions;
