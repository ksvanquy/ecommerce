/**
 * Public API Contract: Payments Module
 */

export { paymentsRouter } from './payments.controller.ts';
export { paymentsService, PaymentsService, type PaymentIntentResult } from './payments.service.ts';
export { paymentsRepository, PaymentsRepository } from './payments.repository.ts';

export {
  paymentTransactionsTable,
  paymentTransactionsRelations,
  type PaymentTransactionDb,
  type NewPaymentTransactionDb,
} from '../db/schema/index.ts';
