import type { AuthGateway, AuthUser, Unsubscribe } from "@/core/auth/auth";

export const DEMO_ADMIN: AuthUser = {
  uid: "demo-admin",
  email: "demo@earthside.local",
  displayName: "Della (Demo)",
  photoUrl: null,
};

/** Fake sign-in for local previews of the dashboard before Firebase is set up. */
export class DemoAuthGateway implements AuthGateway {
  private user: AuthUser | null = null;
  private readonly listeners = new Set<(user: AuthUser | null) => void>();

  async signInWithGoogle(): Promise<AuthUser> {
    this.setUser(DEMO_ADMIN);
    return DEMO_ADMIN;
  }

  async signOut(): Promise<void> {
    this.setUser(null);
  }

  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.user);
    return () => this.listeners.delete(listener);
  }

  private setUser(user: AuthUser | null) {
    this.user = user;
    this.listeners.forEach((listener) => listener(user));
  }
}
