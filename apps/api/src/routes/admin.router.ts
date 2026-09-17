import { Router, Response, NextFunction } from 'express';
import { requireAdmin } from '../shared/middlewares/admin.middleware.ts';
import { authMiddleware, AuthenticatedRequest } from '../shared/middlewares/auth.middleware.ts';
import { paymentsService } from '../payments/payments.service.ts';
import { ordersService } from '../orders/orders.service.ts';
import { OrderStatus } from '@repo/shared-types';

export const adminRouter = Router();

// Áp dụng bảo vệ ở tầng định tuyến tổng cho toàn bộ các API Admin
adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

/**
 * GET /api/admin/payments
 * Lấy danh sách toàn bộ các giao dịch thanh toán để phục vụ đối soát, hỗ trợ lọc theo trạng thái
 */
adminRouter.get(
  '/payments',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusFilter = req.query.status as string;
      const transactions = await paymentsService.getAllTransactions();
      
      const filtered = statusFilter
        ? transactions.filter((tx) => tx.status === statusFilter)
        : transactions;

      res.json({
        success: true,
        message: 'Lấy danh sách giao dịch thanh toán thành công.',
        data: filtered,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/admin/payments/approve
 * Phê duyệt thủ công một giao dịch chuyển khoản sau khi đối soát thành công dòng tiền thực tế
 */
adminRouter.post(
  '/payments/approve',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã transactionId hoặc transactionCode để phê duyệt.',
        });
        return;
      }

      const updatedTx = await paymentsService.approvePayment(transactionId);

      res.json({
        success: true,
        message: 'Phê duyệt giao dịch thành công. Đơn hàng đã tự động chuyển sang Đang xử lý (Paid & Processing).',
        data: updatedTx,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/admin/payments/reject
 * Từ chối giao dịch chuyển khoản khi thông tin sai hoặc chưa nhận được tiền
 */
adminRouter.post(
  '/payments/reject',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId, reason } = req.body;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã transactionId hoặc transactionCode để từ chối.',
        });
        return;
      }

      const updatedTx = await paymentsService.rejectPayment(transactionId, reason);

      res.json({
        success: true,
        message: 'Đã đánh dấu từ chối/thất bại cho giao dịch thanh toán.',
        data: updatedTx,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/admin/orders/:id/status
 * Cập nhật trạng thái vận hành của đơn hàng (processing, shipping, delivered, cancelled)
 */
adminRouter.put(
  '/orders/:id/status',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái mới cho đơn hàng.',
        });
        return;
      }

      const updatedOrder = await ordersService.updateStatus(id, status as OrderStatus);

      res.json({
        success: true,
        message: `Đã cập nhật trạng thái đơn hàng sang "${status}" thành công.`,
        data: updatedOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/users
 * Lấy danh sách toàn bộ người dùng
 */
adminRouter.get(
  '/users',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { usersService } = await import('../users/users.service.ts');
      const users = await usersService.getAllUsers();

      res.json({
        success: true,
        message: 'Lấy danh sách người dùng thành công.',
        data: users,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/admin/users/:id/role
 * Cập nhật vai trò người dùng (admin / customer)
 */
adminRouter.put(
  '/users/:id/role',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['customer', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ. Phải là "customer" hoặc "admin".',
        });
        return;
      }

      const { usersService } = await import('../users/users.service.ts');
      const updatedUser = await usersService.updateUserRole(id, role);

      res.json({
        success: true,
        message: `Đã đổi vai trò người dùng thành "${role}".`,
        data: updatedUser,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * Xóa tài khoản người dùng
 */
adminRouter.delete(
  '/users/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { usersService } = await import('../users/users.service.ts');
      await usersService.deleteUser(id);

      res.json({
        success: true,
        message: 'Xóa người dùng thành công.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
