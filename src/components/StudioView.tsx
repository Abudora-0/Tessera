"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "./DeviceFrame";
import { FavoriteButton } from "./FavoriteButton";
import { ThemedSelect } from "./ThemedSelect";
import { ThemedSlider } from "./ThemedSlider";
import { WallpaperCanvas } from "./WallpaperCanvas";
import { GENERATORS, getGenerator } from "@/lib/generators/families";
import { PALETTES, getPalette } from "@/lib/palettes";
import { DEFAULT_PARAMS, type GeneratorParams } from "@/lib/generators/shared";
import {
  ALL_RESOLUTIONS,
  DEVICE_GROUPS,
  clampDimension,
  deviceKindForResolution,
  findResolution,
  type DeviceKind,
} from "@/lib/devices";
import {
  configFromParams,
  configToQuery,
  configToSlug,
  downloadWallpaper,
  type WallpaperConfig,
} from "@/lib/render";
import { seedLabel } from "@/lib/prng";

const PARAM_META: Array<{ key: keyof GeneratorParams; label: string }> = [
  { key: "density", label: "Density" },
  { key: "contrast", label: "Contrast" },
  { key: "detail", label: "Detail" },
  { key: "turbulence", label: "Turbulence" },
  { key: "grain", label: "Grain" },
];

function randomParams(): GeneratorParams {
  return {
    density: 0.3 + Math.random() * 0.6,
    contrast: 0.35 + Math.random() * 0.55,
    grain: 0.15 + Math.random() * 0.5,
    detail: 0.3 + Math.random() * 0.6,
    turbulence: 0.2 + Math.random() * 0.7,
  };
}

export function StudioView() {
  const router = useRouter();
  const params = useSearchParams();

  const [config, setConfig] = useState<WallpaperConfig>(() =>
    configFromParams((key) => params.get(key)),
  );
  const [resId, setResId] = useState<string>(() => params.get("r") ?? "fhd");
  const [custom, setCustom] = useState<{ w: number; h: number }>({ w: 1920, h: 1080 });
  const [deviceTab, setDeviceTab] = useState<DeviceKind>("desktop");
  const [rendering, setRendering] = useState(false);
  const [copied, setCopied] = useState(false);
  const firstRun = useRef(true);

  const isCustom = resId === "custom";
  const resolution = isCustom
    ? { id: "custom", label: "Custom", width: clampDimension(custom.w), height: clampDimension(custom.h) }
    : findResolution(resId) ?? ALL_RESOLUTIONS[0];

  const kind: DeviceKind = isCustom
    ? resolution.width >= resolution.height
      ? "desktop"
      : "mobile"
    : deviceKindForResolution(resId);

  const ratio = resolution.width / resolution.height;
  const previewConfig = useMemo(
    () => config,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config.family,
      config.palette,
      config.seed,
      config.params.density,
      config.params.contrast,
      config.params.grain,
      config.params.detail,
      config.params.turbulence,
    ],
  );

  // Keep the URL shareable without spamming history.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      const query = new URLSearchParams(configToQuery(config));
      query.set("r", resId);
      router.replace(`/studio?${query.toString()}`, { scroll: false });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [config, resId, router]);

  const generator = getGenerator(config.family);
  const palette = getPalette(config.palette);
  const slug = configToSlug(config);
  const label = seedLabel(config.seed);

  const setParam = (key: keyof GeneratorParams, value: number) =>
    setConfig((current) => ({ ...current, params: { ...current.params, [key]: value } }));

  const rollSeed = useCallback(
    () => setConfig((current) => ({ ...current, seed: Math.floor(Math.random() * 9999) + 1 })),
    [],
  );
  const rollAll = useCallback(
    () =>
      setConfig((current) => ({
        ...current,
        family: GENERATORS[Math.floor(Math.random() * GENERATORS.length)].id,
        palette: PALETTES[Math.floor(Math.random() * PALETTES.length)].id,
        seed: Math.floor(Math.random() * 9999) + 1,
        params: randomParams(),
      })),
    [],
  );
  const resetParams = () =>
    setConfig((current) => ({ ...current, params: { ...DEFAULT_PARAMS } }));

  const doDownload = useCallback(async () => {
    setRendering(true);
    try {
      await downloadWallpaper(config, resolution.width, resolution.height);
    } finally {
      setRendering(false);
    }
  }, [config, resolution.width, resolution.height]);

  const copyLink = async () => {
    const query = new URLSearchParams(configToQuery(config));
    query.set("r", resId);
    await navigator.clipboard.writeText(`${window.location.origin}/studio?${query.toString()}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "r" && event.shiftKey) rollAll();
      else if (key === "r") rollSeed();
      else if (key === "d") {
        event.preventDefault();
        void doDownload();
      } else if (key === "f") {
        const index = GENERATORS.findIndex((g) => g.id === config.family);
        setConfig((current) => ({
          ...current,
          family: GENERATORS[(index + 1) % GENERATORS.length].id,
        }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [config.family, doDownload, rollAll, rollSeed]);

  const familyOptions = GENERATORS.map((g) => ({ value: g.id, label: g.name, hint: g.tags[0] }));
  const paletteOptions = PALETTES.map((p) => ({ value: p.id, label: p.name }));
  const resolutionOptions = [
    ...(DEVICE_GROUPS.find((group) => group.kind === deviceTab)?.resolutions ?? []).map((r) => ({
      value: r.id,
      label: r.label,
      hint: r.note,
    })),
    { value: "custom", label: "Custom size", hint: "type it" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ink-faint">
            Studio
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {generator.name} in {palette.name}
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink-soft">{generator.blurb}.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.7rem] text-ink-faint">
          <kbd className="border border-edge px-1.5 py-1">R</kbd> seed
          <kbd className="border border-edge px-1.5 py-1">⇧R</kbd> all
          <kbd className="border border-edge px-1.5 py-1">F</kbd> family
          <kbd className="border border-edge px-1.5 py-1">D</kbd> download
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <DeviceFrame kind={kind} ratio={ratio}>
            <WallpaperCanvas config={previewConfig} ratio={ratio} eager rounded={false} />
          </DeviceFrame>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.7rem] text-ink-faint">
              {resolution.width} by {resolution.height} px, {label}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="focus-tile border border-edge bg-bg-raised px-3 py-2 font-mono text-[0.7rem] text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
              >
                {copied ? "Link copied" : "Copy link"}
              </button>
              <FavoriteButton
                slug={slug}
                name={`${generator.name} ${label}`}
                family={config.family}
                palette={config.palette}
                withLabel
              />
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <ThemedSelect
              label="Family"
              value={config.family}
              options={familyOptions}
              onChange={(value) => setConfig((current) => ({ ...current, family: value }))}
            />
            <ThemedSelect
              label="Palette"
              value={config.palette}
              options={paletteOptions}
              onChange={(value) => setConfig((current) => ({ ...current, palette: value }))}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {palette.colors.map((color) => (
              <span
                key={color}
                className="h-6 w-6 border border-edge"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                Seed
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rollSeed}
                  className="focus-tile border border-edge bg-bg-raised px-3 py-1.5 font-mono text-[0.7rem] text-ink-soft hover:border-accent hover:text-ink"
                >
                  Roll seed
                </button>
                <button
                  type="button"
                  onClick={rollAll}
                  className="focus-tile border border-edge bg-bg-raised px-3 py-1.5 font-mono text-[0.7rem] text-ink-soft hover:border-accent hover:text-ink"
                >
                  Roll everything
                </button>
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={999999}
              value={config.seed}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  seed: Math.max(1, Math.floor(Number(event.target.value) || 1)),
                }))
              }
              className="focus-tile w-full border border-edge bg-bg-raised px-3.5 py-2.5 font-mono text-sm text-ink"
            />
          </div>

          <div className="space-y-4 border-y border-edge py-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                Composition
              </span>
              <button
                type="button"
                onClick={resetParams}
                className="font-mono text-[0.66rem] text-ink-faint underline-offset-2 hover:text-accent hover:underline"
              >
                reset
              </button>
            </div>
            {PARAM_META.map((meta) => (
              <ThemedSlider
                key={meta.key}
                label={meta.label}
                value={config.params[meta.key]}
                onChange={(value) => setParam(meta.key, value)}
              />
            ))}
          </div>

          <div>
            <span className="mb-2 block font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
              Device
            </span>
            <div className="flex gap-1.5">
              {DEVICE_GROUPS.map((group) => (
                <button
                  key={group.kind}
                  type="button"
                  onClick={() => {
                    setDeviceTab(group.kind);
                    setResId(group.resolutions[0].id);
                  }}
                  className="focus-tile flex-1 border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: deviceTab === group.kind ? "var(--accent)" : "var(--edge)",
                    color: deviceTab === group.kind ? "var(--accent)" : "var(--ink-soft)",
                    background: deviceTab === group.kind ? "var(--bg-raised)" : "transparent",
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          <ThemedSelect
            label="Resolution"
            value={resId}
            options={resolutionOptions}
            onChange={setResId}
          />

          {isCustom ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                  Width
                </span>
                <input
                  type="number"
                  value={custom.w}
                  min={64}
                  max={8192}
                  onChange={(event) =>
                    setCustom((current) => ({ ...current, w: Number(event.target.value) || 0 }))
                  }
                  className="focus-tile w-full border border-edge bg-bg-raised px-3 py-2.5 font-mono text-sm text-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                  Height
                </span>
                <input
                  type="number"
                  value={custom.h}
                  min={64}
                  max={8192}
                  onChange={(event) =>
                    setCustom((current) => ({ ...current, h: Number(event.target.value) || 0 }))
                  }
                  className="focus-tile w-full border border-edge bg-bg-raised px-3 py-2.5 font-mono text-sm text-ink"
                />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            onClick={doDownload}
            disabled={rendering}
            className="focus-tile clip-tile flex w-full items-center justify-center gap-3 bg-accent px-6 py-4 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
          >
            {rendering ? (
              <>
                <span className="h-3.5 w-3.5 animate-[tessera-spin_0.8s_linear_infinite] border-2 border-accent-ink border-t-transparent" />
                Rendering {resolution.width} by {resolution.height}
              </>
            ) : (
              <>Download PNG, {resolution.width} by {resolution.height}</>
            )}
          </button>
          <p className="text-center font-mono text-[0.66rem] text-ink-faint">
            Rendered in your browser. Nothing is uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}
