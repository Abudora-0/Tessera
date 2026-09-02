/**
 * Deterministic pseudo random number generation.
 * Every wallpaper in Tessera is a pure function of a seed, so the same seed
 * always paints the same artwork on any device and at any resolution.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn any string into a stable 32 bit integer seed. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Rng = {
  next: () => number;
  range: (min: number, max: number) => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  bool: (probability?: number) => boolean;
  sign: () => number;
};

export function createRng(seed: number | string): Rng {
  const numericSeed = typeof seed === "string" ? hashSeed(seed) : seed;
  const next = mulberry32(numericSeed);
  const range = (min: number, max: number) => min + (max - min) * next();
  return {
    next,
    range,
    int: (min: number, max: number) => Math.floor(range(min, max + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    bool: (probability = 0.5) => next() < probability,
    sign: () => (next() < 0.5 ? -1 : 1),
  };
}

/** A short, human friendly seed such as "amber-fox-1042". */
const SEED_ADJECTIVES = [
  "amber", "azure", "cobalt", "crimson", "dusk", "ember", "frost", "glass",
  "hazel", "indigo", "jade", "lunar", "mauve", "noir", "opal", "quartz",
  "rust", "sable", "slate", "teal", "umber", "violet",
];
const SEED_NOUNS = [
  "arc", "bloom", "cinder", "drift", "flux", "grove", "haze", "iris",
  "kite", "loom", "mesa", "nova", "orbit", "prism", "ridge", "shard",
  "tide", "vault", "wave", "zephyr",
];

export function seedLabel(seed: number): string {
  const rng = createRng(seed);
  const adjective = rng.pick(SEED_ADJECTIVES);
  const noun = rng.pick(SEED_NOUNS);
  return `${adjective}-${noun}-${seed % 10000}`;
}
