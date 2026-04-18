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

  return u;
}
