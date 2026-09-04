import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { AfterAction, EvidenceSourceKind, ReasoningPathPoint } from "@/lib/domain/types";

export interface AfterActionInput {
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  title: string;
  saw: string[];
  missed: string[];
  assumed: string[];
  didWell: string[];
  turningPoint?: string;
  oneThing: string;
  reasoningPath?: ReasoningPathPoint[];
  score?: number;
  sessionId?: string;
  at?: string;
}

export async function writeAfterAction(db: StudyDatabase, input: AfterActionInput): Promise<AfterAction> {
  const aa = stamp<AfterAction>(db.userId, "aa", { ...input });
  if (input.at) {
    aa.createdAt = input.at;
    aa.updatedAt = input.at;
  }
  await db.store("after_actions").put(aa);
  return aa;
}
