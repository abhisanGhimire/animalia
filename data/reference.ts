import type { ConservationCode, Continent } from "@/lib/types";

export const CONTINENTS: { name: Continent; emoji: string; color: string; blurb: string }[] = [
  { name: "Africa", emoji: "🌍", color: "#e9a23b", blurb: "Savannas, deserts and rainforests." },
  { name: "Asia", emoji: "🌏", color: "#d9534f", blurb: "The biggest continent, from the Himalayas to jungles." },
  { name: "Europe", emoji: "🏰", color: "#5b8def", blurb: "Forests, mountains and chilly northern lands." },
  { name: "North America", emoji: "🦅", color: "#3aa57a", blurb: "Wetlands, prairies, forests and tundra." },
  { name: "South America", emoji: "🌎", color: "#2e9d4f", blurb: "Home of the Amazon rainforest." },
  { name: "Oceania", emoji: "🦘", color: "#c46bd1", blurb: "Australia, islands and amazing coral reefs." },
  { name: "Antarctica", emoji: "🧊", color: "#59b8d9", blurb: "The coldest, windiest place on Earth." },
];

export const HABITATS: { id: string; name: string; emoji: string; climate: string; blurb: string }[] = [
  { id: "savanna", name: "Savanna", emoji: "🌾", climate: "Warm all year, with a wet and a dry season", blurb: "Open grassland dotted with trees." },
  { id: "rainforest", name: "Tropical rainforest", emoji: "🌴", climate: "Hot and very wet", blurb: "Tall, dense forest with more kinds of life than almost anywhere." },
  { id: "temperate-forest", name: "Temperate forest", emoji: "🌳", climate: "Four seasons", blurb: "Forests that change with the seasons." },
  { id: "mountains", name: "Mountains", emoji: "🏔️", climate: "Cold and windy at the top", blurb: "Steep, rocky land high above sea level." },
  { id: "tundra", name: "Tundra & polar", emoji: "❄️", climate: "Very cold, little rain", blurb: "Frozen land where trees can't grow." },
  { id: "wetlands", name: "Wetlands", emoji: "🪷", climate: "Warm to mild, always wet", blurb: "Swamps and marshes where land and water meet." },
  { id: "rivers-lakes", name: "Rivers & lakes", emoji: "🏞️", climate: "Varies", blurb: "Freshwater homes for fish, frogs and more." },
  { id: "coral-reef", name: "Coral reef", emoji: "🪸", climate: "Warm, shallow, sunny seas", blurb: "Colourful underwater cities built by tiny coral animals." },
  { id: "open-ocean", name: "Open ocean", emoji: "🌊", climate: "Cool to warm, deep water", blurb: "Huge stretches of sea far from land." },
  { id: "eucalyptus", name: "Eucalyptus woodland", emoji: "🍃", climate: "Warm, dry summers", blurb: "Gum-tree forests of Australia." },
  { id: "grassland", name: "Grassland", emoji: "🌿", climate: "Mild, moderate rain", blurb: "Wide open lands covered in grass." },
  { id: "urban", name: "Homes & towns", emoji: "🏡", climate: "Wherever people live", blurb: "Animals that live alongside people." },
];

export const STATUS: Record<
  ConservationCode,
  { label: string; kid: string; color: string; rank: number }
> = {
  LC: { label: "Least Concern", kid: "Doing okay", color: "#2e9d4f", rank: 1 },
  NT: { label: "Near Threatened", kid: "Needs watching", color: "#7aa63a", rank: 2 },
  VU: { label: "Vulnerable", kid: "Could be in trouble", color: "#d9a21b", rank: 3 },
  EN: { label: "Endangered", kid: "In danger", color: "#e0742b", rank: 4 },
  CR: { label: "Critically Endangered", kid: "In big danger", color: "#d9382f", rank: 5 },
  EW: { label: "Extinct in the Wild", kid: "Only left in zoos", color: "#7a3fb0", rank: 6 },
  EX: { label: "Extinct", kid: "Gone forever", color: "#555b66", rank: 7 },
  NE: { label: "Not yet checked", kid: "Not checked yet", color: "#8a8f99", rank: 0 },
};

export const IUCN = { name: "IUCN Red List", url: "https://www.iucnredlist.org/", retrieved: null };
export const ADW = { name: "Animal Diversity Web (University of Michigan)", url: "https://animaldiversity.org/", retrieved: null };
export const COL = { name: "Catalogue of Life", url: "https://www.catalogueoflife.org/", retrieved: null };
export const GBIF = { name: "GBIF Backbone Taxonomy", url: "https://www.gbif.org/species/search", retrieved: null };
