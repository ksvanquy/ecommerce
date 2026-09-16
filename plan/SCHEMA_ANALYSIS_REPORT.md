# Báo Cáo Nghiên Cứu & Đánh Giá Kiến Trúc Data Schema - TechStore

**Ngày báo cáo:** 16/09/2026  
**Thực hiện bởi:** AI Assistant  
**Đơn vị gửi:** Đội ngũ phát triển TechStore  

---

## Executive Summary (Tóm tắt tổng quan)

Sau khi nghiên cứu tài liệu **`SCHEMA_DESIGN.md`** và kiểm tra toàn bộ mã nguồn cơ sở dữ liệu hiện tại (`apps/api/src/db/schema/`), chúng tôi xin xác nhận:

1. **Nhận định của bạn hoàn toàn CHÍNH XÁC 100%**:
   - Hệ thống hiện tại đang **THIẾU** 3 mô hình nghiệp vụ quan trọng trong thương mại điện tử:
     - **Review / Rating** (Đánh giá & Bình luận sản phẩm).
     - **Coupon / Voucher** (Quản lý mã giảm giá & khuyến mãi).
     - **Payment / Payment Transactions** (Nhật ký giao dịch thanh toán chi tiết).
   - Kiến trúc phân định giữa **`carts` / `cart_items`** (giỏ hàng tạm thời) và **`orders` / `order_items`** (đơn hàng chính thức đã chốt) là **chuẩn mực kiến trúc E-commerce bắt buộc**.

2. **Tài liệu báo cáo chi tiết dưới đây** sẽ phân tích chuyên sâu hiện trạng, lý do cần bổ sung, thiết kế schema chi tiết cho từng bảng mới, và sơ đồ ERD mở rộng.

---

## 1. Phân Tích Hiện Trạng Schema Trong `SCHEMA_DESIGN.md`

Hiện tại, cơ sở dữ liệu của TechStore chỉ đang bao gồm 8 bảng cơ bản:
- `users`: Quản lý tài khoản người dùng & vai trò (admin, customer).
- `categories`: Danh mục sản phẩm đa cấp (hỗ trợ phân cấp đệ quy).
- `brands`: Thương hiệu/nhà sản xuất.
- `products`: Sản phẩm gốc.
- `product_images`: Thư viện hình ảnh phụ của sản phẩm.
- `product_variants`: Biến thể sản phẩm (SKU, màu sắc, giá bán riêng, tồn kho riêng).
- `orders`: Hóa đơn đơn hàng chính thức.
- `order_items`: Chi tiết các mặt hàng nằm trong đơn hàng.

### Điểm mạnh hiện tại:
- Đã có snapshot giá và tên sản phẩm trong `order_items` để bảo lưu lịch sử giao dịch.
- Đã có mô hình biến thể sản phẩm (`product_variants`) tương đối linh hoạt cho đồ công nghệ (RAM, bộ nhớ, màu sắc).

### Điểm hạn chế lớn:
- Chưa có nơi lưu giữ giỏ hàng tạm thời của khách hàng trên Server.
- Chưa có cơ chế quản lý và kiểm tra mã giảm giá (Coupon master table).
- Chưa thể tích hợp các cổng thanh toán online (VNPAY, MoMo, VietQR, Stripe) do thiếu nhật ký giao dịch (`payment_transactions`).
- Chưa có tính năng đánh giá/phản hồi chất lượng sản phẩm từ khách hàng (`reviews`).

---

## 2. Giải Đáp & Phân Tích Chi Tiết Theo Đề Xuất Của Bạn

### 2.1. Phân Định Kiến Trúc: `Cart / Cart Item` vs `Order / Order Item`

> **Câu hỏi:** *Có phải nên thêm cart, cart item (giỏ hàng tạm thời) còn order và order item là đơn hàng đã đặt và chi tiết sản phẩm trong đơn không?*

**Trả lời: RẤT CHÍNH XÁC.** Đây là nguyên lý phân tách trách nhiệm (Separation of Concerns) trong E-commerce:

| Tiêu chí | `carts` & `cart_items` (Giỏ hàng tạm thời) | `orders` & `order_items` (Đơn hàng chính thức) |
| :--- | :--- | :--- |
| **Bản chất** | Dữ liệu tạm thời (Transient State / Draft). | Giao dịch tài chính cố định (Immutable Transaction Snapshot). |
| **Mục đích** | Lưu các sản phẩm người dùng đang cân nhắc mua. Giúp đồng bộ giỏ hàng qua lại giữa điện thoại và máy tính khi đăng nhập. | Hợp đồng mua bán chính thức được ký kết giữa người mua và cửa hàng. |
| **Tính chất thay đổi** | Biến động liên tục (thêm, xóa, thay đổi số lượng, chọn/bỏ chọn item, đổi biến thể). | Đóng băng vĩnh viễn (giữ nguyên tên sản phẩm, giá bán, biến thể tại thời điểm bấm đặt hàng). |
| **Vòng đời** | Xóa hoặc làm rỗng các item đã chọn ngay khi đơn hàng được đặt thành công. | Lưu trữ vĩnh viễn để phục vụ tra cứu lịch sử, đối soát kế toán và bảo hành. |

#### Thiết kế Schema Đề xuất cho `carts` & `cart_items`:

```typescript
// 1. Bảng Giỏ hàng chính (carts)
export const carts = pgTable('carts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Có thể NULL cho khách vãng lai
  sessionId: varchar('session_id', { length: 255 }), // Để nhận diện giỏ hàng của Guest qua Cookie/Session
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Bảng Chi tiết item giỏ hàng (cart_items)
export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  isSelected: boolean('is_selected').notNull().default(true), // Chọn để thanh toán
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

### 2.2. Bổ Sung Mô Hình Review / Rating (Đánh giá & Bình luận)

> **Câu hỏi:** *Apps của tôi có phải còn thiếu review/rating không?*

**Trả lời: CÓ, ĐANG THIẾU.**

Hiện tại sản phẩm chưa có cơ chế thu thập ý kiến khách hàng. Việc bổ sung `reviews` mang lại các lợi ích:
1. Xây dựng niềm tin (Social Proof) cho người mua mới.
2. Xác minh người mua thực tế (`is_verified_buyer` dựa trên `order_id`).
3. Cho phép tải lên hình ảnh/video thực tế trên tay sản phẩm công nghệ.

#### Thiết kế Schema Đề xuất cho `reviews`:

```typescript
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }), // Liên kết đơn hàng đã mua
  rating: integer('rating').notNull(), // 1 đến 5 sao
  title: varchar('title', { length: 255 }),
  comment: text('comment').notNull(),
  images: jsonb('images').$type<string[]>(), // Danh sách URL ảnh đính kèm
  isVerifiedBuyer: boolean('is_verified_buyer').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('approved'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

### 2.3. Bổ Sung Mô Hình Coupon / Voucher (Mã giảm giá & Khuyến mãi)

> **Câu hỏi:** *Apps của tôi có phải còn thiếu coupon/voucher không?*

**Trả lời: CÓ, ĐANG THIẾU.**

Hiện tại trong `orders` chỉ có 2 cột thô: `coupon_code` (string) và `discount_amount` (number). Không có bảng master lưu trữ quy tắc giảm giá, nên hệ thống **không thể tự động kiểm tra**:
- Mã còn hiệu lực hay đã hết hạn?
- Mã giảm bao nhiêu % hay số tiền cố định?
- Đơn hàng đã đạt giá trị tối thiểu (`min_order_value`) chưa?
- Mã đã hết lượt sử dụng tổng thể hoặc quá số lượt cho phép trên mỗi user chưa?

#### Thiết kế Schema Đề xuất cho `coupons` và `coupon_usages`:

```typescript
// 1. Bảng Quản lý mã giảm giá (coupons)
export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // VD: "TECHSALE10"
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 50 }).notNull(), // 'percentage' | 'fixed_amount'
  discountValue: integer('discount_value').notNull(), // % (1-100) hoặc số tiền VND
  maxDiscountAmount: integer('max_discount_amount'), // Số tiền giảm tối đa (với loại %)
  minOrderValue: integer('min_order_value').notNull().default(0), // Đơn tối thiểu
  usageLimit: integer('usage_limit'), // Tổng số lần dùng tối đa (NULL = không giới hạn)
  usedCount: integer('used_count').notNull().default(0), // Số lần đã sử dụng
  userLimit: integer('user_limit').notNull().default(1), // Số lần 1 user được áp dụng
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Bảng Theo dõi lịch sử sử dụng Coupon (coupon_usages)
export const couponUsages = pgTable('coupon_usages', {
  id: text('id').primaryKey(),
  couponId: text('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  discountApplied: integer('discount_applied').notNull(), // Số tiền giảm thực tế trong đơn này
  usedAt: timestamp('used_at').defaultNow().notNull(),
});
```

---

### 2.4. Bổ Sung Mô Hình Payment / Payment Transactions (Thanh toán chi tiết)

> **Câu hỏi:** *Apps của tôi có phải còn thiếu payment không?*

**Trả lời: CÓ, ĐANG THIẾU BẢNG GIAO DỊCH CHI TIẾT.**

Bảng `orders` hiện tại chỉ lưu `payment_method` ('cod', 'banking') và `payment_status` ('unpaid', 'paid'). Khi tích hợp cổng thanh toán thực tế (VNPAY, MoMo, VietQR, ZaloPay, Stripe), một đơn hàng có thể có **nhiều lần thử thanh toán** (thất bại, hết hạn, thanh toán lại, hoặc hoàn tiền refund). 

Do đó, cần có bảng `payment_transactions` để lưu trữ nhật ký Webhook / IPN và đối soát ngân hàng độc lập.

#### Thiết kế Schema Đề xuất cho `payment_transactions`:

```typescript
export const paymentTransactions = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  transactionCode: varchar('transaction_code', { length: 100 }).notNull().unique(), // Mã GD nội bộ
  provider: varchar('provider', { length: 50 }).notNull(), // 'vnpay' | 'momo' | 'vietqr' | 'stripe' | 'zalopay' | 'cod'
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('VND'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'success' | 'failed' | 'refunded'
  gatewayTransactionNo: varchar('gateway_transaction_no', { length: 255 }), // Mã giao dịch đối tác trả về
  rawPayload: jsonb('raw_payload'), // Log toàn bộ thông tin Webhook / IPN phục vụ kiểm tra lỗi
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## 3. Sơ Đồ ERD Nâng Cấp Tổng Thể (ASCII ERD)

Dưới đây là sơ đồ kiến trúc Cơ sở Dữ liệu mở rộng hoàn chỉnh cho TechStore sau khi bổ sung 5 bảng mới (`carts`, `cart_items`, `reviews`, `coupons`, `coupon_usages`, `payment_transactions`):

```text
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

## 4. Tổng Kết Khuyến Nghị Triển Khai (Roadmap Proposal)

Để hoàn thiện ứng dụng TechStore từ phiên bản sơ khai thành một nền tảng Thương mại điện tử sản phẩm công nghệ hoàn chỉnh, chúng tôi đề xuất lộ trình nâng cấp 4 bước với danh sách công việc (task breakdown) chi tiết như sau:

### 1. **Bước 1 - Cập nhật & Đồng bộ Schema DB Backend (`apps/api/src/db/schema/`)**
- [x] **Hoàn thiện định nghĩa Schema**:
  - [x] Đã tạo file schema: `carts.ts` (bảng `carts` và `cart_items`).
  - [x] Đã tạo file schema: `coupons.ts` (bảng `coupons` và `coupon_usages`).
  - [x] Đã tạo file schema: `payments.ts` (bảng `payment_transactions`).
  - [x] Đã tạo file schema: `reviews.ts` (bảng `reviews`).
- [x] **Export và liên kết Schema trong `index.ts`**:
  - [x] Import và re-export toàn bộ 4 schema mới trong `apps/api/src/db/schema/index.ts`.
  - [x] Bổ sung 4 schema mới vào object `schema` tổng hợp.
- [x] **Bổ sung Quan hệ đối tượng (Relations)**:
  - [x] Cập nhật `apps/api/src/db/schema/relations.ts` bổ sung `cartsRelations`, `cartItemsRelations`, `couponsRelations`, `couponUsagesRelations`, `paymentTransactionsRelations`, `reviewsRelations`.
  - [x] Thêm quan hệ ngược trong `usersRelations`, `productsRelations`, `ordersRelations`.
- [x] **Đồng bộ Cơ sở dữ liệu & Seed Data**:
  - [x] Cập nhật file `init-db.ts` với đầy đủ DDL tạo bảng `carts`, `cart_items`, `coupons`, `coupon_usages`, `payment_transactions`, `reviews`.
  - [x] Cập nhật dữ liệu mẫu ban đầu cho `coupons` (`TECHSTORE10`, `GIAM50K`, `FREESHIP`, `VIPTECH20`) và `reviews`.
  - [x] Đồng bộ Zod schemas & TypeScript Domain Types tại `@repo/shared-types`.

### 2. **Bước 2 - Phát triển các Module Backend API (`apps/api/src/`)**
- [x] **Module Giỏ hàng (`apps/api/src/cart/`)**:
  - [x] Xây dựng `cart.repository.ts`: Truy vấn giỏ hàng theo `user_id` hoặc `session_id`, populating thông tin sản phẩm, phân loại variant, thương hiệu, hình ảnh.
  - [x] Xây dựng `cart.service.ts`: Xử lý logic thêm/sửa/xóa item, kiểm tra tồn kho, hợp nhất giỏ hàng Guest vào User khi đăng nhập.
  - [x] Xây dựng `cart.controller.ts` & router: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart`, `POST /api/cart/merge`.
- [x] **Module Mã giảm giá (`apps/api/src/coupons/`)**:
  - [x] Xây dựng `coupons.repository.ts`: Tra cứu mã coupon, đếm số lần sử dụng của user và toàn hệ thống.
  - [x] Xây dựng `coupons.service.ts`: Kiểm tra điều kiện (hạn dùng, đơn tối thiểu, giới hạn dùng), tính số tiền giảm theo % (kèm mức trần maxDiscountAmount) hoặc số tiền cố định.
  - [x] Xây dựng `coupons.controller.ts` & router: `POST /api/coupons/validate`, `GET /api/coupons/available`, `GET /api/coupons`, `POST /api/coupons`.
- [x] **Module Thanh toán (`apps/api/src/payments/`)**:
  - [x] Xây dựng `payments.repository.ts`: Ghi nhận nhật ký giao dịch thanh toán `payment_transactions`.
  - [x] Xây dựng `payments.service.ts`: Tạo yêu cầu thanh toán (VietQR chuẩn động theo cú pháp ngân hàng / VNPay / MoMo) và cập nhật trạng thái đơn hàng khi thanh toán thành công.
  - [x] Xây dựng `payments.controller.ts` & router: `POST /api/payments/create-intent`, `GET /api/payments/order/:orderId`, `GET /api/payments/verify/:transactionCode`, `POST /api/payments/confirm`, `POST /api/payments/webhook`.
- [x] **Module Đánh giá & Bình luận (`apps/api/src/reviews/`)**:
  - [x] Xây dựng `reviews.repository.ts`: Thêm đánh giá, tính điểm rating trung bình và phân bổ 1-5 sao theo sản phẩm.
  - [x] Xây dựng `reviews.service.ts`: Kiểm tra đơn hàng để xác minh huy hiệu người mua hàng thật (`is_verified_buyer`).
  - [x] Xây dựng `reviews.controller.ts` & router: `GET /api/reviews/product/:productId`, `GET /api/products/:id/reviews`, `GET /api/reviews/recent`, `POST /api/reviews`.
- [x] **Tích hợp & Khai báo Định tuyến Hệ thống**:
  - [x] Đăng ký đầy đủ 4 router mới tại `apps/api/src/index.ts`.
  - [x] Bổ sung phương thức `updatePaymentStatus` tại `orders.repository.ts` để đồng bộ chuyển trạng thái đơn hàng khi thanh toán.

### 3. **Bước 3 - Phát triển & Cập nhật Frontend Client (`apps/web/src/`)**
- [x] **Đồng bộ Giỏ hàng Server (`features/checkout/`)**:
  - [x] Cập nhật `cartStore.ts` kết nối API Backend `/api/cart` để duy trì giỏ hàng khi refresh hoặc chuyển thiết bị.
  - [x] Nâng cấp `CartDrawer.tsx` và `CartView.tsx` hỗ trợ chọn/bỏ chọn item thanh toán (`isSelected`).
- [x] **Tích hợp Mã giảm giá tại Checkout**:
  - [x] Cập nhật `CheckoutView.tsx`: Thêm ô nhập mã Coupon & nút áp dụng.
  - [x] Hiển thị dòng "Giảm giá Voucher" trong phần tổng quan đơn hàng và cập nhật số tiền phải trả.
- [x] **Tích hợp Thanh toán Online**:
  - [x] Cập nhật `CheckoutView.tsx`: Cho phép chọn phương thức thanh toán VietQR / VNPay / MoMo bên cạnh COD.
  - [x] Tạo modal hiển thị mã VietQR động với cú pháp chuyển khoản tương ứng với `transactionCode`.
- [x] **Giao diện Đánh giá & Bình luận (`features/products/` & `features/checkout/`)**:
  - [x] Tạo component `ProductReviewsSection.tsx` tại trang Chi tiết sản phẩm (`ProductDetailView.tsx`) hiển thị rating sao trung bình và danh sách bình luận.
  - [x] Tạo component / modal `WriteReviewModal.tsx` cho phép người dùng chọn số sao (1-5), nhập tiêu đề & nội dung đánh giá.
  - [x] Thêm nút "Viết đánh giá" cho các sản phẩm trong đơn hàng đã giao tại `OrderHistoryView.tsx`.

### 4. **Bước 4 - Kiểm thử, Tích hợp Toàn trình & Triển khai (Integration & Deployment)**
- [x] **Kiểm thử Luồng E2E**:
  - [x] Thêm sản phẩm vào giỏ -> Nhập mã giảm giá -> Đặt hàng & Tạo giao dịch thanh toán -> Xác nhận đơn -> Viết đánh giá sản phẩm.
- [x] **Tối ưu Cơ sở Dữ liệu & Performance**:
  - [x] Đánh index toàn diện cho các khóa ngoại và cột tra cứu (`cart_id`, `product_id`, `user_id`, `order_id`, `coupon_id`, `transaction_code`, `category_id`, `brand_id`).
- [x] **Linting & Build Monorepo**:
  - [x] Chạy `npm run build` và kiểm tra không có lỗi TypeScript hay build error ở cả `apps/api`, `apps/web` và `packages/*`.
  - [x] Chuẩn hóa toàn bộ hệ thống thông báo sang sử dụng Toast UI component từ `@repo/ui`.

---
*Báo cáo được lưu trữ chính thức tại `plan/SCHEMA_ANALYSIS_REPORT.md`.*
