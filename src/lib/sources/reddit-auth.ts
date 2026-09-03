/**
 * Reddit application only OAuth (client credentials). The token is cached in
 * module scope; on Vercel Fluid Compute the instance is reused across requests
 * so this avoids re-authenticating on every call.
 */

let cached: { token: string; expires: number } | null = null;

export function redditConfigured(): boolean {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
}

export function redditUserAgent(): string {
  return (
    process.env.REDDIT_USER_AGENT ||
    "web:tessera-wallpapers:v1.0 (by /u/tessera-app)"
  );
}

export async function redditToken(): Promise<string | null> {
  if (!redditConfigured()) return null;
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

export async function redditFetch<T>(
  path: string,
  revalidate = 300,
): Promise<T | null> {
  const token = await redditToken();
  if (!token) return null;
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": redditUserAgent(),
    },
    next: { revalidate },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}
