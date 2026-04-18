# VazcoCRM

CRM con **Next.js 15** (App Router), **PostgreSQL**, **Drizzle ORM**, **Clerk** (opcional en local) y UI **Bootstrap 5** (layout tipo Paces). Los datos se consumen solo en servidor (Server Components / Server Actions).

## Requisitos

- Node.js **≥ 20.12.2**
- **PostgreSQL** con `DATABASE_URL` (en local podés usar el `docker-compose.yml` del repo; en Netlify: Netlify DB / Neon)
- **Clerk** solo si querés login: en local podés no configurarlo; en producción (Netlify) lo definís con variables de entorno

## Desarrollo local sin Clerk ni Netlify

1. `npm install`
2. Levantá Postgres (el `docker-compose.yml` publica el puerto **5433** en Windows para no chocar con un PostgreSQL nativo que suele usar **5432**):
   - **Con Docker:** `npm run docker:up` (usuario/contraseña/base como en `docker-compose.yml`).
   - **Sin Docker:** instalá PostgreSQL y ajustá `DATABASE_URL` en `.env` (host, puerto, usuario, contraseña, base).
   - Si `db:migrate` parece “colgado”, suele ser conexión al puerto equivocado o SSL; el proyecto normaliza `localhost` → `127.0.0.1` y `sslmode=disable` para loopback (ver `src/lib/database-url.ts`).
3. Creá `.env` con **solo** (o al menos) esto:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/vazco_crm
   ```

   No hace falta definir claves de Clerk. La app entra en **modo sin login**: no se pide autenticación, en la barra superior verás *“Modo local · sin login”* y el rol interno se trata como **admin** (lectura/escritura en formularios que usan `canWrite()`).

4. `npm run db:migrate` y, si tenés los CSV, `npm run db:seed`
5. `npm run dev`

**Forzar** el modo sin Clerk (aunque en `.env` hayas dejado claves de prueba): `NEXT_PUBLIC_SKIP_CLERK=true`

## Cuándo usar Clerk

Activá Clerk solo cuando existan **las tres** cosas:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SKIP_CLERK` vacío o distinto de `true`

Si falta cualquiera de las dos claves, la app se comporta como sin login (útil para local).

### Roles Clerk

En el dashboard de Clerk, asigná en **public metadata** del usuario `"role": "admin" | "vendedor" | "viewer"`. Sin rol válido se usa **viewer**.

## Configuración local completa (con Clerk)

Copiá `.env.example` a `.env`, completá `DATABASE_URL`, las dos claves de Clerk y opcionalmente las URLs `NEXT_PUBLIC_CLERK_*`. Luego migraciones, seed opcional y `npm run dev`.

## CSV para seed

El script normaliza encabezados. Columnas esperadas están documentadas en el código de `seed/seed.ts`.

Matching de empresa: **CUIT** → **código ERP** → **razón social normalizada**; si no hay match se crea un cliente mínimo (stub).

## Netlify (desde Git)

1. En el sitio Netlify definí las variables de entorno: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, y las opcionales de rutas Clerk. No definas `NEXT_PUBLIC_SKIP_CLERK` en producción si querés login real.
2. Netlify ejecuta `npm run build` con esas vars; el middleware exigirá sesión Clerk cuando las claves estén completas.
3. Tras el deploy podés ejecutar migraciones y seed contra la URL de producción desde tu máquina (CLI o script), según tu política.

## Scripts npm

| Script                  | Descripción                               |
|-------------------------|-------------------------------------------|
| `npm run dev`           | Servidor de desarrollo                    |
| `npm run build`         | Build de producción                       |
| `npm run db:generate`   | Genera migraciones Drizzle desde el esquema |
| `npm run db:migrate`    | Aplica migraciones                        |
| `npm run db:studio`     | Drizzle Studio                           |
| `npm run db:seed`       | Importa CSV                              |

## Estructura útil

- `src/db/schema.ts` — esquema Drizzle y relaciones
- `src/lib/auth-config.ts` — si Clerk está activo o no
- `src/middleware.ts` — si Clerk está activo, protege rutas; si no, deja pasar
- `seed/seed.ts` — importación CSV
