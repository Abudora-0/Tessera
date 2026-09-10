"use client";

import { useEffect, useRef, useState } from "react";
import { renderToCanvas, type WallpaperConfig } from "@/lib/render";

type Props = {
  config: WallpaperConfig;
  /** width / height of the preview surface */
  ratio?: number;
  className?: string;
  /** render immediately instead of waiting for the viewport */
  eager?: boolean;
  /** cap the backing resolution of the preview */
  maxPixels?: number;
  rounded?: boolean;
};

/** Render above display resolution so the browser downsamples for free anti aliasing. */
const SUPERSAMPLE = 1.5;

/**
 * Phones and low core machines choke on the full supersampled render, especially
 * when a grid paints a dozen at once. Dial the quality back for them: the tiles
 * are small on those screens anyway.
 */
function qualityProfile() {
  if (typeof navigator === "undefined") return { supersample: SUPERSAMPLE, cap: 1 };
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const small = typeof window !== "undefined" && window.innerWidth < 700;
  if (small || cores <= 4 || mem <= 4) return { supersample: 1.15, cap: 0.45 };
  return { supersample: SUPERSAMPLE, cap: 1 };
}

export function WallpaperCanvas({
  config,
  ratio = 16 / 9,
  className,
  eager = false,
  maxPixels = 3_200_000,
  rounded = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(eager);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    if (eager || visible) return;
    const node = wrapRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, visible]);

  useEffect(() => {
    if (!visible) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let timer = 0;
    let tries = 0;
    // setTimeout rather than rAF so the preview still paints in a background tab
    const paint = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 && tries < 40) {
        tries += 1;
        timer = window.setTimeout(paint, 32);
        return;
      }
      const width = Math.max(rect.width, 2);
      const { supersample, cap } = qualityProfile();
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * supersample;
      let w = Math.round(width * dpr);
      let h = Math.round((width / ratio) * dpr);
      const budget = maxPixels * cap;
      const pixels = w * h;
      if (pixels > budget) {
        const factor = Math.sqrt(budget / pixels);
        w = Math.round(w * factor);
        h = Math.round(h * factor);
      }
      renderToCanvas(canvas, config, w, h);
      setPainted(true);
    };
    timer = window.setTimeout(paint, 16);
    return () => window.clearTimeout(timer);
  }, [visible, config, ratio, maxPixels]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-bg-sunken ${rounded ? "rounded-[3px]" : ""} ${className ?? ""}`}
      style={{ aspectRatio: String(ratio) }}
    >
      {!painted ? <div className="absolute inset-0 shimmer opacity-40" /> : null}
      <canvas
        ref={canvasRef}
        className="h-full w-full block transition-opacity duration-500"
        style={{ opacity: painted ? 1 : 0 }}
      />
    </div>
  );
}
