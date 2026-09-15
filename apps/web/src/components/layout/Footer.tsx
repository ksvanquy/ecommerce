import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white text-xs text-slate-600">
      {/* Value props banner */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Giao hàng toàn quốc</p>
              <p className="text-[11px] text-slate-500">Miễn phí cho đơn từ $200</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Chính hãng 100%</p>
              <p className="text-[11px] text-slate-500">Bảo hành 12-24 tháng</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Đổi trả 7 ngày</p>
              <p className="text-[11px] text-slate-500">Nếu có lỗi nhà sản xuất</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Thanh toán linh hoạt</p>
              <p className="text-[11px] text-slate-500">COD, Chuyển khoản, Thẻ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">TechStore</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ sinh thái mua sắm công nghệ số và phong cách sống hàng đầu với trải nghiệm thanh toán và bảo hành tốt nhất.
          </p>
          <div className="space-y-1 text-[11px] text-slate-500">
            <p className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Hotline: 1900 6868 (8:00 - 21:00)</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Hỗ trợ: support@techstore.vn</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Danh mục nổi bật</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="hover:text-blue-600 transition cursor-pointer">Điện thoại &amp; Thiết bị di động</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Laptop &amp; Máy tính xách tay</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Tai nghe &amp; Thiết bị âm thanh</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Đồng hồ &amp; Thiết bị thông minh</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Phụ kiện &amp; Cáp sạc cao cấp</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Chăm sóc khách hàng</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="hover:text-blue-600 transition cursor-pointer">Hướng dẫn đặt hàng trực tuyến</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Chính sách bảo hành sản phẩm</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Chính sách vận chuyển &amp; giao nhận</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Quy định đổi trả &amp; hoàn tiền</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Câu hỏi thường gặp (FAQ)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Chính sách &amp; Bảo mật</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="hover:text-blue-600 transition cursor-pointer">Điều khoản dịch vụ</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Chính sách bảo mật thông tin</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Phương thức thanh toán bảo mật</li>
            <li className="hover:text-blue-600 transition cursor-pointer">Hệ thống phân phối ủy quyền</li>
          </ul>
        </div>
      </div>

      {/* Copyright line */}
      <div className="border-t border-slate-200 py-4 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 TechStore. Bản quyền thuộc về TechStore E-commerce.</p>
          <p className="flex items-center space-x-2">
            <span>An toàn</span>
            <span>•</span>
            <span>Chính hãng</span>
            <span>•</span>
            <span>Tiện lợi</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
