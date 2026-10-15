-- Existing ESTA Bản nâng cấp only. Extend status options required by the unified equipment screen.
alter table public.building_equipment_profiles_nangcap
 drop constraint if exists building_equipment_profiles_nangcap_status_check;
alter table public.building_equipment_profiles_nangcap
 add constraint building_equipment_profiles_nangcap_status_check
 check (status in ('Đang sử dụng','Dự phòng','Cần theo dõi','Đang sửa chữa','Ngừng sử dụng'));
