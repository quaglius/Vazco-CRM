import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import { getPgSslOption, resolveDatabaseUrl } from "./src/lib/database-url";

const ssl = getPgSslOption(process.env.DATABASE_URL);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDatabaseUrl(process.env.DATABASE_URL),
    ssl: ssl === undefined ? undefined : ssl,
  },
});
