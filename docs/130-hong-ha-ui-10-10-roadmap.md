# ESTA 130 Hồng Hà — Lộ trình kiểm thử và nghiệm thu giao diện 10/10

**Ngày:** 05/11/2026  
**Phạm vi:** Dự án 130 Hồng Hà. Không sửa nghiệp vụ hoặc dữ liệu của 127 Hồng Hà, 62 Trần Huy Liệu, 68 Phan Đăng Lưu.  
**Mục tiêu:** Bàn giao cho quản lý không chuyên kỹ thuật, thao tác dễ, chữ rõ, báo cáo tin cậy.  
**Nguyên tắc phát hành:** Không tự chấm 10/10 cho những chức năng chưa thử sau đăng nhập.

## 1. Kiểm kê — mốc gốc và điều kiện an toàn
- [x] Xác minh repo, nhánh triển khai, đường dẫn production và trạng thái Vercel.
- [x] Đối chiếu 47 tệp CSS đang dùng và định vị các quy tắc ghi đè nguy hiểm.
- [x] Tách nhánh thay đổi riêng; không chạy thao tác ghi dữ liệu dự án.
- [ ] Ghi nhận bộ ảnh trước/sau với dữ liệu thực, desktop/mobile và tài khoản đúng vai trò.
- [ ] Sao lưu dữ liệu và thử khôi phục bản sao trên môi trường an toàn trước thay đổi cơ sở dữ liệu (nếu có).

## 2. P0 — tương phản, viền, chữ không che
- [x] Sửa nhãn và số thống kê nhập/xuất/tồn đồng màu với chữ tối trên nền sáng, gồm cả `-webkit-text-fill-color`.
- [x] Sửa màu chữ và nền tiêu đề bảng lịch sử bảo trì.
- [x] Sửa chữ trên nút Chụp ảnh / Thư viện để kế thừa đúng màu chữ của nút.
- [x] Tăng độ tương phản viền biểu mẫu dự án 130; độ tương phản viền với nền lớn hơn 3:1.
- [x] Làm rõ nền của thanh thông tin bảo trì, không để chữ tối trên nền tối.
- [ ] Nghiệm thu tất cả popup, drawer, bảng có dữ liệu thật, trạng thái hover/focus/disabled.
- **Đạt khi:** không còn lỗi độ tương phản nghiêm trọng trong các màn hiển thị; chữ không trùng nền hoặc viền; kích thước phóng to 200% vẫn sử dụng được.

## 3. P1 — chuẩn hệ thống hiển thị
- [x] Token 130: ô nhập 44px, chữ chính 14px, nhãn 12px, caption 12px, bảng 13px; nền và chữ mỗi vai trò chỉ có một hệ màu.
- [x] Nâng cỡ chữ nhãn thống kê Nhà thầu, Bảo trì và Sự cố theo token chỉ áp dụng 130.
- [x] Trạng thái: đang xử lý xanh dương; hoàn thành xanh lá; chờ vàng; quá hạn đỏ, có nhãn đi kèm.
- [ ] Soát thủ công mọi nút 30/36/38px và nâng vùng chạm mobile theo mức tối thiểu áp dụng; bảo toàn bảng compact.
- [ ] Kiểm tra khung hình 390, 768, 1024 và 1440px, nội dung 2 dòng và tiêu đề dài.
- **Đạt khi:** ô cùng chức năng bằng nhau; tên/giá trị không cắt hoặc che; không có cuộn ngang bất thường.

## 4. P1 — nghiệm thu theo từng trang
- [ ] Tổng quan: việc cần xử lý, sự cố, bảo trì đến hạn, người phụ trách và điều hướng đến chi tiết.
- [ ] Công việc: tạo/sửa/xóa theo quyền, ưu tiên dấu sao không giới hạn, lưu dữ liệu, kiểm tra trạng thái.
- [ ] Vật tư tiêu hao: nhập/xuất/tồn tháng-năm, cảnh báo và Excel/PDF đối chiếu dữ liệu.
- [ ] Dụng cụ kỹ thuật: danh mục, tình trạng, xuất/nhập, tìm kiếm, sửa/xóa và lịch sử.
- [ ] Lịch bảo trì: tháng trước/sau, di chuyển, nhân bản, ngày bận, nhiều việc/ngày, lịch sử.
- [ ] Năng lượng: chỉ số điện/nước, xác nhận ảnh, biến động kỳ, nút máy ảnh/thư viện.
- [ ] Nhà thầu: hợp đồng, tình trạng, công việc, bộ lọc, hành vi form.
- [ ] Sự cố/Checklist/Tài liệu/Báo cáo/Vật tư thi công: nhãn Việt hóa, điều hướng, trạng thái, dữ liệu.
- **Đạt khi:** mỗi nghiệp vụ hoàn thành luồng bắt đầu → lưu → đọc lại → sửa → báo cáo, không có lỗi.

## 5. P2 — bàn giao lãnh đạo
- [ ] Trang Tổng quan trả lời 4 câu hỏi: việc gì cần xử lý, ảnh hưởng gì, ai phụ trách, hạn khi nào.
- [ ] Bản tóm tắt báo cáo một trang: công việc, sự cố, tiến độ bảo trì, vật tư, năng lượng.
- [ ] Lọc theo khoảng thời gian và dự án; số liệu dashboard bằng số liệu xuất PDF/Excel.
- [ ] Chuẩn từ vựng thống nhất: một trạng thái/một tên; không trộn tiếng Anh vô cớ.
- **Đạt khi:** người quản lý lần đầu dùng có thể tìm được vấn đề cần xử lý mà không cần kèm người hướng dẫn.

## 6. P2 — chất lượng kỹ thuật
- [x] Chỉnh khai báo CSS gốc dùng biến có fallback, không gắn thêm tệp CSS đè lớp mới.
- [x] Làm mới phiên bản URL của đúng những tệp CSS thay đổi để tránh cache cũ.
- [x] Thêm kiểm thử tĩnh về độ tương phản, nút, nhãn, bảng và giới hạn phạm vi dự án.
- [ ] Tách/gộp CSS trùng lặp sau kiểm thử giao diện toàn bộ ứng dụng.
- [ ] Đo Core Web Vitals production, đánh giá độ trễ thao tác khi có dữ liệu thực.
- [ ] Soát phân quyền, nhật ký thay đổi, khả năng khôi phục và không lộ dữ liệu giữa các dự án.
- **Đạt khi:** không hồi quy, không thất thoát dữ liệu, không chồng CSS trái quy chuẩn.

## 7. Nghiệm thu và chấm điểm
| Tiêu chí | Tối đa |
| --- | ---: |
| Chữ / màu / viền | 2.0 |
| Kích thước và mobile | 1.5 |
| Đồng nhất toàn dự án | 1.5 |
| Dễ dùng với cấp quản lý | 1.5 |
| Nghiệp vụ và báo cáo chính xác | 1.5 |
| Hiệu suất, bảo mật, dữ liệu | 1.0 |
| Nghiệm thu production | 1.0 |
| **Tổng** | **10.0** |

**Không chấm 10/10 nếu thiếu kiểm thử sau đăng nhập, dữ liệu sai, báo cáo lệch hoặc phát hiện lỗi tương phản nghiêm trọng.**

### Bước thử sau triển khai
1. Mở production trên máy tính; hard-refresh; vào đúng dự án 130.
2. Kiểm tra bốn trang Công việc, Vật tư, Bảo trì, Năng lượng với dữ liệu thật; quan sát chữ/viền ở các trạng thái.
3. Thử iOS/Android: nhập dữ liệu, bật chụp ảnh/thư viện, kiểm tra menu và nút.
4. Thực hiện một giao dịch thử an toàn trong môi trường kiểm thử có bản sao dữ liệu; đọc lại và xuất báo cáo.
5. Kiểm tra lại 127/62/68 không đổi màu, nghiệp vụ, báo cáo và dữ liệu.
6. Đối chiếu checklist, ký nghiệm thu, công bố điểm cuối cùng.

**Rollback:** nếu có lỗi nghiêm trọng, khôi phục deployment trước release và đánh giá lại dữ liệu/nhật ký; không xóa hay ghi đè dữ liệu người dùng để xử lý lỗi giao diện.
