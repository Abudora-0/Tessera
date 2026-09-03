import Link from "next/link";
import { AnimatedLogo } from "./AnimatedLogo";

const REPO = "https://github.com/Abudora-0/tessera";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-edge bg-bg-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <AnimatedLogo />
          <p className="max-w-xs text-sm text-ink-soft">
            A generative wallpaper studio. Every piece is drawn from a seed, so it
            renders pixel perfect at any resolution you ask for.
          </p>
        </div>

        <nav className="space-y-2 text-sm">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
            Explore
          </p>
          <Link href="/gallery" className="block text-ink-soft hover:text-ink">Gallery</Link>
          <Link href="/studio" className="block text-ink-soft hover:text-ink">Studio</Link>
          <Link href="/discover" className="block text-ink-soft hover:text-ink">Discover</Link>
          <Link href="/gallery?view=shelf" className="block text-ink-soft hover:text-ink">Your shelf</Link>
          <Link href="/about" className="block text-ink-soft hover:text-ink">About</Link>
        </nav>

        <div className="space-y-2 text-sm">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
            Devices
          </p>
          <p className="text-ink-soft">Desktop up to 5K</p>
          <p className="text-ink-soft">Phones edge to edge</p>
          <p className="text-ink-soft">Tablets in portrait</p>
          <p className="text-ink-soft">Any custom size</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
            Project
          </p>
          <a href={REPO} className="block text-ink-soft hover:text-ink" target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
          <a href={`${REPO}/blob/main/LICENSE`} className="block text-ink-soft hover:text-ink" target="_blank" rel="noreferrer">
            MIT License
          </a>
          <p className="pt-2 font-mono text-[0.68rem] text-ink-faint">
            Built with Next.js and a lot of canvas.
          </p>
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 font-mono text-[0.7rem] text-ink-faint sm:flex-row">
          <span>Tessera, {new Date().getFullYear()}. Released under the MIT License.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
            Press ⌘K anywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
