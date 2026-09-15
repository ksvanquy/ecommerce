# 🎨 TechStore Design System & UI Architecture

> **Hệ thống Thiết kế & Kiến trúc Giao diện Thống nhất cho Nền tảng Thương mại Điện tử TechStore**  
> *Nguyên tắc cốt lõi: Xây dựng Nền tảng Design System & Layout khung trước — Lắp ráp Trang sau. Nghiêm cấm thiết kế trang rời rạc, cảm tính.*

---

## 🏗️ 1. Triết lý Thiết kế & Kiến trúc 3 Tầng Dùng Chung (3-Tier Shared Architecture)

### 1.1 Chiến lược Tái sử dụng Mã nguồn giữa Storefront (Web) & Quản trị (Admin)
Khi ứng dụng mở rộng mô-đun Quản trị (**Admin Portal**), việc cả Storefront (`apps/web`) và Admin Portal (`apps/admin`) áp dụng chiến lược **3-Tier Shared Architecture** giúp cân bằng giữa **tái sử dụng tối đa mã nguồn** và **đáp ứng trải nghiệm đặc thù cho từng nhóm người dùng**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 🟢 TẦNG 1: SHARED CORE (Dùng chung 100% cho cả Web & Admin)            │
 │ - Shared Tokens: Color Palette (slate/blue), Typography, Radius        │
 │ - Core UI Primitives: Button, Input, Badge, Modal, Switch, Card, Toast │
 │ - Shared Utilities: formatCurrency (VNĐ), formatDate, cn()             │
 └───────────────────┬────────────────────────────────┬───────────────────┘
                     │                                │
 ┌───────────────────▼──────────────────┐   ┌─────────▼──────────────────────────┐
 │ 🔵 TẦNG 2A: WEB STOREFRONT PATTERNS  │   │ 🟣 TẦNG 2B: ADMIN DENSE PATTERNS   │
 │ (Tối ưu cho Khách hàng - Visual thoáng)│   │ (Tối ưu cho Quản trị - Mật độ cao) │
 │ - ProductCard, HeroBanner, CartDrawer│   │ - AdminDataTable (Bảng 20-30 dòng) │
 │ - Sticky Navigation Header/Footer    │   │ - AdminSidebar, MetricStatCard     │
 └──────────────────────────────────────┘   └────────────────────────────────────┘
```

### 1.2 Bảng Phân loại Chi tiết Component & Utilities

| Tầng Kiến trúc | Thành phần / Module | Vị trí Đặt (Location) | Đặc điểm & Quy tắc Tái sử dụng |
| :--- | :--- | :--- | :--- |
| **🟢 Tầng 1: Shared Core** | Design Tokens (`blue`, `slate`), `Button`, `Badge`, `Input`, `Card`, `Modal`, `formatCurrency` | `packages/ui/` (`@repo/ui`) & `apps/web/src/utils/` | **Dùng chung 100% Monorepo** giữa các Apps (Web, Admin). Tuyệt đối không tạo bản sao. |
| **🔵 Tầng 2A: Web Storefront** | `Header`, `Footer`, `ProductCard`, `CategoryBar`, `CartDrawer`, `CheckoutProgress` | `apps/web/src/components/` | Tối ưu trải nghiệm thị giác cho người mua hàng (khoảng cách rộng, hình ảnh to, CTA nổi bật). |
| **🟣 Tầng 2B: Admin Dense** | `AdminSidebar`, `AdminDataTable`, `MetricStatCard`, `BulkActionBar`, `OrderEditDrawer` | `apps/admin/src/components/` | Tối ưu mật độ thông tin cao cho nhân viên quản trị (padding nhỏ gọn `py-1`, thao tác nhanh). |

---

## 🎨 2. Hệ màu & Design Tokens (Color Palette)

### 2.1 Màu Chủ đạo (Primary Brand Tokens)
Dùng cho nút hành động chính (Primary CTA), biểu tượng thương hiệu, đường viền kích hoạt (Focus Ring), và điểm nhấn giao diện.

| Token | Utility Class | Mã Hex | Ứng dụng thực tế |
| :--- | :--- | :--- | :--- |
| `primary-50` | `bg-blue-50` | `#EFF6FF` | Background active tab, badge info, alert highlight bg |
| `primary-100` | `bg-blue-100` | `#DBEAFE` | Hover background nhẹ, đường viền phân cách mềm |
| `primary-500` | `bg-blue-500` | `#3B82F6` | Focus ring, biểu tượng chỉ báo |
| `primary-600` | `bg-blue-600` | `#2563EB` | **Primary Button**, Brand Logo, giá trị nhấn mạnh chính |
| `primary-700` | `bg-blue-700` | `#1D4ED8` | Trạng thái Hover của Primary Button |
| `primary-900` | `bg-blue-900` | `#1E3A8A` | Header Hero Banner Gradient, tiêu đề thương hiệu |

### 2.2 Màu Trung tính (Slate Neutral Palette)
Dùng cho nền trang (Canvas), thẻ nội dung (Cards), đường viền (Borders), và văn bản.

| Token | Utility Class | Mã Hex | Môi trường ứng dụng |
| :--- | :--- | :--- | :--- |
| `slate-50` | `bg-slate-50` | `#F8FAFC` | Nền trang phụ, nền thẻ khi hover, footer bottom line |
| `slate-100` | `bg-slate-100` | `#F1F5F9` | Đường viền nhẹ, nền Nút Secondary, input background |
| `slate-200` | `border-slate-200` | `#E2E8F0` | **Đường viền chuẩn** cho Card, Divider, Table border |
| `slate-400` | `text-slate-400` | `#94A3B8` | Text chú thích nhỏ, placeholder input, icon vô hiệu |
| `slate-500` | `text-slate-500` | `#64748B` | Mô tả sản phẩm, phụ đề, thời gian tạo |
| `slate-700` | `text-slate-700` | `#334155` | Nhãn form, văn bản nội dung chính |
| `slate-900` | `text-slate-900` | `#0F172A` | Tiêu đề H1-H4, Tên sản phẩm, Giá tiền nổi bật |

### 2.3 Màu Trạng thái (Semantic Status Tokens)

* **Thành công (Success):** `emerald-600` (Nền badge/thông báo: `emerald-50`, viền: `emerald-200`) — Trạng thái "Đã thanh toán", "Đã giao hàng", "Tồn kho khả dụng".
* **Cảnh báo (Warning):** `amber-600` (Nền: `amber-50`, viền: `amber-200`) — Trạng thái "Đang xử lý", "Chờ xác nhận", "Sắp hết hàng".
* **Nguy hiểm / Lỗi (Danger):** `rose-600` (Nền: `rose-50`, viền: `rose-200`) — Nút Hủy, Đăng xuất, Báo lỗi input, "Hết hàng".
* **Thông tin (Info):** `blue-600` (Nền: `blue-50`, viền: `blue-200`) — Mã giảm giá, mẹo mua sắm, thông báo hệ thống.

---

## 🔤 3. Kiểu chữ & Typography (Typography System)

Sử dụng bộ font không chân chuẩn hệ thống (System Sans-serif / Inter) đảm bảo tốc độ tải tối ưu và độ nét cao trên màn hình Retina.

| Cấp độ | Class Tailwind | Kích thước | Trọng số (Weight) | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Display Title** | `text-3xl sm:text-4xl` | 30px / 36px | `font-extrabold` | Banner khuyến mãi chính, Hero header |
| **Heading 1** | `text-2xl` | 24px | `font-bold` | Tiêu đề trang chính (Tất cả sản phẩm, Chi tiết đơn) |
| **Heading 2** | `text-xl` | 20px | `font-bold` | Tiêu đề khối (Danh mục nổi bật, Giỏ hàng) |
| **Heading 3** | `text-lg` | 18px | `font-bold` | Tên sản phẩm chính trong thẻ Card |
| **Heading 4** | `text-base` | 16px | `font-semibold` | Tiêu đề nhỏ trong Modal, nhãn quan trọng |
| **Body LG** | `text-sm` | 14px | `font-normal / font-medium` | Nội dung mô tả sản phẩm, nhãn form chính |
| **Body MD** | `text-xs` | 12px | `font-normal / font-semibold` | Nút bấm, thông số kỹ thuật, Badge trạng thái |
| **Caption / Small**| `text-[11px]` | 11px | `font-medium` | Thời gian, mã đơn hàng, ghi chú nhỏ bên dưới |

---

## 📏 4. Quy chuẩn Hình học, Bo góc & Đổ bóng (Grid & Elevation)

### 4.1 Quy tắc Bo góc chuẩn (Border Radius)
* **Pill / Badge / Avatar:** `rounded-full` (1000px) — Nút trạng thái, số lượng giỏ hàng badge, Avatar.
* **Modal / Popover Large:** `rounded-2xl` (16px) — Cửa sổ nổi, Thẻ Hero Banner, Dropdown Profile Menu.
* **Cards / Containers:** `rounded-xl` (12px) — Khung sản phẩm, giỏ hàng, bảng thông tin.
* **Buttons / Inputs:** `rounded-lg` (8px) — Nút bấm chuẩn, ô nhập liệu form.

### 4.2 Đổ bóng & Nổi khối (Elevation & Shadows)
* `shadow-2xs` / `shadow-xs`: Đường viền mềm nhẹ cho Nút bấm và Badge.
* `shadow-sm`: Thẻ sản phẩm ở trạng thái bình thường.
* `shadow-md` / `shadow-lg`: Thẻ sản phẩm khi Hover (`hover:shadow-md hover:-translate-y-0.5 transition-all`).
* `shadow-xl`: Modal thông báo, Cart Drawer, Profile Dropdown.

---

## 🏛️ 5. Kiến trúc Layout Toàn cục (Global Layout Architecture)

Tất cả các trang trong TechStore Storefront **bắt buộc** phải tuân thủ chuẩn cấu trúc khung (Layout Shell) duy nhất dưới đây:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Sticky Header (Height: 64px | bg-white/95 backdrop-blur border-b)      │
│  [Logo TechStore]       [Nav Links]       [Cart Badge]  [User Account] │
├────────────────────────────────────────────────────────────────────────┤
│  Main Content Canvas (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6/10)   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Page Content (Banner / Grid / Split Layouts)                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Footer (Value Banner 4-cols + Link Tree + Copyright)                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Quy chuẩn Kích thước & Căn chỉnh (Grid & Container)
* **Chiều rộng tối đa (Max Width):** `max-w-7xl` (1280px) căn giữa bằng `mx-auto`.
* **Padding Lề ngang (Horizontal Margin/Padding):** `px-4 sm:px-6 lg:px-8`.
* **Padding Lề dọc (Vertical Section Padding):** `py-6 sm:py-8 lg:py-10`.
* **Lưới Responsive (Responsive Grid System):**
  * Mobile (`<640px`): 1 Cột (`grid-cols-1 gap-4`).
  * Tablet (`640px - 1024px`): 2-3 Cột (`sm:grid-cols-2 md:grid-cols-3 gap-5`).
  * Desktop (`>1024px`): 4 Cột (`lg:grid-cols-4 gap-6`).

### 5.2 Header Shell (Thanh điều hướng dính)
* Vị trí: `sticky top-0 z-40`.
* Nền: `bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs`.
* Chiều cao: `h-16 flex items-center justify-between`.
* Thành phần chuẩn: Logo thương hiệu (biểu tượng `ShoppingBag` nền xanh), Menu chuyển trang nhanh, Nút mở Giỏ hàng nhanh (kèm Badge số lượng), Menu tài khoản người dùng (Login/Register hoặc Profile Dropdown).

### 5.3 Footer Shell (Chân trang giá trị)
* Vị trí: `mt-auto border-t border-slate-200 bg-white`.
* Khối 1: Banner Cam kết Giá trị (4 cột: Giao hàng toàn quốc, Chính hãng 100%, Đổi trả 7 ngày, Thanh toán linh hoạt).
* Khối 2: Cây liên kết chính (Thông tin công ty, Danh mục nổi bật, Chăm sóc khách hàng, Chính sách).
* Khối 3: Kẻ ngang bản quyền (`© 2026 TechStore`).

---

## 🧩 6. Quy chuẩn Linh kiện UI Cốt lõi (Core UI Components Tier 1 & 2)

### 6.1 Nút bấm (Button Primitive - Tier 1 Shared)
Thành phần tương tác chính, bao gồm 5 Variant và 3 Size chuẩn:

```tsx
// Variants
primary   : bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
secondary : bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400
outline   : border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500
ghost     : text-slate-600 hover:bg-slate-100 hover:text-slate-900
danger    : bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500

// Sizes
sm : text-xs px-3 py-1.5 h-8
md : text-sm px-4 py-2 h-10
lg : text-base px-5 py-2.5 h-12
```

### 6.2 Nhãn trạng thái (Badge Primitive - Tier 1 Shared)
```tsx
success : bg-emerald-50 text-emerald-700 border-emerald-200
warning : bg-amber-50 text-amber-700 border-amber-200
info    : bg-blue-50 text-blue-700 border-blue-200
neutral : bg-slate-100 text-slate-700 border-slate-200
danger  : bg-rose-50 text-rose-700 border-rose-200
```

### 6.3 Thẻ sản phẩm (ProductCard Molecule - Tier 2A Web)
Mọi sản phẩm hiển thị trên trang chủ, danh sách tìm kiếm hay sản phẩm liên quan **bắt buộc** dùng chung mẫu `ProductCard`:
* Khung Card: `bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col`.
* Hình ảnh: Aspect ratio `aspect-square bg-slate-100 overflow-hidden relative`.
* Nhãn danh mục: `text-[11px] font-semibold text-blue-600 uppercase tracking-wider`.
* Tên sản phẩm: `font-bold text-slate-900 text-sm line-clamp-2 hover:text-blue-600`.
* Khối giá & Nút mua: Hiển thị giá VNĐ đậm (`text-base font-extrabold text-slate-900`), kết hợp Nút "Thêm vào giỏ" `bg-blue-600 text-white hover:bg-blue-700`.

---

## 📄 7. Quy chuẩn Lắp ráp Các Trang (Page-Level Assembly Rules)

### 7.1 Trang Danh mục Sản phẩm (`/products`)
```
[Hero Trust Banner]
  ↓
[Category Pill Filter Bar] (Phân loại danh mục đa cấp)
  ↓
[Search & Filter Control Bar] (Ô tìm kiếm + Bộ lọc sắp xếp + Tổng số sản phẩm)
  ↓
[Product Grid] (Lưới 4 cột Desktop / 2 cột Mobile)
  ↓
[Pagination Bar] (Chuyển trang chuẩn 1, 2, 3...)
```

### 7.2 Trang Chi tiết Sản phẩm (`/products/:id`)
```
[Breadcrumb Navigation] (Trang chủ > Danh mục > Tên sản phẩm)
  ↓
[Product Spotlight Split Layout] (2 Cột 50/50 trên Desktop)
   - Cột Trái: Bộ sưu tập hình ảnh sản phẩm góc rộng.
   - Cột Phải: Tên sản phẩm, Badge tồn kho, Mô tả chi tiết, Bảng giá VNĐ, Nút Thêm vào giỏ / Mua ngay.
  ↓
[Technical Specifications Table] (Bảng thông số kỹ thuật)
  ↓
[Related Products Section] (Lưới 4 sản phẩm liên quan cùng danh mục)
```

### 7.3 Trang Giỏ hàng & Thanh toán (`/cart`, `/checkout`)
```
[Checkout Progress Steps] (1. Giỏ hàng -> 2. Thông tin giao hàng -> 3. Hoàn tất)
  ↓
[2-Column Split Layout] (Desktop: 2/3 Danh sách sản phẩm, 1/3 Tóm tắt đơn hàng)
   - Cột Trái: Danh sách sản phẩm (Ảnh, Tên, Số lượng +/-, Giá VNĐ, Nút Xóa).
   - Cột Phải: Sticky Order Summary Card (Tạm tính, Giảm giá, Phí ship, Tổng thanh toán VNĐ, Form Mã giảm giá).
```

### 7.4 Trang Lịch sử Đơn hàng (`/orders`)
```
[Account Hero Summary Header] (Chào khách hàng + Tổng số đơn)
  ↓
[Order Status Filter Tabs] (Tất cả / Chờ xử lý / Đã giao / Đã hủy)
  ↓
[Order Cards Collection] (Mỗi đơn là 1 Card độc lập: Mã đơn #, Ngày đặt, Badge trạng thái, Chi tiết sản phẩm, Tổng tiền VNĐ, Nút Xem chi tiết)
```

---

## 💵 8. Định dạng Tiền tệ & Ngôn ngữ (Localization Rules)

### 8.1 Quy chuẩn Tiền tệ VNĐ
Toàn bộ giá trị tiền tệ trong hệ thống (Sản phẩm, Giỏ hàng, Đơn hàng, Phí vận chuyển, Giảm giá) **bắt buộc** tuân thủ quy tắc:
* Sử dụng duy nhất hàm tiện ích `formatCurrency(amount)` từ `src/utils/currency.ts`.
* Định dạng chuẩn: `8.490.000 VNĐ` (Có dấu chấm phân cách hàng nghìn, kết thúc bằng hậu tố `VNĐ`).
* Mức miễn phí giao hàng toàn quốc: Đơn từ `500.000 VNĐ`.

### 8.2 Chuẩn hóa Tiếng Việt
* Sử dụng thuật ngữ thương mại điện tử Tiếng Việt tự nhiên, chính xác và chuyên nghiệp.
* Thuật ngữ quy chuẩn:
  * `"Thêm vào giỏ hàng"` (không dùng "Add to cart")
  * `"Thanh toán ngay"` (không dùng "Checkout")
  * `"Lịch sử đơn hàng"` (không dùng "Order History")
  * `"Khách hàng thân thiết"` (không dùng "VIP Member")
  * `"Tất cả sản phẩm"` (không dùng "All Products")

---

## 🗺️ 9. Lộ trình Triển khai & Danh sách Task Cụ thể (Roadmap & Actionable Tasks)

Roadmap phát triển được cập nhật theo chiến lược **3-Tier Shared Architecture**:

### 📍 Giai đoạn 1: Chuẩn hóa Shared Core Primitives & Tokens (Tầng 1 — Shared Core)
- [x] **Task 1.1 — Chuẩn hóa Shared Design Tokens:** Khai báo màu `slate` (neutrals) và `blue` (primary) dùng chung cho Web & Admin.
- [x] **Task 1.2 — Hoàn thiện Shared `Button.tsx`:** Support 5 Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), 3 Kích thước, `isLoading` state.
- [x] **Task 1.3 — Hoàn thiện Shared `Badge.tsx`:** Support 5 Semantic Variants (`success`, `warning`, `info`, `neutral`, `danger`).
- [x] **Task 1.4 — Hoàn thiện Shared `Card.tsx`:** Khung container `rounded-2xl`, viền `border-slate-200/80`, bóng nhẹ `shadow-xs`.
- [x] **Task 1.5 — Hoàn thiện Shared `Input.tsx`:** Ô nhập liệu hỗ trợ label, helperText, error state, leading/trailing icons.
- [x] **Task 1.6 — Hoàn thiện Shared `Modal.tsx`:** Cửa sổ nổi hỗ trợ backdrop mờ `backdrop-blur-xs` và nút đóng chuẩn.
- [x] **Task 1.7 — Hoàn thiện Shared Utilities (`currency.ts`):** Hàm `formatCurrency` xuất định dạng `8.490.000 VNĐ` cho cả Web & Admin.

### 📍 Giai đoạn 2: Đóng gói Structural Patterns & Shells cho Web Storefront (Tầng 2A — Web Patterns)
- [x] **Task 2.1 — Đóng gói Navigation `Header.tsx`:** Thanh điều hướng dính đỉnh `sticky top-0 z-40 bg-white/95 backdrop-blur-md` chứa Logo, Menu, Mini-Cart badge và User Dropdown.
- [x] **Task 2.2 — Đóng gói Value Props `Footer.tsx`:** Chân trang 4 cam kết giá trị + cây liên kết danh mục.
- [x] **Task 2.3 — Đóng gói Canvas `MainLayout.tsx`:** Container `max-w-7xl mx-auto px-4/8 py-6/10` cho toàn bộ trang Web.
- [x] **Task 2.4 — Đóng gói Thẻ sản phẩm `ProductCard.tsx`:** Mẫu Card dùng chung trên Trang chủ, Danh mục, Tìm kiếm & Gợi ý.
- [x] **Task 2.5 — Đóng gói Slide-over `CartDrawer.tsx`:** Giỏ hàng nhanh trượt từ cạnh phải.

### 📍 Giai đoạn 3: Lắp ráp & Hoàn thiện Các Trang Web Storefront (Tier 4 Page Views)
- [x] **Task 3.1 — Trang Danh mục Sản phẩm (`ProductList.tsx`, `ProductFiltersBar.tsx` / `/products`):**
  - Tích hợp Hero Trust Banner & Thanh tìm kiếm + Bộ lọc danh mục.
  - Tái sử dụng Lưới sản phẩm `ProductCard` & Phân trang `Pagination`.
- [x] **Task 3.2 — Trang Chi tiết Sản phẩm (`ProductDetailView.tsx` / `/products/:id`):**
  - `BreadcrumbNav` (Trang chủ > Danh mục > Tên sản phẩm).
  - Bố cục Spotlight 2 cột (Bộ sưu tập ảnh + Khối đặt hàng VNĐ).
  - Bảng thông số kỹ thuật sản phẩm & badges cam kết bảo hành.
- [x] **Task 3.3 — Trang Giỏ hàng & Thanh toán (`CartView.tsx`, `CheckoutModal.tsx`, `CartDrawer.tsx`):**
  - Giỏ hàng trượt nhanh `CartDrawer` + Trang giỏ hàng đầy đủ `CartView`.
  - Split Layout 2 cột (Danh sách món + Thẻ Sticky Order Summary).
  - Modal thanh toán COD / QR với form nhập địa chỉ giao hàng.
- [x] **Task 3.4 — Trang Lịch sử Đơn hàng (`OrderHistoryView.tsx` / `/orders`):**
  - Bộ lọc trạng thái đơn hàng (Tất cả, Chờ xử lý, Đã giao, Đã hủy).
  - Card hiển thị mã đơn `#ORD`, ngày đặt, Badge trạng thái chuẩn và tổng tiền VNĐ.
- [x] **Task 3.5 — Trang Tài khoản & Xác thực (`AuthView.tsx`, `LoginForm.tsx`, `RegisterForm.tsx` / `/login`, `/register`, `/profile`):**
  - Form Đăng nhập / Đăng ký dùng lại `Card`, `Input`, `Button`.
  - Giao diện Thông tin cá nhân & Quản lý địa chỉ giao hàng.

### 📍 Giai đoạn 4: Chuẩn bị Khung Linh kiện Mật độ Cao cho Admin Portal (Tầng 2B — Admin Dense Patterns)
- [ ] **Task 4.1 — Chuẩn bị Component `AdminDataTable.tsx`:**
  - Thiết kế Bảng dữ liệu mật độ cao (High Density) hiển thị 20–30 dòng trên màn hình với padding nhỏ gọn (`py-1.5`).
  - Tích hợp phân trang, bộ lọc cột, sắp xếp và chọn nhiều dòng (Bulk Selection).
  - Tái sử dụng `Badge` (cho trạng thái đơn/sản phẩm), `Button` (cho hành động chỉnh sửa/xóa) và `Input` (tìm kiếm).
- [ ] **Task 4.2 — Chuẩn bị Layout Khung Admin (`AdminLayout.tsx` & `AdminSidebar.tsx`):**
  - Bố cục Sidebar thu gọn bên trái + Top Navbar thông báo + Canvas dữ liệu chính.
- [ ] **Task 4.3 — Chuẩn bị Thẻ Chỉ số `MetricStatCard.tsx`:**
  - Thẻ hiển thị doanh thu VNĐ, tổng đơn hàng, số khách hàng mới kèm biểu đồ xu hướng.

### 📍 Giai đoạn 5: Tối ưu Trải nghiệm, Accessibility & Anti-Drift (Quality Assurance)
- [x] **Task 5.1 — Audit 100% Tiền tệ VNĐ:** Rà soát toàn bộ component đảm bảo dùng `formatCurrency()` (dạng `8.490.000 VNĐ`), không sử dụng ký tự `$`.
- [x] **Task 5.2 — Responsive Audit:** Kiểm thử hiển thị mượt mà từ Mobile 375px đến Monitor 1920px.
- [x] **Task 5.3 — Accessibility Audit (WCAG AA):** Tỷ lệ tương phản chữ/nền tối thiểu 4.5:1.
- [x] **Task 5.4 — Build & Lint Verification:** Kiểm thử định kỳ bằng `lint_applet` và `compile_applet`.

---

## 🛡️ 10. Quy tắc Chống Bất đồng nhất (Design Integrity Guardrails)

1. **Không viết Tailwind inline tùy tiện:** Không tự ý dùng các giá trị px lẻ không thuộc hệ thống (như `w-[342px]`, `text-[13px]`, `bg-[#123456]`). Luôn chọn mốc chuẩn trong Tailwind token table (`w-80`, `text-xs/sm/base`, `bg-blue-600`).
2. **Luôn chạy Linter & Build Verification:** Trước khi kết thúc turn code, bắt buộc verify ứng dụng bằng `lint_applet` và `compile_applet`.

---
*Tài liệu Design System & UI Architecture được áp dụng chính thức làm quy chuẩn bắt buộc cho dự án TechStore.*
