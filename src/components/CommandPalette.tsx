"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COLLECTIONS } from "@/data/collections";
import { GENERATORS } from "@/lib/generators/families";
import { PALETTES } from "@/lib/palettes";
import { DEFAULT_PARAMS } from "@/lib/generators/shared";
import { configToQuery, type WallpaperConfig } from "@/lib/render";
import { useStore } from "@/store/useStore";

type Command = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
};

function randomConfig(): WallpaperConfig {
  const family = GENERATORS[Math.floor(Math.random() * GENERATORS.length)].id;
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
  return {
    family,
    palette,
    seed: Math.floor(Math.random() * 9999) + 1,
    params: {
      ...DEFAULT_PARAMS,
      density: 0.3 + Math.random() * 0.6,
      contrast: 0.35 + Math.random() * 0.6,
      turbulence: 0.2 + Math.random() * 0.7,
      detail: 0.3 + Math.random() * 0.6,
    },
  };
}

export function CommandPalette() {
  const router = useRouter();
  const open = useStore((state) => state.paletteOpen);
  const setOpen = useStore((state) => state.setPaletteOpen);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);

  // Reset the search and selection each time the palette opens or closes.
  if (wasOpen !== open) {
    setWasOpen(open);
    setQuery("");
    setActive(0);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => {
      setOpen(false);
      router.push(path);
    };
    const nav: Command[] = [
      { id: "home", label: "Go to Home", group: "Navigate", run: go("/") },
      { id: "gallery", label: "Open the Gallery", group: "Navigate", run: go("/gallery") },
      { id: "studio", label: "Open the Studio", group: "Navigate", run: go("/studio") },
      { id: "discover", label: "Open Discover", group: "Navigate", hint: "web sources", run: go("/discover") },
      { id: "shelf", label: "Open your Shelf", group: "Navigate", run: go("/gallery?view=shelf") },
      { id: "saved-photos", label: "Open saved photos", group: "Navigate", run: go("/discover?view=saved") },
      { id: "about", label: "About Tessera", group: "Navigate", run: go("/about") },
    ];
    const actions: Command[] = [
      {
        id: "surprise",
        label: "Surprise me with a wallpaper",
        group: "Actions",
        hint: "random",
        run: () => {
          setOpen(false);
          router.push(`/studio?${configToQuery(randomConfig())}`);
        },
      },
      {
        id: "search-photos",
        label: "Search photos on the web",
        group: "Actions",
        hint: "discover",
        run: () => {
          setOpen(false);
          router.push("/discover");
        },
      },
      { id: "theme", label: "Flip the theme", group: "Actions", run: () => toggleTheme() },
    ];
    const families: Command[] = GENERATORS.map((generator) => ({
      id: `f-${generator.id}`,
      label: `Design a ${generator.name} wallpaper`,
      group: "Families",
      hint: generator.tags[0],
      run: go(`/studio?f=${generator.id}`),
    }));
    const collections: Command[] = COLLECTIONS.map((collection) => ({
      id: `c-${collection.slug}`,
      label: collection.name,
      group: "Collections",
      hint: `${collection.family} / ${collection.palette}`,
      run: go(`/wallpaper/${collection.slug}`),
    }));
    return [...nav, ...actions, ...families, ...collections];
  }, [router, setOpen, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 9);
    return commands
      .filter((command) =>
        `${command.label} ${command.group} ${command.hint ?? ""}`.toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [commands, query]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % Math.max(1, filtered.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      filtered[active]?.run();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9997] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close command palette"
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="tile-surface relative w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
              <span className="h-2 w-2 rotate-45 bg-accent" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search families, palettes, collections, jump anywhere"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="hidden shrink-0 border border-edge px-1.5 py-0.5 font-mono text-[0.6rem] text-ink-faint sm:block">
                ESC
              </kbd>
            </div>
            <ul className="max-h-[52vh] overflow-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center font-mono text-xs text-ink-faint">
                  Nothing matches that yet
                </li>
              ) : (
                filtered.map((command, index) => (
                  <li key={command.id}>
                    <button
                      onMouseEnter={() => setActive(index)}
                      onClick={command.run}
                      className="flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left text-sm transition-colors"
                      style={{
                        background: index === active ? "var(--bg-sunken)" : "transparent",
                        color: index === active ? "var(--accent)" : "var(--ink)",
                      }}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">
                          {command.group}
                        </span>
                        <span className="truncate">{command.label}</span>
                      </span>
                      {command.hint ? (
                        <span className="shrink-0 font-mono text-[0.62rem] text-ink-faint">
                          {command.hint}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
