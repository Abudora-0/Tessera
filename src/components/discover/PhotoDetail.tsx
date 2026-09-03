"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DeviceFrame } from "@/components/DeviceFrame";
import { AttributionLine } from "./AttributionLine";
import { PhotoDownloadPanel } from "./PhotoDownloadPanel";
import { orientationOf, type SourceWallpaper } from "@/lib/sources/types";

const SOURCE_LABEL: Record<string, string> = {
  unsplash: "Unsplash",
  pexels: "Pexels",
  pixabay: "Pixabay",
  wallhaven: "Wallhaven",
  nasa: "NASA",
  reddit: "Reddit",
};

export function PhotoDetail({ item }: { item: SourceWallpaper }) {
  const [revealed, setRevealed] = useState(!item.nsfw);
  const shape = item.width && item.height ? orientationOf(item.width, item.height) : "landscape";
  const ratio = item.width && item.height ? item.width / item.height : 16 / 9;
  const kind = shape === "portrait" ? "mobile" : "desktop";

  const facts: Array<[string, string]> = [
    ["Source", SOURCE_LABEL[item.source] ?? item.source],
    ["Dimensions", item.width ? `${item.width} by ${item.height}` : "Not reported"],
    ["Shape", shape],
    ["Added", item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US") : "Unknown"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[0.7rem] text-ink-faint">
        <Link href="/discover" className="hover:text-ink">Discover</Link>
        <span>/</span>
        <Link href={`/discover?source=${item.source}`} className="hover:text-ink">
          {SOURCE_LABEL[item.source] ?? item.source}
        </Link>
        <span>/</span>
        <span className="truncate text-ink-soft">{item.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <DeviceFrame kind={kind} ratio={ratio}>
            <div className="relative h-full w-full" style={{ background: item.color }}>
              <Image
                src={item.previewUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                style={{ filter: revealed ? "none" : "blur(40px)" }}
                priority
              />
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="absolute inset-0 grid place-items-center bg-black/35 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-white/90"
                >
                  Mature content, tap to view
                </button>
              ) : null}
            </div>
          </DeviceFrame>

          <div className="mt-6">
            <h1 className="font-display text-2xl text-ink sm:text-3xl">{item.title}</h1>
            <div className="mt-3">
              <AttributionLine item={item} variant="full" />
            </div>
            {item.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="border border-edge px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-4">
            {facts.map(([term, value]) => (
              <div key={term} className="bg-bg p-4">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">{term}</dt>
                <dd className="mt-1 text-sm capitalize text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PhotoDownloadPanel item={item} />
        </div>
      </div>

      <section className="mt-24 border border-edge bg-bg-sunken p-8 text-center">
        <h2 className="font-display text-2xl text-ink">More from {SOURCE_LABEL[item.source] ?? item.source}</h2>
        <Link
          href={`/discover?source=${item.source}`}
          className="focus-tile clip-tile mt-6 inline-block bg-accent px-6 py-3 text-sm font-medium text-accent-ink"
        >
          Keep browsing
        </Link>
      </section>
    </div>
  );
}
