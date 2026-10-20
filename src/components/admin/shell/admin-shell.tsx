"use client";

import type { ReactNode } from "react";
import { AdminAuthProvider } from "./admin-auth-provider";
import { AdminFeaturesProvider, type AdminFeatures } from "./admin-features";
import { AdminGate } from "./admin-gate";
import { AdminHeader } from "./admin-header";

/** Everything under /admin: features + auth context → gate → header + page. */
export function AdminShell({
  features,
  children,
}: {
  features: AdminFeatures;
  children: ReactNode;
}) {
  return (
    <AdminFeaturesProvider features={features}>
      <AdminAuthProvider>
        <AdminGate>
          <div className="min-h-dvh bg-blush">
            <AdminHeader />
            {children}
          </div>
        </AdminGate>
      </AdminAuthProvider>
    </AdminFeaturesProvider>
  );
}
