# Cấu trúc Dự án Ecommerce

Dự án Ecommerce chuẩn Fullstack Monorepo với kiến trúc phân tầng rõ ràng, áp dụng Clean Architecture kết hợp Feature-based pattern trên Frontend và Module-based pattern trên Backend.

---

## 📁 Cấu trúc Toàn bộ Codebase Hiện tại

```text
ecommerce/
├── apps/
│   ├── api/                              # Backend Service (Node.js/Express + Drizzle ORM + PostgreSQL)
│   │   ├── src/
│   │   │   ├── connection.ts             # Cấu hình kết nối PostgreSQL qua pool / drizzle
│   │   │   ├── db.ts                     # Khởi tạo db instance Drizzle
│   │   │   ├── index.ts                  # Entry point Express API, cấu hình middleware & routing
│   │   │   │
│   │   │   ├── users/                    # Module Người dùng & Xác thực (Giai đoạn 1)
│   │   │   │   ├── users.schema.ts       # Schema bảng users trong PostgreSQL
│   │   │   │   ├── users.repository.ts   # Tầng truy vấn CSDL cho Users
│   │   │   │   ├── users.service.ts      # Logic nghiệp vụ (Hash password, tạo JWT token)
│   │   │   │   └── users.controller.ts   # Routes: POST /auth/register, POST /auth/login, GET /auth/me
│   │   │   │
│   │   │   ├── products/                 # Module Sản phẩm & Danh mục (Giai đoạn 2)
│   │   │   │   ├── products.schema.ts    # Schema bảng products & seed data
│   │   │   │   ├── products.repository.ts# Tầng truy vấn CSDL (phân trang, lọc giá, danh mục)
│   │   │   │   ├── products.service.ts   # Logic nghiệp vụ sản phẩm
│   │   │   │   └── products.controller.ts# Routes: GET /products, GET /products/:id, CRUD Admin
│   │   │   │
│   │   │   ├── orders/                   # Module Đơn hàng & Checkout (Giai đoạn 4)
│   │   │   │   ├── orders.schema.ts      # Schema bảng orders, order_items & coupons
│   │   │   │   ├── orders.repository.ts  # Tầng truy vấn CSDL & quan hệ đơn hàng
│   │   │   │   ├── orders.service.ts     # Logic đặt hàng, khóa tồn kho, server-side transaction
│   │   │   │   └── orders.controller.ts  # Routes: POST /orders, GET /orders, PATCH /orders/:id/cancel
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   └── health.router.ts      # Route kiểm tra tình trạng hệ thống: GET /health, GET /api/health
│   │   │   │
│   │   │   └── shared/                   # Thành phần dùng chung Backend (Giai đoạn 5)
│   │   │       ├── errors/
│   │   │       │   └── AppError.ts       # Lớp lỗi chuẩn hóa AppError
│   │   │       └── middlewares/
│   │   │           ├── auth.middleware.ts       # Middleware xác thực JWT & phân quyền Role
│   │   │           ├── validation.middleware.ts # Middleware validate Zod (body, query)
│   │   │           └── error.middleware.ts      # Centralized Error Handler & 404 Handler
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                              # Frontend Web Client (React 18 + Vite + Tailwind CSS)
│       ├── public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── main.tsx                  # Entry point, mount React DOM root
│       │   ├── App.tsx                   # Bọc ErrorBoundary + QueryClientProvider + AppRouter
│       │   │
│       │   ├── routes/                   # Cấu hình điều hướng (React Router)
│       │   │   ├── index.tsx             # Định nghĩa Router
│       │   │   └── ProtectedRoute.tsx    # Route Guard chặn truy cập khi chưa đăng nhập
│       │   │
│       │   ├── features/                 # Business logic, chia theo từng Feature độc lập
│       │   │   ├── auth/                 # Feature Đăng nhập / Đăng ký
│       │   │   │   ├── api/              # React Query hooks: useLogin, useRegister, useCurrentUser
│       │   │   │   ├── components/       # UI: LoginForm.tsx, RegisterForm.tsx, AuthModal.tsx
│       │   │   │   ├── store/            # authStore.ts (Zustand lưu user + token)
│       │   │   │   ├── types.ts          # Type cục bộ
│       │   │   │   └── index.ts          # Public export
│       │   │   │
│       │   │   ├── products/             # Feature Danh sách & Chi tiết Sản phẩm
│       │   │   │   ├── api/              # useProducts.ts, useProduct.ts, useCategories.ts
│       │   │   │   ├── components/       # ProductsView.tsx, ProductCard.tsx, ProductDetailModal.tsx
│       │   │   │   ├── types.ts
│       │   │   │   └── index.ts
│       │   │   │
│       │   │   ├── checkout/             # Feature Giỏ hàng, Checkout & Đơn hàng
│       │   │   │   ├── api/              # useCreateOrder.ts, useOrders.ts, useCancelOrder.ts
│       │   │   │   ├── components/       # CartDrawer.tsx, CheckoutModal.tsx, OrderHistoryView.tsx
│       │   │   │   ├── store/            # cartStore.ts (Zustand: items, quantity, coupon, total)
│       │   │   │   ├── types.ts
│       │   │   │   └── index.ts
│       │   │   │
│       │   │   └── admin/                # Feature Quản trị
│       │   │       ├── components/       # AdminProductManagement.tsx
│       │   │       └── index.ts
│       │   │
│       │   ├── components/               # UI components dùng chung (Design System)
│       │   │   ├── ui/                   # Button, Input, Modal, Badge...
│       │   │   ├── layout/               # Header.tsx, Footer.tsx
│       │   │   └── common/               # ErrorBoundary.tsx (Giai đoạn 5)
│       │   │
│       │   ├── hooks/                    # Custom React hooks dùng chung
│       │   │   ├── useDebounce.ts
│       │   │   └── useMediaQuery.ts
│       │   │
│       │   ├── lib/                      # Cấu hình SDK / Thư viện bên ngoài
│       │   │   ├── axios.ts              # Axios instance + Request/Response Interceptors
│       │   │   └── queryClient.ts        # TanStack Query Client config
│       │   │
│       │   ├── types/                    # Types dùng chung cho Frontend
│       │   │   └── api.ts
│       │   │
│       │   ├── config/
│       │   │   └── env.ts                # Đọc & validate biến môi trường (VITE_API_BASE_URL)
│       │   │
│       │   └── styles/
│       │       └── globals.css           # Cấu hình Tailwind CSS
│       │
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared-types/                     # Module Schema & Types dùng chung giữa FE & BE (Giai đoạn 5)
│       ├── src/
│       │   └── index.ts                  # Zod Schemas & Inferred Types (Auth, Product, Order, API Contracts)
│       ├── package.json
│       └── tsconfig.json
│
├── server.ts                             # Production Fullstack Entry Point (Express API + Vite SPA Middleware)
├── package.json                          # Root monorepo scripts & dependencies
└── readme.md
```

---

## 🚀 Tiến độ Triển khai theo 5 Giai đoạn

### ✅ Giai đoạn 0 — Khởi tạo Monorepo & Tooling (Hoàn thành 100%)
* Khởi tạo cấu trúc monorepo với `apps/api`, `apps/web`, `packages/shared-types`.
* Cấu hình TypeScript, Path Aliases, Tailwind CSS.
* `apps/api`: Cài đặt Express, Drizzle ORM, cấu hình kết nối database PostgreSQL.
* `apps/web`: Khởi tạo React + Vite + Tailwind CSS, cấu hình Axios client và TanStack Query.
* Endpoint `GET /api/health` kiểm tra kết nối CSDL và trả về trạng thái máy chủ.

### ✅ Giai đoạn 1 — Module Users & Auth (Hoàn thành 100%)
* **Backend:**
  * Bảng `users` với mã hóa mật khẩu và cơ chế cấp phát JWT Token.
  * Controller: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
  * Middleware `authMiddleware` xác thực Bearer token và phân quyền theo vai trò (`customer`, `admin`).
* **Frontend:**
  * React Query hooks: `useLogin`, `useRegister`, `useCurrentUser`.
  * UI components: `LoginForm`, `RegisterForm`, `AuthModal` với hỗ trợ chuyển đổi tài khoản mẫu.
  * `authStore` lưu trữ token và thông tin phiên làm việc, tự động đính kèm qua Axios Interceptor.

### ✅ Giai đoạn 2 — Module Products Catalog (Hoàn thành 100%)
* **Backend:**
  * Bảng `products` với hỗ trợ phân trang (`page`, `limit`), tìm kiếm từ khóa, lọc theo danh mục và khoảng giá.
  * Controller: `GET /api/products`, `GET /api/products/categories`, `GET /api/products/:id`.
  * CRUD cho Quản trị viên: `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`.
* **Frontend:**
  * Giao diện `ProductsView` hiện đại với Hero Banner, thanh tìm kiếm, bộ lọc danh mục và sắp xếp giá.
  * `ProductCard`, modal xem chi tiết sản phẩm `ProductDetailModal`.

### ✅ Giai đoạn 3 — Giỏ hàng Client-Side (Hoàn thành 100%)
* Quản lý trạng thái giỏ hàng độc lập phía client với Zustand `cartStore`.
* Các thao tác: Thêm sản phẩm, tăng/giảm số lượng, xóa khỏi giỏ, áp dụng mã giảm giá (ví dụ: `GIAM10`, `TECH20`).
* Tự động tính toán Tạm tính (Subtotal), Giảm giá (Discount), Phí giao hàng (Shipping Fee), và Tổng cộng (Total).
* Giao diện `CartDrawer` dạng trượt mượt mà.

### ✅ Giai đoạn 4 — Module Orders & Checkout (Hoàn thành 100%)
* **Backend:**
  * Bảng `orders`, `order_items` với quan hệ dữ liệu chặt chẽ.
  * **Server-side Transaction:** Khóa tồn kho nguyên tử, kiểm tra hàng trong kho, tính lại tổng tiền tại máy chủ để chống gian lận giá.
  * Hoàn trả lại số lượng tồn kho tự động khi đơn hàng bị hủy (`PATCH /api/orders/:id/cancel`).
  * Hỗ trợ phương thức thanh toán: COD (Tiền mặt khi nhận hàng) và Chuyển khoản QR.
* **Frontend:**
  * `CheckoutModal` xác nhận thông tin người nhận và phương thức thanh toán.
  * `OrderHistoryView` tra cứu lịch sử đơn hàng, xem chi tiết và hủy đơn hàng đang chờ xử lý.

### ✅ Giai đoạn 5 — Hoàn thiện & Vận hành (Hoàn thành 100%)
* **Xử lý lỗi tập trung:**
  * **Frontend:** Bọc ứng dụng trong `ErrorBoundary` bắt toàn bộ lỗi runtime, có nút tải lại và chuyển về trang chủ an toàn.
  * **Backend:** `errorHandler` middleware chuẩn hóa định dạng phản hồi lỗi (`ApiResponse`), xử lý `ZodError`, `AppError` và bắt các ngoại lệ chưa xử lý.
  * `notFoundHandler` phản hồi chuẩn JSON cho các route API không tồn tại (`404 Not Found`).
* **Validation Input đồng bộ:**
  * Dùng chung Zod schemas từ `packages/shared-types`: `registerSchema`, `loginSchema`, `createProductSchema`, `createOrderSchema`, `productFiltersSchema`.
  * Kiểm tra tính hợp lệ dữ liệu ngay từ client trước khi gửi và validate nghiêm ngặt tại middleware backend (`validateBody`, `validateQuery`).
* **Vận hành & Triển khai:**
  * Môi trường triển khai: **Chạy trên Local** / Container với Node.js runtime.
  * Tích hợp dev server và production build qua `server.ts` (Express + Vite Middleware).

---

## 🛠️ Hướng dẫn Khởi chạy & Kiểm thử

### 1. Khởi chạy ở chế độ Phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ khởi chạy máy chủ Express kết hợp Vite Dev Server tại cổng `http://localhost:3000`.

### 2. Kiểm tra TypeScript & Linter
```bash
npm run lint
```

### 3. Đóng gói cho Môi trường Vận hành (Production Build)
```bash
npm run build
npm start
```

---

## 💡 Nguyên tắc Thiết kế & Triển khai
1. **Module hóa chuẩn xác:** Mỗi module backend bao gồm `schema`, `repository`, `service`, `controller`. Mỗi feature frontend bao gồm `api`, `components`, `store`, `types`.
2. **Server-side Authority:** Tuyệt đối không tin tưởng giá trị tính tiền từ client; toàn bộ giá sản phẩm, giảm giá và tồn kho được kiểm tra và trừ tự động trong CSDL qua Transaction.
3. **Không Over-engineer:** Sử dụng Zustand có chọn lọc cho state giỏ hàng và phiên làm việc; tận dụng cache tự động của TanStack Query cho dữ liệu sản phẩm và đơn hàng.
