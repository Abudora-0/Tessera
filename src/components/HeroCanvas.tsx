"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { GENERATORS } from "@/lib/generators/families";
import { PALETTES } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";
import { renderToCanvas, type WallpaperConfig } from "@/lib/render";

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeConfig(): WallpaperConfig {
  return {
    family: pick(GENERATORS).id,
    palette: pick(PALETTES).id,
    seed: Math.floor(Math.random() * 9999) + 1,
    params: {
      ...DEFAULT_PARAMS,
      density: 0.35 + Math.random() * 0.5,
      contrast: 0.4 + Math.random() * 0.5,
      turbulence: 0.3 + Math.random() * 0.5,
      detail: 0.35 + Math.random() * 0.5,
      grain: 0.3,
    },
  };
}

/**
 * The hero backdrop. Two stacked canvases crossfade every few seconds so the
 * page always opens on a fresh, real generative piece rather than a video.
 */
export function HeroCanvas({ seedConfig }: { seedConfig: WallpaperConfig }) {
  const reduce = useReducedMotion();
  const aRef = useRef<HTMLCanvasElement>(null);
  const bRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState<"a" | "b">("a");

  useEffect(() => {
    const wrap = wrapRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!wrap || !a || !b) return;

    const size = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      return {
        w: Math.max(2, Math.round(rect.width * dpr)),
        h: Math.max(2, Math.round(rect.height * dpr)),
      };
    };

    const { w, h } = size();
    renderToCanvas(a, seedConfig, w, h);
    renderToCanvas(b, makeConfig(), w, h);

    if (reduce) return;

    let current: "a" | "b" = "a";
    const interval = window.setInterval(() => {
      const next = current === "a" ? "b" : "a";
      const target = next === "a" ? a : b;
      const { w: nw, h: nh } = size();
      renderToCanvas(target, makeConfig(), nw, nh);
      current = next;
      setFront(next);
    }, 8500);

    return () => window.clearInterval(interval);
  }, [seedConfig, reduce]);

  useEffect(() => {
    if (reduce) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 14;
      const y = (event.clientY / window.innerHeight - 0.5) * 14;
      wrap.style.setProperty("--px", `${x}px`);
      wrap.style.setProperty("--py", `${y}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ transform: "translate3d(var(--px, 0), var(--py, 0), 0) scale(1.06)" }}
    >
      <canvas
        ref={aRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-in-out"
        style={{ opacity: front === "a" ? 1 : 0 }}
      />
      <canvas
        ref={bRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-in-out"
        style={{ opacity: front === "b" ? 1 : 0 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--bg) 20%, transparent), color-mix(in srgb, var(--bg) 78%, transparent))" }} />
    </div>
  );
}
