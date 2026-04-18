import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vendedor } from "@/db/schema";
import { isAuthEnabled } from "@/lib/auth-config";

/** `vendedor.id` vinculado al usuario Clerk actual, si existe. */
export async function getCurrentVendedorId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  const user = await currentUser();
  const clerkId = user?.id;
  if (!clerkId) return null;

  const row = await db.query.vendedor.findFirst({
    where: eq(vendedor.clerkUserId, clerkId),
    columns: { id: true },
  });
  return row?.id ?? null;
}

/**
 * Para crear interacciones / operaciones comerciales: usa el vendedor vinculado al usuario
 * o un vendedor por defecto (GEN o el primero disponible).
 */
export async function resolveVendedorForSession(): Promise<string> {
  const linked = await getCurrentVendedorId();
  if (linked) return linked;

  const gen = await db.query.vendedor.findFirst({
    where: eq(vendedor.codigo, "GEN"),
    columns: { id: true },
  });
  if (gen) return gen.id;

  const any = await db.query.vendedor.findFirst({ columns: { id: true } });
  if (any) return any.id;

  throw new Error(
    "No hay vendedores en la base. Ejecutá seed o creá un perfil comercial desde Maestros.",
  );
}
