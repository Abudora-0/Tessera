import { getGenerator } from "@/lib/generators/families";
import { DEFAULT_PARAMS, type GeneratorParams } from "@/lib/generators/shared";
import { getPalette } from "@/lib/palettes";
import { createRng } from "@/lib/prng";
import { clampDimension } from "@/lib/devices";

export type WallpaperConfig = {
  family: string;
  palette: string;
  seed: number;
  params: GeneratorParams;
};

export function defaultConfig(): WallpaperConfig {
  return {
    family: "aurora",
    palette: "midnight",
    seed: 1042,
    params: { ...DEFAULT_PARAMS },
  };
}

/**
 * Paint a wallpaper onto a canvas at the requested pixel size. The generator is
 * a pure function of the config, so a 320 pixel thumbnail and an 8K export are
 * the same composition at different scales.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  config: WallpaperConfig,
  width: number,
  height: number,
) {
  const w = clampDimension(width);
  const h = clampDimension(height);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  const generator = getGenerator(config.family);
  const palette = getPalette(config.palette);
  const rng = createRng(`${config.family}:${config.palette}:${config.seed}`);
  generator.draw({ ctx, width: w, height: h, palette, rng, params: config.params });
}

/**
 * Render at full resolution off screen and hand back a PNG blob. Exports below
 * 4K are drawn at 1.25x and downscaled so thin strokes and edges stay clean.
 */
export async function renderToBlob(
  config: WallpaperConfig,
  width: number,
  height: number,
): Promise<Blob> {
  const target = clampDimension(width);
  const targetH = clampDimension(height);
  const supersample = Math.max(target, targetH) <= 4000 ? 1.25 : 1;

  const source = document.createElement("canvas");
  renderToCanvas(source, config, Math.round(target * supersample), Math.round(targetH * supersample));

  let output = source;
  if (supersample !== 1) {
    output = document.createElement("canvas");
    output.width = target;
    output.height = targetH;
    const octx = output.getContext("2d");
    if (octx) {
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(source, 0, 0, target, targetH);
    } else {
      output = source;
    }
  }

  return new Promise((resolve, reject) => {
    output.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Tessera could not encode the image"));
    }, "image/png");
  });
}

export function fileNameFor(config: WallpaperConfig, width: number, height: number): string {
  return `tessera-${config.family}-${config.palette}-${config.seed}-${width}x${height}.png`;
}

export async function downloadWallpaper(
  config: WallpaperConfig,
  width: number,
  height: number,
) {
  const blob = await renderToBlob(config, width, height);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileNameFor(config, width, height);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------------------------------------- URL encoding */

const PARAM_KEYS: Array<[keyof GeneratorParams, string]> = [
  ["density", "d"],
  ["contrast", "c"],
  ["grain", "g"],
  ["detail", "t"],
  ["turbulence", "u"],
];

export function configToParams(config: WallpaperConfig): Record<string, string> {
  const out: Record<string, string> = {
    f: config.family,
    p: config.palette,
    s: String(config.seed),
  };
  for (const [key, short] of PARAM_KEYS) {
    out[short] = String(Math.round(config.params[key] * 100));
  }
  return out;
}

export function configToQuery(config: WallpaperConfig): string {
  return new URLSearchParams(configToParams(config)).toString();
}

export function configFromParams(
  get: (key: string) => string | null | undefined,
): WallpaperConfig {
  const base = defaultConfig();
  const family = get("f") || base.family;
  const palette = get("p") || base.palette;
  const seedRaw = Number(get("s"));
  const seed = Number.isFinite(seedRaw) && seedRaw > 0 ? Math.floor(seedRaw) : base.seed;
  const params = { ...base.params };
  for (const [key, short] of PARAM_KEYS) {
    const raw = get(short);
    if (raw === null || raw === undefined || raw === "") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) {
      params[key] = Math.min(1, Math.max(0, value / 100));
    }
  }
  return { family, palette, seed, params };
}

export function configToSlug(config: WallpaperConfig): string {
  const p = PARAM_KEYS.map(([key]) => Math.round(config.params[key] * 100)).join("-");
  return `${config.family}-${config.palette}-${config.seed}-${p}`;
}

export function configFromSlug(slug: string): WallpaperConfig | null {
  const parts = slug.split("-");
  if (parts.length < 3) return null;
  const [family, palette, seedRaw, ...rest] = parts;
  const seed = Number(seedRaw);
  if (!Number.isFinite(seed)) return null;
  const base = defaultConfig();
  const params = { ...base.params };
  PARAM_KEYS.forEach(([key], index) => {
    const rawValue = rest[index];
    if (rawValue === undefined || rawValue === "") return;
    const value = Number(rawValue);
    if (Number.isFinite(value)) params[key] = Math.min(1, Math.max(0, value / 100));
  });
  return { family, palette, seed, params };
}
