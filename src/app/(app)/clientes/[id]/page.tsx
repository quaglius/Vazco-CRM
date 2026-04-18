import { softDeleteClienteForm } from "@/actions/cliente-actions";
import { listCanalOptions, listResultadoOptions } from "@/data/catalog-options";
import { getCliente, getClienteResumenKpi } from "@/data/clientes";
import { RegistrarActividadCard } from "@/components/RegistrarActividadCard";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, kpi, write, canales, resultados] = await Promise.all([
    getCliente(id),
    getClienteResumenKpi(id),
    canWrite(),
    listCanalOptions(),
    listResultadoOptions(),
  ]);
  if (!row) notFound();

  return (
    <div>
      <nav aria-label="breadcrumb" className="breadcrumb mb-2 small">
        <li className="breadcrumb-item">
          <Link href="/clientes">Clientes</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {row.razonSocial}
        </li>
      </nav>

      <div className="crm-page-header">
        <div>
          <h1 className="crm-title text-uppercase" style={{ letterSpacing: "0.04em" }}>
            {row.razonSocial}
          </h1>
          <div className="text-muted-2 small">
            {row.vendedor?.nombreCompleto} · {row.rubro?.nombre}
          </div>
        </div>
        <div className="crm-toolbar flex-wrap">
          {write ? (
            <>
              <Link href={`/clientes/${id}/editar`} className="btn btn-outline-primary btn-sm">
                <i className="ri-pencil-line me-1" />
                Editar
              </Link>
              <Link href={`/contactos/nuevo?clienteId=${id}`} className="btn btn-success btn-sm">
                <i className="ri-user-add-line me-1" />
                Agregar contacto
              </Link>
              <form action={softDeleteClienteForm} className="d-inline">
                <input type="hidden" name="id" value={id} />
                <button type="submit" className="btn btn-outline-danger btn-sm">
                  Baja lógica
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>

      {kpi ? (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card kpi-card mb-0">
              <div className="card-body py-3">
                <div className="text-muted small">Venta 13m</div>
                <div className="fs-5 fw-semibold">{kpi.ventaUltimos13Meses}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card kpi-card mb-0">
              <div className="card-body py-3">
                <div className="text-muted small">Potencial anual</div>
                <div className="fs-5 fw-semibold">{kpi.potencialAnual}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card kpi-card mb-0">
              <div className="card-body py-3">
                <div className="text-muted small">Margen %</div>
                <div className="fs-5 fw-semibold">{kpi.margenPromedioPct}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card kpi-card mb-0">
              <div className="card-body py-3">
                <div className="text-muted small">DSO días</div>
                <div className="fs-5 fw-semibold">{kpi.dsoRealDias}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Registrar actividad</span>
          <span className="text-muted-2 small">Queda asociada a esta empresa</span>
        </div>
        <div className="card-body">
          <RegistrarActividadCard
            clienteId={id}
            canales={canales}
            resultados={resultados}
            write={write}
          />
        </div>
      </div>

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
          <div className="card">
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 text-muted-2">Personas en esta empresa</h6>
            <Link href={`/contactos/nuevo?clienteId=${id}`} className="btn btn-sm btn-primary">
              <i className="ri-add-line me-1" />
              Nuevo
            </Link>
          </div>
          <div className="table-responsive card mb-0">
            <table className="table table-sm table-dense mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th />
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
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-primary" href={`/contactos/${co.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tab-pane fade" id="tab-act">
          <p className="text-muted-2 small">
            Tip: podés cargar interacciones desde aquí arriba o desde la ficha de cada contacto.
          </p>
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
