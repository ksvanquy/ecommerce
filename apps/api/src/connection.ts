import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ecommerce';

let client: postgres.Sql | null = null;
let pgliteInstance: PGlite | null = null;
let isUsingPglite = false;
let lastCheckTime = 0;
let lastCheckResult: { connected: boolean; message: string } | null = null;
const CACHE_TTL_MS = 10000;

export function getPgliteInstance(): PGlite {
  if (!pgliteInstance) {
    pgliteInstance = new PGlite();
  }
  return pgliteInstance;
}

export function getIsUsingPglite(): boolean {
  return isUsingPglite;
}

export function getPostgresClient(): postgres.Sql {
  if (!client) {
    client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 2,
      onnotice: () => {},
    });
  }
  return client;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  const now = Date.now();
  if (lastCheckResult && now - lastCheckTime < CACHE_TTL_MS) {
    return lastCheckResult;
  }

  try {
    const sqlClient = getPostgresClient();
    // Quick probe query to external postgres
    await sqlClient`SELECT 1 as health_check`;
    isUsingPglite = false;
    lastCheckResult = {
      connected: true,
      message: 'PostgreSQL connection active',
    };
  } catch (_error: unknown) {
    console.warn('[DB] External PostgreSQL not reachable. Fallback to embedded PGlite in-memory database.');
    isUsingPglite = true;
    try {
      const pglite = getPgliteInstance();
      await pglite.exec('SELECT 1;');
      lastCheckResult = {
        connected: true,
        message: 'Embedded PGlite database active',
      };
    } catch (pgliteError: unknown) {
      const msg = pgliteError instanceof Error ? pgliteError.message : 'Unable to connect to PGlite database';
      lastCheckResult = {
        connected: false,
        message: msg,
      };
    }
  }

  lastCheckTime = now;
  return lastCheckResult;
}


