import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { resolveDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

function createPool() {
  const isProd = process.env.NODE_ENV === "production";
  return new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 15_000,
    // Session poolers (ej. Supabase :5432) tienen pocos slots; en serverless cada Pool extra satura rápido.
    max: isProd ? 1 : 10,
    idleTimeoutMillis: isProd ? 10_000 : 30_000,
  });
}

export const pool = globalForDb.pool ?? createPool();
globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
