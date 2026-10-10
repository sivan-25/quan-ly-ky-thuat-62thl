# ESTA — Kết quả Audit & Safe Optimization

**Ngày kiểm tra:** 10/10/2026  
**Repository:** `sivan-25/quan-ly-ky-thuat-62thl`  
**Production baseline:** `main` — `63aebcc166b09e8fb81b3b858b7237e69021fe1e`  
**Nhánh tối ưu:** `optimize-esta-safe` — PR #29 (Draft)  
**Trạng thái:** CHƯA MERGE / CHƯA DEPLOY PRODUCTION

## 1. Các chỉnh sửa mã nguồn chạy

| File | Thay đổi | Mục đích |
|---|---|---|
| `app.js` | Gộp các polling trùng cho cùng dự án/lần mở, bỏ qua kết quả đến muộn từ dự án cũ | Giảm truy vấn trùng lặp; tránh cập nhật nhầm dữ liệu khi chuyển dự án |
| `demo-lab.js` | Dùng chung promise tải 8 bảng Supabase cho các lời gọi đồng thời; yêu cầu tải lại bắt buộc vẫn làm mới | Giảm số lượt tải trùng; giữ dữ liệu mới sau thao tác ghi |
| `demo-lab.js` | Duyệt trực tiếp các giao dịch trong `demoStock` thay vì tạo mảng qua `filter` | Giảm cấp phát mảng trung gian, không đổi phép tính tồn |

**Không chỉnh sửa** file HTML, CSS, mẫu PDF, API server, schema/RLS hoặc dữ liệu Supabase. Không merge vào `main`.

## 2. Kết quả đo có thể đối chứng

### Truy vấn vận hành đồng thời

Đã chạy **mã nguồn thực** từ `main` và nhánh thử nghiệm trong cùng fixture Node.js mô phỏng Supabase, không phát sinh giao dịch mạng thật:

| Thử nghiệm | Main | Optimize |
|---|---:|---:|
| Hai thành phần cùng yêu cầu dữ liệu dự án | 16 truy vấn bảng | 8 truy vấn bảng |
| Truy vấn trùng tránh được | 0 | 8 |
| Lượt tải sau thao tác ghi `force=true` | 8 truy vấn bảng | 8 truy vấn bảng |

Giảm **50% số truy vấn trong kịch bản hai lời gọi đồng thời**. Đây không phải giảm 50% toàn bộ request website, cũng không phải bằng chứng website nhanh hơn 50%.

### So sánh giao diện trình duyệt Chromium

- **50/50 kịch bản đạt** trên 5 kích thước màn hình: 320×720, 390×844, 768×1024, 1024×768, 1440×900.
- 10 kịch bản: đăng nhập, trang dự án Admin, Tổng quan Admin, Công việc ở cả 4 dự án, cửa sổ chỉnh sửa 62 THL và 130 HH, Năng lượng 68 PĐL.
- **0 pixel khác biệt đáng kể theo ngưỡng ±8/255 mỗi kênh màu**, trên toàn bộ 50 ảnh. 45 pixel chỉ khác 1/255 do kết xuất ảnh; có lưu thống kê raw.
- Kích thước DOM, chiều rộng trang, nội dung bảng công việc và trạng thái cửa sổ chỉnh sửa được đối chiếu bản gốc với bản tối ưu, không sai khác trong fixture.
- Không có page JavaScript errors ở những kịch bản giả lập.

**Giới hạn:** chụp ảnh trong Chrome/Chromium với dữ liệu giả lập; không phải kết quả dùng tài khoản thật, iPhone Safari hay Android Chrome. Một số màn hình vẫn có nội dung bên dưới viewport cần cuộn thêm để kiểm tra thủ công.

### Kiểm thử nghiệp vụ

- JavaScript regression suite: PASS.
- Python/PDF regression suite: PASS (11 tests tại baseline trước đó).
- Kiểm tra đường dẫn tài nguyên CSS/JS: 23/23 tồn tại.
- Kiểm thử đồng bộ công việc, thao tác vật tư, chuyển dự án A→B→A và yêu cầu tải lại: PASS với mock API.
- Vercel Preview build: READY (không phải đã kiểm thử thao tác người dùng thật).

## 3. Bằng chứng trực tiếp

- [PR #29](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/pull/29)
- [JavaScript & PDF CI](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38017983381)
- [50-case visual regression CI](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38017983340)
- [Ảnh Before/After của cả 50 trường hợp và kết quả request](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38017983340/artifacts/11657155997)
- [Vercel Preview](https://vercel.com/vanbqs2511-9332/esta-property-operations/5DwXHFnGpMnbW7CJ69bQjpRHtq6h)

## 4. Vấn đề có sẵn, chưa chủ động sửa

- Bản gốc có tràn ngang ở viewport 1024×768 trên trang Công việc các dự án (đo được document scroll width lớn hơn 332 px). Bản tối ưu giữ nguyên trạng thái này; sửa CSS sẽ làm thay đổi bố cục nên cần phê duyệt riêng.
- Chưa có benchmark mạng thật với tài khoản test: LCP/INP, thời gian chuyển trang/lưu việc trước và sau. Không khẳng định đã đáp ứng mục tiêu 100–150 ms cho phản hồi lưu trên mọi thiết bị.
- Chưa chạy CRUD thật trên bộ dữ liệu thử nghiệm Supabase cô lập, chưa có kiểm tra Safari iPhone và Android Chrome vật lý.
- GitNexus chưa được cài/chạy index code vì cần xác minh phạm vi giấy phép PolyForm Noncommercial đối với mục đích dùng cho công việc. Ponytail đã được dùng làm nguyên tắc tối thiểu hóa thay đổi (`AGENTS.md`).

## 5. Kết luận và điều kiện phát hành

Hiện bản tối ưu có kiểm chứng được việc giảm truy vấn trùng ở các tình huống đồng thời, và không khác bố cục so với bản gốc ở 50 trường hợp screenshot/mock đã đo.

**Chưa đủ điều kiện để cam kết không có lỗi khi người dùng thật vận hành.** Cần người dùng xem Preview, sau đó thử lưu, sửa, chụp ảnh, lọc, xuất PDF và chuyển dự án bằng tài khoản thử nghiệm trên thiết bị thật; nên có môi trường Supabase staging trước khi merge.

**Quy tắc phát hành: giữ PR #29 Draft, không merge, không promote/deploy production cho đến khi người dùng đồng ý.**
