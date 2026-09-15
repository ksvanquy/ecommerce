import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { useRegister } from '../api/useRegister.ts';
import { UserRole } from '../types.ts';
import { AlertCircle, CheckCircle2, UserCheck, Shield } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [clientError, setClientError] = useState<string | null>(null);

  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!fullName.trim()) {
      setClientError('Vui lòng nhập họ và tên.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setClientError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!password || password.length < 6) {
      setClientError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
      setClientError(msg);
    }
  };

  const errorMessage = clientError || (registerMutation.isError ? (registerMutation.error as any)?.message : null);

  return (
    <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div id="register-error-alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Input
        id="register-fullname"
        label="Họ và Tên"
        type="text"
        placeholder="Nguyễn Văn A"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        autoComplete="name"
      />

      <Input
        id="register-email"
        label="Địa chỉ Email"
        type="email"
        placeholder="nguyenvana@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        id="register-password"
        label="Mật khẩu"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        helperText="Nên chứa cả chữ hoa, chữ thường và số"
        autoComplete="new-password"
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Vai trò tài khoản
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="role-btn-customer"
            onClick={() => setRole('customer')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              role === 'customer'
                ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Khách hàng (Customer)</span>
          </button>

          <button
            type="button"
            id="role-btn-admin"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              role === 'admin'
                ? 'border-purple-600 bg-purple-50/60 text-purple-700 ring-1 ring-purple-600'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Quản trị viên (Admin)</span>
          </button>
        </div>
      </div>

      <Button
        id="btn-submit-register"
        type="submit"
        className="w-full mt-2"
        isLoading={registerMutation.isPending}
      >
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        Tạo tài khoản ngay
      </Button>

      {onSwitchToLogin && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              id="link-switch-to-login"
              onClick={onSwitchToLogin}
              className="text-blue-600 font-semibold hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      )}
    </form>
  );
};
