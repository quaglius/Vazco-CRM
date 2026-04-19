import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getPgSslOption, resolveDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

function createPool() {
  const isProd = process.env.NODE_ENV === "production";
  const ssl = getPgSslOption();

  return new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    ...(ssl ? { ssl } : {}),
    connectionTimeoutMillis: 15_000,
    max: isProd ? 1 : 10,
    idleTimeoutMillis: isProd ? 10_000 : 30_000,
    allowExitOnIdle: isProd,
  });
}

export const pool = globalForDb.pool ?? createPool();
globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
