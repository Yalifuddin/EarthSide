"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";

const SHOW_AFTER_PX = 700;

/** Floating button that appears once the reader has scrolled a fair way down. */
export function BackToTop() {
  const { dict } = useI18n();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > SHOW_AFTER_PX));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={dict.nav.backToTop}
          title={dict.nav.backToTop}
          onClick={() => window.scrollTo({ top: 0 })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ y: -4 }}
          className="fixed right-4 bottom-4 z-30 grid size-12 place-items-center rounded-full bg-forest text-cream shadow-lg sm:right-6 sm:bottom-6"
        >
          <ArrowUp className="size-5" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
