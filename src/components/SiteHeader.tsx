"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "@/store/useStore";
import { useMounted } from "@/lib/useMounted";

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/studio", label: "Studio" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const setPaletteOpen = useStore((state) => state.setPaletteOpen);
  const favorites = useStore((state) => state.favorites);
  const mounted = useMounted();
  const favCount = mounted ? favorites.length : 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors duration-300"
      style={{
        borderColor: scrolled ? "var(--edge)" : "transparent",
        background: scrolled ? "color-mix(in srgb, var(--bg) 82%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="focus-tile shrink-0" aria-label="Tessera home">
          <AnimatedLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const activeLink = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="focus-tile relative px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
                {activeLink ? (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="focus-tile hidden items-center gap-2 border border-edge bg-bg-raised px-2.5 py-1.5 font-mono text-[0.7rem] text-ink-faint transition-colors hover:border-edge-strong hover:text-ink-soft sm:flex"
          >
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
            Search
            <kbd className="border border-edge px-1 py-0.5 text-[0.6rem]">⌘K</kbd>
          </button>

          <Link
            href="/gallery?view=shelf"
            aria-label={`Your shelf, ${favCount} saved`}
            className="focus-tile relative grid h-9 w-9 place-items-center border border-edge bg-bg-raised transition-colors hover:border-edge-strong"
          >
            <span className="h-3.5 w-3.5 border-2 border-ink-soft" style={{ clipPath: "polygon(0 0, 100% 0, 100% 65%, 65% 100%, 0 100%)" }} />
            {favCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center bg-accent px-1 font-mono text-[0.6rem] text-accent-ink">
                {favCount}
              </span>
            ) : null}
          </Link>

          <ThemeToggle />

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
            className="focus-tile grid h-9 w-9 place-items-center border border-edge bg-bg-raised md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className="absolute left-0 h-0.5 w-full bg-ink transition-transform"
                style={{ top: mobileOpen ? "50%" : 0, transform: mobileOpen ? "rotate(45deg)" : "none" }}
              />
              <span
                className="absolute left-0 top-1/2 h-0.5 w-full bg-ink transition-opacity"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="absolute left-0 h-0.5 w-full bg-ink transition-transform"
                style={{ bottom: mobileOpen ? "50%" : 0, transform: mobileOpen ? "rotate(-45deg)" : "none" }}
              />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-edge bg-bg-raised px-5 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm text-ink-soft"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mt-1 block py-2.5 text-left text-sm text-ink-soft"
          >
            Search everything
          </button>
        </div>
      ) : null}
    </header>
  );
}
