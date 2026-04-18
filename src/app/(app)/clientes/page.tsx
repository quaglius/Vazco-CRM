import { PaginationBar } from "@/components/PaginationBar";
import { listClientes } from "@/data/clientes";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const q = sp.q;
  const { items, totalPages, pageSize } = await listClientes({ page, q });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">Clientes</h1>
        <span className="text-muted small">{totalPages > 0 ? `${pageSize} por página` : ""}</span>
      </div>

      <form className="row g-2 mb-3" method="get" action="/clientes">
        <div className="col-auto flex-grow-1">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por razón social, CUIT o código ERP…"
            className="form-control form-control-sm"
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-sm btn-primary">
            Buscar
          </button>
        </div>
      </form>

      <div className="table-responsive card">
        <table className="table table-sm table-dense mb-0">
          <thead>
            <tr>
              <th>Razón social</th>
              <th>CUIT</th>
              <th>Código ERP</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.razonSocial}</td>
                <td>{c.cuit || "—"}</td>
                <td>{c.codigoErp ?? "—"}</td>
                <td className="text-end">
                  <Link className="btn btn-sm btn-outline-primary" href={`/clientes/${c.id}`}>
                    Ficha
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar basePath="/clientes" page={page} totalPages={totalPages} query={{ q }} />
    </div>
  );
}
