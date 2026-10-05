"use client";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { useSettings } from "@/lib/settings";
import type { AnimalSummary } from "@/lib/types";

export default function AnimalCard({ a }: { a: AnimalSummary }) {
  const { mode } = useSettings();
  const kid = mode === "kid";
  return (
    <Link href={`/animals/${a.slug}`} className="card group block p-4 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-6xl transition group-hover:scale-110" aria-hidden>{a.emoji}</div>
      <h3 className="mt-2 text-xl font-bold">{a.commonName}</h3>
      {!kid && <p className="text-sm italic text-muted">{a.scientificName}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StatusBadge code={a.conservation} kid={kid} />
        <span className="text-xs font-semibold text-muted">{a.group}</span>
      </div>
      {kid && <p className="mt-2 line-clamp-2 text-sm text-muted">{a.kidSummary}</p>}
    </Link>
  );
}
