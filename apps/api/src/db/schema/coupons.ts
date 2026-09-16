import { pgTable, text, integer, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { orders } from './orders';

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 50 }).notNull(), // 'percentage' | 'fixed_amount'
  discountValue: integer('discount_value').notNull(),
  maxDiscountAmount: integer('max_discount_amount'),
  minOrderValue: integer('min_order_value').notNull().default(0),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').notNull().default(0),
  userLimit: integer('user_limit').notNull().default(1),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const couponUsages = pgTable('coupon_usages', {
  id: text('id').primaryKey(),
  couponId: text('coupon_id')
    .notNull()
    .references(() => coupons.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  discountApplied: integer('discount_applied').notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type CouponUsage = typeof couponUsages.$inferSelect;
export type NewCouponUsage = typeof couponUsages.$inferInsert;
