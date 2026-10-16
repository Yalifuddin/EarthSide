import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContactTileProps {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  /** The address/handle itself, usually a link. */
  value: ReactNode;
  hint?: string;
  /** Buttons along the bottom of the card. */
  children: ReactNode;
}

/** One way to reach EarthSide (email, Instagram, …), laid out as a matching card. */
export function ContactTile({
  icon,
  iconClassName,
  label,
  value,
  hint,
  children,
}: ContactTileProps) {
  return (
    <div className="flex h-full flex-col items-center rounded-[2.5rem] bg-white/70 p-8 text-center shadow-[0_30px_60px_-40px_rgb(10_51_35/0.7)] ring-1 ring-forest/5 sm:p-10">
      <div
        className={cn(
          "grid size-20 place-items-center rounded-[1.75rem] transition-transform duration-500 hover:-rotate-6",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <p className="mt-6 text-xs font-extrabold tracking-[0.25em] text-ink/50 uppercase">{label}</p>
      <div className="mt-2 font-display text-2xl break-words text-forest">{value}</div>
      {hint && <p className="mt-2 text-sm text-ink/60">{hint}</p>}
      <div className="mt-auto flex w-full flex-col justify-center gap-3 pt-8 sm:flex-row sm:flex-wrap">
        {children}
      </div>
    </div>
  );
}
