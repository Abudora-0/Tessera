import { DEFAULT_PARAMS, type GeneratorParams } from "@/lib/generators/shared";
import { configToSlug, type WallpaperConfig } from "@/lib/render";

export type Collection = {
  slug: string;
  name: string;
  family: string;
  palette: string;
  seed: number;
  params: GeneratorParams;
  tags: string[];
  featured: boolean;
  config: WallpaperConfig;
};

type RawCollection = {
  name: string;
  family: string;
  palette: string;
  seed: number;
  params?: Partial<GeneratorParams>;
  tags?: string[];
  featured?: boolean;
};

const RAW: RawCollection[] = [
  { name: "Northern Signal", family: "aurora", palette: "midnight", seed: 1042, params: { turbulence: 0.6, contrast: 0.7 }, tags: ["calm", "night"], featured: true },
  { name: "Coal Harbour", family: "aurora", palette: "ember", seed: 7731, params: { density: 0.7, grain: 0.32 }, tags: ["warm", "dramatic"] },
  { name: "Glacier Hum", family: "aurora", palette: "ice", seed: 3390, params: { detail: 0.65 }, tags: ["cool", "minimal"], featured: true },
  { name: "Understory", family: "aurora", palette: "verdant", seed: 5521, tags: ["nature", "soft"] },
  { name: "Long Dusk", family: "aurora", palette: "sunset", seed: 8890, params: { contrast: 0.75, turbulence: 0.7 }, tags: ["warm", "scenic"] },

  { name: "Paper Weather", family: "mesh", palette: "mono", seed: 2048, params: { detail: 0.4, grain: 0.32 }, tags: ["minimal", "desk"], featured: true },
  { name: "Slow Bloom", family: "mesh", palette: "bloom", seed: 6614, params: { density: 0.7 }, tags: ["soft", "pastel"] },
  { name: "Cobalt Drift", family: "mesh", palette: "midnight", seed: 991, tags: ["calm", "modern"] },
  { name: "Citrus Fog", family: "mesh", palette: "sunset", seed: 4417, params: { contrast: 0.5 }, tags: ["warm", "soft"] },
  { name: "Meltwater", family: "mesh", palette: "ice", seed: 1200, params: { turbulence: 0.6 }, tags: ["cool", "clean"] },

  { name: "Current Study", family: "flow", palette: "neon", seed: 3141, params: { density: 0.7, contrast: 0.7 }, tags: ["energetic", "vivid"], featured: true },
  { name: "Ink Weather", family: "flow", palette: "mono", seed: 2718, params: { density: 0.8, grain: 0.3 }, tags: ["monochrome", "organic"] },
  { name: "Reef Lines", family: "flow", palette: "ice", seed: 1618, tags: ["cool", "flowing"] },
  { name: "Emberfield", family: "flow", palette: "ember", seed: 4004, params: { turbulence: 0.7 }, tags: ["warm", "energetic"] },
  { name: "Pollen Path", family: "flow", palette: "verdant", seed: 9021, params: { detail: 0.7 }, tags: ["nature", "detailed"] },

  { name: "Contour Field", family: "strata", palette: "verdant", seed: 3050, params: { density: 0.6 }, tags: ["map", "structured"], featured: true },
  { name: "Iron Range", family: "strata", palette: "ember", seed: 7007, params: { contrast: 0.8, turbulence: 0.7 }, tags: ["bold", "terrain"] },
  { name: "Blueprint Ridge", family: "strata", palette: "midnight", seed: 8123, tags: ["technical", "calm"] },
  { name: "Salt Flat", family: "strata", palette: "mono", seed: 6220, params: { detail: 0.4 }, tags: ["minimal", "map"] },
  { name: "Frostline", family: "strata", palette: "ice", seed: 4560, params: { density: 0.7 }, tags: ["cool", "layered"] },

  { name: "Shattered Glass", family: "tessellate", palette: "neon", seed: 5090, params: { density: 0.7, contrast: 0.8 }, tags: ["bold", "faceted"], featured: true },
  { name: "Chapel Window", family: "tessellate", palette: "sunset", seed: 3377, params: { detail: 0.6 }, tags: ["warm", "mosaic"] },
  { name: "Slate Mosaic", family: "tessellate", palette: "mono", seed: 1024, tags: ["minimal", "geometric"] },
  { name: "Canopy Break", family: "tessellate", palette: "verdant", seed: 7788, params: { turbulence: 0.5 }, tags: ["nature", "faceted"] },
  { name: "Deep Facet", family: "tessellate", palette: "midnight", seed: 2050, params: { density: 0.8 }, tags: ["night", "sharp"] },

  { name: "Far Orbit", family: "orbital", palette: "midnight", seed: 6001, params: { detail: 0.6 }, tags: ["space", "scenic"], featured: true },
  { name: "Dust and Fire", family: "orbital", palette: "ember", seed: 4231, params: { contrast: 0.8 }, tags: ["cosmic", "warm"] },
  { name: "Ion Bloom", family: "orbital", palette: "neon", seed: 8420, params: { density: 0.8 }, tags: ["vivid", "space"] },
  { name: "Cold Moon", family: "orbital", palette: "ice", seed: 3600, tags: ["cool", "calm"] },
  { name: "Rose Nebula", family: "orbital", palette: "bloom", seed: 9500, params: { detail: 0.7 }, tags: ["soft", "cosmic"] },

  { name: "Signal Bars", family: "waveform", palette: "neon", seed: 5555, params: { density: 0.7 }, tags: ["retro", "rhythmic"], featured: true },
  { name: "Analog Sunrise", family: "waveform", palette: "sunset", seed: 2200, params: { turbulence: 0.6 }, tags: ["warm", "retro"] },
  { name: "Graphite EQ", family: "waveform", palette: "mono", seed: 3030, tags: ["minimal", "rhythmic"] },
  { name: "Tide Table", family: "waveform", palette: "ice", seed: 7400, params: { detail: 0.6 }, tags: ["cool", "structured"] },

  { name: "Foundation No. 1", family: "bauhaus", palette: "ember", seed: 1919, params: { density: 0.55 }, tags: ["graphic", "bold"], featured: true },
  { name: "Studio Grid", family: "bauhaus", palette: "mono", seed: 4747, tags: ["minimal", "graphic"] },
  { name: "Playroom", family: "bauhaus", palette: "bloom", seed: 6363, params: { contrast: 0.7 }, tags: ["playful", "bold"] },
  { name: "Cobalt Primer", family: "bauhaus", palette: "midnight", seed: 8080, params: { detail: 0.6 }, tags: ["modern", "graphic"] },

  { name: "Press Check", family: "halftone", palette: "mono", seed: 1200, params: { detail: 0.6 }, tags: ["print", "minimal"], featured: true },
  { name: "Comic Sunset", family: "halftone", palette: "sunset", seed: 4820, params: { density: 0.7, contrast: 0.7 }, tags: ["retro", "warm"] },
  { name: "Cyan Screen", family: "halftone", palette: "ice", seed: 7150, tags: ["cool", "pattern"] },
  { name: "Risograph", family: "halftone", palette: "bloom", seed: 3360, params: { density: 0.65 }, tags: ["playful", "print"] },

  { name: "Lobby Floor", family: "terrazzo", palette: "bloom", seed: 2450, params: { density: 0.6 }, tags: ["playful", "pattern"], featured: true },
  { name: "Confetti Hour", family: "terrazzo", palette: "neon", seed: 8890, params: { density: 0.8, contrast: 0.7 }, tags: ["vivid", "scatter"] },
  { name: "Quarry", family: "terrazzo", palette: "mono", seed: 5010, params: { detail: 0.6 }, tags: ["minimal", "stone"] },
  { name: "Orchard Chips", family: "terrazzo", palette: "verdant", seed: 6620, tags: ["nature", "scatter"] },

  { name: "Still Pond", family: "ripple", palette: "ice", seed: 3140, params: { turbulence: 0.4 }, tags: ["calm", "cool"], featured: true },
  { name: "Sonar", family: "ripple", palette: "midnight", seed: 7720, params: { density: 0.7 }, tags: ["night", "hypnotic"] },
  { name: "Heat Bloom", family: "ripple", palette: "ember", seed: 4405, params: { turbulence: 0.7, contrast: 0.7 }, tags: ["warm", "energetic"] },
  { name: "Rain Static", family: "ripple", palette: "neon", seed: 9130, params: { density: 0.8 }, tags: ["vivid", "concentric"] },

  { name: "Carrara", family: "marble", palette: "mono", seed: 2210, params: { detail: 0.6 }, tags: ["painterly", "minimal"], featured: true },
  { name: "Verde Alpi", family: "marble", palette: "verdant", seed: 6040, params: { turbulence: 0.6 }, tags: ["nature", "veined"] },
  { name: "Portoro", family: "marble", palette: "midnight", seed: 8350, params: { contrast: 0.7 }, tags: ["night", "painterly"] },
  { name: "Rosso Levanto", family: "marble", palette: "ember", seed: 5570, params: { density: 0.7 }, tags: ["warm", "veined"] },
];

export const COLLECTIONS: Collection[] = RAW.map((raw) => {
  const params: GeneratorParams = { ...DEFAULT_PARAMS, ...raw.params };
  const config: WallpaperConfig = {
    family: raw.family,
    palette: raw.palette,
    seed: raw.seed,
    params,
  };
  return {
    slug: configToSlug(config),
    name: raw.name,
    family: raw.family,
    palette: raw.palette,
    seed: raw.seed,
    params,
    tags: raw.tags ?? [],
    featured: raw.featured ?? false,
    config,
  };
});

export const FEATURED = COLLECTIONS.filter((collection) => collection.featured);

export function collectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function relatedCollections(collection: Collection, count = 4): Collection[] {
  return COLLECTIONS.filter((other) => other.slug !== collection.slug)
    .map((other) => {
      let score = 0;
      if (other.family === collection.family) score += 2;
      if (other.palette === collection.palette) score += 2;
      score += other.tags.filter((tag) => collection.tags.includes(tag)).length;
      return { other, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.other);
}

export const ALL_TAGS = Array.from(
  new Set(COLLECTIONS.flatMap((collection) => collection.tags)),
).sort();
