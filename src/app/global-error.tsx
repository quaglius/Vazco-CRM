"use client";

const showStack = process.env.NEXT_PUBLIC_DEPLOY_DEBUG === "true";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20 }}>Error en la aplicación</h1>
        <p style={{ color: "#c00", wordBreak: "break-word" }}>{error.message || "Error sin mensaje"}</p>
        {error.digest ? (
          <p style={{ fontSize: 14 }}>
            <strong>Digest:</strong> {error.digest}
          </p>
        ) : null}
        {showStack && error.stack ? (
          <pre
            style={{
              background: "#111",
              color: "#eee",
              padding: 16,
              overflow: "auto",
              maxHeight: 360,
              fontSize: 12,
            }}
          >
            {error.stack}
          </pre>
        ) : null}
        <button type="button" style={{ marginTop: 16, padding: "8px 16px" }} onClick={() => reset()}>
          Reintentar
        </button>
        <p style={{ marginTop: 24, fontSize: 14 }}>
          <a href="/deploy-debug">Diagnóstico de deploy</a>
          {" · "}
          <span style={{ color: "#666" }}>
            Activa <code>NEXT_PUBLIC_DEPLOY_DEBUG=true</code> para más detalle.
          </span>
        </p>
      </body>
    </html>
  );
}
