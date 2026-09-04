import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { Milestone, Notification, NotificationKind } from "@/lib/domain/types";

export async function notify(db: StudyDatabase, input: { kind: NotificationKind; title: string; body: string; href?: string; dedupeKey?: string }): Promise<Notification | null> {
  const store = db.store("notifications");
  if (input.dedupeKey) {
    const existing = await store.list({ filter: (n) => n.title === input.title && !n.read });
    if (existing.length) return null;
  }
  const n = stamp<Notification>(db.userId, "ntf", { kind: input.kind, title: input.title, body: input.body, href: input.href, read: false });
  await store.put(n);
  return n;
}

export const MILESTONES: { key: string; title: string; description: string }[] = [
  { key: "first_case", title: "First case closed", description: "The first full case, start to debrief." },
  { key: "cases_10", title: "Ten cases", description: "Ten cases carried through to After Action." },
  { key: "predictions_25", title: "Twenty-five calibrated predictions", description: "Enough resolved forecasts for calibration to mean something." },
  { key: "predictions_100", title: "Hundredth calibrated prediction", description: "A hundred forecasts that met reality." },
  { key: "advanced_observation", title: "First Advanced observation", description: "An observation subskill reached Advanced." },
  { key: "retained_90", title: "Ten concepts kept for ninety days", description: "Ten Archive items retained across a ninety-day interval." },
  { key: "false_obs_halved", title: "Invented details halved", description: "False-observation rate fell to half its first-month level." },
  { key: "thread_resolved", title: "A thread resolved", description: "A recurring pattern corrected until it stopped recurring." },
  { key: "strategy_complete", title: "First full strategy simulation", description: "A strategic story carried to its end." },
  { key: "first_forecast", title: "First forecast", description: "The first prediction with a resolution date." },
  { key: "first_decision_reviewed", title: "First decision reviewed", description: "Decision quality and outcome quality separated for the first time." },
];

export async function reachMilestone(db: StudyDatabase, key: string): Promise<Milestone | null> {
  const meta = MILESTONES.find((m) => m.key === key);
  if (!meta) return null;
  const store = db.store("milestones");
  const existing = await store.list({ where: { key } as Partial<Milestone> });
  if (existing.length) return existing[0];
  const m = stamp<Milestone>(db.userId, "ms", { key, title: meta.title, description: meta.description, reachedAt: new Date().toISOString() });
  await store.put(m);
  await notify(db, { kind: "milestone", title: meta.title, body: meta.description, href: "/profile" });
  return m;
}
