"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavGroup = {
  title: string;
  items: Array<
    | { type: "link"; href: string; label: string; icon: string }
    | { type: "sub"; label: string; icon: string; children: Array<{ href: string; label: string; icon: string }> }
  >;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Menú",
    items: [{ type: "link", href: "/", label: "Dashboard", icon: "ri-dashboard-2-line" }],
  },
  {
    title: "CRM",
    items: [
      {
        type: "sub",
        label: "Comercial",
        icon: "ri-briefcase-line",
        children: [
          { href: "/clientes", label: "Clientes", icon: "ri-building-line" },
          { href: "/contactos", label: "Contactos", icon: "ri-contacts-line" },
          { href: "/actividades", label: "Actividades", icon: "ri-calendar-event-line" },
        ],
      },
    ],
  },
  {
    title: "Configuración",
    items: [
      {
        type: "sub",
        label: "Sistema",
        icon: "ri-settings-4-line",
        children: [
          { href: "/usuarios", label: "Usuarios", icon: "ri-team-line" },
          { href: "/maestros", label: "Maestros", icon: "ri-database-2-line" },
        ],
      },
    ],
  },
];

function NavLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`nav-link ${active ? "active" : ""}`}
      onClick={onNavigate}
      prefetch
    >
      <i className={icon} />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNav({
  onNavigate,
  idPrefix = "",
}: {
  onNavigate?: () => void;
  idPrefix?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <div className="sidebar-section">{group.title}</div>
          {group.items.map((item, idx) => {
            const key = `${group.title}-${idx}`;
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              );
            }

            const childActive = item.children.some(
              (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
            );
            const collapseId = `${idPrefix}nav-sub-${group.title}-${idx}`.replace(/\s/g, "");

            return (
              <div key={key} className="sidebar-nav-tree">
                <button
                  className={`nav-link sidebar-toggle w-100 text-start border-0 bg-transparent ${childActive ? "active-parent" : ""}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded={childActive ? "true" : "false"}
                  aria-controls={collapseId}
                >
                  <i className={item.icon} />
                  <span className="flex-grow-1">{item.label}</span>
                  <i className="ri-arrow-down-s-line sidebar-chevron ms-auto small" />
                </button>
                <div className={`collapse ${childActive ? "show" : ""}`} id={collapseId}>
                  <div className="sidebar-subnav ps-3 pb-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        href={child.href}
                        label={child.label}
                        icon={child.icon}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function MobileSidebarOverlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <button type="button" className="sidebar-backdrop d-lg-none" aria-label="Cerrar menú" onClick={onClose} />
      <aside className="app-sidebar mobile-drawer d-lg-none">{children}</aside>
    </>
  );
}
