# Báo cáo Audit & Kế hoạch Phát triển Web Khách hàng Tiêu chuẩn (TechStore)

Tài liệu này định hướng chiến lược phát triển ứng dụng web thương mại điện tử **dành riêng 100% cho người mua hàng (Customer Storefront)**: chuẩn hóa tính năng cốt lõi, thiết kế giao diện công thái học (ergonomic & intuitive), đồng thời **tách biệt và loại bỏ hoàn toàn các tính năng Quản trị viên (Admin Portal) cùng các thành phần debug dư thừa** ra khỏi web khách hàng để phát triển thành hệ thống Back-office độc lập.

---

## 1. Định hướng Tách biệt Admin Portal (Decoupling Strategy)

> **Nguyên tắc cốt lõi**: Khách hàng mua sắm không bao giờ nhìn thấy hoặc tương tác với bất kỳ tính năng quản trị nào (quản lý cây danh mục, phân quyền admin, duyệt đơn hệ thống, quản lý kho...).
>
> - **Web App (`apps/web`)**: Trở thành **100% Customer-facing Storefront** thuần túy, mượt mà và bảo mật.
> - **Admin Back-office**: Được tách riêng thành một dự án / bảng điều khiển nội bộ độc lập (Internal Admin Dashboard / Back-office App), không nhúng lẫn vào giao diện của khách hàng.

---

## 2. Kết quả Audit Hiện trạng Codebase (Findings & Deficiencies)

Sau khi kiểm toán toàn diện mã nguồn hiện tại, hệ thống xác định các thành phần cần loại bỏ khỏi web:

### 2.1. Loại bỏ các thành phần Admin khỏi Web Khách hàng
1. **Module Quản trị danh mục (`AdminCategoryManagement.tsx`)**:
   - *Hiện trạng*: Được nhúng trực tiếp vào trang thông tin cá nhân (`AuthView.tsx`) với nút chuyển tab "Quản trị Danh mục & Mục con".
   - *Quyết định*: **Loại bỏ hoàn toàn khỏi Web khách hàng**. Giao diện này sẽ được chuyển sang phân hệ Admin riêng biệt.
2. **Các huy hiệu, tab và điều kiện Admin trong `AuthView.tsx`**:
   - *Hiện trạng*: Kiểm tra `user.role === 'admin'` để hiển thị "Chế độ Quản trị", nút "Quản trị Danh mục Con", huy hiệu "Quản trị viên VIP 🛡️".
   - *Quyết định*: Tối giản trang tài khoản thành **Hồ sơ Khách hàng Thân thiết (Member Profile)**: quản lý thông tin nhận hàng, lịch sử mua sắm và bảo hành.

### 2.2. Loại bỏ các thành phần Rác & Debug (Visual & Code Bloat)
1. **Nút "Xem JSON API" trong trang chi tiết sản phẩm (`ProductDetailView.tsx:301-329`)**:
   - *Hiện trạng*: Nút bật/tắt toàn bộ cục JSON payload trả về từ backend với khối code màu đen (`bg-slate-950`).
   - *Quyết định*: **Xóa bỏ hoàn toàn**, bảo đảm giao diện mua sắm sạch đẹp, chuyên nghiệp.
2. **Khối Header phình to (`Header.tsx` hơn 620 dòng code)**:
   - *Hiện trạng*: Chứa cả Mega-Menu đa tầng 3 cấp cồng kềnh với các event listener toàn cục dễ gây giật lag.
   - *Quyết định*: Tinh giản Header về 4 thành phần tiêu chuẩn: **Logo thương hiệu** | **Thanh tìm kiếm tức thì (Search)** | **Giỏ hàng (Cart Drawer)** | **Tài khoản Khách hàng**.
3. **Thống kê doanh thu kiểu Admin trong trang Lịch sử đơn hàng (`OrderHistoryView.tsx`)**:
   - *Hiện trạng*: 4 thẻ metric "Tổng đơn", "Chờ xử lý", "Giao thành công", "Tổng thanh toán" giống giao diện kế toán/quản trị.
   - *Quyết định*: Thay bằng danh sách thẻ đơn hàng trực quan, dễ hiểu, kèm nút hủy đơn cho khách khi đơn mới tạo.
4. **Widget Demo Account trong Form đăng nhập (`LoginForm.tsx`)**:
   - *Hiện trạng*: Nút "Admin demo" và "Customer demo" chiếm diện tích lớn.
   - *Quyết định*: Tinh gọn thành form đăng nhập chuẩn UX: Email + Mật khẩu.

---

## 3. Bản thiết kế Web Khách hàng Chuẩn mực (Customer Storefront Standards)

### 3.1. Dòng giá trị Mua sắm Tinh gọn (Frictionless Funnel)
```
[Khám phá Sản phẩm] ──(Lọc Pills & Tìm kiếm tức thì)──> [Chi tiết Sản phẩm]
         │                                                        │
         └─────────────(1-Click Thêm vào giỏ)─────────────────────┘
                                  │
                          [Mini Cart Drawer]
                                  │
                    [Thanh toán 1 Trang (One-Page)]
                       - Khách vãng lai (Guest)
                       - Thành viên có tài khoản
                                  │
                    [Đặt hàng thành công & Mã vận đơn]
```

### 3.2. Tiêu chuẩn Giao diện & Trải nghiệm (UI/UX Standards)
- **Bảng màu (Palette)**: Nền sáng nhẹ nhàng (`bg-slate-50`, `bg-white`), tương phản cao (`text-slate-900`), điểm nhấn xanh hiện đại (`indigo-600` / `blue-600`).
- **Typography**: Không dùng font kiểu cách; dùng sans-serif hệ thống dễ đọc, body text 15-16px, line-height 1.5 - 1.6.
- **Thao tác một tay trên Mobile**: Touch targets $\ge$ 44px, thanh điều hướng đáy (Bottom Navigation Bar) và nút Mua hàng dính đáy (Sticky CTA) khi xem sản phẩm trên điện thoại.
- **Tính toàn vẹn dữ liệu**: Toàn bộ thao tác tạo đơn hàng và trừ kho được bảo vệ bằng **PostgreSQL ACID Transaction** (`db.transaction`).

---

## 4. Bảng đối chiếu Thành phần (De-cluttering Mapping)

| Thành phần | Trước khi tinh lọc | Sau khi tinh lọc chuẩn khách hàng |
| :--- | :--- | :--- |
| **Admin Module** | Nhúng `AdminCategoryManagement` trong `AuthView.tsx` | **Loại bỏ 100% khỏi Web**. Tách ra phát triển phân hệ Admin riêng |
| **Trang Chi tiết Sản phẩm** | Có nút debug "Xem JSON API" và thẻ `<pre>` | Xóa bỏ nút JSON, giữ bảng thông số sản phẩm thẩm mỹ |
| **Thanh điều hướng (Header)** | Mega-menu 3 tầng > 600 dòng code | Header tinh gọn: Logo, Search, Cart Trigger, User Portal |
| **Bộ lọc Danh mục** | Dropdown cồng kềnh lồng ghép | Thanh cuộn Pills/Chips ngang trực quan (All, Laptops, Audio...) |
| **Lịch sử Đơn hàng** | 4 thẻ thống kê dashboard admin | Danh sách đơn hàng phẳng, theo dõi trạng thái giao hàng rõ ràng |
| **Đăng nhập / Đăng ký** | Giao diện lộ rõ nút bấm Demo | Form đăng nhập chuẩn UX quốc tế, bảo mật và gọn gàng |

---

## 5. Lộ trình Hành động Chi tiết (Actionable Roadmap)

### Giai đoạn 1: Thanh lọc Admin & Rác Debug khỏi Web Khách hàng
- [x] Gỡ bỏ `AdminCategoryManagement` và các điều kiện `user.role === 'admin'` khỏi `AuthView.tsx`.
- [x] Xóa bỏ khối "Xem JSON API" khỏi `ProductDetailView.tsx`.
- [x] Tinh giản `Header.tsx`: Giữ logo, ô tìm kiếm, giỏ hàng và tài khoản khách hàng.
- [x] Chuyển bộ lọc danh mục tại `ProductFiltersBar.tsx` sang dạng Category Pills thanh lịch.

### Giai đoạn 2: Tối ưu Trải nghiệm Mua sắm & Thanh toán Không Ma sát
- [ ] Tối ưu hóa Slide-over Cart Drawer: Thao tác tăng/giảm số lượng mượt mà, hiển thị tổng tiền minh bạch.
- [ ] Chuẩn hóa One-Page Checkout: Cho phép Guest Checkout chỉ với 3 trường (Họ tên, SĐT, Địa chỉ nhận hàng).
- [ ] Kiểm tra giao dịch đặt hàng PostgreSQL ACID Transaction không bị over-selling.

### Giai đoạn 3: Chuẩn hóa Trang Cá nhân & Theo dõi Đơn hàng của Khách
- [ ] Làm mới `OrderHistoryView.tsx`: Bỏ các chỉ số dashboard, tập trung hiển thị tiến trình đơn hàng (Chờ xử lý $\rightarrow$ Đang đóng gói $\rightarrow$ Đang giao $\rightarrow$ Đã giao).
- [ ] Cho phép khách hàng tự hủy đơn hàng khi đơn còn ở trạng thái `pending`.
- [ ] Trang thông tin tài khoản thành viên tinh gọn (địa chỉ mặc định, số điện thoại lưu sẵn).

### Giai đoạn 4: Tối ưu Tốc độ, Responsive & Kiểm định
- [ ] Tối ưu responsive trên Mobile (375px), Tablet (768px), Desktop (1280px+).
- [ ] Chạy static code analysis `npm run lint` (`tsc --noEmit`) và `compile_applet`.
