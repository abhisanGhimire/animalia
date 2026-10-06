// The ONLY module that touches animal records. Everything else (API routes,
// pages) asks this file for data. To move to a real database later (Postgres,
// Elasticsearch, etc.), replace the internals of these functions and nothing
// else in the app has to change.
import { MAMMALS } from "@/data/mammals";
import { OTHERS } from "@/data/others";
import { MORE } from "@/data/more";
import { STATUS } from "@/data/reference";
import type { Animal, AnimalSummary, Continent, Diet } from "./types";

const ALL: Animal[] = [...MAMMALS, ...OTHERS, ...MORE];
const BY_SLUG = new Map(ALL.map((a) => [a.slug, a]));

export function toSummary(a: Animal): AnimalSummary {
  return {
    slug: a.slug,
    emoji: a.emoji,
    commonName: a.commonName,
    scientificName: a.scientificName,
    group: a.group,
    conservation: a.conservation.code,
    diet: a.diet,
    continents: a.geography.continents,
    kidSummary: a.kid.summary,
    dangerous: a.dangerous,
    extinct: a.extinct,
  };
}

export function getAnimal(slug: string): Animal | undefined {
  return BY_SLUG.get(slug);
}

export function allSlugs(): string[] {
  return ALL.map((a) => a.slug);
}

// ---------- fuzzy search ----------

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function haystack(a: Animal): { names: string[]; places: string[]; taxa: string[]; other: string[] } {
  return {
    names: [a.commonName, ...a.otherNames, a.scientificName].map(norm),
    places: [...a.geography.countries, ...a.geography.regions, ...a.geography.continents].map(norm),
    taxa: [a.taxonomy.class, a.taxonomy.order, a.taxonomy.family, a.taxonomy.genus, a.group].map(norm),
    other: [a.diet, a.dietDetail, a.kid.summary, a.explorer.summary, ...a.habitats].map(norm),
  };
}

const KNOWN_PLACES = new Set(ALL.flatMap((a) => [...a.geography.countries, ...a.geography.continents].map(norm)));

function scoreAnimal(a: Animal, q: string): number {
  const h = haystack(a);
  const tokens = q.split(/\s+/).filter((t) => t && !["animals", "animal", "in", "of", "the", "a", "and"].includes(t));
  if (!tokens.length) return 0;
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    if (KNOWN_PLACES.has(t) && !h.places.some((p) => p === t || p.split(/\s+/).includes(t))) return 0; // "nepal" means the country, not a nickname
    for (const n of h.names) {
      if (n === t) best = Math.max(best, 100);
      else if (n.startsWith(t)) best = Math.max(best, 90);
      else if (n.split(/[\s()-]+/).some((w) => w.startsWith(t))) best = Math.max(best, 80);
      else if (n.includes(t)) best = Math.max(best, 60);
      else if (t.length >= 4) {
        for (const w of n.split(/[\s()-]+/)) {
          if (editDistance(t, w.slice(0, t.length + 1), 2) <= (t.length > 5 ? 2 : 1)) best = Math.max(best, 50);
        }
      }
    }
    for (const p of h.places) if (p.includes(t)) best = Math.max(best, 70);
    for (const x of h.taxa) if (x.startsWith(t) || x.includes(t)) best = Math.max(best, 65);
    for (const o of h.other) if (o.includes(t)) best = Math.max(best, 25);
    if (best === 0) return 0; // every word must match something
    total += best;
  }
  return total / tokens.length;
}

// ---------- listing, filtering, paging ----------

export interface Query {
  q?: string;
  group?: string;
  continent?: string;
  diet?: string;
  status?: string;
  realm?: string;
  habitat?: string;
  domestic?: boolean;
  extinct?: boolean;
  hideScary?: boolean;
  page?: number;
  pageSize?: number;
  sort?: "name" | "status";
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export function listAnimals(query: Query = {}): Page<AnimalSummary> {
  const { q, group, continent, diet, status, realm, habitat, domestic, extinct, hideScary } = query;
  const pageSize = Math.min(Math.max(query.pageSize ?? 12, 1), 500);
  const page = Math.max(query.page ?? 1, 1);

  const rows = ALL.filter(
    (a) =>
      (!group || a.group === group) &&
      (!continent || a.geography.continents.includes(continent as Continent)) &&
      (!diet || a.diet === (diet as Diet)) &&
      (!status || a.conservation.code === status) &&
      (!realm || a.realm.includes(realm as Animal["realm"][number])) &&
      (!habitat || a.habitats.includes(habitat)) &&
      (domestic === undefined || a.domestic === domestic) &&
      (extinct === undefined || a.extinct === extinct) &&
      (!hideScary || !a.dangerous),
  );

  let ranked: { a: Animal; s: number }[];
  const nq = q ? norm(q) : "";
  if (nq) {
    ranked = rows
      .map((a) => ({ a, s: scoreAnimal(a, nq) }))
      .filter((r) => r.s > 0)
      .sort((x, y) => y.s - x.s || x.a.commonName.localeCompare(y.a.commonName));
  } else if (query.sort === "status") {
    ranked = rows
      .map((a) => ({ a, s: STATUS[a.conservation.code].rank }))
      .sort((x, y) => y.s - x.s || x.a.commonName.localeCompare(y.a.commonName));
  } else {
    ranked = rows.map((a) => ({ a, s: 0 })).sort((x, y) => x.a.commonName.localeCompare(y.a.commonName));
  }

  const total = ranked.length;
  const start = (page - 1) * pageSize;
  return {
    items: ranked.slice(start, start + pageSize).map((r) => toSummary(r.a)),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function suggest(q: string, hideScary = false, limit = 6): AnimalSummary[] {
  return listAnimals({ q, hideScary, pageSize: limit }).items;
}

// ---------- discovery ----------

export function dailyAnimal(date = new Date(), hideScary = false): Animal {
  const pool = ALL.filter((a) => !(hideScary && a.dangerous));
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return pool[day % pool.length];
}

export type SurpriseCategory = "any" | "endangered" | "biggest" | "smallest" | "extinct" | "cutest" | "fastest";

export function surprise(category: SurpriseCategory = "any", hideScary = false): Animal {
  let pool = ALL.filter((a) => !(hideScary && a.dangerous));
  const maxLen = (a: Animal) => a.lengthCm?.max ?? 0;
  if (category === "endangered") pool = pool.filter((a) => ["VU", "EN", "CR"].includes(a.conservation.code));
  if (category === "extinct") pool = pool.filter((a) => a.extinct);
  if (category === "cutest") pool = pool.filter((a) => ["koala", "giant-panda", "arctic-fox", "axolotl", "emperor-penguin", "ocellaris-clownfish"].includes(a.slug));
  if (category === "biggest") pool = [...pool].sort((x, y) => (y.weightKg?.max ?? 0) - (x.weightKg?.max ?? 0)).slice(0, 4);
  if (category === "smallest") pool = [...pool].filter((a) => maxLen(a) > 0).sort((x, y) => maxLen(x) - maxLen(y)).slice(0, 4);
  if (category === "fastest") pool = pool.filter((a) => a.topSpeedKmh);
  if (!pool.length) pool = ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function similarTo(slug: string, hideScary = false, limit = 4): { animal: AnimalSummary; why: string }[] {
  const base = getAnimal(slug);
  if (!base) return [];
  const scored = ALL.filter((a) => a.slug !== slug && !(hideScary && a.dangerous)).map((a) => {
    let score = 0;
    const reasons: string[] = [];
    if (a.taxonomy.family === base.taxonomy.family) { score += 5; reasons.push(`same family (${a.taxonomy.family})`); }
    else if (a.taxonomy.order === base.taxonomy.order) { score += 3; reasons.push(`same order (${a.taxonomy.order})`); }
    else if (a.group === base.group) { score += 1; reasons.push(`also a ${a.group.toLowerCase().replace(/s$/, "")}`); }
    if (a.habitats.some((h) => base.habitats.includes(h))) { score += 2; reasons.push("shares a habitat"); }
    if (a.geography.continents.some((c) => base.geography.continents.includes(c))) { score += 1; reasons.push("same continent"); }
    if (a.diet === base.diet) { score += 1; reasons.push("same diet"); }
    if (base.related.includes(a.slug)) { score += 2; }
    return { a, score, reasons };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((s) => ({ animal: toSummary(s.a), why: s.reasons.slice(0, 2).join(", ") || "related species" }));
}

export function facets() {
  const count = <T extends string>(fn: (a: Animal) => T[]) => {
    const m: Record<string, number> = {};
    for (const a of ALL) for (const k of fn(a)) m[k] = (m[k] ?? 0) + 1;
    return m;
  };
  return {
    groups: count((a) => [a.group]),
    continents: count((a) => a.geography.continents),
    diets: count((a) => [a.diet]),
    statuses: count((a) => [a.conservation.code]),
    habitats: count((a) => a.habitats),
    total: ALL.length,
  };
}

export function taxonomyTree() {
  type Node = { name: string; rank: string; children: Node[]; animals?: AnimalSummary[] };
  const root: Node = { name: "Animalia", rank: "Kingdom", children: [] };
  const ranks = ["phylum", "class", "order", "family", "genus"] as const;
  for (const a of ALL) {
    let node = root;
    for (const r of ranks) {
      const name = a.taxonomy[r];
      let child = node.children.find((c) => c.name === name);
      if (!child) {
        child = { name, rank: r[0].toUpperCase() + r.slice(1), children: [] };
        node.children.push(child);
      }
      node = child;
    }
    (node.animals ??= []).push(toSummary(a));
  }
  return root;
}

// ---------- quiz ----------

export interface QuizQuestion {
  prompt: string;
  emoji?: string;
  choices: string[];
  answer: string;
  explain: string;
  category: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function quiz(n = 6, hideScary = false): QuizQuestion[] {
  const pool = ALL.filter((a) => !(hideScary && a.dangerous));
  const alive = pool.filter((a) => !a.extinct);
  const out: QuizQuestion[] = [];
  const pick = shuffle(pool);
  const kinds = ["name", "continent", "diet", "status", "group", "truefalse"];
  for (let i = 0; out.length < n && i < pick.length * 2; i++) {
    const a = pick[i % pick.length];
    const kind = kinds[i % kinds.length];
    const others = <T,>(fn: (x: Animal) => T) => [...new Set(shuffle(ALL.filter((x) => x.slug !== a.slug)).map(fn))];
    if (kind === "name") {
      const hint = a.kid.facts.find((f) => !f.toLowerCase().includes(a.commonName.toLowerCase().split(" ").pop()!.replace(/s$/, "")));
      if (!hint) continue;
      const wrong = shuffle(alive.filter((x) => x.slug !== a.slug)).slice(0, 3).map((x) => x.commonName);
      out.push({ prompt: `Which animal is this? Clue: ${hint}`, choices: shuffle([a.commonName, ...wrong]), answer: a.commonName, explain: `It's the ${a.commonName}!`, category: "Animal names" });
    } else if (kind === "continent") {
      const right = a.geography.continents[0];
      const wrong = shuffle(["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"].filter((c) => !a.geography.continents.includes(c as Continent))).slice(0, 3);
      out.push({ prompt: `On which continent can you find the ${a.commonName}?`, emoji: a.emoji, choices: shuffle([right, ...wrong]), answer: right, explain: `${a.commonName} lives in ${a.geography.continents.join(", ")}.`, category: "Where animals live" });
    } else if (kind === "diet") {
      const wrong = shuffle((["Herbivore", "Carnivore", "Omnivore", "Filter feeder"] as Diet[]).filter((d) => d !== a.diet)).slice(0, 3);
      out.push({ prompt: `What kind of eater is the ${a.commonName}?`, emoji: a.emoji, choices: shuffle([a.diet, ...wrong]), answer: a.diet, explain: a.dietDetail, category: "What animals eat" });
    } else if (kind === "status") {
      const right = STATUS[a.conservation.code].label;
      if (a.conservation.code === "NE") continue;
      const wrong = shuffle(["Least Concern", "Vulnerable", "Endangered", "Critically Endangered", "Extinct"].filter((s) => s !== right)).slice(0, 3);
      out.push({ prompt: `What is the conservation status of the ${a.commonName}?`, emoji: a.emoji, choices: shuffle([right, ...wrong]), answer: right, explain: a.conservation.note ?? `The IUCN Red List groups it as ${right}.`, category: "Helping animals" });
    } else if (kind === "group") {
      const wrong = shuffle(others((x) => x.group).filter((g) => g !== a.group)).slice(0, 3);
      out.push({ prompt: `What kind of animal is the ${a.commonName}?`, emoji: a.emoji, choices: shuffle([a.group, ...wrong]), answer: a.group, explain: `${a.commonName} is in the ${a.taxonomy.class} class.`, category: "Animal groups" });
    } else {
      if (Math.floor(i / 6) % 2 === 0) {
        out.push({ prompt: `True or false? ${a.kid.facts[0]}`, emoji: a.emoji, choices: ["True", "False"], answer: "True", explain: `That's a real fact about the ${a.commonName}.`, category: "Fun facts" });
      } else {
        const wrongC = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"].find((c) => !a.geography.continents.includes(c as Continent)) ?? "Antarctica";
        out.push({ prompt: `True or false? The ${a.commonName} lives in ${wrongC}.`, emoji: a.emoji, choices: ["True", "False"], answer: "False", explain: `Not quite! It lives in ${a.geography.continents.join(", ")}.`, category: "Fun facts" });
      }
    }
  }
  return out.slice(0, n);
}
