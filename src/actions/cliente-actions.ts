"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { cliente } from "@/db/schema";
import { canWrite } from "@/lib/auth";
import { getDefaultClienteCatalogIds } from "@/lib/catalog-defaults";
import { resolveVendedorForSession } from "@/lib/current-vendedor";

export async function crearClienteFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const razonSocial = String(formData.get("razon_social") ?? "").trim();
  if (!razonSocial) throw new Error("Razón social obligatoria");

  const defaults = await getDefaultClienteCatalogIds();
  const rubroIdSel = String(formData.get("rubro_id") ?? "").trim();
  const codigoErpRaw = String(formData.get("codigo_erp") ?? "").trim();
  const cuitRaw = String(formData.get("cuit") ?? "")
    .trim()
    .replace(/\D/g, "");

  const vendedorId = await resolveVendedorForSession();

  const [ins] = await db
    .insert(cliente)
    .values({
      razonSocial,
      cuit: cuitRaw || "",
      codigoErp: codigoErpRaw || null,
      rubroId: rubroIdSel || defaults.rubroId,
      vendedorId,
      tamanoClienteId: defaults.tamanoClienteId,
      estadoCuentaId: defaults.estadoCuentaId,
      potencialCrecimientoId: defaults.potencialCrecimientoId,
      calidadNegocioId: defaults.calidadNegocioId,
      nivelControlId: defaults.nivelControlId,
      categoriaCuentaId: defaults.categoriaCuentaId,
    })
    .returning({ id: cliente.id });

  revalidatePath("/clientes");
  redirect(`/clientes/${ins.id}`);
}

export async function actualizarClienteFromForm(formData: FormData) {
  if (!(await canWrite())) throw new Error("Sin permiso");
  const id = String(formData.get("id") ?? "").trim();
  const razonSocial = String(formData.get("razon_social") ?? "").trim();
  if (!id || !razonSocial) throw new Error("Datos inválidos");

  const rubroIdSel = String(formData.get("rubro_id") ?? "").trim();
  const codigoErpRaw = String(formData.get("codigo_erp") ?? "").trim();
  const cuitRaw = String(formData.get("cuit") ?? "")
    .trim()
    .replace(/\D/g, "");
  const defaults = await getDefaultClienteCatalogIds();

  await db
    .update(cliente)
    .set({
      razonSocial,
      cuit: cuitRaw || "",
      codigoErp: codigoErpRaw || null,
      rubroId: rubroIdSel || defaults.rubroId,
      updatedAt: new Date(),
    })
    .where(eq(cliente.id, id));

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

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
