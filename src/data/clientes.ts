import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { canalContacto, cliente, interaccion, resultadoContacto, rubro } from "@/db/schema";
import type { ClienteDetail } from "@/types/views";

const pageSize = 25;

/** Para selects en formularios de contactos / filtros. */
export async function listClienteOptions(limit = 500) {
  return db
    .select({
      id: cliente.id,
      razonSocial: cliente.razonSocial,
    })
    .from(cliente)
    .where(isNull(cliente.deletedAt))
    .orderBy(desc(cliente.updatedAt))
    .limit(limit);
}

export async function listClientes(opts: { page: number; q?: string }) {
  const page = Math.max(1, opts.page);
  const offset = (page - 1) * pageSize;

  const filters = [isNull(cliente.deletedAt)];
  const q = opts.q?.trim();
  if (q) {
    const term = `%${q}%`;
    filters.push(or(ilike(cliente.razonSocial, term), ilike(cliente.cuit, term), ilike(cliente.codigoErp, term))!);
  }
  const whereClause = filters.length === 1 ? filters[0] : and(...filters)!;

  const items = await db
    .select({
      id: cliente.id,
      razonSocial: cliente.razonSocial,
      cuit: cliente.cuit,
      codigoErp: cliente.codigoErp,
      rubroNombre: rubro.nombre,
      updatedAt: cliente.updatedAt,
    })
    .from(cliente)
    .leftJoin(rubro, eq(cliente.rubroId, rubro.id))
    .where(whereClause)
    .orderBy(desc(cliente.updatedAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db.select({ n: count() }).from(cliente).where(whereClause);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getCliente(id: string): Promise<ClienteDetail | undefined> {
  const row = await db.query.cliente.findFirst({
    where: (c, { and, eq, isNull }) => and(eq(c.id, id), isNull(c.deletedAt)),
    with: {
      rubro: true,
      vendedor: true,
      tamanoCliente: true,
      estadoCuenta: true,
      potencialCrecimiento: true,
      calidadNegocio: true,
      nivelControl: true,
      categoriaCuenta: true,
      contactos: {
        where: (co, { isNull }) => isNull(co.deletedAt),
        orderBy: (co, { asc }) => [asc(co.apellido), asc(co.nombre)],
        with: { rol: true },
      },
      sucursales: true,
      interacciones: {
        where: (i, { isNull }) => isNull(i.deletedAt),
        orderBy: (i, { desc }) => [desc(i.fecha)],
        limit: 100,
        with: {
          canal: true,
          resultado: true,
          vendedor: true,
        },
      },
    },
  });
  return row as ClienteDetail | undefined;
}

export async function getClienteResumenKpi(id: string) {
  const [row] = await db
    .select({
      ventaUltimos13Meses: cliente.ventaUltimos13Meses,
      potencialAnual: cliente.potencialAnual,
      margenPromedioPct: cliente.margenPromedioPct,
      dsoRealDias: cliente.dsoRealDias,
    })
    .from(cliente)
    .where(and(eq(cliente.id, id), isNull(cliente.deletedAt)));

  return row ?? null;
}

/** Vista compacta para panel lateral en listado de clientes. */
export type ClientePreview = {
  id: string;
  razonSocial: string;
  cuit: string;
  codigoErp: string | null;
  condicionPago: string;
  rubro: { nombre: string } | null;
  vendedor: { nombreCompleto: string } | null;
};

export async function getClientePreview(id: string): Promise<ClientePreview | null> {
  const row = await db.query.cliente.findFirst({
    where: (c, { and, eq, isNull }) => and(eq(c.id, id), isNull(c.deletedAt)),
    columns: {
      id: true,
      razonSocial: true,
      cuit: true,
      codigoErp: true,
      condicionPago: true,
    },
    with: {
      rubro: true,
      vendedor: true,
    },
  });
  return (row as ClientePreview | undefined) ?? null;
}

export type UltimaInteraccionClientePanel = {
  fecha: string;
  proximoPaso: string;
  comentario: string;
  canal: { nombre: string } | null;
  resultado: { nombre: string } | null;
};

export async function getClienteUltimaInteraccion(
  clienteId: string,
): Promise<UltimaInteraccionClientePanel | null> {
  const rows = await db
    .select({
      fecha: interaccion.fecha,
      proximoPaso: interaccion.proximoPaso,
      comentario: interaccion.comentario,
      canalNombre: canalContacto.nombre,
      resultadoNombre: resultadoContacto.nombre,
    })
    .from(interaccion)
    .innerJoin(canalContacto, eq(interaccion.canalId, canalContacto.id))
    .innerJoin(resultadoContacto, eq(interaccion.resultadoId, resultadoContacto.id))
    .where(and(eq(interaccion.clienteId, clienteId), isNull(interaccion.deletedAt)))
    .orderBy(desc(interaccion.fecha))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    fecha: String(row.fecha),
    proximoPaso: row.proximoPaso,
    comentario: row.comentario,
    canal: { nombre: row.canalNombre },
    resultado: { nombre: row.resultadoNombre },
  };
}
