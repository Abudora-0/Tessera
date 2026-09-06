"use client";

import { motion } from "motion/react";

/** A themed on/off tile switch. Off by default, opt in only. */
export function NsfwToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="pressable focus-tile flex shrink-0 items-center gap-2.5 border border-edge bg-bg-raised px-3 py-2 transition-colors hover:border-accent"
    >
      <span
        className="relative h-4 w-7 shrink-0 border border-edge-strong"
        style={{ background: value ? "var(--accent)" : "var(--bg-sunken)" }}
      >
        <motion.span
          className="absolute top-0.5 h-2.5 w-2.5 bg-ink"
          animate={{ left: value ? 14 : 2 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        />
      </span>
      <span className="whitespace-nowrap font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft">
        Show mature
      </span>
    </button>
  );
}
