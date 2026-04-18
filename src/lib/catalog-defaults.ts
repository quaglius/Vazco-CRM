import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  calidadNegocio,
  categoriaCuenta,
  estadoCuenta,
  nivelControl,
  potencialCrecimiento,
  rubro,
  tamanoCliente,
} from "@/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tablas maestras homogéneas (id + nombre)
async function masterIdByNombre(table: any, nombre: string): Promise<string> {
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(sql`lower(${table.nombre}) = ${nombre.toLowerCase()}`)
    .limit(1);
  if (!row) {
    throw new Error(`Falta el catálogo "${nombre}" en ${String(table)}. Ejecutá seed o cargalo en Maestros.`);
  }
  return row.id as string;
}

/** IDs por defecto para alta de cliente (mismo criterio que seed). */
export async function getDefaultClienteCatalogIds() {
  const [
    rubroId,
    tamanoClienteId,
    estadoCuentaId,
    potencialCrecimientoId,
    calidadNegocioId,
    nivelControlId,
    categoriaCuentaId,
  ] = await Promise.all([
    masterIdByNombre(rubro, "Sin clasificar"),
    masterIdByNombre(tamanoCliente, "Sin especificar"),
    masterIdByNombre(estadoCuenta, "Sin especificar"),
    masterIdByNombre(potencialCrecimiento, "Sin especificar"),
    masterIdByNombre(calidadNegocio, "Sin especificar"),
    masterIdByNombre(nivelControl, "Sin especificar"),
    masterIdByNombre(categoriaCuenta, "Sin especificar"),
  ]);

  return {
    rubroId,
    tamanoClienteId,
    estadoCuentaId,
    potencialCrecimientoId,
    calidadNegocioId,
    nivelControlId,
    categoriaCuentaId,
  };
}
