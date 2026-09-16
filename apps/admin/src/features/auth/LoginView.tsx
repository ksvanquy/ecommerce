import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
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
      const response = await axios.post('/api/users/login', { email, password });
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl relative backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">TechStore Admin</h1>
            <p className="text-xs text-slate-400">Đăng nhập vào Hệ thống Quản trị & Vận hành</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Địa chỉ Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techstore.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-sm transition text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-sm transition text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 disabled:opacity-50"
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
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center text-[11px] text-slate-500 leading-relaxed">
          Nhập tài khoản Admin đã được cấp quyền.<br />
          Tài khoản khách hàng thông thường không thể truy cập phân hệ này.
        </div>
      </div>
    </div>
  );
}
