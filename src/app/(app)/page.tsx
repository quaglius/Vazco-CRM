import {
  ActividadesPorDiaChart,
  PorCanalDonut,
  PorResultadoBar,
} from "@/components/DashboardCharts";
import {
  getDashboardStats,
  getInteraccionesPorCanal,
  getInteraccionesPorDia,
  getInteraccionesPorResultado,
  getTopRubros,
  getTopVendedores,
  getUltimasInteracciones,
} from "@/data/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmtFecha(raw: unknown): string {
  if (!raw) return "—";
  const s = String(raw);
  const d = new Date(s.length === 10 ? `${s}T00:00:00Z` : s);
  if (Number.isNaN(d.getTime())) return s;
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

function badgeClassResultado(nombre: string | null | undefined): string {
  const n = (nombre ?? "").toLowerCase();
  if (n.includes("respond") && !n.includes("sin")) return "badge-soft success";
  if (n.includes("sin resp") || n.includes("no resp")) return "badge-soft danger";
  if (n.includes("cotiz")) return "badge-soft info";
  if (n.includes("rebot") || n.includes("error")) return "badge-soft warning";
  return "badge-soft muted";
}

function badgeClassCanal(nombre: string | null | undefined): string {
  const n = (nombre ?? "").toLowerCase();
  if (n.includes("whats")) return "badge-soft success";
  if (n.includes("mail") || n.includes("email")) return "badge-soft info";
  if (n.includes("llam") || n.includes("tel")) return "badge-soft warning";
  if (n.includes("visit")) return "badge-soft primary";
  return "badge-soft muted";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const [stats, porDia, porCanal, porResultado, topVend, topRubros, ultimas] = await Promise.all([
    getDashboardStats(),
    getInteraccionesPorDia(14),
    getInteraccionesPorCanal(),
    getInteraccionesPorResultado(),
    getTopVendedores(5),
    getTopRubros(6),
    getUltimasInteracciones(8),
  ]);

  const maxRubro = Math.max(1, ...topRubros.map((r) => r.n));
  const maxVend = Math.max(1, ...topVend.map((v) => v.n));

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1">Buen día 👋</h4>
          <p className="text-muted-2 mb-0">Esto es lo que está pasando en tu cartera hoy.</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge-soft primary px-3 py-2">
            <i className="ri-calendar-line me-1" />
            Últimos 14 días
          </span>
          <Link href="/actividades" className="btn btn-success btn-sm px-3">
            <i className="ri-add-line me-1" />
            Nueva actividad
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-2">
        <KpiCard
          label="Clientes activos"
          value={stats.clientesActivos}
          icon="ri-building-2-line"
          variant="primary"
          link="/clientes"
          linkLabel="Ver clientes"
        />
        <KpiCard
          label="Interacciones"
          value={stats.interacciones}
          icon="ri-chat-3-line"
          variant="info"
          link="/actividades"
          linkLabel="Ver actividades"
        />
        <KpiCard
          label="Últimos 14 días"
          value={stats.ultimos14Dias}
          icon="ri-calendar-event-line"
          variant="warning"
          delta={stats.ultimos14Dias > 0 ? `+${stats.ultimos14Dias}` : "0"}
          deltaUp={stats.ultimos14Dias > 0}
          linkLabel="Período actual"
        />
        <KpiCard
          label="Tasa de respuesta"
          value={`${stats.respondioPct}%`}
          icon="ri-checkbox-circle-line"
          variant="success"
          delta={`${stats.sinRespuestaPct}% sin respuesta`}
          deltaUp={stats.respondioPct >= 50}
          linkLabel="Sobre total interacciones"
        />
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <ActividadesPorDiaChart data={porDia} />
        </div>
        <div className="col-xl-4">
          <PorCanalDonut data={porCanal} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-6">
          <PorResultadoBar data={porResultado} />
        </div>
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">Top vendedores</h5>
              <span className="text-muted-2 small">por interacciones</span>
            </div>
            <div className="card-body">
              {topVend.length === 0 ? (
                <p className="text-muted-2 small mb-0">Sin vendedores registrados.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {topVend.map((v) => {
                    const pct = Math.round((v.n / maxVend) * 100);
                    return (
                      <li key={v.vendedorId} className="mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <span className="avatar-sm">{initials(v.nombre || v.codigo)}</span>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="text-truncate">
                                <strong>{v.nombre || v.codigo}</strong>{" "}
                                <span className="text-muted-2 small ms-1">{v.codigo}</span>
                              </div>
                              <strong>{v.n}</strong>
                            </div>
                            <div className="progress" style={{ height: 6 }}>
                              <div
                                className="progress-bar bg-success"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">Top rubros</h5>
              <span className="text-muted-2 small">clientes</span>
            </div>
            <div className="card-body">
              {topRubros.length === 0 ? (
                <p className="text-muted-2 small mb-0">Sin rubros aún.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {topRubros.map((r) => {
                    const pct = Math.round((r.n / maxRubro) * 100);
                    return (
                      <li key={r.nombre} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{r.nombre}</span>
                          <strong>{r.n}</strong>
                        </div>
                        <div className="progress" style={{ height: 6 }}>
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">Últimas actividades</h5>
              <Link href="/actividades" className="text-muted-2 small">
                Ver todas <i className="ri-arrow-right-line" />
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dense table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th>Canal</th>
                      <th>Resultado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {ultimas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted-2 py-4">
                          Sin actividades registradas.
                        </td>
                      </tr>
                    ) : (
                      ultimas.map((i) => (
                        <tr key={i.id}>
                          <td className="text-muted-2">{fmtFecha(i.fecha)}</td>
                          <td className="fw-semibold text-truncate" style={{ maxWidth: 240 }}>
                            {i.cliente?.razonSocial ?? i.empresaRaw ?? "—"}
                          </td>
                          <td>{i.vendedor?.nombreCompleto ?? "—"}</td>
                          <td>
                            <span className={badgeClassCanal(i.canal?.nombre)}>
                              {i.canal?.nombre ?? "—"}
                            </span>
                          </td>
                          <td>
                            <span className={badgeClassResultado(i.resultado?.nombre)}>
                              {i.resultado?.nombre ?? "—"}
                            </span>
                          </td>
                          <td className="text-end">
                            {i.clienteId ? (
                              <Link
                                className="btn btn-sm btn-outline-primary"
                                href={`/clientes/${i.clienteId}`}
                              >
                                Ver
                              </Link>
                            ) : null}
                          </td>
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

type KpiVariant = "primary" | "success" | "info" | "warning" | "danger";

function KpiCard({
  label,
  value,
  icon,
  variant,
  delta,
  deltaUp,
  link,
  linkLabel,
}: {
  label: string;
  value: string | number;
  icon: string;
  variant: KpiVariant;
  delta?: string;
  deltaUp?: boolean;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="card kpi-card h-100">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between">
            <div>
              <div className="kpi-label">{label}</div>
              <div className="kpi-value">{value}</div>
              {delta ? (
                <div className={`delta-chip mt-1 ${deltaUp ? "up" : "down"}`}>
                  <i className={deltaUp ? "ri-arrow-up-s-fill" : "ri-arrow-down-s-fill"} />
                  {delta}
                </div>
              ) : null}
            </div>
            <span className={`kpi-icon bg-soft-${variant}`}>
              <i className={icon} />
            </span>
          </div>
          {link ? (
            <Link href={link} className="kpi-link">
              {linkLabel} <i className="ri-arrow-right-line" />
            </Link>
          ) : linkLabel ? (
            <div className="kpi-link">{linkLabel}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
