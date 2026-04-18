"use client";

import Link from "next/link";
import { useEffect } from "react";

const showStack = process.env.NEXT_PUBLIC_DEPLOY_DEBUG === "true";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Útil si consiguen ver la consola del navegador
    console.error("[App error]", error.message, error.digest, error);
  }, [error]);

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="alert alert-danger" role="alert">
        <h1 className="h5">Error al cargar esta sección</h1>
        <p className="mb-2 font-monospace small text-break">{error.message || "Error sin mensaje"}</p>
        {error.digest ? (
          <p className="mb-2 small">
            <strong>Digest:</strong> <span className="font-monospace user-select-all">{error.digest}</span>
          </p>
        ) : null}
        {showStack && error.stack ? (
          <pre className="bg-dark text-light p-3 rounded small overflow-auto mb-0" style={{ maxHeight: 320 }}>
            {error.stack}
          </pre>
        ) : null}
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => reset()}>
          Reintentar
        </button>
        <Link href="/deploy-debug" className="btn btn-outline-secondary btn-sm">
          Abrir diagnóstico de deploy
        </Link>
      </div>
      <p className="text-muted-2 small mb-0">
        Con <code>NEXT_PUBLIC_DEPLOY_DEBUG=true</code> en Netlify podés ver el stack arriba y la página{" "}
        <Link href="/deploy-debug">/deploy-debug</Link>.
      </p>
    </div>
  );
}
