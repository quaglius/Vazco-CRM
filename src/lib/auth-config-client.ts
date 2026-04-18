/** UI de Clerk: sin secret en bundle; alcanza con publishable + no SKIP. */
export function isAuthEnabledClient(): boolean {
  if (process.env.NEXT_PUBLIC_SKIP_CLERK === "true") return false;
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
}
