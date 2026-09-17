import React, { useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { User } from '@repo/shared-types';
import axios from 'axios';

interface UsersViewProps {
  users: User[];
  token: string;
  onRefresh: () => void;
}

export default function UsersView({ users, token, onRefresh }: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actions
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

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

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u) => u.role === 'customer').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, customers, admins };
  }, [users]);

  // Handler: Change Role
  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    setIsUpdating(userId);
    setFeedbackMsg(null);
    try {
      const response = await axios.put(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
        getHeaders()
      );

      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã cập nhật vai trò người dùng sang "${newRole.toUpperCase()}".`,
        });
        onRefresh();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Cập nhật vai trò thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể đổi vai trò người dùng.',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Handler: Delete User
  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    setIsUpdating(deletingUser.id);
    setFeedbackMsg(null);
    try {
      const response = await axios.delete(`/api/admin/users/${deletingUser.id}`, getHeaders());

      if (response.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Đã xóa tài khoản "${deletingUser.email}" thành công.`,
        });
        setDeletingUser(null);
        onRefresh();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: response.data.message || 'Xóa tài khoản thất bại.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể xóa tài khoản người dùng.',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="space-y-3 animate-fade-in font-sans">
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-600" />
            <span>Quản Lý Tài Khoản Khách Hàng &amp; Quản Trị Viên</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Xem danh sách tài khoản, phân quyền quản trị Admin và quản lý trạng thái thành viên
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs transition font-semibold cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Làm mới danh sách</span>
        </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Tổng người dùng
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-slate-900">{stats.total}</span>
            <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
            Tài khoản Khách Hàng
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-blue-800">{stats.customers}</span>
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-0.5 shadow-2xs">
          <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
            Quản Trị Viên (Admins)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-indigo-800">{stats.admins}</span>
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="space-y-2.5">
        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
          {[
            { id: 'all', label: 'Tất cả tài khoản', count: stats.total },
            { id: 'customer', label: 'Khách hàng', count: stats.customers },
            { id: 'admin', label: 'Quản trị viên', count: stats.admins },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id as any);
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

        {/* Search input */}
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
            placeholder="Tìm theo email, họ tên, ID người dùng..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* Users Table - Flat UI */}
      <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Họ và Tên</th>
                <th className="py-2.5 px-3">Email Đăng Nhập</th>
                <th className="py-2.5 px-3">Mã Tài Khoản</th>
                <th className="py-2.5 px-3">Vai Trò System</th>
                <th className="py-2.5 px-3">Ngày Tạo</th>
                <th className="py-2.5 px-3 text-right">Phân Quyền / Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto space-y-2">
                      <UsersIcon className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">
                        Không tìm thấy tài khoản người dùng nào
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Thử thay đổi từ khóa tìm kiếm hoặc lọc lại theo vai trò
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isAdmin
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{u.fullName || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-2 px-3 text-slate-800 font-medium">{u.email}</td>

                      {/* User ID */}
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                        #{u.id.substring(0, 12)}
                      </td>

                      {/* Role Badge */}
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isAdmin
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <Shield className="w-3 h-3 text-indigo-600" />
                              <span>Quản trị viên (Admin)</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-slate-500" />
                              <span>Khách hàng (Customer)</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-500 font-medium text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Change Role Button */}
                          <button
                            onClick={() => handleRoleChange(u.id, isAdmin ? 'customer' : 'admin')}
                            disabled={isUpdating === u.id}
                            title={
                              isAdmin
                                ? 'Hạ quyền xuống Khách Hàng'
                                : 'Nâng quyền lên Quản Trị Viên'
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs cursor-pointer disabled:opacity-50 ${
                              isAdmin
                                ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                            }`}
                          >
                            {isUpdating === u.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isAdmin ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Gỡ Admin</span>
                              </>
                            ) : (
                              <>
                                <Shield className="w-3.5 h-3.5" />
                                <span>Thành Admin</span>
                              </>
                            )}
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isUpdating === u.id}
                            title="Xóa tài khoản"
                            className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-xl cursor-pointer transition shadow-2xs disabled:opacity-50"
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

      {/* Modal Confirm Delete User */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 font-sans">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Xác Nhận Xóa Tài Khoản
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hành động này sẽ xóa hoàn toàn thông tin người dùng khỏi hệ thống.
                </p>
              </div>
              <button
                onClick={() => setDeletingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Họ tên:</span>
                <span className="font-bold text-slate-900">{deletingUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-slate-900">{deletingUser.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer transition text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isUpdating !== null}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 border-none shadow-2xs disabled:opacity-50"
              >
                {isUpdating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Xóa Tài Khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
