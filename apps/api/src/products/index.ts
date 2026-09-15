/**
 * Public API Contract: Products Module
 *
 * This is the ONLY authorized entry point for other modules to import from the products module.
 */

// Router & Controller
export { productsRouter } from './products.controller.ts';

// Service layer
export { productsService, ProductsService } from './products.service.ts';

// Repository layer
export {
  productsRepository,
  ProductsRepository,
  type PaginatedResult,
} from './products.repository.ts';

// Database Schema & Database Types (from centralized db/schema)
export {
  productsTable,
  type ProductDb,
  type NewProductDb,
} from '../db/schema/index.ts';
