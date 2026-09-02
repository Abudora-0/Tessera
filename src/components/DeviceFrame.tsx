"use client";

import type { ReactNode } from "react";
import type { DeviceKind } from "@/lib/devices";

/** A light bezel around the preview so the aspect ratio reads as a real screen. */
export function DeviceFrame({
  kind,
  ratio,
  children,
  maxHeightVh = 68,
}: {
  kind: DeviceKind;
  ratio: number;
  children: ReactNode;
  maxHeightVh?: number;
}) {
  const isHandheld = kind !== "desktop";
  const pad = isHandheld ? 10 : 14;
  const radius = isHandheld ? 26 : 8;

  return (
    <div className="flex w-full justify-center">
      <div
        className="relative w-full border border-edge-strong bg-bg-sunken"
        style={{
          padding: pad,
          borderRadius: radius,
          aspectRatio: String(ratio),
          maxWidth: `min(100%, calc(${maxHeightVh}vh * ${ratio}))`,
          boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8)",
        }}
      >
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-edge-strong"
          style={{ top: isHandheld ? 3 : 4, height: isHandheld ? 5 : 4, width: isHandheld ? 60 : 40 }}
        />
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
