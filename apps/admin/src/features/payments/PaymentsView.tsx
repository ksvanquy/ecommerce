import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Ban,
  Landmark,
  CreditCard,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  DollarSign,
  Filter,
} from 'lucide-react';
import { PaymentTransaction, Order } from '@repo/shared-types';
import axios from 'axios';

interface PaymentsViewProps {
  transactions: PaymentTransaction[];
  orders: Order[];
  token: string;
  onRefresh: () => void;
}

export default function PaymentsView({
  transactions,
  orders,
  token,
  onRefresh,
}: PaymentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action states
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [rejectingTx, setRejectingTx] = useState<PaymentTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState('Chưa nhận được tiền vào tài khoản ngân hàng');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Calculate status summary stats
  const stats = useMemo(() => {
    const pending = transactions.filter((t) => t.status === 'pending').length;
    const success = transactions.filter((t) => t.status === 'success').length;
    const failed = transactions.filter((t) => t.status === 'failed').length;
    const totalAmountSuccess = transactions
      .filter((t) => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);

    return { total: transactions.length, pending, success, failed, totalAmountSuccess };
  }, [transactions]);

  // Handler approve payment
  const handleApprove = async (transactionId: string) => {
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
          text: 'Xác nhận đối soát thành công! Đơn hàng tương ứng đã được cập nhật thành Đã Thanh Toán (Paid).',
        });
        onRefresh();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Phê duyệt thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể thực hiện phê duyệt.',
      });
    } finally {
      setIsApproving(null);
    }
  };

  // Handler reject payment
  const handleRejectSubmit = async () => {
    if (!rejectingTx) return;
    setIsRejecting(rejectingTx.id);
    setFeedbackMsg(null);
    try {
      const response = await axios.post(
        '/api/admin/payments/reject',
        { transactionId: rejectingTx.id, reason: rejectReason },
        getHeaders()
      );

      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã đánh dấu từ chối giao dịch "${rejectingTx.transactionCode}".`,
        });
        setRejectingTx(null);
        onRefresh();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Từ chối giao dịch thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể từ chối giao dịch.',
      });
    } finally {
      setIsRejecting(null);
    }
  };

  // Filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.transactionCode.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        t.provider.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || t.provider === providerFilter;

      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [transactions, searchQuery, statusFilter, providerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Đối Soát &amp; Phê Duyệt Thanh Toán VietQR
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Xác nhận dòng tiền thực nhận từ cổng VietQR, VNPay, MoMo, ZaloPay và Ngân hàng
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs transition font-semibold cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Làm mới đối soát</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs border flex items-start gap-3 shadow-2xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
          )}
          <p className="leading-relaxed font-semibold">{feedbackMsg.text}</p>
        </div>
      )}

      {/* Summary Stat Cards - Flat UI Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Tổng số giao dịch
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">{stats.total}</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
            Chờ đối soát (Pending)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-800">{stats.pending}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
            Đã duyệt thành công
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-800">{stats.success}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
            Tổng tiền đã khớp thực nhận
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-blue-800">
              {formatCurrency(stats.totalAmountSuccess)}
            </span>
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="space-y-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'all', label: 'Tất cả giao dịch', count: stats.total },
            { id: 'pending', label: 'Chờ đối soát', count: stats.pending, color: 'amber' },
            { id: 'success', label: 'Đã khớp tiền', count: stats.success, color: 'emerald' },
            { id: 'failed', label: 'Từ chối / Lỗi', count: stats.failed, color: 'rose' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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

        {/* Search & Provider Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã GD, mã đơn hàng, số tiền..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200/80 text-xs font-bold text-slate-700 py-2.5 px-3 rounded-xl outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">Tất cả cổng thanh toán</option>
              <option value="vietqr">VietQR (Chuyển khoản Ngân hàng)</option>
              <option value="vnpay">Cổng VNPay</option>
              <option value="momo">Ví MoMo</option>
              <option value="zalopay">Ví ZaloPay</option>
              <option value="cod">COD (Tiền mặt)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table - Flat UI */}
      <div className="bg-white border border-slate-200/80 shadow-2xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Mã Giao Dịch</th>
                <th className="p-4">Mã Đơn Hàng Liên Đới</th>
                <th className="p-4">Số Tiền</th>
                <th className="p-4">Cổng Thanh Toán</th>
                <th className="p-4">Thời Gian</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Tác Vụ Đối Soát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Không tìm thấy giao dịch nào</p>
                      <p className="text-[11px] text-slate-400">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const linkedOrder = orders.find((o) => o.id === tx.orderId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Transaction Code */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100 text-[11px] tracking-wider">
                          {tx.transactionCode}
                        </span>
                        {tx.gatewayTransactionNo && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {tx.gatewayTransactionNo}
                          </p>
                        )}
                      </td>

                      {/* Order Info */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          #{tx.orderId.substring(0, 10).toUpperCase()}
                        </span>
                        {linkedOrder && (
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {linkedOrder.customerName} ({linkedOrder.customerPhone})
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="p-4">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                          {tx.provider}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-500 font-medium text-[11px]">
                        {formatDate(tx.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            tx.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {tx.status === 'success' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Thành công</span>
                            </>
                          ) : tx.status === 'failed' ? (
                            <>
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>Đã từ chối / Lỗi</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Chờ đối soát</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        {tx.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve button */}
                            <button
                              onClick={() => handleApprove(tx.id)}
                              disabled={isApproving === tx.id || isRejecting === tx.id}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition text-xs flex items-center gap-1.5 disabled:opacity-50 border-none shadow-2xs"
                            >
                              {isApproving === tx.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                              <span>Duyệt Tiền</span>
                            </button>

                            {/* Reject button */}
                            <button
                              onClick={() => setRejectingTx(tx)}
                              disabled={isApproving === tx.id || isRejecting === tx.id}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-bold rounded-xl cursor-pointer transition text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Từ Chối</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Đã hoàn tất
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Reject Modal Confirmation */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-up font-sans">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Từ Chối Giao Dịch #{rejectingTx.transactionCode}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Đánh dấu giao dịch thanh toán này là Thất bại / Chưa nhận được tiền.
                </p>
              </div>
              <button
                onClick={() => setRejectingTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Số tiền:</span>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(rejectingTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-slate-800">
                  #{rejectingTx.orderId.substring(0, 10).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Lý do từ chối đối soát:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="Chưa nhận được tiền vào tài khoản ngân hàng">
                  Chưa nhận được tiền vào tài khoản ngân hàng
                </option>
                <option value="Sai nội dung chuyển khoản / Không khớp mã đơn">
                  Sai nội dung chuyển khoản / Không khớp mã đơn
                </option>
                <option value="Số tiền chuyển không đủ giá trị đơn hàng">
                  Số tiền chuyển không đủ giá trị đơn hàng
                </option>
                <option value="Khách hàng báo hủy giao dịch thanh toán">
                  Khách hàng báo hủy giao dịch thanh toán
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingTx(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer transition text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={isRejecting !== null}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 border-none shadow-2xs disabled:opacity-50"
              >
                {isRejecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
                <span>Xác Nhận Từ Chối</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
