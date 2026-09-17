# Kế Hoạch Chi Tiết Phát Triển Hệ Thống Quản Trị TechStore (Admin Plan - Flat UI & Minimalist Style)

Tài liệu này xác định lộ trình, các giai đoạn phát triển và danh sách công việc (tasks) chi tiết cho trang Admin của hệ thống TechStore, tuân thủ chính xác tất cả các tiêu chuẩn, tác vụ dữ liệu và phong cách **Flat UI tối giản, hiện đại**.

---

## 🎨 I. Quy Chuẩn Thiết Kế Phong Cách Flat UI & Minimalist (Flat UI Design System)

1. **Triết lý Thiết kế Flat UI Tối giản (Minimalist Flat UI Principles):**
   - **Phẳng 100% (Pure Flat Elements):** Không sử dụng dải màu chuyển dạng phức tạp (Gradients), hiệu ứng kính mờ (Glassmorphic) hay bóng đổ dày (Heavy Shadows).
   - **Màu sắc Đơn sắc & Sắc nét (Solid Colors & Clean Fills):** Sử dụng các khối màu solid chuẩn (`bg-white`, `bg-slate-50`, `bg-blue-600`, `bg-slate-900`) với đường viền mảnh tinh tế (`border border-slate-200`).
   - **Tối ưu Khoảng trắng (Generous Negative Space):** Bố cục thoáng đãng, phân tách khu vực bằng khoảng cách rhythmic spacing thay vì xếp lớp (nested containers).
   - **Typography & Nhãn phẳng (Flat Badges & Sharp Text):** Chữ chuẩn sans-serif sắc nét, các huy hiệu trạng thái dạng phẳng (`bg-emerald-50 text-emerald-700 border border-emerald-200`, `bg-blue-50 text-blue-700 border border-blue-200`).

2. **Thanh trên cùng (Topbar / Top Navigation Bar - Flat Style):**
   - **Nút Thêm mới (+) phẳng:** Nút phẳng màu xanh dương thương hiệu (`bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs`) chứa Dropdown mở rộng tạo nhanh Sản phẩm, Mã giảm giá, Danh mục.
   - **Thanh tìm kiếm toàn cục (Global Search):** Thiết kế viền đơn `border-slate-200` phẳng, nền trắng, icon tối giản.
   - **Chuyển đổi giao diện:** Nút "Trang bán hàng (Store)" màu sắc phẳng, dịu mắt giúp chuyển sang trang người dùng lập tức.
   - **Thông tin Admin & Phiên làm việc:** Hiển thị Avatar phẳng, Tên Admin, Role badge (`Admin`) màu phẳng và nút Đăng xuất.

3. **Bảng Dữ Liệu Phẳng Nhất Quán (Flat Standardized Data Tables):**
   - Bố cục Bảng tối giản: Header xám nhạt (`bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]`), dòng phân cách mảnh 1px (`divide-y divide-slate-100`).
   - Cột thao tác phẳng: Nút Xem chi tiết, Chỉnh sửa nhanh, Chuyển trạng thái và Nút Xóa (kèm Modal xác nhận dạng phẳng tối giản).

---

## 🚀 II. Các Giai Đoạn & Danh Sách Task Công Việc Chi Tiết

### 📍 GIAI ĐOẠN 1: Bảng Tổng Quan (Dashboard) & Topbar Toàn Cục (Flat UI)
> **Mục tiêu:** Cung cấp thông tin thống kê số liệu thô phẳng, dễ quan sát và thanh điều hướng nhanh.

* [x] **Task 1.1: Xây dựng Topbar Toàn Cục Phẳng (Flat Global Topbar)**
  - Tích hợp nút shortcut "+ Thêm mới", thanh tìm kiếm toàn cục, nút "Trang bán hàng (Store)" và thông tin Admin đăng nhập theo phong cách Flat UI.
* [x] **Task 1.2: Phát triển 4 Thẻ Thống Kê Nhanh (Flat Stat Cards)**
  - Nền trắng phẳng (`bg-white border border-slate-200/80 shadow-2xs rounded-2xl p-5`).
  - **Doanh thu:** Tổng tiền đơn hàng thành công (`delivered` + `paid`). Icon xanh phẳng (`bg-emerald-50 text-emerald-600 border border-emerald-100`).
  - **Tổng đơn hàng:** Số lượng đơn hàng mới phát sinh (ngày/tuần). Icon xanh dương phẳng (`bg-blue-50 text-blue-600 border border-blue-100`).
  - **Cảnh báo Tồn kho:** Số sản phẩm/biến thể có `inventory < 5` chiếc. Icon cam phẳng (`bg-amber-50 text-amber-600 border border-amber-100`).
  - **Chờ phê duyệt:** Tổng số đơn hàng hoặc giao dịch VietQR đang ở trạng thái `pending`. Icon tím/xanh phẳng.
* [x] **Task 1.3: Danh Sách Cảnh Báo Tồn Kho & Đơn Hàng Mới (Flat Lists)**
  - Hiển thị bảng thu nhỏ dạng Flat tối giản trực tiếp trên Dashboard để Admin xử lý nhanh.

---

### 📍 GIAI ĐOẠN 2: Quản Lý Sản Phẩm, Biến Thể, Danh Mục & Thương Hiệu
> **Mục tiêu:** Quản lý kho hàng toàn diện (Bảng `products`, `product_variants`, `categories`, `brands`) với giao diện Flat UI.

* [x] **Task 2.1: Quản lý Danh mục (`categories`) & Thương hiệu (`brands`)**
  - Giao diện dạng Bảng phẳng liệt kê Danh mục và Thương hiệu.
  - Thao tác phẳng: Thêm mới, Sửa (tên, logo, slug) và Xóa (kèm popup phẳng xác nhận).
* [x] **Task 2.2: Danh sách & Bộ lọc Sản phẩm (`products`)**
  - Bảng/Grid sản phẩm hiển thị ảnh bìa phẳng, tên, giá bán, tồn kho, danh mục, thương hiệu.
  - Thanh tìm kiếm Tên/Mã sản phẩm + Dropdown lọc phẳng theo `category_id` và `brand_id`.
  - Hỗ trợ Phân trang (Pagination) dạng phẳng.
* [x] **Task 2.3: Chức năng Thêm mới Sản phẩm (Create Product Modal/Page)**
  - Nút **"+ Thêm sản phẩm"** phẳng nổi bật ở góc trên bên phải (`bg-blue-600 text-white rounded-xl`).
  - Form Modal phẳng: Tên, Mô tả, Giá, Số lượng tồn kho, Chọn Danh mục (`category_id`), Chọn Thương hiệu (`brand_id`), Upload / Nhập URL ảnh bìa (`image_url`).
* [x] **Task 2.4: Chỉnh sửa & Xóa / Toggle Trạng thái Sản phẩm**
  - Chỉnh sửa nhanh Giá & Tồn kho trực tiếp tại dòng của Bảng.
  - Form Modal phẳng sửa full thông tin chi tiết.
  - Nút Xóa có Popup xác nhận phẳng HOẶC Switch Toggle phẳng Ẩn/Hiện sản phẩm trên cửa hàng.
* [x] **Task 2.5: Quản lý Biến thể Sản phẩm (`product_variants`)**
  - Tích hợp tab/khu vực danh sách biến thể trong trang chi tiết sản phẩm.
  - Thêm/sửa/xóa từng phiên bản: RAM, SSD, Màu sắc, Giá riêng, SKU, Tồn kho riêng.

---

### 📍 GIAI ĐOẠN 3: Quản Lý Đơn Hàng & Phê Duyệt Vận Hành (Flat Layout)
> **Mục tiêu:** Xử lý vòng đời đơn hàng (`orders`, `order_items`).

* [x] **Task 3.1: Bảng Danh Sách Đơn Hàng Phẳng**
  - Hiển thị các cột: Mã đơn (`ORD-...`), Khách hàng, SĐT, Tổng tiền (`total_amount`), Hình thức thanh toán (`payment_method`), Trạng thái đơn (`status`), Trạng thái thanh toán (`payment_status`).
  - Phân trang & Tìm kiếm phong cách Flat UI.
* [x] **Task 3.2: Bộ Lọc Trạng Thái Đơn Hàng Dạng Tab Phẳng**
  - Phân loại qua Tab phẳng: `Tất cả` / `Chờ xử lý (pending)` / `Đang xử lý (processing)` / `Đang giao (shipped)` / `Đã giao (delivered)` / `Đã hủy (cancelled)`.
* [x] **Task 3.3: Tác Vụ Chuyển Trạng Thái Nhanh**
  - Dropdown/Nút bấm chọn phẳng cập nhật nhanh trạng thái (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`).
* [x] **Task 3.4: Modal Xem Chi Tiết Đơn Hàng Phẳng**
  - Xem danh sách sản phẩm mua (`order_items`), Địa chỉ giao hàng (`shipping_address`), Ghi chú khách hàng và lịch sử thanh toán.

---

### 📍 GIAI ĐOẠN 4: Đối Soát & Phê Duyệt Thanh Toán VietQR / Chuyển Khoản
> **Mục tiêu:** Xác nhận dòng tiền thực nhận (Bảng `payment_transactions`).

* [x] **Task 4.1: Trang/Tab Danh Sách Giao Dịch Thanh Toán Phẳng**
  - Bảng phẳng hiển thị: Mã giao dịch (`transaction_code`), Mã đơn hàng (`order_id`), Số tiền, Cổng thanh toán (`vietqr`, `vnpay`, `momo`), Trạng thái (`pending`, `success`, `failed`).
  - Tìm kiếm theo mã nội dung chuyển khoản / mã đơn.
* [x] **Task 4.2: Thao Tác Phê Duyệt / Từ Chối Đối Soát**
  - **Nút "Xác nhận đã nhận tiền":** Nút phẳng xanh dương/xanh lá (`bg-blue-600 text-white hover:bg-blue-700 rounded-xl`), chuyển trạng thái giao dịch sang `success` và đơn hàng sang `paid`.
  - **Nút "Từ chối":** Nút phẳng đỏ/xám chuyển trạng thái giao dịch sang `failed` khi nhập sai hoặc chưa nhận tiền.

---

### 📍 GIAI ĐOẠN 5: Quản Lý Khách Hàng & Mã Giảm Giá (Flat UI Tables)
> **Mục tiêu:** Quản lý tài khoản người dùng (`users`) và khuyến mãi (`coupons`).

* [x] **Task 5.1: Quản Lý Khách Hàng (`users`)**
  - Bảng danh sách người dùng phẳng: Email, Họ tên, SĐT, Vai trò (`customer`/`admin`), Ngày tạo.
  - Thao tác: Đổi vai trò (Phân quyền Admin/Customer) hoặc Khóa / Kích hoạt tài khoản.
* [x] **Task 5.2: Quản Lý Mã Giảm Giá (`coupons`)**
  - Bảng danh sách mã khuyến mãi phẳng: Mã code, Loại giảm (%), Giá trị giảm, Số lượng mã, Số lượt dùng.
  - Nút **"+ Tạo mã mới"** phẳng: Form nhập Mã code, Loại giảm giá, Giá trị giảm, Số lượng phát hành và Hạn sử dụng.
  - Thao tác Sửa / Xóa mã giảm giá.

---

## 🚦 III. Trạng Thái Hiện Tại & Đợi Lệnh Thực Thi (Code Command)

- 📝 **Tình trạng:** Plan chuẩn phong cách **Flat UI, đơn giản, tối giản** đã được cập nhật hoàn tất tại `/plan/ADMIN_REQUIREMENTS_PLAN.md`.
- ⏳ **Hành động tiếp theo:** Đang tạm dừng và **CHỜ LỆNH CODE** từ phía bạn để bắt đầu triển khai!
