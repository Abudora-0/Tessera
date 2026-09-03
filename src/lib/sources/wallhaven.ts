import { fetchJson, normalizeColor, originalOnly } from "./shared";
import {
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

const API = "https://wallhaven.cc/api/v1";

type WallhavenItem = {
  id: string;
  url: string;
  short_url: string;
  source: string;
  purity: "sfw" | "sketchy" | "nsfw";
  category: string;
  dimension_x: number;
  dimension_y: number;
  resolution: string;
  ratio: string;
  colors: string[];
  path: string;
  thumbs: { large: string; original: string; small: string };
  tags?: Array<{ name: string }>;
  uploader?: { username: string };
};

function key(): string {
  return process.env.WALLHAVEN_API_KEY || "";
}

function purityParam(nsfw: boolean | undefined): string {
  if (!nsfw) return "100";
  return key() ? "111" : "110";
}

function titleFrom(tags: string[], item: WallhavenItem): string {
  const clean = tags.filter((t) => !t.includes("(") && t.length > 2).slice(0, 3);
  if (clean.length) {
    return clean.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
  }
  const kind = item.category === "anime" ? "Anime" : item.category === "people" ? "Portrait" : "Wallpaper";
  return `${kind} ${item.resolution}`;
}

function normalize(item: WallhavenItem): SourceWallpaper {
  const tags = (item.tags ?? []).map((t) => t.name).slice(0, 8);
  return {
    source: "wallhaven",
    id: item.id,
    title: titleFrom(tags, item),
    width: item.dimension_x,
    height: item.dimension_y,
    color: normalizeColor(item.colors?.[0]),
    thumbUrl: item.thumbs.small,
    previewUrl: item.thumbs.large,
    fullUrl: item.path,
    author: item.uploader?.username
      ? {
          name: item.uploader.username,
          url: `https://wallhaven.cc/user/${item.uploader.username}`,
        }
      : { name: "Wallhaven community" },
    sourceUrl: item.url,
    license: {
      name: "Wallhaven, uploader owned",
      url: "https://wallhaven.cc/faq",
    },
    nsfw: item.purity !== "sfw",
    tags,
    resolutions: originalOnly(item.path, item.dimension_x, item.dimension_y),
  };
}

export const wallhaven: SourceAdapter = {
  id: "wallhaven",
  label: "Wallhaven",
  blurb: "A large community wallpaper archive",
  license: { name: "Uploader owned", url: "https://wallhaven.cc/faq" },
  canBeNsfw: true,
  envKeys: ["WALLHAVEN_API_KEY"],
  // wallhaven works without a key for SFW content
  isConfigured: () => true,

  async search(params: SearchParams): Promise<SearchResult> {
    const page = Number(params.page || "1");
    const url = new URL(`${API}/search`);
    if (params.q) url.searchParams.set("q", params.q);
    url.searchParams.set("categories", params.category === "anime" ? "010" : params.category === "people" ? "001" : "111");
    url.searchParams.set("purity", purityParam(params.nsfw));
    url.searchParams.set(
      "sorting",
      params.sort === "new" ? "date_added" : params.sort === "random" ? "random" : "toplist",
    );
    url.searchParams.set("order", "desc");
    url.searchParams.set("page", String(page));
    if (params.orientation === "landscape") url.searchParams.set("ratios", "16x9,16x10,21x9");
    if (params.orientation === "portrait") url.searchParams.set("ratios", "9x16,10x16,9x18");
    if (key()) url.searchParams.set("apikey", key());

    const data = await fetchJson<{
      data: WallhavenItem[];
      meta: { current_page: number; last_page: number };
    }>(url.toString());

    return {
      items: data.data.map(normalize),
      nextPage: data.meta.current_page < data.meta.last_page ? String(page + 1) : null,
      configured: true,
    };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    try {
      const url = new URL(`${API}/w/${id}`);
      if (key()) url.searchParams.set("apikey", key());
      const data = await fetchJson<{ data: WallhavenItem }>(url.toString());
      return data.data ? normalize(data.data) : null;
    } catch {
      return null;
    }
  },
};
