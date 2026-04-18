import { actualizarContactoFromForm, softDeleteContactoForm } from "@/actions/contacto-actions";
import { listCanalOptions, listResultadoOptions, listRolContactoOptions } from "@/data/catalog-options";
import { getContacto } from "@/data/contactos";
import { listInteraccionesByContacto } from "@/data/actividades";
import { RegistrarActividadCard } from "@/components/RegistrarActividadCard";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContactoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, write, canales, resultados, roles, acts] = await Promise.all([
    getContacto(id),
    canWrite(),
    listCanalOptions(),
    listResultadoOptions(),
    listRolContactoOptions(),
    listInteraccionesByContacto(id, 30),
  ]);
  if (!row) notFound();

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <Link href="/contactos" className="breadcrumb-item">
              Contactos
            </Link>
            <span className="breadcrumb-item active">
              {row.nombre} {row.apellido}
            </span>
          </nav>
          <h1 className="crm-title">
            {row.nombre} {row.apellido}
          </h1>
          <p className="text-muted-2 small mb-0">{row.cliente?.razonSocial}</p>
        </div>
        <div className="crm-toolbar">
          <Link href={`/clientes/${row.clienteId}`} className="btn btn-outline-secondary btn-sm">
            Ver empresa
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Datos del contacto</span>
            </div>
            <div className="card-body">
              {write ? (
                <form action={actualizarContactoFromForm} className="row g-2">
                  <input type="hidden" name="id" value={id} />
                  <div className="col-md-6">
                    <label className="form-label small text-muted-2">Nombre</label>
                    <input name="nombre" className="form-control form-control-sm" required defaultValue={row.nombre} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted-2">Apellido</label>
                    <input name="apellido" className="form-control form-control-sm" defaultValue={row.apellido} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted-2">Email</label>
                    <input name="email" type="email" className="form-control form-control-sm" defaultValue={row.email} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted-2">Teléfono</label>
                    <input name="telefono" className="form-control form-control-sm" defaultValue={row.telefono} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted-2">Rol</label>
                    <select name="rol_contacto_id" className="form-select form-select-sm" defaultValue={row.rol?.id ?? ""}>
                      <option value="">—</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Guardar
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="row small mb-0">
                  <dt className="col-4 text-muted-2">Email</dt>
                  <dd className="col-8">{row.email || "—"}</dd>
                  <dt className="col-4 text-muted-2">Teléfono</dt>
                  <dd className="col-8">{row.telefono || "—"}</dd>
                  <dt className="col-4 text-muted-2">Rol</dt>
                  <dd className="col-8">{row.rol?.nombre ?? "—"}</dd>
                </dl>
              )}
              {write ? (
                <form action={softDeleteContactoForm} className="mt-3 pt-3 border-top">
                  <input type="hidden" name="id" value={id} />
                  <button type="submit" className="btn btn-outline-danger btn-sm">
                    Baja lógica
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card mb-3">
            <div className="card-header">
              <span className="card-title">Registrar actividad</span>
            </div>
            <div className="card-body">
              <RegistrarActividadCard
                clienteId={row.clienteId}
                contactoId={id}
                canales={canales}
                resultados={resultados}
                write={write}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Actividades recientes</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 small">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Canal</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-2 py-3">
                          Sin actividades para este contacto.
                        </td>
                      </tr>
                    ) : (
                      acts.map((a) => (
                        <tr key={a.id}>
                          <td>{String(a.fecha)}</td>
                          <td>{a.canalNombre}</td>
                          <td>{a.resultadoNombre}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
