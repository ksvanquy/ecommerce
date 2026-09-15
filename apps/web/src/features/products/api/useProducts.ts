import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { Product, ProductFilters } from '../types.ts';
import type { PaginatedResponse } from '../../../types/api.ts';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
