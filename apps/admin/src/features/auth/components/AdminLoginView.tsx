import React, { useState } from 'react';
import { useAdminLogin } from '../api/useAdminAuth.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const [email, setEmail] = useState('admin@techstore.com');
  const [password, setPassword] = useState('Admin@123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">TechStore Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Hệ thống Quản trị độc lập dành cho Quản trị viên
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Quản trị
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@techstore.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-[11px] text-blue-300">
            <strong>Tài khoản Demo Admin mặc định:</strong>
            <p className="mt-0.5 text-blue-400/90 font-mono">admin@techstore.com / Admin@123456</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            isLoading={loginMutation.isPending}
          >
            Đăng nhập Quản trị
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Cửa hàng Khách hàng (Web Storefront)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
