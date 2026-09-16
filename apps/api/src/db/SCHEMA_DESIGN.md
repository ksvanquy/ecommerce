# Báo Cáo Thiết Kế Data Schema - TechStore

Bản báo cáo này mô tả chi tiết kiến trúc Cơ sở Dữ liệu Quan hệ (Relational Database Schema) của nền tảng thương mại điện tử TechStore. Hệ thống sử dụng cơ sở dữ liệu **PostgreSQL** kết hợp với **Drizzle ORM** để định nghĩa mô hình dữ liệu tĩnh bảo mật, hiệu năng cao và có tính toàn vẹn tham chiếu chặt chẽ.

---

## 1. Sơ đồ Quan hệ Thực thể (ASCII ERD)

```text
  +-------------------+
  |       USERS       |
  +-------------------+
  | PK  id            | <-----+
  |     email (UQ)    |       |
  |     full_name     |       |
  |     role          |       |
  +-------------------+       |
            |                 | 1
            | 1               |
            |                 |
            | *               | *
  +-------------------+       +--------------------+
  |      ORDERS       |       |    ORDER_ITEMS     |
  +-------------------+       +--------------------+
  | PK  id            |       | PK  id             |
  | FK  user_id       | ----> | FK  order_id       |
  |     total_amount  |       | FK  product_id     | --+
  |     status        |       |     quantity       |   |
  +-------------------+       |     price          |   |
                              +--------------------+   |
                                                       |
            +------------------------------------------+
            |
            | *
  +-------------------+       +--------------------+
  |     PRODUCTS      | ----> |   PRODUCT_IMAGES   |
  +-------------------+ 1   * +--------------------+
  | PK  id            |       | PK  id             |
  | FK  category_id   | --+   | FK  product_id     |
  | FK  brand_id      |   |   |     image_url      |
  |     price         |   |   +--------------------+
  |     inventory     |   |
  +-------------------+   |   +--------------------+
    * |             * |   |   |  PRODUCT_VARIANTS  |
      |             | |   |   +--------------------+
      |             | |   |   | PK  id             |
      | 1           | |   |   | FK  product_id     |
  +--------+        | |   +-> |     sku (UQ)       |
  | BRANDS |        | |       |     price          |
  +--------+        | |       +--------------------+
  | PK  id |        | |
  +--------+        | |
                    | | *
                    v v
         +--------------------+
         |     CATEGORIES     |
         +--------------------+
         | PK  id             | <---+
         |     slug (UQ)      |     | (Hệ phân cấp Đệ quy)
         | FK  parent_id      | ----+
         +--------------------+
```

---

## 2. Chi Tiết Các Bảng Dữ Liệu (Table Schemas)

### 2.1 Bảng `users` (Quản lý Người Dùng)
Lưu trữ thông tin tài khoản người dùng, bao gồm thông tin cá nhân và vai trò hệ thống.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh duy nhất (UUID/CUID) |
| `email` | `varchar(255)` | `NOT NULL`, `UNIQUE` | Địa chỉ email đăng nhập |
| `password_hash` | `text` | `NOT NULL` | Mật khẩu đã băm (Bcrypt) |
| `full_name` | `varchar(255)` | `NOT NULL` | Họ và tên hiển thị |
| `role` | `varchar(50)` | `NOT NULL`, `DEFAULT 'customer'` | Vai trò (`admin`, `customer`, v.v.) |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm tạo tài khoản |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm cập nhật tài khoản |

### 2.2 Bảng `categories` (Danh Mục Sản Phẩm Đệ Quy)
Thiết kế hỗ trợ danh mục đa cấp thông qua trường `parent_id` tham chiếu ngược đến chính nó.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh danh mục |
| `name` | `varchar(255)` | `NOT NULL` | Tên danh mục |
| `slug` | `varchar(255)` | `NOT NULL`, `UNIQUE` | Chuỗi định danh URL thân thiện |
| `description` | `text` | `NULL` | Mô tả danh mục |
| `parent_id` | `text` | `NULL`, `REFERENCES categories(id)` | Khóa ngoại danh mục cha |
| `icon` | `varchar(100)` | `DEFAULT 'folder'` | Biểu tượng đại diện (Lucide icon key) |
| `level` | `integer` | `NOT NULL`, `DEFAULT 1` | Độ sâu trong cây danh mục |
| `sort_order` | `integer` | `NOT NULL`, `DEFAULT 0` | Thứ tự ưu tiên hiển thị |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm tạo |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm cập nhật |

### 2.3 Bảng `brands` (Nhãn Hiệu)
Lưu trữ thông tin của các hãng sản xuất thiết bị công nghệ.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh nhãn hiệu |
| `name` | `varchar(100)` | `NOT NULL`, `UNIQUE` | Tên hãng |
| `slug` | `varchar(100)` | `NOT NULL`, `UNIQUE` | Đường dẫn tĩnh đại diện |
| `logo_url` | `text` | `NULL` | Liên kết ảnh biểu trưng nhãn hiệu |
| `description` | `text` | `NULL` | Giới thiệu về thương hiệu |
| `website` | `varchar(255)` | `NULL` | Website chính thức |
| `country` | `varchar(100)` | `NULL` | Quốc gia xuất xứ |
| `is_active` | `boolean` | `NOT NULL`, `DEFAULT true` | Trạng thái hiển thị đối tác |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm tạo |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm cập nhật |

### 2.4 Bảng `products` (Sản Phẩm Gốc)
Mô hình lưu trữ thực thể sản phẩm gốc tổng quát.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh sản phẩm |
| `name` | `varchar(255)` | `NOT NULL` | Tên sản phẩm |
| `description` | `text` | `NOT NULL` | Mô tả chi tiết sản phẩm |
| `price` | `integer` | `NOT NULL` | Giá bán gốc (đơn vị nhỏ nhất: VND) |
| `inventory` | `integer` | `NOT NULL`, `DEFAULT 0` | Tổng lượng tồn kho hiện tại |
| `category` | `varchar(100)` | `NOT NULL` | Tên phân loại thô |
| `category_id` | `text` | `NULL`, `REFERENCES categories(id)` | Khóa ngoại danh mục chuẩn hóa |
| `brand_id` | `text` | `NULL`, `REFERENCES brands(id)` | Khóa ngoại nhãn hiệu |
| `image_url` | `text` | `NULL` | Hình ảnh hiển thị đại diện đại diện chính |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm tạo sản phẩm |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm cập nhật sản phẩm |

### 2.5 Bảng `product_images` (Thư Viện Ảnh Sản Phẩm)
Quản lý bộ sưu tập hình ảnh phụ của từng sản phẩm.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh ảnh |
| `product_id` | `text` | `NOT NULL`, `REFERENCES products(id)` `ON DELETE CASCADE` | Khóa ngoại liên kết sản phẩm |
| `image_url` | `text` | `NOT NULL` | Liên kết hình ảnh CDN/Cloud |
| `alt_text` | `varchar(255)` | `NULL` | Văn bản mô tả ảnh (SEO) |
| `is_thumbnail` | `boolean` | `NOT NULL`, `DEFAULT false` | Có phải ảnh thu nhỏ chính không |
| `sort_order` | `integer` | `NOT NULL`, `DEFAULT 0` | Thứ tự sắp xếp ảnh |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm thêm ảnh |

### 2.6 Bảng `product_variants` (Biến Thể Sản Phẩm)
Quản lý các lựa chọn chi tiết của sản phẩm (màu sắc, cấu hình, RAM, SSD) có mức giá và tồn kho riêng.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh biến thể |
| `product_id` | `text` | `NOT NULL`, `REFERENCES products(id)` `ON DELETE CASCADE` | Khóa ngoại liên kết sản phẩm gốc |
| `sku` | `varchar(100)` | `NOT NULL`, `UNIQUE` | Mã đơn vị lưu kho riêng biệt |
| `name` | `varchar(150)` | `NOT NULL` | Tên biến thể cụ thể (VD: "Màu Trắng, 256GB") |
| `color_name` | `varchar(50)` | `NULL` | Tên màu sắc |
| `color_code` | `varchar(20)` | `NULL` | Mã màu HEX để render bảng màu |
| `spec_summary` | `varchar(255)` | `NULL` | Tóm tắt cấu hình kỹ thuật |
| `price` | `integer` | `NOT NULL` | Giá bán của biến thể |
| `original_price` | `integer` | `NULL` | Giá bán gốc trước khuyến mãi (nếu có) |
| `inventory` | `integer` | `NOT NULL`, `DEFAULT 0` | Số lượng tồn kho của biến thể này |
| `image_url` | `text` | `NULL` | Hình ảnh riêng của biến thể |
| `is_default` | `boolean` | `NOT NULL`, `DEFAULT false` | Biến thể mặc định của sản phẩm |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm khởi tạo |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời điểm cập nhật |

### 2.7 Bảng `orders` (Hóa Đơn / Đơn Hàng)
Thông tin tổng quan về đơn hàng, thông tin giao nhận và quá trình thanh toán.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Mã đơn hàng (định danh hiển thị với khách) |
| `user_id` | `text` | `NULL`, `REFERENCES users(id)` | Khóa ngoại tài khoản mua hàng (nếu có) |
| `customer_name` | `varchar(255)` | `NOT NULL` | Tên người nhận hàng |
| `customer_phone` | `varchar(50)` | `NOT NULL` | Điện thoại liên hệ nhận hàng |
| `shipping_address` | `text` | `NOT NULL` | Địa chỉ bàn giao hàng |
| `customer_note` | `text` | `NULL` | Ghi chú từ người đặt |
| `subtotal` | `integer` | `NOT NULL` | Tổng tiền hàng chưa giảm |
| `discount_amount` | `integer` | `NOT NULL`, `DEFAULT 0` | Giá trị giảm trừ khuyến mại |
| `shipping_fee` | `integer` | `NOT NULL`, `DEFAULT 0` | Phí vận chuyển |
| `coupon_code` | `varchar(50)` | `NULL` | Mã giảm giá áp dụng |
| `total_amount` | `integer` | `NOT NULL` | Giá trị đơn cuối cùng phải thu |
| `status` | `varchar(50)` | `NOT NULL`, `DEFAULT 'pending'` | Trạng thái (`pending`, `processing`, `delivered`, `cancelled`) |
| `payment_method` | `varchar(50)` | `NOT NULL`, `DEFAULT 'cod'` | Phương thức thanh toán (`cod`, `banking`, etc.) |
| `payment_status` | `varchar(50)` | `NOT NULL`, `DEFAULT 'unpaid'` | Trạng thái thanh toán (`unpaid`, `paid`, `refunded`) |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời gian tạo giao dịch |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Thời gian cập nhật trạng thái đơn |

### 2.8 Bảng `order_items` (Chi Tiết Đơn Hàng)
Bảng ghi lại trạng thái tĩnh của sản phẩm tại thời điểm mua (bảo toàn lịch sử giá và hình ảnh lúc đặt).

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Định danh mục |
| `order_id` | `text` | `NOT NULL`, `REFERENCES orders(id)` | Liên kết hóa đơn gốc |
| `product_id` | `text` | `NOT NULL`, `REFERENCES products(id)` | Liên kết sản phẩm gốc |
| `product_name` | `varchar(255)` | `NOT NULL` | Tên sản phẩm tại lúc mua |
| `product_image` | `text` | `NULL` | Ảnh sản phẩm tại lúc mua |
| `price` | `integer` | `NOT NULL` | Đơn giá thanh toán |
| `quantity` | `integer` | `NOT NULL` | Số lượng mua |
| `subtotal` | `integer` | `NOT NULL` | Tổng tiền thành phần |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT now()` | Ngày tạo |

---

## 3. Các Mối Quan Hệ Giữa Các Thực Thể (Relations & Integrity)

Sử dụng định nghĩa quan hệ Drizzle (`relations()`), hệ thống kết nối logic liền mạch ở tầng ứng dụng và duy trì tính nhất quán:

1. **Hierarchy (Cây phân cấp Đệ quy)**: 
   - `categories` liên kết `one-to-many` đệ quy (`parentId` -> `id`). Giúp xây dựng cấu trúc danh mục nhiều cấp (ví dụ: Điện thoại -> Smartphone -> iOS).
2. **Products & Inventory**:
   - Một `product` có nhiều hình ảnh (`product_images`) và nhiều biến thể cấu hình cụ thể (`product_variants`).
   - Cấu hình khóa ngoại của `product_images` và `product_variants` có cấu hình `ON DELETE CASCADE` giúp tự động dọn dẹp bộ nhớ đệm và dữ liệu liên quan khi sản phẩm gốc bị xóa.
3. **Purchasing & Order Auditing**:
   - `orders` và `order_items` bảo toàn thông tin tĩnh. Nếu tên sản phẩm gốc thay đổi trong tương lai, `order_items` vẫn giữ nguyên `product_name` và `price` tại thời điểm ký kết thanh toán, phục vụ quá trình đối soát và báo cáo kế toán tài chính tối đa.
