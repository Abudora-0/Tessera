import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { WallpaperCanvas } from "@/components/WallpaperCanvas";
import { TesseraCounter } from "@/components/TesseraCounter";
import { GENERATORS } from "@/lib/generators/families";
import { PALETTES } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Tessera works: a seeded drawing engine with twelve families, eight palettes and a canvas exporter that renders at any resolution.",
};

const STACK = [
  ["Next.js", "App Router, static output, React Server Components"],
  ["TypeScript", "Strict mode across the engine and the UI"],
  ["Canvas 2D", "Every wallpaper is drawn, never stored"],
  ["Motion", "Interface animation and scroll reveals"],
  ["Tailwind CSS", "Design tokens and the mosaic system"],
  ["Zustand", "The local shelf and theme, persisted to the browser"],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Reveal>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ink-faint">About</p>
        <h1 className="mt-3 text-balance font-display text-4xl text-ink sm:text-5xl">
          A wallpaper site with no wallpapers in it.
        </h1>
        <p className="mt-6 text-base text-ink-soft">
          Tessera started from a simple frustration. Wallpaper sites are heavy
          galleries of other people&apos;s photos, gated behind sign ups and ad
          walls, and the one image you like is never the right size for your
          screen. So this one holds no images at all. It holds a drawing engine.
        </p>
        <p className="mt-4 text-base text-ink-soft">
          Pick a family and a palette, give it a seed, and the engine paints a
          composition on a canvas. Change the seed and you get a different one.
          Ask for a 4K desktop or a tall phone screen and it redraws at exactly
          that size. The result downloads straight from your browser.
        </p>
        <p className="mt-4 text-base text-ink-soft">
          The Discover section is the one place Tessera shows photographs. It
          searches live across Unsplash, Pexels, Pixabay, Wallhaven, NASA and a
          set of wallpaper subreddits on Reddit. Nothing is rehosted permanently:
          each image is fetched on demand and shown with its author, source and
          licence. Reddit results link back to the original post, and mature
          content is filtered out unless you turn it on.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="my-12 grid grid-cols-3 gap-4 border-y border-edge py-8 text-center">
          {[
            { label: "Families", value: GENERATORS.length },
            { label: "Palettes", value: PALETTES.length },
            { label: "Seeded starts", value: 959904, suffix: "+" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl text-ink">
                <TesseraCounter value={stat.value} suffix={stat.suffix ?? ""} />
              </p>
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h2 className="font-display text-2xl text-ink">The families</h2>
        <div className="mt-6 space-y-4">
          {GENERATORS.map((generator, index) => (
            <div
              key={generator.id}
              className="flex items-center gap-4 border border-edge bg-bg-raised p-3"
            >
              <div className="w-28 shrink-0">
                <WallpaperCanvas
                  config={{
                    family: generator.id,
                    palette: PALETTES[index % PALETTES.length].id,
                    seed: 200 + index * 51,
                    params: { ...DEFAULT_PARAMS },
                  }}
                  ratio={16 / 10}
                  rounded={false}
                />
              </div>
              <div>
                <h3 className="font-display text-base text-ink">{generator.name}</h3>
                <p className="mt-0.5 text-sm text-ink-soft">{generator.blurb}.</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h2 className="mt-14 font-display text-2xl text-ink">Built with</h2>
        <dl className="mt-6 grid gap-px border border-edge bg-edge sm:grid-cols-2">
          {STACK.map(([name, detail]) => (
            <div key={name} className="bg-bg p-4">
              <dt className="font-display text-sm text-ink">{name}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{detail}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <div className="mt-14 border border-edge bg-bg-sunken p-8 text-center">
          <h2 className="font-display text-2xl text-ink">It is open source</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            The engine, the generators and this site are all MIT licensed. Fork
            it, add a family, make it yours.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/Abudora-0/tessera"
              target="_blank"
              rel="noreferrer"
              className="btn-primary focus-tile clip-tile px-6 py-3 text-sm font-medium"
            >
              View the source
            </a>
            <Link
              href="/studio"
              className="btn-ghost focus-tile px-6 py-3 text-sm text-ink"
            >
              Open the studio
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
