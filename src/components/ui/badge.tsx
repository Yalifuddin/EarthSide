import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "moss" | "ocean" | "rose" | "cream" | "muted";

const tones: Record<Tone, string> = {
  moss: "bg-moss/20 text-leaf",
  ocean: "bg-ocean/12 text-ocean",
  rose: "bg-rose-soft text-rose-deep",
  cream: "bg-cream/90 text-forest",
  muted: "bg-ink/8 text-ink/70",
};

export function Badge({
  tone = "moss",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
