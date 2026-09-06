"use client";

import { useState } from "react";
import { ThemedSelect } from "@/components/ThemedSelect";
import { PhotoSaveButton } from "./PhotoSaveButton";
import type { SourceWallpaper } from "@/lib/sources/types";

export function PhotoDownloadPanel({ item }: { item: SourceWallpaper }) {
  const options = item.resolutions.map((r, index) => ({
    value: String(index),
    label: r.label,
    hint: r.width ? `${r.width} by ${r.height}` : undefined,
  }));
  const [choice, setChoice] = useState("0");
  const selected = item.resolutions[Number(choice)] ?? item.resolutions[0];
  const downloadUrl = `/api/download?source=${item.source}&id=${encodeURIComponent(item.id)}&res=${encodeURIComponent(selected.label)}`;

  return (
    <div className="tile-surface p-6">
      <h2 className="font-display text-lg text-ink">Download</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Served straight from {item.source}. Larger sizes depend on what the source offers.
      </p>

      <div className="mt-5">
        <ThemedSelect label="Size" value={choice} options={options} onChange={setChoice} />
      </div>

      <a
        href={downloadUrl}
        className="btn-primary focus-tile clip-tile mt-5 flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium"
      >
        Download {selected.label}
      </a>

      <div className="mt-3 flex gap-2">
        <PhotoSaveButton item={item} withLabel />
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-tile flex flex-1 items-center justify-center border border-edge bg-bg-raised px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-ink"
        >
          View original
        </a>
      </div>

      {item.source === "reddit" ? (
        <p className="mt-4 font-mono text-[0.62rem] leading-relaxed text-ink-faint">
          Reddit posts are shared by users. Rights stay with the original creator.
          Check the source before reusing commercially.
        </p>
      ) : null}
    </div>
  );
}
