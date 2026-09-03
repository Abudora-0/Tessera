/**
 * A single normalized shape for every external wallpaper source. Each adapter
 * in this folder maps its provider response onto this so the rest of the app
 * never has to know which API a wallpaper came from.
 */

export type SourceId =
  | "unsplash"
  | "pexels"
  | "pixabay"
  | "wallhaven"
  | "nasa"
  | "reddit";

export type Orientation = "any" | "landscape" | "portrait" | "square";

export type ResolutionOption = {
  label: string;
  width: number;
  height: number;
  url: string;
};

export type SourceWallpaper = {
  source: SourceId;
  id: string;
  title: string;
  width: number;
  height: number;
  /** dominant colour, used as a placeholder while the image loads */
  color: string;
  thumbUrl: string;
  previewUrl: string;
  fullUrl: string;
  author: { name: string; url?: string };
  /** link to the original page or post */
  sourceUrl: string;
  license: { name: string; url?: string };
  nsfw: boolean;
  tags: string[];
  createdAt?: string;
  /** download choices, "Original" first, built from each CDN's own url params */
  resolutions: ResolutionOption[];
};

export type SearchParams = {
  q?: string;
  category?: string;
  orientation?: Orientation;
  /** opaque per-source cursor, or undefined for the first page */
  page?: string;
  nsfw?: boolean;
  sort?: string;
  /** reddit time window: hour, day, week, month, year, all */
  time?: string;
  perPage?: number;
};

export type SearchResult = {
  items: SourceWallpaper[];
  nextPage: string | null;
  /** false when the source has no API key configured */
  configured: boolean;
};

export type SourceAdapter = {
  id: SourceId;
  label: string;
  /** shown on the source tab and the attribution line */
  blurb: string;
  license: { name: string; url: string };
  /** can this source ever return adult content */
  canBeNsfw: boolean;
  /** which env var(s) must be present for this source to work */
  envKeys: string[];
  isConfigured: () => boolean;
  search: (params: SearchParams) => Promise<SearchResult>;
  getItem: (id: string) => Promise<SourceWallpaper | null>;
  /**
   * Optional hook run right before a download is streamed. Unsplash requires a
   * ping to its download endpoint to stay within API guidelines.
   */
  onDownload?: (item: SourceWallpaper) => Promise<void>;
};

export const EMPTY_RESULT: SearchResult = {
  items: [],
  nextPage: null,
  configured: false,
};

/** Pick the closest matching CDN resolution for a requested width. */
export function pickResolution(
  item: SourceWallpaper,
  requested: string | null,
): ResolutionOption {
  if (!requested) return item.resolutions[0];
  const byLabel = item.resolutions.find((r) => r.label === requested);
  if (byLabel) return byLabel;
  const width = Number(requested);
  if (Number.isFinite(width)) {
    return [...item.resolutions].sort(
      (a, b) => Math.abs(a.width - width) - Math.abs(b.width - width),
    )[0];
  }
  return item.resolutions[0];
}

export function orientationOf(width: number, height: number): Orientation {
  if (Math.abs(width - height) < Math.min(width, height) * 0.05) return "square";
  return width >= height ? "landscape" : "portrait";
}

/** Standard desktop and phone widths we offer when a CDN can resize. */
export const RESIZE_TARGETS: Array<{ label: string; width: number; ratio: number }> = [
  { label: "Desktop 1080p", width: 1920, ratio: 16 / 9 },
  { label: "Desktop 1440p", width: 2560, ratio: 16 / 9 },
  { label: "Desktop 4K", width: 3840, ratio: 16 / 9 },
  { label: "Phone", width: 1170, ratio: 19.5 / 9 },
  { label: "Tablet", width: 1640, ratio: 4 / 3 },
];
