/**
 * Deterministic spring layout for the knowledge graph. No library: a fixed
 * number of iterations of pairwise repulsion, edge attraction and a gentle pull
 * to the centre, seeded from index positions so the same input always yields
 * the same picture.
 */
import type { ArchiveDomain } from "@/lib/domain/types";

export interface LayoutNode {
  id: string;
  domain: ArchiveDomain;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export interface PositionedNode extends LayoutNode {
  x: number;
  y: number;
  degree: number;
  /** Number of distinct domains among neighbours (including none) */
  neighbourDomains: number;
}

export interface GraphMetrics {
  isolated: Set<string>;
  foundational: Set<string>;
  bridges: Set<string>;
}

export function springLayout(nodes: LayoutNode[], edges: LayoutEdge[], width: number, height: number, iterations = 150): PositionedNode[] {
  const n = nodes.length;
  if (!n) return [];
  const index = new Map<string, number>();
  nodes.forEach((nd, i) => index.set(nd.id, i));
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  const cx = width / 2;
  const cy = height / 2;
  const r0 = Math.min(width, height) * 0.38;
  // Seed on a circle, ordered by domain so clusters start near each other.
  const byDomain = [...nodes.keys()].sort((a, b) => nodes[a].domain.localeCompare(nodes[b].domain) || a - b);
  byDomain.forEach((i, k) => {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    const jitter = ((i * 7919) % 13) / 13 - 0.5;
    xs[i] = cx + Math.cos(a) * r0 * (0.85 + jitter * 0.2);
    ys[i] = cy + Math.sin(a) * r0 * (0.85 + jitter * 0.2);
  });
  const pairs: [number, number][] = [];
  const degree = new Int32Array(n);
  for (const e of edges) {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a === undefined || b === undefined || a === b) continue;
    pairs.push([a, b]);
    degree[a]++;
    degree[b]++;
  }
  const area = width * height;
  const k = Math.sqrt(area / n) * 0.9;
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  for (let it = 0; it < iterations; it++) {
    const temp = (1 - it / iterations) * Math.min(width, height) * 0.08 + 0.5;
    fx.fill(0);
    fy.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = xs[i] - xs[j];
        let dy = ys[i] - ys[j];
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = ((i * 31 + j * 17) % 7) - 3 || 1;
          dy = ((i * 13 + j * 29) % 5) - 2 || 1;
          d2 = dx * dx + dy * dy;
        }
        const d = Math.sqrt(d2);
        const rep = (k * k) / d;
        const ux = dx / d;
        const uy = dy / d;
        fx[i] += ux * rep;
        fy[i] += uy * rep;
        fx[j] -= ux * rep;
        fy[j] -= uy * rep;
      }
    }
    for (const [a, b] of pairs) {
      const dx = xs[a] - xs[b];
      const dy = ys[a] - ys[b];
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const att = (d * d) / k;
      const ux = dx / d;
      const uy = dy / d;
      fx[a] -= ux * att;
      fy[a] -= uy * att;
      fx[b] += ux * att;
      fy[b] += uy * att;
    }
    for (let i = 0; i < n; i++) {
      // gravity toward the centre, stronger for well-connected nodes
      fx[i] += (cx - xs[i]) * 0.02 * (1 + degree[i] * 0.1);
      fy[i] += (cy - ys[i]) * 0.02 * (1 + degree[i] * 0.1);
      const mag = Math.sqrt(fx[i] * fx[i] + fy[i] * fy[i]) || 1;
      const step = Math.min(mag, temp);
      xs[i] += (fx[i] / mag) * step;
      ys[i] += (fy[i] / mag) * step;
      const pad = 28;
      xs[i] = Math.max(pad, Math.min(width - pad, xs[i]));
      ys[i] = Math.max(pad, Math.min(height - pad, ys[i]));
    }
  }
  const neighbourDomains = nodes.map((_, i) => {
    const s = new Set<ArchiveDomain>();
    for (const [a, b] of pairs) {
      if (a === i) s.add(nodes[b].domain);
      else if (b === i) s.add(nodes[a].domain);
    }
    return s.size;
  });
  return nodes.map((nd, i) => ({ ...nd, x: xs[i], y: ys[i], degree: degree[i], neighbourDomains: neighbourDomains[i] }));
}

export function graphMetrics(nodes: PositionedNode[]): GraphMetrics {
  const isolated = new Set<string>();
  const foundational = new Set<string>();
  const bridges = new Set<string>();
  const sorted = [...nodes].sort((a, b) => b.degree - a.degree);
  const topCount = Math.max(1, Math.ceil(nodes.length * 0.1));
  const threshold = sorted[topCount - 1]?.degree ?? 0;
  for (const nd of nodes) {
    if (nd.degree <= 1) isolated.add(nd.id);
    if (nd.degree >= threshold && nd.degree > 1) foundational.add(nd.id);
    if (nd.neighbourDomains >= 3) bridges.add(nd.id);
  }
  return { isolated, foundational, bridges };
}

/** Domain → CSS colour, all derived from theme tokens so dark mode follows. */
export function domainColor(domain: ArchiveDomain): string {
  switch (domain) {
    case "history":
      return "var(--wine)";
    case "geography":
      return "var(--forest)";
    case "economics":
      return "var(--brass)";
    case "business":
      return "color-mix(in oklab, var(--brass) 55%, var(--ink))";
    case "law":
    case "politics":
      return "var(--ink-3)";
    case "science":
    case "philosophy":
    case "psychology":
      return "color-mix(in oklab, var(--forest) 55%, var(--ink-3))";
    case "art":
    case "literature":
    case "music":
    case "food":
      return "color-mix(in oklab, var(--wine) 55%, var(--brass))";
    case "technology":
      return "var(--ink-2)";
  }
}

export const DOMAIN_GROUPS: { label: string; domains: ArchiveDomain[] }[] = [
  { label: "History", domains: ["history"] },
  { label: "Geography", domains: ["geography"] },
  { label: "Economics", domains: ["economics"] },
  { label: "Business", domains: ["business"] },
  { label: "Law & politics", domains: ["law", "politics"] },
  { label: "Science & mind", domains: ["science", "philosophy", "psychology"] },
  { label: "Arts & table", domains: ["art", "literature", "music", "food"] },
  { label: "Technology", domains: ["technology"] },
];
