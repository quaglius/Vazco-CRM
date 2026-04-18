import { PaginationBar } from "@/components/PaginationBar";
import { listActividades } from "@/data/actividades";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; clienteId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, totalPages } = await listActividades({
    page,
    q: sp.q,
    clienteId: sp.clienteId,
  });

  return (
    <div>
      <h1 className="h4 mb-4">Actividades</h1>

      <form className="row g-2 mb-3" method="get" action="/actividades">
        <input type="hidden" name="clienteId" value={sp.clienteId ?? ""} />
        <div className="col-auto flex-grow-1">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Comentario o próximo paso…"
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
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Canal</th>
              <th>Resultado</th>
              <th>Comentario</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{String(i.fecha)}</td>
                <td>{i.clienteRazon ?? i.empresaRaw ?? "—"}</td>
                <td>{i.vendedorNombre}</td>
                <td>{i.canalNombre}</td>
                <td>{i.resultadoNombre}</td>
                <td className="text-truncate" style={{ maxWidth: 240 }}>
                  {i.comentario}
                </td>
                <td className="text-end">
                  {i.clienteId ? (
                    <Link className="btn btn-sm btn-outline-primary" href={`/clientes/${i.clienteId}`}>
                      Ver
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        basePath="/actividades"
        page={page}
        totalPages={totalPages}
        query={{ q: sp.q, clienteId: sp.clienteId }}
      />
    </div>
  );
}
