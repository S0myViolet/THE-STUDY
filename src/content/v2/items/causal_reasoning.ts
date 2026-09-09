import type { PracticeItem } from "@/lib/v2/content-types";

/**
 * Practice items for causal reasoning. Ids: it-causal-reasoning-<nn>. British spelling throughout.
 *
 * 01–03 confounding and reverse causality; 04–05 selection and survivorship; 06 counterfactuals;
 * 07 natural experiments; 08–09 causal graphs; 10 randomised experiments; 11 mechanisms and
 * plausibility; 14 a foundation true/false on randomisation. 12–13 are exam-only and never appear
 * in Train or in a lesson.
 *
 * Most items are mcq, short or free; free items carry keyPoints (offline grading) and a rubric
 * (model grading). commonErrors use CAUSAL_ERROR for a wrong causal reading and EVIDENCE_ERROR for
 * mishandling what the evidence can bear.
 */
export const ITEMS_CAUSAL_REASONING: PracticeItem[] = [
  /* ---------------------------------------------------------------- */
  /* Confounding and reverse causality                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-01",
    skill: "causal_reasoning",
    subskill: "confounding",
    concepts: ["confounding", "correlation-vs-causation"],
    level: "basic",
    difficulty: 2,
    format: "mcq",
    prompt: "Across countries, the number of television sets per person is strongly correlated with life expectancy. A columnist proposes shipping televisions to poor countries to raise life expectancy. What is the most likely structure behind the correlation?",
    options: [
      "A third variable, national income, raises both television ownership and life expectancy (through sanitation, nutrition and health care); televisions themselves do nothing for longevity.",
      "Television ownership causes longer life, probably through the health information broadcast.",
      "Longer life causes television ownership, since older people watch more television.",
      "The correlation is a coincidence produced by the small number of countries.",
    ],
    answer: 0,
    solution:
      "A correlation between A and B can arise because A causes B, B causes A, something else causes both, or the sample was selected in a way that links them. Here the something else is obvious once named: richer countries have more televisions and also cleaner water, better food and hospitals. Income is a confounder, a common cause of both variables, and it produces the correlation without any causal path from screens to lifespans. Shipping televisions would move the marker and not the thing it marks. Option 2 supplies a mechanism, which is what a confounded correlation invites people to do; the test is whether the association survives holding income fixed, and it does not. Option 3 is a reverse-causal story that has the individual-level fact (older people watch more) doing work it cannot do at the country level. Option 4 is wrong on the facts: the correlation is strong across nearly two hundred countries, and being real is different from being causal.",
    method: "For any correlation, list the four structures (A→B, B→A, common cause, selection) and ask which survives; name a specific common cause and check whether the association holds within levels of it.",
    hints: ["What do countries with many televisions also have a lot of?", "Would giving televisions to a poor country change its water supply?", "Which option names a variable that causes both things?"],
    commonErrors: [
      { description: "Accepted the causal reading and invented a mechanism for it.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Reversed the arrow with an individual-level story applied to countries.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Dismissed a real correlation as chance rather than explaining it.", category: "EVIDENCE_ERROR", optionIndex: 3 },
    ],
    transfer: 0,
    minutes: 2,
    examEligible: true,
    tags: ["confounding"],
    origin: "seeded",
  },
  {
    id: "it-causal-reasoning-02",
    skill: "causal_reasoning",
    subskill: "confounding_and_reverse_causality",
    concepts: ["confounding", "reverse-causality", "randomised-experiments"],
    level: "intermediate",
    difficulty: 3,
    format: "free",
    prompt: "A hospital finds that patients who receive more visitors during their stay are discharged sooner, and proposes extending visiting hours to speed recovery. In 80 to 150 words, give two distinct non-causal explanations for the pattern, and describe one study design that would tell the hospital whether extending visiting hours actually shortens stays.",
    keyPoints: [
      "sicker|severity|serious|ill|condition|prognosis|intensive care",
      "reverse|because they are recovering|already getting better|well enough|discharged soon anyway",
      "family|support|wealth|income|social|network|resources",
      "random|assign|experiment|trial|control|natural experiment|policy change|difference",
    ],
    rubric: [
      { criterion: "Names a confounder that affects both visits and discharge", weight: 0.3, description: "Severity of illness (very sick patients in intensive care receive fewer visits and stay longer) or social and financial resources (patients with strong support networks are both visited more and cared for better at home)." },
      { criterion: "Names reverse causality", weight: 0.3, description: "Patients who are recovering are more able to receive visitors and are about to be discharged anyway; recovery causes visits, not the reverse." },
      { criterion: "Proposes a design that breaks the confounding", weight: 0.4, description: "Randomly assign wards or admission periods to extended versus standard hours and compare stays; or exploit a policy change on some wards but not others with a difference-in-differences comparison." },
    ],
    solution:
      "Two explanations without any effect of visiting. First, confounding by severity: the sickest patients are in intensive care or isolation, receive few visitors, and stay longest; the least sick are on open wards, receive many, and leave soon. Second, reverse causality: as patients recover they become well enough to receive visitors, so visits rise in the days before discharge because discharge is approaching. A third candidate is social support: patients with families nearby are visited more and also have better care waiting at home, which lets clinicians discharge them earlier. A design that answers the question has to move visiting hours for reasons unrelated to the patient: randomise wards (or admission weeks) to extended versus standard hours and compare lengths of stay, adjusting for case mix; or, if the hospital introduces extended hours on some wards first, compare the change in stays on those wards with the change on the others over the same period. Either way the comparison is between groups that differ in visiting policy and nothing else.",
    method: "List the confounders and the reverse-causal story before proposing anything; then find or make variation in the cause that is unrelated to the outcome.",
    hints: ["Which patients are least able to receive visitors, and how long do they stay?", "Does being about to go home make visitors more or less likely?", "How could visiting hours be changed for reasons that have nothing to do with the patient?"],
    commonErrors: [
      { description: "Accepted that visitors speed recovery and proposed only to measure how much.", category: "CAUSAL_ERROR", pattern: "visitors speed|visitors cause|visitors help patients recover" },
      { description: "Proposed a larger observational sample as the design.", category: "EVIDENCE_ERROR", pattern: "more data|bigger sample|survey more patients|larger study of the same" },
    ],
    transfer: 1,
    minutes: 8,
    examEligible: true,
    tags: ["confounding", "reverse-causality", "free-response"],
    origin: "seeded",
  },
  {
    id: "it-causal-reasoning-03",
    skill: "causal_reasoning",
    subskill: "reverse_causality",
    concepts: ["reverse-causality", "correlation-vs-causation"],
    level: "basic",
    difficulty: 2,
    format: "mcq",
    prompt: "Across cities, the number of police officers per resident is positively correlated with the crime rate. A commentator concludes that police presence provokes crime. What is the most plausible reading?",
    options: [
      "Cities hire more police in response to high crime; the arrow runs from crime to police, and the correlation would appear even if police reduced crime.",
      "Police presence causes crime, as the commentator says.",
      "The correlation shows that police have no effect on crime.",
      "Crime and police numbers are both random, so any correlation is meaningless.",
    ],
    answer: 0,
    solution:
      "A correlation is symmetric; a cause is not. Cities do not hire police at random: they hire in response to crime, so high-crime cities end up with more officers. That is reverse causality, and it produces a positive correlation even when police reduce crime, because the reduction only partly offsets the higher level that prompted the hiring. The way to learn the effect of police on crime is to find changes in police numbers that were not responses to crime: the economist Steven Levitt used the timing of mayoral elections, and Jonathan Klick and Alexander Tabarrok used terror-alert levels in Washington, D.C., which put more police on the streets for reasons unrelated to local crime; both found that more police meant less crime. Option 3 mistakes 'the correlation cannot show the effect' for 'there is no effect'. Option 4 dismisses a systematic pattern as noise.",
    method: "Ask which variable responds to which in time; when the supposed effect is what decides the supposed cause, look for variation in the cause that was not a response.",
    hints: ["Why does a city decide to hire more police?", "If police reduced crime, would high-crime cities still have more of them?", "What kind of change in police numbers would not be a response to crime?"],
    commonErrors: [
      { description: "Accepted the causal direction stated by the commentator.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Concluded 'no effect' from a correlation that cannot identify the effect.", category: "EVIDENCE_ERROR", optionIndex: 2 },
      { description: "Dismissed a systematic correlation as randomness.", category: "EVIDENCE_ERROR", optionIndex: 3 },
    ],
    transfer: 0,
    minutes: 2,
    examEligible: true,
    tags: ["reverse-causality"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Selection and survivorship                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-04",
    skill: "causal_reasoning",
    subskill: "selection_bias",
    concepts: ["selection-bias", "conditional-probability", "causal-graphs"],
    level: "intermediate",
    difficulty: 4,
    format: "mcq",
    prompt: "In the general population, diabetes and a certain lung disease are unrelated: having one tells you nothing about having the other. A researcher studies patients admitted to a hospital and finds that among them, patients with diabetes are less likely to have the lung disease. What is the most likely explanation?",
    options: [
      "Selection: either disease is enough to get a person admitted, so among the admitted, a patient without diabetes is more likely to be there because of the lung disease. Conditioning on admission manufactures a negative association that does not exist in the population.",
      "Diabetes protects against the lung disease through a metabolic mechanism.",
      "The hospital's diabetic patients receive better care, which prevents lung disease.",
      "The lung disease is under-diagnosed in diabetic patients because their doctors focus on blood sugar.",
    ],
    answer: 0,
    solution:
      "This is Berkson's paradox, described by Joseph Berkson in 1946. Admission to hospital is caused by either disease. When you look only at admitted patients, you condition on a common effect of the two diseases, and that induces a negative association between them: a patient in the hospital who does not have diabetes must have been admitted for something, which makes the lung disease more likely for them than for a diabetic patient who already had a reason to be there. Nothing biological is needed. In the language of causal graphs, admission is a collider (diabetes → admission ← lung disease), and conditioning on a collider opens a path between its causes. Options 2, 3 and 4 each propose a real mechanism for an association that is an artefact of the sample, and each would be refuted by the population data, which show no association at all.",
    method: "When a group was selected on something both variables cause, expect a spurious association among the selected; compare with the unselected population before proposing a mechanism.",
    hints: ["What gets a person into the hospital?", "Among people already in hospital, if one is not diabetic, what does that tell you about why they are there?", "Which option explains the finding without any biology?"],
    commonErrors: [
      { description: "Proposed a biological mechanism for an association created by selection.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Proposed a treatment mechanism for an association created by selection.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Proposed a measurement mechanism for an association created by selection.", category: "ASSUMPTION", optionIndex: 3 },
    ],
    transfer: 1,
    minutes: 4,
    examEligible: true,
    tags: ["selection-bias", "berkson", "collider"],
    origin: "seeded",
  },
  {
    id: "it-causal-reasoning-05",
    skill: "causal_reasoning",
    subskill: "survivorship_bias",
    concepts: ["survivorship-bias", "selection-bias", "base-rates"],
    level: "intermediate",
    difficulty: 3,
    format: "free",
    prompt: "A business book studies twenty companies that grew tenfold in a decade and finds that all twenty made a large, risky bet early in their history. It concludes that bold early bets are the key to extraordinary growth. In 80 to 150 words, explain what is wrong with the inference and what data would be needed to test the claim properly.",
    keyPoints: [
      "fail|failed|went bust|bankrupt|did not survive|collapsed|disappeared",
      "survivor|survivorship|selected on|chosen because|only the winners|outcome",
      "denominator|base rate|how many|all companies|of those that|proportion|comparison",
      "did not make|without a bold bet|cautious|compare",
    ],
    rubric: [
      { criterion: "Identifies selection on the outcome", weight: 0.35, description: "The twenty were chosen for having succeeded; whatever they share may be shared just as widely by companies that failed." },
      { criterion: "Names the missing group", weight: 0.3, description: "Companies that made bold early bets and failed, which are not in any list of successes; and successful companies that were cautious." },
      { criterion: "Specifies the data that would test the claim", weight: 0.35, description: "Start from all companies (or all that made a bold bet) at the beginning of the decade, and compare the success rate of bold and cautious ones: P(success | bold) against P(success | cautious), not P(bold | success)." },
    ],
    solution:
      "The twenty companies were selected because they succeeded. Everything observed about them is therefore conditional on success, and the question the book wants to answer runs the other way: given a bold early bet, how likely is success? The two probabilities can differ enormously. If a thousand start-ups made bold early bets and twenty grew tenfold while nine hundred and eighty failed, the bet would be present in every success story and be a terrible strategy. The failures are invisible because failed companies are not written about, which is the survivorship in survivorship bias. A proper test starts from the full population at the beginning of the decade, records which companies made bold early bets, and compares the rate of tenfold growth (and the rate of failure) between the bold and the cautious. Without the denominator, 'all twenty did it' is a fact about the sample, not about the strategy.",
    method: "Ask how the cases were chosen; if on the outcome, the missing cases are those with the same feature and the other outcome. Reframe the claim as P(outcome | feature) and find the denominator.",
    hints: ["How were the twenty companies chosen: by what they did, or by how they ended up?", "Where are the companies that made bold early bets and failed?", "Write the claim as a probability. Which way round does the book's evidence run?"],
    commonErrors: [
      { description: "Treated the shared feature as evidence for the strategy.", category: "CAUSAL_ERROR", pattern: "shows that bold bets|proves that risk|the key is|because all twenty" },
      { description: "Asked for more success stories rather than the failures.", category: "EVIDENCE_ERROR", pattern: "more companies that succeeded|larger sample of successful|study more winners" },
    ],
    transfer: 1,
    minutes: 8,
    examEligible: true,
    tags: ["survivorship-bias", "free-response"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Counterfactuals                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-06",
    skill: "causal_reasoning",
    subskill: "counterfactual_reasoning",
    concepts: ["counterfactuals", "correlation-vs-causation"],
    level: "intermediate",
    difficulty: 3,
    format: "mcq",
    prompt: "A retailer runs an advertising campaign in November and sales rise 10 % compared with October. The marketing director reports a 10 % effect. Last year, with no campaign, November sales rose 8 % over October. What is the best estimate of the campaign's effect, and why?",
    options: [
      "About 2 percentage points, with considerable uncertainty: the relevant comparison is with what November sales would have been without the campaign, and last year's seasonal rise of 8 % is the best available proxy for that counterfactual.",
      "10 %, since that is the measured change in sales.",
      "18 %, adding this year's rise to last year's.",
      "Zero, since sales rose last year without a campaign.",
    ],
    answer: 0,
    solution:
      "The effect of the campaign is the difference between what happened and what would have happened without it. What happened is a 10 % rise. What would have happened is unobservable, so it has to be estimated, and the October-to-November change of a year without a campaign is a reasonable, imperfect stand-in: it captures the seasonal rise that would have occurred anyway. The estimate is 10 − 8 = 2 percentage points, and it is uncertain because this November differs from last in weather, competitors and the economy. Option 2 credits the campaign with the whole change, including the seasonal rise. Option 3 has no logic. Option 4 assumes that because a rise can happen without a campaign, this rise must have; that is the opposite error, denying any effect because the counterfactual is not zero. A better design would run the campaign in some regions and not others in the same November, so that the counterfactual is observed in the untreated regions rather than borrowed from last year.",
    method: "Define the effect as actual outcome minus counterfactual outcome; find the best available estimate of the counterfactual; report the difference with its uncertainty.",
    hints: ["What would November sales have done with no campaign at all?", "What evidence in the prompt speaks to that question?", "Effect = what happened − what would have happened."],
    commonErrors: [
      { description: "Attributed the whole before-after change to the intervention, ignoring the seasonal counterfactual.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Added the two changes together.", category: "LOGIC_ERROR", optionIndex: 2 },
      { description: "Concluded 'no effect' because the outcome could have occurred without the cause.", category: "CAUSAL_ERROR", optionIndex: 3 },
    ],
    transfer: 1,
    minutes: 3,
    examEligible: true,
    tags: ["counterfactual", "before-after"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Natural experiments                                                */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-07",
    skill: "causal_reasoning",
    subskill: "natural_experiment_identification",
    concepts: ["natural-experiments", "confounding", "counterfactuals"],
    level: "advanced",
    difficulty: 4,
    format: "mcq",
    prompt: "A government wants to know whether raising the minimum wage reduces employment in fast-food restaurants. Which of these sources of evidence comes closest to a natural experiment?",
    options: [
      "One state raises its minimum wage while a neighbouring state does not; employment in restaurants on both sides of the border is measured before and after the change and the changes are compared.",
      "A survey of restaurant owners asking whether they would cut staff if the minimum wage rose.",
      "A comparison of employment in restaurants that pay high wages with restaurants that pay low wages.",
      "National restaurant employment before and after a federal minimum-wage increase, with no comparison group.",
    ],
    answer: 0,
    solution:
      "A natural experiment is a situation in which something outside the units' own choices assigns the treatment in a way that is plausibly unrelated to the outcome, so that the untreated units can stand in for the counterfactual of the treated ones. A state raising its wage while its neighbour does not, with restaurants a few miles apart on either side of the border, is the classic case: the border restaurants face the same economy, weather and customers, and only the policy differs. Comparing the change on the treated side with the change on the untreated side (difference in differences) removes anything common to both. This is the design of David Card and Alan Krueger's 1994 study of New Jersey and Pennsylvania, which found no employment fall; the finding was and remains contested, but the design is the model. Option 2 measures intentions, not behaviour. Option 3 compares restaurants that chose their wage levels, which differ in everything that drove the choice. Option 4 has no control, so any change in the national economy is attributed to the wage increase.",
    method: "Look for variation in the treatment that was not chosen by the units and is unrelated to the outcome, and for an untreated group exposed to everything else.",
    hints: ["In which option did something other than the restaurant decide whether it faced the higher wage?", "Which option has a comparison group that experienced everything except the policy?", "What does comparing changes, rather than levels, remove?"],
    commonErrors: [
      { description: "Treated stated intentions as evidence of causal effect.", category: "EVIDENCE_ERROR", optionIndex: 1 },
      { description: "Compared self-selected groups as if the treatment were assigned.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Accepted a before-after comparison without a control group.", category: "CAUSAL_ERROR", optionIndex: 3 },
    ],
    transfer: 1,
    minutes: 3,
    examEligible: true,
    tags: ["natural-experiment", "difference-in-differences"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Causal graphs                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-08",
    skill: "causal_reasoning",
    subskill: "adjustment_sets",
    concepts: ["causal-graphs", "confounding", "regression"],
    level: "advanced",
    difficulty: 4,
    format: "mcq",
    prompt: "A causal diagram has the following arrows: Z → X, Z → Y, X → M, M → Y, and X → Y directly. You want to estimate the total effect of X on Y from observational data. Which variables should you adjust for?",
    options: ["Z only.", "Z and M.", "M only.", "None; adjustment is unnecessary."],
    answer: 0,
    solution:
      "Z is a common cause of X and Y: it opens a back-door path X ← Z → Y that would mix Z's influence into the estimate. Adjusting for Z closes that path. M is a mediator: it sits on the causal path X → M → Y, which is part of the effect you want. Adjusting for M would remove the portion of X's effect that runs through M and leave only the direct arrow, which is a different quantity (the direct effect), and it can also introduce bias if M and Y share unmeasured causes. So the adjustment set for the total effect is {Z}. Adjusting for nothing leaves the back-door path open, so the estimate would be confounded by Z. The rule is the back-door criterion: block every path from X to Y that starts with an arrow into X, and do not condition on anything that X causes.",
    method: "List the paths from X to Y; block the back-door paths (those starting with an arrow into X) by adjusting for a variable on them; leave the front-door paths (through mediators) alone for a total effect.",
    hints: ["Which variable causes both X and Y?", "Which variable lies on the path from X to Y, carrying part of X's effect?", "Adjust for common causes; do not adjust for consequences of X."],
    commonErrors: [
      { description: "Adjusted for the mediator, which removes part of the effect being estimated.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Adjusted for the mediator and not the confounder.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Left the back-door path through Z open.", category: "CAUSAL_ERROR", optionIndex: 3 },
    ],
    transfer: 0,
    minutes: 3,
    examEligible: true,
    tags: ["dag", "back-door"],
    origin: "seeded",
  },
  {
    id: "it-causal-reasoning-09",
    skill: "causal_reasoning",
    subskill: "colliders",
    concepts: ["causal-graphs", "selection-bias", "independence"],
    level: "transfer",
    difficulty: 4,
    format: "mcq",
    prompt: "In a graph with only two arrows, Talent → Admitted and Effort → Admitted, talent and effort are independent in the population of applicants. A study of admitted students finds that the more talented ones tend to have made less effort, and concludes that talent breeds complacency. What is the right reading?",
    options: [
      "Admission is a collider, caused by both talent and effort. Looking only at admitted students conditions on it, which induces a negative association between its two causes: among the admitted, low talent must have been compensated by high effort and vice versa. The population shows no such relation and 'complacency' is an artefact of the sample.",
      "Talent causes reduced effort, as the study concludes.",
      "Effort causes reduced talent, since practice fixes habits.",
      "The study is correct but only for admitted students, so complacency is real among them.",
    ],
    answer: 0,
    solution:
      "Two independent causes of a common effect become dependent once you condition on the effect. If admission requires enough talent plus effort, an admitted student with modest talent must have worked hard, and one who worked little must be talented; that is what produces the negative correlation among the admitted, and it exists in the data with no causal arrow between talent and effort at all. This is the collider structure, the same one that produces Berkson's paradox in hospital data and the observation that attractive people seem less kind among one's dates (both traits get people dated). Option 4 is the subtle mistake: the association among admitted students is real as a description of that sample, but it is not evidence that talent reduces effort in anyone; nothing about any individual changed because they were admitted. Selecting on the outcome creates the pattern; it does not create the mechanism the study inferred.",
    method: "When a sample was selected on a variable that both quantities cause, expect a spurious association between them; do not interpret it as a mechanism, even within the sample.",
    hints: ["What do talent and effort both cause in this graph?", "How was the study's sample chosen?", "If you know a student was admitted with little effort, what can you infer about their talent?"],
    commonErrors: [
      { description: "Accepted a causal mechanism for a collider-induced association.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Reversed the mechanism instead of rejecting it.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Treated a selection artefact as a real mechanism confined to the selected sample.", category: "CAUSAL_ERROR", optionIndex: 3 },
    ],
    transfer: 2,
    minutes: 4,
    examEligible: true,
    tags: ["dag", "collider"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Randomised experiments                                             */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-10",
    skill: "causal_reasoning",
    subskill: "intention_to_treat",
    concepts: ["randomised-experiments", "selection-bias", "counterfactuals"],
    level: "intermediate",
    difficulty: 3,
    format: "mcq",
    prompt: "In a randomised trial of a new drug, 30 % of the patients assigned to the drug stop taking it because of side effects. The analyst compares the outcomes of the 70 % who kept taking the drug with the outcomes of the whole control group and finds a large benefit. What is the problem?",
    options: [
      "The 70 % who tolerated the drug are no longer a random group; they are, on average, healthier or more robust than those who stopped. Comparing them with the whole control group reintroduces the selection that randomisation was meant to remove. The primary comparison should be by assigned group (intention to treat).",
      "There is no problem: the analysis correctly measures the effect of actually taking the drug.",
      "The problem is the 30 % dropout rate itself; a trial with any dropout is invalid.",
      "The analyst should compare the 70 % with the 70 % of the control group who did best.",
    ],
    answer: 0,
    solution:
      "Randomisation makes the two assigned groups alike in expectation. The moment you select a subset of one group on something that happened after assignment (tolerating the drug), the subset differs from the control group in whatever predicts tolerance, which is plausibly also what predicts a good outcome. The comparison then measures the drug's effect plus the health of people who can stomach it. Intention-to-treat analysis compares everyone as assigned, whether or not they took the drug; it estimates the effect of offering the drug, which is what a prescribing decision actually chooses, and it preserves the randomisation. Per-protocol analyses have their place as secondary, clearly labelled estimates. Option 3 overreacts: dropout is a fact of trials and is handled by analysing as assigned and by reporting it. Option 4 introduces a second, arbitrary selection to match the first, which compounds the problem.",
    method: "Never condition on anything that happened after randomisation when making the primary comparison; analyse as assigned.",
    hints: ["What kind of patients are able to keep taking a drug with side effects?", "Is the group of tolerators still comparable to the control group?", "What does 'analyse as randomised' mean?"],
    commonErrors: [
      { description: "Accepted a per-protocol comparison as the effect of taking the drug.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Declared the trial invalid rather than analysing it correctly.", category: "EVIDENCE_ERROR", optionIndex: 2 },
      { description: "Proposed a matching selection in the control group, compounding the bias.", category: "CAUSAL_ERROR", optionIndex: 3 },
    ],
    transfer: 0,
    minutes: 3,
    examEligible: true,
    tags: ["rct", "intention-to-treat"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Mechanisms and plausibility                                        */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-11",
    skill: "causal_reasoning",
    subskill: "plausibility_and_priors",
    concepts: ["mechanisms-and-plausibility", "multiple-comparisons", "correlation-vs-causation", "bayes-theorem"],
    level: "advanced",
    difficulty: 4,
    format: "mcq",
    prompt: "Researchers examined hospital records for ten million people and tested whether each of the twelve astrological signs was associated with each of over two hundred diagnoses. They found that people born under Leo were significantly more likely to be admitted for gastrointestinal bleeding (p < 0.05). How should this finding be weighed?",
    options: [
      "As almost certainly a false positive: over two thousand comparisons at α = 0.05 will produce about a hundred 'significant' results by chance, and there is no plausible mechanism by which birth sign affects bleeding. Prior implausibility and multiplicity together make p < 0.05 nearly worthless here.",
      "As a genuine effect that needs a mechanism to be found.",
      "As inconclusive until the study is repeated with a larger sample.",
      "As evidence for astrology, since the sample was enormous and the result significant.",
    ],
    answer: 0,
    solution:
      "Two considerations, each decisive on its own. Multiplicity: twelve signs by two hundred-plus diagnoses is over two thousand tests, and at α = 0.05 around 5 % of true nulls, roughly a hundred, will cross the line by chance; finding some is guaranteed. Plausibility: there is no known or proposed mechanism linking date of birth within the year to bleeding via the constellations, so the prior probability of a real effect is very low, and by Bayes' theorem a weak signal (p just under 0.05) barely moves it. Peter Austin and colleagues ran this study in 2006 precisely to make this point; a second, independent dataset showed no such association. Option 3 misjudges the remedy: the sample of ten million was already enormous, so power is not the issue; the issue is that the hypothesis was one of thousands and had no prior support. Option 4 confuses sample size and significance with evidence, which is the confusion the study was designed to expose.",
    method: "Before believing a significant result, ask how many comparisons produced it and how plausible the hypothesis was in advance; combine the two by thinking in terms of prior odds and how much a marginal p-value shifts them.",
    hints: ["How many hypotheses were tested?", "At α = 0.05, how many false positives would you expect from that many true nulls?", "What mechanism could connect a birth month to a bleeding disorder, and what does the absence of one do to the prior?"],
    commonErrors: [
      { description: "Accepted a significant result from a mass screen as a real effect.", category: "EVIDENCE_ERROR", optionIndex: 1 },
      { description: "Treated the problem as one of sample size rather than multiplicity and plausibility.", category: "STATISTICAL_ERROR", optionIndex: 2 },
      { description: "Took sample size and significance as evidence regardless of prior plausibility.", category: "EVIDENCE_ERROR", optionIndex: 3 },
    ],
    transfer: 1,
    minutes: 3,
    examEligible: true,
    tags: ["plausibility", "multiple-comparisons"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Exam-only                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-12",
    skill: "causal_reasoning",
    subskill: "confounder_mediator_collider",
    concepts: ["causal-graphs", "confounding", "selection-bias"],
    level: "advanced",
    difficulty: 4,
    format: "mcq",
    prompt: "A study asks whether exercise (X) reduces depression (Y). Consider three variables: (A) age, which affects both how much people exercise and their risk of depression; (B) sleep quality, which exercise improves and which in turn reduces depression; (C) enrolment in a wellness programme, which both regular exercisers and people with depression are more likely to join. The study uses only programme enrollees and adjusts for age and sleep. Which statement is correct?",
    options: [
      "A is a confounder and should be adjusted for; B is a mediator and adjusting for it removes part of the effect; C is a collider and restricting to enrollees induces bias. The study handles A correctly and B and C incorrectly.",
      "All three should be adjusted for, so the study is correct.",
      "None should be adjusted for; the study should use the raw correlation.",
      "A and C are confounders and B is a collider, so the study should adjust for A and C and not B.",
    ],
    answer: 0,
    solution:
      "Age causes both exercise and depression: a confounder, on a back-door path, correctly adjusted for. Sleep lies on the causal path from exercise to depression: a mediator; adjusting for it estimates only the direct effect and discards the part that runs through better sleep, which for a total-effect question is a mistake. Programme enrolment is caused by both exercise and depression: a collider; restricting the sample to enrollees conditions on it and opens a spurious path between exercise and depression, in this case likely a negative association that exists only within the programme. The correct design uses the general population (or corrects for selection into the programme), adjusts for age, and leaves sleep alone unless the direct effect is the question.",
    method: "For each variable, ask whether it causes both X and Y (confounder: adjust), sits between them (mediator: do not adjust for a total effect), or is caused by both (collider: do not condition on it, including by sample selection).",
    hints: ["Which variable is a common cause, which is on the path, and which is a common effect?", "What does selecting the sample on a variable amount to, in graph terms?", "Only common causes belong in the adjustment set for a total effect."],
    commonErrors: [
      { description: "Treated all pre-analysis variables as things to adjust for.", category: "CAUSAL_ERROR", optionIndex: 1 },
      { description: "Refused all adjustment, leaving the age confounding in place.", category: "CAUSAL_ERROR", optionIndex: 2 },
      { description: "Misclassified the collider as a confounder and the mediator as a collider.", category: "CONCEPTUAL_ERROR", optionIndex: 3 },
    ],
    transfer: 1,
    minutes: 4,
    examOnly: true,
    tags: ["dag", "classification"],
    origin: "seeded",
  },
  {
    id: "it-causal-reasoning-13",
    skill: "causal_reasoning",
    subskill: "survivorship_bias",
    concepts: ["survivorship-bias", "selection-bias", "counterfactuals"],
    level: "transfer",
    difficulty: 4,
    format: "free",
    prompt: "During the Second World War, analysts examined bombers returning from missions and recorded where they had been hit. The damage clustered on the wings, the tail and the fuselage; the engines and cockpit were rarely hit. The proposal was to add armour where the holes were. In 60 to 120 words, explain why the statistician Abraham Wald recommended the opposite, and state the general principle.",
    keyPoints: [
      "did not return|shot down|lost|never came back|missing planes",
      "engine|cockpit|where there were no holes|undamaged areas|absence of damage",
      "survived|survivors|returned|could take|withstand|survivable",
      "selection|survivorship|sample|only the ones|conditional on",
    ],
    rubric: [
      { criterion: "Explains that the sample consists only of survivors", weight: 0.35, description: "The planes examined are those that came back; hits that brought planes down are not in the data." },
      { criterion: "Draws the right inference from the absence of damage", weight: 0.35, description: "Areas with few recorded hits are the areas where hits were fatal; armour belongs there." },
      { criterion: "States the general principle", weight: 0.3, description: "Data selected by an outcome cannot be read as if they described the whole population; ask what did not make it into the sample." },
    ],
    solution:
      "The planes that could be examined were the planes that returned. A bomber hit in the wing or fuselage came home to be counted; one hit in the engine or cockpit did not. So the recorded holes mark the places where a plane can be hit and survive, and the clean areas mark the places where a hit is fatal. Wald's recommendation, in work for the Statistical Research Group in the 1940s, was to armour the engines and cockpit: the parts where the returning planes showed no damage. (The story as popularly told simplifies his analysis, which estimated hit probabilities by region from the returning aircraft; the inference is sound and is his.) The general principle is that a sample selected by an outcome, survival, is silent about the cases that did not achieve it, and the missing cases are often the ones that carry the answer.",
    method: "Ask how the cases came to be in the sample; if the outcome of interest determined inclusion, reason about the excluded cases and read absence of evidence in the sample as evidence about them.",
    hints: ["Which planes were available to be examined?", "A plane hit in the engine: where is it?", "What do the undamaged areas on returning planes tell you?"],
    commonErrors: [
      { description: "Recommended armouring the damaged areas, reading the survivors as the whole population.", category: "CAUSAL_ERROR", pattern: "armour the wings|armour where the holes|reinforce the damaged" },
      { description: "Explained the pattern by the geometry of attack rather than by selection.", category: "ASSUMPTION", pattern: "fighters aim for the wings|easier to hit the wings|larger target" },
    ],
    transfer: 2,
    minutes: 6,
    examOnly: true,
    tags: ["survivorship-bias", "history", "free-response"],
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* Foundation                                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "it-causal-reasoning-14",
    skill: "causal_reasoning",
    subskill: "what_randomisation_does",
    concepts: ["randomised-experiments", "randomness-and-sample-spaces"],
    level: "foundation",
    difficulty: 2,
    format: "true_false",
    prompt: "True or false: randomly assigning participants to treatment and control guarantees that the two groups are identical in every characteristic.",
    answer: "false",
    solution:
      "False. Randomisation makes the groups alike in expectation and, for large groups, close in practice, on every characteristic whether or not anyone measured it; that is its unique power, and no amount of matching or adjustment can promise balance on things nobody thought of. But any particular random draw can produce imbalance by chance, especially in small trials, which is why baseline tables are reported and why the analysis carries a standard error. What randomisation guarantees is that any imbalance is due to chance alone, and chance is the one thing whose contribution a test can quantify.",
    method: "Distinguish 'alike in expectation, with chance imbalance quantified' from 'identical'.",
    hints: ["Could a coin toss put slightly more older people in one group?", "What does randomisation guarantee about the source of any imbalance?", "In expectation, not in every instance."],
    commonErrors: [
      { description: "Believed randomisation produces identical groups rather than groups that differ only by chance.", category: "CONCEPTUAL_ERROR", pattern: "true" },
    ],
    transfer: 0,
    minutes: 1,
    examEligible: false,
    tags: ["rct", "randomisation"],
    origin: "seeded",
  },
];
