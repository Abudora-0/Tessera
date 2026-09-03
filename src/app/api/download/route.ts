import { getAdapter } from "@/lib/sources";
import { pickResolution } from "@/lib/sources/types";

export const runtime = "nodejs";

const MAX_BYTES = 45 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const id = searchParams.get("id");
  const res = searchParams.get("res");

  if (!source || !id) {
    return new Response("source and id are required", { status: 400 });
  }

  const adapter = getAdapter(source);
  if (!adapter) return new Response("unknown source", { status: 404 });

  const item = await adapter.getItem(id).catch(() => null);
  if (!item) return new Response("not found", { status: 404 });

  const resolution = pickResolution(item, res);

  // Unsplash guidelines: register the download before serving it.
  if (adapter.onDownload) {
    await adapter.onDownload(item).catch(() => undefined);
  }

  const upstream = await fetch(resolution.url, {
    headers: { "User-Agent": "Tessera/1.0 (wallpaper downloader)" },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("could not fetch the image", { status: 502 });
  }

  const type = upstream.headers.get("content-type") || "image/jpeg";
  if (!type.startsWith("image/")) {
    return new Response("upstream did not return an image", { status: 502 });
  }

  const length = Number(upstream.headers.get("content-length") || "0");
  if (length && length > MAX_BYTES) {
    return new Response("image is too large to proxy", { status: 413 });
  }

  const ext = EXT_BY_TYPE[type] || "jpg";
  const filename = `tessera-${source}-${id}.${ext}`;

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
      ...(length ? { "Content-Length": String(length) } : {}),
    },
  });
}
