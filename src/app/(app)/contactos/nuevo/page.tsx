import { crearContactoFromForm } from "@/actions/contacto-actions";
import { listClienteOptions } from "@/data/clientes";
import { listRolContactoOptions } from "@/data/catalog-options";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NuevoContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const write = await canWrite();
  if (!write) redirect("/contactos");

  const sp = await searchParams;
  const clientes = await listClienteOptions();
  const roles = await listRolContactoOptions();

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <Link href="/contactos" className="breadcrumb-item">
              Contactos
            </Link>
            <span className="breadcrumb-item active">Nuevo</span>
          </nav>
          <h1 className="crm-title">Nuevo contacto</h1>
        </div>
        <Link href="/contactos" className="btn btn-outline-secondary btn-sm">
          Cancelar
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form action={crearContactoFromForm} className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-muted-2">Empresa</label>
              <select
                name="cliente_id"
                className="form-select"
                required
                defaultValue={sp.clienteId ?? ""}
              >
                <option value="" disabled>
                  Elegir cliente…
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razonSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted-2">Nombre</label>
              <input name="nombre" className="form-control" required />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted-2">Apellido</label>
              <input name="apellido" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Email</label>
              <input name="email" type="email" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Teléfono</label>
              <input name="telefono" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Rol</label>
              <select name="rol_contacto_id" className="form-select" defaultValue="">
                <option value="">—</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="ri-save-line me-1" />
                Guardar contacto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
