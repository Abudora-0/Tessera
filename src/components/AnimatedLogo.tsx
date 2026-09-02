"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

/**
 * The Tessera mark: four triangular tiles that idle in a slow pinwheel and
 * snap into a tight square when pointed at. The whole logo is drawn, so it
 * scales cleanly and animates without images.
 */
export function AnimatedLogo({ size = 34, withWordmark = true, className }: Props) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const tiles = [
    { points: "2,2 30,2 2,30", color: "var(--accent)", spin: 8, drift: { x: -3, y: -3 } },
    { points: "62,2 62,30 34,2", color: "var(--violet)", spin: -8, drift: { x: 3, y: -3 } },
    { points: "2,34 30,62 2,62", color: "var(--ink)", spin: -8, drift: { x: -3, y: 3 } },
    { points: "62,34 62,62 34,62", color: "var(--accent)", spin: 8, drift: { x: 3, y: 3 } },
  ];

  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        animate={reduce ? undefined : { rotate: hovered ? 0 : [0, 4, 0, -4, 0] }}
        transition={
          reduce
            ? undefined
            : hovered
              ? { duration: 0.5, ease: "backOut" }
              : { duration: 14, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ overflow: "visible" }}
      >
        {tiles.map((tile, index) => (
          <motion.polygon
            key={index}
            points={tile.points}
            fill={tile.color}
            initial={false}
            animate={
              reduce
                ? { x: 0, y: 0, rotate: 0 }
                : hovered
                  ? { x: 0, y: 0, rotate: 0 }
                  : { x: tile.drift.x, y: tile.drift.y, rotate: tile.spin }
            }
            transition={{
              duration: hovered ? 0.45 : 4,
              repeat: hovered || reduce ? 0 : Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: index * 0.12,
            }}
            style={{ transformOrigin: "32px 32px" }}
          />
        ))}
      </motion.svg>

      {withWordmark ? (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-ink">
          Tessera
        </span>
      ) : null}
    </span>
  );
}
