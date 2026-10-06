// The shape of one animal record. The UI never hard-codes animal facts;
// everything it shows comes from records of this type (see lib/db.ts).

export type ConservationCode = "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "NE";

export type AnimalGroup =
  | "Mammals"
  | "Birds"
  | "Reptiles"
  | "Amphibians"
  | "Fish"
  | "Insects"
  | "Arachnids"
  | "Crustaceans"
  | "Mollusks"
  | "Cnidarians"
  | "Echinoderms"
  | "Myriapods"
  | "Annelids"
  | "Sponges"
  | "Other";

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Antarctica";

export type Diet = "Herbivore" | "Carnivore" | "Omnivore" | "Insectivore" | "Filter feeder";
export type Realm = "Land" | "Freshwater" | "Marine" | "Air";
export type Activity = "Diurnal" | "Nocturnal" | "Crepuscular" | "Varies";
export type Confidence = "High" | "Medium" | "Low";

export interface Source {
  name: string;
  url: string;
  retrieved: string | null; // ISO date, or null if not yet checked
}

export interface Range {
  min: number;
  max: number;
  note?: string; // e.g. "males" or "disputed"
}

export interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Animal {
  slug: string;
  emoji: string; // placeholder artwork until licensed images are added
  commonName: string;
  scientificName: string;
  otherNames: string[]; // alternative + translated names, used by search
  taxonomy: Taxonomy;
  group: AnimalGroup;
  vertebrate: boolean;

  conservation: {
    code: ConservationCode;
    note?: string;
    trend?: "Increasing" | "Stable" | "Decreasing" | "Unknown";
  };

  geography: {
    continents: Continent[];
    countries: string[];
    regions: string[];
    introduced?: string[];
  };
  habitats: string[]; // ids from data/habitats.ts
  realm: Realm[];

  diet: Diet;
  dietDetail: string;
  activity: Activity;
  social: "Social" | "Solitary" | "Varies";
  domestic: boolean;
  dangerous: boolean; // for parents' "hide scary" filter and safety notes
  extinct: boolean;

  lengthCm?: Range;
  weightKg?: Range;
  lifespanYears?: Range;
  topSpeedKmh?: number;
  sizeClass: "Tiny" | "Small" | "Medium" | "Large" | "Huge";

  kid: { summary: string; facts: string[]; pronunciation?: string };
  explorer: { summary: string; facts: string[] };
  scientific: {
    description: string;
    reproduction?: string;
    behavior?: string;
    adaptations?: string[];
    threats?: string[];
    conservationEfforts?: string[];
    extinction?: { when: string; causes: string; confidence: Confidence };
  };

  anatomy?: { part: string; emoji: string; text: string }[];
  food?: { eats: string[]; eatenBy: string[]; role: string };

  petSuitability?: {
    stars: 1 | 2 | 3 | 4 | 5;
    canLegallyKeep: string;
    shouldKeep: string;
    thrivesInCaptivity: string;
    notes: string[];
    warning?: string;
  };
  aquarium?: {
    water: "Freshwater" | "Saltwater" | "Brackish";
    minTankLitres: number;
    tempC: [number, number];
    ph: [number, number];
    groupMin: number;
    temperament: "Peaceful" | "Semi-aggressive" | "Aggressive";
    zone: "Top" | "Middle" | "Bottom" | "All";
    notes: string;
  };

  related: string[]; // slugs

  sources: Source[];
  meta: { lastVerified: string | null; confidence: Confidence; imageKind: "Emoji placeholder" };
}

export interface AnimalSummary {
  slug: string;
  emoji: string;
  commonName: string;
  scientificName: string;
  group: AnimalGroup;
  conservation: Animal["conservation"]["code"];
  diet: Diet;
  continents: Continent[];
  kidSummary: string;
  dangerous: boolean;
  extinct: boolean;
}
