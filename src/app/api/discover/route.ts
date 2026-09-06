import { NextResponse } from "next/server";
import { search, sourceCatalog } from "@/lib/sources";
import type { Orientation } from "@/lib/sources/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const source = searchParams.get("source") || "all";
  const orientation = (searchParams.get("orientation") || "any") as Orientation;

  const result = await search(source, {
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    orientation,
    page: searchParams.get("page") || undefined,
    nsfw: searchParams.get("nsfw") === "1",
    sort: searchParams.get("sort") || undefined,
  });

  return NextResponse.json(
    { ...result, sources: sourceCatalog() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
