import { Suspense } from "react";
import AnimalBrowser from "@/components/AnimalBrowser";
import { STATUS } from "@/data/reference";

export const metadata = { title: "Conservation | Animalia" };

export default function ConservationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">🛟 Helping Animals in Trouble</h1>
      <p className="text-muted">
        Scientists group animals by how likely they are to disappear. The groups come from the IUCN Red List. We never make up population numbers: if a number isn&apos;t reliable, we say so.
      </p>
      <div className="card flex flex-wrap gap-2 p-4" aria-label="Status key">
        {Object.entries(STATUS).filter(([c]) => c !== "NE").sort((a, b) => a[1].rank - b[1].rank).map(([c, s]) => (
          <span key={c} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: s.color }}>{s.label} · {s.kid}</span>
        ))}
      </div>
      <Suspense fallback={<p>Loading…</p>}><AnimalBrowser fixed={{ sort: "status" }} /></Suspense>
    </div>
  );
}
