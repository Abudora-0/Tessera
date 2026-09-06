"use client";

import type { SourceInfo } from "@/lib/sources";

type Props = {
  sources: SourceInfo[];
  active: string;
  onChange: (id: string) => void;
};

export function SourceTabs({ sources, active, onChange }: Props) {
  const tabs = [
    { id: "all", label: "All", configured: sources.some((s) => s.configured) },
    ...sources.map((s) => ({ id: s.id, label: s.label, configured: s.configured })),
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={!tab.configured}
            onClick={() => onChange(tab.id)}
            title={tab.configured ? undefined : "Needs an API key in the environment"}
            className="focus-tile border px-3.5 py-2 text-sm transition-all hover:-translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
            style={{
              borderColor: isActive ? "var(--accent)" : "var(--edge)",
              color: isActive ? "var(--accent)" : "var(--ink-soft)",
              background: isActive ? "var(--bg-raised)" : "transparent",
            }}
          >
            {tab.label}
            {!tab.configured ? (
              <span className="ml-1.5 font-mono text-[0.55rem] uppercase tracking-wide text-ink-faint">
                key
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
