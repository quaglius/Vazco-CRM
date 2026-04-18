"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { isAuthEnabledClient } from "@/lib/auth-config-client";

export function Providers({ children }: { children: ReactNode }) {
  if (!isAuthEnabledClient()) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
}
