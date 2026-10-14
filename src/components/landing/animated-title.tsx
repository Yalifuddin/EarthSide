"use client";

import { motion } from "motion/react";

/** Drops each letter into place one after another. */
export function AnimatedTitle({ text, className }: { text: string; className?: string }) {
  return (
    <h1 className={className} aria-label={text}>
      {[...text].map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: 40, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.15 + index * 0.05, type: "spring", stiffness: 260, damping: 18 }}
        >
          {letter}
        </motion.span>
      ))}
    </h1>
  );
}
