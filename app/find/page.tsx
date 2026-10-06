"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { useDebounced } from "@/components/useDebounced";
import type { WorldAnimal } from "@/app/api/world/route";
import type { AnimalSummary } from "@/lib/types";

export default function FindPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 400);
  const [mine, setMine] = useState<AnimalSummary[]>([]);
  const [world, setWorld] = useState<WorldAnimal[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (dq.trim().length < 3) { setMine([]); setWorld([]); setState("idle"); return; }
    const ctl = new AbortController();
    setState("loading");
    fetch(`/api/animals?q=${encodeURIComponent(dq)}&pageSize=6`, { signal: ctl.signal }).then((r) => r.json()).then((d) => setMine(d.items)).catch(() => {});
    fetch(`/api/world?q=${encodeURIComponent(dq)}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((d) => { setWorld(d.results ?? []); setTotal(d.total ?? 0); setState(d.error ? "error" : "done"); })
      .catch((e) => { if (e.name !== "AbortError") setState("error"); });
    return () => ctl.abort();
  }, [dq]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">🔎 Find Any Animal</h1>
      <p className="text-muted">
        We have kid pages for our favourite animals, but there are about two million kinds of animals on Earth!
        Type a name here to look up almost any of them in a giant science database called GBIF.
      </p>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="Animal name"
        placeholder="Try: red fox, ladybird, narwhal, axolotl…" className="w-full rounded-full border-2 border-line bg-card px-6 py-4 text-lg" />

      {mine.length > 0 && (
        <section aria-labelledby="mine">
          <h2 id="mine" className="mb-2 text-xl font-bold">⭐ Animals with a full Animalia page</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {mine.map((a) => <Link key={a.slug} href={`/animals/${a.slug}`} className="card flex items-center gap-3 p-3"><span className="text-4xl" aria-hidden>{a.emoji}</span><span><b>{a.commonName}</b><br /><span className="text-sm text-muted">{a.group}</span></span></Link>)}
          </div>
        </section>
      )}

      {state === "loading" && <p aria-busy>Searching the big animal list…</p>}
      {state === "error" && <p className="card p-4">Oops! The big animal list could not be reached. Check your internet and try again.</p>}
      {state === "done" && (
        <section aria-labelledby="world">
          <h2 id="world" className="mb-2 text-xl font-bold">🌍 From the big animal list ({total.toLocaleString()} matches)</h2>
          {world.length === 0 && <p className="card p-4">No animals found. Try another spelling!</p>}
          <ul className="space-y-3">
            {world.map((w) => (
              <li key={w.key} className="card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{w.name}</h3>
                  <span className="italic text-muted">{w.scientificName}</span>
                  {w.threat && <StatusBadge code={w.threat as never} kid />}
                  {w.extinct && <span className="chip">🦴 Extinct</span>}
                </div>
                <p className="mt-1 text-sm">
                  <b>Family tree:</b> {[w.phylum, w.class, w.order, w.family, w.genus].filter(Boolean).join(" → ") || "Reliable information is currently unavailable."}
                </p>
                <a className="mt-1 inline-block text-sm underline" href={w.gbifUrl} target="_blank" rel="noreferrer">See the science page (GBIF)</a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            These results come straight from GBIF. We haven&apos;t written a kid story for them yet. The best match isn&apos;t always first, so check the scientific name.
          </p>
        </section>
      )}
    </div>
  );
}
