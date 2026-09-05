import type { Scene, SceneObject, SceneTemplate, SceneColor } from "./types";
import { createRng } from "./rng";
import type { ObservationFact } from "@/lib/scoring/observation";
import { TEMPLATES } from "./templates";
import { adjacentPairs } from "./layout";

export const COLOR_HEX: Record<SceneColor, string> = {
  burgundy: "#6b1f2a",
  forest: "#234531",
  navy: "#1f2f4d",
  mustard: "#c9a227",
  cream: "#efe6d2",
  charcoal: "#2b2a27",
  brass: "#9c7c34",
  walnut: "#5a3b26",
  olive: "#6b6b3a",
  slate: "#5d6b78",
  rust: "#a34a2a",
  ivory: "#f6f0e2",
  teal: "#2c6e6b",
  plum: "#4e2a4a",
};

export const COLOR_LABEL: Record<SceneColor, string> = {
  burgundy: "burgundy",
  forest: "dark green",
  navy: "navy",
  mustard: "mustard",
  cream: "cream",
  charcoal: "charcoal",
  brass: "brass",
  walnut: "brown",
  olive: "olive",
  slate: "grey-blue",
  rust: "rust",
  ivory: "ivory",
  teal: "teal",
  plum: "plum",
};

export function listTemplates(): SceneTemplate[] {
  return TEMPLATES;
}

export function buildScene(template: string, seed: number, options?: { density?: "sparse" | "medium" | "dense" }): Scene {
  const t = TEMPLATES.find((x) => x.id === template) ?? TEMPLATES[0];
  const rng = createRng(seed);
  const base = t.generate(rng, options);
  const objects = base.objects.map((o, i) => ({ z: i, ...o }));
  const scene: Scene = { id: `${t.id}:${seed}`, template: t.id, seed, ...base, objects, facts: [] };
  scene.facts = sceneFacts(scene);
  return scene;
}

const ARTICLE = (s: string) => (/^[aeiou]/i.test(s) ? "an " + s : "a " + s);

export function describeObject(o: SceneObject): string {
  const color = COLOR_LABEL[o.color];
  const label = o.label ? ` labelled "${o.label}"` : "";
  const text = o.text ? ` reading "${o.text}"` : "";
  const count = o.count && o.count > 1 ? `${o.count} ${o.type}s` : ARTICLE(`${color} ${o.type}`);
  return `${count}${label}${text}${o.zone ? ` ${o.zone}` : ""}`;
}

/** Derive ground-truth facts for room-scan scoring. */
export function sceneFacts(scene: Scene): ObservationFact[] {
  const facts: ObservationFact[] = [];
  for (const o of scene.objects) {
    if (["table", "counter", "rug", "shelf", "window", "door"].includes(o.type) && !o.label && !o.anomaly) continue;
    const kws = [o.type, `${COLOR_LABEL[o.color]} ${o.type}`, ...(o.label ? [o.label.toLowerCase()] : []), ...(o.text ? [o.text.toLowerCase()] : [])];
    facts.push({
      id: `obj:${o.id}`,
      text: describeObject(o),
      keywords: kws,
      category: o.anomaly ? "anomaly" : o.label || o.text ? "text" : o.type === "person" ? "person" : "object",
      importance: o.anomaly ? 3 : o.label || o.text ? 2 : 1,
    });
    if (o.count && o.count > 1) {
      facts.push({ id: `count:${o.id}`, text: `${o.count} ${o.type}s`, keywords: [`${o.count} ${o.type}`, `${o.count} ${o.type}s`], category: "count", importance: 2 });
    }
    if (o.zone) {
      facts.push({ id: `pos:${o.id}`, text: `The ${o.type} is ${o.zone}`, keywords: [`${o.type} ${o.zone}`], category: "position", importance: 1 });
    }
  }
  for (const p of adjacentPairs(scene.objects).slice(0, 4)) {
    facts.push({ id: `adj:${p.a.id}:${p.b.id}`, text: `The ${p.a.type} is next to the ${p.b.type}`, keywords: [`${p.a.type} next to ${p.b.type}`, `${p.b.type} next to ${p.a.type}`, `${p.a.type} beside ${p.b.type}`, `${p.b.type} beside ${p.a.type}`, `${p.a.type} and ${p.b.type}`], category: "relationship", importance: 1 });
  }
  return facts;
}
