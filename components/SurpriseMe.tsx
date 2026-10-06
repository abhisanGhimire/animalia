"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSettings } from "@/lib/settings";
import { surprise, type SurpriseCategory } from "@/lib/db";

const CATS = [
  ["any", "🎲 Anything"], ["cutest", "🥰 Cutest"], ["biggest", "🐋 Biggest"], ["smallest", "🐜 Smallest"],
  ["endangered", "🛟 Endangered"], ["extinct", "🦤 Extinct"],
] as const;

export default function SurpriseMe() {
  const router = useRouter();
  const { hideScary } = useSettings();
  const [cat, setCat] = useState<string>("any");
  const [busy, setBusy] = useState(false);

  function go() {
    setBusy(true);
    const a = surprise(cat as SurpriseCategory, hideScary);
    router.push(`/animals/${a.slug}`);
  }

  return (
    <section className="card p-6 text-center" aria-labelledby="surprise">
      <h2 id="surprise" className="text-2xl font-bold">🎁 Surprise Me!</h2>
      <div className="my-3 flex flex-wrap justify-center gap-2" role="group" aria-label="Surprise category">
        {CATS.map(([id, label]) => <button key={id} className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>{label}</button>)}
      </div>
      <button className="btn text-lg" onClick={go} disabled={busy}>{busy ? "Finding…" : "Show me an animal!"}</button>
    </section>
  );
}
