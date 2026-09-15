import * as users from './users.ts';
import * as categories from './categories.ts';
import * as brands from './brands.ts';
import * as products from './products.ts';
import * as productImages from './productImages.ts';
import * as productVariants from './productVariants.ts';
import * as orders from './orders.ts';
import * as relations from './relations.ts';

export * from './users.ts';
export * from './categories.ts';
export * from './brands.ts';
export * from './products.ts';
export * from './productImages.ts';
export * from './productVariants.ts';
export * from './orders.ts';
export * from './relations.ts';

export const schema = {
  ...users,
  ...categories,
  ...brands,
  ...products,
  ...productImages,
  ...productVariants,
  ...orders,
  ...relations,
};

export default schema;
