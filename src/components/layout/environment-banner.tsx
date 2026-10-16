import { FlaskConical, Sparkles } from "lucide-react";
import { getDataEnvironment } from "@/composition/data-environment";
import { interpolate } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";

/** Tells visitors when they're on a demo or test copy of the site (never shown on live). */
export async function EnvironmentBanner() {
  const environment = getDataEnvironment();
  if (environment.kind === "live") return null;

  const { dict } = await getDictionary();
  const isDemo = environment.kind === "demo";
  const Icon = isDemo ? Sparkles : FlaskConical;
  const message = isDemo
    ? dict.environment.siteDemo
    : interpolate(dict.environment.siteSandbox, { env: environment.appEnv });

  return (
    <div className="flex justify-center bg-blush px-4 pb-8">
      <p className="flex items-center gap-2 rounded-full bg-ocean px-4 py-2 text-xs font-semibold text-cream">
        <Icon className="size-4 shrink-0 text-rose" aria-hidden />
        {message}
      </p>
    </div>
  );
}
