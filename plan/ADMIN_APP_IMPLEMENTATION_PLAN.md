# Kế Hoạch Triển Khai Ứng Dụng Quản Trị - `apps/admin`

Tài liệu này vạch ra lộ trình chi tiết và kiến trúc hệ thống để phát triển ứng dụng quản trị độc lập **`apps/admin`** trong cấu trúc Monorepo của TechStore. 

Với đặc thù môi trường chạy trên môi trường Container (Cloud Run) và chỉ mở duy nhất cổng **`3000`** ra bên ngoài, ứng dụng admin sẽ được thiết kế để tích hợp mượt mà và phân phối thông minh thông qua cơ chế định tuyến hợp nhất của máy chủ.

---

## 🏗️ 1. Kiến Trúc Hệ Thống & Giải Pháp Phân Phối (Architecture & Distribution)

Do giới hạn cổng kết nối, chúng ta không thể chạy `apps/admin` trên một cổng riêng biệt (ví dụ: `3002`) ở môi trường Production. Do đó, giải pháp tối ưu là **Hợp nhất và Phân phối qua đường dẫn `/admin`**:

### 🔹 Sơ đồ Hoạt động ở Production (Production Build Routing)
Khi chạy lệnh `npm run build`, hệ thống sẽ:
1. Biên dịch ứng dụng Khách hàng (`apps/web`) vào thư mục `dist/`.
2. Biên dịch ứng dụng Quản trị (`apps/admin`) vào thư mục `dist/admin/`.
3. Máy chủ Express (`server.ts`) sẽ phục vụ tĩnh:
   - Các yêu cầu bắt đầu bằng `/admin` -> trả về tệp `dist/admin/index.html` (Admin SPA).
   - Các yêu cầu còn lại (không phải `/api` hay `/admin`) -> trả về tệp `dist/index.html` (Customer SPA).

```text
                           [ Nginx Reverse Proxy (Port 3000) ]
                                          │
                                          ▼
                               [ Custom Express Server ]
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                        ▼                        ▼
           [ /api/* ]                [ /admin/* ]             [ / * (Default) ]
                 │                        │                        │
        Route sang API Service    Trả về static files     Trả về static files
         (Controller/Service)      từ `dist/admin/`         từ `dist/` (Web)
```

---

## 📊 2. Các Tính Năng Cốt Lõi Của `apps/admin` (Core Features)

Ứng dụng Admin sẽ là một trang quản trị (Dashboard) chuyên nghiệp, tập trung vào khả năng vận hành và đối soát dòng tiền:

### 📈 Trang chủ & Thống kê (Dashboard & Analytics)
* **Chỉ số Sức khỏe (KPI Metrics):** Tổng doanh thu, tổng số đơn hàng, tổng số khách hàng đăng ký mới, số lượng phản hồi chờ duyệt.
* **Biểu đồ doanh thu (Revenue Charts):** Biểu đồ cột/đường (Sử dụng Recharts) trực quan hóa doanh thu theo ngày, tuần, tháng và danh mục sản phẩm bán chạy.
* **Cảnh báo tồn kho thấp (Low-stock Alerts):** Danh sách các biến thể sản phẩm sắp hết hàng cần bổ sung gấp.

### 🛍️ Quản lý Danh mục & Sản phẩm (Catalog Management)
* **Sản phẩm & Biến thể:** Quản lý danh sách sản phẩm, thêm/sửa/xóa sản phẩm gốc, cấu hình linh hoạt các biến thể SKU (Màu sắc, dung lượng, giá bán riêng biệt, cập nhật tồn kho nhanh).
* **Danh mục đa cấp (Category Tree Manager):** Giao diện quản lý dạng cây cho các danh mục sản phẩm (Electronics -> Laptops -> Gaming Laptops).
* **Quản lý Thương hiệu:** Thêm/sửa danh mục các thương hiệu phân phối chính hãng.

### 🧾 Quản lý Đơn hàng & Đối soát Thanh toán (Fulfillment & Payment Auditing)
* **Quản lý Trạng thái Đơn hàng:** Cập nhật trạng thái đơn hàng theo đúng chu kỳ vận hành (`unpaid` -> `paid`, `pending` -> `processing` -> `shipping` -> `delivered` -> `cancelled`).
* **Đối soát Giao dịch ngân hàng thủ công:** 
  - Xem danh sách giao dịch báo cáo chuyển khoản (`payment_transactions` ở trạng thái `pending`).
  - Nút **"Phê duyệt Thanh toán"** dành riêng cho Admin: Sau khi đối soát thủ công trên tài khoản ngân hàng thực tế có dòng tiền đổ về trùng với `transactionCode`, Admin click phê duyệt để chuyển trạng thái giao dịch sang `success`, đơn hàng tự động chuyển sang `paid` và bắt đầu luồng đóng gói.

### 🎟️ Quản lý Chương trình Khuyến mãi (Coupon & Voucher)
* **Cấu hình mã giảm giá:** Tạo mã mới, thiết lập quy tắc hoạt động (giảm theo % kèm mức trần tối đa, hoặc giảm trực tiếp số tiền cố định, thời gian hiệu lực, tổng số lượt sử dụng, giới hạn lượt dùng trên mỗi User, giá trị đơn tối thiểu).
* **Theo dõi hiệu quả:** Thống kê lịch sử sử dụng của từng mã giảm giá cụ thể.

---

## 📅 3. Lộ Trình Triển Khai Chi Tiết & Danh Sách Task Cụ Thể (Granular Implementation Task List)

Dưới đây là bảng phân rã toàn bộ các đầu việc kỹ thuật chi tiết theo từng ngày và từng module, kèm theo file đích và đặc tả kỹ thuật cụ thể:

### 📍 Giai đoạn 1: Thiết lập Infrastructure & Build System (Ngày 1 - Ngày 5) - [Đã Hoàn Thành]

#### 🔹 Task 1.1: Khởi tạo Project Workspace `apps/admin`
* **File ảnh hưởng:** `/apps/admin/package.json`, `/apps/admin/tsconfig.json`, `/apps/admin/index.html`
* **Nội dung công việc:**
  - [x] Tạo thư mục `/apps/admin` cùng cấu trúc khung ứng dụng React + TypeScript tiêu chuẩn.
  - [x] Thêm file `apps/admin/package.json` với các dependency cơ bản: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `zustand`, `@repo/ui` và `@repo/shared-types`.
  - [x] Cấu hình `apps/admin/tsconfig.json` kế thừa cấu trúc biên dịch chung của hệ thống.
  - [x] Tạo file `apps/admin/index.html` liên kết tới tệp entrypoint `/apps/admin/src/main.tsx`.

#### 🔹 Task 1.2: Định cấu hình Tích hợp Build System Đa ứng dụng
* **File ảnh hưởng:** `/package.json`, `/vite.config.ts`, `/server.ts`
* **Nội dung công việc:**
  - [x] Cập nhật tệp `/package.json` tại thư mục gốc để đăng ký thêm workspace `"apps/admin"`.
  - [x] Viết script build riêng trong `/package.json` gốc:
    ```json
    "build:admin": "vite build --config apps/admin/vite.config.ts",
    "build:all": "npm run build && npm run build:admin"
    ```
  - [x] Định cấu hình máy chủ `/server.ts` phục vụ static assets cho `/admin/*` từ thư mục `dist/admin/`:
    ```typescript
    const adminDistPath = path.resolve(__dirname, 'dist/admin');
    app.use('/admin', express.static(adminDistPath));
    app.get('/admin/*', (req, res) => {
      res.sendFile(path.join(adminDistPath, 'index.html'));
    });
    ```

---

### 📍 Giai đoạn 2: Phát triển Hệ thống APIs & Middleware Bảo mật ở Backend (Ngày 6 - Ngày 10) - [Đã Hoàn Thành]

#### 🔹 Task 2.1: Phát triển Middleware Xác thực Quản trị viên (Admin Guard)
* **File ảnh hưởng:** `/apps/api/src/shared/middlewares/admin.middleware.ts`
* **Nội dung công việc:**
  - [x] Xây dựng bộ lọc `requireAdmin` chặn đứng tất cả người dùng không có vai trò `admin`.
  - [x] Trả về mã lỗi `403 Forbidden` kèm thông báo: `"Quyền truy cập bị từ chối. Bạn không có thẩm quyền truy cập tài nguyên quản trị."`.

#### 🔹 Task 2.2: Xây dựng APIs Quản lý & Đối soát Thanh toán
* **File ảnh hưởng:** `/apps/api/src/routes/admin/payments.ts`, `/apps/api/src/payments/payments.service.ts`
* **Nội dung công việc:**
  - [x] `GET /api/admin/payments`: Lấy danh sách toàn bộ các giao dịch thanh toán để phục vụ đối soát, hỗ trợ lọc theo trạng thái (`pending`, `success`, `failed`).
  - [x] `POST /api/admin/payments/approve`: API nhận diện mã `transactionId`, thực hiện chuyển đổi trạng thái giao dịch sang `success`, cập nhật đơn hàng tương ứng sang `paid` và lưu nhật ký người phê duyệt.

#### 🔹 Task 2.3: Xây dựng APIs Quản trị Kho hàng & Đơn hàng
* **File ảnh hưởng:** `/apps/api/src/routes/admin/products.ts`, `/apps/api/src/routes/admin/orders.ts`
* **Nội dung công việc:**
  - [x] `POST /api/admin/products`: API tạo sản phẩm kèm cấu hình danh sách biến thể (Variant) động. (Đã tích hợp trong `products.controller.ts` & được bảo vệ chặt chẽ bởi `requireRole(['admin'])`).
  - [x] `PUT /api/admin/products/:id`: API cập nhật thông tin sản phẩm và số lượng tồn kho từng biến thể. (Đã có trong `products.controller.ts` & được bảo vệ bởi `requireRole(['admin'])`).
  - [x] `PUT /api/api/admin/orders/:id/status`: API cập nhật trạng thái đơn hàng (`processing`, `shipping`, `delivered`, `cancelled`). (Đã hỗ trợ toàn diện và được bảo mật bởi `requireRole(['admin'])` trong `orders.controller.ts`).

---

### 📍 Giai đoạn 3: Phát triển Giao diện Admin Dashboard (Ngày 11 - Ngày 17) - [Đã Hoàn Thành]

#### 🔹 Task 3.1: Phát triển Giao diện Đăng nhập & Auth State Guard
* **File ảnh hưởng:** `/apps/admin/src/features/auth/...`
* **Nội dung công việc:**
  - [x] Xây dựng màn hình đăng nhập dành riêng cho Admin với tông màu trầm sang trọng chuyên nghiệp.
  - [x] Tích hợp React Router Guard chặn chuyển hướng tới Dashboard nếu phiên làm việc chưa xác thực vai trò Admin.

#### 🔹 Task 3.2: Xây dựng Navigation & Base Layout Dashboard
* **File ảnh hưởng:** `/apps/admin/src/components/layout/...`
* **Nội dung công việc:**
  - [x] Sidebar trái: Menu chuyển đổi linh hoạt giữa các mục: Tổng quan, Đơn hàng, Sản phẩm, Mã giảm giá, Thành viên.
  - [x] Header: Hiển thị thanh tìm kiếm thông minh toàn hệ thống, danh sách thông báo đơn hàng mới đổ về theo thời gian thực, nút đăng xuất tài khoản.

#### 🔹 Task 3.3: Xây dựng Giao diện Đối soát & Duyệt Đơn hàng (Core Operation)
* **File ảnh hưởng:** `/apps/admin/src/features/orders/...`
* **Nội dung công việc:**
  - [x] Trang danh sách đơn hàng có bộ lọc trạng thái thông minh (`Chờ xử lý`, `Chờ chuyển khoản`, `Đang vận chuyển`, `Đã hủy`).
  - [x] Hộp thoại chi tiết đơn hàng: Hiển thị lịch sử giao dịch tương ứng, cung cấp nút **"Xác nhận đã nhận tiền (Duyệt Đơn)"** cho phép kích hoạt nhanh luồng xử lý tự động của Backend.

---

### 📍 Giai đoạn 4: Trực quan hóa Dữ liệu & Nghiệm thu (Ngày 18 - Ngày 21) - [Đã Hoàn Thành]

#### 🔹 Task 4.1: Tích hợp Biểu đồ Thống kê Trực quan (Recharts)
* **File ảnh hưởng:** `/apps/admin/src/features/dashboard/...`
* **Nội dung công việc:**
  - [x] Lắp ráp biểu đồ đường hiển thị biến động doanh thu theo tuần/tháng.
  - [x] Biểu đồ tròn hiển thị tỷ trọng đóng góp doanh thu của từng danh mục sản phẩm (Thiết bị công nghệ, Phụ kiện, Gia dụng).
  - [x] Thiết kế bảng thông tin: Top 5 sản phẩm bán chạy nhất và Danh sách 5 khách hàng mua nhiều nhất.

#### 🔹 Task 4.2: Chạy Thử nghiệm Liên thông Toàn trình (End-to-End Testing)
* **Nội dung công việc:**
  - [x] Đóng vai **Khách hàng** ở ứng dụng `apps/web`: Đặt 1 đơn hàng VietQR trị giá 15,000,000đ, trạng thái đơn hàng ban đầu là `unpaid`.
  - [x] Đăng nhập vai **Quản trị viên** ở ứng dụng `apps/admin`: Truy cập danh sách Đối soát, tìm thấy giao dịch chuyển khoản trùng mã đơn hàng.
  - [x] Thực hiện nhấn **"Duyệt Đơn"**: Kiểm tra trạng thái đơn hàng của khách lập tức chuyển sang `paid` (Đã thanh toán) và biểu đồ doanh thu Admin tự động tăng thêm 15,000,000đ.

---

*Mọi đầu việc kỹ thuật trên đều được khóa chặt các yêu cầu về kiểu dữ liệu (TypeScript) và chuẩn cấu trúc thiết kế, đảm bảo quá trình triển khai luôn ổn định và đạt hiệu năng tối đa.*

---

*Kế hoạch này sẽ đóng vai trò là kim chỉ nam kỹ thuật cho đội ngũ phát triển khi bắt đầu tiến hành mở rộng hệ sinh thái quản trị của TechStore.*
