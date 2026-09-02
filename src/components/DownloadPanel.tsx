"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemedSelect } from "./ThemedSelect";
import { FavoriteButton } from "./FavoriteButton";
import { DEVICE_GROUPS, clampDimension, type DeviceKind } from "@/lib/devices";
import { configToQuery, downloadWallpaper, type WallpaperConfig } from "@/lib/render";

type Props = {
  config: WallpaperConfig;
  name: string;
  slug: string;
};

export function DownloadPanel({ config, name, slug }: Props) {
  const [kind, setKind] = useState<DeviceKind>("desktop");
  const [resId, setResId] = useState("fhd");
  const [custom, setCustom] = useState({ w: 1920, h: 1080 });
  const [rendering, setRendering] = useState(false);

  const group = DEVICE_GROUPS.find((entry) => entry.kind === kind) ?? DEVICE_GROUPS[0];
  const resolution =
    resId === "custom"
      ? { width: clampDimension(custom.w), height: clampDimension(custom.h) }
      : group.resolutions.find((entry) => entry.id === resId) ?? group.resolutions[0];

  const options = [
    ...group.resolutions.map((entry) => ({
      value: entry.id,
      label: entry.label,
      hint: entry.note,
    })),
    { value: "custom", label: "Custom size", hint: "type it" },
  ];

  const run = async () => {
    setRendering(true);
    try {
      await downloadWallpaper(config, resolution.width, resolution.height);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="tile-surface p-6">
      <h2 className="font-display text-lg text-ink">Export</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Choose a target screen. The image is drawn fresh at that size.
      </p>

      <div className="mt-5 flex gap-1.5">
        {DEVICE_GROUPS.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            onClick={() => {
              setKind(entry.kind);
              setResId(entry.resolutions[0].id);
            }}
            className="focus-tile flex-1 border px-3 py-2 text-sm capitalize transition-colors"
            style={{
              borderColor: kind === entry.kind ? "var(--accent)" : "var(--edge)",
              color: kind === entry.kind ? "var(--accent)" : "var(--ink-soft)",
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ThemedSelect label="Resolution" value={resId} options={options} onChange={setResId} />
      </div>

      {resId === "custom" ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            type="number"
            value={custom.w}
            onChange={(event) => setCustom((c) => ({ ...c, w: Number(event.target.value) || 0 }))}
            className="focus-tile w-full border border-edge bg-bg-raised px-3 py-2 font-mono text-sm text-ink"
            aria-label="Custom width"
          />
          <input
            type="number"
            value={custom.h}
            onChange={(event) => setCustom((c) => ({ ...c, h: Number(event.target.value) || 0 }))}
            className="focus-tile w-full border border-edge bg-bg-raised px-3 py-2 font-mono text-sm text-ink"
            aria-label="Custom height"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={run}
        disabled={rendering}
        className="focus-tile clip-tile mt-5 flex w-full items-center justify-center gap-2 bg-accent px-5 py-3.5 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {rendering
          ? `Rendering ${resolution.width} by ${resolution.height}`
          : `Download PNG, ${resolution.width} by ${resolution.height}`}
      </button>

      <div className="mt-3 flex gap-2">
        <FavoriteButton
          slug={slug}
          name={name}
          family={config.family}
          palette={config.palette}
          withLabel
        />
        <Link
          href={`/studio?${configToQuery(config)}`}
          className="focus-tile flex flex-1 items-center justify-center border border-edge bg-bg-raised px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-ink"
        >
          Remix in studio
        </Link>
      </div>
    </div>
  );
}
