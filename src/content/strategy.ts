import type { StrategyScenario } from "@/lib/domain/types";
import { STRATEGY_A } from "./strategy-a";
import { STRATEGY_B } from "./strategy-b";
export const STRATEGY_SCENARIOS: StrategyScenario[] = [...STRATEGY_A, ...STRATEGY_B];
