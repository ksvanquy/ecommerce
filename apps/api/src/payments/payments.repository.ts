import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { paymentTransactionsTable } from '../db/schema/index.ts';
import type { PaymentTransaction } from '@repo/shared-types';

export class PaymentsRepository {
  private formatTransaction(dbTx: any): PaymentTransaction {
    return {
      id: dbTx.id,
      orderId: dbTx.orderId,
      userId: dbTx.userId || null,
      transactionCode: dbTx.transactionCode,
      provider: dbTx.provider as any,
      amount: dbTx.amount,
      currency: dbTx.currency,
      status: dbTx.status as any,
      gatewayTransactionNo: dbTx.gatewayTransactionNo || null,
      rawPayload: dbTx.rawPayload,
      paidAt: dbTx.paidAt ? dbTx.paidAt.toISOString() : null,
      createdAt: dbTx.createdAt.toISOString(),
      updatedAt: dbTx.updatedAt.toISOString(),
    };
  }

  async createTransaction(data: {
    orderId: string;
    userId?: string | null;
    transactionCode: string;
    provider: 'vnpay' | 'momo' | 'vietqr' | 'stripe' | 'zalopay' | 'cod';
    amount: number;
    currency?: string;
    status?: 'pending' | 'success' | 'failed' | 'refunded';
    gatewayTransactionNo?: string | null;
    rawPayload?: unknown;
  }): Promise<PaymentTransaction> {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const dbUserId = data.userId && !data.userId.startsWith('guest') ? data.userId : null;

    const [created] = await db
      .insert(paymentTransactionsTable)
      .values({
        id,
        orderId: data.orderId,
        userId: dbUserId,
        transactionCode: data.transactionCode,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency || 'VND',
        status: data.status || 'pending',
        gatewayTransactionNo: data.gatewayTransactionNo || null,
        rawPayload: data.rawPayload || null,
        paidAt: data.status === 'success' ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.formatTransaction(created);
  }

  async findByTransactionCode(code: string): Promise<PaymentTransaction | null> {
    const [tx] = await db
      .select()
      .from(paymentTransactionsTable)
      .where(eq(paymentTransactionsTable.transactionCode, code))
      .limit(1);

    return tx ? this.formatTransaction(tx) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentTransaction[]> {
    const rows = await db
      .select()
      .from(paymentTransactionsTable)
      .where(eq(paymentTransactionsTable.orderId, orderId))
      .orderBy(desc(paymentTransactionsTable.createdAt));

    return rows.map((r) => this.formatTransaction(r));
  }

  async updateTransactionStatus(
    id: string,
    status: 'pending' | 'success' | 'failed' | 'refunded',
    gatewayTxNo?: string | null,
    rawPayload?: unknown
  ): Promise<PaymentTransaction | null> {
    const now = new Date();
    const updateData: Record<string, any> = {
      status,
      updatedAt: now,
    };

    if (gatewayTxNo) updateData.gatewayTransactionNo = gatewayTxNo;
    if (rawPayload) updateData.rawPayload = rawPayload;
    if (status === 'success') updateData.paidAt = now;

    const [updated] = await db
      .update(paymentTransactionsTable)
      .set(updateData)
      .where(eq(paymentTransactionsTable.id, id))
      .returning();

    return updated ? this.formatTransaction(updated) : null;
  }
}

export const paymentsRepository = new PaymentsRepository();
