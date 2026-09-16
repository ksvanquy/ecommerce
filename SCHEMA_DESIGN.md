# Sơ đồ thiết kế Cơ sở dữ liệu (Database Schema Design) — TechStore

Tài liệu này mô tả chi tiết kiến trúc cơ sở dữ liệu quan hệ PostgreSQL của dự án TechStore. Hệ thống sử dụng **Drizzle ORM** để định nghĩa mô hình dữ liệu đồng bộ với TypeScript, đảm bảo tính toàn vẹn và hiệu năng tối đa.

---

## 📊 Sơ đồ Quan hệ Thực thể Chi tiết (Detailed Entity-Relationship Diagram)

```text
                               +--------------------+
                               |   USER_ADDRESSES   |
                               +--------------------+
                               | PK  id             |
                               | FK  user_id        | ----> USERS (1:N)
                               |     receiver_name  |
                               |     receiver_phone |
                               |     province       |
                               |     district       |
                               |     ward           |
                               |     street_address |
                               +--------------------+
                                         ^
                                         | 1
                                         |
                                         | *
                               +-------------------+
                               |       USERS       |
                               +-------------------+
                               | PK  id            | <-------------------+
                               |     email (UQ)    |                     |
                               |     full_name     |                     |
                               |     role          |                     |
                               +-------------------+                     |
                                 |        |      |                       |
            +--------------------+        |      +--------------+        |
            | 1                           | 1                   | 1      | 1
            |                             |                     |        |
            | *                           | *                   | *      | *
  +-------------------+         +-------------------+         +-------------+
  |       CARTS       |         |      ORDERS       |         |   REVIEWS   |
  +-------------------+         +-------------------+         +-------------+
  | PK  id            |         | PK  id            | <-----+ | PK  id      |
  | FK  user_id (NULL)|         | FK  user_id       |       | | FK  user_id |
  |     session_id    |         |     total_amount  |       | | FK  prod_id | --+
  +-------------------+         |     status        |       | | FK  order_id|   |
            | 1                 +-------------------+       | |     rating  |   |
            |                             |                 | +-------------+   |
            | *                           | 1               |                   |
  +-------------------+                   +--------+        |                   |
  |    CART_ITEMS     |                   |        |        |                   |
  +-------------------+                 * |      * |        |                   |
  | PK  id            |     +---------------+    +----------------------+       |
  | FK  cart_id       |     |  ORDER_ITEMS  |    | PAYMENT_TRANSACTIONS |       |
  | FK  product_id    | --+ +---------------+    +----------------------+       |
  | FK  variant_id    |   | | PK  id        |    | PK  id               |       |
  |     quantity      |   | | FK  order_id  |    | FK  order_id         |       |
  +-------------------+   | | FK  product_id| -+ |     provider         |       |
                          | |     quantity  |  | |     status           |       |
                          | +---------------+  | |     trans_no         |       |
                          |                    | +----------------------+       |
                          |                    |                                |
                          v                    v                                |
                 +---------------------------------+                            |
                 |            PRODUCTS             | <--------------------------+
                 +---------------------------------+
                 | PK  id                          |
                 | FK  category_id                 | ----> CATEGORIES
                 | FK  brand_id                    | ----> BRANDS
                 |     price                       |
                 +---------------------------------+
                   | 1                         1 |
                   |                             |
                 * |                           * |
      +--------------------+         +--------------------+
      |   PRODUCT_IMAGES   |         |  PRODUCT_VARIANTS  |
      +--------------------+         +--------------------+

                               +-------------------+
                               |      COUPONS      |
                               +-------------------+
                               | PK  id            |
                               |     code (UQ)     |
                               |     discount_type |
                               |     discount_val  |
                               +-------------------+
                                         | 1
                                         |
                                         | *
                               +-------------------+
                               |   COUPON_USAGES   |
                               +-------------------+
                               | PK  id            |
                               | FK  coupon_id     |
                               | FK  user_id       |
                               | FK  order_id      |
                               +-------------------+
```

---

## 🗄️ Chi tiết các Bảng Cơ sở dữ liệu (Tables Specification)

### 1. Bảng `users` (Thông tin tài khoản & Xác thực)
Lưu trữ thông tin người dùng. Vai trò tài khoản (`role`) được khóa chặt là `customer` khi đăng ký mới để tránh lỗ hổng leo thang đặc quyền.

| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh UUID của tài khoản |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Địa chỉ email đăng nhập |
| `password_hash` | `TEXT` | `NOT NULL` | Mật khẩu đã được mã hóa Bcrypt |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên người dùng |
| `role` | `VARCHAR(50)` | `NOT NULL`, Default: `'customer'` | Quyền hạn tài khoản (`customer`, `admin`) |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian tạo tài khoản |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian cập nhật gần nhất |

---

### 2. Bảng `user_addresses` (Sổ địa chỉ giao hàng) — *Tính năng mới*
Quản lý danh bạ địa chỉ giao nhận của khách hàng, tích hợp trên trang cá nhân và trang thanh toán checkout.

| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh UUID của địa chỉ |
| `user_id` | `TEXT` | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | Thuộc về tài khoản nào |
| `receiver_name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên người nhận hàng |
| `receiver_phone`| `VARCHAR(50)` | `NOT NULL` | Số điện thoại liên hệ nhận hàng |
| `province` | `VARCHAR(100)` | `NOT NULL` | Tỉnh/Thành phố |
| `district` | `VARCHAR(100)` | `NOT NULL` | Quận/Huyện |
| `ward` | `VARCHAR(100)` | `NOT NULL` | Phường/Xã |
| `street_address`| `TEXT` | `NOT NULL` | Địa chỉ chi tiết (số nhà, ngõ ngách, tên đường) |
| `address_type` | `VARCHAR(50)` | `NOT NULL`, Default: `'home'` | Thể loại địa chỉ (`home`, `office`, `other`) |
| `is_default` | `BOOLEAN` | `NOT NULL`, Default: `false` | Xác định địa chỉ giao hàng mặc định |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian tạo địa chỉ |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian cập nhật địa chỉ |

---

### 3. Bảng `brands` (Thương hiệu sản phẩm)
| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh thương hiệu |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Tên hãng (Sony, Apple, Logitech...) |
| `slug` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Đường dẫn thân thiện cho SEO |
| `logo_url` | `TEXT` | | Link ảnh logo |
| `description` | `TEXT` | | Mô tả chi tiết thương hiệu |
| `website` | `VARCHAR(255)` | | Trang web chính thức |
| `country` | `VARCHAR(100)` | | Quốc gia xuất xứ |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default: `true` | Trạng thái hiển thị |

---

### 4. Bảng `categories` (Danh mục phân cấp đa tầng)
Lưu trữ cây danh mục phân cấp không giới hạn cấp độ (level) sử dụng mối quan hệ đệ quy `parent_id`.

| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh danh mục |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Tên danh mục (Điện thoại, Laptop...) |
| `slug` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Đường dẫn slug danh mục |
| `description` | `TEXT` | | Mô tả danh mục |
| `parent_id` | `TEXT` | `REFERENCES categories(id) ON DELETE SET NULL` | ID danh mục cha (đệ quy) |
| `icon` | `VARCHAR(100)` | | Tên biểu tượng hiển thị (Lucide Icon name) |
| `level` | `INTEGER` | `NOT NULL`, Default: `1` | Độ sâu trong cây phân cấp |
| `sort_order` | `INTEGER` | `NOT NULL`, Default: `0` | Thứ tự ưu tiên sắp xếp |

---

### 5. Bảng `products` (Thông tin sản phẩm chính)
| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh sản phẩm |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên thiết bị công nghệ |
| `description` | `TEXT` | `NOT NULL` | Bài viết giới thiệu & thông số kỹ thuật |
| `price` | `INTEGER` | `NOT NULL` | Giá bán lẻ (VND) |
| `inventory` | `INTEGER` | `NOT NULL`, Default: `0` | Số lượng tồn kho cốt lõi |
| `category_id` | `TEXT` | `REFERENCES categories(id) ON DELETE SET NULL` | Thuộc danh mục nào |
| `brand_id` | `TEXT` | `REFERENCES brands(id) ON DELETE SET NULL` | Thuộc thương hiệu nào |
| `image_url` | `TEXT` | | Link ảnh bìa đại diện |

---

### 6. Bảng `product_variants` (Các phiên bản/cấu hình sản phẩm)
| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh phiên bản |
| `product_id` | `TEXT` | `NOT NULL`, `REFERENCES products(id) ON DELETE CASCADE` | Thuộc về sản phẩm nào |
| `sku` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Mã quản lý kho hàng độc lập |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên cấu hình (RAM 16GB, 512GB SSD...) |
| `color_name` | `VARCHAR(100)` | | Tên màu sắc (Space Gray, Silver...) |
| `color_code` | `VARCHAR(50)` | | Mã HEX màu |
| `spec_summary`| `TEXT` | | Tóm tắt cấu hình kỹ thuật |
| `price` | `INTEGER` | `NOT NULL` | Giá bán lẻ của phiên bản này |
| `original_price`| `INTEGER` | | Giá niêm yết (nếu có giảm giá) |
| `inventory` | `INTEGER` | `NOT NULL`, Default: `0` | Tồn kho của phiên bản cụ thể |
| `image_url` | `TEXT` | | Ảnh riêng của phiên bản màu này |
| `is_default` | `BOOLEAN` | `NOT NULL`, Default: `false` | Có phải bản mặc định khi chọn sản phẩm không |

---

### 7. Bảng `orders` (Quản lý đơn đặt hàng)
| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh đơn hàng (Dạng ORD-YYYYMMDD-XXXX) |
| `user_id` | `TEXT` | `REFERENCES users(id) ON DELETE SET NULL` | ID khách hàng (Null nếu mua không cần tài khoản) |
| `customer_name`| `VARCHAR(255)`| `NOT NULL` | Tên người nhận hàng thực tế |
| `customer_phone`| `VARCHAR(50)`| `NOT NULL` | Số điện thoại người nhận hàng |
| `shipping_address`| `TEXT` | `NOT NULL` | Địa chỉ giao hàng đầy đủ |
| `customer_note`| `TEXT` | | Ghi chú từ khách hàng |
| `subtotal` | `INTEGER` | `NOT NULL` | Tạm tính tiền hàng trước giảm giá |
| `discount_amount`| `INTEGER`| `NOT NULL`, Default: `0` | Số tiền giảm giá được trừ |
| `shipping_fee`| `INTEGER` | `NOT NULL`, Default: `0` | Phí vận chuyển |
| `coupon_code` | `VARCHAR(50)`| | Mã giảm giá áp dụng |
| `total_amount`| `INTEGER` | `NOT NULL` | Tổng tiền khách hàng cần thanh toán thực tế |
| `status` | `VARCHAR(50)` | `NOT NULL`, Default: `'pending'` | Trạng thái đơn hàng (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `payment_method`| `VARCHAR(50)`| `NOT NULL`, Default: `'cod'` | Hình thức thanh toán (`cod`, `vietqr`, `vnpay`, `momo`) |
| `payment_status`| `VARCHAR(50)`| `NOT NULL`, Default: `'unpaid'` | Trạng thái thanh toán của đơn (`unpaid`, `paid`, `refunded`) |

---

### 8. Bảng `payment_transactions` (Lịch sử giao dịch & Đối soát ngân hàng) — *Bảo mật nâng cao*
Theo dõi mọi nỗ lực chuyển khoản. Đối với hình thức thanh toán tự báo cáo, trạng thái giao dịch sẽ giữ là `pending`, chờ Admin thực hiện đối soát tài khoản thực tế để phê duyệt thủ công tránh gian lận.

| Tên cột | Kiểu dữ liệu | Thuộc tính | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Định danh giao dịch |
| `order_id` | `TEXT` | `NOT NULL`, `REFERENCES orders(id) ON DELETE CASCADE` | Liên kết với đơn hàng nào |
| `user_id` | `TEXT` | `REFERENCES users(id) ON DELETE SET NULL` | Người thực hiện giao dịch |
| `transaction_code`| `VARCHAR(100)`| `NOT NULL`, `UNIQUE` | Mã nội dung chuyển tiền duy nhất (Ví dụ: `TXN-260916-1234`) |
| `provider` | `VARCHAR(50)` | `NOT NULL` | Cổng thanh toán hoặc phương thức (`vietqr`, `vnpay`, `momo`) |
| `amount` | `INTEGER` | `NOT NULL` | Số tiền giao dịch (VND) |
| `currency` | `VARCHAR(10)` | `NOT NULL`, Default: `'VND'` | Đơn vị tiền tệ |
| `status` | `VARCHAR(50)` | `NOT NULL`, Default: `'pending'` | Trạng thái giao dịch (`pending`, `success`, `failed`, `refunded`) |
| `gateway_transaction_no`| `VARCHAR(255)`| | Mã số giao dịch sinh ra từ phía Ngân hàng/Gateway |
| `raw_payload` | `JSONB` | | Toàn bộ thông tin thô nhận về phục vụ đối soát |
| `paid_at` | `TIMESTAMP` | | Thời điểm thanh toán được phê duyệt thành công |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian tạo yêu cầu chuyển khoản |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, Default: `NOW()` | Thời gian cập nhật giao dịch |

---

### 9. Bảng `coupons` & `coupon_usages` (Mã giảm giá & Giới hạn sử dụng)
*   **`coupons`**: Lưu trữ các mã khuyến mãi (giảm %, giảm tiền mặt, tối thiểu đơn hàng, giới hạn số lần, ngày hết hạn).
*   **`coupon_usages`**: Ghi vết mỗi lượt áp dụng mã thành công của một tài khoản vào một đơn hàng nhất định, phục vụ việc giới hạn số lần dùng mã của mỗi người.

---

### 10. Bảng `reviews` (Đánh giá, xếp hạng sao & Hình ảnh phản hồi)
Quản lý các lượt review sản phẩm từ khách hàng, hỗ trợ lọc bình luận đã được kiểm chứng đã mua hàng thực tế (`is_verified_buyer`) nhằm tăng tính trung thực cho sàn.
