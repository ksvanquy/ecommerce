import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserDb = typeof usersTable.$inferSelect;
export type NewUserDb = typeof usersTable.$inferInsert;
