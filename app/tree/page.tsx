import Link from "next/link";
import { taxonomyTree } from "@/lib/db";
import type { AnimalSummary } from "@/lib/types";
import { KID } from "@/data/kidnames";
import DeepTree from "@/components/DeepTree";

export const metadata = { title: "Tree of Life | Animalia" };

type Node = { name: string; rank: string; children: Node[]; animals?: AnimalSummary[] };

const RANK_KID: Record<string, string> = { Phylum: "Big group", Class: "Group", Order: "Family line", Family: "Family", Genus: "Close cousins" };

function count(n: Node): number {
  return (n.animals?.length ?? 0) + n.children.reduce((s, c) => s + count(c), 0);
}

function Branch({ n, depth }: { n: Node; depth: number }) {
  const kid = KID[n.name];
  const total = count(n);
  const label = (
    <>
      <span aria-hidden>{kid?.[1] ?? "🌿"} </span>
      <b>{kid ? kid[0] : n.name}</b>
      {kid && <span className="ml-1 text-sm italic text-muted">({n.name})</span>}
      <span className="ml-2 text-xs text-muted">{RANK_KID[n.rank] ?? n.rank} · {total} animal{total === 1 ? "" : "s"}</span>
    </>
  );
  return (
    <details open={depth < 2} className="ml-0 border-l-4 border-line pl-3 [&>summary]:py-1" style={{ borderColor: depth === 0 ? "var(--brand)" : undefined }}>
      <summary className="cursor-pointer">{label}</summary>
      <div className="ml-2 space-y-1">
        {n.children.map((c) => <Branch key={c.name} n={c} depth={depth + 1} />)}
        {n.animals && (
          <div className="flex flex-wrap gap-2 py-1">
            {n.animals.map((a) => <Link key={a.slug} href={`/animals/${a.slug}`} className="chip">{a.emoji} {a.commonName}</Link>)}
          </div>
        )}
      </div>
    </details>
  );
}

export default function TreePage() {
  const root = taxonomyTree() as Node;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">🌳 The Tree of Life</h1>
      <p className="text-muted">
        All animals are relatives! Scientists sort them like a family tree: big branches split into smaller and smaller ones.
        Tap a branch to open it. The animals at the end of this first tree have their own pages. Scroll down for the giant tree with almost every animal.
      </p>
      <div className="card p-4">
        <details open className="border-l-4 pl-3" style={{ borderColor: "var(--brand)" }}>
          <summary className="cursor-pointer py-1 text-xl"><span aria-hidden>🌍 </span><b>All animals</b> <span className="text-sm italic text-muted">(Animalia)</span><span className="ml-2 text-xs text-muted">{count(root)} animals</span></summary>
          <div className="ml-2 space-y-1">{root.children.map((c) => <Branch key={c.name} n={c} depth={1} />)}</div>
        </details>
      </div>
      <DeepTree />
      <p className="text-sm text-muted">Looking for one animal? Try <Link className="underline" href="/find">Find Any Animal</Link>.</p>
    </div>
  );
}
