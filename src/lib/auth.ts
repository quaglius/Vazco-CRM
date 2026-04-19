import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth-config";

export type Role = "admin" | "vendedor" | "viewer";

/**
 * Modo "todos admin": cualquier usuario autenticado tiene permisos completos.
 * Si en el futuro se quiere reactivar RBAC granular, definir `RBAC_STRICT=true`
 * y volver a leer `publicMetadata.role` desde Clerk.
 */
const RBAC_STRICT = process.env.RBAC_STRICT === "true";

export async function getRole(): Promise<Role> {
  if (!isAuthEnabled()) return "admin";
  if (!RBAC_STRICT) return "admin";
  const user = await currentUser();
  const r = user?.publicMetadata?.role as string | undefined;
  if (r === "admin" || r === "vendedor" || r === "viewer") return r;
  return "viewer";
}

export async function canWrite(): Promise<boolean> {
  if (!isAuthEnabled()) return true;
  if (!RBAC_STRICT) return true;
  const role = await getRole();
  return role === "admin" || role === "vendedor";
}

/** Solo administradores pueden gestionar usuarios Clerk / vínculos. */
export async function canManageUsers(): Promise<boolean> {
  if (!isAuthEnabled()) return false;
  if (!RBAC_STRICT) return true;
  return (await getRole()) === "admin";
}

/** Redirige a inicio si no es admin (solo con Clerk activo y RBAC estricto). */
export async function requireAdminPage(): Promise<void> {
  if (!isAuthEnabled()) return;
  if (!RBAC_STRICT) return;
  if ((await getRole()) !== "admin") redirect("/");
}
