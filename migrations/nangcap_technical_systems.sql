-- ESTA / Bản nâng cấp (NANGCAP) — isolated technical equipment profiles.
-- Safe for existing 130HH, 127HH, 62THL, 68PĐL: creates a new table only.
-- 44 sample definitions remain virtual until a real equipment profile is saved.
create table if not exists public.building_equipment_profiles_nangcap (
  id uuid primary key default gen_random_uuid(),
  building_id text not null default 'NANGCAP' references public.buildings(id),
  system_group text not null,
  equipment_type text not null,
  name text not null default '',
  code text not null default '',
  brand text not null default '',
  model text not null default '',
  location text not null default '',
  quantity integer not null default 1 check (quantity between 1 and 500),
  status text not null default 'Đang sử dụng'
    check (status in ('Đang sử dụng','Dự phòng','Ngừng sử dụng')),
  install_year integer check (install_year between 1950 and 2100),
  specs jsonb not null default '{}'::jsonb
    check (jsonb_typeof(specs) = 'object'),
  note text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint upgrade_equipment_single_project check (building_id = 'NANGCAP')
);
create index if not exists upgrade_equipment_building_group_idx
  on public.building_equipment_profiles_nangcap(building_id,system_group);
create unique index if not exists upgrade_equipment_seed_unique_idx
  on public.building_equipment_profiles_nangcap
  (building_id, (specs #>> '{_estaUpgrade,seedKey}'))
  where (specs #>> '{_estaUpgrade,seedKey}') is not null;

alter table public.building_equipment_profiles_nangcap enable row level security;
grant select, insert, update, delete on public.building_equipment_profiles_nangcap to authenticated;
create policy "upgrade_equipment_read" on public.building_equipment_profiles_nangcap
  for select to authenticated
  using (building_id = 'NANGCAP' and private.can_access_building(building_id));
create policy "upgrade_equipment_insert" on public.building_equipment_profiles_nangcap
  for insert to authenticated
  with check (building_id = 'NANGCAP' and private.can_access_building(building_id,true));
create policy "upgrade_equipment_update" on public.building_equipment_profiles_nangcap
  for update to authenticated
  using (building_id = 'NANGCAP' and private.can_access_building(building_id,true))
  with check (building_id = 'NANGCAP' and private.can_access_building(building_id,true));
create policy "upgrade_equipment_delete" on public.building_equipment_profiles_nangcap
  for delete to authenticated
  using (building_id = 'NANGCAP' and private.can_access_building(building_id,true));
