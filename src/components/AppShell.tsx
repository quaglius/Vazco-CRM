"use client";

import Link from "next/link";
import { DevUserBadge } from "./DevUserBadge";
import type { ReactNode } from "react";
import { BootstrapClient } from "./BootstrapClient";
import { MobileSidebarOverlay, SidebarNav } from "./SidebarNav";
import { useState } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarInner = (
    <>
      <div className="sidebar-brand">
        <Link href="/" className="d-flex align-items-center text-decoration-none text-white">
          <span className="brand-mark">V</span>
          <span className="brand-text">VazcoCRM</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        <SidebarNav onNavigate={() => setMobileOpen(false)} idPrefix="desk-" />
      </nav>
    </>
  );

  return (
    <div className="app-shell">
      <BootstrapClient />

      <aside className="app-sidebar d-none d-lg-flex flex-column">{sidebarInner}</aside>

      <MobileSidebarOverlay open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="sidebar-brand">
          <Link href="/" className="d-flex align-items-center text-decoration-none text-white" onClick={() => setMobileOpen(false)}>
            <span className="brand-mark">V</span>
            <span className="brand-text">VazcoCRM</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <SidebarNav onNavigate={() => setMobileOpen(false)} idPrefix="mob-" />
        </nav>
      </MobileSidebarOverlay>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="icon-btn d-lg-none me-2"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
          >
            <i className="ri-menu-3-line fs-5" />
          </button>
          <div className="topbar-search flex-grow-1">
            <i className="ri-search-line" />
            <input type="search" className="form-control" placeholder="Buscar clientes, contactos…" />
          </div>
          <div className="topbar-actions flex-shrink-0">
            <button type="button" className="icon-btn d-none d-sm-inline-flex" title="Notificaciones">
              <i className="ri-notification-3-line" />
            </button>
            <div className="ms-1 ms-sm-2">
              <DevUserBadge />
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
