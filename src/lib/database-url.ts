/**
 * Evita cuelgues en Windows (localhost -> ::1) y fuerza SSL solo cuando toca.
 * Postgres en Docker/local no usa TLS; Neon/Netlify suelen llevar ssl en la URL.
 */
export function resolveDatabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) {
    throw new Error("DATABASE_URL no está definida");
  }
  let u = raw.trim();

  const atHost = u.match(/@([^/?#]+)/);
  const hostPort = atHost?.[1] ?? "";
  const host = hostPort.split(":")[0] ?? "";

  if (host === "localhost") {
    u = u.replace("@localhost", "@127.0.0.1");
  }

  const isLoopback = host === "localhost" || host === "127.0.0.1";
  if (isLoopback && !/[?&]sslmode=/.test(u)) {
    u += u.includes("?") ? "&" : "?";
    u += "sslmode=disable";
  }

  // Supabase Transaction pooler (PgBouncer, puerto 6543): mejor para serverless que Session (:5432).
  if (/pooler\.supabase\.com/i.test(host) && /:6543(?:\/|$)/.test(u) && !/[?&]pgbouncer=/.test(u)) {
    u += u.includes("?") ? "&" : "?";
    u += "pgbouncer=true";
  }

  return u;
}

/**
 * Mitiga `SELF_SIGNED_CERT_IN_CHAIN` cuando hay proxy/antivirus que intercepta TLS.
 * Definí `DATABASE_SSL_REJECT_UNAUTHORIZED=false` en Netlify o local (menos seguro que el default).
 */
export function getPgSslOption(): { rejectUnauthorized: boolean } | undefined {
  const v = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  if (v === "false" || v === "0") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}
