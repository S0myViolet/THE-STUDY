import type { StudyDatabase } from "@/lib/persistence/store";
import { calibrationBuckets } from "@/lib/scoring/calibration";
import { SUBSKILLS, type SubskillId, subskillLabel } from "@/lib/domain/faculties";

export interface Insight {
  id: string;
  text: string;
  /** Where to look */
  href?: string;
  /** evidence count behind it */
  n: number;
}

/**
 * "Recent discoveries" for the Desk. Every sentence is computed from real data,
 * with sample sizes attached. Nothing is shown below a minimum n.
 */
export async function computeInsights(db: StudyDatabase): Promise<Insight[]> {
  const [estimates, confidences, observations, reviews, items, salons, evidence] = await Promise.all([
    db.store("skill_estimates").list(),
    db.store("confidence_entries").list(),
    db.store("observation_attempts").list(),
    db.store("memory_reviews").list(),
    db.store("memory_items").list(),
    db.store("salon_sessions").list({ where: { status: "completed" } }),
    db.store("skill_evidence").list(),
  ]);
  const out: Insight[] = [];
  const est = (s: SubskillId) => estimates.find((e) => e.subskill === s);

  // Calibration at 80%+
  const buckets = calibrationBuckets(confidences).filter((b) => b.sufficient && b.lo >= 0.8);
  if (buckets.length) {
    const n = buckets.reduce((s, b) => s + b.n, 0);
    const acc = buckets.reduce((s, b) => s + b.accuracy * b.n, 0) / n;
    const conf = buckets.reduce((s, b) => s + b.meanConfidence * b.n, 0) / n;
    const gap = conf - acc;
    if (Math.abs(gap) > 0.06) {
      out.push({ id: "cal-hi", text: `Your ${Math.round(conf * 100)}% confidence answers are currently correct ${Math.round(acc * 100)}% of the time (n = ${n}).`, href: "/v1/profile/evidence", n });
    } else {
      out.push({ id: "cal-ok", text: `At ${Math.round(conf * 100)}% confidence you are right ${Math.round(acc * 100)}% of the time. That is well calibrated (n = ${n}).`, href: "/v1/profile/evidence", n });
    }
  }

  // Observation: coverage vs precision
  const obs = observations.filter((o) => o.coverage !== undefined && o.precision !== undefined);
  if (obs.length >= 5) {
    const cov = obs.reduce((s, o) => s + (o.coverage ?? 0), 0) / obs.length;
    const prec = obs.reduce((s, o) => s + (o.precision ?? 0), 0) / obs.length;
    if (prec - cov > 0.15) out.push({ id: "obs-prec", text: `You invent very little (precision ${Math.round(prec * 100)}%) but notice less than is there (coverage ${Math.round(cov * 100)}%). Look longer before you look away.`, href: "/v1/observation", n: obs.length });
    else if (cov - prec > 0.15) out.push({ id: "obs-cov", text: `You notice a great deal (coverage ${Math.round(cov * 100)}%) but some of it was never there (precision ${Math.round(prec * 100)}%). Hedge what you are not sure of.`, href: "/v1/observation", n: obs.length });
  }

  // Spatial vs chronology, detail vs anomaly comparisons
  const pairs: [SubskillId, SubskillId, string][] = [
    ["observation.spatial", "observation.chronology", "You are better at where things were than at the order in which they happened."],
    ["observation.chronology", "observation.spatial", "You keep the order of events better than you keep their positions."],
    ["inference.hypothesis", "inference.alternatives", "You are considerably better at producing one plausible hypothesis than at producing alternatives."],
    ["memory.recall", "memory.retention", "You retrieve well immediately; retention across long intervals is where items are lost."],
    ["social.question_quality", "social.rapport", "Your questions are strong; rapport lags them."],
    ["strategy.incentives", "strategy.second_order", "You read incentives well and then stop at the first consequence."],
    ["rhetoric.clarity", "rhetoric.concision", "You are clear before you are brief."],
    ["observation.detail", "observation.anomaly", "You collect details reliably but the one that does not belong slips past."],
  ];
  for (const [a, b, text] of pairs) {
    const ea = est(a);
    const eb = est(b);
    if (ea && eb && ea.evidenceCount >= 5 && eb.evidenceCount >= 5 && ea.value - eb.value >= 0.15) {
      out.push({ id: `pair-${a}-${b}`, text: `${text} (${subskillLabel(a)} ${Math.round(ea.value * 100)} vs ${subskillLabel(b)} ${Math.round(eb.value * 100)}.)`, href: "/v1/profile", n: ea.evidenceCount + eb.evidenceCount });
    }
  }

  // Memory: stories vs facts
  const byKind = new Map<string, { n: number; ok: number }>();
  for (const r of reviews) {
    const it = items.find((m) => m.id === r.itemId);
    if (!it) continue;
    const k = it.kind;
    const cur = byKind.get(k) ?? { n: 0, ok: 0 };
    cur.n++;
    if (r.correct) cur.ok++;
    byKind.set(k, cur);
  }
  const story = byKind.get("story");
  const fact = byKind.get("fact");
  if (story && fact && story.n >= 6 && fact.n >= 6) {
    const s = story.ok / story.n;
    const f = fact.ok / fact.n;
    if (s - f > 0.15) out.push({ id: "mem-story", text: `You remember stories better than isolated facts (${Math.round(s * 100)}% vs ${Math.round(f * 100)}%). Give facts a narrative.`, href: "/v1/memory", n: story.n + fact.n });
    else if (f - s > 0.15) out.push({ id: "mem-fact", text: `Isolated facts stick better than sequences and stories for you (${Math.round(f * 100)}% vs ${Math.round(s * 100)}%).`, href: "/v1/memory", n: story.n + fact.n });
  }

  // Speed and accuracy
  const timed = evidence.filter((e) => e.latencyMs !== undefined && e.correct !== undefined);
  if (timed.length >= 12) {
    const fast = timed.filter((e) => (e.latencyMs ?? 0) < 15000);
    const slow = timed.filter((e) => (e.latencyMs ?? 0) >= 15000);
    if (fast.length >= 6 && slow.length >= 6) {
      const fa = fast.filter((e) => e.correct).length / fast.length;
      const sa = slow.filter((e) => e.correct).length / slow.length;
      if (sa - fa > 0.15) out.push({ id: "speed", text: `You become less accurate when responding in under 15 seconds (${Math.round(fa * 100)}% vs ${Math.round(sa * 100)}%). The pause is worth it.`, href: "/v1/profile/evidence", n: timed.length });
      else if (fa - sa > 0.15) out.push({ id: "speed-ok", text: `Your fast answers are as good as your slow ones (${Math.round(fa * 100)}% vs ${Math.round(sa * 100)}%). Your intuition is earning its keep here.`, href: "/v1/profile/evidence", n: timed.length });
    }
  }

  // Salon
  if (salons.length >= 3) {
    const reviewsS = salons.map((s) => s.review).filter(Boolean) as NonNullable<(typeof salons)[number]["review"]>[];
    const asked = reviewsS.reduce((s, r) => s + r.questionsAsked, 0);
    const forcing = reviewsS.reduce((s, r) => s + r.questionsForcingNewInfo, 0);
    if (asked >= 10 && forcing / asked < 0.4) out.push({ id: "salon-q", text: `Across ${salons.length} conversations, only ${forcing} of ${asked} questions forced new information. Ask fewer, better questions.`, href: "/v1/salon", n: asked });
  }

  // Social confidence inflation
  const social = confidences.filter((c) => c.domain === "social");
  const other = confidences.filter((c) => c.domain !== "social");
  if (social.length >= 8 && other.length >= 8) {
    const sc = social.reduce((s, c) => s + c.confidence, 0) / social.length;
    const sa = social.filter((c) => c.correct).length / social.length;
    const oc = other.reduce((s, c) => s + c.confidence, 0) / other.length;
    const oa = other.filter((c) => c.correct).length / other.length;
    if (sc - sa > 0.1 && sc - sa > oc - oa + 0.08) out.push({ id: "social-conf", text: `When a scenario includes social information your confidence rises (${Math.round(sc * 100)}%) but your accuracy does not (${Math.round(sa * 100)}%).`, href: "/v1/salon", n: social.length });
  }

  // Sort: biggest evidence first, cap 4
  return out.sort((a, b) => b.n - a.n).slice(0, 4);
}

export function labelFor(s: SubskillId): string {
  return SUBSKILLS[s]?.label ?? s;
}
