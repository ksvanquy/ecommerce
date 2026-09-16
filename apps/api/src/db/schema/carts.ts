import { pgTable, text, integer, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.ts';
import { productsTable } from './products.ts';
import { productVariantsTable } from './productVariants.ts';

export const carts = pgTable('carts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariantsTable.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  isSelected: boolean('is_selected').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type CartDb = Cart;
export type NewCartDb = NewCart;
export type CartItemDb = CartItem;
export type NewCartItemDb = NewCartItem;

export const cartsTable = carts;
export const cartItemsTable = cartItems;

