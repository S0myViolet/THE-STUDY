/**
 * Mathematics — the domain content. Concepts live in ./mathematics-a.ts, lessons in ./mathematics-b.ts;
 * this file assembles them with course and module summaries. Ids follow src/content/v2/skeleton.ts.
 * British spelling throughout.
 */
import { scaffoldDomain } from "./_helpers";
import { MATHEMATICS_CONCEPTS } from "./mathematics-a";
import { MATHEMATICS_LESSONS } from "./mathematics-b";

export const MATHEMATICS = scaffoldDomain("mathematics", {
  concepts: MATHEMATICS_CONCEPTS,
  lessons: MATHEMATICS_LESSONS,
  courseSummaries: {
    "quantitative-foundations":
      "Arithmetic, algebra, functions and geometry at the level an intelligent adult needs to read a budget, a chart, a model or a scientific claim without being misled: estimation before calculation, percentages with their bases, growth that compounds, and scale that squares and cubes.",
    "further-mathematics":
      "The three languages behind modern quantitative work: calculus for rates and accumulation, linear algebra for systems and transformations, and discrete mathematics for counting, proof and networks, taught for intuition and use rather than technique.",
  },
  moduleSummaries: {
    "qf-arithmetic": "Estimation, percentages and their bases, powers of ten and the algebra of units: the habits that make a number checkable.",
    "qf-algebra": "Rewriting expressions without changing their value, solving linear equations and inequalities, and the exponents, logarithms and quadratics that describe growth and turning points.",
    "qf-functions": "Reading a rule from its graph, telling linear from exponential growth, and keeping levels apart from rates.",
    "qf-geometry": "Lengths, areas and volumes scale by k, k² and k³; the consequences run from maps to metabolism.",
    "fm-calculus": "The derivative as instantaneous rate, the integral as accumulated quantity, and optimisation as 'rate equals zero'.",
    "fm-linear": "Vectors and matrices as organised weighted sums, and matrices as transformations of space.",
    "fm-discrete": "Counting without listing, proof that covers every case, and graphs as nodes and edges.",
  },
});
