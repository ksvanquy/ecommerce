import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from '../users/users.schema.ts';
import { productsTable } from '../products/products.schema.ts';

export const ordersTable = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => usersTable.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  shippingAddress: text('shipping_address').notNull(),
  customerNote: text('customer_note'),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  shippingFee: integer('shipping_fee').notNull().default(0),
  couponCode: varchar('coupon_code', { length: 50 }),
  totalAmount: integer('total_amount').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('cod'),
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('unpaid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItemsTable = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => ordersTable.id).notNull(),
  productId: text('product_id').references(() => productsTable.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productImage: text('product_image'),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: integer('subtotal').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id],
  }),
}));

export type OrderDb = typeof ordersTable.$inferSelect;
export type NewOrderDb = typeof ordersTable.$inferInsert;
export type OrderItemDb = typeof orderItemsTable.$inferSelect;
export type NewOrderItemDb = typeof orderItemsTable.$inferInsert;
