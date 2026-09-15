import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';
import { useAuthStore } from '../store/authStore.ts';
import {
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
  Mail,
  ShoppingBag,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const [formTab, setFormTab] = useState<'login' | 'register'>('login');
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Account Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Tài khoản Khách hàng Thân thiết</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isAuthenticated && user ? `Xin chào, ${user.fullName}!` : 'Tài khoản TechStore'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              {isAuthenticated
                ? 'Quản lý thông tin nhận hàng, theo dõi hành trình đơn hàng và nhận ưu đãi bảo hành chính hãng.'
                : 'Đăng nhập hoặc tạo tài khoản mới để nhận ưu đãi thành viên, tích lũy điểm và theo dõi đơn hàng.'}
            </p>
          </div>

          {isAuthenticated && (
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && user ? (
        /* Logged in View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>Thông tin cá nhân</span>
              </h3>

              <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-lg">{user.fullName}</h4>
                    <Badge variant="success">
                      Khách hàng thân thiết
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Mã thành viên: #{user.id}</p>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Cấp bậc thành viên</p>
                  <p className="font-bold text-slate-900 text-sm">
                    TechStore Member ⭐
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Tích lũy 1% cho mỗi đơn hàng thành công
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Phương thức bảo mật</p>
                  <p className="font-bold text-slate-900 text-sm">Xác thực an toàn</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Phiên làm việc JWT bảo vệ riêng tư</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Lối tắt Mua sắm</h3>
              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold"
                  onClick={() => navigate('/orders')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  <span>Xem Lịch sử Đơn hàng</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold"
                  onClick={() => navigate('/products')}
                >
                  <ShoppingBag className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Duyệt Sản phẩm Mới</span>
                </Button>
              </div>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Quyền lợi thành viên
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Bảo hành điện tử tự động qua số điện thoại, theo dõi hành trình đơn hàng và hỗ trợ khách hàng 24/7.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Login / Register Form */
        <div className="max-w-md mx-auto">
          <Card>
            {/* Tab switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                id="btn-tab-login"
                onClick={() => setFormTab('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  formTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                id="btn-tab-register"
                onClick={() => setFormTab('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  formTab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng ký mới
              </button>
            </div>

            {formTab === 'login' ? (
              <LoginForm
                onSuccess={() => {}}
                onSwitchToRegister={() => setFormTab('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={() => setFormTab('login')}
                onSwitchToLogin={() => setFormTab('login')}
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
