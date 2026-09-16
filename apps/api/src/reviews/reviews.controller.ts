import { Router, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service.ts';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';
import {
  createReviewSchema,
  type CreateReviewPayload,
} from '@repo/shared-types';

export const reviewsRouter = Router();

/**
 * GET /reviews/product/:productId - Lấy danh sách đánh giá & thống kê sao của sản phẩm
 */
reviewsRouter.get(
  '/product/:productId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await reviewsService.getProductReviews(productId, page, limit);

      res.json({
        success: true,
        data: result.items,
        summary: result.summary,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /reviews/recent - Lấy các đánh giá mới nhất trên toàn hệ thống
 */
reviewsRouter.get(
  '/recent',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const reviews = await reviewsService.getRecentReviews(limit);

      res.json({
        success: true,
        data: reviews,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /reviews - Gửi đánh giá sản phẩm (Yêu cầu đăng nhập)
 */
reviewsRouter.post(
  '/',
  authMiddleware,
  validateBody(createReviewSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const payload = req.body as CreateReviewPayload;

      const review = await reviewsService.createReview(payload, userId);

      res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
        data: review,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);
