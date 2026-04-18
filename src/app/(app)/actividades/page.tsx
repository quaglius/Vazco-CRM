import { PaginationBar } from "@/components/PaginationBar";
import { listActividades } from "@/data/actividades";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; clienteId?: string; contactoId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, totalPages } = await listActividades({
    page,
    q: sp.q,
    clienteId: sp.clienteId,
    contactoId: sp.contactoId,
  });

  const query = {
    q: sp.q,
    clienteId: sp.clienteId,
    contactoId: sp.contactoId,
  };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <span className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </span>
            <span className="breadcrumb-item active">Actividades</span>
          </nav>
          <h1 className="crm-title">Bandeja de actividades</h1>
          <p className="text-muted-2 small mb-0">
            Seguimiento global. El alta de interacciones se hace desde la{" "}
            <Link href="/clientes">ficha de cliente</Link> o{" "}
            <Link href="/contactos">contacto</Link>.
          </p>
        </div>
        <div className="crm-toolbar flex-wrap">
          <Link href="/clientes" className="btn btn-primary btn-sm">
            <i className="ri-building-line me-1" />
            Ir a clientes
          </Link>
          <Link href="/contactos" className="btn btn-outline-primary btn-sm">
            <i className="ri-contacts-line me-1" />
            Contactos
          </Link>
        </div>
      </div>

      <div className="alert alert-light border mb-3 small mb-4">
        <strong>Tip:</strong> esta pantalla sirve para filtrar y revisar el historial. Para cargar una nueva actividad,
        abrí una empresa o un contacto y usá el bloque <em>Registrar actividad</em>.
      </div>

      <form className="crm-toolbar mb-3" method="get" action="/actividades">
        <div className="flex-grow-1" style={{ minWidth: 200 }}>
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Comentario o próximo paso…"
            className="form-control form-control-sm"
          />
        </div>
        <input
          type="text"
          name="clienteId"
          defaultValue={sp.clienteId ?? ""}
          placeholder="Filtrar por cliente ID"
          className="form-control form-control-sm font-monospace"
          style={{ maxWidth: 280 }}
        />
        <input
          type="text"
          name="contactoId"
          defaultValue={sp.contactoId ?? ""}
          placeholder="Filtrar por contacto ID"
          className="form-control form-control-sm font-monospace"
          style={{ maxWidth: 280 }}
        />
        <button type="submit" className="btn btn-sm btn-outline-secondary">
          Aplicar
        </button>
      </form>

      <div className="card mb-0">
        <div className="card-header py-2">
          <span className="card-title mb-0">Historial</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Canal</th>
                <th>Resultado</th>
                <th>Comentario</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="text-muted-2 text-nowrap small">{String(i.fecha)}</td>
                  <td className="fw-semibold">{i.clienteRazon ?? i.empresaRaw ?? "—"}</td>
                  <td>{i.vendedorNombre}</td>
                  <td>
                    <span className="badge-soft primary">{i.canalNombre}</span>
                  </td>
                  <td>
                    <span className="badge-soft muted">{i.resultadoNombre}</span>
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 240 }}>
                    {i.comentario}
                  </td>
                  <td className="text-end text-nowrap">
                    {i.clienteId ? (
                      <Link className="btn btn-sm btn-outline-primary" href={`/clientes/${i.clienteId}`}>
                        Empresa
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar basePath="/actividades" page={page} totalPages={totalPages} query={query} />
    </div>
  );
}
