import { Router, Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service.ts';
import {
  optionalAuthMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody, validateQuery } from '../shared/middlewares/validation.middleware.ts';
import {
  createOrderSchema,
  orderFiltersSchema,
  updateOrderStatusSchema,
  type CreateOrderPayload,
  type OrderFilters,
  type UpdateOrderStatusPayload,
} from '@repo/shared-types';

export const ordersRouter = Router();

/**
 * POST /orders - Tạo đơn hàng mới
 * Hỗ trợ cả khách hàng đăng nhập (gắn userId) và khách vãng lai (guest)
 */
ordersRouter.post(
  '/',
  optionalAuthMiddleware,
  validateBody(createOrderSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as CreateOrderPayload;
      const userId = req.user?.userId;

      const order = await ordersService.createOrder(payload, userId);

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công!',
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /orders - Danh sách đơn hàng
 */
ordersRouter.get(
  '/',
  optionalAuthMiddleware,
  validateQuery(orderFiltersSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as OrderFilters;
      const page = query.page || 1;
      const limit = query.limit || 50;

      // E-commerce Standard Privacy Filter:
      // 1. Authenticated customer: strictly only their own orders
      // 2. Authenticated admin: can view all or filter by query
      // 3. Guest (Unauthenticated): only allow specific order lookup if search term is provided (Order code / Phone)
      let targetUserId = query.userId;
      if (req.user) {
        if (req.user.role !== 'admin') {
          targetUserId = req.user.userId;
        }
      } else {
        // Guest user without search term -> return empty list (never expose other accounts' orders)
        if (!query.search || !query.search.trim()) {
          res.json({
            success: true,
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 1,
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const filters: OrderFilters = {
        page,
        limit,
        userId: targetUserId,
        status: query.status,
        search: query.search?.trim(),
      };

      const { orders, total } = await ordersService.getOrders(filters);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /orders/:id - Chi tiết một đơn hàng
 */
ordersRouter.get(
  '/:id',
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await ordersService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: `Không tìm thấy đơn hàng mã ${id}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /orders/:id/cancel - Hủy đơn hàng (khi còn pending)
 */
ordersRouter.patch(
  '/:id/cancel',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const cancelledOrder = await ordersService.cancelOrder(id, userId, userRole);

      res.json({
        success: true,
        message: 'Hủy đơn hàng thành công. Tồn kho sản phẩm đã được hoàn trả lại.',
        data: cancelledOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /orders/:id/status - Cập nhật trạng thái đơn hàng
 */
ordersRouter.patch(
  '/:id/status',
  validateBody(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateOrderStatusPayload;

      const updatedOrder = await ordersService.updateStatus(id, status);

      res.json({
        success: true,
        message: `Đã cập nhật trạng thái đơn hàng sang "${status}".`,
        data: updatedOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
