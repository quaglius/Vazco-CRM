import Link from "next/link";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

function hrefForPage(basePath: string, pageNum: number, query: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  qs.set("page", String(pageNum));
  return `${basePath}?${qs.toString()}`;
}

export function PaginationBar({ basePath, page, totalPages, query = {} }: Props) {
  return (
    <nav className="d-flex justify-content-between align-items-center mt-3">
      <span className="text-muted small">
        Página {page} de {totalPages}
      </span>
      <div className="btn-group btn-group-sm">
        <Link
          className={`btn btn-outline-secondary ${page <= 1 ? "disabled" : ""}`}
          href={hrefForPage(basePath, Math.max(1, page - 1), query)}
          aria-disabled={page <= 1}
        >
          Anterior
        </Link>
        <Link
          className={`btn btn-outline-secondary ${page >= totalPages ? "disabled" : ""}`}
          href={hrefForPage(basePath, Math.min(totalPages, page + 1), query)}
          aria-disabled={page >= totalPages}
        >
          Siguiente
        </Link>
      </div>
    </nav>
  );
}
