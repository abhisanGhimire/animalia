"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AnimalCard from "./AnimalCard";
import { useSettings } from "@/lib/settings";
import { CONTINENTS, STATUS, HABITATS } from "@/data/reference";
import type { AnimalSummary } from "@/lib/types";

interface Page { items: AnimalSummary[]; total: number; page: number; pages: number }

const GROUPS = ["Mammals", "Birds", "Reptiles", "Amphibians", "Fish", "Insects", "Arachnids", "Crustaceans", "Mollusks", "Cnidarians", "Echinoderms", "Annelids", "Myriapods", "Sponges", "Other"];
const DIETS = ["Herbivore", "Carnivore", "Omnivore", "Filter feeder"];
const REALMS = ["Land", "Freshwater", "Marine", "Air"];

// Filters live in the URL, so every filtered view can be bookmarked or shared.
// `fixed` pins filters (e.g. the Conservation page pins sort=status).
export default function AnimalBrowser({ fixed = {}, hide = [] }: { fixed?: Record<string, string>; hide?: string[] }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const { hideScary } = useSettings();
  const [data, setData] = useState<Page | null>(null);

  const params = new URLSearchParams(sp.toString());
  const qs = new URLSearchParams(params);
  for (const [k, v] of Object.entries(fixed)) qs.set(k, v);
  qs.set("hideScary", String(hideScary));
  qs.set("pageSize", "12");
  const key = qs.toString();

  useEffect(() => {
    const ctl = new AbortController();
    fetch(`/api/animals?${key}`, { signal: ctl.signal }).then((r) => r.json()).then(setData).catch(() => {});
    return () => ctl.abort();
  }, [key]);

  function set(k: string, v: string) {
    const n = new URLSearchParams(sp.toString());
    if (v) n.set(k, v); else n.delete(k);
    if (k !== "page") n.delete("page");
    router.replace(`${path}?${n.toString()}`, { scroll: false });
  }

  const select = (k: string, label: string, opts: [string, string][]) =>
    hide.includes(k) ? null : (
      <label className="text-sm font-bold">
        {label}
        <select className="mt-1 block rounded-full border-2 border-line bg-card px-3 py-1.5" value={params.get(k) ?? ""} onChange={(e) => set(k, e.target.value)}>
          <option value="">Any</option>
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
    );

  const filtersOn = ["q", "group", "continent", "diet", "status", "realm", "habitat"].some((k) => params.get(k));

  return (
    <div>
      <div className="card mb-4 flex flex-wrap items-end gap-3 p-4" role="search" aria-label="Filter animals">
        <label className="text-sm font-bold">Search
          <input className="mt-1 block rounded-full border-2 border-line bg-card px-3 py-1.5" defaultValue={params.get("q") ?? ""} onChange={(e) => set("q", e.target.value)} placeholder="e.g. cats in Nepal" />
        </label>
        {select("group", "Animal group", GROUPS.map((g) => [g, g]))}
        {select("continent", "Continent", CONTINENTS.map((c) => [c.name, c.name]))}
        {select("diet", "Eats", DIETS.map((d) => [d, d]))}
        {select("realm", "Lives in", REALMS.map((r) => [r, r]))}
        {select("habitat", "Habitat", HABITATS.map((h) => [h.id, h.name]))}
        {select("status", "Status", Object.entries(STATUS).filter(([c]) => c !== "NE").map(([c, s]) => [c, s.label]))}
        {filtersOn && <button className="btn btn-ghost" onClick={() => router.replace(path)}>Clear</button>}
      </div>

      {!data ? (
        <p aria-busy>Loading animals…</p>
      ) : data.items.length === 0 ? (
        <p className="card p-6 text-center">No animals match yet. Try fewer filters! 🔎</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted" aria-live="polite">{data.total} animal{data.total === 1 ? "" : "s"} found</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((a) => <AnimalCard key={a.slug} a={a} />)}</div>
          {data.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pages">
              <button className="btn btn-ghost" disabled={data.page <= 1} onClick={() => set("page", String(data.page - 1))}>← Back</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn btn-ghost" disabled={data.page >= data.pages} onClick={() => set("page", String(data.page + 1))}>Next →</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
