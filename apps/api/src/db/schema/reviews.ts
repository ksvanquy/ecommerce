import { pgTable, text, integer, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { usersTable } from './users.ts';
import { productsTable } from './products.ts';
import { ordersTable } from './orders.ts';

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  orderId: text('order_id').references(() => ordersTable.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment').notNull(),
  images: jsonb('images').$type<string[]>(),
  isVerifiedBuyer: boolean('is_verified_buyer').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('approved'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type ReviewDb = Review;
export type NewReviewDb = NewReview;

export const reviewsTable = reviews;

