import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { useLogin } from '../api/useLogin.ts';
import { AlertCircle, LogIn, KeyRound, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!email || !password) {
      setClientError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      setClientError(msg);
    }
  };

  const handleQuickFill = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@ecommerce.com');
      setPassword('password123');
    } else {
      setEmail('customer@ecommerce.com');
      setPassword('password123');
    }
    setClientError(null);
  };

  const errorMessage = clientError || (loginMutation.isError ? (loginMutation.error as any)?.message : null);

  return (
    <div className="space-y-4">
      {/* Quick demo accounts bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Tài khoản mẫu thử nghiệm:
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Pass: password123</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            id="btn-quick-admin"
            onClick={() => handleQuickFill('admin')}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 transition"
          >
            Quản trị (admin)
          </button>
          <button
            type="button"
            id="btn-quick-customer"
            onClick={() => handleQuickFill('customer')}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 transition"
          >
            Khách hàng (customer)
          </button>
        </div>
      </div>

      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div id="login-error-alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          id="login-email"
          label="Địa chỉ Email"
          type="email"
          placeholder="admin@ecommerce.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          id="login-password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button
          id="btn-submit-login"
          type="submit"
          className="w-full"
          isLoading={loginMutation.isPending}
        >
          <LogIn className="w-4 h-4 mr-1.5" />
          Đăng nhập
        </Button>

        {onSwitchToRegister && (
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                id="link-switch-to-register"
                onClick={onSwitchToRegister}
                className="text-blue-600 font-semibold hover:underline"
              >
                Đăng ký tài khoản mới
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
