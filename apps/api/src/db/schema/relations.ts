import { relations } from 'drizzle-orm';
import { usersTable } from './users.ts';
import { categoriesTable } from './categories.ts';
import { brandsTable } from './brands.ts';
import { productsTable } from './products.ts';
import { productImagesTable } from './productImages.ts';
import { productVariantsTable } from './productVariants.ts';
import { ordersTable, orderItemsTable } from './orders.ts';

export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
}));

export const brandsRelations = relations(brandsTable, ({ many }) => ({
  products: many(productsTable),
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
  brand: one(brandsTable, {
    fields: [productsTable.brandId],
    references: [brandsTable.id],
  }),
  images: many(productImagesTable),
  variants: many(productVariantsTable),
  orderItems: many(orderItemsTable),
}));

export const productImagesRelations = relations(productImagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productImagesTable.productId],
    references: [productsTable.id],
  }),
}));

export const productVariantsRelations = relations(productVariantsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productVariantsTable.productId],
    references: [productsTable.id],
  }),
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
