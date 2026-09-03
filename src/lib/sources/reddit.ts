import { originalOnly } from "./shared";
import { redditConfigured, redditFetch } from "./reddit-auth";
import { subsForCategory } from "./subreddits";
import {
  orientationOf,
  type ResolutionOption,
  type SearchParams,
  type SearchResult,
  type SourceAdapter,
  type SourceWallpaper,
} from "./types";

type RedditPost = {
  id: string;
  name: string;
  title: string;
  subreddit: string;
  author: string;
  permalink: string;
  url: string;
  url_overridden_by_dest?: string;
  over_18: boolean;
  post_hint?: string;
  is_gallery?: boolean;
  created_utc: number;
  link_flair_text?: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
  media_metadata?: Record<string, { s?: { u?: string; x?: number; y?: number } }>;
};

type Listing = { data: { after: string | null; children: Array<{ data: RedditPost }> } };

const unescape = (url: string) => url.replace(/&amp;/g, "&");

function imageFor(post: RedditPost): {
  full: string;
  width: number;
  height: number;
  thumb: string;
  preview: string;
} | null {
  const direct = post.url_overridden_by_dest || post.url;
  const isDirectImage = /\.(jpe?g|png|webp)$/i.test(direct) && /i\.redd\.it|i\.imgur\.com/.test(direct);

  const img = post.preview?.images?.[0];
  if (img) {
    const source = img.source;
    const resolutions = [...img.resolutions].sort((a, b) => a.width - b.width);
    const thumb = resolutions.find((r) => r.width >= 400) ?? resolutions[resolutions.length - 1] ?? source;
    const preview = resolutions.find((r) => r.width >= 1080) ?? source;
    return {
      full: isDirectImage ? direct : unescape(source.url),
      width: source.width,
      height: source.height,
      thumb: unescape(thumb.url),
      preview: unescape(preview.url),
    };
  }

  if (post.is_gallery && post.media_metadata) {
    const first = Object.values(post.media_metadata).find((m) => m.s?.u);
    if (first?.s?.u) {
      const u = unescape(first.s.u);
      return { full: u, width: first.s.x ?? 0, height: first.s.y ?? 0, thumb: u, preview: u };
    }
  }

  if (isDirectImage) {
    return { full: direct, width: 0, height: 0, thumb: direct, preview: direct };
  }
  return null;
}

function normalize(post: RedditPost): SourceWallpaper | null {
  const image = imageFor(post);
  if (!image) return null;
  const resolutions: ResolutionOption[] = originalOnly(image.full, image.width, image.height);
  return {
    source: "reddit",
    id: post.id,
    title: post.title.replace(/\[[^\]]*\]/g, "").trim() || post.title,
    width: image.width,
    height: image.height,
    color: "#131316",
    thumbUrl: image.thumb,
    previewUrl: image.preview,
    fullUrl: image.full,
    author: { name: `u/${post.author}`, url: `https://www.reddit.com/user/${post.author}` },
    sourceUrl: `https://www.reddit.com${post.permalink}`,
    license: {
      name: `Posted to r/${post.subreddit}, rights with the original creator`,
      url: `https://www.reddit.com${post.permalink}`,
    },
    nsfw: post.over_18,
    tags: [post.subreddit, post.link_flair_text].filter(Boolean) as string[],
    createdAt: new Date(post.created_utc * 1000).toISOString(),
    resolutions,
  };
}

function collect(listing: Listing | null, params: SearchParams): SourceWallpaper[] {
  if (!listing) return [];
  return listing.data.children
    .map((c) => c.data)
    .filter((p) => params.nsfw || !p.over_18)
    .map(normalize)
    .filter((w): w is SourceWallpaper => w !== null)
    .filter((w) => {
      if (!params.orientation || params.orientation === "any" || !w.width) return true;
      return orientationOf(w.width, w.height) === params.orientation;
    });
}

export const reddit: SourceAdapter = {
  id: "reddit",
  label: "Reddit",
  blurb: "Community picks from wallpaper subreddits",
  license: {
    name: "Rights retained by original creators",
    url: "https://www.redditinc.com/policies/user-agreement",
  },
  canBeNsfw: true,
  envKeys: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
  isConfigured: redditConfigured,

  async search(params: SearchParams): Promise<SearchResult> {
    if (!redditConfigured()) return { items: [], nextPage: null, configured: false };
    const subs = subsForCategory(params.category).join("+");
    const after = params.page || "";
    const sort = ["hot", "top", "new", "rising"].includes(params.sort || "") ? params.sort : "hot";
    const time = params.time || "week";
    const limit = 50;

    let path: string;
    if (params.q) {
      path = `/r/${subs}/search?q=${encodeURIComponent(params.q)}&restrict_sr=1&include_over_18=${params.nsfw ? "on" : "off"}&sort=${sort}&t=${time}&limit=${limit}&raw_json=1${after ? `&after=${after}` : ""}`;
    } else {
      path = `/r/${subs}/${sort}?limit=${limit}&t=${time}&raw_json=1${after ? `&after=${after}` : ""}`;
    }

    const listing = await redditFetch<Listing>(path);
    const items = collect(listing, params);
    return {
      items,
      nextPage: listing?.data.after ?? null,
      configured: true,
    };
  },

  async getItem(id: string): Promise<SourceWallpaper | null> {
    if (!redditConfigured()) return null;
    const listing = await redditFetch<Listing>(`/api/info?id=t3_${id}&raw_json=1`, 600);
    const post = listing?.data.children[0]?.data;
    return post ? normalize(post) : null;
  },
};
