"use client";

import { useEffect } from "react";

/** Carga JS de Bootstrap (dropdowns, modales, tabs) una sola vez en el cliente. */
export function BootstrapClient() {
  useEffect(() => {
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return null;
}
