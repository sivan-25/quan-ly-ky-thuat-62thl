# Sửa lỗi không bấm được PDF khi kỳ báo cáo trống

## Nguyên nhân

Ảnh phản hồi hiển thị Công việc · 0 bản ghi, nút PDF và In bị làm mờ. Controller cũ yêu cầu tổng số bản ghi hoặc lịch bảo trì lớn hơn 0 mới cho xuất. Điều kiện này khóa thao tác ngay trên giao diện, trước khi gửi yêu cầu đến API PDF, và không giải thích lý do tại nút.

## Thay đổi

- PDF và In được bật khi đã tải đủ dữ liệu và đã chọn ít nhất một hạng mục, kể cả kỳ có 0 bản ghi.
- Hiển thị thông báo cạnh nút xuất: khoảng ngày không có bản ghi và PDF sẽ ghi rõ “Chưa có dữ liệu”.
- Nếu hạng mục đã chọn có dữ liệu ở tháng khác, cung cấp nút “Xem tháng … có dữ liệu”. Tháng chỉ đổi sau khi người dùng bấm nút, giữ nguyên các hạng mục đã chọn.
- Gợi ý chỉ lấy từ ngày nghiệp vụ hợp lệ của chính hạng mục đã chọn. Không lấy dữ liệu hạng mục khác để gợi ý; không tạo tháng giả cho dự án chưa có dữ liệu.
- Vẫn chặn xuất khi đang tải, đang tạo PDF, lỗi đọc nguồn dữ liệu, chưa chọn hạng mục hoặc đã chuyển sang dự án khác.
- Giữ nguyên API PDF, dữ liệu, quyền truy cập và các trang nghiệp vụ.

## Kiểm tra

20 bài model, 13 bài controller và 6 nhóm Python PDF đạt. Các bài mới tái hiện chính tình huống tháng 10 trống nhưng công việc nằm trong tháng 9; kiểm tra PDF/In kỳ trống, payload và lịch sử đúng kỳ, gợi ý chỉ đổi kỳ khi bấm, không chọn hạng mục vẫn bị khóa, dự án rỗng không tự sinh dữ liệu. Renderer tạo PDF kỳ trống 1 trang, có thông báo không có dữ liệu; đã trích chữ và xem bản render.

Không có lỗi parse JS/CSS, ID trùng hoặc asset nội bộ bị thiếu trong kiểm tra tĩnh. Phiên bản query của HTML/CSS/JS báo cáo đã tăng để trình duyệt nạp bản sửa.

## Cách dùng

Tải lại trang → chọn dự án → Báo cáo. Nếu kỳ hiện tại không có công việc, bấm “Xem tháng … có dữ liệu” hoặc chọn kỳ thủ công rồi Áp dụng. Nếu muốn xuất chính kỳ trống, vẫn dùng Xuất PDF tổng hợp; PDF hiển thị đúng 0 bản ghi và “Chưa có dữ liệu”.
