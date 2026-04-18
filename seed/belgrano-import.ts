/**
 * Importa seed/data/belgrano_actividades.csv (generado con parse-belgrano-md).
 * Por defecto vacía cliente/sucursal/contacto/interacción y recarga desde el CSV.
 *
 * Uso: npx tsx seed/belgrano-import.ts
 *      npx tsx seed/belgrano-import.ts --no-reset
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const CSV_PATH = path.join(process.cwd(), "seed", "data", "belgrano_actividades.csv");

type Db = ReturnType<typeof drizzle<typeof schema>>;

async function ensureNombreMaster(
  db: Db,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  nombre: string,
): Promise<string> {
  const n = nombre.trim();
  if (!n) throw new Error("Valor de catálogo vacío");
  const found = await db
    .select({ id: table.id })
    .from(table)
    .where(sql`lower(${table.nombre}) = ${n.toLowerCase()}`)
    .limit(1);
  if (found[0]) return found[0].id as string;
  const [ins] = await db.insert(table).values({ nombre: n }).returning({ id: table.id });
  return ins.id as string;
}

async function ensureTipoVendedor(db: Db) {
  return ensureNombreMaster(db, schema.tipoVendedor, "Externo");
}

async function ensureVendedor(db: Db, tipoId: string, codigo: string, nombreCompleto?: string) {
  const c = codigo.trim().toUpperCase();
  if (!c) throw new Error("vendedor_codigo vacío");
  const exist = await db
    .select({ id: schema.vendedor.id })
    .from(schema.vendedor)
    .where(eq(schema.vendedor.codigo, c))
    .limit(1);
  if (exist[0]) return exist[0].id;
  const [ins] = await db
    .insert(schema.vendedor)
    .values({
      codigo: c,
      nombreCompleto: (nombreCompleto?.trim() || c) as string,
      tipoVendedorId: tipoId,
    })
    .returning({ id: schema.vendedor.id });
  return ins.id;
}

function normalizeEmpresa(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function parseBelgranoDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const p = s.split(/[/\-.]/).map((x) => x.trim()).filter(Boolean);
  let d: number;
  let m: number;
  let y: number;
  if (p.length >= 3) {
    d = Number(p[0]);
    m = Number(p[1]);
    y = Number(p[2]);
    if (y < 100) y += 2000;
  } else if (p.length === 2) {
    d = Number(p[0]);
    m = Number(p[1]);
    y = 2026;
  } else return null;
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function mapsPick<T>(m: Map<string, string>, key: string, fallback: string): string {
  return m.get(key) ?? [...m.values()][0] ?? fallback;
}

async function ensureStubCliente(
  db: Db,
  empresa: string,
  rubroId: string,
  vendedorId: string,
  maps: {
    tamano: Map<string, string>;
    estado: Map<string, string>;
    potencial: Map<string, string>;
    calidad: Map<string, string>;
    nivel: Map<string, string>;
    categoria: Map<string, string>;
  },
) {
  const tamId = mapsPick(maps.tamano, "Sin especificar", [...maps.tamano.values()][0]!);
  const estId = mapsPick(maps.estado, "Sin especificar", [...maps.estado.values()][0]!);
  const potId = mapsPick(maps.potencial, "Sin especificar", [...maps.potencial.values()][0]!);
  const calId = mapsPick(maps.calidad, "Sin especificar", [...maps.calidad.values()][0]!);
  const nivId = mapsPick(maps.nivel, "Sin especificar", [...maps.nivel.values()][0]!);
  const catId = mapsPick(maps.categoria, "Sin especificar", [...maps.categoria.values()][0]!);

  const [ins] = await db
    .insert(schema.cliente)
    .values({
      codigoErp: null,
      razonSocial: empresa.trim() || "Sin nombre",
      cuit: "",
      rubroId,
      vendedorId,
      tamanoClienteId: tamId,
      estadoCuentaId: estId,
      potencialCrecimientoId: potId,
      calidadNegocioId: calId,
      nivelControlId: nivId,
      categoriaCuentaId: catId,
    })
    .returning({ id: schema.cliente.id });

  return ins.id;
}

function normalizeCanalResultadoNombre(raw: string, kind: "canal" | "resultado"): string {
  const t = raw.trim();
  if (!t) return kind === "canal" ? "Visita" : "Pendiente";
  const u = t.toUpperCase();
  if (kind === "canal") {
    if (u.includes("WHATSAPP")) return "WhatsApp";
    if (u === "MAIL" || u.includes("EMAIL")) return "Email";
    if (u.includes("VISITA")) return "Visita";
    if (u.includes("LLAMADO") || u.includes("TEL")) return "Llamado";
  }
  if (kind === "resultado") {
    if (u.includes("NO RESPONDIO")) return "Sin respuesta";
    if (u.includes("RESPONDIO")) return "Respondió";
    if (u.includes("COTIZ")) return "Cotización";
    if (u.includes("ERROR") || u.includes("REBOT")) return "Mail rebote / error";
  }
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function looksLikePhone(s: string): boolean {
  const d = s.replace(/\D/g, "");
  return d.length >= 8;
}

function rowContactLooksPerson(nombre: string, apellido: string): boolean {
  const n = nombre.trim();
  const a = apellido.trim();
  if (!n && !a) return false;
  if (looksLikeEmail(n) || looksLikeEmail(a)) return false;
  if ((looksLikePhone(n) && !a) || (looksLikePhone(a) && !n)) return false;
  if (/^(LLAMADO|MAIL|VISITA|WHATSAPP)$/i.test(n) || /^(LLAMADO|MAIL|VISITA|WHATSAPP)$/i.test(a))
    return false;
  return true;
}

async function main() {
  const noReset = process.argv.includes("--no-reset");

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No existe ${CSV_PATH}. Ejecutá antes: npx tsx seed/parse-belgrano-md.ts`);
  }

  const csvRaw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const pool = new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 15_000,
  });
  const db = drizzle(pool, { schema });

  if (!noReset) {
    await db.execute(
      sql.raw(
        "TRUNCATE TABLE interaccion, contacto, sucursal, cliente RESTART IDENTITY CASCADE",
      ),
    );
  }

  await ensureNombreMaster(db, schema.rubro, "Sin clasificar");
  await ensureNombreMaster(db, schema.tamanoCliente, "Sin especificar");
  await ensureNombreMaster(db, schema.estadoCuenta, "Sin especificar");
  await ensureNombreMaster(db, schema.potencialCrecimiento, "Sin especificar");
  await ensureNombreMaster(db, schema.calidadNegocio, "Sin especificar");
  await ensureNombreMaster(db, schema.nivelControl, "Sin especificar");
  await ensureNombreMaster(db, schema.categoriaCuenta, "Sin especificar");

  const tipoVendedorId = await ensureTipoVendedor(db);

  const rubros = new Set<string>();
  const canales = new Set<string>();
  const resultados = new Set<string>();
  const vendedorCodigos = new Set<string>();

  for (const r of rows) {
    if (r.rubro?.trim()) rubros.add(r.rubro.trim());
    else rubros.add("Sin clasificar");
    if (r.canal?.trim()) canales.add(normalizeCanalResultadoNombre(r.canal, "canal"));
    if (r.resultado?.trim()) resultados.add(normalizeCanalResultadoNombre(r.resultado, "resultado"));
    const vc = (r.vendedor || "GEN").trim().toUpperCase();
    if (vc) vendedorCodigos.add(vc);
  }

  const rubroMap = new Map<string, string>();
  for (const x of rubros) {
    rubroMap.set(x, await ensureNombreMaster(db, schema.rubro, x));
  }

  const canalMap = new Map<string, string>();
  const resMap = new Map<string, string>();
  for (const x of canales) {
    canalMap.set(x, await ensureNombreMaster(db, schema.canalContacto, x));
  }
  for (const x of resultados) {
    resMap.set(x, await ensureNombreMaster(db, schema.resultadoContacto, x));
  }

  const tamId = await ensureNombreMaster(db, schema.tamanoCliente, "Sin especificar");
  const estId = await ensureNombreMaster(db, schema.estadoCuenta, "Sin especificar");
  const potId = await ensureNombreMaster(db, schema.potencialCrecimiento, "Sin especificar");
  const calId = await ensureNombreMaster(db, schema.calidadNegocio, "Sin especificar");
  const nivId = await ensureNombreMaster(db, schema.nivelControl, "Sin especificar");
  const catId = await ensureNombreMaster(db, schema.categoriaCuenta, "Sin especificar");

  const maps = {
    tamano: new Map<string, string>([["Sin especificar", tamId]]),
    estado: new Map<string, string>([["Sin especificar", estId]]),
    potencial: new Map<string, string>([["Sin especificar", potId]]),
    calidad: new Map<string, string>([["Sin especificar", calId]]),
    nivel: new Map<string, string>([["Sin especificar", nivId]]),
    categoria: new Map<string, string>([["Sin especificar", catId]]),
  };

  const vendedorIds = new Map<string, string>();
  for (const c of vendedorCodigos) {
    vendedorIds.set(c, await ensureVendedor(db, tipoVendedorId, c));
  }
  const defaultVendedorId =
    vendedorIds.get("GEN") ?? (await ensureVendedor(db, tipoVendedorId, "GEN", "Genérico"));

  const nombreToCliente = new Map<string, string>();
  const empresaFirstRubro = new Map<string, string>();

  for (const r of rows) {
    const emp = r.empresa?.trim();
    if (!emp) continue;
    const nz = normalizeEmpresa(emp);
    const rb = r.rubro?.trim() || "Sin clasificar";
    if (!empresaFirstRubro.has(nz)) empresaFirstRubro.set(nz, rb);
  }

  for (const [nz, rb] of empresaFirstRubro) {
    const rubroId =
      rubroMap.get(rb) ?? rubroMap.get("Sin clasificar") ?? [...rubroMap.values()][0]!;
    const sample = rows.find((x) => normalizeEmpresa(x.empresa ?? "") === nz);
    const vCod = (sample?.vendedor || "GEN").trim().toUpperCase();
    const vId = vendedorIds.get(vCod) ?? defaultVendedorId;
    const id = await ensureStubCliente(db, nz, rubroId, vId, maps);
    nombreToCliente.set(nz, id);
  }

  const sucursalSeen = new Set<string>();
  const contactSeen = new Set<string>();

  let insertedInter = 0;
  let insertedSuc = 0;
  let insertedContact = 0;

  for (const r of rows) {
    const fechaIso = parseBelgranoDate(r.fecha ?? "");
    if (!fechaIso) continue;

    const empresa = r.empresa?.trim();
    if (!empresa) continue;

    const nz = normalizeEmpresa(empresa);
    let clienteId = nombreToCliente.get(nz);
    if (!clienteId) {
      const rubroId =
        rubroMap.get(r.rubro?.trim() || "Sin clasificar") ??
        rubroMap.get("Sin clasificar")!;
      const vCod = (r.vendedor || "GEN").trim().toUpperCase();
      const vId = vendedorIds.get(vCod) ?? defaultVendedorId;
      clienteId = await ensureStubCliente(db, empresa, rubroId, vId, maps);
      nombreToCliente.set(nz, clienteId);
    }

    const dir = r.direccion?.trim() ?? "";
    const loc = r.localidad?.trim() ?? "";
    if (dir || loc) {
      const sk = `${clienteId}|${dir}|${loc}`;
      if (!sucursalSeen.has(sk)) {
        sucursalSeen.add(sk);
        await db.insert(schema.sucursal).values({
          clienteId: clienteId!,
          nombreZona: loc || dir || "Principal",
          direccion: dir || null,
          localidad: loc || null,
        });
        insertedSuc++;
      }
    }

    let contactoId: string | undefined;
    if (rowContactLooksPerson(r.nombre ?? "", r.apellido ?? "")) {
      const mail = looksLikeEmail(r.mail ?? "") ? r.mail!.trim() : "";
      let tel = (r.telefono ?? "").trim();
      if (!tel && looksLikePhone(r.apellido ?? "")) tel = r.apellido!.trim();

      const ck = `${clienteId}|${(r.nombre ?? "").trim().toLowerCase()}|${(r.apellido ?? "").trim().toLowerCase()}|${mail}`;
      if (!contactSeen.has(ck)) {
        contactSeen.add(ck);
        const ap = tel && looksLikePhone(r.apellido ?? "") ? "" : (r.apellido ?? "").trim();
        const [co] = await db
          .insert(schema.contacto)
          .values({
            clienteId: clienteId!,
            nombre: (r.nombre ?? "").trim() || "-",
            apellido: ap || "-",
            telefono: tel,
            email: mail,
          })
          .returning({ id: schema.contacto.id });
        contactoId = co.id;
        insertedContact++;
      }
    }

    const vCod = (r.vendedor || "GEN").trim().toUpperCase();
    const vId = vendedorIds.get(vCod) ?? defaultVendedorId;

    const canalNombre = normalizeCanalResultadoNombre(r.canal ?? "", "canal");
    const resNombre = normalizeCanalResultadoNombre(r.resultado ?? "", "resultado");

    await db.insert(schema.interaccion).values({
      fecha: fechaIso,
      vendedorId: vId,
      clienteId: clienteId!,
      contactoId: contactoId ?? null,
      canalId:
        canalMap.get(canalNombre) ??
        canalMap.get("Email") ??
        [...canalMap.values()][0]!,
      resultadoId:
        resMap.get(resNombre) ??
        resMap.get("Pendiente") ??
        [...resMap.values()][0]!,
      proximoPaso: r.proximo_paso ?? "",
      comentario: r.comentario ?? "",
      empresaRaw: null,
    });
    insertedInter++;
  }

  await pool.end();
  console.log(
    `Belgrano import OK: ${insertedInter} interacciones, ${insertedSuc} sucursales, ${insertedContact} contactos (reset=${!noReset}).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
