/**
 * Statistics — concepts (part A of the statistics domain).
 * Ids follow src/content/v2/skeleton.ts exactly. British spelling throughout.
 *
 * Statistics sits downstream of arithmetic and of the probability course (variance, distributions,
 * the law of large numbers) and upstream of causal reasoning, psychology methods and the reading
 * of research. `dependsOn` lists prerequisites that would actually block a learner; `related`
 * lists neighbours worth connecting once the concept is held, in any domain.
 */
import type { Concept } from "@/lib/v2/content-types";

type Draft = Omit<Concept, "domainId" | "courseId" | "moduleId">;

const CORE = "statistics-core";

function concept(moduleId: string, draft: Draft): Concept {
  return { domainId: "statistics", courseId: CORE, moduleId, ...draft };
}

/* ------------------------------------------------------------------ */
/* Describing data                                                      */
/* ------------------------------------------------------------------ */

const descriptive: Concept[] = [
  concept("st-descriptive", {
    id: "descriptive-statistics",
    title: "Descriptive statistics",
    summary:
      "A handful of numbers that stand in for a whole column of data: where its centre is (mean, median), how spread out it is (standard deviation, interquartile range) and what shape it has. The skill is knowing which summary a given dataset will let you trust.",
    keyPoints: [
      "The mean is the balance point of the data and is pulled by extreme values; the median is the middle value and is not. Seven salaries with one of 120,000 have a mean of 50,000 and a median of 40,000.",
      "When mean and median differ, the data are skewed toward the side of the mean; incomes, house prices and waiting times are typically right-skewed.",
      "The standard deviation is the typical distance of a value from the mean: the square root of the average squared deviation. Sample data divide by n − 1 to correct for using the sample's own mean.",
      "In a roughly bell-shaped distribution about 68 % of values lie within one SD of the mean and 95 % within two; in a skewed one those rules fail and quartiles describe the spread better.",
      "A summary hides what it summarises. Before trusting a mean, look at the distribution: Anscombe's four datasets (1973) share means, variances and correlation and look nothing alike.",
    ],
    dependsOn: ["fractions-ratios-percentages", "variance-and-spread"],
    related: ["expected-value", "distributions", "number-sense", "visualising-data", "gdp-and-growth"],
    recallPrompts: [
      { prompt: "Why can mean and median differ, and which is pulled by a single extreme value?", answer: "The mean is a balance point and moves with every value, so one extreme value drags it; the median is the middle rank and is unaffected." },
      { prompt: "Define the standard deviation in words and state why sample calculations divide by n − 1.", answer: "The square root of the average squared distance from the mean. Dividing by n − 1 corrects for the fact that deviations are measured from the sample's own mean, which makes them slightly too small.", accept: ["n − 1", "n-1", "square root of the average squared deviation"] },
      { prompt: "If the mean of a distribution is well above its median, what shape does it have?", answer: "Right-skewed: a long tail of high values pulls the mean up.", accept: ["right-skewed", "right skewed", "positively skewed", "skewed right"] },
    ],
    applications: ["Reading 'average' figures in news and reports and asking which average", "Comparing groups in a spreadsheet before running any test", "Judging whether a headline figure is typical or driven by a few outliers"],
    misconception: "That 'the average' is a single well-defined number. Mean, median and mode can be far apart, and a writer who says 'average income' without saying which has told you less than it seems.",
    difficulty: 1,
    foundational: true,
    tags: ["foundations", "summary"],
  }),
  concept("st-descriptive", {
    id: "correlation",
    title: "Correlation",
    summary:
      "The correlation coefficient r measures how tightly two variables move together along a straight line, from −1 through 0 to +1. It says nothing about which variable drives the other, nothing about curved relationships, and it can be manufactured or destroyed by how the sample was chosen.",
    keyPoints: [
      "r is the average product of standardised deviations: it is positive when high values of one variable go with high values of the other, negative when they go opposite ways, and unitless.",
      "r measures linear association only. A perfect U-shaped relationship can have r = 0; r near zero means 'no straight-line relationship', not 'no relationship'.",
      "r² is the share of the variance in one variable that a straight line on the other accounts for; r = 0.6 explains 36 %, not 60 %.",
      "r is not a slope. Two datasets can have the same r and very different slopes; the slope carries units, r does not.",
      "Restricting the range of one variable (studying only admitted students, only surviving firms) shrinks r; a single outlier can create or erase it. Look at the scatter plot.",
      "Correlation is symmetric and causally silent: a confounder, reverse causation or a selection rule can each produce it without any direct effect.",
    ],
    dependsOn: ["descriptive-statistics", "functions-and-graphs"],
    related: ["conditional-probability", "correlation-vs-causation", "regression", "selection-bias", "risk-and-diversification"],
    recallPrompts: [
      { prompt: "What does r measure, and what kind of relationship can it miss entirely?", answer: "The strength and direction of a straight-line relationship between two variables. It can miss curved relationships completely; a symmetric U-shape gives r ≈ 0." },
      { prompt: "r = 0.6 between two variables. What share of variance does a linear fit explain?", answer: "r² = 0.36, so 36 %.", accept: ["36", "0.36", "36 %"] },
      { prompt: "Name two ways a correlation can appear in data without either variable affecting the other.", answer: "A common cause (confounder) driving both; a selection rule that admits cases on a mix of the two variables; also chance in small samples." },
    ],
    applications: ["Portfolio diversification: low or negative return correlations reduce risk", "Screening which predictors deserve a closer look in a dataset", "Reading claims like 'strongly linked' in reporting and asking for the scatter plot"],
    misconception: "That a stronger correlation means a bigger effect. r describes how tightly points cluster around a line, not how steep the line is; a tiny, precisely measured effect can carry a high r.",
    difficulty: 2,
    foundational: true,
    tags: ["association"],
  }),
  concept("st-descriptive", {
    id: "visualising-data",
    title: "Reading and making charts",
    summary:
      "A chart is an argument about data. Reading one means checking the axes, the baseline, the scale and what has been left out before believing the shape; making one means choosing the encoding that shows the comparison honestly.",
    keyPoints: [
      "Check the y-axis first: a bar chart whose axis starts above zero exaggerates differences, because bar length is what the eye compares. Line charts may start wherever the data live, but say so.",
      "Logarithmic scales show proportional change: equal vertical steps are equal percentage changes, so exponential growth becomes a straight line and small values remain visible.",
      "Match the chart to the question: distributions want histograms or box plots; relationships want scatter plots; change over time wants lines; parts of a whole want a single bar, rarely a pie.",
      "Dual axes, cherry-picked windows, 3-D effects and area scaled by one dimension are the usual sources of a misleading picture; each can be checked in seconds.",
      "The best charts show the data, not just the summary: a box plot over the points, a scatter with the fitted line, error bars that say what they represent (SD, SE or a confidence interval).",
    ],
    dependsOn: ["descriptive-statistics", "functions-and-graphs"],
    related: ["orders-of-magnitude", "linear-vs-exponential-growth", "exponents-and-logarithms", "clear-explanation", "visual-analysis"],
    recallPrompts: [
      { prompt: "Why must a bar chart's axis start at zero when a line chart need not?", answer: "Bars encode value as length from the baseline, so a truncated axis distorts every comparison; a line encodes change in position, and the window can be chosen to show the movement, if labelled." },
      { prompt: "What does a straight line on a log-scaled y-axis mean?", answer: "Constant proportional growth: an exponential process. Equal vertical steps are equal multiples.", accept: ["exponential", "constant percentage growth", "constant proportional growth"] },
      { prompt: "Which chart type suits a distribution, a relationship, and a change over time?", answer: "Histogram or box plot; scatter plot; line chart." },
    ],
    applications: ["Auditing a chart in a report or a pitch before repeating its claim", "Choosing between linear and log axes for growth, prices or case counts", "Building a chart that a sceptical reader cannot fault"],
    misconception: "That charts are neutral pictures of the numbers. Every chart picks an axis, a window and an encoding, and each choice can honestly reveal or quietly distort the same data.",
    difficulty: 2,
    tags: ["charts", "communication"],
  }),
];

/* ------------------------------------------------------------------ */
/* Sampling and uncertainty                                             */
/* ------------------------------------------------------------------ */

const sampling: Concept[] = [
  concept("st-sampling", {
    id: "sampling-and-bias",
    title: "Sampling and bias",
    summary:
      "A sample tells you about a population only if every member had a known chance of being included. Bias is a systematic gap between the people you reached and the people you meant to describe, and no amount of extra data of the same kind closes it.",
    keyPoints: [
      "A random sample gives every unit a known, non-zero chance of selection; that is what lets its error be calculated. Convenience, volunteer and quota samples do not.",
      "Selection bias comes from the sampling frame (who could be reached) and from non-response (who chose to answer); the 1936 Literary Digest poll had 2.4 million replies and still missed the election by nearly 20 points.",
      "Bias does not shrink with sample size. A larger biased sample is a more precise estimate of the wrong number.",
      "Measurement bias is separate: leading questions, social desirability and faulty instruments distort answers even from a perfect sample.",
      "Ask three questions of any sample: who was in the frame, who responded, and how were they measured. The answers matter more than n.",
    ],
    dependsOn: ["randomness-and-sample-spaces", "descriptive-statistics"],
    related: ["selection-bias", "survivorship-bias", "base-rates", "psychology-research-methods", "neutral-vs-leading-questions"],
    recallPrompts: [
      { prompt: "Why did the 1936 Literary Digest poll fail despite 2.4 million responses?", answer: "Its frame (telephone and car owners, magazine subscribers) leaned to the better-off, and the roughly quarter who replied differed from those who did not. Bias, not sample size, was the problem; Gallup got it right with about 50,000." },
      { prompt: "What does increasing the sample size fix, and what does it leave untouched?", answer: "It reduces random sampling error; it leaves systematic bias exactly where it was." },
      { prompt: "Name the three questions to ask of any sample.", answer: "Who was in the sampling frame, who responded, and how were they measured." },
    ],
    applications: ["Judging online polls, customer surveys and app reviews", "Designing a survey whose results will bear the weight put on them", "Reading 'a study of 10,000 people' and asking which 10,000"],
    misconception: "That a big sample is a good sample. Size controls random error only; a biased frame or a self-selected set of respondents is wrong at any n.",
    difficulty: 2,
    foundational: true,
    tags: ["sampling", "bias"],
  }),
  concept("st-sampling", {
    id: "sampling-variability",
    title: "Sampling variability and standard error",
    summary:
      "Two honest random samples from the same population give different means. The standard error measures how much a sample statistic would bounce around from sample to sample; it shrinks with the square root of the sample size, which is why precision is expensive.",
    keyPoints: [
      "The sampling distribution of the mean is the distribution of means you would get from repeated samples of size n; its spread is the standard error SE = σ/√n (estimated as s/√n).",
      "Because of the square root, quadrupling the sample halves the standard error; a hundredfold increase cuts it to a tenth.",
      "The central limit theorem makes sample means close to normal for moderate n even when the data are skewed, which is why 'mean ± 2 SE' works so widely.",
      "Small samples produce extreme statistics by chance: the counties with the highest and the lowest cancer rates are both mostly small, sparsely populated ones.",
      "SD describes the data; SE describes the precision of an estimate. Reports that show 'error bars' without saying which are not yet readable.",
    ],
    dependsOn: ["sampling-and-bias", "variance-and-spread", "law-of-large-numbers", "distributions"],
    related: ["simulation-monte-carlo", "expected-value", "confidence-intervals", "judgment-heuristics"],
    recallPrompts: [
      { prompt: "Write the standard error of a sample mean and say what each symbol is.", answer: "SE = σ/√n: the population standard deviation (or its sample estimate s) divided by the square root of the sample size.", accept: ["σ/√n", "s/√n", "sd / sqrt(n)", "sigma over root n"] },
      { prompt: "By what factor must a sample grow to halve the standard error?", answer: "Four. SE falls with the square root of n.", accept: ["4", "four", "quadruple"] },
      { prompt: "What is the difference between a standard deviation and a standard error?", answer: "SD is the spread of the individual data; SE is the spread of an estimate (such as the mean) across repeated samples, and it shrinks as n grows while SD does not." },
    ],
    applications: ["Sizing a survey or an A/B test for the precision required", "Explaining why small schools, hospitals and funds dominate both ends of a league table", "Reading error bars in a paper or a dashboard"],
    misconception: "That a sample's mean is the population's mean. It is one draw from a distribution of possible sample means, and the standard error is the width of that distribution.",
    difficulty: 3,
    foundational: true,
    tags: ["sampling", "standard-error"],
  }),
  concept("st-sampling", {
    id: "confidence-intervals",
    title: "Confidence intervals",
    summary:
      "A confidence interval turns a point estimate and its standard error into a range of values the data are compatible with. A 95 % interval is built by a method that captures the true value in 95 % of samples; any single interval either contains it or does not.",
    keyPoints: [
      "For a mean with a moderate sample, the 95 % interval is roughly estimate ± 1.96 × SE; the multiplier grows for higher confidence or tiny samples.",
      "The 95 % is a property of the procedure across repeated samples, not a probability about this one interval. A Bayesian credible interval is the object that carries the probability people want to read.",
      "Width is precision: a wide interval means the study could not pin the value down, whatever the point estimate says.",
      "An interval that excludes zero corresponds to a significant test at the matching level, but the interval says more: it shows the sizes of effect that remain plausible.",
      "Confidence intervals describe uncertainty from sampling only. Bias, measurement error and a bad model are outside them.",
    ],
    dependsOn: ["sampling-variability", "distributions"],
    related: ["hypothesis-testing", "effect-sizes", "forecasting-and-calibration", "uncertainty-and-scenarios"],
    recallPrompts: [
      { prompt: "State the frequentist reading of 'a 95 % confidence interval for the mean is 34 to 42'.", answer: "Intervals built this way from repeated samples would contain the true mean 95 % of the time; this particular interval either does or does not, and 34 to 42 is the range compatible with the data." },
      { prompt: "What determines the width of a confidence interval?", answer: "The standard error (spread of the data over root n) and the confidence level chosen; more data or a lower level make it narrower." },
      { prompt: "Which sources of error does a confidence interval not capture?", answer: "Systematic bias in sampling or measurement, and errors in the model or assumptions; it covers random sampling variation only." },
    ],
    applications: ["Reading a poll's margin of error and deciding whether a 'lead' is real", "Reporting a measurement with honest uncertainty", "Comparing two studies by the ranges they allow rather than by whether each crossed a threshold"],
    misconception: "That 'there is a 95 % chance the true value is in this interval'. The probability attaches to the method, not to the interval in hand; the sentence people want to say is the Bayesian one, and it needs a prior.",
    difficulty: 3,
    tags: ["inference", "uncertainty"],
  }),
];

/* ------------------------------------------------------------------ */
/* Inference                                                            */
/* ------------------------------------------------------------------ */

const inference: Concept[] = [
  concept("st-inference", {
    id: "hypothesis-testing",
    title: "Hypothesis testing",
    summary:
      "A hypothesis test asks whether the data are surprising under a stated null hypothesis, usually 'no difference'. It is a procedure for controlling how often you would cry wolf if nothing were going on; it is not a measure of how likely the null is, and failing to reject the null is not evidence that the null is true.",
    keyPoints: [
      "Set the null hypothesis and alternative, choose a test statistic and a significance level α before looking at the data, compute the statistic, obtain the p-value, decide, then report the effect size and interval.",
      "α is the long-run rate of false positives you accept when the null is true; 0.05 is a convention from Fisher's 1925 tables, not a law of nature.",
      "A non-significant result means the data did not distinguish the effect from zero. With a small sample that is what you would see whether or not the effect exists.",
      "Two errors: rejecting a true null (type I, rate α) and failing to reject a false one (type II, rate β, whose complement is power).",
      "The test answers a narrow question about one comparison. The scientific question, how big, how reliable, why, needs the estimate, its interval and the design.",
    ],
    dependsOn: ["sampling-variability", "conditional-probability"],
    related: ["deduction-vs-induction", "philosophy-of-science", "scientific-method", "p-values-and-significance", "statistical-power"],
    recallPrompts: [
      { prompt: "What does 'we failed to reject the null hypothesis' license you to conclude?", answer: "Only that the data did not distinguish the effect from zero at the chosen level; with low power that is expected even when the effect is real. It is not evidence that the null is true." },
      { prompt: "Define type I and type II errors and the quantities that control them.", answer: "Type I: rejecting a true null, controlled at rate α. Type II: failing to reject a false null, rate β; power = 1 − β." },
      { prompt: "Why must the significance level be fixed before the data are seen?", answer: "Choosing it afterwards lets the analyst move the line to wherever the result falls, which destroys the false-positive guarantee the test exists to provide." },
    ],
    applications: ["Deciding whether an A/B test's difference is more than noise", "Reading 'no significant effect' in a small trial", "Quality control: deciding whether a process has drifted"],
    misconception: "That the test tells you the probability that the hypothesis is true. It tells you how surprising the data would be if the null were true; converting that into a belief about the hypothesis needs a prior, which the test does not have.",
    difficulty: 3,
    foundational: true,
    tags: ["inference", "testing"],
  }),
  concept("st-inference", {
    id: "p-values-and-significance",
    title: "P-values and significance",
    summary:
      "A p-value is the probability, if the null hypothesis were true, of data at least as extreme as those observed. It is one of the most misread numbers in public life: it is not the probability that the null is true, not the chance the result is a fluke, and not a measure of the size or importance of an effect.",
    keyPoints: [
      "p = P(data at least this extreme | null true). The conditioning runs from hypothesis to data, not the other way; reversing it is the same error as confusing P(positive | ill) with P(ill | positive).",
      "'Significant at 0.05' means p fell below a conventional line. p = 0.049 and p = 0.051 are almost the same evidence; the line is a decision rule, not a fact about the world.",
      "Small p with a large sample can accompany a trivial effect; large p with a small sample can hide a large one. Always ask for the estimate and its interval.",
      "How much a small p should move belief depends on the prior plausibility of the hypothesis and the study's power; a p of 0.04 for an implausible claim in a low-powered field is weak evidence.",
      "Analytic flexibility (choosing outcomes, subgroups, exclusions after seeing the data) manufactures small p-values; preregistration and disclosure are the remedies.",
    ],
    dependsOn: ["hypothesis-testing", "conditional-probability", "bayes-theorem"],
    related: ["base-rates", "replication-crisis", "multiple-comparisons", "effect-sizes", "evidence-and-support"],
    recallPrompts: [
      { prompt: "Define the p-value in one sentence, with the conditioning in the right direction.", answer: "The probability, assuming the null hypothesis is true, of obtaining data at least as extreme as those observed." },
      { prompt: "Name three things a p-value of 0.03 does not mean.", answer: "That there is a 3 % chance the null is true; that there is a 3 % chance the result is due to chance; that the effect is large or important (or that it will replicate with 97 % probability)." },
      { prompt: "Why can p = 0.04 be weak evidence for a claim?", answer: "If the claim was implausible beforehand and the study had low power, most results at that level would be false positives; the posterior depends on prior and power, not on p alone." },
    ],
    applications: ["Reading a press release that says 'statistically significant'", "Judging a result in a field with many small, flexible studies", "Deciding whether one significant test should change a business decision"],
    misconception: "That p is the probability the result happened by chance. Under the null everything is chance; p measures how extreme the data are under that assumption, not how probable the assumption is.",
    difficulty: 3,
    foundational: true,
    tags: ["inference", "p-values"],
  }),
  concept("st-inference", {
    id: "effect-sizes",
    title: "Effect sizes",
    summary:
      "An effect size says how big a difference or relationship is, in units that can be compared across studies: a raw difference with its units, a standardised difference such as Cohen's d, a correlation, a risk ratio or a difference in risks. Significance says whether an effect was detected; the effect size says whether it matters.",
    keyPoints: [
      "Cohen's d = (mean₁ − mean₂) / pooled SD: the difference in standard-deviation units. Cohen's own rough benchmarks (0.2 small, 0.5 medium, 0.8 large) are conventions he warned against using mechanically.",
      "Relative risks flatter: '20 % lower risk' may mean 5 % rather than 4 %. Ask for the absolute difference and the number needed to treat.",
      "With a large enough sample any non-zero effect becomes significant; with a tiny one only huge effects do. Report the estimate and its interval, not the verdict.",
      "Whether an effect is practically important is a domain judgement (cost, harm, alternatives), not a statistical one; d = 0.1 on mortality can matter more than d = 0.8 on a questionnaire.",
      "Published effects are biased upward: the studies that reached significance overestimate on average, especially when underpowered (the winner's curse).",
    ],
    dependsOn: ["descriptive-statistics", "p-values-and-significance"],
    related: ["confidence-intervals", "statistical-power", "expected-value-decisions", "fractions-ratios-percentages"],
    recallPrompts: [
      { prompt: "Write Cohen's d and say what a value of 0.5 means.", answer: "d = (mean₁ − mean₂) / pooled SD; 0.5 means the group means differ by half a standard deviation." },
      { prompt: "Why is a relative risk reduction not enough to judge a treatment?", answer: "It hides the base rate: a 20 % relative reduction from 5 % to 4 % is one percentage point absolute, and the decision depends on that and the costs." },
      { prompt: "Why are published effect sizes typically overestimates?", answer: "Studies are more often published when significant; among noisy studies, the ones that cross the line are those whose estimates came out large by chance." },
    ],
    applications: ["Comparing two interventions reported in different studies", "Translating a drug's relative risk into absolute numbers for a decision", "Judging whether a 'significant' business result is worth acting on"],
    misconception: "That a smaller p-value means a bigger effect. p mixes effect size with sample size; a huge study makes trivial effects highly significant.",
    difficulty: 3,
    tags: ["inference", "magnitude"],
  }),
  concept("st-inference", {
    id: "statistical-power",
    title: "Statistical power",
    summary:
      "Power is the probability that a study will detect an effect of a given size if the effect is real. Low-powered studies miss true effects, exaggerate the ones they find, and fill literatures with false positives; they are the quiet cause of much of the replication problem.",
    keyPoints: [
      "Power = 1 − β = P(reject the null | the effect has the stated size). It rises with sample size, effect size and α, and falls with noise.",
      "A study with 80 % power for an effect it is looking for still misses it one time in five; a null result from a low-powered study is close to uninformative.",
      "In a low-powered field, a significant result is more likely to be a false positive than the p-value suggests, because few true effects are detected while false positives occur at the usual rate.",
      "Significant estimates from underpowered studies are inflated: only unusually large sample estimates cross the line (type M error), and some have the wrong sign (type S).",
      "Power is decided before the study: choose the smallest effect worth detecting, then find the n that gives 80–90 % power for it.",
    ],
    dependsOn: ["hypothesis-testing", "effect-sizes", "sampling-variability"],
    related: ["replication-crisis", "value-of-information", "bayes-theorem", "base-rates", "psychology-research-methods"],
    recallPrompts: [
      { prompt: "Define power and name the three things that raise it.", answer: "The probability of detecting an effect of a given size when it exists; raised by a larger sample, a larger true effect and a less strict α (or less noisy measurement)." },
      { prompt: "Why do low-powered fields have a high share of false positives among significant results?", answer: "True effects are rarely detected (few true positives) while false positives still occur at rate α on true nulls, so the significant results are a mix weighted toward false ones." },
      { prompt: "What is the winner's curse in estimation?", answer: "When power is low, only estimates that came out unusually large reach significance, so published significant effects overestimate the truth.", accept: ["overestimate", "inflated", "type M"] },
    ],
    applications: ["Sizing an experiment before running it", "Reading a 'no effect' headline from a small trial", "Weighing a surprising finding from a field with small samples"],
    misconception: "That a non-significant result in a small study shows the effect is absent. Absence of evidence is not evidence of absence when the study had little chance of finding the effect in the first place.",
    difficulty: 4,
    tags: ["inference", "design"],
  }),
  concept("st-inference", {
    id: "regression",
    title: "Regression",
    summary:
      "Regression fits a line (or a more general function) that predicts one variable from others. Its coefficients are associations holding the other included variables fixed; reading them correctly means minding units, the intercept, R², what was and was not controlled for, and the difference between prediction and cause.",
    keyPoints: [
      "In y = a + b·x, the slope b is the change in predicted y per unit of x; the intercept a is the prediction at x = 0, often outside the data and meaningless on its own.",
      "R² is the share of the variance in y accounted for by the fitted line; a low R² with a precise slope is common and not a contradiction.",
      "With several predictors, each coefficient is the association with y among cases that share the same values of the other predictors; adding or removing a variable can change the sign of another.",
      "A regression coefficient is causal only if the model includes every confounder and no collider, and the relationship is correctly specified; without a design that supports that, it is a description.",
      "Regression with log-transformed variables gives proportional readings: a slope of b on ln(x) means b × ln(1.1) ≈ 0.095b for a 10 % rise in x.",
      "The name is Galton's (1886): children of tall parents 'regressed towards mediocrity'. The statistical phenomenon and the method share a birthplace.",
    ],
    dependsOn: ["correlation", "linear-equations", "functions-and-graphs"],
    related: ["confounding", "causal-graphs", "machine-learning-basics", "exponents-and-logarithms", "regression-to-the-mean"],
    recallPrompts: [
      { prompt: "In price = 45 + 2.8 × area, what do the 45 and the 2.8 mean, and which is safe to interpret?", answer: "2.8 is the predicted price change per unit of area; 45 is the prediction at zero area, an extrapolation outside the data and not to be read literally." },
      { prompt: "What does a coefficient in a multiple regression hold fixed?", answer: "The other variables in the model: it is the association with the outcome among cases with the same values of the other predictors." },
      { prompt: "Under what conditions can a regression coefficient be read as a causal effect?", answer: "When all confounders are included, no collider or mediator is wrongly controlled for, and the functional form is right; in practice, when the design (randomisation, a natural experiment) justifies it." },
    ],
    applications: ["Pricing models, demand forecasts and any 'per unit' prediction", "Reading tables of coefficients in economics, medicine and social science", "Machine learning: linear regression is the first and most interpretable model"],
    misconception: "That 'controlling for' a variable turns an association into a cause. It removes the influence of that variable only; unmeasured confounders remain, and controlling for the wrong variable (a collider) creates bias.",
    difficulty: 4,
    tags: ["modelling", "prediction"],
  }),
  concept("st-inference", {
    id: "multiple-comparisons",
    title: "Multiple comparisons",
    summary:
      "Test twenty true null hypotheses at α = 0.05 and you expect one false positive; the chance of at least one is 64 %. Every extra outcome, subgroup, model or peek at the data is another lottery ticket, and the significant one you report is meaningless unless the tickets are counted.",
    keyPoints: [
      "With m independent tests at level α and all nulls true, P(at least one false positive) = 1 − (1 − α)^m: 0.23 for five tests, 0.64 for twenty, 0.99 for a hundred.",
      "Bonferroni divides α by m; false-discovery-rate procedures accept some false positives among many discoveries. Both require knowing how many tests were run.",
      "The garden of forking paths: choices made after seeing the data (which outcome, which subgroup, which exclusions, which covariate) multiply comparisons without anyone running a second test.",
      "Subgroup findings ('the drug worked in women over 60') are the commonest disguised multiple comparison; treat them as hypotheses for a new study.",
      "Preregistration fixes the analysis before the data arrive; replication tests whether a chosen comparison survives fresh data.",
    ],
    dependsOn: ["p-values-and-significance", "probability-rules", "independence"],
    related: ["replication-crisis", "combinatorics", "philosophy-of-science", "interpreting-research"],
    recallPrompts: [
      { prompt: "Twenty independent tests at α = 0.05, all nulls true. Probability of at least one significant result?", answer: "1 − 0.95^20 ≈ 0.64.", accept: ["0.64", "64 %", "0.642"] },
      { prompt: "What is the garden of forking paths?", answer: "The multiplication of implicit comparisons when analytic choices are made after seeing the data; a single reported test can stand in for many that were never run but would have been." },
      { prompt: "What does the Bonferroni correction do, and what does it need?", answer: "Divides the significance level by the number of tests; it needs the true number of comparisons, including the ones that were only considered." },
    ],
    applications: ["Reading a study that reports one significant outcome among many measured", "A/B testing with many variants or repeated peeking", "Screening for anomalies in finance, genetics or fraud detection without being fooled by chance"],
    misconception: "That a significant result in a subgroup or a secondary outcome counts as a finding. It counts as one ticket among many; the number of tickets decides what it is worth.",
    difficulty: 4,
    tags: ["inference", "false-positives"],
  }),
];

/* ------------------------------------------------------------------ */
/* Reading research                                                     */
/* ------------------------------------------------------------------ */

const studies: Concept[] = [
  concept("st-studies", {
    id: "experiments-vs-observational",
    title: "Experiments versus observational studies",
    summary:
      "In an experiment the investigator assigns the treatment, ideally at random; in an observational study the world assigns it, and whatever decided the assignment may also decide the outcome. That single difference is why experiments can support causal claims and observational studies must argue for them.",
    keyPoints: [
      "Random assignment makes the treated and untreated groups alike, in expectation, on every characteristic, measured or not; nothing else does.",
      "Observational designs: cross-sectional (one snapshot), cohort (follow groups forward), case-control (start from outcomes and look back). Each is vulnerable to confounding and selection in its own way.",
      "Adjustment, matching and stratification remove measured confounders only; a missing or badly measured one leaves the bias in place.",
      "Experiments have their own limits: artificial settings, short horizons, non-compliance, samples that do not represent the population the result will be applied to.",
      "Some questions cannot be randomised (smoking, poverty, divorce). There, converging evidence from different designs with different weaknesses is what earns a causal conclusion.",
    ],
    dependsOn: ["sampling-and-bias", "correlation"],
    related: ["confounding", "randomised-experiments", "natural-experiments", "scientific-method", "psychology-research-methods"],
    recallPrompts: [
      { prompt: "What is the one feature that distinguishes an experiment from an observational study?", answer: "The investigator assigns the treatment (at random, ideally) rather than observing who happened to receive it." },
      { prompt: "What does randomisation achieve that statistical adjustment cannot?", answer: "Balance on unmeasured as well as measured characteristics, in expectation; adjustment can only handle what was measured." },
      { prompt: "Name a weakness of experiments that observational studies often avoid.", answer: "Artificial settings or unrepresentative samples: the result may not generalise to the population or conditions of interest; also short horizons and non-compliance." },
    ],
    applications: ["Deciding how much to trust a health, education or policy claim", "Choosing a design for a business or product question", "Understanding why nutrition headlines reverse so often"],
    misconception: "That a large, well-adjusted observational study is as good as a small experiment. It can be very informative, but adjustment is only as complete as the list of confounders the analyst thought of and measured.",
    difficulty: 3,
    foundational: true,
    tags: ["design", "research"],
  }),
  concept("st-studies", {
    id: "interpreting-research",
    title: "Interpreting a research paper",
    summary:
      "Reading a study is a set of questions asked in order: what was measured, on whom, by what design, how big the effect was and with what uncertainty, how many comparisons were tried, and who paid. Most bad interpretations come from skipping to the conclusion.",
    keyPoints: [
      "Design first: randomised or observational, sample size, who was excluded, how long they were followed. The abstract's causal language is only as strong as the design permits.",
      "Find the estimate and its interval, not the p-value; convert relative effects into absolute ones; ask whether the outcome is what matters or a proxy for it.",
      "Count the comparisons: outcomes, subgroups, time points, model specifications. Check whether the analysis was preregistered and whether the primary outcome changed.",
      "Ask about the population: results from young volunteers, one country or one clinic may not carry over.",
      "Weigh the study in its literature: replications, meta-analyses, funding, and whether the effect shrinks as samples grow (a sign of publication bias).",
      "A single study is a data point about a question, not the answer to it; 'a study finds' should be read as 'one study reported'.",
    ],
    dependsOn: ["experiments-vs-observational", "p-values-and-significance", "effect-sizes", "confidence-intervals"],
    related: ["statistical-power", "multiple-comparisons", "replication-crisis", "evidence-and-support", "summary-and-precis"],
    recallPrompts: [
      { prompt: "List, in order, the first four questions to ask of a study.", answer: "What design; who was studied and how many; how big is the effect and how uncertain; how many comparisons were made (and was the analysis preregistered)." },
      { prompt: "Why convert a relative effect into an absolute one when reading a paper?", answer: "Because the relative figure hides the base rate; the absolute difference is what decisions depend on." },
      { prompt: "What does it signal when an effect shrinks as later, larger studies appear?", answer: "Publication bias and the winner's curse in the early, small studies; the true effect is probably nearer the later estimate.", accept: ["publication bias", "winner's curse", "decline effect"] },
    ],
    applications: ["Deciding whether to change a habit on the strength of a headline", "Briefing a decision-maker on the state of evidence", "Reviewing evidence in a project or investigation"],
    misconception: "That peer review certifies a finding. Peer review checks whether a paper is reasonable to publish; replication, effect sizes and the wider literature decide whether it is true.",
    difficulty: 4,
    tags: ["research", "reading"],
  }),
  concept("st-studies", {
    id: "regression-to-the-mean",
    title: "Regression to the mean",
    summary:
      "When something is selected because it measured extreme, its next measurement will on average be closer to the mean, purely because part of the extremity was luck. Whatever was done in between gets the credit. It explains the failure of praised pilots, the improvement of the worst performers and the sophomore slump, and it needs no cause at all.",
    keyPoints: [
      "Any measurement mixes a stable component with noise; a value picked for being extreme has, on average, extreme noise, which does not repeat.",
      "The effect is proportional to how imperfect the correlation is between the two measurements: with r = 1 there is no regression; with r = 0 the second measurement is expected to sit at the mean.",
      "It masquerades as causation whenever intervention follows an extreme: the worst-performing units get the training, the sickest get the treatment, the loudest complaints get the response.",
      "The only clean defence is a comparison group selected the same way but not treated; without it, the 'improvement' after intervention is uninterpretable.",
      "Galton found it in heights (1886); Secrist's 1933 'Triumph of Mediocrity in Business' mistook it for a law of economics, and Hotelling's review explained why.",
    ],
    dependsOn: ["correlation", "sampling-variability"],
    related: ["regression", "judgment-heuristics", "confounding", "counterfactuals", "randomised-experiments"],
    recallPrompts: [
      { prompt: "Why do the worst performers in one period tend to improve in the next, even with no intervention?", answer: "Their first score was partly bad luck; luck does not persist, so the next score is expected to move toward the mean." },
      { prompt: "What determines how much regression to the mean to expect?", answer: "The correlation between the two measurements: the lower it is, the further the second is expected to sit toward the mean.", accept: ["correlation", "reliability"] },
      { prompt: "What design protects a before-and-after comparison from regression to the mean?", answer: "A control group selected by the same extreme criterion but not given the intervention; the difference between groups is the effect." },
    ],
    applications: ["Evaluating a training scheme given to the weakest staff", "Reading 'hot' fund managers and 'cursed' award winners", "Judging a treatment that patients seek when their symptoms are worst"],
    misconception: "That regression to the mean is a force pulling values back. Nothing pulls; extreme measurements simply carried extreme luck, and the population average of luck is zero.",
    difficulty: 3,
    tags: ["research", "selection"],
  }),
  concept("st-studies", {
    id: "simpsons-paradox",
    title: "Simpson's paradox",
    summary:
      "A trend that holds in every subgroup can reverse when the subgroups are pooled, because the groups are unequal in size and a lurking variable decides both group membership and outcome. The arithmetic is elementary; the decision about which level to believe is causal, not statistical.",
    keyPoints: [
      "Pooled rates are weighted averages: a treatment can win in both easy and hard cases yet lose overall if it was given the hard cases more often.",
      "Kidney-stone surgery (Charig et al. 1986): open surgery beat the less invasive method for small stones (93 % vs 87 %) and for large ones (73 % vs 69 %), and lost overall (78 % vs 83 %) because it was used on more large stones.",
      "Berkeley 1973 admissions: women were admitted less often overall (35 % vs 44 %) while most departments admitted women at equal or higher rates; women had applied to the more competitive departments.",
      "Whether the pooled or the stratified figure is the right one depends on the causal structure: stratify on a variable that precedes treatment (stone size), do not stratify on one the treatment affects.",
      "Any comparison of rates across groups of different composition invites the paradox: hospital mortality, school results, wage gaps, batting averages.",
    ],
    dependsOn: ["conditional-probability", "descriptive-statistics", "fractions-ratios-percentages"],
    related: ["confounding", "causal-graphs", "base-rates", "correlation-vs-causation"],
    recallPrompts: [
      { prompt: "How can treatment A beat B in every subgroup and lose overall?", answer: "The pooled rate weights each subgroup by how often each treatment was used there; if A was given mostly the hard cases, its overall rate falls below B's." },
      { prompt: "What decides whether to trust the stratified or the pooled comparison?", answer: "The causal role of the stratifying variable: stratify on a cause of both treatment and outcome that precedes treatment; do not stratify on a consequence of treatment." },
      { prompt: "What explained the Berkeley 1973 admissions gap?", answer: "Women applied disproportionately to departments with low admission rates; within most departments they were admitted at least as often as men.", accept: ["department", "competitive departments"] },
    ],
    applications: ["Comparing hospitals, schools or teams with different case mixes", "Reading wage-gap and admission statistics", "Auditing a dashboard whose aggregate contradicts its segments"],
    misconception: "That the paradox is a statistical trick to be resolved by always disaggregating. Disaggregating on the wrong variable (one affected by the treatment) creates the bias it is meant to cure; the choice needs a causal picture.",
    difficulty: 4,
    tags: ["research", "aggregation"],
  }),
];

export const STATISTICS_CONCEPTS: Concept[] = [...descriptive, ...sampling, ...inference, ...studies];
