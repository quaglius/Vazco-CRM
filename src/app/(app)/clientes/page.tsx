import { PaginationBar } from "@/components/PaginationBar";
import { getClientePreview, getClienteUltimaInteraccion, listClientes } from "@/data/clientes";
import Link from "next/link";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sel?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const q = sp.q;
  const sel = sp.sel;

  const { items, totalPages, pageSize } = await listClientes({ page, q });

  const [preview, ultima] = await Promise.all([
    sel ? getClientePreview(sel) : Promise.resolve(null),
    sel ? getClienteUltimaInteraccion(sel) : Promise.resolve(null),
  ]);

  const queryBase = { q, ...(sel ? { sel } : {}) };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <span className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </span>
            <span className="breadcrumb-item active">Clientes</span>
          </nav>
          <h1 className="crm-title">Clientes</h1>
          <p className="text-muted-2 small mb-0">Empresas de la cartera — seleccioná una fila para ver el panel.</p>
        </div>
        <div className="crm-toolbar">
          <Link href="/clientes/nuevo" className="btn btn-primary btn-sm">
            <i className="ri-add-line me-1" />
            Agregar cliente
          </Link>
        </div>
      </div>

      <form className="crm-toolbar mb-3" method="get" action="/clientes">
        <input type="hidden" name="sel" value={sel ?? ""} />
        <div className="flex-grow-1" style={{ minWidth: 200 }}>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por razón social, CUIT o código ERP…"
            className="form-control form-control-sm"
          />
        </div>
        <button type="submit" className="btn btn-sm btn-outline-secondary">
          Buscar
        </button>
      </form>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card mb-0">
            <div className="card-header py-2">
              <span className="card-title mb-0">Listado</span>
              <span className="text-muted-2 small">{totalPages > 0 ? `${pageSize} por página` : ""}</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 48 }} />
                    <th>Razón social</th>
                    <th className="d-none d-md-table-cell">CUIT</th>
                    <th className="d-none d-lg-table-cell">Rubro</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const active = sel === c.id;
                    const href = `/clientes?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      page: String(page),
                      sel: c.id,
                    }).toString()}`;
                    return (
                      <tr key={c.id} className={active ? "table-active" : ""}>
                        <td>
                          <span className="avatar-sm">{initials(c.razonSocial)}</span>
                        </td>
                        <td className="fw-semibold">{c.razonSocial}</td>
                        <td className="d-none d-md-table-cell text-muted-2 small">{c.cuit || "—"}</td>
                        <td className="d-none d-lg-table-cell small">{c.rubroNombre ?? "—"}</td>
                        <td className="text-end">
                          <Link className="btn btn-sm btn-outline-primary" href={href}>
                            Panel
                          </Link>
                          <Link className="btn btn-sm btn-link" href={`/clientes/${c.id}`}>
                            Ficha
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationBar basePath="/clientes" page={page} totalPages={totalPages} query={queryBase} />
        </div>

        <div className="col-lg-5">
          <div className="card mb-0 sticky-lg-top" style={{ top: "88px" }}>
            <div className="card-header">
              <span className="card-title">Vista rápida</span>
            </div>
            <div className="card-body">
              {!sel || !preview ? (
                <p className="text-muted-2 small mb-0">
                  Elegí un cliente del listado con <strong>Panel</strong> para ver detalle y accesos.
                </p>
              ) : (
                <>
                  <div className="d-flex gap-3 mb-3">
                    <span className="avatar-sm" style={{ width: 48, height: 48, fontSize: "1rem" }}>
                      {initials(preview.razonSocial)}
                    </span>
                    <div>
                      <div className="fw-bold">{preview.razonSocial}</div>
                      <div className="text-muted-2 small">{preview.rubro?.nombre ?? "—"}</div>
                      <div className="text-muted-2 small">{preview.vendedor?.nombreCompleto ?? "—"}</div>
                    </div>
                  </div>
                  <dl className="row small mb-3">
                    <dt className="col-5 text-muted-2">CUIT</dt>
                    <dd className="col-7 mb-2">{preview.cuit || "—"}</dd>
                    <dt className="col-5 text-muted-2">ERP</dt>
                    <dd className="col-7 mb-2">{preview.codigoErp ?? "—"}</dd>
                    <dt className="col-5 text-muted-2">Pago</dt>
                    <dd className="col-7 mb-0">{preview.condicionPago || "—"}</dd>
                  </dl>
                  {ultima ? (
                    <div className="rounded p-2 mb-3 bg-light">
                      <div className="text-muted-2 text-uppercase small fw-semibold mb-1">Última actividad</div>
                      <div className="small">
                        <span className="badge-soft primary me-1">{String(ultima.fecha)}</span>
                        {ultima.canal?.nombre} · {ultima.resultado?.nombre}
                      </div>
                      {ultima.proximoPaso ? (
                        <div className="small mt-1 text-muted-2">Próximo: {ultima.proximoPaso}</div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="small text-muted-2">Sin actividades registradas.</p>
                  )}
                  <div className="d-flex flex-wrap gap-2">
                    <Link href={`/clientes/${preview.id}`} className="btn btn-primary btn-sm">
                      Abrir ficha
                    </Link>
                    <Link href={`/clientes/${preview.id}/editar`} className="btn btn-outline-secondary btn-sm">
                      Editar
                    </Link>
                    <Link href={`/contactos?clienteId=${preview.id}`} className="btn btn-outline-success btn-sm">
                      Contactos
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
