-- ESTA Supabase schema snapshot
-- Generated 2026-09-24 from project upcjcrycahdfroxggsdz
-- Secrets, passwords and auth password hashes are intentionally NOT included.
-- Restore into a Supabase project with auth/storage schemas already present.

create schema if not exists private;

CREATE OR REPLACE FUNCTION private.archive_project_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.project_snapshot_history(building_id,tasks,energy,changed_by,saved_at)
  values(old.building_id,old.tasks,old.energy,new.updated_by,now());
  return new;
end;
$function$


CREATE OR REPLACE FUNCTION private.can_access_building(target text, writing boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION private.can_access_task_image(object_name text, writing boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select private.can_access_building(split_part(object_name,'/',1),writing);
$function$


CREATE OR REPLACE FUNCTION private.create_qlkt_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION private.guard_qlkt_task()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION private.guard_task_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if exists(select 1 from storage.objects where bucket_id='task-images' and split_part(name,'/',2)=old.id::text) then raise exception 'Còn ảnh chưa xóa. Vui lòng thử xóa lại công việc.'; end if;
 return old;
end;
$function$


CREATE OR REPLACE FUNCTION private.is_qlkt_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select coalesce((select is_admin from public.profiles where id=auth.uid()),false);
$function$


CREATE OR REPLACE FUNCTION private.validate_inventory_material_start()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  first_tx date;
  min_balance numeric;
begin
  if new.tracking_start_date > current_date then
    raise exception 'Ngày bắt đầu quản lý không thể ở tương lai';
  end if;

  select min(tx_date) into first_tx
  from public.inventory_material_transactions
  where material_id = new.id;

  if first_tx is not null and new.tracking_start_date > first_tx then
    raise exception 'Ngày bắt đầu quản lý không thể sau giao dịch đầu tiên (%)', first_tx;
  end if;

  select min(new.opening_qty + running_balance)
    into min_balance
  from (
    select sum(case when tx_type='in' then qty else -qty end)
           over(order by tx_date, created_at, id rows unbounded preceding) as running_balance
    from public.inventory_material_transactions
    where material_id = new.id
      and tx_date >= new.tracking_start_date
  ) s;

  if coalesce(min_balance, new.opening_qty) < 0 then
    raise exception 'Tồn ban đầu mới làm tồn kho âm ở lịch sử hiện tại';
  end if;

  return new;
end;
$function$


CREATE OR REPLACE FUNCTION private.validate_inventory_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  mid uuid;
  start_date date;
  opening numeric(14,2);
  min_balance numeric;
begin
  mid := coalesce(new.material_id, old.material_id);

  select tracking_start_date, opening_qty
    into start_date, opening
  from public.inventory_materials
  where id = mid;

  if tg_op in ('INSERT','UPDATE') then
    if new.tx_date < start_date then
      raise exception 'Ngày nhập/xuất không thể trước ngày bắt đầu quản lý (%)', start_date;
    end if;

    if new.tx_date > current_date then
      raise exception 'Không thể ghi nhận nhập/xuất ở ngày tương lai';
    end if;
  end if;

  select min(opening + running_balance)
    into min_balance
  from (
    select sum(case when tx_type='in' then qty else -qty end)
           over(order by tx_date, created_at, id rows unbounded preceding) as running_balance
    from public.inventory_material_transactions
    where material_id = mid
      and tx_date >= start_date
  ) s;

  if coalesce(min_balance, opening) < 0 then
    raise exception 'Giao dịch làm tồn kho âm';
  end if;

  return coalesce(new, old);
end;
$function$


CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$


CREATE OR REPLACE FUNCTION public.set_building_member(target_user uuid, target_building text, target_role text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if not private.is_qlkt_admin() then raise exception 'Không có quyền quản trị.'; end if;
 if target_role is null then delete from public.building_members where user_id=target_user and building_id=target_building;
 elsif target_role in ('editor','viewer') then
 insert into public.building_members(user_id,building_id,role) values(target_user,target_building,target_role)
 on conflict(building_id,user_id) do update set role=excluded.role;
 else raise exception 'Vai trò không hợp lệ.'; end if;
end;
$function$


create sequence if not exists public.building_people_id_seq;

create sequence if not exists public.project_snapshot_history_id_seq;

create table if not exists public.building_members (
  building_id text not null,
  user_id uuid not null,
  role text not null
);

create table if not exists public.building_people (
  id bigint default nextval('building_people_id_seq'::regclass) not null,
  building_id text not null,
  name text not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid
);

create table if not exists public.buildings (
  id text not null,
  name text not null,
  deleted_at timestamp with time zone
);

create table if not exists public.contractor_jobs (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  contractor_id uuid not null,
  work_date date default CURRENT_DATE not null,
  completed_date date,
  work_content text not null,
  cause text default ''::text not null,
  solution text default ''::text not null,
  status text default 'Đang thực hiện'::text not null,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  created_by uuid
);

create table if not exists public.contractors (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  name text not null,
  phone text default ''::text not null,
  contact_name text default ''::text not null,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  specialty text default ''::text not null,
  email text default ''::text not null,
  address text default ''::text not null,
  status text default 'Đang hợp tác'::text not null,
  contract_start_date date,
  contract_end_date date
);

create table if not exists public.energy_logs (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  meter_type text not null,
  record_date date not null,
  meter_value numeric(14,2) not null,
  note text default ''::text not null,
  image_paths jsonb default '[]'::jsonb not null,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.inventory_material_transactions (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  material_id uuid not null,
  tx_date date default CURRENT_DATE not null,
  tx_type text not null,
  qty numeric(14,2) not null,
  performer text default ''::text not null,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid
);

create table if not exists public.inventory_materials (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  code text default ''::text not null,
  name text not null,
  unit text default 'Cái'::text not null,
  opening_qty numeric(14,2) default 0 not null,
  min_qty numeric(14,2) default 0 not null,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  tracking_start_date date default CURRENT_DATE not null
);

create table if not exists public.inventory_tools (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  code text default ''::text not null,
  name text not null,
  qty numeric(14,2) default 1 not null,
  unit text default 'Cái'::text not null,
  location text default ''::text not null,
  condition_status text default 'Tốt'::text not null,
  keeper text default ''::text not null,
  acquired_date date,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  brand text default ''::text not null
);

create table if not exists public.maintenance_assets (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  code text default ''::text not null,
  name text not null,
  system_type text default 'Khác'::text not null,
  location text default ''::text not null,
  manufacturer text default ''::text not null,
  model text default ''::text not null,
  serial_no text default ''::text not null,
  frequency_days integer default 30 not null,
  last_service_date date,
  next_due_date date,
  assigned_to text default ''::text not null,
  status text default 'Hoạt động'::text not null,
  note text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.maintenance_records (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  asset_id uuid not null,
  service_date date default CURRENT_DATE not null,
  maintenance_type text default 'Định kỳ'::text not null,
  performer text default ''::text not null,
  result_status text default 'Hoàn thành'::text not null,
  work_done text default ''::text not null,
  note text default ''::text not null,
  next_due_date date,
  cost numeric(14,2) default 0 not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid
);

create table if not exists public.profiles (
  id uuid not null,
  email text not null,
  display_name text default ''::text not null,
  is_admin boolean default false not null,
  username text,
  active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  deleted_at timestamp with time zone
);

create table if not exists public.project_snapshot_history (
  id bigint default nextval('project_snapshot_history_id_seq'::regclass) not null,
  building_id text not null,
  tasks jsonb default '[]'::jsonb not null,
  energy jsonb default '[]'::jsonb not null,
  changed_by uuid,
  saved_at timestamp with time zone default now() not null
);

create table if not exists public.project_snapshots (
  building_id text not null,
  tasks jsonb default '[]'::jsonb not null,
  energy jsonb default '[]'::jsonb not null,
  updated_by uuid,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.tasks (
  id uuid default gen_random_uuid() not null,
  building_id text not null,
  title text not null,
  priority text default 'Bình thường'::text not null,
  start_date date not null,
  end_date date not null,
  assignee text default ''::text not null,
  status text default 'Đang thực hiện'::text not null,
  notes text default ''::text not null,
  created_by uuid default auth.uid() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  deleting_at timestamp with time zone,
  completed_at timestamp with time zone,
  task_type text default 'Hằng ngày'::text not null,
  image_paths jsonb default '[]'::jsonb not null
);

alter table public.building_members add constraint building_members_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.building_members add constraint building_members_pkey PRIMARY KEY (building_id, user_id);

alter table public.building_members add constraint building_members_role_check CHECK (role = ANY (ARRAY['editor'::text, 'viewer'::text]));

alter table public.building_members add constraint building_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

alter table public.building_people add constraint building_people_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.building_people add constraint building_people_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.building_people add constraint building_people_pkey PRIMARY KEY (id);

alter table public.buildings add constraint buildings_pkey PRIMARY KEY (id);

alter table public.contractor_jobs add constraint contractor_jobs_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.contractor_jobs add constraint contractor_jobs_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE CASCADE;

alter table public.contractor_jobs add constraint contractor_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.contractor_jobs add constraint contractor_jobs_pkey PRIMARY KEY (id);

alter table public.contractors add constraint contractors_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.contractors add constraint contractors_pkey PRIMARY KEY (id);

alter table public.energy_logs add constraint energy_logs_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.energy_logs add constraint energy_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.energy_logs add constraint energy_logs_meter_type_check CHECK (meter_type = ANY (ARRAY['electric'::text, 'water'::text, 'solar'::text]));

alter table public.energy_logs add constraint energy_logs_meter_value_check CHECK (meter_value >= 0::numeric);

alter table public.energy_logs add constraint energy_logs_pkey PRIMARY KEY (id);

alter table public.inventory_material_transactions add constraint inventory_material_transactions_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.inventory_material_transactions add constraint inventory_material_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.inventory_material_transactions add constraint inventory_material_transactions_material_id_fkey FOREIGN KEY (material_id) REFERENCES inventory_materials(id) ON DELETE CASCADE;

alter table public.inventory_material_transactions add constraint inventory_material_transactions_pkey PRIMARY KEY (id);

alter table public.inventory_material_transactions add constraint inventory_material_transactions_qty_check CHECK (qty > 0::numeric);

alter table public.inventory_material_transactions add constraint inventory_material_transactions_tx_type_check CHECK (tx_type = ANY (ARRAY['in'::text, 'out'::text]));

alter table public.inventory_materials add constraint inventory_materials_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.inventory_materials add constraint inventory_materials_min_qty_check CHECK (min_qty >= 0::numeric);

alter table public.inventory_materials add constraint inventory_materials_opening_qty_check CHECK (opening_qty >= 0::numeric);

alter table public.inventory_materials add constraint inventory_materials_pkey PRIMARY KEY (id);

alter table public.inventory_tools add constraint inventory_tools_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.inventory_tools add constraint inventory_tools_pkey PRIMARY KEY (id);

alter table public.inventory_tools add constraint inventory_tools_qty_check CHECK (qty >= 0::numeric);

alter table public.maintenance_assets add constraint maintenance_assets_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.maintenance_assets add constraint maintenance_assets_frequency_days_check CHECK (frequency_days > 0);

alter table public.maintenance_assets add constraint maintenance_assets_pkey PRIMARY KEY (id);

alter table public.maintenance_records add constraint maintenance_records_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES maintenance_assets(id) ON DELETE CASCADE;

alter table public.maintenance_records add constraint maintenance_records_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.maintenance_records add constraint maintenance_records_cost_check CHECK (cost >= 0::numeric);

alter table public.maintenance_records add constraint maintenance_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.maintenance_records add constraint maintenance_records_pkey PRIMARY KEY (id);

alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);

alter table public.project_snapshot_history add constraint project_snapshot_history_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.project_snapshot_history add constraint project_snapshot_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profiles(id);

alter table public.project_snapshot_history add constraint project_snapshot_history_pkey PRIMARY KEY (id);

alter table public.project_snapshots add constraint project_snapshots_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

alter table public.project_snapshots add constraint project_snapshots_pkey PRIMARY KEY (building_id);

alter table public.project_snapshots add constraint project_snapshots_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id);

alter table public.tasks add constraint tasks_assignee_check CHECK (char_length(assignee) <= 200);

alter table public.tasks add constraint tasks_building_id_fkey FOREIGN KEY (building_id) REFERENCES buildings(id);

alter table public.tasks add constraint tasks_check CHECK (end_date >= start_date);

alter table public.tasks add constraint tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);

alter table public.tasks add constraint tasks_notes_check CHECK (char_length(notes) <= 20000);

alter table public.tasks add constraint tasks_pkey PRIMARY KEY (id);

alter table public.tasks add constraint tasks_status_check CHECK (status = ANY (ARRAY['Đã hoàn thành'::text, 'Đang thực hiện'::text, 'Chờ xử lý'::text]));

alter table public.tasks add constraint tasks_task_type_check CHECK (task_type = ANY (ARRAY['Hằng ngày'::text, 'Bảo trì'::text, 'Sự cố'::text]));

alter table public.tasks add constraint tasks_title_check CHECK (char_length(TRIM(BOTH FROM title)) >= 1 AND char_length(TRIM(BOTH FROM title)) <= 500);

CREATE INDEX membership_user ON public.building_members USING btree (user_id);

CREATE UNIQUE INDEX building_people_building_name_uq ON public.building_people USING btree (building_id, lower(name));

CREATE INDEX buildings_deleted_at_idx ON public.buildings USING btree (deleted_at);

CREATE INDEX contractor_jobs_building_date_idx ON public.contractor_jobs USING btree (building_id, work_date DESC);

CREATE INDEX contractor_jobs_contractor_idx ON public.contractor_jobs USING btree (contractor_id, work_date DESC);

CREATE INDEX contractors_building_contract_end_idx ON public.contractors USING btree (building_id, contract_end_date);

CREATE INDEX contractors_building_idx ON public.contractors USING btree (building_id);

CREATE UNIQUE INDEX contractors_building_name_uq ON public.contractors USING btree (building_id, lower(name));

CREATE INDEX energy_logs_building_type_date_idx ON public.energy_logs USING btree (building_id, meter_type, record_date DESC);

CREATE INDEX inventory_material_transactions_building_date_idx ON public.inventory_material_transactions USING btree (building_id, tx_date);

CREATE INDEX inventory_material_transactions_material_idx ON public.inventory_material_transactions USING btree (material_id);

CREATE INDEX inventory_materials_building_idx ON public.inventory_materials USING btree (building_id);

CREATE UNIQUE INDEX inventory_materials_building_name_uq ON public.inventory_materials USING btree (building_id, lower(name));

CREATE INDEX inventory_tools_building_idx ON public.inventory_tools USING btree (building_id);

CREATE UNIQUE INDEX inventory_tools_building_name_uq ON public.inventory_tools USING btree (building_id, lower(name));

CREATE INDEX maintenance_assets_building_due_idx ON public.maintenance_assets USING btree (building_id, next_due_date);

CREATE UNIQUE INDEX maintenance_assets_building_name_uq ON public.maintenance_assets USING btree (building_id, lower(name), lower(location));

CREATE INDEX maintenance_records_asset_idx ON public.maintenance_records USING btree (asset_id, service_date DESC);

CREATE INDEX maintenance_records_building_date_idx ON public.maintenance_records USING btree (building_id, service_date DESC);

CREATE INDEX profiles_deleted_at_idx ON public.profiles USING btree (deleted_at);

CREATE UNIQUE INDEX profiles_username_lower_uq ON public.profiles USING btree (lower(username)) WHERE (username IS NOT NULL);

CREATE INDEX project_snapshot_history_building_saved_idx ON public.project_snapshot_history USING btree (building_id, saved_at DESC);

CREATE INDEX tasks_building_dates ON public.tasks USING btree (building_id, start_date, end_date);

CREATE INDEX tasks_order ON public.tasks USING btree (created_at DESC, id);

alter table public.building_members enable row level security;

alter table public.building_people enable row level security;

alter table public.buildings enable row level security;

alter table public.contractor_jobs enable row level security;

alter table public.contractors enable row level security;

alter table public.energy_logs enable row level security;

alter table public.inventory_material_transactions enable row level security;

alter table public.inventory_materials enable row level security;

alter table public.inventory_tools enable row level security;

alter table public.maintenance_assets enable row level security;

alter table public.maintenance_records enable row level security;

alter table public.profiles enable row level security;

alter table public.project_snapshot_history enable row level security;

alter table public.project_snapshots enable row level security;

alter table public.tasks enable row level security;

create policy member_admin_delete on public.building_members as permissive for delete to authenticated using (( SELECT private.is_qlkt_admin() AS is_qlkt_admin));

create policy member_admin_insert on public.building_members as permissive for insert to authenticated with check (( SELECT private.is_qlkt_admin() AS is_qlkt_admin));

create policy member_admin_update on public.building_members as permissive for update to authenticated using (( SELECT private.is_qlkt_admin() AS is_qlkt_admin)) with check (( SELECT private.is_qlkt_admin() AS is_qlkt_admin));

create policy member_read on public.building_members as permissive for select to authenticated using (((user_id = auth.uid()) OR private.is_qlkt_admin()));

create policy building_people_read on public.building_people as permissive for select to authenticated using (private.can_access_building(building_id));

create policy building_people_write on public.building_people as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy building_read on public.buildings as permissive for select to authenticated using (private.can_access_building(id));

create policy contractor_jobs_read on public.contractor_jobs as permissive for select to authenticated using (private.can_access_building(building_id));

create policy contractor_jobs_write on public.contractor_jobs as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy contractors_read on public.contractors as permissive for select to authenticated using (private.can_access_building(building_id));

create policy contractors_write on public.contractors as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy energy_logs_delete on public.energy_logs as permissive for delete to authenticated using (private.can_access_building(building_id, true));

create policy energy_logs_insert on public.energy_logs as permissive for insert to authenticated with check ((private.can_access_building(building_id, true) AND (created_by = auth.uid())));

create policy energy_logs_read on public.energy_logs as permissive for select to authenticated using (private.can_access_building(building_id));

create policy energy_logs_update on public.energy_logs as permissive for update to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy inventory_material_transactions_read on public.inventory_material_transactions as permissive for select to authenticated using (private.can_access_building(building_id));

create policy inventory_material_transactions_write on public.inventory_material_transactions as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy inventory_materials_read on public.inventory_materials as permissive for select to authenticated using (private.can_access_building(building_id));

create policy inventory_materials_write on public.inventory_materials as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy inventory_tools_read on public.inventory_tools as permissive for select to authenticated using (private.can_access_building(building_id));

create policy inventory_tools_write on public.inventory_tools as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy maintenance_assets_read on public.maintenance_assets as permissive for select to authenticated using (private.can_access_building(building_id));

create policy maintenance_assets_write on public.maintenance_assets as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy maintenance_records_read on public.maintenance_records as permissive for select to authenticated using (private.can_access_building(building_id));

create policy maintenance_records_write on public.maintenance_records as permissive for all to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

create policy profile_read on public.profiles as permissive for select to authenticated using (((id = auth.uid()) OR private.is_qlkt_admin()));

create policy project_snapshot_history_read on public.project_snapshot_history as permissive for select to authenticated using (private.can_access_building(building_id));

create policy project_snapshots_delete on public.project_snapshots as permissive for delete to authenticated using (private.can_access_building(building_id, true));

create policy project_snapshots_insert on public.project_snapshots as permissive for insert to authenticated with check ((private.can_access_building(building_id, true) AND (updated_by = auth.uid())));

create policy project_snapshots_read on public.project_snapshots as permissive for select to authenticated using (private.can_access_building(building_id));

create policy project_snapshots_update on public.project_snapshots as permissive for update to authenticated using (private.can_access_building(building_id, true)) with check ((private.can_access_building(building_id, true) AND (updated_by = auth.uid())));

create policy task_delete on public.tasks as permissive for delete to authenticated using (private.can_access_building(building_id, true));

create policy task_insert on public.tasks as permissive for insert to authenticated with check (((created_by = auth.uid()) AND private.can_access_building(building_id, true)));

create policy task_read on public.tasks as permissive for select to authenticated using (private.can_access_building(building_id));

create policy task_update on public.tasks as permissive for update to authenticated using (private.can_access_building(building_id, true)) with check (private.can_access_building(building_id, true));

CREATE TRIGGER trg_inventory_stock_delete AFTER DELETE ON inventory_material_transactions FOR EACH ROW EXECUTE FUNCTION private.validate_inventory_stock();

CREATE TRIGGER trg_inventory_stock_insert AFTER INSERT ON inventory_material_transactions FOR EACH ROW EXECUTE FUNCTION private.validate_inventory_stock();

CREATE TRIGGER trg_inventory_stock_update AFTER UPDATE ON inventory_material_transactions FOR EACH ROW EXECUTE FUNCTION private.validate_inventory_stock();

CREATE TRIGGER trg_inventory_material_start BEFORE INSERT OR UPDATE OF tracking_start_date, opening_qty ON inventory_materials FOR EACH ROW EXECUTE FUNCTION private.validate_inventory_material_start();

CREATE TRIGGER trg_archive_project_snapshot BEFORE UPDATE ON project_snapshots FOR EACH ROW EXECUTE FUNCTION private.archive_project_snapshot();

CREATE TRIGGER qlkt_delete_guard BEFORE DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION private.guard_task_delete();

CREATE TRIGGER qlkt_task_guard BEFORE INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION private.guard_qlkt_task();

-- Storage bucket
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('task-images','task-images',false,20971520,array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set name=excluded.name,public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- storage policy: qlkt_image_delete
create policy "qlkt_image_delete" on storage.objects as permissive for delete to authenticated using (((bucket_id = 'task-images'::text) AND private.can_access_task_image(name, true)));

-- storage policy: qlkt_image_insert
create policy "qlkt_image_insert" on storage.objects as permissive for insert to authenticated with check (((bucket_id = 'task-images'::text) AND private.can_access_task_image(name, true)));

-- storage policy: qlkt_image_read
create policy "qlkt_image_read" on storage.objects as permissive for select to authenticated using (((bucket_id = 'task-images'::text) AND private.can_access_task_image(name, false)));

-- storage policy: qlkt_image_update
create policy "qlkt_image_update" on storage.objects as permissive for update to authenticated using (((bucket_id = 'task-images'::text) AND private.can_access_task_image(name, true))) with check (((bucket_id = 'task-images'::text) AND private.can_access_task_image(name, true)));

