import type { StudyDatabase } from "@/lib/persistence/store";
import { recordError } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";

/** QA-only: seeds error events across sessions so a thread can form. Triggered by /red-thread?qa-seed=1. Never shown in the UI. */
let started = false;
export async function qaSeedThreads(db: StudyDatabase): Promise<void> {
  if (started) return;
  started = true;
  const seeded = await db.store("error_events").list({ filter: (e) => e.source.refId === "qa-case-0" });
  if (seeded.length) return;
  const days = [26, 22, 19, 14, 11, 8, 5, 3, 1];
  const sessions = ["qa-s1", "qa-s1", "qa-s2", "qa-s2", "qa-s3", "qa-s3", "qa-s4", "qa-s4", "qa-s5"];
  for (let i = 0; i < days.length; i++) {
    const at = new Date(Date.now() - days[i] * 86400000).toISOString();
    await recordError(db, { type: i % 3 === 2 ? "ALTERNATIVE_NEGLECT" : "PREMATURE_CLOSURE", subskill: "inference.alternatives", source: { kind: "case", refId: `qa-case-${i}`, label: `Case 010${(i % 5) + 1}` }, detail: ["Confidence 80% with a single explanation.", "Only one plausible explanation offered.", "Settled on the obvious story."][i % 3], sessionId: sessions[i], at });
  }
  for (const d of [12, 4]) await recordError(db, { type: "FALSE_OBSERVATION", subskill: "observation.precision", source: { kind: "observation", refId: "qa-obs", label: "The Glance" }, detail: "Reported a clock that was not there.", sessionId: "qa-s6", at: new Date(Date.now() - d * 86400000).toISOString() });
  await writeAfterAction(db, { source: { kind: "case", refId: "qa-case-1", label: "Case 0101" }, title: "Case 0101 · The Wall at 412", saw: ["Ms Halvorsen's key card face down", "Priya's second, more careful sentence"], missed: ["The 02:10 log entry"], assumed: ["That the log was complete"], didWell: ["Separated observation from inference"], turningPoint: "The log's missing line", oneThing: "Before you commit, write two explanations you would be embarrassed to have missed.", reasoningPath: [{ kind: "evidence", label: "Noticed 5 of 7 details" }, { kind: "hypothesis", label: "Primary: room 414", value: 0.7 }, { kind: "evidence", label: "The log's missing line" }, { kind: "confidence", label: "Confidence 70% → 40%", value: 0.4 }], score: 0.66, at: new Date(Date.now() - 3 * 86400000).toISOString() });
}
