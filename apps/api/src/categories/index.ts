/**
 * Public API Contract: Categories Module
 *
 * This is the ONLY authorized entry point for other modules to import from the categories module.
 */

// Router & Controller
export { categoriesRouter } from './categories.controller.ts';

// Service layer
export { categoriesService, CategoriesService } from './categories.service.ts';

// Repository layer
export { categoriesRepository, CategoriesRepository } from './categories.repository.ts';

// Database Schema & Database Types (from centralized db/schema)
export {
  categoriesTable,
  type CategoryRow,
  type InsertCategoryRow,
} from '../db/schema/index.ts';
