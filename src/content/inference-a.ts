/**
 * Inference room content, part A.
 * Three Stories, Best Explanation, Missing Variable, Base Rate, Counterfactual, Anomaly.
 *
 * Keywords are lower-case stems for deterministic matching (substring, see keyPointCoverage in lib/scoring/text.ts);
 * each keyword may carry synonyms separated by "|".
 */
import type {
  ThreeStoriesChallenge,
  BestExplanationChallenge,
  MissingVariableChallenge,
  BaseRateChallenge,
  CounterfactualChallenge,
  AnomalyChallenge,
} from "@/lib/domain/content";

/* ---------------- Three Stories ----------------
 * The user reads the evidence and must produce at least three distinct explanations
 * before committing to any. "obvious" is the story most people leap to.
 */
export const THREE_STORIES: ThreeStoriesChallenge[] = [
  {
    id: "ts-quiet-colleague",
    title: "The colleague who stopped coming to lunch",
    evidence: [
      "A colleague who joined the team lunch most days has not come for three weeks.",
      "She now arrives forty minutes earlier than she used to and leaves on time.",
      "Her shared calendar shows several afternoon blocks marked simply 'Private'.",
      "She declined a place on a new project that she would have asked for a year ago.",
      "Her work is on time and, if anything, tidier than before.",
    ],
    plausible: [
      {
        title: "She is looking for another job",
        keywords: ["interview|job hunt|looking for another|new job|leaving", "recruit"],
        note: "The classic reading. Private afternoon blocks and refusing long commitments fit it. So does the tidiness: people about to leave often clear their desk in every sense.",
      },
      {
        title: "Something outside work now claims her afternoons",
        keywords: ["childcare|school run|relative|parent|caring|family", "course|study|evening class|training", "appointment|commitment"],
        note: "A new school timetable, a relative who needs collecting, a part-time course. Earlier arrival buys a guilt-free early departure. Declining a project is what a conscientious person does when they know their hours are spoken for.",
      },
      {
        title: "She has been given confidential work",
        keywords: ["confidential|secret|restructur|acquisition|merger|due diligence", "special project|assignment"],
        note: "Restructurings, acquisitions and disciplinary matters are all run through small circles who suddenly have unlabelled meetings and cannot take on visible commitments. The shared calendar is telling you exactly as much as it is allowed to.",
      },
      {
        title: "A falling-out or a quiet withdrawal",
        keywords: ["conflict|falling-out|argument|dispute|upset", "burnout|withdraw|disengag|morale", "manager"],
        note: "Someone who has decided that lunch is where the office politics happen may simply stop going. Skipping lunch and declining a project are also what disengagement looks like from the outside, even when the work itself stays good.",
      },
    ],
    obvious: "She is interviewing elsewhere and about to hand in her notice.",
    debrief:
      "Every line here is consistent with at least four stories, and none of them discriminates between the stories. That is the point. Premature closure is not choosing the wrong story; it is choosing any story before you have an observation that only one of them explains. The discriminating evidence would be cheap: an honest conversation, or simply time. Note also what you cannot know from a calendar, and should not try to guess.",
    difficulty: 3,
  },
  {
    id: "ts-empty-harbour-town",
    title: "The empty harbour town",
    evidence: [
      "You arrive in a small coastal town on a Tuesday in the second week of September.",
      "The hotel you booked has perhaps six other guests; the breakfast room is set for forty.",
      "The seafood restaurant that every online guide recommends is shut, with no sign explaining why.",
      "Half the shops on the harbour front are closed by five in the afternoon.",
    ],
    plausible: [
      {
        title: "The season ended last week",
        keywords: ["season|off-season|end of season|out of season", "school|holiday|summer"],
        note: "In much of Europe the switch is abrupt: schools reopen, the last week of August empties the beaches, and by mid-September owners are painting shutters. The restaurant may take its own holiday in September precisely because it has worked every day since May.",
      },
      {
        title: "A local holiday or observance",
        keywords: ["local holiday|feast|festival|saint|public holiday|bank holiday|observance", "closed for the day"],
        note: "A regional holiday can close a town for a day or two without appearing in any guide written for outsiders. The restaurant not posting a sign is what a place does when everyone who matters already knows.",
      },
      {
        title: "Something recent diverted visitors",
        keywords: ["storm|flood|road closed|landslide|ferry|strike|cancel", "warning|advisory|news"],
        note: "A cancelled ferry, a closed coast road or a bad forecast can empty a town whose visitors are all day-trippers. You came a different way and did not notice.",
      },
      {
        title: "It is a weekend town, and this is Tuesday",
        keywords: ["weekend|weekday|tuesday|midweek", "second home|day-trip|city"],
        note: "Some resorts serve a nearby city and are quiet from Monday to Thursday all year. The breakfast room set for forty is for Saturday.",
      },
    ],
    obvious: "The town is in decline and the hotel is a poor choice; the guides are out of date.",
    debrief:
      "A first impression on arrival is a single sample of one day of the year, and travellers reach for the dramatic story: decline, decay, a mistake. The mundane stories (calendars, weekdays, weather) explain empty towns far more often than decline does. Premature closure here costs you the town: you spend the week judging it rather than asking the receptionist a single question.",
    difficulty: 2,
  },
  {
    id: "ts-fourth-experiment",
    title: "Three out of four",
    evidence: [
      "A laboratory reports that a compound reduces tumour volume in mice by roughly forty per cent.",
      "The effect appeared in three of four replicate experiments; in the fourth it was absent.",
      "The fourth experiment used mice from a different supplier because the usual one was out of stock.",
      "All four experiments were run by the same two researchers, who measured the tumours themselves.",
      "Each experiment used eight treated and eight control animals.",
    ],
    plausible: [
      {
        title: "The compound works and the fourth batch was the odd one out",
        keywords: ["works|real effect|genuine", "batch|supplier|odd one out|faulty|outlier"],
        note: "Possible, and what the lab believes. But 'the experiment that disagreed is the faulty one' is a rule that will never let you be wrong. What was actually different about those mice?",
      },
      {
        title: "A real effect that depends on the animals",
        keywords: ["strain|genetic|background|microbiome|gut flora", "depends on|modifier|interaction"],
        note: "Mice from different suppliers differ in strain substrain and, notably, in gut microbiome, which is known to change drug responses. If so, the compound works in some animals and not others, which matters enormously for a human trial. The fourth experiment is then the most informative one.",
      },
      {
        title: "The three positives share a hidden confound",
        keywords: ["unblind|blind|bias|expectation|measured themselves", "confound|same technician|same batch of compound|artefact"],
        note: "Unblinded measurement by people who hope for a result inflates effects in animal studies reliably and without anyone lying. The same compound stock, the same cage positions, the same handling: anything shared by the three and absent from the fourth is a candidate.",
      },
      {
        title: "Noise in small samples",
        keywords: ["noise|chance|small sample|eight animals|variance|random", "underpowered|statistic"],
        note: "With eight animals per arm, a forty per cent difference can appear and vanish by chance. Three of four is less impressive than it sounds if you were going to run more experiments until the picture looked clean.",
      },
    ],
    obvious: "The drug works; the fourth experiment failed because of the substitute mice.",
    debrief:
      "The trap is treating the dissenting experiment as an error rather than as data. Premature closure in science usually looks like this: the hypothesis arrives first, and every inconvenient result gets a local excuse. A good reviewer asks for the fourth experiment to be repeated with both suppliers, blinded, before believing either story.",
    difficulty: 5,
  },
  {
    id: "ts-shares-fell-on-good-news",
    title: "Good numbers, falling price",
    evidence: [
      "A listed company reports quarterly revenue and profit both above analysts' consensus.",
      "Its shares fall twelve per cent by the close of the same day.",
      "The company's main competitor, which reported nothing, falls three per cent.",
      "Trading volume in the company's shares is five times its daily average.",
    ],
    plausible: [
      {
        title: "The guidance, not the quarter, was the news",
        keywords: ["guidance|outlook|forecast|next quarter|margin", "conference call|commentary|management said"],
        note: "Results are backward-looking. If the call revealed weaker orders, a lost customer or shrinking margins, the market is pricing the future and ignoring the past. The headline beat was never the interesting number.",
      },
      {
        title: "The beat was already priced in",
        keywords: ["priced in|whisper|expectations|already expected|run-up|buy the rumour", "sell the news"],
        note: "If the shares rose thirty per cent in the weeks before, the true bar was higher than the published consensus. Beating the consensus but missing the whisper number is a miss. The fall is a repricing of an over-optimistic crowd, not a verdict on the business.",
      },
      {
        title: "A sector or macro move on the same day",
        keywords: ["sector|macro|interest rate|central bank|market-wide|index|everything fell", "competitor also"],
        note: "The competitor also fell. Perhaps a rate decision, a regulatory rumour or a large fund selling the whole sector. The company's own news may be nearly irrelevant to the size of the move.",
      },
      {
        title: "Mechanical selling",
        keywords: ["forced|mechanical|index rebalanc|lock-up|large holder|block", "liquidity|volume"],
        note: "A lock-up expiry, an index exclusion or a large holder's forced liquidation can move a price twelve per cent regardless of fundamentals. Volume five times normal is consistent with that as much as with a change of opinion.",
      },
    ],
    obvious: "The market knows something bad that is not in the report, or the market is simply irrational.",
    debrief:
      "The phrase 'the market is irrational' usually marks the point where someone stopped looking. Four ordinary mechanisms explain a fall on good news, and two of them can be checked in minutes: read the guidance, look at the price chart before the report. Premature closure here is expensive because it invites the wrong trade: buying 'the overreaction' before knowing whether it was one.",
    difficulty: 4,
  },
  {
    id: "ts-abandoned-city",
    title: "The city that emptied",
    evidence: [
      "Excavations show a city of some ten thousand people abandoned within a generation around 1200.",
      "Houses were left with storage jars and grinding stones in place; there is no burn layer and no mass burial.",
      "The nearby river channel that fed the city's canals is now dry, silted in a way that points to a shift in course.",
      "Inscriptions stop about the same time; the last ones name a ruler otherwise unknown.",
      "Pottery of the city's style continues to be made, for a while, in a settlement forty kilometres away.",
    ],
    plausible: [
      {
        title: "The river moved and the city died of thirst",
        keywords: ["river|water|canal|irrigation|drought|silt|channel|environment|climate"],
        note: "Cities on rivers that shift course have died this way across the Indus, the Yellow River basin and Mesopotamia. Abandonment can be quick once a harvest fails, and people carry what they can, leaving heavy jars behind. The nearby settlement making the same pottery is where they went.",
      },
      {
        title: "The seat of power moved and the population followed",
        keywords: ["capital|political|court|ruler|elite|relocat|moved the capital|new king|dynasty"],
        note: "When a ruler founds a new capital, craftsmen, officials and markets go too. The unknown ruler in the last inscriptions might be a usurper or a founder elsewhere. No violence, no burning, and a continuity of style forty kilometres away all fit.",
      },
      {
        title: "Epidemic",
        keywords: ["plague|epidemic|disease|pandemic|sickness|mortality"],
        note: "Fast, leaves goods in place. But an epidemic that kills fast tends to leave burials, and the survivors usually return. The absence of mass graves is weak evidence against, not proof: bodies may lie outside the excavated area.",
      },
      {
        title: "The 'sudden' abandonment is an artefact of the digging",
        keywords: ["sampling|excavat|dating|resolution|artefact|only part|radiocarbon|trench", "gradual"],
        note: "Radiocarbon dating rarely resolves better than a few decades, and only a small fraction of any city is excavated. A gradual decline across two generations can look like a single event when it is seen through three trenches and a dating error bar.",
      },
    ],
    obvious: "A sudden catastrophe: invasion or plague emptied the city.",
    debrief:
      "Catastrophe is the story that suits the evidence least and the imagination best. The abandoned kitchen implies haste only if you assume people would otherwise have taken their grinding stones. Premature closure in history takes the form of a narrative that arrives before the stratigraphy is read. The most disciplined response is to ask what the dry river channel dates to, because it is the one clue that could separate the stories.",
    difficulty: 5,
  },
  {
    id: "ts-neighbours-away",
    title: "Next door",
    evidence: [
      "The neighbours' lights come on at seven every evening and go off at eleven, to the minute.",
      "Their car has not moved from the drive in ten days.",
      "Post is visible piling up inside the glass front door.",
      "Their bins were put out on the right morning this week and taken in again by evening.",
    ],
    plausible: [
      {
        title: "Away, with someone keeping an eye on the house",
        keywords: ["holiday|away|travel|vacation|trip", "friend|key holder|relative|neighbour|keeping an eye"],
        note: "Timer lights, a car left behind because they flew, a friend with a key who does the bins but steps over the post. The most ordinary story, and the one most people tell.",
      },
      {
        title: "One of them is at home, keeping strange hours",
        keywords: ["shift|night shift|hospital|working nights|one of them|still there|at home"],
        note: "A partner working nights sleeps through the daytime, walks to work, uses the timer because it is easier, and puts out the bins because they still live there. The post piles because it is not theirs.",
      },
      {
        title: "Someone else is staying there",
        keywords: ["house-sitter|lodger|relative staying|guest|tenant|airbnb|staying"],
        note: "A visiting relative or a short-term guest will do the bins because they were asked to, ignore the post because it is not addressed to them, and keep the owners' timers running.",
      },
      {
        title: "The household is changing",
        keywords: ["moved out|separat|split|moving|new home|left"],
        note: "One partner has gone; the other is gradually moving things and comes back to do the bins. The unmoved car may belong to whoever left. This is the story people avoid saying aloud, which does not make it less common.",
      },
    ],
    obvious: "They are on holiday and a friend is looking after the house.",
    debrief:
      "Four lines of evidence, and the obvious story is likely to be right. That is fine: the exercise is not to distrust the likely story but to hold it lightly. Premature closure matters here mainly in how you act, for instance whether you would call the police about a 'stranger' taking the bins in. Knowing that a lodger or a night-shift partner is possible changes what you do before it changes what you believe.",
    difficulty: 2,
  },
  {
    id: "ts-daily-actives-drop",
    title: "Fifteen per cent fewer users",
    evidence: [
      "A consumer app ships a release on Monday; by the following Monday, daily active users are down fifteen per cent.",
      "The crash rate is unchanged and app-store ratings are unchanged.",
      "Support tickets are at their usual level; nobody is writing in to complain.",
      "The release included a refactor of the analytics library.",
      "A competitor launched a widely covered feature the same week.",
    ],
    plausible: [
      {
        title: "The measurement changed, not the users",
        keywords: ["analytics|instrumentation|logging|tracking|measurement|event|telemetry|refactor", "counting"],
        note: "The strongest candidate. A silent fall with no crashes, no complaints and no rating change is what an under-counting bug looks like. Users who have left tend to say why; a broken event tracker says nothing.",
      },
      {
        title: "The competitor took them",
        keywords: ["competitor|rival|switched|launch|churn"],
        note: "Possible, but fifteen per cent of daily users in a week is a violent shift for a competitor feature, and you would expect some reviews to mention it.",
      },
      {
        title: "Seasonality or an external calendar",
        keywords: ["season|holiday|school|term|calendar|bank holiday|weather|last year"],
        note: "A school holiday, a heatwave, a public holiday in your biggest market. The check is the same week last year, which nobody has looked at yet.",
      },
      {
        title: "The release quietly removed something a minority relied on",
        keywords: ["removed|feature|deprecat|widget|shortcut|workflow|power users|segment"],
        note: "A feature used by a segment that does not write reviews (older devices, a particular locale). Segment the drop by platform, region and app version before believing anything.",
      },
    ],
    obvious: "The release broke something and users are leaving.",
    debrief:
      "Panic assumes the number is true. The first question about any sudden shift in a metric is whether the metric itself changed, and the analytics refactor is sitting in plain sight. Premature closure here would lead to a rollback, a post-mortem and an apology for something that may never have happened. Check the instrument before you check the world.",
    difficulty: 4,
  },
  {
    id: "ts-striker-drought",
    title: "Three goals in fifteen games",
    evidence: [
      "A striker who scored twenty goals last season has three after fifteen games of this one.",
      "His shots per game are the same as last season; his shots on target are slightly higher.",
      "The club appointed a new manager in the summer who plays a more possession-based style.",
      "He has played every minute of every game.",
    ],
    plausible: [
      {
        title: "Regression to the mean",
        keywords: ["regression|mean|average|luck|conversion|outlier|overperform|expected goals|xg|variance"],
        note: "Twenty goals from the same number of shots on target was an unusually good conversion rate. Conversion is mostly noise from season to season; the shots are the skill. On the evidence, the shooting is unchanged and the finishing luck has turned.",
      },
      {
        title: "The system changed the chances",
        keywords: ["tactic|system|style|possession|manager|chance quality|role|position|wider|service"],
        note: "Same number of shots does not mean the same chances. A possession style can produce more shots from worse angles, or ask a striker to hold the ball rather than run behind. Shot volume hides chance quality.",
      },
      {
        title: "He is carrying something",
        keywords: ["injur|carrying|knock|fitness|fatigue|tired|pain"],
        note: "Playing every minute does not mean playing well. A player managing a minor problem may keep his shot count and lose the half-yard that separates a goal from a save. Not knowable from the outside, and worth noticing that you cannot know it.",
      },
      {
        title: "Opponents have adapted",
        keywords: ["marked|marking|adapt|opponents|scouting|double|defend|figured him out"],
        note: "After a twenty-goal season, defenders study you. Being marked more closely can leave shots-per-game intact while pushing them to lower-value positions.",
      },
    ],
    obvious: "He has lost his form or his confidence.",
    debrief:
      "'Lost his confidence' is a story that explains everything and predicts nothing. The shot data is doing real work here: it argues against decline and for either noise or a change in chance quality, which are checkable. Premature closure in sport is cheap for pundits and expensive for clubs, which sell players at the bottom of a random dip.",
    difficulty: 3,
  },
  {
    id: "ts-exam-results-jump",
    title: "From fifty-five to seventy-eight",
    evidence: [
      "A secondary school's exam pass rate rises from fifty-five per cent to seventy-eight per cent in a single year.",
      "A new head teacher arrived the previous September.",
      "The school's intake in that year group is thirty pupils smaller than the year before.",
      "The exam board revised its grade boundaries that year; the national pass rate rose four points.",
      "Neighbouring schools rose between two and six points.",
    ],
    plausible: [
      {
        title: "The cohort changed",
        keywords: ["cohort|intake|smaller|who sat|withdrawn|entered|excluded|selection|off-roll|thirty pupils"],
        note: "Thirty fewer pupils is a large change in a year group. If pupils unlikely to pass were not entered, or moved school, the pass rate rises with no one learning more. This is the first thing an inspector checks and the last thing a press release mentions.",
      },
      {
        title: "The exam got easier",
        keywords: ["grade boundar|exam board|easier|national|everyone rose|standard"],
        note: "The national rise of four points explains a part of the jump. It does not explain twenty-three points, but it must be subtracted before anything else is credited.",
      },
      {
        title: "Regression from an unusually bad year",
        keywords: ["regression|bad year|previous year|dip|unusual|mean|bounce"],
        note: "If fifty-five was itself a sharp fall from the school's usual sixty-five, part of the rise is a return to normal. The right comparison is the five-year trend, not last year.",
      },
      {
        title: "The new head really did change the teaching",
        keywords: ["teaching|head teacher|leadership|improved|intervention|tutoring|revision|behaviour"],
        note: "It happens. But genuine improvement tends to show up in more than one number: attendance, lower-year assessments, staff retention. A single year's pass rate cannot carry the claim alone.",
      },
    ],
    obvious: "The new head teacher has transformed the school.",
    debrief:
      "Three of the four lines after the first one are alternative explanations hiding in plain sight, and the obvious story ignores all of them. The honest estimate is that the improvement is real, smaller than it looks, and not yet attributable. Premature closure here has a policy cost: the head is promoted, the method is copied, and the cohort effect is copied with it.",
    difficulty: 4,
  },
  {
    id: "ts-sunday-call",
    title: "No call on Sunday",
    evidence: [
      "Your grandmother has telephoned every Sunday evening for years. This Sunday she did not.",
      "Her phone goes straight to voicemail.",
      "A cousin says she seemed fine when he saw her on Thursday.",
      "Her social media account liked two photographs yesterday afternoon.",
    ],
    plausible: [
      {
        title: "The phone, not the person",
        keywords: ["battery|charger|phone|handset|mute|switched off|broken|signal|new phone|voicemail"],
        note: "Straight to voicemail means the phone is off or out of signal. The social media activity suggests she had some device working yesterday. The simplest story is a flat battery and a lost charger.",
      },
      {
        title: "She is somewhere else",
        keywords: ["visiting|away|travel|staying with|trip|friend's house|out"],
        note: "Sunday calls are anchored to a routine; a visit to a friend breaks the routine and the habit with it. The 'likes' from yesterday fit someone idly scrolling on a train or in someone else's sitting room.",
      },
      {
        title: "She is annoyed, or feels forgotten",
        keywords: ["upset|annoyed|offended|hurt|forgot|birthday|waiting for you|sulk|distance"],
        note: "People who always call sometimes stop to see whether anyone notices. Did you miss something recently? Ask yourself before you ask her.",
      },
      {
        title: "Something has happened",
        keywords: ["fall|fallen|ill|hospital|accident|emergency|wrong|check on her"],
        note: "Rare, and the cost of missing it is high. That asymmetry is why you should check today even though this is the least likely story on the evidence.",
      },
    ],
    obvious: "Something has happened to her.",
    debrief:
      "This is the one exercise in the set where the obvious story deserves action despite being the least likely: the cost of being wrong is asymmetric. Notice the two separate questions. What is most probable? A phone problem. What should you do? Go round or ring a neighbour. Premature closure is believing the frightening story; good judgement is acting on it anyway, calmly, while expecting the flat battery.",
    difficulty: 2,
  },
];

/* ---------------- Best Explanation ----------------
 * Hypotheses are scored on how much of the evidence they explain (0..1), how many extra
 * assumptions they need, how many pieces of evidence they contradict, and overall plausibility.
 * "best" is null when an expert would refuse to rank.
 */
export const BEST_EXPLANATION: BestExplanationChallenge[] = [
  {
    id: "be-nine-oclock-spike",
    title: "The nine o'clock spike",
    evidence: [
      "A web service's response times spike between 09:00 and 09:20 every weekday. Weekends are flat.",
      "The database server's CPU reaches ninety per cent during the spike and is under thirty per cent the rest of the day.",
      "A nightly database backup runs seven days a week and finishes at about 08:55.",
      "A marketing email is sent at 09:00, but only on Tuesdays. The spike is the same size every weekday.",
      "Weekday traffic between 09:00 and 09:20 is about twice the traffic at 08:00, and about the same as at 11:00, when there is no spike.",
    ],
    hypotheses: [
      {
        id: "traffic",
        text: "The morning rush overloads the database.",
        evidenceExplained: 0.4,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.25,
        note: "Explains weekdays-only and the CPU. But traffic at 11:00 is as high with no spike, which this cannot account for.",
      },
      {
        id: "backup",
        text: "The backup job holds locks or saturates the disk until it finishes.",
        evidenceExplained: 0.4,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.2,
        note: "Fits the timing precisely, but the backup runs on Saturday and Sunday too, and there is no weekend spike.",
      },
      {
        id: "cold-cache",
        text: "The backup evicts the database's cache; on weekdays, the morning traffic then hits a cold cache and the database works hard to rebuild it.",
        evidenceExplained: 0.95,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.7,
        note: "Explains the timing (just after the backup), the weekday-only pattern (needs traffic to trigger), the CPU, and why 11:00 is fine (the cache is warm by then). One assumption: that the backup reads enough to evict the cache, which is easy to verify.",
      },
      {
        id: "email",
        text: "The marketing email drives a burst of logins.",
        evidenceExplained: 0.2,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.05,
        note: "Tuesdays only. The spike is every weekday. Ruled out on its own, though it could add to Tuesday's spike.",
      },
    ],
    best: "cold-cache",
    debrief:
      "Neither of the two obvious causes explains the pattern alone; each is contradicted by one line. The winning hypothesis is an interaction: a nightly event that is harmless on its own, plus a daytime load that is harmless on its own. Interactions are systematically under-generated because we look for one cause. Notice that the best hypothesis is also the one that proposes a cheap test: move the backup to 03:00 and watch.",
    difficulty: 5,
  },
  {
    id: "be-lost-hives",
    title: "Three hives out of ten",
    evidence: [
      "A beekeeper loses three of ten hives over winter.",
      "The dead colonies still contain plentiful stored honey.",
      "Small piles of dead bees were found in front of the lost hives in late autumn.",
      "A neighbouring farm sprayed its fields in September.",
      "Mite counts taken in August were high in the three lost hives and low in the seven survivors.",
    ],
    hypotheses: [
      {
        id: "pesticide",
        text: "The September spraying poisoned the foragers.",
        evidenceExplained: 0.4,
        assumptions: 2,
        contradictions: 1,
        plausibility: 0.2,
        note: "Explains dead bees in autumn and the stored honey. It struggles with selectivity: all ten hives foraged the same fields, so why only the three with high mite counts?",
      },
      {
        id: "starvation",
        text: "The colonies starved.",
        evidenceExplained: 0.1,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.05,
        note: "Directly contradicted by the stored honey. Isolation starvation (bees clustered away from stores in cold) is possible but does not explain the mite pattern.",
      },
      {
        id: "varroa",
        text: "Varroa mites and the viruses they carry weakened the three colonies, which dwindled through the winter.",
        evidenceExplained: 0.9,
        assumptions: 0,
        contradictions: 0,
        plausibility: 0.75,
        note: "The mite counts predict exactly which hives died. Mite-borne viruses shorten the lives of winter bees, colonies dwindle while stores remain, and dead bees outside in autumn fit sick bees leaving the hive. This is the most common cause of winter loss in temperate beekeeping.",
      },
      {
        id: "cold",
        text: "An unusually cold winter killed the weaker colonies.",
        evidenceExplained: 0.5,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.3,
        note: "Cold kills colonies that are already weak, so this is compatible with the mite story rather than a rival to it. On its own it does not explain why the weak colonies were the mite-heavy ones.",
      },
    ],
    best: "varroa",
    debrief:
      "The spraying is the most emotionally available cause and the least discriminating: it affected all ten hives equally. The mite counts are the only line that distinguishes losers from survivors, and discriminating evidence should dominate. A reminder that 'consistent with' is cheap; 'predicts which' is what you are looking for.",
    difficulty: 3,
  },
  {
    id: "be-parcel-marked-delivered",
    title: "Marked as delivered",
    evidence: [
      "A parcel is marked delivered at 14:12. It is not at the door when you get home at 18:00.",
      "The courier's delivery photograph shows a parcel on a doorstep beside a door with a brass '17'. Your house is number 71.",
      "Your immediate neighbours say nothing was left with them.",
      "The courier's tracking shows the van ran ninety minutes late all afternoon.",
    ],
    hypotheses: [
      {
        id: "wrong-address",
        text: "It was delivered to number 17.",
        evidenceExplained: 0.95,
        assumptions: 0,
        contradictions: 0,
        plausibility: 0.85,
        note: "The photograph is nearly conclusive: a transposed house number is the most common misdelivery there is. Running late makes such errors more likely.",
      },
      {
        id: "stolen",
        text: "It was delivered to your doorstep and taken.",
        evidenceExplained: 0.3,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.08,
        note: "Explains the absence, but the photograph shows a door that is not yours. It would require the photo to be mislabelled and a theft on the same afternoon.",
      },
      {
        id: "fake-scan",
        text: "The driver scanned it as delivered without delivering it, to hit a target, and will bring it tomorrow.",
        evidenceExplained: 0.5,
        assumptions: 2,
        contradictions: 1,
        plausibility: 0.07,
        note: "Late vans and 'delivered' scans do go together. But the photograph shows a real doorstep, so this needs the photo to be of some other parcel, which is a stretch.",
      },
    ],
    best: "wrong-address",
    debrief:
      "An easy case, included to make a point: when one piece of evidence is highly specific (a photograph with a legible number), it should carry most of the weight, and the remaining hypotheses should be pruned rather than kept out of politeness. Not every situation is ambiguous. Knowing when it is not is part of the skill.",
    difficulty: 2,
  },
  {
    id: "be-dated-portrait",
    title: "The portrait dated 1565",
    evidence: [
      "A panel portrait bears a painted inscription giving the sitter's age and the year 1565.",
      "The sitter's costume is in a style fashionable in the 1560s.",
      "Tree-ring dating of the oak panel gives a felling date no earlier than the 1590s.",
      "Pigment analysis finds Prussian blue, a pigment not manufactured before about 1706, in the inscription only. The rest of the paint contains no anachronistic pigments.",
      "The paint handling in the face is competent but stiff, with none of the underdrawing corrections found in works painted from life.",
    ],
    hypotheses: [
      {
        id: "original-1565",
        text: "It is the original portrait, painted from life in 1565.",
        evidenceExplained: 0.4,
        assumptions: 0,
        contradictions: 2,
        plausibility: 0.03,
        note: "Contradicted by the panel date and by the inscription pigment. An oak panel cannot be painted thirty years before its tree was felled.",
      },
      {
        id: "copy-1600",
        text: "It is a copy made around 1600 of a lost 1560s original, with the inscription repainted in the eighteenth century.",
        evidenceExplained: 0.95,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.6,
        note: "Explains the panel, the costume (copied), the stiffness and the absence of corrections (copyists do not correct), and the later pigment confined to the inscription. Copies of ancestral portraits were commissioned routinely by families for new houses. One assumption: a lost original.",
      },
      {
        id: "forgery-1700s",
        text: "It is an eighteenth-century fabrication painted on an old panel.",
        evidenceExplained: 0.85,
        assumptions: 3,
        contradictions: 0,
        plausibility: 0.25,
        note: "Also explains everything, but requires a forger who sourced a genuine sixteenth-century panel, avoided modern pigments everywhere except the inscription, and knew 1560s costume precisely. Each is possible; together they are a heavier load than the copy hypothesis carries.",
      },
      {
        id: "restored-original",
        text: "A genuine 1565 painting whose inscription was restored later.",
        evidenceExplained: 0.6,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.07,
        note: "Handles the pigment but not the panel date, which is decisive.",
      },
    ],
    best: "copy-1600",
    debrief:
      "Two hypotheses explain everything; the choice between them is about assumptions. The copy needs one thing not in evidence (a lost original, which is exactly what copies are of). The forgery needs three coincidences to line up. This is parsimony as a working tool rather than a slogan: count what each story must invent. Note that 'it is a copy' is a mildly disappointing answer, and disappointment is not evidence.",
    difficulty: 6,
  },
  {
    id: "be-quiet-restaurant",
    title: "The quiet restaurant",
    evidence: [
      "A restaurant that opened six weeks ago on a busy street has four occupied tables at seven on a Wednesday evening.",
      "Its prices are in line with the neighbours'.",
      "It has eleven online reviews, averaging four and a half stars.",
      "The previous two businesses on the same site, a bistro and a noodle bar, each closed within a year.",
      "The restaurant opposite, which has been there for a decade, is about half full.",
    ],
    hypotheses: [
      {
        id: "site",
        text: "Something about the site (visibility, an awkward entrance, a reputation) dooms whatever opens there.",
        evidenceExplained: 0.5,
        assumptions: 2,
        contradictions: 0,
        plausibility: 0.3,
        note: "Two prior failures is suggestive but weak: restaurant failure in the first year is common everywhere, so two in a row on one site is not remarkable. The hypothesis needs a mechanism it has not named.",
      },
      {
        id: "new",
        text: "It is simply new; six weeks is too early for word to have spread.",
        evidenceExplained: 0.6,
        assumptions: 0,
        contradictions: 0,
        plausibility: 0.35,
        note: "Eleven good reviews in six weeks is roughly what a competent new place accumulates. Wednesday at seven is a slow slot. Nothing here contradicts it, and nothing confirms it.",
      },
      {
        id: "concept",
        text: "The concept is wrong for the street.",
        evidenceExplained: 0.4,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.25,
        note: "Possible, but we have not been told what the concept is, nor who walks down the street. The hypothesis is compatible with the evidence because the evidence barely touches it.",
      },
    ],
    best: null,
    debrief:
      "A case where the correct answer is to decline to rank. The evidence is thin, the base rate of early emptiness is high, and the one striking fact (two prior failures) has a mundane explanation. What would settle it is cheap and not yet available: a Saturday night, and three more months. Refusing to choose is not indecision when there is nothing to choose with; it is the accurate report of your state of knowledge.",
    difficulty: 4,
  },
  {
    id: "be-fish-kill",
    title: "Two kilometres of dead fish",
    evidence: [
      "Dead fish are found along two kilometres of river, starting just below a town. Above the town the fish are healthy.",
      "There was heavy rain two days before the fish were found, the first after a hot, dry month.",
      "A factory with a licensed outfall sits a kilometre upstream of the first dead fish. It has been closed for maintenance since the previous week.",
      "Dissolved oxygen measured at dawn in the affected stretch was very low; upstream it was normal.",
      "The town's combined sewer has overflow points that discharge into the river during storms.",
    ],
    hypotheses: [
      {
        id: "factory",
        text: "A discharge from the factory outfall poisoned the stretch.",
        evidenceExplained: 0.4,
        assumptions: 2,
        contradictions: 1,
        plausibility: 0.1,
        note: "Explains the location. But the plant was closed, so this needs either a leak from an idle site or a faked closure. Low oxygen is not what a chemical discharge usually leaves behind.",
      },
      {
        id: "overflow",
        text: "The storm flushed a month of accumulated organic matter and sewage into the river; bacteria consumed the oxygen and the fish suffocated.",
        evidenceExplained: 0.95,
        assumptions: 0,
        contradictions: 0,
        plausibility: 0.75,
        note: "Explains the timing (first rain after drought), the location (below the town's overflows), the low dawn oxygen (the classic signature of organic pollution), and healthy fish upstream. This is a well-documented pattern after summer storms.",
      },
      {
        id: "heat",
        text: "The heatwave alone drove oxygen too low.",
        evidenceExplained: 0.3,
        assumptions: 0,
        contradictions: 1,
        plausibility: 0.05,
        note: "The river upstream was just as hot and the fish there are fine. Heat is a contributor, not a cause of a kill that starts at a precise point.",
      },
      {
        id: "farm",
        text: "Agricultural runoff after the rain carried a pesticide into the river.",
        evidenceExplained: 0.5,
        assumptions: 2,
        contradictions: 0,
        plausibility: 0.1,
        note: "Fits the timing, but not the start point at the town, and pesticides do not typically produce an oxygen crash. Would require a farm we have not been shown.",
      },
    ],
    best: "overflow",
    debrief:
      "The factory is the obvious suspect and the only one directly contradicted by the evidence. The dissolved-oxygen reading is the key line: it is a mechanism signature, and mechanisms are what let you choose between stories that all fit the geography. When evidence tells you how something happened, it prunes hypotheses that only say where.",
    difficulty: 4,
  },
  {
    id: "be-regional-sales-dip",
    title: "Eight per cent down in the north",
    evidence: [
      "A company's sales in its northern region fell eight per cent in the third quarter; other regions were flat.",
      "A competitor opened a distribution centre in the region in June.",
      "The region's most experienced salesperson left in May and was replaced in July.",
      "Prices rose three per cent nationally on 1 July.",
      "The region had its wettest summer in twenty years; the company's products are used mostly outdoors.",
    ],
    hypotheses: [
      {
        id: "competitor",
        text: "The competitor's new presence took share.",
        evidenceExplained: 0.5,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.3,
        note: "Timing and geography fit. But so do they for the other two regional stories.",
      },
      {
        id: "salesperson",
        text: "The loss of the salesperson broke customer relationships.",
        evidenceExplained: 0.5,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.3,
        note: "Also fits. An eight per cent regional swing from one person is large but not unheard of in relationship-driven sales.",
      },
      {
        id: "weather",
        text: "The wet summer suppressed demand for outdoor products.",
        evidenceExplained: 0.5,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.3,
        note: "Fits. The natural check is whether the competitor's regional sales also fell, which you cannot see.",
      },
      {
        id: "price",
        text: "The national price rise did it.",
        evidenceExplained: 0.1,
        assumptions: 1,
        contradictions: 1,
        plausibility: 0.05,
        note: "Prices rose everywhere and other regions were flat. Could be a contributing factor if the north is more price-sensitive, but it cannot be the main cause.",
      },
    ],
    best: null,
    debrief:
      "Three regional explanations arrived in the same quarter, each sufficient, none distinguishable. The evidence cannot rank them and a careful analyst should say so, then propose what would: customer-level data (which accounts fell?), the competitor's public figures, and last year's rainy months. A confident answer here would be a preference dressed as an inference. It is also possible, and common, that all three contributed.",
    difficulty: 5,
  },
  {
    id: "be-coin-hoard",
    title: "The pot in the field",
    evidence: [
      "A ploughman turns up a clay pot containing about six hundred Roman silver coins.",
      "The latest coins were struck in 408; none is later.",
      "Many of the coins are clipped: their edges have been trimmed for silver, a practice known in Britain in the early fifth century.",
      "The pot was buried about a metre deep, in open ground, with no trace of a building, grave or shrine nearby.",
      "No other objects were found with it.",
    ],
    hypotheses: [
      {
        id: "savings",
        text: "Someone buried their savings for safety during the instability of the early fifth century and never came back for them.",
        evidenceExplained: 0.95,
        assumptions: 1,
        contradictions: 0,
        plausibility: 0.7,
        note: "The end date matches the years when Roman administration in Britain collapsed and coin supply stopped. Clipping is what people did to coins when no new ones were arriving. A pot, a metre down, away from buildings, is what a cautious saver chooses. The one assumption is the non-return, which is exactly why it is still there.",
      },
      {
        id: "votive",
        text: "It was a ritual offering, buried deliberately with no intention of recovery.",
        evidenceExplained: 0.6,
        assumptions: 2,
        contradictions: 0,
        plausibility: 0.2,
        note: "Some hoards were. But votive deposits tend to cluster at shrines, springs or boundaries, and often include other objects. This one has no such context. Archaeologists genuinely disagree about how common ritual hoarding was, so this stays on the table.",
      },
      {
        id: "lost",
        text: "A lost purse.",
        evidenceExplained: 0.2,
        assumptions: 1,
        contradictions: 2,
        plausibility: 0.02,
        note: "Six hundred coins in a pot a metre down is not a purse dropped on a walk.",
      },
      {
        id: "modern",
        text: "A modern plant to fake a find.",
        evidenceExplained: 0.3,
        assumptions: 3,
        contradictions: 1,
        plausibility: 0.03,
        note: "The clipping and the coherent date range are hard to fake; a forger would need six hundred genuine period coins, at which point there is little to gain by burying them.",
      },
    ],
    best: "savings",
    debrief:
      "A case where the leading hypothesis is comfortably best and the runner-up deserves to stay alive. The votive alternative is not a fringe view among specialists; it is simply less supported by this particular context. Ranking is not the same as dismissing. Record the winner, keep the second, and note what would change your mind: a spring nearby, or a second pot.",
    difficulty: 3,
  },
];

/* ---------------- Missing Variable ----------------
 * A correlation is stated. The user proposes third factors (or reverse causation) before
 * accepting the causal reading. Strength reflects how much of the correlation the candidate
 * is likely to account for.
 */
export const MISSING_VARIABLE: MissingVariableChallenge[] = [
  {
    id: "mv-shoe-size-reading",
    title: "Shoe size and reading",
    correlation: "Across the pupils of a primary school, children with larger feet score higher on a standard reading test. The correlation is strong and appears in every school tested.",
    candidates: [
      { text: "Age: older children have bigger feet and have had more years of reading instruction.", keywords: ["age|older|year group|years old|grow"], strength: "strong" },
      { text: "School year, which is nearly the same thing as age but is what actually delivers the instruction.", keywords: ["school year|grade|class|instruction|schooling"], strength: "strong" },
      { text: "Household income affects both nutrition (and so growth) and access to books, but only weakly once age is controlled.", keywords: ["income|wealth|nutrition|poverty|books at home|socioeconomic"], strength: "weak" },
    ],
    debrief:
      "The textbook case, included so that the pattern is unmistakable: a variable that drives both sides of a correlation and is so ordinary nobody names it. Age is the confounder to reach for first whenever a sample spans childhood. The test of a good confounder is that, holding it fixed, the correlation should shrink toward nothing, which it does here within any single year group.",
    difficulty: 2,
  },
  {
    id: "mv-hospital-size-mortality",
    title: "Big hospitals, more deaths",
    correlation: "Patients treated at large hospitals are more likely to die within thirty days of admission than patients treated at small hospitals.",
    candidates: [
      { text: "Case mix: large hospitals receive the sickest patients, including transfers from small hospitals that cannot treat them.", keywords: ["case mix|sicker|severity|referral|transfer|complex|acuity|worse patients"], strength: "strong" },
      { text: "Specialist services: large hospitals run the trauma, cardiac and cancer units where mortality is inherently higher, regardless of quality.", keywords: ["trauma|specialist|intensive care|cardiac|cancer|tertiary|teaching"], strength: "moderate" },
      { text: "Urban location: large hospitals sit in cities with different populations and emergency loads.", keywords: ["urban|city|location|population|deprivation"], strength: "weak" },
      { text: "Reverse causation: hospitals grow because they are good, so this cannot be it, unless growth itself degrades care.", keywords: ["reverse|grow because|too big|overstretched|capacity"], strength: "weak" },
    ],
    debrief:
      "Selection into treatment is the confounder that haunts every comparison of outcomes across providers. The remedy is risk adjustment, and even that is imperfect: the sickest patients are sick in ways that are hard to code. A crude mortality ranking would tell patients to avoid precisely the places most able to save them.",
    difficulty: 3,
  },
  {
    id: "mv-firefighters-damage",
    title: "Firefighters and damage",
    correlation: "Across a city's fire incidents, the more firefighters attend, the greater the financial damage recorded.",
    candidates: [
      { text: "The size of the fire drives both the number of crews sent and the damage done.", keywords: ["size of the fire|bigger fire|severity|how big|large fire|scale"], strength: "strong" },
      { text: "Building type: warehouses and factories get large responses and hold valuable contents.", keywords: ["building|warehouse|factory|commercial|contents|value|property type"], strength: "moderate" },
      { text: "Response time: fires that burn longer before crews arrive both need more crews and do more damage.", keywords: ["response time|delay|arrival|burning longer|late"], strength: "moderate" },
    ],
    debrief:
      "Nobody believes firefighters cause damage, which is why this example is useful: the absurdity forces you to name the mechanism. Apply the same reflex to cases where the causal story is flattering or convenient. 'Companies with more consultants perform worse' has the same structure and is quoted seriously.",
    difficulty: 2,
  },
  {
    id: "mv-night-lights-myopia",
    title: "Night lights and short sight",
    correlation: "A 1999 study found that children who had slept with a night light before the age of two were far more likely to be short-sighted later in childhood than children who slept in the dark.",
    candidates: [
      { text: "Parental myopia: short-sighted parents pass on the tendency genetically and are also more likely to install a night light so they can see the child at night.", keywords: ["parent|parental|myopic parents|genetic|inherit|heredit|see in the dark"], strength: "strong" },
      { text: "Time spent outdoors: daylight exposure protects against myopia, and households with night lights may differ in lifestyle.", keywords: ["outdoor|daylight|sunlight|indoor|lifestyle|screen"], strength: "moderate" },
      { text: "Recall: parents of short-sighted children may remember night lights differently when asked years later.", keywords: ["recall|remember|survey|questionnaire|reporting|memory"], strength: "weak" },
    ],
    debrief:
      "The original finding was published in a major journal and widely reported. Follow-up studies that controlled for parental myopia found the association vanished. The confounder was invisible in the first study because the parents' eyesight was not asked about. Whenever a childhood exposure is chosen by parents, ask what kind of parent chooses it.",
    difficulty: 3,
  },
  {
    id: "mv-coffee-lung-cancer",
    title: "Coffee and lung cancer",
    correlation: "In several older cohort studies, heavy coffee drinkers had markedly higher rates of lung cancer than people who drank little or none.",
    candidates: [
      { text: "Smoking: smokers drink more coffee, and smoking causes lung cancer.", keywords: ["smok|cigarette|tobacco"], strength: "strong" },
      { text: "Occupation: shift workers and some industrial workers drink more coffee and have higher exposure to other carcinogens.", keywords: ["occupation|job|shift|industrial|workplace|exposure|asbestos"], strength: "weak" },
      { text: "Alcohol and other habits that cluster with heavy coffee drinking.", keywords: ["alcohol|drinking|habits|lifestyle|cluster"], strength: "weak" },
    ],
    debrief:
      "When smoking is adjusted for, the coffee association shrinks to nothing or reverses. A single dominant confounder can generate a correlation of any strength. Whenever a behaviour is socially bundled with another behaviour, the bundle must be unpicked before either is blamed.",
    difficulty: 2,
  },
  {
    id: "mv-remote-days-ratings",
    title: "Remote days and performance",
    correlation: "In a company that lets staff choose how many days to work from home, employees who work remotely more often receive higher performance ratings.",
    candidates: [
      { text: "Seniority: senior staff are both trusted to work remotely and rated highly, or have roles where output is easier to see.", keywords: ["senior|seniority|tenure|experienced|trusted|role|grade"], strength: "strong" },
      { text: "Reverse causation: high performers are granted more remote days as a reward or because managers do not worry about them.", keywords: ["reverse|granted|allowed|reward|because they perform|earn the right"], strength: "strong" },
      { text: "Role type: jobs with measurable individual output (writing code, closing sales) suit remote work and produce clearer evidence for a good rating.", keywords: ["role type|kind of job|measurable|output|individual contributor|task"], strength: "moderate" },
      { text: "Managers rate what they see: remote staff send more written updates, which read well in a review.", keywords: ["visible|written|updates|impression|manager sees|reporting"], strength: "weak" },
    ],
    debrief:
      "Self-selection is the missing variable whenever a treatment is chosen rather than assigned. Neither the pro-office nor the pro-remote camp can use this correlation; it is silent about what would happen if remote days were changed by policy. The only way to know is to change them for some people and not others.",
    difficulty: 4,
  },
  {
    id: "mv-sunscreen-melanoma",
    title: "Sunscreen users and melanoma",
    correlation: "In several observational studies, people who report regular sunscreen use have higher rates of melanoma than people who rarely use it.",
    candidates: [
      { text: "Sun exposure: people who spend long hours in strong sun use sunscreen and also receive more ultraviolet exposure than those who stay indoors.", keywords: ["sun exposure|sunbath|beach|outdoors|holiday|ultraviolet|uv|time in the sun"], strength: "strong" },
      { text: "Skin type: fair-skinned people burn easily, use sunscreen more, and are at higher inherent risk.", keywords: ["fair skin|skin type|complexion|burn easily|pale|pigment"], strength: "strong" },
      { text: "Detection: people who think about sun risk visit dermatologists more and have more melanomas diagnosed.", keywords: ["diagnos|screening|dermatolog|detect|check-up|surveillance"], strength: "moderate" },
      { text: "Behavioural compensation: sunscreen users stay out longer because they feel protected.", keywords: ["compensat|stay out longer|feel protected|risk compensation|false security"], strength: "moderate" },
    ],
    debrief:
      "Two confounders and a detection effect point the same way, so the raw correlation is worthless as a guide to what sunscreen does. Randomised trials, in which sunscreen was assigned rather than chosen, show a protective effect. This is the general shape of 'protective behaviour looks harmful': the people who take precautions are the people who need them.",
    difficulty: 4,
  },
  {
    id: "mv-music-lessons-grades",
    title: "Music lessons and school grades",
    correlation: "Children who take instrumental music lessons get higher grades across all school subjects than children who do not.",
    candidates: [
      { text: "Family resources and involvement: lessons cost money and parental time, and families that provide them also provide homework support and expectations.", keywords: ["parent|family|income|wealth|involve|support|afford|resources|socioeconomic"], strength: "strong" },
      { text: "The child's own traits: children who persist with practice are conscientious, and conscientiousness predicts grades directly.", keywords: ["conscientious|persist|discipline|personality|self-control|temperament|motivation"], strength: "moderate" },
      { text: "School quality: schools that offer music programmes tend to be better resourced in every way.", keywords: ["school quality|school resources|better school|programme|funding"], strength: "moderate" },
      { text: "Reverse causation: children already doing well are encouraged to take up an instrument.", keywords: ["reverse|already doing well|encouraged|selected|because they"], strength: "weak" },
    ],
    debrief:
      "Music education has real benefits, which is precisely why the weak evidence for it is dangerous: it gets believed. Randomised studies find much smaller transfer to grades than the correlation suggests. The honest position is to value music for itself and to stop borrowing arguments from mathematics results.",
    difficulty: 3,
  },
  {
    id: "mv-police-crime",
    title: "More police, more crime",
    correlation: "Across cities, those with more police officers per head of population record more crime per head of population.",
    candidates: [
      { text: "Reverse causation: cities hire police in response to crime, so crime drives the police numbers rather than the other way round.", keywords: ["reverse|respond|hire because|crime drives|in response|react"], strength: "strong" },
      { text: "Recording: more officers record more of the crime that happens; the correlation is partly with reporting, not offending.", keywords: ["record|report|detect|measured|statistics|counting|visible"], strength: "moderate" },
      { text: "City size and density: large, dense cities have both more police per head and more crime per head for reasons of their own.", keywords: ["size|density|urban|large city|population|big cities"], strength: "moderate" },
    ],
    debrief:
      "Reverse causation is a missing variable of a special kind: the arrow points backwards rather than sideways. Studies that find plausibly exogenous changes in police numbers (funding formulas, terror alerts that redeploy officers) tend to find that more police reduce crime. The cross-city correlation says the opposite because it is measuring the response, not the effect.",
    difficulty: 4,
  },
  {
    id: "mv-moderate-drinkers-hearts",
    title: "Moderate drinkers and heart disease",
    correlation: "In many large observational studies, people who drink a moderate amount of alcohol have lower rates of heart disease than people who drink nothing at all.",
    candidates: [
      { text: "The abstainer group includes former heavy drinkers and people who stopped because they were already ill, which makes non-drinkers look unhealthy.", keywords: ["former|ex-drinker|sick quitter|stopped because|already ill|abstainer|quit"], strength: "strong" },
      { text: "Social and economic position: moderate drinkers in these studies are wealthier, better educated and more socially connected.", keywords: ["income|education|wealth|class|social|socioeconomic|connected"], strength: "strong" },
      { text: "Diet and pattern: wine with meals travels with a diet that is itself protective.", keywords: ["diet|mediterranean|food|with meals|wine|pattern"], strength: "moderate" },
    ],
    debrief:
      "The 'sick quitter' problem is a lesson in how a comparison group is built: 'non-drinkers' is not a natural category, it is a bin holding lifelong teetotallers alongside people whose doctor told them to stop. Studies that separate those groups, and genetic studies that use inherited alcohol tolerance as a natural experiment, find the protective effect shrinks or disappears. The question remains contested at the margins; the confounders are not.",
    difficulty: 4,
  },
];

/* ---------------- Base Rate ----------------
 * Vivid evidence against a prior. Numeric items give a probability with tolerance and are
 * framed in neutral operational settings.
 */
export const BASE_RATE: BaseRateChallenge[] = [
  {
    id: "br-fraud-flag",
    title: "The fraud flag",
    setup: "A payment processor screens every transaction. About two in every thousand transactions are fraudulent. The screen catches ninety-five per cent of fraudulent transactions and wrongly flags two per cent of legitimate ones.",
    evidence: "A transaction has just been flagged.",
    baseRateNote: "Of 100,000 transactions, about 200 are fraudulent and 190 of those are flagged. Of the 99,800 legitimate ones, about 1,996 are flagged. Flags: roughly 2,186, of which 190 are fraud.",
    options: [
      { id: "a", text: "About nine per cent.", correct: true, why: "190 true flags out of roughly 2,186 flags is about 8.7 per cent. Most flags are false alarms, because legitimate transactions vastly outnumber fraudulent ones." },
      { id: "b", text: "About ninety-five per cent.", correct: false, why: "That is the chance a fraudulent transaction is flagged, not the chance a flagged transaction is fraudulent. The two are different questions." },
      { id: "c", text: "About fifty per cent.", correct: false, why: "A fifty-fifty guess ignores the base rate entirely. Fraud is rare; the false-positive rate, though small, applies to a huge number of legitimate transactions." },
      { id: "d", text: "About two per cent.", correct: false, why: "Two per cent is the false-positive rate for legitimate transactions. It is an input, not the answer." },
    ],
    numeric: { answer: 0.087, tolerance: 0.03, unit: "probability" },
    difficulty: 3,
  },
  {
    id: "br-defect-reject",
    title: "The rejected part",
    setup: "On a production line, one part in fifty is defective. An automated inspection rejects ninety per cent of defective parts and, wrongly, five per cent of good ones.",
    evidence: "A part has just been rejected by the inspection station.",
    baseRateNote: "Per 10,000 parts: 200 defective, of which 180 are rejected; 9,800 good, of which 490 are rejected. Of 670 rejects, 180 are actually defective.",
    options: [
      { id: "a", text: "About twenty-seven per cent.", correct: true, why: "180 of 670 rejects are truly defective, about 27 per cent. Nearly three in four rejected parts are fine, which matters if rejects are scrapped rather than re-inspected." },
      { id: "b", text: "About ninety per cent.", correct: false, why: "That is the sensitivity of the inspection: the chance that a defective part is caught. It is not the chance that a caught part is defective." },
      { id: "c", text: "About five per cent.", correct: false, why: "Five per cent is the false-rejection rate for good parts, not the proportion of rejects that are good or bad." },
      { id: "d", text: "About seventy per cent.", correct: false, why: "This is the complement of the right answer: the share of rejects that are actually good." },
    ],
    numeric: { answer: 0.27, tolerance: 0.05, unit: "probability" },
    difficulty: 3,
  },
  {
    id: "br-spam-verdict",
    title: "The spam verdict",
    setup: "Forty per cent of the mail arriving at a company is spam. The filter catches ninety-eight per cent of spam and wrongly marks one per cent of legitimate mail.",
    evidence: "A message has been marked as spam.",
    baseRateNote: "Per 1,000 messages: 400 spam, of which 392 are marked; 600 legitimate, of which 6 are marked. Of 398 marked messages, 392 are spam.",
    options: [
      { id: "a", text: "About ninety-eight per cent.", correct: true, why: "392 of 398 marked messages are spam, about 98.5 per cent. When the base rate is high, a good test's verdict can be trusted. Base rates do not always argue for doubt; they argue for arithmetic." },
      { id: "b", text: "About forty per cent.", correct: false, why: "Forty per cent is the prior before the filter looked. The filter's verdict is strong evidence and should move you a long way from the prior." },
      { id: "c", text: "About sixty per cent.", correct: false, why: "This is the proportion of legitimate mail overall, unrelated to the question asked." },
      { id: "d", text: "About fifty per cent.", correct: false, why: "Reflexive doubt. The filter's verdict is both sensitive and specific and the base rate is not low; the posterior is high." },
    ],
    numeric: { answer: 0.985, tolerance: 0.03, unit: "probability" },
    difficulty: 2,
  },
  {
    id: "br-scout-label",
    title: "The scout's label",
    setup: "In a football academy, about five per cent of sixteen-year-olds go on to play professionally. Looking back at past intakes, sixty per cent of those who became professionals had been labelled 'top prospect' at sixteen; ten per cent of those who did not make it had also been given the label.",
    evidence: "A sixteen-year-old has just been labelled a top prospect.",
    baseRateNote: "Per 1,000 players: 50 become professionals, of whom 30 were labelled; 950 do not, of whom 95 were labelled. Of 125 labelled players, 30 make it.",
    options: [
      { id: "a", text: "About one in four.", correct: true, why: "30 of 125 labelled players turn professional, about 24 per cent. The label multiplies the odds nearly fivefold, and the player is still more likely than not to fall short. Both things are true." },
      { id: "b", text: "About sixty per cent.", correct: false, why: "Sixty per cent is how often professionals had been labelled, read backwards. The direction of the conditional matters." },
      { id: "c", text: "About five per cent.", correct: false, why: "That is the base rate before the label. The label is genuine evidence and the estimate should rise." },
      { id: "d", text: "Cannot be estimated from these figures.", correct: false, why: "It can. Base rate, hit rate and false-alarm rate are exactly the three numbers needed." },
    ],
    numeric: { answer: 0.24, tolerance: 0.05, unit: "probability" },
    difficulty: 4,
  },
  {
    id: "br-conference-stranger",
    title: "The stranger at the conference",
    setup: "You are at a conference attended by 950 software developers and 50 salespeople.",
    evidence: "At the coffee stand you meet someone confident, well dressed and very easy to talk to, who steers the conversation toward what you do and who you work for.",
    baseRateNote: "The description fits some salespeople well. It also fits a good many developers. Even if it were three times as common among salespeople, the developers outnumber them nineteen to one.",
    options: [
      { id: "a", text: "More likely a developer.", correct: true, why: "The description is weakly diagnostic at best; nineteen-to-one is not overturned by 'confident and well dressed'. If the description made a salesperson three times as likely, the odds would still be about six to one for developer." },
      { id: "b", text: "More likely a salesperson.", correct: false, why: "This is the representativeness reflex: judging by resemblance to a stereotype and forgetting how few salespeople are in the room." },
      { id: "c", text: "Equally likely either way.", correct: false, why: "This treats the description as exactly cancelling a nineteen-to-one prior, which would need it to be nineteen times more common among salespeople." },
      { id: "d", text: "Cannot say without more information.", correct: false, why: "You can say. A weak signal against a strong prior gives a clear answer; more information would refine it, not reverse it." },
    ],
    difficulty: 3,
  },
  {
    id: "br-tight-connection",
    title: "The tight connection",
    setup: "You are booking a train journey with a fifteen-minute connection. The published punctuality of the first train, defined as arriving within five minutes of schedule, is ninety-two per cent over the past year.",
    evidence: "A friend tells you, in detail, about missing the same connection last month after a forty-minute delay, and spending the night in a station hotel.",
    baseRateNote: "The friend's story is one journey. The punctuality figure is thousands. Nothing in the story tells you the delay was typical, and a good story is not a large sample.",
    options: [
      { id: "a", text: "Use the ninety-two per cent figure, then decide whether an eight per cent risk of missing the connection is acceptable given what a miss would cost.", correct: true, why: "The base rate is your estimate; the friend's story is one draw from it. The decision then turns on consequences, not on the vividness of the anecdote." },
      { id: "b", text: "Book a later connection; the friend's experience shows the route is unreliable.", correct: false, why: "One vivid failure has overwritten a year of data. This might still be the right decision, but for the wrong reason." },
      { id: "c", text: "Ignore the friend entirely; anecdotes carry no information.", correct: false, why: "Too strong. The story confirms that misses happen and what one costs, which is useful for the second half of the decision." },
      { id: "d", text: "Estimate the risk at about fifty per cent, splitting the difference between the data and the story.", correct: false, why: "Averaging a sample of one with a sample of thousands is not a compromise; it is throwing away the sample of thousands." },
    ],
    difficulty: 2,
  },
  {
    id: "br-charismatic-founder",
    title: "The charismatic founder",
    setup: "You are asked to invest in a seed-stage start-up. Historically, the large majority of seed-stage companies fail to return their investors' money; the few that succeed hugely are what make the asset class work.",
    evidence: "The founder is articulate and impressive, the product demonstration works flawlessly, and two people you respect have already committed.",
    baseRateNote: "Every founder who raises money is articulate; every demo that reaches you has been rehearsed. These are entry conditions, not evidence. The respected co-investors are mild evidence; they too saw the same demo.",
    options: [
      { id: "a", text: "Raise your estimate of success a little above the base rate, and size the investment as one bet among many.", correct: true, why: "The vivid evidence is real but weakly diagnostic because nearly all pitches share it. Base rates for start-ups are low enough that the correct response to a good pitch is a small, diversified bet, not conviction." },
      { id: "b", text: "Invest heavily; a founder and demo this good are rare.", correct: false, why: "They are not rare among founders who reach investors. Selection has already filtered for exactly these qualities." },
      { id: "c", text: "Decline; the base rate says most fail.", correct: false, why: "The base rate says most fail and that the returns come from the few that do not. Refusing all seed investments is a different strategy, not a base-rate conclusion." },
      { id: "d", text: "Rely on the two respected co-investors; they have done the work.", correct: false, why: "Correlated judgements from the same demo are less than two independent opinions, and 'someone else has done the diligence' is how everybody ends up not doing it." },
    ],
    difficulty: 4,
  },
  {
    id: "br-witness-and-the-taxi",
    title: "The witness and the taxi",
    setup: "In a city, eighty-five per cent of taxis are green and fifteen per cent are blue. A taxi was involved in a minor collision at night. A witness says the taxi was blue. Tested under similar conditions, the witness correctly identifies the colour eighty per cent of the time.",
    evidence: "The witness is sure it was blue.",
    baseRateNote: "Per 100 incidents: 15 blue taxis, 12 of which the witness would call blue; 85 green taxis, 17 of which the witness would wrongly call blue. Of 29 'blue' reports, 12 are actually blue.",
    options: [
      { id: "a", text: "More likely green than blue; the chance it was blue is about forty per cent.", correct: true, why: "12 of 29 'blue' reports come from blue taxis, about 41 per cent. A reliable witness plus a strong base rate still leaves green the better bet. This is the classic cab problem, and most people answer eighty per cent." },
      { id: "b", text: "About eighty per cent blue; the witness is eighty per cent reliable.", correct: false, why: "Reliability is a property of the witness, not of the world. Applied to a rare colour, the witness's twenty per cent error rate generates more false 'blue' reports than there are true ones." },
      { id: "c", text: "Fifteen per cent blue; the witness adds nothing.", correct: false, why: "The witness adds a lot: the probability of blue rises from fifteen to about forty-one per cent. Evidence should move you, just not all the way." },
      { id: "d", text: "Certainly blue; witnesses under oath should be believed.", correct: false, why: "Sincerity and accuracy are different things. The witness may be entirely honest and still be wrong more often than right in this case." },
    ],
    difficulty: 4,
  },
  {
    id: "br-after-the-crash",
    title: "After the crash",
    setup: "You have an 800-kilometre journey to make next week. You had planned to fly.",
    evidence: "An airliner crashed three days ago; the coverage is everywhere and the images are difficult to forget. You find yourself thinking about driving instead.",
    baseRateNote: "Per passenger-kilometre, commercial aviation in most of the world is far safer than driving, by more than an order of magnitude on most estimates. The crash does not change the long-run rate; it changes how available the image is.",
    options: [
      { id: "a", text: "Fly, as planned. Driving 800 kilometres is the riskier choice and the crash has not altered that.", correct: true, why: "One event, however vivid, barely moves a rate built from millions of flights. The feeling of danger has changed; the danger has not. This is the availability heuristic in its purest form." },
      { id: "b", text: "Drive; there is clearly something wrong with aviation safety at the moment.", correct: false, why: "A single crash is not evidence of a trend, and driving is where the actual risk lies. After a widely reported crash, road deaths measurably rise as people make this substitution." },
      { id: "c", text: "Wait until the cause is known before deciding.", correct: false, why: "Reasonable-sounding, but the cause of one crash is almost never relevant to the risk of a different flight, and the delay has its own costs." },
      { id: "d", text: "Fly, but with a different airline from the one that crashed.", correct: false, why: "Unless the crash reveals a specific fleet-wide fault, one accident tells you nearly nothing about an airline's future risk relative to another." },
    ],
    difficulty: 2,
  },
  {
    id: "br-stockroom-shortfall",
    title: "The stockroom shortfall",
    setup: "A shop's quarterly stock count shows a shortfall worth about two thousand pounds. Retail shrinkage in general has several sources: administrative and counting errors, supplier short deliveries, damage and waste, shoplifting and, less often than people assume, staff theft. The proportions vary by sector and are debated, but no single cause dominates.",
    evidence: "A new employee started the week the shortfall began, and a colleague mentions seeing him near the stockroom more than seemed necessary.",
    baseRateNote: "Shortfalls have several common causes, most of them dull. 'Near the stockroom' is where stock work happens; a new employee is often sent there. The timing is a coincidence of the kind that occurs constantly.",
    options: [
      { id: "a", text: "Check the counting, the delivery records and the waste log first; treat the coincidence as weak evidence not yet worth acting on.", correct: true, why: "The mundane causes are collectively far more common, cheap to check, and checking them harms nobody. Suspicion of a person should wait for evidence that distinguishes theft from error." },
      { id: "b", text: "Quietly watch the new employee; the timing is too neat to ignore.", correct: false, why: "The timing is exactly as neat as chance makes it every quarter in some shop somewhere. Surveillance based on a coincidence is unfair to the person and distracts from the likely causes." },
      { id: "c", text: "Confront the employee; an innocent person will not mind.", correct: false, why: "An innocent person will mind very much, and the shortfall will still be unexplained." },
      { id: "d", text: "Do nothing; shortfalls are normal.", correct: false, why: "A two-thousand-pound shortfall deserves an explanation. The right response is investigation of causes, not indifference or suspicion." },
    ],
    difficulty: 3,
  },
];

/* ---------------- Counterfactual ----------------
 * The user states what they would expect to see if the theory were false. Good answers are
 * specific observations, not restatements of the theory's negation.
 */
export const COUNTERFACTUAL: CounterfactualChallenge[] = [
  {
    id: "cf-remote-productivity",
    title: "Less productive since going remote",
    theory: "Our team has become less productive since we moved to remote working.",
    context: "A manager of a twelve-person software team says the team has 'lost its edge' since the office closed eighteen months ago. The company keeps records of releases, tickets closed, cycle time and incidents. The manager's impression comes mostly from fewer conversations and slower replies to messages.",
    expected: [
      { text: "Delivery measures (tickets closed, releases shipped, cycle time) would be flat or improving over the period, not declining.", keywords: ["ticket|release|cycle time|output|delivery|throughput|shipped|velocity"] },
      { text: "Comparable teams that stayed in the office would show the same trend, whatever it is.", keywords: ["other teams|comparable|control|stayed in the office|on-site|comparison"] },
      { text: "The perceived decline would be concentrated in visibility (fewer hallway updates, slower chat replies) rather than in what is delivered.", keywords: ["visib|hallway|replies|chat|perception|impression|responsive|see them"] },
      { text: "Any real dip would coincide with something else (a reorganisation, a hiring freeze, a hard project) rather than with the office closing.", keywords: ["coincide|something else|reorg|hiring|hard project|other cause|timing"] },
    ],
    debrief:
      "The theory is stated as a feeling about productivity and would be tested against records of it. The counterfactual discipline forces the manager to say which numbers would embarrass the theory before looking at them; otherwise any number can be explained away. Notice that 'slower replies' is compatible with both higher and lower output.",
    difficulty: 3,
  },
  {
    id: "cf-plague-trade-routes",
    title: "Plague follows trade",
    theory: "The Black Death spread across Eurasia in the 1340s primarily along trade routes, by ship and caravan.",
    context: "Chroniclers record the plague at Kaffa on the Black Sea in 1346, at Constantinople and Sicily in 1347, at Marseille and Genoa by early 1348, then along the rivers and roads of France, and in England by the summer of 1348. The exact biology of transmission (rat fleas, human fleas and lice, and pneumonic spread) remains debated.",
    expected: [
      { text: "Inland regions with weak trade links would be struck at about the same time as ports, rather than months later.", keywords: ["inland|remote|isolated|same time|simultaneous|rather than later|mountain|before the ports"] },
      { text: "There would be no relationship between when a city was infected and how connected it was by sea or road.", keywords: ["no relationship|no correlation|connect|unrelated|regardless of trade|random order"] },
      { text: "The spread would not slow in winter, when shipping stopped, nor speed up with the sailing season.", keywords: ["winter|season|sailing|slow|pause|speed up|spring"] },
      { text: "Places that cut themselves off (Milan's quarantine, isolated Alpine valleys) would fare no better than open ones.", keywords: ["quarantine|cut off|milan|isolat|fare no better|cordon|closed gates"] },
    ],
    debrief:
      "The trade-route theory is well supported, and this exercise is about how you would know. The strongest tests are the timing gradient (ports first, hinterlands later) and the seasonal rhythm. Historians still argue about the details of transmission, which is a separate question: the routes can be right while the vector is uncertain.",
    difficulty: 4,
  },
  {
    id: "cf-price-rise-sales",
    title: "The price rise killed sales",
    theory: "Our four per cent price rise in April caused the drop in sales that followed.",
    context: "A consumer-goods company raised prices in all markets on 1 April. Sales fell nine per cent in the second quarter. The company's two main competitors report figures publicly; one raised prices at the same time, one did not. Monthly sales data exist by region.",
    expected: [
      { text: "The competitor who did not raise prices would have seen a similar fall, suggesting a market-wide cause.", keywords: ["competitor|market-wide|also fell|everyone|whole market|category|industry"] },
      { text: "The decline would have started before April, on the monthly data.", keywords: ["before april|started earlier|already falling|prior|trend|monthly"] },
      { text: "The size of the drop would be unrelated to how price-sensitive each region or product is known to be.", keywords: ["price-sensitive|elastic|region|uniform|same everywhere|no pattern|unrelated"] },
      { text: "Volume would have fallen without a matching rise in customers citing price or switching to cheaper brands.", keywords: ["cheaper|switch|citing price|trading down|own-label|survey|complaints"] },
    ],
    debrief:
      "Price rises are blamed for sales drops because the two are both salient and adjacent in time. The counterfactual makes the theory pay: it predicts a specific timing, a specific pattern across regions and a specific contrast with a competitor who held prices. If those all fail, the price rise was not the cause, however tidy the story.",
    difficulty: 3,
  },
  {
    id: "cf-continental-drift",
    title: "The continents were once joined",
    theory: "The continents were once joined and have since moved apart.",
    context: "Alfred Wegener proposed continental drift in 1912, partly from the fit of the Atlantic coastlines. He had no plausible mechanism and geologists largely rejected the idea until the 1960s, when evidence from the ocean floor arrived. Consider what you would expect if the theory were simply false.",
    expected: [
      { text: "Fossils of the same land species would not be found on both sides of an ocean they could not cross.", keywords: ["fossil|species|both sides|land animals|could not cross|glossopteris|mesosaurus"] },
      { text: "Rock formations and mountain belts would not line up when the coastlines are fitted together.", keywords: ["rock|geolog|formation|mountain|line up|match|align|strata"] },
      { text: "The ocean floor would show no symmetric pattern of magnetic stripes either side of the mid-ocean ridges, and its rocks would not get older with distance from the ridge.", keywords: ["magnetic|stripe|ridge|sea floor|ocean floor|older|spreading|symmetric"] },
      { text: "Ancient glacial deposits in India, Africa and South America would not point to a single ice sheet centred on a joined southern continent.", keywords: ["glaci|ice sheet|gondwana|southern|climate|coal|deposits"] },
    ],
    debrief:
      "Wegener's critics were not fools: a theory without a mechanism is hard to accept, and the coastline fit alone was weak. But the theory made risky predictions, and the sea-floor data of the 1960s were exactly what it could not have survived if false. This is what a good theory offers: places where it can lose.",
    difficulty: 4,
  },
  {
    id: "cf-new-manager-turnover",
    title: "People are leaving because of the new manager",
    theory: "Staff turnover in the department rose because of the manager appointed last year.",
    context: "Six of twenty staff have left in the twelve months since a new department head arrived; the previous rate was about two a year. Exit interviews exist but are brief. The company has five other departments of similar size and a local labour market with a large new employer that opened this year.",
    expected: [
      { text: "Turnover would have risen in other departments too, under other managers.", keywords: ["other departments|company-wide|everywhere|other managers|all departments|across the company"] },
      { text: "Leavers would name pay, commute or the new employer in exit interviews, not the manager.", keywords: ["exit interview|pay|salary|new employer|commute|reason|cite|poach"] },
      { text: "The timing of departures would match the new employer's recruitment rather than the manager's arrival.", keywords: ["timing|recruit|hiring wave|match|coincide|when"] },
      { text: "The upward trend would have started before the manager arrived.", keywords: ["before|already rising|trend|prior|started earlier|previous"] },
    ],
    debrief:
      "The manager is the visible change and gets the blame. The checks are all cheap and mostly outside the department: what happened elsewhere, what leavers said, when they left. If the department is alone in losing people and the leavers say why, the theory stands. If not, a bad year in the labour market is being pinned on a person.",
    difficulty: 3,
  },
  {
    id: "cf-coffeehouses-and-commerce",
    title: "Coffeehouses mattered",
    theory: "London's coffeehouses in the late seventeenth and eighteenth centuries were important institutions for the circulation of news and the conduct of business, not merely places to drink coffee.",
    context: "Coffeehouses spread through London after the 1650s. They charged a penny for entry, served coffee rather than alcohol, and were open to any man who could pay. The claim is common in popular history; ask what the world would look like if it were exaggerated.",
    expected: [
      { text: "No lasting commercial institutions would trace their origins to particular coffeehouses.", keywords: ["lloyd|stock exchange|institution|origin|founded|insurance|auction|jonathan"] },
      { text: "Newspapers and pamphlets would not have been distributed through them, and writers would not have set their work there.", keywords: ["newspaper|pamphlet|distribut|writers|journal|spectator|tatler|read"] },
      { text: "Governments would have ignored them rather than trying to suppress them.", keywords: ["suppress|government|charles ii|proclamation|ban|close|censor|1675"] },
      { text: "Merchants and brokers would have had no reason to keep regular hours at a particular house.", keywords: ["merchant|broker|regular hours|meet|trade|deals|frequent|business at"] },
    ],
    debrief:
      "Each expectation fails: Lloyd's of London and the stock exchange grew out of specific coffeehouses, periodicals were written for and read in them, and Charles II tried to close them in 1675 and backed down within days. The theory survives its counterfactuals, which is the point of running them. Not every popular story is exaggerated; the discipline is in checking rather than assuming either way.",
    difficulty: 5,
  },
  {
    id: "cf-training-load-injuries",
    title: "The new training load caused the injuries",
    theory: "The club's injury spike this season was caused by the new coach's heavier training load.",
    context: "A football club has had eleven soft-tissue injuries by November against a usual five. A new head coach arrived in the summer with a more intensive training regime. The club records each player's training load with tracking devices, the pitch was relaid in July, and the league's fixture congestion is the worst in years.",
    expected: [
      { text: "The injured players would not be the ones whose training load increased most.", keywords: ["not the ones|biggest increase|load data|tracking|gps|who got injured|individual"] },
      { text: "Other clubs with unchanged training would show the same spike, pointing to fixture congestion.", keywords: ["other clubs|league-wide|fixture|congestion|everyone|same spike|schedule"] },
      { text: "The injuries would cluster in matches rather than in training sessions.", keywords: ["match|game|in training|session|when injured|during"] },
      { text: "The injury pattern would match the pitch change (a sudden increase after July, specific injury types) more than the load profile.", keywords: ["pitch|surface|relaid|july|type of injury|hamstring|ankle"] },
    ],
    debrief:
      "Three plausible causes arrived together, as they often do in a new season, and the coach's regime is the one with a face. The training-load data is the sharpest tool: if the theory is right, the players who did the most extra work should be the ones who broke. If not, look at the fixtures and the grass.",
    difficulty: 4,
  },
  {
    id: "cf-friend-avoiding-me",
    title: "My friend is avoiding me",
    theory: "A friend has been avoiding me for the past two months.",
    context: "Messages are answered a day or two late, two suggested meetings were declined with vague reasons, and the friend has not initiated contact. Around the same time the friend started a new job and moved flat.",
    expected: [
      { text: "The friend would be similarly slow with other people, not just with you.", keywords: ["other people|everyone|mutual friends|slow with all|not just me|others"] },
      { text: "The friend would still occasionally initiate: a link, a photo, a question.", keywords: ["initiate|reach out|sends|first message|occasionally|still contacts"] },
      { text: "The lateness and declined meetings would line up with the new job and move rather than with anything between you.", keywords: ["new job|moved|busy|line up|coincide|timing|life events"] },
      { text: "When you do talk, the tone would be warm rather than guarded.", keywords: ["warm|tone|guarded|normal|when we talk|friendly|cold"] },
    ],
    debrief:
      "Social theories are hard to test because the natural test, asking, feels like an accusation. The counterfactuals here are all observable without confrontation: how the friend treats others, whether they ever reach out, whether the slowness tracks their calendar. If all four come back reassuring, the theory is probably a story you told yourself in a quiet week.",
    difficulty: 2,
  },
];

/* ---------------- Anomaly ----------------
 * Several lines of evidence support a dominant explanation; one does not fit. The user must
 * find it and say what it might mean. anomalyIndex is the index of the misfit line.
 */
export const ANOMALY: AnomalyChallenge[] = [
  {
    id: "an-late-deliveries",
    title: "The late deliveries",
    evidence: [
      "A courier depot's on-time delivery rate has fallen from ninety-four to eighty-one per cent over two months.",
      "The depot lost three of its thirty drivers in that period and has not replaced them.",
      "Parcel volume is up twenty per cent on the same period last year.",
      "Complaints about late parcels have doubled.",
      "The depot's dispatch log shows that vans are leaving on schedule, fully loaded, every morning.",
    ],
    dominantExplanation: "The depot is understaffed for its volume, so parcels go out late.",
    anomalyIndex: 4,
    significance: [
      { text: "The delay is happening on the road, not at the depot: roadworks, a changed route plan, poor address data, or vans so full that each round takes longer.", keywords: ["road|route|traffic|roadworks|on the round|out on the road|address|full van|longer rounds"] },
      { text: "'Leaving on schedule' may be measured in a way that hides the problem, for example the first van of the day rather than the last.", keywords: ["measur|defin|log|hides|first van|last van|what counts|recorded"] },
      { text: "The fewer drivers are being given larger rounds; the vans leave on time and the last parcels of each round are the late ones.", keywords: ["larger rounds|more stops|last parcel|end of the round|too many stops|per driver"] },
    ],
    debrief:
      "Four lines say understaffing and one says the vans leave on time, which understaffing at the depot cannot explain. The anomaly does not refute the staffing story; it relocates it. Overloaded rounds are still a staffing problem, but the fix is different from 'hire sorters'. An anomaly is often a pointer to where in the mechanism the problem lives.",
    difficulty: 3,
  },
  {
    id: "an-roman-coins-india",
    title: "Roman coins in southern India",
    evidence: [
      "Large numbers of Roman gold and silver coins have been found in southern India, especially in the hills of the Tamil country.",
      "The first-century Periplus of the Erythraean Sea describes ships sailing from Egyptian Red Sea ports to Indian coasts with the monsoon, carrying coin to buy pepper and gems.",
      "Pliny the Elder complained that India drained the empire of a vast sum in coin every year.",
      "Tamil poems of the period mention Western ships arriving with gold and leaving with pepper.",
      "The coins found are overwhelmingly of Augustus and Tiberius, with very few later emperors, and many have been deliberately slashed across the emperor's face.",
    ],
    dominantExplanation: "Roman merchants traded directly with southern India by sea in the first century, paying in coin.",
    anomalyIndex: 4,
    significance: [
      { text: "The coins were valued as bullion by weight, not as currency; the slashes cancel the emperor's authority or test the metal. This suggests a trade in silver and gold, not a monetised economy using Roman coin.", keywords: ["bullion|weight|metal|not as currency|test|cancel|deface|authority|silver content"] },
      { text: "The early-emperor bias may reflect Nero's debasement of the coinage after 64: Indian traders preferred the older, purer coins, and later Roman coins were shunned or melted.", keywords: ["debase|nero|purer|purity|older coins|preferred|silver|melt"] },
      { text: "The concentration under two emperors may mean the trade peaked early and declined, or that the finds reflect hoarding habits rather than trade volume.", keywords: ["peak|declin|hoard|later|volume|survival|bias|finds"] },
    ],
    debrief:
      "The four consistent lines make the trade real beyond doubt. The fifth line does not dispute that; it complicates what the coins were for and when the trade ran. Slashed faces and a cut-off after Tiberius are exactly the kind of detail a tidy narrative skips. Historians read them as evidence of bullion trade and of Indian sensitivity to Roman debasement, though the interpretation remains contested. The anomaly is where the interesting history is.",
    difficulty: 6,
  },
  {
    id: "an-price-cut-regions",
    title: "Five regions up, one down",
    evidence: [
      "A retailer cut prices on its core range by eight per cent nationwide in March.",
      "Sales volume rose between six and eleven per cent in five of its six regions.",
      "Customer surveys show price perception improved in all six regions.",
      "Total gross margin fell slightly, as expected.",
      "In the sixth region, sales volume fell four per cent, and the region's main local competitor cut its prices by twelve per cent two weeks later.",
    ],
    dominantExplanation: "The price cut worked: customers responded to lower prices with higher volume.",
    anomalyIndex: 4,
    significance: [
      { text: "The price cut triggered a local price war; in a region with a strong competitor, the cut invited retaliation and left the retailer worse off than before.", keywords: ["price war|retaliat|respond|competitor cut|undercut|triggered|reaction|match"] },
      { text: "Something else happened in the sixth region, unrelated to price: a store closure, a road change, a local downturn.", keywords: ["something else|unrelated|store|local|closure|downturn|coincidence|other cause"] },
      { text: "The price cut's effect depends on competitive structure; the national average hides that it works only where nobody answers it.", keywords: ["depends|competitive|structure|where nobody|conditional|heterogen|not uniform|context"] },
    ],
    debrief:
      "The national picture is a success; the anomaly is the region where the strategy met an opponent. Second-order effects live in anomalies: five regions show what happens when competitors do not react, one shows what happens when they do. The question for the board is not whether the cut worked but which of the two worlds the other five regions will be in next year.",
    difficulty: 3,
  },
  {
    id: "an-login-failures",
    title: "The login failures",
    evidence: [
      "Failed login attempts on a web service rose fiftyfold on Tuesday night.",
      "The attempts came from several thousand IP addresses across many countries.",
      "The usernames tried match, almost exactly, a list from a well-known third-party breach.",
      "The attempts ran from 02:00 to 04:30 and then stopped.",
      "A third of the failed attempts targeted accounts created within the previous week, which could not be on any old breach list.",
      "No account was successfully accessed.",
    ],
    dominantExplanation: "A credential-stuffing attack: an attacker replayed usernames and passwords from an old breach against the service.",
    anomalyIndex: 4,
    significance: [
      { text: "A separate problem is present: a bug in the new sign-up flow (for instance a change to password hashing or a client caching the wrong credential) is causing new users to fail to log in, and the timing overlapped with the attack.", keywords: ["bug|sign-up|signup|hashing|client|new users|cannot log in|separate|overlap|two things"] },
      { text: "The attacker has a fresher source than the old breach, such as a leak from inside the service or a phishing campaign against recent sign-ups.", keywords: ["fresher|recent leak|inside|internal|phishing|new source|different list|insider"] },
      { text: "The new accounts are the attacker's own, created to probe the login endpoint and rate limits before the main run.", keywords: ["attacker's own|created by the attacker|probe|test accounts|reconnaissance|bots|rate limit"] },
    ],
    debrief:
      "The attack story explains five lines cleanly and cannot explain the sixth at all, because a week-old account has no old breach to be in. Two events overlapping in time is the most common way an anomaly arises, and the least often considered. Each interpretation implies a different urgent action: fix a bug, hunt a leak, or tighten sign-up. The anomaly is not a detail; it decides what you do tonight.",
    difficulty: 5,
  },
  {
    id: "an-declining-warblers",
    title: "The declining warblers",
    evidence: [
      "A migratory songbird's breeding population in a region has fallen forty per cent in fifteen years.",
      "Over the same period, its breeding habitat in the region has been reduced by about thirty per cent through drainage and development.",
      "Nest monitoring shows that pairs which do breed raise as many young as they did twenty years ago.",
      "Ringing data show that adult survival between one breeding season and the next has fallen sharply.",
      "Conservation bodies have prioritised habitat restoration at the breeding sites.",
    ],
    dominantExplanation: "Loss of breeding habitat is driving the decline.",
    anomalyIndex: 3,
    significance: [
      { text: "The birds are dying between breeding seasons, on migration or on the wintering grounds: drought in the Sahel, hunting, or habitat loss thousands of kilometres away.", keywords: ["wintering|winter|migration|sahel|africa|elsewhere|on the way|drought|hunting|thousands of kilometres"] },
      { text: "Breeding habitat loss and adult mortality may be linked: crowded remaining habitat could leave adults in poorer condition for the journey.", keywords: ["condition|crowd|competition|linked|poorer|weaker|exhaust|indirect"] },
      { text: "The survival estimate may be an artefact: birds that move to new sites outside the study area look like deaths to a ringing scheme.", keywords: ["artefact|moved|dispersal|outside the study|emigrat|not dead|ringing|recapture"] },
    ],
    debrief:
      "If habitat loss were the whole story, pairs would fail to find territories and breed less; instead they breed normally and then fail to come back. The anomaly points away from the breeding grounds, where all the effort is going, toward a problem nobody in the region can see. Restoring habitat is still good; believing it will reverse the decline is not supported by this evidence.",
    difficulty: 4,
  },
  {
    id: "an-cafe-takings",
    title: "The cafe opposite the chain",
    evidence: [
      "An independent cafe's takings have fallen fifteen per cent since a coffee chain opened directly opposite four months ago.",
      "The chain is visibly busy at all hours.",
      "Footfall on the street, counted by the council, is unchanged.",
      "The cafe's average spend per customer is slightly up; its customer count is down.",
      "Weekend takings are unchanged; the entire fall is in weekday mornings before ten.",
    ],
    dominantExplanation: "The chain is taking the cafe's customers.",
    anomalyIndex: 4,
    significance: [
      { text: "The chain has taken one specific segment: commuters who want speed before work. The cafe's other customers are untouched, so the competitive response is about queue time, not about coffee quality or price.", keywords: ["commut|speed|queue|fast|before work|segment|morning rush|takeaway|grab and go"] },
      { text: "The morning loss may not be the chain at all: an office nearby closed or moved, or a bus route changed, removing the early trade.", keywords: ["office|moved|closed|bus|route|nearby|not the chain|other cause|workplace"] },
      { text: "Something changed in the cafe's own mornings: a new opening time, a staff change, a slower barista on the early shift.", keywords: ["opening time|staff|barista|early shift|own|internal|opens later|service"] },
    ],
    debrief:
      "Blaming the chain is not wrong, but it is not specific enough to act on. The weekend line is the anomaly, and it converts a vague threat into a precise question: who used to come in before ten on weekdays, and why have they stopped? The same cafe with a faster morning counter might be fine, or might discover the office over the road has gone.",
    difficulty: 3,
  },
  {
    id: "an-homework-platform",
    title: "The homework platform",
    evidence: [
      "A school adopted an online homework platform in September; year-group exam averages rose eight points by June.",
      "Teachers report that pupils completed more homework than in previous years.",
      "Pupils who used the platform most had the highest grades.",
      "One mathematics teacher declined to use the platform and set homework on paper as before; her classes' averages rose by the same eight points.",
      "The head has recommended the platform to other schools in the trust.",
    ],
    dominantExplanation: "The platform improved learning and raised grades.",
    anomalyIndex: 3,
    significance: [
      { text: "The rise has another cause affecting the whole year group: an easier paper, a stronger cohort, a change in marking, or a general push on homework that the platform merely accompanied.", keywords: ["other cause|whole year|cohort|easier|exam|marking|everyone rose|general|something else"] },
      { text: "The benefit leaked: pupils in the paper classes shared the platform's practice questions with friends, so the comparison class is contaminated.", keywords: ["leak|spillover|shared|contaminat|friends|both groups|not a clean comparison"] },
      { text: "The heavy-user correlation is selection: diligent pupils both use the platform more and score higher, with or without it.", keywords: ["selection|diligent|would have anyway|motivated|correlation|use it more because"] },
    ],
    debrief:
      "The one teacher who did not use the platform provided the only control the school has, and her result says the platform did not cause the rise. The heavy-user correlation is the kind of evidence that looks decisive and is nearly worthless. Before recommending it across the trust, the head needs a better comparison than the one that already contradicts her.",
    difficulty: 3,
  },
  {
    id: "an-sudden-improvement",
    title: "The sudden improvement",
    evidence: [
      "A distance runner, aged twenty-nine, improved her personal best over 10,000 metres by four per cent in a single season, a large jump at that level.",
      "She changed coach at the start of the season and spent two blocks of the winter training at altitude.",
      "She has passed every anti-doping test, in and out of competition.",
      "Her training volume, according to her coach, rose by a third.",
      "Her times over 5,000 metres and in the half marathon are unchanged from the previous year.",
    ],
    dominantExplanation: "The jump is suspicious and most likely explained by doping.",
    anomalyIndex: 4,
    significance: [
      { text: "The gain is specific to one event, which points to something event-specific: pacing strategy, race selection, a particularly fast course or conditions, or new shoes used only in that race.", keywords: ["event-specific|pacing|course|conditions|shoes|one race|tactic|specific to|fast track|wind"] },
      { text: "A general physiological improvement, whether from doping, altitude or volume, would be expected to show across distances; its absence weakens the doping story and the training story alike.", keywords: ["across distances|general|physiolog|would show everywhere|weakens|all events|both"] },
      { text: "A single result is a small sample; the personal best could be an outlier that the other distances, with more races, do not reflect.", keywords: ["one result|outlier|small sample|single race|noise|repeat|reproduce"] },
    ],
    debrief:
      "Suspicion arrives as a dominant explanation before the evidence is examined, and the evidence then gets read for consistency with it. The unchanged times at other distances are the misfit: a stronger engine should show up in every race, so the improvement looks like a one-race or one-event effect. Passing tests is weak evidence either way; the pattern of results is stronger evidence, and it points away from the dramatic story. Suspend judgement and look at the next three races.",
    difficulty: 5,
  },
];
