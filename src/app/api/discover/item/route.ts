import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/sources";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const id = searchParams.get("id");

  if (!source || !id) {
    return NextResponse.json({ error: "source and id are required" }, { status: 400 });
  }

  const adapter = getAdapter(source);
  if (!adapter) {
    return NextResponse.json({ error: "unknown source" }, { status: 404 });
  }

  const item = await adapter.getItem(id).catch(() => null);
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(
    { item },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } },
  );
}
