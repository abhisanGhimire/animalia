"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Section from "./Section";
import StatusBadge from "./StatusBadge";
import SpeakButton from "./SpeakButton";
import FavButton from "./FavButton";
import AnimalCard from "./AnimalCard";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/store";
import { STATUS, HABITATS } from "@/data/reference";
import type { Animal, AnimalSummary, Range } from "@/lib/types";

const UNAVAILABLE = "Reliable information is currently unavailable.";

function fmt(r: Range | undefined, unit: "cm" | "kg" | "years"): string {
  if (!r) return UNAVAILABLE;
  const span = r.min === r.max ? `${r.min}` : `${r.min}–${r.max}`;
  const conv = unit === "cm" ? ` (${Math.round(r.min / 2.54)}–${Math.round(r.max / 2.54)} in)` : unit === "kg" ? ` (${Math.round(r.min * 2.205)}–${Math.round(r.max * 2.205)} lb)` : "";
  return `${span} ${unit}${conv}${r.note ? `, ${r.note}` : ""}`;
}

export default function AnimalProfile({ animal: a, similar }: { animal: Animal; similar: { animal: AnimalSummary; why: string }[] }) {
  const { mode, hideScary } = useSettings();
  const { markViewed } = useProgress();
  const [part, setPart] = useState(0);
  const kid = mode === "kid";
  const sci = mode === "scientific";
  const text = kid ? a.kid : a.explorer;
  const st = STATUS[a.conservation.code];

  useEffect(() => { markViewed(a.slug); }, [a.slug, markViewed]);

  const stat = (label: string, value: string) => (
    <div className="rounded-2xl bg-bg p-3"><dt className="text-xs font-bold uppercase text-muted">{label}</dt><dd className="font-semibold">{value}</dd></div>
  );

  return (
    <article className="space-y-4">
      <header className="card grid gap-4 p-6 md:grid-cols-[auto_1fr]">
        <div className="bob text-center text-9xl" aria-hidden>{a.emoji}</div>
        <div>
          <h1 className="text-4xl font-bold">{a.commonName}</h1>
          <p className="text-lg italic text-muted">{a.scientificName}</p>
          <div className="my-3 flex flex-wrap items-center gap-2">
            <StatusBadge code={a.conservation.code} kid={kid} />
            {a.extinct && <span className="chip">🦴 Extinct animal</span>}
            {a.domestic && <span className="chip">🏡 Domestic</span>}
          </div>
          <p className="text-lg">{text.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SpeakButton text={a.commonName} label={kid ? "Say its name" : "Pronounce"} />
            <FavButton slug={a.slug} name={a.commonName} />
            {a.bodyPlan !== "none" && <Link className="btn" href={`/draw?animal=${a.slug}`}>✏️ Draw it</Link>}
            <Link className="btn btn-ghost" href={`/compare?a=${a.slug}`}>⚖️ Compare</Link>
          </div>
          {kid && a.kid.pronunciation && <p className="mt-2 text-sm text-muted">Say it like: <b>{a.kid.pronunciation}</b></p>}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat("Group", a.group)}
        {stat("Eats", a.diet)}
        {stat(kid ? "Home" : "Habitat", a.habitats.map((h) => HABITATS.find((x) => x.id === h)?.name ?? h).join(", "))}
        {stat(kid ? "How long it lives" : "Lifespan", fmt(a.lifespanYears, "years"))}
        {stat(kid ? "How long" : "Length", fmt(a.lengthCm, "cm"))}
        {stat(kid ? "How heavy" : "Weight", fmt(a.weightKg, "kg"))}
        {stat("Active", a.activity)}
        {stat("Social life", a.social)}
      </dl>

      <Section title={kid ? "Cool facts" : "Interesting facts"} emoji="💡" open>
        <ul className="list-disc space-y-1 pl-5">{text.facts.map((f) => <li key={f}>{f}</li>)}</ul>
      </Section>

      <Section title={kid ? "Where does it live?" : "Geography & habitat"} emoji="🌍" open>
        <div className="flex flex-wrap gap-2">
          {a.geography.continents.map((c) => <Link key={c} className="chip" href={`/animals?continent=${encodeURIComponent(c)}`}>{c}</Link>)}
        </div>
        {a.geography.countries.length > 0 && <p><b>Countries:</b> {a.geography.countries.join(", ")}</p>}
        {a.geography.regions.length > 0 && <p><b>Places:</b> {a.geography.regions.join("; ")}</p>}
        {a.geography.introduced && <p><b>Introduced to:</b> {a.geography.introduced.join("; ")}</p>}
        <div className="flex flex-wrap gap-2">
          {a.habitats.map((h) => <Link key={h} className="chip" href={`/animals?habitat=${h}`}>{HABITATS.find((x) => x.id === h)?.emoji} {HABITATS.find((x) => x.id === h)?.name}</Link>)}
        </div>
      </Section>

      <Section title="What it eats" emoji="🍽️"><p>{a.dietDetail}</p></Section>

      {a.anatomy && (
        <Section title={kid ? "Look closely at its body" : "Anatomy explorer"} emoji="🔍">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Body parts">
            {a.anatomy.map((p, i) => (
              <button key={p.part} role="tab" aria-selected={part === i} className="chip" data-active={part === i} onClick={() => setPart(i)}>{p.emoji} {p.part}</button>
            ))}
          </div>
          <p className="rounded-2xl bg-bg p-4 text-lg" role="tabpanel"><b>{a.anatomy[part].part}:</b> {a.anatomy[part].text}</p>
        </Section>
      )}

      {a.food && (
        <Section title="Food chain" emoji="🔗">
          <p className="flex flex-wrap items-center gap-2 text-lg">
            {a.food.eats.map((e) => <span key={e} className="chip">{e}</span>)} <span aria-label="is eaten by">→</span>
            <span className="chip" aria-pressed="true">{a.emoji} {a.commonName}</span>
            {a.food.eatenBy.length > 0 && <><span aria-label="is eaten by">→</span>{a.food.eatenBy.map((e) => <span key={e} className="chip">{e}</span>)}</>}
          </p>
          <p><b>Its job in nature:</b> {a.food.role}</p>
        </Section>
      )}

      {sci && (
        <Section title="Taxonomy & science" emoji="🔬" open>
          <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.entries(a.taxonomy).map(([rank, v]) => <div key={rank} className="rounded-2xl bg-bg p-2"><dt className="text-xs font-bold uppercase text-muted">{rank}</dt><dd className="italic">{v}</dd></div>)}
          </dl>
          <p>{a.scientific.description}</p>
          {a.scientific.reproduction && <p><b>Reproduction:</b> {a.scientific.reproduction}</p>}
          {a.scientific.behavior && <p><b>Behaviour:</b> {a.scientific.behavior}</p>}
          {a.scientific.adaptations && <p><b>Adaptations:</b> {a.scientific.adaptations.join("; ")}</p>}
          {a.topSpeedKmh && <p><b>Top speed:</b> about {a.topSpeedKmh} km/h</p>}
          <p><b>Other names:</b> {a.otherNames.join(", ")}</p>
          <p><b>Population trend:</b> {a.conservation.trend ?? UNAVAILABLE}</p>
        </Section>
      )}

      {a.scientific.extinction && (
        <Section title="Extinction" emoji="🦴" open>
          <p><b>When:</b> {a.scientific.extinction.when}</p>
          <p><b>Likely causes:</b> {a.scientific.extinction.causes}</p>
          <p><b>Scientific confidence:</b> {a.scientific.extinction.confidence}. Drawings and descriptions of extinct animals are reconstructions, not photographs.</p>
        </Section>
      )}

      <Section title={kid ? `Is ${a.commonName} in danger?` : "Conservation"} emoji="🛟">
        <p><b>Status:</b> {st.label} {kid && `(${st.kid})`}</p>
        {a.conservation.note && <p>{a.conservation.note}</p>}
        {(kid ? false : a.scientific.threats) && <p><b>Threats:</b> {a.scientific.threats?.join("; ")}</p>}
        {!kid && a.scientific.conservationEfforts && <p><b>Protection efforts:</b> {a.scientific.conservationEfforts.join("; ")}</p>}
        {kid && a.scientific.threats && <p>Some things that cause trouble: {a.scientific.threats.slice(0, 3).join(", ").toLowerCase()}.</p>}
      </Section>

      {a.dangerous && !hideScary && (
        <div className="card border-accent p-4" role="note">⚠️ <b>Safety note:</b> This is a wild animal that can be dangerous. We watch from a safe distance, or visit it at an accredited zoo.</div>
      )}

      {a.petSuitability && (
        <Section title="Could it be a pet?" emoji="🏡">
          <p className="text-2xl" aria-label={`${a.petSuitability.stars} out of 5`}>{"⭐".repeat(a.petSuitability.stars)}{"☆".repeat(5 - a.petSuitability.stars)}</p>
          {a.petSuitability.warning && <p className="rounded-2xl bg-bg p-3 font-bold">🚫 {a.petSuitability.warning}</p>}
          <p><b>Can people legally keep it?</b> {a.petSuitability.canLegallyKeep}</p>
          <p><b>Should they?</b> {a.petSuitability.shouldKeep}</p>
          <p><b>Does it thrive in captivity?</b> {a.petSuitability.thrivesInCaptivity}</p>
          {a.petSuitability.notes.length > 0 && <ul className="list-disc pl-5">{a.petSuitability.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
          <p className="text-sm text-muted">Always check local laws. Never take animals from the wild.</p>
        </Section>
      )}

      {a.aquarium && (
        <Section title="Aquarium care" emoji="🐠">
          <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {stat("Water", a.aquarium.water)}{stat("Min tank", `${a.aquarium.minTankLitres} L`)}
            {stat("Temperature", `${a.aquarium.tempC[0]}–${a.aquarium.tempC[1]} °C`)}{stat("pH", `${a.aquarium.ph[0]}–${a.aquarium.ph[1]}`)}
            {stat("Group size", `${a.aquarium.groupMin}+`)}{stat("Temperament", a.aquarium.temperament)}{stat("Swims in", a.aquarium.zone)}
          </dl>
          <p>{a.aquarium.notes}</p>
          <Link className="btn" href="/compare?mode=tank">Can these fish live together?</Link>
        </Section>
      )}

      <Section title="Sources & data quality" emoji="📚">
        <p><b>Last verified:</b> {a.meta.lastVerified ?? "Not yet verified (drafted from general knowledge)"}</p>
        <p><b>Data confidence:</b> {a.meta.confidence}</p>
        <p><b>Picture:</b> {a.meta.imageKind}. No photograph or AI image is shown.</p>
        <ul className="list-disc pl-5">{a.sources.map((s) => <li key={s.name}><a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.name}</a> {s.retrieved ? `(retrieved ${s.retrieved})` : "(check here to verify)"}</li>)}</ul>
      </Section>

      {similar.filter((s) => !(hideScary && s.animal.dangerous)).length > 0 && (
        <section aria-labelledby="similar">
          <h2 id="similar" className="mb-3 text-2xl font-bold">You might also like</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.filter((s) => !(hideScary && s.animal.dangerous)).map((s) => (
              <div key={s.animal.slug}><AnimalCard a={s.animal} /><p className="mt-1 text-xs text-muted">Why: {s.why}</p></div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
