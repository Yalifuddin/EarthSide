/**
 * Typed access to environment variables.
 *
 * `NEXT_PUBLIC_*` variables must be referenced literally so Next.js can inline
 * them into the client bundle — do not refactor these into dynamic lookups.
 */

import { siteConfig } from "./site";

export type ImageProvider = "cloudinary" | "firebase";

/**
 * Which deployment this is. Each one should point at its own Firebase project:
 * `development` (local) and `preview` use the dev project, `production` the live one.
 */
const APP_ENVS = ["development", "preview", "production"] as const;
export type AppEnv = (typeof APP_ENVS)[number];

const firebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

function parseEmailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function resolveAdminEmails(raw: string | undefined): string[] {
  const configured = parseEmailList(raw);
  return configured.length ? configured : [...siteConfig.defaultAdminEmails];
}

function parseAppEnv(raw: string | undefined): AppEnv {
  if (APP_ENVS.includes(raw as AppEnv)) return raw as AppEnv;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function parseImageProvider(raw: string | undefined): ImageProvider {
  return raw === "firebase" ? "firebase" : "cloudinary";
}

export const env = {
  appEnv: parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV),
  firebase,
  isFirebaseConfigured: Boolean(
    firebase.apiKey && firebase.authDomain && firebase.projectId && firebase.appId,
  ),
  adminEmails: resolveAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
  imageProvider: parseImageProvider(process.env.NEXT_PUBLIC_IMAGE_PROVIDER),
  /** Cloudflare Turnstile site key (public); pair it with TURNSTILE_SECRET_KEY. */
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
  },
} as const;
