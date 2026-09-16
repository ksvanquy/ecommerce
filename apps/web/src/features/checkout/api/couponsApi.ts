import { apiClient } from '../../../lib/axios.ts';
import type {
  Coupon,
  CouponValidationResult,
  ValidateCouponPayload,
} from '@repo/shared-types';

export const couponsApi = {
  validateCoupon: async (payload: ValidateCouponPayload): Promise<CouponValidationResult> => {
    const response = await apiClient.post('/coupons/validate', payload);
    return response.data.data;
  },

  getAvailableCoupons: async (): Promise<Coupon[]> => {
    const response = await apiClient.get('/coupons/available');
    return response.data.data;
  },
};
