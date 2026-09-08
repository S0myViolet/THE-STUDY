/**
 * Logic — concepts (part A of the logic domain).
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Logic sits upstream of almost everything argumentative in the curriculum: causal reasoning,
 * statistics, philosophy, law and the writing course all lean on it. `dependsOn` records only
 * what would actually block a learner; `related` records the neighbours worth connecting.
 */
import type { Concept } from "@/lib/v2/content-types";

type Draft = Omit<Concept, "domainId" | "courseId" | "moduleId">;

const CORE = "logic-core";

function concept(moduleId: string, draft: Draft): Concept {
  return { domainId: "logic", courseId: CORE, moduleId, ...draft };
}

/* ------------------------------------------------------------------ */
/* Arguments                                                            */
/* ------------------------------------------------------------------ */

const args: Concept[] = [
  concept("lg-arguments", {
    id: "arguments-premises-conclusions",
    title: "Arguments, premises and conclusions",
    summary:
      "An argument is a set of statements in which some (the premises) are offered as reasons for another (the conclusion). Most prose that looks like argument is description, assertion or narrative; finding the conclusion and the reasons actually offered for it is the first skill of analysis.",
    keyPoints: [
      "An argument has at least one premise and exactly one conclusion; a passage may contain several arguments chained together, the conclusion of one serving as a premise of the next.",
      "Indicator words help but do not decide: 'therefore', 'so', 'hence', 'it follows that' point at conclusions; 'because', 'since', 'given that', 'for' point at premises. Many arguments use none of them.",
      "The conclusion is the claim the writer wants you to accept, not the last sentence, the most emotive sentence, or the sentence you disagree with.",
      "Explanations and arguments share the same words. 'The bridge fell because the bolts corroded' explains an accepted fact; 'the bolts must have corroded, because the bridge fell' argues for a disputed one.",
      "Unstated premises are normal. 'It is raining, so take an umbrella' needs 'you do not want to get wet'; the analyst's job is to write such premises down, not to pretend they are absent.",
      "A statement is something that can be true or false. Questions, commands and exclamations are not premises or conclusions until rephrased as claims.",
    ],
    dependsOn: [],
    related: ["clear-explanation", "summary-and-precis", "argument-construction", "argument-reconstruction"],
    recallPrompts: [
      { prompt: "What distinguishes an argument from an explanation, given that both use 'because'?", answer: "An argument offers reasons to accept a disputed claim; an explanation gives the cause of a claim already accepted. The test is whether the writer is trying to establish the 'because' clause's partner or account for it." },
      { prompt: "Name three conclusion indicators and three premise indicators.", answer: "Conclusion: therefore, so, hence, thus, it follows that, consequently. Premise: because, since, given that, for, as, on the grounds that.", accept: ["therefore", "because", "since", "hence"] },
      { prompt: "How many conclusions does a single argument have?", answer: "Exactly one. A passage with two conclusions contains two arguments, possibly chained.", accept: ["one", "1", "exactly one"] },
    ],
    applications: ["Reading an opinion column and stating in one sentence what it is trying to make you believe", "Turning a rambling meeting contribution into a claim and its reasons", "Deciding whether a report section is arguing or merely describing"],
    misconception: "That the conclusion is whatever comes last. Writers often lead with the conclusion, bury it in the middle, or leave it implicit; the position of a sentence is weak evidence of its role.",
    difficulty: 1,
    foundational: true,
    tags: ["foundations", "argument"],
  }),
  concept("lg-arguments", {
    id: "validity-and-soundness",
    title: "Validity and soundness",
    summary:
      "A deductive argument is valid when it is impossible for its premises to be true and its conclusion false; it is sound when it is valid and its premises are in fact true. Validity is about structure alone, which is why an argument with absurd premises can be perfectly valid.",
    keyPoints: [
      "Validity is a relation between premises and conclusion, not a property of any single statement. Statements are true or false; arguments are valid or invalid.",
      "A valid argument can have false premises and a false conclusion ('all cats are reptiles; all reptiles have fur; so all cats have fur'). What it cannot have is true premises and a false conclusion.",
      "An invalid argument can have true premises and a true conclusion; the truth is then a coincidence rather than a consequence.",
      "Sound = valid + all premises true. Only sound arguments guarantee their conclusion; to reject a sound argument's conclusion you must reject a premise or the form, and both are fixed.",
      "The counterexample test for validity: try to describe any situation, however far-fetched, in which every premise holds and the conclusion fails. If you can, the argument is invalid.",
      "Persuasiveness is neither validity nor soundness. Valid arguments from premises nobody accepts persuade no one; invalid arguments with vivid premises persuade many.",
    ],
    dependsOn: ["arguments-premises-conclusions"],
    related: ["proof-and-induction", "deduction-vs-induction", "formal-fallacies", "epistemology-knowledge-and-belief"],
    recallPrompts: [
      { prompt: "State the definition of validity without using the word 'true' about the conclusion alone.", answer: "An argument is valid when there is no possible situation in which all its premises are true and its conclusion is false." },
      { prompt: "Can a valid argument have a false conclusion? Can a sound one?", answer: "A valid argument can, if at least one premise is false. A sound argument cannot: its premises are true and its form guarantees the conclusion.", accept: ["valid yes, sound no", "yes; no"] },
      { prompt: "What is the counterexample test?", answer: "Try to construct a situation where every premise is true and the conclusion false; success proves invalidity, and failure after honest effort is evidence of validity.", accept: ["premises true and conclusion false", "counterexample"] },
    ],
    applications: ["Separating 'I disagree with the premise' from 'the reasoning does not follow' when reviewing a proposal", "Checking a mathematical or legal derivation step by step", "Recognising that a valid argument from a false premise proves nothing about the world"],
    misconception: "That 'valid' means 'true' or 'good'. In logic it means only that the conclusion follows from the premises; an argument can be valid and worthless, or invalid and accidentally right.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "validity"],
  }),
  concept("lg-arguments", {
    id: "deduction-vs-induction",
    title: "Deduction and induction",
    summary:
      "Deductive arguments claim that their conclusion follows with certainty; inductive arguments claim only that the premises make the conclusion probable. The two are judged by different standards, validity for one and strength for the other, and most reasoning about the world is inductive.",
    keyPoints: [
      "Deduction: if the premises are true the conclusion must be true (validity). Induction: if the premises are true the conclusion is probably true (strength). Neither standard applies to the other kind.",
      "A strong inductive argument with true premises can still have a false conclusion; that is not a defect but the nature of the form. 'Every observed swan is white, so the next will be' was strong until 1697, when Dutch sailors reached Western Australia.",
      "Adding premises never makes a valid argument invalid, but can make a strong inductive argument weak: induction is defeasible, deduction is monotonic.",
      "Common inductive forms: generalisation from a sample, prediction from a pattern, analogy, and inference to the best explanation (abduction).",
      "Hume's problem (1748): any argument that the future will resemble the past either assumes what it is trying to prove or is not deductive. Induction cannot be justified deductively; it can be disciplined by sample size, representativeness and calibration.",
      "The label attaches to what the argument claims, not to how confident the speaker sounds. An argument presented as certain but only probable is a weak deduction, or better, an overstated induction.",
    ],
    dependsOn: ["validity-and-soundness"],
    related: ["sampling-and-bias", "hypothesis-testing", "scientific-method", "bayes-theorem", "philosophy-of-science", "forecasting-and-calibration"],
    recallPrompts: [
      { prompt: "What standard replaces validity when judging an inductive argument?", answer: "Strength: how probable the premises make the conclusion. A strong inductive argument with true premises is called cogent.", accept: ["strength", "strong", "cogent"] },
      { prompt: "Why can adding a premise weaken an inductive argument but never invalidate a deductive one?", answer: "Deductive validity depends only on the premises already present; extra information cannot remove an entailment. Inductive strength depends on the total evidence, and new evidence can point the other way." },
      { prompt: "State Hume's problem of induction in one sentence.", answer: "Any justification of inference from observed to unobserved cases must itself assume that unobserved cases resemble observed ones, so induction cannot be given a non-circular deductive foundation.", accept: ["circular", "assumes the future resembles the past", "uniformity of nature"] },
    ],
    applications: ["Reading a clinical trial: the statistics are inductive, however confident the press release", "Distinguishing a mathematical proof from a persuasive pattern in data", "Knowing that 'it has always worked' is a strength claim, not a guarantee"],
    misconception: "That deduction goes from general to particular and induction from particular to general. Direction is not the difference; 'this coin came up heads ten times, so it is probably biased' and 'all ravens are black, so the next raven will be' are both inductive, and one goes each way.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "induction"],
  }),
  concept("lg-arguments", {
    id: "necessary-and-sufficient",
    title: "Necessary and sufficient conditions",
    summary:
      "A is sufficient for B when A guarantees B; A is necessary for B when B cannot occur without A. Most confusions in policy, law, medicine and everyday planning are one of these two relations mistaken for the other.",
    keyPoints: [
      "Sufficient: if A then B. Being a square is sufficient for being a rectangle. Sufficient conditions are usually many; there are other ways to be a rectangle.",
      "Necessary: if B then A, equivalently no B without A. Being a rectangle is necessary for being a square. Necessary conditions are commonly not enough on their own.",
      "The two are mirror images: A is sufficient for B exactly when B is necessary for A.",
      "'Only if' introduces a necessary condition; 'if' alone introduces a sufficient one; 'if and only if' introduces a condition that is both.",
      "From a necessary condition you can infer the negative case only: no oxygen, no fire. Oxygen present tells you nothing about whether there is a fire.",
      "Definitions and legal tests are usually lists of jointly sufficient and individually necessary conditions; checking one of them establishes nothing about the whole.",
    ],
    dependsOn: ["arguments-premises-conclusions"],
    related: ["conditionals-and-contrapositive", "conditional-probability", "mechanisms-and-plausibility", "contracts", "confounding"],
    recallPrompts: [
      { prompt: "'A is necessary for B' can be rewritten as which conditional?", answer: "If B then A (equivalently: if not A then not B). B cannot occur without A.", accept: ["if B then A", "if not A then not B", "no B without A"] },
      { prompt: "Which of 'if', 'only if', 'if and only if' marks a necessary condition?", answer: "'Only if'. 'A only if B' means B is necessary for A. 'If and only if' marks a condition that is both necessary and sufficient.", accept: ["only if"] },
      { prompt: "Oxygen is necessary for combustion. A room contains oxygen. What follows about fire?", answer: "Nothing. A necessary condition being present licenses no inference; only its absence does (no oxygen, so no fire).", accept: ["nothing", "nothing follows"] },
    ],
    applications: ["Reading eligibility rules: meeting one requirement is necessary, not a guarantee of acceptance", "Diagnosis: a symptom that every case shows is necessary for the disease, so its absence rules the disease out, but its presence does not rule it in", "Contracts and statutes: 'only if' clauses set conditions that must be met but do not by themselves create an obligation"],
    misconception: "That a necessary condition, once met, brings the outcome. Meeting the entry requirement is necessary for admission, and applicants who conclude they are therefore admitted have confused the two directions of the conditional.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "conditions"],
  }),
  concept("lg-arguments", {
    id: "contradiction-and-consistency",
    title: "Contradiction and consistency",
    summary:
      "A set of statements is consistent when they could all be true together and inconsistent when they cannot. A contradiction (a statement and its negation) is the strongest form of inconsistency, and detecting it is the most decisive move in criticism, because an inconsistent position is guaranteed to contain at least one falsehood.",
    keyPoints: [
      "Consistency is about possibility, not actuality: 'the meeting is in London' and 'the meeting is on Tuesday' are consistent even if both are false.",
      "Two statements can each be plausible and yet be jointly inconsistent; the fault appears only when they are placed side by side, which is why written reconstruction catches what conversation misses.",
      "A contradiction (P and not-P) is false in every possible situation. Classically, anything follows from a contradiction, which is why a single contradiction wrecks a whole theory.",
      "Contrary statements ('the wall is entirely red', 'the wall is entirely blue') cannot both be true but can both be false; contradictory statements ('the wall is red', 'the wall is not red') must have exactly one true.",
      "Reductio ad absurdum: assume the claim, derive a contradiction, conclude the claim is false. Euclid's proof that there is no largest prime has this shape.",
      "Apparent contradictions often dissolve on disambiguation: 'the shop is open' and 'the shop is closed' are contradictory only if said of the same shop at the same time in the same sense.",
    ],
    dependsOn: ["arguments-premises-conclusions"],
    related: ["proof-and-induction", "propositional-logic", "sets-and-counting", "scepticism-and-justification", "constitutions"],
    recallPrompts: [
      { prompt: "What is the difference between contrary and contradictory statements?", answer: "Contraries cannot both be true but can both be false; contradictories cannot both be true and cannot both be false, so exactly one holds.", accept: ["contraries can both be false", "exactly one of contradictories is true"] },
      { prompt: "Why does one contradiction discredit a whole position rather than one claim in it?", answer: "Because an inconsistent set is guaranteed to contain at least one falsehood, and classically a contradiction entails every statement, so nothing in the theory is any longer supported by it.", accept: ["at least one false", "anything follows"] },
      { prompt: "Describe the structure of a reductio ad absurdum.", answer: "Assume the claim to be refuted; derive a contradiction from it together with accepted premises; conclude that the assumption is false.", accept: ["assume then derive a contradiction", "reductio"] },
    ],
    applications: ["Cross-examination: placing two of a witness's statements side by side", "Auditing a strategy document for goals that cannot all be met", "Checking that a model's assumptions are jointly satisfiable before trusting its output"],
    misconception: "That inconsistency means one of the statements is false 'as far as we can tell'. It is stronger than that: an inconsistent set contains a falsehood with certainty, whatever the evidence for each member.",
    difficulty: 3,
    tags: ["consistency"],
  }),
];

/* ------------------------------------------------------------------ */
/* Formal basics                                                        */
/* ------------------------------------------------------------------ */

const formal: Concept[] = [
  concept("lg-formal", {
    id: "propositional-logic",
    title: "Propositional logic",
    summary:
      "Propositional logic treats whole statements as units joined by connectives (not, and, or, if–then, if and only if) whose meaning is fixed by truth tables. Once an argument is written in these symbols, validity can be checked mechanically, and a great many everyday arguments turn out to be one of a handful of forms.",
    keyPoints: [
      "Five connectives: ¬P (not), P ∧ Q (and), P ∨ Q (inclusive or), P → Q (if P then Q), P ↔ Q (if and only if). Each has a truth table; a compound statement's truth depends only on its parts.",
      "A truth table for n atomic statements has 2ⁿ rows; an argument is valid exactly when no row makes every premise true and the conclusion false.",
      "P → Q is false in exactly one row: P true, Q false. This makes 'if' in logic wider than 'if' in speech, which usually implies a connection between P and Q.",
      "De Morgan's laws: ¬(P ∧ Q) is equivalent to ¬P ∨ ¬Q, and ¬(P ∨ Q) to ¬P ∧ ¬Q. 'Not both' is not 'neither'.",
      "The core valid forms: modus ponens (P → Q, P, so Q), modus tollens (P → Q, ¬Q, so ¬P), hypothetical syllogism (P → Q, Q → R, so P → R), disjunctive syllogism (P ∨ Q, ¬P, so Q).",
      "A tautology is true in every row, a contradiction false in every row, and a contingent statement true in some. Two statements are equivalent when their columns match.",
    ],
    dependsOn: ["validity-and-soundness"],
    related: ["sets-and-counting", "computation-and-programs", "conditionals-and-contrapositive", "contradiction-and-consistency", "probability-rules"],
    recallPrompts: [
      { prompt: "In which single row of its truth table is P → Q false?", answer: "When P is true and Q is false. In the other three rows it is true.", accept: ["P true Q false", "P true and Q false", "true false"] },
      { prompt: "State both De Morgan laws.", answer: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q.", accept: ["not (P and Q) is not P or not Q", "not P or not Q", "not P and not Q"] },
      { prompt: "How many rows does a truth table for three atomic statements have, and how do you use it to test validity?", answer: "Eight. Look for a row in which every premise is true and the conclusion false; if there is none the argument is valid.", accept: ["8", "eight"] },
    ],
    applications: ["Writing a search filter or spreadsheet condition that means what you intended", "Checking a chain of 'if' clauses in a policy or contract", "Reading a circuit, a Boolean query or a program's branching as logic"],
    misconception: "That 'or' means 'one or the other but not both'. In logic and in most legal and technical writing 'or' is inclusive; the exclusive reading has to be stated ('either … or … but not both').",
    difficulty: 3,
    foundational: true,
    tags: ["formal", "truth-tables"],
  }),
  concept("lg-formal", {
    id: "conditionals-and-contrapositive",
    title: "Conditionals and the contrapositive",
    summary:
      "From 'if P then Q' three other statements can be built by swapping or negating: the converse (if Q then P), the inverse (if not P then not Q) and the contrapositive (if not Q then not P). Only the contrapositive is equivalent to the original; treating the converse or inverse as equivalent is the most common error in conditional reasoning.",
    keyPoints: [
      "Contrapositive: P → Q is equivalent to ¬Q → ¬P. 'If it is a square it has four sides' says the same as 'if it lacks four sides it is not a square'.",
      "Converse: Q → P. Not equivalent. Every square has four sides; not every four-sided figure is a square.",
      "Inverse: ¬P → ¬Q. Not equivalent; it is the contrapositive of the converse, so converse and inverse stand or fall together.",
      "Modus ponens uses the conditional forwards (P, so Q); modus tollens uses it backwards through the contrapositive (¬Q, so ¬P). Both are valid.",
      "The Wason selection task (1966) shows how hard this is in practice: asked which cards to turn to test 'if a card has a vowel on one side it has an even number on the other', most people check the vowel and the even number; the correct choice is the vowel and the odd number, the cases that could falsify the rule.",
      "Proof by contrapositive: to show P → Q, assume ¬Q and derive ¬P. Often easier than the direct route, and the standard way to prove 'if n² is even then n is even'.",
    ],
    dependsOn: ["necessary-and-sufficient", "propositional-logic"],
    related: ["proof-and-induction", "conditional-probability", "formal-fallacies", "hypothesis-testing", "scientific-method"],
    recallPrompts: [
      { prompt: "Write the contrapositive of 'if it rains, the match is cancelled'.", answer: "If the match is not cancelled, it did not rain.", accept: ["if the match is not cancelled then it did not rain", "not cancelled, not rained"] },
      { prompt: "Which of converse, inverse and contrapositive is equivalent to the original conditional?", answer: "Only the contrapositive. The converse and inverse are equivalent to each other but not to the original.", accept: ["contrapositive"] },
      { prompt: "In the Wason task with cards E, K, 4, 7 and the rule 'vowel implies even', which cards must be turned?", answer: "E (to check that the other side is even) and 7 (to check that the other side is not a vowel). K and 4 cannot falsify the rule.", accept: ["E and 7", "E, 7"] },
    ],
    applications: ["Testing a rule or hypothesis: look for the case that could break it, not the case that fits it", "Reading a guarantee: 'if it fails within a year we replace it' says nothing about failures after a year", "Mathematical proof by contraposition"],
    misconception: "That 'if P then Q' and 'if Q then P' say the same thing. They coincide only when P and Q are equivalent, which is a special case that has to be established separately.",
    difficulty: 3,
    foundational: true,
    tags: ["formal", "conditionals"],
  }),
  concept("lg-formal", {
    id: "quantifiers",
    title: "Quantifiers",
    summary:
      "'All', 'some', 'none' and 'not all' are the quantifiers, and most reasoning about categories turns on how they negate and how they nest. Negating a universal gives an existential, not another universal, and the order of two quantifiers changes what a sentence means.",
    keyPoints: [
      "Four categorical forms: all A are B; no A are B; some A are B; some A are not B. 'All' and 'some are not' are contradictories, as are 'no' and 'some are'.",
      "The negation of 'all swans are white' is 'some swan is not white', not 'no swans are white'. One counterexample refutes a universal; refuting an existential requires checking everything.",
      "'All A are B' does not imply 'all B are A' (the converse fails for universals) and does not by itself say that any A exists.",
      "Order matters when quantifiers nest: 'everyone admires someone' (∀x∃y) is weaker than 'there is someone everyone admires' (∃y∀x). The second implies the first; the first does not imply the second.",
      "Valid syllogisms chain universals: all A are B, all B are C, so all A are C. The undistributed middle (all A are B, all C are B, so all A are C) is invalid: all cats are mammals, all dogs are mammals.",
      "'Some' in logic means 'at least one' and does not exclude 'all'. Frege's 1879 notation made these distinctions mechanical after two millennia of Aristotelian syllogistic.",
    ],
    dependsOn: ["propositional-logic"],
    related: ["sets-and-counting", "proof-and-induction", "hypothesis-testing", "sampling-and-bias"],
    recallPrompts: [
      { prompt: "What is the negation of 'every student passed'?", answer: "At least one student did not pass. Not 'every student failed'.", accept: ["some student did not pass", "at least one student did not pass", "not every student passed"] },
      { prompt: "Which implies which: 'everyone has a favourite book' and 'there is a book that is everyone's favourite'?", answer: "The second implies the first. From 'a single book is everyone's favourite' it follows that each person has one; the reverse fails because favourites can differ.", accept: ["second implies first", "there is a book implies everyone has"] },
      { prompt: "Why is 'all A are B, all C are B, therefore all A are C' invalid? Give a counterexample.", answer: "The middle term B is not distributed: A and C can both fall inside B without overlapping. All cats are mammals, all dogs are mammals, but no cat is a dog.", accept: ["undistributed middle", "cats and dogs", "cats dogs mammals"] },
    ],
    applications: ["Reading a study's claim: 'no effect was found' versus 'an absence of effect was found'", "Specification writing: 'every request has a handler' versus 'one handler serves every request'", "Refuting a generalisation with a single well-chosen counterexample"],
    misconception: "That the opposite of 'all' is 'none'. The opposite (contradictory) of 'all A are B' is 'some A is not B'; 'none' is a much stronger claim that the negation does not license.",
    difficulty: 3,
    tags: ["formal", "quantifiers"],
  }),
];

/* ------------------------------------------------------------------ */
/* Fallacies and reconstruction                                         */
/* ------------------------------------------------------------------ */

const fallacies: Concept[] = [
  concept("lg-fallacies", {
    id: "formal-fallacies",
    title: "Formal fallacies",
    summary:
      "A formal fallacy is an argument whose form is invalid whatever its subject matter. Two of them, affirming the consequent and denying the antecedent, are the valid forms modus ponens and modus tollens run in the wrong direction, and they account for a large share of confident bad reasoning about evidence.",
    keyPoints: [
      "Affirming the consequent: if P then Q; Q; therefore P. 'If the server is down the site is unreachable; the site is unreachable; so the server is down.' Q may have other causes.",
      "Denying the antecedent: if P then Q; not P; therefore not Q. 'If you study you will pass; you did not study; so you will fail.' Passing may have other routes.",
      "Both fallacies treat the conditional as if it were its converse; both become valid only if P and Q are equivalent (if and only if), which must be shown, not assumed.",
      "Undistributed middle: all A are B; all C are B; so all A are C. Illicit conversion: all A are B; so all B are A. These are the quantifier versions of the same error.",
      "Affirming the consequent is often reasonable as probabilistic evidence (Q raises the probability of P) but never as proof; the mistake is presenting an inductive update as a deductive certainty.",
      "Formal fallacies are detected by substitution: replace the content with letters and try a counterexample with the same shape. If the shape admits one, the argument is invalid whatever its content.",
    ],
    dependsOn: ["conditionals-and-contrapositive"],
    related: ["bayes-theorem", "confounding", "hypothesis-testing", "informal-fallacies", "cognitive-biases"],
    recallPrompts: [
      { prompt: "Write out the form of affirming the consequent and say why it is invalid.", answer: "If P then Q; Q; therefore P. Invalid because Q can be true for reasons other than P; the conditional only says P guarantees Q, not that Q guarantees P.", accept: ["if P then Q, Q, therefore P", "Q has other causes"] },
      { prompt: "Which valid form does denying the antecedent imitate?", answer: "Modus tollens. Modus tollens denies the consequent (¬Q, so ¬P); denying the antecedent denies the wrong half (¬P, so ¬Q).", accept: ["modus tollens"] },
      { prompt: "When does 'if P then Q; Q; so P' become valid?", answer: "Only when the conditional is a biconditional (P if and only if Q), so that Q also guarantees P.", accept: ["biconditional", "if and only if", "iff"] },
    ],
    applications: ["Diagnosis: a symptom consistent with a disease does not establish it (affirming the consequent)", "Reading a model's prediction: the data fitting the model does not prove the model", "Policy: 'the reform was not adopted and the problem persists' proves nothing about the reform"],
    misconception: "That because the conclusion of a fallacious argument is often true, the argument was fine. Validity is about whether the premises guarantee the conclusion, and a fallacy that happens to land on the truth has still given no reason for it.",
    difficulty: 3,
    foundational: true,
    tags: ["fallacies", "formal"],
  }),
  concept("lg-fallacies", {
    id: "informal-fallacies",
    title: "Informal fallacies",
    summary:
      "Informal fallacies are patterns of argument that fail through their content, context or the way they engage the listener rather than through their logical form: attacking the person, misrepresenting the opponent, offering a false choice, or assuming what is to be proved. Naming them is useful; naming them accurately is harder than the lists suggest.",
    keyPoints: [
      "Ad hominem attacks the arguer instead of the argument; tu quoque ('you do it too') is the variant that charges hypocrisy. Neither bears on whether the claim is true, though an arguer's bias can bear on how much to trust their testimony.",
      "Straw man: refuting a weaker version of the opponent's position than the one held. The cure is steelmanning. Motte-and-bailey is the reverse: defending a modest claim when challenged, then returning to the ambitious one.",
      "False dilemma: presenting two options as exhaustive when others exist. Slippery slope: asserting without evidence that a first step makes a distant bad outcome inevitable.",
      "Begging the question (petitio principii): a premise that assumes the conclusion, usually reworded. This is its technical sense; 'raises the question' is a different phrase.",
      "Appeal to authority is fallacious when the authority is outside their field, or when the matter is one experts dispute; deference to relevant expert consensus is not a fallacy but ordinary good sense.",
      "Also frequent: hasty generalisation (sample too small or unrepresentative), post hoc ergo propter hoc (sequence taken for cause), equivocation (a word shifting meaning mid-argument), appeal to ignorance (absence of proof taken as proof of absence), and no true Scotsman (redefining the category to dodge a counterexample).",
    ],
    dependsOn: ["arguments-premises-conclusions", "validity-and-soundness"],
    related: ["cognitive-biases", "social-influence", "correlation-vs-causation", "sampling-and-bias", "argument-construction", "steelmanning"],
    recallPrompts: [
      { prompt: "What is the difference between a straw man and a motte-and-bailey?", answer: "A straw man misrepresents the opponent's position as weaker than it is. A motte-and-bailey is a move by the arguer: retreating to an easily defended modest claim when pressed, then resuming the ambitious one.", accept: ["straw man misrepresents the opponent", "retreat to the modest claim"] },
      { prompt: "When is an appeal to authority not a fallacy?", answer: "When the authority is a relevant expert on a matter within their field and the expert community is broadly in agreement; deferring then is reasonable evidence, not proof.", accept: ["relevant expert", "within their field", "consensus"] },
      { prompt: "Define begging the question in its technical sense.", answer: "Using a premise that assumes the truth of the conclusion, so that the argument is circular. It does not mean 'raising a question'.", accept: ["circular", "assumes the conclusion", "petitio principii"] },
    ],
    applications: ["Reading political debate without being moved by attacks on the speaker", "Spotting a false dilemma in a business case ('we either expand now or lose the market')", "Noticing when one's own reply to a critic answers a weaker version of what they said"],
    misconception: "That naming a fallacy refutes the argument. A fallacy label is a diagnosis of a defect, and the diagnosis can be wrong; the argument should be reconstructed and the defect shown, not merely announced.",
    difficulty: 2,
    tags: ["fallacies", "informal"],
  }),
  concept("lg-fallacies", {
    id: "argument-reconstruction",
    title: "Argument reconstruction",
    summary:
      "Reconstruction rewrites a passage as a numbered list of premises and a conclusion, adding the unstated premises the argument needs and stripping rhetoric. It is the step that turns a vague sense that something is wrong into a specific claim about which premise fails or where the inference breaks.",
    keyPoints: [
      "Standard form: numbered premises, a line, the conclusion. Every premise should be a complete statement that could be true or false on its own.",
      "Find the conclusion first, then the reasons offered for it; then ask what would have to be true for those reasons to support it, and write that down as a premise.",
      "The principle of charity: supply the missing premise that makes the argument as strong as the text allows, not the weakest one that makes it easy to refute.",
      "Chains: an intermediate conclusion becomes a premise of the next step. Number it once and reuse the number.",
      "Once in standard form, evaluate in two passes: is the inference valid or strong (form), and is each premise acceptable (content)? A disagreement can then be located in one line.",
      "Reconstruction is also a reading test: if you cannot write the argument in standard form, you have not yet understood it, whatever your opinion of it.",
    ],
    dependsOn: ["arguments-premises-conclusions", "validity-and-soundness", "necessary-and-sufficient"],
    related: ["summary-and-precis", "evidence-and-support", "interpreting-research", "steelmanning", "informal-fallacies"],
    recallPrompts: [
      { prompt: "What is the principle of charity in reconstruction?", answer: "When supplying unstated premises or resolving ambiguity, choose the reading that makes the argument strongest while staying faithful to the text.", accept: ["strongest", "charity", "most reasonable reading"] },
      { prompt: "What are the two passes of evaluation once an argument is in standard form?", answer: "Check the form (is the inference valid or strong?) and then the content (is each premise acceptable?).", accept: ["form and content", "validity then premises", "inference then premises"] },
      { prompt: "'The cafe must be closed, the lights are off.' Reconstruct it with the missing premise.", answer: "1. The lights are off. 2. If the cafe were open the lights would be on. Therefore, the cafe is closed. (Modus tollens; premise 2 is the unstated one.)", accept: ["if open then lights on", "lights would be on"] },
    ],
    applications: ["Preparing to reply to a proposal: reconstruct it, then object to a numbered line", "Reading a court judgment or editorial for its actual chain of reasoning", "Summarising a paper's argument rather than its findings"],
    misconception: "That adding a premise the author did not state is putting words in their mouth. Every argument in ordinary prose omits premises; writing them down is what makes the argument assessable, provided charity governs the choice.",
    difficulty: 3,
    foundational: true,
    tags: ["reconstruction"],
  }),
  concept("lg-fallacies", {
    id: "steelmanning",
    title: "Steelmanning",
    summary:
      "To steelman a position is to state it in the strongest form its best defenders would recognise, before criticising it. It is the opposite of the straw man, the discipline that makes criticism worth taking seriously, and the fastest way to discover whether one's own view survives contact with the opposition.",
    keyPoints: [
      "A steelman is a version the other side would accept as their own or better; if they would not sign it, it is not a steelman.",
      "Rapoport's rules, as stated by Daniel Dennett (2013): restate the position so well the opponent says 'I wish I had put it that way'; list points of agreement; note what you have learned; only then criticise.",
      "Steelmanning includes the best evidence for the view, its strongest formulation of the underlying value, and the concessions it can make without collapsing.",
      "It is not agreeing. A steelmanned position can still be rejected; the rejection is then of the position rather than of a caricature.",
      "Mill (1859): 'He who knows only his own side of the case knows little of that.' A view held without knowing the strongest case against it is held by accident.",
      "The practical test: after your steelman, can you say precisely which premise you reject and why? If the disagreement has not narrowed to a line, the steelman is unfinished.",
    ],
    dependsOn: ["argument-reconstruction", "informal-fallacies"],
    related: ["counterargument-and-steelman", "scepticism-and-justification", "negotiation-basics", "diplomacy-and-negotiation", "epistemology-knowledge-and-belief"],
    recallPrompts: [
      { prompt: "State Rapoport's rules in order.", answer: "Restate the opponent's position so well they would endorse it; list points of agreement; say what you learned from them; only then offer criticism.", accept: ["restate, agree, learn, criticise", "restate so well they endorse it"] },
      { prompt: "What is the test of whether a restatement is a genuine steelman?", answer: "Whether the position's best defenders would recognise and accept it as their view, or as a stronger version of it.", accept: ["opponent would accept it", "defenders would recognise it"] },
      { prompt: "Why is steelmanning useful to someone who intends to disagree?", answer: "Because criticism of the strongest version is the only criticism that counts, and because the attempt reveals whether one's own position survives the best opposing case.", accept: ["criticism of the strongest version", "tests your own view"] },
    ],
    applications: ["Writing the counterargument section of an essay", "Negotiation: stating the other side's interests better than they did before proposing terms", "Reviewing a rival theory or a competitor's strategy without contempt"],
    misconception: "That steelmanning means being nice or conceding. It is a rigour requirement on criticism: attack the best version or you have attacked nothing.",
    difficulty: 4,
    tags: ["reconstruction", "charity"],
  }),
];

export const LOGIC_CONCEPTS: Concept[] = [...args, ...formal, ...fallacies];
