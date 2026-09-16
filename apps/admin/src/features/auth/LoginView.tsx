import React, { useState } from 'react';
import { ShoppingBag, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { User, AuthResponseData } from '@repo/shared-types';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;
      try {
        response = await axios.post('/api/auth/login', { email, password });
      } catch (e: any) {
        // Fallback endpoint
        response = await axios.post('/api/users/login', { email, password });
      }
      
      const data = response.data;

      if (data.success && data.data) {
        const { user, token } = data.data as AuthResponseData;
        
        if (user.role !== 'admin') {
          setError('Tài khoản của bạn không có quyền hạn Quản trị viên (Admin).');
          setIsLoading(false);
          return;
        }

        onLoginSuccess(user, token);
      } else {
        setError(data.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Kết nối máy chủ thất bại. Vui lòng thử lại.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Visual background soft glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">TechStore</h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Đăng nhập Hệ thống Quản trị & Vận hành</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Địa chỉ Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techstore.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm transition text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm transition text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập Hệ thống'
              )}
            </button>

            {/* Quick Fill Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 text-center uppercase tracking-wider">Tài khoản Admin mẫu (Điền nhanh)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@techstore.com')}
                  className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-[11px] font-bold transition cursor-pointer text-center truncate shadow-2xs"
                >
                  ⚡ admin@techstore.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@ecommerce.com')}
                  className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-[11px] font-bold transition cursor-pointer text-center truncate shadow-2xs"
                >
                  ⚡ admin@ecommerce.com
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed font-medium">
          Đăng nhập với quyền quản trị viên TechStore.<br />
          Mật khẩu mặc định: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">password123</code>
        </div>
      </div>
    </div>
  );
}
