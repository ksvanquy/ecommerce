import { drizzle } from 'drizzle-orm/postgres-js';
import { getPostgresClient } from './connection.ts';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const client = getPostgresClient();
    dbInstance = drizzle(client);
  }
  return dbInstance;
}

export const db = getDb();
