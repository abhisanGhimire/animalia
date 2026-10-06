"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchBox from "./SearchBox";
import { useSettings } from "@/lib/settings";

const NAV = [
  ["/", "Discover"], ["/animals", "Animals"], ["/map", "Map"], ["/habitats", "Habitats"], ["/conservation", "Conservation"],
  ["/food-web", "Food Webs"], ["/tree", "Tree of Life"], ["/find", "Find Any Animal"], ["/compare", "Compare"], ["/learn", "Learn"], ["/collection", "My Collection"],
] as const;

export default function Header() {
  const path = usePathname();
  const { theme, setTheme, hideScary, setHideScary } = useSettings();
  const [open, setOpen] = useState(false);
  const controls = (
    <>
      <button className="chip" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">{theme === "dark" ? "☀️" : "🌙"}</button>
      <button className="chip" aria-pressed={hideScary} onClick={() => setHideScary(!hideScary)} title="Hides animals that might be frightening (for parents and teachers)">🛡️ Gentle</button>
    </>
  );
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold text-brand">🦉 Animalia</Link>
        <div className="order-3 w-full md:order-none md:w-72"><SearchBox /></div>
        <button className="btn btn-ghost ml-auto md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">☰</button>
        <div className="ml-auto hidden items-center gap-2 md:flex">{controls}</div>
      </div>
      <nav aria-label="Main" className={`${open ? "block" : "hidden"} border-t-2 border-line md:block`}>
        <ul className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2">
          {NAV.map(([href, label]) => (
            <li key={href}>
              <Link href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined}
                className={`block rounded-full px-3 py-1 text-sm font-bold ${path === href ? "bg-brand text-brandink" : "hover:bg-line"}`}>{label}</Link>
            </li>
          ))}
          <li className="flex flex-wrap gap-1 md:hidden">{controls}</li>
        </ul>
      </nav>
    </header>
  );
}
