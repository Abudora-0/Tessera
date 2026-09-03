import { nasa } from "./nasa";
import { pexels } from "./pexels";
import { pixabay } from "./pixabay";
import { reddit } from "./reddit";
import { unsplash } from "./unsplash";
import { wallhaven } from "./wallhaven";
import {
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceId,
  type SourceWallpaper,
} from "./types";

export const SOURCES: SourceAdapter[] = [
  unsplash,
  pexels,
  pixabay,
  wallhaven,
  nasa,
  reddit,
];

export const SOURCE_MAP: Record<SourceId, SourceAdapter> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
) as Record<SourceId, SourceAdapter>;

export function getAdapter(id: string): SourceAdapter | null {
  return SOURCE_MAP[id as SourceId] ?? null;
}

/** Lightweight descriptor for the client, no functions. */
export type SourceInfo = {
  id: SourceId;
  label: string;
  blurb: string;
  license: { name: string; url: string };
  canBeNsfw: boolean;
  configured: boolean;
};

export function sourceCatalog(): SourceInfo[] {
  return SOURCES.map((s) => ({
    id: s.id,
    label: s.label,
    blurb: s.blurb,
    license: s.license,
    canBeNsfw: s.canBeNsfw,
    configured: s.isConfigured(),
  }));
}

export async function search(
  sourceId: string,
  params: SearchParams,
): Promise<SearchResult> {
  if (sourceId === "all") return blend(params);
  const adapter = getAdapter(sourceId);
  if (!adapter) return { items: [], nextPage: null, configured: false };
  if (!adapter.isConfigured()) return { items: [], nextPage: null, configured: false };
  try {
    return await adapter.search(params);
  } catch {
    return { items: [], nextPage: null, configured: true };
  }
}

/**
 * The "All" tab. Pulls the first page from every configured source in parallel
 * and interleaves the results round robin so no single source dominates the top
 * of the grid. Deep pagination stays per source.
 */
async function blend(params: SearchParams): Promise<SearchResult> {
  const configured = SOURCES.filter((s) => s.isConfigured());
  const results = await Promise.all(
    configured.map((s) =>
      s
        .search({ ...params, page: undefined, perPage: 12 })
        .catch(() => ({ items: [] as SourceWallpaper[], nextPage: null, configured: true })),
    ),
  );

  const queues = results.map((r) => [...r.items]);
  const interleaved: SourceWallpaper[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        interleaved.push(next);
        added = true;
      }
    }
  }

  return { items: interleaved, nextPage: null, configured: configured.length > 0 };
}
