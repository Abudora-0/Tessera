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

export type SavedPhoto = {
  source: string;
  id: string;
  title: string;
  thumbUrl: string;
  color: string;
  addedAt: number;
};

type StoreState = {
  theme: ThemeMode;
  favorites: FavoriteEntry[];
  savedPhotos: SavedPhoto[];
  nsfwEnabled: boolean;
  paletteOpen: boolean;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setHydrated: () => void;
  setPaletteOpen: (open: boolean) => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (entry: Omit<FavoriteEntry, "addedAt">) => void;
  clearFavorites: () => void;
  isSavedPhoto: (source: string, id: string) => boolean;
  toggleSavedPhoto: (entry: Omit<SavedPhoto, "addedAt">) => void;
  clearSavedPhotos: () => void;
  setNsfwEnabled: (value: boolean) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      favorites: [],
      savedPhotos: [],
      nsfwEnabled: false,
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
      isSavedPhoto: (source, id) =>
        get().savedPhotos.some((item) => item.source === source && item.id === id),
      toggleSavedPhoto: (entry) => {
        const exists = get().savedPhotos.some(
          (item) => item.source === entry.source && item.id === entry.id,
        );
        set({
          savedPhotos: exists
            ? get().savedPhotos.filter(
                (item) => !(item.source === entry.source && item.id === entry.id),
              )
            : [{ ...entry, addedAt: Date.now() }, ...get().savedPhotos].slice(0, 120),
        });
      },
      clearSavedPhotos: () => set({ savedPhotos: [] }),
      setNsfwEnabled: (nsfwEnabled) => set({ nsfwEnabled }),
    }),
    {
      name: "tessera-shelf",
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        favorites: state.favorites,
        savedPhotos: state.savedPhotos,
        nsfwEnabled: state.nsfwEnabled,
      }),
    },
  ),
);
