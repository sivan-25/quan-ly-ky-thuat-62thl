# ESTA — Tối ưu an toàn trên bản đã khôi phục (10/10/2026)

Source baseline production: `30d36603dbcbeb306d406b8d97234a2366f401ef`. Chỉ tối ưu trong `app.js` (polling), `demo-lab.js` (8 bảng & tính tồn kho), bổ sung test và CI. **Không thay HTML/CSS, giao diện, nhãn, API, PDF, phân quyền, Supabase schema/RLS/data hay cơ chế lưu.** Không tái áp dụng các thay đổi UX 127 HH đã hủy.

- Polling: gộp request GET trùng cho cùng dự án/phiên điều hướng; bỏ phản hồi cũ; khoảng thời gian 5s không đổi.
- Operations: gộp những lần cùng tải dữ liệu 8 bảng đồng thời; giữ `demoLoad(true)` làm mới bắt buộc và đảm bảo dữ liệu trả về cũ không ghi đè cache mới.
- Vật tư: duyệt giao dịch trực tiếp, không tạo mảng tạm; công thức tồn đầu + nhập – xuất không đổi.
- **Ponytail:** tham khảo nguyên tắc sửa ít nhất có thể, không thêm dependency runtime.
- **GitNexus:** source đã được xem xét; CLI index chưa chạy vì điều kiện giấy phép PolyForm Noncommercial. Không tuyên bố đã thực hiện phân tích dependency bằng GitNexus.
- Kiểm thử tự động cần PASS: JavaScript, Python/PDF, 85 ảnh ở 5 viewport của bản đã khôi phục so với nhánh tối ưu với dữ liệu mock, chặn kết nối ngoài. Số 16→8 request là kịch bản hai lời gọi UI đồng thời, không phải tăng tốc website 50%.
- **Chi phí tăng thêm = 0**. Không ghi/xóa dữ liệu Supabase trong test. Chỉ phát hành sau kiểm thử PASS, xác nhận `main` không đổi và đối chiếu production.
