import type { ArchiveEntry } from "@/lib/domain/types";

/**
 * Archive, part B: economics, business, law, reasoning, and the arts, plus the three reading paths.
 * Ids are the canonical concept keys (CONTRACTS §8).
 * Prose is editorial; where a date, figure or causal claim is contested the text says so.
 */
export const ARCHIVE_B: ArchiveEntry[] = [
  {
    id: "central-banks",
    kind: "concept",
    domain: "economics",
    title: "Central Banks",
    subtitle: "The institution that lends to banks, prints the money and is meant to be trusted with both",
    summary:
      "A central bank issues a country's currency, sets the short-term interest rate, stands behind the banking system as lender of last resort and, since the 1990s, is usually charged with keeping inflation near a published target while staying at arm's length from the government that created it.",
    what:
      "The oldest surviving central bank is Sweden's Riksbank (1668); the model most others copied is the Bank of England, chartered in 1694 to lend 1.2 million pounds to William III's government for war against France in exchange for the right to issue notes. Neither began as a public institution in the modern sense. They were private companies with a state contract, and their public functions accreted over two centuries: monopoly of the note issue, holding the reserves of other banks, and, after the crises of 1825, 1847, 1857 and 1866, the duty Walter Bagehot spelled out in Lombard Street (1873): in a panic, lend freely, at a penalty rate, against collateral that would be good in normal times.\n\nThe United States refused the idea twice, letting the First and Second Banks lapse, and created the Federal Reserve only in 1913 after the Panic of 1907 had been contained by J. P. Morgan personally. The European Central Bank (1998) is the most recent large one, unusual in serving a currency without a single state behind it.\n\nA modern central bank works through a policy rate that anchors the cost of money, through buying and selling assets, and through regulation of the banks it stands behind. New Zealand introduced an explicit inflation target in 1990; most rich countries followed, and granted operational independence so that the rate is not set to suit an election.",
    why:
      "Money is a promise, and a central bank is the institution appointed to keep it. Its interest is that of a referee: not to decide who wins, but to keep the game from breaking. Every argument about a central bank, whether it is too independent, too political, too slow or too clever, is an argument about how much discretion to give a body that cannot be voted out. That is worth understanding because the same question recurs wherever expertise meets democracy.",
    before:
      "Before central banks, states minted coin and borrowed from private bankers such as the Fuggers or the Genoese, defaulting when it suited them. Venice's Banco della Piazza di Rialto (1587) and Amsterdam's Wisselbank (1609) were public banks for settling merchant payments, not lenders of last resort. Panics ran their course; a run on one bank spread to the rest, and there was nobody whose job it was to stop it.",
    after:
      "The lender of last resort made banking crises survivable and, arguably, more frequent, since banks could count on being rescued. Independence and inflation targeting delivered two decades of low inflation from the mid-1990s, then a crisis in 2008 that pushed central banks into buying trillions in assets and setting rates near or below zero. The inflation of 2021–23 tested the targeting regime and exposed how much of a central bank's power rests on being believed.",
    connects:
      "Central banks exist because Fiat Money needs an issuer with a reputation; under The Gold Standard their discretion was narrow. Inflation is the thing they are now judged on. Bretton Woods was run by them and broke when they lost faith in the dollar. The Bank of England grew out of the same London of Coffeehouses and projectors that produced Lloyd's and the Stock Exchange, and Magna Carta's principle of no tax without consent underlies the parliamentary credit that made it possible.",
    remember: [
      "Riksbank 1668, Bank of England 1694 (a private company with a war loan and a note issue), Federal Reserve 1913, ECB 1998.",
      "Bagehot's rule (1873): in a panic, lend freely, at a penalty rate, on good collateral.",
      "Three tools: the policy rate, buying and selling assets, and supervision of the banks it backs.",
      "Inflation targeting began in New Zealand in 1990; operational independence followed across rich countries.",
      "The recurring question is discretion: how much power to give an institution that cannot be voted out.",
    ],
    yearStart: 1668,
    tags: ["monetary policy", "interest rates", "lender of last resort", "bank of england", "federal reserve", "bagehot", "independence", "inflation targeting"],
    recall: [
      { prompt: "Why was the Bank of England founded in 1694?", answer: "To lend 1.2 million pounds to William III's government for the war against France, in exchange for the right to issue banknotes; it began as a private company with a state contract." },
      { prompt: "State Bagehot's rule for a lender of last resort.", answer: "In a panic, lend freely, at a penalty rate, against collateral that would be sound in normal times." },
      { prompt: "Which country introduced the first explicit inflation target, and when?", answer: "New Zealand, in 1990." },
      { prompt: "Why did the United States create the Federal Reserve only in 1913?", answer: "It had let two earlier national banks lapse out of suspicion of concentrated financial power; the Panic of 1907, contained only by J. P. Morgan's private intervention, made the case for a public lender of last resort." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "inflation",
    kind: "concept",
    domain: "economics",
    title: "Inflation",
    subtitle: "A sustained rise in prices, and a quiet transfer from those who hold money to those who owe it",
    summary:
      "Inflation is a persistent rise in the general level of prices, equivalently a fall in what a unit of money buys. It is measured by price indices, caused by some mix of excess demand, supply shocks and monetary expansion, and it redistributes wealth from creditors and savers to debtors, including governments.",
    what:
      "Inflation is not one price going up but most prices going up together, over time. Statisticians measure it with a consumer price index: a basket of goods and services, weighted by what households actually buy, repriced monthly. The number is always an approximation, since baskets change, quality improves and everyone's basket is different.\n\nThree stories explain it, and they are not exclusive. Demand-pull inflation happens when spending outruns what the economy can produce, as after a war or a large fiscal stimulus. Cost-push inflation comes from a supply shock, such as the oil embargo of 1973 or the shipping and energy squeeze of 2021–22, which raises costs that firms pass on. The monetary story, associated with Milton Friedman's line that inflation is 'always and everywhere a monetary phenomenon', holds that sustained inflation requires the money supply to keep growing faster than output. Economists dispute the weights, not the ingredients. Expectations do much of the work: if people expect prices to rise, they demand wages and set prices accordingly, and the expectation fulfils itself.\n\nThe extremes are instructive. Germany in 1923 and Hungary in 1946 saw prices doubling in days; Zimbabwe abandoned its dollar in 2009. In each case a government financed itself by printing. Mild inflation, around two per cent, is the target most central banks now aim at, on the reasoning that a little grease helps wages adjust and keeps interest rates away from zero.",
    why:
      "Inflation is the clearest example of a number that changes what other numbers mean. A 4 per cent pay rise under 6 per cent inflation is a pay cut; a debt fixed in money terms shrinks as prices rise. Anyone reading a historical price, a salary, a debt or a return needs to ask 'real or nominal?' before believing it. The habit generalises: whenever a measure can drift, check what it is measured against.",
    before:
      "For most of history, price levels moved with the supply of precious metal. The sixteenth-century Price Revolution, when European prices roughly tripled over a century, is usually attributed to American silver, though population growth and faster circulation of money share the blame in current scholarship. Under metallic money, inflation was episodic and often followed by deflation; the idea of a steady, managed rate is a twentieth-century one.",
    after:
      "The Great Inflation of the 1970s, peaking near 15 per cent in the United States and over 24 per cent in Britain, ended when Paul Volcker's Federal Reserve raised rates above 19 per cent in 1981 and accepted a deep recession. That episode created the modern consensus: independent central banks, explicit targets, and attention to expectations. The surge of 2021–23 reopened the argument about how much came from pandemic supply chains, how much from stimulus, and how much from firms' pricing power.",
    connects:
      "Inflation is what Central Banks are now judged by, what Fiat Money makes possible without limit, and what The Gold Standard constrained at the price of deflation. The end of Bretton Woods and the 1970s inflation are one story. Inflation expectations are shaped by the Availability Heuristic, since the prices people notice, petrol and bread, are not the ones that weigh most in the index. The Ming Dynasty's paper currency is an early case of overissue destroying a money.",
    remember: [
      "Inflation is a sustained rise in the general price level, measured by a weighted basket (the CPI).",
      "Three causes, usually mixed: demand outrunning capacity, supply shocks pushing costs, and money growing faster than output.",
      "Expectations are self-fulfilling; that is why central banks talk so much.",
      "Real versus nominal: always ask what a figure is measured against.",
      "Hyperinflations (Germany 1923, Hungary 1946, Zimbabwe 2008) are always cases of a state financing itself by printing.",
    ],
    tags: ["prices", "cpi", "purchasing power", "hyperinflation", "monetary policy", "expectations", "real vs nominal", "volcker"],
    recall: [
      { prompt: "What is the difference between a real and a nominal figure?", answer: "A nominal figure is stated in current money; a real figure is adjusted for inflation so that it can be compared across time." },
      { prompt: "Name three broad causes of inflation.", answer: "Demand-pull (spending outruns capacity), cost-push (a supply shock raises costs), and monetary expansion (money grows faster than output); expectations amplify all three." },
      { prompt: "How was the Great Inflation of the 1970s ended in the United States?", answer: "Paul Volcker's Federal Reserve raised interest rates above 19 per cent in 1981 and accepted a severe recession." },
      { prompt: "Who gains and who loses from unexpected inflation?", answer: "Debtors gain because their fixed debts shrink in real terms; creditors, savers and anyone on a fixed income lose." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "fiat-money",
    kind: "concept",
    domain: "economics",
    title: "Fiat Money",
    subtitle: "Money that is valuable because the state says so and everyone else agrees",
    summary:
      "Fiat money is currency with no intrinsic value and no promise of redemption in metal; it is worth something because the state accepts it for taxes, the law makes it legal tender, and people expect others to take it tomorrow. Every major currency has been fiat since 1971.",
    what:
      "The word is Latin for 'let it be done', and the idea is older than the word. Song China issued the first state paper money, the jiaozi, in Sichuan in the 1020s, originally as receipts for iron coin and then as currency in its own right. The Yuan dynasty under Kublai Khan made paper the sole legal money of the empire, which is what astonished Marco Polo. The Ming issued paper too and, by overprinting, destroyed it within decades. Europe arrived late: the Massachusetts Bay Colony's bills of credit of 1690, the assignats of the French Revolution, and the Bank of England's notes, which were made inconvertible during the Napoleonic wars and again in 1914.\n\nWhat holds fiat money up is a set of mutually reinforcing facts. The state demands it for taxes, which guarantees a permanent buyer. The law designates it legal tender for settling debts. And, most importantly, everybody expects everybody else to accept it, a convention that survives because abandoning it is costly for the individual who goes first.\n\nThe modern era began on 15 August 1971, when the United States ended the dollar's convertibility into gold. Since then no major currency has been backed by anything except the credibility of the institution that issues it. That is the design, not a defect, and it is why central bank independence matters so much.",
    why:
      "Fiat money is the purest example of a social fact: a thing that exists because enough people act as though it does. Understanding it dissolves a common confusion, that money must be 'backed' by something physical to be real. It also clarifies the actual risk, which is not that money is imaginary but that its issuer might print too much. The question to ask of any money is not 'what is it made of?' but 'who can make more, and what stops them?'",
    before:
      "Commodity money, coin whose value was tied to its metal content, and later convertible paper, notes that promised metal on demand, dominated until the twentieth century. Rulers debased coin and suspended convertibility in wars, but each suspension was framed as temporary. The gold standard of 1870–1914 was the high point of the belief that money must be anchored to something outside politics.",
    after:
      "Fiat money made large peacetime deficits, sustained mild inflation and active monetary policy the norm. Exchange rates floated. Digital forms of the same convention, bank deposits, cards and phone payments, now dwarf physical cash. Cryptocurrencies were designed in 2008–09 as an explicit rejection of fiat, replacing an issuer's credibility with a fixed algorithm, and have so far functioned more as speculative assets than as money, which is itself a lesson in what money needs.",
    connects:
      "Fiat Money is what Central Banks issue and what Inflation erodes; The Gold Standard is its opposite and Bretton Woods the half-way house between them. The Mongol Empire's Yuan paper currency was the first empire-wide experiment, and the Ming Dynasty's collapse into silver is the cautionary sequel. Game Theory explains why a currency convention persists: nobody gains from defecting alone.",
    remember: [
      "Fiat money has no intrinsic value and no promise of redemption; it works through tax acceptance, legal tender law and shared expectation.",
      "Song China issued paper money in the 1020s; the Yuan made it the sole currency; the Ming destroyed theirs by overissue.",
      "The modern fiat era dates from 15 August 1971, when the dollar left gold.",
      "The real risk is not that money is 'unbacked' but that the issuer prints too much; hence independent central banks.",
    ],
    yearStart: 1024,
    yearEnd: 1971,
    tags: ["currency", "legal tender", "paper money", "jiaozi", "nixon shock", "chartalism", "money supply", "convertibility"],
    recall: [
      { prompt: "What three things hold up the value of fiat money?", answer: "The state accepts it for taxes, the law makes it legal tender for debts, and everyone expects everyone else to accept it." },
      { prompt: "Where and when did the first state paper money appear?", answer: "Song China, Sichuan, in the 1020s (the jiaozi)." },
      { prompt: "What event began the modern fiat era?", answer: "Nixon's suspension of the dollar's gold convertibility on 15 August 1971." },
      { prompt: "What is the right question to ask of any money?", answer: "Not what it is made of, but who can make more of it and what stops them." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "gold-standard",
    kind: "concept",
    domain: "economics",
    title: "The Gold Standard",
    subtitle: "Money fixed to a weight of metal, and what that fixed in turn",
    summary:
      "Under a gold standard a currency is defined as a fixed weight of gold and convertible into it on demand, which ties exchange rates together, limits how much money a state can create and, in a downturn, forces deflation rather than devaluation. Britain adopted it formally in 1821, most of the world by the 1870s, and it broke for good in the 1930s.",
    what:
      "Britain drifted onto gold by accident after Isaac Newton, as Master of the Mint, set a silver price for the guinea in 1717 that overvalued gold, so silver drained abroad. Convertibility was suspended during the Napoleonic wars (1797–1821) and restored by the Resumption Act at the old parity, at the cost of a sharp deflation. Germany went to gold with its French indemnity in 1871–73, the United States effectively with the Coinage Act of 1873 and formally in 1900, and by 1900 the classical gold standard linked most of the trading world.\n\nThe mechanics were simple and the discipline severe. A country that imported more than it exported lost gold; the loss shrank its money supply, lowered its prices, and restored its competitiveness. David Hume had described this price-specie flow in 1752. In practice central banks smoothed it with interest rates, and the Bank of England, holding a thin reserve, ran the system by raising Bank Rate when gold left.\n\nThe standard did not survive the First World War. Britain returned in 1925 at the pre-war parity, which Keynes attacked as overvaluing the pound by ten per cent, and left in September 1931. The United States devalued from 20.67 to 35 dollars an ounce in 1934. Barry Eichengreen's Golden Fetters (1992) showed that countries recovered from the Depression roughly in the order they abandoned gold.",
    why:
      "The gold standard is the best-documented case of a rule chosen precisely because it removes discretion, and of what removing discretion costs. It gave a century of stable exchange rates and low long-run inflation, and it turned every recession into a test of whether a government would let wages fall rather than the currency. People who want money 'backed' by something should know what the backing did in 1931. People who trust discretion should know why the rule had such a following.",
    before:
      "Bimetallism, coin in both silver and gold at a fixed legal ratio, was the norm in the eighteenth century and kept breaking as market ratios moved. Silver was the money of ordinary transactions and of the trade with Asia. The choice of gold over silver in the 1870s was partly Britain's example, partly the discoveries in California and Australia, and partly the decision of Germany to sell its silver, which crashed the price and pushed others to follow.",
    after:
      "Bretton Woods (1944) kept a gold link only for the dollar, at 35 dollars an ounce for foreign central banks; that link ended in 1971. Since then gold has been an asset, not a monetary base. The standard's memory persists in the argument for rules over discretion, in inflation targets that try to supply the anchor without the metal, and in the euro, which gives its members the exchange-rate rigidity of gold without a metal to blame.",
    connects:
      "The Gold Standard is the counterpart to Fiat Money and the predecessor of Bretton Woods. Central Banks under it were rate-setters defending a parity, not managers of Inflation. Napoleon Bonaparte's wars caused the 1797 suspension that shaped the British debate. The 1930s race to devalue is a Prisoner's Dilemma in monetary form, and the reason 1944's designers wanted rules.",
    remember: [
      "Britain: de facto gold from 1717 (Newton's ratio), formal from 1821; most of the world by the 1870s; Britain left in September 1931.",
      "Mechanism: trade deficit, gold outflow, smaller money supply, lower prices, restored balance (Hume's price-specie flow).",
      "A gold standard exchanges monetary discretion for fixed rates; recessions become deflations.",
      "Britain's 1925 return at the old parity was Keynes's 'Economic Consequences of Mr Churchill'.",
      "Eichengreen: countries recovered from the Depression in roughly the order they left gold.",
    ],
    yearStart: 1821,
    yearEnd: 1971,
    tags: ["gold", "convertibility", "fixed exchange rates", "deflation", "bimetallism", "price-specie flow", "great depression", "golden fetters"],
    recall: [
      { prompt: "Describe the adjustment mechanism of the classical gold standard.", answer: "A country running a trade deficit lost gold, its money supply and prices fell, its goods became cheaper abroad, and the deficit closed; Hume's price-specie flow mechanism." },
      { prompt: "Why did Keynes attack Britain's return to gold in 1925?", answer: "It restored the pre-war parity, which overvalued the pound by around ten per cent and required wage cuts and unemployment to make British exports competitive." },
      { prompt: "What did Eichengreen's Golden Fetters show?", answer: "That countries recovered from the Great Depression roughly in the order in which they abandoned the gold standard." },
      { prompt: "When did Britain finally leave gold?", answer: "September 1931." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "game-theory",
    kind: "concept",
    domain: "economics",
    title: "Game Theory",
    subtitle: "The mathematics of decisions whose outcome depends on what others decide",
    summary:
      "Game theory studies situations in which each participant's best choice depends on the choices of the others. Founded as a discipline by von Neumann and Morgenstern in 1944 and given its central solution concept by John Nash in 1950, it now underlies auction design, arms control, evolutionary biology and much of microeconomics.",
    what:
      "A game, in this sense, has players, strategies available to each, and payoffs that depend on everyone's choices together. The point is interaction: chess is a game, and so is a wage negotiation, a bidding war, a nuclear standoff or two shops deciding whether to cut prices. What makes the analysis hard is that each player reasons about the others' reasoning about them.\n\nJohn von Neumann proved in 1928 that every two-player zero-sum game has a value and an optimal mixed strategy, the minimax theorem. With the economist Oskar Morgenstern he published Theory of Games and Economic Behavior in 1944, which set out the framework and, along the way, the theory of expected utility. John Nash's 1950 thesis supplied the tool most used since: a Nash equilibrium is a set of strategies where nobody can gain by changing theirs alone. Every finite game has at least one, possibly in mixed strategies. Thomas Schelling's The Strategy of Conflict (1960) added the ideas that rescued the theory from pure calculation: focal points, credible commitment, and the value of limiting one's own options.\n\nThe theory assumes rational players with known payoffs, and experiments show people deviate in systematic ways, punishing unfairness at a cost to themselves, for instance. Its lasting use is less as a predictor than as a discipline: write down who chooses, what they know, and what they want, before guessing what they will do.",
    why:
      "Most reasoning errors in social situations come from treating other people as weather rather than as players. Game theory forces the question 'what is it in their interest to do, given what they think I will do?' and shows that some bad outcomes are not the result of malice or stupidity but of structure. It also explains why commitment, reputation and the ability to say 'I cannot' are strategic assets.",
    before:
      "Strategic reasoning is ancient; Thucydides and Sun Tzu are full of it. Formal precursors are thin: Cournot's 1838 duopoly analysis found what is now recognised as a Nash equilibrium, Zermelo proved in 1913 that chess is determined, and Émile Borel wrote on mixed strategies in the 1920s. Economics before 1944 mostly assumed markets large enough that no individual's choice mattered, which made strategy invisible.",
    after:
      "RAND applied the theory to nuclear strategy in the 1950s, with mixed results and a lasting reputation. John Maynard Smith imported it into biology in 1973 as the evolutionarily stable strategy. Auction theory, from Vickrey (1961) to Milgrom and Wilson, designed the spectrum auctions that began in 1994 and have since raised hundreds of billions. Nash, Harsanyi and Selten shared the 1994 Nobel prize; Schelling and Aumann followed in 2005. Mechanism design, the reverse problem of building rules that make honest behaviour the equilibrium, is now standard in market and policy design.",
    connects:
      "The Prisoner's Dilemma is the theory's most famous game and the English Auction one of its best-solved applications. Central Banks learned from it that credibility beats discretion; the collapse of Bretton Woods was a coordination game every dollar holder wanted to exit first. Containerization's fight over box sizes was a standards game, and Diplomatic Immunity survives as an iterated bargain between states.",
    remember: [
      "A game has players, strategies and interdependent payoffs; the analysis is about reasoning about others' reasoning.",
      "Von Neumann's minimax theorem (1928); von Neumann and Morgenstern's book (1944); Nash equilibrium (1950).",
      "Nash equilibrium: no player can gain by changing strategy alone. Every finite game has one.",
      "Schelling: focal points and credible commitment; being unable to back down can be an advantage.",
      "The theory's practical value is as a checklist: who chooses, what they know, what they want.",
    ],
    yearStart: 1944,
    tags: ["strategy", "nash equilibrium", "von neumann", "schelling", "auctions", "mechanism design", "rational choice", "commitment"],
    recall: [
      { prompt: "Define a Nash equilibrium.", answer: "A set of strategies, one per player, such that no player can improve their payoff by changing their own strategy while the others keep theirs." },
      { prompt: "What did Schelling add to game theory in 1960?", answer: "Focal points (solutions people converge on without communication), credible commitment, and the insight that limiting your own options can strengthen your position." },
      { prompt: "Who founded game theory as a discipline, and with what book?", answer: "John von Neumann and Oskar Morgenstern, Theory of Games and Economic Behavior (1944)." },
      { prompt: "What is the main assumption that experiments have challenged?", answer: "That players are rational maximisers with known payoffs; people systematically punish unfairness at their own cost and cooperate more than the theory predicts." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "prisoners-dilemma",
    kind: "concept",
    domain: "economics",
    title: "The Prisoner's Dilemma",
    subtitle: "Two rational players, one obvious cooperation, and why they miss it",
    summary:
      "In the Prisoner's Dilemma each of two players does better by defecting whatever the other does, yet both are worse off if both defect than if both had cooperated. Devised at RAND in 1950, it is the standard model for arms races, cartels, overfishing and every situation where individual incentive and collective interest point in different directions.",
    what:
      "Merrill Flood and Melvin Dresher ran the first version as an experiment at the RAND Corporation in January 1950; Albert Tucker gave it the story and the name a few months later. Two suspects are held separately. If both stay silent, each serves a year. If one confesses and the other stays silent, the confessor walks free and the other serves ten. If both confess, each serves five. Whatever the other does, confessing is better for you; so both confess, and both serve five years when they could have served one.\n\nThe structure, not the story, is what matters. Defection is a dominant strategy, mutual defection is the only Nash equilibrium, and it is worse for everyone than mutual cooperation. That pattern recurs wherever the benefit of cooperating is shared and the benefit of cheating is private: arms races, price wars between cartel members, overfishing, tax evasion, carbon emissions.\n\nThe one-shot game is bleak; the repeated game is not. Robert Axelrod's tournaments of 1980 invited strategies to play each other over many rounds. The winner, submitted by Anatol Rapoport, was Tit for Tat: cooperate first, then copy the other player's last move. Cooperation can sustain itself when players expect to meet again, can observe each other, and value the future, what Axelrod called the shadow of the future.",
    why:
      "The dilemma explains a class of failures that are not anyone's fault. Once you can recognise the structure, you stop looking for villains and start looking for the conditions that let cooperation survive: repetition, visibility, enforcement, or a change in the payoffs. The equally useful skill is noticing when a situation is not a Prisoner's Dilemma at all, since people invoke it for any conflict, including many where cooperation is already the dominant strategy.",
    before:
      "Hobbes's state of nature and Rousseau's stag hunt are earlier statements of the problem, and Hume's example of two farmers who fail to help each other with the harvest is nearly the game. What was missing was the matrix: a way to state the payoffs precisely enough to see that the outcome followed from the structure and not from bad character.",
    after:
      "The dilemma became the workhorse of political science, evolutionary biology (reciprocal altruism, Trivers 1971) and the study of institutions. Elinor Ostrom's fieldwork, rewarded with the 2009 Nobel prize, showed that real communities solve commons dilemmas without privatisation or a central state, through monitoring and graduated sanctions. Climate negotiations are the largest live instance: every country's emissions cut is a public good, and the shadow of the future is long but faint.",
    connects:
      "The Prisoner's Dilemma is the central example of Game Theory. The 1930s race to devalue under The Gold Standard was one instance and Bretton Woods was an attempt to write rules for it. Diplomatic Immunity is an iterated game states have played successfully for centuries. Central Banks' fight with Inflation includes a version between a policymaker tempted to surprise the public and a public that expects to be surprised.",
    remember: [
      "Flood and Dresher at RAND, January 1950; Tucker's prison story and name later that year.",
      "Defection dominates whatever the other does, yet mutual defection is worse for both than mutual cooperation.",
      "Repeated play changes everything: Tit for Tat won Axelrod's 1980 tournaments; the shadow of the future sustains cooperation.",
      "Check the payoffs before invoking it; many conflicts are not Prisoner's Dilemmas.",
    ],
    yearStart: 1950,
    tags: ["cooperation", "defection", "tit for tat", "axelrod", "rand", "collective action", "commons", "arms race"],
    recall: [
      { prompt: "What makes a situation a Prisoner's Dilemma rather than just a conflict?", answer: "Each player has a dominant strategy to defect, yet mutual defection leaves both worse off than mutual cooperation would." },
      { prompt: "What strategy won Axelrod's tournaments, and how does it work?", answer: "Tit for Tat, submitted by Anatol Rapoport: cooperate on the first move, then copy whatever the other player did last." },
      { prompt: "Which conditions allow cooperation to survive in a repeated dilemma?", answer: "Players expect to meet again, can observe each other's moves, and value future payoffs enough (the shadow of the future)." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "containerization",
    kind: "technology",
    domain: "business",
    title: "Containerization",
    subtitle: "A steel box of standard size, and the collapse of the cost of moving things",
    summary:
      "Containerization is the carriage of goods in sealed, standardised steel boxes that move between ship, train and lorry without being unpacked. Begun commercially by Malcom McLean in 1956 and standardised internationally by 1970, it cut the cost of loading cargo by more than an order of magnitude and made distant factories cheaper than near ones.",
    what:
      "On 26 April 1956 a converted tanker, the Ideal-X, sailed from Newark to Houston carrying 58 aluminium boxes on its deck. Its owner, Malcom McLean, was a trucking man who had noticed that the expensive part of shipping was not the sea voyage but the days a ship spent at the quay while gangs of longshoremen handled every sack and crate by hand. His own estimate, later repeated by Marc Levinson, was that break-bulk loading cost 5.86 dollars a ton and container loading 16 cents.\n\nThe box itself was trivial; the system was not. It needed cranes, chassis, reinforced decks, a twistlock corner fitting so that any crane could lift any box, and above all agreement on dimensions. McLean used 35-foot boxes, Matson on the Pacific used 24-foot, and railways had their own. The International Organization for Standardization fixed the 20- and 40-foot lengths between 1968 and 1970, after a fight in which McLean released his patents to secure the outcome. The Vietnam War, with the US Army desperate to unclog its ports, gave the system its first large-scale proof.\n\nThe consequences ran through everything. Ports moved from city centres to deep-water sites with land for stacking: London's docks closed and Felixstowe grew; Rotterdam, Singapore and later Shanghai became the great hubs. Dock labour fell by around ninety per cent. A twenty-foot equivalent unit, the TEU, became the unit in which world trade is counted.",
    why:
      "Containerization is the case that shows how a change in transaction cost, not in what is produced, can rearrange geography. Once shipping was nearly free per unit, a factory could be anywhere; supply chains lengthened, inventory was replaced by scheduling, and manufacturing moved to wherever labour was cheapest. A 2016 study by Bernhofen, El-Sahli and Kneller estimated that containerization did more to increase trade among developed countries than tariff reductions did. That is a large claim for a box.",
    before:
      "Break-bulk shipping meant cargo in sacks, barrels, crates and bales, loaded piece by piece by dock gangs, pilfered routinely and damaged often. A transatlantic cargo ship might spend as long in port as at sea. Freight costs made up a substantial share of the price of anything traded far from where it was made, and manufacturing clustered near ports and raw materials for that reason.",
    after:
      "Ships grew from a few hundred TEU to over 24,000. Just-in-time manufacturing became possible and then compulsory. The blocking of the Suez Canal by the Ever Given in March 2021, and the port queues of 2021–22, showed the system's fragility: cheap, fast and predictable shipping had become a load-bearing assumption of the world economy. Dubai's Jebel Ali and Singapore's PSA are among the largest operators; the ports of a city are now a business line as much as a place.",
    connects:
      "Containerization belongs with The Printing Press and Double-Entry Bookkeeping: standardisations that cut the cost of a routine act and rearranged what was downstream. It depends on the Suez Canal for the Asia–Europe route and built Dubai's Jebel Ali. The argument over box sizes was a coordination problem of the kind Game Theory studies. It ended the maritime logic that had made the Venetian Republic and the Hanseatic League.",
    remember: [
      "Ideal-X, 26 April 1956, Newark to Houston, 58 boxes; Malcom McLean was a trucker, not a shipowner.",
      "The cost that mattered was time at the quay, not time at sea: McLean's figures were 5.86 dollars a ton break-bulk versus 16 cents containerised.",
      "ISO fixed 20- and 40-foot standards in 1968–70; the twistlock corner fitting made the box universal.",
      "Ports moved out of cities, dock labour fell by about ninety per cent, and the TEU became the unit of world trade.",
      "Bernhofen et al. (2016): the container may have done more for trade among rich countries than tariff cuts.",
    ],
    yearStart: 1956,
    yearEnd: 1970,
    location: { lat: 40.69, lon: -74.15, country: "United States" },
    tags: ["shipping", "logistics", "mclean", "supply chain", "ports", "standardisation", "trade", "teu"],
    recall: [
      { prompt: "What did Malcom McLean see that shipowners had not?", answer: "That the expensive part of shipping was the days a ship spent at the quay while cargo was handled piece by piece, not the voyage itself." },
      { prompt: "When and where did the first commercial container voyage take place?", answer: "26 April 1956, the Ideal-X from Newark to Houston, carrying 58 boxes." },
      { prompt: "Why did standardising the box's dimensions matter so much?", answer: "Without a common size and corner fitting, cranes, chassis, ships and railways could not be built to handle any box from any carrier; the network effects depended on agreement." },
      { prompt: "Name two consequences of containerization for cities.", answer: "Old city-centre docks closed as ports moved to deep-water sites with stacking room, and dock employment fell by around ninety per cent." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "double-entry-bookkeeping",
    kind: "technology",
    domain: "business",
    title: "Double-Entry Bookkeeping",
    subtitle: "Every transaction written twice, so that the books can tell you when you are wrong",
    summary:
      "Double-entry bookkeeping records every transaction as a debit in one account and an equal credit in another, so that the totals must balance and an error announces itself. Developed by Italian merchants around 1300 and codified in print by Luca Pacioli in 1494, it is the grammar in which every business since has described itself.",
    what:
      "The rule is that each transaction touches at least two accounts by equal amounts. Buy stock for cash: the stock account rises, the cash account falls. Borrow: cash rises, and so does a liability. Because every entry has an equal and opposite partner, the sum of all debits always equals the sum of all credits, and a trial balance that does not balance proves that something has been miscopied. That is the technology: not a way of counting money but a way of detecting mistakes.\n\nThe surviving evidence puts its origin among Tuscan and Genoese merchants. Fragments of a Florentine banker's ledger of 1299–1300, the Farolfi accounts kept at Salon in Provence, show the method nearly complete; the Genoese commune's accounts of 1340 are the earliest fully double-entry set. By the fifteenth century it was the 'Venetian method', taught in the abacus schools. Luca Pacioli, a Franciscan friar and mathematician who had lived in a Venetian merchant's house, included a treatise on it in his Summa de arithmetica, printed in Venice in 1494: the first description in print, and the reason his name is attached to something he did not invent.\n\nThe method's real product is the balance sheet and the profit-and-loss account, which make it possible to say, at a date, what a business owns, owes, and has earned, separately from what its owner happens to have in his pocket.",
    why:
      "Double entry is worth understanding as an instance of a design principle: build redundancy into a record so that errors surface as inconsistencies. The same principle appears in checksums, in scientific replication and in cross-examining witnesses. It is also the first technology that made an enterprise an abstraction, an entity with its own accounts that could be valued, sold and audited. Everything from the joint-stock company to the quarterly earnings call follows from that.",
    before:
      "Merchants kept single-entry records: lists of debts owed and owing, a cash book, memoranda. These told you who owed what but could not tell you whether the business as a whole was gaining or losing, and offered no internal check. Roman and medieval estate accounts, however detailed, were stewardship records, meant to prove that a bailiff had not stolen, not to measure profit.",
    after:
      "The method spread north with printed manuals, reaching Antwerp and London in the sixteenth century, though the Hanseatic merchants of the Baltic adopted it late. The Dutch East India Company's permanent capital and tradeable shares would have been unauditable without it. Werner Sombart argued in 1902 that double entry made capitalism possible by making capital calculable; Basil Yamey and later historians have replied that most early modern firms kept sloppy books and made decisions without them. The causation is contested; the correlation is not.",
    connects:
      "Double-Entry Bookkeeping spread by The Printing Press and was born in the Venetian Republic's commercial world. The Dutch East India Company depended on it; Central Banks and the whole apparatus of modern finance are unimaginable without it. It sits with Containerization as a standardisation whose payoff was in what it made checkable. The Hanseatic League's slowness to adopt it is one small marker of why the north's commercial lead passed to Amsterdam.",
    remember: [
      "Every transaction is a debit and an equal credit; total debits always equal total credits, so an imbalance proves an error.",
      "Origins among Tuscan and Genoese merchants c. 1300 (Farolfi ledger 1299–1300; Genoa 1340); the 'Venetian method' by the 1400s.",
      "Pacioli's Summa (Venice, 1494) was the first printed account; he codified, he did not invent.",
      "The output is the balance sheet and profit-and-loss: a business as an entity separate from its owner.",
      "Sombart's claim that it created capitalism is contested; Yamey showed most early firms decided without their books.",
    ],
    yearStart: 1300,
    yearEnd: 1494,
    location: { lat: 45.44, lon: 12.33, country: "Italy" },
    tags: ["accounting", "pacioli", "ledger", "debit and credit", "balance sheet", "venice", "merchants", "audit"],
    recall: [
      { prompt: "What is the core rule of double-entry bookkeeping, and what does it buy you?", answer: "Each transaction is recorded as a debit in one account and an equal credit in another; because totals must balance, a trial balance that fails to balance proves an error exists." },
      { prompt: "Who was Luca Pacioli, and what was his contribution?", answer: "A Franciscan friar and mathematician whose Summa de arithmetica (Venice, 1494) was the first printed description of the Venetian method; he codified an existing practice." },
      { prompt: "What is the Sombart thesis and its standard objection?", answer: "Sombart argued that double entry made capitalism possible by making capital calculable; Yamey and others replied that most early modern firms kept poor books and did not use them for decisions." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "dutch-east-india-company",
    kind: "institution",
    domain: "business",
    title: "The Dutch East India Company",
    subtitle: "The first company with permanent capital and tradeable shares, and the first to run an empire",
    summary:
      "The Vereenigde Oostindische Compagnie (VOC), chartered by the Dutch States General in 1602 with a monopoly on trade east of the Cape of Good Hope, was the first joint-stock company with permanent capital and freely traded shares. It waged war, held territory and ran the Asian spice trade for two centuries before going bankrupt in 1799.",
    what:
      "The charter of 20 March 1602 merged six competing Dutch companies trading to the East Indies into one, with a state monopoly and the powers of a state: to make treaties, build forts, raise armies and coin money. It raised 6.4 million guilders from about 1,800 investors, and, unlike the voyage-by-voyage ventures before it, the capital was permanent. Investors who wanted out sold their shares to someone else, which is why Amsterdam's exchange, built in 1611, became the first modern stock market. Seventeen directors, the Heeren XVII, ran it from the Netherlands; a Governor-General ran Asia from Batavia, founded on the ruins of Jayakarta in 1619 by Jan Pieterszoon Coen.\n\nThe business was spices. Coen's conquest of the Banda Islands in 1621, in which most of the population was killed or enslaved to secure the nutmeg monopoly, shows what the monopoly cost. The VOC took Malacca from the Portuguese in 1641, held the only European trading post in Japan at Dejima from the same year, ruled coastal Ceylon and planted the Cape Colony in 1652 as a refreshment station.\n\nOver two centuries the company sent roughly a million Europeans to Asia on nearly five thousand voyages. Its dividends averaged around 18 per cent for much of the seventeenth century. Corruption, the cost of war, and the rise of tea and textiles over spices wore it down; the Fourth Anglo-Dutch War (1780–84) broke it, and the state nationalised its debts on 31 December 1799.",
    why:
      "The VOC is the origin of a form: the corporation as a legal person with capital separate from its owners, shares that can change hands without the enterprise noticing, and directors who answer to shareholders they will never meet. It is also a warning about what happens when that form is given guns and a monopoly. Every debate about corporate power, from the East India Company's Bengal to platform companies today, rehearses arguments first had about the VOC.",
    before:
      "Portugal had reached India by sea in 1498 and ran the spice route as a royal monopoly for a century. Dutch merchants, cut off from Lisbon by the war with Spain, sent their own fleets from 1595; the profits of Cornelis de Houtman's voyages attracted so many competitors that prices in Asia rose and prices in Amsterdam fell. The 1602 charter was the state's answer to ruinous competition.",
    after:
      "The English East India Company copied the permanent-capital form in 1657 and outlasted its rival, conquering Bengal in 1757 and losing its charter only in 1858. The Dutch state inherited the VOC's territories, which became the Netherlands East Indies and, in 1949, Indonesia. Historians disagree about how to weigh the company's role as an engine of finance against its record as a colonial power; the Banda massacre and the slave trade at the Cape are now part of every account.",
    connects:
      "The Dutch East India Company depended on Double-Entry Bookkeeping to account to distant shareholders, and it displaced the overland Silk Road with a sea route the Venetian Republic could not match. It contrasts with the Hanseatic League's loose confederation and set the pattern for the joint-stock world of Central Banks and Coffeehouse exchanges. Its spice auctions in Amsterdam are early large-scale English Auctions, and its Taiwan colony was expelled by a Ming Dynasty loyalist in 1662.",
    remember: [
      "Chartered 20 March 1602; monopoly east of the Cape; powers to make war, treaties and forts.",
      "Permanent capital of 6.4 million guilders and tradeable shares; Amsterdam's exchange (1611) grew up to trade them.",
      "Batavia founded 1619 by Coen; Banda conquered 1621 for nutmeg, at the cost of most of its population.",
      "Dejima (Japan, 1641), Malacca (1641), Ceylon, Cape Colony (1652).",
      "Bankrupt after the Fourth Anglo-Dutch War; nationalised 31 December 1799.",
    ],
    yearStart: 1602,
    yearEnd: 1799,
    location: { lat: 52.37, lon: 4.9, country: "Netherlands" },
    tags: ["voc", "joint-stock company", "amsterdam", "spice trade", "batavia", "colonialism", "shares", "monopoly"],
    recall: [
      { prompt: "What two financial features made the VOC new in 1602?", answer: "Permanent capital that was not returned after each voyage, and shares that investors could sell to others, which created the Amsterdam exchange." },
      { prompt: "What happened at the Banda Islands in 1621, and why?", answer: "Jan Pieterszoon Coen conquered the islands to secure a nutmeg monopoly; most of the population was killed, expelled or enslaved." },
      { prompt: "Why did the VOC fail?", answer: "Corruption, the cost of wars and garrisons, the shift of demand from spices to tea and textiles, and the losses of the Fourth Anglo-Dutch War; the Dutch state took over its debts in 1799." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "english-auction",
    kind: "concept",
    domain: "business",
    title: "The English Auction",
    subtitle: "Ascending bids, one hammer, and the cleanest solved problem in market design",
    summary:
      "In an English auction bidders raise their bids openly until only one remains, who pays the last price. It is the oldest and most familiar auction form, the one used by Sotheby's and Christie's, and the one economists understand best: when bidders know their own values, bidding up to your value is the dominant strategy.",
    what:
      "The word comes from the Latin auctio, an increase, and the Romans held them for war booty, estates and, in 193 CE, the Empire itself, which the Praetorian Guard sold to Didius Julianus. The modern houses are younger than the form: Stockholms Auktionsverk (1674), Sotheby's (1744, as Samuel Baker's book sales), Christie's (1766). London's ships and cargoes were sold 'by the candle' at Lloyd's and Garraway's coffeehouses, bidding ending when an inch of candle guttered.\n\nThe economics were settled in a 1961 paper by William Vickrey. If each bidder privately knows what the item is worth to them, the English auction is strategically equivalent to a sealed-bid auction in which the winner pays the second-highest bid: in both, the honest strategy, stay in until the price reaches your value and then stop, is best regardless of what others do. The winner pays roughly the second-highest valuation. Vickrey also showed the revenue equivalence theorem: under those assumptions, English, Dutch, first-price and second-price auctions all yield the same expected revenue.\n\nThe assumptions matter. When the item has a common value that nobody knows precisely, an oil lease, a company, a spectrum licence, the winner is the bidder who overestimated most. Petroleum engineers named this the winner's curse in 1971. Open ascending bids help, because seeing rivals drop out is information, which is one reason spectrum auctions from 1994 onward were built on ascending designs.",
    why:
      "The English auction is a small, precise model of a large skill: deciding what something is worth to you before the pressure starts, and stopping there. The winner's curse is the general lesson that being the most optimistic person in a room is evidence you are wrong. And Vickrey's equivalence result is a reminder that mechanisms which look different can be identical in what they reward, a question worth asking of any set of rules.",
    before:
      "Prices were mostly set by haggling, guild rule or custom. Auctions existed for goods whose value was uncertain or whose owner had died, but with no theory: the format was chosen by habit. The Dutch flower auctions ran the other way, descending from a high price until someone shouted, which is fast and rewards nerve.",
    after:
      "Auction theory became the showcase of mechanism design. The 1994 US spectrum auctions designed by Milgrom, Wilson and McAfee, and the 3G auctions in Britain in 2000 that raised 22.5 billion pounds, applied it at scale; Milgrom and Wilson received the 2020 Nobel prize. Online, eBay's proxy bidding is a Vickrey auction in disguise, and the advertising auctions that fund search engines run billions of second-price and generalised variants a day. Art sales meanwhile reached prices, 450 million dollars for the Salvator Mundi in 2017, that say more about scarcity and signalling than about value.",
    connects:
      "The English Auction is Game Theory applied to a mechanism. Its London form grew up in Coffeehouses, and the Dutch East India Company's spice sales were among its first industrial uses. The winner's curse is a failure to reason with Bayes' Theorem about what winning implies. The market for Impressionism was made and nearly unmade at auction.",
    remember: [
      "Ascending open bids; the last bidder standing pays the last price; the oldest and most familiar auction form.",
      "Vickrey (1961): with private values, bidding up to your own value is dominant; the winner pays about the second-highest value.",
      "Revenue equivalence: under the same assumptions, English, Dutch, first- and second-price auctions yield the same expected revenue.",
      "Winner's curse (1971): with common values, the winner is the one who overestimated most; condition on winning.",
      "Sotheby's 1744, Christie's 1766; spectrum auctions from 1994; Milgrom and Wilson Nobel 2020.",
    ],
    tags: ["auctions", "vickrey", "bidding", "winner's curse", "mechanism design", "sotheby's", "christie's", "spectrum auction"],
    recall: [
      { prompt: "What is the dominant strategy in an English auction with private values?", answer: "Stay in until the price reaches what the item is worth to you, then stop; this is best regardless of what other bidders do." },
      { prompt: "Explain the winner's curse.", answer: "When bidders are estimating a common but uncertain value, the winner tends to be the one who overestimated most; a rational bidder should shade their bid to account for the fact that winning implies being the most optimistic." },
      { prompt: "What does the revenue equivalence theorem say?", answer: "Under private values and standard assumptions, English, Dutch, first-price and second-price sealed auctions all produce the same expected revenue for the seller." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "diplomatic-immunity",
    kind: "concept",
    domain: "law",
    title: "Diplomatic Immunity",
    subtitle: "Why the envoy cannot be arrested, and what each state gets for agreeing",
    summary:
      "Diplomatic immunity exempts accredited envoys and their premises from the host state's arrest, prosecution and search. Practised since antiquity and codified in the Vienna Convention on Diplomatic Relations of 1961, it rests on reciprocity: each state respects foreign envoys so that its own may function abroad.",
    what:
      "The Vienna Convention of 1961, ratified by nearly every state, is the current text. Article 22 makes embassy premises inviolable; the host's police may not enter without consent. Article 29 makes the diplomat's person inviolable. Article 31 exempts diplomats from criminal jurisdiction entirely and from most civil jurisdiction. The host state's remedies are Article 9, declaring a diplomat persona non grata and expelling them, and asking the sending state to waive immunity, which it may decline. Immunity belongs to the sending state, not the individual.\n\nThe justification has shifted. Early modern jurists spoke of the ambassador as the person of the sovereign, and of the embassy as a piece of foreign soil; the Convention's preamble rejects both in favour of functional necessity, the plain fact that an envoy who could be arrested could not negotiate. Resident embassies, as opposed to occasional missions, began among the Italian states in the 1450s and spread with the Venetian practice of permanent ambassadors and written reports. England's Diplomatic Privileges Act of 1708 followed the arrest of the Russian ambassador for debt, an incident Peter the Great treated as a casus belli.\n\nThe hard cases test the rule. In 1984 shots from inside the Libyan embassy in London killed a police officer, Yvonne Fletcher; Britain expelled the staff and could do nothing more. Iran's seizure of the US embassy in 1979 was condemned by the International Court of Justice in 1980 as a breach of the most basic norm of the system.",
    why:
      "Immunity is a working example of a rule that is bad in the individual case and good in the aggregate. It is sustained not by enforcement but by repetition: every state is both host and sender, and a state that abuses foreign envoys today has its own envoys at risk tomorrow. It is worth studying as a model of how cooperation survives among parties with no authority above them, and as a caution that such rules only hold while everyone expects them to.",
    before:
      "Heralds were sacred in Greece and the ancient Near East, and the killing of envoys was treated as sacrilege. The Mongols enforced envoy safety with unusual severity: the governor of Otrar's murder of Genghis Khan's trade mission in 1218 brought the destruction of the Khwarazmian empire. Medieval Europe relied on safe-conducts issued case by case; the practice was real but the rule was unwritten.",
    after:
      "The Convention has held with remarkable consistency, partly because states with the most to lose from its breakdown are the most powerful. Abuses, diplomatic bags used for smuggling, parking fines unpaid in New York, and occasional serious crimes waived or not, are treated as the cost of the system. Consular officers received a narrower immunity in 1963. The Ottoman habit of imprisoning an enemy's ambassador in the Seven Towers at the outbreak of war, last practised in 1798, is the counterexample that shows what the rule replaced.",
    connects:
      "Diplomatic Immunity is an iterated Prisoner's Dilemma solved: cooperation sustained by the shadow of the future. It grew from the Venetian Republic's resident embassies and the state system associated with the Peace of Westphalia. The Mongol Empire's reaction at Otrar shows the norm enforced by other means; The Odyssey's xenia, the sacred duty to a guest, is its literary ancestor. The Ottoman Empire's Seven Towers practice is the contrast.",
    remember: [
      "Vienna Convention on Diplomatic Relations, 1961: premises inviolable (Art. 22), person inviolable (Art. 29), immune from criminal jurisdiction (Art. 31).",
      "The host's remedies are expulsion (persona non grata) or a waiver requested from the sending state; the immunity belongs to the state, not the diplomat.",
      "The modern justification is functional necessity, not extraterritoriality.",
      "Resident embassies began among Italian states in the 1450s; Britain's 1708 Act followed the arrest of the Russian ambassador.",
      "The rule is sustained by reciprocity, since every state is both host and sender.",
    ],
    yearStart: 1708,
    yearEnd: 1961,
    tags: ["diplomacy", "vienna convention", "embassy", "envoy", "international law", "reciprocity", "persona non grata", "inviolability"],
    recall: [
      { prompt: "What can a host state do about a diplomat who commits a crime?", answer: "Declare them persona non grata and expel them, or ask the sending state to waive immunity; it cannot prosecute unless the waiver is granted." },
      { prompt: "What is the 'functional necessity' justification for immunity?", answer: "That an envoy who could be arrested or searched by the host could not carry out the job of representing their state, so immunity is needed for the function rather than as a personal privilege." },
      { prompt: "What sustains diplomatic immunity in the absence of a world enforcer?", answer: "Reciprocity: every state is both a host and a sender, so mistreating foreign envoys puts its own at risk." },
      { prompt: "Which treaty codifies diplomatic immunity, and when was it adopted?", answer: "The Vienna Convention on Diplomatic Relations, 1961." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "magna-carta",
    kind: "work",
    domain: "law",
    title: "Magna Carta",
    subtitle: "A failed peace treaty of 1215 that became, by reissue and myth, the idea that the ruler is under the law",
    summary:
      "Magna Carta is the charter King John granted his rebellious barons at Runnymede on 15 June 1215. Annulled within ten weeks, reissued in 1216, 1217 and 1225 and placed on the statute roll in 1297, it is mostly a list of feudal grievances, but two clauses on lawful judgment and the sale of justice became the founding text of constitutional government.",
    what:
      "By 1215 King John had lost Normandy, taxed England to pay for its recovery, quarrelled with the Pope and lost the confidence of much of his baronage. A group of northern barons rebelled, took London in May, and forced a settlement. The charter, sealed at Runnymede between Windsor and Staines, ran to sixty-three clauses in modern numbering. Most concern the specific abuses of the moment: relief payments on inheritance, wardship, widows forced to remarry, forest law, fish weirs on the Thames, the removal of foreign mercenaries.\n\nThree parts outlived the rest. Clause 12 required 'common counsel' for scutage and aids, a seed of the principle of taxation by consent. Clause 39 said no free man would be seized, imprisoned or dispossessed 'except by the lawful judgment of his peers or by the law of the land'; clause 40, 'to no one will we sell, to no one deny or delay right or justice'. Clause 61 set up a committee of twenty-five barons to enforce the charter by force if the king broke it, which no king could accept.\n\nPope Innocent III annulled the charter in August 1215 as extorted; civil war followed, and John died in October 1216. His son's regents reissued a shortened version to win support, and the 1225 text, granted by Henry III in return for a tax, is the one that became law. Four exemplars of 1215 survive: two in the British Library, one each at Lincoln and Salisbury.",
    why:
      "Magna Carta is the best case for studying how a document acquires a meaning its authors did not intend. In 1215 it was a baronial bargain that failed. In the 1620s Sir Edward Coke read it as an ancient constitution binding the Stuart kings, and it was Coke's reading that crossed to the American colonies and into due process. Learning to separate what a text said from what it came to mean is a skill that applies far beyond legal history.",
    before:
      "Coronation charters, beginning with Henry I's in 1100, had promised good government in general terms, and the Anglo-Saxon and Norman kings had ruled with counsel of the great men by custom. What was new in 1215 was specificity: a written list of what the king could not do, and a mechanism to enforce it. The immediate model was the settlement barons had imposed on kings elsewhere, and John's own record of arbitrary fines and hostages.",
    after:
      "The charter was confirmed dozens of times by later kings, usually when they wanted money. Clause 39 became the basis of habeas corpus and, through Coke and Blackstone, of the Fifth and Fourteenth Amendments' due process. Only three clauses of the 1225 text remain on the English statute book: the freedom of the Church, the liberties of London, and the lawful-judgment clause. The rest was repealed in the nineteenth and twentieth centuries. The Universal Declaration of Human Rights of 1948 was called by Eleanor Roosevelt an international Magna Carta, which shows the myth's reach.",
    connects:
      "Magna Carta's principle of taxation by consent runs, by a long road, to the parliamentary credit that founded the Bank of England, the model for Central Banks. Its seventeenth-century revival was a product of The Printing Press and a literate political public. It contrasts with the codified tradition of Napoleon Bonaparte's civil code, and shares with the Peace of Westphalia the fate of being a practical settlement later read as a founding principle.",
    remember: [
      "Sealed at Runnymede on 15 June 1215 by King John under baronial pressure; annulled by Innocent III in August; John died October 1216.",
      "Reissued 1216, 1217 and 1225; the 1225 text is the one that became statute (confirmed 1297).",
      "Clause 39 (lawful judgment of peers or the law of the land) and clause 40 (no sale, denial or delay of justice) are the enduring core.",
      "Most clauses concern feudal grievances; the constitutional reading was built by Coke in the 1620s.",
      "Four 1215 exemplars survive: British Library (two), Lincoln, Salisbury.",
    ],
    yearStart: 1215,
    yearEnd: 1297,
    location: { lat: 51.44, lon: -0.56, country: "United Kingdom" },
    tags: ["rule of law", "king john", "runnymede", "due process", "constitution", "barons", "coke", "habeas corpus"],
    recall: [
      { prompt: "What did clause 39 of the 1215 charter promise?", answer: "That no free man would be seized, imprisoned or dispossessed except by the lawful judgment of his peers or by the law of the land." },
      { prompt: "What happened to the charter within months of Runnymede?", answer: "Pope Innocent III annulled it in August 1215 as extorted under duress; civil war followed, and it was reissued in modified form after John's death in 1216." },
      { prompt: "Who turned Magna Carta into a constitutional document, and when?", answer: "Sir Edward Coke in the 1620s, who read it as an ancient constitution binding the Stuart kings; his reading passed to the American colonies." },
      { prompt: "Which version of the charter became English statute law?", answer: "The 1225 reissue by Henry III, confirmed on the statute roll in 1297." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "bayes-theorem",
    kind: "concept",
    domain: "science",
    title: "Bayes' Theorem",
    subtitle: "How much a piece of evidence should move you, stated as arithmetic",
    summary:
      "Bayes' theorem says that the probability of a hypothesis given some evidence equals the prior probability of the hypothesis, multiplied by how much more likely the evidence is if the hypothesis is true than otherwise. Published posthumously in 1763 and generalised by Laplace, it is the formal rule for updating belief.",
    what:
      "Thomas Bayes, a Presbyterian minister in Tunbridge Wells, left an essay that his friend Richard Price edited and read to the Royal Society in 1763. Pierre-Simon Laplace found the same result independently in 1774 and made it general. In modern notation: P(H | E) = P(E | H) × P(H) / P(E). The prior P(H) is how likely the hypothesis was before the evidence; the likelihood P(E | H) is how probable the evidence is if the hypothesis is true; the posterior P(H | E) is what you should believe afterwards.\n\nThe odds form is easier to use. Posterior odds equal prior odds multiplied by the likelihood ratio, the probability of the evidence under the hypothesis divided by its probability under the alternative. A likelihood ratio of 10 makes any hypothesis ten times more probable relative to its rival, whether it started at even odds or at one in a thousand. That is the whole discipline: evidence has a fixed strength, and where you end up depends on where you started.\n\nA screening test illustrates. If a disease affects one person in a thousand and a test is 99 per cent accurate both ways, a positive result gives a likelihood ratio of 99, and posterior odds of 99 to 999, about 9 per cent. Most people, including most physicians when surveyed, say 99 per cent. The difference is the prior. Bayesian methods were marginalised by Fisher's and Neyman's frequentist school for much of the twentieth century, were used quietly at Bletchley Park, and returned with computational methods in the 1990s.",
    why:
      "Bayes' theorem is the formal version of a habit every careful reasoner needs: separate the strength of the evidence from the plausibility of the claim, and combine them rather than letting either win outright. It exposes two symmetrical errors, ignoring the prior (being convinced by a striking clue about something rare) and ignoring the evidence (refusing to move when the likelihood ratio is large). Neither the number nor the formula matters as much as the discipline of asking both questions.",
    before:
      "Probability theory from Pascal and Fermat in the 1650s dealt with games of chance: known causes, unknown outcomes. The reverse problem, inferring causes from outcomes, had no method. Jacob Bernoulli's law of large numbers (1713) and de Moivre's normal approximation (1733) sharpened the forward direction; Bayes and Laplace opened the backward one, which is the direction in which most real questions run.",
    after:
      "Laplace used the theorem for astronomy and demography; nineteenth-century statisticians distrusted the arbitrariness of priors, and Fisher built an alternative on significance testing. Turing's team at Bletchley used Bayesian weights of evidence, measured in 'bans', to break Enigma settings. Since the 1990s Markov chain Monte Carlo methods have made Bayesian computation practical, and the approach now underlies spam filters, medical diagnosis, weather ensembles and much of machine learning. The frequentist-Bayesian argument is not over, but it has become a conversation.",
    connects:
      "Bayes' Theorem is the rule that the Base-Rate Fallacy violates and that Falsifiability, in Popper's hands, rejected in favour of a logic without degrees. The winner's curse in the English Auction is a failure to condition on what winning implies. Champollion's decipherment of the Rosetta Stone is a Bayesian process in prose: every cartouche that fits raises the odds.",
    remember: [
      "Posterior = prior × likelihood ratio, in odds form; evidence has a fixed strength, and the destination depends on the starting point.",
      "Bayes's essay published by Richard Price in 1763; Laplace's independent, general version in 1774.",
      "The screening-test case: a rare condition and a 99 per cent accurate test give a posterior near 9 per cent, not 99.",
      "Two symmetrical errors: ignoring the prior, and ignoring the evidence.",
      "Marginalised by frequentists in the twentieth century; revived by computation in the 1990s.",
    ],
    yearStart: 1763,
    tags: ["probability", "prior", "posterior", "likelihood ratio", "updating", "laplace", "conditional probability", "inference"],
    recall: [
      { prompt: "State Bayes' theorem in odds form.", answer: "Posterior odds equal prior odds multiplied by the likelihood ratio, where the likelihood ratio is the probability of the evidence if the hypothesis is true divided by its probability if the hypothesis is false." },
      { prompt: "A disease affects 1 in 1,000 people; a test is 99 per cent accurate both ways. Roughly what is the chance a positive result is a true positive?", answer: "About 9 per cent: prior odds 1 to 999, likelihood ratio 99, posterior odds 99 to 999." },
      { prompt: "What is the likelihood ratio of a piece of evidence?", answer: "How much more probable the evidence is under the hypothesis than under its alternative; it measures the strength of the evidence independently of the prior." },
      { prompt: "Who published Bayes's essay, and who generalised the result?", answer: "Richard Price published it in 1763; Pierre-Simon Laplace independently derived and generalised it from 1774." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "falsifiability",
    kind: "concept",
    domain: "philosophy",
    title: "Falsifiability",
    subtitle: "Popper's test: a claim is scientific if something could show it wrong",
    summary:
      "Karl Popper proposed in 1934 that what distinguishes a scientific theory is not that it can be confirmed but that it forbids something: it makes predictions that could turn out false. A theory compatible with every possible observation explains nothing. The criterion is contested in detail and indispensable in practice.",
    what:
      "Popper's problem, as a young man in 1919 Vienna, was that Marxist history, Freudian psychology and Adlerian psychology all seemed to explain everything, and their adherents took every event as confirmation. Einstein's theory of general relativity, by contrast, predicted that starlight passing the Sun would bend by a specific amount, and Eddington's eclipse expedition that year could have found otherwise. The difference was risk. In Logik der Forschung (1934; English 1959 as The Logic of Scientific Discovery) he made it the criterion of demarcation: a statement is scientific to the extent that it could be refuted by observation.\n\nBehind this is an asymmetry Hume had noticed. No number of white swans proves that all swans are white, but a single black one disproves it. Science, on Popper's account, does not accumulate confirmations; it proposes bold conjectures and tries to kill them, keeping those that survive. Corroboration is provisional, and 'proved' is not a word the method uses.\n\nThe standard objection, from Pierre Duhem and W. V. Quine, is that a prediction never follows from a theory alone but from the theory plus auxiliary assumptions about instruments, conditions and background. When Uranus misbehaved, astronomers did not abandon Newton; they postulated Neptune, and found it in 1846. When Mercury misbehaved, the same move, a planet Vulcan, failed, and Einstein won. Which response is right cannot be read off the logic; Imre Lakatos called the difference progressive versus degenerating research programmes.",
    why:
      "Falsifiability is the most useful single question to ask of a belief: what would change my mind? A claim that can absorb any outcome is not being tested; it is being decorated. The criterion is also a defence against your own cleverness, since the mind can rescue any theory with an extra assumption. The refinement is knowing when a rescue is legitimate, as Neptune was, and when it is the start of a slow retreat, as Vulcan was.",
    before:
      "The received account, from Bacon to the Vienna Circle, was inductive: science generalises from observations, and a theory is confirmed as instances pile up. The logical positivists around Popper in Vienna proposed verifiability as the test of meaning. Popper rejected both the induction and the test, and disliked being counted among them.",
    after:
      "Falsifiability entered the working vocabulary of scientists, who cite Popper more than any other philosopher. Thomas Kuhn's Structure of Scientific Revolutions (1962) argued that real science is mostly puzzle-solving within a paradigm and that anomalies are tolerated until a rival is ready, which fits history better than Popper's heroic picture. Courts have used falsifiability as one test of expert evidence, as in Daubert v. Merrell Dow (1993). String theory and some evolutionary-psychology claims are argued over precisely on whether they forbid anything.",
    connects:
      "Falsifiability contrasts with Bayes' Theorem, which treats confirmation as a matter of degree; many now hold that the two are compatible, with falsification the limiting case of a very small likelihood. Champollion's reading of the Rosetta Stone survived every new cartouche where Kircher's allegories could explain anything. The habit of stating what would refute a plan is the antidote to the Availability Heuristic and to confirmation bias generally.",
    remember: [
      "Popper, Logik der Forschung (1934): a theory is scientific to the extent that it forbids something and could be refuted.",
      "Asymmetry: no number of confirmations proves a universal claim; one counterexample refutes it.",
      "Einstein (a risky prediction, tested in 1919) versus Marx and Freud (compatible with anything) was his motivating contrast.",
      "Duhem–Quine: tests hit theory plus auxiliaries; Neptune was a legitimate rescue, Vulcan a failed one.",
      "The working question: what would change my mind?",
    ],
    yearStart: 1934,
    tags: ["popper", "demarcation", "scientific method", "refutation", "induction", "duhem-quine", "conjecture", "kuhn"],
    recall: [
      { prompt: "What is Popper's criterion of demarcation?", answer: "A statement is scientific to the extent that it makes predictions that could be refuted by observation; it must forbid something." },
      { prompt: "Why did Popper contrast Einstein with Marx and Freud?", answer: "Einstein's theory made a risky, specific prediction (the 1919 light-bending test) that could have failed, whereas Marxist and psychoanalytic theories seemed able to explain any outcome, so nothing could count against them." },
      { prompt: "What is the Duhem–Quine objection?", answer: "A prediction follows from a theory plus auxiliary assumptions, so a failed prediction does not tell you which part to reject; Neptune was a successful rescue of Newton, Vulcan a failed one." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "base-rate-fallacy",
    kind: "concept",
    domain: "psychology",
    title: "The Base-Rate Fallacy",
    subtitle: "Judging by how well the evidence fits, and forgetting how rare the thing is",
    summary:
      "The base-rate fallacy is the tendency to judge the probability of something by how well a specific description matches it, while ignoring how common it is in the first place. Documented by Kahneman and Tversky in 1973, it explains why positive test results, vivid profiles and striking coincidences are routinely overrated.",
    what:
      "Daniel Kahneman and Amos Tversky gave subjects a description of a man, Jack, drawn from a group said to be 70 per cent lawyers and 30 per cent engineers. Told that Jack liked mathematical puzzles and had no interest in politics, they judged him an engineer, and their judgment barely moved when the proportions were reversed. The description dominated; the base rate was ignored. A second study, the taxi problem, described a hit-and-run in a city where 85 per cent of cabs were green and 15 per cent blue, with a witness who identified colours correctly 80 per cent of the time and said blue. Most people answered 80 per cent; the correct posterior is about 41 per cent.\n\nThe pattern in medicine was shown by Casscells, Schoenberger and Grayboys in 1978. Staff and students at Harvard Medical School were asked about a disease with a prevalence of one in a thousand and a test with a 5 per cent false-positive rate; nearly half said a positive result meant a 95 per cent chance of disease. The answer is about 2 per cent.\n\nThe cause, on Kahneman and Tversky's account, is representativeness: we judge probability by similarity to a stereotype, and similarity carries no information about frequency. Gerd Gigerenzer showed that presenting the same problem as natural frequencies, 'of 1,000 people, one has the disease and about 50 healthy people test positive', largely cures it. The information was not missing; the format hid it.",
    why:
      "The fallacy is the single most common error in reading evidence, because the evidence is what is in front of you and the base rate is not. It matters for medical screening, security profiling, fraud detection, hiring, and every situation in which a match is offered as proof. The correction is a habit: before asking 'how well does this fit?', ask 'how many things of this kind are there?' Then the fit can do its proper, smaller work.",
    before:
      "Bayes and Laplace had stated the arithmetic two centuries earlier, and statisticians took it for granted that a prior mattered. What was not known was how systematically people fail at it. Before the 1970s, economics and decision theory assumed people reasoned approximately as the theory said; the heuristics-and-biases programme replaced that assumption with data.",
    after:
      "The heuristics-and-biases programme became a discipline, and Kahneman received the Nobel prize in economics in 2002. Base-rate arguments now shape screening guidelines, which weigh the harm of false positives in low-prevalence populations; evidence law, where a match probability without a base rate is recognised as misleading (the prosecutor's fallacy); and public debate about security screening, where a rare threat and an imperfect test guarantee that most alarms are false. The debate between Kahneman's and Gigerenzer's camps over whether the fallacy is a bias or a presentation effect continues.",
    connects:
      "The Base-Rate Fallacy is the failure Bayes' Theorem corrects, and a sibling of the Availability Heuristic in the same 1973–74 programme. In Inflation forecasting it appears as the reflex to read one vivid price as a trend. Any diagnosis, from a doctor's to a detective's, is a base-rate problem first and an evidence problem second.",
    remember: [
      "Judging by fit (representativeness) and ignoring frequency (the base rate); Kahneman and Tversky, 1973.",
      "Taxi problem: 85 per cent green, witness 80 per cent reliable, says blue; the answer is about 41 per cent, not 80.",
      "Harvard 1978: prevalence 1 in 1,000, 5 per cent false positives; a positive result means about 2 per cent, not 95.",
      "Natural frequencies ('of 1,000 people...') largely cure the error; the format matters.",
      "Habit: ask how common the thing is before asking how well the evidence fits.",
    ],
    yearStart: 1973,
    tags: ["base rate", "representativeness", "kahneman", "tversky", "prior probability", "false positive", "screening", "gigerenzer"],
    recall: [
      { prompt: "In the taxi problem (85 per cent green, 15 per cent blue, witness 80 per cent reliable, says blue), what is the chance the cab was blue?", answer: "About 41 per cent: 15 × 0.8 = 12 true blue identifications against 85 × 0.2 = 17 false ones; 12 / 29." },
      { prompt: "What did the 1978 Harvard Medical School study find?", answer: "Asked about a disease with prevalence 1 in 1,000 and a test with a 5 per cent false-positive rate, nearly half of respondents said a positive result meant 95 per cent probability of disease; the correct figure is about 2 per cent." },
      { prompt: "What presentation of the problem reduces the fallacy, according to Gigerenzer?", answer: "Natural frequencies: stating the numbers as counts out of a population rather than as percentages and conditional probabilities." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "availability-heuristic",
    kind: "concept",
    domain: "psychology",
    title: "The Availability Heuristic",
    subtitle: "Judging how common something is by how easily examples come to mind",
    summary:
      "The availability heuristic is the mental shortcut of estimating frequency or probability by how readily instances can be recalled. Named by Tversky and Kahneman in 1973, it is usually accurate, since common things are easy to recall, and predictably wrong when something is memorable for other reasons: recency, vividness, media coverage or personal involvement.",
    what:
      "Tversky and Kahneman's 1973 paper asked whether English has more words beginning with K or with K in third position. Most people said the former; the latter is about twice as common, but words are indexed in memory by their first letter, so those come to mind. Another study read subjects lists of names in which one sex was represented by more famous people; they judged that sex more numerous. Ease of recall was standing in for frequency.\n\nLichtenstein, Slovic and colleagues showed in 1978 that people overestimated deaths from tornadoes, floods and homicide and underestimated deaths from asthma, diabetes and stroke, and that the errors tracked newspaper coverage almost exactly. Diseases kill quietly; disasters make the front page. The same effect makes people fear flying more than driving, though in the months after September 2001 the shift from planes to cars is estimated to have cost around 1,500 additional road deaths in the United States, a figure from Gerd Gigerenzer that is disputed in size but not in direction.\n\nThe heuristic is not a defect in itself. Frequency really does make things easy to recall, and in an environment where your own experience is a fair sample, availability is a good guide. It fails when the sample is curated for you, by news editors, by algorithms, by the fact that survivors talk and casualties do not.",
    why:
      "Availability is the mechanism by which attention becomes belief. Whatever you have recently seen, read or feared will feel more probable than it is, and whatever is dull will feel rarer. The practical defence is to notice when an estimate is coming from ease of recall, and to ask where the examples came from. If the answer is 'the news', the estimate is about coverage, not the world.",
    before:
      "The idea that fear and imagination distort judgments of risk is old, but there was no experimental account of the mechanism, and decision theory assumed that people's probability estimates were unbiased if noisy. Herbert Simon's work on bounded rationality in the 1950s prepared the ground by arguing that people use shortcuts because they must.",
    after:
      "The heuristic became a standard tool in risk communication and public policy. Timur Kuran and Cass Sunstein described the availability cascade (1999): a story is repeated because it is vivid, becomes more available because it is repeated, and drives policy out of proportion to its base rate. Social media, which serves the most engaging items to the most people, is an availability engine at industrial scale. Kahneman's Thinking, Fast and Slow (2011) made the term common vocabulary.",
    connects:
      "The Availability Heuristic and the Base-Rate Fallacy are siblings from the same programme; one inflates the vivid evidence, the other neglects the dull prior. Inflation expectations track the prices people notice, which is availability at work in economics. Falsifiability's discipline of asking what would refute a belief is one antidote. Coffeehouses and newspapers were an early availability machine; the news has always decided what feels common.",
    remember: [
      "Frequency is judged by ease of recall; Tversky and Kahneman, 1973 (words beginning with K versus K in third position).",
      "Lichtenstein et al. 1978: judged causes of death tracked newspaper coverage, not mortality.",
      "It is a good heuristic when your experience is a fair sample, and a bad one when the sample is curated.",
      "Availability cascade (Kuran and Sunstein 1999): repetition makes a story feel probable, which drives more repetition.",
      "Ask where the examples came from before trusting how many come to mind.",
    ],
    yearStart: 1973,
    tags: ["availability", "heuristics and biases", "kahneman", "tversky", "risk perception", "vividness", "media", "recall"],
    recall: [
      { prompt: "What is the availability heuristic?", answer: "Estimating how frequent or probable something is by how easily examples of it come to mind." },
      { prompt: "What did Lichtenstein and colleagues find about judgments of causes of death?", answer: "People overestimated dramatic causes (tornadoes, homicide) and underestimated quiet ones (asthma, stroke), and the errors closely tracked the amount of newspaper coverage." },
      { prompt: "When is availability a reliable guide, and when not?", answer: "Reliable when your own experience is a fair sample of the world; unreliable when what you remember has been selected for vividness, recency or coverage." },
      { prompt: "What is an availability cascade?", answer: "A self-reinforcing cycle in which a vivid story is repeated, becomes more available, is judged more probable, and so is repeated further, driving belief and policy beyond what the base rate warrants (Kuran and Sunstein, 1999)." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "impressionism",
    kind: "movement",
    domain: "art",
    title: "Impressionism",
    subtitle: "Painting the light of a moment, outdoors, and selling it without the Salon",
    summary:
      "Impressionism was the movement of a group of Paris painters, Monet, Renoir, Pissarro, Degas, Morisot, Sisley and others, who from 1874 exhibited together outside the official Salon, painting modern life and landscape in broken, visible strokes that recorded the effect of light rather than the finish of the object.",
    what:
      "On 15 April 1874 a Société anonyme of painters opened an exhibition in the former studio of the photographer Nadar at 35 boulevard des Capucines. Among the works was Claude Monet's Impression, soleil levant, a view of Le Havre's harbour in orange and grey. The critic Louis Leroy mocked it in Le Charivari under the heading 'Exhibition of the Impressionists', and the name stuck. The group held eight exhibitions between 1874 and 1886, with a shifting membership that included Berthe Morisot from the first and Paul Cézanne and Gustave Caillebotte in several.\n\nThe method was to paint outdoors, quickly, in colour applied side by side rather than blended, so that the eye mixed it; to leave the surface visibly worked; and to take subjects from the present: railway stations, boating parties, boulevards, suburban gardens, dancers at rehearsal. Much of this was made possible by things outside art. Collapsible metal paint tubes (patented by John Goffe Rand in 1841) let painters work away from the studio; new synthetic pigments such as chromium yellow and cobalt violet supplied the colours; the railway from the Gare Saint-Lazare put Argenteuil and the Normandy coast an hour away.\n\nThe Salon, the annual state-run exhibition with its jury, had rejected most of them repeatedly; the Salon des Refusés of 1863, where Manet's Déjeuner sur l'herbe scandalised Paris, was the first sign that an alternative could draw a crowd. The dealer Paul Durand-Ruel bought their work through years of ridicule and found buyers in America in 1886.",
    why:
      "Impressionism is a case study in how a group changes the rules of a field: not by persuading the jury but by building a parallel institution, an exhibition and a dealer, and letting the public decide. It is also a reminder that a style has material conditions. Tubes, pigments and trains did not cause the movement, but without them it would have been a different one. When something new appears, ask what recently became cheap.",
    before:
      "French painting was governed by the Académie's hierarchy of genres, with history painting at the top and landscape near the bottom, and by a technique of smooth finish and invisible brushwork. The Barbizon painters had been working outdoors since the 1830s, Courbet had insisted on the ordinary as subject, and Manet had painted modern life in flat, bright planes. Photography, from 1839, had taken over the job of exact record.",
    after:
      "Neo-Impressionism (Seurat's dots), Post-Impressionism (Cézanne, Van Gogh, Gauguin) and eventually Cubism defined themselves against and through it. The market Durand-Ruel built made Impressionist paintings the most expensive objects of the twentieth-century art trade, which sits oddly with their origin as rejected work. The bigger legacy is institutional: the artist-organised exhibition, the dealer-critic system, and the assumption that the avant-garde will be laughed at first, which has been true and has been exploited ever since.",
    connects:
      "Impressionism contrasts with the Renaissance's inheritance of perspective and finish. The group formed in Paris cafés, the Coffeehouses of their day, and its fortunes were made and nearly unmade in the English Auction room. Its Paris is the same city in which the Michelin Guide would soon ration another kind of reputation.",
    remember: [
      "First exhibition 15 April 1874, Nadar's studio, 35 boulevard des Capucines; eight exhibitions to 1886.",
      "Named by the critic Louis Leroy, mockingly, after Monet's Impression, soleil levant.",
      "Method: outdoors, quickly, unblended colour, visible brushwork, modern subjects.",
      "Material conditions: paint tubes (1841), synthetic pigments, railways to the suburbs and the coast.",
      "The real innovation was institutional: exhibiting without the Salon, selling through a dealer, Durand-Ruel.",
    ],
    yearStart: 1874,
    yearEnd: 1886,
    location: { lat: 48.87, lon: 2.33, country: "France" },
    tags: ["painting", "monet", "paris", "salon", "modern art", "plein air", "durand-ruel", "avant-garde"],
    recall: [
      { prompt: "Where did the name 'Impressionism' come from?", answer: "From the critic Louis Leroy's mocking review of the 1874 exhibition, taking the word from Monet's Impression, soleil levant." },
      { prompt: "Name two technologies that made painting outdoors practical for the Impressionists.", answer: "Collapsible metal paint tubes (Rand, 1841) and the railway, which put the suburbs and the coast within an hour of Paris; new synthetic pigments also counted." },
      { prompt: "What was institutionally new about the 1874 exhibition?", answer: "Artists organised and funded their own exhibition outside the state-run Salon and its jury, and sold through a dealer rather than through official approval." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "the-odyssey",
    kind: "work",
    domain: "literature",
    title: "The Odyssey",
    subtitle: "A homecoming in twenty-four books, composed for the ear before it was written for the eye",
    summary:
      "The Odyssey is the Greek epic, attributed to Homer and composed around the late eighth or seventh century BCE, that follows Odysseus's ten-year return from Troy to Ithaca, his son's search for him and the reckoning with the suitors in his house. It is the founding text of the journey narrative and of the idea that a story can begin in the middle.",
    what:
      "The poem runs to about 12,100 lines of dactylic hexameter in twenty-four books, a division made by Alexandrian editors centuries after composition. Its structure is unusual. Books 1–4, the Telemachy, follow Odysseus's son to Pylos and Sparta in search of news. Books 5–12 find Odysseus on Calypso's island, bring him to the Phaeacians, and let him tell his own adventures, the Cyclops, Circe, the underworld, the Sirens, Scylla and Charybdis, in a long flashback. Books 13–24 are Ithaca: the beggar's disguise, the recognitions, the bow, the killing of the suitors, and Penelope's test of the bed.\n\nMilman Parry showed in the 1930s that the repeated epithets, 'wine-dark sea', 'rosy-fingered dawn', 'much-turning Odysseus', are the building blocks of an oral tradition, formulae that let a singer compose in performance. Whether one poet named Homer shaped that tradition into the two epics, and when, is the Homeric Question; most scholars now place the text's fixing between about 750 and 650 BCE, with the Odyssey somewhat later than the Iliad.\n\nIts themes are nostos, the return, and xenia, the reciprocal obligations of host and guest, which every episode tests: the Phaeacians honour it, the Cyclops eats his guests, the suitors abuse it in Odysseus's own hall. The poem's hero survives by cunning and by lying well, which the Greeks admired more than we do.",
    why:
      "The Odyssey is worth knowing as the origin of narrative techniques still in use, the delayed opening, the embedded story, the disguised return, and as a long meditation on recognition: how one person establishes who they are to another, by scar, by bed, by knowledge only the true person would have. It is also an early and honest treatment of a hero who is a persuasive liar, which is a useful corrective to the idea that the ancients were simpler than us.",
    before:
      "Behind the poem lies a Bronze Age world the singers half-remembered: Mycenaean palaces destroyed around 1200 BCE, a Troy that archaeology has found at Hisarlik. Near Eastern epic, above all Gilgamesh, supplies parallels for the journey and the visit to the dead. The Greeks had no writing between the fall of Mycenae and the adoption of the Phoenician alphabet around 800 BCE, which is why the poems are oral in texture.",
    after:
      "The Odyssey was the second book every Greek schoolboy learned and the model for Virgil's Aeneid, whose first half is an Odyssey and second an Iliad. Dante put Ulysses in hell for restlessness; Tennyson admired him for it. James Joyce built Ulysses (1922) on its episodes, one day in Dublin. English has had translations from Chapman (1616) through Pope, Fagles and Emily Wilson (2017), whose plain iambic version and its first line, 'Tell me about a complicated man', reopened the question of who Odysseus is.",
    connects:
      "The Odyssey's xenia is the literary ancestor of Diplomatic Immunity: the stranger protected by a rule everyone needs. Its recovery and printing in Florence in 1488 belongs to the Renaissance and the Printing Press. Its sea is the Aegean that the Bosporus opens into, and the Black Sea beyond was the edge of the Greek world it describes.",
    remember: [
      "About 12,100 lines, 24 books; Telemachy (1–4), wanderings told in flashback (5–12), Ithaca (13–24).",
      "Oral-formulaic composition (Parry, 1930s); the text fixed roughly 750–650 BCE; the Homeric Question is open.",
      "Two themes: nostos (return) and xenia (host-guest obligation), tested in every episode.",
      "Odysseus wins by cunning and lies well; the Greeks admired this.",
      "Translations from Chapman (1616) to Emily Wilson (2017).",
    ],
    yearStart: -700,
    tags: ["homer", "epic", "greek literature", "odysseus", "oral tradition", "xenia", "nostos", "narrative"],
    recall: [
      { prompt: "Describe the three-part structure of the Odyssey.", answer: "Books 1–4 follow Telemachus searching for news of his father; books 5–12 bring Odysseus to the Phaeacians, where he narrates his adventures in flashback; books 13–24 are the return to Ithaca and the killing of the suitors." },
      { prompt: "What did Milman Parry show about Homer's epithets?", answer: "That formulae like 'wine-dark sea' are metrical building blocks of an oral tradition, allowing a singer to compose in performance." },
      { prompt: "What is xenia, and why does it matter in the poem?", answer: "The reciprocal obligation between host and guest; nearly every episode tests it, from the Phaeacians who honour it to the Cyclops and the suitors who violate it." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "johann-sebastian-bach",
    kind: "person",
    domain: "music",
    title: "Johann Sebastian Bach",
    subtitle: "A provincial church musician who wrote, on schedule, the most complete music in the Western tradition",
    summary:
      "Johann Sebastian Bach (1685–1750) was a German organist, composer and Kantor who spent his career in the small courts and Lutheran churches of Thuringia and Saxony. Largely forgotten as a composer within decades of his death, his cantatas, passions, keyboard works and fugues became, after Mendelssohn's 1829 revival, the foundation of the Western canon.",
    what:
      "Bach was born in Eisenach on 21 March 1685 (old style) into a family that had supplied town musicians for generations, was orphaned at ten, and learned his craft copying scores in his elder brother's house at Ohrdruf. His posts tell the story: organist at Arnstadt and Mühlhausen, court organist and then Konzertmeister at Weimar (1708–17), where he was jailed for a month for trying to leave; Kapellmeister to the music-loving Prince Leopold at Köthen (1717–23), which produced the Brandenburg Concertos, the cello suites and the first book of the Well-Tempered Clavier; and from 1723 Thomaskantor at Leipzig, responsible for music in the city's main churches and for teaching the choir school.\n\nAt Leipzig he wrote a cantata a week for several years, some two hundred surviving of perhaps three hundred, the St John Passion (1724) and St Matthew Passion (1727), and, at the end, the Mass in B minor (completed 1749) and the unfinished Art of Fugue. The catalogue Wolfgang Schmieder compiled in 1950, the BWV, lists over a thousand works. He married twice and had twenty children, ten of whom survived infancy; four sons became notable composers.\n\nWhat distinguishes the music is the union of rigour and expression: counterpoint of unmatched density that never sounds like an exercise. He was famous in his lifetime as an organist, not a composer, and his style was already old-fashioned when he died on 28 July 1750.",
    why:
      "Bach is the strongest case against the romantic idea that great work needs freedom and inspiration. He wrote to deadline, to commission, to the liturgical calendar, for players he had, in a job he complained about. The quality came from craft compounded over decades and from the habit of treating every constraint as a problem to be solved completely. Anyone who works under conditions they did not choose can take that seriously.",
    before:
      "German Lutheran music had a strong tradition of organ playing and the chorale, the congregational hymn that Luther himself had promoted. Bach absorbed Buxtehude, whom he walked 250 miles to hear, Pachelbel, the Italian concerto through Vivaldi, whose works he transcribed, and the French keyboard style. The Thirty Years' War had left Germany a patchwork of small courts, each with its Kapelle, which is why so many posts existed for him to hold.",
    after:
      "His sons Carl Philipp Emanuel and Johann Christian were more famous than he was for fifty years. Mozart and Beethoven studied the Well-Tempered Clavier in manuscript. Mendelssohn's Berlin performance of the St Matthew Passion in 1829, its first since Bach's death, began the revival; the Bach-Gesellschaft published the complete works between 1851 and 1900. His music has since been recorded by every generation, re-scored for synthesizer and sent into interstellar space on the Voyager record, and remains the standard by which counterpoint is taught.",
    connects:
      "Bach depended on The Reformation: the Lutheran chorale was his raw material and the Leipzig post existed to supply Lutheran worship. His Coffee Cantata was written for a Leipzig Coffeehouse. The small-state Germany that employed him was the Peace of Westphalia's settlement in practice. His deliberate, rule-bound method is the opposite of Impressionism's instant.",
    remember: [
      "1685 Eisenach – 1750 Leipzig; orphaned at ten; famous in life as an organist, not a composer.",
      "Posts: Arnstadt, Mühlhausen, Weimar (1708–17), Köthen (1717–23), Leipzig Thomaskantor (1723–50).",
      "Köthen: Brandenburg Concertos, cello suites, Well-Tempered Clavier I. Leipzig: cantatas weekly, St John and St Matthew Passions, Mass in B minor, Art of Fugue.",
      "BWV catalogue (Schmieder, 1950): over a thousand works.",
      "Mendelssohn's 1829 St Matthew Passion began the revival.",
    ],
    yearStart: 1685,
    yearEnd: 1750,
    location: { lat: 51.34, lon: 12.37, country: "Germany" },
    tags: ["baroque", "counterpoint", "leipzig", "cantata", "fugue", "organ", "lutheran", "mendelssohn"],
    recall: [
      { prompt: "What were Bach's three main posts after Weimar, and what did each produce?", answer: "Köthen (1717–23): Brandenburg Concertos, cello suites, Well-Tempered Clavier book I; Leipzig (1723–50): the weekly cantatas, both Passions, the Mass in B minor and the Art of Fugue." },
      { prompt: "Why was Bach's music neglected after his death, and what revived it?", answer: "His contrapuntal style was considered old-fashioned by 1750, and he was remembered as an organist; Mendelssohn's 1829 performance of the St Matthew Passion started the revival." },
      { prompt: "What is the BWV?", answer: "The Bach-Werke-Verzeichnis, Wolfgang Schmieder's 1950 catalogue of Bach's works, numbering over a thousand." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "michelin-guide",
    kind: "institution",
    domain: "food",
    title: "The Michelin Guide",
    subtitle: "A tyre company's free handbook for motorists that became the arbiter of the world's restaurants",
    summary:
      "The Michelin Guide began in 1900 as a free booklet from the Michelin tyre company listing garages, hotels and useful information for the few thousand motorists in France. It started rating restaurants with stars in 1926, fixed the three-star scale in 1931, and its anonymous inspectors now decide reputations from Paris to Tokyo.",
    what:
      "André and Édouard Michelin printed 35,000 copies of the first guide in 1900, when France had perhaps 3,000 cars, on the theory that people who drove more would wear out more tyres. It listed mechanics, petrol suppliers, hotels and instructions for changing a tyre, and was free. The company began charging in 1920, reportedly after André found a stack of guides propping up a workbench, and concluded that people only respect what they pay for.\n\nRestaurants entered in the 1920s; a single star for good food appeared in 1926, and the three-tier scale was defined in 1931 for the provinces and 1933 for Paris. The definitions have barely changed: one star, a very good restaurant in its category; two, excellent cooking, worth a detour; three, exceptional cuisine, worth a special journey. The wording is about travel, which is what a tyre company sells. Inspectors eat anonymously, pay their bills, and judge five stated criteria: the quality of ingredients, mastery of technique, harmony of flavours, the personality of the chef expressed in the food, and consistency over time. Decor and service are not scored.\n\nThe guide stayed largely French and European until it published a New York edition in 2005 and Tokyo in 2007, which promptly received more stars than Paris. The Bib Gourmand, for good value, was added in 1997.",
    why:
      "The guide is a case in how a reputation system works: a trusted judge, a scarce signal, and anonymity to prevent capture. Its power comes not from being right but from being believed; a lost star can halve a restaurant's bookings, and chefs have returned stars to escape the pressure. It is also a reminder that many of the institutions that shape taste were built for another purpose, and that a free thing was, in the founders' own judgment, worth less than a paid one.",
    before:
      "Restaurant criticism existed, Grimod de La Reynière's Almanach des gourmands from 1803 and the gastronomic writing of Brillat-Savarin, but as literature rather than a standardised rating. Travellers relied on Baedeker's guides, published from 1827, which rated sights with stars and gave Michelin its symbol. The motor car created the new problem the guide solved: where to eat when you could go anywhere.",
    after:
      "Stars became the currency of professional cooking and the object of its anxieties. The death of Bernard Loiseau in 2003, after rumours that he would lose his third star, opened a lasting argument about the guide's weight. Critics have charged it with French bias and, in Asia, with generosity aimed at tyre markets. Rivals, the World's 50 Best list from 2002, crowd-sourced ratings, and the Gault-Millau scale of points, have not displaced it. Regional editions now cover more than forty countries and cities, several of them paid for by the tourism boards they rate.",
    connects:
      "The Michelin Guide and Impressionism's Salon are both Parisian machines for rationing reputation. Its printed, revisable, cheap form is a late child of The Printing Press. The problem it solved, where to eat when the car makes everywhere reachable, is the same reordering of geography that Containerization would later work on freight.",
    remember: [
      "1900: a free guide for French motorists from the Michelin tyre company; charged for from 1920.",
      "Stars for restaurants from 1926; the three-tier scale defined in 1931 (Paris 1933): very good, worth a detour, worth a special journey.",
      "Five criteria: ingredients, technique, harmony, the chef's personality in the food, consistency; decor and service are not scored.",
      "Inspectors are anonymous and pay their bills; that is the whole basis of the guide's credibility.",
      "New York edition 2005, Tokyo 2007; Bib Gourmand for value since 1997.",
    ],
    yearStart: 1900,
    location: { lat: 45.78, lon: 3.08, country: "France" },
    tags: ["restaurants", "stars", "gastronomy", "reputation", "inspectors", "michelin", "rating", "france"],
    recall: [
      { prompt: "Why did a tyre company publish a guide for motorists?", answer: "To encourage driving: people who drove more would wear out more tyres and buy more; the guide listed garages, hotels and later restaurants worth a journey." },
      { prompt: "What do one, two and three Michelin stars mean?", answer: "One: a very good restaurant in its category. Two: excellent cooking, worth a detour. Three: exceptional cuisine, worth a special journey." },
      { prompt: "Which five criteria do Michelin inspectors say they judge?", answer: "Quality of ingredients, mastery of technique, harmony of flavours, the chef's personality expressed in the food, and consistency over time." },
      { prompt: "Why did the guide start charging in 1920?", answer: "The story is that André Michelin found copies being used to prop up a workbench and concluded that people only value what they pay for." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "coffeehouses",
    kind: "concept",
    domain: "food",
    title: "Coffeehouses",
    subtitle: "A cheap drink, a public room and the conversation that built markets, newspapers and insurers",
    summary:
      "Coffeehouses, first recorded in the Ottoman world in the sixteenth century and in England from 1650, were public rooms where anyone with a penny could sit, read the news and talk to strangers. Out of London's coffeehouses came Lloyd's, the Stock Exchange and much of the periodical press; out of Vienna's and Paris's, a good part of the Enlightenment.",
    what:
      "Coffee was drunk by Sufis in Yemen in the fifteenth century to stay awake for night prayers, reached Mecca and Cairo, and was banned in Mecca in 1511 by a governor who feared the gatherings it produced. The ban did not hold. Istanbul's first coffeehouses are usually dated to the 1550s on the word of the historian Peçevi; they became places for chess, storytellers and politics, which is why Murad IV closed them in 1633, on pain of death, and why they reopened anyway.\n\nEngland's first was in Oxford around 1650 and London's in 1652, opened by Pasqua Rosée, a Greek or Armenian servant of a Levant merchant. By 1700 London had several hundred. For a penny you could sit all day, read the newspapers the house took in, and talk to whoever was there; they were called penny universities. Each house acquired a trade. Edward Lloyd's, on Tower Street and then Lombard Street from 1691, took in shipping news and became the insurance market Lloyd's of London. Jonathan's in Exchange Alley hosted the stockjobbers expelled from the Royal Exchange and became the Stock Exchange. Garraway's held auctions. Charles II tried to suppress them in December 1675 as seedbeds of sedition and withdrew the proclamation within eleven days.\n\nVienna's cafés followed the Ottoman siege of 1683, Paris's Procope opened in 1686, and in each the mixture was the same: caffeine, print, credit and strangers.",
    why:
      "The coffeehouse is the clearest example of an institution nobody designed. Its products, markets, newspapers, insurance, the public sphere that Jürgen Habermas described in 1962, came from the accidental combination of a sober drink, a cheap room, and a rule that anyone could speak. When you want to understand where a new institution came from, look for the room in which the relevant people happened to keep meeting.",
    before:
      "Europe's public rooms were taverns, where the drink was alcohol and the conversation ended accordingly. News travelled by manuscript newsletter to those who could pay. Merchants met on exchanges at fixed hours; scholars met in universities and academies. There was no cheap, sober, all-day space open to anyone.",
    after:
      "The coffeehouse gave way to the club in England and to the café as a fixture of European city life. The institutions it incubated outlived it: Lloyd's, the Stock Exchange, The Tatler and The Spectator, which were written for coffeehouse reading. The Viennese café produced its own literature and the Parisian café its own painting. The modern coffee chain is its commercial descendant with the conversation removed, and the internet forum its structural one, with the sobriety removed.",
    connects:
      "Coffeehouses ran on The Printing Press's newspapers and came from The Ottoman Empire by way of Istanbul. The Bank of England, model for Central Banks, was a project of the same London; the English Auction had its London home in Garraway's. Impressionism was born in Paris cafés, and Bach wrote a cantata for one in Leipzig. The room is a small case of what the Availability Heuristic does at scale: what is talked about feels true.",
    remember: [
      "Coffee: Yemen (fifteenth century), Mecca ban 1511, Istanbul coffeehouses from the 1550s, closed by Murad IV in 1633.",
      "England: Oxford c. 1650, London 1652 (Pasqua Rosée); several hundred in London by 1700; 'penny universities'.",
      "Lloyd's Coffee House became Lloyd's of London; Jonathan's became the Stock Exchange; Garraway's held auctions.",
      "Charles II's suppression proclamation of December 1675 lasted eleven days.",
      "Habermas (1962): the coffeehouse as the birthplace of the bourgeois public sphere.",
    ],
    yearStart: 1554,
    yearEnd: 1750,
    tags: ["coffee", "public sphere", "lloyd's", "stock exchange", "london", "istanbul", "newspapers", "habermas"],
    recall: [
      { prompt: "Name two London institutions that began in coffeehouses.", answer: "Lloyd's of London (from Edward Lloyd's coffeehouse) and the Stock Exchange (from Jonathan's in Exchange Alley); Garraway's auctions and the periodical press also qualify." },
      { prompt: "Why did rulers keep trying to close coffeehouses?", answer: "They were cheap, sober, all-day rooms where strangers read news and talked politics; Murad IV in 1633 and Charles II in 1675 both treated them as seedbeds of sedition." },
      { prompt: "When and where did London's first coffeehouse open?", answer: "1652, opened by Pasqua Rosée, servant of a Levant merchant, in St Michael's Alley off Cornhill." },
      { prompt: "What did Habermas see in the coffeehouse?", answer: "The origin of the bourgeois public sphere: a space between the state and the household where private people reasoned together about public matters." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
];

export const ARCHIVE_PATHS: ArchiveEntry[] = [
  {
    id: "how-money-works",
    kind: "path",
    domain: "economics",
    title: "How Money Works",
    subtitle: "Six entries, from the ledger to the central bank",
    summary:
      "Six entries that take money apart in the order it was built: first the ledger that made a business legible, then the question of what a currency is worth and who decides, then the institutions that manage it, and last the quiet tax that falls on everyone when they fail.",
    what:
      "The path begins with Double-Entry Bookkeeping because money is easiest to understand as a record before it is understood as a thing. Once you can see that every transaction is a claim on someone else, Fiat Money stops looking like a trick: a currency is a claim on a state that taxes in it, and the ledger is what makes the claim enforceable. The Gold Standard is the older answer to the same question, with the claim fixed to a weight of metal, and Bretton Woods is the compromise that ran from 1944 to 1971 with a dollar convertible into gold at the centre. By then you have met every kind of anchor and can read Central Banks as the institution that replaced the metal one, and Inflation as the thing it exists to prevent, and what it does to creditors and debtors when it fails.\n\nRead in this order, each entry answers a question the previous one raised. Read out of order, you meet the answers before the questions.",
    why:
      "You will be able to explain why a note that promises nothing holds its value, what a country gives up when it fixes its exchange rate, what a central bank is actually deciding when it moves a rate by a quarter of a point, and who pays when prices rise. You will also be able to hear the phrase 'printing money' and ask the right next question: printed against what, and lent to whom.",
    before:
      "Before this path most people hold a picture of money as a stock of valuable stuff kept somewhere, occasionally debased by governments. It is not a foolish picture; it was roughly true under a metallic standard. It stopped being true in 1971, and most public argument about money is still conducted in its terms.",
    after:
      "After the path, The Prisoner's Dilemma and Game Theory explain why the states at Bretton Woods needed rules none of them could break alone, and The Dutch East India Company shows the ledger becoming a share. The Venetian Republic and The Hanseatic League are where the bookkeeping came from and where credit first crossed borders at scale.",
    connects:
      "Double-Entry Bookkeeping is the Venetian method Pacioli printed in 1494, which puts The Printing Press and The Venetian Republic one step behind the first entry. Central Banks and Inflation lead into Game Theory, since a credible inflation target is a promise about how you will behave on the day breaking it would pay.",
    remember: [
      "Money is a record of claims before it is a thing; the ledger comes first.",
      "Fiat money holds value because the state taxes in it and everyone expects to spend it tomorrow; every major currency has been fiat since 1971.",
      "A metal anchor fixes exchange rates and forbids devaluation, so downturns become deflations; Bretton Woods (1944–1971) was the last compromise between anchor and discretion.",
      "A central bank sets the short rate, lends last, and since the 1990s is judged by an inflation target it is meant to keep at arm's length from government.",
      "Inflation is a transfer from those who hold money and are owed it to those who owe it, governments included.",
    ],
    tags: ["money", "currency", "ledger", "central bank", "inflation", "gold", "path"],
    recall: [
      { prompt: "In one sentence, why does fiat money hold value?", answer: "Because the state accepts it for taxes, the law makes it legal tender and people expect others to take it tomorrow." },
      { prompt: "What does a country give up by fixing its currency to gold?", answer: "The ability to devalue or expand the money supply in a downturn; adjustment has to come through falling prices and wages instead." },
      { prompt: "Who gains and who loses from unexpected inflation?", answer: "Debtors, including governments, gain; creditors, savers and anyone holding money lose." },
    ],
    readingMinutes: 4,
    origin: "seeded",
    pathEntries: ["double-entry-bookkeeping", "fiat-money", "gold-standard", "bretton-woods", "central-banks", "inflation"],
  },
  {
    id: "why-istanbul",
    kind: "path",
    domain: "geography",
    title: "Why Istanbul",
    subtitle: "Six entries on the city that a strait built",
    summary:
      "Start with the water, then the city, then the routes that ended there, the empire that ruled from it, the republic that traded and fought with it, and finally the room in which its habit of conversation was exported to Europe.",
    what:
      "The path begins with The Bosporus because the city is an effect and the strait is the cause: thirty-one kilometres of water that decide who reaches the Black Sea, with one defensible peninsula at the southern end. Istanbul, three names and sixteen centuries as a capital, is the human answer to that geography. The Silk Road explains what the city was for, as the western terminus where overland goods met Mediterranean shipping. The Ottoman Empire explains who held it longest, from the conquest of 1453 to 1922, and why controlling the strait came before taking the city. The Venetian Republic is the rival and customer across the water, which shows how a place becomes valuable to more than its owner. Coffeehouses close the path with an institution born in the city in the 1550s and copied in London, Vienna and Paris: the city's most successful export was a way of talking.\n\nThe order moves from what cannot change, the water, to what changed most, the conversation.",
    why:
      "You will be able to look at a map and say why a city is where it is, then say what that position was worth in each century and to whom. You will be able to tell a capital from a hub, and to read an empire's strategy off a strait. And you will have a worked example of a question you can ask about any city: what does it sit at the crossing of, and who else wants the crossing.",
    before:
      "Before the path Istanbul is usually a name attached to a skyline. Byzantium, Constantinople and Istanbul feel like three cities rather than one place renamed; the Ottomans are a vague late act; Venice is a canal. The path replaces the skyline with a mechanism.",
    after:
      "From here The Mongol Empire and The Black Death follow the Silk Road in both directions, The Printing Press explains why the Ottoman capital printed in Greek and Armenian long before Arabic, and The Suez Canal and Dubai show what happens to a crossing when the sea route changes or a new one is built.",
    connects:
      "Every entry in the path is connected to Istanbul directly in the Archive: the strait it depends on, the routes that ended there, the empire that ruled from it, the republic that kept an ambassador there and the coffeehouse that began there. The Renaissance is one step away, through the scholars who left the city before and after 1453.",
    remember: [
      "The strait is the cause and the city is the effect: one defensible peninsula at the only crossing between two seas and two continents.",
      "One place, three names: Byzantium (c. 657 BCE), Constantinople (330 CE), Istanbul (official from 1930); a capital for sixteen centuries.",
      "Mehmed II fortified the Bosporus at Rumeli Hisarı in 1452, before the siege of 1453; control of the water came first.",
      "Venice was rival and customer at once; a crossing is valuable to more than its owner.",
      "The coffeehouse is an Ottoman institution of the 1550s that London (1652) and Vienna (1680s) copied.",
    ],
    tags: ["istanbul", "bosporus", "constantinople", "trade routes", "ottoman", "venice", "path"],
    recall: [
      { prompt: "Why is Istanbul where it is?", answer: "It sits on a defensible peninsula at the southern end of the Bosporus, the only water passage between the Black Sea and the Mediterranean and the narrowest crossing between Europe and Asia." },
      { prompt: "What did the Ottomans do before besieging Constantinople in 1453?", answer: "Built Rumeli Hisarı on the Bosporus in 1452 to control the strait and cut the city off from the Black Sea." },
      { prompt: "Which institution did Europe copy from Istanbul in the seventeenth century?", answer: "The coffeehouse: Istanbul had them from the 1550s, London from 1652, Vienna after 1683." },
    ],
    readingMinutes: 4,
    origin: "seeded",
    pathEntries: ["bosporus", "istanbul", "silk-road", "ottoman-empire", "venetian-republic", "coffeehouses"],
  },
  {
    id: "reading-evidence",
    kind: "path",
    domain: "science",
    title: "Reading Evidence",
    subtitle: "Six entries on how much a fact should move you",
    summary:
      "The arithmetic of updating first, then the two habits that break it, then the test that separates a claim from a slogan, and finally what happens to evidence when the other people in the room are also reasoning about you.",
    what:
      "Bayes' Theorem comes first because it states the whole problem in one line: how much a piece of evidence should move you depends on how likely it was under each hypothesis, and on where you started. The Base-Rate Fallacy is what happens when you forget where you started, and The Availability Heuristic is what happens when the evidence that comes to mind is not the evidence that exists; both are Bayes done badly, and both were documented by Kahneman and Tversky in 1973. Falsifiability then turns from weighing evidence to asking whether a claim can be weighed at all: a theory that forbids nothing cannot be moved by anything. The last two entries change the setting. In The Prisoner's Dilemma and Game Theory the evidence you see is produced by people who know you are watching, so a signal has to be read together with the incentive to send it.\n\nThe order is deliberate: the rule, two failures of the rule, the precondition for applying it, and then the strategic case where the rule alone is not enough.",
    why:
      "You will be able to say, for a given piece of evidence, roughly how much it should change your mind, and to notice the two commonest reasons your instinct gets the number wrong. You will be able to ask of any confident claim what would show it to be false. And you will be able to treat a statement from an interested party as a move rather than a measurement, which is most of what negotiation, hiring and reading the news require.",
    before:
      "Most people already update on evidence; the trouble is the size of the update. Vivid evidence moves them too far, rare conditions with good tests are treated as near certainties, and a theory that explains everything feels strongest when it is weakest. The path names these habits so they can be caught in the act.",
    after:
      "The Case Files and the Inference Room are where this path is used rather than read: every case asks how sure you are and then shows you the base rate. From here The Odyssey is a study in evidence from interested parties, and Central Banks are an institution built around the credibility problem the last two entries describe.",
    connects:
      "Bayes' Theorem underpins The Base-Rate Fallacy, which is the theorem forgotten, and contrasts with The Availability Heuristic, which is the theorem fed the wrong sample. Falsifiability is Popper's answer to a question Bayes leaves open. Game Theory uses the same probabilities and adds a second mind; The Prisoner's Dilemma is its most portable example.",
    remember: [
      "Update in proportion to how much more likely the evidence is under one hypothesis than the other, starting from the base rate.",
      "The base-rate fallacy is forgetting the prior; the availability heuristic is mistaking what comes to mind for what exists.",
      "A claim that could not be shown false cannot be supported by evidence either.",
      "When evidence is produced by someone who knows you are watching, read the incentive with the signal.",
      "Four dates anchor the path: Popper 1934, von Neumann and Morgenstern 1944, RAND 1950, Kahneman and Tversky 1973.",
    ],
    tags: ["evidence", "bayes", "probability", "heuristics", "popper", "game theory", "path"],
    recall: [
      { prompt: "Name the two habits that make Bayesian updating go wrong in practice.", answer: "Ignoring the base rate (the base-rate fallacy) and judging frequency by ease of recall (the availability heuristic)." },
      { prompt: "What is Popper's test for whether a claim is scientific?", answer: "That it forbids something: it makes predictions that could turn out false." },
      { prompt: "Why is evidence from an interested party different?", answer: "It is a move as well as a measurement; the incentive to send the signal has to be read along with the signal, which is the setting game theory describes." },
    ],
    readingMinutes: 4,
    origin: "seeded",
    pathEntries: ["bayes-theorem", "base-rate-fallacy", "availability-heuristic", "falsifiability", "prisoners-dilemma", "game-theory"],
  },
];
