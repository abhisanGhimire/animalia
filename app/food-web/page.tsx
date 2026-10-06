"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FOOD_WEBS, ROLES, type WebNode } from "@/data/foodwebs";

const W = 800, H = 460;

export default function FoodWebPage() {
  const [webId, setWebId] = useState(FOOD_WEBS[0].id);
  const web = FOOD_WEBS.find((w) => w.id === webId)!;
  const [selId, setSelId] = useState<string | null>(null);

  // Place each node in a column by role, spread evenly top to bottom.
  const pos = useMemo(() => {
    const out: Record<string, { x: number; y: number }> = {};
    for (let c = 0; c <= 3; c++) {
      const col = web.nodes.filter((n) => n.role !== "decomposer" && ROLES[n.role].column === c);
      col.forEach((n, i) => { out[n.id] = { x: 90 + c * 207, y: 20 + ((i + 0.5) * 330) / col.length + 25 }; });
    }
    web.nodes.filter((n) => n.role === "decomposer").forEach((n) => { out[n.id] = { x: W / 2, y: H - 50 }; });
    return out;
  }, [web]);

  const sel = web.nodes.find((n) => n.id === selId) ?? null;
  const eats = (id: string) => web.eats.filter(([, e]) => e === id).map(([f]) => web.nodes.find((n) => n.id === f)!);
  const eatenBy = (id: string) => web.eats.filter(([f]) => f === id).map(([, e]) => web.nodes.find((n) => n.id === e)!);
  const linked = (n: WebNode) => !sel || n.id === sel.id || eats(sel.id).some((x) => x.id === n.id) || eatenBy(sel.id).some((x) => x.id === n.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">🕸️ Food Webs</h1>
      <p className="text-muted">A food web shows who eats whom. Arrows point from the <b>food</b> to the <b>eater</b>, because the energy travels that way. Tap an animal or plant to learn about its job!</p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a place">
        {FOOD_WEBS.map((w) => <button key={w.id} className="chip" aria-pressed={w.id === webId} onClick={() => { setWebId(w.id); setSelId(null); }}>{w.emoji} {w.name}</button>)}
      </div>
      <p>{web.blurb}</p>

      <div className="card overflow-hidden p-2">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Food web for ${web.name}`} className="w-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink)" /></marker>
          </defs>
          {[0, 1, 2, 3].map((c) => (
            <text key={c} x={90 + c * 207} y={16} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--muted)">
              {(["Makes food", "Plant-eaters", "Meat-eaters", "Top predators"] as const)[c]}
            </text>
          ))}
          {web.eats.map(([f, e]) => {
            const a = pos[f], b = pos[e];
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
            const x1 = a.x + (dx / len) * 38, y1 = a.y + (dy / len) * 38, x2 = b.x - (dx / len) * 44, y2 = b.y - (dy / len) * 44;
            const on = !sel || f === sel.id || e === sel.id;
            return <line key={f + e} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={on ? 2.5 : 1} opacity={on ? 0.8 : 0.15} markerEnd="url(#arrow)" />;
          })}
          {web.nodes.map((n) => {
            const p = pos[n.id];
            const on = linked(n);
            return (
              <g key={n.id} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0} aria-label={`${n.name}, ${ROLES[n.role].label}`} aria-pressed={selId === n.id}
                onClick={() => setSelId(selId === n.id ? null : n.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelId(selId === n.id ? null : n.id); } }}
                style={{ cursor: "pointer", opacity: on ? 1 : 0.3 }}>
                <circle r="34" fill="var(--card)" stroke={ROLES[n.role].color} strokeWidth={selId === n.id ? 7 : 4} />
                <text textAnchor="middle" dominantBaseline="central" fontSize="32">{n.emoji}</text>
                <text y="54" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">{n.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold" aria-label="Colour key">
        {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((r) => <span key={r} className="rounded-full px-3 py-1 text-white" style={{ background: ROLES[r].color }}>{ROLES[r].label}</span>)}
      </div>

      <section className="card p-5" aria-live="polite">
        {sel ? (
          <>
            <p className="text-6xl" aria-hidden>{sel.emoji}</p>
            <h2 className="text-2xl font-bold">{sel.name}</h2>
            <p className="my-1"><span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: ROLES[sel.role].color }}>{ROLES[sel.role].label}</span> <span className="text-sm text-muted">{ROLES[sel.role].kid}</span></p>
            <p className="text-lg">{sel.about}</p>
            {eats(sel.id).length > 0 && <p className="mt-2"><b>Eats:</b> {eats(sel.id).map((n) => `${n.emoji} ${n.name}`).join(", ")}</p>}
            {eatenBy(sel.id).length > 0 && <p><b>Gets eaten by:</b> {eatenBy(sel.id).map((n) => `${n.emoji} ${n.name}`).join(", ")}</p>}
            {sel.role === "decomposer" && <p>🔁 Every plant and animal in this web will be recycled by these helpers one day.</p>}
            {sel.slug && <Link className="btn mt-3" href={`/animals/${sel.slug}`}>Meet the {sel.name}</Link>}
          </>
        ) : <p className="text-muted">👆 Pick something in the web to see what it eats and what eats it.</p>}
      </section>

      <details className="card p-4">
        <summary className="cursor-pointer font-bold">Read the web as a list</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {web.eats.map(([f, e]) => <li key={f + e}>{web.nodes.find((n) => n.id === f)!.name} → eaten by → {web.nodes.find((n) => n.id === e)!.name}</li>)}
        </ul>
      </details>
    </div>
  );
}
