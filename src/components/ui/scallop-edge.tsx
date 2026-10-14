import { cn } from "@/lib/cn";

/**
 * A row of half-circles (like the lace trim on the moodboard) that lets a
 * section "bite" into the one above it. `color` is a CSS color value.
 */
export function ScallopEdge({ color, className }: { color: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-6 w-full bg-repeat-x", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 100%, ${color} 70%, transparent 71%)`,
        backgroundSize: "48px 24px",
        backgroundPosition: "center bottom",
      }}
    />
  );
}
