import { Router, Response, NextFunction } from 'express';
import { cartService } from './cart.service.ts';
import {
  optionalAuthMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';
import {
  addToCartSchema,
  updateCartItemSchema,
  type AddToCartPayload,
  type UpdateCartItemPayload,
} from '@repo/shared-types';

export const cartRouter = Router();

function resolveIdentifiers(req: AuthenticatedRequest) {
  const userId = req.user?.userId || null;
  const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string) || 'guest_default_session';
  return { userId, sessionId };
}

/**
 * GET /cart - Lấy giỏ hàng hiện tại (theo User hoặc Session ID)
 */
cartRouter.get(
  '/',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, sessionId } = resolveIdentifiers(req);
      const cart = await cartService.getCart(userId, sessionId);

      res.json({
        success: true,
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /cart/items - Thêm sản phẩm vào giỏ hàng
 */
cartRouter.post(
  '/items',
  optionalAuthMiddleware,
  validateBody(addToCartSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, sessionId } = resolveIdentifiers(req);
      const payload = req.body as AddToCartPayload;

      const cart = await cartService.addItem(payload, userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /cart/items/:id - Cập nhật số lượng / trạng thái chọn
 */
cartRouter.patch(
  '/items/:id',
  optionalAuthMiddleware,
  validateBody(updateCartItemSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, sessionId } = resolveIdentifiers(req);
      const itemId = req.params.id;
      const payload = req.body as UpdateCartItemPayload;

      const cart = await cartService.updateItem(itemId, payload, userId, sessionId);

      res.json({
        success: true,
        message: 'Cập nhật giỏ hàng thành công',
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /cart/items/:id - Xóa 1 sản phẩm khỏi giỏ hàng
 */
cartRouter.delete(
  '/items/:id',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, sessionId } = resolveIdentifiers(req);
      const itemId = req.params.id;

      const cart = await cartService.removeItem(itemId, userId, sessionId);

      res.json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /cart - Xóa rỗng giỏ hàng
 */
cartRouter.delete(
  '/',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, sessionId } = resolveIdentifiers(req);
      const cart = await cartService.clearCart(userId, sessionId);

      res.json({
        success: true,
        message: 'Đã làm trống giỏ hàng',
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /cart/merge - Hợp nhất giỏ hàng session vãng lai vào tài khoản vừa đăng nhập
 */
cartRouter.post(
  '/merge',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const sessionId = (req.body?.sessionId as string) || (req.headers['x-session-id'] as string);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập để hợp nhất giỏ hàng',
        });
        return;
      }

      const cart = await cartService.mergeSessionCart(sessionId, userId);

      res.json({
        success: true,
        message: 'Hợp nhất giỏ hàng thành công',
        data: cart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
