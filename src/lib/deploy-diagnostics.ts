import { Pool } from "pg";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { isAuthEnabled } from "@/lib/auth-config";

export type DeployDiagnosticResult = {
  generatedAt: string;
  nodeVersion: string;
  nodeEnv: string | undefined;
  vercelEnv?: string;
  databaseUrl: {
    defined: boolean;
    host?: string;
    port?: string;
    database?: string;
    sslModeFromUrl?: string;
    resolveError?: string;
  };
  connectionTest: {
    ok: boolean;
    latencyMs?: number;
    error?: string;
    code?: string;
    detail?: string;
  };
  schemaHint: {
    clienteTableExists: boolean;
    error?: string;
  };
  clerk: {
    skipClerk: boolean;
    publishableKeySuffix?: string;
    secretKeyDefined: boolean;
    authEnabled: boolean;
  };
};

function parseJdbcStyleUrl(raw: string): {
  host?: string;
  port?: string;
  database?: string;
  sslModeFromUrl?: string;
} {
  try {
    const normalized = raw.replace(/^postgresql:/, "http:");
    const u = new URL(normalized);
    const ssl =
      u.searchParams.get("sslmode") ?? u.searchParams.get("ssl") ?? undefined;
    return {
      host: u.hostname || undefined,
      port: u.port || (u.protocol === "http:" ? "5432" : undefined),
      database: u.pathname.replace(/^\//, "").split("/")[0] || undefined,
      sslModeFromUrl: ssl ?? undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Prueba conexión y esquema sin importar `@/db` (evita tirar la app si falla el pool al importar).
 */
export async function runDeployDiagnostics(): Promise<DeployDiagnosticResult> {
  const rawUrl = process.env.DATABASE_URL;
  const defined = Boolean(rawUrl?.trim());
  const parsed = defined && rawUrl ? parseJdbcStyleUrl(rawUrl) : {};

  let resolveError: string | undefined;
  let resolvedUrl: string | undefined;
  if (defined && rawUrl) {
    try {
      resolvedUrl = resolveDatabaseUrl(rawUrl);
    } catch (e) {
      resolveError = e instanceof Error ? e.message : String(e);
    }
  }

  let connectionTest: DeployDiagnosticResult["connectionTest"] = {
    ok: false,
    error: !defined ? "DATABASE_URL no está definida" : resolveError ? resolveError : "No se pudo resolver URL",
  };

  let schemaHint: DeployDiagnosticResult["schemaHint"] = {
    clienteTableExists: false,
  };

  if (resolvedUrl) {
    const pool = new Pool({
      connectionString: resolvedUrl,
      connectionTimeoutMillis: 15_000,
    });
    const t0 = Date.now();
    try {
      await pool.query("SELECT 1 AS ok");
      connectionTest = { ok: true, latencyMs: Date.now() - t0 };
      const r = await pool.query<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'cliente'
        ) AS exists`,
      );
      schemaHint = {
        clienteTableExists: Boolean(r.rows[0]?.exists),
      };
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string; detail?: string };
      connectionTest = {
        ok: false,
        error: err.message ?? String(e),
        code: err.code,
        detail: err.detail,
        latencyMs: Date.now() - t0,
      };
    } finally {
      await pool.end().catch(() => {});
    }
  }

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();

  return {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    databaseUrl: {
      defined,
      host: parsed.host,
      port: parsed.port,
      database: parsed.database,
      sslModeFromUrl: parsed.sslModeFromUrl,
      resolveError,
    },
    connectionTest,
    schemaHint,
    clerk: {
      skipClerk: process.env.NEXT_PUBLIC_SKIP_CLERK === "true",
      publishableKeySuffix: pk ? `…${pk.slice(-6)}` : undefined,
      secretKeyDefined: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
      authEnabled: isAuthEnabled(),
    },
  };
}
