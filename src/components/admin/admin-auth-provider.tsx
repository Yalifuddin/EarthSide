"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAdminServices, type AdminServices } from "@/composition/admin-services";
import type { AuthUser } from "@/core/auth/auth";

type AuthStatus = "loading" | "signedOut" | "signedIn";

interface AdminAuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAdmin: boolean;
  services: AdminServices;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => getAdminServices(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(
    () =>
      services.auth.onAuthStateChanged((next) => {
        setUser(next);
        setStatus(next ? "signedIn" : "signedOut");
      }),
    [services],
  );

  const signIn = useCallback(async () => {
    await services.auth.signInWithGoogle();
  }, [services]);

  const signOut = useCallback(() => services.auth.signOut(), [services]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({ status, user, isAdmin: services.policy.isAdmin(user), services, signIn, signOut }),
    [status, user, services, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return context;
}

/** Shortcut for components that only need the use cases, not auth state. */
export function useAdminServices(): AdminServices {
  return useAdminAuth().services;
}
