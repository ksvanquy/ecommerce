import { pgTable, text, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable('categories', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: text('parent_id'),
  icon: varchar('icon', { length: 100 }).default('folder'),
  level: integer('level').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CategoryRow = typeof categoriesTable.$inferSelect;
export type InsertCategoryRow = typeof categoriesTable.$inferInsert;
