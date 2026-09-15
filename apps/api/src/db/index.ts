import { drizzle } from 'drizzle-orm/postgres-js';
import { getPostgresClient } from '../connection.ts';
import { schema } from './schema/index.ts';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const client = getPostgresClient();
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export const db = getDb();
export { schema };
