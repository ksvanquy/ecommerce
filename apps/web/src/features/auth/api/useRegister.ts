import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import { useAuthStore } from '../store/authStore.ts';
import type { RegisterPayload, ApiResponse, AuthResponseData } from '../types.ts';

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload): Promise<AuthResponseData> => {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Đăng ký không thành công');
      }
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(['currentUser', data.token], data.user);
    },
  });
}
