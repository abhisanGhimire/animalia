"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LessonSVG from "@/components/LessonSVG";
import DrawCanvas from "@/components/DrawCanvas";
import { lessonFor } from "@/lib/lessons";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/store";
import type { Animal, AnimalSummary } from "@/lib/types";

type Level = "kid" | "beginner" | "advanced";

function DrawInner() {
  const sp = useSearchParams();
  const { mode } = useSettings();
  const { markDrawn, drawn } = useProgress();
  const [list, setList] = useState<AnimalSummary[]>([]);
  const [slug, setSlug] = useState(sp.get("animal") ?? "african-lion");
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [level, setLevel] = useState<Level>(mode === "kid" ? "kid" : "beginner");
  const [step, setStep] = useState(0);

  useEffect(() => { fetch("/api/animals?pageSize=60").then((r) => r.json()).then((d) => setList(d.items)); }, []);
  useEffect(() => { fetch(`/api/animals/${slug}`).then((r) => r.json()).then((a) => { setAnimal(a); setStep(0); }); }, [slug]);

  const steps = useMemo(() => (animal ? lessonFor(animal.bodyPlan) : null), [animal]);
  const choices = list.filter((a) => ["Mammals", "Birds", "Fish", "Reptiles"].includes(a.group));
  const shown = steps ? (level === "kid" ? steps.filter((_, i) => i !== 2 && i !== 6) : steps) : [];
  const cur = Math.min(step, Math.max(shown.length - 1, 0));
  const s = shown[cur];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">✏️ Drawing Academy</h1>
      <p className="text-muted">Great artists look first, then draw. Each step shows a shape AND what to notice.</p>

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm font-bold">Animal
          <select className="mt-1 block rounded-full border-2 border-line bg-card px-3 py-1.5" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {choices.map((a) => <option key={a.slug} value={a.slug}>{a.emoji} {a.commonName}</option>)}
          </select>
        </label>
        <div role="group" aria-label="Level" className="flex gap-1">
          {([["kid", "🧒 Little artist"], ["beginner", "✏️ Beginner"], ["advanced", "🎨 Advanced"]] as [Level, string][]).map(([l, label]) => (
            <button key={l} className="chip" aria-pressed={level === l} onClick={() => { setLevel(l); setStep(0); }}>{label}</button>
          ))}
        </div>
      </div>

      {animal && !steps && <p className="card p-6">Lessons for {animal.commonName} are coming soon. Try a four-legged animal, a bird or a fish!</p>}

      {animal && s && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-5" aria-labelledby="lesson">
            <p className="text-sm font-bold text-muted">Step {cur + 1} of {shown.length}</p>
            <h2 id="lesson" className="text-2xl font-bold">{s.title}</h2>
            <LessonSVG steps={shown} upTo={cur} label={`Drawing of step ${cur + 1}: ${s.title}`} className="my-3 w-full rounded-2xl bg-bg" />
            <p className="text-lg font-semibold">{s.kid}</p>
            <p className="mt-2 rounded-2xl bg-bg p-3">👀 <b>Look closely:</b> {level === "kid" ? s.look.split(". ")[0] + "." : s.look}</p>
            {level === "advanced" && <p className="mt-2 text-sm text-muted">Try it from life or from a photo of the {animal.commonName}: measure with your pencil, then check your proportions against the real animal.</p>}
            <p className="mt-2 text-xs text-muted">This is a simple shape guide for a {animal.bodyPlan === "quadruped" ? "four-legged animal" : animal.bodyPlan}. Adjust the proportions to match your {animal.commonName} reference.</p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost" disabled={cur === 0} onClick={() => setStep(cur - 1)}>← Back</button>
              {cur < shown.length - 1
                ? <button className="btn" onClick={() => setStep(cur + 1)}>Next step →</button>
                : <button className="btn" onClick={() => markDrawn(animal.slug)} disabled={drawn.includes(animal.slug)}>{drawn.includes(animal.slug) ? "🎉 Added to My Collection" : "✅ I drew it!"}</button>}
            </div>
          </section>
          <section aria-labelledby="canvas-h">
            <h2 id="canvas-h" className="mb-2 text-2xl font-bold">Your canvas</h2>
            <DrawCanvas trace={{ steps: shown, upTo: cur }} />
          </section>
        </div>
      )}
    </div>
  );
}

export default function DrawPage() {
  return <Suspense fallback={<p>Loading…</p>}><DrawInner /></Suspense>;
}
