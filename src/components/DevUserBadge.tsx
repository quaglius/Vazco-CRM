"use client";

import { UserButton } from "@clerk/nextjs";
import { isAuthEnabledClient } from "@/lib/auth-config-client";

/** En local sin Clerk muestra etiqueta; con Clerk muestra UserButton. */
export function DevUserBadge() {
  if (!isAuthEnabledClient()) {
    return <span className="badge rounded-pill text-bg-secondary fw-normal">Modo local · sin login</span>;
  }
  return <UserButton />;
}
