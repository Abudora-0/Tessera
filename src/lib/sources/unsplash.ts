import {
  buildResizeOptions,
  fetchJson,
  normalizeColor,
  sourceFetch,
} from "./shared";
import {
  orientationOf,
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

const API = "https://api.unsplash.com";
const UTM = "utm_source=tessera&utm_medium=referral";

type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string | null;
  alt_description: string | null;
  created_at?: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  links: { html: string; download_location: string };
  user: { name: string; username: string; links: { html: string } };
  tags?: Array<{ title: string }>;
};

function key(): string {
  return process.env.UNSPLASH_ACCESS_KEY || "";
}

function headers(): Record<string, string> {
  return { Authorization: `Client-ID ${key()}` };
}

function raw(url: string, width: number, height: number): string {
  const u = new URL(url);
  u.searchParams.set("w", String(width));
  u.searchParams.set("h", String(height));
  u.searchParams.set("fit", "crop");
  u.searchParams.set("q", "85");
  return u.toString();
}

function normalize(photo: UnsplashPhoto): SourceWallpaper {
  const title =
    photo.description || photo.alt_description || `Photo by ${photo.user.name}`;
  return {
    source: "unsplash",
    id: photo.id,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    width: photo.width,
    height: photo.height,
    color: normalizeColor(photo.color),
    thumbUrl: `${photo.urls.raw}&w=480&h=320&fit=crop&q=75`,
    previewUrl: `${photo.urls.raw}&w=1400&fit=max&q=82`,
    fullUrl: photo.urls.full,
    author: { name: photo.user.name, url: `${photo.user.links.html}?${UTM}` },
    sourceUrl: `${photo.links.html}?${UTM}`,
    license: { name: "Unsplash License", url: "https://unsplash.com/license" },
    nsfw: false,
    tags: (photo.tags ?? []).map((t) => t.title).slice(0, 8),
    createdAt: photo.created_at,
    resolutions: buildResizeOptions(photo.urls.raw, photo.width, photo.height, raw),
  };
}

export const unsplash: SourceAdapter = {
  id: "unsplash",
  label: "Unsplash",
  blurb: "High resolution photography, free to use",
  license: { name: "Unsplash License", url: "https://unsplash.com/license" },
  canBeNsfw: false,
  envKeys: ["UNSPLASH_ACCESS_KEY"],
  isConfigured: () => Boolean(key()),

  async search(params: SearchParams): Promise<SearchResult> {
    if (!key()) return { items: [], nextPage: null, configured: false };
    const page = Number(params.page || "1");
    const perPage = params.perPage ?? 28;
    const orientation =
      params.orientation && params.orientation !== "any" && params.orientation !== "square"
        ? params.orientation
        : undefined;

    let items: SourceWallpaper[] = [];
    let hasMore = false;

    if (params.q) {
      const url = new URL(`${API}/search/photos`);
      url.searchParams.set("query", params.q);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));
      if (orientation) url.searchParams.set("orientation", orientation);
      const data = await fetchJson<{ results: UnsplashPhoto[]; total_pages: number }>(
        url.toString(),
        { headers: headers() },
      );
      items = data.results.map(normalize);
      hasMore = page < data.total_pages;
    } else {
      const url = new URL(`${API}/photos`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("order_by", params.sort === "new" ? "latest" : "popular");
      const data = await fetchJson<UnsplashPhoto[]>(url.toString(), { headers: headers() });
      items = data.map(normalize);
      hasMore = data.length === perPage;
    }

    if (orientation) {
      items = items.filter((i) => orientationOf(i.width, i.height) === orientation);
    }

    return { items, nextPage: hasMore ? String(page + 1) : null, configured: true };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    if (!key()) return null;
    try {
      const photo = await fetchJson<UnsplashPhoto>(`${API}/photos/${id}`, {
        headers: headers(),
      });
      return normalize(photo);
    } catch {
      return null;
    }
  },

  async onDownload(item: SourceWallpaper): Promise<void> {
    if (!key()) return;
    try {
      await sourceFetch(
        `${API}/photos/${item.id}/download`,
        { headers: headers(), revalidate: 0 },
      );
    } catch {
      // a failed ping should not block the download
    }
  },
};
