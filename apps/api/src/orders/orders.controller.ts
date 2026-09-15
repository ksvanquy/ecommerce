import { Router, Request, Response } from 'express';
import { ordersService } from './orders.service.ts';
import {
  optionalAuthMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import type { CreateOrderPayload, OrderFilters, OrderStatus } from '@repo/shared-types';

export const ordersRouter = Router();

/**
 * POST /orders - Tạo đơn hàng mới
 * Hỗ trợ cả khách hàng đăng nhập (gắn userId) và khách vãng lai (guest)
 */
ordersRouter.post('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi tạo đơn hàng';
    res.status(400).json({
      success: false,
      message: msg,
      error: {
        code: 'ORDER_CREATION_FAILED',
        message: msg,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /orders - Danh sách đơn hàng
 */
ordersRouter.get('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const status = req.query.status as OrderStatus | undefined;
    const search = req.query.search as string | undefined;

    // Filter by user if requested or if authenticated and not admin
    let targetUserId = req.query.userId as string | undefined;
    if (!targetUserId && req.user && req.user.role !== 'admin') {
      targetUserId = req.user.userId;
    }

    const filters: OrderFilters = {
      page,
      limit,
      userId: targetUserId,
      status,
      search,
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi lấy danh sách đơn hàng';
    res.status(500).json({
      success: false,
      message: msg,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /orders/:id - Chi tiết một đơn hàng
 */
ordersRouter.get('/:id', optionalAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi lấy thông tin đơn hàng';
    res.status(500).json({
      success: false,
      message: msg,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * PATCH /orders/:id/cancel - Hủy đơn hàng (khi còn pending)
 */
ordersRouter.patch('/:id/cancel', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Không thể hủy đơn hàng';
    res.status(400).json({
      success: false,
      message: msg,
      error: {
        code: 'CANCEL_ORDER_FAILED',
        message: msg,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * PATCH /orders/:id/status - Cập nhật trạng thái đơn hàng (Admin hoặc Demo)
 */
ordersRouter.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Trạng thái (status) là bắt buộc.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updatedOrder = await ordersService.updateStatus(id, status);

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng sang "${status}".`,
      data: updatedOrder,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái đơn hàng';
    res.status(400).json({
      success: false,
      message: msg,
      timestamp: new Date().toISOString(),
    });
  }
});
