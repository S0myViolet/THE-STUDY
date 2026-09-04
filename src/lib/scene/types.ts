/**
 * Procedural observation scenes.
 *
 * A Scene is structured data (ground truth). The renderer turns it into SVG.
 * Questions, change-detection mutations and room-scan scoring all derive from
 * the same data, and a stored `template + seed` reconstructs a scene identically.
 */
import type { ObservationFact } from "@/lib/scoring/observation";

export type SceneObjectType =
  | "table"
  | "chair"
  | "book"
  | "bookstack"
  | "cup"
  | "lamp"
  | "plant"
  | "clock"
  | "sign"
  | "painting"
  | "window"
  | "door"
  | "person"
  | "bag"
  | "phone"
  | "notebook"
  | "letter"
  | "key"
  | "glasses"
  | "umbrella"
  | "hat"
  | "laptop"
  | "bottle"
  | "vase"
  | "board"
  | "suitcase"
  | "newspaper"
  | "candle"
  | "shelf"
  | "counter"
  | "rug"
  | "coat"
  | "menu"
  | "ticket"
  | "map"
  | "globe"
  | "typewriter"
  | "pen"
  | "radio"
  | "cat"
  | "dog"
  | "bicycle"
  | "car"
  | "tree"
  | "bench"
  | "streetlamp"
  | "awning"
  | "flag"
  | "box";

export type SceneColor =
  | "burgundy"
  | "forest"
  | "navy"
  | "mustard"
  | "cream"
  | "charcoal"
  | "brass"
  | "walnut"
  | "olive"
  | "slate"
  | "rust"
  | "ivory"
  | "teal"
  | "plum";

export interface SceneObject {
  id: string;
  type: SceneObjectType;
  /** position in scene units (0..width, 0..height); the renderer scales */
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  color: SceneColor;
  /** readable label, e.g. book title, sign text, name badge */
  label?: string;
  /** a count for stackable things (books in a stack, chairs in a row) */
  count?: number;
  /** clock time, board times, ticket numbers */
  text?: string;
  /** named region of the scene, e.g. "near the door" */
  zone?: string;
  /** true when the object is deliberately out of place (anomaly) */
  anomaly?: boolean;
  /** draw order */
  z?: number;
}

export interface SceneZone {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scene {
  id: string;
  template: string;
  seed: number;
  title: string;
  /** short description of the setting shown after the exposure */
  setting: string;
  width: number;
  height: number;
  objects: SceneObject[];
  zones: SceneZone[];
  /** background style key handled by the renderer */
  backdrop: "room" | "cafe" | "lobby" | "office" | "train" | "street" | "board" | "shelf" | "restaurant" | "study";
  /** ground truth for room-scan scoring; derived from objects by the engine */
  facts: ObservationFact[];
}

export type SceneQuestionKind = "color" | "count" | "position" | "label" | "text" | "absence" | "relationship" | "anomaly";

export interface SceneQuestion {
  id: string;
  kind: SceneQuestionKind;
  prompt: string;
  format: "mcq" | "short" | "number";
  options?: string[];
  answer: string;
  accept?: string[];
  /** subskill evidence category */
  subskill: "observation.detail" | "observation.spatial" | "observation.text" | "observation.anomaly" | "observation.precision";
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export type SceneMutationKind = "move" | "recolor" | "remove" | "add" | "relabel" | "retext" | "swap" | "rotate";

export interface SceneMutation {
  kind: SceneMutationKind;
  objectId: string;
  /** human description used for the answer key, e.g. "The lamp moved from the window to the desk" */
  description: string;
  keywords: string[];
  before?: Partial<SceneObject>;
  after?: Partial<SceneObject>;
}

export interface SceneTemplate {
  id: string;
  name: string;
  backdrop: Scene["backdrop"];
  description: string;
  /** rough number of objects; used for difficulty */
  density: "sparse" | "medium" | "dense";
  generate: (rng: Rng, options?: { density?: "sparse" | "medium" | "dense" }) => Omit<Scene, "id" | "facts" | "template" | "seed">;
}

export interface Rng {
  next(): number; // [0,1)
  int(lo: number, hi: number): number; // inclusive
  pick<T>(xs: readonly T[]): T;
  shuffle<T>(xs: readonly T[]): T[];
  chance(p: number): boolean;
  sample<T>(xs: readonly T[], n: number): T[];
}
