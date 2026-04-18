import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { resolveDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

function createPool() {
  return new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 15_000,
  });
}

export const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
