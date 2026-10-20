export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
}

export type Unsubscribe = () => void;

/** Port for whichever identity provider signs the author in. */
export interface AuthGateway {
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe;
  /** A short-lived token proving who is signed in, for server-side checks. */
  getIdToken(): Promise<string | null>;
}

/** Server-side port: who does this ID token belong to (null if invalid/expired)? */
export interface IdTokenVerifier {
  verify(idToken: string): Promise<{ email: string; emailVerified: boolean } | null>;
}

/**
 * Decides who may manage content. This only gates the UI — the database
 * security rules are the real enforcement and must list the same emails.
 */
export class AdminPolicy {
  private readonly allowedEmails: ReadonlySet<string>;

  constructor(adminEmails: readonly string[]) {
    this.allowedEmails = new Set(adminEmails.map((email) => email.toLowerCase()));
  }

  isAdmin(user: Pick<AuthUser, "email"> | null): boolean {
    return Boolean(user?.email && this.allowedEmails.has(user.email.toLowerCase()));
  }
}
