/**
 * Economics — concepts (part A of the economics domain).
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Economics sits downstream of arithmetic, percentages and functions, and beside decision
 * science (opportunity cost, incentives). `dependsOn` records prerequisites that would block a
 * learner; `related` records neighbours in any domain worth connecting once the concept is held.
 * Figures quoted are the commonly reported ones; where estimates disagree the text says so.
 */
import type { Concept } from "@/lib/v2/content-types";

type Draft = Omit<Concept, "domainId" | "courseId" | "moduleId">;

function concept(courseId: string, moduleId: string, draft: Draft): Concept {
  return { domainId: "economics", courseId, moduleId, ...draft };
}

const MICRO = "microeconomics";
const MACRO = "macroeconomics";
const MONEY = "money-and-banking";

/* ------------------------------------------------------------------ */
/* Microeconomics: markets                                              */
/* ------------------------------------------------------------------ */

const markets: Concept[] = [
  concept(MICRO, "ec-markets", {
    id: "scarcity-and-tradeoffs",
    title: "Scarcity and trade-offs",
    summary:
      "Economics begins from the fact that wants exceed the means of satisfying them, so every use of time, money or land is also a decision not to use it another way. The cost of anything is the best alternative given up, not the money handed over.",
    keyPoints: [
      "Scarcity is not poverty: a rich economy still has to choose, because an hour, an acre or a worker used for one thing cannot be used for another.",
      "Opportunity cost is the value of the best alternative forgone; a 'free' concert costs the evening you would otherwise have spent.",
      "A production possibility frontier shows the trade-off between two outputs; points inside it waste resources, points beyond it are unreachable with present technology.",
      "Trade-offs are usually made at the margin: not 'guns or butter' but a little more of one for a little less of the other.",
      "Rationing by price is one way to allocate scarce things; queues, lotteries, rules and status are others, each with its own winners and losers.",
    ],
    dependsOn: [],
    related: ["opportunity-cost", "marginal-thinking", "number-sense", "sunk-costs"],
    recallPrompts: [
      { prompt: "Define opportunity cost in one sentence and give a non-monetary example.", answer: "The value of the best alternative given up when a choice is made; an evening at a free concert costs the evening you would otherwise have spent.", accept: ["best alternative", "next best alternative", "forgone"] },
      { prompt: "Why does scarcity still bind in a rich country?", answer: "Because resources used for one purpose cannot simultaneously be used for another; abundance raises the frontier but does not remove the need to choose between points on it." },
      { prompt: "What does a point inside the production possibility frontier represent?", answer: "Unused or misallocated resources: more of one output could be had without giving up any of the other.", accept: ["waste", "unemployed resources", "inefficiency"] },
    ],
    applications: ["Deciding how to spend a fixed evening, budget or hiring line", "Reading a government's spending plan as a set of things it has chosen not to fund", "Judging a 'free' service by what it costs in time and attention"],
    misconception: "That the cost of something is what you pay for it. The money is one part of the cost; the time, the alternative purchases and the alternative uses of the time are the rest, and they are often larger.",
    difficulty: 1,
    foundational: true,
    tags: ["foundations", "opportunity-cost"],
  }),
  concept(MICRO, "ec-markets", {
    id: "supply-and-demand",
    title: "Supply and demand",
    summary:
      "A market price settles where the quantity buyers want equals the quantity sellers offer. Reading any price change is a matter of asking which curve moved, in which direction, and whether it was a shift of the whole curve or a movement along it.",
    keyPoints: [
      "Demand slopes down (a higher price reduces quantity demanded); supply slopes up (a higher price draws out more quantity supplied).",
      "A change in price moves along a curve; a change in anything else (income, tastes, input costs, technology, expectations, the price of substitutes and complements) shifts the curve.",
      "Supply falls, price rises and quantity falls; demand rises, price rises and quantity rises. Watching whether quantity moved with or against price tells you which curve shifted.",
      "When both curves shift, one of price or quantity is determinate and the other depends on the relative sizes of the shifts.",
      "A price ceiling below equilibrium creates a shortage and rationing by other means; a price floor above it creates a surplus.",
      "Equilibrium is a tendency, not an instant; prices in labour and housing markets adjust slowly, so shortages and surpluses can persist for years.",
    ],
    dependsOn: ["scarcity-and-tradeoffs", "functions-and-graphs"],
    related: ["elasticity", "inflation", "labour-markets", "exchange-rates", "correlation-vs-causation"],
    recallPrompts: [
      { prompt: "A frost destroys a third of the coffee harvest. Which curve shifts, which way, and what happens to price and quantity?", answer: "Supply shifts left; price rises and the quantity traded falls.", accept: ["supply left", "supply shifts left"] },
      { prompt: "Distinguish a movement along the demand curve from a shift of it.", answer: "A movement along is caused by a change in the good's own price; a shift is caused by a change in something else, such as income, tastes or the price of a substitute." },
      { prompt: "Price rose and quantity rose in the same period. Which shift explains it?", answer: "An increase in demand. A fall in supply would raise price but reduce quantity.", accept: ["demand increased", "demand up", "demand shifted right"] },
      { prompt: "What does a binding price ceiling do?", answer: "It holds price below equilibrium, so quantity demanded exceeds quantity supplied: a shortage, rationed by queues, quality cuts, favouritism or black markets.", accept: ["shortage"] },
    ],
    applications: ["Explaining why rents, petrol or eggs rose and whether the cause was on the buying or selling side", "Predicting the effect of a subsidy, tax, tariff or rent control", "Interpreting the currency market, where the 'good' is a currency and the 'price' is the exchange rate"],
    misconception: "That a higher price 'reduces demand'. It reduces the quantity demanded along an unchanged curve; demand itself shifts only when something other than the price changes. Confusing the two produces circular explanations in which prices move demand which moves prices.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "markets"],
  }),
  concept(MICRO, "ec-markets", {
    id: "elasticity",
    title: "Elasticity",
    summary:
      "Elasticity measures how strongly quantity responds to price: the percentage change in quantity divided by the percentage change in price. It decides who bears a tax, whether a price rise raises revenue, and how much a shortage hurts.",
    keyPoints: [
      "Price elasticity of demand = % change in quantity demanded ÷ % change in price; it is negative for ordinary goods and usually quoted as a magnitude.",
      "Magnitude above 1 is elastic (a price rise lowers total revenue); below 1 is inelastic (a price rise raises total revenue); exactly 1 leaves revenue unchanged.",
      "Demand is more elastic when close substitutes exist, when the good takes a large share of the budget, and over longer horizons as people adjust.",
      "The burden of a tax falls mostly on the side of the market that is less elastic, whatever the law says about who pays.",
      "Elasticity is a property of a point on the curve, not the curve's slope: the same straight line is elastic at high prices and inelastic at low ones.",
      "Commonly cited estimates: petrol around 0.1 to 0.3 in the short run, closer to 0.5 to 0.8 over years; cigarettes around 0.3 to 0.5. Estimates vary by study, country and period.",
    ],
    dependsOn: ["supply-and-demand", "fractions-ratios-percentages"],
    related: ["marginal-thinking", "labour-markets", "rates-of-change", "marketing-fundamentals"],
    recallPrompts: [
      { prompt: "Price rises 10 % and quantity demanded falls 25 %. What is the elasticity, and is demand elastic or inelastic?", answer: "25/10 = 2.5 in magnitude: elastic.", accept: ["2.5", "-2.5"] },
      { prompt: "If demand is inelastic, what does a price rise do to a seller's total revenue?", answer: "Raises it: quantity falls by a smaller percentage than price rises.", accept: ["raises", "increases", "goes up"] },
      { prompt: "Who bears most of a tax on a good with very inelastic demand and elastic supply?", answer: "Buyers. The less elastic side of the market cannot escape and bears the larger share of the burden.", accept: ["buyers", "consumers"] },
      { prompt: "Name three things that make demand more elastic.", answer: "Close substitutes, a large share of the budget, and a longer time horizon." },
    ],
    applications: ["Whether a firm should raise its price", "Who really pays a sugar tax, a tariff or a rise in employer payroll tax", "Why an oil supply cut of a few per cent can move the price by tens of per cent"],
    misconception: "That a steep demand curve means inelastic demand. Steepness depends on the units on the axes; elasticity uses percentage changes and varies along a single straight line.",
    difficulty: 3,
    tags: ["markets", "elasticity"],
  }),
  concept(MICRO, "ec-markets", {
    id: "marginal-thinking",
    title: "Marginal thinking",
    summary:
      "Most decisions are not all-or-nothing but a little more or a little less. The right question is whether the next unit is worth its cost; averages and totals mislead, and money already spent is irrelevant.",
    keyPoints: [
      "Marginal cost is the cost of one more unit; marginal benefit is the gain from it. Do more while marginal benefit exceeds marginal cost; stop when they are equal.",
      "Average cost includes fixed costs already committed; pricing a spare airline seat at average cost leaves it empty when any price above the marginal cost of carrying a passenger would have been profit.",
      "Diminishing marginal returns: successive units of effort, fertiliser or study usually add less than the ones before, so the stopping point is finite.",
      "Sunk costs are not marginal costs; only future costs and benefits can be changed by the decision.",
      "Marginal analysis is the calculus of economics: the derivative of total cost is marginal cost, and optimisation means setting marginal quantities equal.",
    ],
    dependsOn: ["scarcity-and-tradeoffs", "rates-of-change"],
    related: ["derivative-intuition", "optimisation", "sunk-costs", "opportunity-cost", "market-structure-competition"],
    recallPrompts: [
      { prompt: "A plane is about to leave with empty seats. Average cost per seat is 200; the extra fuel and catering for one passenger is 20. Should the airline sell a seat for 60?", answer: "Yes. The marginal cost is 20 and the marginal revenue 60; the fixed costs are incurred whether or not the seat is sold.", accept: ["yes"] },
      { prompt: "State the stopping rule of marginal analysis.", answer: "Continue while marginal benefit exceeds marginal cost; stop where they are equal.", accept: ["MB = MC", "marginal benefit equals marginal cost"] },
      { prompt: "Why are sunk costs irrelevant to a marginal decision?", answer: "Because no choice now can recover them; only costs and benefits that differ between the options can affect which option is better." },
    ],
    applications: ["Whether to work one more hour, study one more chapter, or run one more shift", "Pricing last-minute seats, off-peak rooms and end-of-day bread", "Deciding how much pollution abatement, screening or security is worth"],
    misconception: "That a decision should be judged by the average. If a shop's average profit per product is positive, closing a loss-making line still looks wrong until you ask what the marginal line actually contributes once shared costs are excluded.",
    difficulty: 2,
    foundational: true,
    tags: ["foundations", "marginal"],
  }),
];

/* ------------------------------------------------------------------ */
/* Microeconomics: structure and failure                                */
/* ------------------------------------------------------------------ */

const structure: Concept[] = [
  concept(MICRO, "ec-structure", {
    id: "market-structure-competition",
    title: "Market structure and competition",
    summary:
      "How many sellers there are, and how easily new ones can enter, determines whether prices track costs or sit well above them. Competition is the mechanism that pushes price toward marginal cost; its absence is what gives a firm the power to choose its price.",
    keyPoints: [
      "Under perfect competition no seller can influence price; each sells all it wants at the market price and produces where price equals marginal cost, so economic profit is competed to zero.",
      "A monopolist faces the whole market demand curve, so selling more requires cutting price on every unit; it sets marginal revenue equal to marginal cost and prices above both, producing less than a competitive market would.",
      "Oligopoly, a few large sellers, is where most modern industries sit; outcomes depend on whether firms compete on price, tacitly coordinate, or differentiate their products.",
      "Barriers to entry (patents, network effects, economies of scale, licences, control of an input) are what sustain pricing power; without them high profits attract entrants.",
      "Competition policy asks whether a merger or practice reduces competition, not whether a firm is large. Size earned by lower costs and better products is the intended result of competition.",
      "Deadweight loss is the value of trades that would have benefited both sides but do not happen because price sits above marginal cost.",
    ],
    dependsOn: ["supply-and-demand", "marginal-thinking"],
    related: ["strategy-and-competitive-advantage", "regulation", "game-theory-basics", "business-models"],
    recallPrompts: [
      { prompt: "Why does a monopolist produce less than a competitive industry with the same costs?", answer: "Because selling an extra unit lowers the price on all units, marginal revenue lies below price; setting MR = MC gives a lower quantity and a higher price than P = MC." },
      { prompt: "Name four barriers to entry.", answer: "Patents, network effects, economies of scale, licences or regulation, and control of a scarce input." },
      { prompt: "What is deadweight loss?", answer: "The total surplus lost from trades that would have benefited buyer and seller but do not take place because price exceeds marginal cost.", accept: ["lost surplus", "lost trades"] },
    ],
    applications: ["Reading a merger review or antitrust case", "Understanding why software and pharmaceutical margins differ from those of farming and haulage", "Judging whether a firm's high profit reflects a moat or a temporary lead"],
    misconception: "That a large firm is a monopoly and a small one is competitive. Structure is about the alternatives available to the buyer and the ease of entry, not the seller's size; a single village shop can have more pricing power than a large firm in a crowded market.",
    difficulty: 3,
    tags: ["markets", "competition"],
  }),
  concept(MICRO, "ec-structure", {
    id: "externalities-and-public-goods",
    title: "Externalities and public goods",
    summary:
      "Markets allocate well when the people who decide bear the costs and reap the benefits. When a cost or benefit falls on bystanders, or when nobody can be excluded from enjoying a good, prices carry the wrong signal and the market produces too much or too little.",
    keyPoints: [
      "An externality is a cost or benefit of an activity that falls on someone who did not choose it: pollution, congestion, noise; vaccination, research, a well-kept front garden.",
      "With a negative externality the private cost is below the social cost, so too much is produced; a tax equal to the marginal external cost (a Pigouvian tax) restores the right price.",
      "Public goods are non-rival (one person's use does not reduce another's) and non-excludable (non-payers cannot be kept out): defence, lighthouses, basic research. Free-riding means markets under-supply them.",
      "Common-pool resources are rival but hard to exclude from (fisheries, aquifers), producing the tragedy of the commons unless use is limited by rules, quotas or ownership.",
      "Coase's insight: when property rights are clear and bargaining is cheap, the parties can settle an externality between themselves; the theorem's conditions rarely hold at scale, which is why regulation and taxes exist.",
      "Tradable permits fix the quantity and let the market find the price; a tax fixes the price and lets the market find the quantity. Both aim at the same margin.",
    ],
    dependsOn: ["marginal-thinking", "supply-and-demand"],
    related: ["climate-system", "regulation", "incentives", "second-order-effects", "political-philosophy"],
    recallPrompts: [
      { prompt: "What is the textbook remedy for a negative externality, and what should its size be?", answer: "A tax on the activity equal to the marginal external cost, so that the private cost faced by the decision-maker equals the social cost.", accept: ["Pigouvian tax", "tax equal to marginal external cost"] },
      { prompt: "State the two properties that define a public good.", answer: "Non-rival (one person's consumption does not reduce another's) and non-excludable (non-payers cannot be prevented from consuming it)." },
      { prompt: "Why do markets under-provide public goods?", answer: "Because nobody can be excluded, each person can enjoy the good without paying for it (free-riding), so private provision does not cover the cost.", accept: ["free rider", "free-riding", "free riding"] },
    ],
    applications: ["Carbon taxes and emissions trading", "Congestion charges, fishing quotas and water rights", "Why basic research and vaccination are subsidised"],
    misconception: "That an externality means the activity should be banned. The right amount of a polluting activity is usually not zero; the aim is to make its full cost visible to the decision-maker so that it continues only where the benefit exceeds that cost.",
    difficulty: 3,
    tags: ["market-failure"],
  }),
  concept(MICRO, "ec-structure", {
    id: "comparative-advantage",
    title: "Comparative advantage",
    summary:
      "Two parties both gain from trade when each specialises in what it gives up least to produce, even if one of them is better at producing everything. It follows from opportunity cost alone, which is why it is true of countries, firms and colleagues alike.",
    keyPoints: [
      "Absolute advantage is producing more per hour; comparative advantage is producing at a lower opportunity cost. Only the second determines who should specialise in what.",
      "Opportunity cost of one unit of A is the units of B given up to make it: from a productivity table, divide the B output by the A output.",
      "Because opportunity costs are reciprocals, a party cannot have the comparative advantage in both goods; a comparative advantage in one is a comparative disadvantage in the other.",
      "Trade at any price between the two opportunity costs leaves both parties with more than they could produce alone.",
      "Ricardo's 1817 cloth-and-wine example made the point for England and Portugal; the same arithmetic tells a surgeon who types faster than her assistant to leave the typing to the assistant.",
      "Gains from trade are gains in total; the model says nothing about how they are shared, which is where the politics of trade lives.",
    ],
    dependsOn: ["scarcity-and-tradeoffs", "fractions-ratios-percentages"],
    related: ["opportunity-cost", "international-trade", "economic-development", "operations-and-supply-chains"],
    recallPrompts: [
      { prompt: "In one hour A makes 6 cloth or 3 wine; B makes 2 cloth or 2 wine. What is each party's opportunity cost of one wine, and who should make wine?", answer: "A: 2 cloth per wine. B: 1 cloth per wine. B has the lower opportunity cost and should specialise in wine, even though A is better at both.", accept: ["B", "B should make wine"] },
      { prompt: "Distinguish absolute from comparative advantage.", answer: "Absolute: more output per unit of input. Comparative: lower opportunity cost. Trade is guided by the second." },
      { prompt: "Can a country have a comparative advantage in every good?", answer: "No. Opportunity costs are ratios; being lower in one good means being higher in the other.", accept: ["no"] },
    ],
    applications: ["Deciding what to delegate when you could do it all better yourself", "Reading trade statistics and trade disputes", "Judging claims that a country 'cannot compete' with a lower-cost producer"],
    misconception: "That a party which is better at everything gains nothing from trade. Absolute advantage in both goods is compatible with a comparative disadvantage in one, and the party still gains by specialising where its edge is largest.",
    difficulty: 3,
    foundational: true,
    tags: ["trade", "opportunity-cost"],
  }),
];

/* ------------------------------------------------------------------ */
/* Macroeconomics: aggregates                                           */
/* ------------------------------------------------------------------ */

const aggregates: Concept[] = [
  concept(MACRO, "ec-aggregates", {
    id: "gdp-and-growth",
    title: "GDP and growth",
    summary:
      "Gross domestic product is the market value of everything produced in a country in a year, counted once. Its growth rate, compounded over decades, is the main reason living standards differ across countries and centuries.",
    keyPoints: [
      "GDP counts final goods and services at market prices; intermediate goods are excluded to avoid double counting. It can be measured by output, by income or by spending (C + I + G + X − M) and the three agree by construction.",
      "Real GDP strips out price changes; GDP per person strips out population; both are needed before comparing living standards.",
      "Growth compounds: 2 % a year doubles output in about 35 years, 7 % in about 10 (the rule of 70).",
      "Long-run growth comes from more capital, more and better-educated workers, and above all productivity, which is the part not explained by inputs.",
      "GDP omits unpaid work, leisure, environmental damage and distribution; Simon Kuznets, who built the first US national accounts in the 1930s, warned against reading it as welfare.",
      "GDP figures are revised for years after first publication; a first estimate is a forecast of what the statisticians will eventually settle on.",
    ],
    dependsOn: ["fractions-ratios-percentages", "linear-vs-exponential-growth"],
    related: ["real-vs-nominal", "economic-development", "industrial-revolution", "exponents-and-logarithms", "descriptive-statistics"],
    recallPrompts: [
      { prompt: "Write the expenditure identity for GDP.", answer: "GDP = C + I + G + (X − M): consumption, investment, government purchases and net exports.", accept: ["C + I + G + X - M", "C+I+G+(X-M)"] },
      { prompt: "Why are intermediate goods excluded from GDP?", answer: "To avoid double counting: the flour's value is already inside the bread's price.", accept: ["double counting"] },
      { prompt: "Roughly how long does an economy growing 3 % a year take to double?", answer: "About 23 years (70/3).", accept: ["23", "about 23 years", "24"] },
    ],
    applications: ["Reading a growth headline and asking whether it is real, per person and annualised", "Comparing countries with purchasing-power-parity adjustments", "Understanding why a percentage point of growth sustained matters more than a one-off boom"],
    misconception: "That GDP measures how well off people are. It measures marketed output; a country can raise GDP by rebuilding after a flood or by everyone working longer, and neither makes it better off.",
    difficulty: 2,
    foundational: true,
    tags: ["aggregates", "growth"],
  }),
  concept(MACRO, "ec-aggregates", {
    id: "unemployment",
    title: "Unemployment",
    summary:
      "The unemployment rate is the share of the labour force (people working or actively looking) who are without work. Its definition excludes those who have stopped looking, which is why it can fall while joblessness rises, and why participation must be read beside it.",
    keyPoints: [
      "Unemployment rate = unemployed ÷ labour force, where the labour force is the employed plus those actively seeking work; students, carers and discouraged workers are outside it.",
      "Frictional unemployment is the time spent moving between jobs; structural unemployment is a mismatch of skills or location; cyclical unemployment rises and falls with demand.",
      "Some unemployment is compatible with a healthy economy; the level below which inflation tends to accelerate is called the natural rate or NAIRU, and its estimates are uncertain and change over time.",
      "Okun's law is a rough regularity: each percentage point of unemployment above its normal level goes with output about two per cent below potential. The coefficient varies by country and period.",
      "Long-term unemployment scars: skills decay, networks thin and employers discount long gaps, so a deep recession can raise the natural rate for years.",
      "The employment rate (share of the working-age population in work) is often the more honest single number.",
    ],
    dependsOn: ["fractions-ratios-percentages"],
    related: ["labour-markets", "business-cycles", "inflation", "sampling-and-bias", "demographics-and-population"],
    recallPrompts: [
      { prompt: "Who is in the labour force, and who is not?", answer: "The employed and those actively seeking work are in it; students, retirees, full-time carers and discouraged workers who have stopped looking are not." },
      { prompt: "Name the three kinds of unemployment.", answer: "Frictional (between jobs), structural (skills or location mismatch) and cyclical (weak demand)." },
      { prompt: "Why can the unemployment rate fall in a bad labour market?", answer: "Because people who stop looking leave the labour force and are no longer counted as unemployed.", accept: ["discouraged workers", "leave the labour force", "stop looking"] },
    ],
    applications: ["Reading the monthly labour market release", "Judging whether a rise in the rate is a demand problem or a mismatch problem", "Comparing countries whose survey definitions differ"],
    misconception: "That everyone without a job is unemployed. The measure counts only those looking for work; a fall in the rate can mean more jobs or more people giving up.",
    difficulty: 2,
    tags: ["aggregates", "labour"],
  }),
  concept(MACRO, "ec-aggregates", {
    id: "inflation",
    title: "Inflation",
    summary:
      "Inflation is a sustained rise in the general level of prices, measured as the percentage change in a price index over a year. It comes from demand outrunning the economy's capacity, from cost shocks that pass through, and from expectations that feed on themselves.",
    keyPoints: [
      "A consumer price index tracks the cost of a fixed basket of goods; the inflation rate is the percentage change in the index, not the change in index points.",
      "Demand-pull inflation: spending grows faster than the economy can produce. Cost-push inflation: input prices such as energy or wages rise and are passed on. Real episodes usually mix the two.",
      "Expectations matter: if firms and workers expect 5 % inflation they set prices and wages to match, and the expectation fulfils itself. Anchoring expectations is why central banks announce targets.",
      "Inflation redistributes: it favours borrowers at fixed rates over lenders, and hurts anyone whose income is fixed in money terms; unexpected inflation does the redistributing, expected inflation is largely priced in.",
      "Hyperinflation follows when a government finances itself by creating money faster than the demand for it grows: Germany 1923, Zimbabwe 2008 (peak monthly rate estimated at tens of billions of per cent), Venezuela in the late 2010s.",
      "Most rich-country central banks target about 2 %: low enough to be ignorable, high enough to leave room for cutting real rates and for relative wages to adjust without cuts in money wages.",
      "Recent reference points: UK CPI inflation peaked at 11.1 % in October 2022 and US CPI at 9.1 % in June 2022, after energy shocks and post-pandemic demand.",
    ],
    dependsOn: ["fractions-ratios-percentages", "supply-and-demand"],
    related: ["real-vs-nominal", "monetary-policy", "money-functions", "interwar-and-depression", "expected-value"],
    recallPrompts: [
      { prompt: "A price index goes from 120 to 126. What is the inflation rate?", answer: "5 %: 6/120. Not 6 %, which is the change in index points.", accept: ["5", "5%"] },
      { prompt: "Distinguish demand-pull from cost-push inflation.", answer: "Demand-pull: spending exceeds productive capacity. Cost-push: input costs rise and are passed on. Real episodes usually combine both." },
      { prompt: "Why do central banks care about inflation expectations?", answer: "Because expected inflation is built into wage and price setting, so expectations tend to fulfil themselves; anchored expectations make actual inflation easier to control." },
      { prompt: "Who gains from unexpected inflation?", answer: "Borrowers at fixed nominal rates, whose repayments lose real value; lenders and fixed-income recipients lose.", accept: ["borrowers", "debtors"] },
    ],
    applications: ["Reading a CPI release and separating headline from core", "Negotiating a wage or a rent with inflation in mind", "Understanding why a central bank raises rates when prices are already rising"],
    misconception: "That a fall in inflation means prices are falling. Disinflation means prices are rising more slowly; deflation, an actual fall in the level, is rarer and has its own dangers.",
    difficulty: 2,
    foundational: true,
    tags: ["aggregates", "inflation"],
  }),
  concept(MACRO, "ec-aggregates", {
    id: "real-vs-nominal",
    title: "Real versus nominal",
    summary:
      "A nominal figure is counted in money; a real figure is counted in what the money buys. Almost every economic comparison across time is meaningless until it is made in real terms, and the conversion is a division, not a subtraction.",
    keyPoints: [
      "Real value = nominal value ÷ price index (with the index scaled so the base year equals 1). Growth in real terms: (1 + nominal growth) ÷ (1 + inflation) − 1.",
      "The subtraction shortcut, real growth ≈ nominal growth − inflation, is close when both are small and increasingly wrong as they grow: 6 % wages against 8 % inflation is a real fall of 1.85 %, not exactly 2 %.",
      "The real interest rate is the nominal rate adjusted for inflation: (1 + i) = (1 + r)(1 + π), the Fisher relation; the ex ante version uses expected inflation, the ex post version the inflation that occurred.",
      "'Money illusion' is reacting to nominal changes as if they were real: feeling richer after a 3 % raise when prices rose 5 %.",
      "Historical prices need a deflator and a choice of index; a 1950 wage converted with the CPI, with average earnings or with GDP per head gives three different 'today' figures, each answering a different question.",
    ],
    dependsOn: ["inflation", "fractions-ratios-percentages"],
    related: ["interest-rates", "gdp-and-growth", "time-value-of-money", "exponents-and-logarithms"],
    recallPrompts: [
      { prompt: "Wages rose 6 % and prices rose 8 %. What happened to real wages, exactly and approximately?", answer: "Exactly: 1.06/1.08 − 1 = −1.85 %. Approximately: −2 %.", accept: ["-1.85", "-2", "fell about 2%"] },
      { prompt: "State the Fisher relation between nominal and real interest rates.", answer: "(1 + nominal) = (1 + real)(1 + inflation); approximately, real ≈ nominal − inflation.", accept: ["nominal minus inflation", "(1+i)=(1+r)(1+pi)"] },
      { prompt: "What is money illusion?", answer: "Treating a change in a nominal amount as a change in purchasing power, such as welcoming a 3 % pay rise during 5 % inflation." },
    ],
    applications: ["Judging a pay offer, a pension increase or a savings rate", "Reading a chart of house prices, wages or GDP that is labelled 'real' or is not", "Comparing debt burdens across decades"],
    misconception: "That real growth equals nominal growth minus inflation. That is an approximation for small numbers; the exact conversion divides, and at double-digit rates the difference is material.",
    difficulty: 2,
    foundational: true,
    tags: ["aggregates", "measurement"],
  }),
  concept(MACRO, "ec-aggregates", {
    id: "business-cycles",
    title: "Business cycles",
    summary:
      "Economies grow in a trend interrupted by recessions: periods in which output, employment and incomes fall together. Cycles are irregular in length and depth, are usually recognised only after they have begun, and shape both policy and politics.",
    keyPoints: [
      "A recession is a broad, sustained fall in activity; the popular two-quarters-of-falling-GDP rule is a convention, and the US dating committee uses employment, income and production together.",
      "Recessions have different triggers: tight money (US 1981–82), financial crises (2008–09), oil shocks (1973–75), pandemics (2020); the mechanism that spreads them is a fall in spending that becomes a fall in income.",
      "Consumption is smoother than income; investment and durable purchases are volatile and drive most of the swing.",
      "Recessions raise unemployment quickly and lower it slowly; inflation typically falls after the downturn with a lag.",
      "Automatic stabilisers (taxes falling and benefits rising as incomes fall) cushion the cycle without any decision being taken; discretionary policy adds to them, with lags.",
      "Since 1945 rich-country recessions have become rarer and shallower on average, with the 2008–09 crisis a large exception; 'the cycle has been abolished' has been claimed before every major downturn.",
    ],
    dependsOn: ["gdp-and-growth", "unemployment", "inflation"],
    related: ["fiscal-policy", "monetary-policy", "financial-crises", "interwar-and-depression", "regression-to-the-mean"],
    recallPrompts: [
      { prompt: "What is the conventional shorthand definition of a recession, and what is its weakness?", answer: "Two consecutive quarters of falling real GDP; it ignores employment and income, can be triggered by revisions, and misses short sharp downturns." },
      { prompt: "Which component of spending swings most over the cycle?", answer: "Investment (including inventories and housing) and durable goods; consumption of everyday goods is relatively smooth.", accept: ["investment"] },
      { prompt: "What is an automatic stabiliser?", answer: "A feature of the tax and benefit system that cushions incomes in a downturn without any new decision: tax receipts fall and unemployment benefits rise as activity falls." },
    ],
    applications: ["Reading recession-risk commentary and asking what mechanism is proposed", "Planning a business or a career with the cycle in mind", "Understanding why governments and central banks act before a downturn is confirmed"],
    misconception: "That cycles are regular, like waves, and can be timed. Post-war expansions have lasted from one year to over ten; the timing of the next recession is not knowable from the length of the current expansion.",
    difficulty: 3,
    tags: ["aggregates", "cycles"],
  }),
];

/* ------------------------------------------------------------------ */
/* Macroeconomics: policy                                               */
/* ------------------------------------------------------------------ */

const policy: Concept[] = [
  concept(MACRO, "ec-policy", {
    id: "interest-rates",
    title: "Interest rates",
    summary:
      "An interest rate is the price of moving money through time: what a borrower pays to have it now and a lender is paid to wait. Rates link the present to the future, and every asset with fixed future payments moves in the opposite direction to them.",
    keyPoints: [
      "There is no single interest rate but a structure: the central bank's overnight policy rate, government bond yields at each maturity (the yield curve), and lending rates that add a spread for risk and cost.",
      "Bond prices and yields move inversely: a bond paying a fixed 3 % loses value when new bonds pay 4 %, because its fixed coupons are now worth less relative to the alternative.",
      "Longer maturities are more sensitive to a given rate change; a one-year bond barely moves, a thirty-year bond can lose a fifth of its value on a two-point rise.",
      "The real rate (nominal minus expected inflation) is what matters for saving and investment decisions; a 5 % rate with 6 % inflation is a subsidy to borrowers.",
      "An inverted yield curve (short rates above long) has preceded most US recessions since the 1960s, though the lead time varies and the signal is debated.",
      "Rates shape valuations: the present value of any future cash flow falls when the rate used to discount it rises, which is why equities, property and long bonds all fell together in 2022.",
    ],
    dependsOn: ["real-vs-nominal", "exponents-and-logarithms"],
    related: ["time-value-of-money", "bonds-and-interest-rates", "monetary-policy", "exchange-rates", "valuation-basics"],
    recallPrompts: [
      { prompt: "Market rates rise from 3 % to 4 %. What happens to the price of an existing bond with a fixed 3 % coupon, and why?", answer: "It falls below par: its fixed coupons are now worth less than the 4 % available elsewhere, so buyers will pay less until its yield matches.", accept: ["falls", "goes down", "below par"] },
      { prompt: "Why do longer bonds react more to a rate change?", answer: "More of their value sits in distant payments, each discounted over more periods, so a change in the discount rate compounds over a longer horizon." },
      { prompt: "A one-year zero-coupon bond pays 1,000. Rates rise from 2 % to 5 %. What is its new price?", answer: "1,000/1.05 = 952.38, down from 980.39.", accept: ["952", "952.38"] },
    ],
    applications: ["Reading a mortgage offer or a bond fund's duration", "Understanding why a rate rise hits growth stocks and long bonds hardest", "Following a central bank decision through to lending rates and asset prices"],
    misconception: "That a bond with a fixed coupon has a fixed value. The coupon is fixed; the price is whatever makes that coupon competitive with current rates, so the price moves whenever rates do.",
    difficulty: 3,
    foundational: true,
    tags: ["policy", "rates"],
  }),
  concept(MACRO, "ec-policy", {
    id: "fiscal-policy",
    title: "Fiscal policy",
    summary:
      "Fiscal policy is the government's use of spending and taxation to influence demand, and the debt that results when the two do not match. Its effects depend on the multiplier, on what the central bank does in response, and on whether the economy had spare capacity to begin with.",
    keyPoints: [
      "A deficit is a year's shortfall of revenue against spending; debt is the accumulated stock. Debt is usually judged as a ratio to GDP, and can fall as a ratio while rising in absolute terms if the economy grows faster.",
      "The spending multiplier is the change in output per unit of government spending; estimates range roughly from 0.5 to 2 and are higher in recessions, at low interest rates and for spending that reaches people who spend it.",
      "Crowding out: extra government borrowing can raise interest rates and displace private investment when the economy is at capacity; in a slump with idle resources the effect is small.",
      "Automatic stabilisers act without legislation; discretionary stimulus faces recognition, decision and implementation lags and often arrives after the trough.",
      "Debt sustainability turns on the gap between the interest rate and the growth rate: when growth exceeds the rate, a modest primary deficit is consistent with a stable ratio; when the rate exceeds growth, a primary surplus is needed.",
      "Fiscal and monetary policy interact: stimulus that the central bank offsets with higher rates changes the mix of demand rather than the total.",
    ],
    dependsOn: ["business-cycles", "gdp-and-growth"],
    related: ["monetary-policy", "interest-rates", "political-systems", "interwar-and-depression", "second-order-effects"],
    recallPrompts: [
      { prompt: "Distinguish a deficit from debt.", answer: "The deficit is one year's flow of borrowing; debt is the stock accumulated from past deficits less surpluses." },
      { prompt: "When is the spending multiplier likely to be large?", answer: "In a recession with idle resources, when interest rates are low or the central bank does not respond, and when the spending goes to people who spend most of what they receive." },
      { prompt: "What condition makes a debt-to-GDP ratio stable with a small primary deficit?", answer: "The growth rate of nominal GDP exceeding the interest rate on the debt.", accept: ["growth exceeds interest rate", "g > r"] },
    ],
    applications: ["Reading a budget and asking what the multiplier and the central bank's response will be", "Judging debt headlines by the ratio to GDP and by the rate-growth gap", "Understanding why the same stimulus is praised in one decade and blamed in the next"],
    misconception: "That a government budget is like a household's, so debt must be repaid within a lifetime. Governments roll debt indefinitely; what must hold is that the ratio to GDP does not grow without limit, which depends on growth and interest rates rather than on repayment.",
    difficulty: 3,
    tags: ["policy", "fiscal"],
  }),
  concept(MACRO, "ec-policy", {
    id: "labour-markets",
    title: "Labour markets",
    summary:
      "Wages are prices set where employers' demand for hours meets workers' supply of them, with the twist that the 'good' has preferences, that matching takes time, and that institutions such as minimum wages, unions and benefits shape both sides.",
    keyPoints: [
      "Labour demand comes from what a worker adds to output times its price; labour supply reflects the trade-off between income and time, and shifts with demography, migration and participation.",
      "Wage differences across occupations reflect skill scarcity, unpleasantness, training cost, bargaining power and discrimination in proportions that are hard to separate.",
      "A minimum wage set above the market wage reduces employment in the simple competitive model; where employers have wage-setting power (monopsony) a moderate minimum can raise both wages and employment. Studies since Card and Krueger (1994) find small employment effects for moderate minimums; the size is contested.",
      "Matching frictions mean vacancies and unemployed workers coexist; the Beveridge curve tracks that relationship, and its outward shift signals mismatch.",
      "Wages are sticky downward: employers cut hiring and hours before they cut money wages, which is one reason recessions produce unemployment rather than an immediate fall in pay.",
      "The Phillips curve records that low unemployment tends to go with rising wage inflation; the relationship has flattened in recent decades and shifts with expectations.",
    ],
    dependsOn: ["supply-and-demand", "unemployment", "elasticity"],
    related: ["inflation", "demographics-and-population", "organisations-and-incentives", "regression", "experiments-vs-observational"],
    recallPrompts: [
      { prompt: "In the competitive model, what does a minimum wage above the market wage do, and what changes the answer?", answer: "It reduces employment. If employers have wage-setting power (monopsony), a moderate minimum can raise wages and employment together." },
      { prompt: "What is the Beveridge curve?", answer: "The inverse relationship between the vacancy rate and the unemployment rate; an outward shift means more mismatch between jobs and workers." },
      { prompt: "Why do recessions produce unemployment rather than lower wages?", answer: "Money wages are sticky downward; employers cut hiring and hours before pay, so adjustment falls on quantity of jobs rather than their price.", accept: ["sticky wages", "downward wage rigidity"] },
    ],
    applications: ["Reading minimum wage debates with the monopsony question in mind", "Understanding vacancies coexisting with unemployment", "Judging claims about migration and wages by asking which margin is affected"],
    misconception: "That labour is a good like any other. Workers choose, learn, bargain and quit, and hiring is a search; the supply-and-demand diagram is the starting point, not the model.",
    difficulty: 3,
    tags: ["policy", "labour"],
  }),
];

/* ------------------------------------------------------------------ */
/* Money and banking: money                                             */
/* ------------------------------------------------------------------ */

const money: Concept[] = [
  concept(MONEY, "ec-money", {
    id: "money-functions",
    title: "What money is and does",
    summary:
      "Money is whatever a society generally accepts in payment: a medium of exchange, a unit of account and a store of value. Its worth rests on the expectation that others will take it, which is why it can be shells, silver, paper or entries in a ledger, and why it fails when that expectation does.",
    keyPoints: [
      "Three functions: medium of exchange (it removes the double coincidence of wants that barter requires), unit of account (prices are quoted in it), store of value (it keeps purchasing power over time, imperfectly).",
      "Commodity money has intrinsic value (silver, cigarettes in a prison camp); fiat money has none and circulates because the state accepts it for taxes and the law makes it legal tender.",
      "Most money today is bank deposits, not notes and coin; in the UK and the US cash is under a tenth of the broad money stock.",
      "Money is measured in aggregates from narrow (currency and reserves) to broad (deposits and near-deposits); the definitions vary by country and era.",
      "Money is a claim on the future, so its value depends on trust in whoever issues it; hyperinflations are that trust collapsing.",
      "The quantity equation MV = PY is an identity: money times its velocity equals nominal output. It becomes a theory only when velocity is assumed stable, which it has not been since the 1980s.",
    ],
    dependsOn: ["scarcity-and-tradeoffs"],
    related: ["inflation", "banking-and-credit-creation", "central-banks", "early-civilisations", "silk-road"],
    recallPrompts: [
      { prompt: "Name the three functions of money.", answer: "Medium of exchange, unit of account, store of value.", accept: ["medium of exchange, unit of account, store of value"] },
      { prompt: "What problem of barter does a medium of exchange solve?", answer: "The double coincidence of wants: each party must want what the other has, at the same time, in matching quantities.", accept: ["double coincidence of wants"] },
      { prompt: "Why does fiat money have value?", answer: "Because it is generally accepted, the state takes it in payment of taxes and the law makes it legal tender; its value is the expectation that others will accept it." },
      { prompt: "What form does most money take in a modern economy?", answer: "Bank deposits; notes and coin are a small fraction of broad money.", accept: ["bank deposits", "deposits"] },
    ],
    applications: ["Understanding why a currency can lose value with no change in the paper", "Reading money-supply figures and knowing which aggregate is meant", "Judging claims that a new payment technology is 'money'"],
    misconception: "That money is mostly cash, created by printing. Most of it is deposits created by bank lending; the printing press is a small part of the story even in hyperinflations, where the central bank's ledger does the work.",
    difficulty: 2,
    foundational: true,
    tags: ["money"],
  }),
  concept(MONEY, "ec-money", {
    id: "banking-and-credit-creation",
    title: "Banking and credit creation",
    summary:
      "Banks do not lend out deposits they have collected; when a bank makes a loan it creates a new deposit in the borrower's account, and money comes into being. Reserves and capital limit how far this can go, and the fact that deposits are payable on demand while loans are not is why banks can fail suddenly.",
    keyPoints: [
      "A loan creates a matching deposit: the bank's balance sheet grows on both sides. Repaying a loan destroys the deposit. This is how most of the money stock is created and removed.",
      "The textbook money multiplier (deposits = reserves ÷ reserve ratio) describes an upper limit under a binding reserve requirement; in practice lending is limited by creditworthy demand, the bank's capital, and the interest rate the central bank sets. The Bank of England's 2014 bulletin 'Money creation in the modern economy' is the standard statement.",
      "Reserve requirements have become marginal: the US set its requirement to zero in 2020 and the UK has none; capital requirements (equity as a share of risk-weighted assets, under the Basel rules) are the binding constraint.",
      "Maturity transformation: banks fund long-term loans with deposits withdrawable on demand. This is useful and fragile; a bank can be solvent and still fail if depositors run.",
      "Deposit insurance and the central bank's lender-of-last-resort role exist to stop runs; they also create moral hazard, which is why banks are regulated and supervised.",
      "Northern Rock in September 2007 was the first run on a British bank since 1866; Silicon Valley Bank in March 2023 lost 42 billion dollars of deposits in a day, a run conducted by smartphone.",
    ],
    dependsOn: ["money-functions", "fractions-ratios-percentages"],
    related: ["central-banks", "financial-crises", "interest-rates", "financial-statements", "independence"],
    recallPrompts: [
      { prompt: "What happens to the money stock when a bank makes a 10,000 loan?", answer: "It rises by 10,000: the bank credits the borrower's account with a new deposit, matched by the loan on its asset side.", accept: ["increases by 10,000", "rises", "creates a deposit"] },
      { prompt: "With a 10 % reserve ratio and 1,000 of new reserves, what is the textbook maximum expansion of deposits, and why is the real figure usually smaller?", answer: "10,000 (1,000 ÷ 0.1). In practice lending is limited by loan demand, bank capital and the policy rate, and banks hold reserves beyond the minimum.", accept: ["10,000", "10000"] },
      { prompt: "What is maturity transformation and why does it make banks fragile?", answer: "Funding long-term, illiquid loans with short-term deposits. If many depositors withdraw at once the bank cannot sell its loans fast enough, so a solvent bank can fail." },
    ],
    applications: ["Reading a central bank's balance-sheet policy or a bank's capital ratio", "Understanding why credit booms and busts amplify the business cycle", "Judging the claim that 'the government printed money' during a crisis"],
    misconception: "That banks are intermediaries that take in savings and lend them out. They create deposits by lending; savings are what is left after the money exists, not the source of it.",
    difficulty: 4,
    tags: ["money", "banking"],
  }),
  concept(MONEY, "ec-money", {
    id: "central-banks",
    title: "Central banks",
    summary:
      "A central bank is the bank of the banks and the state: it issues the currency, sets the short-term interest rate, holds the reserves of the banking system, lends to it in a panic, and in most rich countries pursues an inflation target with operational independence from government.",
    keyPoints: [
      "Core functions: monetary policy (the policy rate and the balance sheet), lender of last resort, oversight of the payment system, and often bank supervision. The oldest surviving one is Sweden's Riksbank (1668); the Bank of England dates from 1694.",
      "Bagehot's rule (Lombard Street, 1873): in a panic lend freely, at a penalty rate, against good collateral. It is still the template, and the 2008 and 2020 interventions stretched every clause of it.",
      "Independence, widespread since the 1990s, means the government sets the goal and the central bank chooses the instrument; the rationale is that politicians facing elections prefer low rates now and inflation later.",
      "Inflation targeting, begun in New Zealand in 1990, is the dominant framework: a public numerical target, usually 2 %, and a published account of how the bank expects to meet it. The US Federal Reserve has a dual mandate covering employment as well.",
      "Quantitative easing (buying government bonds with newly created reserves) was the main tool when policy rates reached zero after 2008; its effects on inflation are debated and its effects on asset prices less so.",
      "Central banks also hold foreign reserves and may intervene in the currency, and they act as the government's banker; their accounts are consolidated with the state's in the end, which is why 'central bank losses' are a fiscal matter.",
    ],
    dependsOn: ["banking-and-credit-creation", "interest-rates"],
    related: ["monetary-policy", "financial-crises", "institutions-and-rule-of-law", "governance-and-legitimacy"],
    recallPrompts: [
      { prompt: "State Bagehot's rule for a lender of last resort.", answer: "Lend freely, at a penalty rate, against good collateral.", accept: ["lend freely", "penalty rate", "good collateral"] },
      { prompt: "Why are central banks made independent of elected governments?", answer: "Because governments facing elections have an incentive to stimulate before votes and accept inflation after; delegating the instrument to an institution with a fixed target anchors expectations." },
      { prompt: "What is quantitative easing?", answer: "The central bank buying assets, mainly government bonds, with newly created reserves, to lower long-term rates when the policy rate is near zero.", accept: ["buying bonds", "asset purchases"] },
    ],
    applications: ["Reading a central bank statement and identifying target, forecast and instrument", "Following a banking panic and asking whether the lender of last resort is acting", "Understanding disputes about central bank independence and mandates"],
    misconception: "That a central bank 'controls the money supply' directly. It sets the price of reserves (the policy rate) and their quantity in its own balance sheet; broad money is created by commercial banks lending, which the central bank influences but does not dictate.",
    difficulty: 3,
    tags: ["money", "institutions"],
  }),
  concept(MONEY, "ec-money", {
    id: "monetary-policy",
    title: "Monetary policy",
    summary:
      "Monetary policy is the use of the interest rate to keep inflation near target by cooling or warming demand. Higher rates raise the cost of borrowing, lower asset prices, strengthen the currency and reward saving; spending slows, firms lose pricing power, wage growth eases, and inflation falls with a lag of a year or more.",
    keyPoints: [
      "The transmission mechanism runs through several channels: borrowing costs (mortgages, business loans), asset prices (bonds, shares, houses), the exchange rate (a stronger currency makes imports cheaper), bank lending, and expectations.",
      "The effect on inflation comes with 'long and variable lags', in Friedman's phrase, conventionally put at one to two years for the full effect; the size and timing are themselves uncertain, so central banks act on forecasts, not on the latest print.",
      "The Taylor rule summarises the usual reaction: raise the policy rate more than one-for-one with inflation above target, and raise it when output is above potential. Raising less than one-for-one leaves the real rate falling and fuels the inflation.",
      "A demand-driven inflation is straightforward to fight; a supply shock (energy, harvest, pandemic) raises prices while cutting output, and tightening reduces inflation only by deepening the output loss. The choice is a judgement about how anchored expectations are.",
      "Volcker's Federal Reserve raised its policy rate to around 19 to 20 % in 1981; US inflation fell from about 13.5 % in 1980 to about 3 % by 1983 at the cost of a recession with unemployment near 11 %. The 2022–23 tightening, from near zero to 5.25 to 5.5 % in the US and 5.25 % in the UK, brought inflation down with a smaller employment cost than most forecasters expected.",
      "At the zero lower bound the policy rate cannot fall further; quantitative easing, forward guidance and negative rates were the substitutes after 2008.",
    ],
    dependsOn: ["central-banks", "inflation", "interest-rates"],
    related: ["fiscal-policy", "exchange-rates", "business-cycles", "decision-vs-outcome-quality", "forecasting-and-calibration"],
    recallPrompts: [
      { prompt: "Explain in three steps why raising the interest rate lowers inflation.", answer: "1. Borrowing costs rise and asset prices fall, so households and firms spend and invest less. 2. Weaker demand removes firms' room to raise prices and slows wage growth. 3. With expectations anchored by a credible target, price rises slow, after a lag of a year or more. A stronger currency also cheapens imports along the way." },
      { prompt: "Why do central banks act on forecasts rather than on the latest inflation figure?", answer: "Because the effect of a rate change on inflation arrives with a lag of roughly one to two years; reacting to today's print would set policy for an economy that no longer exists by the time it bites." },
      { prompt: "What does the Taylor principle say about the response to inflation?", answer: "Raise the nominal policy rate more than one-for-one with inflation, so that the real rate rises; otherwise policy loosens as inflation increases.", accept: ["more than one-for-one", "real rate must rise"] },
      { prompt: "Why is a supply shock harder for a central bank than excess demand?", answer: "Because it raises prices while lowering output; higher rates cut inflation only by cutting demand further, so the bank must trade a deeper downturn against the risk that expectations de-anchor." },
    ],
    applications: ["Explaining a rate decision and its likely effect on mortgages, shares and the currency", "Judging whether a central bank is 'behind the curve' by comparing the real policy rate with inflation", "Reading the 2021–23 inflation episode as a mix of demand, supply shocks and lags"],
    misconception: "That raising rates fights inflation by making things more expensive, or that it works within weeks. Higher rates lower inflation by reducing demand, and the effect takes a year or more to appear; the immediate effect on measured inflation can even be upward through mortgage costs.",
    difficulty: 4,
    foundational: true,
    tags: ["money", "policy", "inflation"],
  }),
];

/* ------------------------------------------------------------------ */
/* Money and banking: the global economy                                */
/* ------------------------------------------------------------------ */

const global: Concept[] = [
  concept(MONEY, "ec-global", {
    id: "exchange-rates",
    title: "Exchange rates and currencies",
    summary:
      "An exchange rate is the price of one currency in another, set in the largest market in the world by the demand for a country's goods, assets and interest rates against the supply of its currency from imports and outward investment. A currency strengthens when more of the world wants to hold it.",
    keyPoints: [
      "Demand for a currency comes from foreigners buying the country's exports and assets; supply comes from residents buying imports and foreign assets. Higher interest rates, stronger growth and safe-haven status raise demand.",
      "A rate rise, other things equal, appreciates the currency in the short run as capital flows in seeking the higher return; in the long run purchasing-power parity says currencies of high-inflation countries depreciate to offset the price gap.",
      "Appreciation makes imports cheaper and exports dearer, so it cools inflation and hurts exporters; depreciation does the reverse. This is a channel of monetary policy.",
      "Fixed exchange rates trade flexibility for credibility: to hold a peg the central bank must follow the anchor country's interest rates and hold reserves to defend it; pegs that lose credibility are attacked, as sterling's was in 1992.",
      "The Bretton Woods system of fixed rates against the dollar ended in 1971–73; most large currencies have floated since, with managed floats and pegs common among smaller economies.",
      "The 'impossible trinity': a country cannot have a fixed exchange rate, free capital movement and an independent monetary policy at the same time; it must give up one.",
    ],
    dependsOn: ["supply-and-demand", "interest-rates"],
    related: ["monetary-policy", "international-trade", "inflation", "geopolitics", "globalisation-era"],
    recallPrompts: [
      { prompt: "A central bank raises rates while others hold. What happens to its currency in the short run, and through what mechanism?", answer: "It tends to appreciate: investors move funds to earn the higher return, raising demand for the currency.", accept: ["appreciates", "strengthens", "rises"] },
      { prompt: "State the impossible trinity.", answer: "A country can have at most two of: a fixed exchange rate, free capital movement, and an independent monetary policy." },
      { prompt: "Sterling falls from 1.30 to 1.17 dollars. Is that good for a UK importer or a UK exporter?", answer: "The exporter: its dollar prices fall or its sterling receipts rise. The importer pays about 11 % more in sterling for the same dollar goods.", accept: ["exporter", "exporters"] },
    ],
    applications: ["Reading a currency move after a central bank decision", "Judging who gains and loses from a weak currency", "Understanding why some countries peg and what it costs them"],
    misconception: "That a strong currency is a sign of a strong economy and always desirable. It is the price of the currency, not a grade; a strong currency helps consumers and importers and hurts exporters, and can reflect capital flight into a safe haven rather than domestic strength.",
    difficulty: 3,
    tags: ["global", "currencies"],
  }),
  concept(MONEY, "ec-global", {
    id: "international-trade",
    title: "International trade",
    summary:
      "Countries trade for the same reason people do: comparative advantage, scale and variety. The gains are large in total and unevenly spread, which is why trade policy is contested; and a trade deficit is not a loss but the mirror image of capital flowing in.",
    keyPoints: [
      "Trade balance = exports − imports of goods and services; the current account adds income flows. By accounting identity a current account deficit equals a net inflow of foreign capital: the country sells assets or borrows abroad to pay for the extra imports.",
      "Equivalently, the current account equals national saving minus investment. A deficit means a country invests more than it saves; whether that is a problem depends on what the investment earns.",
      "A tariff raises the domestic price, helps domestic producers and the treasury, and costs consumers more than the two gain; the net loss is small per tariff and the losses to consumers are diffuse, which is why tariffs are politically durable.",
      "Bilateral balances are meaningless in isolation: a country can run a deficit with one partner and a surplus with another while the overall balance reflects saving and investment. Tariffs on one partner shift trade rather than closing the total deficit.",
      "Trade's aggregate gains hide concentrated losses; the 'China shock' literature (Autor, Dorn and Hanson, 2013) found large, persistent employment losses in exposed US regions after 2001, while consumers gained diffusely.",
      "The post-war order (GATT from 1947, the WTO from 1995) lowered average tariffs in rich countries from around 20 to 40 % to low single digits; world trade as a share of output roughly doubled between 1970 and 2008 and has plateaued since.",
    ],
    dependsOn: ["comparative-advantage", "exchange-rates"],
    related: ["economic-development", "globalisation-era", "chokepoints-and-trade-routes", "geopolitics", "operations-and-supply-chains"],
    recallPrompts: [
      { prompt: "A country runs a persistent trade deficit. What must be true on the capital side?", answer: "It is a net importer of capital: foreigners are acquiring its assets or lending to it by the same amount.", accept: ["net capital inflow", "borrowing from abroad", "foreigners buy its assets"] },
      { prompt: "Who gains and who loses from a tariff, and why is the net effect negative?", answer: "Domestic producers and the treasury gain; consumers lose more than the two gain, because some trades that were worth making no longer happen." },
      { prompt: "Why will a tariff on the largest trading partner not close a country's overall trade deficit?", answer: "The overall balance is set by national saving minus investment; a bilateral tariff diverts trade to other partners without changing that gap." },
    ],
    applications: ["Reading trade-war headlines with the saving-investment identity in mind", "Judging who a tariff protects and who pays", "Understanding regional decline after trade liberalisation"],
    misconception: "That a trade deficit means a country is 'losing' to its partners. The deficit is matched by foreigners investing in the country; it can be a sign of an attractive economy, of low saving, or of both, and its sign alone says nothing about welfare.",
    difficulty: 4,
    tags: ["global", "trade"],
  }),
  concept(MONEY, "ec-global", {
    id: "economic-development",
    title: "Economic development",
    summary:
      "Why some countries are thirty times richer per person than others is the largest question in economics. The answers converge on institutions that protect property and contracts, investment in people, openness to trade and ideas, and the slow accumulation of productivity, with geography and history setting the starting conditions.",
    keyPoints: [
      "Before about 1800, incomes everywhere hovered near subsistence; sustained growth began with industrialisation in Britain and spread unevenly, producing the 'great divergence' between regions that lasted through the twentieth century.",
      "Since 1990 the share of the world's population in extreme poverty (under the World Bank's line, most recently 2.15 dollars a day at 2017 prices) fell from roughly 38 % to under 10 % before the pandemic, with China and India accounting for most of the change.",
      "Growth accounting attributes most rich-poor differences to productivity rather than to capital per worker; productivity in turn depends on institutions, technology adoption and the allocation of resources across firms.",
      "Institutional explanations (North; Acemoglu and Robinson) emphasise secure property rights, constraints on rulers and inclusive political systems; geographic ones (Diamond; Sachs) emphasise disease burden, climate and access to coasts. The weight of each is contested.",
      "The East Asian growth episodes (Japan, Korea, Taiwan, then China) combined high saving, export orientation, mass education and state direction in proportions that resist a single recipe.",
      "Foreign aid's growth effect is small and disputed; targeted programmes (vaccination, bed nets, cash transfers) have measured benefits, which is why development economics moved toward randomised evaluation (Banerjee, Duflo and Kremer, Nobel 2019).",
    ],
    dependsOn: ["gdp-and-growth", "international-trade"],
    related: ["industrial-revolution", "institutions-and-rule-of-law", "decolonisation", "randomised-experiments", "demographics-and-population"],
    recallPrompts: [
      { prompt: "What is the 'great divergence'?", answer: "The opening of a large gap in income per person between industrialising regions (first Britain and western Europe) and the rest of the world from about 1800." },
      { prompt: "Roughly how did the global extreme-poverty rate change from 1990 to 2019?", answer: "From about 38 % to under 10 %, driven mainly by China and India.", accept: ["38 to under 10", "fell to under 10%"] },
      { prompt: "Name the two broad families of explanation for cross-country income differences.", answer: "Institutional (property rights, constraints on power, inclusive politics) and geographic (disease, climate, coasts); most economists give institutions more weight but the split is contested." },
    ],
    applications: ["Reading a development statistic with the poverty line and price base in mind", "Judging claims about why a country grew or stagnated", "Understanding the case for and against aid and for randomised evaluation"],
    misconception: "That poor countries are poor because they lack capital, so investment aid closes the gap. Capital flows to where it is productive; where institutions do not protect it, added capital leaks or idles, which is why productivity rather than capital dominates the accounting.",
    difficulty: 4,
    tags: ["global", "development"],
  }),
  concept(MONEY, "ec-global", {
    id: "financial-crises",
    title: "Financial crises",
    summary:
      "Financial crises follow a pattern old enough to be a genre: cheap credit inflates an asset, leverage multiplies the gains, a price fall makes leveraged holders sell, sales push prices down further, and institutions that borrowed short to lend long find their funding gone. What turns a loss into a crisis is the mechanism, not the size of the initial shock.",
    keyPoints: [
      "The Minsky sequence: stability breeds risk-taking; borrowing moves from hedge (interest and principal covered by income) to speculative (interest only) to Ponzi (relying on rising prices); a shock reverses it.",
      "Leverage means a small fall in asset prices wipes out a large share of equity: with 30-to-1 leverage, a 3.3 % fall is total; Lehman Brothers was leveraged around 30 to 1 in 2007.",
      "Fire sales are the amplifier: forced sellers depress prices, which forces others to sell, so losses spread to holders who never borrowed. Mark-to-market accounting transmits them instantly.",
      "Runs (Diamond and Dybvig, 1983) can hit solvent institutions because withdrawing first is individually rational once others might; in 2007–08 the run was in wholesale funding and repo, not queues at branches.",
      "Contagion runs through counterparty exposure, common holdings and loss of confidence; after Lehman failed on 15 September 2008 the interbank market stopped, and the crisis became global within days.",
      "Remedies: the lender of last resort for illiquid institutions, recapitalisation for insolvent ones, deposit insurance for runs, capital and liquidity rules to reduce leverage beforehand. Reinhart and Rogoff's record of eight centuries of crises suggests the belief 'this time is different' is the most reliable leading indicator.",
    ],
    dependsOn: ["banking-and-credit-creation", "business-cycles", "independence"],
    related: ["bubbles-and-manias", "central-banks", "interwar-and-depression", "risk-and-diversification", "second-order-effects"],
    recallPrompts: [
      { prompt: "Why does leverage turn a modest price fall into insolvency?", answer: "Equity is a thin slice of assets; with assets at 30 times equity, a fall of about 3.3 % in asset value erases the equity entirely.", accept: ["equity is small", "thin equity", "3.3%"] },
      { prompt: "What is a fire sale and why does it spread losses to unleveraged holders?", answer: "Forced selling by leveraged holders pushes prices below fundamental value, so everyone marking to market shows losses and some are forced to sell in turn." },
      { prompt: "Why can a solvent bank fail?", answer: "Because its assets are long-term and illiquid while its funding is short-term; if funders withdraw together it cannot raise cash fast enough, and withdrawing first is rational once a run is possible." },
      { prompt: "State the three-part policy response to a systemic crisis.", answer: "Liquidity from the lender of last resort for solvent-but-illiquid institutions, recapitalisation for insolvent ones, and guarantees or insurance to stop runs; then tighter capital rules to reduce leverage." },
    ],
    applications: ["Reading a bank failure and separating liquidity from solvency", "Recognising a Minsky sequence in a housing or crypto boom", "Judging the trade-off between rescuing institutions and moral hazard"],
    misconception: "That crises are caused by the size of the initial loss. Subprime mortgage losses in 2007 were a few hundred billion dollars against global financial assets in the hundreds of trillions; what made them a crisis was leverage, maturity mismatch and the fire-sale loop.",
    difficulty: 5,
    tags: ["global", "crises"],
  }),
];

export const ECONOMICS_CONCEPTS: Concept[] = [...markets, ...structure, ...aggregates, ...policy, ...money, ...global];
