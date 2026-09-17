import { Router, Response, NextFunction } from 'express';
import { couponsService } from './coupons.service.ts';
import {
  optionalAuthMiddleware,
  authMiddleware,
  requireRole,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';
import {
  validateCouponSchema,
  createCouponSchema,
  type ValidateCouponPayload,
  type CreateCouponPayload,
} from '@repo/shared-types';

export const couponsRouter = Router();

/**
 * POST /coupons/validate - Kiểm tra và tính mức giảm giá của mã Voucher
 */
couponsRouter.post(
  '/validate',
  optionalAuthMiddleware,
  validateBody(validateCouponSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, orderSubtotal } = req.body as ValidateCouponPayload;
      const userId = req.user?.userId || null;

      const result = await couponsService.validateCoupon(code, orderSubtotal, userId);

      res.json({
        success: true,
        message: result.message,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /coupons/available - Lấy danh sách các mã khuyến mãi đang áp dụng công khai
 */
couponsRouter.get(
  '/available',
  async (_req, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await couponsService.getAvailableCoupons();

      res.json({
        success: true,
        data: coupons,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /coupons - Lấy tất cả mã khuyến mãi (Dành cho Quản trị)
 */
couponsRouter.get(
  '/',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = req.user?.role === 'admin'
        ? await couponsService.getAllCoupons()
        : await couponsService.getAvailableCoupons();

      res.json({
        success: true,
        data: coupons,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /coupons - Tạo mới mã khuyến mãi (Admin only)
 */
couponsRouter.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  validateBody(createCouponSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as CreateCouponPayload;
      const coupon = await couponsService.createCoupon(payload);

      res.status(201).json({
        success: true,
        message: 'Tạo mã khuyến mãi thành công',
        data: coupon,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /coupons/:id - Cập nhật mã khuyến mãi (Admin only)
 */
couponsRouter.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await couponsService.updateCoupon(id, req.body);

      res.json({
        success: true,
        message: 'Cập nhật mã khuyến mãi thành công',
        data: coupon,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /coupons/:id - Xóa mã khuyến mãi (Admin only)
 */
couponsRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await couponsService.deleteCoupon(id);

      res.json({
        success: true,
        message: 'Xóa mã khuyến mãi thành công',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
