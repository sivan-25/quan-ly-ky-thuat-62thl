# ESTA – FULL SYSTEM BACKUP

Ngày tạo bản sao: **24/09/2026**

Nguồn:
- Repository: `sivan-25/quan-ly-ky-thuat-62thl`
- Source commit: `47ef00d2227952a344cbcf96bdb1ddac5d12762f`
- Backup branch: `backup-full-system-20260924`
- Supabase project nguồn: `upcjcrycahdfroxggsdz`

## Nội dung bản sao

### 1. Toàn bộ source frontend
Bản sao branch được tạo trực tiếp từ `main`, nên giữ nguyên toàn bộ:
- `index.html`
- `app.js`
- `style.css`
- `README.md`
- assets và tài liệu hiện có trong repo
- `docs/ESTA_FULL_SOURCE_SNAPSHOT.md`
- `docs/ESTA_HANDOVER.md`

### 2. Backend Supabase
Thư mục `backup/backend/` gồm:
- `SUPABASE_SCHEMA.sql`: schema, constraints, indexes, RLS, policies, triggers, functions, Storage bucket/policies.
- `functions/admin-users/index.ts`
- `functions/project-sync/index.ts`
- `functions/central-login/index.ts`
- `functions/admin-overview/index.ts`

### 3. Dữ liệu nghiệp vụ hiện tại
Thư mục `backup/data/` gồm JSON snapshot của:
- buildings
- profiles
- building_members
- building_people
- tasks
- energy_logs
- inventory_materials
- inventory_material_transactions
- inventory_tools
- maintenance_assets
- maintenance_records
- contractors
- contractor_jobs
- project_snapshots theo từng tòa nhà
- manifest project_snapshot_history
- manifest Storage `task-images`

## Lưu ý bảo mật

Bản sao KHÔNG chứa:
- mật khẩu người dùng;
- password hash của Supabase Auth;
- service-role key;
- secret environment variables;
- binary ảnh thật trong Storage.

Các thông tin này không nên commit vào GitHub. File manifest Storage đã lưu đầy đủ tên object để đối chiếu/khôi phục đường dẫn. Ảnh gốc vẫn nằm trong bucket private `task-images` của Supabase hiện tại.

## Khôi phục thành một hệ thống mới

1. Tạo Supabase project mới.
2. Chạy `backup/backend/SUPABASE_SCHEMA.sql`.
3. Deploy 4 Edge Functions trong `backup/backend/functions/`.
4. Tạo lại Auth users hoặc mời/tạo user mới.
5. Import JSON trong `backup/data/` theo thứ tự quan hệ.
6. Copy Storage objects từ bucket nguồn sang bucket `task-images` mới.
7. Đổi `SB_URL` / publishable key trong frontend nếu project mới khác project nguồn.
8. Deploy source lên Vercel.

## Phạm vi

Branch này là **snapshot độc lập để backup/đối chiếu**. Nó không ảnh hưởng branch `main` và không tự deploy production.
