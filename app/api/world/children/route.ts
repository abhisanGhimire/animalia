import { NextRequest, NextResponse } from "next/server";

// One level of the full animal family tree, straight from GBIF (kingdom Animalia has key 1).
// Called when a child opens a branch, so we only ever load a few names at a time.
export interface TreeChild {
  key: number;
  name: string; // everyday name when GBIF has one, else the science name
  scientificName: string;
  rank: string;
  count: number; // everything below it
  extinct: boolean;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const key = Number(p.get("key") ?? 1);
  const offset = Math.max(Number(p.get("offset") ?? 0) || 0, 0);
  if (!Number.isInteger(key) || key < 1) return NextResponse.json({ error: "bad key" }, { status: 400 });
  try {
    const res = await fetch(`https://api.gbif.org/v1/species/${key}/children?limit=30&offset=${offset}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const d = (await res.json()) as { results: Record<string, unknown>[]; endOfRecords: boolean };
    const children: TreeChild[] = d.results
      .filter((r) => r.taxonomicStatus === "ACCEPTED" || r.taxonomicStatus === undefined)
      .map((r) => ({
        key: r.key as number,
        name: String(r.vernacularName ?? r.canonicalName ?? r.scientificName),
        scientificName: String(r.canonicalName ?? r.scientificName),
        rank: String(r.rank ?? ""),
        count: Number(r.numDescendants ?? 0),
        extinct: r.extinct === true,
      }));
    return NextResponse.json({ children, next: d.endOfRecords ? null : offset + 30 });
  } catch {
    return NextResponse.json({ children: [], next: null, error: "Could not reach the big animal list." }, { status: 502 });
  }
}
