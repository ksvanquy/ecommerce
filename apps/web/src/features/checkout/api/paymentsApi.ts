import { apiClient } from '../../../lib/axios.ts';
import type {
  CreatePaymentIntentPayload,
  PaymentTransaction,
} from '@repo/shared-types';

export interface PaymentIntentResponse {
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

export const paymentsApi = {
  createIntent: async (payload: CreatePaymentIntentPayload): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post('/payments/create-intent', payload);
    return response.data.data;
  },

  getOrderTransactions: async (orderId: string): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data.data;
  },

  verifyTransaction: async (transactionCode: string): Promise<PaymentTransaction> => {
    const response = await apiClient.get(`/payments/verify/${transactionCode}`);
    return response.data.data;
  },

  confirmPayment: async (transactionCode: string, gatewayTxNo?: string, isManualReport?: boolean): Promise<{ transaction: PaymentTransaction; orderPaid: boolean }> => {
    const response = await apiClient.post('/payments/confirm', {
      transactionCode,
      gatewayTxNo,
      isManualReport,
    });
    return response.data.data;
  },
};
