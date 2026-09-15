import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios.ts';
import type { Order, OrderFilters, PaginatedResponse, ApiResponse } from '@repo/shared-types';

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await apiClient.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
      return {
        orders: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
      };
    },
    staleTime: 30000,
  });
}

export function useOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return response.data.data;
    },
    enabled: !!orderId,
  });
}
