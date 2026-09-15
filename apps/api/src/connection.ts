import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ecommerce';

let client: postgres.Sql | null = null;
let lastCheckTime = 0;
let lastCheckResult: { connected: boolean; message: string } | null = null;
const CACHE_TTL_MS = 10000;

export function getPostgresClient(): postgres.Sql {
  if (!client) {
    client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 3,
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
    const sql = getPostgresClient();
    // Quick probe query
    await sql`SELECT 1 as health_check`;
    lastCheckResult = {
      connected: true,
      message: 'PostgreSQL connection active',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unable to connect to PostgreSQL database';
    lastCheckResult = {
      connected: false,
      message: msg,
    };
  }

  lastCheckTime = now;
  return lastCheckResult;
}

