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
    <div className="space-y-6 animate-fade-in">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Vận hành & Đối soát</h2>
          <p className="text-xs text-slate-400">Xem và phê duyệt đơn hàng, xử lý giao dịch tài chính thủ công</p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs transition font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs border flex items-start gap-3 ${feedbackMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed font-medium">{feedbackMsg.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
          className={`px-5 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${activeTab === 'orders' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Quản lý Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab('transactions'); setSelectedOrder(null); }}
          className={`px-5 py-3 text-xs font-bold transition border-b-2 cursor-pointer ${activeTab === 'transactions' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
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
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm tên khách, SĐT, hoặc mã đơn hàng..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Filter className="w-4 h-4" />
                  </span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-amber-500/50 cursor-pointer appearance-none"
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Đơn hàng</th>
                        <th className="p-4">Thanh toán</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">Không có đơn hàng nào khớp bộ lọc.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className={`hover:bg-slate-800/30 transition-colors ${selectedOrder?.id === o.id ? 'bg-slate-800/40' : ''}`}>
                            <td className="p-4">
                              <p className="font-bold text-white">{o.customerName}</p>
                              <p className="text-[10px] text-slate-500">{o.customerPhone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-300">{formatCurrency(o.totalAmount)}</p>
                              <p className="text-[10px] text-slate-500">Mã: {o.id.substring(0, 10).toUpperCase()}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] text-slate-400 capitalize bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">{o.paymentMethod}</span>
                              <p className={`text-[10px] font-bold mt-1 ${o.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-500'}`}>
                                {o.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                              </p>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                o.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
                                className="p-1.5 bg-slate-800 border border-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition flex items-center justify-center ml-auto"
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-950/30 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách dòng tiền chuyển khoản</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/50">Thời gian thực</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-4">Mã nội dung (VietQR)</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Cổng</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Đối soát</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">Chưa ghi nhận bất kỳ giao dịch chuyển khoản nào.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="p-4">
                            <p className="font-mono font-bold text-amber-400 tracking-wider text-[11px]">{tx.transactionCode}</p>
                            <p className="text-[10px] text-slate-500">Khách đặt ngày {new Date(tx.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-bold text-white">{formatCurrency(tx.amount)}</td>
                          <td className="p-4">
                            <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400 uppercase">{tx.provider}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              tx.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {tx.status === 'pending' ? 'Chờ kiểm khoản' : tx.status === 'success' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {tx.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveTransaction(tx.id)}
                                disabled={isApproving === tx.id}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 ml-auto disabled:opacity-50 border-none"
                              >
                                {isApproving === tx.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                                <span>Phê duyệt ngay</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ sơ Đơn hàng chi tiết</h3>
                  <p className="text-base font-extrabold text-white mt-1">#{selectedOrder.id.substring(0, 12).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              {/* Status Action Board */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điều khiển vận hành:</label>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedOrder.status}
                    disabled={isUpdatingStatus === selectedOrder.id}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 cursor-pointer"
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
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người nhận hàng</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{selectedOrder.shippingAddress}</span>
                  </div>
                  {selectedOrder.customerNote && (
                    <div className="flex items-start gap-2.5 text-slate-300 bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/40">
                      <Notebook className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="italic text-slate-400 text-[11px] leading-relaxed">Ghi chú: {selectedOrder.customerNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giỏ hàng ({selectedOrder.items.length} món)</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-800/40 pb-2">
                      <div>
                        <p className="font-bold text-slate-200">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">{item.quantity} chiếc × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-semibold text-slate-300">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Transaction Audit */}
              {selectedOrder.paymentMethod !== 'cod' && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-4.5 h-4.5 text-amber-500" />
                    <span>Hồ sơ dòng tiền ngân hàng VietQR</span>
                  </h4>
                  {transactions.filter((tx) => tx.orderId === selectedOrder.id).length === 0 ? (
                    <div className="p-3 bg-rose-500/5 text-rose-400 text-[11px] rounded-lg border border-rose-500/10">
                      Không tìm thấy bản ghi giao dịch thanh toán trực tuyến tương ứng của đơn hàng này.
                    </div>
                  ) : (
                    transactions
                      .filter((tx) => tx.orderId === selectedOrder.id)
                      .map((tx) => (
                        <div key={tx.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-amber-500 font-bold">{tx.transactionCode}</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
                              {tx.status === 'success' ? 'Đã thu tiền' : 'Chờ kiểm khoản'}
                            </span>
                          </div>
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleApproveTransaction(tx.id)}
                              disabled={isApproving === tx.id}
                              className="w-full py-1.5 mt-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 text-[11px] border-none"
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
              <div className="p-4 bg-slate-950/40 text-slate-500 rounded-full border border-slate-800">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300">Hồ sơ Đối soát</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">Chọn xem chi tiết một đơn hàng để thực hiện các thao tác vận hành hoặc phê duyệt thanh toán.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
