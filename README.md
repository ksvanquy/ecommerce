# TechStore — Modern E-Commerce Full-Stack Platform

Hệ thống thương mại điện tử công nghệ đa nền tảng (Full-Stack Monorepo) xây dựng bằng **React 19**, **Express**, **Drizzle ORM** và **PostgreSQL (Local psql)**.

---

## 📂 Cấu trúc dự án (Monorepo Architecture)

Dự án được cấu trúc theo dạng Monorepo chuẩn (npm workspaces):

```text
.
├── apps/
│   ├── api/                   # Backend Express REST API
│   │   ├── drizzle.config.ts  # Cấu hình Drizzle Kit migrations & schema
│   │   └── src/
│   │       ├── db/            # Quản lý Database & Drizzle Schema tập trung
│   │       │   ├── schema/    # Khai báo các bảng và quan hệ (users, categories, products, orders)
│   │       │   └── index.ts   # Khởi tạo Drizzle instance với full relational schema
│   │       ├── users/         # Module Người dùng & Xác thực (Controller, Service, Repository)
│   │       ├── categories/    # Module Danh mục sản phẩm phân cấp đa tầng (Tree)
│   │       ├── products/      # Module Quản lý Sản phẩm, tìm kiếm, lọc & phân trang
│   │       ├── orders/        # Module Đơn hàng & Thanh toán
│   │       ├── shared/        # Middleware (Auth, Validation, Error Handling) & Custom Errors
│   │       ├── connection.ts  # Quản lý PostgreSQL connection pool
│   │       ├── init-db.ts     # Tự động seed dữ liệu mẫu khi khởi động
│   │       └── index.ts       # Entry point Express API
│   └── web/                   # Frontend SPA (React 19 + Vite + Tailwind CSS v4)
│       └── src/
│           ├── components/    # UI components (Header, Footer, ProductCard, CategoryMenu...)
│           ├── pages/         # Trang (Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Đơn hàng, Auth...)
│           ├── store/         # State Management với Zustand (Cart, Auth, UI)
│           └── lib/           # Axios instance & React Query hooks
├── packages/
│   └── shared-types/          # Package chia sẻ chung TypeScript types giữa Web & API
├── server.ts                  # Reverse proxy & Single-port container entrypoint (Port 3000)
├── metadata.json              # Metadata ứng dụng (Name, description, permissions)
└── package.json               # Root workspace script & dependencies
```

---

## 🚀 Tính năng chính

### 1. Phía Người Dùng (Client / Web)
- **Giao diện hiện đại**: Thiết kế tối ưu hiển thị thiết bị công nghệ với Tailwind CSS v4 và hoạt ảnh mượt mà từ Motion.
- **Khám phá sản phẩm đa tầng**: Cây danh mục đa cấp (Electronics, Laptops, Audio, Keyboards...), bộ lọc giá, tìm kiếm tức thì theo từ khóa, sắp xếp và phân trang.
- **Giỏ hàng & Đặt hàng nhanh chóng**: Lưu trữ giỏ hàng (Zustand persist), hỗ trợ thanh toán COD, chuyển khoản ngân hàng và kiểm tra tính hợp lệ của tồn kho.
- **Quản lý tài khoản**: Đăng ký, đăng nhập JWT, cập nhật hồ sơ cá nhân và theo dõi trạng thái đơn hàng thời gian thực.

### 2. Phía Backend (API)
- **Kiến trúc 3 tầng (Layered Architecture)**: Phân tách rõ ràng giữa `Controller` (giao tiếp HTTP), `Service` (xử lý nghiệp vụ) và `Repository` (truy vấn dữ liệu).
- **Public API Contract**: Mỗi module (`users`, `products`, `categories`, `orders`) sở hữu một file `index.ts` đóng vai trò Facade ngăn chặn việc truy cập lộn xộn giữa các module.
- **Centralized Database Schema (Drizzle ORM)**: Toàn bộ bảng cơ sở dữ liệu và quan hệ hai chiều (`relations`) được đặt tại `src/db/schema`, hỗ trợ đầy đủ Drizzle Relational Queries (`db.query`).
- **Pure PostgreSQL & ACID Transactions**: 100% dữ liệu được lưu trữ bền vững trên PostgreSQL. Toàn bộ thao tác đặt hàng và trừ tồn kho chạy bằng Database Transaction (`db.transaction`) đảm bảo tính toàn vẹn dữ liệu.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Zustand, TanStack React Query, Lucide Icons, Motion |
| **Backend** | Node.js, Express, Drizzle ORM, postgres.js, Zod, JWT, bcryptjs |
| **Cơ sở dữ liệu** | PostgreSQL (kèm Drizzle Kit quản lý schema/migrations) |
| **Monorepo** | NPM Workspaces, TypeScript 5.8+ |

---

## 🔑 Biến môi trường (.env)

Tạo file `.env` tại thư mục gốc dự án theo mẫu `.env.example`:

```env
# Kết nối PostgreSQL chạy trực tiếp trên máy local (psql Windows / macOS / Linux)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ecommerce

# Bí mật mã hóa JWT Token
JWT_SECRET=super_secret_jwt_key_2026

# Cấu hình Frontend
VITE_API_BASE_URL=/api
VITE_APP_NAME=TechStore
```

> **💡 Lưu ý cho người dùng PostgreSQL trên Windows (psql):**
> 1. Mở `SQL Shell (psql)` hoặc terminal Windows (Command Prompt / PowerShell).
> 2. Đăng nhập vào PostgreSQL và tạo database dự án:
>    ```sql
>    CREATE DATABASE ecommerce;
>    ```
> 3. Cập nhật user và password thực tế vào chuỗi `DATABASE_URL` trong file `.env`.
> 4. Không cần cài đặt hay chạy Docker, ứng dụng kết nối trực tiếp đến port 5432 trên máy của bạn.

---

## 💻 Hướng dẫn chạy ứng dụng

### 1. Cài đặt dependencies
```bash
npm install
```

```bash
npm approve-scripts esbuild
npm approve-scripts @google/genai
npm approve-scripts protobufjs
```

```bash
npm rebuild
```

### 2. Chạy môi trường phát triển (Development)
```bash
# Khởi động ứng dụng đầy đủ (API + Web trên port 3000)
npm run dev
```

Hoặc chạy riêng API backend:
```bash
npm run api:dev
```

### 3. Kiểm tra mã nguồn (Lint & Type check)
```bash
npm run lint
```

### 4. Build sản phẩm cho Production
```bash
npm run build
npm start
```

---

## 📡 Danh sách REST API chính

| Phương thức | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái hệ thống & kết nối DB | Public |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | Public |
| `POST` | `/api/auth/login` | Đăng nhập lấy JWT Token | Public |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | User / Admin |
| `GET` | `/api/categories` | Lấy danh sách danh mục (phân cấp cây) | Public |
| `GET` | `/api/products` | Danh sách sản phẩm (có query, lọc, phân trang) | Public |
| `GET` | `/api/products/:id` | Chi tiết một sản phẩm | Public |
| `POST` | `/api/products` | Thêm sản phẩm mới | Admin |
| `GET` | `/api/orders` | Danh sách đơn hàng | User / Admin |
| `POST` | `/api/orders` | Tạo đơn hàng mới | User / Guest |
| `PATCH` | `/api/orders/:id/status` | Cập nhật trạng thái giao vận đơn hàng | Admin |
