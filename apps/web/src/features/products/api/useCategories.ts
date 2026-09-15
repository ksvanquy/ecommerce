import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { ApiResponse } from '../../../types/api.ts';

export function useCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<string[]>>('/products/categories');
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
