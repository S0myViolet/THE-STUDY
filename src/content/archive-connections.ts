import type { ArchiveConnection } from "@/lib/domain/types";

/**
 * Seeded connections between Archive entries. Every non-path canonical id appears at least once.
 * Relations read from → to: "printing-press CAUSED the-reformation". Notes are short and state
 * the mechanism; where the causal claim is contested the note says so.
 */
export const ARCHIVE_CONNECTIONS_SEED: ArchiveConnection[] = [
  /* ---- The Printing Press as bridge ---- */
  { id: "conn-001", from: "printing-press", to: "the-reformation", relation: "CAUSED", note: "Luther's pamphlets sold in the hundreds of thousands within a few years; cheap print turned a theological dispute into a mass event." },
  { id: "conn-002", from: "printing-press", to: "renaissance", relation: "INFLUENCED", note: "Standard printed editions of Euclid, Ptolemy and the classics let scholars in different cities argue over the same page; Aldus in Venice made the pocket classic." },
  { id: "conn-003", from: "printing-press", to: "coffeehouses", relation: "INFLUENCED", note: "Coffeehouses ran on newspapers and pamphlets read aloud and argued over; print supplied the material for the room." },
  { id: "conn-004", from: "printing-press", to: "magna-carta", relation: "INFLUENCED", note: "Coke's seventeenth-century revival of the charter as fundamental law depended on printed statutes and law reports reaching a literate political public." },
  { id: "conn-005", from: "printing-press", to: "double-entry-bookkeeping", relation: "INFLUENCED", note: "Pacioli's Summa (Venice, 1494) was the first printed description of double entry; manuals then carried the Venetian method north." },
  { id: "conn-006", from: "printing-press", to: "venetian-republic", relation: "LOCATED_IN", note: "Venice was Europe's printing capital by 1500, home to Aldus Manutius and perhaps a sixth of all incunabula." },
  { id: "conn-007", from: "ottoman-empire", to: "printing-press", relation: "CONTRASTS_WITH", note: "Arabic-script printing for Muslims was not licensed in the empire until 1727, although Jewish, Armenian and Greek presses ran in Istanbul much earlier; adoption was a political choice." },
  { id: "conn-008", from: "printing-press", to: "the-odyssey", relation: "RELATED_TO", note: "The first printed Homer appeared in Florence in 1488; print fixed a text that had lived for two millennia in copies and recitation." },
  { id: "conn-009", from: "printing-press", to: "michelin-guide", relation: "RELATED_TO", note: "A guide is a printed, revisable reputation; Michelin gave away 35,000 copies in 1900, which only cheap print made thinkable." },

  /* ---- Istanbul cluster ---- */
  { id: "conn-010", from: "istanbul", to: "bosporus", relation: "DEPENDS_ON", note: "The city exists because the strait does: a defensible peninsula at the one crossing between two seas and two continents." },
  { id: "conn-011", from: "ottoman-empire", to: "istanbul", relation: "LOCATED_IN", note: "Capital from the conquest of 1453 to the end of the sultanate in 1922." },
  { id: "conn-012", from: "ottoman-empire", to: "bosporus", relation: "DEPENDS_ON", note: "Mehmed II built Rumeli Hisarı on the strait in 1452 to cut Constantinople off before the siege; control of the Bosporus preceded control of the city." },
  { id: "conn-013", from: "silk-road", to: "istanbul", relation: "RELATED_TO", note: "Constantinople was the western terminus of the overland routes; silk, spices and Black Sea grain met Mediterranean shipping there." },
  { id: "conn-014", from: "venetian-republic", to: "ottoman-empire", relation: "RELATED_TO", note: "Three centuries of trade and war; Venice kept a resident bailo in Constantinople and fought the Ottomans for Cyprus and Crete." },
  { id: "conn-015", from: "venetian-republic", to: "silk-road", relation: "DEPENDS_ON", note: "Venice's wealth was the resale of eastern goods arriving at Levantine and Black Sea termini; the Polos travelled the road itself." },
  { id: "conn-016", from: "coffeehouses", to: "istanbul", relation: "LOCATED_IN", note: "The first coffeehouses in the Ottoman capital date to the 1550s, a century before London's; Murad IV closed them in 1633 as places of sedition." },
  { id: "conn-017", from: "ottoman-empire", to: "coffeehouses", relation: "INFLUENCED", note: "Coffee reached Europe through Ottoman trade and diplomacy; the Vienna and Venice cafes of the 1680s were imitations of an Ottoman institution." },
  { id: "conn-018", from: "istanbul", to: "renaissance", relation: "INFLUENCED", note: "Greek scholars and manuscripts moved from Constantinople to Italy before and after 1453; the scale of the effect is debated, the direction is not." },
  { id: "conn-019", from: "mongol-empire", to: "silk-road", relation: "INFLUENCED", note: "The Pax Mongolica of the thirteenth century made the overland route safe enough for merchants and missionaries to cross it end to end." },
  { id: "conn-020", from: "silk-road", to: "black-death", relation: "CAUSED", note: "Plague travelled the trade routes to the Black Sea; Genoese ships carried it from Caffa to the Mediterranean in 1347." },
  { id: "conn-021", from: "black-death", to: "renaissance", relation: "INFLUENCED", note: "Labour scarcity raised wages and concentrated wealth among survivors; the link to Florentine patronage is argued for, not proven." },
  { id: "conn-022", from: "venetian-republic", to: "black-death", relation: "RESPONDED_TO", note: "Ragusa in 1377 and Venice after it invented quarantine, the forty days that gave the word its name; Venice's lazzaretto opened in 1423." },
  { id: "conn-023", from: "ming-dynasty", to: "mongol-empire", relation: "RESPONDED_TO", note: "The Ming were founded in 1368 by driving out the Mongol Yuan; the Great Wall as we see it is largely a Ming response to the steppe." },
  { id: "conn-024", from: "ming-dynasty", to: "silk-road", relation: "RELATED_TO", note: "Zheng He's voyages (1405–33) took Chinese trade to sea; their end and the later maritime bans shifted the balance back to overland and to foreign shippers." },
  { id: "conn-025", from: "hanseatic-league", to: "venetian-republic", relation: "CONTRASTS_WITH", note: "A northern network of towns with no navy and no capital versus a maritime state with both; two solutions to the same problem of protecting trade." },
  { id: "conn-026", from: "bosporus", to: "suez-canal", relation: "RELATED_TO", note: "Two chokepoints with treaties (Montreux 1936, Constantinople 1888) written to keep them open; both show what a narrow waterway does to the states around it." },
  { id: "conn-027", from: "suez-canal", to: "ottoman-empire", relation: "LOCATED_IN", note: "Egypt was nominally Ottoman when the canal opened in 1869; the Khedive's debts from it led to British occupation in 1882." },
  { id: "conn-028", from: "napoleon-bonaparte", to: "suez-canal", relation: "PRECEDED", note: "Napoleon's engineers surveyed the isthmus in 1798–99 and, miscalculating the sea levels, shelved the idea for half a century." },
  { id: "conn-029", from: "dubai", to: "venetian-republic", relation: "RELATED_TO", note: "Both are entrepôt states: little hinterland, wealth from what passes through, survival by being useful to larger powers." },
  { id: "conn-030", from: "dubai", to: "containerization", relation: "DEPENDS_ON", note: "Jebel Ali (1979) is among the largest container ports outside East Asia; DP World is the city's export of that expertise." },
  { id: "conn-031", from: "dubai", to: "bretton-woods", relation: "EXAMPLE_OF", note: "The dirham's peg to the dollar since 1997 is a small descendant of the fixed-rate design." },

  /* ---- Reformation, Westphalia, states ---- */
  { id: "conn-032", from: "renaissance", to: "the-reformation", relation: "INFLUENCED", note: "Humanist philology supplied the tools: Valla exposed the Donation of Constantine, Erasmus printed the Greek New Testament in 1516." },
  { id: "conn-033", from: "the-reformation", to: "peace-of-westphalia", relation: "CAUSED", note: "The confessional division of Germany led, by way of the Thirty Years' War, to the settlement of 1648." },
  { id: "conn-034", from: "peace-of-westphalia", to: "diplomatic-immunity", relation: "INFLUENCED", note: "The system of sovereign states associated with 1648 (a reading historians now contest) is the one whose resident envoys needed a general rule of immunity." },
  { id: "conn-035", from: "renaissance", to: "diplomatic-immunity", relation: "INFLUENCED", note: "Resident embassies began among the Italian states in the 1450s; a permanent envoy needs permanent protection." },
  { id: "conn-036", from: "venetian-republic", to: "diplomatic-immunity", relation: "INFLUENCED", note: "Venice's resident ambassadors and their written relazioni set the model for professional diplomacy." },
  { id: "conn-037", from: "ottoman-empire", to: "diplomatic-immunity", relation: "CONTRASTS_WITH", note: "The Ottoman habit of imprisoning an enemy's ambassador in the Seven Towers at the outbreak of war, last used in 1798, is what the modern rule replaced." },
  { id: "conn-038", from: "mongol-empire", to: "diplomatic-immunity", relation: "RELATED_TO", note: "The murder of Genghis Khan's envoys at Otrar in 1218 brought the destruction of Khwarazm; the Mongols enforced envoy safety by terror." },
  { id: "conn-039", from: "napoleon-bonaparte", to: "rosetta-stone", relation: "CAUSED", note: "The stone was found by soldiers of his Egyptian expedition in 1799 and lost to Britain with his army's surrender there in 1801." },
  { id: "conn-040", from: "rosetta-stone", to: "falsifiability", relation: "RELATED_TO", note: "Champollion's readings survived every new cartouche; Kircher's allegorical decodings could explain anything and so explained nothing." },
  { id: "conn-041", from: "napoleon-bonaparte", to: "central-banks", relation: "CAUSED", note: "He founded the Banque de France in 1800, partly to finance his wars on better terms than the Directory had managed." },
  { id: "conn-042", from: "napoleon-bonaparte", to: "gold-standard", relation: "INFLUENCED", note: "Britain suspended gold convertibility in 1797 to fight him and resumed at the old parity in 1821; the debate over that resumption shaped monetary orthodoxy." },
  { id: "conn-043", from: "magna-carta", to: "napoleon-bonaparte", relation: "CONTRASTS_WITH", note: "A charter of specific liberties accreted into common law versus a code drafted from principles in 1804; the two traditions of the rule of law." },
  { id: "conn-044", from: "magna-carta", to: "central-banks", relation: "INFLUENCED", note: "Taxation by consent, by a long road through 1688, produced the parliamentary credit that founded the Bank of England in 1694 (North and Weingast, 1989)." },

  /* ---- Money cluster ---- */
  { id: "conn-045", from: "fiat-money", to: "gold-standard", relation: "CONTRASTS_WITH", note: "Money by decree and credibility versus money by weight of metal; each buys what the other cannot: discretion or discipline." },
  { id: "conn-046", from: "gold-standard", to: "bretton-woods", relation: "PRECEDED", note: "Bretton Woods kept gold only behind the dollar, a deliberate compromise after the 1930s." },
  { id: "conn-047", from: "bretton-woods", to: "fiat-money", relation: "PRECEDED", note: "Nixon's suspension of convertibility on 15 August 1971 began the era in which every major currency is fiat." },
  { id: "conn-048", from: "central-banks", to: "fiat-money", relation: "DEPENDS_ON", note: "Discretionary monetary policy needs a currency the bank can create; under gold a central bank was a parity-defender." },
  { id: "conn-049", from: "central-banks", to: "inflation", relation: "RESPONDED_TO", note: "Independence and explicit targets from 1990 were the institutional answer to the 1970s; Volcker's rate rises were the demonstration." },
  { id: "conn-050", from: "fiat-money", to: "inflation", relation: "RELATED_TO", note: "Fiat removes the external limit on issue; whether inflation follows depends on the issuer's restraint, which is why hyperinflations are always fiat." },
  { id: "conn-051", from: "gold-standard", to: "inflation", relation: "RELATED_TO", note: "Under gold the price level followed the mines: deflation 1873–96, inflation after the Rand and Klondike discoveries." },
  { id: "conn-052", from: "bretton-woods", to: "central-banks", relation: "DEPENDS_ON", note: "The pegs were defended by central banks buying and selling reserves; the system ended when they stopped believing in the dollar's gold." },
  { id: "conn-053", from: "game-theory", to: "bretton-woods", relation: "RELATED_TO", note: "Game theory arrived too late to design the system but explains its end: every dollar holder was better off converting to gold before the others did." },
  { id: "conn-054", from: "prisoners-dilemma", to: "gold-standard", relation: "RELATED_TO", note: "The competitive devaluations of the 1930s were a monetary Prisoner's Dilemma: each country gained by leaving gold first, and all lost from the scramble." },
  { id: "conn-055", from: "bretton-woods", to: "prisoners-dilemma", relation: "RESPONDED_TO", note: "The 1944 rules were written to prevent a repeat of the 1930s devaluation game, with the IMF as referee." },
  { id: "conn-056", from: "game-theory", to: "central-banks", relation: "INFLUENCED", note: "Kydland and Prescott's time-inconsistency argument (1977) showed why a policymaker tempted to surprise the public should bind itself; it is the case for independence." },
  { id: "conn-057", from: "mongol-empire", to: "fiat-money", relation: "INFLUENCED", note: "The Yuan made paper the sole legal money of an empire, backed by nothing but the Khan's law; Marco Polo could not believe it." },
  { id: "conn-058", from: "ming-dynasty", to: "fiat-money", relation: "EXAMPLE_OF", note: "The Ming baochao was overissued into worthlessness by the 1450s; the dynasty turned to silver, and the world's silver followed the demand." },
  { id: "conn-059", from: "venetian-republic", to: "central-banks", relation: "PRECEDED", note: "The Banco della Piazza di Rialto (1587) and Banco del Giro (1619) were public banks for settling merchant payments, ancestors of the Wisselbank and the Riksbank." },
  { id: "conn-060", from: "availability-heuristic", to: "inflation", relation: "RELATED_TO", note: "Inflation expectations track the prices people notice, petrol and bread, which are not the ones with the largest weight in the index." },
  { id: "conn-061", from: "coffeehouses", to: "central-banks", relation: "INFLUENCED", note: "The Bank of England (1694) was a project of the same London of coffeehouse subscribers and projectors that produced Lloyd's and the stock market." },

  /* ---- Business cluster ---- */
  { id: "conn-062", from: "dutch-east-india-company", to: "double-entry-bookkeeping", relation: "DEPENDS_ON", note: "Permanent capital and absent shareholders required accounts that could be audited; the VOC's books were among the largest kept in Europe." },
  { id: "conn-063", from: "double-entry-bookkeeping", to: "venetian-republic", relation: "LOCATED_IN", note: "Pacioli called it the Venetian method; the abacus schools of Venice taught it to the merchants of Europe." },
  { id: "conn-064", from: "dutch-east-india-company", to: "central-banks", relation: "RELATED_TO", note: "The Amsterdam Wisselbank (1609) was founded seven years after the VOC to settle the payments its trade generated; the two were the core of the Dutch financial system." },
  { id: "conn-065", from: "dutch-east-india-company", to: "english-auction", relation: "RELATED_TO", note: "The company sold its spices at auction in Amsterdam, controlling the flow to hold up prices; a monopolist using a price-discovery mechanism." },
  { id: "conn-066", from: "dutch-east-india-company", to: "hanseatic-league", relation: "CONTRASTS_WITH", note: "A joint-stock company with a state charter versus a league of towns without one; Dutch Baltic trade had displaced the Hansa before the VOC was born." },
  { id: "conn-067", from: "dutch-east-india-company", to: "silk-road", relation: "CONTRASTS_WITH", note: "The all-sea route around the Cape replaced the overland and Levantine chains that had fed Venice." },
  { id: "conn-068", from: "dutch-east-india-company", to: "ming-dynasty", relation: "RELATED_TO", note: "The VOC held Taiwan from 1624 until 1662, when the Ming loyalist Koxinga expelled it; Chinese silk and porcelain were its most profitable Asian cargo." },
  { id: "conn-069", from: "hanseatic-league", to: "double-entry-bookkeeping", relation: "CONTRASTS_WITH", note: "Hanseatic merchants kept single-entry books into the sixteenth century; a small marker of why the commercial lead passed south and then to Amsterdam." },
  { id: "conn-070", from: "containerization", to: "suez-canal", relation: "DEPENDS_ON", note: "The Asia–Europe container route runs through Suez; the Ever Given's grounding in March 2021 showed how much of world trade rests on one channel." },
  { id: "conn-071", from: "containerization", to: "double-entry-bookkeeping", relation: "RELATED_TO", note: "Same family: a standardisation of a routine act whose payoff was in what became cheap and checkable downstream." },
  { id: "conn-072", from: "containerization", to: "game-theory", relation: "EXAMPLE_OF", note: "The fight over box lengths (McLean's 35-foot, Matson's 24-foot, ISO's 20 and 40) was a coordination game; McLean released his patents to settle it." },
  { id: "conn-073", from: "english-auction", to: "game-theory", relation: "EXAMPLE_OF", note: "Vickrey's 1961 analysis of ascending auctions is the discipline's cleanest applied result." },
  { id: "conn-074", from: "prisoners-dilemma", to: "game-theory", relation: "EXAMPLE_OF", note: "The most studied game: dominant defection and a Pareto-inferior equilibrium." },
  { id: "conn-075", from: "coffeehouses", to: "english-auction", relation: "INFLUENCED", note: "Ships and cargoes were sold 'by the candle' at Lloyd's and Garraway's; London's auction trade grew up in coffeehouses." },
  { id: "conn-076", from: "english-auction", to: "bayes-theorem", relation: "RELATED_TO", note: "The winner's curse is a failure to condition on winning: the highest bid is evidence of the highest error." },
  { id: "conn-077", from: "english-auction", to: "impressionism", relation: "RELATED_TO", note: "The 1875 Drouot sale of Impressionist canvases was a rout; a century later auctions set the record prices that define the movement's public image." },

  /* ---- Reasoning cluster ---- */
  { id: "conn-078", from: "base-rate-fallacy", to: "bayes-theorem", relation: "RELATED_TO", note: "The fallacy is the omission of the prior; Bayes' theorem is the arithmetic it skips." },
  { id: "conn-079", from: "availability-heuristic", to: "base-rate-fallacy", relation: "RELATED_TO", note: "Siblings from the same 1973–74 programme: one inflates the vivid evidence, the other neglects the dull prior." },
  { id: "conn-080", from: "falsifiability", to: "bayes-theorem", relation: "CONTRASTS_WITH", note: "Popper denied that evidence confirms by degree; Bayesians treat falsification as the limiting case of a very small likelihood." },
  { id: "conn-081", from: "diplomatic-immunity", to: "prisoners-dilemma", relation: "EXAMPLE_OF", note: "An iterated game states have played successfully for centuries: cooperation sustained by reciprocity and the shadow of the future." },
  { id: "conn-082", from: "falsifiability", to: "availability-heuristic", relation: "RELATED_TO", note: "Asking what would refute a belief is the working antidote to letting the most available examples decide it." },

  /* ---- Arts cluster ---- */
  { id: "conn-083", from: "impressionism", to: "renaissance", relation: "CONTRASTS_WITH", note: "The Academy's rules of perspective, finish and subject descended from the Renaissance; the Impressionists painted the optical instant instead." },
  { id: "conn-084", from: "impressionism", to: "coffeehouses", relation: "DEPENDS_ON", note: "The group formed at the Café Guerbois and the Nouvelle Athènes; the cafe was the institution the Salon was not." },
  { id: "conn-085", from: "impressionism", to: "michelin-guide", relation: "RELATED_TO", note: "Salon juries and star inspectors are both Parisian institutions for rationing reputation; each was resisted and then decisive." },
  { id: "conn-086", from: "the-odyssey", to: "renaissance", relation: "INFLUENCED", note: "The recovery and printing of Greek texts, Homer in 1488, was part of what the humanists meant by rebirth." },
  { id: "conn-087", from: "the-odyssey", to: "diplomatic-immunity", relation: "RELATED_TO", note: "Xenia, the sacred obligation to the guest and stranger, is the pre-legal ancestor of the envoy's protection; the Cyclops's crime is its violation." },
  { id: "conn-088", from: "johann-sebastian-bach", to: "the-reformation", relation: "DEPENDS_ON", note: "The Lutheran chorale is the raw material of the cantatas and passions; Bach's Leipzig post existed to supply music for Lutheran worship." },
  { id: "conn-089", from: "johann-sebastian-bach", to: "coffeehouses", relation: "RELATED_TO", note: "The Coffee Cantata (BWV 211) was written for Zimmermann's coffeehouse in Leipzig, where Bach's Collegium Musicum played weekly." },
  { id: "conn-090", from: "johann-sebastian-bach", to: "peace-of-westphalia", relation: "RELATED_TO", note: "The patchwork of small courts (Weimar, Köthen) and free cities that employed him was the Germany the 1648 settlement left behind." },
];
