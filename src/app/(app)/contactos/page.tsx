import { PaginationBar } from "@/components/PaginationBar";
import { listContactos } from "@/data/contactos";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; clienteId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, totalPages } = await listContactos({
    page,
    q: sp.q,
    clienteId: sp.clienteId,
  });

  return (
    <div>
      <h1 className="h4 mb-4">Contactos</h1>

      <form className="row g-2 mb-3" method="get" action="/contactos">
        <input type="hidden" name="clienteId" value={sp.clienteId ?? ""} />
        <div className="col-auto flex-grow-1">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nombre, apellido o email…"
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
              <th>Contacto</th>
              <th>Cliente</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map(({ contacto: c, clienteRazon }) => (
              <tr key={c.id}>
                <td>
                  {c.nombre} {c.apellido}
                </td>
                <td>{clienteRazon}</td>
                <td>{c.email || "—"}</td>
                <td className="text-end">
                  <Link className="btn btn-sm btn-outline-primary" href={`/clientes/${c.clienteId}`}>
                    Empresa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        basePath="/contactos"
        page={page}
        totalPages={totalPages}
        query={{ q: sp.q, clienteId: sp.clienteId }}
      />
    </div>
  );
}
