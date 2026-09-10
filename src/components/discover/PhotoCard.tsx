"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import type { SourceWallpaper } from "@/lib/sources/types";
import { AttributionLine } from "./AttributionLine";
import { PhotoSaveButton } from "./PhotoSaveButton";

export function PhotoCard({ item, index = 0 }: { item: SourceWallpaper; index?: number }) {
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);
  const blurred = item.nsfw && !revealed;

  return (
    <motion.article
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-4%" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.02, 0.16), ease: [0.16, 1, 0.3, 1] }}
      className="group relative min-w-0"
    >
      <Link
        href={`/discover/${item.source}/${encodeURIComponent(item.id)}`}
        className="focus-tile block"
      >
        <div
          className="tile-hover relative aspect-[4/3] overflow-hidden border border-edge"
          style={{ background: item.color }}
        >
          {!failed ? (
            <Image
              src={item.thumbUrl}
              alt={item.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ filter: blurred ? "blur(26px)" : "none" }}
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center font-mono text-[0.6rem] uppercase tracking-widest text-ink-faint">
              image unavailable
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <span className="absolute left-2 top-2 border border-white/20 bg-black/45 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/85 backdrop-blur">
            {item.source}
          </span>

          {blurred ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setRevealed(true);
              }}
              className="absolute inset-0 grid place-items-center bg-black/30 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/90"
            >
              Tap to reveal
            </button>
          ) : null}
        </div>
      </Link>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm text-ink">{item.title}</h3>
          <div className="mt-0.5">
            <AttributionLine item={item} />
          </div>
        </div>
        <PhotoSaveButton item={item} />
      </div>
    </motion.article>
  );
}
