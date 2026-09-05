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
  /* ---------------- philosophy ---------------- */
  {
    id: "kq-phi-01",
    domain: "philosophy",
    prompt: "Which is the correct statement of Occam's razor?",
    options: [
      "The simplest explanation is always the true one",
      "Among explanations that account for the evidence equally well, prefer the one that assumes least",
      "Complex explanations should be rejected without examination",
      "The explanation with the fewest words is to be preferred",
    ],
    answer: 1,
    explanation:
      "The razor is a tie-breaker, not a truth test: it only applies once the competing explanations fit the evidence equally, and it counts assumptions rather than sentences. William of Ockham, a fourteenth-century Franciscan, never wrote the famous 'entities should not be multiplied' in those words; the principle is older than his name for it.",
    difficulty: 2,
  },
  {
    id: "kq-phi-02",
    domain: "philosophy",
    prompt: "What was David Hume's problem of induction?",
    options: [
      "That we can never observe enough cases to be sure of anything",
      "That reasoning from observed regularities to unobserved cases cannot be justified without assuming that nature is uniform, which is the thing in question",
      "That deduction is unreliable because premises may be false",
      "That the senses systematically deceive us",
    ],
    answer: 1,
    explanation:
      "Hume's point in 1748 was not that the sun might not rise, but that no argument shows it must: any defence of 'the future will resemble the past' appeals to past experience, which is circular. Popper's falsificationism was one answer, treating science as conjecture and refutation rather than accumulation of confirmations.",
    archiveRef: "falsifiability",
    difficulty: 4,
  },
  {
    id: "kq-phi-03",
    domain: "philosophy",
    prompt: "In Bayesian reasoning, what does it mean when a piece of evidence has a likelihood ratio of 1 between two hypotheses?",
    options: [
      "The hypothesis in question is exactly 50 per cent likely",
      "The evidence is equally probable under both hypotheses and should not move your belief between them",
      "The evidence proves the first hypothesis",
      "The prior probability must be revised to 1",
    ],
    answer: 1,
    explanation:
      "Bayes' theorem multiplies your prior odds by the likelihood ratio, the probability of the evidence if one hypothesis is true divided by its probability if the other is; a ratio of 1 leaves the odds unchanged. This is why 'consistent with' is such a weak phrase: evidence that fits your story equally well whether or not it is true tells you nothing.",
    archiveRef: "bayes-theorem",
    difficulty: 6,
  },
  /* ---------------- art ---------------- */
  {
    id: "kq-art-01",
    domain: "art",
    prompt: "Where did the name 'Impressionism' come from?",
    options: [
      "The painters chose it to describe their aim of capturing fleeting impressions",
      "A critic mocked Monet's 'Impression, Sunrise' at the group's 1874 exhibition, and the label stuck",
      "It was the title of Manet's manifesto",
      "It was a term from the Paris Salon's categories of painting",
    ],
    answer: 1,
    explanation:
      "Louis Leroy's review in Le Charivari sneered that wallpaper in its embryonic state was more finished than the canvas; the painters adopted the insult within a few years. Movements are often named by their enemies, which is worth remembering when a label seems to explain a group's intentions.",
    archiveRef: "impressionism",
    difficulty: 2,
  },
  {
    id: "kq-art-02",
    domain: "art",
    prompt: "What does a flying buttress do for a Gothic cathedral?",
    options: [
      "It supports the roof timbers from below",
      "It carries the outward thrust of the stone vault to external piers, so the walls can be thin and pierced with windows",
      "It is purely decorative, a display of the mason's skill",
      "It braces the towers against wind",
    ],
    answer: 1,
    explanation:
      "A stone vault pushes outward as well as down; Romanesque builders answered with thick walls and small windows. Moving the resistance outside the building, through arches leaning against the wall, freed it to become a frame for glass, which is why Chartres and Sainte-Chapelle look the way they do.",
    difficulty: 3,
  },
  {
    id: "kq-art-03",
    domain: "art",
    prompt: "Which practical development made it feasible for the Impressionists to paint finished pictures outdoors?",
    options: [
      "The invention of canvas",
      "The collapsible metal paint tube, patented in 1841, together with railways out of Paris",
      "Electric lighting in studios",
      "The camera obscura",
    ],
    answer: 1,
    explanation:
      "Before John Goffe Rand's tin tube, oil paint was ground and stored in pig bladders that dried and burst; painters sketched outdoors and finished in the studio. Portable paint, ready-primed canvases and a train to Argenteuil changed what a painting could be about. Renoir is reported as saying that without tubes there would have been no Cézanne, no Monet and no Impressionism.",
    archiveRef: "impressionism",
    difficulty: 5,
  },
  /* ---------------- literature ---------------- */
  {
    id: "kq-lit-01",
    domain: "literature",
    prompt: "How is the Odyssey structured?",
    options: [
      "It runs chronologically from the fall of Troy to Odysseus's return",
      "It begins near the end, with Odysseus held by Calypso, and he narrates his earlier adventures to the Phaeacians",
      "It begins with Odysseus's childhood on Ithaca",
      "It is a sequence of unrelated episodes with no fixed order",
    ],
    answer: 1,
    explanation:
      "The poem opens in the tenth year after Troy, with Telemachus searching for news; the Cyclops, Circe and the Sirens arrive in books nine to twelve as a story told at a dinner table. Starting in the middle and folding the past into a character's own account is the technique later critics called in medias res, and most novels still use it.",
    archiveRef: "the-odyssey",
    difficulty: 3,
  },
  {
    id: "kq-lit-02",
    domain: "literature",
    prompt: "Why is Don Quixote often called the first modern novel?",
    options: [
      "It was the first long prose work printed in Europe",
      "It was the first work of fiction written in Spanish",
      "It treats fiction self-consciously: its hero is deranged by reading romances, and in Part Two characters have read Part One",
      "It was the first novel to be translated into English",
    ],
    answer: 2,
    explanation:
      "Cervantes published Part One in 1605 and, after an unauthorised sequel appeared, a Part Two in 1615 in which people recognise Quixote from the book and stage adventures for him. A story that knows it is a story, and asks what reading does to a reader, is the move that separates the novel from the romance.",
    difficulty: 4,
  },
  {
    id: "kq-lit-03",
    domain: "literature",
    prompt: "What was significant about the tablet George Smith read out in London in 1872?",
    options: [
      "It was the first Egyptian text deciphered from the Rosetta Stone",
      "It contained a Babylonian flood story from the Epic of Gilgamesh, older than the written book of Genesis",
      "It was the earliest known copy of Homer",
      "It recorded the law code of Hammurabi",
    ],
    answer: 1,
    explanation:
      "The tablet came from Ashurbanipal's library at Nineveh and told of Utnapishtim, warned by a god to build a boat and save the animals from a flood. Gilgamesh survives in versions going back to around 1800 BCE, which makes it the oldest substantial work of literature we can read, and its flood is one of several Mesopotamian versions that predate the biblical text.",
    difficulty: 5,
  },
  /* ---------------- music ---------------- */
  {
    id: "kq-mus-01",
    domain: "music",
    prompt: "Why does a note an octave higher sound like 'the same' note?",
    options: [
      "Its frequency is exactly double",
      "Its frequency is twelve hertz higher",
      "It is twice as loud",
      "Its wavelength is twice as long",
    ],
    answer: 0,
    explanation:
      "Every partial in the higher note's overtone series coincides with one in the lower note's, so the ear hears the two as the same pitch class; the 2:1 ratio is the one interval nearly every musical culture treats as equivalence. Wavelength halves rather than doubles, and loudness has nothing to do with pitch.",
    difficulty: 1,
  },
  {
    id: "kq-mus-02",
    domain: "music",
    prompt: "What does Bach's Well-Tempered Clavier demonstrate?",
    options: [
      "That the harpsichord could play as loudly as the organ",
      "A prelude and fugue in every one of the twenty-four major and minor keys, showing a tuning in which all keys were usable",
      "The first use of the piano in a published work",
      "That fugues could be written for full orchestra",
    ],
    answer: 1,
    explanation:
      "In older tunings some keys sounded sweet and others unbearable, so composers avoided them; Bach's two books of 1722 and around 1742 walk through all twenty-four to prove a well-tempered keyboard could go anywhere. Whether 'well-tempered' meant modern equal temperament or one of several unequal systems is still argued; it did not mean the piano.",
    archiveRef: "johann-sebastian-bach",
    difficulty: 3,
  },
  {
    id: "kq-mus-03",
    domain: "music",
    prompt: "What does equal temperament trade away, and what does it buy?",
    options: [
      "It gives up perfectly pure fifths and thirds in return for the freedom to modulate to any key",
      "It gives up the ability to play in minor keys in return for louder instruments",
      "It gives up the octave in return for more notes",
      "It gives up nothing; it is simply the most natural tuning",
    ],
    answer: 0,
    explanation:
      "Twelve pure fifths of 3:2 stacked on top of each other overshoot seven octaves by a small amount, the Pythagorean comma, so no tuning can have every interval pure. Equal temperament spreads the error evenly, narrowing each fifth by about two cents, so every key is equally and slightly out of tune, and a piece can wander anywhere and come home.",
    difficulty: 5,
  },
  /* ---------------- food ---------------- */
  {
    id: "kq-food-01",
    domain: "food",
    prompt: "How did Lloyd's of London begin?",
    options: [
      "As a royal charter granted to a family of bankers",
      "As a coffeehouse where ship-owners, captains and underwriters met to trade shipping news",
      "As a department of the Royal Navy",
      "As a guild of shipwrights on the Thames",
    ],
    answer: 1,
    explanation:
      "Edward Lloyd's house on Tower Street, later Lombard Street, took in the best maritime news in London, and men who wanted to insure a voyage went where the information was. The lesson is general: institutions form where the relevant people keep meeting, and the penny coffeehouse was the meeting room of the seventeenth-century city.",
    archiveRef: "coffeehouses",
    difficulty: 2,
  },
  {
    id: "kq-food-02",
    domain: "food",
    prompt: "Why did a tyre company publish the first Michelin Guide in 1900?",
    options: [
      "To review the restaurants that the Michelin brothers owned",
      "To give the few thousand French motorists reasons to drive further, and so wear out more tyres",
      "As a government commission to promote tourism",
      "To advertise the company's new restaurant in Paris",
    ],
    answer: 1,
    explanation:
      "André and Édouard Michelin gave the guide away free, full of maps, mechanics and places to sleep, when France had well under 3,000 cars; the star ratings for food came only in 1926. It is a durable example of a business paying to create the demand for its product rather than merely serving it.",
    archiveRef: "michelin-guide",
    difficulty: 3,
  },
  {
    id: "kq-food-03",
    domain: "food",
    prompt: "What produces the brown crust and savoury flavour when meat is seared?",
    options: [
      "Caramelisation of the sugars in the meat",
      "The Maillard reaction between amino acids and sugars at high surface temperature",
      "The sealing of juices inside the meat by the hot pan",
      "The burning of the fat on the surface",
    ],
    answer: 1,
    explanation:
      "Above roughly 140 degrees Celsius, amino acids and reducing sugars react into hundreds of new flavour compounds; caramelisation is the separate browning of sugar alone. Searing does not seal in juices, a claim tested and refuted repeatedly since Harold McGee revisited it: a seared steak loses at least as much moisture as an unseared one, and is worth it for the flavour.",
    difficulty: 4,
  },
  /* ---------------- business ---------------- */
  {
    id: "kq-bus-01",
    domain: "business",
    prompt: "What is the core rule of double-entry bookkeeping?",
    options: [
      "Every transaction is written down twice in case one copy is lost",
      "Every transaction is recorded as an equal debit and credit in two accounts, so the books must balance",
      "Income and expenses are kept in two separate books",
      "Two clerks must independently record each transaction",
    ],
    answer: 1,
    explanation:
      "A sale increases cash and decreases stock; a loan increases cash and increases liabilities. Because every entry has an equal counterpart, an arithmetic error shows up as an imbalance, and the same ledger can produce both a statement of profit and a statement of what the business owns and owes. Luca Pacioli described the Venetian method in print in 1494; the merchants had used it for a century and more.",
    archiveRef: "double-entry-bookkeeping",
    difficulty: 2,
  },
  {
    id: "kq-bus-02",
    domain: "business",
    prompt: "Where did the main saving from the shipping container come from?",
    options: [
      "Faster ships crossing the ocean",
      "Cheaper fuel because containers are lighter than crates",
      "Cutting the labour and days spent loading and unloading cargo piece by piece in port",
      "Lower insurance because containers are watertight",
    ],
    answer: 2,
    explanation:
      "Before 1956 a ship could spend as long in port as at sea while gangs of longshoremen handled sacks and crates one at a time; Marc Levinson estimates the cost of loading loose cargo at about 5.80 dollars a ton against 16 cents a ton for a container. Trade responded to the collapse in handling cost, not to any change in the ocean crossing.",
    archiveRef: "containerization",
    difficulty: 3,
  },
  {
    id: "kq-bus-03",
    domain: "business",
    prompt: "What was novel about the Dutch East India Company, founded in 1602?",
    options: [
      "It was the first company to trade with Asia",
      "Its shares could be bought and sold by the public on a secondary market, and its capital was not returned after each voyage",
      "It was owned entirely by the Dutch state",
      "It was the first company to employ salaried managers",
    ],
    answer: 1,
    explanation:
      "Earlier ventures raised money for a single voyage and paid it back with the profits; the VOC kept its capital invested, and investors who wanted out sold their shares to someone else in Amsterdam. That separation of a permanent enterprise from its shifting owners is the design that every listed company still uses.",
    archiveRef: "dutch-east-india-company",
    difficulty: 4,
  },
  {
    id: "kq-bus-04",
    domain: "business",
    prompt: "In an ascending-bid auction where bidders know their own valuations, what mainly determines the price the winner pays?",
    options: [
      "The winner's own valuation of the item",
      "The point at which the second-highest bidder stops bidding",
      "The auctioneer's opening price",
      "The average of all bids made",
    ],
    answer: 1,
    explanation:
      "Bidding continues until everyone but one has dropped out, so the winner pays roughly the runner-up's limit plus one increment, however much more the item was worth to them. This is why an English auction resembles a sealed second-price auction in theory, and why a seller's revenue depends on attracting two serious bidders, not one.",
    archiveRef: "english-auction",
    difficulty: 6,
  },
  /* ---------------- technology ---------------- */
  {
    id: "kq-tech-01",
    domain: "technology",
    prompt: "What is Moore's law?",
    options: [
      "A physical law stating that transistors cannot be made smaller than a certain size",
      "An observation that the number of transistors on a chip has doubled roughly every two years",
      "A rule that software slows down as fast as hardware speeds up",
      "A law passed to regulate semiconductor exports",
    ],
    answer: 1,
    explanation:
      "Gordon Moore made the observation in a 1965 article and revised the pace in 1975; it held because manufacturers treated it as a target and invested to meet it. It is an economic and engineering trend, not a law of nature, which is why its slowing in the 2010s was a business event rather than a scientific surprise.",
    difficulty: 2,
  },
  {
    id: "kq-tech-02",
    domain: "technology",
    prompt: "What does the Haber-Bosch process make, and why does it matter?",
    options: [
      "Steel from iron ore; it built the railways",
      "Ammonia from atmospheric nitrogen and hydrogen; it supplies the fertiliser that feeds roughly half the world's people",
      "Petrol from crude oil; it made the motor car practical",
      "Aluminium from bauxite; it made aircraft possible",
    ],
    answer: 1,
    explanation:
      "Plants need nitrogen and cannot use the inert N2 that makes up most of the air; Fritz Haber found how to combine it with hydrogen under high pressure in 1909 and Carl Bosch made it industrial by 1913. Vaclav Smil estimates that about half the nitrogen in the average human body has passed through the process, and that without it the planet could feed several billion fewer people.",
    difficulty: 3,
  },
  {
    id: "kq-tech-03",
    domain: "technology",
    prompt: "In public-key cryptography, why can the key used to encrypt a message be published openly?",
    options: [
      "Because the message is also encrypted with a password only the sender knows",
      "Because working out the private key from the public one requires solving a problem believed to be computationally infeasible, such as factoring a very large number",
      "Because the public key changes with every message",
      "Because the key is only valid on a secure network",
    ],
    answer: 1,
    explanation:
      "The two keys are linked mathematically, but the link runs easily in only one direction: multiplying two large primes is quick, and recovering them from the product is not. Diffie and Hellman published the idea in 1976 and RSA followed in 1977; British government cryptographers had found it a few years earlier and kept it secret until 1997.",
    difficulty: 4,
  },
  {
    id: "kq-tech-04",
    domain: "technology",
    prompt: "Why must GPS satellites correct their clocks for relativity?",
    options: [
      "Because radio signals slow down as they pass through the atmosphere",
      "Because the satellites' clocks run fast by about 38 microseconds a day relative to clocks on the ground, which would produce errors of kilometres within a day",
      "Because the Earth's rotation changes the length of a second",
      "They do not; relativity has no measurable effect at satellite speeds",
    ],
    answer: 1,
    explanation:
      "Motion slows the satellite clocks by about 7 microseconds a day and the weaker gravity at altitude speeds them up by about 45, a net gain of some 38 microseconds; at the speed of light that is more than 10 kilometres of position error per day. The system's designers built the correction into the satellite clocks before launch, and GPS is the most everyday confirmation of Einstein there is.",
    difficulty: 5,
  },
  /* ---------------- law ---------------- */
  {
    id: "kq-law-01",
    domain: "law",
    prompt: "Under the 1961 Vienna Convention, what can a host country do about a diplomat it believes has committed a serious crime?",
    options: [
      "Arrest and try the diplomat in its own courts",
      "Declare the diplomat persona non grata and require their departure, or ask the sending state to waive immunity",
      "Confiscate the embassy until the diplomat is handed over",
      "Nothing at all",
    ],
    answer: 1,
    explanation:
      "Immunity protects the office, not the person: it belongs to the sending state, which alone can waive it, and the host's remedy is expulsion. The rule exists so that envoys can work in hostile capitals without being held hostage, and the price of that is the occasional unpunished offence, which each state tolerates because its own diplomats depend on the same protection.",
    archiveRef: "diplomatic-immunity",
    difficulty: 2,
  },
  {
    id: "kq-law-02",
    domain: "law",
    prompt: "What was Magna Carta in 1215?",
    options: [
      "A constitution establishing Parliament",
      "A declaration of rights for all English people",
      "A peace treaty between King John and rebel barons, annulled by the Pope within months and reissued in revised form by later kings",
      "A charter granting independence to the City of London",
    ],
    answer: 2,
    explanation:
      "Innocent III declared it void in August 1215, John died the next year, and the versions that entered English law were the reissues of 1216, 1217 and 1225. Its later fame rests on clause 39, that no free man may be imprisoned except by lawful judgement or the law of the land, which seventeenth-century lawyers turned into a principle its authors had not intended.",
    archiveRef: "magna-carta",
    difficulty: 4,
  },
  {
    id: "kq-law-03",
    domain: "law",
    prompt: "What is the main structural difference between civil-law and common-law systems?",
    options: [
      "Civil-law systems have no criminal courts",
      "In civil-law systems judges reason from a comprehensive written code; in common-law systems earlier judicial decisions are themselves binding sources of law",
      "Common-law systems have no written statutes",
      "Civil-law systems use juries and common-law systems do not",
    ],
    answer: 1,
    explanation:
      "Napoleon's Civil Code of 1804 is the model of the first: a single text meant to be applied, not interpreted, spread by conquest and imitation across Europe, Latin America and beyond. England's judges built law case by case and bound later courts to their reasoning, and that habit travelled with the empire; both systems now have statutes and precedent, but the centre of gravity differs.",
    archiveRef: "napoleon-bonaparte",
    difficulty: 5,
  },
];
