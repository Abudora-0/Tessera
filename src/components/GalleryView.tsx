"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ThemedSelect } from "./ThemedSelect";
import { TesseraCounter } from "./TesseraCounter";
import { WallpaperCard } from "./WallpaperCard";
import { Reveal } from "./Motion";
import { ALL_TAGS, COLLECTIONS, type Collection } from "@/data/collections";
import { GENERATORS } from "@/lib/generators/families";
import { PALETTES } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";
import { configFromSlug } from "@/lib/render";
import { useStore } from "@/store/useStore";

const SORTS = [
  { value: "curated", label: "Curated order" },
  { value: "name", label: "Name A to Z" },
  { value: "family", label: "By family" },
];

function shelfToCollection(entry: {
  slug: string;
  name: string;
  family: string;
  palette: string;
}): Collection {
  const config = configFromSlug(entry.slug) ?? {
    family: entry.family,
    palette: entry.palette,
    seed: 1,
    params: { ...DEFAULT_PARAMS },
  };
  return {
    slug: entry.slug,
    name: entry.name,
    family: config.family,
    palette: config.palette,
    seed: config.seed,
    params: config.params,
    tags: [],
    featured: false,
    config,
  };
}

export function GalleryView() {
  const params = useSearchParams();
  const isShelf = params.get("view") === "shelf";
  const favorites = useStore((state) => state.favorites);
  const hydrated = useStore((state) => state.hydrated);
  const clearFavorites = useStore((state) => state.clearFavorites);

  const [family, setFamily] = useState(params.get("f") ?? "all");
  const [palette, setPalette] = useState(params.get("p") ?? "all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("curated");

  const familyOptions = [
    { value: "all", label: "All families" },
    ...GENERATORS.map((g) => ({ value: g.id, label: g.name })),
  ];
  const paletteOptions = [
    { value: "all", label: "All palettes" },
    ...PALETTES.map((p) => ({ value: p.id, label: p.name, hint: p.mood.split(" ").slice(0, 2).join(" ") })),
  ];
  const tagOptions = [
    { value: "all", label: "Any mood" },
    ...ALL_TAGS.map((t) => ({ value: t, label: t })),
  ];

  const items = useMemo(() => {
    if (isShelf) {
      return favorites.map(shelfToCollection);
    }
    let list = [...COLLECTIONS];
    if (family !== "all") list = list.filter((c) => c.family === family);
    if (palette !== "all") list = list.filter((c) => c.palette === palette);
    if (tag !== "all") list = list.filter((c) => c.tags.includes(tag));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "family") list.sort((a, b) => a.family.localeCompare(b.family));
    return list;
  }, [isShelf, favorites, family, palette, tag, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ink-faint">
            {isShelf ? "Saved locally" : "Curated starting points"}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {isShelf ? "Your shelf" : "Gallery"}
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-soft">
            {isShelf
              ? "Wallpapers you saved. They live in this browser only, nothing leaves your device."
              : "Every tile is a live render. Open one to export it at your resolution or send it to the studio."}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-sm text-ink-soft">
          <span className="text-2xl text-ink">
            <TesseraCounter value={items.length} />
          </span>
          <span>{items.length === 1 ? "piece" : "pieces"}</span>
        </div>
      </div>

      {isShelf ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/gallery"
            className="focus-tile border border-edge bg-bg-raised px-4 py-2 text-sm text-ink-soft hover:border-edge-strong hover:text-ink"
          >
            Back to the full gallery
          </Link>
          {favorites.length > 0 ? (
            <button
              type="button"
              onClick={clearFavorites}
              className="focus-tile border border-edge px-4 py-2 text-sm text-ink-faint hover:border-accent hover:text-ink"
            >
              Clear shelf
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 border-y border-edge py-6 sm:grid-cols-2 lg:grid-cols-4">
          <ThemedSelect label="Family" value={family} options={familyOptions} onChange={setFamily} />
          <ThemedSelect label="Palette" value={palette} options={paletteOptions} onChange={setPalette} />
          <ThemedSelect label="Mood" value={tag} options={tagOptions} onChange={setTag} />
          <ThemedSelect label="Sort" value={sort} options={SORTS} onChange={setSort} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-16 border border-dashed border-edge-strong py-20 text-center">
          <p className="font-display text-xl text-ink">
            {isShelf && !hydrated ? "Reading your shelf" : "Nothing here yet"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            {isShelf
              ? "Save a wallpaper from the gallery or the studio and it will show up on your shelf."
              : "Loosen the filters to see more pieces."}
          </p>
          <Link
            href={isShelf ? "/gallery" : "/studio"}
            className="mt-6 inline-block border-b border-accent pb-1 text-sm text-ink hover:text-accent"
          >
            {isShelf ? "Open the gallery" : "Design one in the studio"}
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((collection, index) => (
            <WallpaperCard key={collection.slug} collection={collection} index={index} />
          ))}
        </div>
      )}

      {!isShelf ? (
        <Reveal>
          <div className="mt-14 sm:mt-20 border border-edge bg-bg-sunken p-8 text-center">
            <h2 className="font-display text-2xl text-ink">Not seeing it here?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              The gallery is only a set of presets. The studio can make anything
              the engine is capable of.
            </p>
            <Link
              href="/studio"
              className="btn-primary focus-tile clip-tile mt-6 inline-block px-6 py-3 text-sm font-medium"
            >
              Open the studio
            </Link>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
