-- ESTA Building Management - current Supabase schema backup
-- Generated 2026-09-24 from live project upcjcrycahdfroxggsdz.
-- Contains schema/RLS/functions/triggers/storage config only. No passwords or service-role secrets.
-- Recommended: run on a NEW Supabase project, not over an existing production schema.

create extension if not exists pgcrypto;
create schema if not exists private;

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  is_admin boolean not null default false,
  username text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.buildings (
  id text primary key,
  name text not null,
  deleted_at timestamptz null
);

create table if not exists public.building_members (
  building_id text not null references public.buildings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('editor','viewer')),
  primary key(building_id,user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 500),
  priority text not null default 'Bình thường',
  start_date date not null,
  end_date date not null,
  assignee text not null default '' check (char_length(assignee) <= 200),
  status text not null default 'Đang thực hiện'
    check (status in ('Đã hoàn thành','Đang thực hiện','Chờ xử lý')),
  notes text not null default '' check (char_length(notes) <= 20000),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleting_at timestamptz null,
  completed_at timestamptz null,
  task_type text not null default 'Hằng ngày'
    check (task_type in ('Hằng ngày','Bảo trì','Sự cố')),
  image_paths jsonb not null default '[]'::jsonb
);

create table if not exists public.energy_logs (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  meter_type text not null check (meter_type in ('electric','water','solar')),
  record_date date not null,
  meter_value numeric not null check (meter_value >= 0),
  note text not null default '',
  image_paths jsonb not null default '[]'::jsonb,
  created_by uuid null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_snapshots (
  building_id text primary key references public.buildings(id) on delete cascade,
  tasks jsonb not null default '[]'::jsonb,
  energy jsonb not null default '[]'::jsonb,
  updated_by uuid null references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_snapshot_history (
  id bigserial primary key,
  building_id text not null references public.buildings(id) on delete cascade,
  tasks jsonb not null default '[]'::jsonb,
  energy jsonb not null default '[]'::jsonb,
  changed_by uuid null references public.profiles(id),
  saved_at timestamptz not null default now()
);

create table if not exists public.building_people (
  id bigserial primary key,
  building_id text not null references public.buildings(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id)
);

create table if not exists public.inventory_materials (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  code text not null default '',
  name text not null,
  unit text not null default 'Cái',
  opening_qty numeric(14,2) not null default 0 check (opening_qty >= 0),
  min_qty numeric(14,2) not null default 0 check (min_qty >= 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tracking_start_date date not null default current_date
);

create table if not exists public.inventory_material_transactions (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  material_id uuid not null references public.inventory_materials(id) on delete cascade,
  tx_date date not null default current_date,
  tx_type text not null check (tx_type in ('in','out')),
  qty numeric(14,2) not null check (qty > 0),
  performer text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id)
);

create table if not exists public.inventory_tools (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  code text not null default '',
  name text not null,
  qty numeric(14,2) not null default 1 check (qty >= 0),
  unit text not null default 'Cái',
  location text not null default '',
  condition_status text not null default 'Tốt',
  keeper text not null default '',
  acquired_date date null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  brand text not null default ''
);

create table if not exists public.maintenance_assets (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  code text not null default '',
  name text not null,
  system_type text not null default 'Khác',
  location text not null default '',
  manufacturer text not null default '',
  model text not null default '',
  serial_no text not null default '',
  frequency_days integer not null default 30 check (frequency_days > 0),
  last_service_date date null,
  next_due_date date null,
  assigned_to text not null default '',
  status text not null default 'Hoạt động',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  asset_id uuid not null references public.maintenance_assets(id) on delete cascade,
  service_date date not null default current_date,
  maintenance_type text not null default 'Định kỳ',
  performer text not null default '',
  result_status text not null default 'Hoàn thành',
  work_done text not null default '',
  note text not null default '',
  next_due_date date null,
  cost numeric(14,2) not null default 0 check (cost >= 0),
  created_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id)
);

create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  name text not null,
  phone text not null default '',
  contact_name text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  specialty text not null default '',
  email text not null default '',
  address text not null default '',
  status text not null default 'Đang hợp tác',
  contract_start_date date null,
  contract_end_date date null
);

create table if not exists public.contractor_jobs (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  work_date date not null default current_date,
  completed_date date null,
  work_content text not null,
  cause text not null default '',
  solution text not null default '',
  status text not null default 'Đang thực hiện',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id)
);

-- =========================================================
-- INDEXES
-- =========================================================

create unique index if not exists profiles_username_lower_uq
  on public.profiles(lower(username)) where username is not null;
create index if not exists profiles_deleted_at_idx on public.profiles(deleted_at);
create index if not exists buildings_deleted_at_idx on public.buildings(deleted_at);
create index if not exists membership_user on public.building_members(user_id);

create index if not exists tasks_building_dates on public.tasks(building_id,start_date,end_date);
create index if not exists tasks_order on public.tasks(created_at desc,id);
create index if not exists energy_logs_building_type_date_idx
  on public.energy_logs(building_id,meter_type,record_date desc);

create index if not exists project_snapshot_history_building_saved_idx
  on public.project_snapshot_history(building_id,saved_at desc);

create unique index if not exists building_people_building_name_uq
  on public.building_people(building_id,lower(name));

create unique index if not exists inventory_materials_building_name_uq
  on public.inventory_materials(building_id,lower(name));
create index if not exists inventory_materials_building_idx
  on public.inventory_materials(building_id);
create index if not exists inventory_material_transactions_building_date_idx
  on public.inventory_material_transactions(building_id,tx_date);
create index if not exists inventory_material_transactions_material_idx
  on public.inventory_material_transactions(material_id);

create unique index if not exists inventory_tools_building_name_uq
  on public.inventory_tools(building_id,lower(name));
create index if not exists inventory_tools_building_idx
  on public.inventory_tools(building_id);

create unique index if not exists maintenance_assets_building_name_uq
  on public.maintenance_assets(building_id,lower(name),lower(location));
create index if not exists maintenance_assets_building_due_idx
  on public.maintenance_assets(building_id,next_due_date);
create index if not exists maintenance_records_asset_idx
  on public.maintenance_records(asset_id,service_date desc);
create index if not exists maintenance_records_building_date_idx
  on public.maintenance_records(building_id,service_date desc);

create unique index if not exists contractors_building_name_uq
  on public.contractors(building_id,lower(name));
create index if not exists contractors_building_idx on public.contractors(building_id);
create index if not exists contractors_building_contract_end_idx
  on public.contractors(building_id,contract_end_date);
create index if not exists contractor_jobs_building_date_idx
  on public.contractor_jobs(building_id,work_date desc);
create index if not exists contractor_jobs_contractor_idx
  on public.contractor_jobs(contractor_id,work_date desc);

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================

create or replace function private.create_qlkt_profile()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.profiles(id,email,display_name,username,active)
  values(
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'display_name',''),
    nullif(new.raw_user_meta_data->>'username',''),
    true
  );
  return new;
end;
$$;

create or replace function private.is_qlkt_admin()
returns boolean
language sql
stable security definer
set search_path=''
as $$
 select coalesce((select is_admin from public.profiles where id=auth.uid()),false);
$$;

create or replace function private.can_access_building(target text, writing boolean default false)
returns boolean
language sql
stable security definer
set search_path=''
as $$
 select private.is_qlkt_admin()
 or exists(
   select 1
   from public.building_members bm
   join public.buildings b on b.id=bm.building_id
   where bm.user_id=auth.uid()
     and bm.building_id=target
     and b.deleted_at is null
     and (not writing or bm.role='editor')
 );
$$;

create or replace function private.can_access_task_image(object_name text, writing boolean default false)
returns boolean
language sql
stable security definer
set search_path=''
as $$
 select private.can_access_building(split_part(object_name,'/',1),writing);
$$;

create or replace function public.bootstrap_first_admin()
returns boolean
language plpgsql
security definer
set search_path='public'
as $$
declare me uuid := auth.uid();
declare has_admin boolean;
begin
  if me is null then return false; end if;
  perform pg_advisory_xact_lock(620026);
  select exists(select 1 from public.profiles where is_admin=true) into has_admin;
  if not has_admin then
    update public.profiles set is_admin=true, active=true where id=me;
    return true;
  end if;
  return exists(select 1 from public.profiles where id=me and is_admin=true);
end;
$$;

create or replace function public.set_building_member(target_user uuid,target_building text,target_role text)
returns void
language plpgsql
set search_path=''
as $$
begin
 if not private.is_qlkt_admin() then raise exception 'Không có quyền quản trị.'; end if;
 if target_role is null then
   delete from public.building_members where user_id=target_user and building_id=target_building;
 elsif target_role in ('editor','viewer') then
   insert into public.building_members(user_id,building_id,role)
   values(target_user,target_building,target_role)
   on conflict(building_id,user_id) do update set role=excluded.role;
 else
   raise exception 'Vai trò không hợp lệ.';
 end if;
end;
$$;

create or replace function private.archive_project_snapshot()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.project_snapshot_history(building_id,tasks,energy,changed_by,saved_at)
  values(old.building_id,old.tasks,old.energy,new.updated_by,now());
  return new;
end;
$$;

create or replace function private.guard_qlkt_task()
returns trigger
language plpgsql
set search_path=''
as $$
begin
 if TG_OP='UPDATE' and old.deleting_at is not null then raise exception 'Công việc đang xóa, không thể sửa.'; end if;
 if TG_OP='INSERT' then new.created_at=now(); new.deleting_at=null; end if;
 if TG_OP='UPDATE' and (new.id<>old.id or new.created_by<>old.created_by or new.created_at<>old.created_at or new.building_id<>old.building_id) then
   raise exception 'Không thể đổi tòa nhà hoặc người tạo của công việc đã lưu.';
 end if;
 new.updated_at=clock_timestamp();
 if new.status='Hoàn thành' then
   if TG_OP='INSERT' then new.completed_at=now();
   elsif old.status<>'Hoàn thành' then new.completed_at=now();
   else new.completed_at=old.completed_at; end if;
 else new.completed_at=null; end if;
 return new;
end;
$$;

create or replace function private.guard_task_delete()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if exists(
   select 1 from storage.objects
   where bucket_id='task-images' and split_part(name,'/',2)=old.id::text
 ) then
   raise exception 'Còn ảnh chưa xóa. Vui lòng thử xóa lại công việc.';
 end if;
 return old;
end;
$$;

create or replace function private.validate_inventory_material_start()
returns trigger
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare first_tx date; min_balance numeric;
begin
  if new.tracking_start_date > current_date then
    raise exception 'Ngày bắt đầu quản lý không thể ở tương lai';
  end if;

  select min(tx_date) into first_tx
  from public.inventory_material_transactions
  where material_id=new.id;

  if first_tx is not null and new.tracking_start_date > first_tx then
    raise exception 'Ngày bắt đầu quản lý không thể sau giao dịch đầu tiên (%)',first_tx;
  end if;

  select min(new.opening_qty + running_balance) into min_balance
  from (
    select sum(case when tx_type='in' then qty else -qty end)
      over(order by tx_date,created_at,id rows unbounded preceding) as running_balance
    from public.inventory_material_transactions
    where material_id=new.id and tx_date>=new.tracking_start_date
  ) s;

  if coalesce(min_balance,new.opening_qty) < 0 then
    raise exception 'Tồn ban đầu mới làm tồn kho âm ở lịch sử hiện tại';
  end if;
  return new;
end;
$$;

create or replace function private.validate_inventory_stock()
returns trigger
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  mid uuid;
  start_date date;
  opening numeric(14,2);
  min_balance numeric;
begin
  mid := coalesce(new.material_id,old.material_id);

  select tracking_start_date,opening_qty into start_date,opening
  from public.inventory_materials where id=mid;

  if tg_op in ('INSERT','UPDATE') then
    if new.tx_date < start_date then
      raise exception 'Ngày nhập/xuất không thể trước ngày bắt đầu quản lý (%)',start_date;
    end if;
    if new.tx_date > current_date then
      raise exception 'Không thể ghi nhận nhập/xuất ở ngày tương lai';
    end if;
  end if;

  select min(opening + running_balance) into min_balance
  from (
    select sum(case when tx_type='in' then qty else -qty end)
      over(order by tx_date,created_at,id rows unbounded preceding) as running_balance
    from public.inventory_material_transactions
    where material_id=mid and tx_date>=start_date
  ) s;

  if coalesce(min_balance,opening) < 0 then
    raise exception 'Giao dịch làm tồn kho âm';
  end if;
  return coalesce(new,old);
end;
$$;

-- =========================================================
-- TRIGGERS
-- =========================================================

drop trigger if exists qlkt_new_user on auth.users;
create trigger qlkt_new_user
after insert on auth.users
for each row execute function private.create_qlkt_profile();

drop trigger if exists qlkt_task_guard on public.tasks;
create trigger qlkt_task_guard
before insert or update on public.tasks
for each row execute function private.guard_qlkt_task();

drop trigger if exists qlkt_delete_guard on public.tasks;
create trigger qlkt_delete_guard
before delete on public.tasks
for each row execute function private.guard_task_delete();

drop trigger if exists trg_archive_project_snapshot on public.project_snapshots;
create trigger trg_archive_project_snapshot
before update on public.project_snapshots
for each row execute function private.archive_project_snapshot();

drop trigger if exists trg_inventory_material_start on public.inventory_materials;
create trigger trg_inventory_material_start
before insert or update of tracking_start_date,opening_qty
on public.inventory_materials
for each row execute function private.validate_inventory_material_start();

drop trigger if exists trg_inventory_stock_insert on public.inventory_material_transactions;
create trigger trg_inventory_stock_insert
after insert on public.inventory_material_transactions
for each row execute function private.validate_inventory_stock();

drop trigger if exists trg_inventory_stock_update on public.inventory_material_transactions;
create trigger trg_inventory_stock_update
after update on public.inventory_material_transactions
for each row execute function private.validate_inventory_stock();

drop trigger if exists trg_inventory_stock_delete on public.inventory_material_transactions;
create trigger trg_inventory_stock_delete
after delete on public.inventory_material_transactions
for each row execute function private.validate_inventory_stock();

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.building_members enable row level security;
alter table public.tasks enable row level security;
alter table public.energy_logs enable row level security;
alter table public.project_snapshots enable row level security;
alter table public.project_snapshot_history enable row level security;
alter table public.building_people enable row level security;
alter table public.inventory_materials enable row level security;
alter table public.inventory_material_transactions enable row level security;
alter table public.inventory_tools enable row level security;
alter table public.maintenance_assets enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.contractors enable row level security;
alter table public.contractor_jobs enable row level security;

create policy profile_read on public.profiles
for select to authenticated
using (id=auth.uid() or private.is_qlkt_admin());

create policy building_read on public.buildings
for select to authenticated
using (private.can_access_building(id));

create policy member_read on public.building_members
for select to authenticated
using (user_id=auth.uid() or private.is_qlkt_admin());

create policy member_admin_insert on public.building_members
for insert to authenticated
with check (private.is_qlkt_admin());

create policy member_admin_update on public.building_members
for update to authenticated
using (private.is_qlkt_admin())
with check (private.is_qlkt_admin());

create policy member_admin_delete on public.building_members
for delete to authenticated
using (private.is_qlkt_admin());

create policy task_read on public.tasks
for select to authenticated using (private.can_access_building(building_id));
create policy task_insert on public.tasks
for insert to authenticated
with check (created_by=auth.uid() and private.can_access_building(building_id,true));
create policy task_update on public.tasks
for update to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));
create policy task_delete on public.tasks
for delete to authenticated
using (private.can_access_building(building_id,true));

create policy energy_logs_read on public.energy_logs
for select to authenticated using (private.can_access_building(building_id));
create policy energy_logs_insert on public.energy_logs
for insert to authenticated
with check (private.can_access_building(building_id,true) and created_by=auth.uid());
create policy energy_logs_update on public.energy_logs
for update to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));
create policy energy_logs_delete on public.energy_logs
for delete to authenticated
using (private.can_access_building(building_id,true));

create policy project_snapshots_read on public.project_snapshots
for select to authenticated using (private.can_access_building(building_id));
create policy project_snapshots_insert on public.project_snapshots
for insert to authenticated
with check (private.can_access_building(building_id,true) and updated_by=auth.uid());
create policy project_snapshots_update on public.project_snapshots
for update to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true) and updated_by=auth.uid());
create policy project_snapshots_delete on public.project_snapshots
for delete to authenticated
using (private.can_access_building(building_id,true));

create policy project_snapshot_history_read on public.project_snapshot_history
for select to authenticated using (private.can_access_building(building_id));

create policy building_people_read on public.building_people
for select to authenticated using (private.can_access_building(building_id));
create policy building_people_write on public.building_people
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy inventory_materials_read on public.inventory_materials
for select to authenticated using (private.can_access_building(building_id));
create policy inventory_materials_write on public.inventory_materials
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy inventory_material_transactions_read on public.inventory_material_transactions
for select to authenticated using (private.can_access_building(building_id));
create policy inventory_material_transactions_write on public.inventory_material_transactions
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy inventory_tools_read on public.inventory_tools
for select to authenticated using (private.can_access_building(building_id));
create policy inventory_tools_write on public.inventory_tools
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy maintenance_assets_read on public.maintenance_assets
for select to authenticated using (private.can_access_building(building_id));
create policy maintenance_assets_write on public.maintenance_assets
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy maintenance_records_read on public.maintenance_records
for select to authenticated using (private.can_access_building(building_id));
create policy maintenance_records_write on public.maintenance_records
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy contractors_read on public.contractors
for select to authenticated using (private.can_access_building(building_id));
create policy contractors_write on public.contractors
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

create policy contractor_jobs_read on public.contractor_jobs
for select to authenticated using (private.can_access_building(building_id));
create policy contractor_jobs_write on public.contractor_jobs
for all to authenticated
using (private.can_access_building(building_id,true))
with check (private.can_access_building(building_id,true));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
('site-assets','site-assets',true,5242880,array['image/webp','image/png','image/jpeg']),
('task-images','task-images',false,20971520,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set
  name=excluded.name,
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

create policy qlkt_image_read on storage.objects
for select to authenticated
using (bucket_id='task-images' and private.can_access_task_image(name,false));

create policy qlkt_image_insert on storage.objects
for insert to authenticated
with check (bucket_id='task-images' and private.can_access_task_image(name,true));

create policy qlkt_image_update on storage.objects
for update to authenticated
using (bucket_id='task-images' and private.can_access_task_image(name,true))
with check (bucket_id='task-images' and private.can_access_task_image(name,true));

create policy qlkt_image_delete on storage.objects
for delete to authenticated
using (bucket_id='task-images' and private.can_access_task_image(name,true));

create policy temporary_site_asset_upload on storage.objects
for insert to anon,authenticated
with check (bucket_id='site-assets');

-- =========================================================
-- GRANTS
-- =========================================================

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;
grant select on public.profiles, public.buildings, public.building_members to authenticated;
grant select,insert,update,delete on
  public.tasks,
  public.energy_logs,
  public.project_snapshots,
  public.building_people,
  public.inventory_materials,
  public.inventory_material_transactions,
  public.inventory_tools,
  public.maintenance_assets,
  public.maintenance_records,
  public.contractors,
  public.contractor_jobs
to authenticated;
grant select on public.project_snapshot_history to authenticated;

grant execute on function public.bootstrap_first_admin() to authenticated;
grant execute on function public.set_building_member(uuid,text,text) to authenticated;

-- End of schema backup.
