import { buildResizeOptions, fetchJson, normalizeColor } from "./shared";
import {
  orientationOf,
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

const API = "https://api.pexels.com/v1";

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string | null;
  alt: string | null;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
};

function key(): string {
  return process.env.PEXELS_API_KEY || "";
}

function headers(): Record<string, string> {
  return { Authorization: key() };
}

function sized(original: string, width: number, height: number): string {
  const u = new URL(original);
  u.searchParams.set("auto", "compress");
  u.searchParams.set("cs", "tinysrgb");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("w", String(width));
  u.searchParams.set("h", String(height));
  return u.toString();
}

function normalize(photo: PexelsPhoto): SourceWallpaper {
  const title = photo.alt || `Photo by ${photo.photographer}`;
  return {
    source: "pexels",
    id: String(photo.id),
    title: title.charAt(0).toUpperCase() + title.slice(1),
    width: photo.width,
    height: photo.height,
    color: normalizeColor(photo.avg_color),
    thumbUrl: sized(photo.src.original, 480, 320),
    previewUrl: `${photo.src.large2x}`,
    fullUrl: photo.src.original,
    author: { name: photo.photographer, url: photo.photographer_url },
    sourceUrl: photo.url,
    license: { name: "Pexels License", url: "https://www.pexels.com/license/" },
    nsfw: false,
    tags: [],
    resolutions: buildResizeOptions(photo.src.original, photo.width, photo.height, sized),
  };
}

export const pexels: SourceAdapter = {
  id: "pexels",
  label: "Pexels",
  blurb: "Free stock photos and wallpapers",
  license: { name: "Pexels License", url: "https://www.pexels.com/license/" },
  canBeNsfw: false,
  envKeys: ["PEXELS_API_KEY"],
  isConfigured: () => Boolean(key()),

  async search(params: SearchParams): Promise<SearchResult> {
    if (!key()) return { items: [], nextPage: null, configured: false };
    const page = Number(params.page || "1");
    const perPage = params.perPage ?? 28;
    const orientation =
      params.orientation && params.orientation !== "any" && params.orientation !== "square"
        ? params.orientation
        : undefined;

    const url = new URL(params.q ? `${API}/search` : `${API}/curated`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));
    if (params.q) url.searchParams.set("query", params.q);
    if (orientation) url.searchParams.set("orientation", orientation);

    const data = await fetchJson<{ photos: PexelsPhoto[]; next_page?: string }>(
      url.toString(),
      { headers: headers() },
    );

    let items = data.photos.map(normalize);
    if (orientation) {
      items = items.filter((i) => orientationOf(i.width, i.height) === orientation);
    }

    return {
      items,
      nextPage: data.next_page ? String(page + 1) : null,
      configured: true,
    };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    if (!key()) return null;
    try {
      const photo = await fetchJson<PexelsPhoto>(`${API}/photos/${id}`, {
        headers: headers(),
      });
      return normalize(photo);
    } catch {
      return null;
    }
  },
};
