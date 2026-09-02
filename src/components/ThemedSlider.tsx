"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

/**
 * A range control dressed in the mosaic language: the track fills with a
 * brass to violet gradient and the handle is a rotated tile. It wraps a real
 * input[type=range] so keyboard and screen reader behaviour stay intact.
 */
export function ThemedSlider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  format,
}: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : `${Math.round(pct)}`;

  return (
    <div className="tessera-slider">
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint"
        >
          {label}
        </label>
        <span className="font-mono text-[0.7rem] text-accent">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className="tessera-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}
