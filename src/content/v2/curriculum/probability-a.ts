/**
 * Probability — concepts (part A of the probability domain).
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Probability sits just downstream of arithmetic and algebra, and just upstream of statistics,
 * decision science and finance. `dependsOn` records the prerequisites that would actually block
 * a learner; `related` records the neighbours worth connecting once the concept is held.
 */
import type { Concept } from "@/lib/v2/content-types";

type Draft = Omit<Concept, "domainId" | "courseId" | "moduleId">;

const CORE = "probability-core";

function concept(moduleId: string, draft: Draft): Concept {
  return { domainId: "probability", courseId: CORE, moduleId, ...draft };
}

/* ------------------------------------------------------------------ */
/* Randomness and counting                                              */
/* ------------------------------------------------------------------ */

const randomness: Concept[] = [
  concept("pr-randomness", {
    id: "randomness-and-sample-spaces",
    title: "Randomness and sample spaces",
    summary:
      "A probability is a share of a well-defined set of possible outcomes, the sample space. Most beginner errors are not arithmetic but a sample space that was never written down, or one whose outcomes are not equally likely.",
    keyPoints: [
      "A sample space lists every outcome of a random process exactly once; an event is a subset of it.",
      "Probabilities are numbers from 0 to 1 that sum to 1 across the whole sample space.",
      "'Favourable over total' is valid only when the outcomes counted are equally likely; two dice give 36 ordered pairs, not eleven equally likely sums.",
      "Probability can be read as long-run frequency (what a fair die does over many rolls) or as degree of belief (how confident a forecaster is); the arithmetic is the same.",
      "Randomness means unpredictability of the single case, not absence of pattern in the aggregate.",
    ],
    dependsOn: ["fractions-ratios-percentages"],
    related: ["sets-and-counting", "combinatorics", "forecasting-and-calibration", "descriptive-statistics"],
    recallPrompts: [
      { prompt: "Two fair dice are rolled. How many equally likely outcomes are in the sample space, and why not eleven?", answer: "36 ordered pairs. The eleven possible sums are not equally likely: a 7 arises from six pairs, a 2 from one.", accept: ["36"] },
      { prompt: "What two conditions make 'favourable outcomes divided by total outcomes' a valid probability?", answer: "The outcomes must cover the whole sample space exactly once, and they must be equally likely." },
      { prompt: "State the two readings of the sentence 'the probability of rain tomorrow is 30 %'.", answer: "Frequency: on days like this it rains about 3 times in 10. Belief: the forecaster's confidence, to be judged by calibration over many forecasts." },
    ],
    applications: ["Setting up a game, lottery or raffle so the odds are what they claim", "Reading a forecast probability as a calibrated belief rather than a promise", "Checking whether a 'random' sample really gave every unit an equal chance"],
    misconception: "That outcomes which look alike are equally likely. A sum of 7 and a sum of 2 on two dice are both 'one outcome' to the eye, but one is six times as probable as the other.",
    difficulty: 1,
    foundational: true,
    tags: ["foundations", "sample-space"],
  }),
  concept("pr-randomness", {
    id: "probability-rules",
    title: "The rules of probability",
    summary:
      "Three rules generate almost everything: the complement rule, the addition rule for 'or', and the multiplication rule for 'and'. Knowing when each rule needs a correction (overlap for 'or', dependence for 'and') is the whole skill.",
    keyPoints: [
      "Complement: P(not A) = 1 − P(A). 'At least one' is nearly always easier as 1 − P(none).",
      "Addition: P(A or B) = P(A) + P(B) − P(A and B); the subtraction disappears only when A and B cannot both happen.",
      "Multiplication: P(A and B) = P(A) × P(B | A); this collapses to P(A) × P(B) only when the events are independent.",
      "A probability greater than 1 or less than 0 is a certain sign that the wrong rule was applied, usually addition where overlap exists.",
      "A two-way table or a tree diagram turns every rule into counting; draw one before trusting a formula.",
    ],
    dependsOn: ["randomness-and-sample-spaces", "fractions-ratios-percentages"],
    related: ["sets-and-counting", "propositional-logic", "conditional-probability", "independence"],
    recallPrompts: [
      { prompt: "Write the general addition rule and say when the last term can be dropped.", answer: "P(A or B) = P(A) + P(B) − P(A and B); the last term is zero when A and B are mutually exclusive.", accept: ["P(A)+P(B)-P(A and B)", "P(A) + P(B) − P(A∩B)"] },
      { prompt: "Why is 'at least one six in four rolls' not 4 × 1/6?", answer: "The four events overlap (two sixes are possible), so adding them over-counts; the correct route is 1 − (5/6)^4 ≈ 0.52.", accept: ["overlap", "1 - (5/6)^4", "0.52"] },
      { prompt: "When does P(A and B) = P(A) × P(B)?", answer: "Only when A and B are independent; in general the second factor is P(B | A)." },
    ],
    applications: ["Reliability of systems with several parts that can fail", "Probability that at least one of several applications, bids or tests succeeds", "Reading survey results that report overlapping categories"],
    misconception: "That 'or' always means add and 'and' always means multiply. Both are shortcuts that hold only under conditions (no overlap; independence) that must be checked, not assumed.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "rules"],
  }),
  concept("pr-randomness", {
    id: "combinatorics",
    title: "Combinatorics",
    summary:
      "Counting outcomes without listing them: the multiplication principle, permutations for ordered selections and combinations for unordered ones. In probability, counting is how equally likely outcomes get their denominators.",
    keyPoints: [
      "Multiplication principle: a sequence of choices with a, b, c options gives a × b × c outcomes.",
      "Permutations count ordered selections without repetition: P(n, k) = n!/(n − k)!; 26 × 25 × 24 × 23 four-letter codes.",
      "Combinations count unordered selections: C(n, k) = n!/(k!(n − k)!); divide the ordered count by k! to remove orderings.",
      "Two questions settle the formula: does order matter, and can items repeat?",
      "Identical items are handled by dividing by the factorial of each group of repeats: LEVEL has 5!/(2!2!) = 30 arrangements.",
      "The birthday problem shows why counting pairs, C(23, 2) = 253, beats counting people.",
    ],
    dependsOn: ["randomness-and-sample-spaces", "algebraic-manipulation"],
    related: ["sets-and-counting", "exponents-and-logarithms", "distributions", "algorithms-and-complexity"],
    recallPrompts: [
      { prompt: "How many committees of 3 can be chosen from 8 people, and why divide by 6?", answer: "56. The ordered count 8 × 7 × 6 = 336 counts each committee 3! = 6 times.", accept: ["56"] },
      { prompt: "Which two questions decide whether to use permutations, combinations or powers?", answer: "Does order matter? Can items be repeated? Order and no repetition: permutations; no order: combinations; repetition allowed: powers." },
      { prompt: "Why is the chance of a shared birthday among 23 people about a half rather than 23/365?", answer: "Because any of the C(23, 2) = 253 pairs can match, not just pairs involving one fixed person.", accept: ["253 pairs", "pairs"] },
    ],
    applications: ["Odds of poker hands, lottery draws and raffle outcomes", "Counting passwords, PINs and licence plates to judge how hard they are to guess", "Number of ways to schedule, seat or assign people"],
    misconception: "That permutations and combinations are two formulae to memorise. They are one count (ordered selections) with or without dividing out the orderings; the decision is about the problem, not the formula.",
    difficulty: 3,
    tags: ["counting"],
  }),
];

/* ------------------------------------------------------------------ */
/* Conditioning and Bayes                                               */
/* ------------------------------------------------------------------ */

const conditional: Concept[] = [
  concept("pr-conditional", {
    id: "conditional-probability",
    title: "Conditional probability",
    summary:
      "P(A | B) is the probability of A once B is known to have happened: the world shrinks to the cases where B holds, and A is measured as a share of that smaller world. Almost every applied probability question is a conditional one.",
    keyPoints: [
      "Definition: P(A | B) = P(A and B) / P(B). The denominator is the size of the condition, not the whole population.",
      "P(A | B) and P(B | A) are different numbers with different denominators; P(late | train) is 12/80, P(train | late) is 12/42.",
      "The multiplication rule follows directly: P(A and B) = P(B) × P(A | B).",
      "Drawing without replacement is conditioning: the second probability is computed after the first outcome is known.",
      "A two-way table is the fastest tool: put a finger on the conditioning row, then read the share.",
    ],
    dependsOn: ["probability-rules", "fractions-ratios-percentages"],
    related: ["conditionals-and-contrapositive", "correlation", "bayes-theorem", "confounding"],
    recallPrompts: [
      { prompt: "Define P(A | B) as a formula and in words.", answer: "P(A | B) = P(A and B)/P(B): the share of the B-cases in which A also occurs.", accept: ["P(A and B)/P(B)", "P(A∩B)/P(B)"] },
      { prompt: "Of 200 commuters, 80 took the train and 12 of those were late; 42 were late in all. Give P(late | train) and P(train | late).", answer: "P(late | train) = 12/80 = 0.15; P(train | late) = 12/42 ≈ 0.29. Different denominators, different questions.", accept: ["0.15 and 0.29", "12/80 and 12/42"] },
      { prompt: "Why is drawing two aces without replacement not (4/52)²?", answer: "After one ace is drawn the deck has changed: the second probability is conditional, 3/51, not 4/52.", accept: ["3/51"] },
    ],
    applications: ["Reading a medical test result in the light of who was tested", "Retention analysis: cancellation rate by channel versus channel share among cancellations", "Any two-way table in a report: rows and columns condition differently"],
    misconception: "That P(A | B) and P(B | A) are the same thing, or close. They share a numerator and nothing else; confusing them is the inverse-conditional fallacy that underlies most misread test results and most prosecutor's-fallacy arguments in court.",
    difficulty: 3,
    foundational: true,
    tags: ["conditioning"],
  }),
  concept("pr-conditional", {
    id: "independence",
    title: "Independence",
    summary:
      "Two events are independent when knowing one tells you nothing about the other: P(A | B) = P(A), equivalently P(A and B) = P(A)P(B). It is an assumption that makes calculation easy, and the assumption most often wrong in practice.",
    keyPoints: [
      "Independence is about information, not about physical connection: it holds exactly when learning B leaves P(A) unchanged.",
      "Mutually exclusive events with positive probability are never independent; learning one happened tells you the other did not.",
      "Under independence probabilities multiply, which is why redundancy works: two 5 % failure risks become 0.25 % together.",
      "Correlated failures (shared fuel, shared supplier, shared market) break the multiplication and are the usual reason a 'one in a million' event happens.",
      "Independent trials have no memory: after seven reds the wheel is exactly as likely to show black as before (the gambler's fallacy denies this).",
    ],
    dependsOn: ["conditional-probability"],
    related: ["correlation-vs-causation", "risk-and-diversification", "law-of-large-numbers", "financial-crises"],
    recallPrompts: [
      { prompt: "Give the definition of independence as an equation and as a sentence about information.", answer: "P(A and B) = P(A)P(B); knowing whether B happened does not change the probability of A.", accept: ["P(A and B) = P(A)P(B)", "P(A|B)=P(A)"] },
      { prompt: "Are mutually exclusive events independent?", answer: "No. If both have positive probability, P(A and B) = 0 but P(A)P(B) > 0; knowing A occurred makes B impossible.", accept: ["no"] },
      { prompt: "Two backup generators each fail with probability 0.05. What assumption makes P(both fail) = 0.0025, and what would break it?", answer: "Independence. A shared cause such as one fuel line or one maintenance contractor correlates the failures and raises the joint risk.", accept: ["independence"] },
    ],
    applications: ["Judging whether a portfolio, a supply chain or a backup system is really diversified", "Spotting the gambler's fallacy and the hot-hand belief in sport and gambling", "Reading a risk model: which independence assumptions is it quietly making?"],
    misconception: "That 'unrelated' in everyday language means independent. Events that cannot occur together are the most dependent of all, and events that seem unconnected often share a hidden common cause.",
    difficulty: 3,
    foundational: true,
    tags: ["conditioning", "independence"],
  }),
  concept("pr-conditional", {
    id: "bayes-theorem",
    title: "Bayes' theorem",
    summary:
      "Bayes' theorem reverses a conditional: from how likely the evidence is under each hypothesis, and how likely the hypotheses were beforehand, it gives how likely each hypothesis is now. It is the arithmetic of learning from evidence.",
    keyPoints: [
      "P(H | E) = P(E | H) P(H) / P(E), where P(E) = P(E | H)P(H) + P(E | not H)P(not H).",
      "Vocabulary: prior P(H), likelihood P(E | H), posterior P(H | E). The likelihood is not the answer; it is one input.",
      "Natural frequencies make it mechanical: take 10,000 cases, split by hypothesis, apply the evidence to each group, take the true share of all positives.",
      "Odds form: posterior odds = prior odds × likelihood ratio. A likelihood ratio of 8 against prior odds of 20 to 1 still leaves the base rate ahead.",
      "A 90 %-accurate test for a 1 % condition yields a positive that is right only about 1 time in 12; the false positives from the large healthy group swamp the true ones.",
      "Every update is provisional: today's posterior is tomorrow's prior.",
    ],
    dependsOn: ["conditional-probability", "algebraic-manipulation"],
    related: ["base-rates", "hypothesis-testing", "epistemology-knowledge-and-belief", "scepticism-and-justification", "machine-learning-basics"],
    recallPrompts: [
      { prompt: "State Bayes' theorem and name its three parts.", answer: "P(H | E) = P(E | H)P(H)/P(E): posterior = likelihood × prior / evidence.", accept: ["P(H|E) = P(E|H)P(H)/P(E)"] },
      { prompt: "A disease affects 1 %; a test has 90 % sensitivity and 90 % specificity. What is P(disease | positive), roughly?", answer: "About 8 %: of 10,000 people, 90 true positives and 990 false positives, so 90/1,080.", accept: ["0.083", "8%", "1 in 12", "90/1080"] },
      { prompt: "Write the odds form of Bayes' theorem.", answer: "Posterior odds = prior odds × likelihood ratio, where the likelihood ratio is P(E | H)/P(E | not H)." },
    ],
    applications: ["Interpreting screening tests, security alerts and fraud flags", "Spam filters and any classifier that combines evidence", "Weighing a witness, an expert attribution or a historical source against how common each hypothesis was"],
    misconception: "That a test's accuracy is the probability the result is right. Accuracy is P(result | truth); what the patient needs is P(truth | result), and the two can differ by an order of magnitude when the condition is rare.",
    difficulty: 4,
    foundational: true,
    tags: ["conditioning", "bayes"],
  }),
  concept("pr-conditional", {
    id: "base-rates",
    title: "Base rates",
    summary:
      "The base rate is how common something is before any specific evidence is considered: the prior in Bayes' theorem. People reliably discard it in favour of a vivid description or a confident witness, and are reliably wrong as a result.",
    keyPoints: [
      "Base-rate neglect: judging by how well a case resembles a category (representativeness) while ignoring how common the category is.",
      "In the cab problem an 80 %-reliable witness who says 'blue' is more likely wrong than right, because 85 % of cabs are green.",
      "Evidence moves the odds by a likelihood ratio; whether it overturns the base rate depends on how lopsided the base rate was.",
      "The right base rate is the frequency in the relevant reference class; choosing that class is a judgement, and a narrower class is not automatically better.",
      "Rare events plus imperfect detection means most alarms are false, whatever the detector's accuracy.",
    ],
    dependsOn: ["bayes-theorem"],
    related: ["judgment-heuristics", "cognitive-biases", "sampling-and-bias", "forecasting-and-calibration", "evidence-and-support"],
    recallPrompts: [
      { prompt: "What is base-rate neglect, and which heuristic produces it?", answer: "Ignoring how common a category is and judging by resemblance to a stereotype: the representativeness heuristic.", accept: ["representativeness"] },
      { prompt: "Farmers outnumber librarians 20 to 1; a description fits 40 % of librarians and 5 % of farmers. Farmer or librarian?", answer: "Farmer, with probability about 71 %: 20 × 0.05 = 1 farmer fits against 1 × 0.4 = 0.4 librarians.", accept: ["farmer"] },
      { prompt: "Why does a rare event produce mostly false alarms even from a good detector?", answer: "Because the small false-positive rate is applied to the large non-event group, which outnumbers the true positives from the small event group." },
    ],
    applications: ["Reading a fraud alert, a security warning or an unusual lab result", "Hiring and admissions: how much a strong interview should move a prior", "Forecasting: start from how often things like this happen before adjusting for specifics"],
    misconception: "That specific evidence trumps general statistics. Specific evidence updates the statistics; it does not replace them, and weak evidence against a strong base rate leaves the base rate mostly intact.",
    difficulty: 3,
    tags: ["bayes", "judgment"],
  }),
];

/* ------------------------------------------------------------------ */
/* Random variables                                                     */
/* ------------------------------------------------------------------ */

const variables: Concept[] = [
  concept("pr-variables", {
    id: "random-variables",
    title: "Random variables",
    summary:
      "A random variable attaches a number to each outcome, so that a random process can be summarised, added, averaged and compared. Its distribution lists the values it can take with their probabilities.",
    keyPoints: [
      "A random variable is a rule assigning a number to every outcome: the sum of two dice, the profit of a bet, the number of claims in a year.",
      "Its probability distribution gives P(X = x) for each value; the probabilities sum to 1.",
      "Discrete variables take separate values (counts); continuous ones take any value in a range (heights, times) and are described by densities.",
      "Functions of random variables are random variables: if X is demand, revenue min(X, stock) × price is one too.",
      "The distribution is the full description; a mean or a variance is a summary of it.",
    ],
    dependsOn: ["probability-rules", "functions-and-graphs"],
    related: ["descriptive-statistics", "expected-value", "distributions", "visualising-data"],
    recallPrompts: [
      { prompt: "What is a random variable?", answer: "A rule that assigns a number to each outcome of a random process; the sum of two dice, for instance." },
      { prompt: "A bet pays £35 with probability 1/37 and loses £1 otherwise. Write the distribution of the profit.", answer: "Profit = +35 with probability 1/37, −1 with probability 36/37.", accept: ["35 with 1/37, -1 with 36/37"] },
      { prompt: "What is the difference between a discrete and a continuous random variable?", answer: "Discrete variables take separate values, usually counts; continuous ones take any value in a range and are described by a density rather than a list of probabilities." },
    ],
    applications: ["Modelling demand, arrivals, claims or defects before summarising them", "Turning a game or contract into a payoff table", "Reading a histogram as an empirical distribution"],
    misconception: "That a random variable is a single unknown number. It is a whole distribution of possible numbers with probabilities; the 'variable' is the process, not one draw from it.",
    difficulty: 2,
    foundational: true,
    tags: ["random-variables"],
  }),
  concept("pr-variables", {
    id: "expected-value",
    title: "Expected value",
    summary:
      "The expected value is the probability-weighted average of a random variable: the long-run mean per trial. It is the price of a fair bet, the fair premium of an insurance policy, and the first number to compute in any decision under uncertainty.",
    keyPoints: [
      "E[X] = Σ x · P(X = x). Check that the probabilities sum to 1 before trusting the sum.",
      "It need not be a possible value: a fair die has E = 3.5.",
      "Linearity: E[X + Y] = E[X] + E[Y] always, with no independence required; sums of indicators make hard counts easy.",
      "A bet with negative expected value loses on average; the house edge on European roulette is 1/37 of the stake.",
      "Expected value describes the average over many trials, not what happens once; a decision-maker facing one trial may rationally care about the spread too.",
      "The expected profit of a decision is computed by fixing the decision and averaging over scenarios, with any caps (stock, capacity) applied inside each scenario.",
    ],
    dependsOn: ["random-variables"],
    related: ["expected-value-decisions", "utility-and-risk-attitude", "time-value-of-money", "decision-trees", "opportunity-cost"],
    recallPrompts: [
      { prompt: "Define expected value and give the expected value of one roll of a fair die.", answer: "The probability-weighted average of the values; (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5.", accept: ["3.5"] },
      { prompt: "A £1 bet on one number in European roulette pays 35 to 1. What is its expected profit?", answer: "−1/37 ≈ −£0.027: 35/37 − 36/37.", accept: ["-0.027", "-1/37", "−0.027"] },
      { prompt: "Why does linearity of expectation not require independence, and why does that matter?", answer: "E[X + Y] = E[X] + E[Y] holds for any random variables because expectation is a weighted sum. It lets us compute the mean of a complicated count from simple parts without knowing the joint distribution." },
    ],
    applications: ["Pricing bets, lotteries and insurance policies", "Choosing a stock level when demand is uncertain (the newsvendor problem)", "Estimating the value of a project by weighting scenarios"],
    misconception: "That expected value is what you should expect to happen. It is an average; on any single trial it may be impossible, and two options with the same expected value can be wildly different in risk.",
    difficulty: 3,
    foundational: true,
    tags: ["random-variables", "expectation"],
  }),
  concept("pr-variables", {
    id: "variance-and-spread",
    title: "Variance and spread",
    summary:
      "Variance measures how far a random variable typically lands from its mean; its square root, the standard deviation, is in the variable's own units. Two options with equal expected value are told apart by their spread.",
    keyPoints: [
      "Var(X) = E[(X − μ)²] = E[X²] − μ²; the standard deviation is √Var(X).",
      "Variance is in squared units; report the standard deviation when a number in the original units is wanted.",
      "For independent variables, variances add and standard deviations do not: two parts with SD 3 mm give a total with SD √18 ≈ 4.24 mm, not 6 mm.",
      "The standard deviation of an average of n independent values shrinks like 1/√n.",
      "Correlated errors do not cancel; when everything moves together the spread of the sum is closer to the sum of the spreads.",
    ],
    dependsOn: ["expected-value"],
    related: ["descriptive-statistics", "sampling-variability", "risk-and-diversification", "portfolio-theory"],
    recallPrompts: [
      { prompt: "Give both formulae for variance and say what the standard deviation adds.", answer: "Var(X) = E[(X − μ)²] = E[X²] − μ²; the standard deviation √Var(X) is in the same units as X." },
      { prompt: "Two independent components each have SD 3 mm. What is the SD of their combined length?", answer: "√(9 + 9) = √18 ≈ 4.24 mm; variances add, standard deviations do not.", accept: ["4.24", "sqrt(18)", "√18"] },
      { prompt: "Two investments both return 5 % on average; one is certain, the other is 15 % or −5 % with equal chances. What separates them?", answer: "Spread: the second has standard deviation 10 percentage points, the first 0. Expected value alone cannot rank them.", accept: ["spread", "standard deviation", "risk"] },
    ],
    applications: ["Comparing two investments or two suppliers with the same average", "Tolerance stacking in engineering and manufacturing", "Explaining why a pooled portfolio or an insurance book is steadier than its parts"],
    misconception: "That standard deviations add when quantities are combined. Variances add (for independent quantities); the standard deviation of a sum grows more slowly, which is the whole basis of diversification.",
    difficulty: 3,
    tags: ["random-variables", "spread"],
  }),
  concept("pr-variables", {
    id: "distributions",
    title: "Distributions: binomial and normal",
    summary:
      "A named distribution is a reusable model with stated assumptions. The binomial counts successes in a fixed number of independent trials; the normal describes quantities that are sums of many small independent effects. Knowing the assumptions tells you when the model is wrong.",
    keyPoints: [
      "Binomial(n, p): P(k) = C(n, k) p^k (1 − p)^(n−k); mean np, variance np(1 − p). Assumes fixed n, constant p, independent trials.",
      "The most likely count is not likely: 10 fair tosses give exactly 5 heads only 24.6 % of the time.",
      "Normal(μ, σ): about 68 % within one standard deviation, 95 % within two, 99.7 % within three; standardise with z = (x − μ)/σ.",
      "Tail questions are one-sided: 'taller than two SDs above the mean' is 2.3 %, not 5 %.",
      "Skewed distributions have mode < median < mean; adding most-likely values understates a total of skewed parts.",
      "Contagion, herding and shared shocks break independence and produce fatter tails than either model predicts.",
    ],
    dependsOn: ["variance-and-spread", "combinatorics", "independence"],
    related: ["sampling-variability", "confidence-intervals", "hypothesis-testing", "bubbles-and-manias"],
    recallPrompts: [
      { prompt: "Write the binomial probability of k successes in n trials and its three assumptions.", answer: "C(n, k) p^k (1 − p)^(n−k); fixed number of trials, constant success probability, independence between trials." },
      { prompt: "Heights have mean 175 cm and SD 7 cm. What share of the distribution is above 189 cm?", answer: "About 2.3 % (z = 2; 2.5 % by the 95 % rule, 2.28 % from tables).", accept: ["0.023", "2.3%", "0.0228", "2.5%"] },
      { prompt: "State the 68–95–99.7 rule.", answer: "For a normal distribution, about 68 % of values lie within one SD of the mean, 95 % within two, 99.7 % within three." },
    ],
    applications: ["Quality control: how many defects to expect in a batch", "Test scores, heights and measurement errors on a normal scale", "Deciding whether an observed count is surprising given a model"],
    misconception: "That the normal distribution is the default shape of everything. It arises from sums of many small independent effects; incomes, city sizes, market crashes and epidemics are not like that, and treating them as normal underestimates the tails badly.",
    difficulty: 4,
    tags: ["distributions", "binomial", "normal"],
  }),
  concept("pr-variables", {
    id: "law-of-large-numbers",
    title: "The law of large numbers",
    summary:
      "The average of many independent trials settles towards the expected value: proportions stabilise, totals become predictable relative to their size. It works by dilution, not by compensation, and it is the reason casinos and insurers exist.",
    keyPoints: [
      "As n grows, the sample mean of independent draws converges to the expected value.",
      "The mechanism is division, not correction: an early excess of 30 heads stays as 30 heads and becomes 0.003 of 10,000 tosses.",
      "Small samples swing more: a 15-birth hospital has more '>60 % boys' days than a 45-birth one.",
      "The SD of a mean falls like 1/√n; quadrupling the sample halves the noise.",
      "Pooling many independent risks makes the total predictable (10,000 houses at 1 %: 100 ± 10 claims); a correlated shock removes the guarantee.",
    ],
    dependsOn: ["expected-value", "independence", "variance-and-spread"],
    related: ["sampling-variability", "regression-to-the-mean", "simulation-monte-carlo", "risk-and-diversification"],
    recallPrompts: [
      { prompt: "State the law of large numbers in one sentence.", answer: "The average of many independent trials of a random variable converges to its expected value as the number of trials grows." },
      { prompt: "A fair coin showed 530 heads in 1,000 tosses. How many heads are expected in the next 9,000, and what happens to the proportion?", answer: "4,500; the proportion drifts towards 0.5 because the 30-head excess is diluted, not cancelled.", accept: ["4500", "4,500"] },
      { prompt: "Why do smaller hospitals record more days with an unusual sex ratio?", answer: "A proportion from fewer births has a larger standard deviation (about 0.5/√n), so it strays further from 50 % more often." },
    ],
    applications: ["Why insurance pools and casinos are profitable while single bets are not", "Judging a small-sample statistic (a hot streak, a startling early result) with proper scepticism", "Setting the sample size of a survey or an experiment"],
    misconception: "That the law of large numbers makes outcomes 'even out' in the short run. It says nothing about the next few trials; the gambler's fallacy is the law of large numbers misapplied to small n.",
    difficulty: 3,
    tags: ["limits", "large-numbers"],
  }),
  concept("pr-variables", {
    id: "simulation-monte-carlo",
    title: "Simulation and Monte Carlo",
    summary:
      "When a probability or an expected value is too tangled to compute, generate many random scenarios and count. The result is a whole distribution of outcomes, its precision improves like 1/√n, and its validity depends entirely on the assumptions fed in.",
    keyPoints: [
      "Method: write the model, draw random inputs from their distributions, compute the outcome, repeat thousands of times, summarise the outcomes.",
      "The output is a distribution: a range, a probability of missing a target, a tail, not a single forecast.",
      "Standard error of a simulated proportion is √(p(1 − p)/n): halving it needs four times the runs.",
      "Sampling error is cheap to reduce; model error (wrong distributions, ignored correlations) is not fixed by more runs.",
      "Adding most-likely values gives a scenario, not a statistic; simulation shows why the mean of a sum of skewed tasks exceeds the sum of the modes.",
      "Estimating π by throwing points at a quarter circle is the simplest case: turn a quantity into a probability, then sample it.",
    ],
    dependsOn: ["law-of-large-numbers", "distributions"],
    related: ["computation-and-programs", "uncertainty-and-scenarios", "forecasting-and-calibration", "algorithms-and-complexity"],
    recallPrompts: [
      { prompt: "Describe the four steps of a Monte Carlo simulation.", answer: "Specify the model and input distributions; sample the inputs; compute the outcome; repeat many times and summarise the distribution of outcomes." },
      { prompt: "A simulation's standard error is 0.0034 after 10,000 runs. How many runs halve it?", answer: "40,000: error falls with √n, so four times the runs.", accept: ["40000", "40,000", "four times"] },
      { prompt: "What can more runs fix, and what can they not?", answer: "More runs reduce sampling error; they cannot fix wrong input distributions or ignored correlations, which are model error." },
    ],
    applications: ["Project schedules and budgets with uncertain task durations", "Cash-flow and portfolio risk with correlated inputs", "Any integral or probability in many dimensions where formulae fail"],
    misconception: "That a simulation with many runs is therefore accurate. Runs buy precision about the model's answer; they say nothing about whether the model resembles the world.",
    difficulty: 4,
    tags: ["simulation", "computation"],
  }),
];

export const PROBABILITY_CONCEPTS: Concept[] = [...randomness, ...conditional, ...variables];
