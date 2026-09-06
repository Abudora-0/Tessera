import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/data/collections";

const BASE = "https://tesseera.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/gallery", "/studio", "/discover", "/about"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const wallpapers = COLLECTIONS.map((collection) => ({
    url: `${BASE}/wallpaper/${collection.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...routes, ...wallpapers];
}
