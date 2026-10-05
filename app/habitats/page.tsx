import Link from "next/link";
import { HABITATS } from "@/data/reference";
import { facets } from "@/lib/db";

export const metadata = { title: "Habitats | Animalia" };

export default function HabitatsPage() {
  const f = facets();
  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">🏞️ Habitats</h1>
      <p className="mb-4 text-muted">A habitat is an animal&apos;s natural home. Pick one to see who lives there.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HABITATS.map((h) => (
          <Link key={h.id} href={`/animals?habitat=${h.id}`} className="card block p-5 transition hover:-translate-y-1">
            <p className="text-5xl" aria-hidden>{h.emoji}</p>
            <h2 className="text-xl font-bold">{h.name}</h2>
            <p className="text-sm text-muted">{h.blurb}</p>
            <p className="mt-1 text-sm"><b>Climate:</b> {h.climate}</p>
            <p className="mt-1 text-sm font-bold text-brand">{f.habitats[h.id] ?? 0} animal{f.habitats[h.id] === 1 ? "" : "s"} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
