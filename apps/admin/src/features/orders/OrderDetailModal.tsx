import React from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  PackageCheck,
  Ban,
  ShieldCheck,
  RefreshCw,
  Calendar,
  Landmark,
} from 'lucide-react';
import { Order, PaymentTransaction, OrderStatus } from '@repo/shared-types';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  transactions: PaymentTransaction[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onApprovePayment: (transactionId: string) => Promise<void>;
  isUpdatingStatus: boolean;
  isApproving: boolean;
}

export default function OrderDetailModal({
  isOpen,
  order,
  transactions,
  onClose,
  onUpdateStatus,
  onApprovePayment,
  isUpdatingStatus,
  isApproving,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã giao (Delivered)</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>Đang giao (Shipped)</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Đang xử lý (Processing)</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Đã hủy (Cancelled)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Chờ xử lý (Pending)</span>
          </span>
        );
    }
  };

  const linkedTransactions = transactions.filter((tx) => tx.orderId === order.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Chi Tiết Đơn Hàng #{order.id.substring(0, 12).toUpperCase()}
              </h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian đặt: {formatDate(order.createdAt)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer border-none transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-medium flex-1">
          {/* Action Status Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Cập nhật trạng thái đơn hàng:
            </label>
            <div className="flex items-center gap-3">
              <select
                value={order.status}
                disabled={isUpdatingStatus}
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-xs font-bold text-slate-900 py-2.5 px-3 rounded-xl outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="pending">Chờ xử lý (Pending)</option>
                <option value="processing">Đang đóng gói (Processing)</option>
                <option value="shipped">Đang giao hàng (Shipped)</option>
                <option value="delivered">Đã giao hàng (Delivered)</option>
                <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2.5 shadow-2xs">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông tin khách hàng</span>
              </h4>
              <div className="space-y-1.5 text-slate-700 text-xs">
                <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                <p className="flex items-center gap-2 text-slate-600 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{order.customerPhone}</span>
                </p>
                {order.userId && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    User ID: {order.userId}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2.5 shadow-2xs">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Địa chỉ giao hàng</span>
              </h4>
              <p className="text-slate-700 text-xs leading-relaxed font-medium">
                {order.shippingAddress || 'Không có địa chỉ'}
              </p>
              {order.customerNote && (
                <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600 italic">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Ghi chú: "{order.customerNote}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Sản phẩm trong đơn ({order.items.length} món)</span>
              <span className="text-slate-900 font-bold">Tổng tiền: {formatCurrency(order.totalAmount)}</span>
            </h4>

            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center font-extrabold text-slate-400 text-xs">
                      ×{item.quantity}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Đơn giá: {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-slate-900 text-xs">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Audit Section */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Phương thức &amp; Trạng thái thanh toán</span>
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {order.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div>
                <span className="text-slate-400 text-[11px] block">Hình thức:</span>
                <span className="font-bold text-slate-800 uppercase font-mono">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Tổng giá trị:</span>
                <span className="font-extrabold text-blue-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Linked Online Payment Transactions */}
            {order.paymentMethod !== 'cod' && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dòng tiền chuyển khoản VietQR / Ngân hàng</span>
                </span>

                {linkedTransactions.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-800 text-[11px] rounded-xl border border-amber-200 font-medium">
                    Chưa tìm thấy bản ghi giao dịch thanh toán trực tuyến cho đơn hàng này.
                  </div>
                ) : (
                  linkedTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[11px] text-blue-600 font-bold">
                          Mã GD: {tx.transactionCode}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.status === 'success' ? 'Thành công (Kế toán đã duyệt)' : 'Chờ kiểm khoản'}
                        </span>
                      </div>
                      {tx.status === 'pending' && (
                        <button
                          onClick={() => onApprovePayment(tx.id)}
                          disabled={isApproving}
                          className="w-full py-2 mt-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 text-xs border-none shadow-2xs"
                        >
                          {isApproving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                          <span>Xác Nhận Đã Nhận Tiền (Duyệt Đơn)</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
