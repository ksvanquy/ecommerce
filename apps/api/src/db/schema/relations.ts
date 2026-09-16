import { relations } from 'drizzle-orm';
import { usersTable } from './users.ts';
import { categoriesTable } from './categories.ts';
import { brandsTable } from './brands.ts';
import { productsTable } from './products.ts';
import { productImagesTable } from './productImages.ts';
import { productVariantsTable } from './productVariants.ts';
import { ordersTable, orderItemsTable } from './orders.ts';
import { cartsTable, cartItemsTable } from './carts.ts';
import { couponsTable, couponUsagesTable } from './coupons.ts';
import { paymentTransactionsTable } from './payments.ts';
import { reviewsTable } from './reviews.ts';
import { userAddressesTable } from './addresses.ts';

export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
  carts: many(cartsTable),
  reviews: many(reviewsTable),
  couponUsages: many(couponUsagesTable),
  paymentTransactions: many(paymentTransactionsTable),
  addresses: many(userAddressesTable),
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
  reviews: many(reviewsTable),
  cartItems: many(cartItemsTable),
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
  paymentTransactions: many(paymentTransactionsTable),
  couponUsages: many(couponUsagesTable),
  reviews: many(reviewsTable),
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

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [cartsTable.userId],
    references: [usersTable.id],
  }),
  items: many(cartItemsTable),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cartId],
    references: [cartsTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.productId],
    references: [productsTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [cartItemsTable.variantId],
    references: [productVariantsTable.id],
  }),
}));

export const couponsRelations = relations(couponsTable, ({ many }) => ({
  usages: many(couponUsagesTable),
}));

export const couponUsagesRelations = relations(couponUsagesTable, ({ one }) => ({
  coupon: one(couponsTable, {
    fields: [couponUsagesTable.couponId],
    references: [couponsTable.id],
  }),
  user: one(usersTable, {
    fields: [couponUsagesTable.userId],
    references: [usersTable.id],
  }),
  order: one(ordersTable, {
    fields: [couponUsagesTable.orderId],
    references: [ordersTable.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactionsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [paymentTransactionsTable.orderId],
    references: [ordersTable.id],
  }),
  user: one(usersTable, {
    fields: [paymentTransactionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [reviewsTable.userId],
    references: [usersTable.id],
  }),
  product: one(productsTable, {
    fields: [reviewsTable.productId],
    references: [productsTable.id],
  }),
  order: one(ordersTable, {
    fields: [reviewsTable.orderId],
    references: [ordersTable.id],
  }),
}));

export const userAddressesRelations = relations(userAddressesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userAddressesTable.userId],
    references: [usersTable.id],
  }),
}));

