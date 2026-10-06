// Talks to GBIF (the Global Biodiversity Information Facility) straight from the browser.
// GBIF allows this (CORS is open), which is what lets the whole site be a static web app.
// We only pass along what GBIF says and never make up details.
const BASE = "https://api.gbif.org/v1";
const BACKBONE = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c";

export interface WorldAnimal {
  key: number;
  name: string;
  scientificName: string;
  phylum?: string; class?: string; order?: string; family?: string; genus?: string;
  extinct: boolean;
  threat?: string;
  gbifUrl: string;
}

export interface TreeChild {
  key: number;
  name: string; // everyday name when GBIF has one, else the science name
  scientificName: string;
  rank: string;
  count: number; // everything below it
  extinct: boolean;
}

interface GbifResult {
  key: number;
  canonicalName?: string;
  scientificName?: string;
  phylum?: string; class?: string; order?: string; family?: string; genus?: string;
  extinct?: boolean;
  threatStatuses?: string[];
  vernacularNames?: { vernacularName: string; language?: string }[];
}

const THREAT: Record<string, string> = {
  LEAST_CONCERN: "LC", NEAR_THREATENED: "NT", VULNERABLE: "VU", ENDANGERED: "EN",
  CRITICALLY_ENDANGERED: "CR", EXTINCT_IN_THE_WILD: "EW", EXTINCT: "EX",
};

export async function searchWorld(q: string, extinct: boolean, signal?: AbortSignal): Promise<{ results: WorldAnimal[]; total: number }> {
  const query = q.trim();
  if (query.length < 3) return { results: [], total: 0 };
  const p = new URLSearchParams({ q: query, highertaxonKey: "1", rank: "SPECIES", status: "ACCEPTED", datasetKey: BACKBONE, limit: "40" });
  if (extinct) p.set("extinct", "true");
  const res = await fetch(`${BASE}/species/search?${p}`, { signal });
  if (!res.ok) throw new Error(`GBIF ${res.status}`);
  const data = (await res.json()) as { results: GbifResult[]; count: number };
  const lq = query.toLowerCase();

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

  const results = scored.slice(0, 12).map(({ r, name }): WorldAnimal => ({
    key: r.key,
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    scientificName: r.canonicalName ?? r.scientificName ?? "",
    phylum: r.phylum, class: r.class, order: r.order, family: r.family, genus: r.genus,
    extinct: !!r.extinct,
    threat: r.threatStatuses?.map((x) => THREAT[x]).find(Boolean),
    gbifUrl: `https://www.gbif.org/species/${r.key}`,
  }));
  return { results, total: data.count };
}

// One level of the full animal family tree (kingdom Animalia has key 1).
export async function childrenOf(key: number, offset: number): Promise<{ children: TreeChild[]; next: number | null }> {
  const res = await fetch(`${BASE}/species/${key}/children?limit=30&offset=${offset}`);
  if (!res.ok) throw new Error(`GBIF ${res.status}`);
  const d = (await res.json()) as { results: Record<string, unknown>[]; endOfRecords: boolean };
  const children = d.results
    .filter((r) => r.taxonomicStatus === "ACCEPTED" || r.taxonomicStatus === undefined)
    .map((r): TreeChild => ({
      key: r.key as number,
      name: String(r.vernacularName ?? r.canonicalName ?? r.scientificName),
      scientificName: String(r.canonicalName ?? r.scientificName),
      rank: String(r.rank ?? ""),
      count: Number(r.numDescendants ?? 0),
      extinct: r.extinct === true,
    }));
  return { children, next: d.endOfRecords ? null : offset + 30 };
}
