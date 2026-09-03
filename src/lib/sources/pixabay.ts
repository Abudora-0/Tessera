import { fetchJson, normalizeColor, originalOnly } from "./shared";
import {
  orientationOf,
  type ResolutionOption,
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

const API = "https://pixabay.com/api/";

type PixabayHit = {
  id: number;
  pageURL: string;
  tags: string;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  fullHDURL?: string;
  imageURL?: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  userImageURL: string;
};

function key(): string {
  return process.env.PIXABAY_API_KEY || "";
}

function resolutions(hit: PixabayHit): ResolutionOption[] {
  const options: ResolutionOption[] = [];
  if (hit.imageURL) {
    options.push({ label: "Original", width: hit.imageWidth, height: hit.imageHeight, url: hit.imageURL });
  }
  if (hit.fullHDURL) {
    options.push({ label: "Full HD 1920", width: 1920, height: Math.round((1920 * hit.imageHeight) / hit.imageWidth), url: hit.fullHDURL });
  }
  options.push({
    label: options.length === 0 ? "Original" : "Large 1280",
    width: 1280,
    height: Math.round((1280 * hit.imageHeight) / hit.imageWidth),
    url: hit.largeImageURL,
  });
  return options.length ? options : originalOnly(hit.largeImageURL, hit.imageWidth, hit.imageHeight);
}

function normalize(hit: PixabayHit): SourceWallpaper {
  const tags = hit.tags.split(",").map((t) => t.trim()).filter(Boolean);
  return {
    source: "pixabay",
    id: String(hit.id),
    title: tags.slice(0, 3).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ") || "Untitled",
    width: hit.imageWidth,
    height: hit.imageHeight,
    color: normalizeColor(null),
    thumbUrl: hit.webformatURL.replace("_640", "_340"),
    previewUrl: hit.largeImageURL,
    fullUrl: hit.largeImageURL,
    author: { name: hit.user, url: `https://pixabay.com/users/${hit.user}/` },
    sourceUrl: hit.pageURL,
    license: { name: "Pixabay Content License", url: "https://pixabay.com/service/license-summary/" },
    nsfw: false,
    tags: tags.slice(0, 8),
    resolutions: resolutions(hit),
  };
}

export const pixabay: SourceAdapter = {
  id: "pixabay",
  label: "Pixabay",
  blurb: "Community photos, illustrations and vectors",
  license: {
    name: "Pixabay Content License",
    url: "https://pixabay.com/service/license-summary/",
  },
  canBeNsfw: false,
  envKeys: ["PIXABAY_API_KEY"],
  isConfigured: () => Boolean(key()),

  async search(params: SearchParams): Promise<SearchResult> {
    if (!key()) return { items: [], nextPage: null, configured: false };
    const page = Number(params.page || "1");
    const perPage = params.perPage ?? 27;
    const url = new URL(API);
    url.searchParams.set("key", key());
    url.searchParams.set("image_type", "photo");
    url.searchParams.set("safesearch", "true");
    url.searchParams.set("order", params.sort === "new" ? "latest" : "popular");
    url.searchParams.set("min_width", "1920");
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));
    if (params.q) url.searchParams.set("q", params.q);
    if (params.category) url.searchParams.set("category", params.category);
    if (params.orientation === "landscape") url.searchParams.set("orientation", "horizontal");
    if (params.orientation === "portrait") url.searchParams.set("orientation", "vertical");

    const data = await fetchJson<{ totalHits: number; hits: PixabayHit[] }>(url.toString());
    let items = data.hits.map(normalize);
    if (params.orientation === "square") {
      items = items.filter((i) => orientationOf(i.width, i.height) === "square");
    }
    const seen = page * perPage;
    return {
      items,
      nextPage: seen < data.totalHits && data.hits.length === perPage ? String(page + 1) : null,
      configured: true,
    };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    if (!key()) return null;
    try {
      const url = new URL(API);
      url.searchParams.set("key", key());
      url.searchParams.set("id", id);
      const data = await fetchJson<{ hits: PixabayHit[] }>(url.toString());
      return data.hits[0] ? normalize(data.hits[0]) : null;
    } catch {
      return null;
    }
  },
};
