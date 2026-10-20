"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Capabilities decided on the server (they depend on secrets the browser never sees). */
export interface AdminFeatures {
  /** A machine-translation service (DeepL) is configured. */
  machineTranslation: boolean;
}

const AdminFeaturesContext = createContext<AdminFeatures>({ machineTranslation: false });

export function AdminFeaturesProvider({
  features,
  children,
}: {
  features: AdminFeatures;
  children: ReactNode;
}) {
  return <AdminFeaturesContext.Provider value={features}>{children}</AdminFeaturesContext.Provider>;
}

export function useAdminFeatures(): AdminFeatures {
  return useContext(AdminFeaturesContext);
}
