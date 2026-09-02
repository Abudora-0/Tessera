import type { Metadata } from "next";
import { Suspense } from "react";
import { StudioView } from "@/components/StudioView";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Design a generative wallpaper. Pick a family and palette, tune density, contrast, detail, turbulence and grain, then export a PNG at your exact screen resolution.",
};

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="h-[60vh] w-full shimmer opacity-30" />
        </div>
      }
    >
      <StudioView />
    </Suspense>
  );
}
