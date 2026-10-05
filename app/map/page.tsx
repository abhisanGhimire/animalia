import { Suspense } from "react";
import AnimalBrowser from "@/components/AnimalBrowser";
import ContinentPicker from "@/components/ContinentPicker";

export const metadata = { title: "Map | Animalia" };

export default function MapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">🗺️ Animals of the World</h1>
      <p className="text-muted">Tap a continent to ask: &ldquo;What animals live here?&rdquo; (A full country-by-country map is planned for a later version.)</p>
      <Suspense fallback={<p>Loading…</p>}>
        <ContinentPicker />
        <AnimalBrowser hide={["continent"]} />
      </Suspense>
    </div>
  );
}
