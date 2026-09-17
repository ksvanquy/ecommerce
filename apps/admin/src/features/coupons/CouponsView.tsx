import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Calendar,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Coupon, CreateCouponPayload } from '@repo/shared-types';
import axios from 'axios';

interface CouponsViewProps {
  coupons: Coupon[];
  token: string;
  onRefresh: () => void;
}

export default function CouponsView({ coupons, token, onRefresh }: CouponsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const defaultFormData: CreateCouponPayload = {
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 100000,
    minOrderValue: 0,
    usageLimit: 100,
    userLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
  };

  const [formData, setFormData] = useState<CreateCouponPayload>(defaultFormData);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

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

  // Check if coupon is expired
  const isExpired = (endDateStr: string) => {
    return new Date(endDateStr) < new Date();
  };

  // Stats
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive && !isExpired(c.endDate)).length;
    const inactive = coupons.filter((c) => !c.isActive).length;
    const expired = coupons.filter((c) => isExpired(c.endDate)).length;
    const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

    return { total, active, inactive, expired, totalUsed };
  }, [coupons]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || undefined,
      minOrderValue: coupon.minOrderValue,
      usageLimit: coupon.usageLimit || undefined,
      userLimit: coupon.userLimit,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      if (editingCoupon) {
        // Edit existing
        const response = await axios.put(
          `/api/coupons/${editingCoupon.id}`,
          formData,
          getHeaders()
        );
        if (response.data.success) {
          setFeedbackMsg({
            type: 'success',
            text: `Đã cập nhật thành công mã giảm giá "${formData.code.toUpperCase()}".`,
          });
          setIsModalOpen(false);
          onRefresh();
        }
      } else {
        // Create new
        const response = await axios.post('/api/coupons', formData, getHeaders());
        if (response.data.success) {
          setFeedbackMsg({
            type: 'success',
            text: `Đã tạo thành công mã giảm giá mới "${formData.code.toUpperCase()}".`,
          });
          setIsModalOpen(false);
          onRefresh();
        }
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể lưu mã giảm giá.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Coupon
  const handleDeleteSubmit = async () => {
    if (!deletingCoupon) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const response = await axios.delete(`/api/coupons/${deletingCoupon.id}`, getHeaders());
      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã xóa mã giảm giá "${deletingCoupon.code}".`,
        });
        setDeletingCoupon(null);
        onRefresh();
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể xóa mã giảm giá.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const expired = isExpired(c.endDate);

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = c.isActive && !expired;
      if (statusFilter === 'inactive') matchesStatus = !c.isActive;
      if (statusFilter === 'expired') matchesStatus = expired;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(start, start + itemsPerPage);
  }, [filteredCoupons, currentPage, itemsPerPage]);

  return (
    <div className="space-y-3 animate-fade-in font-sans">
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>Quản Lý Mã Giảm Giá &amp; Khuyến Mãi (Coupons)</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Tạo và thiết lập các mã Voucher giảm giá theo phần trăm (%) hoặc số tiền cố định cho đơn hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs transition font-semibold cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs transition font-bold cursor-pointer shadow-2xs border-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Mã Mới</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Stats Summary Cards - Flat UI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Tổng số mã
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-slate-900">{stats.total}</span>
            <Tag className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
            Đang hoạt động
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-emerald-800">{stats.active}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
            Tạm khóa / Hết hạn
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-amber-800">
              {stats.inactive + stats.expired}
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
            Tổng lượt đã sử dụng
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-blue-800">{stats.totalUsed}</span>
            <Percent className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="space-y-2.5">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
          {[
            { id: 'all', label: 'Tất cả mã', count: stats.total },
            { id: 'active', label: 'Đang hoạt động', count: stats.active },
            { id: 'inactive', label: 'Tạm khóa', count: stats.inactive },
            { id: 'expired', label: 'Hết hạn', count: stats.expired },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id as any);
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

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo mã voucher, tiêu đề..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* Coupons Table - Flat UI */}
      <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Mã Voucher Code</th>
                <th className="py-2.5 px-3">Mức Giảm Giá</th>
                <th className="py-2.5 px-3">Đơn Hàng Tối Thiểu</th>
                <th className="py-2.5 px-3">Số Lượt Sử Dụng</th>
                <th className="py-2.5 px-3">Thời Gian Hiệu Lực</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3 text-right">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Tag className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">
                        Không tìm thấy mã giảm giá nào
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Thử bấm nút "+ Tạo Mã Mới" để thêm chương trình khuyến mãi đầu tiên
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCoupons.map((c) => {
                  const expired = isExpired(c.endDate);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code & Title */}
                      <td className="py-2 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-extrabold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 text-[11px] tracking-wider">
                            {c.code}
                          </span>
                          <p className="font-bold text-slate-900 text-xs mt-0.5">{c.title}</p>
                          {c.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                          )}
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-2 px-3">
                        {c.discountType === 'percentage' ? (
                          <div>
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              Giảm {c.discountValue}%
                            </span>
                            {c.maxDiscountAmount && (
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                Tối đa {formatCurrency(c.maxDiscountAmount)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                            Giảm {formatCurrency(c.discountValue)}
                          </span>
                        )}
                      </td>

                      {/* Min Order Value */}
                      <td className="py-2 px-3 text-slate-700 font-bold">
                        {c.minOrderValue > 0 ? formatCurrency(c.minOrderValue) : 'Không giới hạn'}
                      </td>

                      {/* Used Count / Limit */}
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-800">
                          {c.usedCount}
                        </span>
                        <span className="text-slate-400">
                          / {c.usageLimit ? c.usageLimit : '∞'} lượt
                        </span>
                      </td>

                      {/* Date Range */}
                      <td className="py-2 px-3 text-slate-500 font-medium text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatDate(c.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <span>Đến {formatDate(c.endDate)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>Đã hết hạn</span>
                          </span>
                        ) : c.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đang áp dụng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            <Ban className="w-3 h-3 text-amber-600" />
                            <span>Tạm khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Chỉnh sửa mã"
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer transition shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeletingCoupon(c)}
                            title="Xóa mã"
                            className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl cursor-pointer transition shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* Modal Form Create / Edit Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 font-sans my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingCoupon ? `Sửa Mã Giảm Giá #${editingCoupon.code}` : 'Tạo Mã Giảm Giá Mới'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Nhập thông tin mã voucher khuyến mãi
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã Voucher Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: KHUYENMAI20"
                    className="w-full bg-white border border-slate-200/80 text-xs font-mono font-bold text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Chương Trình *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Giảm 10% mừng Khai Trương"
                    className="w-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Áp dụng cho tất cả đơn hàng..."
                  className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại Giảm Giá *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'percentage' | 'fixed_amount',
                      })
                    }
                    className="w-full bg-white border border-slate-200/80 text-xs font-bold text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VND)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Giá trị giảm ({formData.discountType === 'percentage' ? '%' : 'VNĐ'}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200/80 text-xs font-bold text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Max Discount & Min Order Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Để trống nếu không giới hạn"
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Usage Limit & User Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổng lượt phát hành</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="VD: 100 lượt"
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giới hạn/Khách hàng</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.userLimit}
                    onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bắt đầu hiệu lực *</label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      typeof formData.startDate === 'string'
                        ? formData.startDate
                        : new Date(formData.startDate).toISOString().slice(0, 16)
                    }
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hết hạn vào lúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      typeof formData.endDate === 'string'
                        ? formData.endDate
                        : new Date(formData.endDate).toISOString().slice(0, 16)
                    }
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white border border-slate-200/80 text-xs text-slate-900 p-2.5 rounded-xl outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="font-bold text-slate-800 cursor-pointer">
                  Kích hoạt mã áp dụng ngay lập tức
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer transition text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 border-none shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingCoupon ? 'Lưu Cập Nhật' : 'Tạo Mã Khuyến Mãi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Xác Nhận Xóa Mã Giảm Giá #{deletingCoupon.code}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hành động này sẽ gỡ bỏ mã khuyến mãi khỏi hệ thống.
                </p>
              </div>
              <button
                onClick={() => setDeletingCoupon(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer transition text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 border-none shadow-2xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Xóa Mã</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
