import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';
import { useAuthStore } from '../store/authStore.ts';
import { useCurrentUser } from '../api/useCurrentUser.ts';
import apiClient from '../../../lib/axios.ts';
import {
  ShieldCheck,
  User as UserIcon,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const [formTab, setFormTab] = useState<'login' | 'register'>('login');
  const [protectedTestResult, setProtectedTestResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'loading';
    message?: string;
    data?: any;
  }>({ status: 'idle' });

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { data: meData, isLoading: isMeLoading, refetch: refetchMe } = useCurrentUser();

  const handleTestProtectedEndpoint = async () => {
    setProtectedTestResult({ status: 'loading' });
    try {
      const response = await apiClient.get('/auth/me');
      setProtectedTestResult({
        status: 'success',
        message: 'Xác thực thành công! Header Bearer Token hợp lệ.',
        data: response.data,
      });
    } catch (err: any) {
      setProtectedTestResult({
        status: 'error',
        message: err?.response?.data?.message || err?.message || 'Truy cập bị từ chối (401 Unauthorized)',
        data: err?.response?.data,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Giai đoạn 1 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Giai đoạn 1 Hoàn thiện
              </span>
              <span className="text-blue-100 text-xs font-medium">Module Users + Auth Nền tảng</span>
            </div>
            <h2 className="text-xl font-bold mt-2 tracking-tight">
              Hệ thống Xác thực JWT &amp; Phân quyền Người dùng
            </h2>
            <p className="text-blue-100 text-xs mt-1 max-w-2xl leading-relaxed">
              Kiểm tra luồng xác thực hoàn chỉnh: Đăng ký &rarr; Đăng nhập &rarr; Lưu trữ Token &rarr;
              Gửi kèm Bearer Header &rarr; Truy cập Route bảo vệ &rarr; Refresh trình duyệt vẫn giữ trạng thái.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${
                isAuthenticated
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                  Đã đăng nhập ({user?.role})
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-200" />
                  Chưa đăng nhập
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (Login / Register) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            {/* Tab switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg mb-5">
              <button
                type="button"
                id="btn-tab-login"
                onClick={() => setFormTab('login')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  formTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng nhập (Login)
              </button>
              <button
                type="button"
                id="btn-tab-register"
                onClick={() => setFormTab('register')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  formTab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng ký (Register)
              </button>
            </div>

            {formTab === 'login' ? (
              <LoginForm
                onSuccess={() => {
                  setProtectedTestResult({ status: 'idle' });
                }}
                onSwitchToRegister={() => setFormTab('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={() => {
                  setFormTab('login');
                }}
                onSwitchToLogin={() => setFormTab('login')}
              />
            )}
          </Card>

          {/* Quick instructions */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tiêu chí nghiệm thu Giai đoạn 1:</span>
            </div>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px] leading-relaxed">
              <li>Đăng ký tài khoản mới &rarr; Tự động hash bcrypt 10 vòng</li>
              <li>Đăng nhập &rarr; Nhận JWT Bearer Token (thời hạn 7 ngày)</li>
              <li>Lưu token an toàn trong <code>localStorage</code></li>
              <li>Axios Interceptor tự động đính kèm <code>Authorization: Bearer</code></li>
              <li>F5/Refresh trình duyệt &rarr; Session tự động khôi phục qua <code>GET /auth/me</code></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Active Session & Protected Route Verification */}
        <div className="lg:col-span-7 space-y-6">
          {/* User Profile Card */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Thông tin Phiên làm việc (Session Profile)
                </h3>
              </div>
              {isAuthenticated && (
                <Button
                  id="btn-profile-logout"
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Đăng xuất
                </Button>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">{user.fullName}</h4>
                      <Badge variant={user.role === 'admin' ? 'info' : 'success'}>
                        {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (Customer)'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{user.email}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">ID: {user.id}</p>
                  </div>
                </div>

                {/* Token preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      JWT Bearer Token:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Đã lưu localStorage
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] break-all max-h-24 overflow-y-auto leading-relaxed select-all">
                    {token}
                  </div>
                </div>

                {/* Refresh session button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Đồng bộ trạng thái từ endpoint <code>GET /api/auth/me</code>:
                  </span>
                  <Button
                    id="btn-refetch-me"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchMe()}
                    isLoading={isMeLoading}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isMeLoading ? 'animate-spin' : ''}`} />
                    Gọi lại GET /auth/me
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">Chưa có người dùng đăng nhập</p>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                    Vui lòng sử dụng form đăng nhập bên trái hoặc bấm nút điền tài khoản mẫu để trải nghiệm.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Protected Route / Endpoint Test Card */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Thử nghiệm Route &amp; Middleware Bảo vệ (Protected Guard)
                </h3>
              </div>
              <Badge variant={isAuthenticated ? 'success' : 'neutral'}>
                {isAuthenticated ? 'Authenticated' : 'Guest'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Endpoint <code>GET /api/auth/me</code> được bảo vệ bởi middleware{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">authMiddleware</code>.
              Chỉ request có Bearer Token hợp lệ mới được cấp quyền truy cập.
            </p>

            <div className="flex gap-2 mb-4">
              <Button
                id="btn-test-protected"
                variant="primary"
                size="sm"
                onClick={handleTestProtectedEndpoint}
                isLoading={protectedTestResult.status === 'loading'}
              >
                <Terminal className="w-3.5 h-3.5 mr-1.5" />
                Gửi request thử nghiệm GET /auth/me
              </Button>
            </div>

            {protectedTestResult.status !== 'idle' && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  protectedTestResult.status === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : protectedTestResult.status === 'error'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {protectedTestResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{protectedTestResult.message}</span>
                </div>
                {protectedTestResult.data && (
                  <pre className="mt-2 p-2 bg-slate-950 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(protectedTestResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
