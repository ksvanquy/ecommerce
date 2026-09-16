import { Router, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service.ts';
import {
  optionalAuthMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';
import {
  createPaymentIntentSchema,
  type CreatePaymentIntentPayload,
} from '@repo/shared-types';

export const paymentsRouter = Router();

/**
 * POST /payments/create-intent - Tạo phiên thanh toán Online (VietQR / VNPay / MoMo)
 */
paymentsRouter.post(
  '/create-intent',
  optionalAuthMiddleware,
  validateBody(createPaymentIntentSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as CreatePaymentIntentPayload;
      const userId = req.user?.userId || null;

      const result = await paymentsService.createPaymentIntent(payload, userId);

      res.status(201).json({
        success: true,
        message: 'Khởi tạo phiên thanh toán thành công',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /payments/order/:orderId - Lấy lịch sử giao dịch của 1 đơn hàng
 */
paymentsRouter.get(
  '/order/:orderId',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      const transactions = await paymentsService.getTransactionsByOrder(orderId);

      res.json({
        success: true,
        data: transactions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /payments/verify/:transactionCode - Kiểm tra trạng thái giao dịch thanh toán
 */
paymentsRouter.get(
  '/verify/:transactionCode',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionCode = req.params.transactionCode;
      const tx = await paymentsService.getTransactionByCode(transactionCode);

      res.json({
        success: true,
        data: tx,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /payments/confirm - Xác nhận đã nhận tiền (Môi trường Sandbox / Test hoặc Thủ công)
 */
paymentsRouter.post(
  '/confirm',
  optionalAuthMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionCode, gatewayTxNo, isManualReport } = req.body;
      if (!transactionCode) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã giao dịch transactionCode',
        });
        return;
      }

      const result = await paymentsService.confirmPayment(
        transactionCode,
        gatewayTxNo,
        req.body,
        !!isManualReport
      );

      res.json({
        success: true,
        message: isManualReport
          ? 'Yêu cầu đối soát thanh toán đã được tiếp nhận. Đơn hàng sẽ được Admin phê duyệt thủ công.'
          : 'Xác nhận thanh toán thành công. Đơn hàng đã chuyển sang trạng thái Đang xử lý.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /payments/webhook - Tiếp nhận Webhook IPN từ cổng thanh toán
 */
paymentsRouter.post(
  '/webhook',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body;
      const transactionCode = payload.transactionCode || payload.vnp_TxnRef || payload.orderId;
      const gatewayTxNo = payload.gatewayTransactionNo || payload.vnp_TransactionNo || payload.transId;

      if (transactionCode) {
        await paymentsService.confirmPayment(transactionCode, gatewayTxNo, payload);
      }

      res.json({
        RspCode: '00',
        Message: 'Confirm Success',
      });
    } catch (error) {
      next(error);
    }
  }
);
