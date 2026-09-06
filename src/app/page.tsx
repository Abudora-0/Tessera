import Link from "next/link";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Motion";
import { TesseraCounter } from "@/components/TesseraCounter";
import { WallpaperCanvas } from "@/components/WallpaperCanvas";
import { WallpaperCard } from "@/components/WallpaperCard";
import { FEATURED } from "@/data/collections";
import { GENERATORS } from "@/lib/generators/families";
import { PALETTES } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";
import { defaultConfig } from "@/lib/render";

const STEPS = [
  {
    title: "Choose a family",
    body: "A dozen drawing engines, from drifting Aurora ribbons to veined Marble and print shop Halftone. Each one is a different way of filling a frame.",
  },
  {
    title: "Tune the composition",
    body: "Themed sliders for density, contrast, grain, detail and turbulence. Roll the seed until a piece stops you.",
  },
  {
    title: "Export for your screen",
    body: "Pick your exact device resolution or type a custom size. Tessera redraws at full scale and hands you a PNG.",
  },
];

const FEATURES = [
  "Every wallpaper is a pure function of a seed, so a link is all you need to share one",
  "Exports render off screen at native resolution, up to 8192 pixels on the long edge",
  "A command palette on Cmd or Ctrl K to jump anywhere or roll a surprise",
  "A local shelf keeps your favourites in the browser with no account",
  "Themed controls throughout, down to the scrollbar, the counters and the dropdowns",
  "Respects reduced motion and ships as a fast static site",
];

export default function HomePage() {
  const heroConfig = { ...defaultConfig(), palette: "midnight", family: "aurora" };

  return (
    <div>
      {/* hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-edge">
        <HeroCanvas seedConfig={heroConfig} />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 border border-edge bg-bg-raised/70 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft backdrop-blur sm:text-[0.68rem] sm:tracking-[0.24em]">
              <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
              Generative wallpaper studio
            </p>
            <h1 className="text-balance font-display text-[2.4rem] leading-[1.06] text-ink sm:text-6xl sm:leading-[1.02] md:text-7xl">
              Wallpapers grown from a single seed.
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] text-ink-soft sm:text-lg">
              Tessera does not store images. It draws them. Choose a family and a
              palette, shape the composition, then export something pixel perfect
              for any screen you own.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="btn-primary focus-tile clip-tile px-6 py-3.5 text-sm font-medium"
              >
                Open the studio
              </Link>
              <Link
                href="/gallery"
                className="btn-ghost focus-tile bg-bg-raised/70 px-6 py-3.5 text-sm text-ink backdrop-blur"
              >
                Browse the gallery
              </Link>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-4 border-t border-edge pt-6">
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                  Families
                </dt>
                <dd className="mt-1 text-2xl text-ink">
                  <TesseraCounter value={GENERATORS.length} />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                  Palettes
                </dt>
                <dd className="mt-1 text-2xl text-ink">
                  <TesseraCounter value={PALETTES.length} />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                  Max width
                </dt>
                <dd className="mt-1 text-2xl text-ink">
                  <TesseraCounter value={5120} suffix="px" />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-[tessera-float_2.4s_ease-in-out_infinite] flex-col items-center gap-2 text-ink-faint sm:flex">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-8 w-px bg-edge-strong" />
        </div>
      </section>

      <Marquee
        items={[
          ...GENERATORS.map((g) => g.name),
          ...PALETTES.map((p) => p.name),
          "Any resolution",
          "No accounts",
          "Open source",
        ]}
      />

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-24">
        <Reveal>
          <h2 className="max-w-xl text-balance font-display text-3xl text-ink sm:text-4xl">
            Three moves from blank frame to finished wallpaper.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="tile-surface clip-tile h-full p-6">
                <span className="font-mono text-sm text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="border-y border-edge bg-bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <Reveal>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Featured pieces</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Hand tuned starting points. Open one to export or remix it.
              </p>
            </Reveal>
            <Link
              href="/gallery"
              className="focus-tile hidden shrink-0 border-b border-accent pb-1 text-sm text-ink hover:text-accent sm:block"
            >
              All collections
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((collection, index) => (
              <WallpaperCard key={collection.slug} collection={collection} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* families */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-24">
        <Reveal>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Twelve ways to fill a frame</h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Each family is its own algorithm. Tap one to start a fresh piece in
            the studio.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GENERATORS.map((generator, index) => (
            <Reveal key={generator.id} delay={Math.min(index * 0.05, 0.3)}>
              <Link
                href={`/studio?f=${generator.id}`}
                className="focus-tile group block border border-edge transition-colors"
              >
                <WallpaperCanvas
                  config={{
                    family: generator.id,
                    palette: PALETTES[index % PALETTES.length].id,
                    seed: 100 + index * 37,
                    params: { ...DEFAULT_PARAMS },
                  }}
                  ratio={4 / 3}
                  rounded={false}
                />
                <div className="flex items-center justify-between p-3">
                  <span className="font-display text-sm text-ink">{generator.name}</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint transition-colors group-hover:text-accent">
                    {generator.tags[0]}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="border-y border-edge bg-bg-sunken">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              Small site, serious about the details.
            </h2>
            <p className="mt-4 text-sm text-ink-soft">
              Tessera is a study in doing one thing well. No sign up, no tracking
              wall, no stock photos. Just a drawing engine and a set of controls
              that feel like part of the same object.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Combinations", value: 959904, suffix: "+" },
                { label: "Export formats", value: 1, suffix: " PNG" },
                { label: "Backend calls", value: 0 },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl text-ink">
                    <TesseraCounter value={stat.value} suffix={stat.suffix ?? ""} />
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 border border-edge bg-bg-raised p-4 text-sm text-ink-soft"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rotate-45 bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* discover */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-24">
        <Reveal>
          <div className="flex flex-col items-start gap-6 border border-edge bg-bg-raised p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                Also new
              </p>
              <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                Prefer a photograph?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-ink-soft">
                Discover searches real wallpapers live from Unsplash, Pexels,
                Pixabay, Wallhaven, NASA and Reddit, with the credit and licence
                for every one.
              </p>
            </div>
            <Link
              href="/discover"
              className="btn-primary focus-tile clip-tile shrink-0 px-6 py-3.5 text-sm font-medium"
            >
              Open Discover
            </Link>
          </div>
        </Reveal>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl text-ink sm:text-5xl">
            Your next wallpaper does not exist yet. Go draw it.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/studio"
              className="btn-primary focus-tile clip-tile px-7 py-4 text-sm font-medium"
            >
              Start in the studio
            </Link>
            <Link
              href="/gallery"
              className="btn-ghost focus-tile px-7 py-4 text-sm text-ink"
            >
              See the gallery first
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
