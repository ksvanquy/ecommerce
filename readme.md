# Cấu trúc Dự án Ecommerce

## Cấu trúc thư mục `apps/web/`

```text
ecommerce/
└── apps/web/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── main.tsx # Entry point, mount React root
    │   ├── App.tsx # Providers (QueryClient, Router) + layout gốc
    │   │
    │   ├── routes/ # Định nghĩa route (dùng react-router)
    │   │   ├── index.tsx # Router config (createBrowserRouter)
    │   │   └── ProtectedRoute.tsx # Guard cho route cần auth
    │   │
    │   ├── features/ # Business logic, map 1-1 với backend modules
    │   │   ├── auth/
    │   │   │   ├── api/ # react-query hooks gọi API
    │   │   │   │   ├── useLogin.ts
    │   │   │   │   └── useCurrentUser.ts
    │   │   │   ├── components/ # UI riêng feature này (LoginForm...)
    │   │   │   ├── store/ # state riêng feature (nếu cần, zustand slice)
    │   │   │   ├── types.ts
    │   │   │   └── index.ts # Public export - feature khác chỉ import từ đây
    │   │   │
    │   │   ├── products/
    │   │   │   ├── api/
    │   │   │   │   ├── useProducts.ts
    │   │   │   │   └── useProduct.ts
    │   │   │   ├── components/
    │   │   │   │   ├── ProductCard.tsx
    │   │   │   │   └── ProductList.tsx
    │   │   │   ├── types.ts
    │   │   │   └── index.ts
    │   │   │
    │   │   └── checkout/
    │   │       ├── api/
    │   │       ├── components/
    │   │       ├── store/ # giỏ hàng thường cần state riêng
    │   │       ├── types.ts
    │   │       └── index.ts
    │   │
    │   ├── components/ # Design system / UI dùng chung, KHÔNG chứa business logic
    │   │   ├── ui/ # Button, Input, Modal, Dialog...
    │   │   └── layout/ # Header, Footer, Sidebar, PageWrapper
    │   │
    │   ├── hooks/ # Hooks dùng chung toàn app
    │   │   ├── useDebounce.ts
    │   │   └── useMediaQuery.ts
    │   │
    │   ├── lib/ # Cấu hình client / thư viện ngoài
    │   │   ├── axios.ts # instance axios + interceptor
    │   │   └── queryClient.ts # react-query client config
    │   │
    │   ├── types/ # Type dùng chung, không thuộc riêng feature
    │   │   └── api.ts # ApiResponse<T>, PaginatedResponse<T>...
    │   │
    │   ├── config/
    │   │   └── env.ts # đọc & validate biến môi trường (import.meta.env)
    │   │
    │   └── styles/
    │       └── globals.css # Tailwind base hoặc CSS reset
    │
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── .env
```

## Giai đoạn 0 — Khởi tạo monorepo & tooling (1-2 ngày)

* **Mục tiêu:** có bộ khung chạy được, chưa cần code nghiệp vụ.
* Khởi tạo Turborepo/Nx, tạo `apps/api`, `apps/web`, `packages/shared-types`.
* Cấu hình chung: ESLint, Prettier, TypeScript path alias (`@/...`).
* `apps/api`: cài Express/Fastify + Drizzle + PostgreSQL, viết `connection.ts`, `db.ts`.
* `apps/web`: khởi tạo Vite + React + Tailwind (nếu dùng), cấu hình `axios.ts`, `queryClient.ts`.
* Docker Compose cho PostgreSQL local (đỡ phải cài native).
* **Kiểm tra:** `apps/api` chạy được `GET /health`, `apps/web` gọi được endpoint đó và hiển thị ra màn hình.
  * *→ Không viết tính năng gì ở bước này, chỉ đảm bảo hạ tầng thông suốt.*

## Giai đoạn 1 — Module users + Auth (nền tảng bắt buộc)

* **Lý do làm trước:** mọi module khác (`products`, `orders`) đều cần biết "ai đang gọi API".
* **Backend:**
  * `users.schema.ts` → migrate bằng Drizzle Kit.
  * `users.repository.ts`, `users.service.ts` (hash password, tạo JWT).
  * `users.controller.ts`: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
  * Middleware xác thực JWT dùng chung (đặt ở `shared/middlewares/auth.middleware.ts`).
* **Frontend:**
  * `features/auth/api/useLogin.ts`, `useRegister.ts`, `useCurrentUser.ts`.
  * `features/auth/components/LoginForm.tsx`, `RegisterForm.tsx`.
  * Lưu token: khuyên dùng `httpOnly` cookie thay vì `localStorage` nếu ngại XSS; đơn giản hơn thì `localStorage` + interceptor axios đính token vào header.
  * `routes/ProtectedRoute.tsx` chặn route cần đăng nhập.
* **Kiểm tra xong giai đoạn này khi:** đăng ký → đăng nhập → vào trang cần auth → refresh vẫn còn đăng nhập.

## Giai đoạn 2 — Module products (đọc dữ liệu, chưa có logic phức tạp)

* **Lý do làm tiếp theo:** là module "đọc" thuần túy, dễ nhất, giúp bạn làm quen luồng `feature → api → UI` trước khi đụng vào `orders` (có logic phức tạp hơn).
* **Backend:** CRUD sản phẩm, có thể thêm filter/pagination cơ bản (`GET /products?page=1&category=...`).
* **Frontend:**
  * `features/products/api/useProducts.ts` (react-query, có cache theo query params).
  * `ProductList.tsx`, `ProductCard.tsx`, trang chi tiết sản phẩm.
  * Route `/products`, `/products/:id`.
* **Kiểm tra:** danh sách sản phẩm load được, có phân trang/tìm kiếm, chi tiết sản phẩm hiển thị đúng.

## Giai đoạn 3 — Giỏ hàng (state phía client, chưa cần backend)

* Đây là chỗ cần state quản lý ở client — dùng Zustand hoặc Context tùy độ phức tạp giỏ hàng.
* `features/checkout/store/cartStore.ts`.
* Thêm/xóa/sửa số lượng sản phẩm trong giỏ.
* Hiển thị mini-cart, trang giỏ hàng.
* Chưa cần backend vì giỏ hàng có thể xử lý hoàn toàn ở client trước khi đặt hàng.

## Giai đoạn 4 — Module orders (phần phức tạp nhất)

* **Lý do để cuối:** cần cả `users` (ai đặt) và `products` (đặt gì), nên phải có 2 module trước đã hoàn thiện.
* **Backend:**
  * `orders.schema.ts` (`orders` + `order_items`, quan hệ với `products`/`users`).
  * Logic quan trọng: kiểm tra tồn kho, tính tổng tiền ở server (không tin client), transaction khi tạo order (dùng Drizzle transaction).
  * `POST /orders`, `GET /orders/:id`, `GET /orders` (lịch sử đơn hàng).
* **Frontend:**
  * `features/checkout/api/useCreateOrder.ts`.
  * Form checkout (địa chỉ, xác nhận), trang lịch sử đơn hàng.
* **Điểm cần quyết định sớm:** chưa tích hợp payment gateway (VNPay/Momo/Stripe) không? Nếu có, nên làm ngay từ giai đoạn này thay vì thêm sau, vì nó ảnh hưởng đến trạng thái đơn hàng (`pending`/`paid`/`failed`).

## Giai đoạn 5 — Hoàn thiện & vận hành

* Xử lý lỗi tập trung (error boundary FE, error middleware BE).
* Validate input (Zod ở cả 2 phía — dùng chung schema qua `packages/shared-types` nếu muốn giảm trùng lặp).
* Viết `packages/shared-types` khi thấy type bị lặp lại giữa `orders.controller.ts` và `features/checkout/types.ts` — đừng làm sớm khi chưa thấy đau.
* Deploy: API lên VPS/Railway/Render, DB lên Neon/Supabase/RDS, FE lên Vercel/Netlify.
* CI cơ bản: chạy lint + build trên mỗi PR (Turborepo cache giúp build nhanh).

## Nguyên tắc xuyên suốt (đúng tinh thần "không over-engineer")

* **Làm module nào xong module đó** — đừng viết `orders.schema.ts` trước khi users và products chạy ổn, vì orders phụ thuộc dữ liệu thật của 2 module kia để test.
* **Chỉ tạo `packages/shared-types` khi cảm nhận được sự trùng lặp**, không tạo trước cho "tương lai".
* **Không thêm Zustand/Redux cho mọi thứ** — chỉ giỏ hàng mới thật sự cần state client phức tạp, còn lại để react-query cache là đủ.
* **Migration luôn đi kèm code** — mỗi lần đổi `*.schema.ts` thì chạy `drizzle-kit generate` ngay, đừng để dồn.