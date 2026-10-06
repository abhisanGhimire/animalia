import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import DailyAnimal from "@/components/DailyAnimal";
import SurpriseMe from "@/components/SurpriseMe";
import { CONTINENTS } from "@/data/reference";
import { facets } from "@/lib/db";

const GROUP_EMOJI: Record<string, string> = {
  Mammals: "🦁", Birds: "🦜", Reptiles: "🐢", Amphibians: "🐸", Fish: "🐠", Insects: "🦋", Arachnids: "🕷️", Crustaceans: "🦀", Mollusks: "🐙", Cnidarians: "🪼", Echinoderms: "⭐", Annelids: "🪱", Myriapods: "🐛", Sponges: "🧽", Other: "🔬",
};

export default function Home() {
  const f = facets();
  return (
    <div className="space-y-10">
      <section className="text-center">
        <p className="text-6xl" aria-hidden>🦒🐘🐧🦋</p>
        <h1 className="mt-2 text-4xl font-bold md:text-6xl">Explore Every Animal on Earth</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">Meet {f.total} animals so far. Search, play and discover!</p>
        <div className="mx-auto mt-5 max-w-2xl"><SearchBox big /></div>
      </section>

      <DailyAnimal />

      <section aria-labelledby="world">
        <h2 id="world" className="mb-3 text-2xl font-bold">🌍 Explore the World</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CONTINENTS.map((c) => (
            <Link key={c.name} href={`/animals?continent=${encodeURIComponent(c.name)}`} className="card p-4 transition hover:-translate-y-1" style={{ borderColor: c.color }}>
              <div className="text-4xl" aria-hidden>{c.emoji}</div>
              <h3 className="font-bold">{c.name}</h3>
              <p className="text-sm text-muted">{f.continents[c.name] ?? 0} animals</p>
            </Link>
          ))}
          <Link href="/map" className="card flex items-center justify-center p-4 font-bold text-brand">Open the map →</Link>
        </div>
      </section>

      <section aria-labelledby="groups">
        <h2 id="groups" className="mb-3 text-2xl font-bold">🧬 Animal Groups</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(f.groups).map(([g, n]) => (
            <Link key={g} className="chip text-base" href={`/animals?group=${g}`}>{GROUP_EMOJI[g] ?? "🐾"} {g} ({n})</Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <SurpriseMe />
        <section className="card p-6 text-center">
          <h2 className="text-2xl font-bold">🕸️ Who eats who?</h2>
          <p className="my-2 text-muted">See how animals and plants are connected, and grow the tree of life.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/food-web" className="btn">🕸️ Food webs</Link>
            <Link href="/tree" className="btn btn-ghost">🌳 Tree of life</Link>
            <Link href="/learn" className="btn btn-ghost">🧠 Quiz</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
