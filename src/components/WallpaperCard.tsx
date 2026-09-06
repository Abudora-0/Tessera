"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Collection } from "@/data/collections";
import { getPalette } from "@/lib/palettes";
import { FavoriteButton } from "./FavoriteButton";
import { WallpaperCanvas } from "./WallpaperCanvas";

type Props = {
  collection: Collection;
  index?: number;
  ratio?: number;
};

export function WallpaperCard({ collection, index = 0, ratio = 16 / 10 }: Props) {
  const palette = getPalette(collection.palette);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link href={`/wallpaper/${collection.slug}`} className="focus-tile block">
        <div className="tile-hover relative overflow-hidden border border-edge">
          <WallpaperCanvas config={collection.config} ratio={ratio} rounded={false} />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55))" }} />
          <div className="pointer-events-none absolute bottom-0 left-0 flex translate-y-2 items-center gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="border border-white/20 bg-black/40 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              Open
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[0.95rem] text-ink transition-colors group-hover:text-accent">{collection.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint">
            <span
              className="inline-block h-2 w-2 rotate-45"
              style={{ background: palette.accent }}
            />
            {collection.family} / {collection.palette}
          </p>
        </div>
        <FavoriteButton
          slug={collection.slug}
          name={collection.name}
          family={collection.family}
          palette={collection.palette}
        />
      </div>
    </motion.article>
  );
}
