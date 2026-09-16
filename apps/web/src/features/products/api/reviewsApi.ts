import { apiClient } from '../../../lib/axios.ts';
import type {
  Review,
  ReviewSummary,
  CreateReviewPayload,
} from '@repo/shared-types';

export interface ProductReviewsResponse {
  items: Review[];
  summary: ReviewSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  getProductReviews: async (productId: string, page = 1, limit = 20): Promise<ProductReviewsResponse> => {
    const response = await apiClient.get(`/api/products/${productId}/reviews`, {
      params: { page, limit },
    });
    return {
      items: response.data.data,
      summary: response.data.summary,
      pagination: response.data.pagination,
    };
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await apiClient.post('/api/reviews', payload);
    return response.data.data;
  },

  getRecentReviews: async (limit = 10): Promise<Review[]> => {
    const response = await apiClient.get('/api/reviews/recent', {
      params: { limit },
    });
    return response.data.data;
  },
};
