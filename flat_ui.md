thiết kế Flat UI (Flat Design) nói chung tập trung vào sự tối giản, loại bỏ các chi tiết trang trí phức tạp để ưu tiên tối đa cho tính năng và trải nghiệm người dùng.

Các tiêu chuẩn kỹ thuật và trực quan quan trọng gồm:

1. Không sử dụng hiệu ứng giả chiều sâu (No Skeuomorphism)
Loại bỏ: Tuyệt đối không dùng hiệu ứng đổ bóng phức tạp (complex shadows), hiệu ứng 3D, dập nổi (emboss), vân chất liệu (vân gỗ, da, kim loại) hay hiệu ứng chuyển màu rực rỡ (heavy gradients).

Bản chất: Mọi thành phần đều được thể hiện dưới dạng 2 chiều (2D), phẳng phắn, rõ ràng.

2. Sử dụng màu sắc phẳng và tương phản cao (Flat & Bold Colors)
Sử dụng các màu đơn sắc (solid colors) tươi sáng, rõ ràng.

Bảng màu thường có độ tương phản cao để làm nổi bật các trạng thái quan trọng (như nút bấm chính - primary button, trạng thái active) mà không cần dựa vào bóng đổ.

3. Tối ưu hóa khoảng trắng (Whitespace)
Thay vì dùng nhiều đường viền nặng nề để ngăn cách các khu vực, Flat UI sử dụng khoảng trắng (whitespace) làm công cụ chính để tạo ranh giới, giúp giao diện thoáng đãng, dễ nhìn và không bị ngộp thở.

4. Kiểu chữ rõ ràng, tối giản (Clean Typography)
Ưu tiên các dòng font chữ không chân (Sans-serif) hiện đại, sạch sẽ, dễ đọc trên mọi kích thước màn hình.

Phân cấp hệ thống chữ (Heading, Body, Caption) cực kỳ rõ ràng qua kích thước và độ đậm nhạt (font-weight).

5. Biểu tượng và thành phần đồ họa tối giản (Minimalist Icons & Elements)
Icon được thiết kế dạng đường nét đơn giản (line icons) hoặc các khối hình học phẳng trực quan.

Các yếu tố tương tác (như nút bấm, ô input, dropdown) có cấu trúc gọn gàng, đồng bộ về chiều cao và góc bo (ví dụ: dùng chung một chuẩn bo góc rounded-md hoặc rounded-lg).

6. Đề cao tính năng và nội dung (Content-First)
Loại bỏ mọi chi tiết trang trí thừa thãi không phục vụ cho mục đích chuyển đổi hoặc đọc hiểu của người dùng. Mọi yếu tố xuất hiện trên màn hình đều phải có công dụng rõ ràng.

---

## Kế hoạch triển khai thực tế (Implementation Plan) cho TechStore (Audited vs Codebase)

Để đưa toàn bộ ứng dụng TechStore về chuẩn Flat UI đồng nhất, nhóm kỹ thuật đã thực hiện kiểm tra thực tế (audit) trên cấu trúc mã nguồn hiện tại và xây dựng lộ trình hành động (Actionable Tasks) chi tiết dưới đây:

### [ĐÃ THỰC HIỆN 100%] Task 1: Loại bỏ đổ bóng và dải màu Gradient (Zero Shadows & Solid Colors)
* **Trạng thái**: Đã thực hiện hoàn tất
* **Phạm vi tác động (Scope)**: Các tệp giao diện khung cấu trúc lớn của hệ thống.
* **Chi tiết kỹ thuật**:
  * **Header (`/apps/web/src/components/layout/Header.tsx`)**:
    * *Hiện tại*: Logo thương hiệu dùng `bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600` và `shadow-sm`.
    * *Thay đổi Flat*: Chuyển logo sang màu đơn sắc phẳng `bg-blue-600` và xóa `shadow-sm`.
    * *Nút chức năng*: Loại bỏ các hiệu ứng hover nổi và bóng mờ.
  * **Khung layout chính (`/apps/web/src/routes/index.tsx`)**:
    * *Thanh danh mục Sticky*: Loại bỏ đổ bóng nếu có, dùng đường kẻ phân tách mỏng đơn sắc `border-b border-slate-100` trên nền xám mát `bg-slate-50/90`.
  * **Thẻ giỏ hàng nhỏ trên Header**: Xóa bỏ thuộc tính đổ bóng mờ góc (`shadow-xl`) của popover giỏ hàng nếu đang hoạt động.

### [ĐÃ THỰC HIỆN 100%] Task 2: Phẳng hóa Thẻ sản phẩm (`ProductCard.tsx`)
* **Trạng thái**: Đã thực hiện hoàn tất
* **Phạm vi tác động (Scope)**: `/apps/web/src/features/products/components/ProductCard.tsx`
* **Chi tiết kỹ thuật**:
  * *Lớp thẻ bao ngoài (Dòng 40)*:
    * *Hiện tại*: `className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col relative"`
    * *Thay đổi Flat*: Đưa về phẳng hoàn toàn bằng cách loại bỏ `hover:shadow-md`. Thẻ khi hover sẽ chỉ đổi màu viền sang sắc xanh phẳng dịu `hover:border-blue-300` và màu nền nhạt `hover:bg-slate-50/30`.
  * *Hộp chứa ảnh (Dòng 45)*:
    * *Hiện tại*: `bg-slate-50` kết hợp bo viền ảnh.
    * *Thay đổi Flat*: Giữ nguyên nền phẳng `bg-slate-50` nhưng không sử dụng bất kỳ lớp phủ bóng đổ mờ (`shadow-2xs`) cho hình ảnh sản phẩm.
  * *Hộp chứa nhãn dán (Dòng 66 & 70)*:
    * *Hiện tại*: Badge dùng `shadow-2xs`.
    * *Thay đổi Flat*: Loại bỏ triệt để bóng mờ `shadow-2xs` trên các badge thương hiệu và danh mục. Badge thương hiệu dùng nền `bg-blue-100` chữ xanh `text-blue-700`, Badge danh mục dùng nền xám phẳng `bg-slate-100` chữ xám sẫm `text-slate-650`.

### [ĐÃ THỰC HIỆN 100%] Task 3: Đồng bộ hóa nút bấm và hộp nhập liệu (Buttons & Inputs)
* **Trạng thái**: Đã thực hiện hoàn tất
* **Phạm vi tác động (Scope)**: Toàn bộ nút bấm tại các màn hình:
  * Thẻ sản phẩm (`ProductCard.tsx`)
  * Chi tiết sản phẩm (`ProductDetailView.tsx` nếu có)
  * Giỏ hàng (`CartView.tsx`)
  * Thanh toán (`CheckoutView.tsx`)
* **Chi tiết kỹ thuật**:
  * **Nút thêm giỏ hàng (ProductCard.tsx - Dòng 116)**:
    * *Hiện tại*: Sử dụng trạng thái `addedAnimation` đổi sang `bg-emerald-600 hover:bg-emerald-700`.
    * *Thay đổi Flat*: Đảm bảo nút ở cả hai trạng thái đều phẳng hoàn toàn không có bóng đổ, dùng góc bo chuẩn `rounded-xl`.
  * **Nút bấm hành động chính (CartView.tsx / CheckoutView.tsx)**:
    * *Thay đổi Flat*: Sử dụng thuộc tính `rounded-xl`, nền màu đơn sắc `bg-blue-600`, khi hover chuyển sang `bg-blue-700` (đổi màu phẳng đơn thuần, không hiệu ứng 3D).
  * **Hộp nhập liệu (Inputs)**:
    * *Hiện tại*: Có thể sử dụng bóng đổ nội bộ khi focus.
    * *Thay đổi Flat*: Thiết lập nét vẽ viền thẳng phẳng `border-slate-200/60`, khi focus chuyển viền sang `border-blue-500` và tô nền nhẹ `bg-blue-50/10` để phản hồi thị giác mà không cần bất kỳ lớp đổ bóng nào.

### [ĐÃ THỰC HIỆN 100%] Task 4: Tái thiết kế Whitespace và cấu trúc ngăn cách phẳng
* **Trạng thái**: Đã thực hiện hoàn tất
* **Phạm vi tác động (Scope)**: Các trang đơn chức năng:
  * `/apps/web/src/features/checkout/components/CartView.tsx`
  * `/apps/web/src/features/checkout/components/CheckoutView.tsx`
  * `/apps/web/src/features/checkout/components/OrderHistoryView.tsx`
* **Chi tiết kỹ thuật**:
  * *Phẳng hóa màn hình*: Thay vì xếp các mục thanh toán chồng chéo trong nhiều lớp hộp chứa dày đặc có bóng đổ, chúng ta sẽ dàn trải thông tin phẳng trên nền xám siêu sáng `bg-slate-50`.
  * *Khoảng đệm tự nhiên*: Thay thế các dải phân cách xám đậm bằng khoảng trống cách biệt tự nhiên `space-y-6` hoặc `space-y-8`. Các vùng dữ liệu (Danh sách sản phẩm trong giỏ, Tóm tắt đơn hàng, Thông tin giao nhận) được phân tách bằng màu nền trắng phẳng `bg-white` tinh tươm.
  * *Bo góc song song*: Tính toán bo góc hộp bên trong chính xác theo quy luật `Góc bo con = Góc bo ngoài - Padding` để tạo độ đồng điệu thẩm mỹ cao nhất.

### [ĐÃ THỰC HIỆN 100%] Task 5: Chuẩn hóa hệ thống Typography phân cấp phẳng
* **Trạng thái**: Đã thực hiện hoàn tất
* **Phạm vi tác động (Scope)**: Toàn bộ mã nguồn hiển thị văn bản.
* **Chi tiết kỹ thuật**:
  * Tiêu đề chính h1, h2, h3 dùng màu tối sẫm tuyệt đối `text-slate-900` hoặc `text-slate-950` để làm điểm neo thị giác.
  * Văn bản mô tả sản phẩm và điều khoản sử dụng màu xám phẳng `text-slate-500` hoặc `text-slate-600` với chiều cao dòng thoáng đạt `leading-relaxed` (khoảng 1.62) giúp mắt người đọc lướt nhanh mà không bị mỏi.
  * Loại bỏ hoàn toàn các ký tự trang trí thừa thãi không chức năng để ưu tiên hiển thị nội dung thuần khiết (Content-First).
