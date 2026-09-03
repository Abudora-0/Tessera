"use client";

import { motion } from "motion/react";
import { useStore } from "@/store/useStore";
import { useMounted } from "@/lib/useMounted";
import type { SourceWallpaper } from "@/lib/sources/types";

export function PhotoSaveButton({
  item,
  withLabel = false,
}: {
  item: SourceWallpaper;
  withLabel?: boolean;
}) {
  const mounted = useMounted();
  const stored = useStore((s) => s.savedPhotos.some((p) => p.source === item.source && p.id === item.id));
  const toggle = useStore((s) => s.toggleSavedPhoto);
  const saved = mounted && stored;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggle({
          source: item.source,
          id: item.id,
          title: item.title,
          thumbUrl: item.thumbUrl,
          color: item.color,
        });
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from shelf" : "Save to shelf"}
      className="focus-tile flex shrink-0 items-center gap-2 border border-edge bg-bg-raised px-2 py-2 transition-colors hover:border-edge-strong"
    >
      <motion.span
        animate={{ rotate: saved ? 45 : 0, backgroundColor: saved ? "var(--accent)" : "rgba(0,0,0,0)" }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="block h-3 w-3 border-2"
        style={{ borderColor: "var(--accent)" }}
      />
      {withLabel ? (
        <span className="font-mono text-[0.7rem] text-ink-soft">{saved ? "Saved" : "Save"}</span>
      ) : null}
    </button>
  );
}
