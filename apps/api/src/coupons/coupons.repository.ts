import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { couponsTable, couponUsagesTable } from '../db/schema/index.ts';
import type { Coupon, CreateCouponPayload } from '@repo/shared-types';

export class CouponsRepository {
  private formatCoupon(dbCoupon: any): Coupon {
    return {
      id: dbCoupon.id,
      code: dbCoupon.code,
      title: dbCoupon.title,
      description: dbCoupon.description || null,
      discountType: dbCoupon.discountType as 'percentage' | 'fixed_amount',
      discountValue: dbCoupon.discountValue,
      maxDiscountAmount: dbCoupon.maxDiscountAmount || null,
      minOrderValue: dbCoupon.minOrderValue,
      usageLimit: dbCoupon.usageLimit || null,
      usedCount: dbCoupon.usedCount,
      userLimit: dbCoupon.userLimit,
      startDate: dbCoupon.startDate.toISOString(),
      endDate: dbCoupon.endDate.toISOString(),
      isActive: dbCoupon.isActive,
      createdAt: dbCoupon.createdAt.toISOString(),
      updatedAt: dbCoupon.updatedAt.toISOString(),
    };
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(sql`UPPER(${couponsTable.code}) = UPPER(${code})`)
      .limit(1);

    return coupon ? this.formatCoupon(coupon) : null;
  }

  async findById(id: string): Promise<Coupon | null> {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, id))
      .limit(1);

    return coupon ? this.formatCoupon(coupon) : null;
  }

  async listActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    const rows = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.isActive, true),
          lte(couponsTable.startDate, now),
          gte(couponsTable.endDate, now)
        )
      )
      .orderBy(desc(couponsTable.createdAt));

    return rows.map((r) => this.formatCoupon(r));
  }

  async listAllCoupons(): Promise<Coupon[]> {
    const rows = await db
      .select()
      .from(couponsTable)
      .orderBy(desc(couponsTable.createdAt));

    return rows.map((r) => this.formatCoupon(r));
  }

  async getUsageCountByUser(couponId: string, userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(couponUsagesTable)
      .where(
        and(
          eq(couponUsagesTable.couponId, couponId),
          eq(couponUsagesTable.userId, userId)
        )
      );

    return Number(result?.count || 0);
  }

  async incrementUsage(couponId: string): Promise<void> {
    await db
      .update(couponsTable)
      .set({
        usedCount: sql`${couponsTable.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(couponsTable.id, couponId));
  }

  async recordUsage(couponId: string, userId: string, orderId: string, discountApplied: number): Promise<void> {
    const id = `use_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(couponUsagesTable).values({
      id,
      couponId,
      userId,
      orderId,
      discountApplied,
      usedAt: new Date(),
    });

    await this.incrementUsage(couponId);
  }

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await db
      .insert(couponsTable)
      .values({
        id,
        code: payload.code.toUpperCase().trim(),
        title: payload.title.trim(),
        description: payload.description || null,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        maxDiscountAmount: payload.maxDiscountAmount || null,
        minOrderValue: payload.minOrderValue || 0,
        usageLimit: payload.usageLimit || null,
        usedCount: 0,
        userLimit: payload.userLimit || 1,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        isActive: payload.isActive !== false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.formatCoupon(created);
  }
}

export const couponsRepository = new CouponsRepository();
