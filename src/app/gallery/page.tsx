import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryView } from "@/components/GalleryView";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse curated generative wallpapers by family, palette and mood. Every tile renders live and exports at your screen resolution.",
};

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="h-64 w-full shimmer opacity-30" />
        </div>
      }
    >
      <GalleryView />
    </Suspense>
  );
}
