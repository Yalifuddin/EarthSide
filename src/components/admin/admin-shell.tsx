"use client";

import type { ReactNode } from "react";
import { AdminAuthProvider } from "./admin-auth-provider";
import { AdminGate } from "./admin-gate";
import { AdminHeader } from "./admin-header";

/** Everything under /admin: auth context → gate → header + page. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGate>
        <div className="min-h-dvh bg-blush">
          <AdminHeader />
          {children}
        </div>
      </AdminGate>
    </AdminAuthProvider>
  );
}
