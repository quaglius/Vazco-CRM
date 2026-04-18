"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { vendedor } from "@/db/schema";
import type { Role } from "@/lib/auth";
import { canManageUsers } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth-config";

async function guard() {
  if (!(await canManageUsers())) throw new Error("Sin permiso de administrador");
}

export async function updateClerkUserRole(formData: FormData) {
  await guard();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "").trim() as Role;
  if (!userId || (role !== "admin" && role !== "vendedor" && role !== "viewer")) {
    throw new Error("Datos inválidos");
  }

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role },
  });
  revalidatePath("/usuarios");
}

export async function bindClerkUserToVendedor(formData: FormData) {
  await guard();
  const clerkUserId = String(formData.get("clerk_user_id") ?? "").trim();
  const vendedorIdRaw = String(formData.get("vendedor_id") ?? "").trim();

  if (!clerkUserId) throw new Error("Usuario Clerk obligatorio");

  await db.update(vendedor).set({ clerkUserId: null }).where(eq(vendedor.clerkUserId, clerkUserId));

  if (!vendedorIdRaw || vendedorIdRaw === "__none__") {
    revalidatePath("/usuarios");
    return;
  }

  await db.update(vendedor).set({ clerkUserId }).where(eq(vendedor.id, vendedorIdRaw));

  revalidatePath("/usuarios");
}

export async function unlinkVendedorProfile(vendedorId: string) {
  await guard();
  await db.update(vendedor).set({ clerkUserId: null }).where(eq(vendedor.id, vendedorId));
  revalidatePath("/usuarios");
}

/** Expuesto solo para páginas servidor; no llamar desde cliente sin auth. */
export async function clerkUsersAvailable(): Promise<boolean> {
  return isAuthEnabled();
}
