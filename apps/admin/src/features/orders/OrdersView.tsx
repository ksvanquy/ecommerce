import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Order, PaymentTransaction, OrderStatus } from '@repo/shared-types';
import axios from 'axios';
import OrderDetailModal from './OrderDetailModal.tsx';

interface OrdersViewProps {
  orders: Order[];
  transactions: PaymentTransaction[];
  token: string;
  onRefresh: () => void;
}

export default function OrdersView({ orders, transactions, token, onRefresh }: OrdersViewProps) {
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'transactions'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Calculate status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (o.status && counts[o.status as keyof typeof counts] !== undefined) {
        counts[o.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [orders]);

  const handleApproveTransaction = async (transactionId: string) => {
    setIsApproving(transactionId);
    setFeedbackMsg(null);
    try {
      const response = await axios.post(
        '/api/admin/payments/approve',
        { transactionId },
        getHeaders()
      );

      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: 'Phê duyệt giao dịch thành công! Đơn hàng liên đới đã tự động kích hoạt luồng vận chuyển (Paid & Processing).',
        });
        onRefresh();
        if (selectedOrder) {
          const updated = orders.find((o) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Phê duyệt thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể liên lạc với Backend.',
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    setFeedbackMsg(null);
    try {
      const response = await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        getHeaders()
      );

      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Cập nhật trạng thái đơn hàng sang "${newStatus}" thành công!`,
        });
        onRefresh();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
        }
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Cập nhật trạng thái thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-3 animate-fade-in font-sans">
      {/* Title & Top Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Quản Lý Đơn Hàng &amp; Vận Hành
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Phê duyệt trạng thái đơn hàng, đối soát dòng tiền chuyển khoản VietQR/VNPay
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs transition font-semibold cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Alert Feedback Notice */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 shadow-2xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <p className="leading-relaxed font-semibold">{feedbackMsg.text}</p>
        </div>
      )}

      {/* Main Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200/80">
        <button
          onClick={() => {
            setActiveMainTab('orders');
          }}
          className={`px-4 py-2 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeMainTab === 'orders'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Quản Lý Đơn Hàng ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveMainTab('transactions');
          }}
          className={`px-4 py-2 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeMainTab === 'transactions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Cổng Giao Dịch VietQR/VNPay ({transactions.length})
        </button>
      </div>

      {activeMainTab === 'orders' ? (
        <div className="space-y-3">
          {/* Flat Status Filter Pills / Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
            {[
              { id: 'all', label: 'Tất cả', count: statusCounts.all },
              { id: 'pending', label: 'Chờ xử lý', count: statusCounts.pending, color: 'amber' },
              { id: 'processing', label: 'Đang xử lý', count: statusCounts.processing, color: 'blue' },
              { id: 'shipped', label: 'Đang giao', count: statusCounts.shipped, color: 'sky' },
              { id: 'delivered', label: 'Thành công', count: statusCounts.delivered, color: 'emerald' },
              { id: 'cancelled', label: 'Đã hủy', count: statusCounts.cancelled, color: 'rose' },
            ].map((tab) => {
              const isActive = orderStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setOrderStatusFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Secondary Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => {
                  setOrderSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm tên khách hàng, SĐT, hoặc mã đơn..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
              />
            </div>
            <p className="text-xs text-slate-500 font-semibold self-end sm:self-auto">
              Hiển thị <span className="text-slate-900 font-bold">{filteredOrders.length}</span> đơn hàng
            </p>
          </div>

          {/* Orders Table - Flat UI */}
          <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Mã Đơn</th>
                    <th className="py-2.5 px-3">Khách hàng &amp; SĐT</th>
                    <th className="py-2.5 px-3">Tổng tiền</th>
                    <th className="py-2.5 px-3">Thanh toán</th>
                    <th className="py-2.5 px-3">Trạng thái vận hành</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        <div className="max-w-xs mx-auto space-y-1.5">
                          <Package className="w-7 h-7 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-600">Không tìm thấy đơn hàng nào</p>
                          <p className="text-[10px] text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc trạng thái</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Order ID */}
                        <td className="py-2 px-3">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                            #{o.id.substring(0, 10).toUpperCase()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-2 px-3">
                          <p className="font-bold text-slate-900">{o.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{o.customerPhone}</p>
                        </td>

                        {/* Amount */}
                        <td className="py-2 px-3">
                          <p className="font-extrabold text-blue-600">{formatCurrency(o.totalAmount)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{o.items.length} món</p>
                        </td>

                        {/* Payment Status & Method */}
                        <td className="py-2 px-3">
                          <span className="text-[10px] text-slate-700 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                            {o.paymentMethod}
                          </span>
                          <p
                            className={`text-[10px] font-extrabold mt-0.5 ${
                              o.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {o.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                          </p>
                        </td>

                        {/* Operational Status (Quick Action Dropdown) */}
                        <td className="py-2 px-3">
                          <select
                            value={o.status}
                            disabled={isUpdatingStatus === o.id}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className={`text-[11px] font-extrabold py-1 px-2 rounded-lg border outline-none cursor-pointer transition shadow-2xs ${
                              o.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : o.status === 'shipped'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : o.status === 'processing'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : o.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => openDetailModal(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-600 rounded-lg cursor-pointer transition text-[11px] font-bold shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Transactions List Tab */
        <div className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách dòng tiền chuyển khoản ngân hàng VietQR/VNPay
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
              Realtime Audit
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Mã Nội Dung (VietQR)</th>
                  <th className="p-4">Số Tiền</th>
                  <th className="p-4">Cổng Thanh Toán</th>
                  <th className="p-4">Trạng Thái Khoản Tiền</th>
                  <th className="p-4 text-right">Đối Soát Cổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">
                      Chưa ghi nhận bất kỳ giao dịch chuyển khoản nào.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <p className="font-mono font-bold text-blue-600 tracking-wider text-[11px]">
                          {tx.transactionCode}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Khách đặt ngày {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">{formatCurrency(tx.amount)}</td>
                      <td className="p-4">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 uppercase font-bold">
                          {tx.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {tx.status === 'pending'
                            ? 'Chờ kiểm khoản'
                            : tx.status === 'success'
                            ? 'Thành công'
                            : 'Thất bại'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {tx.status === 'pending' ? (
                          <button
                            onClick={() => handleApproveTransaction(tx.id)}
                            disabled={isApproving === tx.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 ml-auto disabled:opacity-50 shadow-2xs border-none"
                          >
                            {isApproving === tx.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Phê duyệt ngay</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Đã duyệt khớp</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedOrder}
        transactions={transactions}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
        onApprovePayment={handleApproveTransaction}
        isUpdatingStatus={isUpdatingStatus === selectedOrder?.id}
        isApproving={isApproving !== null}
      />
    </div>
  );
}
