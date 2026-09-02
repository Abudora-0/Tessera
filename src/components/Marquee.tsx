"use client";

type Props = {
  items: string[];
  className?: string;
};

/** An infinite ticker of words, doubled so the loop is seamless. */
export function Marquee({ items, className }: Props) {
  const run = [...items, ...items];
  return (
    <div
      className={`group relative flex overflow-hidden border-y border-edge bg-bg-sunken py-3 ${className ?? ""}`}
    >
      <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8 group-hover:[animation-play-state:paused]">
        {run.map((item, index) => (
          <span key={index} className="flex items-center gap-8">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-ink-faint">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="animate-marquee flex shrink-0 items-center gap-8 pr-8 group-hover:[animation-play-state:paused]"
      >
        {run.map((item, index) => (
          <span key={index} className="flex items-center gap-8">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-ink-faint">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
