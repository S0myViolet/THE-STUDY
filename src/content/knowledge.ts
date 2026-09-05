import type { KnowledgeQuestion } from "@/lib/domain/content";

/**
 * Knowledge questions for the baseline and Archive quizzes.
 * Forty-eight questions across the fourteen Archive domains. Each explanation
 * teaches the mechanism behind the fact; where the popular story is contested,
 * the explanation says so. Ids are stable: kq-<domain>-<n>.
 */
export const KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  /* ---------------- history ---------------- */
  {
    id: "kq-hist-01",
    domain: "history",
    prompt: "What was genuinely new about Gutenberg's press in Mainz around 1450?",
    options: [
      "The idea of printing with movable type",
      "A working system: a hand mould casting identical metal type, an oil-based ink, and a screw press",
      "The use of paper instead of parchment",
      "The first printed book in any language",
    ],
    answer: 1,
    explanation:
      "Movable type was Chinese (Bi Sheng, c. 1040) and the Korean Jikji of 1377 was printed with metal type. Gutenberg's contribution was the combination that made a page cheap to reproduce; the decisive variable was the cost of a copy, not the existence of copying.",
    archiveRef: "printing-press",
    difficulty: 2,
  },
  {
    id: "kq-hist-02",
    domain: "history",
    prompt: "By the usual account, how did the Black Death enter Europe in 1347?",
    options: [
      "Overland with the Mongol armies through Poland",
      "On Genoese ships from Kaffa in the Crimea to Sicily and the Italian ports",
      "With Portuguese sailors returning from West Africa",
      "With pilgrims returning from Jerusalem through Venice",
    ],
    answer: 1,
    explanation:
      "Genoese galleys leaving the besieged Black Sea port of Kaffa reached Messina in October 1347, and the plague spread along the Mediterranean shipping lanes before moving inland. The story of the Mongols catapulting corpses over Kaffa's walls comes from a single later chronicler and is doubted; the maritime route is not.",
    archiveRef: "black-death",
    difficulty: 3,
  },
  {
    id: "kq-hist-03",
    domain: "history",
    prompt: "The Peace of Westphalia of 1648 ended which conflict?",
    options: [
      "The Hundred Years' War",
      "The War of the Spanish Succession",
      "The Thirty Years' War, together with the Dutch war of independence from Spain",
      "The Napoleonic Wars",
    ],
    answer: 2,
    explanation:
      "The treaties of Münster and Osnabrück closed the Thirty Years' War in the Holy Roman Empire and recognised the Dutch Republic's independence. The idea that they invented 'Westphalian sovereignty', a system of equal states that do not interfere in one another's affairs, is a twentieth-century reading; the texts themselves are mostly about territory, religion and the constitution of the Empire.",
    archiveRef: "peace-of-westphalia",
    difficulty: 4,
  },
  {
    id: "kq-hist-04",
    domain: "history",
    prompt: "What was the yam in the Mongol Empire?",
    options: [
      "The assembly of princes that elected a Great Khan",
      "A relay system of post stations that carried messengers and officials across the empire",
      "The tax levied on conquered cities in silver",
      "The mobile court of the Great Khan",
    ],
    answer: 1,
    explanation:
      "The yam was a chain of stations, roughly a day's ride apart, where authorised riders changed horses and found food and lodging; it let orders and intelligence cross Eurasia far faster than any army. The assembly was the kurultai, and the mobile court was the ordo.",
    archiveRef: "mongol-empire",
    difficulty: 6,
  },
  /* ---------------- geography ---------------- */
  {
    id: "kq-geo-01",
    domain: "geography",
    prompt: "The Bosporus connects which two bodies of water?",
    options: [
      "The Black Sea and the Sea of Marmara",
      "The Sea of Marmara and the Aegean",
      "The Black Sea and the Caspian Sea",
      "The Aegean and the Mediterranean proper",
    ],
    answer: 0,
    explanation:
      "The Bosporus runs through Istanbul from the Black Sea to the Sea of Marmara; the Dardanelles then link the Marmara to the Aegean. Together they are the only sea route out of the Black Sea, which is why whoever holds Istanbul holds the trade and the navies of Russia, Ukraine, Romania and Bulgaria at the door.",
    archiveRef: "bosporus",
    difficulty: 1,
  },
  {
    id: "kq-geo-02",
    domain: "geography",
    prompt: "Why does the Suez Canal have no locks, unlike the Panama Canal?",
    options: [
      "It was dug before lock technology existed",
      "The Mediterranean and the Red Sea stand at almost the same mean level, so a sea-level cut works",
      "Locks were forbidden by the Ottoman concession",
      "The canal is too shallow for lock gates",
    ],
    answer: 1,
    explanation:
      "Ancient surveyors feared the Red Sea stood much higher than the Mediterranean and would flood Egypt; nineteenth-century surveys showed the difference is small and mostly tidal, so de Lesseps could build a plain channel. Panama needs locks because ships must climb about 26 metres to Gatún Lake and descend again.",
    archiveRef: "suez-canal",
    difficulty: 3,
  },
  {
    id: "kq-geo-03",
    domain: "geography",
    prompt: "Roughly what share of Dubai's economic output now comes from oil?",
    options: ["Under 5 per cent", "About a quarter", "About half", "More than 70 per cent"],
    answer: 0,
    explanation:
      "Dubai's own reserves were always modest next to Abu Dhabi's, and the emirate spent its short oil windfall on ports, an airline, free zones and real estate; by the 2010s oil was a low single-digit share of its output. The Gulf stereotype fits Abu Dhabi, Kuwait and Saudi Arabia far better than it fits Dubai.",
    archiveRef: "dubai",
    difficulty: 4,
  },
  {
    id: "kq-geo-04",
    domain: "geography",
    prompt: "Who coined the term 'Silk Road'?",
    options: [
      "Marco Polo, in his account of travelling to China",
      "Zhang Qian, the Han envoy who opened the western routes",
      "Ferdinand von Richthofen, a German geographer, in 1877",
      "Ibn Battuta, in his fourteenth-century travel narrative",
    ],
    answer: 2,
    explanation:
      "Seidenstrasse was a nineteenth-century label for a network nobody at the time thought of as one road. Goods moved in short relays between oasis towns, few merchants travelled end to end, and silk was only one cargo among paper, horses, glass, religions and, in 1347, plague.",
    archiveRef: "silk-road",
    difficulty: 5,
  },
  /* ---------------- economics ---------------- */
  {
    id: "kq-eco-01",
    domain: "economics",
    prompt: "Which statement best defines inflation?",
    options: [
      "A rise in the price of one important good such as fuel or housing",
      "A sustained rise in the general level of prices, so that each unit of money buys less",
      "A rise in wages faster than productivity",
      "A fall in the exchange rate of the national currency",
    ],
    answer: 1,
    explanation:
      "Inflation is about the level of prices in general, measured by an index across a basket of goods; one expensive good is a relative-price change, not inflation. The distinction matters because the remedies differ: a central bank can restrain general demand, but it cannot make oil cheaper.",
    archiveRef: "inflation",
    difficulty: 2,
  },
  {
    id: "kq-eco-02",
    domain: "economics",
    prompt: "Under the Bretton Woods system agreed in 1944, what was the United States dollar tied to?",
    options: [
      "The pound sterling, at a fixed rate",
      "A basket of the major trading currencies",
      "Gold, at 35 dollars an ounce, with other currencies pegged to the dollar",
      "Nothing; the dollar floated while other currencies were fixed",
    ],
    answer: 2,
    explanation:
      "Foreign central banks could present dollars and receive gold at the fixed price, which anchored the whole system to the dollar and the dollar to gold. When dollars abroad came to exceed the gold in Fort Knox, Nixon suspended convertibility in August 1971 and the arrangement dissolved into floating rates within two years.",
    archiveRef: "bretton-woods",
    difficulty: 3,
  },
  {
    id: "kq-eco-03",
    domain: "economics",
    prompt: "In the prisoner's dilemma, why does the standard analysis predict that both players defect?",
    options: [
      "Because the players are unable to communicate",
      "Because defecting gives each player a better payoff whatever the other player does",
      "Because cooperation is irrational in every game",
      "Because the payoffs are symmetric",
    ],
    answer: 1,
    explanation:
      "Defection is a dominant strategy: it beats cooperation if the other cooperates and if the other defects, so each player chooses it, and both end up worse off than if both had cooperated. Communication does not fix this on its own, since a promise to cooperate is not binding; repetition, reputation and enforceable contracts are what change the outcome.",
    archiveRef: "prisoners-dilemma",
    difficulty: 5,
  },
  {
    id: "kq-eco-04",
    domain: "economics",
    prompt: "Under a classical gold standard, what happens to a country that runs a persistent trade deficit?",
    options: [
      "Its central bank devalues the currency to restore competitiveness",
      "Gold flows out, its money supply and prices fall, and its exports become cheaper until the deficit closes",
      "Its prices rise until imports become unaffordable",
      "Nothing; deficits can persist indefinitely under gold",
    ],
    answer: 1,
    explanation:
      "This is Hume's price-specie flow mechanism of 1752: importers pay in gold, the gold leaves, and with less money in circulation domestic prices fall, which makes exports attractive and imports dear. The adjustment works, but it works through deflation and unemployment, which is why democracies abandoned gold in the 1930s.",
    archiveRef: "gold-standard",
    difficulty: 7,
  },
  /* ---------------- politics ---------------- */
  {
    id: "kq-pol-01",
    domain: "politics",
    prompt: "How was the Doge of Venice chosen?",
    options: [
      "He inherited the office from his father",
      "He was elected for life through a multi-stage sequence of lotteries and ballots",
      "He was appointed by the Pope",
      "He was elected each year by the whole citizenry",
    ],
    answer: 1,
    explanation:
      "From 1268 the Great Council alternated drawing lots and voting through nine rounds to produce the forty-one electors who chose the doge, a procedure designed to make it impossible for any family to buy the office. The doge served for life but was hedged by councils and oaths; Venice wanted a figurehead it could not turn into a king.",
    archiveRef: "venetian-republic",
    difficulty: 3,
  },
  {
    id: "kq-pol-02",
    domain: "politics",
    prompt: "What was the Ottoman devshirme?",
    options: [
      "The annual tribute paid by vassal states to the sultan",
      "A periodic levy of Christian boys from the Balkans, converted and trained for the Janissaries and the palace service",
      "The council of viziers that advised the sultan",
      "The land grants given to cavalry officers in return for military service",
    ],
    answer: 1,
    explanation:
      "The devshirme staffed the sultan's army and administration with men who owed everything to him and had no families in the Ottoman nobility to favour; several grand viziers rose through it. It ran from the late fourteenth century into the seventeenth, and the land grants for cavalry were the separate timar system.",
    archiveRef: "ottoman-empire",
    difficulty: 4,
  },
  {
    id: "kq-pol-03",
    domain: "politics",
    prompt: "Which description of the Hanseatic League is accurate?",
    options: [
      "A sovereign state with its capital at Lübeck",
      "A province of the Holy Roman Empire governed by a prince",
      "A loose association of trading towns with no permanent treasury, army or constitution, coordinated through occasional diets",
      "A religious order that controlled the Baltic ports",
    ],
    answer: 2,
    explanation:
      "The Hansa never had a founding charter or a standing force; member towns met at the Hansetag when they chose, and enforced decisions through trade boycotts and fleets raised for the occasion. That it dominated northern trade for three centuries with so little apparatus is the interesting fact, and also why it faded when territorial states grew stronger.",
    archiveRef: "hanseatic-league",
    difficulty: 4,
  },
  /* ---------------- science ---------------- */
  {
    id: "kq-sci-01",
    domain: "science",
    prompt: "Where does most of the mass of a tree come from?",
    options: [
      "Minerals drawn up from the soil",
      "Water, which is stored in the wood",
      "Carbon dioxide taken from the air and fixed by photosynthesis",
      "Sunlight, converted directly into matter",
    ],
    answer: 2,
    explanation:
      "Dry wood is roughly half carbon by mass, and every atom of it entered through the leaves as carbon dioxide; the soil supplies water and small amounts of minerals. Van Helmont grew a willow in a weighed pot in the 1640s, found the soil almost unchanged, and wrongly concluded the tree was made of water; the answer was in the gas he could not weigh.",
    difficulty: 2,
  },
  {
    id: "kq-sci-02",
    domain: "science",
    prompt: "According to Karl Popper, what makes a theory scientific?",
    options: [
      "It has been confirmed by many observations",
      "It makes predictions that could in principle be shown to be false",
      "It is accepted by a majority of scientists",
      "It explains every observation that could be made",
    ],
    answer: 1,
    explanation:
      "Popper's point was that confirmations are cheap: astrology and psychoanalysis, he argued, could absorb any observation, which made them unfalsifiable rather than well supported. A theory that forbids something, and would be abandoned if that thing were seen, is making a real claim about the world.",
    archiveRef: "falsifiability",
    difficulty: 3,
  },
  {
    id: "kq-sci-03",
    domain: "science",
    prompt: "How do bacteria become resistant to an antibiotic?",
    options: [
      "Individual bacteria learn to tolerate the drug during treatment",
      "The antibiotic causes bacteria to mutate purposefully towards resistance",
      "Variants that happen to carry resistance survive the drug and multiply, while susceptible ones die",
      "Bacteria produce antibodies against the drug, as humans do against infections",
    ],
    answer: 2,
    explanation:
      "Resistance is natural selection at speed: in a population of billions, a few cells carry mutations or borrowed genes that blunt the drug, and treatment removes their competitors. Bacteria also pass resistance genes to one another on plasmids, which is why resistance to one drug can appear in a species that never met it.",
    difficulty: 4,
  },
  {
    id: "kq-sci-04",
    domain: "science",
    prompt: "Nitrogen and oxygen make up 99 per cent of the atmosphere. Why are carbon dioxide, methane and water vapour the gases that trap heat?",
    options: [
      "They are heavier and sink to the surface where the heat is",
      "Their molecules can vibrate in ways that absorb infrared radiation; symmetrical two-atom molecules like N2 and O2 cannot",
      "They react chemically with sunlight",
      "They are present in far larger quantities in the upper atmosphere",
    ],
    answer: 1,
    explanation:
      "A molecule absorbs infrared when a vibration changes its electric dipole, and a molecule of two identical atoms has no dipole to change; CO2, H2O and CH4 have bending and stretching modes that do. That is why a gas at 400 parts per million can matter more to the planet's heat balance than the 780,000 parts per million of nitrogen around it.",
    difficulty: 6,
  },
  /* ---------------- psychology ---------------- */
  {
    id: "kq-psy-01",
    domain: "psychology",
    prompt: "What is the availability heuristic?",
    options: [
      "Preferring options that are physically nearby",
      "Judging how common or likely something is by how easily examples come to mind",
      "Trusting information that is freely available over paid sources",
      "Choosing the first acceptable option rather than the best one",
    ],
    answer: 1,
    explanation:
      "Tversky and Kahneman described it in 1973: ease of recall is a decent proxy for frequency until something distorts recall, as news coverage does for plane crashes and shark attacks. The corrective is to ask what the actual count is, rather than how vivid the examples are.",
    archiveRef: "availability-heuristic",
    difficulty: 2,
  },
  {
    id: "kq-psy-02",
    domain: "psychology",
    prompt: "A disease affects 1 person in 10,000. A test detects it 99 per cent of the time and gives a false positive 1 per cent of the time. Someone tests positive. Roughly what is the chance they have the disease?",
    options: ["About 99 per cent", "About 50 per cent", "About 1 per cent", "About 0.01 per cent"],
    answer: 2,
    explanation:
      "In a million people, 100 are ill and 99 of them test positive; 999,900 are well and about 10,000 of them also test positive. The true positives are about one per cent of all positives. Ignoring the 1-in-10,000 base rate is the base-rate fallacy, and doctors given this problem have historically answered 99 per cent.",
    archiveRef: "base-rate-fallacy",
    difficulty: 4,
  },
  {
    id: "kq-psy-03",
    domain: "psychology",
    prompt: "For the same total study time, what does research on the spacing effect show?",
    options: [
      "Reviewing in one long session produces the best long-term retention",
      "Spreading reviews over time produces better long-term retention than massing them",
      "The timing of reviews makes no measurable difference",
      "Spacing helps only with meaningless material such as nonsense syllables",
    ],
    answer: 1,
    explanation:
      "Ebbinghaus observed it on himself in 1885, and it has replicated across ages, materials and decades since; a review that arrives just as memory starts to fade does more work than one made while the material is still fresh. Cramming feels productive because performance is high at the end of the session, which is exactly when it is least informative.",
    difficulty: 3,
  },
];
