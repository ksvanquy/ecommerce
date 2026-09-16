import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { reviewsTable, usersTable, ordersTable, orderItemsTable } from '../db/schema/index.ts';
import type { Review, ReviewSummary, CreateReviewPayload } from '@repo/shared-types';

export class ReviewsRepository {
  private formatReview(dbReview: any, userMap?: Map<string, any>): Review {
    const user = userMap?.get(dbReview.userId);

    let images: string[] = [];
    if (Array.isArray(dbReview.images)) {
      images = dbReview.images;
    } else if (typeof dbReview.images === 'string') {
      try {
        images = JSON.parse(dbReview.images);
      } catch {
        images = [];
      }
    }

    return {
      id: dbReview.id,
      userId: dbReview.userId,
      user: user
        ? {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          }
        : undefined,
      productId: dbReview.productId,
      orderId: dbReview.orderId || null,
      rating: dbReview.rating,
      title: dbReview.title || null,
      comment: dbReview.comment,
      images,
      isVerifiedBuyer: dbReview.isVerifiedBuyer,
      status: dbReview.status as any,
      createdAt: dbReview.createdAt.toISOString(),
      updatedAt: dbReview.updatedAt.toISOString(),
    };
  }

  async createReview(data: {
    userId: string;
    productId: string;
    orderId?: string | null;
    rating: number;
    title?: string | null;
    comment: string;
    images?: string[];
    isVerifiedBuyer: boolean;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<Review> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await db
      .insert(reviewsTable)
      .values({
        id,
        userId: data.userId,
        productId: data.productId,
        orderId: data.orderId || null,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        images: data.images || [],
        isVerifiedBuyer: data.isVerifiedBuyer,
        status: data.status || 'approved',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Fetch author info
    const [user] = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, data.userId))
      .limit(1);

    const userMap = new Map();
    if (user) userMap.set(user.id, user);

    return this.formatReview(created, userMap);
  }

  async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 20,
    status: string = 'approved'
  ): Promise<{ items: Review[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const condition = and(
      eq(reviewsTable.productId, productId),
      eq(reviewsTable.status, status)
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewsTable)
      .where(condition);

    const total = Number(countResult?.count || 0);

    const dbReviews = await db
      .select()
      .from(reviewsTable)
      .where(condition)
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset);

    if (dbReviews.length === 0) {
      return {
        items: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const userIds: string[] = Array.from(new Set(dbReviews.map((r) => r.userId)));
    const dbUsers = userIds.length > 0
      ? await db
          .select({ id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email })
          .from(usersTable)
          .where(inArray(usersTable.id, userIds))
      : [];

    const userMap = new Map<string, any>();
    for (const u of dbUsers) {
      userMap.set(u.id, u);
    }

    const items = dbReviews.map((r) => this.formatReview(r, userMap));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getProductRatingSummary(productId: string): Promise<ReviewSummary> {
    const dbReviews = await db
      .select({ rating: reviewsTable.rating })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.productId, productId),
          eq(reviewsTable.status, 'approved')
        )
      );

    const totalReviews = dbReviews.length;
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (totalReviews === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        ratingDistribution,
      };
    }

    let sum = 0;
    for (const r of dbReviews) {
      sum += r.rating;
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
    }

    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }

  async checkUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const rows = await db
      .select({ orderId: ordersTable.id })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(
        and(
          eq(ordersTable.userId, userId),
          eq(orderItemsTable.productId, productId)
        )
      )
      .limit(1);

    return rows.length > 0;
  }

  async listRecentReviews(limit: number = 10): Promise<Review[]> {
    const rows = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, 'approved'))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit);

    if (rows.length === 0) return [];

    const userIds: string[] = Array.from(new Set(rows.map((r) => r.userId)));
    const dbUsers = userIds.length > 0
      ? await db
          .select({ id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email })
          .from(usersTable)
          .where(inArray(usersTable.id, userIds))
      : [];

    const userMap = new Map<string, any>();
    for (const u of dbUsers) {
      userMap.set(u.id, u);
    }

    return rows.map((r) => this.formatReview(r, userMap));
  }
}

export const reviewsRepository = new ReviewsRepository();
