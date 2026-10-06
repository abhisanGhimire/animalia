"use client";
import AnimalCard from "@/components/AnimalCard";
import { useProgress, streak } from "@/lib/store";
import { listAnimals } from "@/lib/db";
import type { AnimalSummary } from "@/lib/types";

function Grid({ title, items, empty }: { title: string; items: AnimalSummary[]; empty: string }) {
  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      {items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((a) => <AnimalCard key={a.slug} a={a} />)}</div> : <p className="card p-4 text-muted">{empty}</p>}
    </section>
  );
}

export default function CollectionPage() {
  const { favorites, recent, quiz, streakDays, ready } = useProgress();
  const all = listAnimals({ pageSize: 500 }).items;
  const by = (slugs: string[]) => slugs.map((s) => all.find((a) => a.slug === s)).filter(Boolean) as AnimalSummary[];
  const accuracy = quiz.answered ? Math.round((quiz.correct / quiz.answered) * 100) : 0;

  const stats: [string, string | number][] = [
    ["🔎 Animals discovered", recent.length], ["❤️ Saved", favorites.length], ["🔥 Day streak", streak(streakDays)],
    ["🧠 Quiz accuracy", `${accuracy}%`], ["⭐ XP", quiz.xp],
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">📒 My Collection</h1>
      <p className="text-muted">Saved in this browser only. No account needed, and nothing is sent anywhere.</p>
      {ready && (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map(([l, v]) => <div key={l} className="card p-3 text-center"><dd className="text-2xl font-bold">{v}</dd><dt className="text-xs text-muted">{l}</dt></div>)}
        </dl>
      )}
      <Grid title="❤️ My Animals" items={by(favorites)} empty="Tap “Save” on any animal to keep it here." />
      <Grid title="👀 Recently viewed" items={by(recent).slice(0, 6)} empty="Animals you visit will show up here." />
    </div>
  );
}
