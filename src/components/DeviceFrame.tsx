"use client";

import type { ReactNode } from "react";
import type { DeviceKind } from "@/lib/devices";

/** A light bezel around the preview so the aspect ratio reads as a real screen. */
export function DeviceFrame({
  kind,
  ratio,
  children,
}: {
  kind: DeviceKind;
  ratio: number;
  children: ReactNode;
}) {
  const isHandheld = kind !== "desktop";
  const pad = isHandheld ? 10 : 14;
  const radius = isHandheld ? 26 : 8;

  return (
    <div className="flex w-full items-center justify-center">
      <div
        className="relative max-h-[68vh] border border-edge-strong bg-bg-sunken"
        style={{
          padding: pad,
          borderRadius: radius,
          aspectRatio: String(ratio),
          maxWidth: ratio >= 1 ? "100%" : "min(100%, 42vh)",
          boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8)",
        }}
      >
        {kind === "desktop" ? (
          <span className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-edge-strong" />
        ) : (
          <span className="absolute left-1/2 top-2.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-edge-strong" />
        )}
        <div
          className="h-full w-full overflow-hidden"
          style={{ borderRadius: Math.max(2, radius - pad) }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
