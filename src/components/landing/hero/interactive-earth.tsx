"use client";

import { motion } from "motion/react";
import { useAbout } from "@/components/about/about-context";
import { useI18n } from "@/i18n/i18n-provider";
import { HalfEarth } from "./half-earth";

/** The clickable half globe that opens "About us". */
export function InteractiveEarth() {
  const { dict } = useI18n();
  const { openAbout } = useAbout();

  return (
    <motion.div
      initial={{ opacity: 0, y: 120 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-5xl px-2"
    >
      <motion.button
        type="button"
        onClick={openAbout}
        aria-label={dict.hero.earthLabel}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.015, y: -6 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="group block w-full cursor-pointer rounded-t-full focus-visible:outline-offset-8"
      >
        <HalfEarth className="block w-full drop-shadow-[0_-20px_40px_rgb(16_86_102/0.25)]" />
      </motion.button>

      <TapHint label={dict.hero.tapHint} />
    </motion.div>
  );
}

function TapHint({ label }: { label: string }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -6 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 14 }}
      className="pointer-events-none absolute top-[2%] right-[2%] sm:top-[6%] sm:right-[6%]"
    >
      <div className="animate-float">
        <p className="rounded-2xl bg-cream px-4 py-2 font-hand text-xl text-forest shadow-md sm:text-2xl">
          {label}
        </p>
        {/* Hand-drawn arrow pointing at the globe */}
        <svg viewBox="0 0 80 60" className="ml-2 w-14 text-forest sm:w-16" fill="none">
          <path
            d="M60 4 C 50 30, 30 40, 8 48"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M8 48 L 22 40 M8 48 L 20 56"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
