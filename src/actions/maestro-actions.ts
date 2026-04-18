"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  calidadNegocio,
  canalContacto,
  categoriaCuenta,
  estadoCuenta,
  nivelControl,
  potencialCrecimiento,
  resultadoContacto,
  rolContacto,
  rubro,
  tamanoCliente,
  tipoVendedor,
} from "@/db/schema";
import { canWrite } from "@/lib/auth";
import type { MaestroSlug } from "@/lib/maestros";

function tableFor(slug: MaestroSlug) {
  switch (slug) {
    case "rubro":
      return rubro;
    case "tamano-cliente":
      return tamanoCliente;
    case "estado-cuenta":
      return estadoCuenta;
    case "potencial-crecimiento":
      return potencialCrecimiento;
    case "calidad-negocio":
      return calidadNegocio;
    case "nivel-control":
      return nivelControl;
    case "categoria-cuenta":
      return categoriaCuenta;
    case "tipo-vendedor":
      return tipoVendedor;
    case "canal-contacto":
      return canalContacto;
    case "resultado-contacto":
      return resultadoContacto;
    case "rol-contacto":
      return rolContacto;
    default: {
      const x: never = slug;
      throw new Error(`Slug no soportado: ${String(x)}`);
    }
  }
}

export async function crearMaestro(slug: MaestroSlug, nombre: string, orden?: number) {
  if (!(await canWrite())) throw new Error("Solo lectura");
  const n = nombre.trim();
  if (!n) throw new Error("Nombre obligatorio");
  const table = tableFor(slug);
  await db.insert(table).values({ nombre: n, orden: orden ?? null });
  revalidatePath(`/maestros/${slug}`);
}

export async function crearMaestroFromForm(slug: MaestroSlug, formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "");
  const ordenRaw = formData.get("orden");
  const ordenNum = ordenRaw ? Number(ordenRaw) : undefined;
  await crearMaestro(slug, nombre, Number.isFinite(ordenNum) ? ordenNum : undefined);
}

export async function eliminarMaestro(slug: MaestroSlug, id: string) {
  if (!(await canWrite())) throw new Error("Solo lectura");
  const table = tableFor(slug);
  await db.delete(table).where(eq((table as typeof rubro).id, id));
  revalidatePath(`/maestros/${slug}`);
}
