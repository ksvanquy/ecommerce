import { couponsRepository } from './coupons.repository.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type {
  Coupon,
  CouponValidationResult,
  CreateCouponPayload,
} from '@repo/shared-types';

export class CouponsService {
  async validateCoupon(
    code: string,
    orderSubtotal: number,
    userId?: string | null
  ): Promise<CouponValidationResult> {
    const coupon = await couponsRepository.findByCode(code);

    if (!coupon) {
      throw new AppError(`Mã giảm giá "${code}" không tồn tại hoặc đã hết hạn`, 404, 'COUPON_NOT_FOUND');
    }

    if (!coupon.isActive) {
      throw new AppError(`Mã giảm giá "${code}" hiện đang bị tạm khóa`, 400, 'COUPON_INACTIVE');
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      throw new AppError(`Chương trình khuyến mãi cho mã "${code}" chưa bắt đầu`, 400, 'COUPON_NOT_STARTED');
    }

    if (now > endDate) {
      throw new AppError(`Mã giảm giá "${code}" đã hết hạn sử dụng`, 400, 'COUPON_EXPIRED');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError(`Mã giảm giá "${code}" đã hết lượt sử dụng`, 400, 'COUPON_LIMIT_REACHED');
    }

    if (orderSubtotal < coupon.minOrderValue) {
      const formattedMin = new Intl.NumberFormat('vi-VN').format(coupon.minOrderValue);
      throw new AppError(
        `Đơn hàng chưa đạt giá trị tối thiểu ${formattedMin}đ để áp dụng mã này`,
        400,
        'MIN_ORDER_VALUE_NOT_MET'
      );
    }

    if (userId) {
      const userUsageCount = await couponsRepository.getUsageCountByUser(coupon.id, userId);
      if (userUsageCount >= coupon.userLimit) {
        throw new AppError(
          `Bạn đã sử dụng tối đa (${coupon.userLimit} lần) mã giảm giá này`,
          400,
          'USER_COUPON_LIMIT_REACHED'
        );
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount,
      message: `Áp dụng thành công mã giảm giá "${coupon.code}"`,
    };
  }

  async getAvailableCoupons(): Promise<Coupon[]> {
    return await couponsRepository.listActiveCoupons();
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await couponsRepository.listAllCoupons();
  }

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const existing = await couponsRepository.findByCode(payload.code);
    if (existing) {
      throw new AppError(`Mã giảm giá "${payload.code}" đã tồn tại trên hệ thống`, 400, 'COUPON_CODE_EXISTS');
    }

    return await couponsRepository.createCoupon(payload);
  }

  async recordUsage(code: string, userId: string, orderId: string, discountApplied: number): Promise<void> {
    const coupon = await couponsRepository.findByCode(code);
    if (coupon) {
      await couponsRepository.recordUsage(coupon.id, userId, orderId, discountApplied);
    }
  }

  async updateCoupon(id: string, payload: Partial<CreateCouponPayload>): Promise<Coupon> {
    if (payload.code) {
      const existing = await couponsRepository.findByCode(payload.code);
      if (existing && existing.id !== id) {
        throw new AppError(`Mã giảm giá "${payload.code}" đã được sử dụng bởi coupon khác`, 400, 'COUPON_CODE_EXISTS');
      }
    }

    const updated = await couponsRepository.updateCoupon(id, payload);
    if (!updated) {
      throw new AppError(`Không tìm thấy mã giảm giá với ID "${id}"`, 404, 'COUPON_NOT_FOUND');
    }
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return await couponsRepository.deleteCoupon(id);
  }
}

export const couponsService = new CouponsService();
