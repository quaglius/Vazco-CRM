import { PaginationBar } from "@/components/PaginationBar";
import { getContacto, listContactos } from "@/data/contactos";
import Link from "next/link";

export const dynamic = "force-dynamic";

function initials(n: string, a: string) {
  const s = `${n} ${a}`.trim();
  return s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; clienteId?: string; sel?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sel = sp.sel;

  const { items, totalPages } = await listContactos({
    page,
    q: sp.q,
    clienteId: sp.clienteId,
  });

  const preview = sel ? await getContacto(sel) : null;

  const queryBase = {
    q: sp.q,
    clienteId: sp.clienteId,
    ...(sel ? { sel } : {}),
  };

  const nuevoHref =
    sp.clienteId != null && sp.clienteId !== ""
      ? `/contactos/nuevo?clienteId=${encodeURIComponent(sp.clienteId)}`
      : "/contactos/nuevo";

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <span className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </span>
            <span className="breadcrumb-item active">Contactos</span>
          </nav>
          <h1 className="crm-title">Contactos</h1>
          <p className="text-muted-2 small mb-0">Personas vinculadas a empresas — estilo CRM.</p>
        </div>
        <div className="crm-toolbar flex-wrap">
          <Link href={nuevoHref} className="btn btn-primary btn-sm">
            <i className="ri-add-line me-1" />
            Agregar contacto
          </Link>
        </div>
      </div>

      <form className="crm-toolbar mb-3 align-items-end" method="get" action="/contactos">
        <input type="hidden" name="sel" value={sel ?? ""} />
        <div className="flex-grow-1" style={{ minWidth: 180 }}>
          <label className="form-label small text-muted-2 mb-1 d-none d-md-block">Buscar</label>
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nombre, apellido o email…"
            className="form-control form-control-sm"
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <label className="form-label small text-muted-2 mb-1 d-none d-md-block">Cliente</label>
          <input
            type="text"
            name="clienteId"
            defaultValue={sp.clienteId ?? ""}
            placeholder="ID cliente (filtro)"
            className="form-control form-control-sm font-monospace"
          />
        </div>
        <button type="submit" className="btn btn-sm btn-outline-secondary">
          Filtrar
        </button>
      </form>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card mb-0">
            <div className="card-header py-2">
              <span className="card-title mb-0">Listado</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 48 }} />
                    <th>Contacto</th>
                    <th className="d-none d-md-table-cell">Empresa</th>
                    <th className="d-none d-lg-table-cell">Email</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ contacto: c, clienteRazon }) => {
                    const active = sel === c.id;
                    const href = `/contactos?${new URLSearchParams({
                      ...(sp.q ? { q: sp.q } : {}),
                      ...(sp.clienteId ? { clienteId: sp.clienteId } : {}),
                      page: String(page),
                      sel: c.id,
                    }).toString()}`;
                    return (
                      <tr key={c.id} className={active ? "table-active" : ""}>
                        <td>
                          <span className="avatar-sm">{initials(c.nombre, c.apellido)}</span>
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {c.nombre} {c.apellido}
                          </div>
                          <div className="d-md-none small text-muted-2">{clienteRazon}</div>
                        </td>
                        <td className="d-none d-md-table-cell">{clienteRazon}</td>
                        <td className="d-none d-lg-table-cell small">{c.email || "—"}</td>
                        <td className="text-end">
                          <Link className="btn btn-sm btn-outline-primary" href={href}>
                            Panel
                          </Link>
                          <Link className="btn btn-sm btn-link" href={`/contactos/${c.id}`}>
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationBar basePath="/contactos" page={page} totalPages={totalPages} query={queryBase} />
        </div>

        <div className="col-lg-5">
          <div className="card mb-0 sticky-lg-top" style={{ top: "88px" }}>
            <div className="card-header">
              <span className="card-title">Vista rápida</span>
            </div>
            <div className="card-body">
              {!sel || !preview ? (
                <p className="text-muted-2 small mb-0">
                  Seleccioná un contacto con <strong>Panel</strong> para ver datos y acciones.
                </p>
              ) : (
                <>
                  <div className="d-flex gap-3 mb-3">
                    <span className="avatar-sm" style={{ width: 48, height: 48, fontSize: "1rem" }}>
                      {initials(preview.nombre, preview.apellido)}
                    </span>
                    <div>
                      <div className="fw-bold">
                        {preview.nombre} {preview.apellido}
                      </div>
                      <div className="text-muted-2 small">{preview.cliente?.razonSocial}</div>
                      <div className="small">{preview.email || "—"} · {preview.telefono || "—"}</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Link href={`/contactos/${preview.id}`} className="btn btn-primary btn-sm">
                      Ficha completa
                    </Link>
                    <Link href={`/clientes/${preview.clienteId}`} className="btn btn-outline-secondary btn-sm">
                      Empresa
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
