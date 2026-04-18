"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { interaccion } from "@/db/schema";
import { canWrite } from "@/lib/auth";
import { resolveVendedorForSession } from "@/lib/current-vendedor";

export async function crearInteraccionFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");

  const clienteId = String(formData.get("cliente_id") ?? "").trim();
  const contactoIdRaw = String(formData.get("contacto_id") ?? "").trim();
  const fechaRaw = String(formData.get("fecha") ?? "").trim();
  const canalId = String(formData.get("canal_id") ?? "").trim();
  const resultadoId = String(formData.get("resultado_id") ?? "").trim();
  const proximoPaso = String(formData.get("proximo_paso") ?? "").trim();
  const comentario = String(formData.get("comentario") ?? "").trim();

  if (!clienteId || !fechaRaw || !canalId || !resultadoId) {
    throw new Error("Completá fecha, canal y resultado");
  }

  const vendedorId = await resolveVendedorForSession();

  await db.insert(interaccion).values({
    fecha: fechaRaw,
    vendedorId,
    clienteId,
    contactoId: contactoIdRaw || null,
    canalId,
    resultadoId,
    proximoPaso,
    comentario,
    empresaRaw: null,
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/actividades");
  if (contactoIdRaw) {
    revalidatePath(`/contactos/${contactoIdRaw}`);
  }
}

export async function eliminarInteraccionForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const id = String(formData.get("id") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "").trim();
  const contactoId = String(formData.get("contacto_id") ?? "").trim();
  if (!id) throw new Error("ID inválido");

  await db
    .update(interaccion)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(interaccion.id, id));

  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/actividades");
  if (contactoId) revalidatePath(`/contactos/${contactoId}`);
}
