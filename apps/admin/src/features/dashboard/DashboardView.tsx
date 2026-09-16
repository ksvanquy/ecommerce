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
  // Cấu hình tính toán biểu đồ SVG thủ công có độ thẩm mỹ cực cao (pixel perfect)
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
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Tổng quan kinh doanh</h2>
        <p className="text-xs text-slate-400">Số liệu cập nhật thời gian thực dựa trên các giao dịch thực tế</p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dòng tiền thực nhận sạch</span>
            </p>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn Hàng Thành Công</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {stats.totalOrders} đơn hàng
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Đã giao và đang xử lý
            </p>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành Viên</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {stats.totalUsers} tài khoản
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Khách hàng đã đăng ký
            </p>
          </div>
        </div>

        {/* Cảnh báo tồn kho */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tồn kho thấp</span>
            <div className={`p-2 rounded-xl border ${stats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700/50'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {stats.lowStockCount} sản phẩm
            </h3>
            <p className="text-[11px] text-amber-400/90 mt-1">
              {stats.lowStockCount > 0 ? 'Cần bổ sung thêm số lượng hàng' : 'Kho hàng đạt mức an toàn'}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue & Analytics Visualization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu biểu đồ SVG */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Xu hướng Doanh thu Tháng</h3>
              <p className="text-[11px] text-slate-500">Doanh số biểu diễn dạng cột phân bố</p>
            </div>
            <span className="text-[11px] bg-slate-800 px-2 py-1 rounded border border-slate-700/50 text-slate-300 font-medium">Năm 2026</span>
          </div>

          <div className="relative pt-4 flex justify-center">
            {/* SVG Chart */}
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + (chartHeight - padding * 2) * (1 - ratio);
                return (
                  <g key={index}>
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x={padding - 5} y={y + 3} fill="#475569" fontSize="9" textAnchor="end">
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
                    {/* Hover tooltip guide line */}
                    <rect
                      x={x - 2}
                      y={padding}
                      width={barWidth + 4}
                      height={chartHeight - padding * 2}
                      fill="transparent"
                      className="group-hover:fill-slate-800/20 rounded transition-colors"
                    />
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(height, 4)}
                      rx="4"
                      fill={index === stats.monthlyRevenue.length - 1 ? '#f59e0b' : '#3b82f6'}
                      className="transition-all duration-300 origin-bottom"
                    />
                    {/* Label */}
                    <text x={x + barWidth / 2} y={chartHeight - 10} fill="#64748b" fontSize="10" textAnchor="middle">
                      {item.month}
                    </text>
                    {/* Mini values on top */}
                    <text x={x + barWidth / 2} y={y - 6} fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.amount / 1000000).toFixed(1)}M
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tỷ trọng theo ngành hàng */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Cơ cấu Ngành hàng</h3>
            <p className="text-[11px] text-slate-500">Tỷ lệ đóng góp doanh thu</p>
          </div>

          <div className="py-6 flex justify-center relative">
            {/* Pie layout visually designed with dynamic colors */}
            <div className="space-y-3 w-full">
              {stats.categoryRevenue.map((cat, index) => {
                const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
                const textColors = ['text-blue-400', 'text-amber-400', 'text-emerald-400', 'text-purple-400'];
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}></span>
                        <span className="text-slate-300 font-medium">{cat.category}</span>
                      </span>
                      <span className={`font-bold ${textColors[index % textColors.length]}`}>{cat.value}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
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

          <div className="pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
            Dữ liệu phân loại tự động
          </div>
        </div>
      </div>

      {/* Bottom area: Low Stock & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Đơn hàng mới nhận</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-normal">{recentOrders.length}</span>
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">Không có đơn hàng nào vừa đặt.</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-white">{order.customerName}</p>
                    <p className="text-[10px] text-slate-500">Mã: {order.id.substring(0, 10).toUpperCase()}... • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-white">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.status === 'cancelled' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Sắp hết hàng trong kho</span>
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Kiểm kê kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                ✨ Tuyệt vời! Toàn bộ sản phẩm đều có số lượng tồn an toàn.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/50 text-slate-400 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-200 truncate max-w-[180px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500">Mã: {p.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-400">{p.inventory} chiếc</p>
                    <span className="text-[9px] text-rose-400/80 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10">Sắp hết hàng</span>
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
