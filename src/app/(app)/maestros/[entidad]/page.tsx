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
      <h1 className="h4 mb-4">{label}</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <h6 className="text-muted">Otros maestros</h6>
          <div className="d-flex flex-wrap gap-1 small">
            {Object.entries(MAESTRO_LABEL).map(([slug, text]) => (
              <Link
                key={slug}
                className={`btn btn-sm ${slug === entidad ? "btn-primary" : "btn-outline-secondary"}`}
                href={`/maestros/${slug}`}
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {write ? (
        <form action={crearMaestroFromForm.bind(null, entidad)} className="row g-2 align-items-end mb-4">
          <div className="col-md-5">
            <label className="form-label small text-muted">Nombre</label>
            <input name="nombre" className="form-control form-control-sm" required />
          </div>
          <div className="col-md-2">
            <label className="form-label small text-muted">Orden</label>
            <input name="orden" type="number" className="form-control form-control-sm" />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-sm btn-primary">
              Agregar
            </button>
          </div>
        </form>
      ) : null}

      <div className="table-responsive card">
        <table className="table table-sm table-dense mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Orden</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.orden ?? "—"}</td>
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
  );
}
