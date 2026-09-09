/**
 * Statistics — lessons and domain assembly. Concepts live in ./statistics-a.ts.
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Seven lessons: ls-st-descriptive-1, ls-st-sampling-1, ls-st-sampling-2, ls-st-inference-1,
 * ls-st-inference-2, ls-st-inference-3, ls-st-studies-1. Every guided, independent and transfer step
 * references items from src/content/v2/items/statistics.ts. The exam-only items
 * (it-statistics-24 … 26) are never referenced here.
 */
import type { Lesson } from "@/lib/v2/content-types";
import { scaffoldDomain } from "./_helpers";
import { STATISTICS_CONCEPTS } from "./statistics-a";

/* ------------------------------------------------------------------ */
/* Module st-descriptive                                                */
/* ------------------------------------------------------------------ */

const lsDescriptive1: Lesson = {
  id: "ls-st-descriptive-1",
  moduleId: "st-descriptive",
  conceptIds: ["descriptive-statistics", "correlation"],
  title: "Centre, spread and co-movement",
  promise: "By the end you will choose the right summary for a column of numbers, compute a standard deviation by hand, and read a correlation coefficient for exactly what it says and nothing more.",
  minutes: 26,
  difficulty: 2,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Which average?",
      prompt: "A small firm has nine staff paid £28,000 to £40,000 and one director paid £190,000. A job advert says 'average salary £50,000'. Is the advert lying? Write down what you think the mean and the median are, and which one the advert used.",
      thinkSeconds: 45,
      reveal: "Nine salaries averaging about £34,000 plus one of £190,000 give a mean of roughly £50,000 and a median of about £34,000. The advert is not lying; it chose the mean, and the mean is the one statistic the director's salary moves. The word 'average' covers both, which is why a writer who does not say which has told you less than it seems. The habit to build is to ask, of every summary number, what it would take to move it.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why summarise at all",
      body: {
        standard:
          "A column of ten thousand numbers cannot be held in the mind. Descriptive statistics replace it with a handful of numbers that answer the questions people actually have: where is the middle, how far do values spread, and what shape does the pile make. The danger is that each summary answers its question in a particular way, and the way matters. The mean is the balance point: add everything, divide by the count, and every value has a vote proportional to its size. The median is the middle rank: half the values sit below it, and the size of the extreme values is irrelevant. For symmetric data the two coincide. For incomes, house prices, hospital stays and file sizes, which have a long tail on the right, the mean sits above the median, and the gap between them is itself a description of the shape.\n\nSpread needs its own number. Two classes can share a mean mark of 60 while one has everyone between 55 and 65 and the other has half at 30 and half at 90. The standard deviation is the usual measure: the typical distance of a value from the mean, computed by squaring distances so that negative and positive ones do not cancel. It is in the original units, and for bell-shaped data roughly two-thirds of values lie within one standard deviation of the mean and 95 % within two.\n\nCorrelation extends the idea to two columns at once. Francis Galton, measuring parents and children in the 1880s, wanted a number for how much one variable's variation tracked another's; Karl Pearson formalised it as r, which runs from −1 through 0 to +1. In 1973 Frank Anscombe published four small datasets with the same means, the same standard deviations, the same r of 0.82 and the same fitted line, one of which is a clean linear relation, one a curve, one a line with a single outlier and one a vertical stack with one leverage point. The lesson of the quartet is that summaries are for after you have looked, not instead of looking.",
        intuition:
          "The mean is what you get if every value pulls on a beam; the median is the value in the middle of the queue. One giant value moves the beam and not the queue. The standard deviation is the typical distance from the mean. The correlation is how tightly two columns move together along a straight line: close to 1 or −1 is tight, close to 0 is loose, and the sign is the direction. None of these numbers tell you why anything happens.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "The five summaries",
      body: {
        standard:
          "Mean: x̄ = Σx/n. Median: the middle value when sorted, or the mean of the two middle values for an even count. Mode: the most frequent value, useful mainly for categories. Standard deviation of a sample: s = √[Σ(x − x̄)²/(n − 1)]; the variance s² is the same quantity before the square root. Dividing by n − 1 rather than n compensates for measuring deviations from the sample's own mean, which makes them slightly too small on average. The interquartile range, from the 25th to the 75th percentile, is the median's companion: a spread measure that ignores the tails.\n\nShape: when the mean exceeds the median, the data are right-skewed; when it falls below, left-skewed. Report the median and interquartile range for skewed data and the mean and standard deviation for roughly symmetric data, and say which you used.\n\nCorrelation: r = Σ[(x − x̄)(y − ȳ)] / [(n − 1) sₓ sᵧ], the average product of standardised deviations. Its properties: it lies in [−1, 1]; it has no units and is unchanged by rescaling either variable; it measures linear association only, so a perfect U-shaped relation can have r = 0; it is pulled strongly by outliers; and r² is the share of one variable's variance accounted for by a straight-line fit on the other. r is not a slope, not a share of cases, and not evidence about which variable drives which, if either does.",
        intuition:
          "Mean for balance, median for the middle, SD for typical distance, IQR for spread without the tails. Mean above median means a tail on the right. r between −1 and 1 for linear co-movement, r² for the share of variance shared, and neither one says anything about cause.",
        deep:
          "The n − 1 divisor makes s² an unbiased estimator of the population variance: E[Σ(x − x̄)²] = (n − 1)σ², because the deviations satisfy one linear constraint (they sum to zero) and so carry n − 1 degrees of freedom. The mean minimises the sum of squared deviations and the median minimises the sum of absolute deviations, which is why the mean responds to the size of outliers and the median only to their side. Pearson's r is the cosine of the angle between the two centred data vectors, which explains its range, its invariance to scale and its blindness to curvature: a nonlinear relation is not a rotation. Spearman's rank correlation replaces values by ranks and so captures any monotone relation and resists outliers, at the cost of ignoring magnitudes.",
      },
      structure: [
        { term: "Mean and median", meaning: "Balance point versus middle rank; the gap between them signals skew and its direction." },
        { term: "Standard deviation", meaning: "√[Σ(x − x̄)²/(n − 1)]: typical distance from the mean, in the data's units." },
        { term: "Interquartile range", meaning: "75th minus 25th percentile: spread that ignores the tails; pairs with the median." },
        { term: "Correlation r", meaning: "Linear co-movement in [−1, 1]; unitless; r² is the shared share of variance; no causal content." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Ten response times",
      problem: "A help desk records the minutes taken to answer ten tickets: 2, 3, 3, 4, 4, 5, 5, 6, 8, 20. Summarise the data and say which summary a manager should quote as 'typical'.",
      steps: [
        { text: "Sort and count: the data are already sorted, n = 10. Median = mean of the 5th and 6th values = (4 + 5)/2 = 4.5 minutes. Mean = 60/10 = 6 minutes.", note: "Mean above median: a right tail. One glance at the 20 tells you which value is responsible." },
        { text: "Deviations from the mean: −4, −3, −3, −2, −2, −1, −1, 0, 2, 14. Squared and summed: 16 + 9 + 9 + 4 + 4 + 1 + 1 + 0 + 4 + 196 = 244. Sample variance = 244/9 ≈ 27.1; s ≈ 5.2 minutes.", note: "The single value of 20 contributes 196 of the 244: 80 % of the variance from 10 % of the data." },
        { text: "Repeat without the 20-minute ticket: mean 4.4, median 4, s ≈ 1.8. The median moved by half a minute; the mean by 1.6 minutes; the standard deviation nearly tripled.", note: "This is the sensitivity of squared-deviation statistics to a tail, shown rather than asserted." },
        { text: "Report: 'Typical response 4 to 5 minutes (median 4.5, interquartile range about 3 to 6); one ticket took 20 minutes.' The mean of 6 is true and would mislead; the outlier is worth a sentence of its own, not deletion.", note: "Which summary to quote is a question about purpose. For 'what should a customer expect', the median; for 'total staff time', the mean, since it multiplies back to the total." },
      ],
      answer: "Median 4.5 min, mean 6 min, s ≈ 5.2 min (1.8 without the outlier). Quote the median and interquartile range as typical, and report the outlier separately.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "By hand once",
      scaffold: "Write the mean first, then a column of deviations, then their squares. Check that the deviations sum to zero before squaring; if they do not, the mean is wrong.",
      itemIds: ["it-statistics-01"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-02", "it-statistics-04"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague why a report should say which average it used, and how the gap between mean and median tells you the shape of the data. Then state two things a correlation of 0.8 does not tell you.",
      keyPoints: ["outlier|extreme|tail|pulled|drag", "median|middle|half", "skew|right-skewed|long tail|shape", "caus|which drives|why", "linear|curve|slope|r²|r squared|share of variance"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Drownings and a truncated axis",
      framing: "Two settings where the summary is right and the reading goes wrong: a correlation that invites a causal story, and a chart whose axis does the lying for it.",
      itemIds: ["it-statistics-03", "it-statistics-22"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Module st-sampling                                                   */
/* ------------------------------------------------------------------ */

const lsSampling1: Lesson = {
  id: "ls-st-sampling-1",
  moduleId: "st-sampling",
  conceptIds: ["sampling-and-bias", "sampling-variability"],
  title: "Who did you ask, and how much does the answer wobble",
  promise: "By the end you will separate the two ways a sample can be wrong, bias and variability, know which one more data fixes, and compute the standard error that measures the other.",
  minutes: 28,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Two polls",
      prompt: "In 1936 one poll collected 2.4 million postcards and predicted that Alf Landon would beat Franklin Roosevelt comfortably. Another surveyed about 50,000 people and predicted Roosevelt. Roosevelt won 46 of 48 states. Before reading on: what could go wrong with a poll of 2.4 million people that did not go wrong with a poll of 50,000?",
      thinkSeconds: 60,
      reveal: "The Literary Digest mailed its ballots to lists of car owners, telephone subscribers and its own readers, who in the Depression leaned to the better-off, and only about a quarter of those mailed sent a card back, a group who differed again from those who did not. Two and a half million answers from the wrong people. George Gallup's much smaller sample was designed to resemble the electorate. Size controls one kind of error and has no effect on the other; that distinction is the entire lesson.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Two kinds of wrong",
      body: {
        standard:
          "A sample can miss the truth in two quite different ways. It can be biased: the people reached differ systematically from the people meant to be described, so that even an infinitely large sample of the same kind would converge on the wrong number. Or it can be noisy: the people reached are a fair draw, but a different fair draw would have given a somewhat different answer, and the smaller the draw, the larger the difference. Bias comes from the frame (who could be reached), from non-response (who chose to answer) and from measurement (how the question was put). Noise comes from chance, and chance is the one part of the problem that mathematics can quantify.\n\nThe quantity that does the quantifying is the standard error: the standard deviation of the sample statistic across all the samples you might have drawn. For a mean it is the population spread divided by the square root of the sample size, σ/√n. The square root is the expensive part. Four times the data buys half the noise; a hundred times buys a tenth. Abraham de Moivre wrote the formula down in the 1730s, and Howard Wainer has called it the most dangerous equation in the world, because ignoring it leads intelligent people to find causes for what is only small-sample noise: the small schools that top and bottom the league tables, the small counties with the highest and the lowest cancer rates, the small hospitals with the best and the worst survival.\n\nThe two errors need two different remedies. Noise is reduced by a bigger sample. Bias is reduced only by changing who is reached: random selection from a complete frame, chasing non-responders, weighting to known population totals. A survey that reports a margin of error has told you about its noise. It has told you nothing about its bias, and the bias is usually the larger of the two.",
        intuition:
          "Bias is aiming at the wrong target; noise is a shaky hand. More arrows steady the hand and do nothing about the aim. The standard error measures the shake, and it shrinks with the square root of the number of arrows, so precision is expensive. A margin of error describes the shake only.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Frames, response and the standard error",
      body: {
        standard:
          "A probability sample gives every unit in the population a known, non-zero chance of selection; simple random sampling gives them all the same chance. Only for probability samples can the sampling error be computed. Sources of bias: coverage (the frame omits part of the population), non-response (those who answer differ from those who do not), and measurement (the instrument or the question distorts). Remedies: a complete frame, follow-up of non-responders, neutral wording, and post-stratification weighting to census totals, which corrects imbalance on the weighted dimensions and nothing else.\n\nSampling variability: the sampling distribution of a statistic is the distribution of its values across repeated samples of the same size. For the mean, its centre is the population mean and its standard deviation, the standard error, is σ/√n, estimated by s/√n. For a proportion, SE = √(p(1 − p)/n), at most 0.5/√n. The central limit theorem says that for moderate n the sampling distribution of a mean is close to normal whatever the shape of the data, which is why 'estimate ± 2 SE' works so widely. The standard deviation describes the data and does not shrink with n; the standard error describes the estimate and does. Confusing them is the commonest error in reading error bars.\n\nSmall samples give extreme results in both directions. A statistic from n = 15 has a standard error more than four times that of the same statistic from n = 300, so the tails of any league table are populated by small units, and the correct first response to an extreme figure from a small unit is to compute its standard error, not to explain it.",
        intuition:
          "Random sample from a complete list, chase the ones who did not answer, ask neutrally, weight to the census: that is the bias toolkit. SE = SD/√n: that is the noise formula. Data spread stays put as n grows; estimate precision improves with √n. Small units swing to both extremes.",
        deep:
          "Under simple random sampling without replacement from a finite population of size N, the variance of the mean is (σ²/n)(1 − n/N); the finite-population correction matters only when the sample is a sizeable fraction of the population, which is why the electorate's size is irrelevant to a poll of 1,000. Stratified sampling reduces variance by sampling within homogeneous strata; cluster sampling (whole schools, whole villages) increases it through the design effect, roughly 1 + (m − 1)ρ for clusters of size m with intra-cluster correlation ρ. Non-response bias is proportional to the response-rate shortfall times the difference between responders and non-responders, so a 25 % response rate with modest differences can outweigh any conceivable sampling error, which is Meng's 2018 point about the Literary Digest and about modern big data alike.",
      },
      structure: [
        { term: "Bias", meaning: "Systematic gap between those reached and those meant; from coverage, non-response, measurement; unaffected by n." },
        { term: "Sampling variability", meaning: "Sample-to-sample wobble of a fair sample; quantified by the standard error; shrinks as 1/√n." },
        { term: "Standard error of a mean", meaning: "σ/√n, estimated by s/√n. Quadruple n to halve it." },
        { term: "SD versus SE", meaning: "SD describes the data and stays put; SE describes the estimate and falls with n." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Sizing a poll and diagnosing another",
      problem: "(a) A polling firm wants the 95 % margin of error on a vote share near 50 % to be ±3 points. How many respondents does it need? (b) A retailer emails a satisfaction survey to all customers and gets 4,000 replies, 91 % satisfied. It wants to quote '91 % ± 0.9 %'. Assess the claim.",
      steps: [
        { text: "(a) For a proportion near 0.5, SE = 0.5/√n and the 95 % margin is about 1.96 × SE ≈ 1/√n. Set 1/√n = 0.03: √n ≈ 33.3, n ≈ 1,100.", note: "This is why national polls so often have around a thousand respondents: it is the cost of ±3 points, and ±1.5 would cost four times as much." },
        { text: "Check the finite-population question: does it matter that the electorate is 40 million rather than 400,000? No. The standard error depends on n, not on the population size, until the sample is a sizeable fraction of the population.", note: "A common objection, and a wrong one. A spoonful tastes the soup whether the pot is small or large, provided the soup is stirred." },
        { text: "(b) The arithmetic: SE = √(0.91 × 0.09/4000) ≈ 0.0045, so ±0.9 points is the correct random-sampling margin for n = 4,000. The arithmetic is not the problem.", note: "Compute what the claim would mean if the sample were random, then ask whether it is." },
        { text: "The sample is not random. Everyone was emailed; 4,000 replied. If that is 8 % of customers, the 92 % who did not reply may differ enormously: the angry reply and the delighted reply, the indifferent delete. The true satisfaction could be 70 % or 95 %, and no margin of error computed from the 4,000 says which.", note: "Non-response bias is proportional to the non-response rate times the responder/non-responder difference; with 92 % non-response even a small difference swamps ±0.9." },
        { text: "Report: '91 % of the 8 % of customers who replied were satisfied; this cannot be generalised to all customers without follow-up of non-responders or a randomly selected panel.'", note: "The honest sentence names the frame and the response rate before the percentage." },
      ],
      answer: "(a) About 1,100 respondents. (b) The ±0.9 is the right noise figure for a random sample of 4,000 and the wrong thing to quote, because self-selection bias, not noise, is the dominant error.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "The formula, once",
      scaffold: "Write the formula with symbols first, identify what each symbol is in the problem, then substitute. Note which number in the problem is not needed.",
      itemIds: ["it-statistics-07"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-05", "it-statistics-08"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to someone who has just been told that a survey is 'accurate to ±3 %' what that figure does and does not cover, and why a larger sample would not have saved the Literary Digest.",
      keyPoints: ["random|sampling error|noise|chance", "bias|systematic|frame|non-response|self-select|who answered", "does not shrink|not fixed by|no effect|any size|regardless of n", "square root|√n|four times|quadrupl"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Both ends of the map",
      framing: "A county map, not a survey. The question is whether you reach for the standard error before you reach for an explanation.",
      itemIds: ["it-statistics-27"],
    },
  ],
};

const lsSampling2: Lesson = {
  id: "ls-st-sampling-2",
  moduleId: "st-sampling",
  conceptIds: ["confidence-intervals"],
  title: "What a confidence interval says",
  promise: "By the end you will build a 95 % interval from an estimate and its standard error, state what the 95 % is a property of, and use the interval's width and position to judge a claim rather than a single number.",
  minutes: 22,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "One sentence",
      prompt: "A lab reports that the mean lead concentration in a town's water is 9.2 µg/L, 95 % confidence interval 8.2 to 10.2. The legal limit is 10. A councillor says 'so there is a 95 % chance the water is legal'. Is that what the interval means? Write your own one-sentence reading before continuing.",
      thinkSeconds: 45,
      reveal: "The interval does not say that. It says that the procedure used to build it captures the true mean in 95 % of samples, and that values from 8.2 to 10.2 are compatible with the data. Since 10 is inside the interval, the data do not rule out a mean at or above the limit. The councillor's sentence attaches a probability to this interval, which the method does not supply; what it does supply, a range of plausible values that includes the limit, is what matters for the decision.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why a range rather than a number",
      body: {
        standard:
          "A sample mean is one draw from the distribution of means that repeated sampling would produce. Reporting it alone hides the fact that a second sample would have given a different number. A confidence interval carries the uncertainty along with the estimate: it is the estimate plus and minus a multiple of its standard error, chosen so that the method catches the true value a stated fraction of the time. Jerzy Neyman set the idea out in 1937, and the choice of 95 % is a convention with no more authority than the 5 % significance level it mirrors.\n\nThe interpretation is the difficult part, and it is difficult because the sentence everyone wants to say, 'there is a 95 % probability that the true value lies in this interval', is not the sentence the method licenses. In the frequentist construction the true value is a fixed unknown number and the interval is the random thing; once the interval is computed, it either contains the value or it does not, and the 95 % describes how often the procedure succeeds, not how likely this instance is. The Bayesian credible interval does deliver the wanted sentence, at the price of a prior distribution over the parameter. In practice, a well-constructed 95 % confidence interval and a credible interval from a flat prior often coincide numerically, so the cautious reading is: the interval is the range of values the data are compatible with, and it is an honest range 95 % of the time.\n\nWhat the interval is good for is judgement about magnitude. A narrow interval far from zero is a precise, clear effect. A wide interval that straddles zero says the study could not tell; it does not say the effect is absent. A narrow interval that just excludes zero is a small effect measured well, and whether it matters is a separate question. Reading the interval, rather than whether it crossed a line, is most of what it means to read a result.",
        intuition:
          "An interval is an estimate with its uncertainty attached. The 95 % is the success rate of the recipe, not a probability about this particular result. What the interval shows is which values the data leave open; use its width to judge precision and its position to judge size, and never treat the edge of the interval as a wall.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Construction and reading",
      body: {
        standard:
          "For a mean: interval = x̄ ± t × s/√n, where t is the multiplier from the t distribution with n − 1 degrees of freedom; for n above about 30, t ≈ 1.96 for 95 %, 1.645 for 90 %, 2.576 for 99 %. For a proportion: p̂ ± 1.96 × √(p̂(1 − p̂)/n). The half-width scales with 1/√n and with the multiplier, so precision costs data and confidence costs width.\n\nReading rules. First, the interval covers sampling uncertainty only; bias in the sample or the measurement is not inside it, and a biased estimate carries a precise, wrong interval. Second, a value inside the interval has not been shown true; a value outside has been shown incompatible at that level. Third, an interval that excludes zero corresponds to a two-sided test significant at the matching level, but the interval says more, because it displays every effect size still plausible. Fourth, two intervals that overlap do not imply that the difference between the groups is non-significant; the interval for the difference must be computed. Fifth, for a poll, the quoted margin applies to a single share, and the margin on the gap between two candidates is roughly twice as large.",
        intuition:
          "Estimate ± multiplier × standard error. About 2 SE for 95 %. Narrow means precise, wide means the study could not tell, straddling zero means the sign is uncertain. It covers chance only, not bias. Overlapping intervals do not settle a comparison; the interval for the difference does.",
        deep:
          "The t multiplier arises because s estimates σ; Gosset published the distribution in 1908 under the name Student while working for Guinness, where samples of barley and beer were necessarily small. The interval is the set of null values that a two-sided test at level α would not reject, which is the duality between intervals and tests. For proportions near 0 or 1 the Wald interval above misbehaves (it can exceed [0, 1] and under-covers); the Wilson score interval is the better default. The frequentist coverage guarantee is over repeated samples for a fixed parameter; the Bayesian credible interval conditions on the observed data and requires a prior. With a flat prior and normal likelihood the two coincide, which is why the naive reading of a confidence interval is usually harmless in practice and precisely wrong in principle.",
      },
      structure: [
        { term: "95 % interval for a mean", meaning: "x̄ ± t × s/√n, with t ≈ 1.96 for moderate n." },
        { term: "What the 95 % is", meaning: "The long-run capture rate of the procedure, not a probability about this interval." },
        { term: "Width", meaning: "Precision. Falls with √n; rises with the confidence level." },
        { term: "What is outside it", meaning: "Bias, measurement error and model error. The interval covers sampling variation only." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Lead in the water",
      problem: "Twenty-five random samples of a town's tap water give a mean lead concentration of 9.2 µg/L with a sample standard deviation of 2.5 µg/L. Build the 95 % interval and say what it implies about the 10 µg/L limit.",
      steps: [
        { text: "Standard error: s/√n = 2.5/√25 = 2.5/5 = 0.5 µg/L.", note: "Twenty-five samples have cut the per-sample spread by a factor of five, not twenty-five." },
        { text: "Multiplier: with n = 25 the t distribution has 24 degrees of freedom and t₀.₉₇₅ = 2.064. Using 1.96 would be slightly too narrow at this sample size.", note: "For n above 30 the difference is negligible; below that, use t." },
        { text: "Interval: 9.2 ± 2.064 × 0.5 = 9.2 ± 1.03, so 8.17 to 10.23 µg/L.", note: "State the units; an interval without units is not a measurement." },
        { text: "Reading: the data are compatible with a mean anywhere from about 8.2 to 10.2, which includes the limit. The town cannot claim the mean is below 10; nor has it been shown above. To settle the question to ±0.5 would need a standard error of about 0.25 and therefore about 100 samples.", note: "The interval turns 'is it legal?' into 'how many more samples would it take to know?', which is the useful question." },
        { text: "What the interval does not cover: whether the 25 samples were drawn from representative taps and times, and whether the assay is unbiased. A systematic under-reading of 1 µg/L would shift the whole interval and not widen it.", note: "Sampling uncertainty is the part that can be computed; the rest has to be argued." },
      ],
      answer: "95 % CI ≈ 8.2 to 10.2 µg/L. The limit lies inside it, so the data neither establish compliance nor breach; about 100 samples would be needed for ±0.5.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Build one",
      scaffold: "Three steps in order: standard error, half-width (multiplier × SE), then add and subtract. Write down which of the numbers in the problem describes the data (SD) and which describes the estimate (SE).",
      itemIds: ["it-statistics-09"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-10"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "A colleague says 'the 95 % interval is 3 to 9, so there is a 95 % chance the true value is between 3 and 9'. Explain what is wrong with the sentence, what the interval does license, and what you would look at in the interval to judge whether the effect matters.",
      keyPoints: ["procedure|method|repeated|long run|in 95 % of samples|either contains or", "compatible|plausible|consistent with the data|range of values", "width|narrow|wide|precis", "zero|include|exclude|position|size|magnitude"],
      minWords: 60,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "A poll's lead",
      framing: "The margin of error is printed on every poll. The item asks what it is a margin for, which is not what the newspaper assumed.",
      itemIds: ["it-statistics-28"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Module st-inference                                                  */
/* ------------------------------------------------------------------ */

const lsInference1: Lesson = {
  id: "ls-st-inference-1",
  moduleId: "st-inference",
  conceptIds: ["hypothesis-testing", "p-values-and-significance"],
  title: "The logic of a test and what p means",
  promise: "By the end you will run the logic of a significance test from null hypothesis to p-value, state the p-value as a conditional probability with the conditioning in the right direction, and name the four misreadings that fill the newspapers.",
  minutes: 28,
  difficulty: 3,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "The lady tasting tea",
      prompt: "A colleague claims she can tell whether milk or tea was poured into the cup first. You prepare eight cups, four each way, in random order, and she sorts them into two groups of four. She gets all eight right. How convinced should you be, and what number would you compute to say so?",
      thinkSeconds: 60,
      reveal: "If she had no ability and was simply choosing four cups to call 'milk first', there are C(8, 4) = 70 ways to choose and one is entirely right, so the chance of a perfect sort by luck is 1/70 ≈ 0.014. That number is a p-value: the probability of a result this good if the claim were false. It is small enough that most people would abandon 'no ability'. Fisher's 1935 book The Design of Experiments introduces its principles with this experiment, and every element of a test is in it: a null hypothesis, a design that makes chance computable, a result, and the probability of that result under the null.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why argue from the null",
      body: {
        standard:
          "A test is an argument by surprise. You cannot compute how likely it is that the tea-taster has the ability, because you have no distribution over abilities. You can compute how likely her result would be if she had none, because 'none' is a precise state of affairs: four cups picked at random out of eight. So the argument runs backwards. Assume the boring hypothesis, work out how surprising the data would be under it, and if they would be very surprising, take that as grounds to doubt the boring hypothesis. Ronald Fisher built this into a working method in the 1920s and 1930s; Jerzy Neyman and Egon Pearson reframed it as a decision procedure with two named errors and a fixed threshold. Modern practice is a hybrid of the two that neither would have endorsed, and most of the confusion about p-values comes from the hybrid.\n\nThe p-value is the probability, computed under the null hypothesis, of data at least as extreme as those observed. It is a statement about data given a hypothesis. It is not a statement about the hypothesis given the data, which is what everyone wants and which needs a prior. The gap between the two is the same gap as between P(positive test | disease) and P(disease | positive test), and it can be as large. A p of 0.04 for a plausible effect in a well-powered study is decent evidence; the same p for a surprising claim in a small study from a field with a track record of false positives is barely evidence at all, because most of the significant results in such a field are false positives. The p-value does not know which field it is in. The reader has to.\n\nThe threshold of 0.05 is a convention from Fisher's tables. Nothing happens at 0.05. A result at 0.049 and a result at 0.051 are almost identical evidence, and any report that treats one as a finding and the other as nothing is reporting the threshold, not the data. In 2016 the American Statistical Association published a statement on p-values whose six principles amount to: report the estimate and its uncertainty, count your comparisons, and do not let the threshold do your thinking.",
        intuition:
          "You cannot compute the chance that a claim is true, so compute the chance of your data if it were false. If the data would be very rare under 'nothing is going on', doubt 'nothing is going on'. That rarity is the p-value. It is not the probability the claim is false, not the probability the result is a fluke, not the size of the effect, and not the chance of replication. And 0.05 is a habit, not a law.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "The procedure and the definition",
      body: {
        standard:
          "Steps: state the null hypothesis H₀ (usually 'no difference' or 'no association') and the alternative; choose a test statistic that measures departure from H₀ and a significance level α before seeing the data; compute the statistic; find the p-value, the probability under H₀ of a statistic at least as extreme; reject H₀ if p < α; report the estimate and its confidence interval alongside the verdict. For a mean with known σ the statistic is z = (x̄ − μ₀)/(σ/√n) and the p-value is read from the normal distribution; with s in place of σ it is t; for counts it is a chi-squared or an exact count as in the tea experiment.\n\nErrors: a type I error rejects a true null; its long-run rate is α if the test is used as designed. A type II error fails to reject a false null; its rate β depends on the true effect size and the sample, and 1 − β is the power. A non-significant result means the data did not distinguish the effect from zero at level α, which a small study will report whether or not the effect exists.\n\nDefinition, once more: p = P(data at least this extreme | H₀ true). The four misreadings: (1) p is the probability that H₀ is true; (2) p is the probability that the result is due to chance; (3) 1 − p is the probability of replication; (4) a small p means a large or important effect. All four are false; the first two invert the conditioning, the third confuses a p-value with power, the fourth confuses significance with size. What a p-value should move is belief, and how far it moves it depends on prior plausibility and power, which the p-value does not contain.",
        intuition:
          "Null, statistic, α before the data, compute, p, decide, then report the estimate with its interval. Type I is a false alarm at rate α; type II is a miss. p is the surprise of the data under the null. The four misreadings all put the null on the wrong side of the bar or confuse significance with size.",
        deep:
          "Fisher's p was a continuous measure of evidence against H₀, with no alternative hypothesis and no fixed α; Neyman and Pearson's framework needs an alternative, a fixed α, and controls long-run error rates without interpreting any single p. The hybrid reports p as if it were evidence and decides as if it were a rule. The likelihood ratio, P(data | H₁)/P(data | H₀), is the quantity that actually moves belief by Bayes' theorem, and a p-value of 0.05 corresponds at best to a likelihood ratio of about 2.5 to 3 against the null under a favourable alternative (Berger and Sellke 1987; the calibration p ↦ −e·p·ln p of Sellke, Bayarri and Berger 2001 gives an upper bound on the Bayes factor for p < 1/e). This is why 'p = 0.05' is weaker evidence than it sounds and why replication rates in fields that use it as a threshold have disappointed.",
      },
      structure: [
        { term: "Null hypothesis", meaning: "The precise 'nothing is going on' state under which the distribution of the data can be computed." },
        { term: "p-value", meaning: "P(data at least this extreme | H₀ true). Conditioning runs from hypothesis to data." },
        { term: "α and β", meaning: "False-alarm rate chosen in advance; miss rate that depends on effect size and n. Power = 1 − β." },
        { term: "What p is not", meaning: "Not P(H₀ | data), not 'chance of a fluke', not replication probability, not effect size." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Eight cups, twice",
      problem: "In the tea experiment (eight cups, four milk-first, sorted into two fours), the taster gets all eight right. Compute the p-value. Then suppose she gets six right (three of the four milk-first cups correctly identified). Compute that p-value and say what each result licenses.",
      steps: [
        { text: "Null hypothesis: no ability; she picks four cups at random to call 'milk first'. Sample space: C(8, 4) = 70 equally likely selections.", note: "The random ordering of the cups is what makes 'equally likely' true. Without it, no number could be computed." },
        { text: "All eight right means her four chosen cups are exactly the four milk-first cups: 1 of 70 selections. p = 1/70 ≈ 0.014.", note: "'At least as extreme' here is just 'this extreme', since nothing beats a perfect sort." },
        { text: "Six right means three of her four picks are milk-first and one is not: C(4, 3) × C(4, 1) = 4 × 4 = 16 selections. At least this good means 16 + 1 = 17 selections out of 70, so p = 17/70 ≈ 0.24.", note: "The 'at least as extreme' clause is where the perfect result gets added in." },
        { text: "Reading: p = 0.014 says a perfect sort would happen by luck about once in 70 tries; most would reject 'no ability'. p = 0.24 says three-of-four happens by luck about a quarter of the time; the experiment cannot distinguish some ability from none. Neither number is the probability that she has the ability, which would need a prior for how common such ability is.", note: "Fisher's own remark was that the experiment is designed so that a perfect result is rare under the null, and that is what makes a perfect result informative." },
        { text: "Design consequence: with eight cups the experiment can only ever return p = 1/70, 17/70, 53/70 or 1; if the taster is good but not perfect, eight cups give little power. Twelve cups (924 selections) would make a near-perfect performance rare enough to detect.", note: "Power is a property of the design, decided before the tea is poured." },
      ],
      answer: "All eight right: p = 1/70 ≈ 0.014. Six right: p = 17/70 ≈ 0.24. The first is strong grounds to doubt 'no ability'; the second is inconclusive, and neither is the probability that she has the ability.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Statistic, then p",
      scaffold: "For the first item, write the null value, the standard error and then the statistic; the standard error is not the standard deviation. For the second, decide what the study could have detected before reading its verdict.",
      itemIds: ["it-statistics-29", "it-statistics-12"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-11"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Define the p-value in one sentence with the conditioning in the right direction. Then explain to a journalist why 'p = 0.03' does not mean there is a 3 % chance the drug does nothing, and what two extra facts would tell you how much to believe the result.",
      keyPoints: ["if the null|assuming the null|given the null|under the null|if there were no effect", "at least as extreme|this extreme|as large or larger", "prior|plausib|base rate|how likely beforehand", "power|sample size|how big the study"],
      minWords: 70,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Twelve versions of a web page",
      framing: "No laboratory, no drug: a marketing team and a dozen tests. The logic is the tea experiment's, run twelve times, and the arithmetic of 'at least one' is the complement rule from probability.",
      itemIds: ["it-statistics-18"],
    },
  ],
};

const lsInference2: Lesson = {
  id: "ls-st-inference-2",
  moduleId: "st-inference",
  conceptIds: ["effect-sizes", "statistical-power"],
  title: "How big, and could you have seen it",
  promise: "By the end you will express an effect in comparable units, convert a relative risk into absolute terms and a number needed to treat, and judge from a study's power whether a null result means anything.",
  minutes: 26,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "Two headlines",
      prompt: "Headline A: 'Drug cuts heart-attack risk by a third.' Headline B: 'Drug prevents one heart attack for every 300 people treated for five years.' Could both be describing the same trial? Write down what baseline risk would make them consistent.",
      thinkSeconds: 45,
      reveal: "Yes. If the five-year risk without the drug is 1 % and the drug cuts it to 0.67 %, the relative reduction is a third and the absolute reduction is 0.33 percentage points, which is one heart attack per 300 people treated. Both headlines are true; only the second lets a patient weigh the benefit against side effects and cost. The relative figure is the one that gets printed because it is the larger number, and it hides the base rate on which everything depends.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why significance is not size",
      body: {
        standard:
          "A test answers whether an effect was detected. It does not answer how big the effect is, and the two come apart in both directions. With a large enough sample any non-zero difference reaches significance, so p < 0.001 can accompany an effect too small to matter; with a small sample only huge effects do, so 'not significant' can hide a large one. The effect size is the number that answers the question people actually have. In raw units it is the difference in means or in rates. Standardised, it is Cohen's d, the difference in means divided by the pooled standard deviation, which lets a reading intervention be compared with a maths one. For risks, it is the absolute risk difference, the relative risk, and the number needed to treat, which is one divided by the absolute difference. Jacob Cohen's 1988 benchmarks (0.2 small, 0.5 medium, 0.8 large) are conventions he explicitly warned against applying without thought.\n\nPower is the other half of the same question, asked before the study. It is the probability that a study of this size would detect an effect of a stated size if the effect were real. A study with 80 % power misses a true effect one time in five; a study with 20 % power misses it four times in five, and a null result from it is close to no information. Low power does worse than miss. Among the effects it does detect, only the ones that came out unusually large by chance cross the significance line, so its published estimates are inflated, sometimes with the wrong sign; Andrew Gelman and John Carlin call these type M and type S errors. And in a field where most studies are underpowered, a significant result is more likely to be a false positive than the p-value suggests, because true effects are rarely caught while false alarms arrive at the usual rate. A 2013 survey by Katherine Button and colleagues put the median power of neuroscience studies at around 20 %, and the replication rate of the field's findings has been what that number predicts.",
        intuition:
          "Detected is not big: a big study finds tiny effects, a small one misses large ones. Report the size in units that can be compared, and turn relative risks into absolute ones before deciding anything. Power is the chance the study could have seen the effect at all; when it is low, a null means nothing and a positive is exaggerated.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Effect sizes and power",
      body: {
        standard:
          "Effect sizes for a difference in means: raw difference in the outcome's units; Cohen's d = (x̄₁ − x̄₂)/s_pooled. For a relationship: r, or a regression slope with its units. For two risks p₁ (control) and p₂ (treated): absolute risk reduction ARR = p₁ − p₂; relative risk RR = p₂/p₁; relative risk reduction = 1 − RR; number needed to treat NNT = 1/ARR. The relative figures are unchanged by the base rate and the absolute ones are not, which is why decisions need the absolute ones.\n\nPower = 1 − β = P(reject H₀ | the effect has the stated size). It rises with sample size, with the true effect size, with α and with less noise in the outcome. A rough rule for comparing two means at α = 0.05 with 80 % power: n per group ≈ 16/d². For d = 0.5 that is about 64 per group; for d = 0.2, about 400. For two proportions: n per group ≈ 7.85 × [p₁(1 − p₁) + p₂(1 − p₂)]/(p₁ − p₂)². Power is decided before the study by choosing the smallest effect worth detecting and solving for n; computing it afterwards from the observed effect ('post hoc power') adds nothing the p-value did not already say.\n\nConsequences of low power: type II errors (misses); inflated significant estimates (type M) and occasionally reversed signs (type S); and a high false-positive share among significant findings. A literature in which effects shrink as sample sizes grow is showing these mechanisms at work.",
        intuition:
          "d = difference over pooled SD. ARR = difference in risks, NNT = 1 over it, and the relative reduction is the flattering one. Power = chance of catching a real effect of a given size; 16/d² per group for 80 %; decide it before, not after. Low power: misses, exaggeration, and false positives that look like findings.",
        deep:
          "The 16/d² rule comes from n = 2(z_{1−α/2} + z_{1−β})²/d² with z = 1.96 and 0.84, giving 2 × 7.85 ≈ 15.7. The winner's curse follows from truncation: conditional on |t| > 1.96, the expected estimate exceeds the true effect by an amount that grows as power falls, and at 10 % power the significant estimates average several times the truth. The positive predictive value of a significant result is PPV = (1 − β)R/[(1 − β)R + α], with R the prior odds of a true effect (Ioannidis 2005); at 20 % power, α = 0.05 and R = 1/4, PPV = 0.05/(0.05 + 0.05) = 0.5, a coin flip. Sequential and adaptive designs raise power for a given expected sample size but need pre-specified stopping rules, or the repeated looks become multiple comparisons.",
      },
      structure: [
        { term: "Cohen's d", meaning: "(x̄₁ − x̄₂)/s_pooled: difference in standard-deviation units; 0.2 / 0.5 / 0.8 as rough, not binding, benchmarks." },
        { term: "ARR, RR, NNT", meaning: "Absolute difference in risks; ratio of risks; 1/ARR. The relative figure hides the base rate." },
        { term: "Power", meaning: "P(detect | effect of the stated size). About 16/d² per group for 80 % at α = 0.05." },
        { term: "Low power", meaning: "Null results are uninformative; significant estimates are inflated; the false-positive share is high." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "A trial with 50 per group",
      problem: "A treatment is expected to raise recovery from 40 % to 50 %. (a) Express the effect three ways. (b) A trial is proposed with 50 patients per group. Estimate its power at α = 0.05, two-sided. (c) What sample would give 80 % power?",
      steps: [
        { text: "(a) Absolute risk increase: 10 percentage points. Relative: 50/40 = 1.25, a 25 % relative improvement. Number needed to treat: 1/0.10 = 10 patients per additional recovery.", note: "Three true descriptions of one effect; the 25 % is the one a press release would choose." },
        { text: "(b) Standard error of the difference under the alternative: √(0.4 × 0.6/50 + 0.5 × 0.5/50) = √(0.0048 + 0.005) ≈ 0.099. The difference is declared significant when it exceeds about 1.96 × SE₀, with SE₀ computed at the pooled rate 0.45: 1.96 × √(2 × 0.45 × 0.55/50) ≈ 1.96 × 0.0995 ≈ 0.195.", note: "The critical value uses the null (pooled) variance; the power calculation uses the variance under the alternative. At these rates the two are nearly equal." },
        { text: "Power ≈ P(observed difference > 0.195 | true difference 0.10) = P(Z > (0.195 − 0.10)/0.099) = P(Z > 0.96) ≈ 0.17.", note: "About one chance in six of detecting a real ten-point improvement. A null result from this trial would be the expected outcome whether or not the treatment works." },
        { text: "(c) n per group ≈ 7.85 × (0.24 + 0.25)/0.01 ≈ 385. Nearly eight times the proposed size.", note: "The formula is (z_{0.975} + z_{0.8})² = (1.96 + 0.84)² ≈ 7.85 times the summed variances over the squared difference." },
        { text: "Consequence for reading the small trial if it is run anyway: if it does reach significance, the observed difference will be at least 0.195, roughly double the true 0.10, because only exaggerated outcomes cross the line. Its estimate should be discounted, not celebrated.", note: "This is the winner's curse in one sentence: at low power, significant means exaggerated." },
      ],
      answer: "(a) +10 points; RR 1.25 (25 % relative); NNT 10. (b) Power ≈ 17 %. (c) About 385 per group for 80 % power.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Standardise once",
      scaffold: "Write the raw difference, then divide by the pooled standard deviation, not by the variance and not by a group mean. Say in words what the resulting number means.",
      itemIds: ["it-statistics-13"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-14", "it-statistics-15"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain why a 'significant' result can be unimportant and a 'non-significant' one can hide an important effect, using the ideas of effect size and power. Then say why published effects from small studies tend to be exaggerated.",
      keyPoints: ["sample size|large sample|small sample|n", "effect size|how big|magnitude|absolute", "power|chance of detecting|could have detected", "inflat|exaggerat|winner's curse|only the large ones|cross the line|type M"],
      minWords: 70,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "A ministry cancels a programme",
      framing: "A policy decision made on a null result. Read the interval, not the verdict, and say what the trial did and did not establish.",
      itemIds: ["it-statistics-30"],
    },
  ],
};

const lsInference3: Lesson = {
  id: "ls-st-inference-3",
  moduleId: "st-inference",
  conceptIds: ["regression"],
  title: "Reading a regression",
  promise: "By the end you will read a fitted line's slope, intercept, standard error and R² for what each says, predict from it without extrapolating, and state the conditions under which a coefficient can be called an effect.",
  minutes: 24,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "One equation, four claims",
      prompt: "A fitted line for flats in a city: price (£ thousands) = 45 + 2.8 × floor area (m²), R² = 0.55, from 300 sales. Four people read it. A: 'a flat with no floor area costs £45,000.' B: 'each extra square metre adds £2,800.' C: 'the model explains 55 % of flats.' D: 'building an extra 10 m² onto a flat raises its price by £28,000.' Which readings are right? Decide before continuing.",
      thinkSeconds: 60,
      reveal: "B is right as an association among these sales: predicted price rises £2,800 per square metre. A reads the intercept literally, but no flat has zero area and 45 is the line's height at a point outside the data. C misreads R²: 55 % of the variance in price, not 55 % of flats. D turns an association across different flats into the effect of an intervention on one flat; whether an extension adds £28,000 depends on whether larger flats in the data differ from smaller ones only in area, which they do not (location, building, floor).",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Why fit a line",
      body: {
        standard:
          "A correlation says two variables move together; a regression says by how much. Fit the line that minimises the sum of squared vertical distances from the points, a method Legendre published in 1805 and Gauss claimed to have used earlier, and you get a slope in the outcome's units per unit of the predictor, an intercept, and a measure of how much of the outcome's variation the line accounts for. The slope is the number that carries meaning: £2,800 per square metre, 0.08 log points per year of schooling, 850 pounds per year of experience. It is an average over the data, and it describes how the outcome differs between cases that differ in the predictor. It is not, without further argument, what would happen to one case if you changed its predictor.\n\nThe further argument is what most of applied statistics is about. Add other predictors and each coefficient becomes the association with the outcome among cases that share the other predictors' values; 'holding fixed' is the phrase, and it means holding fixed what is in the model and nothing else. A coefficient can be read as a cause only if every variable that affects both predictor and outcome is included and correctly measured, no variable that the predictor itself causes is included, and the straight line is the right shape. Randomised assignment satisfies the first two by construction, which is why the same regression means something different in a trial and in a survey. The name is Galton's, from his 1886 paper on heights that found children of tall parents shorter than their parents on average; regression to the mean, the phenomenon, and regression, the method, were born in the same table.\n\nR² is the least useful number in the output and the most quoted. It is the share of the outcome's variance the line accounts for. A low R² with a precise slope is common and unremarkable: the predictor matters and so does everything else. A high R² with a meaningless slope is easy to manufacture with a trend over time.",
        intuition:
          "The slope is how much the outcome differs per unit of the predictor, on average, across the data. The intercept is where the line crosses zero, often outside the data. R² is the share of variance the line covers, not a grade. 'Holding fixed' means holding fixed what is in the model. A coefficient is a cause only when the design earns it.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "Coefficients, uncertainty, fit and causation",
      body: {
        standard:
          "Simple regression: ŷ = a + b·x, with b = r·sᵧ/sₓ and a = ȳ − b·x̄, so the line passes through the means. The slope's standard error se(b) measures its sampling uncertainty; b/se(b) is a t statistic and b ± 2·se(b) is roughly a 95 % interval. R² = r² in the simple case: the share of variance in y accounted for by the line. Residuals, y − ŷ, should show no pattern against x; a curve in the residuals means the straight line is the wrong shape, and a funnel means the spread changes with x.\n\nMultiple regression: ŷ = a + b₁x₁ + b₂x₂ + …. Each bᵢ is the association of xᵢ with y among cases with the same values of the other x's. Adding a variable can change another's coefficient in size or sign; that is information about the data's structure, not a malfunction. Log transformations give proportional readings: with ln(y) as outcome, a slope b means a unit change in x multiplies y by e^b, about (100·b) % for small b; with both sides logged, b is an elasticity.\n\nPrediction: use the line within the range of the data; outside it, the line is a guess. Causation: a coefficient equals a causal effect only if there is no unmeasured confounder, no conditioning on a consequence of the predictor, and a correct functional form. Randomisation guarantees the first two; observational data can only argue for them.",
        intuition:
          "Slope, its standard error, the interval. Residuals for shape. Multiple regression: each coefficient holds the others fixed. Logged outcome: slope is a percentage. Predict inside the data. Cause needs the design, not the software.",
        deep:
          "Ordinary least squares chooses b to minimise Σ(y − a − bx)²; the normal equations give the formulae above and the Gauss–Markov theorem makes OLS the best linear unbiased estimator under uncorrelated, equal-variance errors. The omitted-variable formula is exact and worth memorising: if the true model is y = a + b₁x₁ + b₂x₂ + e and x₂ is omitted, the estimated coefficient on x₁ converges to b₁ + b₂·δ, where δ is the slope of x₂ on x₁. Bias is therefore the product of how much the omitted variable matters and how strongly it tracks the included one, and its sign is computable in advance. Conditioning on a collider (a variable caused by both x and y, or by x and an unobserved cause of y) induces association where none existed; the selection into the sample is itself often such a conditioning. Standard errors assume the errors are independent; clustered or serially correlated errors make them too small, which is the most common way a precise-looking slope is not.",
      },
      structure: [
        { term: "Slope b", meaning: "Predicted change in y per unit of x, on average across the data; b ± 2·se(b) is its rough interval." },
        { term: "Intercept a", meaning: "Prediction at x = 0; meaningful only if x = 0 is inside the data." },
        { term: "R²", meaning: "Share of variance in y accounted for by the line; compatible with a precise slope at any value." },
        { term: "Causal reading", meaning: "Needs no unmeasured confounder, no collider, right shape; randomisation supplies the first two." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Flats, and then a second predictor",
      problem: "Price (£ thousands) = 45 + 2.8 × area (m²), se(slope) = 0.3, R² = 0.55, n = 300, areas from 35 to 120 m². (a) Predict the price of a 70 m² flat and of a 200 m² flat. (b) A second model adds distance to the nearest station (km): price = 80 + 2.4 × area − 25 × distance, R² = 0.68. Interpret the change.",
      steps: [
        { text: "(a) 70 m²: 45 + 2.8 × 70 = 45 + 196 = £241,000. That is a prediction of the average price for 70 m² flats in these data, not the price of any particular flat; the residual spread tells you how far individual flats sit from it.", note: "State what the prediction is a prediction of." },
        { text: "200 m²: the line says 45 + 560 = £605,000, but the data run from 35 to 120 m². Nothing in the fit says the relation stays straight to 200 m²; large flats may be in different buildings and price per square metre often changes. Report the extrapolation as such or decline it.", note: "A fitted line does not know where its data ended. The analyst has to." },
        { text: "Slope precision: 2.8/0.3 ≈ 9 standard errors from zero; interval about 2.2 to 3.4. R² = 0.55 says the line accounts for about half the variance in price and location, floor, condition and timing account for the rest. A precise slope and a middling R² are entirely consistent.", note: "The slope is about a rate; R² is about how much else is going on." },
        { text: "(b) Adding distance: the area coefficient falls from 2.8 to 2.4. In the first model, area was partly standing in for location, because larger flats in these data tend to sit further from stations, where space is cheaper. Holding distance fixed, a square metre is associated with £2,400, and each kilometre from a station with £25,000 less, holding area fixed. R² rose because distance explains variance that area could not.", note: "The omitted-variable formula predicts the direction: area's coefficient carried the omitted distance's effect times how distance tracks area." },
        { text: "Causal reading of the 2.4? Still no. Unmeasured differences (building age, floor, condition) may track area. The coefficient is a description of these sales; a causal claim about extending a flat would need a design in which area varied for reasons unrelated to everything else, which the housing market does not supply.", note: "Adding one confounder does not turn a description into an effect; it removes one confounder." },
      ],
      answer: "(a) About £241,000 for 70 m²; the 200 m² prediction is an extrapolation outside the data and should be reported as such. (b) Area's coefficient dropped because it had been carrying location; each coefficient is now read holding the other fixed; still not causal.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Read the output",
      scaffold: "For each number in the output, say what it is a number of: the slope in units of y per unit of x, the standard error in the same units, R² as a share of variance. Then ask whether the design allows any causal word.",
      itemIds: ["it-statistics-16"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-17"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a colleague who has just run their first regression what the slope, the intercept and R² each mean, why a coefficient can change when a variable is added, and what would have to be true for the coefficient to be read as a cause.",
      keyPoints: ["per unit|per year|per square metre|change in|associated with", "intercept|x = 0|zero|outside the data|extrapolat", "share of variance|proportion of variance|variance explained", "holding fixed|controlling|other variables|confound|omitted", "randomis|randomiz|design|no unmeasured|cause"],
      minWords: 80,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "A logged outcome",
      framing: "The same reading skill with a transformed variable: the slope of a wage equation on the log scale, as economists have written it since Jacob Mincer's work in the 1970s.",
      itemIds: ["it-statistics-31"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Module st-studies                                                    */
/* ------------------------------------------------------------------ */

const lsStudies1: Lesson = {
  id: "ls-st-studies-1",
  moduleId: "st-studies",
  conceptIds: ["regression-to-the-mean", "simpsons-paradox", "interpreting-research"],
  title: "Two ways honest numbers mislead",
  promise: "By the end you will recognise regression to the mean before you reach for a cause, resolve a Simpson's reversal by asking which level is causally right, and read a study by its design rather than its headline.",
  minutes: 30,
  difficulty: 4,
  origin: "seeded",
  steps: [
    {
      id: "q",
      kind: "question",
      title: "The flight instructor",
      prompt: "An instructor tells you: 'When I praise a trainee for a very good landing, the next landing is usually worse. When I shout at one for a very bad landing, the next is usually better. So praise hurts and criticism helps.' The observation is accurate. Is the conclusion? Say what else could produce exactly this pattern, with no effect of praise or criticism at all.",
      thinkSeconds: 60,
      reveal: "Any landing mixes skill with luck. A very good landing was, on average, lucky, and the next is expected to be closer to the trainee's usual standard; a very bad landing was unlucky, and the next is expected to improve. Praise and criticism arrive exactly when the extreme is at its most extreme, and take the credit for a rebound that would have happened anyway. Daniel Kahneman tells this story of Israeli Air Force instructors in the 1960s; the arithmetic behind it is Galton's, and it has no cause in it at all.",
    },
    {
      id: "intuition",
      kind: "intuition",
      title: "Selection, then a second look",
      body: {
        standard:
          "Both phenomena in this lesson come from the same source: a number you were shown was selected, and selection changes what a number means. Regression to the mean is what happens when you select on an extreme value and then measure again. Every measurement is stable component plus noise; the ones you picked for being extreme carry extreme noise on average; noise does not persist; the second measurement lands nearer the mean. Nothing pulls it there. Galton saw it in heights in 1886, Horace Secrist wrote a 1933 book announcing the 'triumph of mediocrity in business' after finding that the most profitable firms became less so, and Harold Hotelling's review explained, with some impatience, that the least profitable firms had improved by the same arithmetic. The practical problem is that interventions are triggered by extremes: the worst schools get the programme, the sickest patients the new treatment, the loudest complaints the fix. The before-and-after comparison then flatters every intervention ever tried. The remedy is a comparison group selected the same way and left alone.\n\nSimpson's paradox is what happens when you pool groups of different composition. A treatment can do better in every subgroup and worse overall, because the overall rate is a weighted average and the weights differ between treatments. The 1973 Berkeley admissions data, examined by Peter Bickel and colleagues, showed women admitted at 35 % against men's 44 % while most departments admitted women at equal or higher rates; women had applied to the competitive departments. Kidney-stone surgery in a 1986 comparison won in both small and large stones and lost overall, because it was used on the large ones. The arithmetic is elementary. The judgement is not: whether the pooled or the stratified figure answers the question depends on the causal role of the variable you stratified on. If it precedes the treatment and affects both treatment and outcome, stratify. If the treatment affects it, stratifying conditions away part of the effect you wanted to measure.\n\nReading a study is these two habits plus a checklist: what design, who was studied, how big with what uncertainty, how many comparisons were tried, and who paid. The headline is written last and read first; the method section is written first and read last. Reverse that.",
        intuition:
          "Pick something for being extreme and it will look more ordinary next time, with no help from you; so before crediting an intervention, ask what an untreated group chosen the same way would have done. Pool groups of different make-up and the overall rate can contradict every part; so ask what decided who went into which group, and whether that variable came before or after the treatment. Then read the study from the method upward.",
      },
    },
    {
      id: "model",
      kind: "model",
      title: "The arithmetic and the decision rules",
      body: {
        standard:
          "Regression to the mean: if two measurements of the same thing have correlation r and equal spread, a value z standard deviations from the mean on the first is expected to sit at r·z on the second. With r = 1 there is no regression; with r = 0.5, half the extremity vanishes; with r = 0, the second measurement is expected at the mean. Test-retest correlations for most human performance measures are well below 1, so the effect is large. Rule: whenever an intervention follows selection on an extreme value, the before-after change is uninterpretable without a control group selected by the same rule. In a randomised trial, both arms regress equally and the difference between them is the effect.\n\nSimpson's paradox: with subgroups i, treatment A's overall rate is Σ wᵢᴬ·pᵢᴬ and B's is Σ wᵢᴮ·pᵢᴮ, where the w are the shares of each treatment's cases in each subgroup. If pᵢᴬ > pᵢᴮ for every i but A's weight sits on the low-p subgroups, the pooled inequality can reverse. Rule: identify the stratifying variable's causal position. A pre-treatment variable that affects treatment choice and outcome (stone size, department) is a confounder: use the stratified comparison. A post-treatment variable (a side effect, an intermediate outcome, a grade reached through promotion) is a mediator: do not stratify on it, or say explicitly that you are measuring only the effect not running through it.\n\nReading a study: design (randomised or observational; if observational, cohort, case-control, cross-sectional); sample (size, who was excluded, follow-up); estimate with interval, converted to absolute terms; comparisons (outcomes, subgroups, model choices, preregistration); context (replication, funding, whether effects shrink as studies grow). A single study is one data point about a question.",
        intuition:
          "Expected second score = r times the first, in standard units; with r below 1, extremes shrink. Pooled rate = weighted average of subgroup rates; reversal comes from the weights. Stratify on what came before the treatment, not on what it caused. Read a study from the design up.",
        deep:
          "The r·z rule is the regression line for standardised variables, which is where the name comes from: Galton's slope for child on mid-parent height was about 2/3. In a two-wave panel, the correlation between initial value and change is negative even when nothing happens (the 'mathematical coupling' that produces spurious 'catch-up' effects), which is why change scores must be analysed with the baseline as a covariate or with a control arm. Simpson's paradox is a special case of the general fact that conditional and marginal associations need not agree, and its resolution is the back-door criterion: adjust for a set of variables that blocks every path from treatment to outcome through a common cause and opens none through a common effect. The Berkeley case is instructive in both directions: department is a confounder for the question 'does the admissions committee discriminate', and a mediator for the question 'does the university's structure disadvantage women', so both figures answer a real question, and they are different questions.",
      },
      structure: [
        { term: "Regression to the mean", meaning: "Expected second value ≈ r × first, in standard units; selection on an extreme guarantees movement toward the mean with no cause." },
        { term: "Control selected the same way", meaning: "The only clean way to separate an intervention's effect from the expected rebound." },
        { term: "Simpson's reversal", meaning: "Pooled rates are weighted averages; unequal weights across groups can reverse every subgroup's ordering." },
        { term: "Which level to believe", meaning: "Stratify on a pre-treatment confounder; do not stratify on a variable the treatment causes." },
      ],
    },
    {
      id: "worked",
      kind: "worked_example",
      title: "Berkeley, by department",
      problem: "Berkeley graduate admissions, autumn 1973 (Bickel, Hammel and O'Connell 1975): 8,442 men applied and 44 % were admitted; 4,321 women applied and 35 % were admitted. Department A: 825 men applied, 62 % admitted; 108 women, 82 %. Department F: 373 men, 6 %; 341 women, 7 %. Reconcile the overall gap with the departmental figures and say what question each figure answers.",
      steps: [
        { text: "Check the within-department comparison: in A, women are admitted at 82 % against men's 62 %; in F, 7 % against 6 %. Women do at least as well in both. The same held in four of the six largest departments.", note: "First establish that the reversal is real and not a transcription error." },
        { text: "Look at the weights. Of the men in these two departments, 825 of 1,198 (69 %) applied to A, the easy one. Of the women, 108 of 449 (24 %) applied to A and 76 % to F, where almost nobody gets in.", note: "The composition of applicants, not the behaviour of the committees, is what differs between the sexes." },
        { text: "Compute what the weights do: a group whose applications go 24 % to a 62 %-admitting department and 76 % to a 6 %-admitting one has an expected overall rate around 0.24 × 0.7 + 0.76 × 0.07 ≈ 22 %, even at women's own higher departmental rates; a group whose applications go 69 % to A has an expected rate near 0.69 × 0.62 + 0.31 × 0.06 ≈ 45 %. The overall gap is the weights.", note: "The arithmetic of the weighted average is the whole explanation of the pooled figure." },
        { text: "Which figure answers which question. 'Do departments admit women at lower rates than comparable men?' is a question about committee behaviour, and department is a pre-decision variable that affects both who applies where and how hard admission is: stratify, and the answer is no, or if anything the reverse. 'Are women less likely to get into Berkeley graduate school?' is answered by the pooled 35 % against 44 %, and it is true.", note: "Both numbers are honest. They answer different questions, and the causal role of 'department' decides which question each one serves." },
        { text: "The next question, which the data cannot answer alone: why did women apply to the departments with the lowest admission rates? The authors pointed to the pattern that the competitive departments were those with fewer places relative to applicants, often in the humanities and social sciences, and that the causes lay upstream of the graduate admissions process. That is where an investigation would go next.", note: "Resolving the paradox relocates the question; it does not dissolve it." },
      ],
      answer: "The pooled gap is produced by the distribution of applications across departments, not by departmental decisions. The stratified figures answer 'do committees discriminate' (no evidence of it); the pooled figure answers 'is overall admission lower for women' (yes); the remaining question is why applications were distributed as they were.",
    },
    {
      id: "guided",
      kind: "guided_practice",
      title: "Before crediting the course",
      scaffold: "Ask three questions in order: how were these people selected; what would you expect from them next quarter if nothing were done; what comparison would isolate the intervention's effect. Only then read the options.",
      itemIds: ["it-statistics-19"],
    },
    {
      id: "independent",
      kind: "independent_practice",
      title: "On your own",
      itemIds: ["it-statistics-20"],
    },
    {
      id: "explain",
      kind: "explain_back",
      title: "Explain it back",
      prompt: "Explain to a manager why 'we trained the worst performers and they improved' proves nothing on its own, and what evidence would prove something. Then explain how a treatment can be better for every kind of patient and worse overall, and how you decide which figure to trust.",
      keyPoints: ["luck|noise|chance|extreme|selected because", "would have improved anyway|regardless|without the course|toward the mean|rebound", "control|comparison group|selected the same way|randomis", "weighted|weights|case mix|composition|proportion of|more of the hard", "before the treatment|confounder|cause of both|mediator|caused by the treatment|which came first"],
      minWords: 90,
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "A pay gap and a coffee study",
      framing: "First a Simpson's reversal where the stratifying variable may be the very thing under investigation. Then a press release: read it from the design up, and write what it supports and no more.",
      itemIds: ["it-statistics-32", "it-statistics-21"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Assembly                                                             */
/* ------------------------------------------------------------------ */

const lessons: Lesson[] = [lsDescriptive1, lsSampling1, lsSampling2, lsInference1, lsInference2, lsInference3, lsStudies1];

export const STATISTICS = scaffoldDomain("statistics", {
  concepts: STATISTICS_CONCEPTS,
  lessons,
  courseSummaries: {
    "statistics-core":
      "Learning from data without fooling yourself. Four modules run from summarising a column of numbers to reading a published study: description and correlation; sampling, bias and the standard error; tests, p-values, effect sizes, power, regression and the arithmetic of multiple comparisons; and the traps that honest numbers set, regression to the mean and Simpson's paradox, with a method for reading research from the design upward.",
  },
  moduleSummaries: {
    "st-descriptive": "Standing in for a column of data with a few numbers: mean against median and what their gap says about shape, standard deviation and interquartile range, the correlation coefficient with its limits, and how charts reveal or distort the same figures.",
    "st-sampling": "The two ways a sample can be wrong: bias from who was reached and who answered, which no sample size repairs, and sampling variability, which the standard error measures and √n governs; then the confidence interval as an estimate with its uncertainty attached and the discipline of reading what it licenses.",
    "st-inference": "Arguing from the null: the logic of a significance test, the p-value as a conditional probability and its four misreadings, effect sizes in comparable and absolute units, power as a property of the design, regression coefficients read for association before cause, and why twenty tests will find something.",
    "st-studies": "Reading research: experiments against observational designs, a checklist for a paper, regression to the mean as the silent explanation of most before-and-after improvements, and Simpson's paradox as a weighted average whose resolution is a causal question.",
  },
});
