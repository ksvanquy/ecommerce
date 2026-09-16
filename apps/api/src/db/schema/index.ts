import * as users from './users.ts';
import * as categories from './categories.ts';
import * as brands from './brands.ts';
import * as products from './products.ts';
import * as productImages from './productImages.ts';
import * as productVariants from './productVariants.ts';
import * as orders from './orders.ts';
import * as carts from './carts.ts';
import * as coupons from './coupons.ts';
import * as payments from './payments.ts';
import * as reviews from './reviews.ts';
import * as relations from './relations.ts';

export * from './users.ts';
export * from './categories.ts';
export * from './brands.ts';
export * from './products.ts';
export * from './productImages.ts';
export * from './productVariants.ts';
export * from './orders.ts';
export * from './carts.ts';
export * from './coupons.ts';
export * from './payments.ts';
export * from './reviews.ts';
export * from './relations.ts';

export const schema = {
  ...users,
  ...categories,
  ...brands,
  ...products,
  ...productImages,
  ...productVariants,
  ...orders,
  ...carts,
  ...coupons,
  ...payments,
  ...reviews,
  ...relations,
};

export default schema;
