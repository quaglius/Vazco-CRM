import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { getPgSslOption, resolveDatabaseUrl } from "../src/lib/database-url";

const DATA_DIR = path.join(process.cwd(), "seed", "data");
const CARTERA = path.join(DATA_DIR, "cartera.csv");
const BASE = path.join(DATA_DIR, "base.csv");

function assertFiles() {
  const missing: string[] = [];
  if (!fs.existsSync(CARTERA)) missing.push("seed/data/cartera.csv");
  if (!fs.existsSync(BASE)) missing.push("seed/data/base.csv");
  if (missing.length) {
    throw new Error(
      `Faltan archivos CSV requeridos:\n${missing.join("\n")}\nExportá las hojas cartera y BASE según README.`,
    );
  }
}

function normalizeHeader(h: string) {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function rowToRecord(headers: string[], row: string[]) {
  const rec: Record<string, string> = {};
  headers.forEach((h, i) => {
    rec[normalizeHeader(h)] = (row[i] ?? "").trim();
  });
  return rec;
}

function parseNumLoose(v: string): string {
  if (!v) return "0";
  const x = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  if (x === "" || x === "-") return "0";
  return x;
}

function normalizeCuit(raw: string): string {
  return raw.replace(/\D/g, "");
}

function normalizeEmpresa(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

type Db = ReturnType<typeof drizzle<typeof schema>>;

async function ensureNombreMaster(
  db: Db,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- maestros homogéneos en seed
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

async function ensureVendedor(
  db: Db,
  tipoId: string,
  codigo: string,
  nombreCompleto?: string,
) {
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

async function ensureCatalogsFromCartera(db: Db, rows: Record<string, string>[]) {
  const rubros = new Set<string>();
  const tamanos = new Set<string>();
  const estados = new Set<string>();
  const potenciales = new Set<string>();
  const calidades = new Set<string>();
  const niveles = new Set<string>();
  const categorias = new Set<string>();

  for (const r of rows) {
    if (r.rubro) rubros.add(r.rubro);
    if (r.tamano_cliente) tamanos.add(r.tamano_cliente);
    if (r.estado_cuenta) estados.add(r.estado_cuenta);
    if (r.potencial_crecimiento) potenciales.add(r.potencial_crecimiento);
    if (r.calidad_negocio) calidades.add(r.calidad_negocio);
    if (r.nivel_control) niveles.add(r.nivel_control);
    if (r.categoria_cuenta) categorias.add(r.categoria_cuenta);
  }

  const map = async (set: Set<string>, fn: (s: string) => Promise<string>) => {
    const out = new Map<string, string>();
    for (const s of set) {
      out.set(s, await fn(s));
    }
    return out;
  };

  return {
    rubro: await map(rubros, (x) => ensureNombreMaster(db, schema.rubro, x)),
    tamano: await map(tamanos, (x) => ensureNombreMaster(db, schema.tamanoCliente, x)),
    estado: await map(estados, (x) => ensureNombreMaster(db, schema.estadoCuenta, x)),
    potencial: await map(potenciales, (x) => ensureNombreMaster(db, schema.potencialCrecimiento, x)),
    calidad: await map(calidades, (x) => ensureNombreMaster(db, schema.calidadNegocio, x)),
    nivel: await map(niveles, (x) => ensureNombreMaster(db, schema.nivelControl, x)),
    categoria: await map(categorias, (x) => ensureNombreMaster(db, schema.categoriaCuenta, x)),
  };
}

async function ensureCanalResultado(db: Db, canales: Set<string>, resultados: Set<string>) {
  const fixedCanales = ["Visita", "Teléfono", "Email", "WhatsApp"];
  const fixedRes = ["Exitoso", "Pendiente", "Sin respuesta"];
  for (const c of fixedCanales) canales.add(c);
  for (const r of fixedRes) resultados.add(r);
  const canalMap = new Map<string, string>();
  const resMap = new Map<string, string>();
  for (const c of canales) canalMap.set(c, await ensureNombreMaster(db, schema.canalContacto, c));
  for (const r of resultados) resMap.set(r, await ensureNombreMaster(db, schema.resultadoContacto, r));
  return { canalMap, resMap };
}

async function insertClienteFromCartera(
  db: Db,
  row: Record<string, string>,
  maps: Awaited<ReturnType<typeof ensureCatalogsFromCartera>>,
  tipoVendedorId: string,
  vendedorIds: Map<string, string>,
) {
  const codigoRaw = row.codigo_erp || row.codigo || row.erp || "";
  const codigoErp = codigoRaw ? codigoRaw.trim() : null;
  const razon = row.razon_social || row.empresa || row.nombre || "";
  if (!razon.trim()) throw new Error("Fila cartera sin razón social / empresa");

  const rubroId =
    maps.rubro.get(row.rubro?.trim() || "Sin clasificar") ?? maps.rubro.get("Sin clasificar")!;
  const tamId =
    maps.tamano.get(row.tamano_cliente?.trim() || "Sin especificar") ??
    maps.tamano.get("Sin especificar")!;
  const estId =
    maps.estado.get(row.estado_cuenta?.trim() || "Sin especificar") ??
    maps.estado.get("Sin especificar")!;
  const potId =
    maps.potencial.get(row.potencial_crecimiento?.trim() || "Sin especificar") ??
    maps.potencial.get("Sin especificar")!;
  const calId =
    maps.calidad.get(row.calidad_negocio?.trim() || "Sin especificar") ??
    maps.calidad.get("Sin especificar")!;
  const nivId =
    maps.nivel.get(row.nivel_control?.trim() || "Sin especificar") ??
    maps.nivel.get("Sin especificar")!;
  const catId =
    maps.categoria.get(row.categoria_cuenta?.trim() || "Sin especificar") ??
    maps.categoria.get("Sin especificar")!;

  const vCod = (row.vendedor_codigo || row.vendedor || "GEN").trim().toUpperCase();
  const vendId =
    vendedorIds.get(vCod) ??
    (await ensureVendedor(db, tipoVendedorId, vCod, row.vendedor_nombre));

  const cuitDigits = normalizeCuit(row.cuit || "");

  const [ins] = await db
    .insert(schema.cliente)
    .values({
      codigoErp,
      razonSocial: razon.trim(),
      cuit: cuitDigits || "",
      rubroId,
      vendedorId: vendId,
      tamanoClienteId: tamId,
      estadoCuentaId: estId,
      potencialCrecimientoId: potId,
      calidadNegocioId: calId,
      nivelControlId: nivId,
      categoriaCuentaId: catId,
      potencialMensual: parseNumLoose(row.potencial_mensual),
      potencialAnual: parseNumLoose(row.potencial_anual),
      ventaUltimos13Meses: parseNumLoose(row.venta_ultimos_13_meses),
      ventaPromedioMensual: parseNumLoose(row.venta_promedio_mensual),
      variacionVsPotencialPct: parseNumLoose(row.variacion_vs_potencial_pct),
      ticketPromedio: parseNumLoose(row.ticket_promedio),
      recurrenciaCompra: row.recurrencia_compra ?? "",
      margenPromedioPct: parseNumLoose(row.margen_promedio_pct),
      condicionPago: row.condicion_pago ?? "",
      dsoRealDias: Math.round(Number.parseFloat(parseNumLoose(row.dso_real_dias))) || 0,
    })
    .returning({ id: schema.cliente.id });

  return ins.id;
}

async function ensureStubCliente(
  db: Db,
  empresa: string,
  maps: Awaited<ReturnType<typeof ensureCatalogsFromCartera>>,
  defaultVendedorId: string,
) {
  const pick = <T>(m: Map<string, string>, key: string, fallback: string) =>
    m.get(key) ?? [...m.values()][0] ?? fallback;

  const rubroId = pick(maps.rubro, "Sin clasificar", [...maps.rubro.values()][0]!);
  const tamId = pick(maps.tamano, "Sin especificar", [...maps.tamano.values()][0]!);
  const estId = pick(maps.estado, "Sin especificar", [...maps.estado.values()][0]!);
  const potId = pick(maps.potencial, "Sin especificar", [...maps.potencial.values()][0]!);
  const calId = pick(maps.calidad, "Sin especificar", [...maps.calidad.values()][0]!);
  const nivId = pick(maps.nivel, "Sin especificar", [...maps.nivel.values()][0]!);
  const catId = pick(maps.categoria, "Sin especificar", [...maps.categoria.values()][0]!);

  const [ins] = await db
    .insert(schema.cliente)
    .values({
      codigoErp: null,
      razonSocial: empresa.trim(),
      cuit: "",
      rubroId,
      vendedorId: defaultVendedorId,
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

async function main() {
  assertFiles();
  const ssl = getPgSslOption(process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: resolveDatabaseUrl(process.env.DATABASE_URL),
    ssl: ssl === undefined ? undefined : ssl,
    connectionTimeoutMillis: 15_000,
  });
  const db = drizzle(pool, { schema });

  const carteraRaw = fs.readFileSync(CARTERA, "utf8");
  const baseRaw = fs.readFileSync(BASE, "utf8");

  const carteraRows = parse(carteraRaw, { relax_column_count: true, skip_empty_lines: true }) as string[][];
  const baseRows = parse(baseRaw, { relax_column_count: true, skip_empty_lines: true }) as string[][];

  if (carteraRows.length < 2) throw new Error("cartera.csv no tiene datos");
  if (baseRows.length < 2) throw new Error("base.csv no tiene datos");

  const ch = carteraRows[0]!.map(normalizeHeader);
  const bh = baseRows[0]!.map(normalizeHeader);

  const cartera = carteraRows.slice(1).map((r) => rowToRecord(ch, r)).filter((r) => Object.values(r).some(Boolean));
  const base = baseRows.slice(1).map((r) => rowToRecord(bh, r)).filter((r) => Object.values(r).some(Boolean));

  await ensureNombreMaster(db, schema.rubro, "Sin clasificar");
  await ensureNombreMaster(db, schema.tamanoCliente, "Sin especificar");
  await ensureNombreMaster(db, schema.estadoCuenta, "Sin especificar");
  await ensureNombreMaster(db, schema.potencialCrecimiento, "Sin especificar");
  await ensureNombreMaster(db, schema.calidadNegocio, "Sin especificar");
  await ensureNombreMaster(db, schema.nivelControl, "Sin especificar");
  await ensureNombreMaster(db, schema.categoriaCuenta, "Sin especificar");

  const tipoVendedorId = await ensureTipoVendedor(db);

  const vendedorIds = new Map<string, string>();
  const codes = new Set<string>();
  for (const row of cartera) {
    const c = (row.vendedor_codigo || row.vendedor || "").trim().toUpperCase();
    if (c) codes.add(c);
  }
  for (const row of base) {
    const c = (row.vendedor_codigo || row.vendedor || "").trim().toUpperCase();
    if (c) codes.add(c);
  }
  for (const c of codes) {
    vendedorIds.set(c, await ensureVendedor(db, tipoVendedorId, c));
  }

  const defaultVendedorId =
    vendedorIds.get("GEN") ??
    (await ensureVendedor(db, tipoVendedorId, "GEN", "Genérico"));

  const maps = await ensureCatalogsFromCartera(db, cartera);

  maps.rubro.set("Sin clasificar", await ensureNombreMaster(db, schema.rubro, "Sin clasificar"));
  maps.tamano.set("Sin especificar", await ensureNombreMaster(db, schema.tamanoCliente, "Sin especificar"));
  maps.estado.set("Sin especificar", await ensureNombreMaster(db, schema.estadoCuenta, "Sin especificar"));
  maps.potencial.set("Sin especificar", await ensureNombreMaster(db, schema.potencialCrecimiento, "Sin especificar"));
  maps.calidad.set("Sin especificar", await ensureNombreMaster(db, schema.calidadNegocio, "Sin especificar"));
  maps.nivel.set("Sin especificar", await ensureNombreMaster(db, schema.nivelControl, "Sin especificar"));
  maps.categoria.set("Sin especificar", await ensureNombreMaster(db, schema.categoriaCuenta, "Sin especificar"));

  const cuitToCliente = new Map<string, string>();
  const erpToCliente = new Map<string, string>();
  const nombreToCliente = new Map<string, string>();

  for (const row of cartera) {
    const id = await insertClienteFromCartera(db, row, maps, tipoVendedorId, vendedorIds);
    const cuit = normalizeCuit(row.cuit || "");
    if (cuit) cuitToCliente.set(cuit, id);
    const erp = (row.codigo_erp || row.codigo || row.erp || "").trim().toUpperCase();
    if (erp) erpToCliente.set(erp, id);
    const nz = normalizeEmpresa(row.razon_social || row.empresa || row.nombre || "");
    if (nz) nombreToCliente.set(nz, id);
  }

  const canales = new Set<string>();
  const resultados = new Set<string>();
  for (const row of base) {
    if (row.canal) canales.add(row.canal.trim());
    if (row.resultado) resultados.add(row.resultado.trim());
  }
  const { canalMap, resMap } = await ensureCanalResultado(db, canales, resultados);

  for (const row of base) {
    const fechaRaw = row.fecha || row.date || "";
    const d = new Date(fechaRaw);
    if (Number.isNaN(d.getTime())) continue;

    const empresa = row.empresa || row.razon_social || "";
    const cuit = normalizeCuit(row.cuit || "");
    const erp = (row.codigo_erp || row.codigo || row.erp || "").trim().toUpperCase();

    let clienteId: string | undefined = cuit ? cuitToCliente.get(cuit) : undefined;
    if (!clienteId && erp) clienteId = erpToCliente.get(erp);
    if (!clienteId && empresa) clienteId = nombreToCliente.get(normalizeEmpresa(empresa));

    let empresaRaw: string | null = null;
    if (!clienteId) {
      clienteId = await ensureStubCliente(db, empresa || "Sin nombre", maps, defaultVendedorId);
      empresaRaw = empresa || null;
      const nz = normalizeEmpresa(empresa);
      if (nz) nombreToCliente.set(nz, clienteId);
    }

    const vCod = (row.vendedor_codigo || row.vendedor || "GEN").trim().toUpperCase();
    const vId = vendedorIds.get(vCod) ?? defaultVendedorId;

    const canalNombre = row.canal?.trim() || "Visita";
    const resNombre = row.resultado?.trim() || "Pendiente";

    await db.insert(schema.interaccion).values({
      fecha: d.toISOString().slice(0, 10),
      vendedorId: vId,
      clienteId,
      canalId: canalMap.get(canalNombre) ?? [...canalMap.values()][0]!,
      resultadoId: resMap.get(resNombre) ?? [...resMap.values()][0]!,
      proximoPaso: row.proximo_paso || row.proximo || "",
      comentario: row.comentario || row.observaciones || "",
      empresaRaw,
    });

    if (row.contacto_nombre || row.contacto_apellido) {
      await db.insert(schema.contacto).values({
        clienteId: clienteId!,
        nombre: row.contacto_nombre || "",
        apellido: row.contacto_apellido || "",
        telefono: row.telefono || "",
        email: row.email || "",
      });
    }
  }

  await pool.end();
  console.log(
    `Seed OK: ${cartera.length} clientes desde cartera, ${base.length} filas procesadas en base.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
