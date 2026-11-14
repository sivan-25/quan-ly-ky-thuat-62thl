# Tích hợp Backblaze B2 cho ESTA (bản chuẩn bị, chưa bật trên Production)

## Kiến trúc
- **Supabase hiện hữu:** xác thực ESTA, phân quyền theo tòa nhà, bảng công việc, sự cố, bảo trì, chỉ số và các tham chiếu ảnh. Không thay đổi schema/RLS.
- **Backblaze B2:** lưu ảnh **mới** vào private bucket dưới dạng JPEG. Ảnh cũ có tham chiếu `storage:` vẫn đọc từ Supabase.
- **Vercel:** endpoint `/api/b2-media` ký các yêu cầu B2 bằng thông tin bí mật phía máy chủ, kiểm tra token Supabase và quyền truy cập dự án. Client không nhìn thấy B2 Application Key.
- **Tham chiếu ảnh mới:** `b2:b-<hex-project-id>/<kind>/<record-id>/<timestamp>-<uuid>.jpg`; phân biệt với `storage:` cũ.
- **Các luồng ảnh:** công việc, năng lượng, ảnh trước/sau sự cố và bảo trì; tải ảnh về, hiển thị, xóa và đưa vào báo cáo PDF.

## Chuẩn bị trên Backblaze (do chủ tài khoản thực hiện)

1. Đăng ký/đăng nhập Backblaze B2, kiểm tra điều kiện gói miễn phí và yêu cầu xác minh hiện hành.
2. Tạo **Private Bucket**, ví dụ `esta-private-images`. Không tạo Public Bucket cho ảnh vận hành.
3. Tạo **Application Key giới hạn đúng bucket**, với quyền đọc, ghi và xóa đối tượng. Không dùng master key.
4. Chép thông tin `region`, `bucket name`, `key ID`, `application key` vào nơi lưu bí mật an toàn; **không gửi lên GitHub, không dán vào chat hoặc tệp HTML/JS**.
5. Trong Vercel > Project ESTA > Settings > Environment Variables, tạo (Production và môi trường kiểm thử phù hợp):
   - `ESTA_B2_REGION` — ví dụ `us-west-004` (sử dụng **region thật** của bucket)
   - `ESTA_B2_BUCKET` — tên private bucket
   - `ESTA_B2_KEY_ID` — Key ID
   - `ESTA_B2_APPLICATION_KEY` — Application Key (đánh dấu Sensitive nếu được hỗ trợ)
   - `ESTA_B2_ENABLED` — đặt `false` khi cấu hình/kiểm thử, đổi thành `true` **chỉ sau khi thử thành công**
6. Triển khai lại bản kiểm thử sau khi cấu hình biến môi trường. Không thay Production cho tới khi được duyệt.

## Quy tắc an toàn

- Nếu B2 **chưa cấu hình hoặc chưa bật**, ảnh mới vẫn gửi lên Supabase hiện hữu; không gây mất ảnh đã lưu.
- Nếu `ESTA_B2_ENABLED=false` nhưng vẫn giữ nguyên thông tin truy cập B2, API **tiếp tục đọc ảnh cũ trên B2**; chỉ dừng upload mới.
- Nếu xóa toàn bộ biến môi trường/key, ảnh B2 không đọc được đến khi khôi phục cấu hình.
- Giới hạn upload JPEG: 3,5 MB/ảnh do giới hạn request serverless; ảnh được client thu nhỏ cạnh dài 1600px, chất lượng 85%.
- B2 có ngưỡng lưu trữ miễn phí và có thể áp dụng các giới hạn/chi phí khác. Theo dõi dung lượng và lượng tải xuống, **không giả định hệ thống sẽ tự ngăn tính phí**.
- Không tự ý xóa/di chuyển ảnh gốc Supabase. Chỉ cân nhắc chuyển dữ liệu cũ sau khi đối chiếu số lượng, checksum, khôi phục và có bản sao dự phòng.

## Kiểm tra trước khi bật chính thức

- [ ] Test GET `/api/b2-media?status=1` báo `enabled:true` trên bản kiểm thử sau khi cấu hình
- [ ] Người có quyền sửa của đúng tòa nhà lưu được ảnh mới; người chỉ xem không tải lên/xóa được
- [ ] Ảnh mới hiện đúng trên danh sách, ảnh lớn, tải ảnh về và bản xuất PDF
- [ ] Thử ảnh công việc, điện nước, sự cố trước/sau, bảo trì trước/sau trên iPhone và máy tính
- [ ] Đăng nhập dự án khác không đọc được ảnh B2 của dự án này
- [ ] Ảnh Supabase cũ vẫn xem được; tải xuống và PDF không thay đổi
- [ ] Chỉnh sửa, xóa và thử lại khi mạng yếu không làm mất ảnh cũ
- [ ] Test hệ thống: `npm test` và `python3 -m unittest discover -s tests -v`
- [ ] Xác minh hóa đơn/ngưỡng miễn phí, theo dõi thực tế trước khi đưa vào Production

## Khôi phục

Giữ nguyên biến `ESTA_B2_REGION`, `ESTA_B2_BUCKET`, `ESTA_B2_KEY_ID` và `ESTA_B2_APPLICATION_KEY`; đổi `ESTA_B2_ENABLED=false`, sau đó redeploy. Ảnh mới quay lại Supabase; ảnh B2 đã lưu vẫn xem được. Có thể revert riêng nhánh mã nguồn khi chắc chắn không còn bản ghi `b2:` cần xem, nếu không sẽ làm gián đoạn ảnh B2.
