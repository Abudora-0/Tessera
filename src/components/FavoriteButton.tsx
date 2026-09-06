"use client";

import { motion } from "motion/react";
import { useStore } from "@/store/useStore";
import { useMounted } from "@/lib/useMounted";

type Props = {
  slug: string;
  name: string;
  family: string;
  palette: string;
  withLabel?: boolean;
};

/** Adds or removes a wallpaper from the local shelf, no account needed. */
export function FavoriteButton({ slug, name, family, palette, withLabel = false }: Props) {
  const stored = useStore((state) => state.favorites.some((entry) => entry.slug === slug));
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const isFavorite = useMounted() && stored;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggleFavorite({ slug, name, family, palette });
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from shelf" : "Save to shelf"}
      className="pressable focus-tile flex shrink-0 items-center gap-2 border border-edge bg-bg-raised px-2 py-2 transition-colors hover:border-accent"
    >
      <motion.span
        animate={{
          rotate: isFavorite ? 45 : 0,
          scale: isFavorite ? [1, 1.45, 1] : 1,
          backgroundColor: isFavorite ? "var(--accent)" : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="block h-3 w-3 border-2"
        style={{ borderColor: "var(--accent)" }}
      />
      {withLabel ? (
        <span className="font-mono text-[0.7rem] text-ink-soft">
          {isFavorite ? "Saved" : "Save"}
        </span>
      ) : null}
    </button>
  );
}
