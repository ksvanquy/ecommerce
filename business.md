# 📋 TechStore E-Commerce Business Plan & Database Architecture

> **Tài liệu Kế hoạch Nghiên cứu Chức năng Kế thừa & Kiến trúc Dữ liệu Chuẩn hóa (Data Normalization Plan)**  
> *Dành cho Nền tảng Thương mại Điện tử TechStore (Storefront Web & Admin Portal)*

---

## 🎯 1. Tổng quan Dự án & Phân hệ Ứng dụng (Executive Summary)

Dự án TechStore được xây dựng theo mô hình thương mại điện tử chuyên nghiệp cung cấp các thiết bị công nghệ, bao gồm 2 phân hệ ứng dụng độc lập nhưng chia sẻ chung nền tảng cơ sở dữ liệu và Design System:

1. **Storefront (`apps/web`)**: Ứng dụng web dành cho Khách hàng trải nghiệm mua sắm, duyệt sản phẩm theo thương hiệu/danh mục, xem gallery ảnh đa góc độ, giỏ hàng, thanh toán và theo dõi tiến độ đơn hàng.
2. **Admin Portal (`apps/admin`) (sẽ phát triển sau)**: Hệ thống quản trị dành cho Ban Giám Đốc, Quản lý kho và Nhân viên bán hàng xử lý đơn hàng, nhập xuất kho, quản lý thương hiệu, catalog sản phẩm và xem báo cáo chỉ số doanh thu.

---

## 🗄️ 2. Kế hoạch Chuẩn hóa Cơ sở Dữ liệu (Database Data Normalization)

Để đảm bảo hiệu năng truy vấn, khả năng mở rộng và loại bỏ hoàn toàn dư thừa dữ liệu (Data Redundancy) vi phạm chuẩn hóa CSDL (3NF), hệ thống bổ sung hai thực thể quan trọng: **`brands`** và **`product_images`**.

```
                           ┌──────────────────┐
                           │      BRANDS      │
                           │(Thuộc tính riêng)│
                           └────────┬─────────┘
                                    │ 1
                                    │
                                    │ N
 ┌──────────────────┐ 1           N ┌──────────────────┐ 1           N ┌──────────────────┐
 │    CATEGORIES    ├───────────────┤     PRODUCTS     ├───────────────┤  PRODUCT_IMAGES  │
 │ (Danh mục đa cấp)│               │(Sản phẩm cốt lõi)│               │ (Đa ảnh & Thumbnail)
 └──────────────────┘               └────────┬─────────┘               └──────────────────┘
                                             │ 1
                                             │
                                             │ N
                                    ┌────────┴─────────┐
                                    │ PRODUCT_VARIANTS │
                                    │ (Màu, Dung lượng)│
                                    └──────────────────┘
```

---

### 2.1 Bảng `brands` (Chuẩn hóa Thương hiệu)
**Mục đích:** Tách biệt thông tin thương hiệu sản xuất (Apple, Samsung, Sony, Asus, Dell, Lenovo...) thành một thực thể độc lập. Tránh việc phải lặp lại chuỗi ký tự tên brand, logo, mô tả, website xuất xứ trên từng dòng sản phẩm.

| Cột (Column) | Kiểu Dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả Chi tiết |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` / `TEXT` | `PRIMARY KEY` | Định danh thương hiệu (ví dụ: `brand_apple`, `brand_samsung`) |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Tên thương hiệu hiển thị (ví dụ: `Apple`, `Samsung`) |
| `slug` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Chuỗi URL thân thiện (ví dụ: `apple`, `samsung`) |
| `logo_url` | `TEXT` | `NULLABLE` | Đường dẫn ảnh Logo đại diện thương hiệu |
| `description` | `TEXT` | `NULLABLE` | Bài viết giới thiệu/Lịch sử thương hiệu |
| `website` | `VARCHAR(255)` | `NULLABLE` | Trang web chính thức của hãng |
| `country` | `VARCHAR(100)` | `NULLABLE` | Quốc gia xuất xứ (ví dụ: `Mỹ`, `Hàn Quốc`, `Nhật Bản`) |
| `is_active` | `BOOLEAN` | `DEFAULT true` | Trạng thái hiển thị thương hiệu trên trang chủ |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian khởi tạo record |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật gần nhất |

---

### 2.2 Bảng `product_images` (Quản lý Đa Ảnh & Thumbnail)
**Mục đích:** Cho phép mỗi sản phẩm sở hữu bộ sưu tập gồm nhiều hình ảnh góc chụp chi tiết (Mặt trước, mặt sau, cổng kết nối, hộp phụ kiện). Tách rời thuộc tính ảnh khỏi bảng `products` để đạt chuẩn hóa 1-N.

| Cột (Column) | Kiểu Dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả Chi tiết |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` / `TEXT` | `PRIMARY KEY` | Mã định danh hình ảnh (`img_101`) |
| `product_id` | `TEXT` | `FOREIGN KEY -> products.id` | Liên kết với sản phẩm thuộc về (Cascade Delete) |
| `image_url` | `TEXT` | `NOT NULL` | URL ảnh lưu trữ (CDN / Firebase Storage) |
| `alt_text` | `VARCHAR(255)` | `NULLABLE` | Thẻ Alt SEO mô tả hình ảnh |
| `is_thumbnail` | `BOOLEAN` | `DEFAULT false` | **Đánh dấu Ảnh đại diện chính (Thumbnail)** hiển thị trên Thẻ sản phẩm & Giỏ hàng |
| `sort_order` | `INTEGER` | `DEFAULT 0` | Thứ tự ưu tiên hiển thị trong Slider/Gallery (0, 1, 2...) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Ngày tạo record |

*Quy tắc nghiệp vụ:* Trong một danh sách `product_images` của cùng 1 `product_id`, chỉ có duy nhất 1 bản ghi mang giá trị `is_thumbnail = true`.

---

### 2.3 Bảng `product_variants` (Quản lý Biến thể Sản phẩm — SKU/Màu sắc/Cấu hình)
**Mục đích:** Cho phép 1 sản phẩm chính (ví dụ: *iPhone 15 Pro Max* hoặc *MacBook Pro M3*) có nhiều phiên bản/biến thể thực tế mang mã SKU riêng biệt, tồn kho riêng, màu sắc, cấu hình RAM/SSD và mức giá khác nhau.

| Cột (Column) | Kiểu Dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả Chi tiết |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` / `TEXT` | `PRIMARY KEY` | Mã định danh biến thể (`var_mbp_m3_18_512`) |
| `product_id` | `TEXT` | `FOREIGN KEY -> products.id` | Liên kết với sản phẩm gốc (Cascade Delete) |
| `sku` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Mã quản lý tồn kho duy nhất (ví dụ: `MBP14-M3-18-512-SG`) |
| `name` | `VARCHAR(150)` | `NOT NULL` | Tên biến thể (ví dụ: `Space Gray / 18GB RAM / 512GB SSD`) |
| `color_name` | `VARCHAR(50)` | `NULLABLE` | Tên màu sắc (ví dụ: `Xám không gian`, `Titan Tự Nhiên`) |
| `color_code` | `VARCHAR(20)` | `NULLABLE` | Mã màu Hex hiển thị nút chọn màu (ví dụ: `#53555B`) |
| `spec_summary` | `VARCHAR(255)` | `NULLABLE` | Tóm tắt cấu hình ngắn (`18GB RAM / 512GB SSD`) |
| `price` | `INTEGER` | `NOT NULL` | Giá bán lẻ VNĐ riêng của biến thể này |
| `original_price`| `INTEGER` | `NULLABLE` | Giá niêm yết gốc (chưa giảm) |
| `inventory` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | Số lượng tồn kho khả dụng riêng của SKU này |
| `image_url` | `TEXT` | `NULLABLE` | Ảnh đại diện theo màu sắc/biến thể này |
| `is_default` | `BOOLEAN` | `DEFAULT false` | Đánh dấu phiên bản mặc định được chọn khi người dùng xem trang chi tiết |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Ngày khởi tạo |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Cập nhật gần nhất |

*Quy tắc nghiệp vụ:* Trong một danh sách `product_variants` của 1 `product_id`, chỉ có 1 biến thể mang `is_default = true`. Tổng tồn kho `products.inventory` = Tổng số lượng `inventory` của tất cả các `product_variants` trực thuộc.

---

### 2.4 Bảng `products` (Sản phẩm Cốt lõi — Đã cập nhật)
**Mục đích:** Lưu giữ thông tin định danh sản phẩm chính, được liên kết khóa ngoại với `brand_id` và `category_id`.

| Cột (Column) | Kiểu Dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả Chi tiết |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` / `TEXT` | `PRIMARY KEY` | Mã sản phẩm (ví dụ: `prod_macbook_m3`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên sản phẩm chính (MacBook Pro 14 M3) |
| `slug` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Đường dẫn SEO |
| `brand_id` | `TEXT` | `FOREIGN KEY -> brands.id` | **Khóa ngoại liên kết Thương hiệu** |
| `category_id` | `TEXT` | `FOREIGN KEY -> categories.id` | Khóa ngoại liên kết Danh mục |
| `price` | `INTEGER` | `NOT NULL` | Giá niêm yết tính theo VNĐ |
| `original_price`| `INTEGER` | `NULLABLE` | Giá gốc trước giảm (nếu có) |
| `inventory` | `INTEGER` | `DEFAULT 0` | Tổng số lượng tồn kho khả dụng |
| `description` | `TEXT` | `NOT NULL` | Bài viết mô tả chi tiết sản phẩm |
| `specifications` | `JSONB` | `NULLABLE` | Cấu hình kỹ thuật (RAM, SSD, màn hình, CPU) |
| `status` | `VARCHAR(20)` | `DEFAULT 'ACTIVE'` | Trạng thái: `ACTIVE`, `DRAFT`, `ARCHIVED` |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật |

---

### 2.5 Bảng `categories` (Danh mục đa cấp)
| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Mã danh mục (`cat_laptop`) |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên danh mục (Laptop, Điện thoại) |
| `parent_id` | `TEXT` | `FOREIGN KEY -> categories.id` | Danh mục cha (cho phép đa cấp) |
| `icon_name` | `VARCHAR(50)` | `NULLABLE` | Tên Icon Lucide |

---

### 2.6 Bảng `users` (Quản lý Tài khoản & Phân quyền)
| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Mã người dùng (`usr_1001`) |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Email đăng nhập |
| `password_hash` | `TEXT` | `NOT NULL` | Mật khẩu mã hóa |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên |
| `role` | `VARCHAR(20)` | `DEFAULT 'CUSTOMER'` | Vai trò: `ADMIN`, `STAFF`, `CUSTOMER` |
| `phone` | `VARCHAR(20)` | `NULLABLE` | Số điện thoại liên hệ |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ mặc định |

---

### 2.7 Bảng `orders` & `order_items` (Quản lý Đơn hàng & Chi tiết)

#### Bảng `orders`:
| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Mã đơn hàng (`ORD-8921`) |
| `user_id` | `TEXT` | `FOREIGN KEY -> users.id` | Mã khách hàng |
| `total_amount` | `INTEGER` | `NOT NULL` | Tổng tiền đơn hàng (VNĐ) |
| `status` | `VARCHAR(30)` | `DEFAULT 'PENDING'` | Trạng thái đơn: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPING`, `DELIVERED`, `CANCELLED` |
| `payment_status` | `VARCHAR(30)` | `DEFAULT 'UNPAID'` | Thanh toán: `UNPAID`, `PAID`, `REFUNDED` |
| `payment_method` | `VARCHAR(30)` | `DEFAULT 'COD'` | Phương thức: `COD`, `BANK_TRANSFER`, `QR_CODE` |
| `shipping_address`| `TEXT` | `NOT NULL` | Địa chỉ giao hàng chi tiết |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Ngày đặt hàng |

#### Bảng `order_items`:
| Cột | Kiểu Dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Mã dòng chi tiết |
| `order_id` | `TEXT` | `FOREIGN KEY -> orders.id` | Mã đơn hàng |
| `product_id` | `TEXT` | `FOREIGN KEY -> products.id` | Sản phẩm được mua |
| `quantity` | `INTEGER` | `NOT NULL` | Số lượng mua |
| `unit_price` | `INTEGER` | `NOT NULL` | Đơn giá tại thời điểm mua (VNĐ) |

---

## 🛠️ 3. Phân tích Chức năng Chi tiết (Detailed Functional Breakdown)

### 3.1 Phân hệ Storefront (`apps/web`) — Trải nghiệm Khách hàng
1. **Trang chủ & Khám phá Thương hiệu (Brand Discovery)**:
   - Thanh trượt Logo các thương hiệu lớn (Apple, Samsung, Asus, Dell, Sony).
   - Lọc sản phẩm theo Thương hiệu yêu thích chỉ với 1 cú click.
2. **Trang Danh mục & Bộ lọc Nâng cao (Filtered Catalog)**:
   - Bộ lọc kết hợp: Danh mục x Thương hiệu x Khoảng giá VNĐ.
   - Sắp xếp: Giá tăng/giảm, Mới nhất, Bán chạy nhất.
3. **Trang Chi tiết Sản phẩm & Bộ sưu tập Đa ảnh (Product Gallery)**:
   - Hiển thị Ảnh đại diện Thumbnail chính từ `product_images` (với `is_thumbnail = true`).
   - Gallery hình ảnh linh hoạt: Click thumbnail phụ để đổi ảnh chính, phóng to ảnh.
   - Thông số kỹ thuật từ `products.specifications` hiển thị dạng bảng chuẩn Design System `slate-200`.
4. **Giỏ hàng & Đặt hàng (Cart & Checkout)**:
   - Thêm vào giỏ trượt `CartDrawer` tức thì.
   - Form thanh toán nhận diện địa chỉ giao hàng và tự động áp dụng mã giảm giá.
5. **Quản lý Đơn hàng Cá nhân (Customer Orders Portal)**:
   - Xem danh sách đơn hàng đã đặt kèm Badge trạng thái chuẩn (`PENDING`, `SHIPPING`, `DELIVERED`).

---

### 3.2 Phân hệ Admin Portal (`apps/admin`) — Quản trị & Điều hành

1. **Quản lý Thương hiệu (Brand Management Module)**:
   - **Xem danh sách Brands**: Bảng dữ liệu `AdminDataTable` hiển thị Tên, Logo, Số lượng sản phẩm trực thuộc.
   - **Tạo/Sửa/Xóa Thương hiệu**: Form tải lên URL Logo, mô tả, website.
2. **Quản lý Sản phẩm & Đa ảnh (Media & Product Management)**:
   - **Tạo mới / Chỉnh sửa Sản phẩm**: Chọn Thương hiệu từ danh sách chọn (Select Dropdown `brands`).
   - **Quản lý Bộ sưu tập Ảnh (`product_images`)**:
     - Đăng tải nhiều ảnh cho 1 sản phẩm.
     - Nút đánh dấu **"Đặt làm Ảnh đại diện (Thumbnail)"** gửi request cập nhật `is_thumbnail = true`.
     - Kéo thả / Đổi thứ tự sắp xếp `sort_order`.
3. **Xử lý Đơn hàng & Tiến độ Giao hàng (Order Fulfillment)**:
   - Duyệt đơn hàng mới nhận.
   - Chuyển trạng thái đơn: `Chờ xác nhận` ➔ `Đã xác nhận` ➔ `Đang đóng gói` ➔ `Đang giao` ➔ `Đã giao`.
4. **Quản lý Tồn kho & Cảnh báo Hết hàng (Inventory & Stock Alerts)**:
   - Theo dõi số lượng tồn kho từng sản phẩm (`inventory`).
   - Nhãn hiển thị màu sắc cảnh báo: Đỏ (`Hết hàng`), Vàng (`Chỉ còn <= 10 cái`), Xanh (`Tồn kho an toàn`).
5. **Báo cáo & Chỉ số Kinh doanh (Analytics & Dashboard)**:
   - Thống kê Tổng doanh thu VNĐ theo ngày/tháng.
   - Biểu đồ tỷ trọng doanh số đóng góp theo từng Thương hiệu (Brand Performance).

---

## 🚀 4. Kế hoạch Triển khai Codebase & Migration (Technical Roadmap)

### Bước 1: Nâng cấp Drizzle Schema (`/apps/api/src/db/schema/`)
- Tạo file `brands.ts` định nghĩa `brandsTable`.
- Tạo file `productImages.ts` định nghĩa `productImagesTable`.
- Cập nhật `products.ts` thêm `brandId` tham chiếu đến `brandsTable.id`.
- Cập nhật `relations.ts` thiết lập mối quan hệ 1-N giữa `brands -> products` và `products -> product_images`.

### Bước 2: Khởi tạo Dữ liệu Mẫu (Seeding Script)
- Cập nhật `/apps/api/src/init-db.ts` tự động chèn 6 thương hiệu chuẩn (Apple, Samsung, Asus, Dell, Sony, Logitech).
- Gắn `brand_id` tương ứng cho các sản phẩm hiện có.
- Khởi tạo bộ dữ liệu đa ảnh `product_images` mẫu cho từng sản phẩm.

### Bước 3: Cập nhật API Endpoints (`/apps/api/src/routes/`)
- Expose Router `/api/brands` (CRUD Thương hiệu).
- Expose Router `/api/products/:id/images` (Quản lý đa ảnh & thumbnail).
- Cập nhật Router `/api/products` hỗ trợ query param `?brandId=xxx`.

### Bước 4: Tích hợp Giao diện Storefront (`apps/web`) & Chuẩn bị Admin (`apps/admin`)
- Cập nhật `ProductCard.tsx` & `ProductDetailView.tsx` để render bộ ảnh thực tế từ `product_images` và logo từ `brands`.
- Xây dựng các Component Admin Dense (`AdminDataTable.tsx`, `AdminSidebar.tsx`) sẵn sàng lắp ráp cho Admin Portal.

---
*Tài liệu Kế hoạch Nghiên cứu Chức năng & Chuẩn hóa Dữ liệu được phê duyệt làm căn cứ phát triển hệ thống TechStore.*
