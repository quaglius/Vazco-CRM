import { softDeleteClienteForm } from "@/actions/cliente-actions";
import { getCliente, getClienteResumenKpi } from "@/data/clientes";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, kpi, write] = await Promise.all([getCliente(id), getClienteResumenKpi(id), canWrite()]);
  if (!row) notFound();

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/clientes">Clientes</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {row.razonSocial}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h4 mb-1">{row.razonSocial}</h1>
          <div className="text-muted small">
            {row.vendedor?.nombreCompleto} · {row.rubro?.nombre}
          </div>
        </div>
        {write ? (
          <form action={softDeleteClienteForm}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="btn btn-sm btn-outline-danger">
              Baja lógica
            </button>
          </form>
        ) : null}
      </div>

      {kpi ? (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body py-3">
                <div className="text-muted small">Venta 13m</div>
                <div className="fs-5 fw-semibold">{kpi.ventaUltimos13Meses}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body py-3">
                <div className="text-muted small">Potencial anual</div>
                <div className="fs-5 fw-semibold">{kpi.potencialAnual}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body py-3">
                <div className="text-muted small">Margen %</div>
                <div className="fs-5 fw-semibold">{kpi.margenPromedioPct}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card kpi-card">
              <div className="card-body py-3">
                <div className="text-muted small">DSO días</div>
                <div className="fs-5 fw-semibold">{kpi.dsoRealDias}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-datos" type="button">
            Datos
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-contactos" type="button">
            Contactos
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-act" type="button">
            Actividades
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-suc" type="button">
            Sucursales
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade show active" id="tab-datos">
          <div className="card kpi-card">
            <div className="card-body">
              <dl className="row row-cols-1 row-cols-md-2 mb-0 small">
                <dt className="col-sm-4 text-muted">CUIT</dt>
                <dd className="col-sm-8">{row.cuit || "—"}</dd>
                <dt className="col-sm-4 text-muted">Código ERP</dt>
                <dd className="col-sm-8">{row.codigoErp ?? "—"}</dd>
                <dt className="col-sm-4 text-muted">Estado cuenta</dt>
                <dd className="col-sm-8">{row.estadoCuenta?.nombre}</dd>
                <dt className="col-sm-4 text-muted">Tamaño</dt>
                <dd className="col-sm-8">{row.tamanoCliente?.nombre}</dd>
                <dt className="col-sm-4 text-muted">Condición pago</dt>
                <dd className="col-sm-8">{row.condicionPago || "—"}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="tab-pane fade" id="tab-contactos">
          <div className="table-responsive card">
            <table className="table table-sm table-dense mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {row.contactos?.map((co) => (
                  <tr key={co.id}>
                    <td>
                      {co.nombre} {co.apellido}
                    </td>
                    <td>{co.email || "—"}</td>
                    <td>{co.telefono || "—"}</td>
                    <td>{co.rol?.nombre ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tab-pane fade" id="tab-act">
          <div className="table-responsive card">
            <table className="table table-sm table-dense mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Resultado</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {row.interacciones?.map((i) => (
                  <tr key={i.id}>
                    <td>{String(i.fecha)}</td>
                    <td>{i.canal?.nombre}</td>
                    <td>{i.resultado?.nombre}</td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}>
                      {i.comentario}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tab-pane fade" id="tab-suc">
          <div className="table-responsive card">
            <table className="table table-sm table-dense mb-0">
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Dirección</th>
                  <th>Localidad</th>
                </tr>
              </thead>
              <tbody>
                {row.sucursales?.length ? (
                  row.sucursales.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nombreZona}</td>
                      <td>{s.direccion ?? "—"}</td>
                      <td>{s.localidad ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-muted">
                      Sin sucursales cargadas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
