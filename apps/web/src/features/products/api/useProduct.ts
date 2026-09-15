import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { Product } from '../types.ts';
import type { ApiResponse } from '../../../types/api.ts';

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}
