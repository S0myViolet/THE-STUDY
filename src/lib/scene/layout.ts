/**
 * Placement geometry shared by the templates, the mutation engine and the tests.
 *
 * Every zone is a rectangle whose bottom edge is a baseline (floor, table top,
 * shelf plank). Objects placed in a zone stand on that baseline unless the zone
 * is a wall zone (id starts with "wall"), where wall-hung objects float freely.
 */
import type { Rng, SceneColor, SceneObject, SceneObjectType, SceneZone } from "./types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Flat or structural things other objects may sit in front of. */
export const PASSTHROUGH: ReadonlySet<SceneObjectType> = new Set<SceneObjectType>(["rug", "window", "door", "awning"]);
/** Surfaces that carry other objects; a non-surface object may overlap exactly one surface. */
export const SURFACE: ReadonlySet<SceneObjectType> = new Set<SceneObjectType>(["table", "counter", "shelf", "board", "bench"]);
/** Objects that hang on walls rather than stand on a baseline. */
export const WALL_HUNG: ReadonlySet<SceneObjectType> = new Set<SceneObjectType>(["painting", "clock", "sign", "map", "flag", "coat", "shelf", "board", "window"]);

export function overlaps(a: Rect, b: Rect, pad = 0): boolean {
  return a.x + a.w + pad > b.x && b.x + b.w + pad > a.x && a.y + a.h + pad > b.y && b.y + b.h + pad > a.y;
}

/** Two objects conflict when they overlap and the overlap is not the ordinary "thing on a surface" kind. */
export function conflicts(a: SceneObject, b: SceneObject): boolean {
  if (PASSTHROUGH.has(a.type) || PASSTHROUGH.has(b.type)) return false;
  const sa = SURFACE.has(a.type);
  const sb = SURFACE.has(b.type);
  if (sa !== sb) return false;
  return overlaps(a, b, -2);
}

export function isWallZone(z: SceneZone): boolean {
  return z.id.startsWith("wall");
}

export function center(o: Rect): { x: number; y: number } {
  return { x: o.x + o.w / 2, y: o.y + o.h / 2 };
}

export function distance(a: Rect, b: Rect): number {
  const ca = center(a);
  const cb = center(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

/**
 * Try to find a free position for a w×h object inside a zone. Returns null when
 * nothing fits after `tries` attempts. Deterministic given the rng.
 */
export function findSlot(rng: Rng, zone: SceneZone, type: SceneObjectType, w: number, h: number, existing: readonly SceneObject[], tries = 40): { x: number; y: number } | null {
  if (w > zone.w + 4 || h > zone.h + 60) return null;
  const wall = isWallZone(zone) || (WALL_HUNG.has(type) && zone.id !== "board");
  const probe: SceneObject = { id: "probe", type, x: 0, y: 0, w, h, color: "charcoal" };
  const maxX = zone.x + Math.max(0, zone.w - w);
  for (let i = 0; i < tries; i++) {
    const x = Math.round(zone.x + rng.next() * Math.max(0, zone.w - w));
    let y: number;
    if (wall) {
      const span = Math.max(0, zone.h - h);
      y = Math.round(zone.y + rng.next() * span);
    } else {
      y = zone.y + zone.h - h - rng.int(0, 4);
    }
    probe.x = Math.min(x, maxX);
    probe.y = y;
    if (!existing.some((o) => conflicts(probe, o))) return { x: probe.x, y: probe.y };
  }
  return null;
}

export interface ZoneSpec extends SceneZone {
  /** floor and surface zones align object bottoms to the zone's bottom edge; wall zones place freely */
  mode: "floor" | "surface" | "wall";
}

export interface PlaceSpec {
  type: SceneObjectType;
  zone: string;
  w: number;
  h: number;
  color: SceneColor;
  label?: string;
  text?: string;
  count?: number;
  anomaly?: boolean;
  rotation?: number;
  /** override the zone phrase */
  phrase?: string;
}

export interface FixedSpec extends Omit<PlaceSpec, "zone"> {
  x: number;
  y: number;
  zone?: string;
}

/** Accumulates objects for one scene with non-overlap guarantees. */
export class Placer {
  readonly objects: SceneObject[] = [];
  private n = 0;
  constructor(
    readonly rng: Rng,
    readonly zones: ZoneSpec[],
  ) {}

  zone(id: string): ZoneSpec {
    const z = this.zones.find((x) => x.id === id);
    if (!z) throw new Error(`unknown zone ${id}`);
    return z;
  }

  private id(type: SceneObjectType): string {
    this.n += 1;
    return `${type}-${this.n}`;
  }

  /** Structural object at an exact position (no overlap check). */
  fixed(spec: FixedSpec): SceneObject {
    const zone = spec.zone ? this.zone(spec.zone) : undefined;
    const o: SceneObject = {
      id: this.id(spec.type),
      type: spec.type,
      x: spec.x,
      y: spec.y,
      w: spec.w,
      h: spec.h,
      color: spec.color,
    };
    if (spec.label) o.label = spec.label;
    if (spec.text) o.text = spec.text;
    if (spec.count) o.count = spec.count;
    if (spec.anomaly) o.anomaly = true;
    if (spec.rotation) o.rotation = spec.rotation;
    const phrase = spec.phrase ?? zone?.name;
    if (phrase) o.zone = phrase;
    this.objects.push(o);
    return o;
  }

  /** Place inside a zone if a free slot exists; otherwise returns null and adds nothing. */
  place(spec: PlaceSpec): SceneObject | null {
    const zone = this.zone(spec.zone);
    const slot = findSlot(this.rng, zone, spec.type, spec.w, spec.h, this.objects);
    if (!slot) return null;
    return this.fixed({ ...spec, x: slot.x, y: slot.y, zone: spec.zone });
  }

  count(type?: SceneObjectType): number {
    return type ? this.objects.filter((o) => o.type === type).length : this.objects.length;
  }

  has(type: SceneObjectType): boolean {
    return this.objects.some((o) => o.type === type);
  }
}

/** Export zones without the placement mode. */
export function publicZones(zones: ZoneSpec[]): SceneZone[] {
  return zones.map(({ id, name, x, y, w, h }) => ({ id, name, x, y, w, h }));
}

/** Nearest horizontally-adjacent neighbour in the same zone (used for relationship facts and questions). */
export function adjacentPairs(objects: readonly SceneObject[], maxGap = 48): { a: SceneObject; b: SceneObject; gap: number }[] {
  const pairs: { a: SceneObject; b: SceneObject; gap: number }[] = [];
  const candidates = objects.filter((o) => !PASSTHROUGH.has(o.type) && !SURFACE.has(o.type) && !!o.zone);
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (a.zone !== b.zone) continue;
      const left = a.x < b.x ? a : b;
      const right = left === a ? b : a;
      const gap = right.x - (left.x + left.w);
      // vertical bands must overlap so the two are visually side by side
      const vertical = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (gap >= -4 && gap <= maxGap && vertical > 8) pairs.push({ a: left, b: right, gap });
    }
  }
  return pairs.sort((p, q) => p.gap - q.gap);
}
