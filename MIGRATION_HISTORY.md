# SUPABASE MIGRATION HISTORY

Current migration list recorded from the live Supabase project on 2026-09-24.

| Version | Migration |
|---|---|
| 20260921052457 | initial |
| 20260921052729 | membership_invoker |
| 20260922012141 | align_daily_work_module |
| 20260922012617 | site_assets_bucket |
| 20260922021918 | add_energy_logs |
| 20260922040027 | profiles_for_multi_project_admin |
| 20260922040210 | bootstrap_first_admin_rpc |
| 20260922040757 | project_snapshots_for_multi_project_sync |
| 20260922042821 | soft_delete_buildings_with_trash |
| 20260922043114 | soft_delete_technical_accounts |
| 20260922050915 | project_snapshot_history_and_safe_sync |
| 20260922060830 | storage_media_for_unlimited_task_images |
| 20260922143312 | building_people_for_project_performers |
| 20260922153853 | inventory_materials_tools |
| 20260922154218 | maintenance_assets_records |
| 20260922162217 | inventory_tools_brand |
| 20260923045253 | inventory_tracking_start_and_stock_integrity |
| 20260923045558 | inventory_material_master_integrity |
| 20260923122458 | contractors_and_work_history |
| 20260923124313 | contractor_job_images |
| 20260923144921 | remove_old_contractor_module_data |
| 20260923145823 | contractors_and_service_jobs |
| 20260923151509 | contractors_and_work_history |
| 20260923152304 | contractors_profile_fields_v2 |
| 20260923164707 | contractor_contract_term |

## Meaning of the major phases

1. **Initial + membership** — tạo nền tảng dự án, task và phân quyền.
2. **Daily Work + Energy** — chuẩn hóa nghiệp vụ Công việc/Năng lượng.
3. **Multi-project Admin** — profiles, admin, building membership.
4. **Snapshot Sync** — chuyển dữ liệu client sang project snapshot + history.
5. **Storage** — bỏ base64 mới, chuyển ảnh sang Supabase Storage.
6. **People** — danh sách Người thực hiện theo từng dự án.
7. **Inventory** — vật tư, nhập/xuất, dụng cụ và kiểm soát tồn âm.
8. **Maintenance** — danh mục thiết bị và nhật ký bảo trì.
9. **Contractors** — hồ sơ nhà thầu, công việc đã thực hiện, thông tin liên hệ và thời hạn hợp đồng.

The consolidated current-state SQL is in `supabase/schema_backup.sql`. It is more useful for a clean rebuild than replaying every historical experiment individually.
