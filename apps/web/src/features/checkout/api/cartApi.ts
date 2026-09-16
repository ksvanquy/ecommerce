import { apiClient } from '../../../lib/axios.ts';
import type { Cart, AddToCartPayload, UpdateCartItemPayload } from '@repo/shared-types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/api/cart');
    return response.data.data;
  },

  addItem: async (payload: AddToCartPayload): Promise<Cart> => {
    const response = await apiClient.post('/api/cart/items', payload);
    return response.data.data;
  },

  updateItem: async (itemId: string, payload: UpdateCartItemPayload): Promise<Cart> => {
    const response = await apiClient.patch(`/api/cart/items/${itemId}`, payload);
    return response.data.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/api/cart/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (): Promise<Cart> => {
    const response = await apiClient.delete('/api/cart');
    return response.data.data;
  },

  mergeCart: async (sessionId: string): Promise<Cart> => {
    const response = await apiClient.post('/api/cart/merge', { sessionId });
    return response.data.data;
  },
};
