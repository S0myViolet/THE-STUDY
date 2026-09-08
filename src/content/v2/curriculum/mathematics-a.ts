/**
 * Mathematics — concepts (part A of the mathematics domain).
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Mathematics sits upstream of almost everything else in the curriculum, so its `dependsOn`
 * edges stay inside the domain; the cross-domain connections are recorded as `related`.
 */
import type { Concept } from "@/lib/v2/content-types";

type Draft = Omit<Concept, "domainId" | "courseId" | "moduleId">;

const QF = "quantitative-foundations";
const FM = "further-mathematics";

function concept(courseId: string, moduleId: string, draft: Draft): Concept {
  return { domainId: "mathematics", courseId, moduleId, ...draft };
}

/* ------------------------------------------------------------------ */
/* Quantitative foundations                                             */
/* ------------------------------------------------------------------ */

const arithmetic: Concept[] = [
  concept(QF, "qf-arithmetic", {
    id: "number-sense",
    title: "Number sense and estimation",
    summary:
      "The habit of knowing roughly what a number should be before computing it exactly, so that a wrong answer looks wrong. It rests on rounding, mental arithmetic tricks and a stock of reference quantities.",
    keyPoints: [
      "Round first, compute, then correct: 42 × 38 is (40 + 2)(40 − 2) = 1600 − 4.",
      "Every calculation deserves a sanity check against a reference quantity you already know.",
      "Two significant figures are enough for almost every decision; precision beyond the inputs is fiction.",
      "Multiplying by a number less than 1 makes things smaller; dividing by it makes them larger.",
      "A result that is off by a factor of ten is a decimal-place error, not a small mistake.",
    ],
    dependsOn: [],
    related: ["orders-of-magnitude", "descriptive-statistics"],
    recallPrompts: [
      { prompt: "Rewrite 42 × 38 as a difference of squares and give the product.", answer: "(40 + 2)(40 − 2) = 1600 − 4 = 1596", accept: ["1596"] },
      { prompt: "Why is the sanity check done before the exact calculation rather than after?", answer: "Because an expectation formed first cannot be bent to fit the answer; it catches slips of a factor of ten that look plausible once written down." },
      { prompt: "Roughly how much electricity does a European household use in a year?", answer: "A few thousand kilowatt-hours (around 3,000–4,000 kWh); about ten thousand in the United States.", accept: ["3000", "a few thousand kwh", "3,000-4,000 kwh"] },
    ],
    applications: ["Checking a spreadsheet total against a rough mental estimate", "Reading a news figure and asking whether it is per person, per household or per year", "Catching a misplaced decimal in a quotation"],
    misconception: "That estimation is a weaker substitute for calculation. It is the check that makes calculation trustworthy; experts estimate first and calculate second.",
    difficulty: 1,
    foundational: true,
    tags: ["arithmetic", "estimation"],
  }),
  concept(QF, "qf-arithmetic", {
    id: "fractions-ratios-percentages",
    title: "Fractions, ratios and percentages",
    summary:
      "Three notations for the same idea: a part compared with a whole or with another part. Every percentage is a fraction of some base, and most percentage mistakes come from losing track of which base.",
    keyPoints: [
      "A percentage is a fraction with denominator 100; 35 % of x is 0.35 × x, never 35 × x.",
      "Always ask 'of what?': the base of a percentage change is the starting value.",
      "Successive percentage changes multiply; +40 % then −30 % is × 1.4 × 0.7 = × 0.98, a 2 % fall.",
      "Percentage points measure the difference between two percentages; percent measures the relative change.",
      "To undo a percentage change, divide by the multiplier (÷ 0.85), do not add the percentage back.",
      "A ratio a : b : c splits a total into a + b + c equal parts.",
    ],
    dependsOn: ["number-sense"],
    related: ["inflation", "real-vs-nominal", "probability-rules", "elasticity"],
    recallPrompts: [
      { prompt: "A price rises 40 % and then falls 30 %. What is the net change?", answer: "A 2 % fall: 1.4 × 0.7 = 0.98.", accept: ["-2%", "2% fall", "down 2%", "0.98"] },
      { prompt: "Unemployment rises from 4 % to 5 %. Express the rise in percentage points and in percent.", answer: "One percentage point; a 25 % increase in the rate.", accept: ["1 point and 25%", "1 percentage point, 25 percent"] },
      { prompt: "An item costs £51 after a 15 % discount. What was the original price, and why not £58.65?", answer: "£60, because 51 ÷ 0.85 = 60; adding 15 % of 51 uses the wrong base.", accept: ["60", "£60"] },
    ],
    applications: ["Interest, discounts and tax", "Reading a poll: a move from 30 % to 33 % is three points and a 10 % rise", "Scaling a recipe or a budget by ratio"],
    misconception: "That percentages add. They multiply, because each change acts on a different base; a 50 % fall needs a 100 % rise to undo it.",
    difficulty: 1,
    foundational: true,
    tags: ["arithmetic", "percentages"],
  }),
  concept(QF, "qf-arithmetic", {
    id: "orders-of-magnitude",
    title: "Orders of magnitude",
    summary:
      "Thinking in powers of ten: knowing whether a quantity is in the thousands or the millions matters more than its third digit. Scientific notation and logarithmic scales make very large and very small numbers comparable.",
    keyPoints: [
      "An order of magnitude is a factor of ten; 3 × 10^7 and 5 × 10^7 are the same order, 3 × 10^5 is two orders smaller.",
      "In scientific notation a × 10^n, keep a between 1 and 10 and let n carry the size.",
      "Fermi estimation breaks an unknown into factors you can guess to within a factor of two or three each.",
      "Logarithmic scales (decibels, earthquake magnitude, pH) turn multiplication into addition: two magnitude units is 100 times the amplitude.",
      "Reference points worth owning: 3 × 10^7 seconds in a year, 8 × 10^9 people, 1.5 × 10^8 km to the Sun.",
    ],
    dependsOn: ["number-sense"],
    related: ["exponents-and-logarithms", "astronomy-scale-of-universe", "gdp-and-growth"],
    recallPrompts: [
      { prompt: "About how many seconds are in a year, in scientific notation?", answer: "About 3.2 × 10^7 (60 × 60 × 24 × 365).", accept: ["3e7", "3 x 10^7", "3.15e7", "31 million", "31.5 million"] },
      { prompt: "An earthquake of magnitude 7 compared with magnitude 5: how many times larger is the ground-motion amplitude?", answer: "100 times (10 per unit of magnitude); the energy released is about 1,000 times larger.", accept: ["100", "100 times"] },
      { prompt: "What is a Fermi estimate?", answer: "An estimate built by multiplying rough guesses for each factor of a quantity, aiming to be right to within an order of magnitude." },
    ],
    applications: ["Judging whether a budget line in millions could possibly be billions", "Reading pH, decibel and earthquake scales", "Estimating how many piano tuners, deliveries or cells before looking it up"],
    misconception: "That a logarithmic scale is a linear one with odd labels. Each step is a multiplication, so a two-step gap is not twice as large but a hundred times as large.",
    difficulty: 2,
    foundational: true,
    tags: ["estimation", "scientific-notation"],
  }),
  concept(QF, "qf-arithmetic", {
    id: "units-and-dimensional-analysis",
    title: "Units and dimensional analysis",
    summary:
      "Quantities carry units, and the units obey the same algebra as the numbers. Tracking them catches inverted ratios, missing conversion factors and formulae that could not possibly be right.",
    keyPoints: [
      "Multiply by conversion factors that equal one (1,000 L / 1 m³) and cancel units like algebraic symbols.",
      "A ratio such as 6.5 L per 100 km can be used either way up; the units tell you which way you need.",
      "Both sides of a valid equation must have the same dimensions; √(L/g) has units of seconds, L/g has seconds squared.",
      "Rates are quantities per unit time; forgetting to convert minutes to hours changes the answer by a factor of 60.",
      "Write the unit on every intermediate result, not just the final one.",
    ],
    dependsOn: ["number-sense", "fractions-ratios-percentages"],
    related: ["physics-forces-and-energy", "geometry-and-scale", "rates-of-change"],
    recallPrompts: [
      { prompt: "A car uses 6.5 litres per 100 km and has 32 litres in the tank. How far can it go?", answer: "About 490 km: 32 L ÷ (6.5 L / 100 km) = 492 km.", accept: ["492", "490", "about 490 km"] },
      { prompt: "Why must the two sides of a physical equation have the same units?", answer: "Because an equation asserts that two quantities are the same thing; a time cannot equal a length. Mismatched units prove the formula wrong before any numbers are used." },
      { prompt: "How many litres are in a cubic metre?", answer: "1,000 litres.", accept: ["1000", "1,000"] },
    ],
    applications: ["Converting fuel, energy and currency figures", "Checking a formula from memory by its units", "Reading a specification sheet without being fooled by per-hour versus per-day"],
    misconception: "That units are decoration to be added at the end. They are part of the arithmetic, and carrying them through is the fastest way to catch an inverted ratio.",
    difficulty: 2,
    foundational: true,
    tags: ["units", "conversion"],
  }),
];

const algebra: Concept[] = [
  concept(QF, "qf-algebra", {
    id: "algebraic-manipulation",
    title: "Algebraic manipulation",
    summary:
      "Rewriting expressions without changing their value: expanding, factorising, collecting terms and rearranging formulae. The rules are few; the discipline is applying the same operation to both sides and keeping signs honest.",
    keyPoints: [
      "Order of operations: brackets, then powers, then multiplication and division, then addition and subtraction; (1 − 4)² is +9.",
      "The distributive law a(b + c) = ab + ac is the engine of expanding and, read backwards, of factorising.",
      "Whatever is done to one side of an equation must be done to the whole of the other side.",
      "Factorise before cancelling: (x² − 9)/(x − 3) = x + 3 because x² − 9 = (x − 3)(x + 3); you cannot cancel the x alone.",
      "A negative sign in front of a bracket changes every sign inside it.",
      "To make a variable the subject, undo the operations around it in reverse order.",
    ],
    dependsOn: ["fractions-ratios-percentages"],
    related: ["linear-equations", "proof-and-induction"],
    recallPrompts: [
      { prompt: "Simplify (x² − 9)/(x − 3) for x ≠ 3, and say why you may not cancel the x terms directly.", answer: "x + 3; cancellation works on factors, not on terms, so you factorise x² − 9 as (x − 3)(x + 3) first.", accept: ["x + 3", "x+3"] },
      { prompt: "Evaluate 8 − 2 × (1 − 4)² ÷ 3.", answer: "2: (1 − 4)² = 9, 2 × 9 ÷ 3 = 6, 8 − 6 = 2.", accept: ["2"] },
      { prompt: "Name the law behind a(b + c) = ab + ac.", answer: "The distributive law.", accept: ["distributive", "distributivity", "distributive law", "distributive property"] },
    ],
    applications: ["Rearranging a finance or physics formula to solve for the unknown you actually want", "Simplifying a spreadsheet formula so that it can be checked", "Reading a model in an economics paper"],
    misconception: "That (a + b)² = a² + b². Expanding gives a² + 2ab + b²; the cross term is exactly what students drop, and it is why percentages of percentages surprise people.",
    difficulty: 2,
    foundational: true,
    tags: ["algebra"],
  }),
  concept(QF, "qf-algebra", {
    id: "linear-equations",
    title: "Linear equations and systems",
    summary:
      "An equation whose unknowns appear only to the first power describes a straight-line relationship. Solving one, or a system of several, means finding where those lines meet; break-even problems, mixtures and tariffs are all linear systems in disguise.",
    keyPoints: [
      "Collect the unknowns on one side and the constants on the other; the solution is constant ÷ coefficient.",
      "Two unknowns need two independent equations; substitution eliminates one unknown at a time.",
      "A break-even question ('when do plans A and B cost the same?') is one linear equation in the usage.",
      "Check the solution by substituting it back into every original equation, not only the one you last used.",
      "Parallel lines (same slope, different intercept) give no solution; identical lines give infinitely many.",
    ],
    dependsOn: ["algebraic-manipulation"],
    related: ["functions-and-graphs", "vectors-and-matrices", "supply-and-demand"],
    recallPrompts: [
      { prompt: "Plan A: £12 a month plus 5p a minute. Plan B: £20 plus 2p a minute. At what usage do they cost the same?", answer: "About 267 minutes: 12 + 0.05m = 20 + 0.02m gives 0.03m = 8.", accept: ["267", "266.7", "266.67"] },
      { prompt: "Why do two unknowns need two equations?", answer: "One equation in two unknowns has a whole line of solutions; a second independent equation picks out the single point where the lines cross." },
      { prompt: "What does it mean when solving a system produces the statement 0 = 5?", answer: "The equations are inconsistent (parallel lines); there is no solution.", accept: ["no solution", "inconsistent"] },
    ],
    applications: ["Break-even analysis for tariffs, subscriptions and production", "Mixing problems: concentrations, alloys, blended prices", "Supply and demand equilibrium as the crossing of two lines"],
    misconception: "That an equation is 'solved' when a number appears. A solution is a value that satisfies every equation in the system; substituting it back is part of solving, not an optional check.",
    difficulty: 2,
    foundational: true,
    tags: ["algebra", "systems"],
  }),
  concept(QF, "qf-algebra", {
    id: "inequalities",
    title: "Inequalities",
    summary:
      "Statements that one quantity is at least, at most, more than or less than another. They behave like equations except that multiplying or dividing by a negative number reverses the direction, and their solutions are ranges rather than points.",
    keyPoints: [
      "Adding or subtracting the same quantity on both sides keeps the direction; multiplying or dividing by a negative reverses it.",
      "−3x + 7 > 22 gives −3x > 15 and therefore x < −5, not x > −5.",
      "'At least' means ≥, 'more than' means >; the difference decides whether the boundary value is included.",
      "When a real-world answer must be a whole number, a minimum is rounded up and a maximum is rounded down.",
      "A constraint problem is a set of inequalities; the feasible region is where all of them hold.",
    ],
    dependsOn: ["linear-equations"],
    related: ["optimisation", "opportunity-cost"],
    recallPrompts: [
      { prompt: "Solve −3x + 7 > 22.", answer: "x < −5 (dividing by −3 reverses the inequality).", accept: ["x < -5", "x<-5"] },
      { prompt: "A freelancer must earn at least £2,400 net; each hour brings £35.10 net. Minimum whole hours?", answer: "69: 2,400 ÷ 35.1 = 68.4, and a minimum is rounded up.", accept: ["69"] },
      { prompt: "When does the direction of an inequality change?", answer: "When both sides are multiplied or divided by a negative number (or when both sides are swapped)." },
    ],
    applications: ["Budgets and break-even thresholds", "Safety margins and tolerances in engineering", "Feasible regions in planning and scheduling"],
    misconception: "That an inequality is solved exactly like an equation. Division by a negative reverses it, and the answer is a range whose boundary may or may not be included.",
    difficulty: 2,
    tags: ["algebra"],
  }),
  concept(QF, "qf-algebra", {
    id: "exponents-and-logarithms",
    title: "Exponents and logarithms",
    summary:
      "Exponents encode repeated multiplication; logarithms ask the reverse question, 'to what power?'. Between them they describe compound growth, decay, doubling times and every scale on which multiplication is the natural step.",
    keyPoints: [
      "a^m × a^n = a^(m+n); (a^m)^n = a^(mn); a^(−n) = 1/a^n; a^0 = 1.",
      "log_b(x) is the exponent that b must be raised to in order to give x; log10(1000) = 3, log10(0.01) = −2.",
      "log(ab) = log a + log b and log(a^n) = n log a; there is no rule for log(a + b).",
      "Doubling time at growth rate r per period is ln 2 / ln(1 + r); the rule of 70 (70 ÷ percentage rate) is a close approximation.",
      "An exponential quantity multiplies by the same factor each period, so it plots as a straight line on a logarithmic axis.",
      "A negative exponent means a reciprocal, not a negative number: 2^(−3) = 1/8.",
    ],
    dependsOn: ["algebraic-manipulation", "orders-of-magnitude"],
    related: ["linear-vs-exponential-growth", "time-value-of-money", "bonds-and-interest-rates"],
    recallPrompts: [
      { prompt: "How long does a quantity growing 6 % a year take to double?", answer: "About 11.9 years (ln 2 / ln 1.06); the rule of 70 gives 11.7.", accept: ["11.9", "about 12", "12", "11.7"] },
      { prompt: "Evaluate log10(1000) − log10(0.01).", answer: "5: 3 − (−2).", accept: ["5"] },
      { prompt: "Is log(a + b) equal to log a + log b?", answer: "No. log a + log b = log(ab); sums inside a logarithm do not split.", accept: ["no"] },
    ],
    applications: ["Compound interest and inflation over many years", "Half-lives in medicine and radioactivity", "Decibels, pH and magnitude scales", "Reading log-scale charts of epidemics or market indices"],
    misconception: "That 2^(−3) is −8. The minus sign in an exponent means 'divide' (a reciprocal); it never makes a positive base negative.",
    difficulty: 3,
    foundational: true,
    tags: ["algebra", "growth"],
  }),
  concept(QF, "qf-algebra", {
    id: "quadratics",
    title: "Quadratics and factoring",
    summary:
      "Equations in which the unknown appears squared. They model areas, projectiles and anything with a single turning point; solving them means factorising, completing the square or using the quadratic formula, and then deciding which of the two roots the question actually wants.",
    keyPoints: [
      "ax² + bx + c = 0 has roots x = (−b ± √(b² − 4ac)) / 2a; the discriminant b² − 4ac decides how many real roots there are.",
      "If a product is zero, at least one factor is zero: t(20 − 5t) = 0 gives t = 0 or t = 4.",
      "Factorise by finding two numbers whose product is c and whose sum is b (when a = 1).",
      "A quadratic's graph is a parabola whose vertex is at x = −b / 2a; that is where maxima and minima live.",
      "Real problems often reject one root (a negative width, a time before the throw); state why, do not just drop it.",
    ],
    dependsOn: ["algebraic-manipulation", "linear-equations"],
    related: ["optimisation", "functions-and-graphs"],
    recallPrompts: [
      { prompt: "A garden's area is 84 m² and its length is 5 m more than its width. Find the width.", answer: "7 m: w² + 5w − 84 = (w + 12)(w − 7) = 0, and −12 is rejected.", accept: ["7"] },
      { prompt: "For which k does x² + 6x + k = 0 have exactly one real root?", answer: "k = 9, because the discriminant 36 − 4k must be zero.", accept: ["9"] },
      { prompt: "Where is the vertex of y = ax² + bx + c?", answer: "At x = −b / (2a).", accept: ["-b/2a", "x = -b/(2a)"] },
    ],
    applications: ["Projectile and braking-distance problems", "Maximising revenue when price and quantity trade off linearly", "Areas with fixed perimeters"],
    misconception: "That both roots are always answers. The algebra produces every value that satisfies the equation; the problem decides which are meaningful.",
    difficulty: 3,
    tags: ["algebra"],
  }),
];

const functions: Concept[] = [
  concept(QF, "qf-functions", {
    id: "functions-and-graphs",
    title: "Functions and graphs",
    summary:
      "A function is a rule that assigns exactly one output to each input; its graph makes the rule visible. Reading slope, intercept, composition and inverses from a formula or a picture is how quantitative arguments are followed.",
    keyPoints: [
      "f(x) names the output for input x; f(g(3)) means apply g first, then f, so the order matters.",
      "For a straight line y = mx + c, m is the rate (change in y per unit x) and c is the value when x = 0.",
      "Slope is read as rise over run between any two points; a steeper graph means a larger rate.",
      "An inverse function undoes the original; only functions that never repeat an output have one.",
      "A graph's shape (increasing, flattening, turning) carries more information than any single point on it.",
    ],
    dependsOn: ["linear-equations"],
    related: ["visualising-data", "regression", "linear-transformations"],
    recallPrompts: [
      { prompt: "If f(x) = 2x + 1 and g(x) = x², what is f(g(3)) and how does it differ from g(f(3))?", answer: "f(g(3)) = f(9) = 19; g(f(3)) = g(7) = 49. Composition is not commutative.", accept: ["19"] },
      { prompt: "In a taxi fare f(d) = 3 + 2.4d, what do the 3 and the 2.4 mean?", answer: "3 is the fixed charge before any distance; 2.4 is the cost per kilometre (the slope)." },
      { prompt: "What does a flattening graph tell you about the rate?", answer: "The rate is falling towards zero: the quantity still changes, but more slowly." },
    ],
    applications: ["Tariffs, tax bands and pricing schedules", "Reading any chart in a report as a function of time", "Describing a model before any statistics are applied to it"],
    misconception: "That a graph rising means a quantity is 'going well' regardless of shape. A rising but flattening curve and a rising but steepening curve describe opposite futures.",
    difficulty: 2,
    foundational: true,
    tags: ["functions"],
  }),
  concept(QF, "qf-functions", {
    id: "linear-vs-exponential-growth",
    title: "Linear versus exponential growth",
    summary:
      "Linear growth adds the same amount each period; exponential growth multiplies by the same factor. Over short spans they look alike, over long spans exponential growth dominates everything, and confusing them is one of the most consequential quantitative errors.",
    keyPoints: [
      "Linear: constant differences between successive values. Exponential: constant ratios.",
      "Test a series by dividing consecutive terms; 40, 60, 90, 135 has ratio 1.5 every time.",
      "3 % a year for 20 years is × 1.03^20 ≈ × 1.81, not × 1.60; the extra comes from growth on growth.",
      "On a logarithmic axis exponential growth is a straight line and linear growth curves downward.",
      "Exponential decay works the same way in reverse: a fixed fraction lost each period, never reaching zero.",
    ],
    dependsOn: ["functions-and-graphs", "exponents-and-logarithms"],
    related: ["gdp-and-growth", "time-value-of-money", "economic-development", "cells-and-genetics"],
    recallPrompts: [
      { prompt: "How do you tell from a table whether a series is linear or exponential?", answer: "Check the differences (constant for linear) and the ratios (constant for exponential) between successive values." },
      { prompt: "8,000 growing 3 % a year versus 11,000 gaining 200 a year: which is larger after 20 years?", answer: "The linear town, 15,000 against about 14,450; the exponential one overtakes only a few years later.", accept: ["the linear one", "linear", "15000"] },
      { prompt: "What does exponential growth look like on a log-scale chart?", answer: "A straight line.", accept: ["straight line", "a straight line"] },
    ],
    applications: ["Savings and debt over decades", "Epidemic case counts in the early phase", "Population, GDP and computing-power trends", "Judging a forecast that quietly assumes compounding"],
    misconception: "That 3 % a year for 20 years is 60 %. Compounding makes it 81 %, and the gap grows with time and rate.",
    difficulty: 3,
    foundational: true,
    tags: ["growth", "functions"],
  }),
  concept(QF, "qf-functions", {
    id: "rates-of-change",
    title: "Rates of change",
    summary:
      "A rate is how fast one quantity changes with respect to another, most often time. Distinguishing a level from its rate, and a rate from the change in the rate, is what separates reading a chart from misreading it.",
    keyPoints: [
      "Average rate of change = change in quantity ÷ change in time, with the sign showing direction.",
      "Units of a rate are quantity per time; convert the time unit before dividing, not after.",
      "Inflation falling from 6 % to 4 % means prices still rise, more slowly; the level went up, the rate went down.",
      "A steepening graph means the rate itself is rising; a flattening one means the rate is falling.",
      "'Growth slowed' and 'growth turned negative' describe different worlds; check which one the numbers support.",
    ],
    dependsOn: ["functions-and-graphs", "units-and-dimensional-analysis"],
    related: ["derivative-intuition", "marginal-thinking", "inflation", "business-cycles"],
    recallPrompts: [
      { prompt: "A tank reads 140 L at 2:00 and 95 L at 2:30. Average rate of change in litres per hour?", answer: "−90 L/h: −45 L in half an hour.", accept: ["-90", "−90", "-90 L/h"] },
      { prompt: "Inflation fell from 6 % to 4 %. Did prices fall?", answer: "No. Prices rose 4 % over the year; only the rate of increase fell.", accept: ["no"] },
      { prompt: "What is the difference between a level and a rate?", answer: "A level is the value of a quantity; a rate is how quickly the level is changing. The rate can fall while the level keeps rising." },
    ],
    applications: ["Reading economic news about inflation, growth and employment", "Speed, flow and consumption figures", "Judging whether a trend is accelerating or decelerating"],
    misconception: "That a falling rate means a falling quantity. A car slowing from 60 to 40 is still moving forward.",
    difficulty: 2,
    foundational: true,
    tags: ["rates", "functions"],
  }),
];

const geometry: Concept[] = [
  concept(QF, "qf-geometry", {
    id: "geometry-and-scale",
    title: "Geometry, area, volume and scale",
    summary:
      "Lengths, areas and volumes scale differently: doubling every length multiplies area by four and volume by eight. That single fact explains map scales, model costs, why elephants have thick legs and why a cylinder holds far more than its diameter suggests.",
    keyPoints: [
      "Scale factor k for lengths gives k² for areas and k³ for volumes; a 1 : 50 model's floor area is 2,500 times smaller than the real one.",
      "Circle area is πr² with the radius, not the diameter; a cylinder's volume is πr²h.",
      "One cubic metre is 1,000 litres; one square metre is 10,000 square centimetres.",
      "Surface area grows with k² but volume with k³, so larger bodies have less surface per unit volume and keep heat, lose water and bear loads differently.",
      "A map scale 1 : 25,000 means one map centimetre is 25,000 cm, that is 250 m, on the ground.",
    ],
    dependsOn: ["units-and-dimensional-analysis", "fractions-ratios-percentages"],
    related: ["integral-intuition", "evolution-by-natural-selection", "physical-geography-systems", "architecture-history"],
    recallPrompts: [
      { prompt: "A 1 : 50 architectural model has a floor area of 240 cm². What is the real floor area?", answer: "60 m²: area scales by 50² = 2,500, giving 600,000 cm².", accept: ["60", "60 m2", "60 m²"] },
      { prompt: "If an animal doubled in every dimension, how would heat produced (volume) and heat lost (surface) change?", answer: "Heat produced × 8, surface × 4, so the larger animal retains heat more easily.", accept: ["8 and 4", "volume x8, area x4"] },
      { prompt: "Does doubling a circle's radius double its area?", answer: "No, it quadruples it (πr² with r doubled).", accept: ["no", "quadruples"] },
    ],
    applications: ["Reading maps and plans", "Costing materials for a scaled design", "Biology of body size, dosing by body mass", "Why a tank's capacity surprises people"],
    misconception: "That area and volume scale in proportion to length. They scale with its square and cube, which is why 'twice as big' is ambiguous until you say in what.",
    difficulty: 3,
    foundational: true,
    tags: ["geometry", "scale"],
  }),
];

/* ------------------------------------------------------------------ */
/* Further mathematics                                                  */
/* ------------------------------------------------------------------ */

const calculus: Concept[] = [
  concept(FM, "fm-calculus", {
    id: "derivative-intuition",
    title: "The derivative as a rate",
    summary:
      "The derivative is the instantaneous rate of change: the slope of a curve at a single point, found by shrinking the interval of an average rate towards zero. It is what 'marginal' means in economics and 'velocity' in physics.",
    keyPoints: [
      "The average rate over an interval becomes the instantaneous rate as the interval shrinks; for f(x) = x² the rate at x = 3 is 6.",
      "Power rule: the derivative of x^n is n x^(n−1); of a constant, 0; derivatives add term by term.",
      "Marginal cost is the derivative of total cost, not total cost divided by quantity (that is average cost).",
      "A derivative of zero marks a flat point: a maximum, a minimum or a plateau.",
      "The sign of the derivative says whether the quantity is rising or falling; its size says how fast.",
    ],
    dependsOn: ["rates-of-change", "functions-and-graphs"],
    related: ["marginal-thinking", "optimisation", "physics-forces-and-energy"],
    recallPrompts: [
      { prompt: "C(q) = 0.5q² + 20q + 1,000. What is the marginal cost at q = 40, and how does it differ from average cost there?", answer: "Marginal cost C′(40) = 40 + 20 = 60; average cost is 2,600 / 40 = 65.", accept: ["60"] },
      { prompt: "What does a derivative of zero indicate?", answer: "A stationary point: the quantity is momentarily neither rising nor falling (a maximum, minimum or plateau)." },
      { prompt: "State the power rule.", answer: "The derivative of x^n is n x^(n−1).", accept: ["nx^(n-1)", "n x^(n-1)"] },
    ],
    applications: ["Marginal cost, revenue and utility", "Velocity and acceleration", "Sensitivity of a model output to one input"],
    misconception: "That the derivative is the value of the function. It is the slope; a large value can have a small or negative slope.",
    difficulty: 4,
    tags: ["calculus"],
  }),
  concept(FM, "fm-calculus", {
    id: "integral-intuition",
    title: "The integral as accumulation",
    summary:
      "An integral adds up a rate over time to recover the total: distance from speed, revenue from a sales rate, volume from a flow. Geometrically it is the area under the curve, and the fundamental theorem says integration undoes differentiation.",
    keyPoints: [
      "Area under a rate-against-time graph is the accumulated quantity; a constant rate gives a rectangle, a steadily rising rate a triangle.",
      "Speed rising uniformly from 0 to 20 m/s over 10 s covers ½ × 10 × 20 = 100 m, not 200 m.",
      "Integration and differentiation are inverse operations (the fundamental theorem of calculus).",
      "Definite integrals have limits and give a number; indefinite integrals give a family of functions plus a constant.",
      "Areas below the axis count negative, which is how net change can be smaller than gross change.",
    ],
    dependsOn: ["derivative-intuition", "geometry-and-scale"],
    related: ["expected-value", "descriptive-statistics", "thermodynamics-and-entropy"],
    recallPrompts: [
      { prompt: "A car accelerates uniformly from 0 to 20 m/s in 10 s then holds 20 m/s for 15 s. Distance?", answer: "400 m: triangle 100 m plus rectangle 300 m.", accept: ["400", "400 m"] },
      { prompt: "What does the fundamental theorem of calculus connect?", answer: "Integration and differentiation: the integral of a rate over an interval equals the net change of the underlying quantity." },
      { prompt: "Why does area under a curve represent accumulated quantity?", answer: "Because each thin strip has width (a little time) times height (the rate), which is a little of the quantity; adding the strips adds the quantity." },
    ],
    applications: ["Total distance or fuel from a speed log", "Cumulative cases from a daily-case curve", "Probability as area under a density"],
    misconception: "That accumulated quantity is final rate times total time. That is only true when the rate is constant; otherwise the area, not the rectangle, is the answer.",
    difficulty: 4,
    tags: ["calculus"],
  }),
  concept(FM, "fm-calculus", {
    id: "optimisation",
    title: "Optimisation",
    summary:
      "Finding the best value of something under a constraint: the largest area for a given fence, the cheapest mix for a given output. Express the target as a function of one variable using the constraint, find where its derivative is zero, and check the ends.",
    keyPoints: [
      "Write the constraint as an equation, use it to eliminate a variable, then optimise a function of one variable.",
      "Stationary points (derivative zero) are candidates; confirm maximum or minimum by the sign change or by checking the boundary.",
      "A quadratic target has its optimum at the vertex x = −b / 2a, no calculus required.",
      "Three sides of fencing against a wall: A = x(60 − 2x) peaks at x = 15, giving 450 m², more than any square.",
      "In economics the rule 'marginal benefit equals marginal cost' is a derivative set to zero.",
    ],
    dependsOn: ["derivative-intuition", "quadratics"],
    related: ["marginal-thinking", "opportunity-cost", "machine-learning-basics"],
    recallPrompts: [
      { prompt: "60 m of fencing encloses three sides of a rectangle against a wall. What is the largest area?", answer: "450 m²: sides 15 m, 15 m and 30 m.", accept: ["450", "450 m2", "450 m²"] },
      { prompt: "What are the steps of a constrained optimisation?", answer: "Express the target as a function of one variable via the constraint, find where the derivative is zero, then check that point and the boundaries." },
      { prompt: "Why is 'marginal benefit equals marginal cost' an optimisation condition?", answer: "Net benefit is maximised where its derivative is zero, and that derivative is marginal benefit minus marginal cost." },
    ],
    applications: ["Pricing and output decisions", "Designing containers and layouts", "Training machine-learning models by minimising a loss"],
    misconception: "That the symmetric shape (a square, an equal split) is always the optimum. It is only when the constraint is symmetric too.",
    difficulty: 4,
    tags: ["calculus"],
  }),
];

const linear: Concept[] = [
  concept(FM, "fm-linear", {
    id: "vectors-and-matrices",
    title: "Vectors and matrices",
    summary:
      "A vector is an ordered list of numbers that can be added and scaled; a matrix is a grid that acts on vectors. They are the notation in which systems of equations, data tables, images and physical forces are all handled at once.",
    keyPoints: [
      "Vectors add component by component; a scalar multiplies every component.",
      "The dot product a · b = Σ aᵢbᵢ measures alignment; it is zero when the vectors are perpendicular.",
      "A matrix times a vector takes the dot product of each row with the vector: [[2, 1], [0, 3]] (4, −2) = (6, −6).",
      "Matrix multiplication is not commutative; the rows of the first meet the columns of the second.",
      "A system of linear equations is Ax = b; solving it is undoing the matrix.",
    ],
    dependsOn: ["linear-equations", "geometry-and-scale"],
    related: ["linear-transformations", "portfolio-theory", "neural-networks"],
    recallPrompts: [
      { prompt: "Compute (3, −1, 2) · (2, 4, −1) and interpret the result.", answer: "6 − 4 − 2 = 0, so the vectors are perpendicular.", accept: ["0", "zero"] },
      { prompt: "How is a matrix multiplied by a vector?", answer: "Each component of the result is the dot product of a row of the matrix with the vector." },
      { prompt: "Is AB equal to BA for matrices?", answer: "Not in general; matrix multiplication is not commutative.", accept: ["no", "not in general"] },
    ],
    applications: ["Solving many linear equations at once", "Weighted portfolios and averages", "Image, signal and neural-network computations"],
    misconception: "That matrices multiply entry by entry. Each result entry is a whole row against a whole column.",
    difficulty: 4,
    tags: ["linear-algebra"],
  }),
  concept(FM, "fm-linear", {
    id: "linear-transformations",
    title: "Linear transformations",
    summary:
      "A matrix is a machine that moves every point of space in a way that keeps lines straight and the origin fixed: rotations, reflections, stretches and shears. Reading a matrix as a transformation is how linear algebra becomes geometry.",
    keyPoints: [
      "The columns of a matrix are where the basis vectors (1, 0) and (0, 1) land; that fixes the whole map.",
      "[[0, −1], [1, 0]] sends (1, 0) to (0, 1) and (0, 1) to (−1, 0): a 90° anticlockwise rotation.",
      "The determinant is the area-scaling factor; a negative determinant flips orientation, zero collapses a dimension.",
      "Composing transformations is multiplying their matrices, in the order the transformations are applied (rightmost first).",
      "Eigenvectors are directions the transformation only stretches; the eigenvalue is the stretch factor.",
    ],
    dependsOn: ["vectors-and-matrices", "functions-and-graphs"],
    related: ["neural-networks", "transformers-and-attention", "physics-forces-and-energy"],
    recallPrompts: [
      { prompt: "What transformation does [[0, −1], [1, 0]] perform?", answer: "A 90° anticlockwise rotation.", accept: ["rotation 90 anticlockwise", "90 degree anticlockwise rotation", "counterclockwise rotation"] },
      { prompt: "How do you read a transformation from its matrix?", answer: "Its columns are the images of the basis vectors; every other point is a combination of those." },
      { prompt: "What does a determinant of zero mean geometrically?", answer: "The transformation squashes space into a lower dimension (a line or a point); it cannot be undone.", accept: ["collapses a dimension", "not invertible"] },
    ],
    applications: ["Computer graphics and rotations", "Principal components in data analysis", "Layers of a neural network as transformations"],
    misconception: "That a matrix is only a table of numbers. Its columns describe a motion of space, and that picture predicts what the numbers will do.",
    difficulty: 5,
    tags: ["linear-algebra"],
  }),
];

const discrete: Concept[] = [
  concept(FM, "fm-discrete", {
    id: "sets-and-counting",
    title: "Sets and counting",
    summary:
      "How to count without listing: the multiplication principle, permutations for ordered choices, combinations for unordered ones, and inclusion–exclusion for overlapping sets. Probability, combinatorics and much of computing rest on getting these counts right.",
    keyPoints: [
      "Multiplication principle: independent choices multiply; 3 shirts and 4 ties give 12 outfits.",
      "Permutations count ordered selections (12 × 11 × 10 = 1,320 for three from twelve); combinations divide out the orderings (1,320 / 6 = 220).",
      "Inclusion–exclusion: |A ∪ B| = |A| + |B| − |A ∩ B|; forgetting the subtraction double-counts the overlap.",
      "Ask 'does order matter?' and 'can items repeat?' before choosing a formula.",
      "A set has no order and no duplicates; a list has both.",
    ],
    dependsOn: ["number-sense"],
    related: ["combinatorics", "probability-rules", "randomness-and-sample-spaces", "data-structures"],
    recallPrompts: [
      { prompt: "How many committees of 3 can a club of 12 form?", answer: "220 (12 choose 3).", accept: ["220"] },
      { prompt: "Of 80 students, 45 study French, 38 German and 15 both. How many study neither?", answer: "12: 45 + 38 − 15 = 68 study at least one.", accept: ["12"] },
      { prompt: "What is the difference between a permutation and a combination?", answer: "Permutations count ordered selections; combinations count unordered ones (divide by the number of orderings)." },
    ],
    applications: ["Probability of hands, draws and passwords", "Counting configurations in scheduling and design", "Estimating how many test cases or possibilities exist"],
    misconception: "That 'A or B' is counted by adding. Adding counts the overlap twice; inclusion–exclusion subtracts it back.",
    difficulty: 3,
    foundational: true,
    tags: ["discrete", "counting"],
  }),
  concept(FM, "fm-discrete", {
    id: "proof-and-induction",
    title: "Proof and induction",
    summary:
      "A proof is an argument that a claim holds in every case, not just the ones checked. Direct proof, proof by contradiction and induction are the standard shapes; knowing them makes it possible to tell a demonstration from a pile of examples.",
    keyPoints: [
      "No number of confirming examples proves a universal claim; one counterexample refutes it.",
      "Induction: show the base case, then show that truth at k forces truth at k + 1; together they cover every n.",
      "Contradiction: assume the claim is false, derive an impossibility, conclude the claim is true (the classic proof that √2 is irrational).",
      "A proof may not assume what it is trying to prove; circularity is the commonest hidden flaw.",
      "'If P then Q' is not 'if Q then P'; an induction step must run from k to k + 1, not backwards.",
    ],
    dependsOn: ["algebraic-manipulation", "sets-and-counting"],
    related: ["validity-and-soundness", "deduction-vs-induction", "conditionals-and-contrapositive", "scientific-method"],
    recallPrompts: [
      { prompt: "What two things must an induction proof establish?", answer: "The base case, and that the claim for k implies the claim for k + 1." },
      { prompt: "Why does checking a claim for n = 1 to 100 not prove it for all n?", answer: "A universal claim covers infinitely many cases; examples can only support it, and the first failure may be at n = 101 or beyond." },
      { prompt: "Sketch the proof that √2 is irrational.", answer: "Assume √2 = p/q in lowest terms; then p² = 2q², so p is even, p = 2m; then q² = 2m², so q is even; both even contradicts lowest terms." },
    ],
    applications: ["Verifying an algorithm works for every input", "Distinguishing a proven result from a conjecture in a report", "Building an argument that cannot be defeated by a new example"],
    misconception: "That mathematical induction is inductive reasoning from examples. It is deductive: the step from k to k + 1 is proved in general, not observed.",
    difficulty: 5,
    tags: ["discrete", "proof"],
  }),
  concept(FM, "fm-discrete", {
    id: "graphs-and-networks-math",
    title: "Graphs and networks",
    summary:
      "A graph is a set of nodes joined by edges: cities and roads, people and friendships, web pages and links. Degrees, paths and connectivity answer questions about flow, reach and bottlenecks without any geometry at all.",
    keyPoints: [
      "The sum of all degrees equals twice the number of edges (every edge has two ends), so degree sums are always even.",
      "A walk using every edge exactly once and returning to its start (an Euler circuit) exists in a connected graph exactly when every vertex has even degree.",
      "With exactly two odd-degree vertices there is an Euler trail between them but no circuit.",
      "Paths, shortest paths and connectivity are the questions behind routing, logistics and contagion.",
      "Trees are connected graphs with no cycles; n nodes need exactly n − 1 edges.",
    ],
    dependsOn: ["sets-and-counting"],
    related: ["networks-and-internet", "data-structures", "causal-graphs", "algorithms-and-complexity", "chokepoints-and-trade-routes"],
    recallPrompts: [
      { prompt: "A network has four nodes of degree 3 and two of degree 2. How many edges?", answer: "8: the degree sum 16 is twice the edge count.", accept: ["8"] },
      { prompt: "When can a postal worker walk every street exactly once and return to the start?", answer: "When the street graph is connected and every intersection has even degree." },
      { prompt: "What is a tree, in graph terms?", answer: "A connected graph with no cycles; n nodes and n − 1 edges." },
    ],
    applications: ["Route planning and delivery", "Social and communication networks", "Dependency graphs in software and curricula", "Supply-chain bottlenecks"],
    misconception: "That a graph in this sense has anything to do with axes and plotted points. It is nodes and connections; position on the page is irrelevant.",
    difficulty: 4,
    tags: ["discrete", "networks"],
  }),
];

export const MATHEMATICS_CONCEPTS: Concept[] = [...arithmetic, ...algebra, ...functions, ...geometry, ...calculus, ...linear, ...discrete];
