import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Eye, Landmark, User, Phone, MapPin, Notebook, CreditCard, ChevronDown } from 'lucide-react';
import { Order, PaymentTransaction, OrderStatus } from '@repo/shared-types';
import axios from 'axios';

interface OrdersViewProps {
  orders: Order[];
  transactions: PaymentTransaction[];
  token: string;
  onRefresh: () => void;
}

export default function OrdersView({ orders, transactions, token, onRefresh }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

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
          text: 'Phê duyệt giao dịch thành công! Đơn hàng liên đới đã tự động kích hoạt luồng vận chuyển (Paid & Processing).'
        });
        onRefresh();
        // Cập nhật lại order đang xem chi tiết nếu có
        if (selectedOrder) {
          const updated = orders.find((o) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Phê duyệt thất bại.'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể liên lạc với Backend.'
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
          text: `Cập nhật trạng thái đơn hàng sang "${newStatus}" thành công!`
        });
        onRefresh();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
        }
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Cập nhật trạng thái thất bại.'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.'
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerPhone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Vận hành &amp; Đối soát</h2>
          <p className="text-xs text-slate-500 font-medium">Xem và phê duyệt đơn hàng, xử lý giao dịch tài chính hệ thống</p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs transition font-semibold cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs border flex items-start gap-3 shadow-2xs ${feedbackMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
          )}
          <p className="leading-relaxed font-semibold">{feedbackMsg.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80">
        <button
          onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
          className={`px-5 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Quản lý Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab('transactions'); setSelectedOrder(null); }}
          className={`px-5 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Cổng Giao dịch VietQR/VNPay ({transactions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: List view */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'orders' ? (
            <>
              {/* Filter controls */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm tên khách, SĐT, hoặc mã đơn hàng..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Filter className="w-4 h-4" />
                  </span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-600 cursor-pointer appearance-none font-semibold shadow-2xs"
                  >
                    <option value="all">Tất cả đơn hàng</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đang giao hàng</option>
                    <option value="delivered">Thành công</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Đơn hàng</th>
                        <th className="p-4">Thanh toán</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Không có đơn hàng nào khớp bộ lọc.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className={`hover:bg-slate-50 transition-colors ${selectedOrder?.id === o.id ? 'bg-blue-50/50' : ''}`}>
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{o.customerName}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{o.customerPhone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-extrabold text-slate-900">{formatCurrency(o.totalAmount)}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Mã: {o.id.substring(0, 10).toUpperCase()}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">{o.paymentMethod}</span>
                              <p className={`text-[10px] font-extrabold mt-1 ${o.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {o.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                              </p>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {o.status === 'pending' ? 'Chờ xác nhận' :
                                 o.status === 'processing' ? 'Đang xử lý' :
                                 o.status === 'shipped' ? 'Đang giao' :
                                 o.status === 'delivered' ? 'Thành công' : 'Đã hủy'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl cursor-pointer transition flex items-center justify-center ml-auto shadow-2xs"
                                title="Xem chi tiết đơn hàng"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Transactions list */
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Danh sách dòng tiền chuyển khoản</h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">Thời gian thực</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Mã nội dung (VietQR)</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Cổng</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Đối soát</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Chưa ghi nhận bất kỳ giao dịch chuyển khoản nào.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-mono font-bold text-blue-600 tracking-wider text-[11px]">{tx.transactionCode}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Khách đặt ngày {new Date(tx.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-extrabold text-slate-900">{formatCurrency(tx.amount)}</td>
                          <td className="p-4">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 uppercase font-bold">{tx.provider}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              tx.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                              {tx.status === 'pending' ? 'Chờ kiểm khoản' : tx.status === 'success' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {tx.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveTransaction(tx.id)}
                                disabled={isApproving === tx.id}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl cursor-pointer transition flex items-center gap-1 ml-auto disabled:opacity-50 shadow-2xs border-none"
                              >
                                {isApproving === tx.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                                <span>Phê duyệt ngay</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
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
        </div>

        {/* Right column: Action Board / Detailed View */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ sơ Đơn hàng chi tiết</h3>
                  <p className="text-base font-extrabold text-slate-900 mt-1">#{selectedOrder.id.substring(0, 12).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              {/* Status Action Board */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Điều khiển vận hành:</label>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedOrder.status}
                    disabled={isUpdatingStatus === selectedOrder.id}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang đóng gói (Processing)</option>
                    <option value="shipped">Bàn giao shipper (Shipped)</option>
                    <option value="delivered">Giao thành công (Delivered)</option>
                    <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
                  </select>
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Người nhận hàng</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{selectedOrder.shippingAddress}</span>
                  </div>
                  {selectedOrder.customerNote && (
                    <div className="flex items-start gap-2.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <Notebook className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="italic text-slate-600 text-[11px] leading-relaxed">Ghi chú: {selectedOrder.customerNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Giỏ hàng ({selectedOrder.items.length} món)</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.quantity} chiếc × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-extrabold text-slate-900">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Transaction Audit */}
              {selectedOrder.paymentMethod !== 'cod' && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    <span>Hồ sơ dòng tiền ngân hàng VietQR</span>
                  </h4>
                  {transactions.filter((tx) => tx.orderId === selectedOrder.id).length === 0 ? (
                    <div className="p-3 bg-amber-50 text-amber-800 text-[11px] rounded-xl border border-amber-200 font-medium">
                      Chưa ghi nhận bản ghi giao dịch thanh toán trực tuyến của đơn hàng này.
                    </div>
                  ) : (
                    transactions
                      .filter((tx) => tx.orderId === selectedOrder.id)
                      .map((tx) => (
                        <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-blue-600 font-bold">{tx.transactionCode}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {tx.status === 'success' ? 'Đã thu tiền' : 'Chờ kiểm khoản'}
                            </span>
                          </div>
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleApproveTransaction(tx.id)}
                              disabled={isApproving === tx.id}
                              className="w-full py-2 mt-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 text-[11px] border-none shadow-2xs"
                            >
                              {isApproving === tx.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-4 h-4" />
                              )}
                              <span>Xác nhận đã nhận tiền (Duyệt Đơn)</span>
                            </button>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Hồ sơ Đối soát</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px] font-medium">Chọn xem chi tiết một đơn hàng để thực hiện các thao tác vận hành hoặc phê duyệt thanh toán.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
