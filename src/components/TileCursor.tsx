"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useMounted } from "@/lib/useMounted";

/**
 * A small tile that follows the pointer and rotates with its velocity. Only
 * mounts on devices that have a fine pointer, and disables itself entirely
 * when reduced motion is requested.
 */
export function TileCursor() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const dotRef = useRef<HTMLDivElement>(null);
  const [finePointer] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(pointer: fine)").matches,
  );
  const enabled = mounted && finePointer && !reduce;

  useEffect(() => {
    if (!enabled) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let rot = 0;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
    };
    const onDown = () => dotRef.current?.style.setProperty("--press", "0.6");
    const onUp = () => dotRef.current?.style.setProperty("--press", "1");

    const loop = () => {
      const dx = tx - x;
      const dy = ty - y;
      x += dx * 0.18;
      y += dy * 0.18;
      rot += (Math.atan2(dy, dx) * (180 / Math.PI) - rot) * 0.1;
      const node = dotRef.current;
      if (node) {
        node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot + 45}deg) scale(var(--press, 1))`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998] h-4 w-4 border border-accent bg-accent/10 mix-blend-difference"
      style={{ transition: "opacity 0.2s ease" }}
    />
  );
}
