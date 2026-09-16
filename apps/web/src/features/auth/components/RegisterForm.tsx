import React, { useState } from 'react';
import { Button, Input } from '@repo/ui';
import { useRegister } from '../api/useRegister.ts';
import { UserRole, registerSchema } from '@repo/shared-types';
import { AlertCircle, CheckCircle2, UserCheck, Shield } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    // Validate using shared Zod schema
    const validationResult = registerSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setClientError(firstIssue?.message || 'Thông tin đăng ký không hợp lệ.');
      return;
    }

    try {
      await registerMutation.mutateAsync(validationResult.data);

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
        helperText="Nên chứa cả chữ hoa, chữ thường và số (tối thiểu 6 ký tự)"
        autoComplete="new-password"
      />

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
            <Button
              type="button"
              id="link-switch-to-login"
              variant="ghost"
              onClick={onSwitchToLogin}
              className="text-blue-600 font-semibold hover:underline p-0 hover:bg-transparent inline text-xs"
            >
              Đăng nhập ngay
            </Button>
          </p>
        </div>
      )}
    </form>
  );
};
