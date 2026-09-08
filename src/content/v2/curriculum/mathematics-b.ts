/**
 * Mathematics — lessons (part B of the mathematics domain).
 * Ids: ls-<moduleId>-<n>. British spelling throughout.
 *
 * Every lesson follows the nine-step structure (question → intuition → model → worked example →
 * guided → independent → explain back → transfer; retrieval is scheduled by the engine). Practice
 * steps reference items in src/content/v2/items/mathematics.ts; none of them is exam-only.
 */
import type { Lesson } from "@/lib/v2/content-types";

type Draft = Omit<Lesson, "origin">;

const lesson = (draft: Draft): Lesson => ({ origin: "seeded", ...draft });
const it = (...ns: number[]) => ns.map((n) => `it-mathematics-${String(n).padStart(2, "0")}`);

/* ------------------------------------------------------------------ */
/* qf-arithmetic                                                        */
/* ------------------------------------------------------------------ */

const percentages = lesson({
  id: "ls-qf-arithmetic-1",
  moduleId: "qf-arithmetic",
  conceptIds: ["fractions-ratios-percentages", "number-sense"],
  title: "Percentages and their bases",
  promise: "After this lesson you will never again add two percentage changes, and you will know why the shop's 25 % rise and 25 % discount do not cancel.",
  minutes: 20,
  difficulty: 2,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A shop raises a price by 25 % in January and advertises '25 % off' in February. Is the February price above, below or equal to the original? Decide before you calculate; then calculate.",
      thinkSeconds: 45,
      reveal:
        "Below, by 6.25 %. Start at 100: the rise gives 125, and 25 % off 125 is 31.25, leaving 93.75. The two percentages have different bases, 100 and 125, so they do not cancel. Most people's first instinct is 'equal'; noticing that the second 25 % is taken from a bigger number is the whole lesson.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why percentages exist",
      body: {
        standard:
          "Percentages exist to compare parts of different wholes. Three pounds off a coffee and three pounds off a car are the same absolute change and completely different events; '60 % off' and '0.01 % off' capture the difference. That usefulness comes at a price: a percentage has no meaning until you know its base, the quantity it is a fraction of. Nearly every percentage error in the wild is a base error: the discount applied to the wrong price, the 'rise of 1 %' that is really a rise of one percentage point, the two changes that seemed to cancel. The discipline is to ask 'of what?' every time a percentage appears, and to write the base down before doing anything else.",
        intuition:
          "A percentage is a fraction of something. Until you know what the something is, the number tells you nothing. Every trick in this lesson comes down to finding the base and keeping hold of it.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Percentages as multipliers",
      body: {
        standard:
          "Treat every percentage change as a multiplier. A rise of p % multiplies by (1 + p/100); a fall of p % multiplies by (1 − p/100). Three consequences follow. Successive changes multiply their multipliers, so +40 % then −30 % is 1.4 × 0.7 = 0.98, a 2 % fall. Undoing a change divides by its multiplier: a price of £51 after 15 % off was 51 ÷ 0.85 = £60, not 51 × 1.15. And a change in a percentage itself has two descriptions: from 4 % to 5 % is one percentage point (the difference) and a 25 % rise (the difference divided by the starting rate). Ratios split a whole into parts: 5 : 3 : 2 is ten parts, so each part is a tenth of the total and the middle ingredient is three tenths.",
        intuition:
          "Think of a percentage change as a dial that scales a quantity: × 1.25 for up 25 %, × 0.75 for down 25 %. Two dials in a row multiply. To undo a dial, divide by it. When a rate moves from 4 % to 5 %, say 'one point' for the gap and '25 % higher' for the relative change, and never mix them.",
        deep:
          "Formally a percentage change is a ratio of new to old, r = new/old, reported as 100(r − 1). Ratios compose by multiplication, which is why percentage changes never add except approximately for small changes: (1 + a)(1 + b) = 1 + a + b + ab, and the cross term ab is what the additive shortcut drops. For a = 0.4 and b = −0.3 the cross term is −0.12, the whole of the surprise. Logarithms turn the product into a sum, which is why logarithmic returns in finance do add and why growth rates are best compared on a logarithmic scale. The percentage-point versus percent distinction is the distinction between a difference of ratios and a ratio of ratios.",
      },
      structure: [
        { term: "Multiplier", meaning: "1 + p/100 for a rise of p %; 1 − p/100 for a fall" },
        { term: "Successive changes", meaning: "Multiply the multipliers; never add the percentages" },
        { term: "Reverse percentage", meaning: "Divide by the multiplier to recover the original" },
        { term: "Percentage point", meaning: "The arithmetic difference between two percentages" },
        { term: "Ratio", meaning: "a : b : c splits a whole into a + b + c equal parts" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "A rise and a deduction",
      problem: "A salary of £42,000 rises by 5 %. A pension contribution of 3 % is then deducted from the new salary. What amount is paid, and what is the net percentage change from the original £42,000?",
      steps: [
        { text: "Convert each change to a multiplier: +5 % is × 1.05; −3 % is × 0.97.", note: "Writing multipliers first makes it impossible to add the percentages later." },
        { text: "Apply the rise: 42,000 × 1.05 = 44,100." },
        { text: "Apply the deduction to the new amount: 44,100 × 0.97 = 42,777.", note: "The 3 % is 3 % of 44,100 (£1,323), not of 42,000 (£1,260). Different base, different amount." },
        { text: "Net multiplier: 1.05 × 0.97 = 1.0185, so the net change is +1.85 %, not the +2 % that adding 5 and −3 would give.", note: "The missing 0.15 % is the cross term 0.05 × 0.03." },
        { text: "Sanity check: 2 % of 42,000 is 840; the actual rise is 777, a little under 2 %. Consistent." },
      ],
      answer: "£42,777, a net rise of 1.85 %.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Before each item, write down the base of every percentage in the question and convert it to a multiplier. If the item involves a ratio, count the parts first.",
      itemIds: it(3, 5),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(6, 4),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to someone who has just bought a jacket 'reduced by 15 % to £51' why the original price was not £58.65, and state the general rule they should take away.",
      keyPoints: ["base", "original price", "0.85", "divide", "multiplier"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "The same rule in two settings the lesson did not use: a medical headline and a freelancer's budget.",
      itemIds: it(48, 20),
    },
  ],
});

const magnitudesAndUnits = lesson({
  id: "ls-qf-arithmetic-2",
  moduleId: "qf-arithmetic",
  conceptIds: ["orders-of-magnitude", "units-and-dimensional-analysis", "number-sense"],
  title: "Powers of ten and the algebra of units",
  promise: "You will be able to check a billion-pound headline in your head and catch an inverted ratio before it reaches a spreadsheet.",
  minutes: 25,
  difficulty: 2,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A newspaper reports that a proposed scheme will cost £3 billion, 'about £45 for every person in the country'. Without a calculator, decide whether the two figures agree. What population does the pairing imply?",
      thinkSeconds: 60,
      reveal:
        "3 × 10⁹ ÷ 45 ≈ 6.7 × 10⁷, so the figures imply a population of about 67 million, which is right for the United Kingdom (around 67–68 million in the early 2020s). The check took one division in powers of ten and one reference number. Had the answer come out at 6.7 million or 670 million, the story, not your arithmetic, would need revisiting.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why size and kind both need tracking",
      body: {
        standard:
          "Large numbers hide their size. 'Three billion' and 'three hundred million' sound alike and differ by a factor of ten. Scientific notation separates the two things worth knowing about a number, its leading digits and its power of ten, so that a slip of one exponent shows up as an absurdity rather than a plausible-looking figure. Units do a parallel job for the kind of quantity: kilowatt-hours are not kilowatts, litres per 100 km are not kilometres per litre, and any formula whose two sides have different units is wrong before a single number is substituted. Treating units as algebraic symbols that multiply and cancel is the cheapest error-detector in applied mathematics.",
        intuition: "Powers of ten tell you how big; units tell you what kind. Keep both attached to every number and most mistakes announce themselves before you finish.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Scientific notation, Fermi estimates and unit cancellation",
      body: {
        standard:
          "Write a quantity as a × 10ⁿ with 1 ≤ a < 10. To multiply, multiply the leading parts and add the exponents; to divide, divide the parts and subtract the exponents; then re-normalise so the leading part is between 1 and 10. An order of magnitude is one power of ten. A Fermi estimate factorises an unknown into pieces each guessable to within a factor of two or three; the errors partly cancel and the product is usually within an order of magnitude of the truth. For units, multiply by conversion factors equal to one (1,000 L / 1 m³, 3,600 s / 1 h) arranged so that unwanted units cancel; the units that survive tell you whether a ratio went the right way up. Dimensional consistency, both sides of an equation carrying the same units, is a necessary condition for any formula to be correct.",
        intuition:
          "Split every number into 'roughly how many' and 'times ten to the what'. Handle the two parts separately and recombine. Write units on every line and cancel them like fractions; if metres are left when you wanted seconds, you inverted something.",
        deep:
          "Scientific notation is a floating-point representation: mantissa and exponent, with the mantissa carrying precision and the exponent carrying scale. Significant figures live in the mantissa; multiplying two-figure numbers cannot yield more than two trustworthy figures, however many the calculator prints. Fermi estimation works because the logarithm of a product is a sum of logarithms; independent errors in the factors add in log space and partly cancel, so the spread of the estimate's logarithm grows only with the square root of the number of factors. Dimensional analysis is stronger than a check: the Buckingham π theorem says any physical law can be written in terms of dimensionless combinations of its variables, which is how √(L/g) for a pendulum's period can be derived up to a constant without solving any equation of motion.",
      },
      structure: [
        { term: "Scientific notation", meaning: "a × 10ⁿ with 1 ≤ a < 10; multiply parts, add exponents" },
        { term: "Order of magnitude", meaning: "A factor of ten; 3 × 10⁷ and 8 × 10⁷ are the same order" },
        { term: "Fermi estimate", meaning: "Factorise the unknown into guessable pieces and multiply" },
        { term: "Conversion factor", meaning: "A fraction equal to one, e.g. 1,000 L / 1 m³, arranged so units cancel" },
        { term: "Dimensional consistency", meaning: "Both sides of an equation carry the same units" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Miles per hour to metres per second",
      problem: "Convert a speed limit of 70 miles per hour into metres per second (1 mile = 1,609 m).",
      steps: [
        { text: "Write the quantity with its units as a fraction: 70 mi / 1 h." },
        { text: "Multiply by conversion factors equal to one, arranged so the unwanted units cancel: (70 mi / 1 h) × (1,609 m / 1 mi) × (1 h / 3,600 s).", note: "Miles cancel top and bottom; hours cancel top and bottom; metres over seconds survive, which is what was asked for." },
        { text: "Estimate first: 70 × 1,600 ≈ 112,000; ÷ 3,600 ≈ 31. Expect something around 30 m/s." },
        { text: "Compute: 70 × 1,609 = 112,630; 112,630 ÷ 3,600 = 31.3 m/s." },
        { text: "Check against a reference: 100 km/h is 27.8 m/s, and 70 mph (113 km/h) should be a little more. It is." },
      ],
      answer: "About 31 m/s (31.3).",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For each item write every number in scientific notation and every quantity with its unit before doing anything else. Decide which units must survive and arrange the ratios so that the others cancel.",
      itemIds: it(7, 10),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(8, 11, 49),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why an equation whose two sides have different units must be wrong, and how the same habit catches an inverted ratio such as 'litres per 100 km' used the wrong way up.",
      keyPoints: ["same units", "cancel", "conversion factor", "equal to one", "inverted"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A physics formula you may not remember, and a report figure that needs a plausibility check.",
      itemIds: it(12, 2),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* qf-algebra                                                           */
/* ------------------------------------------------------------------ */

const keepingEquationsHonest = lesson({
  id: "ls-qf-algebra-1",
  moduleId: "qf-algebra",
  conceptIds: ["algebraic-manipulation", "linear-equations", "inequalities"],
  title: "Keeping equations honest",
  promise: "You will rearrange a formula, solve a break-even problem and handle an inequality without a single sign going astray.",
  minutes: 30,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "Three of these four statements are wrong. Which, and what exactly goes wrong in each? (a) (a + b)² = a² + b²   (b) 2(x − 3) = 2x − 3   (c) (x² − 9)/(x − 3) = x − 3   (d) −(x − 5) = 5 − x",
      thinkSeconds: 60,
      reveal:
        "(d) is right. (a) drops the cross term 2ab; try a = b = 1 and get 4 against 2. (b) fails to distribute the 2 over the −3; the answer is 2x − 6. (c) cancels the x terms instead of factorising: x² − 9 = (x − 3)(x + 3), so the quotient is x + 3. Each error is a broken rule about how an operation spreads across a sum, not a slip.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Arithmetic with the numbers postponed",
      body: {
        standard:
          "Algebra is arithmetic with the numbers postponed. Every rule for rearranging an expression is a rule that would hold for any numbers you might substitute, which is why a suspected identity can always be tested with numbers before it is trusted. An equation is a balance: whatever is done to one side is done to the whole of the other. Inequalities are balances with a direction, and multiplying by a negative number turns the direction round. Most of the value of algebra for a non-specialist is not solving exam equations but rearranging a formula to isolate the quantity you actually want, and translating a sentence about costs, mixtures or thresholds into a line of symbols that can be solved and then checked.",
        intuition: "Symbols stand for numbers you have not chosen yet. Anything that would be cheating with numbers is cheating with symbols. When in doubt, put numbers in and see.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "The rules and the two shapes of problem",
      body: {
        standard:
          "Order of operations: brackets, powers, multiplication and division left to right, then addition and subtraction left to right. Distributive law: a(b + c) = ab + ac, read forwards to expand and backwards to factorise; a minus sign in front of a bracket changes every sign inside. Cancel only common factors of the whole numerator and denominator, never individual terms. To make a variable the subject, undo the operations around it in reverse order, applying each step to both sides. A linear equation has one solution: collect unknowns on one side, constants on the other, divide by the coefficient. Two unknowns need two independent equations; substitute one into the other. Inequalities follow the same steps, reversing the sign whenever both sides are multiplied or divided by a negative; their solutions are ranges, with 'at least' meaning ≥ and 'more than' meaning >, and whole-number answers are rounded in the direction the inequality demands.",
        intuition:
          "Do the same thing to both sides. Spread a multiplier over everything in the bracket. Cancel only things that multiply the whole top and the whole bottom. When you divide an inequality by a negative, flip it. Check by substituting the answer back.",
        deep:
          "The rules are consequences of the field axioms of the real numbers: commutativity, associativity, distributivity and the existence of inverses. Cancellation is division by a common factor, which is why it needs the factor to divide the entire numerator and denominator, and why (x² − 9)/(x − 3) equals x + 3 only for x ≠ 3, where the division is defined. The inequality reversal follows from the order axioms: if a < b and c < 0 then b − a > 0 and −c > 0, so their product −c(b − a) = ac − bc is positive, giving ac > bc. A system of linear equations has one solution, none (parallel lines; an inconsistent statement such as 0 = 5 appears) or infinitely many (the same line twice); in matrix language, the question is whether the coefficient matrix is invertible.",
      },
      structure: [
        { term: "Order of operations", meaning: "Brackets, powers, × and ÷ left to right, + and − left to right" },
        { term: "Distributive law", meaning: "a(b + c) = ab + ac; forwards expands, backwards factorises" },
        { term: "Cancellation", meaning: "Only common factors of the whole numerator and denominator" },
        { term: "Making a subject", meaning: "Undo the operations around the variable in reverse order, on both sides" },
        { term: "Inequality reversal", meaning: "Multiplying or dividing both sides by a negative reverses the sign" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Two gyms",
      problem: "Gym A charges £30 a month with no joining fee. Gym B charges £18 a month plus a £96 joining fee. From which month is B the cheaper choice overall?",
      steps: [
        { text: "Name the unknown: m months of membership. Cost of A: 30m. Cost of B: 96 + 18m.", note: "Both are linear in m: a fixed part plus a rate times the usage." },
        { text: "B is cheaper when 96 + 18m < 30m." },
        { text: "Collect the m terms by subtracting 18m from both sides: 96 < 12m.", note: "Subtracting keeps the direction of the inequality." },
        { text: "Divide both sides by 12, a positive number, so the direction stays: 8 < m, that is, m > 8." },
        { text: "Interpret: at exactly 8 months both cost £240; B is cheaper from the ninth month. Check m = 9: A £270, B £258." },
      ],
      answer: "From month 9 onwards (the two tie at 8 months).",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Write down which rule each step uses: order of operations, distribution, or cancellation of a factor. The moment you cannot name the rule, stop and look again.",
      itemIds: it(14, 13),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(17, 50, 19),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why (x² − 9)/(x − 3) simplifies to x + 3 and not x − 3, and why dividing an inequality by −3 reverses its direction.",
      keyPoints: ["factor", "(x − 3)(x + 3)", "cancel", "negative", "reverse"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A physics formula to rearrange before any numbers go in, and a budget constraint that must be rounded in the right direction.",
      itemIds: it(15, 20),
    },
  ],
});

const exponentsAndLogs = lesson({
  id: "ls-qf-algebra-2",
  moduleId: "qf-algebra",
  conceptIds: ["exponents-and-logarithms"],
  title: "Exponents, logarithms and doubling",
  promise: "You will compute a doubling time in one line, read a logarithmic chart correctly, and stop believing that 2⁻³ is negative.",
  minutes: 25,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A weed on a pond doubles the area it covers every day and covers the whole pond on day 30. On which day did it cover half the pond? And a quarter?",
      thinkSeconds: 30,
      reveal:
        "Day 29, and day 28. Doubling means the last step is as large as all the previous steps together, so half the pond appeared on the final day. People who answer 'day 15' are dividing linearly a process that multiplies; that instinct is the one this lesson retrains.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Processes that multiply",
      body: {
        standard:
          "Exponents describe processes that multiply: interest on interest, cells dividing, a rumour in which each teller tells two more, a drug concentration halving every few hours. Such processes look slow, then sudden, because each step is proportional to the current size. Logarithms are the tool for asking questions about them in reverse, 'how many doublings?', 'how long until?', and for drawing them so that equal factors look like equal steps. Once a quantity is measured in logarithms, multiplication becomes addition and a growth rate becomes a slope, which is why finance, epidemiology, acoustics and seismology all keep logarithmic scales.",
        intuition: "An exponent counts how many times you multiply. A logarithm counts how many multiplications it took. Everything else is bookkeeping.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Rules, logarithms and doubling time",
      body: {
        standard:
          "Rules of exponents: a^m × a^n = a^(m+n); (a^m)^n = a^(mn); a^(−n) = 1/a^n; a^0 = 1; a^(1/n) is the nth root. A logarithm answers 'to what power?': log_b(x) = y means b^y = x, so log₁₀ 1000 = 3 and log₁₀ 0.01 = −2. Rules: log(ab) = log a + log b; log(a/b) = log a − log b; log(a^n) = n log a; there is no rule for log(a + b). To solve (1 + r)^n = 2, take logarithms of both sides: n = ln 2 / ln(1 + r). For small r this is close to 0.693/r, which becomes the rule of 70: doubling time ≈ 70 ÷ the percentage rate. Decay works identically with a multiplier below one; a half-life h means the fraction remaining after time t is (1/2)^(t/h).",
        intuition:
          "Doubling time is 'how many multiplications by 1.06 make a 2?', and a logarithm answers that in one line; 70 divided by the percentage rate is the quick version. A negative exponent means a reciprocal, never a negative number. Logs turn products into sums, and nothing else.",
        deep:
          "The natural logarithm is natural because d/dx ln x = 1/x and d/dx eˣ = eˣ, so continuous growth at rate r gives e^(rt) while a discrete rate r per period gives (1 + r)^t; the expansion ln(1 + r) ≈ r − r²/2 explains why the rule of 70 (from ln 2 ≈ 0.693) is slightly optimistic at high rates and why a rule of 72 fits better between 6 % and 10 %. Logarithmic scales compress multiplicative range: decibels are 10 log₁₀ of a power ratio, earthquake magnitude is log₁₀ of amplitude, pH is −log₁₀ of hydrogen-ion concentration. On a logarithmic axis exponential growth is a straight line whose slope is the growth rate, so comparing growth rates is comparing slopes, independently of the levels.",
      },
      structure: [
        { term: "Exponent rules", meaning: "a^m a^n = a^(m+n); (a^m)^n = a^(mn); a^(−n) = 1/a^n" },
        { term: "Logarithm", meaning: "log_b x is the power to which b must be raised to give x" },
        { term: "Log rules", meaning: "log(ab) = log a + log b; log(a^n) = n log a; no rule for log(a + b)" },
        { term: "Doubling time", meaning: "ln 2 / ln(1 + r), approximately 70 ÷ (rate in %)" },
        { term: "Half-life", meaning: "Fraction remaining after time t is (1/2)^(t/h)" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Inflation at 8 %",
      problem: "Prices rise 8 % a year. How long until they double, and what will £100 buy in five years, measured in today's goods?",
      steps: [
        { text: "Doubling: 1.08ⁿ = 2. Take natural logarithms of both sides: n ln 1.08 = ln 2.", note: "The exponent comes down as a multiplier; that is what log(a^n) = n log a does." },
        { text: "ln 2 = 0.6931 and ln 1.08 = 0.0770, so n = 0.6931 / 0.0770 ≈ 9.0 years. Rule of 70: 70 / 8 = 8.75 years, close." },
        { text: "Purchasing power after five years: prices are × 1.08⁵ = 1.469, so £100 buys what £100 / 1.469 = £68.06 buys today.", note: "Divide by the multiplier. Subtracting 5 × 8 % = 40 % would give £60 and overstate the loss." },
        { text: "Sanity check: five years is a little over half a doubling time, so prices should be somewhat under 1.5 times today's. 1.469 fits." },
      ],
      answer: "About 9 years to double; in five years £100 will buy what about £68 buys today.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Before each item say which rule applies. If it is a suspected identity, test it with a = b = 10 before trusting it.",
      itemIds: it(23, 22),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(21, 51),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague why an investment at 6 % does not take 16.7 years to double, how to find the true time, and why a chart with a logarithmic axis shows exponential growth as a straight line.",
      keyPoints: ["compound", "logarithm", "ln 2", "rule of 70", "straight line", "constant ratio"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "Two places where the base-ten logarithm hides in plain sight: an earthquake scale and an epidemic chart.",
      itemIds: it(9, 52),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* qf-functions                                                         */
/* ------------------------------------------------------------------ */

const readingGrowth = lesson({
  id: "ls-qf-functions-1",
  moduleId: "qf-functions",
  conceptIds: ["functions-and-graphs", "linear-vs-exponential-growth", "rates-of-change"],
  title: "Reading growth: levels, rates and curves",
  promise: "You will tell linear from exponential growth in four data points, and never again read 'growth slows' as 'falls'.",
  minutes: 25,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A headline reads: 'House price growth slows for the third month in a row.' A friend concludes that houses are getting cheaper. Is the friend right? What would the headline have to say for them to be right?",
      thinkSeconds: 30,
      reveal:
        "Not right. Growth is a rate; 'slowing growth' means prices are rising more slowly, not falling. For prices to be falling the headline would need 'house prices fall' or 'growth turns negative'. The habit to build is to ask of every number whether it is a level, a rate of change, or a change in the rate.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Three shapes carry most of the news",
      body: {
        standard:
          "A function is a rule connecting an input to an output, and its graph makes the rule's shape visible: rising or falling, straight or curving, flattening or steepening. Three shapes carry most of the information in the world's charts. A straight line adds the same amount each step. An exponential multiplies by the same factor each step, and looks harmless for a long time before it does not. And the slope of any curve is a rate, which can fall while the curve keeps rising. Journalists, politicians and dashboards constantly report rates as if they were levels and levels as if they were rates; the reader who keeps the two apart is hard to mislead.",
        intuition: "Height of the curve: the level. Steepness: the rate. Whether the steepness is growing or shrinking: the change in the rate. Most misreadings confuse two of these three.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Slope, ratio and the level–rate distinction",
      body: {
        standard:
          "Notation: f(x) is the output at input x; f(g(x)) applies g first. A straight line y = mx + c has slope m (the change in y per unit x) and intercept c (the value at x = 0). The average rate of change between two points is the change in output divided by the change in input, in output units per input unit, with the time converted before dividing. To classify a series: constant differences mean linear, constant ratios mean exponential. Exponential growth at rate r for n periods multiplies by (1 + r)ⁿ, which exceeds 1 + nr by the growth on growth. On a logarithmic axis exponential growth is a straight line. A falling rate that is still positive means the quantity still rises and the curve flattens; only a negative rate means the quantity falls.",
        intuition: "Differences constant? Linear. Ratios constant? Exponential. Slope is the rate; height is the level. Flattening means the rate is dropping, not the level.",
        deep:
          "Linear and exponential growth are the solutions of the two simplest difference equations, x_{n+1} = x_n + d and x_{n+1} = r x_n, with continuous versions dx/dt = k and dx/dt = kx. The second says the rate is proportional to the level, which is why it appears wherever growth feeds on itself: populations, compound interest, early epidemics, chain reactions. Logistic growth, dx/dt = kx(1 − x/K), begins exponentially and flattens as it approaches a capacity K; most real exponentials are early logistics. A time series can be tested by fitting log x against time (a straight line means exponential) or x against time (a straight line means linear); the pattern of the residuals says which fits, and over a long enough horizon usually neither does.",
      },
      structure: [
        { term: "Slope and intercept", meaning: "In y = mx + c, m is the rate per unit x and c the value at x = 0" },
        { term: "Average rate of change", meaning: "Δoutput ÷ Δinput, in output units per input unit" },
        { term: "Linear series", meaning: "Constant differences between successive values" },
        { term: "Exponential series", meaning: "Constant ratios; × (1 + r)ⁿ after n periods" },
        { term: "Level versus rate", meaning: "A falling positive rate means a rising, flattening level" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Four quarters of subscribers",
      problem: "A service's subscribers at the end of four successive quarters were 1,200, 1,440, 1,728 and 2,074. Predict the fifth quarter, and say what a linear extrapolation would have predicted.",
      steps: [
        { text: "Differences: 240, 288, 346. Not constant, and growing, so the series is not linear." },
        { text: "Ratios: 1,440 / 1,200 = 1.20; 1,728 / 1,440 = 1.20; 2,074 / 1,728 = 1.20. Constant, so the series is exponential at 20 % a quarter.", note: "2,073.6 has been rounded in the data; a ratio of 1.2002 is a rounding artefact, not a change in trend." },
        { text: "Prediction: 2,074 × 1.2 ≈ 2,489." },
        { text: "A linear extrapolation from the last difference would give 2,074 + 346 = 2,420; from the average difference (291), 2,365. Both undershoot, and the undershoot grows every quarter." },
        { text: "State the caveat: 20 % a quarter is 1.2⁴ ≈ 2.07, so 107 % a year. Nothing grows like that for long; the model describes the recent past and is a poor guide beyond a few quarters." },
      ],
      answer: "About 2,490 subscribers; a linear extrapolation would say about 2,420.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For each item ask first: is this a level, a rate, or a change in a rate? For a series, compute differences and ratios before choosing a model.",
      itemIds: it(27, 29),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(30, 28),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain the difference between a level and a rate using inflation as the example, and describe how you would tell from four data points whether a quantity is growing linearly or exponentially.",
      keyPoints: ["level", "rate", "still rising", "differences", "ratios", "constant"],
      minWords: 70,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A news sentence about inflation and a chart of cumulative cases: both hide a rate inside a level.",
      itemIds: it(31, 54),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* qf-geometry                                                          */
/* ------------------------------------------------------------------ */

const scale = lesson({
  id: "ls-qf-geometry-1",
  moduleId: "qf-geometry",
  conceptIds: ["geometry-and-scale"],
  title: "Why size changes everything",
  promise: "You will know why the larger pizza is the bargain, why a 1 : 50 model's floor is 2,500 times smaller, and why elephants need thick legs.",
  minutes: 20,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A pizzeria sells a 9-inch pizza for £8 and a 12-inch for £12. Which is the better value per unit of pizza, and by roughly how much?",
      thinkSeconds: 45,
      reveal:
        "The 12-inch. Area goes with the square of the diameter: (12/9)² = 1.78, so the larger pizza has 78 % more pizza for 50 % more money, about 16 % cheaper per unit area. Anyone who compared 9 with 12 and 8 with 12 scaled an area as if it were a length.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Three exponents",
      body: {
        standard:
          "Lengths, areas and volumes do not scale together. Double every length of an object and its surfaces grow four times, its volume and mass eight times. This is not a curiosity: it decides why an ant can lift many times its weight and an elephant cannot, why large animals live in cold places, why a model that looks right may be structurally impossible at full size, why a tank holds far more than its diameter suggests, and why 'twice as big' means nothing until someone says in what. Map scales, unit conversions of area and volume, and dosing by body mass all rest on the same three exponents: 1, 2 and 3.",
        intuition: "Lengths × k, areas × k², volumes × k³. Decide which of the three a quantity is before you scale it, and the rest is arithmetic.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Scale factors, formulae and units",
      body: {
        standard:
          "A scale factor k for lengths gives k² for areas and k³ for volumes. Unit conversions follow the same pattern: 1 m = 100 cm, so 1 m² = 10,000 cm² and 1 m³ = 1,000,000 cm³ = 1,000 L. Circle: circumference 2πr, area πr², using the radius (half the diameter). Cylinder volume πr²h; sphere volume (4/3)πr³ and surface 4πr². A map scale 1 : n means one map unit is n real units in length, and n² in area. The surface-to-volume ratio falls as 1/k with size, so large objects retain heat and small ones exchange it quickly. Similar shapes share the same ratios, which is what makes scale factors valid at all.",
        intuition: "A map's scale number is for lengths; square it for areas. A circle's formula wants the radius, not the diameter. Big things have less surface for their size.",
        deep:
          "The square–cube law follows from dimensional homogeneity: area has dimension L² and volume L³, so under a similarity transformation x → kx they scale by the matching powers of k. Galileo used it in 1638 to argue that bones must thicken faster than they lengthen, since strength goes with cross-sectional area (k²) and weight with volume (k³); the ratio falls as 1/k, which caps the size of land animals and of buildings in a given material. Kleiber's law, metabolic rate ∝ mass^(3/4), departs from the naive surface prediction of mass^(2/3), and the reasons remain debated; the naive argument is the right starting point and the wrong ending. In fractal geometry the exponent need not be an integer, which is why a coastline's measured length depends on the length of the ruler.",
      },
      structure: [
        { term: "Scale factor", meaning: "Lengths × k, areas × k², volumes × k³" },
        { term: "Area and volume units", meaning: "1 m² = 10,000 cm²; 1 m³ = 1,000 L" },
        { term: "Circle and cylinder", meaning: "Area πr²; volume πr²h; r is half the diameter" },
        { term: "Map scale", meaning: "1 : n scales lengths by n and areas by n²" },
        { term: "Surface-to-volume", meaning: "Falls as 1/k; large bodies keep heat, small ones lose it" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "A model railway",
      problem: "A model railway is built at 1 : 76. A real carriage is 20 m long, and a real station car park covers 2,000 m². What are the model's carriage length in centimetres and its car park area in square centimetres?",
      steps: [
        { text: "Length: divide by 76. 20 m ÷ 76 = 0.263 m = 26.3 cm.", note: "One factor of the scale, because a length has been shrunk in one direction." },
        { text: "Area: divide by 76² = 5,776. 2,000 m² ÷ 5,776 = 0.346 m².", note: "Two factors, because the car park has been shrunk in two directions." },
        { text: "Convert the area unit: 1 m² = 10,000 cm², so 0.346 m² = 3,463 cm², about 59 cm by 59 cm." },
        { text: "Sanity check: 2,000 m² is roughly a 45 m square; 45 m ÷ 76 = 0.59 m per side. Consistent." },
      ],
      answer: "Carriage 26.3 cm; car park about 3,460 cm² (roughly 59 cm × 59 cm).",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Before computing, write next to each quantity whether it is a length, an area or a volume. That decides which power of the scale factor and which unit conversion apply.",
      itemIds: it(34, 32),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(53, 11),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why a 1 : 50 model's floor area is not 50 times smaller than the real one, and why a large animal keeps warm more easily than a small one.",
      keyPoints: ["square", "2,500", "cube", "surface", "volume", "ratio"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "The same exponents, in biology.",
      itemIds: it(33),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* fm-calculus                                                          */
/* ------------------------------------------------------------------ */

const ratesAndTotals = lesson({
  id: "ls-fm-calculus-1",
  moduleId: "fm-calculus",
  conceptIds: ["derivative-intuition", "integral-intuition", "optimisation"],
  title: "Rates and totals: what calculus is for",
  promise: "You will see the derivative as a speedometer and the integral as an odometer, and use both without a symbol you cannot picture.",
  minutes: 30,
  difficulty: 4,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "In the last hour your car's odometer has advanced 40 km, but the speedometer now reads 50 km/h. Do the two instruments disagree? What does each one measure?",
      thinkSeconds: 45,
      reveal:
        "No disagreement. The odometer change over an hour gives an average rate, 40 km/h; the speedometer gives the instantaneous rate, the average over an interval so short that the speed has no time to change. The derivative is the speedometer; the integral is the odometer. Calculus is the pair of tools that connect them.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Two questions that recur everywhere",
      body: {
        standard:
          "Two questions recur in every quantitative field. Given a quantity, how fast is it changing right now? Given a rate, how much has accumulated? The first is the derivative, the slope of the curve at a point; the second is the integral, the area under the rate. Economists call the derivative 'marginal', physicists call it velocity, epidemiologists plot it as daily cases beside a cumulative total. Optimisation is the derivative's most useful trick: a quantity is largest or smallest where its rate of change is zero, because at a peak it has stopped rising and not yet begun to fall. None of this needs symbolic fluency to be useful; it needs the pictures.",
        intuition: "Derivative: how fast right now. Integral: how much so far. Peak or trough: the 'how fast' is zero. Three pictures, one subject.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Derivative, integral, fundamental theorem",
      body: {
        standard:
          "Derivative: the instantaneous rate of change f′(x), the limit of the average rate [f(x + h) − f(x)]/h as h shrinks; geometrically the slope of the tangent. Power rule: d/dx xⁿ = n xⁿ⁻¹; constants differentiate to zero; sums differentiate term by term. The sign of f′ gives the direction of change; f′ = 0 marks a stationary point (maximum, minimum or plateau). Integral: the accumulated quantity ∫ rate dt, the signed area under the rate's graph; a constant rate gives a rectangle, a uniformly changing rate a triangle. Fundamental theorem: the integral of f′ from a to b equals f(b) − f(a); differentiation and integration undo each other. Optimisation: write the target as a function of one variable using the constraint, set the derivative to zero, check the candidates and the boundary. Marginal cost is C′(q); average cost is C(q)/q; they differ.",
        intuition: "Slope at a point is the derivative. Area under the rate is the integral. The rate of the total is the marginal; the total of the rate is the accumulation. Where the slope is zero, look for a best or worst.",
        deep:
          "The limit definition f′(x) = lim_{h→0} [f(x + h) − f(x)]/h is where 'shrinking interval' becomes precise; for f(x) = x² the difference quotient is 2x + h, whose limit 2x is exact. The definite integral is a limit of Riemann sums Σ f(tᵢ) Δt as the strips narrow, which is why area under a rate is accumulated quantity: each strip is rate × short time. The fundamental theorem links the two: the derivative of the accumulated area A(x) = ∫ₐˣ f is f(x) itself, because one more thin strip of height f(x) and width h changes A by about f(x)h. Second derivatives carry curvature: f″ > 0 at a stationary point means a minimum. In several variables the gradient replaces f′, and gradient descent, which trains most machine-learning models, is 'step downhill along the derivative', repeated.",
      },
      structure: [
        { term: "Derivative", meaning: "Instantaneous rate; slope of the tangent; limit of average rates" },
        { term: "Power rule", meaning: "d/dx xⁿ = n xⁿ⁻¹; constants → 0" },
        { term: "Integral", meaning: "Accumulated quantity; signed area under the rate" },
        { term: "Fundamental theorem", meaning: "∫ₐᵇ f′ = f(b) − f(a)" },
        { term: "Stationary point", meaning: "f′ = 0: maximum, minimum or plateau" },
        { term: "Marginal versus average", meaning: "C′(q) versus C(q)/q" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "x² at x = 3, both ways",
      problem: "Let f(x) = x². Find the rate of change of f at x = 3 by shrinking an interval, confirm it with the power rule, and then use the rate function to recover f(3) by accumulation.",
      steps: [
        { text: "Average rate over [3, 3.1]: (3.1² − 3²) / 0.1 = (9.61 − 9) / 0.1 = 6.1." },
        { text: "Over [3, 3.01]: (9.0601 − 9) / 0.01 = 6.01. Over [3, 3.001]: 6.001. The averages close in on 6.", note: "Algebraically the quotient is (6h + h²) / h = 6 + h, which tends to 6 as h → 0." },
        { text: "Power rule: f′(x) = 2x, so f′(3) = 6. Agreement." },
        { text: "Accumulate the rate from 0 to 3: the graph of 2x is a straight line from (0, 0) to (3, 6); the area under it is a triangle, ½ × 3 × 6 = 9." },
        { text: "9 = 3² = f(3) − f(0): the accumulated rate returns the original quantity. That is the fundamental theorem in one picture." },
      ],
      answer: "f′(3) = 6; the area under 2x from 0 to 3 is 9 = f(3).",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Before each item decide which of the two questions it asks: 'how fast right now' (differentiate) or 'how much in total' (find the area). Then draw the graph, even roughly.",
      itemIds: it(36, 37),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(47, 57),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to an economist colleague why marginal cost is a derivative and not an average, and to a runner why the area under a speed–time graph is the distance run.",
      keyPoints: ["derivative", "one more unit", "average", "area", "rate times time", "slope"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A chart of cumulative cases, read through the derivative.",
      itemIds: it(54),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* fm-linear                                                            */
/* ------------------------------------------------------------------ */

const vectorsAndMatrices = lesson({
  id: "ls-fm-linear-1",
  moduleId: "fm-linear",
  conceptIds: ["vectors-and-matrices", "linear-transformations"],
  title: "Vectors, matrices and what they do to space",
  promise: "You will read a 2 × 2 matrix as a motion of the plane and know what its determinant is telling you.",
  minutes: 25,
  difficulty: 4,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "Two shops price apples and pears per kilogram: shop 1 at (1.20, 0.90), shop 2 at (1.00, 1.10). You want 3 kg of apples and 2 kg of pears. Which shop is cheaper, and what operation did you perform to decide?",
      thinkSeconds: 45,
      reveal:
        "Shop 2: 3 × 1.20 + 2 × 0.90 = £5.40 against 3 × 1.00 + 2 × 1.10 = £5.20. Each total is a dot product of a price vector with the basket vector (3, 2); stacking the two price vectors as rows gives a matrix, and multiplying it by the basket gives both totals at once. That is all matrix multiplication is: many dot products, organised.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Lists that belong together, and machines that act on them",
      body: {
        standard:
          "Vectors are lists of numbers that belong together: a basket of quantities, a point in space, a portfolio's weights, a pixel's colours. Matrices are machines that turn one vector into another using only weighted sums, and almost every large computation, from solving a system of equations to rendering a game to running a neural network, is such a machine applied many times. The reason they matter beyond bookkeeping is geometric: a matrix moves every point in space in a way that keeps lines straight and the origin fixed, and reading it as a rotation, stretch, shear or collapse tells you what the numbers will do before you compute anything.",
        intuition: "A vector is a list. A matrix is a recipe for weighted sums of that list. Its columns say where the axes go, and where the axes go, everything goes.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Dot products, columns and the determinant",
      body: {
        standard:
          "Vector addition and scaling are component-wise. Dot product: a · b = Σ aᵢbᵢ, a measure of alignment, zero when the vectors are perpendicular. Matrix times vector: each output component is the dot product of a row with the vector, so an m × n matrix takes n-vectors to m-vectors. Matrix product AB: rows of A against columns of B, defined only when A's width equals B's height, and not commutative. The columns of a matrix are the images of the basis vectors, which fixes the whole transformation: [[0, −1], [1, 0]] sends (1, 0) to (0, 1) and (0, 1) to (−1, 0), a 90° anticlockwise rotation. The determinant is the area (or volume) scaling factor; a negative determinant flips orientation; zero means a dimension has collapsed and the matrix cannot be inverted. Composing transformations multiplies matrices, with the rightmost applied first.",
        intuition: "Rows against the vector, product by product, then add. Columns show where (1, 0) and (0, 1) land; follow the axes and you know the transformation. The determinant says how much area is multiplied by.",
        deep:
          "Linearity, T(au + bv) = aT(u) + bT(v), is the whole content: a linear map is determined by its values on a basis, which is why columns encode it and why changing basis changes the matrix but not the map. Eigenvectors are directions the map merely scales, Tv = λv; a symmetric matrix has a full set of orthogonal ones, which underlies principal component analysis and the spectral decomposition. The determinant is the unique alternating multilinear function of the columns with det I = 1, which is what makes it the volume factor. Ax = b is solvable uniquely exactly when det A ≠ 0; Gaussian elimination is the practical route, costing on the order of n³ operations. Attention in a transformer is a matrix of dot products between query and key vectors, passed through a softmax and applied to value vectors: linear algebra with one nonlinearity.",
      },
      structure: [
        { term: "Dot product", meaning: "Σ aᵢbᵢ; zero when perpendicular" },
        { term: "Matrix × vector", meaning: "Each output component is a row dotted with the vector" },
        { term: "Columns", meaning: "Images of the basis vectors; they determine the map" },
        { term: "Determinant", meaning: "Area scaling factor; sign flips orientation; zero collapses a dimension" },
        { term: "Composition", meaning: "Multiply matrices; the rightmost transformation is applied first" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Reading a shear",
      problem: "Describe what the matrix S = [[1, 1], [0, 1]] (rows listed first) does to the plane, and by what factor it scales area.",
      steps: [
        { text: "Image of (1, 0): the first column, (1, 0). The x-axis is fixed." },
        { text: "Image of (0, 1): the second column, (1, 1). The top-left corner of the unit square slides one unit to the right." },
        { text: "The unit square with corners (0, 0), (1, 0), (1, 1), (0, 1) becomes the parallelogram (0, 0), (1, 0), (2, 1), (1, 1): a horizontal shear, each point moving right in proportion to its height." },
        { text: "Determinant: 1 × 1 − 1 × 0 = 1. Area is preserved, which the parallelogram confirms: base 1, height 1.", note: "A shear tilts without stretching; its determinant is always 1." },
        { text: "Check with a point: (2, 3) → (1 × 2 + 1 × 3, 0 × 2 + 1 × 3) = (5, 3). Same height, moved right by 3, its own height." },
      ],
      answer: "A horizontal shear that moves each point right by its y-coordinate; area factor 1.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Line up the components, write every product with its sign, and only then add. For a matrix, use rows against the vector, one row per output component.",
      itemIds: it(38),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(39),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain how to read a 2 × 2 matrix as a transformation of the plane, and what its determinant tells you.",
      keyPoints: ["columns", "basis", "(1, 0)", "determinant", "area", "orientation"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "Read a matrix as a motion, not as a table.",
      itemIds: it(40),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* fm-discrete                                                          */
/* ------------------------------------------------------------------ */

const counting = lesson({
  id: "ls-fm-discrete-1",
  moduleId: "fm-discrete",
  conceptIds: ["sets-and-counting", "graphs-and-networks-math"],
  title: "Counting without listing",
  promise: "You will count committees, PINs, lottery outcomes and handshakes by structure rather than enumeration, and know when to divide.",
  minutes: 20,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt: "A café offers 4 starters, 6 mains and 3 desserts. How many different three-course meals are there? How many if the starter may be skipped?",
      thinkSeconds: 30,
      reveal:
        "4 × 6 × 3 = 72, and 5 × 6 × 3 = 90 once 'no starter' is a fifth option. Independent choices multiply; adding 4 + 6 + 3 = 13 counts the dishes, not the meals. Every counting problem is a decision about what gets multiplied, what gets divided out, and what has been counted twice.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "The arithmetic of possibility",
      body: {
        standard:
          "Counting is the arithmetic of possibility. It answers how many passwords, committees, routes, hands or configurations exist, which is the denominator of every probability and the size of every search. Listing is impossible past a few dozen cases, so counting works by structure: multiply independent choices, divide out orderings you did not want, subtract overlaps you counted twice. The two questions to ask first, 'does order matter?' and 'can items repeat?', settle which formula applies. Graphs, networks of nodes and edges, are counted with the same tools: the handshake lemma is nothing more than counting every edge from both of its ends.",
        intuition: "Multiply choices. If order does not matter, divide by the orderings. If two sets overlap, subtract the overlap once. If 'at least one' is hard, count 'none' and subtract.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Multiply, divide, subtract",
      body: {
        standard:
          "Multiplication principle: a sequence of independent choices with n₁, n₂, … options has n₁ × n₂ × … outcomes. Permutations: ordered selections of k from n without repetition, n × (n − 1) × … × (n − k + 1) = n! / (n − k)!. Combinations: unordered selections, C(n, k) = n! / (k!(n − k)!), the permutations divided by the k! orderings of each selection. With repetition allowed, k ordered choices from n give nᵏ. Inclusion–exclusion: |A ∪ B| = |A| + |B| − |A ∩ B|. Complements: 'at least one' is usually total minus 'none'. In a graph the sum of the degrees is twice the number of edges, and a complete graph on n nodes has C(n, 2) edges.",
        intuition: "Order matters and no repeats: shrinking product. Order does not matter: divide that product by k!. Repeats allowed: a power. Two overlapping groups: add, then subtract the overlap.",
        deep:
          "C(n, k) counts subsets, and Pascal's rule C(n, k) = C(n − 1, k − 1) + C(n − 1, k) comes from asking whether one particular element is in the subset; the binomial theorem (a + b)ⁿ = Σ C(n, k) aᵏ bⁿ⁻ᵏ is the same count read off an expansion. Stirling's approximation n! ≈ √(2πn)(n/e)ⁿ makes factorials tractable and underlies entropy in statistical mechanics, where counting microstates is the whole game. Inclusion–exclusion generalises to any number of sets with alternating signs, and its probabilistic form gives the union bound. Counting arguments are also proofs: the pigeonhole principle and double counting establish existence and identities without constructing anything, which is why combinatorics sits beside proof in this course.",
      },
      structure: [
        { term: "Multiplication principle", meaning: "Independent choices multiply" },
        { term: "Permutation", meaning: "Ordered, no repeats: n! / (n − k)!" },
        { term: "Combination", meaning: "Unordered: C(n, k) = n! / (k!(n − k)!)" },
        { term: "Inclusion–exclusion", meaning: "|A ∪ B| = |A| + |B| − |A ∩ B|" },
        { term: "Handshake lemma", meaning: "Sum of degrees = 2 × number of edges" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Six numbers from forty-nine",
      problem: "A lottery draws 6 numbers from 49 without replacement, and the order of the draw does not matter. How many different outcomes are there?",
      steps: [
        { text: "Order does not matter and numbers do not repeat: a combination, C(49, 6)." },
        { text: "Count ordered draws first: 49 × 48 × 47 × 46 × 45 × 44 = 10,068,347,520." },
        { text: "Each set of six numbers appears 6! = 720 times among the ordered draws, once per ordering. Divide: 10,068,347,520 ÷ 720 = 13,983,816." },
        { text: "Sanity check by orders of magnitude: 49⁶ / 720 ≈ 1.4 × 10¹⁰ / 7.2 × 10² ≈ 2 × 10⁷; the exact figure, 1.4 × 10⁷, is the right size.", note: "The estimate runs high because 49⁶ ignores 'no repeats'; the direction of the error is predictable." },
        { text: "A single ticket therefore wins the jackpot with probability 1 in 13,983,816: counting is the denominator of the probability." },
      ],
      answer: "13,983,816 outcomes.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Ask the two questions, does order matter and can items repeat, and write the answers down before touching any formula.",
      itemIds: it(41),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(55, 45),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why 12 × 11 × 10 over-counts committees of three, what to divide by and why, and how the handshake lemma gives the number of edges in a network from its degrees.",
      keyPoints: ["order", "3!", "divide", "6", "degree", "twice"],
      minWords: 60,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A social gathering as a complete graph.",
      itemIds: it(56),
    },
  ],
});

export const MATHEMATICS_LESSONS: Lesson[] = [percentages, magnitudesAndUnits, keepingEquationsHonest, exponentsAndLogs, readingGrowth, scale, ratesAndTotals, vectorsAndMatrices, counting];
