"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
};

/**
 * A custom listbox. Native selects cannot carry the mosaic styling or the
 * staggered tile reveal, so this is built from scratch with full keyboard
 * support (arrows, home, end, enter, escape, type ahead is intentionally
 * left out to keep it lightweight).
 */
export function ThemedSelect({ label, value, options, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value) ?? options[0];

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const commit = (index: number) => {
    const option = options[index];
    if (option) {
      onChange(option.value);
      setOpen(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(active);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <span className="mb-1.5 block font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className="focus-tile clip-tile flex w-full items-center justify-between gap-3 border border-edge bg-bg-raised px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:border-edge-strong"
      >
        <span className="truncate">{selected?.label}</span>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-accent"
        >
          <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, y: -6, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="tile-surface absolute z-40 mt-1.5 max-h-64 w-full overflow-auto p-1"
          >
            {options.map((option, index) => {
              const isActive = index === active;
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => commit(index)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors"
                    style={{
                      background: isActive ? "var(--bg-sunken)" : "transparent",
                      color: isSelected ? "var(--accent)" : "var(--ink)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rotate-45"
                        style={{
                          background: isSelected ? "var(--accent)" : "var(--edge-strong)",
                        }}
                      />
                      {option.label}
                    </span>
                    {option.hint ? (
                      <span className="font-mono text-[0.65rem] text-ink-faint">{option.hint}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
