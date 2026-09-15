import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient.ts';
import { useAdminAuthStore } from '../store/adminAuthStore.ts';
import type { LoginPayload, AuthResponseData, ApiResponse, User } from '@repo/shared-types';

export function useAdminLogin() {
  const login = useAdminAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
      if (!response.data.data) {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
      const { user, token } = response.data.data;
      if (user.role !== 'admin') {
        throw new Error('Tài khoản này không có quyền truy cập Quản trị viên (Admin Portal).');
      }
      return { user, token };
    },
    onSuccess: (data) => {
      login(data.user, data.token);
    },
  });
}

export function useCurrentAdmin() {
  const token = useAdminAuthStore((state) => state.token);
  const login = useAdminAuthStore((state) => state.login);
  const logout = useAdminAuthStore((state) => state.logout);

  return useQuery({
    queryKey: ['admin', 'current-user'],
    queryFn: async () => {
      if (!token) return null;
      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        const user = response.data.data;
        if (user && user.role === 'admin') {
          login(user, token);
          return user;
        } else {
          logout();
          return null;
        }
      } catch {
        logout();
        return null;
      }
    },
    enabled: Boolean(token),
    retry: false,
  });
}
