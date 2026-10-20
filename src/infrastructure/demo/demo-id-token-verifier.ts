import type { IdTokenVerifier } from "@/core/auth/auth";
import { DEMO_ADMIN, DEMO_ID_TOKEN } from "./demo-auth-gateway";

/** Accepts the fake demo sign-in. Wired up only in local development without Firebase. */
export class DemoIdTokenVerifier implements IdTokenVerifier {
  async verify(idToken: string) {
    return idToken === DEMO_ID_TOKEN ? { email: DEMO_ADMIN.email!, emailVerified: true } : null;
  }
}
