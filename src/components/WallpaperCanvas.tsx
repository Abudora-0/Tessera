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

export function WallpaperCanvas({
  config,
  ratio = 16 / 9,
  className,
  eager = false,
  maxPixels = 1_600_000,
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

    let frame = 0;
    const paint = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2) {
        frame = requestAnimationFrame(paint);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = Math.round(rect.width * dpr);
      let h = Math.round((rect.width / ratio) * dpr);
      const pixels = w * h;
      if (pixels > maxPixels) {
        const factor = Math.sqrt(maxPixels / pixels);
        w = Math.round(w * factor);
        h = Math.round(h * factor);
      }
      renderToCanvas(canvas, config, w, h);
      setPainted(true);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
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
