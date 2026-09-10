"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

/**
 * A gentle rise into view. Only translates, never fades: if the animation frame
 * is paused (backgrounded tab, heavy main thread) the worst case is a section
 * sitting a few pixels low, never content stuck invisible.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A button that leans toward the cursor, then springs back. */
export function MagneticButton({
  children,
  className,
  onClick,
  as = "button",
  href,
  strength = 0.35,
  type,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  strength?: number;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event: React.MouseEvent) => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setOffset({
      x: (event.clientX - (rect.left + rect.width / 2)) * strength,
      y: (event.clientY - (rect.top + rect.height / 2)) * strength,
    });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  const MotionTag = as === "a" ? motion.a : motion.button;

  return (
    <MotionTag
      ref={ref as never}
      href={href}
      type={as === "button" ? type ?? "button" : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
