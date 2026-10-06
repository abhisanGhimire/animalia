"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STATUS } from "@/data/reference";
import { getAnimal, listAnimals } from "@/lib/db";
import type { Animal, Range } from "@/lib/types";

const NA = "Reliable information is currently unavailable.";
const rng = (r?: Range, u = "") => (r ? `${r.min}–${r.max} ${u}`.trim() : NA);

function overlap(a: [number, number][]): [number, number] | null {
  const lo = Math.max(...a.map((x) => x[0]));
  const hi = Math.min(...a.map((x) => x[1]));
  return lo <= hi ? [lo, hi] : null;
}

function TankCheck({ fish }: { fish: Animal[] }) {
  const f = fish.filter((a) => a.aquarium);
  if (f.length < 2) return <p className="text-muted">Pick at least two fish that have aquarium data (try Betta, Neon Tetra, Bronze Corydoras).</p>;
  const temp = overlap(f.map((a) => a.aquarium!.tempC));
  const ph = overlap(f.map((a) => a.aquarium!.ph));
  const water = new Set(f.map((a) => a.aquarium!.water));
  const aggressive = f.filter((a) => a.aquarium!.temperament !== "Peaceful");
  const tank = Math.max(...f.map((a) => a.aquarium!.minTankLitres));
  const school = f.filter((a) => a.aquarium!.groupMin >= 5);
  const checks: { ok: boolean | "warn"; text: string }[] = [
    { ok: water.size === 1, text: water.size === 1 ? `All need ${[...water][0].toLowerCase()} water.` : "These animals need different kinds of water (fresh vs salt)." },
    { ok: !!temp, text: temp ? `Shared temperature range: ${temp[0]}–${temp[1]} °C.` : "Their temperature ranges do not overlap." },
    { ok: !!ph, text: ph ? `Shared pH range: ${ph[0]}–${ph[1]}.` : "Their pH ranges do not overlap." },
    { ok: aggressive.length ? "warn" : true, text: aggressive.length ? `${aggressive.map((a) => a.commonName).join(", ")} can be territorial or aggressive. Watch for fin-nipping and chasing.` : "All are peaceful." },
    { ok: "warn", text: `Tank size: at least ${tank} L for the biggest need, and more for several groups.` },
    ...school.map((a) => ({ ok: "warn" as const, text: `${a.commonName} needs a group of ${a.aquarium!.groupMin}+, so that adds to the tank size.` })),
  ];
  const bad = checks.some((c) => c.ok === false);
  return (
    <div className="card space-y-2 p-5">
      <h2 className="text-xl font-bold">{bad ? "❌ Probably not a good match" : "✅ Could work with care"}</h2>
      <ul className="space-y-1">{checks.map((c, i) => <li key={i}>{c.ok === true ? "✅" : c.ok === "warn" ? "⚠️" : "❌"} {c.text}</li>)}</ul>
      <p className="text-sm text-muted">This is a simple guide based on typical hobbyist ranges, not a guarantee. Ask an aquarium specialist before buying fish.</p>
    </div>
  );
}

function CompareInner() {
  const sp = useSearchParams();
  const tankMode = sp.get("mode") === "tank";
  const all = listAnimals({ pageSize: 500 }).items;
  const [sel, setSel] = useState<string[]>(() => (sp.get("a") ? [sp.get("a")!] : []));
  const animals = sel.map((s) => getAnimal(s)).filter((a): a is Animal => !!a);

  const rows: [string, (a: Animal) => string][] = [
    ["Group", (a) => a.group],
    ["Length", (a) => rng(a.lengthCm, "cm")],
    ["Weight", (a) => rng(a.weightKg, "kg")],
    ["Top speed", (a) => (a.topSpeedKmh ? `${a.topSpeedKmh} km/h` : NA)],
    ["Lifespan", (a) => rng(a.lifespanYears, "years")],
    ["Eats", (a) => a.diet],
    ["Lives in", (a) => a.geography.continents.join(", ")],
    ["Social life", (a) => a.social],
    ["Status", (a) => STATUS[a.conservation.code].label],
  ];

  function toggle(slug: string) {
    setSel((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length >= 5 ? s : [...s, slug]));
  }
  const pool = tankMode ? all.filter((a) => a.group === "Fish" || a.slug === "axolotl") : all;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{tankMode ? "🐠 Can they live together?" : "⚖️ Compare Animals"}</h1>
      <p className="text-muted">Pick 2 to 5 animals. {tankMode ? "We check water, size and temperament." : "Sizes for wild animals are ranges; they vary a lot."}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose animals">
        {pool.map((a) => <button key={a.slug} className="chip" aria-pressed={sel.includes(a.slug)} onClick={() => toggle(a.slug)}>{a.emoji} {a.commonName}</button>)}
      </div>
      <div className="flex gap-2">
        <Link className="chip" href="/compare" aria-current={!tankMode}>Compare animals</Link>
        <Link className="chip" href="/compare?mode=tank" aria-current={tankMode}>Tank mates</Link>
      </div>

      {tankMode ? <TankCheck fish={animals} /> : animals.length >= 2 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Animal comparison</caption>
            <thead><tr><th className="p-3"></th>{animals.map((a) => <th key={a.slug} className="p-3"><span className="text-4xl">{a.emoji}</span><br />{a.commonName}</th>)}</tr></thead>
            <tbody>{rows.map(([label, fn]) => (
              <tr key={label} className="border-t-2 border-line"><th scope="row" className="p-3 text-sm text-muted">{label}</th>{animals.map((a) => <td key={a.slug} className="p-3">{fn(a)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="card p-6 text-center">Choose at least two animals to compare them side by side. ⚖️</p>}
    </div>
  );
}

export default function ComparePage() {
  return <Suspense fallback={<p>Loading…</p>}><CompareInner /></Suspense>;
}
