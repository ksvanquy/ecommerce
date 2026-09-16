import { pgTable, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { usersTable } from './users.ts';

export const userAddressesTable = pgTable('user_addresses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  receiverName: varchar('receiver_name', { length: 255 }).notNull(),
  receiverPhone: varchar('receiver_phone', { length: 50 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  ward: varchar('ward', { length: 100 }).notNull(),
  streetAddress: text('street_address').notNull(),
  addressType: varchar('address_type', { length: 50 }).notNull().default('home'), // 'home' | 'office' | 'other'
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserAddress = typeof userAddressesTable.$inferSelect;
export type NewUserAddress = typeof userAddressesTable.$inferInsert;
