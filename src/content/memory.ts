/**
 * Memory seeds: people for Names & Details, and the first items a user can
 * enrol into spaced review. Everything here is authored, checked, and works
 * with no model connected. Facts are correct; where a date is approximate or
 * contested, the answer says so.
 *
 * Matching: `accept` holds lower-case alternative phrasings and key terms a
 * correct free-text answer is likely to contain. `sequence` items are checked
 * by order; `answer` is the readable form of the same list.
 */
import type { MemorySeed, PersonCard } from "@/lib/domain/content";

/* ---------------------------------------------------------------------- */
/* People                                                                   */
/* ---------------------------------------------------------------------- */

export const PEOPLE: PersonCard[] = [
  {
    id: "ppl-maya-chen",
    name: "Maya Chen",
    profession: "Structural engineer",
    origin: "Vancouver, Canada",
    interest: "Cold-water swimming",
    detail: "Orders a cortado and sends it back if it arrives as a flat white.",
  },
  {
    id: "ppl-tunde-adebayo",
    name: "Tunde Adebayo",
    profession: "Logistics manager",
    origin: "Ikeja, Lagos, Nigeria",
    interest: "Chess openings",
    detail: "Cycles to work in all weather and keeps a spare shirt in a dry bag.",
  },
  {
    id: "ppl-ingrid-solheim",
    name: "Ingrid Solheim",
    profession: "Marine biologist",
    origin: "Tromsø, Norway",
    interest: "Baroque cello recordings",
    detail: "Keeps a brass barometer on her desk and reads it aloud each morning.",
  },
  {
    id: "ppl-rafael-ortiz",
    name: "Rafael Ortiz Mendieta",
    profession: "Pastry chef",
    origin: "Oaxaca, Mexico",
    interest: "Amateur astronomy",
    detail: "Writes every recipe in pencil, never pen, so it can be corrected.",
  },
  {
    id: "ppl-priya-raghunathan",
    name: "Priya Raghunathan",
    profession: "Patent attorney",
    origin: "Chennai, India",
    interest: "Carnatic vocal music",
    detail: "Takes the stairs, always, even to the ninth floor.",
  },
  {
    id: "ppl-yusuf-demir",
    name: "Yusuf Demir",
    profession: "Ferry captain",
    origin: "Kadıköy, Istanbul, Turkey",
    interest: "Ottoman-era maps",
    detail: "Drinks tea only from a tulip glass and refuses a mug on principle.",
  },
  {
    id: "ppl-aoife-ni-bhriain",
    name: "Aoife Ní Bhriain",
    profession: "Cartographer",
    origin: "Galway, Ireland",
    interest: "Sea kayaking",
    detail: "Carries a fountain pen filled with green ink.",
  },
  {
    id: "ppl-kenji-watanabe",
    name: "Kenji Watanabe",
    profession: "Timber-frame carpenter",
    origin: "Takayama, Japan",
    interest: "Shogi",
    detail: "Sharpens his chisels every Sunday morning before doing anything else.",
  },
  {
    id: "ppl-amara-okonkwo",
    name: "Amara Okonkwo",
    profession: "Emergency physician",
    origin: "Enugu, Nigeria, now in Manchester",
    interest: "Contemporary Nigerian fiction",
    detail: "Runs at five in the morning and photographs the same canal bridge every time.",
  },
  {
    id: "ppl-lukas-brandt",
    name: "Lukas Brandt",
    profession: "Glassblower",
    origin: "Leipzig, Germany",
    interest: "1970s German electronic music",
    detail: "Has named each of his three furnaces after a composer.",
  },
  {
    id: "ppl-farida-haddad",
    name: "Farida Haddad",
    profession: "Hydrologist",
    origin: "Amman, Jordan",
    interest: "Arabic calligraphy",
    detail: "Keeps a jar of Dead Sea salt on her office windowsill.",
  },
  {
    id: "ppl-santiago-villalobos",
    name: "Santiago Villalobos",
    profession: "Vineyard manager",
    origin: "Mendoza, Argentina",
    interest: "Tango, danced badly by his own account",
    detail: "Checks three different weather forecasts every morning and averages them.",
  },
  {
    id: "ppl-hana-novakova",
    name: "Hana Nováková",
    profession: "Court interpreter (Czech, German, English)",
    origin: "Brno, Czech Republic",
    interest: "Constructing crosswords",
    detail: "Eats lentil soup at the same counter every Tuesday.",
  },
  {
    id: "ppl-malik-thompson",
    name: "Malik Thompson",
    profession: "Jazz drummer and music teacher",
    origin: "New Orleans, United States",
    interest: "Restoring vintage valve radios",
    detail: "Taps paradiddles on whatever table he sits at.",
  },
  {
    id: "ppl-sofia-andersson",
    name: "Sofia Andersson",
    profession: "Actuary",
    origin: "Gothenburg, Sweden",
    interest: "Birdwatching",
    detail: "Uses a paper notebook with numbered pages and a ribbon marker.",
  },
  {
    id: "ppl-giorgi-beridze",
    name: "Giorgi Beridze",
    profession: "Bookbinder",
    origin: "Tbilisi, Georgia",
    interest: "Georgian polyphonic singing",
    detail: "Smells the paper of every book before quoting for a repair.",
  },
];

const personById = (id: string): PersonCard => {
  const p = PEOPLE.find((x) => x.id === id);
  if (!p) throw new Error("Unknown person id " + id);
  return p;
};

/* ---------------------------------------------------------------------- */
/* Seeds                                                                    */
/* ---------------------------------------------------------------------- */

const FACTS: MemorySeed[] = [
  {
    id: "mem-fact-suez-opened",
    kind: "fact",
    prompt: "In which year was the Suez Canal opened to shipping?",
    answer: "1869",
    accept: ["1869", "november 1869"],
    hint: "The same decade in which the American Civil War ended, and ten years after digging began.",
    archiveRef: "suez-canal",
    tags: ["geography", "history", "trade", "nineteenth century"],
  },
  {
    id: "mem-fact-westphalia-year",
    kind: "fact",
    prompt: "In which year did the Peace of Westphalia end the Thirty Years' War?",
    answer: "1648",
    accept: ["1648"],
    hint: "Thirty years after the Defenestration of Prague in 1618.",
    archiveRef: "peace-of-westphalia",
    tags: ["history", "politics", "sovereignty", "seventeenth century"],
  },
  {
    id: "mem-fact-constantinople-1453",
    kind: "fact",
    prompt: "In which year did the Ottomans under Mehmed II take Constantinople?",
    answer: "1453",
    accept: ["1453", "may 1453"],
    hint: "Mid-fifteenth century; the same decade as Gutenberg's Bible.",
    archiveRef: "ottoman-empire",
    tags: ["history", "istanbul", "ottoman", "byzantium"],
  },
  {
    id: "mem-fact-gutenberg-bible",
    kind: "fact",
    prompt: "Roughly when did Gutenberg finish printing his Bible in Mainz?",
    answer: "About 1455 (usually dated 1454–1455; the exact year is not documented).",
    accept: ["1455", "1454", "mid 1450s", "mid-1450s", "c. 1455", "around 1455"],
    hint: "Two years after the fall of Constantinople.",
    archiveRef: "printing-press",
    tags: ["history", "technology", "printing", "fifteenth century"],
  },
  {
    id: "mem-fact-bretton-woods-where",
    kind: "fact",
    prompt: "The Bretton Woods conference: which year, and in which US state?",
    answer: "July 1944, New Hampshire (at the Mount Washington Hotel, Bretton Woods).",
    accept: ["1944 new hampshire", "1944", "new hampshire", "mount washington hotel"],
    hint: "It met while the war in Europe was still being fought, a month after D-Day.",
    archiveRef: "bretton-woods",
    tags: ["economics", "monetary system", "history", "twentieth century"],
  },
  {
    id: "mem-fact-rosetta-scripts",
    kind: "fact",
    prompt: "The Rosetta Stone carries one decree in three scripts. Name them.",
    answer: "Egyptian hieroglyphs, Demotic (a cursive Egyptian script) and Ancient Greek.",
    accept: ["hieroglyphs demotic greek", "hieroglyphic demotic greek", "hieroglyphs, demotic, greek", "hieroglyphic, demotic and greek"],
    hint: "Two are Egyptian; the third was the language of the Ptolemaic court.",
    archiveRef: "rosetta-stone",
    tags: ["history", "language", "egypt", "decipherment"],
  },
  {
    id: "mem-fact-pacioli-1494",
    kind: "fact",
    prompt: "Who published the first printed description of double-entry bookkeeping, and in which year and city?",
    answer: "Luca Pacioli, in 1494, in Venice (in the Summa de arithmetica). He described the method; Italian merchants had been using it for well over a century.",
    accept: ["pacioli 1494 venice", "pacioli", "1494", "luca pacioli", "summa de arithmetica"],
    hint: "A Franciscan friar and mathematician, two years after Columbus's first voyage.",
    archiveRef: "double-entry-bookkeeping",
    tags: ["business", "accounting", "history", "renaissance"],
  },
  {
    id: "mem-fact-magna-carta-1215",
    kind: "fact",
    prompt: "In which year was Magna Carta sealed at Runnymede?",
    answer: "1215",
    accept: ["1215", "june 1215"],
    hint: "King John; early thirteenth century.",
    archiveRef: "magna-carta",
    tags: ["law", "history", "england", "thirteenth century"],
  },
  {
    id: "mem-fact-bosporus-seas",
    kind: "fact",
    prompt: "The Bosporus connects which two bodies of water?",
    answer: "The Black Sea (north) and the Sea of Marmara (south), which in turn leads through the Dardanelles to the Aegean.",
    accept: ["black sea and sea of marmara", "black sea marmara", "marmara and black sea", "black sea, sea of marmara"],
    hint: "Not the Aegean directly; there is a small inland sea in between.",
    archiveRef: "bosporus",
    tags: ["geography", "istanbul", "straits", "black sea"],
  },
  {
    id: "mem-fact-black-death-arrival",
    kind: "fact",
    prompt: "In which year, and through which port, did the Black Death first arrive in Italy?",
    answer: "1347, at Messina in Sicily, aboard Genoese ships coming from Caffa on the Black Sea.",
    accept: ["1347 messina", "1347", "messina", "messina sicily 1347"],
    hint: "Sicily, a year before it reached Florence and Paris.",
    archiveRef: "black-death",
    tags: ["history", "epidemics", "trade routes", "fourteenth century"],
  },
];

const CONCEPTS: MemorySeed[] = [
  {
    id: "mem-concept-base-rate",
    kind: "concept",
    prompt: "Define: base rate.",
    answer:
      "The underlying frequency of an outcome or category in the relevant population, before any specific evidence about the case is considered. It is the starting point a good estimate updates from.",
    accept: ["prior probability", "prevalence", "background frequency", "how common it is in general", "underlying frequency", "general population rate"],
    hint: "What you would guess if you knew nothing about this particular case.",
    archiveRef: "base-rate-fallacy",
    tags: ["inference", "probability", "statistics", "reasoning"],
  },
  {
    id: "mem-concept-brier-score",
    kind: "concept",
    prompt: "Define: Brier score.",
    answer:
      "A measure of forecast accuracy: the mean squared difference between the probabilities you assigned and what actually happened (1 for yes, 0 for no). For a single yes/no event it is (forecast − outcome)². Zero is perfect; lower is better.",
    accept: ["mean squared error", "squared difference between forecast and outcome", "lower is better", "forecast minus outcome squared", "squared error of probability forecasts"],
    hint: "Named after a meteorologist; punishes confident wrong answers most.",
    tags: ["calibration", "forecasting", "statistics", "scoring rule"],
  },
  {
    id: "mem-concept-batna",
    kind: "concept",
    prompt: "Define: BATNA.",
    answer:
      "Best Alternative To a Negotiated Agreement: what you will actually do if no deal is reached. It sets your walk-away point, and the strength of your position depends more on it than on anything said at the table.",
    accept: ["best alternative to a negotiated agreement", "walk-away option", "walk away point", "fallback if no deal", "what you do if talks fail", "no-deal alternative"],
    hint: "Fisher and Ury, Getting to Yes. Think about the table you could leave for.",
    tags: ["negotiation", "strategy", "leverage"],
  },
  {
    id: "mem-concept-second-order-effect",
    kind: "concept",
    prompt: "Define: second-order effect.",
    answer:
      "The consequence of a consequence: what happens once people, markets or systems react to the first effect of a change. Often delayed, and sometimes opposite in sign to the first-order effect (a rent cap lowers rents, then shrinks the supply of rentals).",
    accept: ["consequences of consequences", "knock-on effects", "effects of the reaction", "what happens after people respond", "and then what", "downstream consequences"],
    hint: "Ask 'and then what?' about the first answer.",
    tags: ["strategy", "systems thinking", "incentives", "consequences"],
  },
  {
    id: "mem-concept-falsifiability",
    kind: "concept",
    prompt: "Define: falsifiability.",
    answer:
      "Popper's criterion: a claim is scientific (and informative) only if some possible observation could show it to be false. A theory that forbids nothing explains nothing. The mark of a strong claim is that it makes risky predictions.",
    accept: ["could be proven wrong", "could be shown false", "refutable", "makes risky predictions", "forbids something", "popper", "testable"],
    hint: "Karl Popper. Ask what observation would count against the claim.",
    archiveRef: "falsifiability",
    tags: ["philosophy", "science", "epistemology", "reasoning"],
  },
  {
    id: "mem-concept-optionality",
    kind: "concept",
    prompt: "Define: optionality.",
    answer:
      "Holding the right, but not the obligation, to act later. An optionality-rich position has a capped downside and an open upside, so it becomes more valuable as uncertainty rises; it is worth paying a small, known cost to keep it.",
    accept: ["right but not the obligation", "keeping options open", "asymmetric payoff", "capped downside open upside", "ability to choose later", "flexibility to decide later"],
    hint: "Borrowed from finance: what does an option give you, and when is it worth most?",
    tags: ["strategy", "decision making", "uncertainty", "finance"],
  },
  {
    id: "mem-concept-opportunity-cost",
    kind: "concept",
    prompt: "Define: opportunity cost.",
    answer:
      "The value of the best alternative you give up when you choose one course of action. The true cost of anything is not its price but the next-best use of the same money, time or attention.",
    accept: ["next best alternative forgone", "best alternative given up", "what you give up", "value of the alternative", "best alternative use", "forgone alternative"],
    hint: "Not what you paid; what else you could have done with it.",
    tags: ["economics", "decision making", "trade-offs"],
  },
  {
    id: "mem-concept-availability-heuristic",
    kind: "concept",
    prompt: "Define: availability heuristic.",
    answer:
      "Judging how common or likely something is by how easily examples come to mind. Vivid, recent or widely reported events feel more frequent than they are (plane crashes versus car crashes). Tversky and Kahneman, 1973.",
    accept: ["ease of recall", "how easily examples come to mind", "what comes to mind easily", "vivid examples feel more common", "recent or memorable events seem more likely", "tversky kahneman"],
    hint: "Why people overestimate shark attacks and underestimate falls in the bathroom.",
    archiveRef: "availability-heuristic",
    tags: ["psychology", "inference", "bias", "probability"],
  },
];

const SEQUENCES: MemorySeed[] = [
  {
    id: "mem-seq-inference-ladder",
    kind: "sequence",
    prompt: "The five rungs of the Inference Ladder, in order.",
    answer: "Observed → Inferred → Because → Alternatives → Confidence",
    sequence: ["Observed", "Inferred", "Because", "Alternatives", "Confidence"],
    accept: ["observed inferred because alternatives confidence"],
    hint: "Start with what was literally there; end with how sure you are.",
    tags: ["inference", "method", "the study", "observation"],
  },
  {
    id: "mem-seq-case-flow",
    kind: "sequence",
    prompt: "After you enter a case, what are the first six working stages, in order?",
    answer: "Notice → Recall → Separate → Hypotheses → Question → Evidence",
    sequence: ["Notice", "Recall", "Separate", "Hypotheses", "Question", "Evidence"],
    accept: ["notice recall separate hypotheses question evidence"],
    hint: "You cannot separate observation from interpretation before you have recalled what you noticed; you should not ask questions before you have something to test.",
    tags: ["casebook", "method", "the study", "process"],
  },
  {
    id: "mem-seq-learning-loop",
    kind: "sequence",
    prompt: "The Study's knowledge loop, in order.",
    answer: "Discover → Understand → Connect → Retrieve → Use",
    sequence: ["Discover", "Understand", "Connect", "Retrieve", "Use"],
    accept: ["discover understand connect retrieve use"],
    hint: "Reading is the first step, not the last. Retrieval comes before application.",
    tags: ["memory", "method", "the study", "learning"],
  },
  {
    id: "mem-seq-empire-peaks",
    kind: "sequence",
    prompt: "Put these powers in the order of their peaks: Ottoman Empire, Mongol Empire, Napoleonic France, Ming China, Dutch East India Company.",
    answer:
      "Mongol Empire (late 13th c., Kublai Khan) → Ming China (early 15th c., Yongle) → Ottoman Empire (mid 16th c., Suleiman) → Dutch East India Company (mid–late 17th c.) → Napoleonic France (1810–1812). Exactly when a power peaked is arguable; the order is not.",
    sequence: ["Mongol Empire", "Ming China", "Ottoman Empire", "Dutch East India Company", "Napoleonic France"],
    accept: ["mongol ming ottoman dutch east india company napoleon", "mongol ming ottoman voc napoleonic"],
    hint: "Roughly a century apart, then a shorter gap at the end.",
    archiveRef: "mongol-empire",
    tags: ["history", "chronology", "empires", "connected knowledge"],
  },
  {
    id: "mem-seq-print-to-westphalia",
    kind: "sequence",
    prompt: "From the press to the modern state: order these events. Peace of Augsburg, Gutenberg's press, Peace of Westphalia, Luther's Ninety-five Theses, Defenestration of Prague.",
    answer:
      "Gutenberg's press (c. 1450) → Luther's Ninety-five Theses (1517) → Peace of Augsburg (1555) → Defenestration of Prague (1618) → Peace of Westphalia (1648)",
    sequence: ["Gutenberg's press (c. 1450)", "Luther's Ninety-five Theses (1517)", "Peace of Augsburg (1555)", "Defenestration of Prague (1618)", "Peace of Westphalia (1648)"],
    accept: ["gutenberg luther augsburg prague westphalia", "press theses augsburg defenestration westphalia"],
    hint: "Cheap print made the argument spread; a truce held for sixty years; a window in Prague broke it; a treaty rebuilt the map.",
    archiveRef: "the-reformation",
    tags: ["history", "chronology", "reformation", "printing", "connected knowledge"],
  },
  {
    id: "mem-seq-money-regimes",
    kind: "sequence",
    prompt: "The monetary regimes of the last 150 years, in order.",
    answer:
      "Classical gold standard (c. 1870s–1914) → Wartime suspension, interwar return and collapse (1914–1930s) → Bretton Woods dollar–gold peg (1944–1971) → Nixon ends dollar convertibility (1971) → Floating fiat currencies with inflation-targeting central banks (1990s onward)",
    sequence: [
      "Classical gold standard (c. 1870s–1914)",
      "Wartime suspension, interwar return and collapse (1914–1930s)",
      "Bretton Woods dollar–gold peg (1944–1971)",
      "Nixon ends dollar convertibility (1971)",
      "Floating fiat currencies with inflation-targeting central banks (1990s onward)",
    ],
    accept: ["gold standard interwar bretton woods nixon floating fiat", "gold standard bretton woods 1971 fiat"],
    hint: "Gold, then gold through the dollar, then no gold at all.",
    archiveRef: "gold-standard",
    tags: ["economics", "money", "chronology", "central banks"],
  },
];

const STORIES: MemorySeed[] = [
  {
    id: "mem-story-rosetta-rediscovery",
    kind: "story",
    prompt:
      "July 1799, the Nile delta. French soldiers are strengthening the walls of an old fort near the town of Rashid when they pull out a slab of dark granodiorite covered in three kinds of writing. What was it, and whose army were they in?",
    answer:
      "The Rosetta Stone, found by Napoleon's troops (an officer, Pierre-François Bouchard, recognised its importance) during the French campaign in Egypt. It passed to Britain in 1801 and has been in the British Museum since 1802; Champollion read the hieroglyphs in 1822.",
    accept: ["rosetta stone napoleon", "rosetta stone french", "napoleon's army", "bouchard", "rosetta stone"],
    hint: "The town's French name gave the object its name.",
    archiveRef: "rosetta-stone",
    tags: ["history", "egypt", "napoleon", "decipherment"],
  },
  {
    id: "mem-story-lloyds-coffee-house",
    kind: "story",
    prompt:
      "London, late 1680s. A coffee house on Tower Street becomes the place where ship owners, captains and men with money to risk meet to trade news of voyages. The proprietor starts printing a shipping list. What did that room become?",
    answer:
      "Lloyd's of London, the insurance market: underwriters at Edward Lloyd's coffee house wrote their names under the risk of each voyage, and the coffee-house shipping news became Lloyd's List.",
    accept: ["lloyd's of london", "lloyds", "lloyd's", "insurance market", "marine insurance"],
    hint: "The word 'underwriter' describes what they physically did on the page.",
    archiveRef: "coffeehouses",
    tags: ["business", "insurance", "history", "coffee", "london"],
  },
  {
    id: "mem-story-semmelweis-hands",
    kind: "story",
    prompt:
      "Vienna, 1847. A colleague of the obstetrician Ignaz Semmelweis dies after a student's scalpel nicks him during an autopsy; the post-mortem looks exactly like the childbed fever killing mothers on the doctors' ward, but not on the midwives' ward. What did Semmelweis order, and what happened?",
    answer:
      "He ordered doctors to wash their hands in chlorinated lime solution before entering the maternity ward. Deaths on the doctors' ward fell from around one mother in ten to around one in fifty within months. His inference (something carried on the hands from the dead) was right; the mechanism, germs, was not yet known, and most colleagues rejected him.",
    accept: ["wash hands", "hand washing", "handwashing", "chlorinated lime", "chlorine", "disinfect hands", "kolletschka"],
    hint: "The evidence pointed to something on the doctors, not the mothers.",
    tags: ["science", "medicine", "inference", "evidence", "history"],
  },
  {
    id: "mem-story-ideal-x",
    kind: "story",
    prompt:
      "26 April 1956. A converted wartime tanker leaves Port Newark for Houston with a strange deck cargo: 58 identical steel boxes, lifted straight off trucks. Who owned the ship, and what is this voyage usually taken to mark?",
    answer:
      "Malcom McLean, a trucking entrepreneur; the ship was the Ideal-X, and the voyage is usually taken as the beginning of container shipping, which cut the cost of loading cargo by more than an order of magnitude and remade world trade.",
    accept: ["mclean", "malcom mclean", "malcolm mclean", "ideal-x", "ideal x", "container shipping", "containerization", "containerisation"],
    hint: "The owner's insight came from watching cargo handled one piece at a time; the boxes did not change, the whole port did.",
    archiveRef: "containerization",
    tags: ["business", "trade", "technology", "shipping", "history"],
  },
  {
    id: "mem-story-bach-walks-to-lubeck",
    kind: "story",
    prompt:
      "Autumn 1705. A twenty-year-old church organist in Arnstadt asks for four weeks' leave and walks roughly 400 kilometres north to hear an old master play. He comes back about four months later and is reprimanded. Who was he, and whom did he go to hear?",
    answer:
      "Johann Sebastian Bach, who walked to Lübeck to hear Dieterich Buxtehude, the organist of the Marienkirche. The Arnstadt consistory's record of the reprimand is one of the few documents of Bach's early life.",
    accept: ["bach buxtehude", "bach", "buxtehude", "johann sebastian bach", "lubeck", "lübeck"],
    hint: "The destination is a Hanseatic city on the Baltic; the young man later wrote the Brandenburg Concertos.",
    archiveRef: "johann-sebastian-bach",
    tags: ["music", "history", "bach", "baroque"],
  },
];

const personSeed = (id: string, seedId: string, hint: string): MemorySeed => {
  const p = personById(id);
  const first = p.name.split(" ")[0];
  const surname = p.name.split(" ").slice(1).join(" ");
  return {
    id: seedId,
    kind: "person",
    prompt: `Who is ${p.name}, and what did ${first} mention?`,
    answer: `${p.profession}, from ${p.origin}. Interest: ${p.interest.toLowerCase()}. ${p.detail}`,
    accept: [
      p.profession.toLowerCase(),
      p.origin.split(",")[0].toLowerCase(),
      p.interest.toLowerCase(),
      surname.toLowerCase(),
    ],
    hint,
    person: p,
    tags: ["people", "names", p.profession.toLowerCase().split(" ")[0]],
  };
};

const PERSONS: MemorySeed[] = [
  personSeed("ppl-maya-chen", "mem-person-maya-chen", "Coffee, and a preference she will not compromise on."),
  personSeed("ppl-tunde-adebayo", "mem-person-tunde-adebayo", "Two wheels, rain or not."),
  personSeed("ppl-yusuf-demir", "mem-person-yusuf-demir", "Works on the water; particular about how tea is served."),
  personSeed("ppl-farida-haddad", "mem-person-farida-haddad", "Water is her profession; a jar on the windowsill is the clue."),
  personSeed("ppl-kenji-watanabe", "mem-person-kenji-watanabe", "A Sunday ritual with steel."),
];

export const MEMORY_SEEDS: MemorySeed[] = [...FACTS, ...CONCEPTS, ...SEQUENCES, ...STORIES, ...PERSONS];
