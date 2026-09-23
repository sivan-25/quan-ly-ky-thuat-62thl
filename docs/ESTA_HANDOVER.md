# ESTA – BÀN GIAO HỆ THỐNG QUẢN LÝ VẬN HÀNH KỸ THUẬT

**Ngày chốt tài liệu:** 24/09/2026  
**Repository:** `sivan-25/quan-ly-ky-thuat-62thl`  
**Branch:** `main`  
**Production:** https://quan-ly-ky-thuat-62thl.vercel.app/  
**Supabase project:** `upcjcrycahdfroxggsdz` – `quan-ly-ky-thuat`  
**Region:** `ap-southeast-1`

> Tài liệu này là điểm khôi phục/handover. Mã nguồn nguyên bản được chụp đầy đủ tại `docs/ESTA_FULL_SOURCE_SNAPSHOT.md`. Khi chỉnh sửa trong tương lai, luôn fetch lại các file live trước khi sửa vì repo có thể đã thay đổi.

## 1. Kiến trúc

- Frontend tĩnh: `index.html`, `style.css`, `app.js`.
- Source control: GitHub private repo, branch `main`.
- Deploy: Vercel tự động từ GitHub.
- Backend: Supabase Auth + PostgreSQL + Storage + Edge Functions.
- Ảnh công việc/năng lượng: bucket private `task-images`.
- Phân quyền: RLS theo `building_id`, tài khoản admin/editor/viewer.
- Tách dữ liệu theo từng dự án; không dùng chung danh mục người thực hiện, vật tư, dụng cụ, bảo trì, nhà thầu giữa các tòa nhà.

## 2. Dự án

- 68PĐL – 68 Phan Đăng Lưu
- 62THL – 62 Trần Huy Liệu
- 127HH – 127 Hồng Hà
- 130HH – 130 Hồng Hà
- Các dự án khác có thể thêm bằng Admin.

## 3. Đăng nhập

- Auth trung tâm bằng Supabase.
- Username được giải quyết qua Edge Function `central-login`.
- Admin và kỹ thuật viên dùng cùng trang login.
- Không lưu mật khẩu trong source.
- Session được lưu ở browser localStorage với key phiên trung tâm.
- Nếu Edge Function login lỗi tạm thời, frontend có fallback đăng nhập email trực tiếp.

## 4. Module chức năng

### Tổng quan
- KPI công việc hôm nay, đang thực hiện, hoàn thành, chờ xử lý.
- Công việc gần đây.
- Năng lượng tháng hiện tại.
- Thao tác nhanh.
- Admin tổng hợp nhiều dự án.

### Công việc
- Ngày, nội dung, loại, trạng thái, nhiều người thực hiện, ghi chú, nhiều hình.
- Người thực hiện là danh mục riêng từng dự án.
- Có sửa/xóa, tìm kiếm, lọc, mobile card, PDF.
- Ảnh upload Supabase Storage; snapshot chỉ lưu ref, không lưu base64 mới.
- Trạng thái mặc định: `Đang thực hiện`.

### Năng lượng
- Điện / Nước / Solar.
- Ngày, chỉ số, chênh lệch, nhiều người thực hiện, hình đồng hồ, ghi chú.
- PDF riêng và báo cáo tổng hợp.
- Người thực hiện dùng chung danh mục người của dự án.

### Dụng cụ – Vật tư
- 2 tab: `Vật tư tiêu hao` và `Dụng cụ kỹ thuật`.
- Vật tư theo 12 tháng, chọn Th01–Th12.
- Mỗi tháng: Tồn đầu kỳ / Nhập / Xuất / Tồn cuối kỳ.
- Công thức: `Tồn cuối = Tồn đầu + Nhập - Xuất`.
- Mức tồn tối thiểu riêng từng vật tư, cảnh báo sắp hết.
- Lịch sử nhập/xuất: ngày, loại, số lượng, người thực hiện, ghi chú.
- Dụng cụ: mã, tên, nhãn hiệu, số lượng, đơn vị, vị trí, tình trạng, ghi chú.
- PDF vật tư theo tháng và PDF danh mục dụng cụ.

### Bảo trì thiết bị
- Asset register: mã, tên, hệ thống, vị trí, hãng, model, serial.
- Chu kỳ bảo trì theo ngày.
- Ngày gần nhất, hạn kế tiếp, người phụ trách, trạng thái.
- Tự phân loại: quá hạn / sắp đến hạn / đúng kế hoạch / chưa đặt lịch.
- Nhật ký bảo trì: ngày, loại, người thực hiện, nội dung, kết quả, hạn kế tiếp, chi phí, ghi chú.
- PDF kế hoạch + lịch sử bảo trì.
- Hệ thống kỹ thuật gợi ý: HVAC, Điện, PCCC, Cấp thoát nước, Máy phát điện, Thang máy, Khác.

### Nhà thầu
- Danh mục riêng từng dự án.
- Tên nhà thầu, SĐT, người liên hệ, lĩnh vực, hợp đồng, trạng thái, ghi chú.
- Bấm vào tên nhà thầu để mở hồ sơ và lịch sử.
- Mỗi công việc có: ngày thực hiện, ngày hoàn thành, nội dung, nguyên nhân, hướng xử lý, tình trạng, ghi chú.
- Tìm kiếm/lọc theo lĩnh vực và trạng thái.
- PDF danh sách/hồ sơ nhà thầu.
- Có hỗ trợ ảnh cho công việc nhà thầu theo schema đã triển khai.

### Admin
- Quản lý dự án.
- Tạo/reset/khóa/xóa tài khoản kỹ thuật theo quyền.
- Soft delete dự án và tài khoản.
- Quản trị trung tâm đa dự án.

## 5. Supabase tables

Core:
- `profiles`
- `buildings`
- `building_members`
- `project_snapshots`
- `project_snapshot_history`
- `building_people`

Operations:
- `tasks`
- `energy_logs`

Inventory:
- `inventory_materials`
- `inventory_material_transactions`
- `inventory_tools`

Maintenance:
- `maintenance_assets`
- `maintenance_records`

Contractors:
- `contractors`
- `contractor_jobs`

Tất cả bảng nghiệp vụ chính đều bật RLS.

## 6. Edge Functions

- `admin-users` – thao tác tài khoản kỹ thuật/admin.
- `project-sync` – đồng bộ snapshot và record-level actions cho Công việc/Năng lượng.
- `central-login` – giải quyết username → email rồi đăng nhập Supabase Auth.
- `admin-overview` – dữ liệu tổng quan admin.

## 7. Storage

Bucket: `task-images` (private)

Format ref được frontend lưu:
`storage:<building>/<kind>/<recordId>/<timestamp>-<index>-<uuid>.jpg`

Frontend:
- nén ảnh trước upload;
- upload song song giới hạn;
- tải thumbnail qua authenticated Storage API;
- cache blob URL trong bộ nhớ;
- ảnh base64 cũ có cơ chế migrate sang Storage.

## 8. Đồng bộ dữ liệu Công việc/Năng lượng

Hệ thống lịch sử từng dùng snapshot JSON. Sau lỗi ghi đè snapshot toàn dự án, đã bổ sung:
- `project_snapshot_history`;
- Edge Function `project-sync`;
- thao tác record-level: `upsert_task`, `delete_task`, `upsert_energy`, `delete_energy`, `append_task_images`.

**Không quay lại cơ chế client ghi đè toàn snapshot sau mỗi thay đổi.**

## 9. Quy tắc giao diện hiện tại

- Brand: ESTA.
- Sidebar navy.
- Accent cyan/bronze.
- Card trắng, shadow nhẹ.
- Icon SVG line thống nhất, không dùng emoji làm icon chính.
- Công việc desktop ưu tiên form 1 hàng khi đủ rộng.
- Mobile có layout riêng, không chỉ co nhỏ desktop.
- Không hiển thị tên cá nhân ở hero trang chủ.
- Không dùng cụm “Hệ thống quản lý kỹ thuật toàn bộ dự án ESTA” ở hero.

## 10. PDF

PDF hiện thực bằng HTML print view + `window.print()`:
- Công việc
- Năng lượng
- Vật tư theo tháng
- Dụng cụ
- Bảo trì
- Nhà thầu

Trình duyệt có thể chọn “Save as PDF”.

## 11. Source inventory

| File | SHA | Dòng |
|---|---|---:|
| `index.html` | `184f041874a5d5c03461169b4c723ae109411dd7` | 1499 |
| `app.js` | `8e8087d8958356380023b1ef40da249b4d34cacd` | 1729 |
| `style.css` | `f86e22dd4db49a4c57e7cfe267d9ad3764e853b5` | 8131 |
| `README.md` | `13c8f19829dcdcdaf85aef1dddf53d3a3f520705` | 19 |

**Full verbatim snapshot:** `docs/ESTA_FULL_SOURCE_SNAPSHOT.md`.

## 12. Quy trình sửa phần mềm trong tương lai

1. Mở `docs/ESTA_HANDOVER.md`.
2. Fetch live `index.html`, `app.js`, `style.css` từ branch `main`.
3. Không dựa vào code copy cũ nếu SHA đã thay đổi.
4. Nếu đổi DB, tạo migration Supabase bằng `apply_migration`; không sửa schema thủ công không ghi migration.
5. Nếu thêm dữ liệu theo dự án, mọi bảng phải có `building_id` + RLS.
6. Nếu thêm ảnh, dùng Storage private và lưu ref, không base64 trong localStorage/snapshot.
7. Sau chỉnh JS: chạy parse `new Function(appJs)`.
8. Soát duplicate IDs và các `$("#id")` không tồn tại.
9. Smoke test CRUD bằng transaction + rollback cho bảng mới.
10. Bump query version của CSS/JS trong `index.html`.
11. Push GitHub `main`; Vercel auto deploy.
12. Kiểm tra production trên desktop và mobile.

## 13. Checklist regression bắt buộc

- Login username admin.
- Login tài khoản kỹ thuật.
- Admin mở được từng dự án.
- Công việc: thêm/sửa/xóa + nhiều người + ảnh.
- Năng lượng: điện/nước/solar + ảnh + người thực hiện.
- Vật tư: thêm, nhập, xuất, tồn đúng công thức, không cho xuất vượt tồn.
- Dụng cụ: CRUD.
- Bảo trì: thêm thiết bị, ghi nhật ký, cập nhật hạn kế tiếp.
- Nhà thầu: CRUD nhà thầu, mở hồ sơ, CRUD lịch sử công việc.
- PDF của từng module.
- Mobile không vỡ form/dropdown.
- RLS không cho truy cập dữ liệu dự án không được phân quyền.

## 14. Hướng nâng cấp dài hạn

Ưu tiên:
1. Chuẩn hóa Công việc/Năng lượng hoàn toàn về bảng normalized thay cho snapshot.
2. Thêm audit log chung cho mọi thay đổi.
3. Thêm notification bảo trì sắp đến hạn.
4. Thêm file/hình cho bảo trì và nhà thầu theo Storage.
5. Thêm đơn giá/giá trị tồn kho cho vật tư nếu cần quản trị chi phí.
6. Thêm export Excel nếu nhu cầu vận hành tăng.
7. Thêm dashboard theo tháng và SLA nhà thầu.

## 15. Prompt khôi phục cho AI

> Tôi có hệ thống ESTA quản lý vận hành kỹ thuật tòa nhà. Repository GitHub là `sivan-25/quan-ly-ky-thuat-62thl`, branch `main`; production là `https://quan-ly-ky-thuat-62thl.vercel.app/`; Supabase project ref là `upcjcrycahdfroxggsdz`. Hãy đọc `docs/ESTA_HANDOVER.md` và `docs/ESTA_FULL_SOURCE_SNAPSHOT.md`, sau đó fetch trực tiếp `index.html`, `app.js`, `style.css` bản live trước khi sửa. Hệ thống có các module Tổng quan, Công việc, Năng lượng, Dụng cụ–Vật tư, Bảo trì thiết bị, Nhà thầu, Admin. Phải giữ Auth/RLS/Storage, tách dữ liệu theo building_id, không ghi đè snapshot toàn dự án, không lưu ảnh mới dạng base64, và phải chạy kiểm tra cú pháp + duplicate/missing ID + smoke test CRUD trước khi báo hoàn tất. Chỉ hỏi tôi khi cần đăng nhập/quyền bắt buộc hoặc có quyết định nghiệp vụ không thể suy ra.

## 16. Nguyên tắc an toàn

- Không đưa service-role key vào frontend/tài liệu.
- Không commit password.
- Không bypass RLS.
- Không xóa bảng/dữ liệu production nếu chưa backup/được duyệt.
- Với migration destructive phải xác nhận.
- Khi lỗi UI, ưu tiên fix selector/layout cục bộ, không chồng thêm CSS override vô hạn.

## 17. Ghi chú bàn giao

Repo GitHub + Supabase là nguồn thật. File snapshot giúp đối chiếu nhưng khi sửa luôn ưu tiên file live vì người dùng có thể tiếp tục thay đổi sau ngày tạo tài liệu này.
