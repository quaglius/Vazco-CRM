import { crearClienteFromForm } from "@/actions/cliente-actions";
import { listRubroOptions } from "@/data/catalog-options";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NuevoClientePage() {
  const write = await canWrite();
  if (!write) redirect("/clientes");

  const rubros = await listRubroOptions();

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <Link href="/clientes" className="breadcrumb-item">
              Clientes
            </Link>
            <span className="breadcrumb-item active">Nuevo</span>
          </nav>
          <h1 className="crm-title">Nuevo cliente</h1>
        </div>
        <Link href="/clientes" className="btn btn-outline-secondary btn-sm">
          Cancelar
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form action={crearClienteFromForm} className="row g-3">
            <div className="col-md-8">
              <label className="form-label small text-muted-2">Razón social</label>
              <input name="razon_social" className="form-control" required placeholder="Ej. Metalúrgica ACME SA" />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Rubro</label>
              <select name="rubro_id" className="form-select" required defaultValue="">
                <option value="" disabled>
                  Elegir…
                </option>
                {rubros.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">CUIT</label>
              <input name="cuit" className="form-control" placeholder="Opcional" />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Código ERP</label>
              <input name="codigo_erp" className="form-control" placeholder="Opcional" />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="ri-save-line me-1" />
                Guardar cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
