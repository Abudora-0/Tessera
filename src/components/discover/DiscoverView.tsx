"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemedSelect } from "@/components/ThemedSelect";
import { TesseraCounter } from "@/components/TesseraCounter";
import { Reveal } from "@/components/Motion";
import { useStore } from "@/store/useStore";
import { useMounted } from "@/lib/useMounted";
import { SUBREDDIT_GROUPS, REDDIT_TIMES } from "@/lib/sources/subreddits";
import type { SourceInfo } from "@/lib/sources";
import type { SourceWallpaper } from "@/lib/sources/types";
import { SourceTabs } from "./SourceTabs";
import { NsfwToggle } from "./NsfwToggle";
import { PhotoCard } from "./PhotoCard";

type ApiResponse = {
  items: SourceWallpaper[];
  nextPage: string | null;
  configured: boolean;
  sources: SourceInfo[];
};

const ORIENTATIONS = [
  { value: "any", label: "Any shape" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
];

const SORTS = [
  { value: "relevant", label: "Most relevant" },
  { value: "new", label: "Newest" },
  { value: "top", label: "Top" },
  { value: "hot", label: "Hot" },
  { value: "random", label: "Random" },
];

function buildQuery(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "any" && value !== "all" && value !== "relevant") usp.set(key, value);
  }
  return usp.toString();
}

export function DiscoverView() {
  const router = useRouter();
  const params = useSearchParams();
  const mounted = useMounted();

  const nsfwEnabled = useStore((s) => s.nsfwEnabled);
  const setNsfwEnabled = useStore((s) => s.setNsfwEnabled);
  const savedPhotos = useStore((s) => s.savedPhotos);
  const clearSavedPhotos = useStore((s) => s.clearSavedPhotos);

  const isSaved = params.get("view") === "saved";
  const [source, setSource] = useState(params.get("source") || "all");
  const [category, setCategory] = useState(params.get("category") || "");
  const [orientation, setOrientation] = useState(params.get("orientation") || "any");
  const [sort, setSort] = useState(params.get("sort") || "relevant");
  const [time, setTime] = useState(params.get("time") || "week");
  const [queryInput, setQueryInput] = useState(params.get("q") || "");
  const [query, setQuery] = useState(params.get("q") || "");

  const [items, setItems] = useState<SourceWallpaper[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const requestId = useRef(0);

  const activeSource = sources.find((s) => s.id === source);
  const showNsfwToggle = source === "reddit" || source === "wallhaven" || source === "all";
  const showRedditControls = source === "reddit";

  const fetchPage = useCallback(
    async (pageCursor: string | null, replace: boolean) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams({
        source,
        nsfw: nsfwEnabled ? "1" : "0",
      });
      if (query) qs.set("q", query);
      if (category) qs.set("category", category);
      if (orientation !== "any") qs.set("orientation", orientation);
      if (sort !== "relevant") qs.set("sort", sort);
      if (showRedditControls) qs.set("time", time);
      if (pageCursor) qs.set("page", pageCursor);

      try {
        const res = await fetch(`/api/discover?${qs.toString()}`);
        const data = (await res.json()) as ApiResponse;
        if (id !== requestId.current) return;
        setSources(data.sources ?? []);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setCursor(data.nextPage);
        if (replace && data.items.length === 0 && !data.configured) {
          setError("This source has no API key configured yet.");
        }
      } catch {
        if (id === requestId.current) setError("Could not reach that source. Try again.");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [source, query, category, orientation, sort, time, nsfwEnabled, showRedditControls],
  );

  useEffect(() => {
    if (isSaved) return;
    // fetch the first page whenever the query shape changes; the loading flag it
    // sets is exactly the external sync this effect exists for
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(null, true);
  }, [isSaved, fetchPage]);

  // keep the URL shareable
  useEffect(() => {
    if (isSaved) return;
    const handle = window.setTimeout(() => {
      const qs = buildQuery({ source, q: query, category, orientation, sort, time: showRedditControls ? time : undefined });
      router.replace(qs ? `/discover?${qs}` : "/discover", { scroll: false });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [source, query, category, orientation, sort, time, showRedditControls, isSaved, router]);

  // infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSaved || !cursor || loading) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchPage(cursor, false);
      },
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, loading, isSaved, fetchPage]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...SUBREDDIT_GROUPS.map((g) => ({ value: g.id, label: g.label })),
    ],
    [],
  );

  const savedList = mounted ? savedPhotos : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ink-faint">
            {isSaved ? "Saved locally" : "Wallpapers from around the web"}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {isSaved ? "Saved photos" : "Discover"}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-ink-soft">
            {isSaved
              ? "Photos you saved. They live in this browser only."
              : "Live results from Unsplash, Pexels, Pixabay, Wallhaven, NASA and Reddit. Every image belongs to its author under that source's licence."}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-sm text-ink-soft">
          <span className="text-2xl text-ink">
            <TesseraCounter value={isSaved ? savedList.length : items.length} />
          </span>
          <span>{(isSaved ? savedList.length : items.length) === 1 ? "result" : "results"}</span>
        </div>
      </div>

      {isSaved ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/discover" className="focus-tile border border-edge bg-bg-raised px-4 py-2 text-sm text-ink-soft hover:border-edge-strong hover:text-ink">
            Back to Discover
          </Link>
          {savedList.length > 0 ? (
            <button type="button" onClick={clearSavedPhotos} className="focus-tile border border-edge px-4 py-2 text-sm text-ink-faint hover:border-accent hover:text-ink">
              Clear saved
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 space-y-5 border-y border-edge py-6">
          <SourceTabs sources={sources} active={source} onChange={(id) => { setSource(id); setCategory(""); }} />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(queryInput.trim());
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder={source === "reddit" ? "Search the selected subreddits" : "Search wallpapers, e.g. mountains, city night"}
              className="focus-tile min-w-0 flex-1 border border-edge bg-bg-raised px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button type="submit" className="btn-primary focus-tile clip-tile px-5 py-2.5 text-sm font-medium">
              Search
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ThemedSelect label="Shape" value={orientation} options={ORIENTATIONS} onChange={setOrientation} />
            <ThemedSelect label="Sort" value={sort} options={SORTS} onChange={setSort} />
            {showRedditControls ? (
              <>
                <ThemedSelect label="Subreddits" value={category} options={categoryOptions} onChange={setCategory} />
                <ThemedSelect label="Time" value={time} options={REDDIT_TIMES} onChange={setTime} />
              </>
            ) : null}
          </div>

          {showNsfwToggle ? (
            <div className="flex flex-wrap items-center gap-3">
              <NsfwToggle value={nsfwEnabled} onChange={setNsfwEnabled} />
              <span className="font-mono text-[0.62rem] text-ink-faint">
                Off by default. Affects Reddit and Wallhaven only.
              </span>
            </div>
          ) : null}

          {activeSource ? (
            <p className="font-mono text-[0.66rem] text-ink-faint">
              {activeSource.blurb}. Licence:{" "}
              <a href={activeSource.license.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                {activeSource.license.name}
              </a>
              .
            </p>
          ) : null}
        </div>
      )}

      {/* saved grid */}
      {isSaved ? (
        savedList.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Open a wallpaper in Discover and hit save. It shows up here."
            ctaHref="/discover"
            ctaLabel="Open Discover"
          />
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedList.map((photo) => (
              <Link
                key={`${photo.source}-${photo.id}`}
                href={`/discover/${photo.source}/${encodeURIComponent(photo.id)}`}
                className="focus-tile group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden border border-edge transition-colors group-hover:border-edge-strong" style={{ background: photo.color }}>
                  <Image src={photo.thumbUrl} alt={photo.title} fill unoptimized sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-2 top-2 border border-white/20 bg-black/45 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/85 backdrop-blur">
                    {photo.source}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-sm text-ink">{photo.title}</h3>
              </Link>
            ))}
          </div>
        )
      ) : (
        <>
          {error && items.length === 0 ? (
            <EmptyState
              title="Nothing to show"
              body={error}
              ctaHref="/discover"
              ctaLabel="Back to All sources"
            />
          ) : null}

          {items.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <PhotoCard key={`${item.source}-${item.id}-${index}`} item={item} index={index} />
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] border border-edge shimmer opacity-30" />
              ))}
            </div>
          ) : null}

          <div ref={sentinelRef} className="h-10" />

          {!cursor && items.length > 0 && !loading ? (
            <p className="mt-10 text-center font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-faint">
              End of results
            </p>
          ) : null}
        </>
      )}

      <Reveal>
        <div className="mt-14 sm:mt-20 border border-edge bg-bg-sunken p-8 text-center">
          <h2 className="font-display text-2xl text-ink">Want something truly one of a kind?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            The Studio draws wallpapers from scratch. No two seeds look the same.
          </p>
          <Link href="/studio" className="btn-primary focus-tile clip-tile mt-6 inline-block px-6 py-3 text-sm font-medium">
            Open the Studio
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mt-16 border border-dashed border-edge-strong py-20 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{body}</p>
      <Link href={ctaHref} className="mt-6 inline-block border-b border-accent pb-1 text-sm text-ink hover:text-accent">
        {ctaLabel}
      </Link>
    </div>
  );
}
