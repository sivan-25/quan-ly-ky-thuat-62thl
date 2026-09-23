# ESTA BUILDING MANAGEMENT — FULL BACKUP & RESTORE GUIDE

Backup date: 2026-09-24  
Backup branch: `backup-2026-09-24-full-system`  
Source commit at backup start: `272eef8e193e72470aa90b32522a514947c893d1`  
Production: https://quan-ly-ky-thuat-62thl.vercel.app/  
Supabase project ref: `upcjcrycahdfroxggsdz`

> Tài liệu này dùng để lưu lại toàn bộ kiến trúc, mã nguồn, backend, quy trình dựng lại và cách phục hồi hệ thống. Không chứa mật khẩu, service-role key hoặc password hash.

## 1. Cấu trúc mã nguồn hiện tại

Frontend hiện nằm trực tiếp ở thư mục gốc:

- `index.html` — toàn bộ HTML: đăng nhập, sidebar, dashboard, Công việc, Năng lượng, Dụng cụ - Vật tư, Bảo trì, Admin và modal.
- `style.css` — CSS chính toàn hệ thống.
- `app.js` — logic chính: Auth, Supabase, phân quyền, dự án, Công việc, Năng lượng, Dashboard, kho, bảo trì, PDF, hình ảnh, đồng bộ.
- `contractor.js` — module Nhà thầu và lịch sử công việc nhà thầu.
- `contractor.css` — giao diện module Nhà thầu.
- `README.md` — mô tả repo.
- `assets/esta-login-bg.txt` — asset nền đăng nhập dạng text.
- `assets/esta-login-hero.b64` — asset hero đăng nhập dạng base64.
- `assets/login-hero.webp` — ảnh hero đăng nhập.

Backend được bổ sung trong thư mục `supabase/` của nhánh backup này:
- `supabase/schema_backup.sql`
- `supabase/functions/admin-users/index.ts`
- `supabase/functions/project-sync/index.ts`
- `supabase/functions/central-login/index.ts`
- `supabase/functions/admin-overview/index.ts`

## 2. Kiến trúc hệ thống

### Frontend
HTML + CSS + JavaScript thuần, deploy bằng Vercel từ GitHub.

### Backend
Supabase:
- Auth
- PostgreSQL
- Row Level Security
- Storage
- Edge Functions

### Luồng chính
1. Người dùng mở Vercel.
2. Đăng nhập bằng username/email + password.
3. `central-login` xử lý username và cấp Supabase session.
4. Frontend đọc `profiles`, `building_members`, `buildings`.
5. Người dùng chỉ thấy dự án được phân quyền; Admin thấy toàn bộ dự án.
6. Công việc/Năng lượng hiện còn dùng `project_snapshots` + `project-sync` để đồng bộ dữ liệu JSON theo dự án.
7. Hình ảnh được đưa vào Storage bucket `task-images`.
8. Kho vật tư, dụng cụ, bảo trì và nhà thầu dùng bảng PostgreSQL chuẩn hóa riêng.
9. PDF được tạo phía client bằng cửa sổ in của trình duyệt.

## 3. Module hiện có

### Đăng nhập
- Username hoặc email.
- Supabase Auth.
- Edge Function `central-login`.
- Session lưu ở localStorage.
- Admin và kỹ thuật viên dùng chung cổng đăng nhập.

### Admin đa dự án
- Danh sách dự án.
- Thêm / soft-delete / khôi phục dự án.
- Tạo tài khoản kỹ thuật.
- Phân quyền `editor` / `viewer`.
- Reset password.
- Khóa/mở tài khoản.
- Admin overview.

### Công việc
- Ngày.
- Nội dung.
- Loại: Hằng ngày / Bảo trì / Sự cố.
- Trạng thái.
- Một hoặc nhiều Người thực hiện.
- Ghi chú.
- Nhiều hình ảnh.
- Sửa / xóa / tìm kiếm / lọc.
- Responsive desktop/mobile.
- Xuất PDF.
- Ảnh lưu Supabase Storage.

### Năng lượng
- Điện / Nước / Solar.
- Ngày ghi.
- Chỉ số.
- Chênh lệch.
- Người thực hiện.
- Hình ảnh đồng hồ.
- Ghi chú.
- Lọc ngày/tháng.
- PDF.

### Dụng cụ - Vật tư
Vật tư tiêu hao:
- Danh mục vật tư theo dự án.
- Đơn vị tính.
- Tồn ban đầu.
- Mức tồn tối thiểu.
- Nhập / Xuất.
- Lịch sử giao dịch.
- Kiểm tra không cho tồn âm bằng trigger DB.
- Theo dõi theo tháng.
- PDF.

Dụng cụ:
- Tên.
- Mã.
- Nhãn hiệu.
- Số lượng.
- ĐVT.
- Vị trí.
- Tình trạng.
- Người phụ trách.
- Ngày mua.
- Ghi chú.
- PDF.

### Bảo trì thiết bị
- Danh mục thiết bị.
- Hệ thống: HVAC / Điện / PCCC / Cấp thoát nước / Máy phát / Thang máy / Khác.
- Model / Serial / hãng.
- Vị trí.
- Chu kỳ bảo trì.
- Ngày gần nhất.
- Hạn kế tiếp.
- Người phụ trách.
- Nhật ký bảo trì.
- Nội dung thực hiện.
- Kết quả.
- Chi phí.
- Cảnh báo quá hạn / sắp đến hạn.
- PDF.

### Nhà thầu bảo trì
- Tên nhà thầu.
- Số điện thoại.
- Người liên hệ.
- Chuyên môn.
- Email.
- Địa chỉ.
- Tình trạng.
- Thời hạn hợp đồng.
- Bấm vào nhà thầu để xem hồ sơ riêng.
- Lịch sử công việc:
  - ngày thực hiện
  - ngày hoàn thành
  - nội dung
  - nguyên nhân
  - hướng xử lý
  - tình trạng
  - ghi chú

## 4. Database hiện tại

Các bảng `public`:
1. profiles
2. buildings
3. building_members
4. tasks
5. energy_logs
6. project_snapshots
7. project_snapshot_history
8. building_people
9. inventory_materials
10. inventory_material_transactions
11. inventory_tools
12. maintenance_assets
13. maintenance_records
14. contractors
15. contractor_jobs

Schema chính xác tại thời điểm backup nằm trong `supabase/schema_backup.sql`.

## 5. Storage

### task-images
- private
- tối đa 20 MB/file
- JPEG / PNG / WEBP
- đường dẫn chuẩn:
  - `<building>/tasks/<taskId>/...`
  - `<building>/energy/<recordId>/...`
- RLS kiểm tra quyền dự án từ phần đầu path.

### site-assets
- public
- tối đa 5 MB
- JPEG / PNG / WEBP
- dùng cho asset giao diện.

## 6. Edge Functions

### central-login
Mục đích:
- Cho phép nhập username thay vì bắt buộc email.
- Tra username trong `profiles`.
- Chuyển sang đúng email.
- Gọi Supabase password grant.
- Không verify JWT vì đây là endpoint login.

### admin-users
Mục đích:
- CRUD dự án.
- Tạo tài khoản kỹ thuật.
- Reset password.
- Khóa tài khoản.
- Gán dự án và role.
- Soft-delete.

### project-sync
Mục đích:
- Đồng bộ snapshot Công việc/Năng lượng theo dự án.
- Action:
  - get
  - merge_snapshot
  - upsert_task
  - append_task_images
  - delete_task
  - upsert_energy
  - delete_energy

### admin-overview
Mục đích:
- Admin lấy nhanh dữ liệu tổng hợp của toàn bộ dự án.

## 7. Phân quyền

### Admin
`profiles.is_admin = true`

Có thể:
- xem tất cả dự án
- quản lý user
- quản lý dự án
- ghi dữ liệu

### Editor
Có record trong `building_members`, role = `editor`.

Có thể:
- đọc dự án được gán
- thêm/sửa/xóa dữ liệu dự án đó

### Viewer
role = `viewer`.

Chỉ đọc.

Quyền được enforced ở cả:
- frontend
- RLS
- Edge Functions

## 8. Quy trình dựng hệ thống từ đầu

### Bước 1 — GitHub
1. Tạo repository.
2. Đặt các file frontend ở root.
3. Branch chính: `main`.
4. Push code.
5. Mỗi thay đổi lớn nên commit riêng.
6. Trước thay đổi rủi ro, tạo branch backup.

### Bước 2 — Supabase
1. Tạo project.
2. Ghi lại Project URL.
3. Lấy Publishable Key.
4. KHÔNG đưa Service Role Key vào frontend.
5. Mở SQL Editor.
6. Chạy `supabase/schema_backup.sql`.

### Bước 3 — Auth
1. Bật Email/Password.
2. Trigger `qlkt_new_user` tự tạo profile khi auth.users có user mới.
3. Tạo tài khoản admin đầu tiên.
4. Gọi `bootstrap_first_admin()` bằng session admin đầu tiên nếu cần.
5. Tạo tài khoản kỹ thuật qua Edge Function `admin-users`.

### Bước 4 — Storage
1. Tạo bucket `task-images`.
2. private = true.
3. File size limit 20 MB.
4. MIME JPEG/PNG/WEBP.
5. Tạo bucket `site-assets`.
6. Áp Storage policies trong schema backup.

### Bước 5 — Edge Functions
Deploy lần lượt:
1. central-login — verify_jwt = false
2. admin-users — verify_jwt = true
3. project-sync — verify_jwt = true
4. admin-overview — verify_jwt = true

Các function dùng env do Supabase cấp:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANON_KEY (central-login)

Không ghi các secret này vào GitHub.

### Bước 6 — Frontend config
Trong `app.js`:
- `SB_URL` = Supabase Project URL.
- `SB_KEY` = publishable key.

Publishable key được phép ở browser; service-role key thì không.

### Bước 7 — Vercel
1. Import GitHub repo.
2. Framework: Other/Static.
3. Root directory: repo root.
4. Build command: để trống.
5. Output directory: để trống hoặc `.`.
6. Deploy.
7. Mỗi push vào `main` sẽ redeploy.

### Bước 8 — Tạo dự án
Admin tạo project code, ví dụ:
- 62THL
- 68PĐL
- 127HH
- 130HH

Sau đó gán user vào building_members.

### Bước 9 — Kiểm thử
Phải test ít nhất:
- login admin
- login kỹ thuật
- editor không truy cập dự án khác
- viewer không ghi dữ liệu
- thêm/sửa/xóa Công việc
- nhiều người thực hiện
- chụp/chọn nhiều ảnh
- đăng nhập lại vẫn thấy dữ liệu
- máy khác thấy dữ liệu
- ghi Năng lượng
- nhập/xuất vật tư và không cho tồn âm
- sửa dụng cụ
- bảo trì đến hạn
- nhà thầu + lịch sử công việc
- PDF
- desktop + mobile

## 9. Quy trình backup định kỳ

### Source code
- GitHub là bản chính.
- Tạo branch theo ngày:
  `backup-YYYY-MM-DD`
- Không force-push vào branch backup.

### Database
Ít nhất mỗi tháng:
- Supabase Dashboard → Database backups nếu plan hỗ trợ.
- Hoặc Supabase CLI / pg_dump từ máy quản trị.
- Lưu riêng schema và data.

### Storage
Backup bucket `task-images` định kỳ.
Database chỉ lưu path ảnh; mất bucket thì ảnh sẽ mất dù record còn.

### Auth
Không tự copy password hash bằng SQL thủ công.
Khi migrate Supabase project cần dùng quy trình auth migration chính thức hoặc yêu cầu user reset password.

## 10. Quy trình khôi phục sang project Supabase mới

1. Tạo project Supabase mới.
2. Chạy `supabase/schema_backup.sql`.
3. Deploy 4 Edge Functions.
4. Tạo lại Storage buckets.
5. Tạo admin Auth user.
6. Xác nhận profile admin.
7. Import application data theo thứ tự:
   - buildings
   - profiles/Auth mapping
   - building_members
   - building_people
   - project_snapshots
   - inventory_materials
   - inventory_material_transactions
   - inventory_tools
   - maintenance_assets
   - maintenance_records
   - contractors
   - contractor_jobs
8. Upload lại Storage images.
9. Đổi SB_URL và SB_KEY trong frontend.
10. Deploy Vercel.
11. Chạy checklist kiểm thử.

## 11. Lưu ý quan trọng về dữ liệu hiện tại

Công việc và Năng lượng đang có hai lớp:
- bảng chuẩn hóa `tasks`, `energy_logs`
- snapshot JSON `project_snapshots`

Frontend hiện chủ yếu dựa vào snapshot + `project-sync`.
Không xóa `project_snapshots` cho đến khi hoàn tất migration sang normalized tables.

`project_snapshot_history` chỉ lưu lịch sử kể từ khi trigger archive được tạo; nó không thể phục hồi dữ liệu đã mất trước thời điểm đó.

## 12. Thứ tự nâng cấp khuyến nghị

Để phần mềm ổn định lâu dài:
1. Không vá CSS tiếp tục vô hạn; tách module thành file/component rõ hơn.
2. Chuyển Công việc/Năng lượng hoàn toàn sang tables chuẩn hóa.
3. Thêm audit log chung.
4. Thêm contractor job images nếu cần và chuẩn hóa Storage path.
5. Thêm maintenance attachments.
6. Thêm inventory unit cost / stock value nếu muốn quản lý chi phí.
7. Thêm export Excel ngoài PDF.
8. Thêm test automation.
9. Thêm staging branch trước khi đẩy production.
10. Thêm GitHub Actions lint/smoke test.

## 13. Kiểm tra trước khi sửa production

Luôn:
1. tạo branch backup
2. sửa trên branch dev/staging
3. kiểm tra JavaScript parse
4. kiểm tra duplicate IDs
5. kiểm tra missing DOM IDs
6. test login
7. test module bị sửa
8. test mobile
9. mới merge main

## 14. Những gì backup này KHÔNG chứa

Vì lý do bảo mật, backup code không chứa:
- mật khẩu user
- password hash auth.users
- Service Role Key
- Vercel secrets
- Supabase internal secrets

Publishable key nằm trong frontend là bình thường.

## 15. Cách tải toàn bộ code backup

Mở GitHub repo → chọn branch:
`backup-2026-09-24-full-system`

Sau đó:
Code → Download ZIP.

ZIP đó chứa toàn bộ frontend hiện tại và các file backend/guide đã được thêm vào nhánh backup.

---
ESTA Building Management — backup documentation generated 2026-09-24.
