import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { cliente, contacto } from "@/db/schema";

const pageSize = 25;

export async function listContactos(opts: { page: number; q?: string; clienteId?: string }) {
  const page = Math.max(1, opts.page);
  const offset = (page - 1) * pageSize;

  const filters = [isNull(contacto.deletedAt)];
  const q = opts.q?.trim();
  if (q) {
    const term = `%${q}%`;
    filters.push(
      or(ilike(contacto.nombre, term), ilike(contacto.apellido, term), ilike(contacto.email, term))!,
    );
  }
  if (opts.clienteId) filters.push(eq(contacto.clienteId, opts.clienteId));
  const whereClause = filters.length === 1 ? filters[0] : and(...filters)!;

  const items = await db
    .select({
      contacto,
      clienteRazon: cliente.razonSocial,
    })
    .from(contacto)
    .innerJoin(cliente, and(eq(contacto.clienteId, cliente.id), isNull(cliente.deletedAt)))
    .where(whereClause)
    .orderBy(desc(contacto.updatedAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db.select({ n: count() }).from(contacto).where(whereClause);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export type ContactoDetailRow = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  clienteId: string;
  rolContactoId: string | null;
  cliente: {
    id: string;
    razonSocial: string;
    rubro: { nombre: string } | null;
    vendedor: { nombreCompleto: string } | null;
  } | null;
  rol: { id: string; nombre: string } | null;
};

export async function getContacto(id: string): Promise<ContactoDetailRow | null> {
  const row = await db.query.contacto.findFirst({
    where: and(eq(contacto.id, id), isNull(contacto.deletedAt)),
    with: {
      cliente: {
        with: {
          rubro: true,
          vendedor: true,
        },
      },
      rol: true,
    },
  });
  return (row as ContactoDetailRow | undefined) ?? null;
}
