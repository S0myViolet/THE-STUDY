import type { PracticeItem } from "@/lib/v2/content-types";
import { ITEMS_PROBABILITY_A } from "./probability-a";
import { ITEMS_PROBABILITY_B } from "./probability-b";

/**
 * Practice items for probability. Ids: it-probability-<nn>.
 *
 * Part A (01–23): sample spaces, rules, combinatorics, conditional probability,
 * independence, Bayes and base rates. Part B (24–46): random variables, expected value,
 * variance, distributions, the law of large numbers, Monte Carlo, and the exam-only items
 * (42–44), which never appear in Train.
 */
export const ITEMS_PROBABILITY: PracticeItem[] = [...ITEMS_PROBABILITY_A, ...ITEMS_PROBABILITY_B];
