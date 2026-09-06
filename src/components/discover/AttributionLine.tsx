import type { SourceWallpaper } from "@/lib/sources/types";

const SOURCE_LABEL: Record<string, string> = {
  unsplash: "Unsplash",
  pexels: "Pexels",
  pixabay: "Pixabay",
  wallhaven: "Wallhaven",
  nasa: "NASA",
};

/** Author, source and licence, shown on every card and detail page. */
export function AttributionLine({
  item,
  variant = "card",
}: {
  item: Pick<SourceWallpaper, "source" | "author" | "sourceUrl" | "license">;
  variant?: "card" | "full";
}) {
  const sourceName = SOURCE_LABEL[item.source] ?? item.source;

  if (variant === "card") {
    return (
      <p className="flex items-center gap-1.5 truncate font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
        <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-accent/70" />
        <span className="truncate">{item.author.name}</span>
        <span className="text-ink-faint/60">/</span>
        <span className="shrink-0">{sourceName}</span>
      </p>
    );
  }

  return (
    <div className="space-y-1 text-sm text-ink-soft">
      <p>
        By{" "}
        {item.author.url ? (
          <a href={item.author.url} target="_blank" rel="noreferrer" className="text-ink underline-offset-2 hover:text-accent hover:underline">
            {item.author.name}
          </a>
        ) : (
          <span className="text-ink">{item.author.name}</span>
        )}{" "}
        on{" "}
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-ink underline-offset-2 hover:text-accent hover:underline">
          {sourceName}
        </a>
      </p>
      <p className="font-mono text-[0.7rem] text-ink-faint">
        {item.license.url ? (
          <a href={item.license.url} target="_blank" rel="noreferrer" className="hover:text-accent">
            {item.license.name}
          </a>
        ) : (
          item.license.name
        )}
      </p>
    </div>
  );
}
