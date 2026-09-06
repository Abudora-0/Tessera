import type { Palette } from "@/lib/palettes";
import { hexToRgb, mixHex, rgbaFromHex } from "@/lib/palettes";
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
  grain: 0.22,
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

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** How large the piece is relative to a 1080p frame. Line widths scale by this. */
export function scaleFor(width: number, height: number): number {
  return Math.sqrt((width * height) / (1920 * 1080));
}

export function fillBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * A vertical gradient with automatic mid stops inserted between every pair of
 * colours so long dark ramps do not band before the grain pass runs.
 */
export function verticalGradient(
  ctx: CanvasRenderingContext2D,
  height: number,
  stops: string[],
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  addSmoothStops(gradient, stops);
  return gradient;
}

export function linearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: string[],
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  addSmoothStops(gradient, stops);
  return gradient;
}

function addSmoothStops(gradient: CanvasGradient, stops: string[]) {
  if (stops.length === 1) {
    gradient.addColorStop(0, stops[0]);
    gradient.addColorStop(1, stops[0]);
    return;
  }
  // mixHex drops alpha, so only insert anti banding mid stops for opaque hex
  const canMix = stops.every((s) => s.startsWith("#"));
  if (!canMix) {
    stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
    return;
  }
  const points: Array<[number, string]> = [];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = i / (stops.length - 1);
    const b = (i + 1) / (stops.length - 1);
    points.push([a, stops[i]]);
    points.push([lerp(a, b, 0.5), mixHex(stops[i], stops[i + 1], 0.5)]);
  }
  points.push([1, stops[stops.length - 1]]);
  for (const [pos, color] of points) gradient.addColorStop(pos, color);
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
  gradient.addColorStop(0.35, rgbaFromHex(color, strength * 0.55));
  gradient.addColorStop(0.7, rgbaFromHex(color, strength * 0.16));
  gradient.addColorStop(1, rgbaFromHex(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

/**
 * Draw into a detached layer, then composite it back, optionally blurred. Real
 * gaussian blur via ctx.filter looks far cleaner than shadowBlur for soft
 * shapes and is GPU accelerated. When the frame is very large the layer is
 * rendered at a capped resolution and scaled up, which is invisible once
 * blurred and keeps memory and time bounded on 4K and 8K exports.
 */
export function withLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: { blur?: number; alpha?: number; composite?: GlobalCompositeOperation },
  draw: (layerCtx: CanvasRenderingContext2D) => void,
) {
  const blur = options.blur ?? 0;
  const cap = blur > 4 ? 2400 : 4200;
  const factor = Math.min(1, cap / Math.max(width, height));
  const lw = Math.max(2, Math.round(width * factor));
  const lh = Math.max(2, Math.round(height * factor));

  const layer = document.createElement("canvas");
  layer.width = lw;
  layer.height = lh;
  const lctx = layer.getContext("2d");
  if (!lctx) {
    draw(ctx);
    return;
  }
  if (factor !== 1) lctx.scale(factor, factor);
  draw(lctx);

  ctx.save();
  if (blur > 0.1) ctx.filter = `blur(${blur}px)`;
  if (options.alpha != null) ctx.globalAlpha = options.alpha;
  if (options.composite) ctx.globalCompositeOperation = options.composite;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(layer, 0, 0, width, height);
  ctx.restore();
}

/**
 * Full frame film grain that does not repeat. A noise buffer is generated once
 * at a fraction of the canvas size and scaled up with smoothing, so it reads as
 * grain rather than a tiling pattern and also breaks up gradient banding. Grain
 * uses Math.random on purpose: two grain patterns for the same seed are
 * perceptually identical, and this keeps grain from perturbing the generator's
 * deterministic sequence or diverging between preview and export sizes.
 */
export function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
) {
  if (amount <= 0.001) return;
  const longEdge = Math.max(width, height);
  const bufferScale = longEdge > 2200 ? 0.34 : longEdge > 1100 ? 0.5 : 0.85;
  const bw = Math.max(2, Math.round(width * bufferScale));
  const bh = Math.max(2, Math.round(height * bufferScale));

  const off = document.createElement("canvas");
  off.width = bw;
  off.height = bh;
  const octx = off.getContext("2d");
  if (!octx) return;
  const image = octx.createImageData(bw, bh);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    // average two uniforms for a softer, more film-like distribution
    const n = 128 + (Math.random() + Math.random() - 1) * 0.5 * 210;
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
    data[i + 3] = 255;
  }
  octx.putImageData(image, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = clamp01(0.12 + amount * 0.5);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, width, height);
  ctx.restore();
}

/** A soft vignette tinted toward a deep version of the background, not pure black. */
export function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
  tint = "#000000",
) {
  if (strength <= 0.001) return;
  const deep = mixHex(tint, "#000000", 0.55);
  const { r, g, b } = hexToRgb(deep);
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.28,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.78,
  );
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
  gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${strength * 0.4})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${strength})`);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Trace a smooth curve through a list of points using midpoint quadratics. Uses
 * lineTo for the first point so it connects to a path already in progress (and
 * still acts as a moveTo when the path is empty).
 */
export function smoothLine(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
) {
  if (points.length < 2) return;
  ctx.lineTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last[0], last[1]);
}
