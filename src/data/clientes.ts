import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { cliente } from "@/db/schema";
import type { ClienteDetail } from "@/types/views";

const pageSize = 25;

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
    .select()
    .from(cliente)
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
