import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/components/discover/DiscoverView";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Search real wallpapers from Unsplash, Pexels, Pixabay, Wallhaven and NASA. Filter by shape, then download at the sizes each source offers.",
};

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="h-64 w-full shimmer opacity-30" />
        </div>
      }
    >
      <DiscoverView />
    </Suspense>
  );
}
