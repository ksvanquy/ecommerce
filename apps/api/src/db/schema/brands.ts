import { pgTable, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const brandsTable = pgTable('brands', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logoUrl: text('logo_url'),
  description: text('description'),
  website: varchar('website', { length: 255 }),
  country: varchar('country', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type BrandDb = typeof brandsTable.$inferSelect;
export type NewBrandDb = typeof brandsTable.$inferInsert;
