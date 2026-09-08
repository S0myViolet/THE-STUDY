/**
 * Probability — lessons and domain assembly. Concepts live in ./probability-a.ts.
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Every guided, independent and transfer step references items from src/content/v2/items/probability.ts.
 * The three exam-only items (it-probability-42 … 44) are never referenced here.
 */
import type { Lesson } from "@/lib/v2/content-types";
import { scaffoldDomain } from "./_helpers";
import { PROBABILITY_CONCEPTS } from "./probability-a";

/* ------------------------------------------------------------------ */
/* Module pr-randomness                                                 */
/* ------------------------------------------------------------------ */

const lsRandomness1: Lesson = {
  id: "ls-pr-randomness-1",
  moduleId: "pr-randomness",
  conceptIds: ["randomness-and-sample-spaces", "probability-rules"],
  title: "Sample spaces and the three rules",
  promise: "By the end you will be able to set up any simple chance problem as a count over equally likely outcomes, and know which of the three rules applies and when it needs a correction.",
  minutes: 24,
  difficulty: 2,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Which is more likely?",
      prompt: "You roll two fair dice. Is a total of 7 more likely, less likely, or exactly as likely as a total of 2? Commit to an answer and a reason before reading on.",
      thinkSeconds: 60,
      reveal: "A total of 7 is six times as likely as a total of 2. Both are 'one outcome' if you list totals, but only one pair of faces gives 2, while six ordered pairs give 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). The list of totals is not a list of equally likely things. Almost every mistake in elementary probability is this mistake in disguise: counting over a set whose members do not have equal claims.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why write the sample space down",
      body: {
        standard:
          "In 1654 a gambler, the Chevalier de Méré, noticed that betting on at least one six in four rolls of a die was profitable, while betting on at least one double-six in twenty-four rolls of two dice was not, even though the two bets looked proportionate to him (four out of six faces; twenty-four out of thirty-six pairs). He put the puzzle to Pascal, who corresponded with Fermat about it, and the theory of probability came out of their letters. The gambler's instinct was right and his reasoning was wrong, which is the normal condition of people thinking about chance. What Pascal and Fermat did was refuse to reason about the bets directly. They wrote down every way the dice could fall, gave each way an equal claim, and counted. The first bet wins 51.8 % of the time, the second 49.1 %. A difference of less than three points, invisible to intuition, visible to the count.\n\nThat is the habit this lesson installs: before any formula, ask what the complete list of equally likely outcomes is. Once you have that list, probability is a fraction, and the three rules below are just facts about how fractions of a list behave.",
        intuition:
          "Imagine a bag holding one ticket for every way the world could turn out, with every ticket equally likely to be drawn. A probability is simply the fraction of tickets that say 'yes'. The trouble is that people fill the bag carelessly: they put in one ticket for 'total of 7' and one for 'total of 2' when the honest bag has six of the first and one of the second. Pascal and Fermat's contribution in 1654 was to insist on filling the bag properly, one ticket per way the dice can fall, before counting anything.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Sample spaces and the rules",
      body: {
        standard:
          "A sample space is the complete list of outcomes of a random process, each listed exactly once. An event is any subset of that list. When the outcomes are equally likely, the probability of an event is the number of outcomes in it divided by the size of the sample space. Two dice give 36 ordered pairs; a coin tossed three times gives 8 sequences; a hand of five cards gives 2,598,960 hands. Order the pairs, sequences and hands consistently and the equal-likelihood condition holds.\n\nThree rules follow. The complement rule, P(not A) = 1 − P(A), matters because 'at least one' is nearly always easier as one minus 'none'. The addition rule, P(A or B) = P(A) + P(B) − P(A and B), subtracts the overlap that was counted twice; when A and B cannot both happen the overlap is zero and the rule shortens to a plain sum. The multiplication rule, P(A and B) = P(A) × P(B | A), chains a first probability with a second one computed after the first is known; when the second does not depend on the first, the events are independent and the rule shortens to P(A) × P(B). Both shortcuts are conditional on something being true. The single most useful check is that a probability above 1 or below 0 proves a shortcut was used where it was not allowed.",
        intuition:
          "Three moves cover most problems. 'Not A' is everything left over, so its probability is one minus P(A). 'A or B' means pooling two groups, and if they overlap the shared members must be counted once, not twice. 'A and B' means passing two gates in a row: the chance of the second gate may change once you know you passed the first. Everything else is bookkeeping.",
        deep:
          "Formally, a probability measure P assigns to each event a number in [0, 1] with P(whole space) = 1 and, for events that cannot occur together, P(A ∪ B) = P(A) + P(B). Every other rule is a consequence: the complement rule from P(A) + P(not A) = 1; the general addition rule from splitting A ∪ B into A and the part of B outside A; the multiplication rule from the definition P(A | B) = P(A ∩ B)/P(B). The equally-likely case is the special measure that gives each outcome the same weight, which is why counting works there and only there. The frequency reading (long-run proportion) and the belief reading (degree of confidence, disciplined by calibration) both satisfy these axioms, so the calculus is shared even where the interpretation is argued over.",
      },
      structure: [
        { term: "Sample space", meaning: "The complete list of outcomes, each exactly once; events are subsets of it." },
        { term: "Complement", meaning: "P(not A) = 1 − P(A). Use it for 'at least one'." },
        { term: "Addition", meaning: "P(A or B) = P(A) + P(B) − P(A and B); drop the last term only for mutually exclusive events." },
        { term: "Multiplication", meaning: "P(A and B) = P(A) × P(B | A); the second factor is P(B) only under independence." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "De Méré's second bet",
      problem: "What is the probability of at least one double-six in 24 throws of two fair dice? Compare it with the probability of at least one six in 4 throws of one die.",
      steps: [
        { text: "Name the sample space for one throw of two dice: 36 ordered pairs, equally likely. Exactly one of them is (6,6), so P(double-six) = 1/36 and P(no double-six) = 35/36.", note: "Writing the complement down first is deliberate; 'at least one' is going to be attacked through 'none'." },
        { text: "The 24 throws are independent, so P(no double-six in 24 throws) = (35/36)^24.", note: "The multiplication rule in its short form; independence is what licenses it." },
        { text: "Compute: ln(35/36) ≈ −0.02817, times 24 gives −0.6761, and e^−0.6761 ≈ 0.5086. So P(at least one double-six) = 1 − 0.5086 ≈ 0.491.", note: "Logarithms turn a 24-fold product into one multiplication; a calculator's power key does the same." },
        { text: "The other bet: P(no six in 4 throws) = (5/6)^4 = 625/1296 ≈ 0.482, so P(at least one six) ≈ 0.518.", note: "Same structure, different numbers." },
        { text: "Conclusion: the first bet is favourable (51.8 %), the second unfavourable (49.1 %). De Méré's proportional reasoning, 4/6 against 24/36, predicted equal odds; it was wrong because it added probabilities of overlapping events.", note: "The naive 24 × 1/36 = 0.667 and 4 × 1/6 = 0.667 are both over 'at least one' events that overlap heavily." },
      ],
      answer: "About 0.491 for the double-six bet, against about 0.518 for the single-six bet.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Count, then apply a rule",
      scaffold: "For each item: write the sample space (or the two-circle diagram) first, decide which rule is being used, and say whether the shortcut form is allowed.",
      itemIds: ["it-probability-01", "it-probability-03"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-02", "it-probability-04"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague why 'at least one six in four rolls' is not 4 × 1/6, and what the correct route is. Then state the one condition under which adding probabilities is exactly right.",
      keyPoints: ["overlap|double-count|counted twice|not mutually exclusive", "complement|1 minus|one minus|none", "(5/6)^4|0.48|0.52|0.518", "mutually exclusive|cannot both happen|disjoint"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Pairs, not people",
      framing: "The birthday problem is the complement rule applied 22 times over. The surprise is not in the arithmetic but in what the sample space contains: pairs of people, not people.",
      itemIds: ["it-probability-07"],
    },
  ],
};

const lsRandomness2: Lesson = {
  id: "ls-pr-randomness-2",
  moduleId: "pr-randomness",
  conceptIds: ["combinatorics"],
  title: "Counting without listing",
  promise: "By the end you will choose between powers, permutations and combinations by asking two questions, and use the counts to compute probabilities of hands, codes and draws.",
  minutes: 18,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Same or different?",
      prompt: "A club of 8 people must choose a chair, a secretary and a treasurer. Another club of 8 must choose a committee of three. Do the two clubs have the same number of options? If not, which has more, and by what factor?",
      thinkSeconds: 60,
      reveal: "The officers can be chosen in 8 × 7 × 6 = 336 ways, the committee in 56. The factor is 6 = 3!, the number of ways three named people can be assigned to three offices. Every committee corresponds to six slates of officers. That factor, the number of orderings of a chosen set, is the entire difference between a permutation and a combination.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why counting is a skill",
      body: {
        standard:
          "Probability in a finite world is a fraction, and both numerator and denominator are counts. When the sample space is small you list it; when it has 2.6 million five-card hands or 14 million lottery tickets you cannot, and you need a way of counting that does not depend on writing things down. The methods are few. The multiplication principle says that a sequence of independent choices multiplies: 3 shirts and 4 ties are 12 outfits, and 26 letters in each of four positions are 26^4 codes. From it come two derived counts. If items cannot repeat, the choices shrink at each step (26 × 25 × 24 × 23), which is a permutation. If, in addition, the order of the chosen items does not matter, every set of chosen items has been counted once per ordering, and dividing by that number of orderings gives a combination.\n\nThe skill is not the formulae but the two questions that select them: does order matter, and can items repeat? A PIN is ordered with repetition; a race podium is ordered without; a committee is unordered without. Ask the questions before touching a factorial.",
        intuition:
          "Think of counting as filling slots. Each slot has some number of options, and options multiply. If an item used in one slot is off the table for the next, the numbers shrink. If, when you are finished, rearranging what you chose gives 'the same thing', you have over-counted by the number of rearrangements and must divide it back out. That is all permutations and combinations are.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Powers, permutations, combinations",
      body: {
        standard:
          "With n items and k slots: if repetition is allowed and order matters, there are n^k outcomes. If repetition is forbidden and order matters, there are n × (n − 1) × … × (n − k + 1) = n!/(n − k)! permutations. If repetition is forbidden and order does not matter, there are n!/(k!(n − k)!) combinations, written C(n, k) or 'n choose k'; it is the permutation count divided by k!, the number of orderings of the k chosen items. When some of the items being arranged are identical, the full factorial over-counts by the orderings within each identical group, so the count is n! divided by the product of the factorials of the group sizes: the letters of LEVEL give 5!/(2! × 2!) = 30 arrangements.\n\nIn probability, combinations appear on both sides of the fraction. The probability that five dealt cards are all hearts is C(13, 5)/C(52, 5): favourable hands over all hands, both counted without regard to order. The same answer arrives by conditioning card by card, 13/52 × 12/51 × 11/50 × 10/49 × 9/48, which is a useful cross-check and often the quicker route. Which method to use is a matter of convenience; that they agree is a matter of fact.",
        intuition:
          "n^k when you can reuse and order matters; shrinking products when you cannot reuse; divide by k! when order is irrelevant. Identical items: divide by the ways of shuffling each identical group. Probability of a hand: favourable hands over all hands.",
        deep:
          "C(n, k) counts the k-element subsets of an n-element set, which is why C(n, k) = C(n, n − k) (choosing what to include is choosing what to leave out) and why Σ C(n, k) over k equals 2^n (every subset is included or excluded element by element). Pascal's rule, C(n, k) = C(n − 1, k − 1) + C(n − 1, k), splits the subsets by whether they contain a fixed element and builds the binomial coefficients row by row. The binomial distribution inherits its name from exactly this count: C(n, k) is the number of sequences of n trials with k successes, each of which has probability p^k (1 − p)^(n − k).",
      },
      structure: [
        { term: "Multiplication principle", meaning: "Successive choices with a, b, c options give a × b × c outcomes." },
        { term: "Permutation P(n, k)", meaning: "Ordered selection without repetition: n!/(n − k)!." },
        { term: "Combination C(n, k)", meaning: "Unordered selection without repetition: n!/(k!(n − k)!) = P(n, k)/k!." },
        { term: "Repeated items", meaning: "Divide n! by the factorial of each identical group: LEVEL → 5!/(2!2!) = 30." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "A 6-from-49 lottery",
      problem: "A lottery draws 6 numbers from 1 to 49 without replacement; order is irrelevant. A ticket names 6 numbers. What is the probability that the ticket matches all 6? Exactly 5?",
      steps: [
        { text: "Ask the two questions. Order does not matter (a draw is a set of six numbers) and numbers cannot repeat, so the sample space is the set of combinations: C(49, 6) = 49!/(6! 43!) = 13,983,816 equally likely draws.", note: "The 'equally likely' claim rests on the draw being fair; it is the assumption that makes counting valid." },
        { text: "Match all 6: exactly one draw matches the ticket, so P = 1/13,983,816 ≈ 7.2 × 10^−8.", note: "About one in fourteen million; roughly the chance of a specific second in five and a half months." },
        { text: "Match exactly 5: the draw must contain 5 of the ticket's 6 numbers and 1 of the other 43. Count: C(6, 5) × C(43, 1) = 6 × 43 = 258 draws.", note: "Favourable outcomes are built by the multiplication principle from two independent sub-choices." },
        { text: "So P(exactly 5) = 258/13,983,816 ≈ 1.85 × 10^−5, about 1 in 54,000.", note: "Two hundred and fifty-eight times likelier than the jackpot; prize tables are designed around these ratios." },
      ],
      answer: "P(6 matches) ≈ 7.2 × 10^−8 (1 in 13,983,816); P(exactly 5) ≈ 1.85 × 10^−5 (1 in about 54,200).",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "The two questions",
      scaffold: "Before computing: does order matter? Can items repeat? Write your answers, then the count.",
      itemIds: ["it-probability-05"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-06", "it-probability-45"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to someone who has memorised the formulae why C(n, k) is P(n, k) divided by k!, and how to tell which of the two a problem needs.",
      keyPoints: ["order|ordered|arrangement", "k!|orderings|rearrang|divide", "repeat|repetition|replacement", "committee|set|unordered"],
      minWords: 50,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Counting in both numerator and denominator",
      framing: "A probability about a dealt hand is a ratio of two combination counts. Set both up, then cross-check by conditioning card by card.",
      itemIds: ["it-probability-46"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Module pr-conditional                                                */
/* ------------------------------------------------------------------ */

const lsConditional1: Lesson = {
  id: "ls-pr-conditional-1",
  moduleId: "pr-conditional",
  conceptIds: ["conditional-probability", "independence"],
  title: "Conditioning and independence",
  promise: "By the end you will compute P(A | B) from a table without confusing it with P(B | A), and test independence rather than assume it.",
  minutes: 26,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Two questions that sound alike",
      prompt: "In a survey, 80 of 200 commuters took the train, and 12 of those 80 were late. In total 42 commuters were late. Are these the same question: 'what fraction of train commuters were late?' and 'what fraction of late commuters took the train?' Give both numbers.",
      thinkSeconds: 60,
      reveal: "They are different questions with different denominators. Late among train commuters: 12/80 = 0.15. Train among late commuters: 12/42 ≈ 0.29. The numerator is the same twelve people; the denominator is the group you are told about. Getting the denominator right is the whole of conditional probability.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why conditioning is the normal case",
      body: {
        standard:
          "Very few real probabilities are unconditional. A doctor does not want the probability of a disease in the population; she wants it given the symptoms in front of her. A retention team does not want the overall cancellation rate; it wants the rate by channel, or the channel mix among cancellations, which are different things. Conditioning is the act of shrinking the world to the cases where something known is true, and measuring an event as a share of that smaller world. The formula P(A | B) = P(A and B)/P(B) says exactly this: the joint cases, divided by the size of the condition.\n\nTwo confusions do most of the damage. The first is dividing by the whole population instead of the condition, which gives the joint probability P(A and B) rather than the conditional. The second, and more consequential, is inverting: reporting P(B | A) when P(A | B) was asked. A test's sensitivity, the fraction of the ill who test positive, is not the fraction of positives who are ill; a witness's reliability is not the probability the witness is right about this taxi. Independence is the special case where conditioning changes nothing, P(A | B) = P(A), and it deserves to be treated as a claim to be tested, because so many things that seem unrelated share a hidden cause.",
        intuition:
          "Conditioning is pointing at a row of a table and reading a share within it. The inverse conditional points at a column instead. Same table, same cell in the numerator, different denominator. Independence means the share is the same whichever row you point at.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "The definition, the table, the test",
      body: {
        standard:
          "Definition: P(A | B) = P(A and B)/P(B), for P(B) > 0. Rearranged, it gives the multiplication rule P(A and B) = P(B) × P(A | B), which chains probabilities through a sequence of events: the probability of two aces without replacement is 4/52 × 3/51, the second factor being conditional on the first ace having gone. In a two-way table with counts, P(A | B) is the cell (A, B) divided by the total of row B; P(B | A) is the same cell divided by the total of column A. The table makes the denominators visible, which is why it is the tool to draw whenever the words 'given', 'among' or 'of those who' appear.\n\nIndependence: A and B are independent when P(A | B) = P(A), equivalently when P(A and B) = P(A) × P(B). It is a statement about information, not about causation or physical separation. Mutually exclusive events with positive probability are never independent, since P(A and B) = 0 while P(A)P(B) > 0. Independence is what makes redundancy work (two 5 % failures become 0.25 % together) and what makes trials memoryless (a wheel does not owe anyone a black). It is also the assumption most often quietly wrong: two generators on one fuel line, two loans exposed to one housing market, two witnesses who have talked to each other. Test it against the table; do not read it off the story.",
        intuition:
          "P(A | B): shrink the world to B, measure A inside it. Multiplication rule: chain probabilities, updating each one on what came before. Independence: the shrinking makes no difference, so you may multiply plain probabilities. Check it; do not assume it.",
        deep:
          "Conditioning defines a new probability measure P(· | B) on the same sample space, and everything proved for P holds for it. The law of total probability, P(A) = Σ P(A | B_i) P(B_i) over a partition {B_i}, is the tool for computing an unconditional probability by cases and is the denominator of Bayes' theorem. Independence of a collection of events requires the product rule for every sub-collection, not merely every pair; pairwise independence does not imply mutual independence. Conditional independence, P(A and B | C) = P(A | C)P(B | C), is the form used in causal graphs and in naive Bayes classifiers, and it can hold while unconditional independence fails, or vice versa.",
      },
      structure: [
        { term: "Conditional probability", meaning: "P(A | B) = P(A and B)/P(B): the share of the B-cases in which A occurs." },
        { term: "Inverse conditional", meaning: "P(B | A) has the same numerator and a different denominator; it answers a different question." },
        { term: "Multiplication rule", meaning: "P(A and B) = P(B) × P(A | B); update the second probability on the first outcome." },
        { term: "Independence", meaning: "P(A | B) = P(A), equivalently P(A and B) = P(A)P(B). A claim to be tested." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "An invoice audit",
      problem: "A firm audits 400 invoices: 300 from long-standing suppliers and 100 from new ones. Errors were found in 15 of the long-standing invoices and 20 of the new ones. (a) What is P(error | new)? (b) P(new | error)? (c) Are 'new supplier' and 'error' independent?",
      steps: [
        { text: "Draw the table. Rows: long-standing (300), new (100). Column 'error': 15 and 20, total 35. Column 'no error': 285 and 80, total 365.", note: "Every number that follows is a cell over a row or column total." },
        { text: "(a) Condition on 'new': the row has 100 invoices, 20 with errors. P(error | new) = 20/100 = 0.20.", note: "The denominator is the size of the condition, not 400." },
        { text: "(b) Condition on 'error': the column has 35 invoices, 20 from new suppliers. P(new | error) = 20/35 ≈ 0.57.", note: "Same cell, different denominator. New suppliers are a quarter of invoices but well over half of the errors." },
        { text: "(c) Compare P(error | new) = 0.20 with P(error) = 35/400 = 0.0875. They differ, so knowing the supplier is new changes the error probability: the events are dependent. Equivalent check: P(new and error) = 20/400 = 0.05, while P(new) × P(error) = 0.25 × 0.0875 ≈ 0.022.", note: "Dependence is a statistical fact about this table; whether newness causes errors is a separate, causal question." },
      ],
      answer: "(a) 0.20; (b) about 0.57; (c) not independent: the error rate among new suppliers (20 %) is more than double the overall rate (8.75 %).",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Point at the row",
      scaffold: "Write the two-way table. Underline the condition. The denominator is that row's total.",
      itemIds: ["it-probability-08"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-09", "it-probability-10", "it-probability-11", "it-probability-14"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain the difference between P(A | B) and P(B | A) using a table with real numbers of your own, and then say in one sentence what it would mean for A and B to be independent in that table.",
      keyPoints: ["denominator|row total|column total|divide by", "same numerator|same cell|joint", "given|condition|among", "independent|P(A|B) = P(A)|same share|does not change"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Engineering and sport",
      framing: "The first item tests independence as an engineering assumption; the second uses conditioning on the next two points to solve a game that could go on forever. Neither says 'conditional probability' in the prompt.",
      itemIds: ["it-probability-12", "it-probability-13"],
    },
  ],
};

const lsConditional2: Lesson = {
  id: "ls-pr-conditional-2",
  moduleId: "pr-conditional",
  conceptIds: ["bayes-theorem", "base-rates"],
  title: "Bayes' theorem and base rates",
  promise: "By the end you will update a probability on evidence using natural frequencies and the odds form, and recognise base-rate neglect in a test result, a witness or a stereotype.",
  minutes: 30,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "A positive test",
      prompt: "A condition affects 1 in 100 people. A test detects it in 90 % of those who have it and gives a false positive in 10 % of those who do not. Your test is positive. Before calculating anything, write down your gut estimate of the probability that you have the condition.",
      thinkSeconds: 45,
      reveal: "Most people say something near 90 %. The answer is about 8 %. Of 10,000 people, 100 have the condition and 90 of them test positive; 9,900 do not, and 990 of them test positive anyway. Positives: 1,080, of which 90 are real. The test is genuinely informative (it moved the probability from 1 % to 8 %), but the false positives from the large healthy group outnumber the true ones eleven to one. The gap between the gut and the arithmetic is base-rate neglect, and it is the reason this lesson exists.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why the prior cannot be skipped",
      body: {
        standard:
          "Evidence never speaks alone. A positive test, a witness's report, a description that fits a stereotype: each is more or less likely under the various hypotheses, and that is all it can tell you. To turn 'how likely is this evidence under each hypothesis' into 'how likely is each hypothesis now' you must know how likely the hypotheses were before, and that is the base rate. Bayes' theorem is the rule that combines the two, and it is not optional; any method of reasoning from evidence that ignores the prior gets rare things badly wrong.\n\nThe pattern recurs everywhere. A fraud detector with a 1 % false-alarm rate applied to a million honest transactions raises ten thousand alarms, against perhaps a few hundred real frauds. An expert who is right 95 % of the time about genuine documents will still fill the 'forgery' pile largely with genuine letters when forgeries are rare. A witness right four times in five is more likely wrong than right about a blue cab in a city where 85 % of cabs are green. In each case the specific evidence is real and does move the probability, but it moves it from the base rate, and when the base rate is lopsided the move is not enough to cross the line. People fail here because they judge by resemblance (the description fits a librarian; the result looks like a disease) and resemblance contains no information about frequency.",
        intuition:
          "Think of two crowds: the people who have the condition and the people who do not. The test flags a large share of the first crowd and a small share of the second. But if the second crowd is a hundred times bigger, its small share can still outnumber the first crowd's large share. The question 'what fraction of the flagged people are really ill' depends on the crowd sizes as much as on the test.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Three forms of one rule",
      body: {
        standard:
          "Bayes' theorem: P(H | E) = P(E | H) × P(H) / P(E), where the denominator is the total probability of the evidence, P(E) = P(E | H)P(H) + P(E | not H)P(not H). The names matter because the mistakes are mistakes of substitution: the prior P(H) is the probability before the evidence; the likelihood P(E | H) is how probable the evidence is if H holds; the posterior P(H | E) is what you want. Reporting the likelihood as if it were the posterior is the inverse-conditional error from the previous lesson, now with consequences.\n\nNatural frequencies make the theorem mechanical and are the form to use under pressure. Take a round number of cases, split them by the hypothesis using the base rate, apply the evidence to each group using the likelihoods, then divide the true-hypothesis cases showing the evidence by all cases showing it. The odds form makes the theorem portable: posterior odds = prior odds × likelihood ratio, where the likelihood ratio is P(E | H)/P(E | not H). It shows at a glance whether evidence is strong enough: a likelihood ratio of 9 turns prior odds of 1:99 into 9:99, still only 1 in 12; a likelihood ratio of 8 against prior odds of 20:1 leaves the farmer ahead of the librarian at 20:8. Evidence is measured by its likelihood ratio, and belief moves in proportion to it, starting from where it was.",
        intuition:
          "Prior: how common is it? Likelihood: how expected is this evidence if so, and if not? Posterior: the prior, pulled towards the hypothesis by however much more expected the evidence is under it. Do it with 10,000 imagined people and it is just counting.",
        deep:
          "Bayes' theorem is a one-line consequence of the definition of conditional probability, P(H | E)P(E) = P(H and E) = P(E | H)P(H), and the denominator is the law of total probability over the partition {H, not H} (or any finite partition of hypotheses). Sequential updating is multiplicative in odds: independent pieces of evidence multiply their likelihood ratios, which is how a spam filter combines many words and why log-odds are the natural scale for evidence (each piece adds its log likelihood ratio). The posterior is the prior for the next update. Where the prior comes from is the philosophical fault line: a frequency in a reference class where one exists, a calibrated judgement where it does not. Choosing the reference class is itself a judgement, and a narrower class is not automatically better, because its frequency is estimated from fewer cases.",
      },
      structure: [
        { term: "Prior P(H)", meaning: "Probability of the hypothesis before the evidence; usually a base rate." },
        { term: "Likelihood P(E | H)", meaning: "Probability of the evidence if H is true. An input, not the answer." },
        { term: "Posterior P(H | E)", meaning: "Probability of H after the evidence: likelihood × prior / P(E)." },
        { term: "Odds form", meaning: "Posterior odds = prior odds × likelihood ratio, LR = P(E | H)/P(E | not H)." },
        { term: "Base-rate neglect", meaning: "Judging by resemblance and dropping the prior; the representativeness heuristic at work." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "The screening test, three ways",
      problem: "Prevalence 1 %, sensitivity 90 %, specificity 90 %. A person tests positive. Find P(condition | positive) by natural frequencies, by the formula, and by odds.",
      steps: [
        { text: "Natural frequencies. 10,000 people: 100 with the condition, 9,900 without. Positives among the 100: 0.9 × 100 = 90. Positives among the 9,900: 0.1 × 9,900 = 990. All positives: 1,080. P(condition | positive) = 90/1,080 ≈ 0.083.", note: "Choose a population large enough that every cell is a whole number." },
        { text: "Formula. P(+ | D)P(D) = 0.9 × 0.01 = 0.009. P(+ | not D)P(not D) = 0.1 × 0.99 = 0.099. P(+) = 0.108. Posterior = 0.009/0.108 ≈ 0.083.", note: "The two products are the two ways a positive can arise; the answer is the share of the first." },
        { text: "Odds. Prior odds 1:99. Likelihood ratio 0.9/0.1 = 9. Posterior odds 9:99 = 1:11, i.e. probability 1/12 ≈ 0.083.", note: "The odds form shows why: the test is worth a factor of 9, and the base rate started 99 to 1 against." },
        { text: "Interpretation. A positive raises the probability eightfold, from 1 % to 8 %, which justifies a second, more specific test but not a diagnosis. The 90 % figure that intuition offered is P(+ | D), the wrong conditional.", note: "Ask what a second positive from an independent test would do: another factor of 9, to odds of 9:11, about 45 %." },
      ],
      answer: "About 0.083, roughly 1 in 12, by all three routes.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Natural frequencies first",
      scaffold: "Pick 1,000 or 10,000 cases. Split by the hypothesis. Apply the evidence to each group. True cases showing the evidence over all cases showing it. Then order the steps of the general procedure.",
      itemIds: ["it-probability-15", "it-probability-19"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-17", "it-probability-16", "it-probability-20"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "A friend says: 'The test is 90 % accurate, so I am 90 % likely to have it.' Explain what is wrong, using the words prior, likelihood and posterior, and give the actual figure for a 1 % condition.",
      keyPoints: ["prior|base rate|how common|1%|1 in 100", "likelihood|P(positive | disease)|sensitivity|given the disease", "posterior|P(disease | positive)|given a positive", "false positive|healthy people|9,900|990|outnumber", "8%|0.083|1 in 12"],
      minWords: 80,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "An archive and a stereotype",
      framing: "An expert's verdict on a letter and a description of a man are both evidence with a likelihood ratio. Start from the base rate in each case and see whether the evidence is strong enough to overturn it.",
      itemIds: ["it-probability-18", "it-probability-22"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Module pr-variables                                                  */
/* ------------------------------------------------------------------ */

const lsVariables1: Lesson = {
  id: "ls-pr-variables-1",
  moduleId: "pr-variables",
  conceptIds: ["random-variables", "expected-value"],
  title: "Random variables and expected value",
  promise: "By the end you will write a random process as a payoff table, compute its expected value, and use linearity to find means that look impossible to compute directly.",
  minutes: 25,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "A fair price",
      prompt: "A game pays £35 if a single number comes up on a European roulette wheel (37 pockets) and nothing otherwise. What is the most you should pay to play once, if you intend to play thousands of times? Commit to a number.",
      thinkSeconds: 45,
      reveal: "£35/37 ≈ £0.946. That is the average payout per play over a long run: 35 pounds one time in 37. A casino charges £1 for this game, so each play costs you about 2.7 pence on average. The number you just computed is an expected value: a probability-weighted average of the payoffs. It is not what happens on any single play, where you win £35 or nothing.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why attach numbers to outcomes",
      body: {
        standard:
          "Events are yes-or-no; most decisions are about amounts. A shipowner does not ask whether the ship will be lost but what the voyage is worth given that it might be; a baker does not ask whether demand will be high but how many loaves to bake. A random variable is the device that turns a random process into numbers: a rule assigning a value to each outcome, together with the probability of each value. Once outcomes carry numbers, they can be averaged, and the average is the expected value.\n\nThe expected value earns its place because it is what the long run pays. Underwriters at Lloyd's coffee house in the early eighteenth century priced marine risk by exactly this reasoning, learning loss rates from shipping lists and charging a premium above the expected loss; casinos set payouts a shade below fair odds and let the law of large numbers collect the difference. The single most useful property of expected value is that it adds: the expected value of a sum is the sum of the expected values, whether or not the parts are independent. This lets an expert compute the mean of something complicated, the number of guests who get their own hat back, say, without ever finding its distribution.",
        intuition:
          "Put a number on every outcome, weight each number by its probability, add. That average is what you would earn or pay per play over a very long run, and it is the fair price of the game. It is a balance point, not a prediction.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Distribution, expectation, linearity",
      body: {
        standard:
          "A discrete random variable X has a distribution: the list of its possible values x with probabilities P(X = x) that sum to 1. Its expected value is E[X] = Σ x · P(X = x), the probability-weighted average. For a fair die, E = (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5, a value the die cannot show; the expected value is a centre of mass, not a typical outcome, and it is not the mode either. A function of a random variable is another random variable, and its expectation is computed the same way: the profit of a bet, the revenue of a bakery given a stock decision, the payout of an insurance policy.\n\nLinearity: E[X + Y] = E[X] + E[Y] and E[cX] = c E[X], always, with no independence assumed. Since an indicator variable (1 if an event happens, 0 if not) has expectation equal to the event's probability, any count can be written as a sum of indicators and its mean read off at once. Ten guests each with a 1/10 chance of their own hat: expected matches 10 × 1/10 = 1, though the guests' fates are far from independent. In decisions, fix the decision first, compute the payoff in every scenario with any caps applied inside the scenario, then average: a bakery that bakes 100 loaves sells at most 100 whatever demand does, so revenue in the high-demand scenario is capped. Computing profit at the average demand instead is the commonest error in this kind of problem.",
        intuition:
          "Expected value: multiply each value by its chance and add. It adds across parts even when the parts affect each other. To value a decision, hold the decision fixed, work out each scenario honestly, then average.",
        deep:
          "For a continuous variable, E[X] = ∫ x f(x) dx over the density f; the discrete sum is the same idea. Expectation can fail to exist (the St Petersburg game has an infinite expected payout; a Cauchy variable has none), which is one reason utility, not money, is the right object for choices with heavy tails. Linearity extends to any finite sum and, under integrability conditions, to countable ones; E[XY] = E[X]E[Y] does require independence, which is why variances of sums, unlike means, depend on correlation. The law of the unconscious statistician, E[g(X)] = Σ g(x)P(X = x), is what licenses computing the expected profit directly from the demand distribution without first deriving the distribution of profit.",
      },
      structure: [
        { term: "Distribution", meaning: "The values a random variable can take, each with its probability; probabilities sum to 1." },
        { term: "Expected value", meaning: "E[X] = Σ x P(X = x): the long-run average per trial; the fair price." },
        { term: "Linearity", meaning: "E[X + Y] = E[X] + E[Y] without any independence; indicators turn counts into sums." },
        { term: "Decision under uncertainty", meaning: "Fix the decision, evaluate every scenario with caps applied, weight by probability." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Pricing an extended warranty",
      problem: "A retailer sells an appliance for £400 and offers a two-year extended warranty for £60. Its records show that 8 % of units fail within the two years and that the average repair costs £250. What is the retailer's expected profit per warranty sold, and what is the customer's expected gain from buying one?",
      steps: [
        { text: "Define the random variable from the retailer's side: cost of the warranty, C = 250 with probability 0.08, 0 with probability 0.92.", note: "Two outcomes, two probabilities that sum to 1." },
        { text: "E[C] = 0.08 × 250 + 0.92 × 0 = £20. The retailer receives £60 for certain, so expected profit = 60 − 20 = £40 per warranty.", note: "A premium three times the expected cost; the margin is where such products make their money." },
        { text: "From the customer's side the expected value of buying is −£40: £20 of expected repairs avoided for £60 paid.", note: "The two expected values are mirror images because money merely changes hands." },
        { text: "Interpretation. On expected value the customer should decline. A customer for whom an unexpected £250 would be a real hardship might still buy: expected value ranks bets for someone who can absorb the variance, and the next lesson's concept, spread, is what the £40 is buying.", note: "This is the boundary between probability and decision science: expected value is the first number, not the last." },
      ],
      answer: "Retailer: expected profit £40 per warranty. Customer: expected value −£40; buying is a purchase of protection against spread, not a good bet on average.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Write the table",
      scaffold: "List every value with its probability, check the probabilities sum to one, multiply and add. Then answer the conceptual question about what the result means.",
      itemIds: ["it-probability-25", "it-probability-24"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-23", "it-probability-29"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain what an expected value is, why it need not be a possible outcome, and why the expected value of a sum can be computed without knowing whether the parts are independent.",
      keyPoints: ["weighted average|probability-weighted|multiply each value by its probability", "3.5|not a possible|cannot show|not an outcome|balance point", "linearity|sum of the expectations|E[X + Y]", "independence|dependent|does not require|no independence"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "An underwriter and a baker",
      framing: "Neither setting says 'random variable'. In both, write the payoff for each scenario before averaging, and in the second apply the cap that the decision imposes.",
      itemIds: ["it-probability-27", "it-probability-28"],
    },
  ],
};

const lsVariables2: Lesson = {
  id: "ls-pr-variables-2",
  moduleId: "pr-variables",
  conceptIds: ["variance-and-spread", "distributions"],
  title: "Spread and the shapes of chance",
  promise: "By the end you will measure the spread of a random variable, combine spreads correctly, and use the binomial and normal distributions while knowing which assumption each one leans on.",
  minutes: 28,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Same average, different offers",
      prompt: "Investment A returns 5 % for certain. Investment B returns 15 % or −5 %, each with probability one half. Their expected returns are equal. Is there any number that captures how they differ, and what would it be for each?",
      thinkSeconds: 45,
      reveal: "The number is the standard deviation: 0 for A, 10 percentage points for B. B's outcomes sit 10 points either side of the shared mean of 5. Expected value cannot tell the two apart; spread can. The rest of the lesson is about measuring spread, combining it, and the two standard shapes that random quantities take.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why spread and shape matter",
      body: {
        standard:
          "A mean is one number about a distribution; it says where the centre is and nothing about how far outcomes stray from it. Two suppliers with the same average delivery time are not equivalent if one is always within a day and the other is sometimes a week late. The standard deviation is the measure of that straying, in the variable's own units, and it is the first thing a risk manager, an engineer or an investor asks for after the mean.\n\nSpread has one non-obvious rule: when independent quantities are added, it is variances that add, not standard deviations. Two components each with a 3 mm standard deviation give a joint length with standard deviation √18 ≈ 4.24 mm, not 6, because independent errors partly cancel. That cancelling is the mathematical basis of diversification, of tolerance stacking in manufacturing, and of the fact that averages get more precise as samples grow. It also fails, precisely, when the errors are correlated; a shared cause makes them move together, and then the naive sum is closer to the truth.\n\nBeyond spread is shape. Two shapes recur so often that they have names. The binomial counts successes in a fixed number of independent trials. The normal, the bell curve, describes anything that is the sum of many small independent influences: heights, measurement errors, the average of a large sample. Each comes with assumptions, and knowing them is what lets you say when the model is wrong: contagion breaks the binomial's independence; heavy-tailed processes such as market returns and epidemic sizes are not normal, and treating them as normal underestimates their extremes.",
        intuition:
          "Mean: where the centre is. Standard deviation: how far outcomes typically wander from it. Independent wanderings partly cancel, so their variances (squared spreads) add. Binomial: counting hits in n independent tries. Normal: the bell that many small independent pushes produce. Every named shape is a set of assumptions.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Variance, binomial, normal",
      body: {
        standard:
          "Variance: Var(X) = E[(X − μ)²], the expected squared deviation from the mean, equivalently E[X²] − μ². The standard deviation σ = √Var(X) is in X's own units. For independent X and Y, Var(X + Y) = Var(X) + Var(Y); standard deviations combine as the square root of the sum of squares. The standard deviation of the mean of n independent draws is σ/√n.\n\nBinomial(n, p): the number of successes in n independent trials each with success probability p. P(k) = C(n, k) p^k (1 − p)^(n − k); mean np; variance np(1 − p). The combination counts the sequences with k successes; the powers give the probability of any one of them. Ten fair tosses give exactly five heads with probability 252/1024 ≈ 0.246: the likeliest count is far from likely. Assumptions: fixed n, constant p, independent trials.\n\nNormal(μ, σ): the bell curve. About 68 % of values lie within one standard deviation of the mean, 95 % within two, 99.7 % within three. Any normal question is answered by standardising, z = (x − μ)/σ, and reading the tail; tails are one-sided unless the question says otherwise, so 'above two standard deviations' is 2.3 %, not 5 %. The normal arises as the limit of sums of many independent contributions (the central limit theorem), which is why sample averages are close to normal even when the underlying data are not, and why quantities that are products, or driven by a few large shocks, are not normal at all. Skewed shapes have mode below median below mean, so adding most-likely values understates the mean of a sum of skewed parts.",
        intuition:
          "Variance is the average squared distance from the mean; take its square root to get back to real units. Binomial: hits in n tries, mean np. Normal: 68–95–99.7, standardise and read the tail. Ask what each assumes before using it.",
        deep:
          "Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y); independence makes the covariance zero, positive correlation inflates the sum, negative correlation is what hedging exploits. The binomial is a sum of n independent Bernoulli indicators, which is why its mean and variance follow from linearity and the additivity of variance; for large n it is approximately normal with the same mean and variance (adequate when np and n(1 − p) both exceed about 10), and for small p with np moderate it is approximately Poisson(np). The central limit theorem requires finite variance; distributions with infinite variance, such as those with power-law tails, average to stable laws that are not normal, and their extremes do not shrink the way normal tails do. Over-dispersion, a variance larger than the binomial's np(1 − p), is the usual signature of violated independence in count data.",
      },
      structure: [
        { term: "Variance and SD", meaning: "Var(X) = E[(X − μ)²] = E[X²] − μ²; σ = √Var(X), in the units of X." },
        { term: "Adding spread", meaning: "Independent: variances add. SD of a sum = √(σ₁² + σ₂²); SD of a mean = σ/√n." },
        { term: "Binomial(n, p)", meaning: "P(k) = C(n, k) p^k (1 − p)^(n−k); mean np, variance np(1 − p); needs independent trials." },
        { term: "Normal(μ, σ)", meaning: "68–95–99.7 rule; z = (x − μ)/σ; one-sided tails; arises from sums of many small independent effects." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "A production line, two ways",
      problem: "(a) A component fails inspection with probability 0.1, independently. In a batch of 20, what is the probability of exactly 3 failures, and what are the mean and standard deviation of the number of failures? (b) A filling machine dispenses volumes that are normal with mean 500 ml and standard deviation 4 ml. What proportion of bottles hold less than 492 ml?",
      steps: [
        { text: "(a) Identify the model: fixed n = 20, constant p = 0.1, independent trials, so failures ~ Binomial(20, 0.1).", note: "State the assumptions before the formula; a bad batch of raw material would make failures cluster and break independence." },
        { text: "P(3) = C(20, 3) × 0.1³ × 0.9¹⁷ = 1,140 × 0.001 × 0.1668 ≈ 0.190.", note: "0.9¹⁷: ln 0.9 = −0.1054, times 17 is −1.791, e to that is 0.167." },
        { text: "Mean = np = 2 failures; variance = np(1 − p) = 1.8; standard deviation ≈ 1.34. So 3 failures is under one standard deviation above the mean: unremarkable. Eight would be about 4.5 standard deviations above and would call the batch into question.", note: "The SD converts a count into a judgement about surprise." },
        { text: "(b) Standardise: z = (492 − 500)/4 = −2. The proportion below two standard deviations under the mean is 2.28 % (from the 95 % rule, 2.5 %; from tables, 0.0228).", note: "One tail only: bottles over 508 ml are not what was asked." },
      ],
      answer: "(a) P(exactly 3) ≈ 0.19; mean 2, SD ≈ 1.34. (b) About 2.3 % of bottles are under 492 ml.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Variance by both routes",
      scaffold: "Compute the variance directly from squared deviations, then by E[X²] − μ². The two must agree; if they do not, one of them has an arithmetic slip.",
      itemIds: ["it-probability-26"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-30", "it-probability-31", "it-probability-33", "it-probability-32", "it-probability-34"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why the standard deviation of a sum of two independent quantities is less than the sum of their standard deviations, and name one real situation where the independence assumption would fail and the naive sum would be closer to the truth.",
      keyPoints: ["variances add|add the variances|square root of the sum", "cancel|offset|partly cancel|opposite directions", "independent|independence", "correlat|common cause|same supplier|move together|shared"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Assumptions in the field",
      framing: "The first item asks which binomial assumption an epidemic breaks. The second turns the binomial variance into an insurer's business model, and asks what would destroy it.",
      itemIds: ["it-probability-35", "it-probability-37"],
    },
  ],
};

const lsVariables3: Lesson = {
  id: "ls-pr-variables-3",
  moduleId: "pr-variables",
  conceptIds: ["law-of-large-numbers", "simulation-monte-carlo"],
  title: "Many trials: the law of large numbers and Monte Carlo",
  promise: "By the end you will explain how averages stabilise without anything 'evening out', judge a small-sample statistic with the right scepticism, and read a Monte Carlo simulation for what it can and cannot tell you.",
  minutes: 28,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Does the coin owe you tails?",
      prompt: "A fair coin has shown 530 heads in 1,000 tosses. You will toss it 9,000 more times. How many heads do you expect in those 9,000, and what will the overall proportion of heads be after all 10,000? Write both numbers down.",
      thinkSeconds: 45,
      reveal: "4,500 heads in the next 9,000; the coin has no memory. The overall total is then 5,030 in 10,000, a proportion of 0.503. The excess of 30 heads was not cancelled; it was diluted. That is how the law of large numbers works: division by a growing n, not compensation by future outcomes. The belief that the coin must 'catch up' is the gambler's fallacy.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why the long run is predictable",
      body: {
        standard:
          "Nothing about a single toss, claim, birth or trade is predictable. Yet the proportion of heads in ten thousand tosses, the number of claims among ten thousand houses, the sex ratio in a large hospital, are all predictable to within a few per cent. This is the law of large numbers: the average of many independent trials converges to the expected value. The mechanism is not that early deviations get corrected; it is that they are swamped. Thirty extra heads is 3 % of a thousand tosses and 0.3 % of ten thousand. Fluctuations in the total grow like the square root of n while the total itself grows like n, so the ratio shrinks like 1/√n. Quadrupling the sample halves the noise.\n\nThe same fact read backwards says that small samples are noisy. A hospital with 15 births a day will see many more days with over 60 % boys than one with 45, though both have the same underlying rate. The early results of a trial, a manager's first ten hires, a fund's first two years, a five-match winning streak: all are small n, and a proportion from a small n is a poor estimate of the rate that produced it. Insurers and casinos are businesses built on the law: they hold many independent bets and collect the expected edge, while each customer holds one. The word that carries all of this is independent. A wildfire or a housing crash makes thousands of bets move together, and then the pool is no safer than a single bet.\n\nMonte Carlo simulation puts the law to work. When a probability is too tangled to compute, draw random scenarios from the model, count, and let the average converge; the answer arrives with a standard error that shrinks like 1/√n, cheaply, while the model's assumptions stay exactly as good or bad as they were.",
        intuition:
          "Averages settle because errors are divided by an ever-larger n, not because luck balances. Small samples swing; large samples hug the truth; correlated samples are effectively small. Simulation is just running the world many times in a computer and averaging, and it inherits every assumption you put in.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Convergence, standard error, simulation",
      body: {
        standard:
          "Law of large numbers: for independent draws X₁, X₂, … with expected value μ, the sample mean (X₁ + … + Xₙ)/n converges to μ as n grows. Its standard deviation is σ/√n, so precision improves with the square root of the sample size. For a proportion, σ = √(p(1 − p)), which is at most 0.5; a proportion from n cases therefore has standard error at most 0.5/√n: about 0.13 at n = 15, 0.075 at n = 45, 0.005 at n = 10,000. Dilution, not compensation: the expected count in future trials is unaffected by the past, and only the division by n drives the proportion home.\n\nMonte Carlo: specify a model with input distributions, sample the inputs at random, compute the outcome, repeat, and summarise. The output is the whole distribution of outcomes: a mean, a median, a probability of missing a deadline or a cash floor, the size of the bad tail. Its sampling error obeys the same √n law, so halving the standard error of an estimated probability costs four times the runs, and each additional decimal place costs a hundred times more. What runs cannot buy is validity. If the input distributions are wrong, or two inputs that move together in the world are simulated as independent, the output is precisely wrong, and the way to tell is not more runs but comparing the model with data. One classic use is exposing the error of adding most-likely values: three tasks with mode 10 days and long right tails sum to a mean well above 30, because means add and modes do not.",
        intuition:
          "Sample mean → true mean as n grows, with noise shrinking like 1/√n. Small n: expect swings. Monte Carlo: simulate many scenarios, average, get a distribution; four times the runs for twice the precision; no number of runs fixes a wrong model.",
        deep:
          "The weak law states convergence in probability; the strong law, almost-sure convergence; both need only finite mean for i.i.d. draws, though the √n rate needs finite variance. The central limit theorem adds the shape: the standardised sample mean tends to normal, which is what makes 'mean ± 2 standard errors' a usable interval. The √n law is why Monte Carlo is competitive in high dimensions, where deterministic quadrature's cost grows exponentially with dimension while the simulation error does not depend on dimension at all; variance-reduction techniques (antithetic variates, importance sampling, control variates) improve the constant, never the exponent. Pseudo-random generators make simulations reproducible from a seed, and a fixed seed is the correct practice for auditability. Model error is addressed by sensitivity analysis and by calibrating input distributions to data, not by run count.",
      },
      structure: [
        { term: "Law of large numbers", meaning: "The sample mean of independent draws converges to the expected value; noise shrinks like 1/√n." },
        { term: "Dilution, not compensation", meaning: "Future trials do not correct past excess; division by n makes it negligible." },
        { term: "Standard error of a proportion", meaning: "√(p(1 − p)/n) ≤ 0.5/√n; small samples swing more." },
        { term: "Monte Carlo", meaning: "Sample inputs, compute, repeat, summarise; precision from runs, validity from assumptions." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Three dice, exactly and by simulation",
      problem: "Estimate the probability that the sum of three fair dice exceeds 12. A program simulated 10,000 rolls and found 2,590 sums above 12. Report the estimate with its standard error, then check it against the exact answer.",
      steps: [
        { text: "Simulation estimate: p̂ = 2,590/10,000 = 0.259.", note: "Each run is an independent trial of a Bernoulli event; the count is Binomial(10,000, p)." },
        { text: "Standard error: √(p̂(1 − p̂)/n) = √(0.259 × 0.741/10,000) ≈ 0.0044. So the estimate is 0.259 ± 0.009 at roughly two standard errors.", note: "To get ± 0.0045 would take 40,000 runs; to get ± 0.001 about 800,000." },
        { text: "Exact answer by counting: three dice give 216 equally likely outcomes. Sums above 12 (13 to 18) mirror sums below 9 (3 to 8) about the centre 10.5. Sums 3 to 8 occur in 1 + 3 + 6 + 10 + 15 + 21 = 56 ways. So P = 56/216 ≈ 0.2593.", note: "Symmetry halves the counting; the number of ways to make each sum is a short table worth knowing." },
        { text: "Compare: the simulation's 0.259 sits within a fraction of a standard error of 0.2593. Here the exact count was available and the simulation was a check. In a project schedule with ten skewed, partly dependent task durations, no such count exists, and the simulation is the only route to the distribution of the finish date.", note: "Use simulation where enumeration fails; verify it, where you can, against a case where enumeration succeeds." },
      ],
      answer: "Simulation: 0.259 ± 0.0044 (one standard error). Exact: 56/216 ≈ 0.2593. They agree; the simulation's value is in its reach, not its precision.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "From a count to an estimate",
      scaffold: "Say what event each random point is a trial of, what probability the sample fraction estimates, and how to convert that probability into the quantity asked for.",
      itemIds: ["it-probability-40"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-probability-36", "it-probability-38"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague why the law of large numbers does not imply that a run of heads makes tails more likely, and then say what a Monte Carlo simulation's number of runs does and does not control.",
      keyPoints: ["dilut|swamp|divided by|proportion shrinks|not cancel|no memory|independent", "gambler's fallacy|gamblers fallacy|catch up|due", "standard error|sampling error|precision|√n|square root", "assumption|model error|input distribution|correlation|validity"],
      minWords: 70,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Hospitals, schedules and a business owner",
      framing: "Three settings in which the size of a sample, the shape of a distribution and the assumptions of a model do the work: a maternity ward, a project plan and a cash-flow forecast. None of them mentions the law of large numbers by name.",
      itemIds: ["it-probability-21", "it-probability-39", "it-probability-41"],
    },
  ],
};

const lessons: Lesson[] = [lsRandomness1, lsRandomness2, lsConditional1, lsConditional2, lsVariables1, lsVariables2, lsVariables3];

export const PROBABILITY = scaffoldDomain("probability", {
  concepts: PROBABILITY_CONCEPTS,
  lessons,
  courseSummaries: {
    "probability-core":
      "Reasoning about uncertainty with numbers. Three modules take a learner from writing down a sample space to reading a Monte Carlo simulation: counting and the three rules, conditioning and Bayes' theorem with its base rates, and random variables with their means, spreads, standard shapes and long-run behaviour.",
  },
  moduleSummaries: {
    "pr-randomness": "Setting chance problems up so that counting works: sample spaces of equally likely outcomes, the complement, addition and multiplication rules with the conditions each needs, and the permutation and combination counts that supply the numerators and denominators.",
    "pr-conditional": "Probability once something is known: conditional probability and its inverse, independence as a claim to be tested, Bayes' theorem in frequency and odds form, and the base rates that people discard and should not.",
    "pr-variables": "Numbers attached to outcomes: random variables, expected value and its linearity, variance and how spreads combine, the binomial and normal distributions with their assumptions, the law of large numbers, and simulation as a way of computing what formulae cannot.",
  },
});
