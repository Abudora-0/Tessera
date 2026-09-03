import { fetchJson } from "./shared";
import {
  type ResolutionOption,
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

const API = "https://images-api.nasa.gov";

type NasaItem = {
  href: string;
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    date_created?: string;
    keywords?: string[];
    photographer?: string;
    secondary_creator?: string;
    center?: string;
  }>;
  links?: Array<{ href: string; rel: string; render?: string }>;
};

async function assetUrls(nasaId: string): Promise<string[]> {
  try {
    const data = await fetchJson<{ collection: { items: Array<{ href: string }> } }>(
      `${API}/asset/${encodeURIComponent(nasaId)}`,
    );
    return data.collection.items.map((i) => i.href).filter((h) => /\.(jpe?g|png)$/i.test(h));
  } catch {
    return [];
  }
}

function bestFrom(urls: string[]): { orig?: string; large?: string; medium?: string } {
  const pick = (needle: string) => urls.find((u) => u.toLowerCase().includes(needle));
  return {
    orig: pick("~orig") ?? pick("orig"),
    large: pick("~large") ?? pick("large"),
    medium: pick("~medium") ?? pick("medium"),
  };
}

function normalize(item: NasaItem, urls: string[]): SourceWallpaper {
  const meta = item.data[0];
  const preview = item.links?.find((l) => l.rel === "preview")?.href ?? urls[0] ?? "";
  const files = bestFrom(urls);
  const full = files.orig ?? files.large ?? preview;
  const author = meta.photographer || meta.secondary_creator || meta.center || "NASA";

  const resolutions: ResolutionOption[] = [];
  if (files.orig) resolutions.push({ label: "Original", width: 0, height: 0, url: files.orig });
  if (files.large) resolutions.push({ label: resolutions.length ? "Large" : "Original", width: 0, height: 0, url: files.large });
  if (!resolutions.length && preview) resolutions.push({ label: "Preview", width: 0, height: 0, url: preview });

  return {
    source: "nasa",
    id: meta.nasa_id,
    title: meta.title || meta.nasa_id,
    width: 0,
    height: 0,
    color: "#05070f",
    thumbUrl: preview,
    previewUrl: files.medium ?? files.large ?? preview,
    fullUrl: full,
    author: { name: author, url: "https://www.nasa.gov" },
    sourceUrl: `https://images.nasa.gov/details-${encodeURIComponent(meta.nasa_id)}`,
    license: {
      name: "Public domain, NASA usage guidelines",
      url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    },
    nsfw: false,
    tags: (meta.keywords ?? []).slice(0, 8),
    createdAt: meta.date_created,
    resolutions,
  };
}

export const nasa: SourceAdapter = {
  id: "nasa",
  label: "NASA",
  blurb: "Public domain imagery of space and Earth",
  license: {
    name: "Public domain",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
  },
  canBeNsfw: false,
  envKeys: [],
  isConfigured: () => true,

  async search(params: SearchParams): Promise<SearchResult> {
    const page = Number(params.page || "1");
    const url = new URL(`${API}/search`);
    url.searchParams.set("q", params.q || params.category || "nebula galaxy earth");
    url.searchParams.set("media_type", "image");
    url.searchParams.set("page", String(page));

    const data = await fetchJson<{
      collection: {
        items: NasaItem[];
        metadata: { total_hits: number };
        links?: Array<{ rel: string; href: string }>;
      };
    }>(url.toString());

    const items = await Promise.all(
      data.collection.items.slice(0, 24).map(async (item) => {
        const links = (item.links ?? []).map((l) => l.href).filter((h) => /\.(jpe?g|png)$/i.test(h));
        return normalize(item, links);
      }),
    );

    const hasNext = Boolean(data.collection.links?.some((l) => l.rel === "next"));
    return { items, nextPage: hasNext ? String(page + 1) : null, configured: true };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    try {
      const url = new URL(`${API}/search`);
      url.searchParams.set("nasa_id", id);
      const data = await fetchJson<{ collection: { items: NasaItem[] } }>(url.toString());
      const item = data.collection.items[0];
      if (!item) return null;
      const urls = await assetUrls(id);
      return normalize(item, urls);
    } catch {
      return null;
    }
  },
};
