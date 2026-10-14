"use client";

import { motion } from "motion/react";
import { Logo } from "@/components/layout/logo";

/** The big hand-drawn logo, popping in with a little wobble before it starts to float. */
export function HeroLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 12 }}
      className="mx-auto w-fit"
    >
      <Logo priority sizes="176px" className="w-32 animate-float sm:w-44" />
    </motion.div>
  );
}
