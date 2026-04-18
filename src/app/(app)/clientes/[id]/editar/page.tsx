import { actualizarClienteFromForm } from "@/actions/cliente-actions";
import { listRubroOptions } from "@/data/catalog-options";
import { getCliente } from "@/data/clientes";
import { canWrite } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, write, rubros] = await Promise.all([getCliente(id), canWrite(), listRubroOptions()]);
  if (!row) notFound();
  if (!write) redirect(`/clientes/${id}`);

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <Link href="/clientes" className="breadcrumb-item">
              Clientes
            </Link>
            <Link href={`/clientes/${id}`} className="breadcrumb-item">
              {row.razonSocial}
            </Link>
            <span className="breadcrumb-item active">Editar</span>
          </nav>
          <h1 className="crm-title">Editar cliente</h1>
        </div>
        <Link href={`/clientes/${id}`} className="btn btn-outline-secondary btn-sm">
          Volver
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form action={actualizarClienteFromForm} className="row g-3">
            <input type="hidden" name="id" value={id} />
            <div className="col-md-8">
              <label className="form-label small text-muted-2">Razón social</label>
              <input name="razon_social" className="form-control" required defaultValue={row.razonSocial} />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Rubro</label>
              <select name="rubro_id" className="form-select" required defaultValue={row.rubro?.id ?? ""}>
                {rubros.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">CUIT</label>
              <input name="cuit" className="form-control" defaultValue={row.cuit ?? ""} />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted-2">Código ERP</label>
              <input name="codigo_erp" className="form-control" defaultValue={row.codigoErp ?? ""} />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                <i className="ri-save-line me-1" />
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
