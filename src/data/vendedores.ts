import { asc, count } from "drizzle-orm";
import { db } from "@/db";
import { tipoVendedor, vendedor } from "@/db/schema";

const pageSize = 25;

export type VendedorListRow = {
  id: string;
  codigo: string;
  nombreCompleto: string;
  clerkUserId: string | null;
  tipo: { nombre: string } | null;
};

export async function listVendedores(page: number) {
  const p = Math.max(1, page);
  const offset = (p - 1) * pageSize;

  const rows = await db.query.vendedor.findMany({
    orderBy: (v, { asc }) => [asc(v.codigo)],
    limit: pageSize,
    offset,
    with: { tipo: true },
  });

  const [{ n: total }] = await db.select({ n: count() }).from(vendedor);

  return {
    items: rows as unknown as VendedorListRow[],
    total,
    page: p,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listTiposVendedor() {
  return db.select().from(tipoVendedor).orderBy(asc(tipoVendedor.nombre));
}
