# ESTA 130 Hồng Hà — Biên bản triển khai 7 giai đoạn

**Ngày kiểm tra:** 05/11/2026  
**Phạm vi:** Website ESTA Property Operations; ưu tiên giao diện và luồng công việc 130 Hồng Hà, không làm thay đổi dữ liệu hoặc màu dự án khác.  
**Production nền trước phát hành:** `d6b852348fd6e8736b499c9d11d78e52e2c55e0b`. Có thể dùng bản deployment này làm mốc đối chiếu và quay lại nếu cần.

## 1. Khảo sát và bảo vệ dữ liệu
- [x] Xác nhận tên dự án Vercel, domain production, nhánh GitHub và commit nền.
- [x] Đo tải trang production trước tối ưu: 84 yêu cầu, 50 CSS, 27 JS, khoảng 1,36 MB truyền tải trong lượt đo Chromium.
- [x] Xác nhận CSS/JS ban đầu dùng Cache-Control no-cache.
- [x] Thực hiện trên nhánh riêng, không thao tác cập nhật/xóa dữ liệu vận hành.
- [ ] Kiểm thử khôi phục dữ liệu thật từ bản sao trên môi trường riêng (cần quyền quản trị và bản sao dữ liệu).

## 2. Chuẩn hóa màu, độ tương phản và khả năng nhìn rõ
- [x] Giữ các bản sửa màu đã nghiệm thu trước: vật tư, bảo trì, năng lượng, nhà thầu, nút camera/thư viện và biểu mẫu công việc.
- [x] Dùng bộ màu theo vai trò và trạng thái đã có của riêng 130 Hồng Hà; không thêm lớp CSS ghi đè màu.
- [x] So sánh thuộc tính màu chữ, màu nền, viền và hiển thị của mã CSS trước/sau build trên 44 trường hợp.
- [ ] Thử tất cả hộp thoại, trạng thái hover, focus, disabled và nội dung thật sau đăng nhập.

## 3. Kích thước, bố cục, typography và nội dung
- [x] Bảo toàn cấu trúc bố cục sau tối ưu: 5.284 phần tử đo được, 44/44 trường hợp có cùng thuộc tính CSS.
- [x] Bảo toàn thứ tự style, media queries, các khối inline style xen kẽ và các quy tắc riêng cho dự án.
- [ ] Nghiệm thu thủ công toàn bộ cỡ chữ rất nhỏ, chuỗi dài, popup và vùng chạm trên điện thoại.
- [ ] Nghiệm thu thủ công các nhãn của người dùng mới và các khu vực bị ẩn theo vai trò.

## 4. Kiểm thử nghiệp vụ đa dự án
- [x] Chạy đầy đủ `npm test` (bao gồm kiểm tra phân quyền, công việc, vật tư, bảo trì, sự cố, PDF, thiết bị, 4 dự án).
- [x] Chạy Python unittest: 45 bài kiểm thử PDF/kho và các trường hợp chữ dài, nhiều hình, nhiều trang đạt.
- [x] Kiểm thử thư viện Excel/QR tải khi cần: tải 1 lần nếu gọi đồng thời, không tự tải ngay khi đăng nhập.
- [ ] Nghiệm thu thực tế các thao tác tạo → lưu → xem lại → sửa → xuất PDF/Excel dưới tài khoản của từng vai trò.
- [ ] Đối chiếu số liệu thật PDF/Excel cho cả 4 dự án.

## 5. Trải nghiệm dành cho người quản lý
- [x] Có tài liệu hướng dẫn cách xem công việc, ưu tiên, bảo trì, vật tư, báo cáo và cảnh báo.
- [ ] Kiểm tra trực tiếp với tài khoản quản lý rằng dashboard luôn cho thấy việc cần xử lý, người chịu trách nhiệm, thời hạn, mức độ nghiêm trọng.
- [ ] Thử với người chưa từng dùng web để đo khả năng tìm thông tin; cải thiện bố cục theo phản hồi.

## 6. Hiệu suất, chống trùng lớp/code và độ ổn định
- [x] Gộp an toàn CSS: 47 tệp được tham chiếu còn 17 tệp; giảm 30 yêu cầu CSS trong lượt tải.
- [x] Chỉ gộp các stylesheet liên tiếp và cùng media; giữ nguyên byte nội dung CSS và thứ tự khai báo, không chèn thêm lớp sửa màu.
- [x] Dùng tên bundle có mã băm SHA-256 để tự đổi URL khi nguồn CSS đổi, không dùng bundle cũ.
- [x] Giảm tải khởi động bằng cách hoãn Excel/QR đến khi người dùng yêu cầu chức năng.
- [x] HTML và Service Worker luôn no-cache; CSS/JS thông thường lưu đệm ngắn; bundle có hash được phép cache dài.
- [x] Kiểm thử build CSS idempotent; cùng nội dung chỉ tạo một kết quả.
- [x] Kiểm tra trang đăng nhập bằng trình duyệt sau build: không lỗi JavaScript; tài nguyên Excel/QR không tải khi chưa dùng.
- [ ] Tái cấu trúc các quy tắc CSS cũ chồng chéo trong mã nguồn chỉ sau khi có đủ ảnh chuẩn và kiểm thử hành vi sau đăng nhập; việc gộp tài nguyên **không** có nghĩa đã loại hết khai báo CSS trùng trong source.
- [ ] Đo Core Web Vitals và thời gian thao tác thực tế có dữ liệu từ sản xuất.

## 7. Phát hành và nghiệm thu
- [x] Lập bản PR riêng, có bài kiểm thử hồi quy.
- [x] Kiểm thử Chromium đối chiếu trước/sau với 44 trường hợp, không sai khác thuộc tính CSS được đo.
- [ ] Xác nhận Vercel production READY + HTTP 200 + CSS hash và cache-control thực tế sau phát hành.
- [ ] Nghiệm thu quản lý, nhân viên kỹ thuật trên desktop/mobile với dữ liệu thật.
- [ ] Chấm đủ 7 tiêu chí theo bảng trong `docs/130-hong-ha-ui-10-10-roadmap.md`.

### Giới hạn và điều kiện 10/10
Không tuyên bố đạt 10/10 nếu chưa kiểm thử các màn sau đăng nhập, CRUD với dữ liệu thật, tính đúng đắn của báo cáo, phân quyền và độ ổn định trong môi trường sản xuất.

### Rollback an toàn
Nếu production phát hiện lỗi nghiêm trọng, quay về deployment ổn định trước khi cập nhật; không xóa hay ghi đè dữ liệu để xử lý lỗi giao diện. Vì thay đổi lần này chỉ liên quan đến tài nguyên frontend/Cache-Control và quy trình build, không chạy migration hoặc cập nhật dữ liệu, việc rollback được giới hạn ở mã và tài nguyên tĩnh.

## Cổng kiểm thử CSS nâng cao — 05/11/2026

**Mục đích:** Không chỉ kiểm tra số lượng file CSS mà kiểm chứng rằng việc gộp file không làm ẩn nút, che ô, đổi chữ, đổi màu, thay kích thước hoặc ảnh hưởng giao diện dự án khác.

- [x] So sánh CSS mã nguồn và CSS sau build trực tiếp bằng Chromium: **120 trường hợp** (10 trang × 3 độ rộng 390/1024/1440 px × 4 giao diện dự án).
- [x] Đối chiếu **7.644 phần tử** với 22 thuộc tính tính toán, gồm màu chữ/nền/viền, font chữ, chiều cao, chiều rộng, tràn nội dung, mức hiển thị, thuộc tính lưới và màu chữ WebKit. **Không phát hiện sai khác do bundling.**
- [x] Bổ sung kiểm tra các thành phần quan trọng không bị ẩn bất thường trong chế độ 130 Hồng Hà: biểu mẫu và Lưu công việc, chọn tháng vật tư, bảng bảo trì, nhập năng lượng, thanh Nhà thầu, thêm Sự cố, thêm Checklist, bảng Báo cáo.
- [x] Kiểm tra ngưỡng yêu cầu CSS trong bản build: không quá 19 stylesheet nội bộ; thực tế **17** so với **47** trong mã nguồn.
- [x] Thứ tự bắt buộc của CI: **npm ci → npm test mã nguồn → lưu bản index gốc → npm run build → kiểm tra các asset đã sinh → Chromium so sánh giao diện**. Tránh chạy `npm test` trên `index.html` đã biến đổi vì một số test bảo vệ tên/version file nguồn.
- [x] Chạy riêng PDF regression: **45 Python tests PASS** với các phụ thuộc báo cáo được cài đặt; không gửi ảnh/dữ liệu thật lên bất kỳ dịch vụ kiểm thử nào.
- [x] Kiểm tra production đang hoạt động: CSS đã gộp, website trả 200, trang login không có JavaScript exception; một lần đo thử Chromium là 17 CSS và 26 JS, khoảng 362 KB CSS transfer và 255–262 ms load event trong điều kiện thử, **không phải cam kết tốc độ mạng thực tế**.
- [x] Tích hợp GitHub Actions `.github/workflows/esta-130-ui-quality.yml`, cho phép phát hiện lỗi khi có PR/chỉnh sửa CSS/HTML về sau.

**Chưa đủ điều kiện nghiệm thu tuyệt đối 10/10:**
- [ ] Kiểm tra đầy đủ dữ liệu thật, hover/focus/disabled, quyền truy cập, popup/chuyển trang và giao dịch lưu/xóa sau đăng nhập.
- [ ] So sánh báo cáo PDF và Excel với dữ liệu gốc của cả bốn dự án trên bản sao độc lập.
- [ ] Kiểm thử backup → restore trên bản sao trước khi động vào dữ liệu sản xuất.
- [ ] Chạy thử thực tế với quản lý lần đầu sử dụng; ký biên bản nghiệm thu theo tiêu chí 10 điểm.

**Lưu ý:** Gộp 47 nguồn CSS thành 17 tệp truyền qua mạng không đồng nghĩa đã xóa mọi khai báo CSS lặp trong mã nguồn. Không được xóa hàng loạt các quy tắc cũ khi chưa kiểm chứng thứ tự cascade và hành vi của cả bốn dự án.
