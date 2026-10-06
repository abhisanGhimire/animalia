import { NextRequest, NextResponse } from "next/server";

// "Find Any Animal": asks GBIF (the Global Biodiversity Information Facility, a free public
// database of ~2 million animal species) for names and family-tree info. We only pass along
// what GBIF tells us and never make up details. Curated kid pages exist for our own animals.
const BACKBONE = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c";

interface GbifResult {
  key: number;
  canonicalName?: string;
  scientificName?: string;
  phylum?: string; class?: string; order?: string; family?: string; genus?: string;
  extinct?: boolean;
  threatStatuses?: string[];
  vernacularNames?: { vernacularName: string; language?: string }[];
}

export interface WorldAnimal {
  key: number;
  name: string;
  scientificName: string;
  phylum?: string; class?: string; order?: string; family?: string; genus?: string;
  extinct: boolean;
  threat?: string;
  gbifUrl: string;
}

const THREAT: Record<string, string> = {
  LEAST_CONCERN: "LC", NEAR_THREATENED: "NT", VULNERABLE: "VU", ENDANGERED: "EN",
  CRITICALLY_ENDANGERED: "CR", EXTINCT_IN_THE_WILD: "EW", EXTINCT: "EX",
};

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ results: [], total: 0 });

  const url = new URL("https://api.gbif.org/v1/species/search");
  url.searchParams.set("q", q);
  url.searchParams.set("highertaxonKey", "1"); // 1 = kingdom Animalia, so no plants or fungi
  url.searchParams.set("rank", "SPECIES");
  url.searchParams.set("status", "ACCEPTED");
  url.searchParams.set("datasetKey", BACKBONE);
  if (req.nextUrl.searchParams.get("extinct") === "true") url.searchParams.set("extinct", "true");
  url.searchParams.set("limit", "40");

  try {
    const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`GBIF ${res.status}`);
    const data = (await res.json()) as { results: GbifResult[]; count: number };
    const lq = q.toLowerCase();

    const scored = data.results.map((r) => {
      const eng = (r.vernacularNames ?? []).filter((v) => v.language === "eng").map((v) => v.vernacularName);
      const sci = (r.canonicalName ?? "").toLowerCase();
      let s = 0;
      let best = eng[0];
      for (const n of eng) {
        const l = n.toLowerCase();
        const words = l.split(/[^a-z]+/);
        const v = l === lq ? 100 : words.includes(lq) ? 70 - Math.min(l.length, 40) / 4 : l.startsWith(lq) ? 50 : l.includes(lq) ? 20 : 0;
        if (v > s) { s = v; best = n; }
      }
      if (sci === lq) s = Math.max(s, 100);
      else if (sci.startsWith(lq)) s = Math.max(s, 60);
      return { r, s, name: best ?? r.canonicalName ?? r.scientificName ?? "Unknown" };
    });
    scored.sort((a, b) => b.s - a.s);

    const results: WorldAnimal[] = scored.slice(0, 12).map(({ r, name }) => {
      const t = r.threatStatuses?.map((x) => THREAT[x]).find(Boolean);
      return {
        key: r.key, name: name.replace(/\b\w/g, (c) => c.toUpperCase()), scientificName: r.canonicalName ?? r.scientificName ?? "",
        phylum: r.phylum, class: r.class, order: r.order, family: r.family, genus: r.genus,
        extinct: !!r.extinct, threat: t, gbifUrl: `https://www.gbif.org/species/${r.key}`,
      };
    });
    return NextResponse.json({ results, total: data.count });
  } catch {
    return NextResponse.json({ results: [], total: 0, error: "The big animal list could not be reached right now. Try again in a moment." }, { status: 502 });
  }
}
