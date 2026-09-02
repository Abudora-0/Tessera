import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeviceFrame } from "@/components/DeviceFrame";
import { DownloadPanel } from "@/components/DownloadPanel";
import { WallpaperCanvas } from "@/components/WallpaperCanvas";
import { WallpaperCard } from "@/components/WallpaperCard";
import { Reveal } from "@/components/Motion";
import {
  COLLECTIONS,
  collectionBySlug,
  relatedCollections,
  type Collection,
} from "@/data/collections";
import { getGenerator } from "@/lib/generators/families";
import { getPalette } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";
import { configFromSlug } from "@/lib/render";
import { seedLabel } from "@/lib/prng";

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

function resolve(slug: string): { collection: Collection; known: boolean } | null {
  const known = collectionBySlug(slug);
  if (known) return { collection: known, known: true };
  const config = configFromSlug(slug);
  if (!config) return null;
  const generator = getGenerator(config.family);
  return {
    known: false,
    collection: {
      slug,
      name: `${generator.name} ${seedLabel(config.seed)}`,
      family: config.family,
      palette: config.palette,
      seed: config.seed,
      params: config.params ?? { ...DEFAULT_PARAMS },
      tags: generator.tags.slice(0, 3),
      featured: false,
      config,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/wallpaper/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = resolve(slug);
  if (!found) return { title: "Wallpaper not found" };
  const { collection } = found;
  return {
    title: collection.name,
    description: `${getGenerator(collection.family).name} wallpaper in the ${getPalette(collection.palette).name} palette. Export it for any device up to 5K.`,
  };
}

export default async function WallpaperPage({ params }: PageProps<"/wallpaper/[slug]">) {
  const { slug } = await params;
  const found = resolve(slug);
  if (!found) notFound();

  const { collection, known } = found;
  const generator = getGenerator(collection.family);
  const palette = getPalette(collection.palette);
  const related = known ? relatedCollections(collection) : COLLECTIONS.slice(0, 4);

  const facts: Array<[string, string]> = [
    ["Family", generator.name],
    ["Palette", palette.name],
    ["Seed", seedLabel(collection.seed)],
    ["Mood", palette.mood],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[0.7rem] text-ink-faint">
        <Link href="/gallery" className="hover:text-ink">Gallery</Link>
        <span>/</span>
        <span className="text-ink-soft">{collection.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <DeviceFrame kind="desktop" ratio={16 / 9}>
            <WallpaperCanvas config={collection.config} ratio={16 / 9} eager rounded={false} />
          </DeviceFrame>
          <div className="mt-6">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">{collection.name}</h1>
            <p className="mt-2 max-w-lg text-sm text-ink-soft">{generator.blurb}.</p>
            {collection.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {collection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-edge px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-4">
            {facts.map(([term, value]) => (
              <div key={term} className="bg-bg p-4">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                  {term}
                </dt>
                <dd className="mt-1 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <DownloadPanel config={collection.config} name={collection.name} slug={collection.slug} />
        </div>
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="font-display text-2xl text-ink">
            {known ? "In the same vein" : "From the gallery"}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => (
            <WallpaperCard key={item.slug} collection={item} index={index} ratio={4 / 3} />
          ))}
        </div>
      </section>
    </div>
  );
}
