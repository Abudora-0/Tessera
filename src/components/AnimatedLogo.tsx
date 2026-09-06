"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

const TILES = [
  { points: "32,32 3,3 32,3", color: "var(--accent)", dx: -13, dy: -13, rot: -38 },
  { points: "32,32 61,3 61,32", color: "var(--violet)", dx: 13, dy: -13, rot: 38 },
  { points: "32,32 61,61 32,61", color: "var(--accent)", dx: 13, dy: 13, rot: -38 },
  { points: "32,32 3,61 3,32", color: "var(--ink)", dx: -13, dy: 13, rot: 38 },
];

const WORD = "tessera".split("");

/**
 * The Tessera mark. Four triangular tiles fan out from the centre on mount and
 * lock into a pinwheel square, then breathe slowly. Pointing at it snaps the
 * tiles tight. The lowercase wordmark rises in letter by letter. When the tab
 * is not visible at mount (or reduced motion is set) it renders the static
 * locked mark so it is never stuck mid animation.
 */
export function AnimatedLogo({ size = 34, withWordmark = true, className }: Props) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one time entrance gate
      setPlay(true);
    }
  }, [reduce]);

  const animated = play && !reduce;

  return (
    <span
      className={`inline-flex select-none items-center gap-2.5 ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        style={{ overflow: "visible" }}
        animate={animated ? { scale: [1, 1.015, 1] } : undefined}
        transition={animated ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "32px 32px" }}
          animate={{ scale: hovered && !reduce ? 0.9 : 1, rotate: hovered && !reduce ? -5 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          {TILES.map((tile, index) => (
            <motion.polygon
              key={index}
              points={tile.points}
              fill={tile.color}
              style={{ transformBox: "view-box", transformOrigin: "32px 32px" }}
              initial={
                animated
                  ? { x: tile.dx, y: tile.dy, rotate: tile.rot, scale: 0.35, opacity: 0 }
                  : false
              }
              animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 170,
                damping: 15,
                delay: animated ? 0.06 + index * 0.09 : 0,
              }}
            />
          ))}
        </motion.g>
      </motion.svg>

      {withWordmark ? (
        <span className="font-display text-[1.06rem] font-medium lowercase tracking-[-0.01em] text-ink">
          {WORD.map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              initial={animated ? { opacity: 0, y: 5 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: animated ? 0.42 + index * 0.045 : 0,
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
