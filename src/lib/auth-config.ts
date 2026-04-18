/**
 * Clerk activo solo si hay claves y no se forzó modo sin Clerk (`NEXT_PUBLIC_SKIP_CLERK`).
 * La variable `NEXT_PUBLIC_*` está en cliente y servidor; `CLERK_SECRET_KEY` solo en servidor.
 */
export function isAuthEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SKIP_CLERK === "true") return false;
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const sk = process.env.CLERK_SECRET_KEY?.trim();
  return Boolean(pk && sk);
}
