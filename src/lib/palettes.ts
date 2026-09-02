/**
 * Curated colour stories. Each palette is an ordered set of hex stops that the
 * generators sample from, plus a background and an accent used by the UI when a
 * wallpaper is previewed.
 */

export type Palette = {
  id: string;
  name: string;
  mood: string;
  background: string;
  accent: string;
  colors: string[];
};

export const PALETTES: Palette[] = [
  {
    id: "midnight",
    name: "Midnight",
    mood: "deep blues folding into black",
    background: "#05070f",
    accent: "#6ea8ff",
    colors: ["#0b1026", "#13204d", "#274690", "#5c7cfa", "#a5c8ff", "#e9f0ff"],
  },
  {
    id: "ember",
    name: "Ember",
    mood: "coals, rust and low firelight",
    background: "#140a06",
    accent: "#ff8a3d",
    colors: ["#2b1005", "#5c1f0b", "#a83a15", "#ef6c2e", "#ffab5e", "#ffe1b8"],
  },
  {
    id: "ice",
    name: "Ice",
    mood: "glacier light and pale mist",
    background: "#070d11",
    accent: "#7ee0e6",
    colors: ["#0a1a1f", "#123844", "#1f6f7d", "#4fb8c4", "#a7e8ee", "#eafcff"],
  },
  {
    id: "verdant",
    name: "Verdant",
    mood: "moss, canopy and river stone",
    background: "#060c08",
    accent: "#5fd08a",
    colors: ["#0c1a12", "#183a26", "#2c6b43", "#4fa768", "#9adfae", "#e6f7ea"],
  },
  {
    id: "sunset",
    name: "Sunset",
    mood: "coral sky bleeding into dusk",
    background: "#100610",
    accent: "#ff6fae",
    colors: ["#241035", "#5b1f66", "#a8327f", "#f26d8b", "#ffab7d", "#ffe6c4"],
  },
  {
    id: "mono",
    name: "Mono",
    mood: "graphite, paper and shadow",
    background: "#0a0a0b",
    accent: "#d4d4d8",
    colors: ["#111114", "#2a2a30", "#4a4a52", "#7c7c86", "#b5b5bd", "#f2f2f4"],
  },
  {
    id: "neon",
    name: "Neon",
    mood: "arcade glow after the rain",
    background: "#06060f",
    accent: "#b388ff",
    colors: ["#12082b", "#2a0f5c", "#5a1fd6", "#00e0ff", "#ff2d95", "#f7f3ff"],
  },
  {
    id: "bloom",
    name: "Bloom",
    mood: "petals, chalk and morning haze",
    background: "#0d0a0e",
    accent: "#f6a5c0",
    colors: ["#241826", "#4a2c4e", "#8a4f7d", "#d98fb0", "#f7c8d8", "#fdeef4"],
  },
];

export const PALETTE_MAP: Record<string, Palette> = Object.fromEntries(
  PALETTES.map((palette) => [palette.id, palette]),
);

export function getPalette(id: string): Palette {
  return PALETTE_MAP[id] ?? PALETTES[0];
}

/** Parse "#rrggbb" into an { r, g, b } triple of 0 to 255 integers. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim();
  const value = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16,
  );
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbaFromHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Linear blend between two hex colours, t from 0 to 1. */
export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
