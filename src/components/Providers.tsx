"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { CommandPalette } from "./CommandPalette";
import { TileCursor } from "./TileCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).finally(() => {
      useStore.getState().setHydrated();
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <div className="grain-film" aria-hidden />
      {children}
      <TileCursor />
      <CommandPalette />
    </>
  );
}
