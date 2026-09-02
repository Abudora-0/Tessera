"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

export type FavoriteEntry = {
  slug: string;
  name: string;
  family: string;
  palette: string;
  addedAt: number;
};

type StoreState = {
  theme: ThemeMode;
  favorites: FavoriteEntry[];
  paletteOpen: boolean;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setHydrated: () => void;
  setPaletteOpen: (open: boolean) => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (entry: Omit<FavoriteEntry, "addedAt">) => void;
  clearFavorites: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      favorites: [],
      paletteOpen: false,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setHydrated: () => set({ hydrated: true }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      isFavorite: (slug) => get().favorites.some((entry) => entry.slug === slug),
      toggleFavorite: (entry) => {
        const exists = get().favorites.some((item) => item.slug === entry.slug);
        set({
          favorites: exists
            ? get().favorites.filter((item) => item.slug !== entry.slug)
            : [{ ...entry, addedAt: Date.now() }, ...get().favorites].slice(0, 60),
        });
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "tessera-shelf",
      skipHydration: true,
      partialize: (state) => ({ theme: state.theme, favorites: state.favorites }),
    },
  ),
);
