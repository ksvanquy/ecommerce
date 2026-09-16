import { reviewsRepository } from './reviews.repository.ts';
import { productsRepository } from '../products/index.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type {
  CreateReviewPayload,
  Review,
  ReviewSummary,
} from '@repo/shared-types';

export class ReviewsService {
  async createReview(payload: CreateReviewPayload, userId: string): Promise<Review> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để gửi đánh giá', 401, 'UNAUTHORIZED');
    }

    const product = await productsRepository.findById(payload.productId);
    if (!product) {
      throw new AppError(`Sản phẩm không tồn tại (ID: ${payload.productId})`, 404, 'PRODUCT_NOT_FOUND');
    }

    const isVerifiedBuyer = await reviewsRepository.checkUserPurchasedProduct(userId, payload.productId);

    const review = await reviewsRepository.createReview({
      userId,
      productId: payload.productId,
      orderId: payload.orderId || null,
      rating: payload.rating,
      title: payload.title || null,
      comment: payload.comment.trim(),
      images: payload.images || [],
      isVerifiedBuyer,
      status: 'approved',
    });

    return review;
  }

  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    items: Review[];
    summary: ReviewSummary;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const product = await productsRepository.findById(productId);
    if (!product) {
      throw new AppError(`Sản phẩm không tồn tại (ID: ${productId})`, 404, 'PRODUCT_NOT_FOUND');
    }

    const [paginated, summary] = await Promise.all([
      reviewsRepository.findByProductId(productId, page, limit),
      reviewsRepository.getProductRatingSummary(productId),
    ]);

    return {
      items: paginated.items,
      summary,
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        total: paginated.total,
        totalPages: paginated.totalPages,
      },
    };
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    return await reviewsRepository.listRecentReviews(limit);
  }
}

export const reviewsService = new ReviewsService();
