/**
 * Reddit access. If REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET are set we use
 * application only OAuth (higher rate limits, token cached in module scope so
 * Vercel Fluid Compute reuses it). Otherwise we fall back to the public
 * www.reddit.com JSON endpoints, which need no app but are rate limited harder.
 */

let cached: { token: string; expires: number } | null = null;

export function redditHasApp(): boolean {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
}

export function redditUserAgent(): string {
  return (
    process.env.REDDIT_USER_AGENT ||
    "web:tesseera:v1.0 (by /u/tesseera-app)"
  );
}

async function redditToken(): Promise<string | null> {
  if (!redditHasApp()) return null;
  if (cached && cached.expires > Date.now() + 30_000) return cached.token;

  const basic = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": redditUserAgent(),
    },
    body: "grant_type=client_credentials&scope=read",
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  cached = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

/** Insert `.json` before the query string for the public endpoint. */
function toPublicPath(path: string): string {
  const [base, query] = path.split("?");
  const withJson = base.endsWith(".json") ? base : `${base}.json`;
  return query ? `${withJson}?${query}` : withJson;
}

export async function redditFetch<T>(
  path: string,
  revalidate = 300,
): Promise<T | null> {
  const token = await redditToken();

  const url = token
    ? `https://oauth.reddit.com${path}`
    : `https://www.reddit.com${toPublicPath(path)}`;

  const res = await fetch(url, {
    headers: token
      ? { Authorization: `Bearer ${token}`, "User-Agent": redditUserAgent() }
      : {
          // the public JSON API rejects requests that do not look like a client
          "User-Agent": redditUserAgent(),
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
    next: { revalidate },
  });
  if (!res.ok) return null;
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
