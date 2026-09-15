/**
 * Public API Contract: Orders Module
 *
 * This is the ONLY authorized entry point for other modules to import from the orders module.
 */

// Router & Controller
export { ordersRouter } from './orders.controller.ts';

// Service layer
export { ordersService, OrdersService } from './orders.service.ts';

// Repository layer
export { ordersRepository, OrdersRepository } from './orders.repository.ts';

// Database Schema & Database Types (from centralized db/schema)
export {
  ordersTable,
  orderItemsTable,
  ordersRelations,
  orderItemsRelations,
  type OrderDb,
  type NewOrderDb,
  type OrderItemDb,
  type NewOrderItemDb,
} from '../db/schema/index.ts';
