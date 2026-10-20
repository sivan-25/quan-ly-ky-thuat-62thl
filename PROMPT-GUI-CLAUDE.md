# PROMPT MASTER — THIẾT KẾ LẠI GIAO DIỆN DỤNG CỤ - VẬT TƯ ESTA

Tôi gửi bộ **mã nguồn thực tế** của ESTA lấy từ production commit `a0e104840e103674034b836a58d3c566e5beb22d`. Bạn hãy đóng vai nhà thiết kế UI/UX chuyên nghiệp và kỹ sư frontend senior, kiểm tra, mô tả vấn đề, đề xuất thiết kế và **viết code thực tế có thể tích hợp**.

## Mục tiêu
Thiết kế lại hai tab trong `#inventoryPage`:
**A. Vật tư tiêu hao** và **B. Dụng cụ kỹ thuật**, tối ưu nhất cho nhân viên kỹ thuật sử dụng trên điện thoại. Giữ đẹp trên desktop. Không tạo màn hình demo rời thay cho code.

## A — Vật tư tiêu hao
- Chọn từ tháng 01 đến tháng 12 **không cần kéo ngang**. Có thể dùng ô chọn tháng, popup lưới 3x4 hoặc tháng trước/sau. Xem năm vẫn giữ.
- Giao diện danh sách/thẻ nhỏ gọn: tên, ĐVT, tồn đầu, nhập, xuất, tồn cuối; làm nổi bật cảnh báo hết/sắp hết.
- Bỏ dòng chữ lặp kiểu “còn bao nhiêu” bên dưới nếu đã có số tồn cuối.
- Toolbar ngắn: ô tìm vật tư, chọn năm/tháng, nút Thêm, Nhập/Xuất, Xuất PDF. Không chồng chữ hoặc tràn ngang.
- Form nhập/xuất: **radio hình tròn Nhập kho/Xuất kho trên cùng một hàng**; ô ngày và số lượng cùng hàng với tỷ lệ cân đối; người thực hiện/ghi chú phía dưới; nút Lưu/Hủy vừa tay, nhìn thấy được trên iOS/Android.
- Popup tạo/sửa vật tư gọn, ưu tiên các trường chính trước; hành động sửa/xóa dễ nhận, xóa phải xác nhận.
- Lưu thành công phải hiện “Đã lưu”; lỗi phải nói rõ, không hiển thị thành công trước khi backend xác nhận.

## B — Dụng cụ kỹ thuật
- Thẻ/dòng chứa tên, mã, hãng, số lượng, tình trạng, vị trí lưu, người phụ trách; không cao quá mức cần thiết. Bấm để xem thêm thông tin.
- Tìm kiếm, lọc và thao tác Thêm/Sửa/Xóa phải dễ dùng.
- Form thêm/sửa: cặp số lượng–đơn vị, nhãn hiệu–tình trạng, vị trí–người phụ trách cùng dòng **khi chiều rộng cho phép**; trên điện thoại hẹp được xuống dòng để không tràn ngang.
- Mọi trường và chức năng hiện có phải được bảo toàn.

## C — Bắt buộc giữ nguyên
- Cùng giao diện chuẩn ESTA cho **4 dự án 68 Phan Đăng Lưu, 62 Trần Huy Liệu, 127 Hồng Hà, 130 Hồng Hà**, nhưng dữ liệu mỗi dự án **hoàn toàn riêng** theo `building_id`.
- **Không** sửa cấu trúc bảng Supabase, công thức nhập/xuất/tồn theo thời gian, ngày bắt đầu quản lý, quyền Admin/KTV, PDF, liên kết vật tư khi hoàn thành công việc, lưu/xóa dữ liệu hoặc dữ liệu đang có.
- Giữ các `id` HTML và handlers hiện hữu, trừ khi có mapping đầy đủ và test rõ ràng; không để bất kỳ nút nào mất chức năng.
- Giao diện mobile 320/360/390/430px; desktop >=768px. Không có cuộn ngang, không chồng chữ, hành động chính đủ lớn cho thao tác chạm, tôn trọng vùng safe-area và bàn phím mobile.
- Màu ESTA: xanh slate đậm, nền be nhạt, xanh ngọc/đồng làm điểm nhấn; typography gọn nhưng đọc được.
- Tránh ghi CSS `!important` mới chồng chất vô tổ chức: phân tích cascade giữa `style.css`, `unified.css`, `demo-mobile.css`, `inventory-mobile-cards.css`, `inventory-mobile-no-scroll.css`.

## Phương pháp
1. Đọc `README-DOC-TRUOC.md`, 3 trích đoạn trong `BAT-DAU/`, sau đó kiểm tra kỹ tệp gốc ở `01-MA-NGUON-DAY-DU/` và stylesheets.
2. Nêu vấn đề thực tế bạn phát hiện có chỉ rõ selector và tên tệp, không suy đoán từ ảnh minh họa.
3. Đưa ra bố cục mới cho cả hai tab và popup nhập/xuất, ưu tiên **hiển thị bản thiết kế trực quan** để tôi duyệt.
4. Xuất HTML/CSS/JS hoàn chỉnh hoặc unified diff áp dụng được vào đúng file gốc, kèm danh sách tệp thay đổi. Không dùng code giả.
5. Đối chiếu kiểm thử `05-KIEM-THU/`; yêu cầu xác minh đổi tab, tháng 1–12, nhập/xuất, thêm/sửa/xóa, thông báo đã lưu, phân quyền, PDF, không tràn ngang trên 320–430px và không ảnh hưởng desktop.
6. **Chỉ thiết kế và bàn giao mã. TUYỆT ĐỐI KHÔNG TRIỂN KHAI LÊN WEB CHÍNH khi tôi chưa đồng ý.**

**Chú ý:** 3 tệp trong `BAT-DAU/` là trích đoạn để tham khảo, không dùng để thay nguyên file `app.js` hoặc `index.html`; phải sửa có kiểm soát trên file gốc đầy đủ.
