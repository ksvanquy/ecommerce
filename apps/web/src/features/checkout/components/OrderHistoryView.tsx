import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../api/useOrders.ts';
import { useCancelOrder } from '../api/useCancelOrder.ts';
import { useCartStore } from '../store/cartStore.ts';
import { useAuthStore } from '../../auth/store/authStore.ts';
import { useLogin } from '../../auth/api/useLogin.ts';
import { Button, Modal } from '@repo/ui';
import { formatCurrency } from '../../../utils/currency.ts';
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import type { Order, OrderStatus } from '../types.ts';

export const OrderHistoryView: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [detailModalOrder, setDetailModalOrder] = useState<Order | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: loginMutate, isPending: isLoggingIn } = useLogin();

  const addItem = useCartStore((state) => state.addItem);
  const setOpenCart = useCartStore((state) => state.setOpen);

  // Fetch orders from backend
  const { data, isLoading, refetch } = useOrders({
    status: selectedStatus === 'all' ? undefined : (selectedStatus as OrderStatus),
    search: searchTerm.trim() || undefined,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const orders = data?.orders || [];

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    setFeedbackMessage(null);

    cancelOrder(cancelModalOrder.id, {
      onSuccess: () => {
        setFeedbackMessage({
          type: 'success',
          text: `Đã hủy đơn hàng #${cancelModalOrder.id} thành công. Toàn bộ số lượng sản phẩm đã được hoàn trả về kho tồn kho.`,
        });
        setCancelModalOrder(null);
        refetch();
      },
      onError: (err: any) => {
        setFeedbackMessage({
          type: 'error',
          text: err?.message || 'Có lỗi xảy ra khi hủy đơn hàng.',
        });
      },
    });
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem(
        {
          id: item.productId,
          name: item.productName,
          price: item.price,
          description: '',
          category: 'electronics',
          inventory: 99,
          imageUrl: item.productImage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        item.quantity,
      );
    });
    setOpenCart(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Chờ xử lý
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3 h-3 text-blue-500" />
            Đang đóng gói
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3 h-3 text-indigo-500" />
            Đang giao hàng
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Đã giao thành công
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full py-2">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-400/20 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-400/30">
                TechStore Quản Lý
              </span>
              <span className="text-slate-300 text-xs font-medium">
                Quản lý & Theo dõi Đơn hàng
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2 tracking-tight">
              Lịch sử Đơn hàng
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Theo dõi tình trạng đơn hàng đã đặt, tiến độ giao nhận, thông tin thanh toán và quản lý yêu cầu hủy đơn hàng.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feedback Alert if Cancelled */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between text-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold ml-4 underline opacity-70 hover:opacity-100 p-0 hover:bg-transparent inline h-auto"
          >
            Đóng
          </Button>
        </div>
      )}

      {/* Guest Mode Notification & Quick Login */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Chế độ Khách (Chưa đăng nhập)
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                Để bảo mật quyền riêng tư, danh sách đơn hàng cá nhân chỉ hiển thị khi bạn đăng nhập tài khoản. Khách vãng lai có thể tra cứu đơn hàng bằng <strong>Mã đơn (#ORD-...)</strong> hoặc <strong>Số điện thoại</strong> ở ô tìm kiếm.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              isLoading={isLoggingIn}
              onClick={() => loginMutate({ email: 'customer@ecommerce.com', password: 'password123' })}
              className="w-full sm:w-auto text-xs"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              <span>Đăng nhập Demo (Khách hàng)</span>
            </Button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: 'all', label: 'Tất cả đơn' },
            { id: 'pending', label: 'Chờ xử lý' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'shipped', label: 'Đang giao' },
            { id: 'delivered', label: 'Đã giao' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tra cứu mã đơn #ORD, SĐT..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải danh sách đơn hàng từ CSDL...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {searchTerm ? 'Không tìm thấy đơn hàng phù hợp' : !isAuthenticated ? 'Chưa có đơn hàng nào được hiển thị' : 'Bạn chưa có đơn hàng nào'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {!isAuthenticated
                ? 'Đăng nhập vào tài khoản để xem các đơn hàng đã đặt của bạn, hoặc nhập chính xác Mã đơn hàng / Số điện thoại để tra cứu.'
                : 'Bạn chưa có đơn hàng nào phù hợp với bộ lọc hiện tại. Hãy thêm sản phẩm vào giỏ và tiến hành đặt hàng nhé.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginMutate({ email: 'customer@ecommerce.com', password: 'password123' })}
                className="text-xs"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Đăng nhập tài khoản Demo
              </Button>
            )}
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    #{order.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {order.paymentMethod === 'cod' ? 'COD (Tiền mặt)' : 'Chuyển khoản QR'}
                  </span>
                </div>
              </div>

              {/* Order Card Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Items List */}
                <div className="lg:col-span-8 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.productName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                          <span>{formatCurrency(item.price)}</span>
                          <span>×</span>
                          <span>{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {formatCurrency(item.subtotal || item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Recipient & Address preview */}
                  <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <strong>{order.customerName}</strong> ({order.customerPhone})
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-md">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{order.shippingAddress}</span>
                    </span>
                  </div>
                </div>

                {/* Price Breakdown & Actions */}
                <div className="lg:col-span-4 bg-slate-50/50 border border-slate-200/70 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span className="font-mono text-slate-900">{formatCurrency(order.subtotal)}</span>
                    </div>

                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Giảm giá ({order.couponCode}):</span>
                        <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span className="font-mono text-slate-900">
                        {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                      <span className="text-base font-bold text-blue-600 font-mono">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setDetailModalOrder(order)}
                    >
                      <span>Xem chi tiết</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      <span>Mua lại</span>
                    </Button>

                    {order.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="text-xs ml-auto"
                        onClick={() => setCancelModalOrder(order)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        <span>Hủy đơn</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title="Xác nhận Hủy Đơn Hàng"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Bạn có chắc chắn muốn hủy đơn #{cancelModalOrder?.id}?</p>
              <p className="mt-1 text-amber-800/90 leading-relaxed">
                Khi xác nhận hủy, hệ thống sẽ thực thi hoàn trả toàn bộ số lượng sản phẩm của đơn hàng về kho lưu trữ, cập nhật trạng thái đơn thành <strong>Đã hủy (cancelled)</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isCancelling}
              onClick={() => setCancelModalOrder(null)}
            >
              Giữ lại đơn hàng
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
            >
              {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detailed Order Modal */}
      <Modal
        isOpen={!!detailModalOrder}
        onClose={() => setDetailModalOrder(null)}
        title={`Chi tiết đơn hàng #${detailModalOrder?.id}`}
        size="md"
      >
        {detailModalOrder && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Thời gian đặt hàng
                </span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {new Date(detailModalOrder.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div>{getStatusBadge(detailModalOrder.status)}</div>
            </div>

            {/* Address and Delivery Info */}
            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-200">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Địa chỉ nhận hàng
              </span>
              <p className="font-semibold text-slate-900">
                {detailModalOrder.customerName} • {detailModalOrder.customerPhone}
              </p>
              <p className="text-slate-600">{detailModalOrder.shippingAddress}</p>
              {detailModalOrder.customerNote && (
                <p className="text-slate-500 italic text-[11px] pt-1">
                  Ghi chú: "{detailModalOrder.customerNote}"
                </p>
              )}
            </div>

            {/* Items */}
            <div>
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-2">
                Danh sách sản phẩm ({detailModalOrder.items.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {detailModalOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={it.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={it.productName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{it.productName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {formatCurrency(it.price)} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-900 shrink-0">
                      {formatCurrency(it.subtotal || it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span className="font-mono text-slate-900">{formatCurrency(detailModalOrder.subtotal)}</span>
              </div>
              {detailModalOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Mã giảm giá ({detailModalOrder.couponCode}):</span>
                  <span className="font-mono">-{formatCurrency(detailModalOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng:</span>
                <span className="font-mono text-slate-900">
                  {detailModalOrder.shippingFee === 0 ? 'Miễn phí' : formatCurrency(detailModalOrder.shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-base font-bold text-blue-600 font-mono">
                  {formatCurrency(detailModalOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalOrder(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
