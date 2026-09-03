/**
 * The subreddits Discover is allowed to pull from. Keeping this an explicit
 * allowlist avoids arbitrary subreddit input and keeps the set on topic.
 */

export type SubredditGroup = {
  id: string;
  label: string;
  subs: string[];
};

export const SUBREDDIT_GROUPS: SubredditGroup[] = [
  { id: "wallpapers", label: "Wallpapers", subs: ["wallpapers", "wallpaper"] },
  { id: "anime", label: "Anime", subs: ["Animewallpaper", "Animewallpaperz"] },
  { id: "minimal", label: "Minimal", subs: ["MinimalWallpaper", "minimalist_wallpaper"] },
  { id: "widescreen", label: "Widescreen", subs: ["WQHD_Wallpaper", "widescreenwallpaper"] },
  { id: "mobile", label: "Mobile", subs: ["MobileWallpaper", "iphonewallpapers", "Verticalwallpapers"] },
  { id: "nature", label: "Nature", subs: ["EarthPorn", "SkyPorn", "SpacePorn"] },
];

export const DEFAULT_SUBREDDIT_GROUP = "wallpapers";

export const ALL_ALLOWED_SUBS = new Set(
  SUBREDDIT_GROUPS.flatMap((group) => group.subs).map((s) => s.toLowerCase()),
);

export function subsForCategory(category: string | undefined): string[] {
  const group = SUBREDDIT_GROUPS.find((g) => g.id === category);
  return (group ?? SUBREDDIT_GROUPS[0]).subs;
}

export const REDDIT_SORTS = [
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
  { value: "rising", label: "Rising" },
];

export const REDDIT_TIMES = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];
