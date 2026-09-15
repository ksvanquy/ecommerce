import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { Order, ApiResponse } from '@repo/shared-types';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string): Promise<Order> => {
      const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể hủy đơn hàng');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
