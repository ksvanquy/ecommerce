import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { ApiResponse } from '../../../types/api.ts';
import type { Brand } from '@repo/shared-types';

/**
 * Fetch list of all active brands
 */
export function useBrands() {
  return useQuery({
    queryKey: ['brands-list'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Brand[]>>('/brands');
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
