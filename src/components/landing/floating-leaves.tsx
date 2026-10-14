import { cn } from "@/lib/cn";

/** Fixed positions/timings (not random) so server and client render identically. */
const LEAVES = [
  { left: "4%", delay: "0s", duration: "19s", size: 26, color: "text-moss" },
  { left: "18%", delay: "6s", duration: "23s", size: 18, color: "text-rose" },
  { left: "33%", delay: "11s", duration: "21s", size: 22, color: "text-leaf" },
  { left: "52%", delay: "3s", duration: "25s", size: 16, color: "text-moss" },
  { left: "68%", delay: "9s", duration: "20s", size: 24, color: "text-rose" },
  { left: "82%", delay: "14s", duration: "24s", size: 20, color: "text-leaf" },
  { left: "92%", delay: "5s", duration: "22s", size: 14, color: "text-moss" },
];

export function Leaf({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path
        d="M4 20 C 4 10, 10 4, 20 4 C 20 14, 14 20, 4 20 Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path d="M4 20 L 14 10" stroke="#f7f4d5" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Leaves drifting down the hero, purely decorative. */
export function FloatingLeaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {LEAVES.map((leaf) => (
        <span
          key={leaf.left}
          className={cn("absolute -top-10 animate-leaf-fall", leaf.color)}
          style={{ left: leaf.left, animationDelay: leaf.delay, animationDuration: leaf.duration }}
        >
          <Leaf size={leaf.size} />
        </span>
      ))}
    </div>
  );
}
