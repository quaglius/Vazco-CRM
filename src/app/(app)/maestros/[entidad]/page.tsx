import { crearMaestroFromForm, eliminarMaestro } from "@/actions/maestro-actions";
import { listMaestro } from "@/data/maestros";
import { MAESTRO_LABEL, isMaestroSlug } from "@/lib/maestros";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MaestroPage({ params }: { params: Promise<{ entidad: string }> }) {
  const { entidad } = await params;
  if (!isMaestroSlug(entidad)) notFound();

  const [rows, write] = await Promise.all([listMaestro(entidad), canWrite()]);
  const label = MAESTRO_LABEL[entidad];

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <Link href="/maestros" className="breadcrumb-item">
              Maestros
            </Link>
            <span className="breadcrumb-item active">{label}</span>
          </nav>
          <h1 className="crm-title">{label}</h1>
          <p className="text-muted-2 small mb-0">Catálogo de valores para el CRM.</p>
        </div>
        <Link href="/maestros" className="btn btn-outline-secondary btn-sm">
          <i className="ri-arrow-left-line me-1" />
          Volver
        </Link>
      </div>

      <div className="master-card-grid mb-4">
        {Object.entries(MAESTRO_LABEL).map(([slug, text]) => (
          <Link
            key={slug}
            href={`/maestros/${slug}`}
            className={`master-card ${slug === entidad ? "active" : ""}`}
          >
            {text}
          </Link>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Agregar valor</span>
        </div>
        <div className="card-body">
          {write ? (
            <form action={crearMaestroFromForm.bind(null, entidad)} className="row g-2 align-items-end">
              <div className="col-md-6">
                <label className="form-label small text-muted-2">Nombre</label>
                <input name="nombre" className="form-control form-control-sm" required placeholder="Texto visible en listas" />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted-2">Orden</label>
                <input name="orden" type="number" className="form-control form-control-sm" placeholder="Opcional" />
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="ri-add-line me-1" />
                  Agregar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-muted-2 small mb-0">Solo lectura.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Valores actuales</span>
          <span className="text-muted-2 small">{rows.length} registros</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Orden</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.nombre}</td>
                    <td className="text-muted-2">{r.orden ?? "—"}</td>
                    <td className="text-end">
                      {write ? (
                        <form action={eliminarMaestro.bind(null, entidad, r.id)} className="d-inline">
                          <button type="submit" className="btn btn-sm btn-outline-danger">
                            Eliminar
                          </button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
