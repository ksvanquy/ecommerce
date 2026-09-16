import React from 'react';
import { DollarSign, ShoppingBag, Users, Layers, AlertTriangle, TrendingUp, ArrowRight, Package } from 'lucide-react';
import { AdminStats, AdminTab } from '../../types.ts';
import { Product, Order } from '@repo/shared-types';

interface DashboardViewProps {
  stats: AdminStats;
  products: Product[];
  orders: Order[];
  onNavigate: (tab: AdminTab) => void;
}

export default function DashboardView({ stats, products, orders, onNavigate }: DashboardViewProps) {
  // Cấu hình tính toán biểu đồ SVG thủ công có độ thẩm mỹ cao
  const maxMonthlyRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.amount), 1);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;

  // Top 5 sản phẩm bán chạy nhất / tồn kho thấp
  const lowStockProducts = products.filter((p) => p.inventory < 10).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Tổng quan kinh doanh</h2>
        <p className="text-xs text-slate-500 font-medium">Số liệu thực tế cập nhật theo thời gian thực từ cửa hàng TechStore</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dòng tiền thực nhận sạch</span>
            </p>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Đơn Hàng Thành Công</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalOrders} đơn hàng
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Đã giao &amp; đang vận chuyển
            </p>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Thành Viên</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalUsers} tài khoản
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Thành viên hệ thống TechStore
            </p>
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tồn kho thấp</span>
            <div className={`p-2.5 rounded-xl border ${stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.lowStockCount} sản phẩm
            </h3>
            <p className={`text-[11px] font-semibold mt-1 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {stats.lowStockCount > 0 ? 'Cần bổ sung thêm số lượng hàng' : 'Kho hàng đạt mức an toàn'}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue & Analytics Visualization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu biểu đồ SVG */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Xu hướng Doanh thu Tháng</h3>
              <p className="text-[11px] text-slate-500 font-medium">Doanh số biểu diễn dạng cột phân bố</p>
            </div>
            <span className="text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-700 font-bold">Năm 2026</span>
          </div>

          <div className="relative pt-4 flex justify-center">
            {/* SVG Chart */}
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + (chartHeight - padding * 2) * (1 - ratio);
                return (
                  <g key={index}>
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x={padding - 5} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end">
                      {ratio === 0 ? '0' : ratio === 1 ? 'Max' : `${ratio * 100}%`}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {stats.monthlyRevenue.map((item, index) => {
                const barWidth = 36;
                const gap = (chartWidth - padding * 2 - barWidth * stats.monthlyRevenue.length) / (stats.monthlyRevenue.length - 1);
                const x = padding + index * (barWidth + gap);
                const height = ((chartHeight - padding * 2) * item.amount) / maxMonthlyRevenue;
                const y = chartHeight - padding - height;

                return (
                  <g key={index} className="group cursor-pointer">
                    {/* Hover guide */}
                    <rect
                      x={x - 2}
                      y={padding}
                      width={barWidth + 4}
                      height={chartHeight - padding * 2}
                      fill="transparent"
                      className="group-hover:fill-blue-50/50 rounded transition-colors"
                    />
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(height, 4)}
                      rx="6"
                      fill={index === stats.monthlyRevenue.length - 1 ? '#2563eb' : '#3b82f6'}
                      className="transition-all duration-300 origin-bottom hover:opacity-90"
                    />
                    {/* Label */}
                    <text x={x + barWidth / 2} y={chartHeight - 8} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle">
                      {item.month}
                    </text>
                    {/* Mini values on top */}
                    <text x={x + barWidth / 2} y={y - 6} fill="#1e293b" fontSize="9" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.amount / 1000000).toFixed(1)}M
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tỷ trọng theo ngành hàng */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Cơ cấu Ngành hàng</h3>
            <p className="text-[11px] text-slate-500 font-medium">Tỷ lệ đóng góp doanh thu</p>
          </div>

          <div className="py-6 flex justify-center relative">
            <div className="space-y-3.5 w-full">
              {stats.categoryRevenue.map((cat, index) => {
                const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500'];
                const textColors = ['text-blue-600', 'text-indigo-600', 'text-emerald-600', 'text-purple-600'];
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}></span>
                        <span className="text-slate-700 font-semibold">{cat.category}</span>
                      </span>
                      <span className={`font-extrabold ${textColors[index % textColors.length]}`}>{cat.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]}`}
                        style={{ width: `${cat.value}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            Dữ liệu phân loại tự động từ kho hàng
          </div>
        </div>
      </div>

      {/* Bottom area: Low Stock & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Đơn hàng mới nhận</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">{recentOrders.length}</span>
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Không có đơn hàng nào vừa đặt.</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 text-xs transition">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Mã: {order.id.substring(0, 10).toUpperCase()}... • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      order.status === 'cancelled' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {order.status === 'pending' ? 'Chờ duyệt' :
                       order.status === 'processing' ? 'Đang xử lý' :
                       order.status === 'shipped' ? 'Đang giao' :
                       order.status === 'delivered' ? 'Thành công' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Sắp hết hàng trong kho</span>
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Kiểm kê kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl font-medium">
                ✨ Tuyệt vời! Toàn bộ sản phẩm đều có số lượng tồn kho an toàn.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 text-xs transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 shrink-0 shadow-2xs">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 truncate max-w-[180px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Mã: {p.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-rose-600">{p.inventory} chiếc</p>
                    <span className="text-[9px] text-rose-700 bg-rose-50 font-bold px-1.5 py-0.5 rounded border border-rose-200">Sắp hết hàng</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
