"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A light transition on every route change. template.tsx remounts on navigation,
 * so this fades and lifts each page in. Honours reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
