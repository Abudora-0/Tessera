import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoDetail } from "@/components/discover/PhotoDetail";
import { getAdapter } from "@/lib/sources";

export const dynamic = "force-dynamic";

async function load(source: string, id: string) {
  const adapter = getAdapter(source);
  if (!adapter || !adapter.isConfigured()) return null;
  return adapter.getItem(decodeURIComponent(id)).catch(() => null);
}

export async function generateMetadata({
  params,
}: PageProps<"/discover/[source]/[id]">): Promise<Metadata> {
  const { source, id } = await params;
  const item = await load(source, id);
  if (!item) return { title: "Wallpaper not found" };
  return {
    title: item.title,
    description: `${item.title}. Wallpaper from ${source} by ${item.author.name}. Download it from Tessera Discover.`,
  };
}

export default async function DiscoverItemPage({
  params,
}: PageProps<"/discover/[source]/[id]">) {
  const { source, id } = await params;
  const item = await load(source, id);
  if (!item) notFound();
  return <PhotoDetail item={item} />;
}
