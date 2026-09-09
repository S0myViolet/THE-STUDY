/**
 * Logic — lessons (part B of the logic domain). British spelling throughout.
 *
 * Nine lessons, one or more per module, each following the nine-step structure (question →
 * intuition → model → worked example → guided → independent → explain back → transfer;
 * retrieval is scheduled by the engine). Practice steps reference items in
 * src/content/v2/items/logic.ts; none of them is exam-only.
 */
import type { Lesson } from "@/lib/v2/content-types";

type Draft = Omit<Lesson, "origin">;

const lesson = (draft: Draft): Lesson => ({ origin: "seeded", ...draft });
const it = (...ns: number[]) => ns.map((n) => `it-logic-${String(n).padStart(2, "0")}`);

/* ------------------------------------------------------------------ */
/* lg-arguments                                                         */
/* ------------------------------------------------------------------ */

const findingTheArgument = lesson({
  id: "ls-lg-arguments-1",
  moduleId: "lg-arguments",
  conceptIds: ["arguments-premises-conclusions", "validity-and-soundness"],
  title: "Finding the argument and testing its form",
  promise: "You will be able to say, of any paragraph, what it wants you to believe, what it offers as reasons, and whether those reasons could be true while the claim is false.",
  minutes: 25,
  difficulty: 2,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "Read this once: \"Nobody who has actually run a small business supports this tax. The minister has never run one. It will hurt the high street.\" What is the passage trying to make you believe, and what exactly has it offered as reasons? Is there an argument here at all?",
      thinkSeconds: 45,
      reveal:
        "The claim is that the tax will hurt the high street. The reasons offered are that business owners oppose it and that the minister lacks their experience. Neither reason says anything about what the tax will do; the first reports opinions and the second is about a person. So there is an argument, but a poor one, and you could only see that after separating the claim from the reasons. Most readers react to the tone first and the structure never; the lesson reverses that order.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why arguments need locating before they can be judged",
      body: {
        standard:
          "Most prose that sounds like argument is not: it describes, narrates, asserts or expresses feeling. When there is an argument, it is rarely laid out as reasons followed by a claim. The conclusion may open the paragraph, hide in a subordinate clause, or never be stated because the writer assumes you already share it. You cannot evaluate what you have not located, and the commonest failure in discussion is to answer a claim nobody made or to attack a reason nobody gave. Once an argument is located there are exactly two ways it can go wrong: a reason can be false, or the reasons can be true and still fail to deliver the claim. Logic gives the second failure a name, invalidity, and a test that does not depend on knowing whether anything is true. Separating the two failures is what lets you say 'I accept every premise and still reject the conclusion' or 'the reasoning is fine, but that premise is false', which are different objections needing different replies.",
        intuition:
          "An argument is a claim plus the reasons offered for it. Before you can agree or disagree you have to find both. Then ask two separate questions: are the reasons true, and would they be enough if they were?",
        deep:
          "The distinction between form and content is what makes logic a subject at all. Validity is defined over every possible interpretation of the non-logical vocabulary: an argument is valid when no assignment of truth values to its atomic statements (or no model, in the quantified case) makes the premises true and the conclusion false. Truth is a property of a statement in one interpretation, the actual one. That is why an argument with false premises can be valid, and why soundness, which adds actual truth of the premises, is not a formal property and cannot be checked by inspection of form.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Premises, conclusion, validity, soundness",
      body: {
        standard:
          "A statement is anything that can be true or false. An argument is a set of statements in which some, the premises, are offered as reasons for exactly one other, the conclusion. Indicator words help locate the parts: 'therefore', 'so', 'hence' and 'it follows that' point at conclusions; 'because', 'since', 'for' and 'given that' point at premises. Many arguments use none, so the reliable test is functional: which statement do the others support, and which statement supports nothing further? A deductive argument is valid when it is impossible for all the premises to be true and the conclusion false; validity is about the relation between the statements, not about whether any of them is true. It is sound when it is valid and every premise is in fact true. To test validity, try to describe a situation, however unlikely, in which every premise holds and the conclusion fails; if you can, the argument is invalid. If you cannot, after honest effort, you have evidence of validity, and you should then turn to the premises one at a time.",
        intuition:
          "Find the claim. Find the reasons. Ask whether the reasons, if true, would force the claim (validity). Then ask whether the reasons are true (soundness). Keep the two questions apart.",
        technical:
          "Valid: premises ⊨ conclusion, that is, every model of the premises is a model of the conclusion. Sound: valid and every premise is true in the intended model. A counterexample to validity is a model of the premises in which the conclusion is false. 'Arguments' here are deductive; inductive arguments are assessed by strength instead, which the next lesson takes up.",
      },
      structure: [
        { term: "Statement", meaning: "Something that can be true or false; questions and commands are not statements until rephrased" },
        { term: "Premise", meaning: "A statement offered as a reason for the conclusion" },
        { term: "Conclusion", meaning: "The one statement the others are offered in support of" },
        { term: "Valid", meaning: "No possible situation makes every premise true and the conclusion false" },
        { term: "Sound", meaning: "Valid, and every premise actually true" },
        { term: "Counterexample", meaning: "A situation with true premises and a false conclusion; one is enough to prove invalidity" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Locating and testing an argument",
      problem:
        "\"The committee should reject the proposal. Any proposal that increases the deficit should be rejected, and this one adds £2 billion a year to spending without any new revenue.\" Locate the argument, write it in standard form, and say whether it is valid and whether it is sound.",
      steps: [
        { text: "Find the conclusion: the statement the others support and which supports nothing else. Here it is the first sentence, 'the committee should reject the proposal'.", note: "Position is weak evidence. The conclusion came first; writers often lead with it." },
        { text: "List the reasons offered: (1) any proposal that increases the deficit should be rejected; (2) this proposal adds £2 billion a year to spending without new revenue." },
        { text: "Notice a small gap: premise 2 says 'spending without new revenue', premise 1 says 'increases the deficit'. Supply the unstated link: (3) spending without new revenue increases the deficit.", note: "Writing an obvious premise down is not pedantry; it is where a critic might later stand (borrowing rules, offsetting cuts)." },
        { text: "Standard form. 1. Any proposal that increases the deficit should be rejected. 2. This proposal adds £2 billion a year to spending without new revenue. 3. Spending without new revenue increases the deficit. Therefore, the committee should reject the proposal." },
        { text: "Test validity: could 1, 2 and 3 all be true while the conclusion is false? If every deficit-raising proposal should be rejected and this one raises the deficit, then it should be rejected. No counterexample exists; the argument is valid.", note: "The form is 'all F should be G; this is F; so this should be G', a universal applied to an instance." },
        { text: "Test soundness one premise at a time. Premise 2 is a checkable figure. Premise 3 is true unless offsets exist elsewhere. Premise 1 is a strong general rule that most economists would reject as stated (deficits during recessions, investment that pays for itself). The argument is valid but its soundness turns on premise 1.", note: "This is the payoff: the disagreement is now located in one line, and it is a disagreement about a premise, not about reasoning." },
      ],
      answer: "Valid; probably unsound, because premise 1 ('any proposal that increases the deficit should be rejected') is too strong to accept as it stands.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For each item, first write the conclusion in your own words, then the reasons offered. Only then apply the definitions: valid means the reasons, if true, force the conclusion; sound adds that the reasons are true.",
      itemIds: it(1, 5),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(3),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague why 'all cats are reptiles; all reptiles have fur; so all cats have fur' is a valid argument, why it is not a sound one, and what that distinction lets you do when you disagree with a proposal at work.",
      keyPoints: ["conclusion", "premise", "valid|validity", "premises true and conclusion false|true premises and a false conclusion|counterexample|impossible", "sound|soundness", "false premise|premise is false"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "The same test, validity by counterexample, applied to four arguments about categories rather than a single passage. Ignore whether the premises are true; ask only whether they could be true with the conclusion false.",
      itemIds: it(4),
    },
  ],
});

const deductionAndInduction = lesson({
  id: "ls-lg-arguments-2",
  moduleId: "lg-arguments",
  conceptIds: ["deduction-vs-induction"],
  title: "Certainty and probability: deduction and induction",
  promise: "You will stop judging inductive arguments by the deductive standard, and stop presenting probable conclusions as certain ones.",
  minutes: 20,
  difficulty: 2,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "Two arguments. (A) 'Every one of the 3,000 bolts we tested from this batch met the standard, so the batch meets the standard.' (B) 'Every bolt in this batch meets the standard, and this bolt is from the batch, so this bolt meets the standard.' One of them could have true premises and a false conclusion. Which, and does that make it a bad argument?",
      thinkSeconds: 45,
      reveal:
        "Argument A: the 3,001st bolt could fail. That does not make A a bad argument. It is an inductive argument, and a strong one, since a large sample with no failures makes a sound batch very probable. Argument B is deductive: if its premises are true its conclusion cannot be false. The two are judged by different standards, and applying B's standard to A (as many people do when they say 'but you cannot be sure') is a category mistake, not a criticism.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why two standards exist",
      body: {
        standard:
          "Almost everything we know about the world we know inductively: from samples, from patterns, from past behaviour, from the best explanation of what we see. If the only acceptable argument were one whose conclusion could not possibly be false, we could accept nothing beyond mathematics and definitions. So logic keeps two standards. Deduction asks whether the conclusion is guaranteed; induction asks how probable the premises make it. Confusing them produces two symmetrical errors. The first is rejecting good inductive arguments because they lack certainty ('correlation is not proof', said of a randomised trial). The second is dressing an inductive argument in deductive clothes, presenting 'this has always worked' as if it were 'this must work'. The distinction also explains a behaviour that puzzles newcomers: new evidence can weaken an inductive argument without touching any of its premises, because inductive strength depends on all the evidence available, while a valid deduction stays valid whatever you add.",
        intuition:
          "Deduction: the conclusion cannot be false if the premises are true. Induction: the conclusion is probably true if the premises are true. Neither is better; they do different jobs, and each has its own way of failing.",
        deep:
          "The asymmetry is monotonicity. Deductive consequence is monotonic: if Γ ⊨ φ then Γ ∪ Δ ⊨ φ for any Δ. Inductive support is non-monotonic: adding 'the bolts were selected by the supplier' to the 3,000-bolt argument weakens it without removing any premise. Hume's argument (An Enquiry Concerning Human Understanding, 1748, section IV) is that no deductive justification of induction is available, since any such argument must assume that unobserved cases resemble observed ones, which is the point at issue. The modern response is not to justify induction from outside but to discipline it from inside: representative sampling, calibration, and Bayesian updating, which makes the strength of an inductive argument a number.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Validity for deduction, strength for induction",
      body: {
        standard:
          "A deductive argument claims that its conclusion follows with certainty; it succeeds if valid and, with true premises, is sound. An inductive argument claims that its premises make the conclusion probable; it succeeds if strong and, with true premises, is cogent. The label attaches to what the argument claims, not to its direction: 'all ravens are black, so the next raven will be black' moves from general to particular and is inductive; 'this coin came up heads ten times, so it is probably biased' moves from particular to general and is also inductive; a valid syllogism can run in either direction. Four inductive forms recur: generalisation from a sample to a population; prediction from a pattern to the next case; analogy from one case to a similar one; and inference to the best explanation, which argues from evidence to the hypothesis that would best account for it. Each has its characteristic weakness: unrepresentative samples, patterns that end, dissimilarities that matter, and explanations that were never compared with rivals. Induction is defeasible: a strong argument can be made weak by a new premise. Deduction is monotonic: no added premise can make a valid argument invalid.",
        intuition:
          "Ask what the argument claims for itself. 'Must' means deduction, judged by validity. 'Probably' means induction, judged by strength, and strength can change as evidence arrives.",
      },
      structure: [
        { term: "Deductive", meaning: "Claims the conclusion is guaranteed; assessed by validity; valid + true premises = sound" },
        { term: "Inductive", meaning: "Claims the conclusion is probable; assessed by strength; strong + true premises = cogent" },
        { term: "Generalisation", meaning: "From a sample to a population; weak when the sample is small or unrepresentative" },
        { term: "Prediction", meaning: "From a pattern to the next case; weak when the mechanism behind the pattern may change" },
        { term: "Analogy", meaning: "From one case to a similar one; weak when the cases differ in a relevant respect" },
        { term: "Inference to the best explanation", meaning: "From evidence to the hypothesis that best accounts for it; weak when rivals were not considered" },
        { term: "Defeasible", meaning: "New premises can weaken it (induction); a valid deduction cannot be weakened by additions" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Classifying and assessing a press release",
      problem:
        "A press release says: 'In a trial of 400 patients, those given the drug recovered on average two days sooner than those given a placebo. The drug therefore speeds recovery.' Is the argument deductive or inductive, how strong is it, and what would change your assessment?",
      steps: [
        { text: "Identify the conclusion: 'the drug speeds recovery', a general claim about patients in general, present and future." },
        { text: "Identify the premise: in one trial of 400 patients, the treated group recovered two days sooner on average. This is a claim about a sample." },
        { text: "Classify: the premise is about a sample and the conclusion about a population, and no premise guarantees the step. The argument is inductive, a generalisation. The word 'therefore' does not make it deductive.", note: "If the release had written 'must', the argument would still be inductive; it would simply be overstating its own strength." },
        { text: "Assess strength with the questions appropriate to a generalisation: how were the 400 chosen and allocated (randomly?), how large is two days relative to the variation between patients, and could the difference arise by chance? A randomised, adequately sized trial with a difference well beyond chance makes the argument strong.", note: "These are the questions statistics formalises; here they are asked in ordinary words." },
        { text: "Note defeasibility: a second trial of 2,000 patients finding no difference would weaken the argument without making any premise false. That is normal for induction and not a flaw in the first argument." },
      ],
      answer: "Inductive (a generalisation from a sample). Its strength depends on randomisation, sample size and the size of the effect relative to chance; on the information given it is moderately strong, and its conclusion is probable rather than certain.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For each argument ask one question first: does it claim that its conclusion must be true, or that it is probably true? Then apply the matching standard, and do not let 'general to particular' decide anything.",
      itemIds: it(6),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(7),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "A colleague says a randomised trial 'proves nothing, because the next patient might react differently'. Explain what standard they are wrongly applying, what standard they should apply, and why adding new evidence can weaken a good inductive argument without any premise being false.",
      keyPoints: ["certain|guarantee|must|cannot be false", "probable|likely|strength|strong", "valid|validity|deduct", "induct", "new evidence|adding|further|defeasible|weaken"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A policy argument that mixes an inductive prediction with a value judgement. Reconstruct it and say which step is inductive and how strong it is; the point is to locate the induction inside ordinary prose.",
      itemIds: it(31),
    },
  ],
});

const necessaryAndSufficient = lesson({
  id: "ls-lg-arguments-3",
  moduleId: "lg-arguments",
  conceptIds: ["necessary-and-sufficient"],
  title: "Necessary and sufficient conditions",
  promise: "You will read 'if', 'only if' and 'unless' correctly in rules, contracts and diagnoses, and stop concluding that a requirement met is an outcome secured.",
  minutes: 25,
  difficulty: 2,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "A visa rule says: 'Applicants are admitted only if they hold a job offer.' Maya holds a job offer. Has she been admitted? Now suppose she had no offer. What could you say then?",
      thinkSeconds: 40,
      reveal:
        "With an offer, nothing follows about admission: the rule states a requirement, and other requirements may exist. Without an offer, she is not admitted; that is the one inference a necessary condition licenses. Most first readings treat the rule as 'anyone with an offer is admitted', which turns a necessary condition into a sufficient one. The two directions are the whole lesson.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why the distinction exists",
      body: {
        standard:
          "Rules, definitions, diagnoses and plans are built from conditions, and a condition can relate to an outcome in two different ways. It can guarantee the outcome: if this holds, the outcome follows. Or it can be required for the outcome: without this, the outcome cannot happen. Ordinary language marks the difference faintly, with 'if' against 'only if', and then undermines the marking by using 'if' loosely. The result is a family of confident errors: the applicant who meets the entry requirement and assumes admission, the patient with the symptom who assumes the disease, the manager who fixes the one thing that was blocking a project and expects it to succeed. Each has treated a necessary condition as a sufficient one. The reverse error is quieter but as costly: rejecting a plan because it does not guarantee success when nothing was required to. Naming the two relations, and the phrases that introduce each, converts a vague sense of 'that does not follow' into a precise diagnosis.",
        intuition:
          "Sufficient: enough on its own to bring the outcome. Necessary: required, but not necessarily enough. 'If' usually introduces a sufficient condition; 'only if' introduces a necessary one. Check which you have before you draw a conclusion.",
        deep:
          "Both relations are conditionals read in opposite directions. A is sufficient for B when A → B; A is necessary for B when B → A, equivalently ¬A → ¬B. So 'A is sufficient for B' and 'B is necessary for A' are the same statement. A biconditional, A ↔ B, makes each necessary and sufficient for the other. Definitions in mathematics and law are typically stated as sets of individually necessary and jointly sufficient conditions, which is why satisfying one clause of a definition establishes nothing. In causal contexts, Mackie's INUS analysis (1965) describes most causes as insufficient but necessary parts of an unnecessary but sufficient condition: the short circuit is not sufficient for the fire (needs oxygen, fuel) and not necessary (a dropped cigarette would do), but it is a necessary part of one sufficient set.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Two directions of one conditional",
      body: {
        standard:
          "A is sufficient for B: if A then B. Being a square is sufficient for being a rectangle. There are usually many sufficient conditions for the same outcome, so knowing that B holds tells you nothing about which of them did the work. A is necessary for B: if B then A, or equivalently, if not A then not B. Being a rectangle is necessary for being a square. A necessary condition licenses inference in two places only: from the outcome back to the condition (there was a fire, so there was oxygen) and from the absence of the condition to the absence of the outcome (no oxygen, so no fire). The presence of a necessary condition licenses nothing about the outcome. The phrases: 'A if B' makes B sufficient for A; 'A only if B' makes B necessary for A; 'A if and only if B' makes B both; 'A unless B' means A if not B, so not-B is sufficient for A. Lists of conditions in definitions and legal tests are usually each necessary and jointly sufficient: all must hold, and together they settle the matter.",
        intuition:
          "Write the condition as an arrow. Sufficient: A → B. Necessary: B → A. Then look at which end you actually know, and follow the arrow only in the direction it points.",
      },
      structure: [
        { term: "A is sufficient for B", meaning: "If A then B; A guarantees B" },
        { term: "A is necessary for B", meaning: "If B then A; equivalently, no B without A" },
        { term: "Mirror rule", meaning: "A is sufficient for B exactly when B is necessary for A" },
        { term: "'if'", meaning: "Introduces a sufficient condition" },
        { term: "'only if'", meaning: "Introduces a necessary condition" },
        { term: "'if and only if'", meaning: "Introduces a condition that is both" },
        { term: "'unless'", meaning: "'A unless B' = A if not B" },
        { term: "Inference from a necessary condition", meaning: "Absent condition → absent outcome; outcome → condition. Present condition → nothing" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Reading a legal test",
      problem:
        "In English contract law a binding contract requires an offer, an acceptance, consideration (something of value given by each side) and an intention to create legal relations. A signed letter shows a clear offer and a clear acceptance. Is there a contract? What kind of condition is each element, and what would the absence of consideration establish?",
      steps: [
        { text: "Classify each element. Each of the four is necessary: no offer, no contract; no consideration, no contract; and so on. That is what 'requires' means here." },
        { text: "Classify the set. The four together are (on this simplified statement of the law) jointly sufficient: if all hold, there is a contract.", note: "Individually necessary, jointly sufficient is the standard shape of a definition or legal test." },
        { text: "Apply to the letter. Two necessary conditions are met. Meeting necessary conditions removes obstacles; it does not deliver the outcome. Nothing yet follows about whether there is a contract." },
        { text: "Run the negative inference. If it turned out that one side gave nothing of value, a necessary condition fails, and it follows that there is no contract. The absence of a necessary condition is decisive; its presence is not.", note: "This asymmetry is why a good lawyer looks first for the missing element rather than admiring the ones present." },
        { text: "State the general rule the example illustrates: with a list of necessary conditions, checking off some of them establishes nothing; only checking all of them (sufficiency) or finding one missing (necessity failing) settles the question." },
      ],
      answer: "Not yet: offer and acceptance are two of four necessary conditions. Only all four together are sufficient. Missing consideration would show there is no contract.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For each item, rewrite the condition as an arrow before choosing. 'A is sufficient for B' is A → B; 'A is necessary for B' is B → A. Then ask which end of the arrow the item actually gives you.",
      itemIds: it(8, 10),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(9, 11),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a friend who has 'met the entry requirements' for a course why that does not mean they have a place, what kind of condition the requirements are, and what a single missing requirement would establish. Use the words necessary and sufficient correctly and give the 'if' / 'only if' rule.",
      keyPoints: ["sufficient|guarantee|enough", "necessary|required|without", "only if", "if B then A|other direction|reverse|arrow", "nothing follows|does not follow|no conclusion", "missing|absent|rule out|excluded"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "The same reading applied to a contract clause, where the cost of promoting a necessary condition to a sufficient one is paid in money.",
      itemIds: it(12),
    },
  ],
});

const contradictionAndConsistency = lesson({
  id: "ls-lg-arguments-4",
  moduleId: "lg-arguments",
  conceptIds: ["contradiction-and-consistency"],
  title: "Contradiction and consistency",
  promise: "You will be able to show that a set of claims cannot all be true, which is the one criticism that does not depend on knowing which of them is false.",
  minutes: 20,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "A project manager says in the same meeting: 'Every delay on this project was caused by the client.' And, ten minutes later: 'The design phase ran late because our architect was ill for a month.' Nothing here is obviously false. Is there a problem, and what exactly is it?",
      thinkSeconds: 40,
      reveal:
        "The two statements cannot both be true, unless 'delay' is being used in two senses (perhaps the design slip was absorbed within the schedule). If they are about the same delays, one is false; you do not yet know which, and you do not need to know in order to object. That is what makes inconsistency the sharpest tool in criticism: it needs no outside evidence, only the speaker's own statements placed side by side.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why inconsistency is decisive",
      body: {
        standard:
          "Most criticism needs evidence: to say a claim is false you must know something about the world. Inconsistency is different. If two statements cannot both be true, then at least one is false, and you can say so with certainty while knowing nothing about the subject. This is why cross-examination places a witness's earlier statement beside a later one, why auditors compare a strategy's goals with its budget, and why the strongest proofs in mathematics work by assuming a claim and deriving a contradiction from it. It is also why inconsistency is easy to miss: each statement is examined on its own occasion, sounds reasonable, and is approved; the conflict exists only between them, and nobody puts them together. The discipline is written reconstruction, listing the claims a position commits itself to and asking whether one situation could satisfy them all. Two cautions. Consistency is about possibility, not truth: two false statements can be perfectly consistent. And apparent contradictions often dissolve when a word is being used in two senses, so the first move on finding one is to check for ambiguity before pressing the charge.",
        intuition:
          "Consistent means 'could all be true together'. Inconsistent means 'at least one must be false', which you can know without knowing which. Look for it by listing the claims and trying to imagine one situation that satisfies every line.",
        deep:
          "A set Γ is consistent when it has a model; inconsistent when it has none, equivalently when Γ ⊨ φ ∧ ¬φ for some φ. In classical logic an inconsistent set entails every statement (ex falso quodlibet), which is why one contradiction is fatal to a theory and not merely to a claim in it. Reductio ad absurdum exploits this: to prove ¬φ, show that Γ ∪ {φ} is inconsistent. Contraries and contradictories differ in the traditional square of opposition: 'all A are B' and 'no A are B' are contraries (not both true, possibly both false); 'all A are B' and 'some A are not B' are contradictories (exactly one true). Paraconsistent logics restrict explosion so that inconsistent databases can be reasoned with; classical logic does not.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Consistency, contradiction, contraries, reductio",
      body: {
        standard:
          "A set of statements is consistent when there is at least one possible situation in which all of them are true; it is inconsistent when there is none. A contradiction is a statement together with its negation, P and not-P; it is false in every situation, and it is the strongest form of inconsistency. Contradictory statements cannot both be true and cannot both be false: exactly one holds. Contrary statements cannot both be true but can both be false: 'the wall is entirely red' and 'the wall is entirely blue' are contraries, and a green wall makes both false. Since an inconsistent set is guaranteed to contain a falsehood, showing inconsistency refutes the set without identifying the false member. Reductio ad absurdum turns this into a method of proof: assume the claim you want to refute, derive a contradiction from it together with accepted premises, and conclude that the claim is false. Before pressing a charge of contradiction, disambiguate: 'the shop is open' and 'the shop is closed' conflict only if said of the same shop, at the same time, in the same sense.",
        intuition:
          "List the claims. Try to build one world in which every claim is true. If you can, they are consistent, whatever their truth. If you cannot, at least one is false, and you may say so without evidence about the world.",
      },
      structure: [
        { term: "Consistent", meaning: "Some possible situation makes all the statements true" },
        { term: "Inconsistent", meaning: "No possible situation does; at least one statement is false" },
        { term: "Contradiction", meaning: "P and not-P; false in every situation" },
        { term: "Contradictories", meaning: "Cannot both be true, cannot both be false: exactly one holds" },
        { term: "Contraries", meaning: "Cannot both be true, can both be false" },
        { term: "Reductio ad absurdum", meaning: "Assume the claim, derive a contradiction, conclude the claim is false" },
        { term: "Disambiguation", meaning: "Check that both statements use each word in the same sense before alleging contradiction" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Euclid's reductio: there is no largest prime",
      problem: "Show that there is no largest prime number, by assuming that there is and deriving a contradiction.",
      steps: [
        { text: "Assume, for reductio, that the primes are finite in number: p₁, p₂, …, pₙ is the complete list." },
        { text: "Form N = p₁ × p₂ × … × pₙ + 1. Divide N by any prime on the list; the remainder is 1, so no listed prime divides N.", note: "Every integer greater than 1 has at least one prime factor; that is the accepted premise the reductio leans on." },
        { text: "So N has a prime factor that is not on the list (or N is itself a prime not on the list). Either way there is a prime the list omitted." },
        { text: "But the list was assumed complete. We have derived 'the list is complete' and 'the list is not complete': a contradiction." },
        { text: "Therefore the assumption is false: no finite list contains every prime. There is no largest prime.", note: "A frequent misreading is that N itself must be prime. It need not be: 2 × 3 × 5 × 7 × 11 × 13 + 1 = 30,031 = 59 × 509. The argument only needs a prime factor outside the list." },
      ],
      answer: "The assumption of a largest prime leads to a contradiction, so there is none; the primes are infinite.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Before answering, separate two questions: are the statements true, and could they all be true together? Only the second is about consistency.",
      itemIds: it(30),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(29),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why finding an inconsistency in someone's position lets you say with certainty that they have said something false, even though you may not know which statement is false. Include the difference between contradictory and contrary statements and describe how a reductio works.",
      keyPoints: ["possible|could all be true|situation|together", "at least one|one of them|must be false|falsehood", "contradict|negation|not-P|exactly one", "contrar|both false", "reductio|assume|derive|absurd"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "Consistency in a planning document, where the conflict is arithmetical and lives between four commitments rather than in any pair of them.",
      itemIds: it(39),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* lg-formal                                                            */
/* ------------------------------------------------------------------ */

const truthTables = lesson({
  id: "ls-lg-formal-1",
  moduleId: "lg-formal",
  conceptIds: ["propositional-logic"],
  title: "Truth tables and the five connectives",
  promise: "You will be able to write an everyday 'if', 'and', 'or' and 'not' in symbols, check an argument's validity mechanically, and read a policy clause the way a compiler would.",
  minutes: 30,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "A notice on a door reads: 'Access is granted if the badge is valid and the door is unlocked, or an override is in force.' A guard reads it one way and an engineer another. What are the two readings, and under either of them can a valid badge alone get you in?",
      thinkSeconds: 45,
      reveal:
        "Reading 1: (valid badge and unlocked door) or override. Reading 2: valid badge and (unlocked door or override). Under the first, an override alone suffices and a badge is not needed. Under the second, a badge is always required. Under neither does a valid badge on its own grant access. The sentence is ambiguous because English has no brackets; the symbols of propositional logic exist to supply them, and every dispute over a rule that 'clearly says' something usually comes down to where the bracket goes.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why statements are joined by connectives with fixed meanings",
      body: {
        standard:
          "A large share of reasoning does not depend on what the statements are about but only on how they are joined. 'If the pump is running the tank is filling; the pump is running; so the tank is filling' is valid for the same reason as 'if the account is overdrawn a fee applies; it is overdrawn; so a fee applies'. Propositional logic makes this explicit by treating whole statements as letters and the joining words as connectives whose meaning is fixed by a table: given the truth of the parts, the truth of the whole is determined. The gain is mechanical checking. An argument with three atomic statements has eight possible situations; list them, and validity becomes the question of whether any row makes the premises true and the conclusion false. The cost is that the fixed meanings are slightly wider than the English words. 'Or' is inclusive unless stated otherwise; 'if P then Q' is counted true whenever P is false, which offends the ear but is the only definition that makes the contrapositive equivalent and lets conditionals be tested by looking for the one case that breaks them. Learning to read the symbols is learning to see the bracket structure that English hides.",
        intuition:
          "Replace the statements with letters and the joining words with symbols. Then the truth of the whole depends only on the truth of the parts, by tables you can memorise, and validity can be checked by listing every case.",
        deep:
          "Propositional logic is truth-functional: each connective is a function from truth values to a truth value, and every n-ary truth function is expressible with ¬ and ∧ alone (or with a single connective, NAND). An argument is valid iff the conditional 'conjunction of premises → conclusion' is a tautology, which is decidable by the 2ⁿ-row table; the same problem viewed from the other side, satisfiability, is the archetypal NP-complete problem (Cook, 1971). The truth-table semantics is due to Post and Wittgenstein (1921, Tractatus 4.31), the connectives and their algebra to Boole (1847) and Frege (1879).",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Connectives, tables, forms",
      body: {
        standard:
          "Five connectives. ¬P (not P) is true when P is false. P ∧ Q (P and Q) is true only when both are. P ∨ Q (P or Q) is true when at least one is; it is inclusive, so both true counts. P → Q (if P then Q) is false in exactly one case, P true and Q false, and true otherwise. P ↔ Q (P if and only if Q) is true when P and Q have the same value. A truth table for n atomic statements has 2ⁿ rows. An argument is valid exactly when no row makes every premise true and the conclusion false; a shortcut is to assume the conclusion false and the premises true and look for a forced contradiction. Useful equivalences: De Morgan's laws, ¬(P ∧ Q) ≡ ¬P ∨ ¬Q and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q; the contrapositive, P → Q ≡ ¬Q → ¬P; and the conditional as disjunction, P → Q ≡ ¬P ∨ Q. Four valid forms cover most everyday deduction: modus ponens (P → Q, P, so Q), modus tollens (P → Q, ¬Q, so ¬P), hypothetical syllogism (P → Q, Q → R, so P → R) and disjunctive syllogism (P ∨ Q, ¬P, so Q). A tautology is true in every row, a contradiction false in every row, and two statements are equivalent when their columns match.",
        intuition:
          "Four things to hold on to: 'or' includes both; 'if P then Q' fails only when P is true and Q false; 'not both' is 'at least one is not'; and an argument is valid when no row has true premises and a false conclusion.",
        technical:
          "Precedence, when brackets are omitted: ¬ binds tightest, then ∧, then ∨, then →, then ↔; so ¬P ∧ Q → R reads ((¬P) ∧ Q) → R. Write brackets anyway in anything that matters. → is not associative: P → (Q → R) and (P → Q) → R differ (take P, Q, R all false).",
      },
      structure: [
        { term: "¬P", meaning: "True when P is false" },
        { term: "P ∧ Q", meaning: "True only when both are true" },
        { term: "P ∨ Q", meaning: "True when at least one is true (inclusive)" },
        { term: "P → Q", meaning: "False only when P is true and Q is false" },
        { term: "P ↔ Q", meaning: "True when P and Q have the same value" },
        { term: "Validity by table", meaning: "No row with all premises true and the conclusion false" },
        { term: "De Morgan", meaning: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q; ¬(P ∨ Q) ≡ ¬P ∧ ¬Q" },
        { term: "Valid forms", meaning: "Modus ponens, modus tollens, hypothetical syllogism, disjunctive syllogism" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Testing validity without writing all the rows",
      problem:
        "\"If it rains, the pitch is wet. If the pitch is wet, the match is off. The match is on. Therefore it is not raining.\" Is this valid?",
      steps: [
        { text: "Letter the statements: R = it rains, W = the pitch is wet, O = the match is off. Premises: R → W; W → O; ¬O. Conclusion: ¬R." },
        { text: "Rather than write eight rows, try to build a counterexample: make the conclusion false and every premise true. Conclusion false means R is true." },
        { text: "With R true, premise R → W can only be true if W is true. With W true, premise W → O can only be true if O is true." },
        { text: "But the third premise says ¬O, so O is false. We needed O true and O false at once: impossible. No counterexample exists.", note: "This is the reductio shortcut: assume invalidity, derive a contradiction." },
        { text: "The argument is valid. In named forms: hypothetical syllogism gives R → O from the first two premises, then modus tollens with ¬O gives ¬R.", note: "Validity says nothing about whether it is raining; if the pitch has a cover, premise 1 is false and the argument unsound." },
      ],
      answer: "Valid: assuming the conclusion false forces O to be both true and false.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For counting questions, start from the one case that makes a conditional false rather than filling the whole table. For form questions, letter the argument first and match it against the four valid forms.",
      itemIds: it(17, 2),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(18),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague writing a spreadsheet rule how many cases a rule with three yes/no inputs has, in which single case 'if P then Q' is false, why 'or' includes both, and how you would check that a chain of if-clauses actually delivers the conclusion they expect.",
      keyPoints: ["row|combination|case|eight|2ⁿ|two to the", "true and|P true and Q false|antecedent true|consequent false|only one case", "inclusive|both|at least one", "premises true|conclusion false|no row|counterexample|valid"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "De Morgan's law on a control panel, where reading 'not both' as 'neither' sends a technician to replace a part that works.",
      itemIds: it(19),
    },
  ],
});

const conditionals = lesson({
  id: "ls-lg-formal-2",
  moduleId: "lg-formal",
  conceptIds: ["conditionals-and-contrapositive"],
  title: "Conditionals: converse, inverse, contrapositive",
  promise: "You will know which of the three statements built from 'if P then Q' says the same thing, and you will test a rule by looking for the case that could break it.",
  minutes: 25,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "A guarantee reads: 'If the kettle fails within a year, we will replace it.' Your kettle failed after fourteen months. A colleague says the guarantee proves the maker will not replace it. Is the colleague right? Write down exactly what the guarantee does and does not say.",
      thinkSeconds: 40,
      reveal:
        "The colleague is wrong. The guarantee promises a replacement in one case and is silent about every other; the maker may replace your kettle out of goodwill, or under consumer law, or not at all. The colleague has read 'if P then Q' as 'if not P then not Q', the inverse, which is a different and stronger claim. What the guarantee does entail is the contrapositive: if they will not replace it, it did not fail within a year.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why one conditional spawns three others",
      body: {
        standard:
          "'If P then Q' is asymmetric: it promises Q whenever P holds and says nothing about what happens when P fails or when Q holds for some other reason. The mind resists the asymmetry. We hear 'if you finish the report you can leave early' and infer that not finishing means staying late, which was not said; we hear 'if the server is down the site is unreachable' and, finding the site unreachable, conclude the server is down, which does not follow. These are the inverse and the converse, and they are the same mistake wearing two coats: both treat the conditional as if it ran in both directions. The one rearrangement that is safe is the contrapositive, 'if not Q then not P', which is the original conditional looked at from the other end. Getting this right has practical consequences beyond argument. Testing a rule means looking for the case that could falsify it, P with not-Q, rather than the cases that fit it, and Wason's card experiments show that most educated adults, most of the time, check the confirming cases instead. In mathematics, many results are far easier to prove by contrapositive than directly. The skill is mechanical once named; the difficulty is entirely in remembering to apply it.",
        intuition:
          "'If P then Q' promises Q when P holds and nothing else. Swapping the halves (converse) or negating both in place (inverse) changes the claim. Swapping and negating together (contrapositive) keeps it. To test a rule, hunt for P-with-not-Q.",
        deep:
          "P → Q ≡ ¬P ∨ Q, from which ¬Q → ¬P ≡ Q ∨ ¬P follows at once; the converse Q → P ≡ ¬Q ∨ P is a different disjunction, and the inverse ¬P → ¬Q ≡ P ∨ ¬Q is equivalent to the converse. Confusing a conditional with its converse amounts to reading → as ↔. In the Wason selection task (1966; the abstract form reported at around 10 % correct in early studies) the falsifying cards are exactly the P card and the ¬Q card; performance improves sharply when the rule is a familiar social contract ('if you drink alcohol you must be over 18'), which Cosmides (1989) took as evidence for a domain-specific cheater-detection mechanism, a claim that remains debated.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "The four statements and what testing a rule requires",
      body: {
        standard:
          "From 'if P then Q' (the conditional) build three more. The converse swaps: 'if Q then P'. The inverse negates in place: 'if not P then not Q'. The contrapositive swaps and negates: 'if not Q then not P'. Only the contrapositive is equivalent to the original. The converse and inverse are equivalent to each other (each is the other's contrapositive) and independent of the original: a true conditional can have a false converse ('if it is a square it has four sides'), and the converse is true only when P and Q are equivalent, which must be established separately. Two valid inferences use a conditional: modus ponens runs it forward (P, so Q) and modus tollens runs it backward through the contrapositive (not Q, so not P). To test whether a rule 'if P then Q' holds, look for a case of P without Q; those are the only cases that can break it. Cases of not-P and cases of Q cannot. Proof by contrapositive: to show P → Q, assume not Q and derive not P.",
        intuition:
          "Converse: swap. Inverse: negate. Contrapositive: swap and negate. Only the last keeps the meaning. Modus ponens goes forward, modus tollens goes backward, and a rule is broken only by P-without-Q.",
      },
      structure: [
        { term: "Conditional", meaning: "If P then Q" },
        { term: "Converse", meaning: "If Q then P; not equivalent" },
        { term: "Inverse", meaning: "If not P then not Q; not equivalent (it is the contrapositive of the converse)" },
        { term: "Contrapositive", meaning: "If not Q then not P; equivalent to the original" },
        { term: "Modus ponens", meaning: "P → Q, P, therefore Q" },
        { term: "Modus tollens", meaning: "P → Q, ¬Q, therefore ¬P" },
        { term: "Falsifier of a rule", meaning: "A case with P true and Q false; the only kind that can break 'if P then Q'" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Proof by contrapositive",
      problem: "Prove: if n² is even, then n is even (for whole numbers n).",
      steps: [
        { text: "A direct proof would start from 'n² is even' and try to say something about n, which is awkward because taking square roots of an evenness fact gives no purchase." },
        { text: "Form the contrapositive, which is equivalent and easier: if n is odd, then n² is odd. Prove this instead.", note: "Swap and negate: 'not (n even)' is 'n odd'; 'not (n² even)' is 'n² odd'." },
        { text: "Assume n is odd, so n = 2k + 1 for some whole number k." },
        { text: "Then n² = (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is one more than an even number, so n² is odd." },
        { text: "The contrapositive is proved; since it is equivalent to the original, the original is proved: if n² is even, n is even.", note: "This is the lemma used in the standard proof that √2 is irrational, which is itself a reductio." },
      ],
      answer: "Proved via the contrapositive: an odd n has an odd square, so an even square forces an even n.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Write the original as P → Q with P and Q named. Produce the contrapositive by swapping and negating, and check each option against it. For any option that swaps without negating or negates without swapping, find a counterexample.",
      itemIds: it(13, 15),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(14),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Using the rule 'if an email comes from outside the company, it carries a warning banner', write its converse, inverse and contrapositive, say which one is equivalent to the rule, and explain which emails you would need to inspect to check whether the rule is being enforced.",
      keyPoints: ["swap|switch|reverse", "negat|not", "contrapositive", "equivalent|same", "converse", "inverse", "break|falsif|counterexample|outside without|no banner"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "Wason's selection task: the contrapositive presented as a puzzle with cards. Most people fail it on first meeting; the lesson's method is what makes it easy.",
      itemIds: it(16),
    },
  ],
});

const quantifiers = lesson({
  id: "ls-lg-formal-3",
  moduleId: "lg-formal",
  conceptIds: ["quantifiers"],
  title: "All, some, none: quantifiers and their negations",
  promise: "You will negate 'all' and 'some' correctly, notice when the order of two quantifiers changes a claim, and refute a generalisation with the one case that does it.",
  minutes: 20,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "A policy says: 'Every member of staff has someone they can escalate a safety concern to.' A manager summarises it as: 'So there is someone the whole staff can escalate to.' Does the second sentence follow from the first? Sketch a company in which the first is true and the second false.",
      thinkSeconds: 40,
      reveal:
        "It does not follow. In a company with two divisions, each with its own safety lead, every member of staff has someone (their own lead) while no single person serves everyone. The first sentence is 'for each person there is someone'; the second is 'there is someone such that for each person'. Reversing the order of 'every' and 'someone' strengthens the claim, and the manager's summary has quietly done that.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why the small words carry the argument",
      body: {
        standard:
          "Claims about categories are made with a handful of small words: all, every, no, none, some, most, not all. Almost every dispute over a generalisation turns on them, and English handles them badly. The negation of 'all swans are white' is not 'no swans are white' but 'at least one swan is not white', which is why a single black swan refutes the universal and why a report saying 'not all samples were contaminated' has told you much less than it seems. 'Some' means 'at least one' and is compatible with 'all'; 'all A are B' does not run backwards to 'all B are A'; and when two quantifiers appear in one sentence their order changes the meaning, as the opening question showed. These distinctions were systematised by Aristotle in the syllogistic and made fully mechanical by Frege in 1879, but they are not academic. Specifications ('every request has a handler' against 'one handler serves every request'), study reports ('no effect was found' against 'an effect was found to be absent'), and political claims ('nobody wants this' against 'not everybody wants this') all turn on them, and the errors are made confidently because the sentences sound alike.",
        intuition:
          "'Not all' means 'some are not', not 'none'. 'Some' means 'at least one'. 'All A are B' does not give 'all B are A'. And 'everyone has someone' is weaker than 'someone serves everyone'. One counterexample kills a universal; nothing short of a complete check kills an existential.",
        deep:
          "In first-order notation: ¬∀x P(x) ≡ ∃x ¬P(x) and ¬∃x P(x) ≡ ∀x ¬P(x), the quantifier duals. ∃y∀x R(x,y) ⊨ ∀x∃y R(x,y) but not conversely. 'All A are B' is ∀x (A(x) → B(x)), which is vacuously true when nothing is A; the modern reading therefore lacks the existential import Aristotle assumed, and 'all unicorns are white' comes out true. The four categorical forms and their relations (contradictories across the diagonals, contraries along the top) form the traditional square of opposition; only the diagonal relations survive the loss of existential import.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Four forms, negation, conversion, order",
      body: {
        standard:
          "Four categorical forms: all A are B; no A are B; some A are B; some A are not B. Contradictory pairs, of which exactly one is true: 'all A are B' against 'some A are not B'; 'no A are B' against 'some A are B'. To negate a universal, produce the corresponding existential: not all A are B means some A is not B. To negate an existential, produce a universal: it is not the case that some A are B means no A are B. 'Some' means at least one and does not exclude all. Conversion: 'some A are B' converts to 'some B are A' and 'no A are B' to 'no B are A', but 'all A are B' does not convert; 'all B are A' is a separate claim. Order: 'for every x there is a y' (∀∃) is weaker than 'there is a y for every x' (∃∀); the second implies the first, not the reverse. Valid syllogisms chain universals through a shared middle term, all A are B, all B are C, so all A are C; when the middle term is a predicate in both premises (all A are B, all C are B) nothing follows, the undistributed middle. One counterexample refutes a universal; refuting an existential requires checking every case.",
        intuition:
          "Negate 'all' with 'some are not'. Negate 'some' with 'none'. Do not turn 'all A are B' round. Watch the order of 'every' and 'some'. Refute a universal with one case.",
      },
      structure: [
        { term: "All A are B", meaning: "Universal affirmative; contradicted by 'some A are not B'" },
        { term: "No A are B", meaning: "Universal negative; contradicted by 'some A are B'" },
        { term: "Some A are B", meaning: "At least one; compatible with all" },
        { term: "Some A are not B", meaning: "At least one exception; the negation of 'all'" },
        { term: "Conversion", meaning: "'Some' and 'no' convert; 'all' does not" },
        { term: "∀∃ versus ∃∀", meaning: "'Everyone has someone' is weaker than 'someone serves everyone'" },
        { term: "Undistributed middle", meaning: "All A are B, all C are B: nothing follows about A and C" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Negating a claim exactly",
      problem:
        "A call-centre manager claims: 'Every customer who called in March was answered within a minute.' (a) State precisely what would make the claim false. (b) A colleague says 'that is not true; last March was chaos, nobody got through quickly'. Is the colleague's statement the negation of the claim? (c) What would it take to refute 'some March calls were answered within a minute'?",
      steps: [
        { text: "(a) The claim is universal: for every March caller, answer time was under a minute. Its negation is existential: at least one March caller was not answered within a minute. One such call, found in the logs, refutes the claim." },
        { text: "(b) 'Nobody got through quickly' is 'no March caller was answered within a minute', a universal negative. It is a contrary of the manager's claim, not its contradictory: both could be false (some callers waited, some did not). The colleague has overstated; if a single quick call turns up, the colleague's rebuttal fails even though the manager's claim may also be false.", note: "This is the commonest quantifier error in argument: answering 'all' with 'none' and handing the opponent an easy counterexample." },
        { text: "(c) 'Some March calls were answered within a minute' is existential. To refute it you must show that no call was, which means checking every March call. One slow call proves nothing against it.", note: "Asymmetry of burden: universals are cheap to refute and expensive to establish; existentials the reverse." },
        { text: "State the pattern: negate 'all' with 'at least one is not'; negate 'some' with 'none'; and when arguing against a universal, assert the exception, not the opposite universal." },
      ],
      answer: "(a) One March call answered after more than a minute. (b) No: the colleague asserted a contrary, 'none', which overstates and can itself be refuted. (c) A check of every March call showing none under a minute.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Ask what the smallest fact is that would make the original statement false. That fact is its negation; anything stronger is a contrary.",
      itemIds: it(20),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(22),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "A report says 'no significant effect was found in any of the six trials'. A journalist writes 'the studies found the treatment does not work'. Explain what the report's sentence does and does not claim, give the correct negation of 'all trials found an effect', and explain why 'everyone has a doctor' does not mean 'one doctor serves everyone'.",
      keyPoints: ["some|at least one", "not all|some are not|exception", "none|no |stronger", "order|nested|everyone has|one .* serves|there is one", "counterexample|one case|single"],
      minWords: 80,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "Quantifier order inside an organisation chart: two sentences about managers that sound alike and are not.",
      itemIds: it(21),
    },
  ],
});

/* ------------------------------------------------------------------ */
/* lg-fallacies                                                         */
/* ------------------------------------------------------------------ */

const fallaciesAndReconstruction = lesson({
  id: "ls-lg-fallacies-1",
  moduleId: "lg-fallacies",
  conceptIds: ["formal-fallacies", "informal-fallacies", "argument-reconstruction"],
  title: "Fallacies and reconstruction",
  promise: "You will diagnose the two conditional fallacies on sight, name the common informal ones accurately, and, rather than merely naming them, rewrite an argument in standard form so that the defect is shown on a numbered line.",
  minutes: 30,
  difficulty: 3,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "\"If our security had been breached we would see unusual logins. We have seen unusual logins. So we have been breached, and anyone who says otherwise is just protecting their budget.\" Two different things are wrong with this. Name them, as precisely as you can, before reading on.",
      thinkSeconds: 45,
      reveal:
        "First, the form: 'if P then Q; Q; so P' affirms the consequent. Unusual logins have other causes (a new office, a travelling employee, a misconfigured scanner). The logins are evidence for a breach, perhaps strong evidence, but the argument presents them as proof. Second, the last clause attacks the motives of anyone who disagrees instead of their reasons: a circumstantial ad hominem. Notice that naming the second fault does not settle whether a breach occurred; that still depends on the evidence, which is why a diagnosis of fallacy is the start of an evaluation, not the end.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why fallacies have names and why naming is not enough",
      body: {
        standard:
          "Bad arguments cluster into recognisable patterns, and giving the patterns names lets you see in a second what would otherwise take a paragraph to explain. Two of the names cover formal errors: affirming the consequent and denying the antecedent are the valid conditional forms run backwards, and they are responsible for a large share of confident misreadings of evidence, from diagnosis to economics. The rest cover informal errors, faults of content or of conduct: attacking the person, refuting a distorted version of the position, presenting two options as the only two, assuming what was to be proved. The names are useful and also dangerous. A fallacy label is a diagnosis, and diagnoses can be wrong: an argument that looks like an appeal to authority may be a reasonable deference to expert consensus, and one that looks like a slippery slope may describe a real mechanism. Worse, announcing the label feels like a refutation and is not one. The corrective is reconstruction: writing the argument as numbered premises and a conclusion, supplying what was left unsaid, and then showing where it fails. Done charitably, reconstruction also protects you from the fallacy you are most likely to commit yourself, which is answering a weaker argument than the one you were given.",
        intuition:
          "Fallacies are named patterns of bad argument. Two are about form (the conditional run backwards); the rest are about content and conduct. Knowing the names helps you see faults fast, but the fault has to be shown, not announced, and showing it means writing the argument out.",
        deep:
          "Affirming the consequent is invalid as deduction but is the shape of ordinary evidential reasoning: P(H | E) rises when E is more likely under H than otherwise, and the size of the rise is the likelihood ratio. The fallacy is the collapse of a likelihood ratio into a certainty. Informal fallacies resist a single theory; Hamblin's Fallacies (1970) showed that the textbook tradition from Aristotle's Sophistical Refutations onward defines them inconsistently, and pragma-dialectics (van Eemeren and Grootendorst) recasts them as violations of rules for a critical discussion rather than as argument forms. Reconstruction in standard form is the tool that survives these disputes: it makes explicit the premises on which any diagnosis depends.",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Two formal fallacies, the common informal ones, and standard form",
      body: {
        standard:
          "Formal fallacies. Affirming the consequent: if P then Q; Q; therefore P. Denying the antecedent: if P then Q; not P; therefore not Q. Both treat the conditional as its converse and both become valid only if P and Q are equivalent. Their quantifier cousins are the undistributed middle (all A are B; all C are B; so all A are C) and illicit conversion (all A are B; so all B are A). Informal fallacies. Ad hominem attacks the arguer; tu quoque charges hypocrisy. Straw man refutes a weaker version of the position than the one held. False dilemma presents two options as exhaustive. Slippery slope asserts without mechanism that a first step leads to a distant disaster. Begging the question uses a premise that assumes the conclusion. Appeal to authority is fallacious when the authority is outside their field or the experts disagree. Also frequent: hasty generalisation, post hoc ergo propter hoc, equivocation, appeal to ignorance, no true Scotsman. Reconstruction. Find the conclusion, list the reasons given, ask what must be true for those reasons to support it and write that down as a premise, marked as unstated. Apply the principle of charity: supply the premise that makes the argument strongest while staying faithful to the text. Number the premises, draw a line, write the conclusion. Then evaluate in two passes: form (valid or strong?) and content (each premise acceptable?). A chained argument has an intermediate conclusion that becomes a premise later; number it once.",
        intuition:
          "Affirming the consequent and denying the antecedent are the conditional run backwards. The informal fallacies are faults of content or conduct with useful names. To show a fault rather than assert it, write the argument as numbered premises and a conclusion, add what was unsaid, and point at the line that fails.",
      },
      structure: [
        { term: "Affirming the consequent", meaning: "P → Q; Q; so P. Invalid: Q may have other causes" },
        { term: "Denying the antecedent", meaning: "P → Q; ¬P; so ¬Q. Invalid: Q may have other routes" },
        { term: "Ad hominem / tu quoque", meaning: "Attacks the arguer or their consistency, not the argument" },
        { term: "Straw man", meaning: "Refutes a weaker version than the one held" },
        { term: "False dilemma", meaning: "Two options presented as the only two" },
        { term: "Begging the question", meaning: "A premise that assumes the conclusion" },
        { term: "Standard form", meaning: "Numbered premises, a line, the conclusion; unstated premises marked" },
        { term: "Charity", meaning: "Supply the strongest faithful reading of what was left unsaid" },
        { term: "Two passes", meaning: "Form first (valid or strong?), then content (premises acceptable?)" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Reconstructing an editorial and locating its faults",
      problem:
        "\"Councils that cut library hours have seen children's literacy fall. Ours is planning cuts. Our children will pay the price, and the councillors who vote for it have clearly never opened a book.\" Reconstruct the argument in standard form, mark unstated premises, and identify every fault.",
      steps: [
        { text: "Find the conclusion: 'our children's literacy will fall' (the content of 'our children will pay the price'). The final clause about councillors is not a premise for it; set it aside for now." },
        { text: "List the stated reasons: (1) councils that cut library hours have seen literacy fall; (2) our council is planning cuts." },
        { text: "Ask what must be true for 1 and 2 to support the conclusion. The argument needs (3, unstated) cutting library hours causes literacy to fall, not merely accompanies it. Charity supplies the causal premise, because without it the argument is nothing.", note: "Writing 3 down is what exposes the weak point: 1 reports a correlation, and councils that cut libraries may also be cutting schools and be poorer to begin with." },
        { text: "Standard form. 1. Councils that cut library hours have seen literacy fall. 2. Our council is planning to cut library hours. 3. (Unstated) Cutting library hours causes literacy to fall. Therefore, our children's literacy will fall." },
        { text: "Pass one, form: with premise 3 the inference is a strong inductive prediction. Pass two, content: premise 3 is the load-bearing claim and premise 1 does not establish it; the move from 1 to 3 is post hoc reasoning (correlation taken as cause). That, not any named fallacy in the text, is where the argument fails.", note: "The verdict is a location, 'premise 3, and the inference from 1 to it', not a label." },
        { text: "Now the discarded clause. 'The councillors have clearly never opened a book' is an ad hominem: an attack on the voters' character that bears on nothing in the argument. Name it, and note that removing it leaves the argument neither stronger nor weaker." },
      ],
      answer: "A prediction resting on an unstated causal premise that the stated evidence (a correlation) does not establish; plus an ad hominem that plays no logical role.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "For conditional arguments, letter them and ask which half of the conditional the second premise asserts or denies. For informal cases, ask what the reply engages: the premises, the conclusion, the person, or a version of the position nobody holds.",
      itemIds: it(23, 27),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(24, 26, 28),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain the difference between affirming the consequent and denying the antecedent with one example of each, then describe how you would reconstruct an argument in standard form and why supplying an unstated premise charitably is fairer to the author than leaving it out.",
      keyPoints: ["affirm|consequent", "deny|antecedent", "other cause|other reason|other route|does not follow", "standard form|numbered|premise|conclusion", "unstated|missing|implicit|hidden", "charit|strongest|fair"],
      minWords: 100,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A chained argument about drug approval with an intermediate conclusion and two hidden conditionals. Reconstruct it; the form will turn out to be valid, and the work moves to the premises.",
      itemIds: it(32),
    },
  ],
});

const steelmanning = lesson({
  id: "ls-lg-fallacies-2",
  moduleId: "lg-fallacies",
  conceptIds: ["steelmanning"],
  title: "Steelmanning",
  promise: "You will be able to state a position you reject so well that its holders would adopt your wording, and then say exactly which premise you deny.",
  minutes: 30,
  difficulty: 4,
  steps: [
    {
      id: "q1",
      kind: "question",
      title: "Think first",
      prompt:
        "Pick a policy you consider plainly wrong (closing city centres to cars, say, or a four-day week for all employees). Write one sentence giving the best reason a thoughtful person might hold that view. Now ask: would such a person accept your sentence as their reason, or would they say you had missed the point?",
      thinkSeconds: 60,
      reveal:
        "First attempts usually produce a reason the opponent would not recognise: too crude, too self-interested, or a reason nobody actually gives. That gap is the subject of the lesson. A steelman is a version of the position its defenders would sign, and the test of whether you have one is not how it sounds to you but whether they would say 'yes, and better put than I put it'.",
    },
    {
      id: "in1",
      kind: "intuition",
      title: "Why criticism has to start with the strongest version",
      body: {
        standard:
          "Criticism of a weak version of a position proves nothing about the position. It may feel decisive, and audiences that already agree will applaud, but the holders of the view are untouched, because the thing refuted was not theirs. The straw man is the fallacy; steelmanning is the discipline that prevents it. It asks you to state the opposing view at its strongest, with its best evidence, its most defensible formulation of the value underneath, and the concessions it can make without collapsing, before you say a word against it. This is a requirement of rigour, not of manners. It has three payoffs. Criticism of the strongest version is the only criticism that counts. The attempt reveals whether your own view survives contact with the best opposition, which you cannot know otherwise. And it narrows disagreement: after a proper steelman you can usually say 'I accept all of this except premise three', which is a conversation, where 'you are wrong' was not. Mill's point in On Liberty (1859) was that someone who knows only their own side of a case knows little even of that. Steelmanning is not agreement; the steelmanned position may still be rejected. It is only the condition under which rejection means anything.",
        intuition:
          "State the other side so well that they would adopt your words. Then, and only then, say which premise you reject. Refuting a weak version refutes nothing; refuting the strongest version is the only criticism that counts, and the attempt tests your own view.",
        deep:
          "Dennett's statement of Rapoport's rules (Intuition Pumps, 2013) prescribes an order: re-express the target's position so clearly and fairly that they say 'I wish I had thought of putting it that way'; list any points of agreement, especially non-obvious ones; mention anything you have learned from the target; only then rebut. The rules serve an epistemic function as well as a social one. A position stated at full strength exposes its load-bearing premise, which is the one worth testing; a position stated weakly hides that premise behind faults that are easy to attack and irrelevant to the holders. The practical test of a finished steelman is therefore locational: can you name the single line at which you and the position part company, and say what evidence would move you?",
      },
    },
    {
      id: "mo1",
      kind: "model",
      title: "Rapoport's rules and the tests of a steelman",
      body: {
        standard:
          "A steelman is a restatement of a position that its best defenders would recognise as their own, or as a stronger version of it. Build it from four parts: the strongest formulation of the claim, hedged where the holders would hedge it; the best evidence and arguments available for it, including any the holders may not have cited; the value or interest underneath, stated as the holders would state it rather than as an imputed motive; and the concessions the position can make without collapsing. Then follow Rapoport's rules, as Dennett states them: restate so well the opponent would endorse it; list the points of agreement; note what you have learned; only then criticise. Two tests tell you whether you are finished. The recognition test: would the holders sign it? If they would call it a caricature, or if it imputes a motive they would deny, it is a straw man in polite dress. The location test: can you now say precisely which premise you reject and why, and what would change your mind? Until the disagreement has narrowed to a line, the steelman is incomplete. Three things a steelman is not: agreement, since the position may still be rejected; a verbatim summary, since nothing has been strengthened; and a list of objections, since those come after.",
        intuition:
          "Four parts: strongest claim, best evidence, the value underneath, honest concessions. Four steps: restate, agree, learn, criticise. Two tests: would they sign it, and can you name the one premise you reject?",
      },
      structure: [
        { term: "Recognition test", meaning: "The holders would accept the restatement as their own or better" },
        { term: "Strongest claim", meaning: "The most defensible formulation, hedged where the holders hedge" },
        { term: "Best evidence", meaning: "The strongest support available, whether or not the holders cited it" },
        { term: "Underlying value", meaning: "Stated as the holders would state it, not as an imputed motive" },
        { term: "Rapoport's rules", meaning: "Restate, list agreements, say what you learned, then criticise" },
        { term: "Location test", meaning: "Disagreement narrowed to one named premise and the evidence that would move you" },
        { term: "Not a steelman", meaning: "Agreement, verbatim summary, or a list of objections" },
      ],
    },
    {
      id: "we1",
      kind: "worked_example",
      title: "Steelmanning a return-to-office policy",
      problem:
        "You work remotely three days a week and think it is better for everyone. Your director wants the whole team in the office five days a week. Steelman the director's position, then locate your disagreement.",
      steps: [
        { text: "Strongest claim, hedged as the director would hedge it: for work that depends on coordination and on developing junior staff, co-location most of the time produces better outcomes than partial remote working, even if individuals report higher output at home." },
        { text: "Best evidence: much of what a team knows is tacit and passes through overheard conversations, quick corrections and watching how seniors handle problems, none of which is scheduled; junior staff in mostly remote teams get less of it. Coordination costs rise with dispersion, and the published evidence on remote productivity is mixed and depends on the kind of work, with some studies of fully remote arrangements finding slower skill growth or lower output for collaborative tasks.", note: "The steelman supplies evidence even if the director only said 'I want people in'." },
        { text: "Underlying value: developing people and protecting the team's ability to act quickly, not surveillance or distrust. Stating it as distrust would fail the recognition test." },
        { text: "Concessions: the position survives allowing exceptions for focused work and for people with long commutes, and it does not require that home working is unproductive for individuals." },
        { text: "Rapoport's rules: points of agreement (juniors do learn by proximity; coordination is harder when dispersed; some tasks suffer); something learned (the case is about the team's learning, not about individual output, which is where the remote-work case is strongest)." },
        { text: "Locate the disagreement: the premise that five days are needed to secure those benefits, rather than two or three anchor days on which the whole team is present. That is a testable claim, and the evidence to settle it is the team's own experience with fixed anchor days over a quarter.", note: "The argument is now about one number, and both sides could design the test." },
      ],
      answer: "A steelman built on tacit knowledge transfer, coordination and the development of junior staff, with the disagreement narrowed to whether five days rather than fixed anchor days are required.",
    },
    {
      id: "gp1",
      kind: "guided_practice",
      title: "Guided practice",
      scaffold: "Apply the recognition test to each candidate: would the holder sign it? Then check that something has been strengthened and that a position remains to argue against.",
      itemIds: it(37),
    },
    {
      id: "ip1",
      kind: "independent_practice",
      title: "Independent practice",
      itemIds: it(38),
    },
    {
      id: "eb1",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to someone preparing to argue against a colleague's proposal what a steelman is, what its four parts are, in what order Rapoport's rules go, and the two tests that tell you it is finished. Make clear why steelmanning is not the same as agreeing.",
      keyPoints: ["recogni|accept|sign|their own|endorse", "strongest|best version|evidence", "value|interest|motive", "agree|common ground|learn", "criticis|then|only then|not agree|still reject", "premise|precise|narrow|one line|which"],
      minWords: 100,
    },
    {
      id: "tr1",
      kind: "transfer",
      title: "Transfer",
      framing: "A planning dispute: residents opposing new housing. Steelman a position that is routinely caricatured, and finish with the one premise you reject.",
      itemIds: it(33),
    },
  ],
});

export const LOGIC_LESSONS: Lesson[] = [
  findingTheArgument,
  deductionAndInduction,
  necessaryAndSufficient,
  contradictionAndConsistency,
  truthTables,
  conditionals,
  quantifiers,
  fallaciesAndReconstruction,
  steelmanning,
];
