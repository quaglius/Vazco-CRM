import { currentUser } from "@clerk/nextjs/server";
import { isAuthEnabled } from "@/lib/auth-config";

export type Role = "admin" | "vendedor" | "viewer";

export async function getRole(): Promise<Role> {
  if (!isAuthEnabled()) return "admin";
  const user = await currentUser();
  const r = user?.publicMetadata?.role as string | undefined;
  if (r === "admin" || r === "vendedor" || r === "viewer") return r;
  return "viewer";
}

export async function canWrite(): Promise<boolean> {
  if (!isAuthEnabled()) return true;
  const role = await getRole();
  return role === "admin" || role === "vendedor";
}
