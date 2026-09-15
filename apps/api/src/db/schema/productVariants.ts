import { pgTable, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { productsTable } from './products.ts';

export const productVariantsTable = pgTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => productsTable.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  colorName: varchar('color_name', { length: 50 }),
  colorCode: varchar('color_code', { length: 20 }),
  specSummary: varchar('spec_summary', { length: 255 }),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  inventory: integer('inventory').notNull().default(0),
  imageUrl: text('image_url'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProductVariantDb = typeof productVariantsTable.$inferSelect;
export type NewProductVariantDb = typeof productVariantsTable.$inferInsert;
