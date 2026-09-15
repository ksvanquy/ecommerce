import { relations } from 'drizzle-orm';
import { usersTable } from './users.ts';
import { categoriesTable } from './categories.ts';
import { productsTable } from './products.ts';
import { ordersTable, orderItemsTable } from './orders.ts';

export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  parent: one(categoriesTable, {
    fields: [categoriesTable.parentId],
    references: [categoriesTable.id],
    relationName: 'category_hierarchy',
  }),
  children: many(categoriesTable, {
    relationName: 'category_hierarchy',
  }),
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id],
  }),
  orderItems: many(orderItemsTable),
}));

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
