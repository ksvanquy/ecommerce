import { apiClient } from '../../../lib/axios.ts';
import type { UserAddress, CreateAddressPayload, UpdateAddressPayload } from '@repo/shared-types';

export const addressesApi = {
  getAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get('/addresses');
    return response.data.data;
  },

  getDefaultAddress: async (): Promise<UserAddress | null> => {
    const response = await apiClient.get('/addresses/default');
    return response.data.data;
  },

  createAddress: async (payload: CreateAddressPayload): Promise<UserAddress> => {
    const response = await apiClient.post('/addresses', payload);
    return response.data.data;
  },

  updateAddress: async (id: string, payload: UpdateAddressPayload): Promise<UserAddress> => {
    const response = await apiClient.patch(`/addresses/${id}`, payload);
    return response.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<UserAddress> => {
    const response = await apiClient.put(`/addresses/${id}/default`);
    return response.data.data;
  },
};
