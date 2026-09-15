import { pgTable, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { productsTable } from './products.ts';

export const productImagesTable = pgTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => productsTable.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  isThumbnail: boolean('is_thumbnail').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProductImageDb = typeof productImagesTable.$inferSelect;
export type NewProductImageDb = typeof productImagesTable.$inferInsert;
