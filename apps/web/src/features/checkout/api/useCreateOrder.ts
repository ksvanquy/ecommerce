import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { CreateOrderPayload } from '../types.ts';
import type { Order } from '@repo/shared-types';

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<Order> => {
      const response = await apiClient.post<{ data: Order }>('/orders', payload);
      return response.data.data;
    },
  });
}
