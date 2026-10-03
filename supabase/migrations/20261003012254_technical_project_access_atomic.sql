-- Called only by the authenticated Admin edge function through service_role.
-- All membership changes succeed or roll back together; archived grants survive.
create or replace function public.admin_set_technical_projects(p_user_id uuid, p_memberships jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.profiles%rowtype;
  selected_ids text[];
  selected_count integer;
  distinct_count integer;
begin
  select * into target from public.profiles where id = p_user_id for update;
  if not found or target.deleted_at is not null then
    raise exception 'Không tìm thấy tài khoản kỹ thuật.' using errcode = '22023';
  end if;
  if target.is_admin then
    raise exception 'Admin đã có quyền truy cập tất cả dự án.' using errcode = '22023';
  end if;
  if p_memberships is null or jsonb_typeof(p_memberships) <> 'array' then
    raise exception 'Danh sách dự án không hợp lệ.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_memberships) < 1 then
    raise exception 'Hãy chọn ít nhất một dự án.' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_memberships) item
    where jsonb_typeof(item) <> 'object'
       or jsonb_typeof(item -> 'building_id') is distinct from 'string'
       or jsonb_typeof(item -> 'role') is distinct from 'string'
  ) then
    raise exception 'Dự án hoặc quyền truy cập không hợp lệ.' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_memberships) as m(building_id text, role text)
    where m.building_id is null or m.building_id = '' or m.role is null or m.role not in ('editor', 'viewer')
  ) then
    raise exception 'Dự án hoặc quyền truy cập không hợp lệ.' using errcode = '22023';
  end if;
  select array_agg(m.building_id order by m.building_id), count(*), count(distinct m.building_id)
    into selected_ids, selected_count, distinct_count
    from jsonb_to_recordset(p_memberships) as m(building_id text, role text);
  if selected_count <> distinct_count then
    raise exception 'Danh sách có dự án trùng lặp.' using errcode = '22023';
  end if;
  perform b.id from public.buildings b
    where b.id = any(selected_ids) and b.deleted_at is null
    order by b.id for share;
  if (select count(*) from public.buildings b where b.id = any(selected_ids) and b.deleted_at is null) <> selected_count then
    raise exception 'Có dự án không tồn tại hoặc đang nằm trong Thùng rác.' using errcode = '22023';
  end if;
  insert into public.building_members(building_id, user_id, role)
    select m.building_id, p_user_id, m.role
    from jsonb_to_recordset(p_memberships) as m(building_id text, role text)
    on conflict (building_id, user_id) do update set role = excluded.role;
  delete from public.building_members bm
    using public.buildings b
    where bm.user_id = p_user_id and b.id = bm.building_id and b.deleted_at is null
      and not (bm.building_id = any(selected_ids));
  return p_memberships;
end;
$$;
revoke all on function public.admin_set_technical_projects(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_set_technical_projects(uuid, jsonb) to service_role;
notify pgrst, 'reload schema';
