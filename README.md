# ESTA · Quản lý vận hành kỹ thuật

Ứng dụng đang chạy: https://quan-ly-ky-thuat-62thl.vercel.app/

Frontend HTML/CSS/JavaScript thuần, API PDF Python/ReportLab trên Vercel. Dữ liệu, đăng nhập và ảnh dùng Supabase hiện hữu. Không có tài khoản/mật khẩu mẫu cục bộ; dùng tài khoản được quản trị viên cấp.

## Chạy tại máy

Cần Python 3.12+; Node.js chỉ cần khi chạy kiểm thử JavaScript.

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python3 tools/dev_server.py
```

Mở http://localhost:8080 và đăng nhập bằng tài khoản hệ thống. Dữ liệu vẫn thuộc Supabase đang vận hành; thao tác lưu trên bản chạy tại máy cũng ghi dữ liệu thật. Bộ kiểm thử bên dưới dùng dữ liệu giả lập độc lập và không ghi cơ sở dữ liệu.

## Kiểm thử

```sh
npm ci
npm test
python3 -m unittest discover -s tests -v
```

`tests/browser-preview.html` kiểm tra giao diện báo cáo với khung 1440 / 1024 / 768 / 390 / 320 px. Mặc định dùng dữ liệu giả lập độc lập, không đọc phiên đăng nhập và không gọi API nghiệp vụ. Các số thử nghiệm không được dùng trong báo cáo thật. Nút PDF trong fixture chủ động trả lỗi để kiểm tra thông báo; PDF thực được kiểm thử bằng Python và ứng dụng đăng nhập. Tùy chọn “Ứng dụng thật” mở ứng dụng cùng nguồn trong khung kiểm thử, giữ nguyên yêu cầu đăng nhập và quyền hiện hữu; thao tác lưu ở chế độ này ghi dữ liệu thật.

## Cấu trúc

- `index.html`: khung ứng dụng và form.
- `app.js`: đăng nhập, dự án, công việc, năng lượng, vật tư, dụng cụ, bảo trì, ảnh và PDF cũ.
- `contractor.js`, `construction.js`, `command-center.js`, `demo-lab.js`: nhà thầu, thi công, tổng quan và nghiệp vụ bổ sung.
- Các file CSS hiện hữu giữ cascade; không sắp xếp lại quy tắc khác giá trị.
- `report-model.js`: tính toán báo cáo thuần, dùng chung giao diện và kiểm thử.
- `report-center.js`, `report-center.css`: báo cáo tổng hợp, lọc kỳ, xem trước, in, PDF và lịch sử.
- `api/esta_report.py`: endpoint PDF có kiểm tra phiên đăng nhập.
- `reporting/report_center.py`: template PDF tổng hợp; các template PDF cũ được giữ.
- `reporting/fonts`: đúng bộ Montserrat mà PDF cũ sử dụng, đóng gói kèm giấy phép OFL.
- `docs/ESTA_HANDOVER.md`, `docs/ESTA_FULL_SOURCE_SNAPSHOT.md`: tài liệu/snapshot lịch sử, giữ nguyên.
- `docs/REVIEW_2026-10-01.md`: rà soát, dữ liệu, giới hạn và đề xuất nâng cấp của đợt này.

## Triển khai

Vercel tự triển khai từ nhánh `main` của repository hiện tại. `vercel.json` đóng gói module PDF cùng font. Không đổi Supabase Auth, RLS, bucket, schema hoặc các Edge Function. Không đưa secret vào source. Public Supabase publishable key hiện hữu không thay thế quyền truy cập của người dùng.

Trước khi cập nhật: đọc lại main, chạy kiểm thử, đối chiếu thay đổi và tăng phiên bản query của asset sửa đổi. Khi khôi phục, revert commit tương ứng; không ghi đè snapshot dữ liệu dự án.
