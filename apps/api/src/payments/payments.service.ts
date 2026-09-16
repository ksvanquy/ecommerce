import { paymentsRepository } from './payments.repository.ts';
import { ordersRepository } from '../orders/index.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type {
  CreatePaymentIntentPayload,
  PaymentTransaction,
} from '@repo/shared-types';

export interface PaymentIntentResult {
  transaction: PaymentTransaction;
  provider: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  transferInfo?: {
    bankName: string;
    bankCode: string;
    accountNo: string;
    accountName: string;
    amount: number;
    currency: string;
    transferContent: string;
    note: string;
  };
}

export class PaymentsService {
  async createPaymentIntent(
    payload: CreatePaymentIntentPayload,
    userId?: string | null
  ): Promise<PaymentIntentResult> {
    const order = await ordersRepository.findById(payload.orderId);
    if (!order) {
      throw new AppError(`Đơn hàng không tồn tại (ID: ${payload.orderId})`, 404, 'ORDER_NOT_FOUND');
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError('Đơn hàng này đã được thanh toán hoàn tất trước đó', 400, 'ORDER_ALREADY_PAID');
    }

    // Generate unique transaction code
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionCode = `TXN-${dateStr}-${randomSuffix}`;

    const transaction = await paymentsRepository.createTransaction({
      orderId: order.id,
      userId: userId || order.userId || null,
      transactionCode,
      provider: payload.provider,
      amount: order.totalAmount,
      currency: 'VND',
      status: 'pending',
    });

    const transferContent = `TT DH ${transactionCode}`;
    const encodedContent = encodeURIComponent(transferContent);
    const bankCode = 'MB';
    const bankName = 'MBBank - Ngân hàng TMCP Quân Đội';
    const accountNo = '0388998899';
    const accountName = 'CONG TY TECHSTORE VIETNAM';

    // Generate VietQR dynamic payment QR URL (Standard VietQR specification)
    const qrCodeUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodedContent}&accountName=${encodeURIComponent(accountName)}`;

    let paymentUrl = qrCodeUrl;
    if (payload.provider === 'vnpay') {
      paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${transactionCode}&vnp_Amount=${order.totalAmount * 100}&vnp_OrderInfo=${encodedContent}`;
    } else if (payload.provider === 'momo') {
      paymentUrl = `https://test-payment.momo.vn/v2/gateway/pay?partnerCode=MOMO&orderId=${transactionCode}&amount=${order.totalAmount}`;
    }

    return {
      transaction,
      provider: payload.provider,
      paymentUrl,
      qrCodeUrl,
      transferInfo: {
        bankName,
        bankCode,
        accountNo,
        accountName,
        amount: order.totalAmount,
        currency: 'VND',
        transferContent,
        note: 'Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng trong 1-3 phút.',
      },
    };
  }

  async confirmPayment(
    transactionCode: string,
    gatewayTransactionNo?: string,
    rawPayload?: unknown,
    isManualReport: boolean = false
  ): Promise<{ transaction: PaymentTransaction; orderPaid: boolean }> {
    const transaction = await paymentsRepository.findByTransactionCode(transactionCode);
    if (!transaction) {
      throw new AppError(`Không tìm thấy mã giao dịch "${transactionCode}"`, 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.status === 'success') {
      return { transaction, orderPaid: true };
    }

    if (isManualReport) {
      // Đối với yêu cầu tự báo cáo chuyển khoản thủ công của khách hàng, ta KHÔNG tự động duyệt thành công!
      // Giữ nguyên trạng thái giao dịch là 'pending' (chờ duyệt) và KHÔNG cập nhật trạng thái đơn hàng sang 'paid'
      const updatedTx = await paymentsRepository.updateTransactionStatus(
        transaction.id,
        'pending',
        gatewayTransactionNo || `MANUAL-REPORT-${Date.now()}`,
        rawPayload
      );
      return {
        transaction: updatedTx!,
        orderPaid: false, // Vẫn là chưa thanh toán, admin sẽ đối soát và duyệt thủ công sau
      };
    }

    const updatedTx = await paymentsRepository.updateTransactionStatus(
      transaction.id,
      'success',
      gatewayTransactionNo || `GW-${Date.now()}`,
      rawPayload
    );

    // Update order payment status to 'paid' and order status to 'processing'
    await ordersRepository.updatePaymentStatus(transaction.orderId, 'paid', true);

    return {
      transaction: updatedTx!,
      orderPaid: true,
    };
  }

  async getTransactionsByOrder(orderId: string): Promise<PaymentTransaction[]> {
    return await paymentsRepository.findByOrderId(orderId);
  }

  async getAllTransactions(): Promise<PaymentTransaction[]> {
    return await paymentsRepository.findAllTransactions();
  }

  async approvePayment(transactionId: string): Promise<PaymentTransaction> {
    const transactions = await paymentsRepository.findAllTransactions();
    const tx = transactions.find((t) => t.id === transactionId || t.transactionCode === transactionId);
    if (!tx) {
      throw new AppError(`Không tìm thấy giao dịch với ID/Mã "${transactionId}"`, 404, 'TRANSACTION_NOT_FOUND');
    }

    if (tx.status === 'success') {
      return tx;
    }

    const updatedTx = await paymentsRepository.updateTransactionStatus(
      tx.id,
      'success',
      `APPROVED-MANUAL-${Date.now()}`,
      { approvedBy: 'admin', approvedAt: new Date().toISOString() }
    );

    // Cập nhật trạng thái đơn hàng sang 'paid' và bắt đầu xử lý đóng gói 'processing'
    await ordersRepository.updatePaymentStatus(tx.orderId, 'paid', true);

    return updatedTx!;
  }

  async getTransactionByCode(transactionCode: string): Promise<PaymentTransaction> {
    const tx = await paymentsRepository.findByTransactionCode(transactionCode);
    if (!tx) {
      throw new AppError(`Không tìm thấy giao dịch "${transactionCode}"`, 404, 'TRANSACTION_NOT_FOUND');
    }
    return tx;
  }
}

export const paymentsService = new PaymentsService();
