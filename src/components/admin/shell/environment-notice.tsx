"use client";

import { getDataEnvironment } from "@/composition/data-environment";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";

/**
 * A strip above the dashboard saying which database is being edited: calm for
 * demo/sandbox data, loud when a local build is pointed at the live project.
 */
export function EnvironmentNotice() {
  const { dict } = useI18n();
  const environment = getDataEnvironment();
  const t = dict.environment;

  if (environment.kind === "live" && !environment.fromLocalDev) return null;

  const message =
    environment.kind === "demo"
      ? t.adminDemo
      : environment.kind === "sandbox"
        ? interpolate(t.adminSandbox, { env: environment.appEnv, project: environment.projectId })
        : interpolate(t.adminLiveFromLocal, { project: environment.projectId });

  return (
    <p
      role={environment.kind === "live" ? "alert" : "status"}
      className={cn(
        "px-4 py-1.5 text-center text-xs font-semibold text-cream",
        environment.kind === "live" ? "bg-rose-deep" : "bg-ocean",
      )}
    >
      {message}
    </p>
  );
}
