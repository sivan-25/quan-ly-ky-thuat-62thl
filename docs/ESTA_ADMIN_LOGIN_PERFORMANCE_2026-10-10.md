# ESTA — tối ưu Admin và đăng nhập (tháng 10/2026)

Phiên bản gốc: `6e0455569ebb982bc4b7f7b128a03c1dec489d4a`. Chỉ sửa **hai file runtime**: `command-center.js`, `app.js`; không sửa HTML/CSS/PDF, giao diện 127HH bị hủy, hay dữ liệu Supabase.

- Admin: tính chỉ số vật tư từ Map giao dịch theo material_id xây dựng một lần cho từng dự án, thay vì duyệt toàn bộ giao dịch cho mỗi vật tư; giữ công thức tồn đầu + nhập - xuất và giới hạn thời gian giao dịch.
- Admin: bộ đệm tổng quan 30 giây dùng thời điểm **nhận kết quả tải thành công** thay cho `generated_at` của server vốn có thể cũ; nút Làm mới force vẫn truy vấn mới, tải song song Admin summary và công việc cá nhân vẫn giữ.
- Đăng nhập: khi phiên Supabase lưu trong máy còn dưới 30 giây hoặc đã hết hạn, làm mới access token trước khi lấy thông tin tài khoản; nếu refresh thất bại vẫn thử nhánh khôi phục cũ. Đăng nhập bằng mật khẩu và quyền dự án không thay đổi.
- Kiểm thử Node giả lập không gọi API thật: token có/không hạn, preflight thất bại, nhiều vật tư và giao dịch, Admin cache TTL và forced refresh. Kiểm thử JS, Python/PDF và 85 ảnh Playwright dùng localhost chặn mạng ngoài.
- Các số liệu về tăng tốc là cấu trúc thuật toán và mock request; chưa đo thời gian thực tế của Supabase trên máy người dùng.
- Không dùng API tính phí hoặc tài nguyên mới, không thay đổi schema/RLS/database, không làm phát sinh phụ phí.
