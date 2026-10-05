"use client";
import { useCallback, useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/store";
import type { QuizQuestion } from "@/lib/db";

export default function LearnPage() {
  const { hideScary } = useSettings();
  const { quiz: stats, recordQuiz } = useProgress();
  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const load = useCallback(() => {
    setQs([]); setI(0); setPicked(null); setScore(0); setDone(false);
    fetch(`/api/quiz?n=6&hideScary=${hideScary}`).then((r) => r.json()).then(setQs);
  }, [hideScary]);
  useEffect(load, [load]);

  const q = qs[i];
  function choose(c: string) {
    if (picked) return;
    setPicked(c);
    if (c === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 >= qs.length) { recordQuiz(score, qs.length); setDone(true); }
    else { setI(i + 1); setPicked(null); }
  }

  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">🧠 Animal Quiz</h1>
      <p className="text-muted">XP: <b>{stats.xp}</b> · Questions answered: <b>{stats.answered}</b> · Accuracy: <b>{accuracy}%</b></p>

      {!q && !done && <p aria-busy>Getting questions…</p>}

      {done ? (
        <div className="card space-y-3 p-8 text-center">
          <p className="text-6xl">{score >= qs.length - 1 ? "🏆" : score >= qs.length / 2 ? "🌟" : "🌱"}</p>
          <h2 className="text-2xl font-bold">You got {score} out of {qs.length}!</h2>
          <p>+{score * 10} XP. {score === qs.length ? "Perfect!" : "Every question teaches you something. Try again!"}</p>
          <button className="btn" onClick={load}>Play again</button>
        </div>
      ) : q && (
        <div className="card space-y-4 p-6">
          <p className="text-sm font-bold text-muted">Question {i + 1} of {qs.length} · {q.category}</p>
          {q.emoji && <p className="text-7xl" aria-hidden>{q.emoji}</p>}
          <h2 className="text-xl font-bold">{q.prompt}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.choices.map((c) => {
              const right = picked && c === q.answer;
              const wrong = picked === c && c !== q.answer;
              return (
                <button key={c} onClick={() => choose(c)} disabled={!!picked} aria-label={c}
                  className={`rounded-2xl border-2 p-3 text-left font-semibold ${right ? "border-green-600 bg-green-100 text-green-900" : wrong ? "border-red-600 bg-red-100 text-red-900" : "border-line bg-bg"}`}>
                  {right ? "✅ " : wrong ? "❌ " : ""}{c}
                </button>
              );
            })}
          </div>
          {picked && (
            <div aria-live="polite" className="space-y-2">
              <p className="font-semibold">{picked === q.answer ? "🎉 Correct!" : "Not quite!"} {q.explain}</p>
              <button className="btn" onClick={next}>{i + 1 >= qs.length ? "See my score" : "Next →"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
