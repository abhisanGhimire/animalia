"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type Mode = "kid" | "explorer" | "scientific";
export type Theme = "light" | "dark";

interface Settings {
  mode: Mode;
  theme: Theme;
  hideScary: boolean; // parents/teachers can hide animals that might frighten children
  imperial: boolean;
}

interface Ctx extends Settings {
  setMode: (m: Mode) => void;
  setTheme: (t: Theme) => void;
  setHideScary: (v: boolean) => void;
  setImperial: (v: boolean) => void;
}

const DEFAULTS: Settings = { mode: "kid", theme: "light", hideScary: false, imperial: false };
const KEY = "animalia:settings";
const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);

  // Load saved settings after first render (avoids server/browser mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw), mode: "kid" });
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setS((p) => ({ ...p, theme: "dark" }));
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = s.mode;
    document.documentElement.dataset.theme = s.theme;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }, [s]);

  const setMode = useCallback((mode: Mode) => setS((p) => ({ ...p, mode })), []);
  const setTheme = useCallback((theme: Theme) => setS((p) => ({ ...p, theme })), []);
  const setHideScary = useCallback((hideScary: boolean) => setS((p) => ({ ...p, hideScary })), []);
  const setImperial = useCallback((imperial: boolean) => setS((p) => ({ ...p, imperial })), []);

  const value = useMemo(() => ({ ...s, setMode, setTheme, setHideScary, setImperial }), [s, setMode, setTheme, setHideScary, setImperial]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const c = useContext(SettingsContext);
  if (!c) throw new Error("useSettings must be used inside SettingsProvider");
  return c;
}
