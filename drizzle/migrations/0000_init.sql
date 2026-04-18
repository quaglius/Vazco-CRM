CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "calidad_negocio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canal_contacto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categoria_cuenta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cliente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo_erp" text,
	"razon_social" text NOT NULL,
	"cuit" text DEFAULT '' NOT NULL,
	"rubro_id" uuid NOT NULL,
	"vendedor_id" uuid NOT NULL,
	"tamano_cliente_id" uuid NOT NULL,
	"estado_cuenta_id" uuid NOT NULL,
	"potencial_crecimiento_id" uuid NOT NULL,
	"calidad_negocio_id" uuid NOT NULL,
	"nivel_control_id" uuid NOT NULL,
	"categoria_cuenta_id" uuid NOT NULL,
	"potencial_mensual" numeric(18, 2) DEFAULT '0' NOT NULL,
	"potencial_anual" numeric(18, 2) DEFAULT '0' NOT NULL,
	"venta_ultimos_13_meses" numeric(18, 2) DEFAULT '0' NOT NULL,
	"venta_promedio_mensual" numeric(18, 2) DEFAULT '0' NOT NULL,
	"variacion_vs_potencial_pct" numeric(18, 4) DEFAULT '0' NOT NULL,
	"ticket_promedio" numeric(18, 2) DEFAULT '0' NOT NULL,
	"recurrencia_compra" text DEFAULT '' NOT NULL,
	"margen_promedio_pct" numeric(18, 4) DEFAULT '0' NOT NULL,
	"condicion_pago" text DEFAULT '' NOT NULL,
	"dso_real_dias" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"rol_contacto_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estado_cuenta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interaccion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" date NOT NULL,
	"vendedor_id" uuid NOT NULL,
	"cliente_id" uuid,
	"contacto_id" uuid,
	"canal_id" uuid NOT NULL,
	"resultado_id" uuid NOT NULL,
	"proximo_paso" text DEFAULT '' NOT NULL,
	"comentario" text DEFAULT '' NOT NULL,
	"empresa_raw" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nivel_control" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "potencial_crecimiento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultado_contacto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rol_contacto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubro" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sucursal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nombre_zona" text NOT NULL,
	"direccion" text,
	"localidad" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tamano_cliente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipo_vendedor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendedor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre_completo" text NOT NULL,
	"clerk_user_id" text,
	"tipo_vendedor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_rubro_id_rubro_id_fk" FOREIGN KEY ("rubro_id") REFERENCES "public"."rubro"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_vendedor_id_vendedor_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."vendedor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_tamano_cliente_id_tamano_cliente_id_fk" FOREIGN KEY ("tamano_cliente_id") REFERENCES "public"."tamano_cliente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_estado_cuenta_id_estado_cuenta_id_fk" FOREIGN KEY ("estado_cuenta_id") REFERENCES "public"."estado_cuenta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_potencial_crecimiento_id_potencial_crecimiento_id_fk" FOREIGN KEY ("potencial_crecimiento_id") REFERENCES "public"."potencial_crecimiento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_calidad_negocio_id_calidad_negocio_id_fk" FOREIGN KEY ("calidad_negocio_id") REFERENCES "public"."calidad_negocio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_nivel_control_id_nivel_control_id_fk" FOREIGN KEY ("nivel_control_id") REFERENCES "public"."nivel_control"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_categoria_cuenta_id_categoria_cuenta_id_fk" FOREIGN KEY ("categoria_cuenta_id") REFERENCES "public"."categoria_cuenta"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacto" ADD CONSTRAINT "contacto_cliente_id_cliente_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacto" ADD CONSTRAINT "contacto_rol_contacto_id_rol_contacto_id_fk" FOREIGN KEY ("rol_contacto_id") REFERENCES "public"."rol_contacto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_vendedor_id_vendedor_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."vendedor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_cliente_id_cliente_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_contacto_id_contacto_id_fk" FOREIGN KEY ("contacto_id") REFERENCES "public"."contacto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_canal_id_canal_contacto_id_fk" FOREIGN KEY ("canal_id") REFERENCES "public"."canal_contacto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_resultado_id_resultado_contacto_id_fk" FOREIGN KEY ("resultado_id") REFERENCES "public"."resultado_contacto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucursal" ADD CONSTRAINT "sucursal_cliente_id_cliente_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendedor" ADD CONSTRAINT "vendedor_tipo_vendedor_id_tipo_vendedor_id_fk" FOREIGN KEY ("tipo_vendedor_id") REFERENCES "public"."tipo_vendedor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "calidad_negocio_nombre_lower_unique" ON "calidad_negocio" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "canal_contacto_nombre_lower_unique" ON "canal_contacto" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "categoria_cuenta_nombre_lower_unique" ON "categoria_cuenta" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_codigo_erp_unique" ON "cliente" USING btree ("codigo_erp");--> statement-breakpoint
CREATE INDEX "cliente_cuit_idx" ON "cliente" USING btree ("cuit");--> statement-breakpoint
CREATE INDEX "cliente_codigo_erp_idx" ON "cliente" USING btree ("codigo_erp");--> statement-breakpoint
CREATE INDEX "contacto_cliente_id_idx" ON "contacto" USING btree ("cliente_id");--> statement-breakpoint
CREATE UNIQUE INDEX "estado_cuenta_nombre_lower_unique" ON "estado_cuenta" USING btree (lower("nombre"));--> statement-breakpoint
CREATE INDEX "interaccion_cliente_id_idx" ON "interaccion" USING btree ("cliente_id");--> statement-breakpoint
CREATE INDEX "interaccion_fecha_idx" ON "interaccion" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "interaccion_vendedor_id_idx" ON "interaccion" USING btree ("vendedor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nivel_control_nombre_lower_unique" ON "nivel_control" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "potencial_crecimiento_nombre_lower_unique" ON "potencial_crecimiento" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "resultado_contacto_nombre_lower_unique" ON "resultado_contacto" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "rol_contacto_nombre_lower_unique" ON "rol_contacto" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "rubro_nombre_lower_unique" ON "rubro" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "tamano_cliente_nombre_lower_unique" ON "tamano_cliente" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "tipo_vendedor_nombre_lower_unique" ON "tipo_vendedor" USING btree (lower("nombre"));--> statement-breakpoint
CREATE UNIQUE INDEX "vendedor_codigo_unique" ON "vendedor" USING btree ("codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "vendedor_clerk_user_id_unique" ON "vendedor" USING btree ("clerk_user_id");