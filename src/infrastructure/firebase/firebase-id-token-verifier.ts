import type { IdTokenVerifier } from "@/core/auth/auth";

interface LookupResponse {
  users?: { email?: string; emailVerified?: boolean }[];
}

/**
 * Verifies a Firebase ID token by asking Firebase Auth who it belongs to. Uses
 * the public web API key, so no service-account credentials are needed.
 */
export class FirebaseIdTokenVerifier implements IdTokenVerifier {
  constructor(private readonly apiKey: string) {}

  async verify(idToken: string) {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!response.ok) return null;

    const user = ((await response.json()) as LookupResponse).users?.[0];
    return user?.email ? { email: user.email, emailVerified: Boolean(user.emailVerified) } : null;
  }
}
