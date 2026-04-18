import Link from "next/link";
import type { ReactNode } from "react";
import { runDeployDiagnostics } from "@/lib/deploy-diagnostics";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <tr>
      <th scope="row" className="text-muted-2 small text-nowrap align-top" style={{ width: 200 }}>
        {label}
      </th>
      <td className="font-monospace small text-break">{value}</td>
    </tr>
  );
}

export default async function DeployDebugPage() {
  if (process.env.NEXT_PUBLIC_DEPLOY_DEBUG !== "true") {
    return (
      <div className="container py-5" style={{ maxWidth: 720 }}>
        <h1 className="h4 mb-3">Diagnóstico de deploy</h1>
        <p className="text-muted-2">
          La vista detallada está desactivada. En{" "}
          <strong>Netlify → Environment variables</strong> agregá{" "}
          <code className="user-select-all">NEXT_PUBLIC_DEPLOY_DEBUG=true</code> (Production), guardá y redesplegá. No
          subas esto al repo si no querés exponer detalles del entorno.
        </p>
        <p className="mb-0">
          <Link href="/">Volver al inicio</Link>
        </p>
      </div>
    );
  }

  const d = await runDeployDiagnostics();

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <h1 className="h4 mb-1">Diagnóstico de deploy</h1>
      <p className="text-muted-2 small mb-3">
        Generado <span className="font-monospace">{d.generatedAt}</span> · Node <span className="font-monospace">{d.nodeVersion}</span> ·{" "}
        <span className="font-monospace">{d.nodeEnv}</span>
        {d.vercelEnv ? (
          <>
            {" "}
            · <span className="font-monospace">VERCEL_ENV={d.vercelEnv}</span>
          </>
        ) : null}
      </p>

      <div className="alert alert-warning small" role="alert">
        Desactivá <code>NEXT_PUBLIC_DEPLOY_DEBUG</code> cuando termines de depurar (información sensible del entorno).
      </div>

      <div className="table-responsive mb-4">
        <table className="table table-sm table-bordered mb-0">
          <tbody>
            <Row label="DATABASE_URL definida" value={d.databaseUrl.defined ? "sí" : "no"} />
            <Row label="Host (parseado, sin password)" value={d.databaseUrl.host ?? "—"} />
            <Row label="Puerto" value={d.databaseUrl.port ?? "—"} />
            <Row label="Base de datos" value={d.databaseUrl.database ?? "—"} />
            <Row label="sslmode en URL" value={d.databaseUrl.sslModeFromUrl ?? "—"} />
            <Row label="resolveDatabaseUrl" value={d.databaseUrl.resolveError ? `error: ${d.databaseUrl.resolveError}` : "ok"} />
            <Row
              label="Conexión + SELECT 1"
              value={
                d.connectionTest.ok ? (
                  <span className="text-success">ok {d.connectionTest.latencyMs != null ? `(${d.connectionTest.latencyMs} ms)` : ""}</span>
                ) : (
                  <span className="text-danger">
                    falló
                    {d.connectionTest.code ? ` [${d.connectionTest.code}]` : ""}: {d.connectionTest.error}
                    {d.connectionTest.detail ? ` — ${d.connectionTest.detail}` : ""}
                  </span>
                )
              }
            />
            <Row
              label="Tabla cliente"
              value={
                d.schemaHint.error ? (
                  d.schemaHint.error
                ) : d.schemaHint.clienteTableExists ? (
                  <span className="text-success">existe</span>
                ) : (
                  <span className="text-warning">
                    no existe — probablemente falta correr migraciones / seed contra esta base
                  </span>
                )
              }
            />
            <Row label="NEXT_PUBLIC_SKIP_CLERK" value={d.clerk.skipClerk ? "true" : "false"} />
            <Row label="Clerk publishable (sufijo)" value={d.clerk.publishableKeySuffix ?? "—"} />
            <Row label="CLERK_SECRET_KEY definida" value={d.clerk.secretKeyDefined ? "sí" : "no"} />
            <Row label="Auth Clerk activo" value={d.clerk.authEnabled ? "sí" : "no"} />
          </tbody>
        </table>
      </div>

      <p className="small text-muted-2 mb-2">Nunca se muestra la contraseña ni la URL completa.</p>
      <p className="mb-0">
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
