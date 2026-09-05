import type { RhetoricPrompt } from "@/lib/domain/types";

/**
 * Rhetoric prompts: one per mode at least, most modes twice.
 * Rubric weights sum to 1. keyPoints are lower-case "a|b" alternatives
 * for deterministic coverage scoring (lib/scoring/text.ts) when no model is connected.
 */
export const RHETORIC_PROMPTS: RhetoricPrompt[] = [
  /* ---------------- one_sentence ---------------- */
  {
    id: "rh-one-sentence-central-bank",
    mode: "one_sentence",
    title: "A central bank, in one sentence",
    prompt:
      "Explain what a central bank does in one sentence. The test is whether a sharp sixteen-year-old could repeat it back correctly. Avoid the word 'monetary'.",
    constraints: { maxWords: 35, maxSentences: 1 },
    rubric: [
      { criterion: "Accurate: names the actual levers (the price of money, the backstop for banks, the mandate)", weight: 0.35 },
      { criterion: "One sentence that does not cheat with semicolons", weight: 0.25 },
      { criterion: "Clear to a non-specialist; no jargon", weight: 0.25 },
      { criterion: "Memorable: a shape one could repeat", weight: 0.15 },
    ],
    keyPoints: [
      "interest rate|price of money|cost of borrowing",
      "lender of last resort|backstop|banks in trouble|bank runs",
      "inflation|price stability|stable prices",
      "money supply|issues the currency|creates money|reserves",
    ],
    difficulty: 3,
    subskills: ["rhetoric.concision", "rhetoric.clarity", "knowledge.economics"],
    origin: "seeded",
  },
  {
    id: "rh-one-sentence-double-entry",
    mode: "one_sentence",
    title: "Double-entry, in one sentence",
    prompt:
      "In one sentence, say why double-entry bookkeeping mattered. Not what it is; why a merchant in 1494 would have cared. Under thirty words.",
    constraints: { maxWords: 30, maxSentences: 1 },
    rubric: [
      { criterion: "Captures the mechanism (every transaction recorded twice, so the books check themselves)", weight: 0.35 },
      { criterion: "Says why it mattered, not merely what it was", weight: 0.3 },
      { criterion: "Under thirty words, one sentence", weight: 0.2 },
      { criterion: "Plain language", weight: 0.15 },
    ],
    keyPoints: [
      "twice|two entries|debit and credit|both sides",
      "errors|check|balance|self-checking|catch mistakes",
      "profit|capital|what the business is worth|owner",
      "trust|credit|lenders|partners|investors",
    ],
    difficulty: 4,
    subskills: ["rhetoric.concision", "rhetoric.explanation", "knowledge.business"],
    origin: "seeded",
  },

  /* ---------------- thirty_seconds ---------------- */
  {
    id: "rh-thirty-seconds-suez",
    mode: "thirty_seconds",
    title: "Why Suez matters, in thirty seconds",
    prompt:
      "You have thirty seconds to tell an intelligent friend why the Suez Canal matters to world trade. Twenty seconds to think. Speak or type; the clock runs either way.",
    constraints: { maxWords: 90, prepSeconds: 20, responseSeconds: 30 },
    rubric: [
      { criterion: "The geography is right (Mediterranean to Red Sea; the alternative is around the Cape)", weight: 0.3 },
      { criterion: "Gives a sense of scale or consequence, not just 'it is important'", weight: 0.3 },
      { criterion: "Fits the time: no trailing off, a clean last sentence", weight: 0.25 },
      { criterion: "No filler or hedging", weight: 0.15 },
    ],
    keyPoints: [
      "mediterranean|red sea|europe and asia",
      "cape of good hope|around africa|weeks|ten days|thousands of miles",
      "chokepoint|blocked|ever given|1956|closed",
      "oil|containers|share of world trade|twelve percent|1869",
    ],
    difficulty: 3,
    subskills: ["rhetoric.concision", "composure.pressure", "knowledge.geography"],
    origin: "seeded",
  },
  {
    id: "rh-thirty-seconds-base-rate",
    mode: "thirty_seconds",
    title: "The base-rate fallacy, in thirty seconds",
    prompt:
      "In thirty seconds, explain the base-rate fallacy to someone who has never heard the phrase. Use exactly one example. Twenty seconds to prepare.",
    constraints: { maxWords: 90, prepSeconds: 20, responseSeconds: 30 },
    rubric: [
      { criterion: "The mechanism is correct: vivid specific evidence crowds out how common the thing is to begin with", weight: 0.4 },
      { criterion: "One concrete example that actually demonstrates it", weight: 0.3 },
      { criterion: "Finishes inside the time with a complete thought", weight: 0.2 },
      { criterion: "No jargon beyond the term itself", weight: 0.1 },
    ],
    keyPoints: [
      "how common|prevalence|base rate|prior|to begin with",
      "test|positive|false positive|rare|out of a thousand",
      "vivid|specific|story|ignore|forget",
      "most positives|probably not|still unlikely",
    ],
    difficulty: 4,
    subskills: ["rhetoric.explanation", "composure.pressure", "inference.base_rates"],
    origin: "seeded",
  },

  /* ---------------- three_people ---------------- */
  {
    id: "rh-three-people-inflation",
    mode: "three_people",
    title: "Inflation for three listeners",
    prompt:
      "Explain inflation three times: to a ten-year-old, to the owner of a small bakery, and to a retired economist who will notice if you are vague. Two or three sentences each. The content should change, not just the vocabulary.",
    constraints: { maxWords: 180, maxSentences: 9 },
    rubric: [
      { criterion: "Each version is fitted to what that listener already knows and cares about", weight: 0.4 },
      { criterion: "All three are accurate; the economist's version says something non-trivial", weight: 0.3 },
      { criterion: "Economy: no version is padded", weight: 0.3 },
    ],
    keyPoints: [
      "prices go up|things cost more|the same money buys less",
      "flour|wages|costs|margins|raise prices|customers",
      "expectations|money supply|demand|interest rates|supply shock",
      "purchasing power|value of money|real|nominal",
    ],
    difficulty: 4,
    subskills: ["rhetoric.explanation", "social.perspective", "rhetoric.clarity"],
    origin: "seeded",
  },
  {
    id: "rh-three-people-falsifiability",
    mode: "three_people",
    title: "Falsifiability for three listeners",
    prompt:
      "Explain falsifiability to a curious fourteen-year-old, to a working nurse, and to a sceptical lawyer who suspects it is philosophers' hair-splitting. Two or three sentences each. Each version needs its own example.",
    constraints: { maxWords: 180, maxSentences: 9 },
    rubric: [
      { criterion: "Each version has an example the listener would recognise from their own life", weight: 0.4 },
      { criterion: "The core idea survives all three: a claim counts as testable only if something could show it wrong", weight: 0.35 },
      { criterion: "Economy", weight: 0.25 },
    ],
    keyPoints: [
      "could be proven wrong|what would show it false|risky prediction|rule something out",
      "popper|karl popper",
      "test|evidence|prediction|trial|diagnosis",
      "explains everything|horoscope|astrology|unfalsifiable|no possible evidence",
    ],
    difficulty: 4,
    subskills: ["rhetoric.explanation", "social.perspective", "knowledge.philosophy"],
    origin: "seeded",
  },

  /* ---------------- story ---------------- */
  {
    id: "rh-story-black-death",
    mode: "story",
    title: "The Black Death, as a scene",
    prompt:
      "Tell the arrival of the Black Death in Europe as a story with one protagonist: a Genoese sailor, a Messina harbour official, a Florentine notary, a parish priest in Dorset. One scene, not a summary. At most 150 words. Keep it true: the galleys reached Messina in October 1347; the disease reached Genoa, Marseille and Pisa within months; something between a third and a half of Europe died over the next five years.",
    constraints: { maxWords: 150 },
    rubric: [
      { criterion: "A scene: one moment, concrete details, a person with something at stake", weight: 0.3 },
      { criterion: "Historically accurate; nothing invented that contradicts the record", weight: 0.3 },
      { criterion: "An arc, however small: the reader ends somewhere different from where they began", weight: 0.25 },
      { criterion: "Economy: 150 words spent well", weight: 0.15 },
    ],
    keyPoints: [
      "1347|1348|october|messina|genoa|marseille",
      "ship|galley|harbour|port|sailors",
      "died|dead|buried|a third|half",
      "fear|fled|quarantine|turned away|locked",
    ],
    difficulty: 4,
    subskills: ["rhetoric.storytelling", "rhetoric.concision", "knowledge.history"],
    origin: "seeded",
  },
  {
    id: "rh-story-michelin",
    mode: "story",
    title: "Why a tyre company rates restaurants",
    prompt:
      "Tell the origin of the Michelin Guide as a story, under 150 words. The facts: in 1900 there were a few thousand cars in France; the brothers André and Édouard Michelin, tyre makers in Clermont-Ferrand, printed a free guide with maps, mechanics and hotels, so that people would drive further and wear out tyres. It became a paid book in 1920, a single star for good food appeared in 1926, and the three-star scale followed in the early 1930s. Make the reader feel the logic of the idea, not just the dates.",
    constraints: { maxWords: 150 },
    rubric: [
      { criterion: "The reader understands the incentive: more driving means more tyres", weight: 0.35 },
      { criterion: "Told as a story with a beginning, a turn and an ending, not a timeline", weight: 0.3 },
      { criterion: "Accurate to the facts given", weight: 0.2 },
      { criterion: "Economy", weight: 0.15 },
    ],
    keyPoints: [
      "tyres|tires|wear out|drive more|drive further",
      "1900|free|maps|mechanics|garages",
      "stars|1926|1931|inspectors",
      "brothers|andré|édouard|clermont-ferrand",
    ],
    difficulty: 3,
    subskills: ["rhetoric.storytelling", "rhetoric.explanation", "knowledge.business"],
    origin: "seeded",
  },

  /* ---------------- anecdote ---------------- */
  {
    id: "rh-anecdote-rosetta",
    mode: "anecdote",
    title: "The Rosetta Stone, at a dinner table",
    prompt:
      "Retell the rediscovery of the Rosetta Stone as a dinner-table anecdote, under 120 words. The event: in July 1799, French soldiers under Lieutenant Pierre-François Bouchard were strengthening the walls of Fort Julien near Rashid (Rosetta) in the Nile delta, part of Napoleon's Egyptian expedition, when they pulled out a slab of dark granodiorite carrying the same decree in three scripts: hieroglyphic, demotic and Greek. The savants of the expedition realised what the Greek could unlock. When the French surrendered in 1801, the British took the stone under the Capitulation of Alexandria; it has been in the British Museum since 1802. Thomas Young made progress with the demotic; Jean-François Champollion announced the decipherment of the hieroglyphs in 1822. An anecdote needs a turn and a last line that lands.",
    constraints: { maxWords: 120 },
    rubric: [
      { criterion: "The turn is clear: an accident of military engineering became the key to a dead script", weight: 0.35 },
      { criterion: "Accurate on the facts given; no embellishment that the record contradicts", weight: 0.3 },
      { criterion: "A last line that lands", weight: 0.2 },
      { criterion: "Under 120 words", weight: 0.15 },
    ],
    keyPoints: [
      "1799|napoleon|french soldiers|fort|bouchard",
      "rosetta|rashid|nile delta",
      "three scripts|greek|demotic|hieroglyph",
      "champollion|1822|deciphered|young",
      "british|1801|alexandria|british museum",
    ],
    difficulty: 3,
    subskills: ["rhetoric.storytelling", "rhetoric.concision", "knowledge.history"],
    origin: "seeded",
  },
  {
    id: "rh-anecdote-morgan-1907",
    mode: "anecdote",
    title: "Morgan's library, 1907",
    prompt:
      "Retell the night of 2 November 1907 as an anecdote, under 120 words. The event: in October 1907 a failed attempt to corner the shares of United Copper set off runs on the New York trusts; the Knickerbocker Trust Company collapsed on 22 October. The United States had no central bank. J. Pierpont Morgan, seventy years old, became one in person: he had teams audit which trusts were solvent, pressed the banks to lend, and on the night of 2 November gathered the presidents of the trust companies in the East Room of his library on 36th Street and locked the door until, near five in the morning, they had signed a twenty-five-million-dollar rescue. Congress created the National Monetary Commission in 1908, and the Federal Reserve in 1913. Tell it so the listener understands why a country decided it did not want to depend on one old man again.",
    constraints: { maxWords: 120 },
    rubric: [
      { criterion: "The point survives: a private banker as lender of last resort, and why that was untenable", weight: 0.35 },
      { criterion: "Accurate to the facts given", weight: 0.3 },
      { criterion: "Told with a scene (the locked room, the hour) rather than a summary", weight: 0.2 },
      { criterion: "Under 120 words", weight: 0.15 },
    ],
    keyPoints: [
      "1907|october|november",
      "knickerbocker|trust companies|run|panic",
      "library|locked|five in the morning|signed",
      "no central bank|lender of last resort|federal reserve|1913",
      "morgan|seventy|private banker|one man",
    ],
    difficulty: 4,
    subskills: ["rhetoric.storytelling", "rhetoric.explanation", "knowledge.economics"],
    origin: "seeded",
  },

  /* ---------------- analogy ---------------- */
  {
    id: "rh-analogy-bayes",
    mode: "analogy",
    title: "An analogy for updating",
    prompt:
      "Give one analogy that explains Bayesian updating to a non-specialist: a starting belief, evidence of some strength, a revised belief. Then, in one sentence, say where the analogy breaks. An analogy without a stated limit is a slogan.",
    constraints: { maxWords: 130 },
    rubric: [
      { criterion: "The analogy maps the parts: prior, evidence strength, posterior", weight: 0.4 },
      { criterion: "The breaking point is named honestly and is a real limit", weight: 0.25 },
      { criterion: "Clear enough to use at a dinner table", weight: 0.35 },
    ],
    keyPoints: [
      "starting belief|prior|before you look|going in",
      "evidence|clue|update|adjust|shift",
      "how surprising|strength|how much|likelihood|weak evidence|strong evidence",
      "breaks|limit|falls apart|does not capture|where it fails",
    ],
    difficulty: 4,
    subskills: ["rhetoric.analogy", "inference.updating", "rhetoric.explanation"],
    origin: "seeded",
  },
  {
    id: "rh-analogy-container",
    mode: "analogy",
    title: "What the container is like",
    prompt:
      "Find an analogy from a different domain for what the shipping container did to trade: a standard that made a routine operation cheap, so that everything built on top of it changed. Explain the analogy in a few sentences and say where it stops working.",
    constraints: { maxWords: 140 },
    rubric: [
      { criterion: "The analogue genuinely shares the mechanism (standard interface, handling cost collapses, downstream reorganisation)", weight: 0.4 },
      { criterion: "The limit is stated and is specific to this pairing", weight: 0.25 },
      { criterion: "Clarity and economy", weight: 0.35 },
    ],
    keyPoints: [
      "standard|interchangeable|same size|any ship|any truck|any crane",
      "cost|cheap|handling|dockside|hours not days",
      "interface|protocol|plug|socket|format|usb|shipping container",
      "limit|breaks|differs|unlike",
    ],
    difficulty: 5,
    subskills: ["rhetoric.analogy", "synthesis.cross_domain", "knowledge.business"],
    origin: "seeded",
  },

  /* ---------------- argument ---------------- */
  {
    id: "rh-argument-gold-standard",
    mode: "argument",
    title: "Against restoring the gold standard",
    prompt:
      "Argue, in under 200 words, that the gold standard should not be restored. Structure: a claim, two reasons each with a piece of evidence, one objection you take seriously and answer. You may think the opposite; argue this side anyway.",
    constraints: { maxWords: 200 },
    rubric: [
      { criterion: "Structure is visible: claim, reasons, objection, answer", weight: 0.3 },
      { criterion: "Each reason carries real evidence (a period, a number, a mechanism), not assertion", weight: 0.3 },
      { criterion: "The objection is the strongest available and is actually answered", weight: 0.25 },
      { criterion: "Clarity: a reader can restate the argument in one breath", weight: 0.15 },
    ],
    keyPoints: [
      "deflation|falling prices|1930s|depression|1929",
      "cannot respond|lender of last resort|crisis|money supply fixed|left gold first recovered first",
      "gold supply|mining|discoveries|arbitrary",
      "objection|discipline|inflation|printing|politicians",
      "bretton woods|1971|nixon|1933",
    ],
    difficulty: 5,
    subskills: ["rhetoric.argument", "knowledge.economics", "rhetoric.clarity"],
    origin: "seeded",
  },

  /* ---------------- steelman ---------------- */
  {
    id: "rh-steelman-central-bank-independence",
    mode: "steelman",
    title: "Steelman: central banks should answer to parliaments",
    prompt:
      "Below is a weak version of the argument that central banks should not be independent of elected government. Rewrite it as the strongest version: the one a thoughtful defender of independence could not wave away. Keep it under 180 words. Do not argue the other side; that is a different exercise.",
    source:
      "Central bank independence is undemocratic. Unelected economists in a marble building decide how much everyone pays on their mortgage and nobody can vote them out. They always side with the banks and the rich. Governments should be able to set interest rates because they were elected and know what people need. Independence is just a way for elites to keep control.",
    constraints: { maxWords: 180 },
    rubric: [
      { criterion: "Charitable: drops the sneers and keeps the strongest underlying claims", weight: 0.3 },
      { criterion: "Adds the best arguments the original missed (distributional effects are political choices; monetary and fiscal policy have to coordinate; accountability is not the same as day-to-day control)", weight: 0.35 },
      { criterion: "Would be recognised by a defender of the position as a fair statement of it", weight: 0.2 },
      { criterion: "Clear and under length", weight: 0.15 },
    ],
    keyPoints: [
      "democratic|accountability|elected|legitimacy|mandate",
      "distributional|winners and losers|savers|borrowers|asset prices|political choices",
      "coordination|fiscal|monetary|deficit|treasury",
      "not technical|value judgement|trade-off|whose inflation",
    ],
    difficulty: 5,
    subskills: ["rhetoric.argument", "social.perspective", "inference.alternatives"],
    origin: "seeded",
  },

  /* ---------------- precision ---------------- */
  {
    id: "rh-precision-hanseatic",
    mode: "precision",
    title: "Tighten: the Hanseatic League",
    prompt:
      "Cut the passage below to sixty words or fewer without losing a single fact. Every date, place and number must survive. Every hedge that adds nothing must go.",
    source:
      "It is generally agreed by most historians who have studied the period that the Hanseatic League, which was, in essence, a kind of commercial and defensive association or confederation of merchant guilds and market towns located in Northern Europe, especially in the area around the Baltic and North Seas, played a very significant and important role in the trade of the region. The League, which is thought to have come into being at some point in the twelfth or thirteenth century, was centred on the city of Lübeck, which was its most important city, and it eventually came to include a large number of cities, perhaps as many as two hundred at its peak, according to some estimates. It had trading posts, known as Kontore, in a number of foreign cities, including London, Bruges, Bergen and Novgorod. The first general assembly, known as the Hansetag, took place in 1356. Over time, the League gradually declined in importance, and the final meeting was held in 1669.",
    constraints: { maxWords: 60 },
    rubric: [
      { criterion: "Every fact survives: Lübeck, twelfth or thirteenth century origin, about two hundred towns, Kontore in London, Bruges, Bergen and Novgorod, first Hansetag 1356, last meeting 1669", weight: 0.4 },
      { criterion: "Sixty words or fewer", weight: 0.3 },
      { criterion: "Reads as prose, not a list of fragments", weight: 0.3 },
    ],
    keyPoints: [
      "lübeck|lubeck",
      "1356|hansetag",
      "london|bruges|bergen|novgorod|kontor",
      "two hundred|200",
      "1669|last meeting|final assembly",
      "twelfth|thirteenth|1100s|1200s",
    ],
    difficulty: 3,
    subskills: ["rhetoric.precision", "rhetoric.concision"],
    origin: "seeded",
  },
  {
    id: "rh-precision-supplier-memo",
    mode: "precision",
    title: "Tighten: the supplier memo",
    prompt:
      "Rewrite the message below in fifty words or fewer so that a busy reader knows what happened, what it costs, and what is being asked of them by when. Keep every fact. Lose everything else.",
    source:
      "I just wanted to reach out and touch base with everyone to give a quick update on where things currently stand at this moment in time with respect to the Larkin order. As some of you may already be aware, the supplier that we have been working with for the aluminium housings has informed us that, due to a number of factors on their end, the delivery will now be delayed by approximately two weeks, which obviously is not ideal from our perspective. Having looked into it, I don't believe that this will have any impact whatsoever on the overall budget for the project, as the pricing that was agreed remains the same. However, it does mean that we will need to make a decision, ideally by close of business on Friday, as to whether we want to go ahead and accept the delay or alternatively look at sourcing the housings from a different supplier, which may or may not be quicker. Please let me know your thoughts.",
    constraints: { maxWords: 50 },
    rubric: [
      { criterion: "All four facts survive: Larkin order, aluminium housings two weeks late, budget unchanged, decision needed by Friday between accepting the delay and switching supplier", weight: 0.4 },
      { criterion: "Fifty words or fewer", weight: 0.3 },
      { criterion: "The ask is unmistakable and comes early", weight: 0.3 },
    ],
    keyPoints: [
      "two weeks|fortnight|delayed",
      "larkin",
      "housings|aluminium|supplier",
      "budget unchanged|no cost impact|price unchanged|same price",
      "friday|decide|decision",
      "accept|alternative supplier|switch|another supplier",
    ],
    difficulty: 2,
    subskills: ["rhetoric.precision", "rhetoric.concision", "rhetoric.clarity"],
    origin: "seeded",
  },

  /* ---------------- question ---------------- */
  {
    id: "rh-question-shipping-executive",
    mode: "question",
    title: "Three questions for a shipping executive",
    prompt:
      "You have twenty minutes with the operations director of a container line. Write the three questions you would ask, in order, and one sentence for each on why it is worth her time. Questions should be open, not leading, and should aim at what you could not find out from a search engine.",
    constraints: { maxWords: 150, maxSentences: 9 },
    rubric: [
      { criterion: "Information value: each question could produce an answer that changes what you think", weight: 0.4 },
      { criterion: "Open and non-leading; no question smuggles in its answer", weight: 0.25 },
      { criterion: "The order makes sense: builds trust or context before the hardest question", weight: 0.2 },
      { criterion: "Brevity: questions a person could actually be asked aloud", weight: 0.15 },
    ],
    keyPoints: [
      "how|what|why|when",
      "surprised|changed your mind|wrong about|misunderstand",
      "bottleneck|constraint|cost|decision|trade-off",
      "not in the papers|could not search|from the inside|day to day",
    ],
    difficulty: 4,
    subskills: ["rhetoric.precision", "social.question_quality", "curiosity.questioning"],
    origin: "seeded",
  },

  /* ---------------- impromptu ---------------- */
  {
    id: "rh-impromptu-car-free-centres",
    mode: "impromptu",
    title: "Impromptu: cars out of city centres",
    prompt:
      "Should cities ban private cars from their centres? Thirty seconds to think, ninety seconds to speak. Take a side, give two reasons, name the strongest objection, and finish on time.",
    constraints: { prepSeconds: 30, responseSeconds: 90, maxWords: 230 },
    rubric: [
      { criterion: "A clear position stated early and held", weight: 0.3 },
      { criterion: "Structure a listener can follow: reasons, objection, close", weight: 0.3 },
      { criterion: "At least one concrete example or mechanism, not just values", weight: 0.25 },
      { criterion: "Composure: minimal filler, no restarting, ends deliberately", weight: 0.15 },
    ],
    keyPoints: [
      "air quality|pollution|emissions|noise",
      "deliveries|disabled|access|exemptions|emergency",
      "shops|footfall|business|trade",
      "public transport|bicycle|alternatives|park and ride",
    ],
    difficulty: 4,
    subskills: ["rhetoric.argument", "composure.pressure", "rhetoric.clarity"],
    origin: "seeded",
  },
  {
    id: "rh-impromptu-breadth-depth",
    mode: "impromptu",
    title: "Impromptu: a little about everything, or a lot about one thing",
    prompt:
      "Is it better to know a little about many things or a lot about one? Thirty seconds to think, ninety to speak. 'It depends' is allowed only if you say on what, and then commit.",
    constraints: { prepSeconds: 30, responseSeconds: 90, maxWords: 230 },
    rubric: [
      { criterion: "Commits to a position, or to a precise condition on which the answer turns", weight: 0.3 },
      { criterion: "Structure: the listener could summarise it in two sentences", weight: 0.3 },
      { criterion: "Uses at least one example that does real work", weight: 0.25 },
      { criterion: "Composure and timing", weight: 0.15 },
    ],
    keyPoints: [
      "connect|connections|synthesis|transfer|see patterns",
      "expertise|depth|mastery|ten thousand hours|specialist",
      "depends|purpose|stage|early in a career|later",
      "both|t-shaped|generalist|foundation then depth",
    ],
    difficulty: 3,
    subskills: ["rhetoric.argument", "composure.pressure", "rhetoric.explanation"],
    origin: "seeded",
  },
];
