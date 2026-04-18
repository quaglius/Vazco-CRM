import { MAESTRO_LABEL, MAESTRO_SLUGS } from "@/lib/maestros";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function MaestrosIndexPage() {
  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <span className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </span>
            <span className="breadcrumb-item active">Maestros</span>
          </nav>
          <h1 className="crm-title">Maestros</h1>
          <p className="text-muted-2 small mb-0">
            Catálogos del CRM. Elegí una categoría para administrar valores.
          </p>
        </div>
      </div>

      <div className="master-card-grid">
        {MAESTRO_SLUGS.map((slug) => (
          <Link key={slug} href={`/maestros/${slug}`} className="master-card">
            {MAESTRO_LABEL[slug]}
          </Link>
        ))}
      </div>
    </div>
  );
}
