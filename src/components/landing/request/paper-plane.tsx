/** Hand-drawn paper plane, used in the request section and its success message. */
export function PaperPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path
        d="M6 44 L112 6 L78 84 L56 56 Z"
        className="fill-cream"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M112 6 L56 56 L52 80 L66 64"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M6 44 L56 56" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
