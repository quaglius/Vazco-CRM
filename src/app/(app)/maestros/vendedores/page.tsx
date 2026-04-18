import { crearVendedorFromForm, eliminarVendedor } from "@/actions/vendedor-actions";
import { listTiposVendedor, listVendedores } from "@/data/vendedores";
import { canWrite } from "@/lib/auth";
import { PaginationBar } from "@/components/PaginationBar";

export const dynamic = "force-dynamic";

export default async function VendedoresMaestroPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const [{ items, totalPages }, tipos, write] = await Promise.all([
    listVendedores(page),
    listTiposVendedor(),
    canWrite(),
  ]);

  return (
    <div>
      <h1 className="h4 mb-4">Vendedores</h1>

      {write ? (
        <form action={crearVendedorFromForm} className="row g-2 align-items-end mb-4">
          <div className="col-md-2">
            <label className="form-label small text-muted">Código</label>
            <input name="codigo" className="form-control form-control-sm" required />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Nombre completo</label>
            <input name="nombre_completo" className="form-control form-control-sm" required />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Tipo</label>
            <select name="tipo_vendedor_id" className="form-select form-select-sm" required defaultValue="">
              <option value="" disabled>
                Elegir…
              </option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
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
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Clerk</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td>{v.codigo}</td>
                <td>{v.nombreCompleto}</td>
                <td>{v.tipo?.nombre}</td>
                <td className="small text-muted">{v.clerkUserId ?? "—"}</td>
                <td className="text-end">
                  {write ? (
                    <form action={eliminarVendedor.bind(null, v.id)} className="d-inline">
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

      <PaginationBar basePath="/maestros/vendedores" page={page} totalPages={totalPages} />
    </div>
  );
}
