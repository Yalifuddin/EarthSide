"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A thin bar across the top that fills as the reader scrolls through the article. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-1.5 origin-left bg-gradient-to-r from-moss via-rose to-ocean"
    />
  );
}
