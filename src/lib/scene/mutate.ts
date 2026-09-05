import type { Scene, SceneColor, SceneMutation, SceneMutationKind, SceneObject, SceneObjectType } from "./types";
import { createRng } from "./rng";
import { COLOR_LABEL, sceneFacts } from "./engine";
import { findSlot, PASSTHROUGH, SURFACE, isWallZone } from "./layout";
import { SHORT_TITLES, CAFE_SIGNS } from "./data";

/**
 * Change detection: apply N distinct, visible mutations to distinct objects.
 * Each mutation carries a human description and lower-case keywords used to
 * match the user's free-text answers.
 */

const ADDABLE: SceneObjectType[] = ["cup", "book", "umbrella", "hat", "phone", "notebook", "bottle", "glasses", "key", "letter", "plant", "candle", "bag", "vase", "newspaper"];
const DEFAULT_SIZE: Partial<Record<SceneObjectType, [number, number]>> = { cup: [34, 30], book: [26, 74], umbrella: [24, 90], hat: [56, 30], phone: [26, 46], notebook: [48, 62], bottle: [22, 64], glasses: [52, 20], key: [40, 18], letter: [60, 42], plant: [90, 130], candle: [16, 54], bag: [70, 56], vase: [40, 66], newspaper: [80, 52] };
const COLORS = Object.keys(COLOR_LABEL) as SceneColor[];

function movable(o: SceneObject): boolean {
  return !!o.zone && !PASSTHROUGH.has(o.type) && !SURFACE.has(o.type) && o.type !== "board";
}

function timeShift(t: string, rng: ReturnType<typeof createRng>): string {
  const m = t.match(/(\d{1,2}):(\d{2})/);
  if (!m) return t;
  let h = Number(m[1]);
  let min = Number(m[2]);
  min = (min + rng.pick([15, 20, 25, 30, 35, 40])) % 60;
  if (rng.chance(0.5)) h = (h % 12) + 1;
  return t.replace(m[0], `${h}:${String(min).padStart(2, "0")}`);
}

export function mutateScene(scene: Scene, changes: number, seed: number): { sceneB: Scene; mutations: SceneMutation[] } {
  const rng = createRng(seed);
  const objects = scene.objects.map((o) => ({ ...o }));
  const mutations: SceneMutation[] = [];
  const touched = new Set<string>();
  const kinds: SceneMutationKind[] = rng.shuffle(["move", "recolor", "remove", "add", "relabel", "retext", "swap"]);
  let attempts = 0;

  const candidates = () => objects.filter((o) => movable(o) && !touched.has(o.id));
  const zoneOf = (name: string) => scene.zones.find((z) => z.name === name);

  while (mutations.length < changes && attempts++ < 40) {
    const kind = kinds[(attempts - 1) % kinds.length];
    const pool = candidates();
    if (kind === "add") {
      const present = new Set(objects.map((o) => o.type));
      const types = ADDABLE.filter((t) => !present.has(t));
      if (!types.length) continue;
      const type = rng.pick(types);
      const [w, h] = DEFAULT_SIZE[type] ?? [40, 40];
      const zones = rng.shuffle(scene.zones.filter((z) => !isWallZone(z)));
      let placed = false;
      for (const z of zones) {
        const slot = findSlot(rng, z, type, w, h, objects);
        if (!slot) continue;
        const color = rng.pick(COLORS);
        const id = `added-${type}-${mutations.length}`;
        objects.push({ id, type, x: slot.x, y: slot.y, w, h, color, zone: z.name, z: objects.length + 5 });
        touched.add(id);
        mutations.push({ kind: "add", objectId: id, description: `A ${COLOR_LABEL[color]} ${type} appeared ${z.name}`, keywords: [type, `${type} appeared`, `new ${type}`, `${type} added`, `extra ${type}`, `${COLOR_LABEL[color]} ${type}`], after: { type, zone: z.name } });
        placed = true;
        break;
      }
      if (!placed) continue;
      continue;
    }
    if (!pool.length) break;
    const o = rng.pick(pool);
    if (kind === "move") {
      const others = rng.shuffle(scene.zones.filter((z) => z.name !== o.zone && isWallZone(z) === isWallZone(zoneOf(o.zone!) ?? z)));
      let done = false;
      for (const z of others) {
        const slot = findSlot(rng, z, o.type, o.w, o.h, objects.filter((x) => x.id !== o.id));
        if (!slot) continue;
        const before = { x: o.x, y: o.y, zone: o.zone };
        o.x = slot.x;
        o.y = slot.y;
        o.zone = z.name;
        touched.add(o.id);
        mutations.push({ kind: "move", objectId: o.id, description: `The ${o.type} moved from ${before.zone} to ${z.name}`, keywords: [`${o.type} moved`, `moved ${o.type}`, `${o.type} ${z.name}`, `${o.type} is now`, `${o.type} position`, `${o.type} somewhere else`, o.type], before, after: { x: o.x, y: o.y, zone: z.name } });
        done = true;
        break;
      }
      if (!done) continue;
    } else if (kind === "recolor") {
      if (o.type === "person" || o.type === "sign") continue;
      const next = rng.pick(COLORS.filter((c) => c !== o.color && Math.abs(COLORS.indexOf(c) - COLORS.indexOf(o.color)) > 1));
      const before = o.color;
      o.color = next;
      touched.add(o.id);
      mutations.push({ kind: "recolor", objectId: o.id, description: `The ${o.type} changed from ${COLOR_LABEL[before]} to ${COLOR_LABEL[next]}`, keywords: [`${o.type} colour`, `${o.type} color`, `${COLOR_LABEL[next]} ${o.type}`, `${o.type} is now ${COLOR_LABEL[next]}`, `${o.type} changed colour`, `${o.type} changed color`, `${o.type} ${COLOR_LABEL[next]}`], before: { color: before }, after: { color: next } });
    } else if (kind === "remove") {
      const idx = objects.findIndex((x) => x.id === o.id);
      objects.splice(idx, 1);
      touched.add(o.id);
      mutations.push({ kind: "remove", objectId: o.id, description: `The ${COLOR_LABEL[o.color]} ${o.type}${o.label ? ` (${o.label})` : ""} ${o.zone} is gone`, keywords: [`${o.type} gone`, `${o.type} missing`, `${o.type} removed`, `${o.type} disappeared`, `no ${o.type}`, `${o.type} vanished`, `${o.type} is gone`, ...(o.label ? [o.label.toLowerCase()] : [])], before: { type: o.type, zone: o.zone } });
    } else if (kind === "relabel") {
      if (!o.label) continue;
      const list = o.type === "book" || o.type === "bookstack" ? SHORT_TITLES : o.type === "sign" ? CAFE_SIGNS : null;
      if (!list) continue;
      const next = rng.pick(list.filter((t) => t !== o.label));
      const before = o.label;
      o.label = next;
      touched.add(o.id);
      mutations.push({ kind: "relabel", objectId: o.id, description: `The ${o.type} ${o.zone} now reads "${next}" instead of "${before}"`, keywords: [next.toLowerCase(), before.toLowerCase(), `${o.type} title`, `${o.type} label`, `${o.type} text`, `${o.type} says`, `different ${o.type}`], before: { label: before }, after: { label: next } });
    } else if (kind === "retext") {
      if (!o.text || !/\d{1,2}:\d{2}/.test(o.text)) continue;
      const before = o.text;
      o.text = timeShift(o.text, rng);
      touched.add(o.id);
      mutations.push({ kind: "retext", objectId: o.id, description: `The ${o.type}${o.label ? ` for ${o.label}` : ""} now shows ${o.text} instead of ${before}`, keywords: [o.text.match(/\d{1,2}:\d{2}/)?.[0] ?? o.text, `${o.type} time`, `${o.type} changed`, "time changed", "different time", ...(o.label ? [o.label.toLowerCase()] : [])], before: { text: before }, after: { text: o.text } });
    } else if (kind === "swap") {
      const partner = pool.find((x) => x.id !== o.id && x.zone !== o.zone && Math.abs(x.w - o.w) < 40 && Math.abs(x.h - o.h) < 40 && isWallZone(zoneOf(x.zone!)!) === isWallZone(zoneOf(o.zone!)!));
      if (!partner) continue;
      const a = { x: o.x, y: o.y, zone: o.zone };
      o.x = partner.x;
      o.y = partner.y;
      o.zone = partner.zone;
      partner.x = a.x;
      partner.y = a.y;
      partner.zone = a.zone;
      touched.add(o.id);
      touched.add(partner.id);
      mutations.push({ kind: "swap", objectId: o.id, description: `The ${o.type} and the ${partner.type} swapped places`, keywords: [`${o.type} swapped`, `${partner.type} swapped`, `${o.type} and ${partner.type}`, `${o.type} moved`, `${partner.type} moved`, "swapped places", "switched"], before: a, after: { x: o.x, y: o.y, zone: o.zone } });
    }
  }

  const sceneB: Scene = { ...scene, id: `${scene.id}:b${seed}`, objects, facts: [] };
  sceneB.facts = sceneFacts(sceneB);
  return { sceneB, mutations };
}
