import { Router, Response, NextFunction } from 'express';
import { addressesService } from './addresses.service.ts';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';
import {
  createAddressSchema,
  updateAddressSchema,
  type CreateAddressPayload,
  type UpdateAddressPayload,
} from '@repo/shared-types';

export const addressesRouter = Router();

// Apply authentication to all address endpoints
addressesRouter.use(authMiddleware);

/**
 * GET /api/addresses - Lấy danh sách địa chỉ của người dùng
 */
addressesRouter.get(
  '/',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const list = await addressesService.getAddressesByUserId(userId);

      res.json({
        success: true,
        data: list,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/addresses/default - Lấy địa chỉ giao hàng mặc định của người dùng
 */
addressesRouter.get(
  '/default',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const address = await addressesService.getDefaultAddressByUserId(userId);

      res.json({
        success: true,
        data: address,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/addresses - Thêm địa chỉ mới
 */
addressesRouter.post(
  '/',
  validateBody(createAddressSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const payload = req.body as CreateAddressPayload;
      const created = await addressesService.createAddress(userId, payload);

      res.status(201).json({
        success: true,
        message: 'Thêm địa chỉ giao hàng mới thành công.',
        data: created,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/addresses/:id - Cập nhật thông tin địa chỉ
 */
addressesRouter.patch(
  '/:id',
  validateBody(updateAddressSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const addressId = req.params.id;
      const payload = req.body as UpdateAddressPayload;
      const updated = await addressesService.updateAddress(addressId, userId, payload);

      res.json({
        success: true,
        message: 'Cập nhật địa chỉ giao hàng thành công.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/addresses/:id - Xóa một địa chỉ
 */
addressesRouter.delete(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const addressId = req.params.id;
      await addressesService.deleteAddress(addressId, userId);

      res.json({
        success: true,
        message: 'Xóa địa chỉ thành công.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/addresses/:id/default - Đặt một địa chỉ làm địa chỉ mặc định
 */
addressesRouter.put(
  '/:id/default',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const addressId = req.params.id;
      const updated = await addressesService.setDefaultAddress(addressId, userId);

      res.json({
        success: true,
        message: 'Đã thiết lập địa chỉ mặc định.',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
