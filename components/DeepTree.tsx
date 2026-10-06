"use client";
import { useState } from "react";
import { KID } from "@/data/kidnames";
import type { TreeChild } from "@/app/api/world/children/route";

const RANK: Record<string, string> = {
  PHYLUM: "Big group", CLASS: "Group", ORDER: "Family line", FAMILY: "Family", GENUS: "Close cousins", SPECIES: "Kind of animal",
};

function Branch({ node }: { node: TreeChild }) {
  const [open, setOpen] = useState(false);
  const [kids, setKids] = useState<TreeChild[]>([]);
  const [next, setNext] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const leaf = node.rank === "SPECIES";
  const nick = KID[node.scientificName];

  async function load() {
    if (next === null || busy) return;
    setBusy(true); setErr(false);
    try {
      const d = await fetch(`/api/world/children?key=${node.key}&offset=${next}`).then((r) => r.json());
      if (d.error) setErr(true);
      setKids((k) => [...k, ...d.children]);
      setNext(d.next);
    } catch { setErr(true); }
    setBusy(false);
  }

  function toggle() {
    const o = !open;
    setOpen(o);
    if (o && kids.length === 0) load();
  }

  const title = nick ? nick[0] : node.name;
  return (
    <li className="border-l-4 border-line pl-3">
      {leaf ? (
        <a className="block py-1 underline-offset-2 hover:underline" href={`https://www.gbif.org/species/${node.key}`} target="_blank" rel="noreferrer">
          🐾 <b>{title}</b> <i className="text-sm text-muted">{node.scientificName}</i>{node.extinct && " 🦴"}
        </a>
      ) : (
        <>
          <button className="w-full py-1 text-left" onClick={toggle} aria-expanded={open}>
            <span aria-hidden>{open ? "▾" : "▸"} {nick?.[1] ?? "🌿"} </span><b>{title}</b>
            {(nick || title !== node.scientificName) && <i className="ml-1 text-sm text-muted">({node.scientificName})</i>}
            <span className="ml-2 text-xs text-muted">{RANK[node.rank] ?? node.rank.toLowerCase()} · {node.count.toLocaleString()} inside{node.extinct ? " · 🦴 extinct" : ""}</span>
          </button>
          {open && (
            <ul className="ml-2 space-y-0.5">
              {kids.map((c) => <Branch key={c.key} node={c} />)}
              {busy && <li className="py-1 text-sm text-muted" aria-busy>Loading…</li>}
              {err && <li className="py-1 text-sm">Oops, could not load. <button className="underline" onClick={load}>Try again</button></li>}
              {!busy && next !== null && !err && <li><button className="chip" onClick={load}>Show more</button></li>}
            </ul>
          )}
        </>
      )}
    </li>
  );
}

export default function DeepTree() {
  const [started, setStarted] = useState(false);
  const [roots, setRoots] = useState<TreeChild[]>([]);
  const [err, setErr] = useState(false);

  async function start() {
    setStarted(true);
    try {
      const d = await fetch("/api/world/children?key=1").then((r) => r.json());
      if (d.error) setErr(true);
      setRoots(d.children);
    } catch { setErr(true); }
  }

  return (
    <section className="card space-y-3 p-5" aria-labelledby="deep">
      <h2 id="deep" className="text-2xl font-bold">🌌 The Giant Tree: every animal we know</h2>
      <p className="text-muted">
        This branch of the tree reaches almost every animal scientists have named, including many extinct ones known from fossils (marked 🦴).
        It takes a moment to open each branch because the names come from a giant online list.
        Pick any animal at the end to see its science page.
      </p>
      {!started ? <button className="btn" onClick={start}>Open the giant tree 🌳</button> : err ? <p>Could not reach the big animal list. Check your internet.</p> : (
        <ul className="space-y-0.5">{roots.map((r) => <Branch key={r.key} node={r} />)}</ul>
      )}
      <p className="text-xs text-muted">
        Source: GBIF Backbone Taxonomy. No list is ever complete: scientists find new species every year, and most extinct species never left a fossil, so we can never know them all.
      </p>
    </section>
  );
}
