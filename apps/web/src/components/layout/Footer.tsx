import React from 'react';
import { ShoppingBag, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white text-xs text-slate-600">
      {/* Simplified main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">TechStore</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Hệ sinh thái công nghệ số và phong cách sống hàng đầu với trải nghiệm thanh toán và dịch vụ bảo hành tốt nhất.
          </p>
        </div>

        {/* Minimalist Contact & Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-[11px] text-slate-500 shrink-0">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-slate-700">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Hotline: 1900 6868</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email: support@techstore.vn</span>
            </p>
          </div>

          <div className="h-px sm:h-8 w-12 sm:w-px bg-slate-200" />

          <div className="flex flex-wrap gap-x-4 gap-y-2 font-medium text-slate-600">
            <span className="hover:text-blue-600 cursor-pointer transition">Chính sách bảo hành</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Quy định đổi trả</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Điều khoản dịch vụ</span>
          </div>
        </div>
      </div>

      {/* Copyright line */}
      <div className="border-t border-slate-100 py-3 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
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
