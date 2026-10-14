import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore/lite";
import { env } from "@/config/env";

/**
 * Lazily creates (or reuses) the single Firebase app instance.
 * Firestore *Lite* is used everywhere: it is REST-based, small, works on both
 * server and client, and we never need realtime listeners.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!env.isFirebaseConfigured) {
    throw new Error("Firebase is not configured. See .env.example.");
  }
  return getApps().length ? getApp() : initializeApp(env.firebase);
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export const COLLECTIONS = {
  articles: "articles",
  topicRequests: "topicRequests",
} as const;
