# ESTA — Đánh giá UX cho kỹ thuật viên sử dụng lần đầu

Ngày: 10/10/2026
Phiên bản: nhánh `optimize-esta-safe` (PR #29, chưa merge)
Phương pháp: headless Chromium tại 390×844 và 1440×900, kỹ thuật viên **giả lập** có quyền `editor` cho 130HH; thêm kịch bản kỹ thuật viên được cấp hai dự án 130HH và 62THL. Chặn toàn bộ kết nối mạng ngoài localhost, không đăng nhập bằng tài khoản thật và không ghi dữ liệu Supabase.

**Bằng chứng:** [GitHub Actions — kết quả chạy thành công](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38020221977) · [14 ảnh và JSON ghi nhận thao tác](https://github.com/sivan-25/quan-ly-ky-thuat-62thl/actions/runs/38020221977/artifacts/11657164839).

## Hành trình đã thao tác

1. Mở trang đăng nhập; giả lập chuyển vào tài khoản kỹ thuật editor của 130 Hồng Hà.
2. Xác nhận nhãn `Kỹ thuật viên · 130HH`, Tổng quan dự án hiện đúng, menu Admin ẩn.
3. Chuyển sang Công việc, nhập nội dung và bấm Lưu khi chưa có danh sách người thực hiện.
4. Đưa một nhân sự **giả** vào bộ nhớ browser, chọn người thực hiện, chọn trạng thái `Đã hoàn thành`, nhập KQ trên màn hình mobile.
5. Bấm Lưu trong môi trường **không có phiên máy chủ** và quan sát thông báo/danh sách/localStorage.
6. Lặp lại phần chính trên desktop 1440 px.
7. Giả lập tài khoản được phân quyền hai dự án; chuyển từ 130HH sang 62THL và kiểm tra context.

## Điểm hoạt động tốt

- Non-admin `editor` tự mở dự án được cấp quyền; không hiện menu Admin.
- Kỹ thuật viên một dự án không bị bắt chọn lại dự án; tài khoản hai dự án có bộ chọn và đổi context 130HH → 62THL đúng.
- Giao diện có cảnh báo khi chưa chọn người thực hiện; trên mobile khi Hoàn thành có KQ nhanh, không ép ghi chú.
- Quy trình có thao tác chọn ảnh/chụp ảnh, nhưng **chưa dùng camera vật lý hay Supabase Storage**, không coi là đã test end-to-end.

## Phát hiện và đề xuất theo ưu tiên

### P0 — Phân biệt “lưu tạm” với “đã đồng bộ”

**Đã quan sát:** trên màn hình 390 px, sau khi nhập dữ liệu giả, chọn Kỹ thuật A, hoàn thành và nhấn Lưu với `centralSession=null`, task vẫn được lưu tại localStorage và xuất hiện trong danh sách, toast trong lần chạy báo `Đã lưu công việc và cập nhật vật tư`. Không có yêu cầu nào được phép gửi tới Supabase. Trong `demo-lab.js`, kết quả `syncTaskRecord(...)` có thể là `null` khi không có token nhưng nhánh xử lý vẫn đi tiếp.

**Rủi ro:** kỹ thuật viên có thể hiểu lầm server đã ghi nhận báo cáo trong khi mới lưu trên thiết bị. Kiểm tra bổ sung cần cover token hết hạn, HTTP 401/403/500, mạng ngắt giữa chừng, và điều kiện tránh công việc trùng khi retry.

**Phương án:** riêng biệt trạng thái `Đang lưu → Đã đồng bộ` chỉ khi server trả thành công; nếu không có xác nhận thì hiển thị `Lưu tạm trên máy / Chờ đồng bộ`, cho phép thử lại có khóa idempotent; không xóa draft khi chưa đồng bộ. Không sửa schema.

### P1 — Nhân sự và người thực hiện của người mới

**Đã quan sát:** ở dự án không có `building_people` giả lập, dòng `Chưa có người thực hiện` rất mờ; Lưu bị chặn, người dùng phải chọn Quản lý hoặc Chỉnh sửa danh sách. Kỹ thuật viên editor có quyền vào giao diện thêm/xóa tên. Cần thống nhất phạm vi quyền quản lý nhân sự.

**Phương án:** khi tài khoản trùng tên người thực hiện trong danh sách, tự chọn tôi; nếu danh sách rỗng thì hiển thị rõ `Chưa có nhân sự — yêu cầu Admin thiết lập hoặc thêm tên theo quyền`. Không tự tạo bản ghi nhân sự mới không có phê duyệt.

### P1 — Đường đi tìm việc được giao và form lưu trên mobile

**Đã quan sát:** sau khi vào Công việc, form **Thêm công việc** chiếm màn hình đầu. Ở viewport 390×844, nút Lưu nằm khoảng `top:877px`, thấp hơn viewport `844px`, phải cuộn. Danh sách công việc nằm phía dưới mẫu nhập.

**Phương án:** ưu tiên tab `Việc của tôi/Hôm nay` và danh sách trước, `+ Thêm công việc` mở form khi cần; hoặc giữ bố cục nhưng đặt hành động Lưu cố định khi nhập/hoàn thành. Hai hướng cần người dùng chọn, không tự đổi UI.

### P1 — Trải nghiệm hoàn thành trên desktop không nhất quán với mobile

**Đã quan sát:** mobile tạo ô `KQ thực hiện` ngay gần trường trạng thái; desktop sử dụng `#demoTaskResult` ở nhóm liên kết bổ sung. Bấm Lưu trên desktop mà chưa nhập KQ sẽ xuất hiện `Vui lòng nhập KQ thực hiện` và focus đến vùng bổ sung. Với người mới, dễ tưởng đã nhập đủ trường ở hàng trên.

**Phương án:** cùng một logic KQ bắt buộc khi hoàn thành nhưng hiển thị ngay gần Trạng thái/Nội dung trên cả hai giao diện, Ghi chú vẫn không bắt buộc. Không trùng hai ô KQ và không tự nhảy scroll.

### P2 — Thuật ngữ và tín hiệu dữ liệu cho người mới

**Đã quan sát:** màn Tổng quan kỹ thuật hiện `PM, SLA, Work Order, Asset Health, Technical Health 100, Live Data` cùng nhiều KPI trong viewport đầu. Khi dữ liệu giả lập rỗng, điểm health vẫn là 100. Cần kiểm chứng cách tính và ý nghĩa “live” ở trạng thái offline để tránh ngộ nhận.

**Phương án:** chuyển sang nhãn dễ hiểu như `Bảo trì, Đúng hạn, Công việc, Tình trạng thiết bị`; nếu chưa đủ dữ liệu, thay health score bằng `Chưa đủ dữ liệu`, phân biệt `Đang cập nhật / Dữ liệu cũ / Mất mạng`. Chỉ làm sau khi thống nhất thuật ngữ.

### P2 — Đọc chữ và khám phá chức năng

Các nhãn bổ sung khá nhỏ trên desktop; trên mobile phần hướng dẫn danh sách người thực hiện rỗng rất nhạt. Một số chức năng có trong menu bên, nhưng người mới nhìn bottom bar có thể không biết vị trí Kho vật tư, Nhà thầu và Báo cáo. Đề xuất tăng tương phản và nhóm menu theo mục đích, giữ màu chủ đạo ESTA.

## Mục chưa được xác minh

- Không đăng nhập vào Supabase production; không thực hiện CRUD thật, không test permission RLS ở server.
- Không thử camera iOS/Android, chỉnh ảnh, upload Storage, xuất PDF thật theo tài khoản kỹ thuật. Những phần này chỉ có các regression/fixture riêng, chưa được nghiệm thu hành trình kỹ thuật viên.
- Thời gian thao tác thực tế và độ trễ mạng chưa được đo ở tài khoản thật.
- Không cấp thêm nguồn lực tốn phí, không tạo Supabase staging, không merge/deploy production.

## Đề xuất kế hoạch phối hợp

Giai đoạn A — **An toàn dữ liệu (P0):** thống nhất trạng thái Offline/Lưu tạm, xác nhận server, retry không trùng, test mock các lỗi 401/500. Ưu tiên trước mọi cải tiến trang trí.

Giai đoạn B — **Công việc của kỹ thuật viên (P1):** chốt cách trình bày Việc của tôi/Thêm việc, tự chọn người thực hiện nếu hợp lệ, đặt KQ nhất quán mobile/desktop. So sánh ảnh trước/sau và duy trì quy trình hiện có.

Giai đoạn C — **Khả năng đọc và hướng dẫn (P2):** làm rõ ngôn ngữ, độ tương phản, menu. Xem demo trước khi áp dụng.

**Toàn bộ chỉ là đánh giá và đề xuất. Không có thay đổi runtime/web production nào được thực hiện trong nghiên cứu này.**
