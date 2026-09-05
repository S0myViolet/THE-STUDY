/**
 * Ten procedural scene templates. Each one lays out fixed structure (walls,
 * counters, shelves), then fills named zones from a shuffled pool until the
 * density target is met, and occasionally slips in one object that does not belong.
 *
 * Coordinates are scene units on a 960×600 canvas. Room floors sit at y=470.
 */
import type { Rng, Scene, SceneColor, SceneObject, SceneObjectType, SceneTemplate } from "./types";
import { Placer, publicZones, type PlaceSpec, type ZoneSpec } from "./layout";
import {
  BOX_LABELS,
  CAFE_MENU,
  CAFE_SIGNS,
  DESTINATIONS,
  FLIGHT_STATUSES,
  LOBBY_SIGNS,
  LONG_TITLES,
  MAP_LABELS,
  NEWSPAPERS,
  OBJECT_COLORS,
  OFFICE_BOARD,
  OFFICE_SIGNS,
  PAINTING_SUBJECTS,
  RESTAURANT_SIGNS,
  SHORT_TITLES,
  STREET_SHOPS,
  STREET_SIGNS,
  TRAIN_SIGNS,
  boardTime,
  clockTime,
  gateCode,
  ticketText,
} from "./data";

/* ------------------------------------------------------------------ */
/* Shared geometry (the renderer's backdrops rely on these)            */
/* ------------------------------------------------------------------ */

export const W = 960;
export const H = 600;
export const FLOOR = 470;
export const GEOMETRY = {
  shelfCase: { x: 180, y: 40, w: 600, h: 530, planks: [140, 260, 380, 500] },
  studyFireplace: { x: 380, y: 250, w: 200, h: 220 },
  streetPavement: 400,
  streetRoad: 470,
  hallFloor: 460,
  trainFloor: 470,
} as const;

type Density = "sparse" | "medium" | "dense";
const COUNT_RANGE: Record<Density, [number, number]> = { sparse: [8, 10], medium: [11, 14], dense: [15, 18] };

/* ------------------------------------------------------------------ */
/* Object vocabulary: default sizes and colour palettes per type       */
/* ------------------------------------------------------------------ */

const SIZE: Record<SceneObjectType, [number, number]> = {
  table: [320, 140],
  chair: [46, 80],
  book: [26, 92],
  bookstack: [150, 42],
  cup: [30, 28],
  lamp: [60, 90],
  plant: [70, 110],
  clock: [60, 60],
  sign: [140, 36],
  painting: [110, 90],
  window: [170, 210],
  door: [110, 270],
  person: [70, 230],
  bag: [60, 50],
  phone: [22, 40],
  notebook: [60, 46],
  letter: [60, 40],
  key: [34, 16],
  glasses: [50, 18],
  umbrella: [30, 110],
  hat: [60, 30],
  laptop: [110, 70],
  bottle: [22, 70],
  vase: [40, 80],
  board: [300, 150],
  suitcase: [70, 90],
  newspaper: [90, 40],
  candle: [16, 50],
  shelf: [200, 14],
  counter: [360, 140],
  rug: [300, 40],
  coat: [70, 200],
  menu: [40, 60],
  ticket: [60, 34],
  map: [140, 100],
  globe: [60, 80],
  typewriter: [110, 60],
  pen: [60, 8],
  radio: [90, 50],
  cat: [70, 45],
  dog: [90, 60],
  bicycle: [150, 90],
  car: [240, 90],
  tree: [120, 260],
  bench: [150, 80],
  streetlamp: [30, 260],
  awning: [300, 50],
  flag: [80, 60],
  box: [70, 60],
};

const PALETTE: Partial<Record<SceneObjectType, readonly SceneColor[]>> = {
  cup: ["cream", "ivory", "navy", "forest", "burgundy", "teal", "mustard", "rust"],
  notebook: ["burgundy", "navy", "forest", "mustard", "charcoal", "plum", "teal", "rust"],
  bag: ["walnut", "charcoal", "navy", "burgundy", "olive", "rust", "forest"],
  chair: ["walnut", "charcoal", "forest", "burgundy", "navy", "teal", "mustard"],
  person: ["charcoal", "navy", "burgundy", "forest", "olive", "rust", "plum", "walnut", "slate"],
  plant: ["rust", "cream", "charcoal", "teal", "mustard", "navy", "ivory"],
  lamp: ["mustard", "burgundy", "forest", "brass", "navy", "cream", "teal"],
  table: ["walnut", "charcoal", "olive"],
  counter: ["walnut", "charcoal", "forest", "navy"],
  door: ["forest", "burgundy", "navy", "charcoal", "teal", "walnut", "olive"],
  window: ["ivory", "cream"],
  shelf: ["walnut", "charcoal"],
  rug: ["burgundy", "navy", "teal", "rust", "olive", "plum"],
  coat: ["charcoal", "navy", "burgundy", "forest", "olive", "walnut"],
  hat: ["charcoal", "navy", "burgundy", "olive", "brass", "walnut", "cream"],
  umbrella: ["navy", "burgundy", "forest", "charcoal", "mustard", "teal", "plum"],
  suitcase: ["walnut", "navy", "burgundy", "forest", "charcoal", "mustard", "teal"],
  vase: ["teal", "cream", "navy", "mustard", "burgundy", "plum", "ivory"],
  car: ["navy", "burgundy", "forest", "cream", "charcoal", "mustard", "teal"],
  bicycle: ["forest", "burgundy", "navy", "charcoal", "mustard", "teal"],
  box: ["walnut", "brass", "cream", "olive"],
  bottle: ["forest", "navy", "teal", "burgundy", "olive", "charcoal"],
  awning: ["burgundy", "forest", "navy", "teal", "rust", "plum"],
  flag: ["burgundy", "navy", "forest", "mustard", "teal"],
  candle: ["ivory", "cream", "burgundy", "navy"],
  menu: ["burgundy", "forest", "navy", "charcoal", "plum"],
  radio: ["walnut", "cream", "teal", "burgundy", "olive"],
  letter: ["ivory", "cream"],
  ticket: ["cream", "mustard", "ivory"],
  sign: ["ivory", "cream", "charcoal", "forest", "navy"],
  clock: ["ivory", "cream", "charcoal", "brass"],
  painting: ["brass", "walnut", "charcoal"],
  map: ["cream", "ivory"],
  globe: ["brass", "teal", "cream"],
  typewriter: ["charcoal", "forest", "burgundy", "olive"],
  laptop: ["slate", "charcoal", "cream"],
  phone: ["charcoal", "navy", "burgundy"],
  glasses: ["charcoal", "brass", "walnut"],
  key: ["brass", "charcoal"],
  pen: ["charcoal", "navy", "burgundy", "brass"],
  newspaper: ["ivory", "cream"],
  board: ["charcoal", "forest", "ivory"],
  bench: ["walnut", "forest", "charcoal"],
  tree: ["forest", "olive"],
  streetlamp: ["charcoal", "forest"],
  cat: ["charcoal", "rust", "slate", "cream"],
  dog: ["walnut", "charcoal", "rust", "cream", "slate"],
  bookstack: OBJECT_COLORS,
  book: OBJECT_COLORS,
};

/* ------------------------------------------------------------------ */
/* Generation context                                                   */
/* ------------------------------------------------------------------ */

interface Ctx {
  p: Placer;
  rng: Rng;
  /** draw a unique item from a curated list (per scene) */
  take(list: readonly string[]): string;
}

type Step = (c: Ctx) => void;

interface Blueprint {
  id: string;
  name: string;
  backdrop: Scene["backdrop"];
  description: string;
  titles: readonly string[];
  settings: readonly string[];
  zones: ZoneSpec[];
  required: Step[];
  pool: Step[];
  anomalies: Step[];
}

function makeCtx(rng: Rng, zones: ZoneSpec[]): Ctx {
  const p = new Placer(rng, zones);
  const bags = new Map<readonly string[], string[]>();
  return {
    p,
    rng,
    take(list) {
      let bag = bags.get(list);
      if (!bag || bag.length === 0) {
        bag = rng.shuffle(list);
        bags.set(list, bag);
      }
      return bag.pop() as string;
    },
  };
}

function colorFor(rng: Rng, type: SceneObjectType): SceneColor {
  return rng.pick(PALETTE[type] ?? OBJECT_COLORS);
}

/** Place a typical instance of `type` in `zone`. */
function put(c: Ctx, type: SceneObjectType, zone: string, extra: Partial<PlaceSpec> = {}): SceneObject | null {
  const [w, h] = SIZE[type];
  return c.p.place({ type, zone, w, h, color: colorFor(c.rng, type), ...extra });
}

function fixed(c: Ctx, type: SceneObjectType, x: number, y: number, extra: Partial<PlaceSpec> & { w?: number; h?: number; zone?: string } = {}): SceneObject {
  const [w, h] = SIZE[type];
  return c.p.fixed({ type, x, y, w, h, color: colorFor(c.rng, type), ...extra });
}

const uprightBook = (c: Ctx, zone: string) => put(c, "book", zone, { label: c.take(SHORT_TITLES), h: c.rng.int(86, 98), w: c.rng.int(22, 30) });
const stack = (c: Ctx, zone: string) => {
  const count = c.rng.int(2, 4);
  return put(c, "bookstack", zone, { label: c.take(LONG_TITLES), count, h: 14 * count });
};
const clock = (c: Ctx, zone: string, extra: Partial<PlaceSpec> = {}) => put(c, "clock", zone, { text: clockTime(c.rng), ...extra });
const painting = (c: Ctx, zone: string) => put(c, "painting", zone, { text: c.rng.pick(PAINTING_SUBJECTS) });
const sign = (c: Ctx, zone: string, list: readonly string[], extra: Partial<PlaceSpec> = {}) => {
  const label = c.take(list);
  return put(c, "sign", zone, { label, w: Math.max(96, 20 + label.length * 9), ...extra });
};
const chairs = (c: Ctx, zone: string, lo = 1, hi = 3) => {
  const count = c.rng.int(lo, hi);
  return put(c, "chair", zone, { count, w: count * 50 });
};
const person = (c: Ctx, zone: string) => put(c, "person", zone, { color: colorFor(c.rng, "person") });
const newspaper = (c: Ctx, zone: string) => put(c, "newspaper", zone, { label: c.take(NEWSPAPERS) });
const box = (c: Ctx, zone: string) => put(c, "box", zone, { label: c.take(BOX_LABELS), count: c.rng.chance(0.3) ? 2 : 1, h: c.rng.chance(0.3) ? 120 : 60 });
const map = (c: Ctx, zone: string) => put(c, "map", zone, { label: c.take(MAP_LABELS) });
const ticket = (c: Ctx, zone: string) => put(c, "ticket", zone, { text: ticketText(c.rng), w: 84 });
const tallPlant = (c: Ctx, zone: string) => put(c, "plant", zone, { w: 90, h: 180 });
const smallPlant = (c: Ctx, zone: string) => put(c, "plant", zone, { w: 50, h: 70 });
const floorLamp = (c: Ctx, zone: string) => put(c, "lamp", zone, { w: 56, h: 220 });
const coatStand = (c: Ctx, zone: string) => put(c, "coat", zone, { w: 70, h: 200 });
const hungCoat = (c: Ctx, zone: string) => put(c, "coat", zone, { w: 60, h: 120 });
const lyingUmbrella = (c: Ctx, zone: string, anomaly = false) => put(c, "umbrella", zone, { w: 120, h: 26, rotation: 90, anomaly });
const candles = (c: Ctx, zone: string) => {
  const count = c.rng.int(1, 2);
  return put(c, "candle", zone, { count, w: 20 * count + 4 });
};
const cups = (c: Ctx, zone: string) => {
  const count = c.rng.chance(0.35) ? 2 : 1;
  return put(c, "cup", zone, { count, w: 34 * count });
};

/* ------------------------------------------------------------------ */
/* Zones                                                                */
/* ------------------------------------------------------------------ */

const Z = (id: string, name: string, x: number, y: number, w: number, h: number, mode: ZoneSpec["mode"]): ZoneSpec => ({ id, name, x, y, w, h, mode });
/** A floor zone standing on `baseline`, tall enough for a person. */
const floorZone = (id: string, name: string, x: number, w: number, baseline = FLOOR, tall = 260) => Z(id, name, x, baseline - tall, w, tall, "floor");
/** A surface zone whose bottom edge is the surface top. */
const surfaceZone = (id: string, name: string, x: number, w: number, top: number, tall = 120) => Z(id, name, x, top - tall, w, tall, "surface");
const wallZone = (id: string, name: string, x: number, y: number, w: number, h: number) => Z(id.startsWith("wall") ? id : `wall-${id}`, name, x, y, w, h, "wall");

/* ------------------------------------------------------------------ */
/* Templates                                                            */
/* ------------------------------------------------------------------ */

const desk: Blueprint = {
  id: "desk",
  name: "The Desk",
  backdrop: "room",
  description: "A writing desk beneath a window, with a shelf and whatever the morning left on it.",
  titles: ["The Desk", "A Morning's Desk", "The Writing Desk"],
  settings: ["A writing desk against a plain wall, a window to the left, a shelf to the right.", "Someone's desk, mid-morning; a window on the left and a small shelf on the right wall.", "A study corner: desk, chair, window and one high shelf."],
  zones: [
    surfaceZone("desk", "on the desk", 262, 416, 330, 110),
    wallZone("wall", "on the wall above the desk", 250, 40, 440, 150),
    floorZone("window", "by the window", 30, 200),
    floorZone("right", "on the floor to the right of the desk", 710, 230),
    surfaceZone("shelf", "on the shelf", 736, 188, 200, 100),
  ],
  required: [
    (c) => fixed(c, "window", 50, 70, { w: 170, h: 210 }),
    (c) => fixed(c, "table", 250, 330, { w: 440, h: 140 }),
    (c) => fixed(c, "shelf", 730, 200, { w: 200, h: 14 }),
    (c) => chairs(c, c.rng.chance(0.5) ? "right" : "window", 1, 1),
    (c) => put(c, "lamp", "desk"),
    (c) => (c.rng.chance(0.5) ? stack(c, "desk") : put(c, "notebook", "desk")),
  ],
  pool: [
    (c) => cups(c, "desk"),
    (c) => put(c, "notebook", "desk"),
    (c) => put(c, "phone", "desk"),
    (c) => put(c, "letter", "desk"),
    (c) => put(c, "key", "desk"),
    (c) => put(c, "glasses", "desk"),
    (c) => put(c, "pen", "desk"),
    (c) => candles(c, "desk"),
    (c) => put(c, "typewriter", "desk"),
    (c) => put(c, "laptop", "desk"),
    (c) => stack(c, "desk"),
    (c) => uprightBook(c, "desk"),
    (c) => put(c, "vase", "desk"),
    (c) => put(c, "radio", "desk"),
    (c) => put(c, "globe", "desk"),
    (c) => clock(c, "wall"),
    (c) => painting(c, "wall"),
    (c) => map(c, "wall"),
    (c) => put(c, "plant", "window"),
    (c) => put(c, "bag", "window"),
    (c) => put(c, "umbrella", "window"),
    (c) => put(c, "cat", "window"),
    (c) => box(c, "right"),
    (c) => tallPlant(c, "right"),
    (c) => put(c, "suitcase", "right"),
    (c) => put(c, "dog", "right"),
    (c) => coatStand(c, "right"),
    (c) => uprightBook(c, "shelf"),
    (c) => uprightBook(c, "shelf"),
    (c) => put(c, "bottle", "shelf"),
    (c) => put(c, "vase", "shelf"),
    (c) => put(c, "radio", "shelf"),
    (c) => put(c, "hat", "shelf"),
  ],
  anomalies: [(c) => lyingUmbrella(c, "desk", true), (c) => put(c, "bicycle", "right", { anomaly: true }), (c) => put(c, "suitcase", "desk", { anomaly: true, h: 80 }), (c) => put(c, "dog", "desk", { anomaly: true })],
};

const cafe: Blueprint = {
  id: "cafe",
  name: "The Cafe",
  backdrop: "cafe",
  description: "A corner cafe: a counter with its prices, a window table, a door to the street.",
  titles: ["The Cafe", "A Corner Cafe", "Late Morning, Cafe"],
  settings: ["A small cafe: window and table on the left, door in the middle, counter on the right.", "A corner cafe seen from the room: window table left, street door centre, serving counter right."],
  zones: [
    surfaceZone("counter", "on the counter", 572, 336, 330, 120),
    surfaceZone("table", "on the window table", 128, 134, 340, 80),
    floorZone("door", "near the door", 300, 260),
    wallZone("wall", "on the wall behind the counter", 560, 40, 360, 150),
    floorZone("window", "on the floor by the window", 20, 280),
  ],
  required: [
    (c) => fixed(c, "window", 40, 60, { w: 220, h: 210 }),
    (c) => fixed(c, "door", 385, 200, { w: 110, h: 270 }),
    (c) => fixed(c, "counter", 560, 330, { w: 360, h: 140 }),
    (c) => fixed(c, "table", 120, 340, { w: 150, h: 130 }),
    (c) => chairs(c, "window", 1, 2),
    (c) => put(c, "sign", "wall", { label: c.take(CAFE_MENU), w: 200, h: 40 }),
    (c) => cups(c, "counter"),
  ],
  pool: [
    (c) => cups(c, "counter"),
    (c) => put(c, "bottle", "counter"),
    (c) => candles(c, "counter"),
    (c) => put(c, "vase", "counter"),
    (c) => newspaper(c, "counter"),
    (c) => put(c, "menu", "counter"),
    (c) => put(c, "radio", "counter"),
    (c) => smallPlant(c, "counter"),
    (c) => put(c, "phone", "counter"),
    (c) => sign(c, "counter", CAFE_SIGNS, { h: 30 }),
    (c) => cups(c, "table"),
    (c) => put(c, "laptop", "table"),
    (c) => put(c, "notebook", "table"),
    (c) => uprightBook(c, "table"),
    (c) => put(c, "glasses", "table"),
    (c) => newspaper(c, "table"),
    (c) => clock(c, "wall"),
    (c) => painting(c, "wall"),
    (c) => put(c, "sign", "wall", { label: c.take(CAFE_MENU), w: 200, h: 40 }),
    (c) => sign(c, "wall", CAFE_SIGNS),
    (c) => put(c, "board", "wall", { label: "Specials", text: c.take(CAFE_MENU), w: 160, h: 120 }),
    (c) => person(c, "door"),
    (c) => put(c, "umbrella", "door"),
    (c) => put(c, "bag", "door"),
    (c) => put(c, "dog", "door"),
    (c) => put(c, "plant", "door"),
    (c) => person(c, "window"),
    (c) => put(c, "bag", "window"),
    (c) => put(c, "cat", "window"),
    (c) => tallPlant(c, "window"),
  ],
  anomalies: [(c) => put(c, "suitcase", "counter", { anomaly: true, h: 80 }), (c) => put(c, "globe", "counter", { anomaly: true }), (c) => put(c, "typewriter", "table", { anomaly: true }), (c) => put(c, "dog", "counter", { anomaly: true })],
};

const hotelLobby: Blueprint = {
  id: "hotel-lobby",
  name: "The Hotel Lobby",
  backdrop: "lobby",
  description: "A hotel lobby: reception, a bench for waiting, luggage, and signs pointing elsewhere.",
  titles: ["The Lobby", "Hotel Lobby, Evening", "Reception"],
  settings: ["A hotel lobby: entrance on the left, a bench and rug in the middle, reception desk on the right.", "The lobby of a small hotel, seen from the doorway of the bar: entrance left, seating centre, reception right."],
  zones: [
    surfaceZone("reception", "on the reception desk", 612, 296, 320, 120),
    wallZone("wall", "on the wall behind reception", 600, 30, 320, 150),
    floorZone("entrance", "near the entrance", 20, 220),
    floorZone("seating", "by the seating", 250, 210),
    floorZone("side", "beside the reception desk", 470, 130),
  ],
  required: [
    (c) => fixed(c, "door", 60, 180, { w: 130, h: 290, color: c.rng.pick(["walnut", "forest", "navy", "charcoal"]) }),
    (c) => fixed(c, "rug", 240, 440, { w: 230, h: 40 }),
    (c) => fixed(c, "counter", 600, 320, { w: 320, h: 150 }),
    (c) => fixed(c, "sign", 690, 70, { label: "Reception", w: 150, h: 40, zone: "wall" }),
    (c) => put(c, "bench", "seating", { w: 160, h: 80 }),
    (c) => clock(c, "wall"),
    (c) => put(c, "suitcase", "entrance"),
    (c) => tallPlant(c, c.rng.pick(["entrance", "side"])),
  ],
  pool: [
    (c) => put(c, "key", "reception"),
    (c) => put(c, "phone", "reception"),
    (c) => put(c, "letter", "reception"),
    (c) => put(c, "notebook", "reception"),
    (c) => put(c, "vase", "reception"),
    (c) => candles(c, "reception"),
    (c) => put(c, "bottle", "reception"),
    (c) => newspaper(c, "reception"),
    (c) => sign(c, "reception", LOBBY_SIGNS, { h: 30 }),
    (c) => ticket(c, "reception"),
    (c) => smallPlant(c, "reception"),
    (c) => painting(c, "wall"),
    (c) => sign(c, "wall", LOBBY_SIGNS),
    (c) => map(c, "wall"),
    (c) => put(c, "flag", "wall"),
    (c) => person(c, "entrance"),
    (c) => put(c, "suitcase", "entrance"),
    (c) => put(c, "umbrella", "entrance"),
    (c) => put(c, "dog", "entrance"),
    (c) => box(c, "entrance"),
    (c) => person(c, "seating"),
    (c) => put(c, "bag", "seating"),
    (c) => put(c, "hat", "seating"),
    (c) => newspaper(c, "seating"),
    (c) => put(c, "cat", "seating"),
    (c) => put(c, "suitcase", "side"),
    (c) => box(c, "side"),
    (c) => person(c, "side"),
    (c) => put(c, "coat", "side", { w: 70, h: 200 }),
  ],
  anomalies: [(c) => put(c, "bicycle", "side", { anomaly: true, w: 130, h: 80 }), (c) => put(c, "streetlamp", "entrance", { anomaly: true }), (c) => put(c, "dog", "reception", { anomaly: true }), (c) => put(c, "typewriter", "reception", { anomaly: true })],
};

const office: Blueprint = {
  id: "office",
  name: "The Office",
  backdrop: "office",
  description: "Two desks, a whiteboard, a window with blinds and the small clutter of a working day.",
  titles: ["The Office", "An Open-Plan Corner", "Tuesday, the Office"],
  settings: ["A small office: two desks either side of a door, a whiteboard on the left wall, a window with blinds on the right.", "An office seen from the corridor: left desk, door in the middle, right desk beneath a window."],
  zones: [
    surfaceZone("left", "on the left desk", 70, 320, 330, 110),
    surfaceZone("right", "on the right desk", 570, 320, 330, 110),
    wallZone("wall", "on the wall", 40, 30, 520, 160),
    floorZone("door", "by the door", 400, 160),
    floorZone("floor", "on the floor to the left", 20, 380),
    floorZone("window", "by the window", 560, 380),
  ],
  required: [
    (c) => fixed(c, "window", 600, 50, { w: 260, h: 140, text: "blinds" }),
    (c) => fixed(c, "door", 430, 200, { w: 100, h: 270 }),
    (c) => fixed(c, "table", 60, 330, { w: 340, h: 140 }),
    (c) => fixed(c, "table", 560, 330, { w: 340, h: 140 }),
    (c) => chairs(c, "floor", 1, 1),
    (c) => chairs(c, "window", 1, 1),
    (c) => put(c, "laptop", c.rng.pick(["left", "right"])),
    (c) => put(c, "board", "wall", { label: c.take(OFFICE_BOARD), text: c.take(OFFICE_BOARD), w: 300, h: 150, color: "ivory" }),
  ],
  pool: [
    (c) => put(c, "laptop", "left"),
    (c) => put(c, "laptop", "right"),
    (c) => put(c, "phone", c.rng.pick(["left", "right"])),
    (c) => put(c, "notebook", c.rng.pick(["left", "right"])),
    (c) => cups(c, "left"),
    (c) => cups(c, "right"),
    (c) => put(c, "pen", c.rng.pick(["left", "right"])),
    (c) => put(c, "letter", c.rng.pick(["left", "right"])),
    (c) => put(c, "glasses", c.rng.pick(["left", "right"])),
    (c) => stack(c, c.rng.pick(["left", "right"])),
    (c) => put(c, "lamp", c.rng.pick(["left", "right"])),
    (c) => put(c, "bottle", c.rng.pick(["left", "right"])),
    (c) => put(c, "key", c.rng.pick(["left", "right"])),
    (c) => smallPlant(c, c.rng.pick(["left", "right"])),
    (c) => clock(c, "wall"),
    (c) => sign(c, "wall", OFFICE_SIGNS),
    (c) => painting(c, "wall"),
    (c) => map(c, "wall"),
    (c) => coatStand(c, "door"),
    (c) => box(c, "door"),
    (c) => person(c, "door"),
    (c) => put(c, "bag", "door"),
    (c) => put(c, "umbrella", "door"),
    (c) => put(c, "plant", "floor"),
    (c) => box(c, "floor"),
    (c) => put(c, "bag", "floor"),
    (c) => person(c, "floor"),
    (c) => put(c, "suitcase", "floor"),
    (c) => tallPlant(c, "window"),
    (c) => person(c, "window"),
    (c) => box(c, "window"),
    (c) => put(c, "dog", "window"),
  ],
  anomalies: [(c) => put(c, "typewriter", c.rng.pick(["left", "right"]), { anomaly: true }), (c) => put(c, "streetlamp", "door", { anomaly: true }), (c) => put(c, "bicycle", "floor", { anomaly: true }), (c) => put(c, "cat", c.rng.pick(["left", "right"]), { anomaly: true })],
};

const bookshelf: Blueprint = {
  id: "bookshelf",
  name: "The Bookshelf",
  backdrop: "shelf",
  description: "Four shelves of a bookcase: titles on spines, a few objects tucked among them.",
  titles: ["The Bookshelf", "Four Shelves", "The Bookcase"],
  settings: ["A tall bookcase with four shelves, filling most of the view; a little floor either side.", "Four shelves of a wooden bookcase, seen straight on."],
  zones: [
    surfaceZone("top", "on the top shelf", 196, 568, 140, 100),
    surfaceZone("second", "on the second shelf", 196, 568, 260, 108),
    surfaceZone("third", "on the third shelf", 196, 568, 380, 108),
    surfaceZone("bottom", "on the bottom shelf", 196, 568, 500, 108),
    floorZone("floor", "on the floor to the right of the bookcase", 790, 150, 570),
    floorZone("left", "on the floor to the left of the bookcase", 20, 150, 570),
  ],
  required: [
    (c) => {
      for (const y of GEOMETRY.shelfCase.planks) fixed(c, "shelf", 190, y, { w: 580, h: 14, color: "walnut" });
    },
    (c) => uprightBook(c, "top"),
    (c) => uprightBook(c, "second"),
    (c) => uprightBook(c, "third"),
    (c) => stack(c, c.rng.pick(["second", "third", "bottom"])),
  ],
  pool: [
    (c) => uprightBook(c, "top"),
    (c) => uprightBook(c, "second"),
    (c) => uprightBook(c, "third"),
    (c) => uprightBook(c, "bottom"),
    (c) => uprightBook(c, c.rng.pick(["top", "second", "third", "bottom"])),
    (c) => stack(c, c.rng.pick(["top", "second", "third", "bottom"])),
    (c) => put(c, "vase", c.rng.pick(["top", "second", "third"])),
    (c) => clock(c, c.rng.pick(["top", "second"])),
    (c) => put(c, "globe", c.rng.pick(["top", "second", "third"])),
    (c) => put(c, "radio", c.rng.pick(["second", "third"])),
    (c) => candles(c, c.rng.pick(["top", "second", "third"])),
    (c) => box(c, "bottom"),
    (c) => put(c, "bottle", c.rng.pick(["second", "third", "bottom"])),
    (c) => smallPlant(c, c.rng.pick(["top", "second"])),
    (c) => put(c, "cat", c.rng.pick(["second", "third"])),
    (c) => put(c, "letter", c.rng.pick(["second", "third"])),
    (c) => put(c, "cup", c.rng.pick(["second", "third"])),
    (c) => put(c, "glasses", c.rng.pick(["second", "third"])),
    (c) => put(c, "typewriter", "bottom"),
    (c) => put(c, "hat", c.rng.pick(["top", "bottom"])),
    (c) => put(c, "plant", "floor"),
    (c) => box(c, "floor"),
    (c) => put(c, "bag", "floor"),
    (c) => put(c, "umbrella", "floor"),
    (c) => chairs(c, "floor", 1, 1),
    (c) => floorLamp(c, "floor"),
    (c) => put(c, "dog", "floor"),
    (c) => put(c, "suitcase", "left"),
    (c) => put(c, "plant", "left"),
    (c) => floorLamp(c, "left"),
    (c) => chairs(c, "left", 1, 1),
    (c) => put(c, "cat", "left"),
  ],
  anomalies: [(c) => lyingUmbrella(c, c.rng.pick(["second", "third"]), true), (c) => put(c, "suitcase", "top", { anomaly: true, h: 80 }), (c) => put(c, "dog", c.rng.pick(["second", "third"]), { anomaly: true }), (c) => put(c, "phone", c.rng.pick(["second", "third"]), { anomaly: true })],
};

const trainCompartment: Blueprint = {
  id: "train-compartment",
  name: "The Train Compartment",
  backdrop: "train",
  description: "A compartment mid-journey: luggage rack, a long seat, the window ledge, the sliding door.",
  titles: ["The Compartment", "Coach 4", "A Train Compartment"],
  settings: ["A train compartment: a wide window over a long seat, a luggage rack above, the sliding door on the right.", "Inside a railway compartment, seen from the seat opposite: rack, window, seat, and the corridor door to the right."],
  zones: [
    surfaceZone("rack", "on the luggage rack", 180, 600, 100, 90),
    surfaceZone("seat", "on the seat", 190, 580, 386, 100),
    surfaceZone("ledge", "on the window ledge", 404, 152, 326, 96),
    wallZone("wall", "on the left wall", 20, 100, 150, 220),
    floorZone("door", "by the compartment door", 800, 140),
    floorZone("floor", "on the floor", 190, 580, 560, 110),
  ],
  required: [
    (c) => fixed(c, "window", 180, 130, { w: 600, h: 196, text: "landscape" }),
    (c) => fixed(c, "shelf", 170, 100, { w: 620, h: 14, color: "charcoal", text: "rack" }),
    (c) => fixed(c, "shelf", 400, 326, { w: 160, h: 14, color: "walnut" }),
    (c) => fixed(c, "bench", 170, 346, { w: 620, h: 124, color: c.rng.pick(["burgundy", "navy", "forest", "teal", "olive"]), text: "seat" }),
    (c) => fixed(c, "door", 820, 120, { w: 110, h: 350, color: c.rng.pick(["walnut", "slate", "charcoal"]), text: "sliding" }),
    (c) => {
      const base = c.rng.int(1, 6) * 10;
      return put(c, "sign", "wall", { label: `Coach ${c.rng.int(1, 9)}`, text: `Seats ${base + 1}–${base + 6}`, w: 120, h: 40 });
    },
    (c) => put(c, "suitcase", "rack", { h: 80 }),
    (c) => ticket(c, c.rng.pick(["ledge", "seat"])),
  ],
  pool: [
    (c) => put(c, "suitcase", "rack", { h: 80 }),
    (c) => put(c, "bag", "rack"),
    (c) => box(c, "rack"),
    (c) => put(c, "hat", "rack"),
    (c) => lyingUmbrella(c, "rack"),
    (c) => newspaper(c, "seat"),
    (c) => put(c, "bag", "seat"),
    (c) => put(c, "hat", "seat"),
    (c) => uprightBook(c, "seat"),
    (c) => put(c, "phone", "seat"),
    (c) => put(c, "glasses", "seat"),
    (c) => put(c, "letter", "seat"),
    (c) => put(c, "notebook", "seat"),
    (c) => put(c, "laptop", "seat"),
    (c) => put(c, "cat", "seat"),
    (c) => cups(c, "ledge"),
    (c) => put(c, "bottle", "ledge"),
    (c) => ticket(c, "ledge"),
    (c) => put(c, "phone", "ledge"),
    (c) => put(c, "glasses", "ledge"),
    (c) => put(c, "key", "ledge"),
    (c) => sign(c, "wall", TRAIN_SIGNS, { w: 120 }),
    (c) => hungCoat(c, "wall"),
    (c) => map(c, "wall", ),
    (c) => clock(c, "wall"),
    (c) => person(c, "door"),
    (c) => put(c, "dog", "door"),
    (c) => put(c, "suitcase", "door"),
    (c) => put(c, "umbrella", "door"),
    (c) => put(c, "suitcase", "floor"),
    (c) => put(c, "bag", "floor"),
    (c) => box(c, "floor"),
    (c) => put(c, "dog", "floor"),
  ],
  anomalies: [(c) => put(c, "plant", "rack", { anomaly: true, w: 60, h: 85 }), (c) => put(c, "typewriter", "seat", { anomaly: true }), (c) => put(c, "bicycle", "floor", { anomaly: true }), (c) => put(c, "vase", "ledge", { anomaly: true })],
};

const restaurantTable: Blueprint = {
  id: "restaurant-table",
  name: "The Restaurant Table",
  backdrop: "restaurant",
  description: "A laid table seen from across the room; the wall behind it and whoever is standing by.",
  titles: ["The Table", "A Laid Table", "Table for Four"],
  settings: ["A long restaurant table with chairs behind it, a wall with pictures above, floor space either side.", "One restaurant table, laid, seen straight on; the wall behind it carries the decoration."],
  zones: [
    surfaceZone("tleft", "on the table, left", 130, 230, 360, 100),
    surfaceZone("tmid", "on the table, centre", 365, 230, 360, 100),
    surfaceZone("tright", "on the table, right", 600, 230, 360, 100),
    wallZone("wall", "on the wall behind the table", 100, 30, 760, 200),
    floorZone("fleft", "on the floor, left of the table", 20, 100),
    floorZone("fright", "on the floor, right of the table", 840, 100),
  ],
  required: [
    (c) => {
      const count = c.rng.int(2, 4);
      const w = count * 60;
      fixed(c, "chair", 480 - w / 2, 300, { w, h: 100, count, phrase: "behind the table" });
    },
    (c) => fixed(c, "table", 120, 360, { w: 720, h: 130, color: c.rng.pick(["ivory", "cream", "walnut"]), text: "cloth" }),
    (c) => candles(c, "tmid"),
    (c) => cups(c, c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "menu", c.rng.pick(["tleft", "tright"])),
    (c) => sign(c, "tmid", RESTAURANT_SIGNS, { w: 90, h: 30 }),
    (c) => painting(c, "wall"),
    (c) => put(c, "bottle", c.rng.pick(["tleft", "tmid", "tright"])),
  ],
  pool: [
    (c) => cups(c, "tleft"),
    (c) => cups(c, "tright"),
    (c) => put(c, "vase", "tmid"),
    (c) => put(c, "glasses", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "phone", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "key", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "letter", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "notebook", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "pen", c.rng.pick(["tleft", "tright"])),
    (c) => newspaper(c, c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "hat", c.rng.pick(["tleft", "tright"])),
    (c) => uprightBook(c, c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "menu", c.rng.pick(["tleft", "tright"])),
    (c) => put(c, "bottle", c.rng.pick(["tleft", "tright"])),
    (c) => clock(c, "wall"),
    (c) => painting(c, "wall"),
    (c) => sign(c, "wall", RESTAURANT_SIGNS),
    (c) => map(c, "wall"),
    (c) => put(c, "flag", "wall"),
    (c) => person(c, "fleft"),
    (c) => person(c, "fright"),
    (c) => tallPlant(c, "fleft"),
    (c) => tallPlant(c, "fright"),
    (c) => coatStand(c, "fleft"),
    (c) => coatStand(c, "fright"),
    (c) => put(c, "bag", "fleft"),
    (c) => put(c, "bag", "fright"),
    (c) => put(c, "dog", "fleft"),
    (c) => put(c, "umbrella", "fright"),
    (c) => put(c, "suitcase", "fright"),
  ],
  anomalies: [(c) => lyingUmbrella(c, c.rng.pick(["tleft", "tright"]), true), (c) => put(c, "typewriter", "tmid", { anomaly: true }), (c) => put(c, "globe", c.rng.pick(["tleft", "tright"]), { anomaly: true }), (c) => put(c, "suitcase", c.rng.pick(["tleft", "tright"]), { anomaly: true, h: 80 })],
};

const airportBoard: Blueprint = {
  id: "airport-board",
  name: "The Departures Board",
  backdrop: "board",
  description: "A departures board in a hall: destinations, times, gates and statuses, with travellers below.",
  titles: ["Departures", "The Departures Board", "Gate Announcements"],
  settings: ["A departures board filling the top of the view, a hall floor below it with travellers and luggage.", "The departures hall: a large board in the centre, a bench and passengers beneath, walls either side."],
  zones: [
    Z("board", "on the departures board", 150, 110, 660, 330, "surface"),
    floorZone("below", "below the board", 130, 700, 570),
    floorZone("left", "to the left of the board", 20, 105, 570),
    floorZone("right", "to the right of the board", 840, 100, 570),
    wallZone("wall", "on the wall to the right of the board", 846, 60, 100, 260),
  ],
  required: [
    (c) => {
      const start = c.rng.int(6, 20) * 60 + c.rng.int(0, 11) * 5;
      fixed(c, "board", 130, 40, { w: 700, h: 400, label: "Departures", text: boardTime(start - c.rng.int(2, 9) * 5), color: "charcoal", zone: "board" });
      const rows = c.rng.int(6, 9);
      const dests = c.rng.sample(DESTINATIONS, rows);
      const statuses: string[] = [];
      const delayedAt = c.rng.int(0, rows - 1);
      let cancelledAt = c.rng.chance(0.5) ? c.rng.int(0, rows - 1) : -1;
      if (cancelledAt === delayedAt) cancelledAt = -1;
      for (let i = 0; i < rows; i++) {
        statuses.push(i === delayedAt ? "Delayed" : i === cancelledAt ? "Cancelled" : c.rng.pick(FLIGHT_STATUSES.filter((s) => s !== "Delayed" && s !== "Cancelled")));
      }
      let t = start;
      for (let i = 0; i < rows; i++) {
        t += c.rng.int(1, 4) * 5;
        fixed(c, "sign", 150, 112 + i * 36, { w: 660, h: 30, label: dests[i], text: `${boardTime(t)} · ${gateCode(c.rng)} · ${statuses[i]}`, color: "charcoal", zone: "board" });
      }
    },
    (c) => put(c, "bench", "below", { w: 170, h: 80 }),
  ],
  pool: [
    (c) => person(c, "below"),
    (c) => person(c, "below"),
    (c) => put(c, "suitcase", "below"),
    (c) => put(c, "suitcase", "below"),
    (c) => put(c, "bag", "below"),
    (c) => tallPlant(c, "below"),
    (c) => put(c, "sign", "below", { label: `Gates ${c.rng.pick(["A", "B", "C"])}1–${c.rng.pick(["A", "B", "C"])}20 →`, w: 150, h: 60, text: "standing" }),
    (c) => box(c, "below"),
    (c) => put(c, "dog", "below"),
    (c) => put(c, "umbrella", "below"),
    (c) => newspaper(c, "below"),
    (c) => ticket(c, "below"),
    (c) => put(c, "hat", "below"),
    (c) => tallPlant(c, "left"),
    (c) => person(c, "left"),
    (c) => put(c, "suitcase", "left"),
    (c) => put(c, "umbrella", "left"),
    (c) => tallPlant(c, "right"),
    (c) => person(c, "right"),
    (c) => put(c, "suitcase", "right"),
    (c) => put(c, "bag", "right"),
    (c) => clock(c, "wall"),
    (c) => put(c, "sign", "wall", { label: c.rng.pick(["Exit →", "Taxis ↓", "Trains →", "Lounge ↑"]), w: 96, h: 36 }),
    (c) => put(c, "flag", "wall"),
  ],
  anomalies: [(c) => put(c, "bicycle", "below", { anomaly: true }), (c) => put(c, "streetlamp", c.rng.pick(["left", "right"]), { anomaly: true }), (c) => put(c, "lamp", "below", { anomaly: true }), (c) => put(c, "cat", "below", { anomaly: true })],
};

const street: Blueprint = {
  id: "street",
  name: "The Street",
  backdrop: "street",
  description: "A shop front on an ordinary street: awning, door, the pavement and the road.",
  titles: ["The Street", "A Shop Front", "Market Street"],
  settings: ["A street seen from the opposite pavement: a shop front with an awning, pavement either side, the road in front.", "One shop front on a quiet street, the pavement before it and the road nearest the viewer."],
  zones: [
    wallZone("wall", "on the shop front", 60, 200, 840, 120),
    floorZone("left", "on the pavement to the left", 20, 300, 400),
    floorZone("outside", "outside the shop door", 330, 310, 400),
    floorZone("right", "on the pavement to the right", 650, 290, 400),
    floorZone("road", "on the road", 20, 920, 560, 120),
  ],
  required: [
    (c) => fixed(c, "awning", 330, 130, { w: 300, h: 50, label: c.take(STREET_SHOPS) }),
    (c) => fixed(c, "door", 430, 190, { w: 100, h: 210 }),
    (c) => put(c, "streetlamp", c.rng.pick(["left", "right"])),
    (c) => (c.rng.chance(0.6) ? put(c, "car", "road") : put(c, "bicycle", "road")),
    (c) => sign(c, "wall", STREET_SIGNS),
    (c) => put(c, "tree", c.rng.pick(["left", "right"])),
    (c) => person(c, c.rng.pick(["left", "outside", "right"])),
    (c) => put(c, "bench", c.rng.pick(["left", "right"])),
  ],
  pool: [
    (c) => put(c, "bicycle", c.rng.pick(["left", "outside", "right"])),
    (c) => put(c, "dog", c.rng.pick(["left", "outside", "right"])),
    (c) => put(c, "cat", c.rng.pick(["left", "right"])),
    (c) => person(c, c.rng.pick(["left", "outside", "right"])),
    (c) => person(c, "road"),
    (c) => box(c, "outside"),
    (c) => put(c, "plant", "outside"),
    (c) => put(c, "sign", "outside", { label: c.take(STREET_SIGNS), w: 110, h: 70, text: "standing" }),
    (c) => put(c, "suitcase", c.rng.pick(["left", "right"])),
    (c) => put(c, "umbrella", "outside"),
    (c) => put(c, "bag", c.rng.pick(["left", "right"])),
    (c) => newspaper(c, c.rng.pick(["left", "right"])),
    (c) => put(c, "flag", "wall"),
    (c) => clock(c, "wall"),
    (c) => sign(c, "wall", STREET_SIGNS),
    (c) => put(c, "car", "road"),
    (c) => put(c, "bicycle", "road"),
    (c) => put(c, "dog", "road"),
    (c) => box(c, "road"),
    (c) => put(c, "cat", "road"),
    (c) => put(c, "hat", "road"),
    (c) => put(c, "tree", c.rng.pick(["left", "right"])),
    (c) => put(c, "streetlamp", c.rng.pick(["left", "right"])),
  ],
  anomalies: [(c) => chairs(c, "road", 1, 1)?.anomaly !== undefined || markLast(c), (c) => put(c, "lamp", c.rng.pick(["left", "right"]), { anomaly: true }), (c) => put(c, "globe", "outside", { anomaly: true }), (c) => stack(c, "road")?.anomaly !== undefined || markLast(c)],
};

/** Flag the most recently placed object as the anomaly (for steps built from helpers). */
function markLast(c: Ctx): boolean {
  const last = c.p.objects[c.p.objects.length - 1];
  if (last) last.anomaly = true;
  return true;
}

const study: Blueprint = {
  id: "study",
  name: "The Study",
  backdrop: "study",
  description: "A private study: writing desk, mantelpiece, a shelf, an armchair and a rug before the fire.",
  titles: ["The Study", "A Private Study", "Evening in the Study"],
  settings: ["A study with dark walls: writing desk on the left, fireplace and mantel in the centre, an armchair and shelf on the right.", "A quiet study: desk to the left under pictures, the fireplace centre with a rug before it, armchair to the right."],
  zones: [
    surfaceZone("desk", "on the writing desk", 50, 280, 330, 110),
    surfaceZone("mantel", "on the mantelpiece", 376, 208, 250, 90),
    surfaceZone("shelf", "on the shelf", 706, 208, 200, 100),
    wallZone("wall", "on the wall above the desk", 40, 30, 320, 170),
    floorZone("rug", "on the rug", 380, 260, 540, 150),
    floorZone("armchair", "by the armchair", 650, 290),
  ],
  required: [
    (c) => fixed(c, "table", 40, 330, { w: 300, h: 140, color: "walnut" }),
    (c) => fixed(c, "shelf", 370, 250, { w: 220, h: 14, color: "charcoal", text: "mantel" }),
    (c) => fixed(c, "shelf", 700, 200, { w: 212, h: 14, color: "walnut" }),
    (c) => fixed(c, "rug", 380, 500, { w: 260, h: 40 }),
    (c) => put(c, "chair", "armchair", { w: 120, h: 130, text: "armchair" }),
    (c) => clock(c, "mantel"),
    (c) => put(c, "lamp", "desk"),
    (c) => (c.rng.chance(0.5) ? put(c, "typewriter", "desk") : put(c, "globe", "desk")),
  ],
  pool: [
    (c) => put(c, "letter", "desk"),
    (c) => put(c, "pen", "desk"),
    (c) => put(c, "glasses", "desk"),
    (c) => stack(c, "desk"),
    (c) => uprightBook(c, "desk"),
    (c) => candles(c, "desk"),
    (c) => put(c, "notebook", "desk"),
    (c) => cups(c, "desk"),
    (c) => put(c, "bottle", "desk"),
    (c) => put(c, "key", "desk"),
    (c) => put(c, "radio", "desk"),
    (c) => candles(c, "mantel"),
    (c) => put(c, "vase", "mantel"),
    (c) => put(c, "letter", "mantel"),
    (c) => put(c, "bottle", "mantel"),
    (c) => put(c, "key", "mantel"),
    (c) => put(c, "radio", "mantel"),
    (c) => put(c, "globe", "mantel", { w: 50, h: 66 }),
    (c) => uprightBook(c, "shelf"),
    (c) => uprightBook(c, "shelf"),
    (c) => stack(c, "shelf"),
    (c) => put(c, "vase", "shelf"),
    (c) => put(c, "bottle", "shelf"),
    (c) => box(c, "shelf"),
    (c) => painting(c, "wall"),
    (c) => map(c, "wall"),
    (c) => put(c, "flag", "wall"),
    (c) => painting(c, "wall"),
    (c) => put(c, "dog", "rug"),
    (c) => put(c, "cat", "rug"),
    (c) => put(c, "bag", "rug"),
    (c) => box(c, "rug"),
    (c) => stack(c, "rug"),
    (c) => put(c, "globe", "rug", { w: 80, h: 110 }),
    (c) => floorLamp(c, "armchair"),
    (c) => tallPlant(c, "armchair"),
    (c) => put(c, "dog", "armchair"),
    (c) => put(c, "bag", "armchair"),
    (c) => newspaper(c, "armchair"),
    (c) => coatStand(c, "armchair"),
    (c) => put(c, "umbrella", "armchair"),
  ],
  anomalies: [(c) => put(c, "bicycle", "rug", { anomaly: true }), (c) => put(c, "suitcase", "mantel", { anomaly: true, h: 80 }), (c) => lyingUmbrella(c, "desk", true), (c) => put(c, "laptop", "mantel", { anomaly: true })],
};

/* ------------------------------------------------------------------ */
/* Assembly                                                             */
/* ------------------------------------------------------------------ */

function compile(bp: Blueprint): SceneTemplate {
  return {
    id: bp.id,
    name: bp.name,
    backdrop: bp.backdrop,
    description: bp.description,
    density: "medium",
    generate(rng, options) {
      const density: Density = options?.density ?? "medium";
      const [lo, hi] = COUNT_RANGE[density];
      const title = rng.pick(bp.titles);
      const setting = rng.pick(bp.settings);
      const target = rng.int(lo, hi);
      const wantAnomaly = density !== "sparse" ? rng.chance(0.6) : rng.chance(0.35);
      const c = makeCtx(rng, bp.zones);
      for (const step of bp.required) step(c);
      const fillTo = wantAnomaly ? target - 1 : target;
      const pool = rng.shuffle(bp.pool);
      for (const step of pool) {
        if (c.p.count() >= fillTo) break;
        step(c);
      }
      if (wantAnomaly && c.p.count() < 18) {
        for (const step of rng.shuffle(bp.anomalies)) {
          const before = c.p.count();
          step(c);
          if (c.p.count() > before) break;
        }
      }
      // top up if placement failures left us short; never exceed the hard cap
      if (c.p.count() < Math.max(8, lo)) {
        for (const step of rng.shuffle(bp.pool)) {
          if (c.p.count() >= lo) break;
          step(c);
        }
      }
      const objects = c.p.objects.slice(0, 18);
      return { title, setting, width: W, height: H, backdrop: bp.backdrop, objects, zones: publicZones(bp.zones) };
    },
  };
}

export const TEMPLATES: SceneTemplate[] = [desk, cafe, hotelLobby, office, bookshelf, trainCompartment, restaurantTable, airportBoard, street, study].map(compile);
