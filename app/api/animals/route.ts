import { NextRequest, NextResponse } from "next/server";
import { listAnimals } from "@/lib/db";

// Server-side search + filtering + pagination. The browser never receives the whole database.
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const bool = (k: string) => (p.has(k) ? p.get(k) === "true" : undefined);
  const result = listAnimals({
    q: p.get("q") ?? undefined,
    group: p.get("group") ?? undefined,
    continent: p.get("continent") ?? undefined,
    diet: p.get("diet") ?? undefined,
    status: p.get("status") ?? undefined,
    realm: p.get("realm") ?? undefined,
    habitat: p.get("habitat") ?? undefined,
    domestic: bool("domestic"),
    extinct: bool("extinct"),
    hideScary: p.get("hideScary") === "true",
    page: Number(p.get("page") ?? 1) || 1,
    pageSize: Number(p.get("pageSize") ?? 12) || 12,
    sort: p.get("sort") === "status" ? "status" : "name",
  });
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=60" } });
}
