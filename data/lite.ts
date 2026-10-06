import type { Animal, AnimalGroup, Continent, ConservationCode, Diet, Realm, Range } from "@/lib/types";
import { ADW, COL, IUCN } from "./reference";

// A compact way to add an animal. Fields we do not know are simply left out,
// and the app shows "Reliable information is currently unavailable." for them.
export interface Lite {
  slug: string;
  emoji: string;
  name: string;
  sci: string;
  also?: string[];
  tax: { phylum: string; class: string; order: string; family: string; genus: string };
  group: AnimalGroup;
  vertebrate?: boolean;
  status: ConservationCode;
  statusNote?: string;
  continents: Continent[];
  places?: string[];
  habitats: string[];
  realm: Realm[];
  diet: Diet;
  dietText: string;
  active?: Animal["activity"];
  social?: Animal["social"];
  dangerous?: boolean;
  len?: Range;
  wt?: Range;
  life?: Range;
  speed?: number;
  size: Animal["sizeClass"];
  summary: string;
  facts: string[];
  say?: string;
  eats?: string[];
  eatenBy?: string[];
  role?: string;
  threats?: string[];
  pet?: Animal["petSuitability"];
  tank?: Animal["aquarium"];
  related?: string[];
}

export function lite(l: Lite): Animal {
  return {
    slug: l.slug,
    emoji: l.emoji,
    commonName: l.name,
    scientificName: l.sci,
    otherNames: l.also ?? [],
    taxonomy: { kingdom: "Animalia", ...l.tax, species: l.sci },
    group: l.group,
    vertebrate: l.vertebrate ?? false,
    conservation: { code: l.status, note: l.statusNote },
    geography: { continents: l.continents, countries: l.places ?? [], regions: [] },
    habitats: l.habitats,
    realm: l.realm,
    diet: l.diet,
    dietDetail: l.dietText,
    activity: l.active ?? "Varies",
    social: l.social ?? "Varies",
    domestic: false,
    dangerous: l.dangerous ?? false,
    extinct: l.status === "EX",
    lengthCm: l.len,
    weightKg: l.wt,
    lifespanYears: l.life,
    topSpeedKmh: l.speed,
    sizeClass: l.size,
    kid: { summary: l.summary, facts: l.facts, pronunciation: l.say },
    explorer: { summary: l.summary, facts: l.facts },
    scientific: { description: "", threats: l.threats },
    food: l.eats || l.eatenBy ? { eats: l.eats ?? [], eatenBy: l.eatenBy ?? [], role: l.role ?? "" } : undefined,
    petSuitability: l.pet,
    aquarium: l.tank,
    related: l.related ?? [],
    sources: [IUCN, ADW, COL],
    meta: { lastVerified: null, confidence: "Medium", imageKind: "Emoji placeholder" },
  };
}

export const NO_PET = (why = "Wild animals belong in the wild.") => ({
  stars: 1 as const,
  canLegallyKeep: "Not for ordinary people in most places.",
  shouldKeep: "No.",
  thrivesInCaptivity: "Only in good zoos and sanctuaries with expert care.",
  notes: [] as string[],
  warning: why,
});
