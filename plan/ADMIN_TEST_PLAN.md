# Kế Hoạch Kiểm Thử Chi Tiết Hệ Thống Quản Trị TechStore (Admin Test Plan)

Tài liệu này xác định kịch bản kiểm thử (Test Cases), bộ kiểm thử (Test Suites) và tiêu chí đánh giá chất lượng (Pass/Fail Criteria) cho toàn bộ phân hệ Quản trị Admin của TechStore, đảm bảo đúng chức năng, độ ổn định dữ liệu và phong cách giao diện Flat UI.

---

## 🎯 I. Mục Tiêu & Phạm Vi Kiểm Thử (Test Scope & Objectives)

1. **Phạm vi (Scope):**
   - **Giao diện & Tương tác:** Topbar điều hướng, Bảng tổng quan (Dashboard), Quản lý Sản phẩm/Biến thể/Danh mục/Thương hiệu, Quản lý Đơn hàng, Phê duyệt Thanh toán VietQR, Quản lý Người dùng và Mã giảm giá (Coupons).
   - **Luồng dữ liệu & Nghiệp vụ (Business Logic):** Tính toán tổng doanh thu, cập nhật trạng thái đơn hàng, đối soát dòng tiền chuyển khoản, kiểm tra tồn kho tự động, áp dụng mã voucher.
   - **Xử lý ngoại lệ & Phân quyền (Security & Edge Cases):** Truy cập trái phép người dùng thông thường, nhập dữ liệu lỗi/trống, phản hồi khi mất kết nối backend.

2. **Các cấp độ kiểm thử (Testing Levels):**
   - **Unit Testing:** Kiểm thử các hàm tiện ích (`formatCurrency`, `formatDate`, logic lọc dữ liệu, tính toán phần trăm doanh thu).
   - **Component & UI Testing:** Kiểm thử trạng thái hiển thị của component (Cards, Data Tables, Pagination, Modals, Forms).
   - **Integration / Flow Testing:** Kiểm thử luồng dữ liệu từ khi cập nhật sản phẩm / chuyển trạng thái đơn hàng đến khi phản ánh đúng lên Dashboard và LocalStorage / API mock.

---

## 🧪 II. Danh Sách Các Bộ Kiểm Thử Theo Phân Hệ (Test Suites by Module)

### 📊 Suite 1: Dashboard & Topbar Toàn Cục (Dashboard & Global Navigation)

| Mã Test | Tên Kịch Bản (Test Scenario) | Các Bước Thực Hiện (Steps) | Kết Quả Kỳ Vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-DB-01** | Hiển thị 4 Thẻ Thống Kê (Stat Cards) | 1. Mở trang Admin Dashboard.<br>2. Kiểm tra chỉ số Doanh thu, Đơn hàng, Cảnh báo tồn kho, Chờ duyệt. | Doanh thu chỉ tính các đơn `delivered` + `paid`. Cảnh báo tồn kho đếm đúng số sản phẩm có `stock < 5`. |
| **TC-DB-02** | Trực quan hóa Biểu đồ Xu hướng Doanh Thu | 1. Quan sát biểu đồ SVG cột phân bố doanh thu.<br>2. So sánh dữ liệu doanh thu tháng với danh sách đơn hàng thực tế. | Cột SVG vẽ đúng tỷ lệ chiều cao, có hover tooltip hiện đúng số tiền định dạng VNĐ. |
| **TC-DB-03** | Bảng Cảnh Báo Tồn Kho & Đơn Hàng Mới | 1. Kiểm tra 2 khối danh sách dưới biểu đồ.<br>2. Nhấn nút "Xem tất cả". | Đơn hàng mới sắp xếp theo ngày mới nhất. Nút "Xem tất cả" chuyển hướng chính xác sang Tab tương ứng. |
| **TC-DB-04** | Dropdown "+ Thêm Mới" Trên Topbar | 1. Nhấn nút "+ Thêm Mới" trên Topbar.<br>2. Chọn từng mục: Thêm sản phẩm, Mã giảm giá, Danh mục. | Mở đúng Modal tạo mới tương ứng mà không bị đè gián đoạn màn hình. |
| **TC-DB-05** | Thanh Tìm Kiếm Toàn Cục (Global Search) | 1. Nhập từ khóa tên sản phẩm hoặc mã đơn hàng trên Topbar.<br>2. Nhấn Enter hoặc chờ tự động lọc. | Hệ thống lọc chính xác dữ liệu phù hợp hoặc chuyển sang trang kết quả tìm kiếm. |

---

### 📦 Suite 2: Quản Lý Sản Phẩm, Biến Thể, Danh Mục & Thương Hiệu (Product Catalog)

| Mã Test | Tên Kịch Bản (Test Scenario) | Các Bước Thực Hiện (Steps) | Kết Quả Kỳ Vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-PR-01** | Xem Danh Sách Sản Phẩm & Phân Trang | 1. Mở Tab "Sản phẩm".<br>2. Chuyển đổi giữa chế độ Bảng (Table) và Thẻ (Grid).<br>3. Thử chuyển trang (Pagination). | Dữ liệu hiển thị mượt mà, đúng số lượng items/trang, đường nét Flat UI không bị vỡ bố cục. |
| **TC-PR-02** | Bộ Lọc Theo Danh Mục, Thương Hiệu & Tìm Kiếm | 1. Chọn 1 Danh mục trong dropdown lọc.<br>2. Nhập từ khóa tìm kiếm tên/mã SP. | Bảng danh sách lập tức lọc đúng các sản phẩm thỏa mãn đồng thời bộ lọc và từ khóa. |
| **TC-PR-03** | Chỉnh Sửa Nhanh Giá & Tồn Kho Tại Dòng | 1. Nhấn icon chỉnh sửa nhanh trên dòng sản phẩm.<br>2. Thay đổi Giá hoặc Tồn kho.<br>3. Nhấn Lưu (Check icon). | Giá & Tồn kho được lưu lập tức, hiển thị thông báo thành công, chỉ số Dashboard cập nhật theo. |
| **TC-PR-04** | Thêm Sản Phẩm Mới (Create Product Modal) | 1. Nhấn "+ Thêm Sản Phẩm".<br>2. Điền đầy đủ Form (Tên, Mô tả, Giá, Tồn kho, Chọn Danh mục, URL Ảnh).<br>3. Nhấn "Lưu sản phẩm". | Form validate nếu thiếu thông tin bắt buộc. Khi thành công, sản phẩm mới xuất hiện đầu bảng. |
| **TC-PR-05** | Quản Lý Biến Thể (RAM, SSD, Color) | 1. Mở modal chỉnh sửa chi tiết sản phẩm.<br>2. Thêm biến thể mới (VD: 16GB RAM / 512GB SSD).<br>3. Thay đổi giá riêng và tồn kho cho biến thể. | Biến thể lưu thành công, danh sách biến thể cập nhật đúng cấu hình và số lượng tồn kho. |
| **TC-PR-06** | Quản Lý Danh Mục & Thương Hiệu | 1. Chuyển sang Sub-tab "Danh mục" hoặc "Thương hiệu".<br>2. Thực hiện Thêm mới, Sửa tên và Xóa. | Danh mục/Thương hiệu cập nhật lập tức vào danh sách lựa chọn khi tạo/sửa sản phẩm. |

---

### 🚚 Suite 3: Quản Lý Đơn Hàng & Vận Hành (Order Fulfillment)

| Mã Test | Tên Kịch Bản (Test Scenario) | Các Bước Thực Hiện (Steps) | Kết Quả Kỳ Vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-OR-01** | Lọc Đơn Hàng Theo Trạng Thái (Status Tabs) | 1. Chuyển đổi giữa các tab: `Tất cả`, `Chờ xử lý`, `Đang xử lý`, `Đang giao`, `Đã giao`, `Đã hủy`. | Bảng chỉ hiển thị đơn hàng thuộc đúng trạng thái chọn, có badge đếm số lượng chính xác. |
| **TC-OR-02** | Cập Nhật Nhanh Trạng Thái Đơn Hàng | 1. Chọn dropdown trạng thái tại dòng đơn hàng (VD: `Chờ xử lý` ➔ `Đang giao`). | Trạng thái thay đổi lập tức, thông báo thành công xuất hiện, chuyển tab lọc tương ứng. |
| **TC-OR-03** | Xem Chi Tiết Đơn Hàng (Order Detail Modal) | 1. Nhấn nút "Chi tiết" ở một đơn hàng.<br>2. Kiểm tra thông tin khách hàng, SĐT, Địa chỉ, Danh sách món mua, Tổng tiền. | Thông tin khớp 100% với đơn hàng đã đặt, hiển thị lịch sử thanh toán và trạng thái hiện tại. |
| **TC-OR-04** | Hủy Đơn Hàng (Cancel Order) | 1. Chọn đổi trạng thái đơn hàng sang `Đã hủy`.<br>2. Kiểm tra số lượng tồn kho sản phẩm liên quan. | Đơn hàng chuyển trạng thái `cancelled`, cộng hoàn trả lại số lượng tồn kho sản phẩm tự động. |

---

### 💳 Suite 4: Phê Duyệt & Đối Soát Thanh Toán VietQR / VNPay (Payment Reconciliation)

| Mã Test | Tên Kịch Bản (Test Scenario) | Các Bước Thực Hiện (Steps) | Kết Quả Kỳ Vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-PAY-01** | Danh Sách Giao Dịch Chuyển Khoản | 1. Mở Tab "Thanh Toán & Đối Soát".<br>2. Kiểm tra các cột: Mã giao dịch, Mã đơn hàng, Số tiền, Cổng thanh toán, Trạng thái. | Hiển thị đầy đủ giao dịch VietQR/VNPay với trạng thái `pending`, `success`, `failed`. |
| **TC-PAY-02** | Duyệt Xác Nhận Đã Nhận Tiền VietQR | 1. Tìm giao dịch `pending`.<br>2. Nhấn nút "Xác nhận đã nhận tiền". | Giao dịch chuyển sang `success`, đơn hàng tương ứng cập nhật `paymentStatus = 'paid'`. |
| **TC-PAY-03** | Từ Chối Giao Dịch Không Hợp Lệ | 1. Nhấn nút "Từ chối" ở một giao dịch nghi vấn.<br>2. Xác nhận từ chối. | Giao dịch chuyển sang `failed`, đơn hàng giữ nguyên `unpaid` hoặc bị đánh dấu cảnh báo. |

---

### 👤 Suite 5: Quản Lý Khách Hàng & Mã Giảm Giá (Users & Coupons)

| Mã Test | Tên Kịch Bản (Test Scenario) | Các Bước Thực Hiện (Steps) | Kết Quả Kỳ Vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC-US-01** | Phân Quyền Người Dùng (Role Management) | 1. Mở Quản lý Người dùng.<br>2. Đổi vai trò tài khoản từ `Customer` ➔ `Admin` hoặc ngược lại. | Hệ thống cập nhật vai trò người dùng ngay lập tức, phân quyền truy cập áp dụng tương ứng. |
| **TC-US-02** | Khóa / Kích Hoạt Tài Khoản | 1. Nhấn Toggle khóa tài khoản người dùng.<br>2. Kiểm tra trạng thái tài khoản. | Khách hàng bị khóa sẽ không thể đặt hàng hoặc đăng nhập ở trang Store. |
| **TC-CP-01** | Tạo Mã Giảm Giá Mới (Create Coupon) | 1. Mở Quản lý Mã giảm giá ➔ Nhấn "+ Tạo Mã Mới".<br>2. Nhập Code (VD: `TECH2026`), Chọn Giảm %, Giá trị 10%, Hạn dùng. | Mã giảm giá xuất hiện trong bảng với trạng thái `Đang hoạt động`. |
| **TC-CP-02** | Kiểm Tra Áp Dụng Mã & Số Lượt Sử Dụng | 1. Sử dụng mã `TECH2026` ở trang Checkout của Store.<br>2. Quay lại Admin kiểm tra cột "Số lượt đã dùng". | Số lượt dùng tăng lên 1, giá trị tính toán tiền giảm chính xác theo cấu hình. |

---

## 🛠️ III. Kịch Bản Kiểm Thử Giao Diện & Bảo Mật (UI, Security & Boundary Tests)

1. **Kiểm thử Giao diện Flat UI & Độ phản hồi (Responsive Design):**
   - **Màn hình Desktop (>= 1280px):** Đảm bảo mật độ hiển thị phẳng, các khoảng cách paddings vừa vặn, không xuất hiện thanh cuộn ngang không cần thiết.
   - **Màn hình Tablet & Mobile (< 768px):** Menu điều hướng co gọn thành Hamburger drawer, bảng dữ liệu hỗ trợ cuộn ngang mượt mà.

2. **Kiểm thử Bảo mật & Phân quyền (Security & Access Control):**
   - **Truy cập trái phép:** Giả lập người dùng chưa đăng nhập hoặc tài khoản vai trò `Customer` truy cập đường dẫn `/admin`. Hệ thống phải lập tức chặn và redirect về trang `/login` hoặc thông báo lỗi 403 Forbidden.
   - **Xử lý dữ liệu đầu vào (Input Sanitization):** Nhập ký tự đặc biệt (`<script>alert(1)</script>`, dấu ngoặc đơn/kép) vào ô tìm kiếm và các form tạo sản phẩm. Hệ thống phải encode an toàn, không sinh lỗi XSS.

3. **Kiểm thử Ngoại lệ & Độ tin cậy (Boundary & Exception Tests):**
   - **Tồn kho = 0:** Đảm bảo sản phẩm hết hàng hiển thị nhãn `Hết hàng` màu đỏ phẳng, không cho phép đặt mua tiếp ở trang Store.
   - **Mất kết nối mạng:** Giả lập offline khi thao tác bấm "Lưu sản phẩm" hoặc "Duyệt đơn". Hệ thống phải hiển thị Banner thông báo lỗi màu đỏ dạng Flat UI rõ ràng (`FeedbackBanner`).

---

## 📋 IV. Tiêu Chí Đánh Giá Pass/Fail & Kế Hoạch Triển Khai (Acceptance Criteria)

- **Tiêu chí Đạt (Pass Criteria):**
  - 100% các Test Cases thuộc **Suite 1 đến Suite 5** chạy thành công không có lỗi nghẽn (Blocker/Critical bug).
  - Tất cả các thao tác CRUD (Thêm, Sửa, Xóa, Cập nhật trạng thái) hoạt động ổn định và đồng bộ dữ liệu theo thời gian thực.
  - Giao diện tuân thủ chính xác bộ quy chuẩn **Flat UI & Minimalist Design System** (viền mảnh, màu solid, độ mật độ hiển thị chuẩn).
- **Môi trường chạy Test (Environment):**
  - Trình duyệt: Google Chrome (Desktop & Mobile view), Mozilla Firefox, Apple Safari.
  - Runtime: Container Cloud Run với React + Vite + Express Backend.

---
*Tài liệu Kế hoạch Test Admin này được lập và lưu trữ tại `/plan/ADMIN_TEST_PLAN.md`.*
