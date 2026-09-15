import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import { useAuthStore } from '../store/authStore.ts';
import type { ApiResponse, User } from '../types.ts';

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const query = useQuery({
    queryKey: ['currentUser', token],
    queryFn: async (): Promise<User | null> => {
      if (!token) return null;
      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch (error: any) {
        if (error?.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    } else if (query.isError) {
      setUser(null);
    }
  }, [query.data, query.isError, setUser]);

  return query;
}
