import Link from "next/link";
import { DevUserBadge } from "./DevUserBadge";
import type { ReactNode } from "react";
import { BootstrapClient } from "./BootstrapClient";

type NavItem = { href: string; label: string; icon: string };
type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: "Menú",
    items: [
      { href: "/", label: "Dashboard", icon: "ri-dashboard-2-line" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { href: "/clientes", label: "Clientes", icon: "ri-building-line" },
      { href: "/contactos", label: "Contactos", icon: "ri-contacts-line" },
      { href: "/actividades", label: "Actividades", icon: "ri-calendar-event-line" },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/maestros/rubro", label: "Maestros", icon: "ri-list-settings-line" },
      { href: "/maestros/vendedores", label: "Vendedores", icon: "ri-user-star-line" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <BootstrapClient />

      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">V</span>
          <span className="brand-text">VazcoCRM</span>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section">{section.title}</div>
              {section.items.map((item) => (
                <Link key={item.href} className="nav-link" href={item.href}>
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-search d-none d-md-block">
            <i className="ri-search-line" />
            <input
              type="search"
              className="form-control"
              placeholder="Buscar clientes, contactos..."
            />
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-btn" title="Pantalla completa">
              <i className="ri-fullscreen-line" />
            </button>
            <button type="button" className="icon-btn" title="Notificaciones">
              <i className="ri-notification-3-line" />
            </button>
            <div className="ms-2">
              <DevUserBadge />
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
