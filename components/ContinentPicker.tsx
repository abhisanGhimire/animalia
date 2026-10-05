"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CONTINENTS } from "@/data/reference";

// A simple tile "map": big colourful continent buttons laid out roughly like the world.
const LAYOUT: Record<string, string> = {
  "North America": "col-start-1 row-start-1", Europe: "col-start-2 row-start-1", Asia: "col-start-3 row-start-1",
  "South America": "col-start-1 row-start-2", Africa: "col-start-2 row-start-2", Oceania: "col-start-3 row-start-2",
  Antarctica: "col-span-3 row-start-3",
};

export default function ContinentPicker() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const current = sp.get("continent");
  function pick(name: string) {
    const n = new URLSearchParams(sp.toString());
    if (current === name) n.delete("continent"); else n.set("continent", name);
    n.delete("page");
    router.replace(`${path}?${n.toString()}`, { scroll: false });
  }
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Continents">
      {CONTINENTS.map((c) => (
        <button key={c.name} onClick={() => pick(c.name)} aria-pressed={current === c.name}
          className={`${LAYOUT[c.name]} rounded-3xl p-4 text-center font-bold text-white transition hover:scale-[1.02] ${current === c.name ? "ring-4 ring-ink" : ""}`}
          style={{ background: c.color }}>
          <span className="block text-4xl" aria-hidden>{c.emoji}</span>{c.name}
        </button>
      ))}
    </div>
  );
}
