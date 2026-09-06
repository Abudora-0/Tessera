import type { NextConfig } from "next";

const remoteHosts = [
  "images.unsplash.com",
  "images.pexels.com",
  "pixabay.com",
  "cdn.pixabay.com",
  "w.wallhaven.cc",
  "th.wallhaven.cc",
  "images-assets.nasa.gov",
  "images-api.nasa.gov",
  "apod.nasa.gov",
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: remoteHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
};

export default nextConfig;
