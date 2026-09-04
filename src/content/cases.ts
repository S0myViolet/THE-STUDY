import type { CaseDefinition } from "@/lib/domain/types";
import { CASES_A } from "./cases-a";
import { CASES_B } from "./cases-b";
export const CASES: CaseDefinition[] = [...CASES_A, ...CASES_B];
