"use client";
import { useCallback, useEffect, useState } from "react";

// Personal data (favourites, progress, recently viewed) lives in this browser's
// localStorage. No account is needed, which is also safer for children.
// Later this can sync to a server account without changing the components.

export interface Progress {
  favorites: string[];
  recent: string[];
  quiz: { answered: number; correct: number; best: number; xp: number };
  streakDays: string[]; // ISO dates the learner was active
}

const KEY = "animalia:progress";
const EMPTY: Progress = {
  favorites: [],
  recent: [],
  quiz: { answered: 0, correct: 0, best: 0, xp: 0 },
  streakDays: [],
};

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setP(read());
    setReady(true);
    const onStorage = () => setP(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("animalia:progress", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("animalia:progress", onStorage);
    };
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(read());
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setP(next);
    window.dispatchEvent(new Event("animalia:progress"));
  }, []);

  const toggleFavorite = useCallback(
    (slug: string) => update((x) => ({ ...x, favorites: x.favorites.includes(slug) ? x.favorites.filter((s) => s !== slug) : [...x.favorites, slug] })),
    [update],
  );
  const markViewed = useCallback(
    (slug: string) =>
      update((x) => {
        const today = new Date().toISOString().slice(0, 10);
        return {
          ...x,
          recent: [slug, ...x.recent.filter((s) => s !== slug)].slice(0, 20),
          streakDays: x.streakDays.includes(today) ? x.streakDays : [...x.streakDays, today].slice(-60),
        };
      }),
    [update],
  );
  const recordQuiz = useCallback(
    (correct: number, total: number) =>
      update((x) => ({
        ...x,
        quiz: {
          answered: x.quiz.answered + total,
          correct: x.quiz.correct + correct,
          best: Math.max(x.quiz.best, correct),
          xp: x.quiz.xp + correct * 10,
        },
      })),
    [update],
  );

  return { ...p, ready, toggleFavorite, markViewed, recordQuiz };
}

export function streak(days: string[]): number {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
