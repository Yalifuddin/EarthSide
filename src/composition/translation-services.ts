import "server-only";
import { env } from "@/config/env";
import { serverEnv } from "@/config/server-env";
import { AdminPolicy, type IdTokenVerifier } from "@/core/auth/auth";
import { ArticleTranslationService, type Translator } from "@/core/translation/translator";
import { DeepLTranslator } from "@/infrastructure/deepl/deepl-translator";
import { DEMO_ADMIN } from "@/infrastructure/demo/demo-auth-gateway";
import { DemoIdTokenVerifier } from "@/infrastructure/demo/demo-id-token-verifier";
import { PseudoTranslator } from "@/infrastructure/demo/pseudo-translator";
import { FirebaseIdTokenVerifier } from "@/infrastructure/firebase/firebase-id-token-verifier";
import { isDemoMode } from "./repositories";

/**
 * Server-side wiring for article translation: which translator to use and how
 * to make sure only dashboard admins can spend the translation quota.
 */
const isLocalDemo = isDemoMode && process.env.NODE_ENV === "development";

function createTranslator(): Translator | null {
  if (serverEnv.deeplApiKey) return new DeepLTranslator(serverEnv.deeplApiKey);
  return isLocalDemo ? new PseudoTranslator() : null;
}

function createVerifier(): IdTokenVerifier | null {
  if (isLocalDemo) return new DemoIdTokenVerifier();
  return env.isFirebaseConfigured ? new FirebaseIdTokenVerifier(env.firebase.apiKey) : null;
}

const verifier = createVerifier();
const admins = new AdminPolicy(isDemoMode ? [DEMO_ADMIN.email!] : env.adminEmails);

export const translationServices = {
  translation: new ArticleTranslationService(createTranslator()),

  /** True only for a valid, verified token of an allow-listed admin. */
  async isAdminToken(idToken: string | null): Promise<boolean> {
    if (!idToken || !verifier) return false;
    const identity = await verifier.verify(idToken);
    return Boolean(identity?.emailVerified && admins.isAdmin({ email: identity.email }));
  },
};
