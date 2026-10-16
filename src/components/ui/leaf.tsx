/** The little two-tone leaf used as decoration and in placeholders. */
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
