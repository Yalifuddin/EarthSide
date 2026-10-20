import "server-only";
import { siteConfig } from "./site";

/**
 * Secrets that must never reach the browser. Everything here is optional:
 * missing values simply switch the related feature off.
 */
export const serverEnv = {
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.RESEND_FROM ?? "EarthSide <onboarding@resend.dev>",
    to: process.env.REQUEST_NOTIFY_EMAIL ?? siteConfig.contactEmail,
  },
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  /** DeepL API key; free-plan keys end in ":fx". Enables article translation. */
  deeplApiKey: process.env.DEEPL_API_KEY ?? "",
} as const;
