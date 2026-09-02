import Link from "next/link";
import { AnimatedLogo } from "@/components/AnimatedLogo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-32 text-center">
      <AnimatedLogo withWordmark={false} size={64} />
      <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-ink-faint">
        Error 404
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">This tile is missing.</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-soft">
        The page you were after does not exist, but there are a few hundred
        thousand wallpapers that do.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="focus-tile clip-tile bg-accent px-6 py-3 text-sm font-medium text-accent-ink"
        >
          Back home
        </Link>
        <Link
          href="/gallery"
          className="focus-tile border border-edge-strong px-6 py-3 text-sm text-ink hover:border-accent"
        >
          Open the gallery
        </Link>
      </div>
    </div>
  );
}
