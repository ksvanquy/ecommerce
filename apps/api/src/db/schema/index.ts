import * as users from './users.ts';
import * as categories from './categories.ts';
import * as products from './products.ts';
import * as orders from './orders.ts';
import * as relations from './relations.ts';

export * from './users.ts';
export * from './categories.ts';
export * from './products.ts';
export * from './orders.ts';
export * from './relations.ts';

export const schema = {
  ...users,
  ...categories,
  ...products,
  ...orders,
  ...relations,
};

export default schema;
