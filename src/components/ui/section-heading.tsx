import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  id,
}: SectionHeadingProps) {
  const isLight = tone === "light";
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("font-hand text-2xl", isLight ? "text-rose" : "text-rose-deep")}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-1 font-display text-4xl text-balance sm:text-5xl",
          isLight ? "text-cream" : "text-forest",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-lg", isLight ? "text-cream/80" : "text-ink/70")}>{subtitle}</p>
      )}
    </Reveal>
  );
}
