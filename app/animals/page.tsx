import { Suspense } from "react";
import AnimalBrowser from "@/components/AnimalBrowser";

export const metadata = { title: "Animals | Animalia" };

export default function AnimalsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">🐾 All Animals</h1>
      <Suspense fallback={<p>Loading…</p>}><AnimalBrowser /></Suspense>
    </div>
  );
}
