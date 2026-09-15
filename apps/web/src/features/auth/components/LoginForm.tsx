import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { useLogin } from '../api/useLogin.ts';
import { loginSchema } from '@repo/shared-types';
import { AlertCircle, LogIn } from 'lucide-react';

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

    // Validate using shared Zod schema
    const validationResult = loginSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setClientError(firstIssue?.message || 'Thông tin đăng nhập không hợp lệ.');
      return;
    }

    try {
      await loginMutation.mutateAsync(validationResult.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      setClientError(msg);
    }
  };

  const handleQuickFill = () => {
    setEmail('customer@ecommerce.com');
    setPassword('password123');
    setClientError(null);
  };

  const errorMessage = clientError || (loginMutation.isError ? (loginMutation.error as any)?.message : null);

  return (
    <div className="space-y-4">
      {/* Quick fill for testing */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        <span>Tài khoản khách mẫu: <code className="font-mono text-slate-800 font-semibold">customer@ecommerce.com</code></span>
        <button
          type="button"
          id="btn-quick-fill-customer"
          onClick={handleQuickFill}
          className="text-blue-600 hover:text-blue-800 font-semibold underline text-xs ml-2 cursor-pointer"
        >
          Điền nhanh
        </button>
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
