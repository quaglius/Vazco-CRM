"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contacto } from "@/db/schema";
import { canWrite } from "@/lib/auth";

export async function crearContactoFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const clienteId = String(formData.get("cliente_id") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const rolIdRaw = String(formData.get("rol_contacto_id") ?? "").trim();

  if (!clienteId || !nombre) throw new Error("Cliente y nombre son obligatorios");

  const [ins] = await db
    .insert(contacto)
    .values({
      clienteId,
      nombre,
      apellido: apellido || "",
      email,
      telefono,
      rolContactoId: rolIdRaw || null,
    })
    .returning({ id: contacto.id });

  if (!ins) throw new Error("No se pudo crear el contacto");

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/contactos");
  redirect(`/contactos/${ins.id}`);
}

export async function actualizarContactoFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const id = String(formData.get("id") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const rolIdRaw = String(formData.get("rol_contacto_id") ?? "").trim();

  if (!id || !nombre) throw new Error("Datos inválidos");

  await db
    .update(contacto)
    .set({
      nombre,
      apellido: apellido || "",
      email,
      telefono,
      rolContactoId: rolIdRaw || null,
      updatedAt: new Date(),
    })
    .where(eq(contacto.id, id));

  const row = await db.query.contacto.findFirst({
    where: eq(contacto.id, id),
    columns: { clienteId: true },
  });
  if (row?.clienteId) {
    revalidatePath(`/clientes/${row.clienteId}`);
  }
  revalidatePath("/contactos");
  revalidatePath(`/contactos/${id}`);
}

export async function softDeleteContactoForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("ID inválido");

  const row = await db.query.contacto.findFirst({
    where: eq(contacto.id, id),
    columns: { clienteId: true },
  });

  await db
    .update(contacto)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(contacto.id, id));

  if (row?.clienteId) revalidatePath(`/clientes/${row.clienteId}`);
  revalidatePath("/contactos");
}
