"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

/**
 * A count up display where each digit column slides like a tile rack settling
 * into place. Re-animates whenever the target value changes, and stays correct
 * when the tab is backgrounded or reduced motion is on.
 */
export function TesseraCounter({ value, suffix = "", prefix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    const from = shown.current;
    const to = value;
    if (from === to) return;

    const snap = () => {
      shown.current = to;
      setCurrent(to);
    };
    const skip = reduce || (typeof document !== "undefined" && document.hidden);
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (to - from) * eased);
      shown.current = next;
      setCurrent(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    if (!skip) raf = requestAnimationFrame(tick);
    // setTimeout still fires when rAF is paused (backgrounded tab)
    const fallback = window.setTimeout(snap, skip ? 0 : duration + 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [value, reduce]);

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
