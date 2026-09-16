/**
 * Public API Contract: Coupons Module
 */

export { couponsRouter } from './coupons.controller.ts';
export { couponsService, CouponsService } from './coupons.service.ts';
export { couponsRepository, CouponsRepository } from './coupons.repository.ts';

export {
  couponsTable,
  couponUsagesTable,
  couponsRelations,
  couponUsagesRelations,
  type CouponDb,
  type NewCouponDb,
  type CouponUsageDb,
  type NewCouponUsageDb,
} from '../db/schema/index.ts';
