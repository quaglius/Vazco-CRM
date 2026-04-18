import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const masterCols = {
  nombre: text("nombre").notNull(),
  orden: integer("orden"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

function masterTable(name: string) {
  return pgTable(
    name,
    {
      id: uuid("id").primaryKey().defaultRandom(),
      ...masterCols,
    },
    (t) => ({
      nombreLowerUnique: uniqueIndex(`${name}_nombre_lower_unique`).on(sql`lower(${t.nombre})`),
    }),
  );
}

export const rubro = masterTable("rubro");
export const tamanoCliente = masterTable("tamano_cliente");
export const estadoCuenta = masterTable("estado_cuenta");
export const potencialCrecimiento = masterTable("potencial_crecimiento");
export const calidadNegocio = masterTable("calidad_negocio");
export const nivelControl = masterTable("nivel_control");
export const categoriaCuenta = masterTable("categoria_cuenta");
export const tipoVendedor = masterTable("tipo_vendedor");
export const canalContacto = masterTable("canal_contacto");
export const resultadoContacto = masterTable("resultado_contacto");
export const rolContacto = masterTable("rol_contacto");

export const vendedor = pgTable(
  "vendedor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigo: text("codigo").notNull(),
    nombreCompleto: text("nombre_completo").notNull(),
    clerkUserId: text("clerk_user_id"),
    tipoVendedorId: uuid("tipo_vendedor_id")
      .notNull()
      .references(() => tipoVendedor.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    codigoUnique: uniqueIndex("vendedor_codigo_unique").on(t.codigo),
    clerkUnique: uniqueIndex("vendedor_clerk_user_id_unique").on(t.clerkUserId),
  }),
);

export const vendedorRelations = relations(vendedor, ({ one }) => ({
  tipo: one(tipoVendedor, { fields: [vendedor.tipoVendedorId], references: [tipoVendedor.id] }),
}));

export const cliente = pgTable(
  "cliente",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigoErp: text("codigo_erp"),
    razonSocial: text("razon_social").notNull(),
    cuit: text("cuit").notNull().default(""),
    rubroId: uuid("rubro_id")
      .notNull()
      .references(() => rubro.id),
    vendedorId: uuid("vendedor_id")
      .notNull()
      .references(() => vendedor.id),
    tamanoClienteId: uuid("tamano_cliente_id")
      .notNull()
      .references(() => tamanoCliente.id),
    estadoCuentaId: uuid("estado_cuenta_id")
      .notNull()
      .references(() => estadoCuenta.id),
    potencialCrecimientoId: uuid("potencial_crecimiento_id")
      .notNull()
      .references(() => potencialCrecimiento.id),
    calidadNegocioId: uuid("calidad_negocio_id")
      .notNull()
      .references(() => calidadNegocio.id),
    nivelControlId: uuid("nivel_control_id")
      .notNull()
      .references(() => nivelControl.id),
    categoriaCuentaId: uuid("categoria_cuenta_id")
      .notNull()
      .references(() => categoriaCuenta.id),
    potencialMensual: numeric("potencial_mensual", { precision: 18, scale: 2 }).notNull().default("0"),
    potencialAnual: numeric("potencial_anual", { precision: 18, scale: 2 }).notNull().default("0"),
    ventaUltimos13Meses: numeric("venta_ultimos_13_meses", { precision: 18, scale: 2 }).notNull().default("0"),
    ventaPromedioMensual: numeric("venta_promedio_mensual", { precision: 18, scale: 2 }).notNull().default("0"),
    variacionVsPotencialPct: numeric("variacion_vs_potencial_pct", { precision: 18, scale: 4 }).notNull().default("0"),
    ticketPromedio: numeric("ticket_promedio", { precision: 18, scale: 2 }).notNull().default("0"),
    recurrenciaCompra: text("recurrencia_compra").notNull().default(""),
    margenPromedioPct: numeric("margen_promedio_pct", { precision: 18, scale: 4 }).notNull().default("0"),
    condicionPago: text("condicion_pago").notNull().default(""),
    dsoRealDias: integer("dso_real_dias").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    codigoErpUnique: uniqueIndex("cliente_codigo_erp_unique").on(t.codigoErp),
    cuitIdx: index("cliente_cuit_idx").on(t.cuit),
    codigoErpIdx: index("cliente_codigo_erp_idx").on(t.codigoErp),
  }),
);

export const sucursal = pgTable("sucursal", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => cliente.id),
  nombreZona: text("nombre_zona").notNull(),
  direccion: text("direccion"),
  localidad: text("localidad"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contacto = pgTable(
  "contacto",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => cliente.id),
    nombre: text("nombre").notNull(),
    apellido: text("apellido").notNull(),
    telefono: text("telefono").notNull().default(""),
    email: text("email").notNull().default(""),
    rolContactoId: uuid("rol_contacto_id").references(() => rolContacto.id),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clienteIdx: index("contacto_cliente_id_idx").on(t.clienteId),
  }),
);

export const interaccion = pgTable(
  "interaccion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fecha: date("fecha").notNull(),
    vendedorId: uuid("vendedor_id")
      .notNull()
      .references(() => vendedor.id),
    clienteId: uuid("cliente_id").references(() => cliente.id),
    contactoId: uuid("contacto_id").references(() => contacto.id),
    canalId: uuid("canal_id")
      .notNull()
      .references(() => canalContacto.id),
    resultadoId: uuid("resultado_id")
      .notNull()
      .references(() => resultadoContacto.id),
    proximoPaso: text("proximo_paso").notNull().default(""),
    comentario: text("comentario").notNull().default(""),
    empresaRaw: text("empresa_raw"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    clienteIdx: index("interaccion_cliente_id_idx").on(t.clienteId),
    fechaIdx: index("interaccion_fecha_idx").on(t.fecha),
    vendedorIdx: index("interaccion_vendedor_id_idx").on(t.vendedorId),
  }),
);

export const sucursalRelations = relations(sucursal, ({ one }) => ({
  cliente: one(cliente, { fields: [sucursal.clienteId], references: [cliente.id] }),
}));

export const contactoRelations = relations(contacto, ({ one }) => ({
  cliente: one(cliente, { fields: [contacto.clienteId], references: [cliente.id] }),
  rol: one(rolContacto, { fields: [contacto.rolContactoId], references: [rolContacto.id] }),
}));

export const clienteRelations = relations(cliente, ({ one, many }) => ({
  rubro: one(rubro, { fields: [cliente.rubroId], references: [rubro.id] }),
  vendedor: one(vendedor, { fields: [cliente.vendedorId], references: [vendedor.id] }),
  tamanoCliente: one(tamanoCliente, {
    fields: [cliente.tamanoClienteId],
    references: [tamanoCliente.id],
  }),
  estadoCuenta: one(estadoCuenta, {
    fields: [cliente.estadoCuentaId],
    references: [estadoCuenta.id],
  }),
  potencialCrecimiento: one(potencialCrecimiento, {
    fields: [cliente.potencialCrecimientoId],
    references: [potencialCrecimiento.id],
  }),
  calidadNegocio: one(calidadNegocio, {
    fields: [cliente.calidadNegocioId],
    references: [calidadNegocio.id],
  }),
  nivelControl: one(nivelControl, {
    fields: [cliente.nivelControlId],
    references: [nivelControl.id],
  }),
  categoriaCuenta: one(categoriaCuenta, {
    fields: [cliente.categoriaCuentaId],
    references: [categoriaCuenta.id],
  }),
  sucursales: many(sucursal),
  contactos: many(contacto),
  interacciones: many(interaccion),
}));

export const interaccionRelations = relations(interaccion, ({ one }) => ({
  cliente: one(cliente, { fields: [interaccion.clienteId], references: [cliente.id] }),
  contacto: one(contacto, { fields: [interaccion.contactoId], references: [contacto.id] }),
  vendedor: one(vendedor, { fields: [interaccion.vendedorId], references: [vendedor.id] }),
  canal: one(canalContacto, { fields: [interaccion.canalId], references: [canalContacto.id] }),
  resultado: one(resultadoContacto, {
    fields: [interaccion.resultadoId],
    references: [resultadoContacto.id],
  }),
}));
