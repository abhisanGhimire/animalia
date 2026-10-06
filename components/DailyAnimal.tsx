"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import { useSettings } from "@/lib/settings";
import { dailyAnimal } from "@/lib/db";
import type { Animal } from "@/lib/types";

export default function DailyAnimal() {
  const { hideScary, mode } = useSettings();
  const [a, setA] = useState<Animal | null>(null);
  useEffect(() => {
    setA(dailyAnimal(new Date(), hideScary));
  }, [hideScary]);
  if (!a) return <div className="card h-56 animate-pulse" aria-busy />;
  const text = mode === "kid" ? a.kid : a.explorer;
  return (
    <section className="card grid gap-4 p-6 md:grid-cols-[auto_1fr]" aria-labelledby="aotd">
      <div className="bob text-8xl md:text-9xl" aria-hidden>{a.emoji}</div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-accent">⭐ Animal of the Day</p>
        <h2 id="aotd" className="text-3xl font-bold">{a.commonName}</h2>
        {mode !== "kid" && <p className="italic text-muted">{a.scientificName}</p>}
        <div className="my-2 flex flex-wrap gap-2 items-center">
          <StatusBadge code={a.conservation.code} kid={mode === "kid"} />
          <span className="text-sm text-muted">📍 {a.geography.countries.slice(0, 2).join(", ") || a.geography.continents.join(", ")}</span>
        </div>
        <p className="font-semibold">💡 Did you know? {text.facts[0]}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="btn" href={`/animals/${a.slug}`}>Learn more</Link>
        </div>
      </div>
    </section>
  );
}
