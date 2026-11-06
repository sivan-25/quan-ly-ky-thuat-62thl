# ESTA — 127 Hồng Hà | Nhánh nghiệm thu UI/UX

Ngày bắt đầu: 06/11/2026  
Git branch: `preview/127-hong-ha-uiux-20261106`  
Git base: `main` (commit `d4890b94356a85c102655e79cccda9991dc9f209`)  
Triển khai: **PREVIEW ONLY**. Cấm merge vào `main`, cấm promotion/production cho đến khi chủ sở hữu xác nhận.

## Phạm vi đã bắt đầu

- Ưu tiên **127 Hồng Hà**, không dùng 130 Hồng Hà làm nhánh thí điểm. Màu nhận diện 127 là xanh dương `#215d87`.
- Bảo toàn mã nghiệp vụ, dữ liệu, xác thực, RLS, API, lịch bảo trì, quy trình vật tư và phân quyền hiện hữu.
- Thiết lập theme riêng cho 127 theo bộ token tập trung trong `esta-brand-127.css`.
- Chỉnh thứ tự nạp style trong `index.html` riêng tại nhánh, không chỉnh production.
- Tạo `127hh-review.html`: bảng mẫu tĩnh có giao diện Tổng quan / Công việc / Vật tư / Dụng cụ / Lịch bảo trì. **Dữ liệu mô phỏng**, không gọi API.

## An toàn dữ liệu

`127hh-review.html` là nơi nghiệm thu giao diện an toàn, không đăng nhập và không lưu dữ liệu.
**Ứng dụng ESTA chính ở root của Preview vẫn dùng chung Supabase với production.** Không dùng biểu mẫu thật để tạo, sửa, xóa dữ liệu thử nghiệm. Muốn kiểm tra nghiệp vụ ghi/xóa phải cấu hình database staging được tách biệt, tài khoản thử và dữ liệu thử.

## Bảng tiến độ theo Master Prompt

| Batch | Nội dung | Trạng thái | Bằng chứng |
|---|---|---|---|
| 01 | Audit cấu trúc repo và các nguồn CSS | IN_PROGRESS | HTML/CSS/JS/Python, GitHub/Vercel đã xác định; cần audit thực tế tất cả trang |
| 02 | Branch, điểm khôi phục, môi trường thử | IN_PROGRESS | Git branch riêng; fixture không backend; chưa hoàn thành ma trận E2E |
| 03 | Design Tokens | IN_PROGRESS | Bộ token 127 + thử nghiệm kiểm tra source |
| 04 | Theme dự án | IN_PROGRESS | Scope `data-building-id="127HH"`; cần test rendering thực tế |
| 05–19 | Component, sidebar, topbar, các trang, hiệu năng, regression | PENDING | Chưa kiểm thử hoàn chỉnh |
| 20 | Independent End-User Acceptance | PENDING | Chưa có nghiệm thu của chủ sở hữu |

## Điều kiện trước khi phê duyệt chuyển production

1. Hoàn thành tất cả batch theo phạm vi đã chốt và có commit từng checkpoint.
2. Kiểm tra trong trình duyệt thật: 1440, 1024, 768, 390, 320 px.
3. Lighthouse và kiểm thử Playwright có bằng chứng đạt, không sai tương phản màu/chồng lớp.
4. Kiểm thử nghiệp vụ với staging database độc lập; tránh mọi tác động dữ liệu thật.
5. QA độc lập theo kịch bản kiểm tra, không dùng nhận định chủ quan thay test.
6. Người dùng đồng ý bằng yêu cầu rõ ràng cho **127HH production** trước; các dự án khác là giai đoạn khác và phải được duyệt riêng.

## Cách kiểm tra

- Xem mock tại `/127hh-review.html` trên URL Vercel Preview của nhánh.
- Trang ứng dụng thực tại `/` trên Preview chỉ xem, không thay đổi dữ liệu.
- Không xem bản mock là chứng cứ chức năng đã đạt.

## Checkpoint

- Mốc gốc rollback: `d4890b94356a85c102655e79cccda9991dc9f209`.
- Nhánh Preview có thể xóa hoặc revert các commit mà không đổi production.
- Bước kế tiếp: chạy test, kiểm tra preview, audit UI theo từng trang rồi xử lý Batch 01–20 tuần tự.
