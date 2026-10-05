"use client";
import { useProgress } from "@/lib/store";

export default function FavButton({ slug, name }: { slug: string; name: string }) {
  const { favorites, toggleFavorite } = useProgress();
  const on = favorites.includes(slug);
  return (
    <button type="button" className={on ? "btn" : "btn btn-ghost"} onClick={() => toggleFavorite(slug)} aria-pressed={on} aria-label={`${on ? "Remove" : "Save"} ${name} ${on ? "from" : "to"} My Animals`}>
      {on ? "❤️ Saved" : "🤍 Save"}
    </button>
  );
}
