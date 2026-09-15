import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const productsTable = pgTable('products', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  inventory: integer('inventory').notNull().default(0),
  category: varchar('category', { length: 100 }).notNull(),
  categoryId: text('category_id'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProductDb = typeof productsTable.$inferSelect;
export type NewProductDb = typeof productsTable.$inferInsert;
