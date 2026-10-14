import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** e.g. "120 / 1000" */
  counter?: string;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}

/** Label + control + hint/error, wired up for screen readers. */
export function FormField({
  id,
  label,
  error,
  hint,
  counter,
  className,
  children,
}: FormFieldProps) {
  const messageId = error || hint ? `${id}-message` : undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-forest">
          {label}
        </label>
        {counter && <span className="text-xs text-ink/50 tabular-nums">{counter}</span>}
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": messageId })}
      {(error || hint) && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn("mt-1.5 text-sm", error ? "font-semibold text-rose-deep" : "text-ink/55")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "w-full rounded-2xl border-2 border-forest/10 bg-white/80 px-4 py-3 text-ink placeholder:text-ink/35 " +
  "transition focus:border-moss focus:bg-white focus:outline-none aria-[invalid=true]:border-rose-deep";
