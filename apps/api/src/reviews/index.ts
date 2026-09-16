/**
 * Public API Contract: Reviews Module
 */

export { reviewsRouter } from './reviews.controller.ts';
export { reviewsService, ReviewsService } from './reviews.service.ts';
export { reviewsRepository, ReviewsRepository } from './reviews.repository.ts';

export {
  reviewsTable,
  reviewsRelations,
  type ReviewDb,
  type NewReviewDb,
} from '../db/schema/index.ts';
