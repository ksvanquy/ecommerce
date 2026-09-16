import { pgTable, text, integer, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
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
