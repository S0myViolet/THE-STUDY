import type { DomainId, ItemLevel } from "@/lib/v2/content-types";

/**
 * The curriculum skeleton: every domain, course, module and concept id in THE STUDY V2.
 *
 * Content authors fill each concept in (summary, key points, dependencies, recall prompts)
 * inside `src/content/v2/curriculum/<domain>.ts`, and may reference any concept id listed
 * here as a dependency, whatever its domain. Ids are stable kebab-case slugs and must
 * never be renamed; the mastery store keys on them.
 */

export interface SkeletonConcept {
  id: string;
  title: string;
}
export interface SkeletonModule {
  id: string;
  title: string;
  concepts: SkeletonConcept[];
}
export interface SkeletonCourse {
  id: string;
  title: string;
  level: ItemLevel;
  modules: SkeletonModule[];
}
export interface SkeletonDomain {
  id: DomainId;
  title: string;
  summary: string;
  /** Starter domains ship with full lessons and practice items. */
  starter: boolean;
  courses: SkeletonCourse[];
}

const c = (id: string, title: string): SkeletonConcept => ({ id, title });

export const CURRICULUM_SKELETON: SkeletonDomain[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    summary: "The quantitative foundation everything else stands on: numbers, algebra, functions, and enough calculus and linear algebra to read the world's models.",
    starter: true,
    courses: [
      {
        id: "quantitative-foundations",
        title: "Quantitative foundations",
        level: "foundation",
        modules: [
          { id: "qf-arithmetic", title: "Arithmetic and estimation", concepts: [c("number-sense", "Number sense and estimation"), c("fractions-ratios-percentages", "Fractions, ratios and percentages"), c("orders-of-magnitude", "Orders of magnitude"), c("units-and-dimensional-analysis", "Units and dimensional analysis")] },
          { id: "qf-algebra", title: "Algebra", concepts: [c("algebraic-manipulation", "Algebraic manipulation"), c("linear-equations", "Linear equations and systems"), c("inequalities", "Inequalities"), c("exponents-and-logarithms", "Exponents and logarithms"), c("quadratics", "Quadratics and factoring")] },
          { id: "qf-functions", title: "Functions and growth", concepts: [c("functions-and-graphs", "Functions and graphs"), c("linear-vs-exponential-growth", "Linear versus exponential growth"), c("rates-of-change", "Rates of change")] },
          { id: "qf-geometry", title: "Geometry and scale", concepts: [c("geometry-and-scale", "Geometry, area, volume and scale")] },
        ],
      },
      {
        id: "further-mathematics",
        title: "Further mathematics",
        level: "intermediate",
        modules: [
          { id: "fm-calculus", title: "Calculus intuition", concepts: [c("derivative-intuition", "The derivative as a rate"), c("integral-intuition", "The integral as accumulation"), c("optimisation", "Optimisation")] },
          { id: "fm-linear", title: "Linear algebra", concepts: [c("vectors-and-matrices", "Vectors and matrices"), c("linear-transformations", "Linear transformations")] },
          { id: "fm-discrete", title: "Discrete mathematics", concepts: [c("sets-and-counting", "Sets and counting"), c("proof-and-induction", "Proof and induction"), c("graphs-and-networks-math", "Graphs and networks")] },
        ],
      },
    ],
  },
  {
    id: "probability",
    title: "Probability",
    summary: "How to reason about uncertainty with numbers: sample spaces, conditioning, Bayes, expectation and distributions.",
    starter: true,
    courses: [
      {
        id: "probability-core",
        title: "Probability",
        level: "basic",
        modules: [
          { id: "pr-randomness", title: "Randomness and counting", concepts: [c("randomness-and-sample-spaces", "Randomness and sample spaces"), c("probability-rules", "The rules of probability"), c("combinatorics", "Combinatorics")] },
          { id: "pr-conditional", title: "Conditioning and Bayes", concepts: [c("conditional-probability", "Conditional probability"), c("independence", "Independence"), c("bayes-theorem", "Bayes' theorem"), c("base-rates", "Base rates")] },
          { id: "pr-variables", title: "Random variables", concepts: [c("random-variables", "Random variables"), c("expected-value", "Expected value"), c("variance-and-spread", "Variance and spread"), c("distributions", "Distributions: binomial and normal"), c("law-of-large-numbers", "The law of large numbers"), c("simulation-monte-carlo", "Simulation and Monte Carlo")] },
        ],
      },
    ],
  },
  {
    id: "statistics",
    title: "Statistics",
    summary: "How to learn from data without fooling yourself: description, sampling, inference, effect sizes, regression and the reading of research.",
    starter: true,
    courses: [
      {
        id: "statistics-core",
        title: "Statistics",
        level: "basic",
        modules: [
          { id: "st-descriptive", title: "Describing data", concepts: [c("descriptive-statistics", "Descriptive statistics"), c("correlation", "Correlation"), c("visualising-data", "Reading and making charts")] },
          { id: "st-sampling", title: "Sampling and uncertainty", concepts: [c("sampling-and-bias", "Sampling and bias"), c("sampling-variability", "Sampling variability and standard error"), c("confidence-intervals", "Confidence intervals")] },
          { id: "st-inference", title: "Inference", concepts: [c("hypothesis-testing", "Hypothesis testing"), c("p-values-and-significance", "P-values and significance"), c("effect-sizes", "Effect sizes"), c("statistical-power", "Statistical power"), c("regression", "Regression"), c("multiple-comparisons", "Multiple comparisons")] },
          { id: "st-studies", title: "Reading research", concepts: [c("experiments-vs-observational", "Experiments versus observational studies"), c("interpreting-research", "Interpreting a research paper"), c("regression-to-the-mean", "Regression to the mean"), c("simpsons-paradox", "Simpson's paradox")] },
        ],
      },
    ],
  },
  {
    id: "logic",
    title: "Logic",
    summary: "The structure of good and bad arguments: validity, deduction and induction, conditions, contradictions, fallacies and reconstruction.",
    starter: true,
    courses: [
      {
        id: "logic-core",
        title: "Logic and argument",
        level: "basic",
        modules: [
          { id: "lg-arguments", title: "Arguments", concepts: [c("arguments-premises-conclusions", "Arguments, premises and conclusions"), c("validity-and-soundness", "Validity and soundness"), c("deduction-vs-induction", "Deduction and induction"), c("necessary-and-sufficient", "Necessary and sufficient conditions"), c("contradiction-and-consistency", "Contradiction and consistency")] },
          { id: "lg-formal", title: "Formal basics", concepts: [c("propositional-logic", "Propositional logic"), c("conditionals-and-contrapositive", "Conditionals and the contrapositive"), c("quantifiers", "Quantifiers")] },
          { id: "lg-fallacies", title: "Fallacies and reconstruction", concepts: [c("formal-fallacies", "Formal fallacies"), c("informal-fallacies", "Informal fallacies"), c("argument-reconstruction", "Argument reconstruction"), c("steelmanning", "Steelmanning")] },
        ],
      },
    ],
  },
  {
    id: "causal_reasoning",
    title: "Causal reasoning",
    summary: "When a relationship is a cause and when it only looks like one: confounding, selection, reverse causality, counterfactuals and experimental design.",
    starter: false,
    courses: [
      {
        id: "causal-core",
        title: "Causal reasoning",
        level: "intermediate",
        modules: [
          { id: "ca-basics", title: "Correlation and cause", concepts: [c("correlation-vs-causation", "Correlation versus causation"), c("confounding", "Confounding"), c("reverse-causality", "Reverse causality"), c("selection-bias", "Selection bias"), c("survivorship-bias", "Survivorship bias")] },
          { id: "ca-design", title: "Finding causes", concepts: [c("counterfactuals", "Counterfactuals"), c("randomised-experiments", "Randomised experiments"), c("natural-experiments", "Natural experiments"), c("causal-graphs", "Causal graphs"), c("mechanisms-and-plausibility", "Mechanisms and plausibility")] },
        ],
      },
    ],
  },
  {
    id: "decision_science",
    title: "Decision science",
    summary: "Choosing well under uncertainty: expected value, utility, opportunity cost, information, risk, forecasting, incentives and the quality of a decision apart from its outcome.",
    starter: false,
    courses: [
      {
        id: "decision-core",
        title: "Decision science",
        level: "intermediate",
        modules: [
          { id: "dc-value", title: "Value and choice", concepts: [c("expected-value-decisions", "Expected value in decisions"), c("utility-and-risk-attitude", "Utility and risk attitude"), c("opportunity-cost", "Opportunity cost"), c("sunk-costs", "Sunk costs"), c("decision-trees", "Decision trees")] },
          { id: "dc-uncertainty", title: "Uncertainty", concepts: [c("value-of-information", "Value of information"), c("uncertainty-and-scenarios", "Uncertainty and scenario thinking"), c("forecasting-and-calibration", "Forecasting and calibration"), c("decision-vs-outcome-quality", "Decision quality versus outcome quality")] },
          { id: "dc-strategy", title: "Strategy and incentives", concepts: [c("incentives", "Incentives"), c("game-theory-basics", "Game theory basics"), c("second-order-effects", "Second-order effects"), c("negotiation-basics", "Negotiation")] },
        ],
      },
    ],
  },
  {
    id: "economics",
    title: "Economics",
    summary: "How scarce things get allocated: markets, prices, money, banks, inflation, growth, trade and why economies break.",
    starter: true,
    courses: [
      {
        id: "microeconomics",
        title: "Microeconomics",
        level: "basic",
        modules: [
          { id: "ec-markets", title: "Markets", concepts: [c("scarcity-and-tradeoffs", "Scarcity and trade-offs"), c("supply-and-demand", "Supply and demand"), c("elasticity", "Elasticity"), c("marginal-thinking", "Marginal thinking")] },
          { id: "ec-structure", title: "Structure and failure", concepts: [c("market-structure-competition", "Market structure and competition"), c("externalities-and-public-goods", "Externalities and public goods"), c("comparative-advantage", "Comparative advantage")] },
        ],
      },
      {
        id: "macroeconomics",
        title: "Macroeconomics",
        level: "intermediate",
        modules: [
          { id: "ec-aggregates", title: "Aggregates", concepts: [c("gdp-and-growth", "GDP and growth"), c("unemployment", "Unemployment"), c("inflation", "Inflation"), c("real-vs-nominal", "Real versus nominal"), c("business-cycles", "Business cycles")] },
          { id: "ec-policy", title: "Policy", concepts: [c("interest-rates", "Interest rates"), c("fiscal-policy", "Fiscal policy"), c("labour-markets", "Labour markets")] },
        ],
      },
      {
        id: "money-and-banking",
        title: "Money and banking",
        level: "intermediate",
        modules: [
          { id: "ec-money", title: "Money", concepts: [c("money-functions", "What money is and does"), c("banking-and-credit-creation", "Banking and credit creation"), c("central-banks", "Central banks"), c("monetary-policy", "Monetary policy")] },
          { id: "ec-global", title: "The global economy", concepts: [c("exchange-rates", "Exchange rates and currencies"), c("international-trade", "International trade"), c("economic-development", "Economic development"), c("financial-crises", "Financial crises")] },
        ],
      },
    ],
  },
  {
    id: "history",
    title: "History",
    summary: "How the present was assembled: civilisations, religions, empires, revolutions, industry, wars and the modern order, told from more than one shore.",
    starter: true,
    courses: [
      {
        id: "world-history-i",
        title: "World history I: to 1500",
        level: "basic",
        modules: [
          { id: "hi-ancient", title: "Ancient and classical worlds", concepts: [c("agricultural-revolution", "The agricultural revolution"), c("early-civilisations", "Early civilisations"), c("classical-greece", "Classical Greece"), c("roman-republic-and-empire", "The Roman republic and empire"), c("han-china", "Han China and the Chinese state"), c("axial-age-traditions", "Axial-age traditions")] },
          { id: "hi-medieval", title: "Islamic and medieval worlds", concepts: [c("rise-of-islam", "The rise of Islam"), c("islamic-golden-age", "The Islamic golden age"), c("medieval-europe", "Medieval Europe"), c("silk-road", "The Silk Road"), c("mongol-empire", "The Mongol empire"), c("black-death", "The Black Death")] },
        ],
      },
      {
        id: "world-history-ii",
        title: "World history II: 1450 to now",
        level: "intermediate",
        modules: [
          { id: "hi-early-modern", title: "Early modern", concepts: [c("renaissance", "The Renaissance"), c("printing-revolution", "The printing revolution"), c("reformation", "The Reformation"), c("age-of-exploration", "The age of exploration"), c("columbian-exchange", "The Columbian exchange"), c("ottoman-empire", "The Ottoman empire"), c("scientific-revolution", "The scientific revolution"), c("enlightenment", "The Enlightenment")] },
          { id: "hi-modern", title: "The modern world", concepts: [c("atlantic-revolutions", "The Atlantic revolutions"), c("industrial-revolution", "The industrial revolution"), c("imperialism-and-colonialism", "Imperialism and colonialism"), c("nationalism", "Nationalism"), c("first-world-war", "The First World War"), c("interwar-and-depression", "The interwar years and the Depression"), c("second-world-war", "The Second World War"), c("decolonisation", "Decolonisation"), c("cold-war", "The Cold War"), c("globalisation-era", "The era of globalisation")] },
        ],
      },
    ],
  },
  {
    id: "geography",
    title: "Geography",
    summary: "Where things are and why it matters: physical systems, borders, chokepoints, cities, resources and people.",
    starter: false,
    courses: [
      {
        id: "geography-core",
        title: "Geography",
        level: "basic",
        modules: [
          { id: "ge-physical", title: "Physical geography", concepts: [c("physical-geography-systems", "Physical systems"), c("climate-zones", "Climate zones"), c("rivers-and-civilisation", "Rivers and civilisation")] },
          { id: "ge-human", title: "Human geography", concepts: [c("political-borders", "Political borders"), c("chokepoints-and-trade-routes", "Chokepoints and trade routes"), c("cities-and-urbanisation", "Cities and urbanisation"), c("natural-resources", "Natural resources"), c("demographics-and-population", "Demographics and population"), c("world-regions", "World regions")] },
        ],
      },
    ],
  },
  {
    id: "psychology",
    title: "Psychology",
    summary: "How minds work and how we know it: attention, memory, learning, judgment, motivation, social influence and the methods that keep the field honest.",
    starter: false,
    courses: [
      {
        id: "psychology-core",
        title: "Psychology",
        level: "basic",
        modules: [
          { id: "ps-cognition", title: "Cognition and learning", concepts: [c("cognition-and-attention", "Cognition and attention"), c("memory-systems", "Memory systems"), c("learning-and-retrieval", "How learning works: retrieval and spacing"), c("encoding-strategies", "Encoding strategies")] },
          { id: "ps-judgment", title: "Judgment and behaviour", concepts: [c("judgment-heuristics", "Heuristics in judgment"), c("cognitive-biases", "Cognitive biases"), c("motivation", "Motivation"), c("social-influence", "Social influence"), c("personality-research", "Personality research")] },
          { id: "ps-methods", title: "Methods", concepts: [c("psychology-research-methods", "Research methods in psychology"), c("replication-crisis", "The replication crisis")] },
        ],
      },
    ],
  },
  {
    id: "philosophy",
    title: "Philosophy",
    summary: "The disciplined questions under everything: what we can know, what we ought to do, how societies should be arranged, and how science earns its authority.",
    starter: false,
    courses: [
      {
        id: "philosophy-core",
        title: "Philosophy",
        level: "intermediate",
        modules: [
          { id: "ph-knowledge", title: "Knowledge", concepts: [c("epistemology-knowledge-and-belief", "Knowledge and belief"), c("scepticism-and-justification", "Scepticism and justification"), c("philosophy-of-science", "Philosophy of science")] },
          { id: "ph-ethics", title: "Ethics and politics", concepts: [c("ethics-frameworks", "Ethical frameworks"), c("moral-reasoning", "Moral reasoning"), c("political-philosophy", "Political philosophy")] },
          { id: "ph-traditions", title: "Traditions", concepts: [c("major-philosophical-traditions", "Major philosophical traditions")] },
        ],
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    summary: "Conceptual literacy in the physical and living world, and the method by which any of it is known.",
    starter: false,
    courses: [
      {
        id: "science-core",
        title: "Science",
        level: "basic",
        modules: [
          { id: "sc-method", title: "Method", concepts: [c("scientific-method", "The scientific method")] },
          { id: "sc-physical", title: "Physical world", concepts: [c("physics-forces-and-energy", "Forces and energy"), c("thermodynamics-and-entropy", "Thermodynamics and entropy"), c("atoms-and-chemical-bonds", "Atoms and chemical bonds"), c("astronomy-scale-of-universe", "The scale of the universe"), c("earth-systems-plate-tectonics", "Earth systems and plate tectonics"), c("climate-system", "The climate system")] },
          { id: "sc-life", title: "Life", concepts: [c("evolution-by-natural-selection", "Evolution by natural selection"), c("cells-and-genetics", "Cells and genetics")] },
        ],
      },
    ],
  },
  {
    id: "computer_science",
    title: "Computer science",
    summary: "How computation works and how systems are built: programs, algorithms, data, networks, storage and security.",
    starter: false,
    courses: [
      {
        id: "computing-core",
        title: "Computer science",
        level: "basic",
        modules: [
          { id: "cs-computation", title: "Computation", concepts: [c("computation-and-programs", "Computation and programs"), c("algorithms-and-complexity", "Algorithms and complexity"), c("data-structures", "Data structures")] },
          { id: "cs-systems", title: "Systems", concepts: [c("networks-and-internet", "Networks and the internet"), c("databases", "Databases"), c("operating-systems-basics", "Operating systems"), c("security-concepts", "Security concepts")] },
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "Artificial intelligence",
    summary: "What modern AI systems actually do, how they are trained and evaluated, what agents are, and where the limits lie.",
    starter: false,
    courses: [
      {
        id: "ai-core",
        title: "AI",
        level: "intermediate",
        modules: [
          { id: "ai-learning", title: "Learning machines", concepts: [c("machine-learning-basics", "Machine learning basics"), c("training-and-generalisation", "Training and generalisation"), c("neural-networks", "Neural networks")] },
          { id: "ai-language", title: "Language models", concepts: [c("transformers-and-attention", "Transformers and attention"), c("large-language-models", "Large language models"), c("evaluation-and-benchmarks", "Evaluation and benchmarks"), c("ai-agents-and-tools", "Agents and tools"), c("ai-limitations-and-risks", "Limitations and risks")] },
        ],
      },
    ],
  },
  {
    id: "business",
    title: "Business",
    summary: "How organisations make, sell and sustain things: accounting, models, strategy, marketing, operations and the people inside.",
    starter: false,
    courses: [
      {
        id: "business-core",
        title: "Business",
        level: "basic",
        modules: [
          { id: "bu-fundamentals", title: "Fundamentals", concepts: [c("accounting-basics", "Accounting basics"), c("business-models", "Business models"), c("strategy-and-competitive-advantage", "Strategy and competitive advantage")] },
          { id: "bu-operations", title: "Operating", concepts: [c("marketing-fundamentals", "Marketing fundamentals"), c("operations-and-supply-chains", "Operations and supply chains"), c("organisations-and-incentives", "Organisations and incentives"), c("entrepreneurship", "Entrepreneurship")] },
        ],
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    summary: "The pricing of time and risk: statements, valuation, bonds, equities, diversification and why markets sometimes lose their minds.",
    starter: false,
    courses: [
      {
        id: "finance-core",
        title: "Finance",
        level: "intermediate",
        modules: [
          { id: "fi-foundations", title: "Foundations", concepts: [c("time-value-of-money", "The time value of money"), c("financial-statements", "Financial statements"), c("valuation-basics", "Valuation")] },
          { id: "fi-markets", title: "Markets", concepts: [c("bonds-and-interest-rates", "Bonds and interest rates"), c("equities-and-markets", "Equities and markets"), c("risk-and-diversification", "Risk and diversification"), c("portfolio-theory", "Portfolio theory"), c("corporate-finance", "Corporate finance"), c("bubbles-and-manias", "Bubbles and manias")] },
        ],
      },
    ],
  },
  {
    id: "politics",
    title: "Politics and international relations",
    summary: "How power is organised and contested, inside states and between them.",
    starter: false,
    courses: [
      {
        id: "politics-core",
        title: "Politics and international relations",
        level: "intermediate",
        modules: [
          { id: "po-states", title: "States", concepts: [c("states-and-sovereignty", "States and sovereignty"), c("political-systems", "Political systems"), c("institutions-and-rule-of-law", "Institutions and the rule of law"), c("governance-and-legitimacy", "Governance and legitimacy")] },
          { id: "po-world", title: "The world", concepts: [c("international-relations-theories", "Theories of international relations"), c("diplomacy-and-negotiation", "Diplomacy"), c("geopolitics", "Geopolitics")] },
        ],
      },
    ],
  },
  {
    id: "law",
    title: "Law and institutions",
    summary: "The rules societies bind themselves with: legal systems, contracts, courts, constitutions, international bodies and regulation. Educational, not advice.",
    starter: false,
    courses: [
      {
        id: "law-core",
        title: "Law and institutions",
        level: "intermediate",
        modules: [
          { id: "la-systems", title: "Systems", concepts: [c("legal-systems-common-and-civil", "Common law and civil law"), c("contracts", "Contracts"), c("courts-and-procedure", "Courts and procedure")] },
          { id: "la-order", title: "Order", concepts: [c("constitutions", "Constitutions"), c("international-institutions", "International institutions"), c("regulation", "Regulation")] },
        ],
      },
    ],
  },
  {
    id: "art",
    title: "Art",
    summary: "How to look: movements, makers, buildings and the analysis of images.",
    starter: false,
    courses: [
      {
        id: "art-core",
        title: "Art",
        level: "basic",
        modules: [
          { id: "ar-looking", title: "Looking", concepts: [c("visual-analysis", "Visual analysis"), c("renaissance-art", "Renaissance art"), c("impressionism-and-modernism", "Impressionism and modernism"), c("architecture-history", "Architecture through history"), c("art-and-patronage", "Art and patronage")] },
        ],
      },
    ],
  },
  {
    id: "literature",
    title: "Literature",
    summary: "The major traditions and how to read them: narrative, theme, interpretation and the history behind the page.",
    starter: false,
    courses: [
      {
        id: "literature-core",
        title: "Literature",
        level: "basic",
        modules: [
          { id: "li-reading", title: "Reading", concepts: [c("narrative-structure", "Narrative structure"), c("epic-tradition", "The epic tradition"), c("the-novel", "The novel"), c("interpretation-and-themes", "Interpretation and theme"), c("literature-and-history", "Literature and history")] },
        ],
      },
    ],
  },
  {
    id: "culture",
    title: "Culture",
    summary: "What travelled with people: religion as cultural knowledge, food, music, language, custom and the literacy of cities.",
    starter: false,
    courses: [
      {
        id: "culture-core",
        title: "Culture",
        level: "basic",
        modules: [
          { id: "cu-world", title: "The cultural world", concepts: [c("religion-as-cultural-knowledge", "Religion as cultural knowledge"), c("food-and-trade", "Food and trade"), c("music-history", "Music through history"), c("language-families", "Language families"), c("cities-and-travel-literacy", "Cities and travel literacy")] },
        ],
      },
    ],
  },
  {
    id: "communication",
    title: "Writing and speaking",
    summary: "Saying exactly what you mean, on the page and aloud: explanation, summary, argument, evidence, counterargument, synthesis, story and the craft of questions.",
    starter: true,
    courses: [
      {
        id: "writing-core",
        title: "Writing",
        level: "basic",
        modules: [
          { id: "wr-clarity", title: "Clarity", concepts: [c("clear-explanation", "Clear explanation"), c("structure-and-signposting", "Structure and signposting"), c("concision-and-precision", "Concision and precision"), c("summary-and-precis", "Summary and précis")] },
          { id: "wr-argument", title: "Argument", concepts: [c("argument-construction", "Constructing an argument"), c("evidence-and-support", "Evidence and support"), c("counterargument-and-steelman", "Counterargument and steelmanning"), c("synthesis-writing", "Synthesis"), c("thesis-development", "Developing a thesis")] },
        ],
      },
      {
        id: "speaking-core",
        title: "Speaking and questioning",
        level: "basic",
        modules: [
          { id: "sp-voice", title: "Speaking", concepts: [c("oral-explanation", "Explaining aloud"), c("storytelling-structure", "Story structure"), c("analogy-and-explanation", "Analogy")] },
          { id: "sp-questions", title: "Questions", concepts: [c("question-types-and-information-value", "Question types and information value"), c("neutral-vs-leading-questions", "Neutral versus leading questions")] },
        ],
      },
    ],
  },
];

export const STARTER_DOMAINS: DomainId[] = CURRICULUM_SKELETON.filter((d) => d.starter).map((d) => d.id);

/** Every concept id in the skeleton, in curriculum order. */
export const SKELETON_CONCEPT_IDS: string[] = CURRICULUM_SKELETON.flatMap((d) => d.courses.flatMap((co) => co.modules.flatMap((m) => m.concepts.map((x) => x.id))));

export function skeletonConcept(id: string): (SkeletonConcept & { domainId: DomainId; courseId: string; moduleId: string }) | undefined {
  for (const d of CURRICULUM_SKELETON) for (const co of d.courses) for (const m of co.modules) for (const x of m.concepts) if (x.id === id) return { ...x, domainId: d.id, courseId: co.id, moduleId: m.id };
  return undefined;
}
