# Kế Hoạch Nâng Cấp Component Button (@repo/ui) & Refactor Hệ Thống

## 📌 1. Bối Cảnh & Mục Tiêu

### Bối cảnh:
Trước đây, mã nguồn trong ứng dụng web (`apps/web`) còn tồn tại nhiều vị trí sử dụng trực tiếp thẻ `<button>` HTML nguyên bản kết hợp với các lớp Tailwind CSS viết tay rải rác. Điều này dẫn đến:
- Sự không đồng nhất về diện mạo (Theme/Styling) giữa các trang.
- Khó bảo trì và nâng cấp giao diện tổng thể khi có thay đổi về thiết kế.
- Vi phạm nguyên tắc Design System & Atomic Design trong kiến trúc Monorepo.

### Mục tiêu:
- Nâng cấp `Button.tsx` trong `@repo/ui` trở thành một Primitive Component linh hoạt, hỗ trợ đầy đủ các biến thể (variants) và kích thước (sizes) phổ biến.
- Refactor 100% các thẻ `<button>` trong ứng dụng `apps/web` sang dùng `<Button>` từ gói `@repo/ui`.

---

## 🎨 2. Cấu Trúc Nâng Cấp Button.tsx (`packages/ui/src/Button.tsx`)

### 2.1. Thiết kế Props Interface

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill' | 'tab';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isActive?: boolean;
}
```

### 2.2. Danh Sách Biến Thể (Variants) & Ứng Dụng

| Variant | Mô tả kiểu dáng | Trường hợp sử dụng tiêu chuẩn |
| :--- | :--- | :--- |
| **primary** | Nền xanh `bg-blue-600`, chữ trắng, hiệu ứng hover & shadow nhẹ. | Nút bấm hành động chính (Kích hoạt thanh toán, Đăng ký, Lưu dữ liệu). |
| **secondary** | Nền xám nhạt `bg-slate-100`, chữ xám đậm `text-slate-800`. | Nút hành động phụ, điều hướng thứ cấp. |
| **outline** | Viền mỏng `border-slate-300`, nền trong suốt. | Nút chuyển trang (Pagination), nút xem chi tiết. |
| **danger** | Nền đỏ `bg-red-600`, chữ trắng. | Nút xóa sản phẩm, hủy đơn hàng, đăng xuất. |
| **ghost** | Không nền, đổi màu khi hover (`hover:bg-slate-100`). | Nút icon đóng/mở Modal/Drawer, menu dropdown, nút tăng/giảm số lượng. |
| **pill** | Bo tròn hình viên thuốc (`rounded-full`), tự đổi màu khi `isActive`. | Bộ lọc danh mục sản phẩm, bộ lọc khoảng giá, chọn màu sắc/dung lượng. |
| **tab** | Bo góc vừa `rounded-xl`, chữ đậm (`font-bold`), hỗ trợ `isActive`. | Thanh tab điều hướng chính trên Header (Sản phẩm, Đơn hàng, Giỏ hàng). |

### 2.3. Danh Sách Kích Thước (Sizes)

- **xs** (`px-2.5 py-1 text-xs`): Dùng cho badge nút nhỏ, tăng giảm số lượng, các nút trong không gian hẹp.
- **sm** (`px-3 py-1.5 text-xs`): Dùng cho thanh header, điều hướng tab, menu dropdown.
- **md** (`px-4 py-2 text-sm`): Dùng cho các form nhập liệu chuẩn, nút bấm thông thường.
- **lg** (`px-6 py-3 text-base`): Dùng cho nút hành động nổi bật (Mua ngay, Thanh toán đơn hàng).