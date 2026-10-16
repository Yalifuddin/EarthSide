import { env } from "@/config/env";
import { isDemoMode } from "./repositories";

/**
 * Where reads and writes are going right now, so the UI can say so plainly and
 * nobody experiments on live data by accident.
 */
export type DataEnvironment =
  | { kind: "demo" }
  | { kind: "sandbox"; appEnv: "development" | "preview"; projectId: string }
  | { kind: "live"; projectId: string; fromLocalDev: boolean };

export function getDataEnvironment(): DataEnvironment {
  if (isDemoMode) return { kind: "demo" };

  const projectId = env.firebase.projectId;
  if (env.appEnv !== "production") return { kind: "sandbox", appEnv: env.appEnv, projectId };
  return { kind: "live", projectId, fromLocalDev: process.env.NODE_ENV === "development" };
}
