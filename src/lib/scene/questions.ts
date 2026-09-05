import type { Rng, Scene, SceneObject, SceneObjectType, SceneQuestion, SceneQuestionKind } from "./types";
import { COLOR_LABEL } from "./engine";
import { adjacentPairs, PASSTHROUGH, SURFACE } from "./layout";

/**
 * Question generation from scene ground truth.
 * Never asks about an attribute that is ambiguous in the render: colour and
 * position questions only target types that appear once; counts sum a type.
 */

const ALL_COLORS = Object.keys(COLOR_LABEL) as (keyof typeof COLOR_LABEL)[];

const PLAUSIBLE_ABSENT: Record<Scene["backdrop"], string[]> = {
  room: ["clock", "umbrella", "radio", "typewriter", "vase", "cat"],
  cafe: ["clock", "umbrella", "newspaper", "laptop", "dog", "painting"],
  lobby: ["umbrella", "painting", "laptop", "cat", "vase", "map"],
  office: ["umbrella", "radio", "painting", "cat", "bottle", "globe"],
  train: ["umbrella", "cat", "laptop", "hat", "bottle", "map"],
  street: ["bicycle", "umbrella", "cat", "flag", "suitcase", "box"],
  board: ["suitcase", "cat", "newspaper", "laptop", "flag", "bag"],
  shelf: ["clock", "globe", "vase", "candle", "radio", "typewriter"],
  restaurant: ["clock", "umbrella", "laptop", "cat", "globe", "vase"],
  study: ["umbrella", "typewriter", "radio", "painting", "bottle", "newspaper"],
};

const ARTICLE = (s: string) => (/^[aeiou]/i.test(s) ? `an ${s}` : `a ${s}`);
const plural = (t: string, n: number) => (n === 1 ? t : t.endsWith("s") ? t : t === "person" ? "people" : `${t}s`);

function describeShort(o: SceneObject): string {
  return o.label ? `${o.type} labelled "${o.label}"` : o.type;
}

function normTime(t: string): string[] {
  const m = t.match(/(\d{1,2}):(\d{2})/);
  if (!m) return [t.toLowerCase()];
  const h = String(Number(m[1]));
  return [`${h}:${m[2]}`, `${m[1]}:${m[2]}`, `${h}.${m[2]}`, `${h} ${m[2]}`];
}

export function generateQuestions(scene: Scene, rng: Rng, count: number): SceneQuestion[] {
  const objs = scene.objects.filter((o) => !!o.zone && !PASSTHROUGH.has(o.type) && !SURFACE.has(o.type));
  const zones = scene.zones.map((z) => z.name);
  const byType = new Map<string, SceneObject[]>();
  for (const o of objs) byType.set(o.type, [...(byType.get(o.type) ?? []), o]);
  const unique = objs.filter((o) => (byType.get(o.type)?.length ?? 0) === 1 && !(o.count && o.count > 1));
  const pool: SceneQuestion[] = [];
  let n = 0;
  const qid = (k: string) => `q-${k}-${n++}`;

  // colour
  for (const o of rng.shuffle(unique).filter((o) => o.type !== "person" && o.type !== "sign" && o.type !== "board")) {
    const correct = COLOR_LABEL[o.color];
    const distractors = rng.sample(ALL_COLORS.map((c) => COLOR_LABEL[c]).filter((c) => c !== correct), 3);
    pool.push({ id: qid("color"), kind: "color", prompt: `What colour was the ${describeShort(o)}?`, format: "mcq", options: rng.shuffle([correct, ...distractors]), answer: correct, subskill: "observation.detail", difficulty: 2 });
  }

  // counts: types with multiple instances or count > 1
  for (const [type, list] of byType) {
    const total = list.reduce((s, o) => s + (o.count ?? 1), 0);
    if (total >= 2 && type !== "sign") {
      pool.push({ id: qid("count"), kind: "count", prompt: `How many ${plural(type, 2)} were visible?`, format: "number", answer: String(total), accept: [String(total)], subskill: "observation.detail", difficulty: 3 });
    }
  }

  // position
  for (const o of rng.shuffle(unique)) {
    if (!o.zone || zones.length < 3) continue;
    const others = rng.sample(zones.filter((z) => z !== o.zone), Math.min(3, zones.length - 1));
    pool.push({ id: qid("pos"), kind: "position", prompt: `Where was the ${describeShort(o)}?`, format: "mcq", options: rng.shuffle([o.zone, ...others]), answer: o.zone, subskill: "observation.spatial", difficulty: 3 });
  }

  // labels and texts
  for (const o of rng.shuffle(objs)) {
    if (o.type === "clock" && o.text) {
      pool.push({ id: qid("time"), kind: "text", prompt: `What time did the clock ${o.zone} show?`, format: "short", answer: o.text, accept: normTime(o.text), subskill: "observation.text", difficulty: 3 });
    } else if (o.type === "sign" && o.label && o.text && /\d{1,2}:\d{2}/.test(o.text)) {
      // departures board row: "Edinburgh" / "14:15 · C15 · Delayed"
      const time = o.text.match(/\d{1,2}:\d{2}/)?.[0] ?? "";
      const status = o.text.split("·").pop()?.trim();
      pool.push({ id: qid("board"), kind: "text", prompt: `What time was the departure to ${o.label}?`, format: "short", answer: time, accept: normTime(time), subskill: "observation.text", difficulty: 3 });
      if (status && /delayed|boarding|cancelled|gate open|last call/i.test(status)) {
        const others = objs.filter((x) => x.type === "sign" && x.label && x.id !== o.id).map((x) => x.label!);
        pool.push({ id: qid("status"), kind: "text", prompt: `Which destination was marked "${status}"?`, format: "mcq", options: rng.shuffle([o.label, ...rng.sample(others, Math.min(3, others.length))]), answer: o.label, subskill: "observation.text", difficulty: 3 });
      }
    } else if ((o.type === "book" || o.type === "bookstack") && o.label) {
      pool.push({ id: qid("title"), kind: "label", prompt: `What was the title of the book ${o.zone}?`, format: "short", answer: o.label, accept: [o.label.toLowerCase(), o.label.toLowerCase().replace(/^the /, "")], subskill: "observation.text", difficulty: 2 });
    } else if (o.type === "sign" && o.label && !o.text) {
      const others = objs.filter((x) => x.type === "sign" && x.label && x.id !== o.id).map((x) => x.label!);
      if (others.length >= 1) pool.push({ id: qid("sign"), kind: "label", prompt: `Which of these signs was ${o.zone}?`, format: "mcq", options: rng.shuffle([o.label, ...rng.sample(others, Math.min(3, others.length))]), answer: o.label, subskill: "observation.text", difficulty: 2 });
      else pool.push({ id: qid("sign"), kind: "label", prompt: `What did the sign ${o.zone} say?`, format: "short", answer: o.label, accept: [o.label.toLowerCase()], subskill: "observation.text", difficulty: 3 });
    } else if (o.type === "ticket" && o.text) {
      pool.push({ id: qid("ticket"), kind: "text", prompt: `What was printed on the ticket ${o.zone}?`, format: "short", answer: o.text, accept: [o.text.toLowerCase(), ...o.text.split("·").map((s) => s.trim().toLowerCase())], subskill: "observation.text", difficulty: 4 });
    } else if (o.type === "newspaper" && o.label) {
      pool.push({ id: qid("paper"), kind: "label", prompt: `Which newspaper was ${o.zone}?`, format: "short", answer: o.label, accept: [o.label.toLowerCase(), o.label.toLowerCase().replace(/^the /, "")], subskill: "observation.text", difficulty: 3 });
    } else if (o.type === "map" && o.label) {
      pool.push({ id: qid("map"), kind: "label", prompt: `Which place was named on the map?`, format: "short", answer: o.label, accept: [o.label.toLowerCase()], subskill: "observation.text", difficulty: 2 });
    } else if (o.type === "awning" && o.label) {
      pool.push({ id: qid("awning"), kind: "label", prompt: `What did the shop's awning say?`, format: "short", answer: o.label, accept: [o.label.toLowerCase()], subskill: "observation.text", difficulty: 2 });
    }
  }

  // absence
  const present = new Set(objs.map((o) => o.type));
  const absentTypes = PLAUSIBLE_ABSENT[scene.backdrop].filter((t) => !present.has(t as SceneObjectType));
  for (const t of rng.sample(absentTypes, 2)) {
    pool.push({ id: qid("absent"), kind: "absence", prompt: `Was there ${ARTICLE(t)} anywhere in the scene?`, format: "mcq", options: ["Yes", "No"], answer: "No", subskill: "observation.precision", difficulty: 4 });
  }
  for (const o of rng.sample(unique, 1)) {
    pool.push({ id: qid("present"), kind: "absence", prompt: `Was there ${ARTICLE(o.type)} anywhere in the scene?`, format: "mcq", options: ["Yes", "No"], answer: "Yes", subskill: "observation.precision", difficulty: 2 });
  }

  // relationship
  for (const p of rng.shuffle(adjacentPairs(scene.objects)).slice(0, 3)) {
    const anchor = (byType.get(p.a.type)?.length ?? 0) === 1 ? p.a : (byType.get(p.b.type)?.length ?? 0) === 1 ? p.b : null;
    if (!anchor) continue;
    const other = anchor === p.a ? p.b : p.a;
    const distract = rng.sample([...present].filter((t) => t !== other.type && t !== anchor.type), 3);
    if (distract.length < 2) continue;
    pool.push({ id: qid("rel"), kind: "relationship", prompt: `What was next to the ${describeShort(anchor)}?`, format: "mcq", options: rng.shuffle([other.type, ...distract]), answer: other.type, subskill: "observation.spatial", difficulty: 4 });
  }

  // anomaly
  const anomalies = objs.filter((o) => o.anomaly);
  if (anomalies.length) {
    const a = rng.pick(anomalies);
    const distract = rng.sample([...present].filter((t) => t !== a.type), 3);
    pool.push({ id: qid("anom"), kind: "anomaly", prompt: "Which object did not belong where it was?", format: "mcq", options: rng.shuffle([a.type, ...distract]), answer: a.type, subskill: "observation.anomaly", difficulty: 3 });
  }

  // Select with variety: round-robin over kinds.
  const order: SceneQuestionKind[] = ["label", "position", "color", "count", "text", "relationship", "anomaly", "absence"];
  const buckets = new Map<SceneQuestionKind, SceneQuestion[]>();
  for (const q of rng.shuffle(pool)) buckets.set(q.kind, [...(buckets.get(q.kind) ?? []), q]);
  const out: SceneQuestion[] = [];
  const seenPrompt = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < 60) {
    let added = false;
    for (const k of order) {
      const b = buckets.get(k);
      if (!b?.length) continue;
      const q = b.shift()!;
      if (seenPrompt.has(q.prompt)) continue;
      seenPrompt.add(q.prompt);
      out.push(q);
      added = true;
      if (out.length >= count) break;
    }
    if (!added) break;
  }
  return out;
}
