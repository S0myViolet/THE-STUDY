import type { InvestigationTemplate } from "@/lib/domain/content";

/**
 * Investigation templates: long questions the user works on over weeks.
 * Starting claims carry an honest support grade; counterclaims are real, not straw.
 * Sources are well-known books and papers a reader can actually find.
 */
export const INVESTIGATION_TEMPLATES: InvestigationTemplate[] = [
  {
    id: "inv-why-empires-fall",
    title: "Why do empires fall?",
    question: "Why do empires fall, and is 'fall' even the right word?",
    whyItMatters:
      "Every generation reads its own anxieties into the end of Rome. The question is worth asking properly because the candidate causes (fiscal overreach, elite competition, climate and disease, new enemies, plain bad luck) are the same ones that face any large organisation, and because the historiography is a live lesson in how one word, 'fall', can smuggle in a whole theory.",
    threads: [
      { id: "t-fiscal", title: "Fiscal and military overstretch", note: "Kennedy's thesis: great powers decline when the cost of defending their commitments outruns the economy that pays for them. Test it against Rome, the Ottomans, Spain and Britain." },
      { id: "t-elites", title: "Elite competition and succession", note: "Turchin's structural-demographic model, and the older observation that empires die of civil war more often than of invasion. How many Roman emperors of the third century died in their beds?" },
      { id: "t-climate", title: "Climate, disease and the biological argument", note: "Harper's case that the Antonine and Justinianic plagues and the Late Antique Little Ice Age did work that historians used to assign to politics. How strong is the evidence, and how new?" },
      { id: "t-external", title: "New neighbours, new weapons", note: "Heather's argument that Rome fell to Germanic groups it had itself made more formidable. Compare the Ming and the Manchus; the Ottomans and European artillery." },
      { id: "t-word", title: "Is 'fall' a narrative choice?", note: "Peter Brown's 'transformation' against Ward-Perkins's insistence that material life really did get worse. The Eastern Empire lasted until 1453: what does that do to any theory of why 'Rome' fell in 476?" },
    ],
    startingClaims: [
      { id: "c1", text: "Empires more often fragment through internal conflict than are destroyed by external conquest.", support: "moderate" },
      { id: "c2", text: "Fiscal strain from military commitments is a recurring precondition of decline.", support: "moderate" },
      { id: "c3", text: "Climate change and pandemic disease were decisive in the Roman case.", support: "contested" },
      { id: "c4", text: "Gibbon's explanation, that Christianity sapped Roman civic virtue, is no longer taken seriously as a primary cause.", support: "strong" },
      { id: "c5", text: "Elite overproduction, too many claimants for too few positions, predicts periods of instability.", support: "contested" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Any cause offered for the fall of the Western Empire in the fifth century must also explain why it did not bring down the Eastern Empire, which shared the same religion, currency and administration.", against: "c3" },
      { id: "cc2", text: "Fiscal overstretch may be a symptom, not a cause: states spend heavily on defence because they are already threatened.", against: "c2" },
      { id: "cc3", text: "Structural-demographic models fit the past well partly because they are fitted to it; their predictive record is short.", against: "c5" },
    ],
    archiveConnections: ["ottoman-empire", "mongol-empire", "ming-dynasty", "venetian-republic", "black-death", "napoleon-bonaparte"],
    openQuestions: [
      "Is there a single case of an empire that declined without a fiscal crisis first?",
      "How much of the 'fall of Rome' literature is really about the 1970s, the 1980s or the 2010s?",
      "What would count as evidence against the climate-and-disease thesis?",
      "Do small, rich republics (Venice, the Dutch) fall differently from large territorial empires?",
    ],
    sources: [
      { id: "s1", title: "Edward Gibbon, The History of the Decline and Fall of the Roman Empire (1776-1789)", note: "Read the last chapter of volume three for the famous summary; the argument about Christianity is in chapters 15 and 16." },
      { id: "s2", title: "Paul Kennedy, The Rise and Fall of the Great Powers (1987)", note: "The overstretch thesis, argued across Habsburg Spain, France, Britain and the twentieth century." },
      { id: "s3", title: "Peter Heather, The Fall of the Roman Empire: A New History (2005)", note: "The external-pressure case, with the Huns as the shock that set the Germanic migrations in motion." },
      { id: "s4", title: "Kyle Harper, The Fate of Rome: Climate, Disease, and the End of an Empire (2017)", note: "The biological argument; read reviews by historians sceptical of the epidemiological evidence alongside it." },
      { id: "s5", title: "Joseph Tainter, The Collapse of Complex Societies (1988)", note: "Collapse as a rational response to declining returns on complexity. A different frame from all the others." },
    ],
  },
  {
    id: "inv-how-money-works",
    title: "How does money actually work?",
    question: "Where does money come from, what makes it worth anything, and who decides how much of it there is?",
    whyItMatters:
      "Most educated people carry a picture of money that is two centuries out of date: a stock of coins, a mint, a vault. The working picture, in which most money is created by commercial banks when they lend and destroyed when loans are repaid, changes how you read every headline about inflation, debt and central banks.",
    threads: [
      { id: "t-creation", title: "Who creates money", note: "The Bank of England's 2014 explainer says plainly that bank lending creates deposits. Trace the mechanism through a single mortgage and ask what limits it." },
      { id: "t-origin", title: "Barter, credit and the origin story", note: "Textbooks begin with barter; anthropologists have found no barter economy that became a money economy. Graeber's alternative: money began as debt and tally." },
      { id: "t-state", title: "The state and the anchor of value", note: "Chartalism: currency is valued because the state demands taxes in it. Compare with the metallist view that value rests on the commodity behind the token." },
      { id: "t-central", title: "Central banks and the plumbing", note: "Reserves, the interbank market, the policy rate, lender of last resort. What a central bank can and cannot control." },
      { id: "t-inflation", title: "Inflation: too much money, or something else?", note: "Monetarist, expectations-based and supply-shock accounts. The 2021-2023 episode as a test case for each." },
    ],
    startingClaims: [
      { id: "c1", text: "In modern economies most money is created by commercial banks when they make loans, not by the central bank printing it.", support: "strong" },
      { id: "c2", text: "Money did not emerge from barter; credit and debt relationships came first.", support: "moderate" },
      { id: "c3", text: "Fiat currency is anchored in value by the state's power to tax in it.", support: "moderate" },
      { id: "c4", text: "Inflation is always and everywhere a monetary phenomenon.", support: "contested" },
      { id: "c5", text: "The gold standard constrained governments but transmitted deflation between countries in the 1930s.", support: "strong" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Bank money creation is real but bounded: capital requirements, demand for credit and the central bank's rate set the limits, so the 'banks create money from nothing' framing overstates the freedom.", against: "c1" },
      { id: "cc2", text: "Chartalism explains why a currency is accepted but not why its value is stable; taxation cannot anchor a currency in hyperinflation.", against: "c3" },
      { id: "cc3", text: "The barter story may be a myth, but 'money as debt' is also a theory chosen for its politics; the archaeological record supports plural origins.", against: "c2" },
    ],
    archiveConnections: ["fiat-money", "central-banks", "inflation", "gold-standard", "bretton-woods", "double-entry-bookkeeping", "how-money-works"],
    openQuestions: [
      "If banks create money by lending, what exactly happens to the money supply when a loan defaults?",
      "Why did quantitative easing after 2008 not produce the inflation that many predicted, and why did 2021 produce inflation that few did?",
      "What is the difference between a bank deposit, a central bank reserve and a banknote, and who can hold each?",
      "Would a central bank digital currency change any of the above?",
    ],
    sources: [
      { id: "s1", title: "McLeay, Radia and Thomas, 'Money creation in the modern economy', Bank of England Quarterly Bulletin, 2014 Q1", note: "Fourteen pages from a central bank saying how it actually works. Start here." },
      { id: "s2", title: "David Graeber, Debt: The First 5,000 Years (2011)", note: "The anthropological attack on the barter myth. Polemical; check the claims about Mesopotamia against a specialist." },
      { id: "s3", title: "Felix Martin, Money: The Unauthorised Biography (2013)", note: "Money as a system of credit and clearing, with the stone money of Yap as the opening image." },
      { id: "s4", title: "Milton Friedman and Anna Schwartz, A Monetary History of the United States, 1867-1960 (1963)", note: "The monetarist reading of the Great Depression; the chapter on 1929-1933 is the one everyone argues with." },
      { id: "s5", title: "Perry Mehrling, The New Lombard Street (2011)", note: "The 'money view': central banking as the management of liquidity, from Bagehot to 2008." },
    ],
  },
  {
    id: "inv-why-dubai",
    title: "Why is Dubai the way it is?",
    question: "How did a pearling creek with no oil to speak of become the Gulf's trading and aviation hub?",
    whyItMatters:
      "Dubai is usually explained by oil, which is nearly the opposite of the truth: oil was found late (1966), was never abundant, and is now a small share of the economy. The real explanation involves a nineteenth-century trading settlement, British treaties, a ruling family that bet on ports and airlines before it could afford them, a labour system that keeps costs low, and a location between Iran, India and East Africa. It is a case study in what a state can do with geography and credit.",
    threads: [
      { id: "t-creek", title: "The creek before oil", note: "The Maktoum move to Dubai in 1833; the pearl trade and its collapse after Japanese cultured pearls in the 1930s; the 1900s decision to make Dubai a free port that pulled merchants from Lingah on the Persian coast." },
      { id: "t-britain", title: "The Trucial States and the British", note: "The maritime truces from 1820 and the Exclusive Agreement of 1892: what Britain wanted, what the sheikhdoms got, and what happened when Britain left in 1971." },
      { id: "t-infrastructure", title: "Ports and airlines before the money", note: "Rashid bin Saeed dredged the creek in the late 1950s on borrowed money; Port Rashid (1972), Jebel Ali (1979), the free zone (1985), Emirates airline (1985). Look at what each was for and who doubted it." },
      { id: "t-labour", title: "The labour model", note: "A population that is roughly ninety percent non-citizen, sponsorship (kafala), and what that does to costs, rights and the shape of the city." },
      { id: "t-fragility", title: "Crises and the Abu Dhabi backstop", note: "The 2009 Dubai World debt standstill and Abu Dhabi's ten-billion-dollar support; the tower renamed Burj Khalifa. What does the episode say about the model's limits?" },
    ],
    startingClaims: [
      { id: "c1", text: "Dubai's economy is not an oil economy; oil is a small single-digit share of GDP.", support: "strong" },
      { id: "c2", text: "The decisive moves were infrastructure bets made ahead of demand, financed by debt and later by Abu Dhabi.", support: "moderate" },
      { id: "c3", text: "Dubai's free-port strategy dates to the early twentieth century, not to the 1980s.", support: "strong" },
      { id: "c4", text: "Regional instability (Iranian revolution, Gulf wars, sanctions) has repeatedly driven capital and merchants to Dubai.", support: "moderate" },
      { id: "c5", text: "The model depends on a labour system that would be politically impossible in a democracy.", support: "contested" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Without Abu Dhabi's oil, and the federation of 1971, Dubai's credit would not have survived 2009; 'not an oil economy' is true of Dubai only because it is not true of the UAE.", against: "c1" },
      { id: "cc2", text: "Singapore and Hong Kong built entrepot economies with different labour regimes; the kafala system may be incidental rather than essential to the model.", against: "c5" },
      { id: "cc3", text: "Hindsight makes the port and airline bets look visionary; contemporaries also saw failures (the Dubai Aluminium and dry dock projects had difficult starts) that the story omits.", against: "c2" },
    ],
    archiveConnections: ["dubai", "containerization", "suez-canal", "silk-road", "dutch-east-india-company"],
    openQuestions: [
      "How much of Dubai's growth is re-export and transit, and how would you measure it?",
      "What would Dubai look like today if Britain had stayed east of Suez after 1971?",
      "Is the Dubai model replicable (Neom, new capital cities) or does it depend on a location that cannot be copied?",
      "What are the physical limits: water, heat, and a coastline that is largely artificial?",
    ],
    sources: [
      { id: "s1", title: "Christopher Davidson, Dubai: The Vulnerability of Success (2008)", note: "The standard political-economy account, written just before the 2009 crisis it half predicted." },
      { id: "s2", title: "Jim Krane, City of Gold: Dubai and the Dream of Capitalism (2009)", note: "Journalistic, readable, good on the Rashid era and the personalities." },
      { id: "s3", title: "Frauke Heard-Bey, From Trucial States to United Arab Emirates (1982)", note: "The detailed history of the pre-federation period; the reference everyone else cites." },
      { id: "s4", title: "Ahmed Kanna, Dubai, the City as Corporation (2011)", note: "An anthropologist on the labour system, urban form and who the city is for." },
      { id: "s5", title: "Mike Davis, 'Fear and Money in Dubai', New Left Review 41 (2006)", note: "The hostile reading. Useful precisely because it is one-sided: test its claims." },
    ],
  },
  {
    id: "inv-container-shipping",
    title: "How did container shipping change the world?",
    question: "How did a steel box, standardised in the 1960s, reorganise where things are made, which cities prosper and what work at a port means?",
    whyItMatters:
      "The container is the clearest modern case of a boring standard with enormous downstream effects. Understanding it teaches how transport costs shape geography, why some famous ports died and unknown ones grew, and how to weigh a single technology against the trade agreements and communications that arrived at the same time. It is also a lesson in the politics of standards: the box only worked once everyone agreed on its corners.",
    threads: [
      { id: "t-mclean", title: "McLean and the Ideal-X", note: "The trucker who thought of the ship as a piece of road. The first voyage, Newark to Houston, April 1956, and the cost-per-ton comparison Levinson reports for break-bulk versus container loading." },
      { id: "t-standard", title: "The fight over the standard", note: "Twenty-foot and forty-foot boxes, twistlock corner fittings, the ISO process of the 1960s. Who lost by standardising, and why they went along." },
      { id: "t-labour", title: "The docks", note: "Dock labour in the 1950s versus the 1970s. The 1960 Mechanization and Modernization Agreement on the US west coast; the fall of the London docks; what a port employs now." },
      { id: "t-geography", title: "Ports that won and ports that died", note: "Manhattan and the Port of London against Newark, Felixstowe, Rotterdam, Singapore and, later, Shenzhen. Why deep water and land beat proximity to the city." },
      { id: "t-supply-chains", title: "Cheap distance and the shape of manufacturing", note: "Just-in-time, offshoring, the containerised component moving across borders several times. Bernhofen, El-Sahli and Kneller's estimate of the container's effect on bilateral trade." },
    ],
    startingClaims: [
      { id: "c1", text: "Containerisation reduced the cost of loading and unloading cargo by more than an order of magnitude.", support: "strong" },
      { id: "c2", text: "The container did more to increase world trade in the late twentieth century than tariff reductions under GATT.", support: "contested" },
      { id: "c3", text: "The Vietnam War, with the US military as a guaranteed customer, was decisive in getting container shipping to scale.", support: "moderate" },
      { id: "c4", text: "Old city-centre ports lost not because of bad management but because the container needed space they did not have.", support: "strong" },
      { id: "c5", text: "The benefits went mostly to shippers and consumers; the costs fell on dock workers and port cities.", support: "moderate" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Cheaper communications, air freight and trade liberalisation arrived together with the container; attributing the growth of trade to the box alone is a single-cause story.", against: "c2" },
      { id: "cc2", text: "Ocean freight was already a small share of the landed cost of most manufactured goods; the container's effect on where things are made may be smaller than the effect on inventory and reliability.", against: "c2" },
      { id: "cc3", text: "Dock work declined, but many port cities (Rotterdam, Singapore) grew richer; the distribution of costs depends on which city you choose to look at.", against: "c5" },
    ],
    archiveConnections: ["containerization", "dubai", "suez-canal", "hanseatic-league", "dutch-east-india-company", "printing-press"],
    openQuestions: [
      "How would you estimate the container's contribution to trade separately from tariff cuts made in the same decades?",
      "Why did standardisation succeed for containers and fail, or take much longer, for rail gauges and electrical plugs?",
      "What did the Ever Given (2021) and the pandemic port queues reveal about the fragility that cheap shipping built in?",
      "Is there a box-like standard emerging now, in data or energy, whose downstream effects we are underrating?",
    ],
    sources: [
      { id: "s1", title: "Marc Levinson, The Box: How the Shipping Container Made the World Smaller and the World Economy Bigger (2006)", note: "The standard history. Cost figures, the standards fight, the docks, the ports." },
      { id: "s2", title: "Bernhofen, El-Sahli and Kneller, 'Estimating the effects of the container revolution on world trade', Journal of International Economics 98 (2016)", note: "The econometric attempt to isolate the container's effect; read the identification strategy critically." },
      { id: "s3", title: "David Hummels, 'Transportation Costs and International Trade in the Second Era of Globalization', Journal of Economic Perspectives 21(3) (2007)", note: "Puts shipping costs in proportion; useful corrective to single-cause stories." },
      { id: "s4", title: "Rose George, Ninety Percent of Everything (2013)", note: "A voyage on a container ship; what the system looks like from inside." },
      { id: "s5", title: "Brian Cudahy, Box Boats: How Container Ships Changed the World (2006)", note: "Ship-by-ship history for the reader who wants the fleet detail." },
    ],
  },
  {
    id: "inv-great-negotiator",
    title: "What makes a great negotiator?",
    question: "What do people who negotiate well actually do differently, and how much of the popular advice is supported by evidence rather than anecdote?",
    whyItMatters:
      "Negotiation advice is a large and mostly unaudited industry. Some of it rests on experiments (anchoring, first offers), some on observation of skilled practitioners (Rackham's study), some on the memoirs of people who were in the room once. Sorting the three is worth doing because negotiation is one of the few faculties where a small improvement compounds across a life.",
    threads: [
      { id: "t-preparation", title: "Preparation and alternatives", note: "Fisher and Ury's BATNA; Raiffa's analytic frame. How much of skill is done before the meeting?" },
      { id: "t-anchoring", title: "First offers and anchoring", note: "Galinsky and Mussweiler's experiments on who should make the first offer. Where the effect is robust and where it reverses." },
      { id: "t-behaviour", title: "What skilled negotiators observably do", note: "Rackham and Carlisle watched labour and contract negotiators in the 1970s: more questions, more testing of understanding, fewer counter-proposals, fewer 'irritators'. Has anyone replicated it?" },
      { id: "t-empathy", title: "Listening, labelling and the hostage-negotiator school", note: "Voss's tactical empathy. Strong practitioner testimony, thin controlled evidence. How would you test it?" },
      { id: "t-repeated", title: "One-shot versus repeated games", note: "Schelling on commitment; Axelrod on cooperation. The difference between winning a deal and being someone people deal with again." },
    ],
    startingClaims: [
      { id: "c1", text: "Knowing your alternative to agreement, and the other side's, is the single largest determinant of outcome.", support: "moderate" },
      { id: "c2", text: "Making the first offer usually benefits the offerer through anchoring, provided they are well informed.", support: "moderate" },
      { id: "c3", text: "Skilled negotiators ask more questions and spend more time checking understanding than average ones.", support: "moderate" },
      { id: "c4", text: "Tactical empathy techniques such as labelling and mirroring measurably improve outcomes.", support: "weak" },
      { id: "c5", text: "Most negotiations leave value on the table because both sides assume the pie is fixed.", support: "strong" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "First-offer advantage is demonstrated mostly in laboratory settings with students; in repeated relationships an aggressive anchor can cost more than it gains.", against: "c2" },
      { id: "cc2", text: "Rackham's 'skilled' negotiators were identified by reputation and outcome, so the study may describe what successful people are allowed to do rather than what causes success.", against: "c3" },
      { id: "cc3", text: "'Great negotiator' is a survivorship label: we hear from the people whose bets paid off.", against: "c1" },
    ],
    archiveConnections: ["game-theory", "prisoners-dilemma", "english-auction", "peace-of-westphalia", "diplomatic-immunity", "bretton-woods"],
    openQuestions: [
      "Which negotiation claims have been tested outside the laboratory, with real money and real relationships?",
      "How do cultural differences in directness change what 'good' looks like?",
      "Is a negotiation a problem to be solved (Raiffa) or a relationship to be managed (Voss), and does it depend on stakes?",
      "What did the negotiators at Westphalia or Bretton Woods do that a textbook would recognise?",
    ],
    sources: [
      { id: "s1", title: "Roger Fisher, William Ury and Bruce Patton, Getting to Yes (1981; revised 1991, 2011)", note: "Interests not positions, BATNA, objective criteria. The frame everyone else reacts to." },
      { id: "s2", title: "Howard Raiffa, The Art and Science of Negotiation (1982)", note: "The analytic tradition: zones of agreement, decision analysis, when to negotiate at all." },
      { id: "s3", title: "Neil Rackham and John Carlisle, 'The Effective Negotiator', Journal of European Industrial Training 2 (1978)", note: "The observational study of skilled negotiators. Small, old, and still the most-cited behavioural evidence." },
      { id: "s4", title: "Adam Galinsky and Thomas Mussweiler, 'First Offers as Anchors', Journal of Personality and Social Psychology 81 (2001)", note: "The experimental basis for the first-offer advice." },
      { id: "s5", title: "Chris Voss with Tahl Raz, Never Split the Difference (2016)", note: "The practitioner's book. Read it for the techniques, then ask what evidence would show they work." },
    ],
  },
  {
    id: "inv-why-conspiracies",
    title: "Why do people believe conspiracies?",
    question: "Why do intelligent people believe in conspiracies that the evidence does not support, and how do you tell those from the conspiracies that were real?",
    whyItMatters:
      "The question is usually asked with contempt, which is the wrong instrument. Some conspiracies were real (the tobacco industry's suppression of cancer evidence, the Tuskegee study, MKUltra), so blanket disbelief is a base-rate error of its own. The task is to understand the psychology honestly, including the parts that are ordinary human cognition working as designed, and then to find the rules that separate warranted suspicion from unfalsifiable belief.",
    threads: [
      { id: "t-motives", title: "Three families of motive", note: "Douglas, Sutton and Cichocka's framework: epistemic (wanting a pattern), existential (wanting control and safety), social (wanting to belong and to feel special). Which does the evidence support most strongly?" },
      { id: "t-history", title: "Are we living in a golden age of conspiracy?", note: "Hofstadter's 'paranoid style' in 1964; Uscinski and Parent's letters-to-the-editor data suggesting stable levels since 1890. What would rising belief look like in the data, and do we see it?" },
      { id: "t-real", title: "The base rate of real conspiracies", note: "Tobacco, Watergate, Tuskegee, the Iran-Contra affair. What distinguishes the ones that were exposed from the theories that never resolve? Size, duration, documentary trail?" },
      { id: "t-structure", title: "The logical structure of an unfalsifiable belief", note: "Popper's 'conspiracy theory of society'; the way absence of evidence becomes evidence of cover-up. Compare the falsifiability test with real investigative journalism." },
      { id: "t-media", title: "Amplification", note: "Does the internet create believers or reveal them? Separate exposure, engagement and belief; be careful with studies that measure sharing rather than believing." },
    ],
    startingClaims: [
      { id: "c1", text: "Conspiracy belief correlates with feelings of powerlessness, uncertainty and loss of control.", support: "moderate" },
      { id: "c2", text: "The tendency to see agency and intention behind events is a normal cognitive default, not a pathology.", support: "strong" },
      { id: "c3", text: "The level of conspiracy belief in the United States has been roughly stable for over a century.", support: "contested" },
      { id: "c4", text: "Real conspiracies are common enough that dismissing all conspiracy claims is itself a reasoning error.", support: "strong" },
      { id: "c5", text: "Social media has substantially increased conspiracy belief in the population.", support: "contested" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Correlations with powerlessness come mostly from self-report surveys; the direction of causation is unclear and the effect sizes are modest.", against: "c1" },
      { id: "cc2", text: "Some 'believers' are expressing group identity or distrust rather than a literal belief; survey answers overstate conviction.", against: "c5" },
      { id: "cc3", text: "'Conspiracy theory' is itself a label used to dismiss claims; the category is partly rhetorical and its boundaries move with who is in power.", against: "c4" },
    ],
    archiveConnections: ["availability-heuristic", "base-rate-fallacy", "falsifiability", "bayes-theorem", "printing-press"],
    openQuestions: [
      "What features do the real, later-exposed conspiracies share that the enduring theories lack?",
      "Is there any intervention with good evidence of reducing conspiracy belief, rather than merely changing survey answers?",
      "How would you estimate the base rate of real conspiracies in a given domain (medicine, finance, intelligence)?",
      "Does the printing press offer a precedent: did cheap pamphlets in the 1520s produce a wave of conspiracy belief, and how did it end?",
    ],
    sources: [
      { id: "s1", title: "Karen Douglas, Robbie Sutton and Aleksandra Cichocka, 'The Psychology of Conspiracy Theories', Current Directions in Psychological Science 26(6) (2017)", note: "The review that set out the epistemic, existential and social motives. Short and citable." },
      { id: "s2", title: "Joseph Uscinski and Joseph Parent, American Conspiracy Theories (2014)", note: "The long-run data argument; the letters-to-the-editor method is clever and open to criticism." },
      { id: "s3", title: "Richard Hofstadter, 'The Paranoid Style in American Politics', Harper's Magazine (November 1964)", note: "The essay that named the phenomenon. Read it as a primary source about 1964 as well as an analysis." },
      { id: "s4", title: "Rob Brotherton, Suspicious Minds: Why We Believe Conspiracy Theories (2015)", note: "Accessible survey of the cognitive science, good on why the tendency is ordinary." },
      { id: "s5", title: "Cass Sunstein and Adrian Vermeule, 'Conspiracy Theories: Causes and Cures', Journal of Political Philosophy 17(2) (2009)", note: "Controversial for its proposed remedies; useful for the analysis of 'crippled epistemology'." },
    ],
  },
  {
    id: "inv-how-a-language-dies",
    title: "How does a language die?",
    question: "What actually happens when a language stops being spoken, why does it happen, and can it be reversed?",
    whyItMatters:
      "Languages rarely die because their speakers die. They die because parents, one household at a time, decide that their children are better off in another language. Understanding that mechanism means understanding incentives, states, schools and shame, and it makes the successes (Hebrew, and the partial revivals of Welsh and Maori) instructive rather than miraculous. It is also a domain where the headline numbers deserve suspicion.",
    threads: [
      { id: "t-shift", title: "Shift, not death", note: "Fishman's model of intergenerational transmission: a language is safe while children learn it at home and unsafe the moment they do not. Speakers move to the language of work and cities, so ask whether shift is a rational family choice and what 'saving' a language would demand of them." },
      { id: "t-state", title: "States, schools and prestige", note: "The role of compulsory schooling in a national language: France after 1882, the Welsh Not, residential schools in North America. How much of language death is policy?" },
      { id: "t-catastrophe", title: "Demographic catastrophe", note: "Disease, displacement and violence in the Americas and Australia. When death rather than shift is the mechanism, the timeline is different and so are the survivals." },
      { id: "t-numbers", title: "Counting languages and counting loss", note: "About seven thousand languages, roughly half 'endangered', and Krauss's 1992 warning that ninety percent could go this century. Where do the numbers come from and how is a 'language' distinguished from a dialect?" },
      { id: "t-revival", title: "What revival requires", note: "Hebrew is the one full revival; Welsh, Maori, Hawaiian and Basque are partial. Language nests, immersion schooling, media and legal status. Which of these worked without the others?" },
    ],
    startingClaims: [
      { id: "c1", text: "Language death is overwhelmingly a matter of shift, the end of home transmission, rather than the death of speakers.", support: "strong" },
      { id: "c2", text: "Around half the world's languages are at risk of disappearing within the century.", support: "contested" },
      { id: "c3", text: "State schooling in a single national language has been the most powerful single driver of shift in the last two centuries.", support: "moderate" },
      { id: "c4", text: "Revival succeeds only when a language regains domains of daily use, not through schooling alone.", support: "moderate" },
      { id: "c5", text: "Each language encodes knowledge (of ecology, kinship, place) that is lost with it.", support: "moderate" },
    ],
    startingCounterclaims: [
      { id: "cc1", text: "Endangerment estimates depend on how languages are counted; dialect continua and political definitions inflate or deflate the totals.", against: "c2" },
      { id: "cc2", text: "Language shift can be a considered choice by families seeking opportunity; framing it as loss imposes outsiders' values on speakers.", against: "c5" },
      { id: "cc3", text: "Urbanisation and labour markets would have driven shift even without coercive schooling; policy accelerated a process it did not create.", against: "c3" },
    ],
    archiveConnections: ["rosetta-stone", "printing-press", "the-reformation", "ottoman-empire", "mongol-empire", "the-odyssey"],
    openQuestions: [
      "Why did Hebrew revive fully and no other language has? What was unrepeatable about the conditions?",
      "How would you measure whether a revival is working, beyond counting school enrolments?",
      "What did the printing press and vernacular Bibles do to the languages that were not chosen for print?",
      "Is there a defensible way to weigh the value of a language against its speakers' preferences?",
    ],
    sources: [
      { id: "s1", title: "David Crystal, Language Death (2000)", note: "The concise standard introduction: why it matters, why languages die, what can be done." },
      { id: "s2", title: "Joshua Fishman, Reversing Language Shift (1991)", note: "The graded scale of endangerment and the argument that home transmission is what counts." },
      { id: "s3", title: "Michael Krauss, 'The World's Languages in Crisis', Language 68(1) (1992)", note: "The short paper behind the ninety-percent figure. Read it to see what the number rests on." },
      { id: "s4", title: "Daniel Nettle and Suzanne Romaine, Vanishing Voices (2000)", note: "Links language loss to ecological and economic change; the case for c5." },
      { id: "s5", title: "Nicholas Evans, Dying Words: Endangered Languages and What They Have to Tell Us (2010)", note: "A field linguist on what specifically is lost; the best answer to 'so what?'." },
    ],
  },
];
