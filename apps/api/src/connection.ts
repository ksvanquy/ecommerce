import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce';

let client: postgres.Sql | null = null;

export function getPostgresClient(): postgres.Sql {
  if (!client) {
    client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    });
  }
  return client;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const sql = getPostgresClient();
    // Quick probe query
    await sql`SELECT 1 as health_check`;
    return {
      connected: true,
      message: 'PostgreSQL connection active',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unable to connect to PostgreSQL';
    return {
      connected: false,
      message: msg,
    };
  }
}
