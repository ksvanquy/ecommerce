import { pgTable, text, integer, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { users } from './users';

export const paymentTransactions = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  transactionCode: varchar('transaction_code', { length: 100 }).notNull().unique(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'vnpay' | 'momo' | 'vietqr' | 'stripe' | 'zalopay' | 'cod'
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('VND'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'success' | 'failed' | 'refunded'
  gatewayTransactionNo: varchar('gateway_transaction_no', { length: 255 }),
  rawPayload: jsonb('raw_payload'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
