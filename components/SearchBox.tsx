"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounced } from "./useDebounced";
import { useSettings } from "@/lib/settings";
import { suggest } from "@/lib/db";
import type { AnimalSummary } from "@/lib/types";

export default function SearchBox({ big = false }: { big?: boolean }) {
  const router = useRouter();
  const { hideScary, mode } = useSettings();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AnimalSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const dq = useDebounced(q);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(dq.trim().length < 2 ? [] : suggest(dq, hideScary));
  }, [dq, hideScary]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function go(slug?: string) {
    setOpen(false);
    if (slug) router.push(`/animals/${slug}`);
    else if (q.trim()) router.push(`/animals?q=${encodeURIComponent(q.trim())}`);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(active >= 0 ? items[active].slug : undefined); }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={box} className="relative w-full">
      <input
        role="combobox" aria-expanded={open && items.length > 0} aria-controls="search-list" aria-autocomplete="list"
        value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }} onKeyDown={onKey} onFocus={() => setOpen(true)}
        placeholder={mode === "kid" ? "Search for an animal… try lion 🦁" : "Search an animal, habitat, country, or scientific name…"}
        aria-label="Search animals"
        className={`w-full border-2 border-line bg-card ${big ? "rounded-full px-6 py-4 text-lg" : "rounded-full px-4 py-2 text-sm"}`}
      />
      {open && items.length > 0 && (
        <ul id="search-list" role="listbox" className="card absolute z-40 mt-2 w-full overflow-hidden">
          {items.map((a, i) => (
            <li key={a.slug} role="option" aria-selected={i === active}>
              <button type="button" onClick={() => go(a.slug)} className={`flex w-full items-center gap-3 px-4 py-2 text-left ${i === active ? "bg-line" : ""}`}>
                <span className="text-2xl" aria-hidden>{a.emoji}</span>
                <span><b>{a.commonName}</b> <i className="text-sm text-muted">{a.scientificName}</i></span>
              </button>
            </li>
          ))}
          <li><button type="button" onClick={() => go()} className="w-full px-4 py-2 text-left text-sm text-muted">See all results for &quot;{q}&quot;</button></li>
        </ul>
      )}
    </div>
  );
}
