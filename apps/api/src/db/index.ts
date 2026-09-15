import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { getPostgresClient, getPgliteInstance, getIsUsingPglite } from '../connection.ts';
import { schema } from './schema/index.ts';

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    if (getIsUsingPglite()) {
      const pglite = getPgliteInstance();
      dbInstance = drizzlePglite(pglite, { schema });
    } else {
      const client = getPostgresClient();
      dbInstance = drizzlePostgres(client, { schema });
    }
  }
  return dbInstance;
}

export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getDb();
      const value = instance[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
  }
);

export { schema };

