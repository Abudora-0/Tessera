import { RESIZE_TARGETS, type ResolutionOption } from "./types";

export const DEFAULT_COLOR = "#131316";

/** A fetch wrapper with a real user agent and short lived caching. */
export async function sourceFetch(
  url: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<Response> {
  const { revalidate = 300, headers, ...rest } = init;
  return fetch(url, {
    ...rest,
    headers: {
      "User-Agent": process.env.REDDIT_USER_AGENT || "Tessera/1.0 (wallpaper discovery)",
      Accept: "application/json",
      ...headers,
    },
    next: { revalidate },
  });
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  const res = await sourceFetch(url, init);
  if (!res.ok) {
    throw new Error(`${new URL(url).host} responded ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Build download options from a base CDN url that accepts width and height
 * query params (Unsplash and Pexels both do). "Original" is always first.
 */
export function buildResizeOptions(
  originalUrl: string,
  originalWidth: number,
  originalHeight: number,
  make: (url: string, width: number, height: number) => string,
): ResolutionOption[] {
  const ratio = originalWidth / originalHeight;
  const options: ResolutionOption[] = [
    {
      label: "Original",
      width: originalWidth,
      height: originalHeight,
      url: originalUrl,
    },
  ];
  for (const target of RESIZE_TARGETS) {
    if (target.width >= originalWidth) continue;
    // keep the source aspect ratio, only cap the long edge
    const width = target.width;
    const height = Math.round(width / ratio);
    options.push({
      label: `${target.label.split(" ")[0]} ${width} by ${height}`,
      width,
      height,
      url: make(originalUrl, width, height),
    });
  }
  return options;
}

/** A single "Original" option for sources that cannot resize. */
export function originalOnly(
  url: string,
  width: number,
  height: number,
): ResolutionOption[] {
  return [{ label: "Original", width, height, url }];
}

export function normalizeColor(input: string | null | undefined): string {
  if (!input) return DEFAULT_COLOR;
  const value = input.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return value;
  return DEFAULT_COLOR;
}

export function looksLikeImage(url: string): boolean {
  return /\.(jpe?g|png|webp|avif)(\?|$)/i.test(url);
}

export function firstSentence(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}
