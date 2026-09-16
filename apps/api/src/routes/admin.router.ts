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
