import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  canalContacto,
  cliente,
  interaccion,
  resultadoContacto,
  vendedor,
} from "@/db/schema";

const pageSize = 25;

function buildWhere(opts: { q?: string; clienteId?: string; contactoId?: string }) {
  const filters = [isNull(interaccion.deletedAt)];
  const q = opts.q?.trim();
  if (opts.clienteId) filters.push(eq(interaccion.clienteId, opts.clienteId));
  if (opts.contactoId) filters.push(eq(interaccion.contactoId, opts.contactoId));
  if (q) {
    const term = `%${q}%`;
    filters.push(or(ilike(interaccion.comentario, term), ilike(interaccion.proximoPaso, term))!);
  }
  return filters.length === 1 ? filters[0] : and(...filters)!;
}

export async function listActividades(opts: {
  page: number;
  q?: string;
  clienteId?: string;
  contactoId?: string;
}) {
  const page = Math.max(1, opts.page);
  const offset = (page - 1) * pageSize;

  const whereClause = buildWhere(opts);

  const rows = await db
    .select({
      id: interaccion.id,
      fecha: interaccion.fecha,
      comentario: interaccion.comentario,
      proximoPaso: interaccion.proximoPaso,
      empresaRaw: interaccion.empresaRaw,
      clienteId: interaccion.clienteId,
      clienteRazon: cliente.razonSocial,
      vendedorNombre: vendedor.nombreCompleto,
      canalNombre: canalContacto.nombre,
      resultadoNombre: resultadoContacto.nombre,
    })
    .from(interaccion)
    .leftJoin(cliente, eq(interaccion.clienteId, cliente.id))
    .innerJoin(vendedor, eq(interaccion.vendedorId, vendedor.id))
    .innerJoin(canalContacto, eq(interaccion.canalId, canalContacto.id))
    .innerJoin(resultadoContacto, eq(interaccion.resultadoId, resultadoContacto.id))
    .where(whereClause)
    .orderBy(desc(interaccion.fecha))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db.select({ n: count() }).from(interaccion).where(whereClause);

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listInteraccionesByContacto(contactoId: string, limit = 40) {
  const rows = await db
    .select({
      id: interaccion.id,
      fecha: interaccion.fecha,
      canalNombre: canalContacto.nombre,
      resultadoNombre: resultadoContacto.nombre,
    })
    .from(interaccion)
    .innerJoin(canalContacto, eq(interaccion.canalId, canalContacto.id))
    .innerJoin(resultadoContacto, eq(interaccion.resultadoId, resultadoContacto.id))
    .where(and(eq(interaccion.contactoId, contactoId), isNull(interaccion.deletedAt)))
    .orderBy(desc(interaccion.fecha))
    .limit(limit);

  return rows;
}
