import { count, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { cliente, contacto, interaccion } from "@/db/schema";
import type { UltimaInteraccion } from "@/types/views";

export type DiaRow = { dia: string; n: number };
export type CanalRow = { nombre: string; n: number };
export type ResultadoRow = { nombre: string; n: number };
export type VendedorRow = { vendedorId: string; nombre: string; codigo: string; n: number };
export type RubroRow = { nombre: string; n: number };

export type DashboardKpis = {
  clientesActivos: number;
  interacciones: number;
  contactos: number;
  ultimos14Dias: number;
  respondioPct: number;
  sinRespuestaPct: number;
};

function extractRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    typeof result === "object" &&
    result !== null &&
    "rows" in result &&
    Array.isArray((result as { rows?: unknown[] }).rows)
  ) {
    return (result as { rows: T[] }).rows;
  }
  return Array.from(result as Iterable<T>);
}

export async function getDashboardStats(): Promise<DashboardKpis> {
  const [cl] = await db
    .select({ n: count() })
    .from(cliente)
    .where(isNull(cliente.deletedAt));

  const [int] = await db
    .select({ n: count() })
    .from(interaccion)
    .where(isNull(interaccion.deletedAt));

  const [con] = await db.select({ n: count() }).from(contacto);

  const u14Rows = extractRows<{ n: number }>(await db.execute(sql`
    select count(*)::int as n
    from interaccion
    where deleted_at is null
      and fecha >= current_date - interval '14 days'
  `));

  const breakdownRows = extractRows<{ nombre: string; n: number }>(await db.execute(sql`
    select rc.nombre, count(*)::int as n
    from interaccion i
    join resultado_contacto rc on rc.id = i.resultado_id
    where i.deleted_at is null
    group by rc.nombre
  `));

  const total = breakdownRows.reduce((s, r) => s + r.n, 0) || 1;
  const sumByLike = (regex: RegExp) =>
    breakdownRows.filter((r) => regex.test(r.nombre)).reduce((s, r) => s + r.n, 0);

  const respondio = sumByLike(/respond/i) - sumByLike(/^sin\s+resp|no\s+resp/i);
  const sinResp = sumByLike(/^sin\s+resp|no\s+resp/i);

  return {
    clientesActivos: cl.n,
    interacciones: int.n,
    contactos: con.n,
    ultimos14Dias: u14Rows[0]?.n ?? 0,
    respondioPct: Math.round((Math.max(respondio, 0) / total) * 100),
    sinRespuestaPct: Math.round((sinResp / total) * 100),
  };
}

/** Devuelve serie diaria rellenando 14 días (incluso días con 0 actividades). */
export async function getInteraccionesPorDia(dias = 14): Promise<DiaRow[]> {
  const rows = extractRows<{ dia: string; n: number }>(await db.execute(sql`
    with serie as (
      select generate_series(
        current_date - (${dias - 1} || ' days')::interval,
        current_date,
        interval '1 day'
      )::date as dia
    )
    select to_char(s.dia, 'YYYY-MM-DD') as dia,
           coalesce(count(i.id), 0)::int as n
    from serie s
    left join interaccion i
      on i.fecha = s.dia and i.deleted_at is null
    group by s.dia
    order by s.dia
  `));
  return rows;
}

export async function getInteraccionesPorCanal(): Promise<CanalRow[]> {
  const rows = extractRows<{ nombre: string; n: number }>(await db.execute(sql`
    select cc.nombre, count(*)::int as n
    from interaccion i
    join canal_contacto cc on cc.id = i.canal_id
    where i.deleted_at is null
    group by cc.nombre
    order by n desc
  `));
  return rows;
}

export async function getInteraccionesPorResultado(): Promise<ResultadoRow[]> {
  const rows = extractRows<{ nombre: string; n: number }>(await db.execute(sql`
    select rc.nombre, count(*)::int as n
    from interaccion i
    join resultado_contacto rc on rc.id = i.resultado_id
    where i.deleted_at is null
    group by rc.nombre
    order by n desc
  `));
  return rows;
}

export async function getTopVendedores(limit = 5): Promise<VendedorRow[]> {
  const rows = extractRows<{ vendedor_id: string; nombre: string; codigo: string; n: number }>(
    await db.execute(sql`
    select v.id as vendedor_id,
           v.nombre_completo as nombre,
           v.codigo as codigo,
           count(i.id)::int as n
    from vendedor v
    left join interaccion i
      on i.vendedor_id = v.id and i.deleted_at is null
    group by v.id, v.nombre_completo, v.codigo
    order by n desc
    limit ${limit}
  `),
  );
  return rows.map((r) => ({
    vendedorId: r.vendedor_id,
    nombre: r.nombre,
    codigo: r.codigo,
    n: r.n,
  }));
}

export async function getTopRubros(limit = 6): Promise<RubroRow[]> {
  const rows = extractRows<{ nombre: string; n: number }>(await db.execute(sql`
    select r.nombre, count(c.id)::int as n
    from rubro r
    left join cliente c on c.rubro_id = r.id and c.deleted_at is null
    group by r.nombre
    order by n desc
    limit ${limit}
  `));
  return rows;
}

export async function getUltimasInteracciones(limit = 12): Promise<UltimaInteraccion[]> {
  const rows = await db.query.interaccion.findMany({
    orderBy: (i, { desc }) => [desc(i.fecha)],
    limit,
    with: {
      cliente: true,
      vendedor: true,
      canal: true,
      resultado: true,
    },
  });
  return rows as unknown as UltimaInteraccion[];
}
