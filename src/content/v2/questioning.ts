import type { QuestioningExercise } from "@/lib/v2/content-types";

/**
 * Questioning exercises. Ids qe-<nn>. British spelling throughout.
 *
 * Four kinds. one_question: a scenario in which the learner may ask one question, with
 * candidates rated by information value (0..1), where value means how much the answer would
 * change what the learner believes or does. rewrite_leading: a leading question to neutralise;
 * the answerKey says what a neutral rewrite must not do. discriminate: competing explanations
 * and candidate questions rated by how well their answers would separate the explanations.
 * classify: a question to place in a category; the answerKey is the category.
 *
 * Information value is calibrated within an exercise, not across exercises: 0.9 means the best
 * question available here, 0.1 means one whose answer would change almost nothing.
 */
export const QUESTIONING_EXERCISES: QuestioningExercise[] = [
  /* ---------------------------------------------------------------- */
  /* one_question                                                       */
  /* ---------------------------------------------------------------- */
  {
    id: "qe-01",
    kind: "one_question",
    title: "The overnight job that failed",
    scenario:
      "A nightly report job that has run without incident for eleven months failed last night. The on-call engineer is about to go off shift and has time for one question from you before handing over. What do you ask?",
    options: [
      {
        id: "a",
        text: "What changed between the last successful run and this one: code, data, configuration, or the machine it runs on?",
        informationValue: 0.9,
        category: "evidential",
        note: "A job that ran for eleven months and then failed almost certainly failed because something changed. Whatever the answer, it narrows the search to one of four areas, and 'nothing changed' is itself informative, since it points at the input data or an external dependency.",
      },
      {
        id: "b",
        text: "Did the job fail at the start, or partway through?",
        informationValue: 0.7,
        category: "discriminating",
        note: "A useful discriminator: failure at the start suggests configuration, credentials or a missing input; failure partway suggests a data record or a resource limit. Narrower than (a) but its answer is quick and certain.",
      },
      {
        id: "c",
        text: "Is the server still up?",
        informationValue: 0.3,
        category: "closed",
        note: "Worth knowing, but a yes leaves nearly the whole search space open and a no is something monitoring would already have told you.",
      },
      {
        id: "d",
        text: "Did someone touch the code yesterday?",
        informationValue: 0.45,
        category: "closed",
        note: "One of the four possibilities in (a), asked in a way that presumes it. A yes is valuable; a no rules out one cause and leaves three. Also mildly accusatory, which affects the answers you get later.",
      },
      {
        id: "e",
        text: "Has this ever happened before?",
        informationValue: 0.1,
        category: "clarifying",
        note: "The scenario already told you: eleven months without incident. A question whose answer you already have has no information value, however natural it sounds.",
      },
    ],
    answerKey: "a",
    keyPoints: ["A long-stable process that fails has almost always been changed; ask what changed.", "Prefer the question whose every answer narrows the search, over one whose 'no' leaves everything open.", "Do not ask for information the scenario already gives."],
    concepts: ["question-types-and-information-value", "value-of-information"],
    difficulty: 2,
  },
  {
    id: "qe-02",
    kind: "one_question",
    title: "The supplement that cured the fatigue",
    scenario:
      "A friend tells you a supplement they began taking six weeks ago has cured the tiredness they had suffered for a year, and urges you to try it. You are sceptical but do not want to argue. You can ask one question. Which one tells you most about whether the supplement did anything?",
    options: [
      {
        id: "a",
        text: "What else changed around the time you started it: sleep, work, exercise, the season, anything you stopped?",
        informationValue: 0.85,
        category: "causal",
        note: "The rival explanations for feeling better after starting a supplement are other changes made at the same time, natural recovery, and expectation. This question tests the first directly and often reveals the second. It is also easy to answer honestly.",
      },
      {
        id: "b",
        text: "How bad was the tiredness in the two weeks before you started, compared with the average of the year?",
        informationValue: 0.75,
        category: "evidential",
        note: "People start remedies when they feel worst, and the worst is followed by something better whatever they do: regression to the mean. If the fortnight before was unusually bad, improvement was expected without the supplement.",
      },
      {
        id: "c",
        text: "Which brand is it?",
        informationValue: 0.1,
        category: "clarifying",
        note: "Tells you nothing about whether it worked, and signals that you are about to buy it.",
      },
      {
        id: "d",
        text: "Do you not think it might just be a placebo?",
        informationValue: 0.15,
        category: "closed",
        leading: true,
        note: "A leading question dressed as enquiry. It asks the friend to concede rather than to report, and its likely answer ('no') carries no information because it was never going to be yes.",
      },
    ],
    answerKey: "a",
    keyPoints: ["Before-and-after evidence from one person is explained by concurrent changes, regression to the mean and expectation before it is explained by the remedy.", "The best question surfaces rival explanations without asking the person to abandon their belief.", "A question phrased as a challenge yields a defence, not data."],
    concepts: ["question-types-and-information-value", "value-of-information", "neutral-vs-leading-questions"],
    difficulty: 2,
  },
  {
    id: "qe-03",
    kind: "one_question",
    title: "One question for a referee",
    scenario:
      "You are hiring for a role that involves telling senior people things they do not want to hear. A referee for your preferred candidate has agreed to a five-minute call and is clearly in a hurry. You have time for one substantive question. Which?",
    options: [
      {
        id: "a",
        text: "Can you describe a specific occasion when they had to deliver bad news or push back on someone senior, and what happened?",
        informationValue: 0.9,
        category: "evidential",
        note: "Asks for an episode rather than an opinion, on the one trait the job turns on. Episodes are hard to invent and easy to compare; a referee who cannot produce one has told you something too.",
      },
      {
        id: "b",
        text: "Would you hire them again?",
        informationValue: 0.6,
        category: "closed",
        note: "A good closed question: a hesitation or a qualified yes is informative, and referees find it hard to lie to. But it is about the person in general, not about the trait you need to know about.",
      },
      {
        id: "c",
        text: "Were they a good colleague?",
        informationValue: 0.15,
        category: "open",
        note: "Nearly every referee says yes; the answer distribution has almost no spread, so the answer carries almost no information.",
      },
      {
        id: "d",
        text: "Did they ever cause problems?",
        informationValue: 0.3,
        category: "closed",
        leading: true,
        note: "Framed to invite a defensive no, and even an honest yes would need a follow-up you have no time for.",
      },
      {
        id: "e",
        text: "What would their next manager need to know to get the best from them?",
        informationValue: 0.7,
        category: "open",
        note: "A well-designed open question: it invites candour by framing weaknesses as management advice. Slightly less valuable here only because it is not aimed at the specific trait the role requires.",
      },
    ],
    answerKey: "a",
    keyPoints: ["A question whose answer is almost always the same carries almost no information, whatever its subject.", "Ask for episodes, not adjectives; aim them at the trait the decision turns on.", "Framing determines candour: questions that invite defence get it."],
    concepts: ["question-types-and-information-value", "value-of-information"],
    difficulty: 3,
  },
  {
    id: "qe-04",
    kind: "one_question",
    title: "Before the salary conversation",
    scenario:
      "A recruiter has phoned to say the company would like to make you an offer and asks whether you have any questions before they put numbers together. You will get one question in before they move on. Which question most improves your position in the negotiation to come?",
    options: [
      {
        id: "a",
        text: "What is the range that has been budgeted for this role, and what separates someone at the bottom of it from someone at the top?",
        informationValue: 0.85,
        category: "strategic",
        note: "Two things you need and cannot otherwise get: the anchor they are working from, and the criteria they will use to justify a higher number. Recruiters often answer the second part even when they decline the first.",
      },
      {
        id: "b",
        text: "Is there any flexibility on salary?",
        informationValue: 0.3,
        category: "closed",
        note: "The answer is nearly always a hedged yes, so it tells you little, and it signals that you expect to ask for more before you have heard the offer.",
      },
      {
        id: "c",
        text: "Do you think I am worth more than the other candidates?",
        informationValue: 0.05,
        category: "closed",
        leading: true,
        note: "Invites flattery, which is worthless, and puts the recruiter in an awkward position that costs goodwill.",
      },
      {
        id: "d",
        text: "When do you need a decision by?",
        informationValue: 0.5,
        category: "clarifying",
        note: "Genuinely useful for planning and for knowing how much time you have to gather alternatives, but it does not change what you know about the number.",
      },
    ],
    answerKey: "a",
    keyPoints: ["The most valuable question is the one whose answer you cannot get elsewhere and that changes what you will do.", "Ask for criteria as well as numbers; criteria are what you negotiate with.", "A question that reveals your intent (to push for more) has a cost that offsets its value."],
    concepts: ["question-types-and-information-value", "value-of-information"],
    difficulty: 3,
  },

  /* ---------------------------------------------------------------- */
  /* rewrite_leading                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "qe-05",
    kind: "rewrite_leading",
    title: "The project review",
    scenario:
      "You are chairing a review of a project that delivered three months late. You want to learn what the team thinks went wrong. Your draft first question is below. Rewrite it so that it does not steer the answer.",
    leadingQuestion: "Don't you think the project slipped mainly because the design phase was rushed?",
    answerKey:
      "A neutral rewrite must not name a cause, must not rank causes ('mainly'), and must not invite agreement with the questioner ('don't you think'). It should ask for the team's own account first, for example: 'What do you think were the main reasons the project ran late?' or, more openly, 'Walk me through where the time went.' If the design phase is to be tested as a hypothesis, that comes later, and as a question that could be answered either way: 'How did the length of the design phase affect what followed?'",
    keyPoints: ["Remove the embedded hypothesis (the design phase).", "Remove the ranking ('mainly') and the invitation to agree ('don't you think').", "Ask for the account before testing any explanation; test explanations with questions that could go either way."],
    concepts: ["neutral-vs-leading-questions", "question-types-and-information-value"],
    difficulty: 2,
  },
  {
    id: "qe-06",
    kind: "rewrite_leading",
    title: "The witness",
    scenario:
      "You are taking a statement from someone who saw a collision between a car and a van. In a well-known 1974 experiment, Loftus and Palmer showed that people who were asked how fast cars were going when they 'smashed into' each other gave higher speed estimates (about 41 mph on average) than those asked about cars that 'hit' each other (about 34 mph), and were more likely a week later to remember broken glass that was not there. Rewrite the question so that it does not shape the memory it is asking about.",
    leadingQuestion: "How fast was the car going when it smashed into the van?",
    answerKey:
      "A neutral rewrite must not supply a verb that implies severity ('smashed'), must not presuppose that the car was the moving party, and should not ask for a number before asking for an account. Begin with an open request: 'Tell me what you saw, from the beginning.' Then, if a speed estimate is needed: 'Can you estimate how fast either vehicle was travelling, if you can at all?' The option not to estimate matters, because pressing for a number produces one whether or not the witness has it.",
    keyPoints: ["Strip the loaded verb; use the most neutral description ('the collision', 'the two vehicles').", "Do not presuppose who moved and who was struck.", "Open account first, specific estimate second, with explicit permission not to know."],
    concepts: ["neutral-vs-leading-questions"],
    difficulty: 3,
  },
  {
    id: "qe-07",
    kind: "rewrite_leading",
    title: "The customer survey",
    scenario:
      "Your team has rebuilt the checkout of an online shop and wants to know what customers think. The draft survey question is below. Rewrite it so that the answers can be trusted.",
    leadingQuestion: "How much did you enjoy our new, faster checkout?",
    answerKey:
      "A neutral rewrite must not presuppose enjoyment ('how much did you enjoy'), must not assert the property under test ('faster'), and should allow a negative answer as easily as a positive one. For example: 'How would you rate the checkout process you just completed?' on a balanced scale from very poor to very good, followed by 'What, if anything, would you change about it?' If speed is the thing you want to measure, ask about it without asserting it: 'Compared with other online shops, did the checkout feel slower, about the same, or faster?'",
    keyPoints: ["Remove the presupposition of a positive experience.", "Do not assert the attribute you are trying to measure.", "Use a balanced scale with a genuine negative end; ask what to change, not what was liked."],
    concepts: ["neutral-vs-leading-questions"],
    difficulty: 2,
  },
  {
    id: "qe-08",
    kind: "rewrite_leading",
    title: "The one-to-one",
    scenario:
      "You manage someone whose recent work has been late. You suspect they are overloaded but you are not sure, and you want to find out rather than assume. Your draft opening is below. Rewrite it.",
    leadingQuestion: "You've been struggling to keep up lately, haven't you? Is it the workload?",
    answerKey:
      "A neutral rewrite must not assert the diagnosis ('struggling'), must not offer the cause you suspect ('the workload') as the only candidate, and must not use a tag question ('haven't you?') that demands agreement. State the observation neutrally and ask for the account: 'The last three deliveries came in after the date we agreed. I would like to understand what is getting in the way; can you talk me through how the last few weeks have gone?' The workload hypothesis can be tested afterwards with a question that could go either way: 'How does your current load compare with what you can do well?'",
    keyPoints: ["Separate the observation (late deliveries) from the interpretation (struggling).", "Do not offer your suspected cause as the only option.", "Drop tag questions; they invite assent rather than information."],
    concepts: ["neutral-vs-leading-questions", "question-types-and-information-value"],
    difficulty: 2,
  },

  /* ---------------------------------------------------------------- */
  /* discriminate                                                       */
  /* ---------------------------------------------------------------- */
  {
    id: "qe-09",
    kind: "discriminate",
    title: "Sales fell in one region",
    scenario:
      "Reported sales in the northern region fell 18 % last quarter while other regions were flat. Four explanations are on the table. Choose the question whose answer would best separate them.",
    explanations: [
      "A competitor opened in the region at the start of the quarter.",
      "The region's most experienced sales representative left in the first month.",
      "The fall is seasonal and the region's product mix makes it more exposed than others.",
      "A change to the reporting pipeline is misattributing some of the region's sales elsewhere.",
    ],
    options: [
      {
        id: "a",
        text: "Did unit shipments to northern customers fall as much as reported revenue did?",
        informationValue: 0.85,
        category: "discriminating",
        note: "Splits the reporting explanation from all three real-world ones in a single answer: if goods still shipped, the sales happened and the report is wrong. Checking the cheapest, most decisive hypothesis first is the right order.",
      },
      {
        id: "b",
        text: "Did the fall begin abruptly in a particular week, or drift down across the quarter?",
        informationValue: 0.75,
        category: "discriminating",
        note: "An abrupt step points at a dated event (competitor opening, a departure, a pipeline change); a drift points at seasonality. Good, but leaves three dated events to separate.",
      },
      {
        id: "c",
        text: "What did the northern region do in the same quarter last year?",
        informationValue: 0.55,
        category: "evidential",
        note: "Tests the seasonal explanation directly and only that one; a fall last year too would support it, a flat quarter would weaken it, and either leaves the other three untouched.",
      },
      {
        id: "d",
        text: "Is the regional manager up to the job?",
        informationValue: 0.1,
        category: "closed",
        leading: true,
        note: "Not one of the explanations on the table, and phrased to produce a defence; even a candid answer would not separate the four.",
      },
      {
        id: "e",
        text: "Which customers stopped buying, and did they go to the competitor?",
        informationValue: 0.6,
        category: "evidential",
        note: "Directly tests the competitor explanation and, if the lost customers were the departed representative's accounts, the second as well. Slower to answer than (a) and silent about reporting and season.",
      },
    ],
    answerKey: "a",
    keyPoints: ["A discriminating question is one whose different answers favour different explanations; a question that all four explanations answer the same way is worthless however relevant it sounds.", "Test the explanation that is cheapest to check and would change everything if true (a data error) before the ones that need field work.", "Timing (step versus drift) is a general-purpose discriminator between dated causes and gradual ones."],
    concepts: ["question-types-and-information-value", "value-of-information", "bayes-theorem"],
    difficulty: 3,
  },
  {
    id: "qe-10",
    kind: "discriminate",
    title: "Conversion fell after the redesign",
    scenario:
      "A website's measured conversion rate dropped from 3.1 % to 2.4 % in the fortnight after a redesign went live. The product team blames the design; marketing blames a new paid campaign that started the same week. Two more explanations are possible. Which question best separates them?",
    explanations: [
      "The redesign itself makes it harder to complete a purchase.",
      "The new paid campaign is bringing in visitors with lower intent, diluting the rate.",
      "The analytics tracking was changed with the redesign and is under-counting conversions.",
      "The fortnight is seasonally weak and the comparison period was seasonally strong.",
    ],
    options: [
      {
        id: "a",
        text: "Broken down by traffic source, did conversion fall for returning organic visitors as well as for visitors from the new campaign?",
        informationValue: 0.9,
        category: "discriminating",
        note: "One breakdown separates three explanations. If organic returning visitors converted as before, the campaign mix is the cause. If they fell too, the design or the tracking is implicated and the campaign is exonerated.",
      },
      {
        id: "b",
        text: "Did the number of orders in the finance system fall as much as the number of conversions recorded by analytics?",
        informationValue: 0.8,
        category: "discriminating",
        note: "Isolates the tracking explanation with an answer nobody can dispute: if orders held up while measured conversions fell, the measurement broke. Slightly less valuable than (a) only because it separates one explanation, not three.",
      },
      {
        id: "c",
        text: "What was the conversion rate in the same fortnight last year?",
        informationValue: 0.45,
        category: "evidential",
        note: "Tests seasonality alone, and a year-old rate on a different site version is a weak comparison.",
      },
      {
        id: "d",
        text: "Do you personally find the new design harder to use?",
        informationValue: 0.1,
        category: "open",
        leading: true,
        note: "An opinion from an insider who has seen the design a hundred times cannot separate any of the four explanations.",
      },
      {
        id: "e",
        text: "Did conversion fall at the same step of the checkout for everyone, or across all steps evenly?",
        informationValue: 0.6,
        category: "discriminating",
        note: "A localised drop at one step points at a design defect at that step; an even fall points at mix, measurement or season. Useful as a second question once (a) or (b) has been answered.",
      },
    ],
    answerKey: "a",
    keyPoints: ["Segmenting the same measurement by a variable that the explanations predict differently is the most efficient discriminator.", "Prefer questions that separate several explanations at once; then use single-hypothesis checks to confirm.", "Cross-checking a measurement against an independent record (orders in finance) is how measurement explanations are tested."],
    concepts: ["question-types-and-information-value", "value-of-information", "bayes-theorem"],
    difficulty: 3,
  },
  {
    id: "qe-11",
    kind: "discriminate",
    title: "The wilting plant",
    scenario:
      "A houseplant on a sunny windowsill has begun to wilt over the past week. Four explanations are plausible. Choose the question whose answer would best tell them apart.",
    explanations: ["It is being overwatered and the roots are rotting.", "It is being underwatered.", "It has outgrown its pot and the roots are bound.", "It has a pest infestation."],
    options: [
      {
        id: "a",
        text: "Two centimetres below the surface, is the compost wet, damp or dry, and does the pot feel heavy or light?",
        informationValue: 0.9,
        category: "discriminating",
        note: "Overwatering and underwatering predict opposite answers, and a pot-bound plant often shows dry compost that water runs straight through. One cheap observation splits the two most likely explanations.",
      },
      {
        id: "b",
        text: "Are the wilting leaves yellow and soft, or brown and crisp at the edges?",
        informationValue: 0.65,
        category: "discriminating",
        note: "Yellow and soft leans towards too much water; brown and crisp towards too little. Informative but less decisive than feeling the compost, since leaf symptoms overlap between causes.",
      },
      {
        id: "c",
        text: "Can you see anything on the undersides of the leaves or fine webbing between stems?",
        informationValue: 0.5,
        category: "evidential",
        note: "Tests the pest explanation directly and only that one. Worth asking second.",
      },
      {
        id: "d",
        text: "Have you fed it recently?",
        informationValue: 0.15,
        category: "closed",
        note: "Feeding is not among the explanations and rarely causes wilting on its own; the answer changes little.",
      },
    ],
    answerKey: "a",
    keyPoints: ["The best discriminating question is one where two leading explanations predict opposite answers.", "Cheap direct observation beats reported history when the observation is available.", "A question that tests an explanation nobody proposed has low value even if the answer is interesting."],
    concepts: ["question-types-and-information-value", "value-of-information"],
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* classify                                                           */
  /* ---------------------------------------------------------------- */
  {
    id: "qe-12",
    kind: "classify",
    title: "Classify: the March launch",
    scenario:
      "In a post-mortem, someone asks: 'What would have happened if we had launched in March instead of June?' Classify the question. The categories in use are: clarifying, evidential, causal, counterfactual, assumption, discriminating, strategic, open, closed, falsifying.",
    answerKey: "counterfactual",
    keyPoints: ["A counterfactual question asks about an alternative that did not happen, holding everything else fixed.", "It is the question that isolates the causal contribution of one decision, and its answer is always an estimate, since the alternative world was never observed.", "It differs from a causal question ('why did the June launch underperform?'), which asks about what did happen."],
    concepts: ["question-types-and-information-value"],
    difficulty: 1,
  },
  {
    id: "qe-13",
    kind: "classify",
    title: "Classify: what would change your mind",
    scenario:
      "Before approving a plan, a director asks its author: 'What result in the first quarter would make you abandon this plan?' Classify the question. The categories in use are: clarifying, evidential, causal, counterfactual, assumption, discriminating, strategic, open, closed, falsifying.",
    answerKey: "falsifying",
    keyPoints: ["A falsifying question asks what evidence would show the claim or plan to be wrong; it forces a commitment in advance to what counts as failure.", "It exposes plans that are unfalsifiable, where every result would be read as success or as 'too early to tell'.", "It is distinct from an evidential question ('what evidence supports this plan?'), which invites confirmation."],
    concepts: ["question-types-and-information-value", "hypothesis-testing"],
    difficulty: 2,
  },
  {
    id: "qe-14",
    kind: "classify",
    title: "Classify: behind on what",
    scenario:
      "A team lead reports that 'the project is behind'. A colleague asks: 'When you say behind, which milestones do you mean, and behind by how much?' Classify the question. The categories in use are: clarifying, evidential, causal, counterfactual, assumption, discriminating, strategic, open, closed, falsifying.",
    answerKey: "clarifying",
    keyPoints: ["A clarifying question resolves the meaning or reference of a term before anything is inferred from it.", "It is the highest-value question when a word like 'behind', 'significant' or 'engagement' is doing a lot of work without a definition.", "Clarifying questions are cheap and should come before causal or strategic ones, which otherwise build on an ambiguity."],
    concepts: ["question-types-and-information-value"],
    difficulty: 1,
  },
  {
    id: "qe-15",
    kind: "classify",
    title: "Classify: what has to be true",
    scenario:
      "Reviewing a forecast that revenue will double in two years, an investor asks: 'What are you assuming about customer demand that would have to hold for this to happen?' Classify the question. The categories in use are: clarifying, evidential, causal, counterfactual, assumption, discriminating, strategic, open, closed, falsifying.",
    answerKey: "assumption",
    keyPoints: ["An assumption question surfaces the unstated premises on which a claim or plan rests.", "It converts a forecast into a list of conditions that can each be examined and tested separately.", "It is neutral in form: it does not say the assumptions are wrong, only that they should be visible."],
    concepts: ["question-types-and-information-value"],
    difficulty: 2,
  },
];
