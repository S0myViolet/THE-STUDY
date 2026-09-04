/**
 * Curated text used by the procedural scenes: real book titles, sign copy,
 * destinations, prices. Everything a person might be asked to recall must be
 * short enough to read at a glance and unambiguous in the render.
 */
import type { Rng, SceneColor, SceneObjectType } from "./types";

/** Upright book spines (vertical text): 12 characters or fewer. */
export const SHORT_TITLES: readonly string[] = [
  "Moby-Dick",
  "Middlemarch",
  "The Odyssey",
  "Don Quixote",
  "Bleak House",
  "Jane Eyre",
  "Persuasion",
  "Dubliners",
  "Walden",
  "The Iliad",
  "Emma",
  "Dracula",
  "Frankenstein",
  "Candide",
  "Meditations",
  "Beowulf",
  "The Republic",
  "Hard Times",
  "The Prince",
  "Utopia",
  "Vanity Fair",
  "Silas Marner",
  "Villette",
  "The Tempest",
  "The Aeneid",
  "Ivanhoe",
  "Cranford",
  "Lord Jim",
  "Ulysses",
  "Antigone",
  "Macbeth",
  "Hamlet",
  "Faust",
  "Inferno",
  "Germinal",
  "Nostromo",
  "Kidnapped",
  "Erewhon",
  "Rasselas",
  "Kim",
];

/** Lying stacks (horizontal text): up to 19 characters. */
export const LONG_TITLES: readonly string[] = [
  "Great Expectations",
  "War and Peace",
  "Anna Karenina",
  "Heart of Darkness",
  "Wuthering Heights",
  "Robinson Crusoe",
  "Treasure Island",
  "Madame Bovary",
  "Leaves of Grass",
  "North and South",
  "Gulliver's Travels",
  "The Decameron",
  "Little Dorrit",
  "Pride and Prejudice",
  "Oliver Twist",
  "David Copperfield",
  "Moll Flanders",
  "Tristram Shandy",
  "Tom Jones",
  "The Wealth of Nations",
  "Paradise Lost",
  "A Christmas Carol",
  "Mansfield Park",
  "The Woman in White",
  "Barchester Towers",
];

export const CAFE_SIGNS: readonly string[] = ["Order at the counter", "Cash only", "Fresh pastries", "Open till 6", "Mind the step", "Toilets →", "Reserved", "Free refills", "Oat milk +40p", "Back in 5 minutes"];
export const CAFE_MENU: readonly string[] = ["Flat white 3.20", "Espresso 2.40", "Filter 2.80", "Cortado 3.00", "Tea 2.20", "Hot chocolate 3.40", "Croissant 2.60", "Scone 2.90", "Soup 5.50", "Toastie 6.20", "Lemon cake 3.80", "Bagel 4.10"];
export const LOBBY_SIGNS: readonly string[] = ["Lift →", "Rooms 101–120 ←", "Breakfast 7–10", "Bar open", "Please ring bell", "Restaurant →", "Quiet please", "Luggage store", "Checkout 11am", "Concierge"];
export const OFFICE_SIGNS: readonly string[] = ["Meeting Room B", "Print room", "Fire exit →", "Quiet zone", "Kitchen ←", "Back at 2", "Keep clear", "Deliveries", "Room 4B", "Do not disturb"];
export const OFFICE_BOARD: readonly string[] = ["Q3 targets", "Sprint 14", "Ship by Friday", "Launch: 12 May", "Hiring: 2 open", "Budget review", "Retro at 4", "Offsite: June 3", "Demo Thursday"];
export const TRAIN_SIGNS: readonly string[] = ["No smoking", "Quiet coach", "Platform 4", "Reserved", "First class", "Emergency brake", "Mind the gap", "Coach 4", "Seats 41–46", "Do not lean out"];
export const STREET_SHOPS: readonly string[] = ["Bakery", "Books", "Pharmacy", "Florist", "Tailor", "Barber", "Antiques", "Ironmonger", "Stationers", "Butcher", "Records", "Hardware"];
export const STREET_SIGNS: readonly string[] = ["No parking", "One way →", "Bus stop", "Open", "Closed", "Deliveries only", "Market Street", "Keep clear", "Taxi rank", "Cycle lane", "No. 14", "Sold"];
export const RESTAURANT_SIGNS: readonly string[] = ["Reserved", "Table 7", "Table 12", "Chef's table", "Specials", "Bar →", "Set menu 24", "Table 3", "Private"];
export const MAP_LABELS: readonly string[] = ["Bosporus", "Venice", "Silk Road", "Suez", "Baltic", "Istanbul", "Cape Route", "The Hansa", "Levant", "Adriatic"];
export const BOX_LABELS: readonly string[] = ["Fragile", "Archive", "Files", "This way up", "Kitchen", "Books", "Winter", "Glass", "Lamps", "Post"];
export const NEWSPAPERS: readonly string[] = ["The Courier", "The Ledger", "The Tribune", "The Gazette", "Morning Post", "The Sentinel", "The Argus"];
export const PAINTING_SUBJECTS: readonly string[] = ["harbour", "hills", "pears", "portrait", "sail", "bridge"];

export const DESTINATIONS: readonly string[] = [
  "Lisbon",
  "Vienna",
  "Istanbul",
  "Oslo",
  "Athens",
  "Madrid",
  "Prague",
  "Dublin",
  "Geneva",
  "Warsaw",
  "Copenhagen",
  "Rome",
  "Marrakesh",
  "Cairo",
  "Toronto",
  "Boston",
  "Nairobi",
  "Tokyo",
  "Reykjavik",
  "Berlin",
  "Naples",
  "Porto",
  "Bergen",
  "Zurich",
  "Milan",
  "Amsterdam",
  "Edinburgh",
  "Valencia",
  "Krakow",
  "Riga",
];
export const FLIGHT_STATUSES: readonly string[] = ["On time", "Boarding", "Gate open", "Final call", "Delayed", "Cancelled"];

/** Times readable from a clock face: minutes on the five. */
export function clockTime(rng: Rng): string {
  const h = rng.int(1, 12);
  const m = rng.int(0, 11) * 5;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** 24h board time "14:20", minutes on the five. */
export function boardTime(minutesFromMidnight: number): string {
  const m = ((minutesFromMidnight % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60)
    .toString()
    .padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
}

export function ticketText(rng: Rng): string {
  const forms = [() => `Seat ${rng.int(11, 68)}${rng.pick(["A", "B", "C", "D"])}`, () => `Coach ${rng.int(1, 9)} · Seat ${rng.int(11, 68)}`, () => `No. ${rng.int(1000, 9999)}`, () => `Row ${rng.int(2, 30)} · ${rng.pick(["Aisle", "Window"])}`];
  return rng.pick(forms)();
}

export function gateCode(rng: Rng): string {
  return `${rng.pick(["A", "B", "C", "D"])}${rng.int(1, 24)}`;
}

/** Human names for object types where the raw id would read oddly. */
export const TYPE_LABEL: Partial<Record<SceneObjectType, string>> = {
  bookstack: "stack of books",
  streetlamp: "street lamp",
  bicycle: "bicycle",
  typewriter: "typewriter",
  board: "board",
  counter: "counter",
  person: "person",
  glasses: "pair of glasses",
  key: "key",
};

export const PLURAL: Partial<Record<SceneObjectType, string>> = {
  bookstack: "stacks of books",
  person: "people",
  glasses: "pairs of glasses",
  box: "boxes",
  bench: "benches",
  key: "keys",
};

export function typeLabel(t: SceneObjectType): string {
  return TYPE_LABEL[t] ?? t;
}
export function typePlural(t: SceneObjectType): string {
  return PLURAL[t] ?? `${typeLabel(t)}s`;
}

/** Types whose main fill is the object's colour, unambiguously, in the render. */
export const COLOR_SALIENT: ReadonlySet<SceneObjectType> = new Set<SceneObjectType>([
  "notebook",
  "cup",
  "bag",
  "coat",
  "hat",
  "umbrella",
  "suitcase",
  "vase",
  "book",
  "bookstack",
  "rug",
  "lamp",
  "car",
  "bicycle",
  "box",
  "bottle",
  "chair",
  "awning",
  "flag",
  "candle",
  "menu",
  "door",
  "radio",
  "letter",
  "ticket",
]);

/** Structural things the room-scan scorer and question generator should not ask about directly. */
export const STRUCTURAL: ReadonlySet<SceneObjectType> = new Set<SceneObjectType>(["table", "counter", "rug", "shelf", "window", "door", "board", "awning", "bench"]);

/** Objects that are plausible in a setting; used for absence questions and "add" mutations. */
export const PLAUSIBLE: Record<string, readonly { type: SceneObjectType; w: number; h: number; wall?: boolean }[]> = {
  room: [
    { type: "cup", w: 30, h: 28 },
    { type: "notebook", w: 60, h: 46 },
    { type: "phone", w: 22, h: 40 },
    { type: "plant", w: 70, h: 110 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "painting", w: 110, h: 90, wall: true },
    { type: "bag", w: 60, h: 50 },
    { type: "letter", w: 60, h: 40 },
    { type: "glasses", w: 50, h: 18 },
    { type: "candle", w: 16, h: 50 },
    { type: "vase", w: 40, h: 80 },
    { type: "radio", w: 90, h: 50 },
    { type: "key", w: 34, h: 16 },
    { type: "cat", w: 70, h: 45 },
    { type: "map", w: 140, h: 100, wall: true },
    { type: "pen", w: 60, h: 8 },
  ],
  cafe: [
    { type: "cup", w: 30, h: 28 },
    { type: "bottle", w: 22, h: 70 },
    { type: "newspaper", w: 90, h: 40 },
    { type: "plant", w: 70, h: 110 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "painting", w: 110, h: 90, wall: true },
    { type: "bag", w: 60, h: 50 },
    { type: "umbrella", w: 30, h: 110 },
    { type: "laptop", w: 110, h: 70 },
    { type: "menu", w: 40, h: 60 },
    { type: "candle", w: 16, h: 50 },
    { type: "cat", w: 70, h: 45 },
    { type: "dog", w: 90, h: 60 },
    { type: "person", w: 70, h: 230 },
    { type: "hat", w: 60, h: 30 },
    { type: "phone", w: 22, h: 40 },
  ],
  lobby: [
    { type: "suitcase", w: 70, h: 90 },
    { type: "plant", w: 90, h: 180 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "painting", w: 110, h: 90, wall: true },
    { type: "person", w: 70, h: 230 },
    { type: "bag", w: 60, h: 50 },
    { type: "umbrella", w: 30, h: 110 },
    { type: "newspaper", w: 90, h: 40 },
    { type: "vase", w: 40, h: 80 },
    { type: "key", w: 34, h: 16 },
    { type: "letter", w: 60, h: 40 },
    { type: "dog", w: 90, h: 60 },
    { type: "map", w: 140, h: 100, wall: true },
    { type: "flag", w: 80, h: 60, wall: true },
    { type: "phone", w: 22, h: 40 },
    { type: "box", w: 70, h: 60 },
  ],
  office: [
    { type: "laptop", w: 110, h: 70 },
    { type: "phone", w: 22, h: 40 },
    { type: "notebook", w: 60, h: 46 },
    { type: "cup", w: 30, h: 28 },
    { type: "plant", w: 70, h: 110 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "box", w: 70, h: 60 },
    { type: "bag", w: 60, h: 50 },
    { type: "person", w: 70, h: 230 },
    { type: "coat", w: 70, h: 200 },
    { type: "pen", w: 60, h: 8 },
    { type: "letter", w: 60, h: 40 },
    { type: "glasses", w: 50, h: 18 },
    { type: "bottle", w: 22, h: 70 },
    { type: "map", w: 140, h: 100, wall: true },
    { type: "painting", w: 110, h: 90, wall: true },
  ],
  shelf: [
    { type: "book", w: 26, h: 92 },
    { type: "bookstack", w: 150, h: 42 },
    { type: "vase", w: 40, h: 80 },
    { type: "clock", w: 60, h: 60 },
    { type: "globe", w: 60, h: 80 },
    { type: "candle", w: 16, h: 50 },
    { type: "box", w: 70, h: 60 },
    { type: "bottle", w: 22, h: 70 },
    { type: "plant", w: 50, h: 70 },
    { type: "radio", w: 90, h: 50 },
    { type: "cat", w: 70, h: 45 },
    { type: "letter", w: 60, h: 40 },
    { type: "key", w: 34, h: 16 },
    { type: "cup", w: 30, h: 28 },
    { type: "glasses", w: 50, h: 18 },
    { type: "phone", w: 22, h: 40 },
  ],
  train: [
    { type: "suitcase", w: 70, h: 80 },
    { type: "bag", w: 60, h: 50 },
    { type: "newspaper", w: 90, h: 40 },
    { type: "hat", w: 60, h: 30 },
    { type: "book", w: 26, h: 90 },
    { type: "cup", w: 30, h: 28 },
    { type: "bottle", w: 22, h: 70 },
    { type: "phone", w: 22, h: 40 },
    { type: "glasses", w: 50, h: 18 },
    { type: "umbrella", w: 30, h: 110 },
    { type: "coat", w: 60, h: 120, wall: true },
    { type: "person", w: 70, h: 230 },
    { type: "dog", w: 90, h: 60 },
    { type: "cat", w: 70, h: 45 },
    { type: "ticket", w: 60, h: 34 },
    { type: "box", w: 70, h: 60 },
  ],
  restaurant: [
    { type: "cup", w: 30, h: 28 },
    { type: "bottle", w: 22, h: 70 },
    { type: "vase", w: 40, h: 80 },
    { type: "candle", w: 16, h: 50 },
    { type: "menu", w: 40, h: 60 },
    { type: "glasses", w: 50, h: 18 },
    { type: "phone", w: 22, h: 40 },
    { type: "key", w: 34, h: 16 },
    { type: "letter", w: 60, h: 40 },
    { type: "hat", w: 60, h: 30 },
    { type: "person", w: 70, h: 230 },
    { type: "plant", w: 90, h: 180 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "painting", w: 110, h: 90, wall: true },
    { type: "bag", w: 60, h: 50 },
    { type: "coat", w: 70, h: 200 },
  ],
  board: [
    { type: "suitcase", w: 70, h: 90 },
    { type: "person", w: 70, h: 230 },
    { type: "bag", w: 60, h: 50 },
    { type: "plant", w: 90, h: 180 },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "sign", w: 140, h: 36, wall: true },
    { type: "flag", w: 80, h: 60, wall: true },
    { type: "dog", w: 90, h: 60 },
    { type: "box", w: 70, h: 60 },
    { type: "umbrella", w: 30, h: 110 },
    { type: "newspaper", w: 90, h: 40 },
    { type: "ticket", w: 60, h: 34 },
    { type: "hat", w: 60, h: 30 },
    { type: "map", w: 140, h: 100, wall: true },
  ],
  street: [
    { type: "bicycle", w: 150, h: 90 },
    { type: "car", w: 240, h: 90 },
    { type: "dog", w: 90, h: 60 },
    { type: "cat", w: 70, h: 45 },
    { type: "person", w: 70, h: 230 },
    { type: "box", w: 70, h: 60 },
    { type: "plant", w: 70, h: 110 },
    { type: "sign", w: 140, h: 36, wall: true },
    { type: "flag", w: 80, h: 60, wall: true },
    { type: "clock", w: 60, h: 60, wall: true },
    { type: "bag", w: 60, h: 50 },
    { type: "umbrella", w: 30, h: 110 },
    { type: "suitcase", w: 70, h: 90 },
    { type: "newspaper", w: 90, h: 40 },
    { type: "hat", w: 60, h: 30 },
    { type: "tree", w: 120, h: 260 },
  ],
  study: [
    { type: "book", w: 26, h: 92 },
    { type: "bookstack", w: 150, h: 42 },
    { type: "candle", w: 16, h: 50 },
    { type: "vase", w: 40, h: 80 },
    { type: "letter", w: 60, h: 40 },
    { type: "pen", w: 60, h: 8 },
    { type: "glasses", w: 50, h: 18 },
    { type: "bottle", w: 22, h: 70 },
    { type: "cup", w: 30, h: 28 },
    { type: "dog", w: 90, h: 60 },
    { type: "cat", w: 70, h: 45 },
    { type: "plant", w: 90, h: 180 },
    { type: "painting", w: 110, h: 90, wall: true },
    { type: "map", w: 140, h: 100, wall: true },
    { type: "key", w: 34, h: 16 },
    { type: "radio", w: 90, h: 50 },
    { type: "bag", w: 60, h: 50 },
  ],
};

/** Colours that read clearly against a paper wall and one another. */
export const OBJECT_COLORS: readonly SceneColor[] = ["burgundy", "forest", "navy", "mustard", "charcoal", "brass", "walnut", "olive", "slate", "rust", "teal", "plum"];
export const LIGHT_COLORS: ReadonlySet<SceneColor> = new Set<SceneColor>(["cream", "ivory", "mustard", "brass"]);
/** Colours that are hard to tell apart at a glance; recolour mutations avoid these pairs. */
export const SIMILAR: Partial<Record<SceneColor, readonly SceneColor[]>> = {
  burgundy: ["plum", "rust"],
  plum: ["burgundy", "navy"],
  rust: ["burgundy", "walnut"],
  walnut: ["rust", "charcoal"],
  charcoal: ["walnut", "navy", "slate"],
  navy: ["charcoal", "plum", "slate"],
  slate: ["navy", "charcoal", "teal"],
  teal: ["slate", "forest"],
  forest: ["teal", "olive"],
  olive: ["forest", "brass"],
  brass: ["olive", "mustard"],
  mustard: ["brass", "cream"],
  cream: ["ivory", "mustard"],
  ivory: ["cream"],
};
