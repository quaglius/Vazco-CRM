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

  // pg >=8.16 promueve `sslmode=require` a `verify-full`, lo que rompe Supabase/Neon (cadena no
  // confiable: SELF_SIGNED_CERT_IN_CHAIN). `uselibpqcompat=true` restituye la semántica de libpq:
  // require = TLS sin verificar emisor.
  if (/[?&]sslmode=(require|prefer|verify-ca)\b/i.test(u) && !/[?&]uselibpqcompat=/i.test(u)) {
    u += "&uselibpqcompat=true";
  }

  return u;
}

/**
 * SSL para `pg`/Drizzle:
 * - Loopback (localhost/127.0.0.1): sin TLS.
 * - Resto (Supabase, Neon, Netlify DB, RDS, etc.): TLS con `rejectUnauthorized: false`.
 *   Supabase pooler usa una CA propia y `pg` por defecto rechaza la cadena (`SELF_SIGNED_CERT_IN_CHAIN`).
 *   Esto sigue siendo TLS cifrado, solo se relaja la validación del emisor.
 *   Forzá true con `DATABASE_SSL_REJECT_UNAUTHORIZED=true` si tenés CA confiable instalada.
 */
export function getPgSslOption(rawUrl: string | undefined = process.env.DATABASE_URL):
  | { rejectUnauthorized: boolean }
  | false
  | undefined {
  const v = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  if (v === "true" || v === "1") return { rejectUnauthorized: true };
  if (v === "false" || v === "0") return { rejectUnauthorized: false };

  if (!rawUrl) return undefined;
  const m = rawUrl.match(/@([^/?#]+)/);
  const host = (m?.[1] ?? "").split(":")[0] ?? "";
  if (!host) return undefined;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return { rejectUnauthorized: false };
}
