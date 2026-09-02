import type { Palette } from "@/lib/palettes";
import { rgbaFromHex } from "@/lib/palettes";
import type { Rng } from "@/lib/prng";

export type GeneratorParams = {
  /** How many marks the generator lays down, 0 to 1. */
  density: number;
  /** Separation between light and dark, 0 to 1. */
  contrast: number;
  /** Amount of film grain layered on top, 0 to 1. */
  grain: number;
  /** Structural complexity of the composition, 0 to 1. */
  detail: number;
  /** Warp and turbulence, 0 to 1. */
  turbulence: number;
};

export const DEFAULT_PARAMS: GeneratorParams = {
  density: 0.55,
  contrast: 0.6,
  grain: 0.35,
  detail: 0.5,
  turbulence: 0.45,
};

export type DrawContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  palette: Palette;
  rng: Rng;
  params: GeneratorParams;
};

export type Generator = {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  draw: (context: DrawContext) => void;
};

export function fillBackground(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function verticalGradient(
  ctx: CanvasRenderingContext2D,
  height: number,
  stops: string[],
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  stops.forEach((color, index) => {
    gradient.addColorStop(stops.length === 1 ? 0 : index / (stops.length - 1), color);
  });
  return gradient;
}

export function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  strength: number,
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, rgbaFromHex(color, strength));
  gradient.addColorStop(1, rgbaFromHex(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

/**
 * A cheap, deterministic grain pass. We paint a small noise tile once and
 * repeat it across the canvas so the cost does not scale with resolution.
 */
export function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: Rng,
  amount: number,
) {
  if (amount <= 0.001) return;
  const tile = 160;
  const off = document.createElement("canvas");
  off.width = tile;
  off.height = tile;
  const octx = off.getContext("2d");
  if (!octx) return;
  const image = octx.createImageData(tile, tile);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = 128 + (rng.next() - 0.5) * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = Math.floor(amount * 46);
  }
  octx.putImageData(image, 0, 0);
  const pattern = ctx.createPattern(off, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** A soft vignette that keeps the eye toward the centre of the frame. */
export function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
) {
  if (strength <= 0.001) return;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function scaleFor(width: number, height: number): number {
  return Math.sqrt((width * height) / (1920 * 1080));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
