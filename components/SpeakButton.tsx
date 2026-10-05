"use client";

// Reads a name aloud using the browser's built-in text-to-speech (no audio files needed).
export default function SpeakButton({ text, label = "Hear it" }: { text: string; label?: string }) {
  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
  return (
    <button type="button" className="btn btn-ghost" onClick={speak} aria-label={`${label}: ${text}`}>
      🔊 {label}
    </button>
  );
}
