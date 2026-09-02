"use client";

import { motion } from "motion/react";
import { useStore } from "@/store/useStore";

/** A tile that flips between a filled and hollow state as the theme changes. */
export function ThemeToggle() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="focus-tile group relative grid h-9 w-9 place-items-center border border-edge bg-bg-raised transition-colors hover:border-edge-strong"
    >
      <motion.span
        className="block h-3.5 w-3.5"
        animate={{
          rotate: isDark ? 45 : 225,
          backgroundColor: isDark ? "var(--accent)" : "rgba(0,0,0,0)",
          borderColor: "var(--accent)",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        style={{ borderWidth: 2 }}
      />
    </button>
  );
}
