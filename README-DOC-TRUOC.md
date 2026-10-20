# ESTA | Bộ mã nguồn Dụng cụ - Vật tư để gửi Claude

**Nguồn:** https://github.com/sivan-25/quan-ly-ky-thuat-62thl
**Phiên bản production:** a0e104840e103674034b836a58d3c566e5beb22d
**Ngày lấy:** 20/10/2026
**Nội dung:** đúng hai tab `Vật tư tiêu hao`, `Dụng cụ kỹ thuật`, toàn bộ giao diện nhập/xuất/tồn, giao dịch kho, popup và CSS/JS phụ thuộc.

## Mở theo thứ tự này
1. `BAT-DAU/01-giao-dien-2-tab.html` — DOM của toàn trang `#inventoryPage`, có 2 tab và danh sách.
2. `BAT-DAU/02-3-popup-nhap-xuat-them-sua.html` — form thêm/sửa vật tư, nhập/xuất và thêm/sửa dụng cụ.
3. `BAT-DAU/03-logic-vat-tu-dung-cu.js` — đoạn logic Vật tư trong `app.js`. **Không chạy độc lập**.
4. `02-CSS-VAT-TU/inventory-mobile-cards.css` — quan trọng nhất cho mobile và layout 130 Hồng Hà áp dụng 4 dự án.
5. `02-CSS-VAT-TU/inventory-mobile-no-scroll.css` — tránh tràn ngang/cách hiển thị dạng thẻ.
6. `01-MA-NGUON-DAY-DU/index.html`, `01-MA-NGUON-DAY-DU/app.js` — nguồn gốc ĐẦY ĐỦ, cần cho sửa mã.
7. `03-CSS-TOAN-CUC/`, `04-JS-LIEN-QUAN/` — CSS/JS ảnh hưởng thực tế (nhiều lớp selector và `!important`).
8. `05-KIEM-THU/` — kiểm thử regression liên quan.
9. `PROMPT-GUI-CLAUDE.md` — yêu cầu thiết kế viết sẵn.

**Lưu ý:** Các tệp trong `BAT-DAU` chỉ là trích đoạn có thật từ nguồn để dễ đọc. Không thay trực tiếp `app.js` hoặc `index.html` bằng đoạn trích. Các tệp gốc giữ nguyên tên và code trong folder `01-MA-NGUON-DAY-DU`.

Các selector quan trọng:
- Cả trang: `#inventoryPage`
- Hai tab: `[data-inventory-tab="materials"]`, `[data-inventory-tab="tools"]`
- Vật tư: `#inventoryMaterialsPane`, `#materialMobileCards`, `#materialInventoryTable`, `#materialMonthTabs`
- Dụng cụ: `#inventoryToolsPane`, `#toolItemForm`, `#toolItemModal`
- Form nhập/xuất: `#stockTxnForm`, `#stockTxnModal`
- Thêm/sửa vật tư: `#materialItemForm`, `#materialItemModal`

**An toàn:** Mã nguồn công khai; không chứa file cấu hình bí mật, bản sao dữ liệu Supabase, token người dùng hay file font. Không có thao tác nào của bộ bàn giao này thay đổi production.

**Dữ liệu 4 dự án:** 68PĐL, 62THL, 127HH, 130HH. Dùng chung code, dữ liệu phân tách theo `building_id`.