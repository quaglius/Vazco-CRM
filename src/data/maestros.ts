import { asc } from "drizzle-orm";
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

export async function listMaestro(slug: MaestroSlug) {
  const table = tableFor(slug);
  return db.select().from(table).orderBy(asc(table.nombre));
}
