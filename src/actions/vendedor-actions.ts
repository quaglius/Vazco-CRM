"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { vendedor } from "@/db/schema";
import { canWrite } from "@/lib/auth";

export async function crearVendedorFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const nombreCompleto = String(formData.get("nombre_completo") ?? "").trim();
  const tipoVendedorId = String(formData.get("tipo_vendedor_id") ?? "");
  if (!codigo || !nombreCompleto || !tipoVendedorId) throw new Error("Completá código, nombre y tipo");
  await db.insert(vendedor).values({
    codigo,
    nombreCompleto,
    tipoVendedorId,
  });
  revalidatePath("/maestros/vendedores");
}

export async function eliminarVendedor(id: string) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  await db.delete(vendedor).where(eq(vendedor.id, id));
  revalidatePath("/maestros/vendedores");
}
