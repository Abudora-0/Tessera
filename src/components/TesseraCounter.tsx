"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type Props = {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

/**
 * A count up display where each digit column slides like a tile rack settling
 * into place. Starts when it scrolls into view and honours reduced motion.
 */
export function TesseraCounter({ value, duration = 1.4, suffix = "", prefix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduce ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  const digits = current.toLocaleString("en-US").split("");

  return (
    <span
      ref={ref}
      className={`inline-flex items-baseline font-display tabular-nums ${className ?? ""}`}
      aria-label={`${prefix}${value.toLocaleString("en-US")}${suffix}`}
    >
      {prefix ? <span aria-hidden>{prefix}</span> : null}
      <span aria-hidden className="inline-flex overflow-hidden">
        {digits.map((digit, index) => (
          <span
            key={`${digits.length}-${index}`}
            className="inline-block"
            style={{ animation: reduce ? undefined : "tessera-float 0.45s ease" }}
          >
            {digit}
          </span>
        ))}
      </span>
      {suffix ? <span aria-hidden>{suffix}</span> : null}
    </span>
  );
}
