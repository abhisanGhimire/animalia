// Kid-level food webs. Each web lists who is in it and who eats whom.
// An arrow always points from the food to the eater (energy flows that way).

export type Role = "producer" | "plant-eater" | "meat-eater" | "top-predator" | "decomposer";

export interface WebNode {
  id: string;
  name: string;
  emoji: string;
  role: Role;
  slug?: string; // link to the animal page if we have it
  about: string;
}

export interface FoodWeb {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  nodes: WebNode[];
  eats: [string, string][]; // [food id, eater id]
}

export const ROLES: Record<Role, { label: string; kid: string; color: string; column: number }> = {
  producer: { label: "Producer", kid: "Makes its own food from sunlight", color: "#2e9d4f", column: 0 },
  "plant-eater": { label: "Plant-eater", kid: "Eats plants", color: "#d9a21b", column: 1 },
  "meat-eater": { label: "Meat-eater", kid: "Eats other animals", color: "#e0742b", column: 2 },
  "top-predator": { label: "Top predator", kid: "Nothing hunts it when it's grown up", color: "#d9382f", column: 3 },
  decomposer: { label: "Decomposer", kid: "Recycles dead plants and animals into soil", color: "#7a3fb0", column: 1 },
};

const DECOMPOSERS: WebNode = {
  id: "decomposers", name: "Fungi & bacteria", emoji: "🍄", role: "decomposer",
  about: "When plants and animals die, tiny helpers like mushrooms and bacteria break them down. This puts food back into the soil for new plants.",
};

export const FOOD_WEBS: FoodWeb[] = [
  {
    id: "savanna", name: "African Savanna", emoji: "🌾", blurb: "Grassland with scattered trees in Africa.",
    nodes: [
      { id: "grass", name: "Grass", emoji: "🌾", role: "producer", about: "Grass uses sunlight, water and air to make its own food. Lots of animals depend on it." },
      { id: "acacia", name: "Acacia tree", emoji: "🌳", role: "producer", about: "Acacia trees make leaves that giraffes love to munch." },
      { id: "zebra", name: "Zebra", emoji: "🦓", role: "plant-eater", slug: "plains-zebra", about: "Zebras eat grass and live in herds." },
      { id: "giraffe", name: "Giraffe", emoji: "🦒", role: "plant-eater", slug: "giraffe", about: "Giraffes use their long necks to eat leaves from tall trees." },
      { id: "elephant", name: "Elephant", emoji: "🐘", role: "plant-eater", slug: "african-bush-elephant", about: "Elephants eat grass, leaves and bark, and they eat a LOT." },
      { id: "cheetah", name: "Cheetah", emoji: "🐆", role: "meat-eater", slug: "cheetah", about: "Cheetahs sprint to catch small antelope like gazelles." },
      { id: "lion", name: "Lion", emoji: "🦁", role: "top-predator", slug: "african-lion", about: "Lions hunt together in prides. They keep plant-eater numbers balanced." },
      { id: "vulture", name: "Vulture", emoji: "🦅", role: "meat-eater", about: "Vultures clean up leftovers so the savanna stays tidy and healthy." },
      DECOMPOSERS,
    ],
    eats: [["grass", "zebra"], ["grass", "elephant"], ["acacia", "giraffe"], ["acacia", "elephant"], ["zebra", "lion"], ["giraffe", "lion"], ["zebra", "cheetah"], ["zebra", "vulture"], ["lion", "vulture"]],
  },
  {
    id: "antarctic", name: "Antarctic Ocean", emoji: "🧊", blurb: "The icy sea around Antarctica.",
    nodes: [
      { id: "phyto", name: "Phytoplankton", emoji: "🟢", role: "producer", about: "Tiny floating plants. They make food from sunlight and feed the whole ocean." },
      { id: "krill", name: "Krill", emoji: "🦐", role: "plant-eater", slug: "antarctic-krill", about: "Krill are tiny shrimp-like animals that eat phytoplankton." },
      { id: "whale", name: "Blue whale", emoji: "🐋", role: "meat-eater", slug: "blue-whale", about: "The biggest animal ever eats some of the smallest animals: krill! One whale can eat millions in a day." },
      { id: "penguin", name: "Emperor penguin", emoji: "🐧", role: "meat-eater", slug: "emperor-penguin", about: "Penguins dive to catch fish, squid and krill." },
      { id: "seal", name: "Leopard seal", emoji: "🦭", role: "meat-eater", about: "Leopard seals hunt penguins and eat krill too." },
      { id: "orca", name: "Orca", emoji: "🐋", role: "top-predator", about: "Orcas are top predators of the sea. They hunt in family groups called pods." },
      DECOMPOSERS,
    ],
    eats: [["phyto", "krill"], ["krill", "whale"], ["krill", "penguin"], ["krill", "seal"], ["penguin", "seal"], ["seal", "orca"]],
  },
  {
    id: "rainforest", name: "South American Rainforest", emoji: "🌴", blurb: "A warm, wet forest full of life.",
    nodes: [
      { id: "leaves", name: "Leaves", emoji: "🍃", role: "producer", about: "Rainforest trees grow huge amounts of leaves." },
      { id: "fruit", name: "Fruit", emoji: "🍎", role: "producer", about: "Trees make fruit that animals eat. The animals then spread the seeds." },
      { id: "ant", name: "Leafcutter ant", emoji: "🐜", role: "plant-eater", slug: "leafcutter-ant", about: "Leafcutter ants carry leaf pieces home to grow a fungus garden." },
      { id: "sloth", name: "Sloth", emoji: "🦥", role: "plant-eater", slug: "three-toed-sloth", about: "Sloths eat leaves slowly in the treetops." },
      { id: "toucan", name: "Toucan", emoji: "🐦", role: "plant-eater", slug: "toco-toucan", about: "Toucans eat mostly fruit, and also bugs and eggs." },
      { id: "frog", name: "Red-eyed tree frog", emoji: "🐸", role: "meat-eater", slug: "red-eyed-tree-frog", about: "Tree frogs catch insects at night." },
      { id: "jaguar", name: "Jaguar", emoji: "🐆", role: "top-predator", slug: "jaguar", about: "Jaguars are the top predators of the forest." },
      DECOMPOSERS,
    ],
    eats: [["leaves", "ant"], ["leaves", "sloth"], ["fruit", "toucan"], ["ant", "frog"], ["sloth", "jaguar"], ["toucan", "jaguar"]],
  },
  {
    id: "reef", name: "Coral Reef", emoji: "🪸", blurb: "A colourful reef in warm, shallow sea.",
    nodes: [
      { id: "algae", name: "Algae", emoji: "🌿", role: "producer", about: "Algae are simple plant-like living things that make food from sunlight." },
      { id: "seagrass", name: "Seagrass", emoji: "🌱", role: "producer", about: "Seagrass grows in shallow water and is a home for many animals." },
      { id: "plankton", name: "Plankton", emoji: "🔵", role: "producer", about: "Tiny floating plants and animals. Here we mean the plant-like kind." },
      { id: "tang", name: "Blue tang", emoji: "🐠", role: "plant-eater", slug: "blue-tang", about: "Blue tangs nibble algae and keep the reef clean." },
      { id: "turtle", name: "Green sea turtle", emoji: "🐢", role: "plant-eater", slug: "green-sea-turtle", about: "Green turtles graze on seagrass." },
      { id: "clown", name: "Clownfish", emoji: "🐠", role: "plant-eater", slug: "ocellaris-clownfish", about: "Clownfish live in anemones and eat plankton and algae." },
      { id: "octopus", name: "Octopus", emoji: "🐙", role: "meat-eater", slug: "common-octopus", about: "Octopuses hunt crabs and small fish." },
      { id: "shark", name: "Reef shark", emoji: "🦈", role: "top-predator", about: "Reef sharks patrol the reef and keep fish numbers balanced." },
      DECOMPOSERS,
    ],
    eats: [["algae", "tang"], ["seagrass", "turtle"], ["plankton", "clown"], ["tang", "octopus"], ["clown", "octopus"], ["tang", "shark"], ["octopus", "shark"]],
  },
];
