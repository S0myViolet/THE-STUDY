/**
 * Logic — the domain record. Concepts live in ./logic-a.ts, lessons in ./logic-b.ts;
 * this file assembles them with the course and module summaries.
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 */
import { scaffoldDomain } from "./_helpers";
import { LOGIC_CONCEPTS } from "./logic-a";
import { LOGIC_LESSONS } from "./logic-b";

export const LOGIC = scaffoldDomain("logic", {
  concepts: LOGIC_CONCEPTS,
  lessons: LOGIC_LESSONS,
  courseSummaries: {
    "logic-core":
      "How to find an argument in prose, test whether its reasons could be true while its claim is false, read conditions and conditionals in the right direction, check a set of claims for consistency, and criticise a position at its strongest rather than its weakest.",
  },
  moduleSummaries: {
    "lg-arguments":
      "Premises and conclusions; validity against soundness; deduction against induction; necessary against sufficient; consistency and contradiction. The vocabulary every later domain assumes.",
    "lg-formal":
      "Enough symbolic logic to check an argument mechanically: the five connectives and their truth tables, the contrapositive and its two impostors, and the quantifiers with their negations and order.",
    "lg-fallacies":
      "The two conditional fallacies and the common informal ones; reconstruction in standard form so that a defect is shown on a numbered line; and steelmanning, the discipline that makes criticism count.",
  },
});
