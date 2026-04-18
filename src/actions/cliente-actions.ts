"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cliente } from "@/db/schema";
import { canWrite } from "@/lib/auth";

export async function softDeleteCliente(id: string) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  await db.update(cliente).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(cliente.id, id));
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function softDeleteClienteForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID inválido");
  await softDeleteCliente(id);
}
