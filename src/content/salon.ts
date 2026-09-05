import type { SalonScenario } from "@/lib/domain/types";

/**
 * The Salon: seeded conversation scenarios.
 *
 * Each scenario is a person with something to protect. The user's job is to ask
 * questions that force new information without spending rapport they cannot afford.
 * Hidden-fact triggers and script matches are lower-case keyword sets a good question
 * would plausibly contain. Guarded facts are meant to require rapport of roughly 0.5.
 * Scripted replies are the deterministic fallback when no model is configured.
 */
export const SALON_SCENARIOS: SalonScenario[] = [
  /* ---------------------------------------------------------------- */
  /* 1. The professor                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-professor-print",
    title: "Necessary but not sufficient",
    setting:
      "A college common room after a seminar. Professor Edmund Sayer, sixty-one, historian of early modern Europe, has just defended for the fourth time in a decade his thesis that the printing press caused the Reformation. He is on his second glass of wine and expects to be disagreed with. You have twenty minutes and a real interest in whether he is right.",
    character: {
      name: "Edmund Sayer",
      role: "Professor of early modern European history",
      goal: "Defend the thesis of his best-known book, that print was the decisive cause of the Reformation, without conceding the qualifications he privately accepts.",
      knowledge: [
        "Gutenberg's system was working in Mainz by the early 1450s; presses stood in roughly 250 European towns by 1500, and Venice was the largest printing centre of all.",
        "Mark Edwards estimated that around thirty of Luther's writings appeared in roughly 300,000 copies between 1517 and 1520; the flood of German pamphlets in the early 1520s has no precedent.",
        "Earlier reform movements existed before print: the Lollards in England (from the 1380s) and the Hussites in Bohemia (1415 onward), who won a national church without a single press.",
        "Elizabeth Eisenstein (1979) argued print created a fixed, cumulative record; Adrian Johns (1998) replied that fixity was earned by institutions, not granted by the machine.",
        "Literacy around 1500 is estimated at perhaps five percent of the German population, higher in towns; print's effect ran through reading aloud, sermons and woodcuts.",
        "Arabic-script printing was not licensed for Ottoman Muslims until 1727, although Jewish, Armenian and Greek presses had operated in Istanbul much earlier.",
      ],
      privateMotivations: [
        "The book began as a quarrel with his doctoral supervisor, who held that the Reformation was fundamentally a political event driven by princes; the supervisor died before it was published and the argument was never finished.",
        "A review in a leading journal called him a technological determinist; the phrase still annoys him and he has quietly softened the second edition to say 'necessary but not sufficient'.",
        "He wants to be argued with well. Flattery bores him; a good objection is the only thing that makes him generous.",
      ],
      style:
        "Dry, exact, a little theatrical after wine. Answers questions with questions when he can. Uses dates as punctuation. Generous when the objection is good, withering when it is lazy.",
      constraints: [
        "Will not volunteer the concessions in the second edition; will admit them when asked precisely.",
        "Will not discuss his supervisor unless the conversation has become genuinely personal.",
        "Never pretends to knowledge he lacks; if he does not know a figure, he says so and says who would.",
      ],
      misconceptions: [
        "Believes the Ottoman absence of a Reformation is a clean natural experiment in favour of his thesis; it is not, and he half knows it.",
        "Treats the surviving-edition counts as if they were print-run counts, which quietly inflates his certainty about circulation.",
      ],
    },
    objectives: [
      {
        id: "obj-objection",
        text: "Find out which counterexample the professor himself thinks is the most awkward for his thesis.",
        requiresFacts: ["f-venice"],
      },
      {
        id: "obj-numbers",
        text: "Establish how the circulation figures he quotes were actually produced.",
        requiresFacts: ["f-sources"],
      },
      {
        id: "obj-personal",
        text: "Understand why he holds the thesis so tightly.",
        requiresFacts: ["f-supervisor"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-literacy",
        fact: "He accepts that literacy around 1500 was low, perhaps five percent overall and higher in towns, and that 'print' in his argument really means a whole system of reading aloud, preaching and images that the press fed.",
        triggers: ["literacy", "literate", "illiterate", "could read", "reading", "who read"],
      },
      {
        id: "f-hussites",
        fact: "He knows the Hussites won a national reformation in Bohemia before print existed. His answer is that it stayed confined to Bohemia, which he says proves print's role in spread; he admits it proves containment, not cause.",
        triggers: ["hussite", "hus", "lollard", "wycliffe", "bohemia", "before printing"],
      },
      {
        id: "f-venice",
        fact: "The case he finds most awkward is Italy: Venice was the largest print centre in Europe and the Reformation did not take root there. He explains it by censorship and the Inquisition, but he knows the explanation is doing a lot of work.",
        triggers: ["change your mind", "counterexample", "wrong", "falsif", "italy", "venice"],
        guarded: true,
      },
      {
        id: "f-supervisor",
        fact: "His doctoral supervisor argued the Reformation was a political event made by princes. The book began as an argument with him. The supervisor died two years before it appeared, and Sayer has never been sure he would have won the argument in person.",
        triggers: ["supervisor", "mentor", "teacher", "personal", "how did you come", "why this subject"],
        guarded: true,
      },
      {
        id: "f-review",
        fact: "A review called him a technological determinist. The second edition's introduction now says print was 'necessary but not sufficient', which is a smaller claim than the one he defends in seminars.",
        triggers: ["review", "critic", "determinis", "second edition", "revised", "soften"],
      },
      {
        id: "f-sources",
        fact: "His circulation figures come from counts of surviving editions (Edwards, Pettegree) multiplied by an assumed print run of about a thousand copies. The print run is an assumption; the edition count is the only measured quantity.",
        triggers: ["print run", "how many copies", "where do the numbers", "source of", "data", "estimate"],
      },
      {
        id: "f-ottoman",
        fact: "He uses the Ottoman comparison in lectures because students like it, but he thinks the absence of an Ottoman Reformation has better explanations than the absence of presses, and would not put the comparison in print.",
        triggers: ["ottoman", "islamic", "arabic", "muslim", "istanbul", "comparison"],
      },
    ],
    opening:
      "You stayed. Most people leave after the second question about Luther. Sit down; the wine is the college's and therefore not worth defending, unlike the argument. You look as if you have an objection. I would rather have it than a compliment.",
    script: [
      {
        match: ["hello", "good evening", "thank you", "pleasure", "enjoyed", "congratulations", "fascinating"],
        reply: "Kind of you. I have given that paper often enough that the pleasure is mostly yours. What did you actually think?",
        rapportDelta: 0.08,
      },
      {
        match: ["determinist", "simplistic", "naive", "obviously wrong", "you ignore", "lazy", "reductive"],
        reply: "That word again. I have been called a determinist by people who have not read past the introduction, and I can usually tell by the second sentence. If you have a specific objection, make it; if you have a label, keep it.",
        rapportDelta: -0.15,
      },
      {
        match: ["don't you think", "surely", "isn't it true", "wouldn't you agree", "you must admit", "so you're saying"],
        reply: "Leading questions are how undergraduates try to get me to write their essays for them. Ask me what you want to know and I will answer it.",
        rapportDelta: -0.1,
      },
      {
        match: ["what is your argument", "thesis", "claim", "what do you argue", "your position", "in one sentence"],
        reply: "That without a cheap way to copy text, Luther is Jan Hus: a brilliant heretic burned in a provincial town. The press turned a dispute among theologians into a mass event in about three years. That is the argument; everything else is footnotes.",
        rapportDelta: 0.04,
      },
      {
        match: ["what do you mean by print", "define", "clarify", "by print you mean", "the press itself", "the machine"],
        reply: "Fair. I do not mean the machine; I mean the industry that grew around it: printers who needed copy, pedlars who sold pamphlets, preachers who read them aloud. When I say 'print' I mean a system for moving words that suddenly cost a tenth of what it had.",
        rapportDelta: 0.06,
      },
      {
        match: ["literacy", "literate", "illiterate", "could read", "who read", "how many people could read"],
        reply: "Low. Perhaps one in twenty across the German lands, more in towns, and I will not defend a precise figure because nobody can. Which is why the pamphlets were read aloud in inns and printed with woodcuts. Print did not need readers; it needed listeners and a few loud men.",
        reveals: ["f-literacy"],
        rapportDelta: 0.05,
      },
      {
        match: ["hussite", "hus", "lollard", "wycliffe", "bohemia", "before printing", "earlier reform"],
        reply: "Yes, the Hussites. A national church in Bohemia by the 1430s and not a press in sight. My answer is that it stayed in Bohemia, and I think that is a good answer for why the Reformation spread. It is a weaker answer for why it began, and I would be lying if I said otherwise.",
        reveals: ["f-hussites"],
        rapportDelta: 0.05,
      },
      {
        match: ["change your mind", "counterexample", "wrong", "falsif", "italy", "venice", "disprove", "weakest"],
        reply: "Italy. Venice had more presses than anywhere in Europe and the Reformation died there. I say Inquisition and censorship, and I believe it, but I notice that I need a second cause the moment my first one fails. If you want the soft spot, that is where it is.",
        reveals: ["f-venice"],
        rapportDelta: 0.08,
      },
      {
        match: ["print run", "how many copies", "where do the numbers", "source of", "data", "measured", "figure", "estimate"],
        reply: "Surviving editions. Edwards and Pettegree counted them, and one multiplies by a plausible run, a thousand copies, sometimes fifteen hundred. The multiplication is the assumption. The edition count is real; the three hundred thousand is arithmetic on top of it.",
        reveals: ["f-sources"],
        rapportDelta: 0.04,
      },
      {
        match: ["review", "critic", "second edition", "revised", "soften", "changed your position"],
        reply: "The second edition says 'necessary but not sufficient', which a reviewer will tell you is a retreat and I will tell you is precision. I say the stronger thing in seminars because a seminar is for arguing. The book is for being right.",
        reveals: ["f-review"],
        rapportDelta: 0.02,
      },
      {
        match: ["ottoman", "islamic", "arabic", "muslim", "istanbul", "natural experiment"],
        reply: "No licensed Arabic press for Muslims until 1727 and no Reformation: students love it. I use it because they love it. Between us, the Ottoman case has half a dozen better explanations, and I would not put it in a footnote, let alone a chapter.",
        reveals: ["f-ottoman"],
        rapportDelta: 0.03,
      },
      {
        match: ["supervisor", "mentor", "your teacher", "how did you come", "why this subject", "personal", "began"],
        reply: "My supervisor thought princes made the Reformation and printers merely sold it. The book was my side of an argument we had every Thursday for six years. He died before it came out. I have been having the argument with reviewers ever since, which is not the same thing.",
        reveals: ["f-supervisor"],
        rapportDelta: 0.1,
      },
      {
        match: ["when", "1517", "1450", "how long", "timeline", "chronology", "how fast", "decades"],
        reply: "Mainz in the 1450s; Wittenberg in 1517; by 1524 you cannot buy a pamphlet in Augsburg that is not about salvation. Seventy years for the industry to mature and about six for it to catch fire. The ordering is not in dispute; what it proves is.",
        rapportDelta: 0.02,
      },
      {
        match: ["why does it matter", "why do you care", "at stake", "what's at stake", "so what"],
        reply: "Because if I am right, the interesting question about any idea is not whether it is true but what it costs to copy it. You will recognise that pattern again in your lifetime, probably this year.",
        rapportDelta: 0.04,
      },
    ],
    fallbackReplies: [
      "That is not quite a question yet. Sharpen it and I will answer it.",
      "I could answer that, but you would learn more by asking me something I cannot answer in my sleep.",
      "Hm. Say what you are actually trying to find out and I will tell you whether I know.",
      "You are circling. Historians do that too; it rarely helps.",
      "I have a rule about answering vague questions after nine o'clock. Try again with a date or a name in it.",
    ],
    difficulty: 5,
    subskills: ["social.question_quality", "social.perspective", "social.listening", "inference.information_value"],
    estimatedMinutes: 12,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 2. The founder                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-founder-churn",
    title: "Net of everything",
    setting:
      "A cafe near a co-working building at eleven in the morning. Tomasz Wierzbicki, thirty-three, co-founder and chief executive of Quill, a bookkeeping product for independent restaurants, is raising a seed round. You are the investor he most wants on the term sheet. He has a deck; you have questions.",
    character: {
      name: "Tomasz Wierzbicki",
      role: "Co-founder and CEO of Quill, a bookkeeping product for independent restaurants",
      goal: "Leave with a commitment to lead the round, without the conversation settling on churn.",
      knowledge: [
        "Quill has 212 paying restaurants, monthly recurring revenue of about 31,000 in the local currency, and grew MRR 22 percent in the last quarter.",
        "Net revenue retention across the top forty accounts is 118 percent; logo churn across the whole base is around six percent a month, which annualises to more than half the customers.",
        "Restaurants close at a high rate; roughly a third of Quill's cancellations are business closures rather than switches.",
        "Prices went up forty percent in March; most of the MRR growth since then is price, not volume.",
        "An established accounting platform launched a restaurant module in May; three accounts have moved to it, all on their accountant's advice.",
        "Runway is about five months; a small bridge from existing angels is being discussed but not signed.",
      ],
      privateMotivations: [
        "He believes churn is a solvable onboarding problem and that saying so in the wrong words will kill the round; he is managing the order in which facts arrive.",
        "His technical co-founder went to three days a week in June to care for a parent, and nobody outside the company knows.",
        "He has personally guaranteed a small loan and cannot afford a slow no.",
      ],
      style:
        "Fast, warm, fluent in metrics. Answers a hard question with a true but adjacent number. Genuinely likes the product and the customers and talks about them by name. Gets quieter, not louder, when cornered.",
      constraints: [
        "Will not lie about a number when asked for it precisely; will choose the flattering denominator if allowed to.",
        "Will not mention the co-founder's hours unless asked directly about the team and trust has been built.",
        "Will not disparage competitors; will describe the incumbent as 'a generalist'.",
      ],
      misconceptions: [
        "Believes that because a third of churn is closures it 'does not count', when an investor prices it either way.",
        "Believes the pilot cohort's retention is the true retention and later cohorts are 'noise from bad onboarding'.",
      ],
    },
    objectives: [
      {
        id: "obj-churn",
        text: "Establish the real churn rate and what population it is measured on.",
        requiresFacts: ["f-churn", "f-cohort"],
      },
      {
        id: "obj-runway",
        text: "Learn how much runway remains and what happens when it ends.",
        requiresFacts: ["f-runway"],
      },
      {
        id: "obj-team",
        text: "Find out what has changed on the founding team.",
        requiresFacts: ["f-cofounder"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-churn",
        fact: "Logo churn across all customers is about six percent a month. The 118 percent retention figure in the deck is net revenue retention measured on the top forty accounts only.",
        triggers: ["churn", "retention", "cancel", "cancellation", "lose customers", "leave"],
      },
      {
        id: "f-cohort",
        fact: "The forty accounts behind the 118 percent figure are the pilot cohort, onboarded by the founders in person. Cohorts acquired since self-serve launch retain far worse.",
        triggers: ["cohort", "which customers", "sample", "top accounts", "denominator", "onboard"],
        guarded: true,
      },
      {
        id: "f-runway",
        fact: "About five months of runway at current burn. A bridge of roughly two months from existing angels is being discussed and is not signed.",
        triggers: ["runway", "cash", "burn", "months left", "bank", "how long can you"],
      },
      {
        id: "f-cofounder",
        fact: "The technical co-founder, Ana, moved to three days a week in June to look after a parent. Shipping has slowed and the change has not been announced to anyone outside the company.",
        triggers: ["co-founder", "cofounder", "cto", "team", "engineering", "ana"],
        guarded: true,
      },
      {
        id: "f-why-churn",
        fact: "About a third of cancellations are restaurants closing. The rest mostly switch to whatever their accountant already uses; Quill has no relationship with accountants.",
        triggers: ["why do they leave", "reason", "why cancel", "closures", "exit", "feedback"],
      },
      {
        id: "f-pricing",
        fact: "Prices rose forty percent in March. Since then MRR growth has come mainly from price; new-customer volume is roughly flat.",
        triggers: ["price", "pricing", "arpu", "volume", "new customers", "growth from"],
      },
      {
        id: "f-competitor",
        fact: "An established accounting platform launched a restaurant module in May. Three accounts have moved to it, in each case because the restaurant's accountant asked them to.",
        triggers: ["competitor", "competition", "alternative", "rival", "incumbent", "who else"],
        guarded: true,
      },
    ],
    opening:
      "Thanks for making the time; I know you had the deck already so I will not read it to you. Short version: two hundred and twelve restaurants, twenty-two percent quarter-on-quarter, and a customer in Leeds who told me last week that we are the only software she has ever liked. Where do you want to start?",
    script: [
      {
        match: ["hello", "good to meet", "thanks for coming", "congratulations", "impressive", "great to see"],
        reply: "Likewise. I have wanted this conversation since your note on restaurant margins last year; you were the only investor who seemed to know what a covers count is.",
        rapportDelta: 0.08,
      },
      {
        match: ["hiding", "lying", "cooking", "misleading", "dishonest", "fudging", "you're not telling me"],
        reply: "Every number in that deck is real and I can show you where each one comes from. If you think a figure is wrong, tell me which one and I will pull it up now. I would rather be asked than accused.",
        rapportDelta: -0.15,
      },
      {
        match: ["surely your churn", "isn't your churn", "so you're saying", "you must be losing", "obviously"],
        reply: "I would not put it that way, no. Ask me the number and I will give you the number.",
        rapportDelta: -0.08,
      },
      {
        match: ["tell me about the business", "how is it going", "what do you do", "walk me through", "overview", "the product"],
        reply: "Restaurants run on spreadsheets, a shoebox and an accountant they see once a year. Quill reads the till and the supplier invoices and tells the owner on Monday morning whether last week made money. Twenty-two percent growth last quarter, and the owners actually open it.",
        rapportDelta: 0.04,
      },
      {
        match: ["what do you mean by", "define", "net revenue retention", "nrr", "how do you calculate", "clarify"],
        reply: "Net revenue retention: take a set of customers at the start of a period, and ask what their revenue is twelve months later including upgrades, minus downgrades and cancellations. Above a hundred means the survivors grow faster than the leavers cost. Ours is a hundred and eighteen on the accounts in the deck.",
        rapportDelta: 0.05,
      },
      {
        match: ["churn", "retention", "cancel", "cancellation", "lose customers", "logo", "how many leave"],
        reply: "Net revenue retention on our core accounts is a hundred and eighteen percent, which for SMB software is very good. Logo churn across the whole base is higher, about six percent a month, and I will not pretend that is where we want it. It is an onboarding problem, and I can show you why I think that.",
        reveals: ["f-churn"],
        rapportDelta: 0.02,
      },
      {
        match: ["cohort", "which customers", "sample", "top accounts", "denominator", "who is included", "onboarded by"],
        reply: "The hundred and eighteen is the first forty. Ana and I onboarded every one of them in person, sat in their kitchens. Since we went self-serve the later cohorts do not look like that, and yes, that is the whole company's problem in one sentence.",
        reveals: ["f-cohort"],
        rapportDelta: 0.06,
      },
      {
        match: ["why do they leave", "reason", "why cancel", "closures", "where do they go", "feedback", "exit"],
        reply: "About a third of them close, which is restaurants, not us. The rest go wherever their accountant already is. We sell to owners; the accountant is the one who decides in the end, and we have no relationship with accountants yet. That is the bit I want your money for.",
        reveals: ["f-why-churn"],
        rapportDelta: 0.03,
      },
      {
        match: ["price", "pricing", "per customer", "arpu", "volume", "new customers", "growth from", "how much of the growth"],
        reply: "We raised prices forty percent in March and lost almost nobody, which I take as evidence of value. It does mean that most of the growth since then is price. New logos are roughly flat month to month; I would rather you heard that from me.",
        reveals: ["f-pricing"],
        rapportDelta: 0.03,
      },
      {
        match: ["runway", "cash", "burn", "months left", "bank", "how long can you", "bridge"],
        reply: "Five months at today's burn. Two of the angels have offered a bridge that would add roughly two more, and we have not signed it because I did not want to raise on a bridge. That is why this conversation is happening now and not in the autumn.",
        reveals: ["f-runway"],
        rapportDelta: 0.04,
      },
      {
        match: ["co-founder", "cofounder", "cto", "team", "engineering", "who builds", "ana", "hours", "full time"],
        reply: "Ana has been three days a week since June; her father is unwell. We have not announced it, partly because it is her business and partly because I hoped it would be temporary. Shipping is slower. I should have told you before you asked.",
        reveals: ["f-cofounder"],
        rapportDelta: 0.06,
      },
      {
        match: ["competitor", "competition", "alternative", "rival", "incumbent", "who else", "switch to"],
        reply: "The generalist platform launched a restaurant module in May. We have lost three accounts to it, all because the accountant asked. Their module is worse; that turns out not to matter when the accountant is the one asking.",
        reveals: ["f-competitor"],
        rapportDelta: 0.04,
      },
      {
        match: ["when did you launch", "founded", "how long", "history", "started", "timeline", "since when"],
        reply: "Ana and I started in her brother's restaurant kitchen two and a half years ago. Paid product in month eight, self-serve signup fourteen months ago, price rise in March. The graph in the deck starts at the paid launch, which is the honest place to start it.",
        rapportDelta: 0.02,
      },
      {
        match: ["why raise", "why now", "use of funds", "what will you spend", "what is the money for"],
        reply: "An accountant channel and two engineers. Owners love us and accountants have never heard of us; that gap is where the churn lives and where the money goes.",
        rapportDelta: 0.03,
      },
    ],
    fallbackReplies: [
      "Good question. Can I answer it with the customer story first and the number second? The number makes more sense with the story.",
      "I want to give you the precise version of that, not the fast one. Ask it one notch more specifically and I will.",
      "That is in the data room, and you should have the data room. What is the thing behind the question?",
      "Honestly, I am not sure which number you are after. Retention, growth, cash: pick one and I will be exact.",
      "Let me not guess at that. What would a good answer look like for you?",
    ],
    difficulty: 4,
    subskills: ["social.incentive_recognition", "social.question_quality", "social.ambiguity", "inference.information_value"],
    estimatedMinutes: 10,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 3. The friend                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-friend-left-job",
    title: "It ran its course",
    setting:
      "A walk along the canal on a Sunday afternoon. Jonah Feld, thirty-four, was head of operations at a freight brokerage until three weeks ago. He suggested the walk, said he wanted your advice about what to do next, and has so far talked about the weather and a podcast. You have known him for nine years.",
    character: {
      name: "Jonah Feld",
      role: "Friend; until recently head of operations at a freight brokerage",
      goal: "Get your advice about what to do next without telling you the whole story of why he left, because the whole story embarrasses him and he signed something about it.",
      knowledge: [
        "In April the new chief operating officer instructed his team to invoice a large customer for warehousing services that had not been provided, describing it as 'timing'.",
        "He objected in a meeting, then in writing to the chief executive; the chief executive did not reply for nine days and then suggested 'a conversation with the COO'.",
        "Between April and August he stopped attending the Monday leadership meeting and was gradually cut out of decisions.",
        "He resigned in August and was asked to sign a settlement: two months' pay, a neutral reference, and a clause preventing him from disparaging the company.",
        "He has no new job. He told two other friends he had 'something lined up', which was true only in the sense that he had a coffee with a recruiter.",
        "His partner Mira thinks he should have stayed and escalated further; they have argued about it twice.",
      ],
      privateMotivations: [
        "He is ashamed that he left rather than fought, and half-suspects the invoice went out anyway.",
        "He wants you to tell him he did the right thing without having to describe what the thing was.",
        "The settlement's non-disparagement clause makes him nervous about saying anything at all, even to a friend.",
      ],
      style:
        "Warm, deflecting, funny when uncomfortable. Answers questions about himself with questions about you. Goes quiet rather than lying. Uses 'it is what it is' and 'ran its course' as doors he closes.",
      constraints: [
        "Will not name the customer or the COO in full; will describe the invoice only once trust is established.",
        "Will not admit he has no job lined up unless asked plainly and kindly.",
        "Will not badmouth the company, partly from the clause and partly from habit.",
      ],
      misconceptions: [
        "Believes the non-disparagement clause prevents him from telling a friend what happened; it prevents public statements, not private ones, and would not cover reporting to a regulator.",
        "Believes that leaving without fighting to the end was cowardice; a friend with distance might see it as a reasonable decision made with incomplete information.",
      ],
    },
    objectives: [
      {
        id: "obj-cause",
        text: "Learn what actually caused him to leave.",
        requiresFacts: ["f-conflict"],
      },
      {
        id: "obj-sequence",
        text: "Reconstruct the sequence from the disagreement to the departure, including how it ended.",
        requiresFacts: ["f-timeline", "f-settlement"],
      },
      {
        id: "obj-need",
        text: "Find out what he actually needs from you today.",
        requiresFacts: ["f-no-job"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-no-job",
        fact: "He has nothing lined up. The 'something in the pipeline' he mentioned to friends is one coffee with a recruiter.",
        triggers: ["new job", "lined up", "offer", "where are you going", "pipeline", "plans"],
      },
      {
        id: "f-conflict",
        fact: "In April the new COO told his team to invoice a major customer for warehousing that had not happened, calling it a timing adjustment. He refused to sign it off.",
        triggers: ["disagree", "conflict", "fell out", "boss", "coo", "invoice"],
        guarded: true,
      },
      {
        id: "f-escalation",
        fact: "He objected in the meeting and then by email to the chief executive. The chief executive took nine days to reply and proposed 'a conversation with the COO', which was never arranged.",
        triggers: ["escalat", "raise it", "email", "in writing", "ceo", "paper trail"],
        guarded: true,
      },
      {
        id: "f-settlement",
        fact: "He resigned rather than being dismissed, but was handed a settlement agreement: two months' pay, a neutral reference and a non-disparagement clause. He signed it.",
        triggers: ["fired", "resign", "quit", "pushed out", "severance", "settlement"],
        guarded: true,
      },
      {
        id: "f-timeline",
        fact: "The disagreement was in April. From May he stopped being invited to the Monday leadership meeting. He resigned in the second week of August.",
        triggers: ["when", "how long", "timeline", "months", "sequence", "april"],
      },
      {
        id: "f-partner",
        fact: "Mira thinks he should have stayed and pushed it to the board or a regulator. They have argued about it twice, which is why he asked you rather than her.",
        triggers: ["mira", "partner", "at home", "what does she think", "family", "who else have you talked to"],
        guarded: true,
      },
      {
        id: "f-reference",
        fact: "He is worried about what the company will say about him. The settlement guarantees a neutral reference: dates and job title only.",
        triggers: ["reference", "recommendation", "what will they say", "future employer", "background check"],
      },
    ],
    opening:
      "Sorry, I have been talking about a podcast for ten minutes. You are allowed to tell me to stop. Anyway, I said I wanted your advice, and I do: I am trying to work out what the next thing should be, and you are the only person I know who has ever changed direction on purpose.",
    script: [
      {
        match: ["good to see you", "glad you called", "thanks for asking", "i'm here", "take your time", "no rush"],
        reply: "Thanks. I did not want to do this over a phone. You are the one person who will not immediately tell me what I should have done.",
        rapportDelta: 0.12,
      },
      {
        match: ["you got fired", "you screwed up", "what did you do", "your fault", "did you mess up", "did they catch you"],
        reply: "No. Nobody caught anybody doing anything, and I did not get fired. I was hoping this would be a walk, not a deposition.",
        rapportDelta: -0.15,
      },
      {
        match: ["surely", "i bet", "don't tell me", "must have been", "let me guess"],
        reply: "You can guess if you like. I would rather you asked.",
        rapportDelta: -0.08,
      },
      {
        match: ["what happened", "how are you", "tell me", "how are you doing", "how did it end"],
        reply: "It ran its course, honestly. New leadership came in, the job changed, and after a while it was not the job I had taken. I am fine. Slightly too much time to think, which is why you are getting the podcast summaries.",
        rapportDelta: 0.04,
      },
      {
        match: ["what do you mean", "ran its course", "the job changed", "changed how", "clarify", "specifically"],
        reply: "I mean that the people I trusted left and the people who replaced them wanted a different kind of operations person. One who says yes faster. It is not a dramatic story, it is just a slow one.",
        rapportDelta: 0.05,
      },
      {
        match: ["new job", "lined up", "next", "offer", "where are you going", "pipeline", "interviews", "plans"],
        reply: "There is nothing lined up. I told a couple of people there was because it is easier than the face they make otherwise. One coffee with a recruiter, who said the market is 'thoughtful' right now, which I think means slow.",
        reveals: ["f-no-job"],
        rapportDelta: 0.06,
      },
      {
        match: ["disagree", "conflict", "argument", "fell out", "boss", "coo", "manager", "what went wrong", "invoice"],
        reply: "All right. In April the new COO wanted us to invoice a big customer for warehousing that had not happened yet. Called it timing. I would not sign it off, and that was the beginning of the end, though it took four months to get to the end.",
        reveals: ["f-conflict"],
        rapportDelta: 0.08,
      },
      {
        match: ["escalat", "report", "raise it", "email", "in writing", "told anyone", "ceo", "hr", "paper trail", "record"],
        reply: "I said it in the meeting and then I put it in an email to the chief executive, because I wanted it written down. He took nine days to answer and suggested I have a conversation with the COO. The conversation never got arranged. I kept the email.",
        reveals: ["f-escalation"],
        rapportDelta: 0.06,
      },
      {
        match: ["fired", "resign", "quit", "let go", "pushed out", "severance", "settlement", "agreement", "did you sign"],
        reply: "I resigned, and HR produced an agreement the same afternoon, which tells you they had it ready. Two months' pay, a neutral reference, and I do not say anything bad about them. I signed it. That is the part Mira cannot forgive.",
        reveals: ["f-settlement"],
        rapportDelta: 0.05,
      },
      {
        match: ["when", "how long", "timeline", "first notice", "months", "sequence", "what happened first", "april"],
        reply: "April was the invoice. By May I was not being invited to the Monday leadership meeting, which nobody ever said out loud; the invite just stopped. I resigned in the second week of August. Four months of being slowly moved out of the room.",
        reveals: ["f-timeline"],
        rapportDelta: 0.04,
      },
      {
        match: ["mira", "partner", "at home", "what does she think", "family", "who else have you talked to"],
        reply: "Mira thinks I should have gone to the board, or a regulator, and that signing was letting them buy silence. We have had that argument twice and I lost both times without changing my mind. That is partly why I asked you.",
        reveals: ["f-partner"],
        rapportDelta: 0.06,
      },
      {
        match: ["reference", "recommendation", "what will they say", "future employer", "background check"],
        reply: "Dates and title only; that is in the agreement. Which is fine unless someone asks why a head of operations left with nothing lined up, and everyone asks that.",
        reveals: ["f-reference"],
        rapportDelta: 0.03,
      },
      {
        match: ["why did you stay", "why not leave earlier", "why stay", "why so long", "why not go straight away"],
        reply: "Because I thought if I stayed I could stop it, and because I had a mortgage and no plan. Both true. The second one is the one I do not say at parties.",
        rapportDelta: 0.05,
      },
      {
        match: ["what do you need", "how can i help", "what do you want from me", "what are you asking"],
        reply: "I think I want someone to tell me whether leaving was a decision or a failure. And, less grandly, whether a person who walks away from that kind of thing is employable. You can answer either.",
        rapportDelta: 0.06,
      },
    ],
    fallbackReplies: [
      "It is what it is. Tell me about your thing instead; I have been talking for an hour.",
      "That is a fair question and I do not have a tidy answer. Can we keep walking?",
      "Hm. I have thought about that so much I have stopped being able to see it. Ask me something smaller.",
      "I do not know. That is the honest answer, and I have been giving people tidier ones all week.",
    ],
    difficulty: 3,
    subskills: ["social.rapport", "social.listening", "social.ambiguity", "social.perspective"],
    estimatedMinutes: 9,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 4. The journalist                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-journalist-interview",
    title: "On the record",
    setting:
      "A cafe two doors from the old post office you are converting into a neighbourhood workspace, part-funded by a council grant. Ines Carvalho, a freelance journalist who writes for a regional paper and a national business weekly, asked for thirty minutes. She has a notebook, a phone recording, and a sharper idea of the piece than she has told you.",
    character: {
      name: "Ines Carvalho",
      role: "Freelance journalist writing a piece about your project",
      goal: "Get usable, attributable quotes from you for a piece whose angle is already set, without revealing the angle so early that you clam up.",
      knowledge: [
        "The piece was commissioned by the business weekly's features editor after Councillor Ade Okafor, who voted against the grant, complained publicly about 'public money for private landlords'.",
        "She has the grant application via a records request. The projected jobs figure changed from twelve in the first draft to thirty in the final one.",
        "She has already interviewed Councillor Okafor and two neighbours, one of whom is in favour of the project and one of whom worries about parking.",
        "Copy is due at noon tomorrow; the piece is nine hundred words and will run with a photograph of the building.",
        "Her working rule: everything is on the record unless agreed before it is said; she honours 'on background' and will not use a name if that is agreed first.",
        "The editor wants a named critic and a named beneficiary; if she cannot get a beneficiary to speak, the piece will lean on the critic.",
      ],
      privateMotivations: [
        "She once ran a small community arts group that lost its council grant to a better-connected applicant; she is watchful about council process and half-expects to find something.",
        "She thinks the project is probably good and would rather write that, but she needs you to give her the material to do it with.",
        "She needs this commission to lead to the next one; a piece with no beneficiary quotes is a weaker piece.",
      ],
      style:
        "Friendly, unhurried, precise. Asks short questions and lets silence do the work. Never bluffs about what she has; will say 'I cannot tell you that' rather than lie. Writes things down when you say something quotable, which you will notice.",
      constraints: [
        "Will not reveal the working headline unless asked directly about the angle.",
        "Will not name what documents she holds until asked plainly, and will not share them.",
        "Will not agree to approval of quotes before publication; will agree to check facts.",
      ],
      misconceptions: [
        "Assumes the jobs figure changed because someone inflated it for the grant panel; it could equally be a change of scope, and she has not asked.",
        "Assumes you already know the councillor has spoken to her, which you may not.",
      ],
    },
    objectives: [
      {
        id: "obj-angle",
        text: "Establish the angle of the piece and who commissioned it before you answer substantive questions.",
        requiresFacts: ["f-angle", "f-editor"],
      },
      {
        id: "obj-documents",
        text: "Find out what documents she holds and what in them she is asking about.",
        requiresFacts: ["f-document"],
      },
      {
        id: "obj-terms",
        text: "Agree the terms of the conversation: what is on the record and how attribution will work.",
        requiresFacts: ["f-record"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-angle",
        fact: "The working headline is about public money and who benefits. The piece was commissioned after Councillor Okafor's public complaint about the grant.",
        triggers: ["angle", "headline", "what is the piece", "story about", "framing", "focus"],
      },
      {
        id: "f-sources",
        fact: "She has interviewed Councillor Ade Okafor, who voted against the grant, and two neighbours: one supportive, one worried about parking.",
        triggers: ["who else", "spoken to", "sources", "interviewed", "talked to", "other people"],
      },
      {
        id: "f-deadline",
        fact: "Copy is due at noon tomorrow. Nine hundred words, with a photograph of the building.",
        triggers: ["deadline", "when does it run", "publish", "when will", "word count", "how long is the piece"],
      },
      {
        id: "f-document",
        fact: "She holds the grant application, obtained through a records request, and has noticed that the projected jobs figure changed from twelve to thirty between drafts.",
        triggers: ["document", "application", "records request", "foi", "paperwork", "jobs figure"],
        guarded: true,
      },
      {
        id: "f-record",
        fact: "Her rule is that everything is on the record unless agreed before it is said. She will honour 'on background' and will not attribute by name if that is agreed first. She will not offer quote approval; she will check facts.",
        triggers: ["off the record", "on the record", "background", "quote", "attribut", "not for publication"],
      },
      {
        id: "f-personal",
        fact: "She ran a community arts group that lost its council grant to a better-connected applicant. She is wary of council process for reasons of her own.",
        triggers: ["yourself", "why this story", "your background", "your interest", "personal", "what drew you"],
        guarded: true,
      },
      {
        id: "f-editor",
        fact: "The features editor wants a named critic and a named beneficiary. If no beneficiary will speak, the piece leans on the critic; that is the structural pressure on the interview.",
        triggers: ["editor", "commission", "who decides", "assigned", "desk", "brief"],
        guarded: true,
      },
    ],
    opening:
      "Thank you for doing this; I know a building site does not run itself. I am recording, if that is all right, so I quote you accurately. Shall we start with the simple thing: how did this project begin, and what is it for?",
    script: [
      {
        match: ["hello", "thanks for coming", "welcome", "of course", "happy to help", "coffee"],
        reply: "Thank you. I walked past the building on the way; the front is already better than the photograph the council used. So: the beginning.",
        rapportDelta: 0.08,
      },
      {
        match: ["hit piece", "biased", "already decided", "gotcha", "hatchet", "you've made up your mind", "stitch up"],
        reply: "I have not written a word yet, and I asked for this interview because I did not want to write one without you. If you would rather not talk, say so and I will note that you declined. I would rather you talked.",
        rapportDelta: -0.15,
      },
      {
        match: ["you think this is a scandal", "you obviously", "you clearly", "you people", "journalists always"],
        reply: "I would not put words in your mouth, and I would ask the same of you. What is the question?",
        rapportDelta: -0.08,
      },
      {
        match: ["what do you want to know", "what is this about", "tell me about the piece", "what are you writing", "why are we talking"],
        reply: "A piece about the project: what it is, who it is for, and how a disused post office got a council grant when the council is closing libraries. That last part is the news hook. The first two parts are why I wanted you.",
        rapportDelta: 0.03,
      },
      {
        match: ["angle", "headline", "story about", "framing", "focus", "what kind of piece"],
        reply: "Honest answer: the working headline is about public money and who benefits. It was commissioned after Councillor Okafor said his piece about private landlords. Headlines change when the reporting does; that is partly up to you.",
        reveals: ["f-angle"],
        rapportDelta: 0.05,
      },
      {
        match: ["who else", "spoken to", "sources", "interviewed", "talked to", "other people", "councillor"],
        reply: "Councillor Okafor, who voted against the grant, and two of your neighbours: one who thinks the project is the best thing to happen to the street in years and one who is worried about parking. I will not tell you which is which.",
        reveals: ["f-sources"],
        rapportDelta: 0.04,
      },
      {
        match: ["deadline", "when does it run", "publish", "when will", "word count", "how long is the piece", "filing"],
        reply: "I file at noon tomorrow; nine hundred words and a photograph of the building. That is why I am here today and not next week. If there is something you need to check before then, tell me now.",
        reveals: ["f-deadline"],
        rapportDelta: 0.03,
      },
      {
        match: ["document", "application", "records request", "foi", "paperwork", "what have you seen", "jobs figure", "numbers", "evidence"],
        reply: "I have the grant application; I requested it from the council. One thing I would like you to explain: the jobs figure is twelve in the first draft and thirty in the version the panel saw. There may be a good reason, and I would rather print it than guess.",
        reveals: ["f-document"],
        rapportDelta: 0.05,
      },
      {
        match: ["off the record", "on the record", "background", "quote", "attribut", "not for publication", "approve"],
        reply: "Everything is on the record unless we agree otherwise before you say it; I do not do retroactive. I will take things on background and not attach your name if we agree that first. I will check facts with you, but I will not send you the piece for approval.",
        reveals: ["f-record"],
        rapportDelta: 0.06,
      },
      {
        match: ["yourself", "why this story", "your background", "your interest", "personal", "what drew you"],
        reply: "I ran a community arts group for six years. We lost our council grant to an applicant with a better-connected trustee, and it closed. So I pay attention to how these decisions get made. It does not mean I think yours was made badly; it means I check.",
        reveals: ["f-personal"],
        rapportDelta: 0.08,
      },
      {
        match: ["editor", "commission", "who decides", "assigned", "desk", "brief", "who asked for"],
        reply: "The features editor at the weekly commissioned it. He wants a named critic and a named beneficiary. I have the critic. If I do not get a beneficiary who will speak on the record, the piece will be shaped by the one voice I have, and you can guess whose.",
        reveals: ["f-editor"],
        rapportDelta: 0.05,
      },
      {
        match: ["what do you mean by", "define", "which", "specifically", "clarify", "benefit"],
        reply: "By benefit I mean who ends up with money or an asset at the end. The building is leased, not owned by the community group, so the question is what the landlord gets and what the street gets. That is the thing I do not yet understand.",
        rapportDelta: 0.05,
      },
      {
        match: ["how long have you", "when did you start", "how did you come to", "how did this start", "tip"],
        reply: "Ten days. The councillor's remark ran in the local paper, the weekly's editor saw it, and I got the call. I requested the paperwork the same day; the council was faster than usual.",
        rapportDelta: 0.03,
      },
    ],
    fallbackReplies: [
      "That is not quite what I asked, but I will note it. Can we go back to the building?",
      "I would rather hear that in your words than paraphrase it. Say it again, slowly, and I will write it down.",
      "Understood. I will keep that for now. What I still need from you is something specific.",
      "I cannot tell you that. I can tell you what I am going to ask next, if that helps.",
      "Let me ask it differently, then.",
    ],
    difficulty: 4,
    subskills: ["social.incentive_recognition", "social.question_quality", "social.perspective", "inference.information_value"],
    estimatedMinutes: 10,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 5. The art dealer                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-dealer-provenance",
    title: "Attributed to",
    setting:
      "A first-floor gallery on a quiet street, late afternoon. Hélène Vasseur, dealer in nineteenth-century French painting, has hung a small beach scene, thirty by forty-five centimetres, on an easel under a lamp. The label says 'Attributed to Eugène Boudin, Trouville, c. 1880'. The price is not on the label. You are considering buying it and have half an hour of her attention.",
    character: {
      name: "Hélène Vasseur",
      role: "Dealer in nineteenth-century French painting",
      goal: "Sell the painting this month at close to the asking price, saying nothing untrue and volunteering nothing that is not asked.",
      knowledge: [
        "The painting is catalogued 'attributed to', not 'by'. It does not appear in Robert Schmit's catalogue raisonné of Boudin or its supplements; she holds a two-page letter from a retired curator who thinks it is autograph.",
        "The documented provenance runs from a Paris collector, recorded in a 1936 sale, then a gap until a Geneva private collection from 1951. She does not know how it travelled to Switzerland or who held it between.",
        "The canvas was relined in the 1970s; there is retouching in the upper sky, visible under ultraviolet, and a conservation report from 2019 describes it.",
        "The price is set at roughly forty percent of a fully accepted Boudin of similar size that sold at auction last year.",
        "She has checked the Art Loss Register, which returned no match. She has not checked the German Lost Art database or the French repertory of looted property.",
        "The painting was offered at a regional auction two years ago with a higher estimate and was bought in, meaning it did not sell.",
      ],
      privateMotivations: [
        "She does not own the painting; it is on consignment from a Geneva family who need money and want it sold quickly, and her commission depends on the price.",
        "She is personally fairly confident it is by Boudin, and slightly annoyed that the catalogue raisonné's gatekeeping makes her say 'attributed'.",
        "A gap that spans 1936 to 1951 is the kind of gap that ends careers when it goes wrong; she has priced that risk in, quietly, and hopes not to have to say so.",
      ],
      style:
        "Urbane, precise, occasionally sardonic. Speaks in complete sentences with the odd French word. Prefers 'one' to 'you'. Answers exactly the question asked and not the one behind it, unless she decides to trust you.",
      constraints: [
        "Will not say 'by Boudin' aloud; will say 'I believe it is right'.",
        "Will not name the consignor; will confirm she is not the owner if asked plainly.",
        "Will not offer the conservation report unprompted; will show it if asked.",
      ],
      misconceptions: [
        "Believes a clear Art Loss Register check is sufficient diligence for a 1936–1951 gap; it is a necessary start, not an end.",
        "Believes the retired curator's letter carries more weight in the market than it does; without the catalogue raisonné, it is an opinion.",
      ],
    },
    objectives: [
      {
        id: "obj-attribution",
        text: "Establish exactly what the attribution claims and what supports it.",
        requiresFacts: ["f-attribution"],
      },
      {
        id: "obj-provenance",
        text: "Identify the weakest point in the provenance and how far it has been checked.",
        requiresFacts: ["f-gap", "f-registry"],
      },
      {
        id: "obj-seller",
        text: "Learn who is selling and why now.",
        requiresFacts: ["f-consignment"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-attribution",
        fact: "The painting is not in the Schmit catalogue raisonné. Support for the attribution is a letter from a retired museum curator and the dealer's own eye. 'Attributed to' is the strongest wording she can defend.",
        triggers: ["attribut", "catalogue raisonné", "schmit", "authentic", "expert", "by boudin"],
      },
      {
        id: "f-gap",
        fact: "Provenance is documented to a Paris sale in 1936 and resumes with a Geneva collection in 1951. The fifteen years between, spanning the Occupation, are undocumented.",
        triggers: ["gap", "1936", "war", "occupation", "missing years", "provenance"],
      },
      {
        id: "f-condition",
        fact: "The canvas was relined in the 1970s and there is retouching in the upper sky, documented in a 2019 conservation report she holds.",
        triggers: ["condition", "restor", "relin", "retouch", "conservation", "ultraviolet"],
      },
      {
        id: "f-price-basis",
        fact: "The price is about forty percent of a comparable, fully accepted Boudin sold at auction last year. The discount is the attribution and the gap, priced in.",
        triggers: ["price", "how much", "comparable", "auction result", "valuation", "worth"],
      },
      {
        id: "f-consignment",
        fact: "She does not own the painting. It is consigned by a Geneva family who want a sale within the season; her commission is a percentage of the price.",
        triggers: ["own", "consign", "seller", "who is selling", "whose", "commission"],
        guarded: true,
      },
      {
        id: "f-registry",
        fact: "She has checked the Art Loss Register and it returned nothing. She has not checked the German Lost Art database or the French repertory of looted property, both of which would be normal for a 1936–1951 gap.",
        triggers: ["art loss register", "stolen", "lost art", "database", "restitution", "looted"],
      },
      {
        id: "f-bought-in",
        fact: "The painting was offered at a regional auction two years ago with a higher estimate and was bought in. That is why it is being sold privately now.",
        triggers: ["previously offered", "on the market", "bought in", "unsold", "auction before", "tried to sell"],
        guarded: true,
      },
    ],
    opening:
      "It is better in this light than in the photograph, which is the correct way round. Trouville, about 1880, the crowd on the sand and that sky he did better than anyone. I have hung it low so one can see the brushwork. Ask me whatever you like; I would rather a slow buyer than a fast regret.",
    script: [
      {
        match: ["hello", "good afternoon", "thank you for seeing me", "lovely", "beautiful", "it is very fine"],
        reply: "It is, and one so rarely gets to say so honestly. Take your time with it. The lamp is on a dimmer if you want to see it as it would be in a room.",
        rapportDelta: 0.08,
      },
      {
        match: ["fake", "forgery", "looted", "fraud", "stolen goods", "you know it isn't", "con"],
        reply: "I have been in this trade for twenty-six years and I do not sell what I do not believe in. If you have a specific concern about this picture, I will answer it. If you have a general suspicion of dealers, I cannot help you with that.",
        rapportDelta: -0.15,
      },
      {
        match: ["surely you", "you must know", "isn't it obvious", "don't you think it's", "admit it"],
        reply: "I would not like to guess what is obvious to you. Ask me the question and I will give you the answer I actually have.",
        rapportDelta: -0.08,
      },
      {
        match: ["tell me about the painting", "what can you tell me", "describe", "the picture", "who painted", "what is it"],
        reply: "A beach at Trouville, the fashionable crowd he painted through the 1860s and beyond, oil on canvas, thirty by forty-five. The handling of the sky is what one looks for, and it is here. The label says attributed, and I will explain that word whenever you ask.",
        rapportDelta: 0.03,
      },
      {
        match: ["attribut", "catalogue raisonné", "schmit", "authentic", "certif", "expert", "by boudin", "signed", "what does attributed mean"],
        reply: "'Attributed to' means I believe it is right and cannot yet prove it to the market's satisfaction. It is not in Schmit's catalogue raisonné, which for Boudin is the gate. I have a letter from a retired curator who has handled a good many Boudins and thinks it autograph. That is the whole of the case, and I will not make it sound larger.",
        reveals: ["f-attribution"],
        rapportDelta: 0.05,
      },
      {
        match: ["provenance", "gap", "1936", "1940s", "war", "occupation", "between", "missing years", "continuous", "who owned"],
        reply: "Documented to a Paris sale in 1936, then a Geneva private collection from 1951, and by descent since. Between those dates I have nothing. Fifteen years, and the wrong fifteen years; I will not pretend that is a small matter.",
        reveals: ["f-gap"],
        rapportDelta: 0.05,
      },
      {
        match: ["art loss register", "stolen", "lost art", "database", "checked", "registry", "claim", "restitution", "looted", "diligence"],
        reply: "The Art Loss Register returned nothing, and I have the certificate. I have not run it against the German Lost Art database or the French repertory of spoliated property; I ought to, and if you are serious I will do it before contracts. It costs little and I would rather know.",
        reveals: ["f-registry"],
        rapportDelta: 0.04,
      },
      {
        match: ["condition", "restor", "relin", "retouch", "conservation", "damage", "cleaned", "ultraviolet", "uv"],
        reply: "Relined in the seventies, which was the fashion and not a crime. Under ultraviolet there is retouching in the upper sky, perhaps five percent of the surface. The conservation report from 2019 is in the folder and you may read it here.",
        reveals: ["f-condition"],
        rapportDelta: 0.04,
      },
      {
        match: ["price", "how much", "comparable", "auction result", "valuation", "worth", "why that price", "discount"],
        reply: "A fully catalogued Boudin of this size and subject made a certain figure at auction last spring; this is priced at about forty percent of that. The difference is the word 'attributed' and the fifteen years, and I have not hidden either from the arithmetic.",
        reveals: ["f-price-basis"],
        rapportDelta: 0.03,
      },
      {
        match: ["own", "consign", "seller", "who is selling", "whose", "commission", "why selling", "why now"],
        reply: "It is not mine; I am selling it for a family in Geneva who would like it sold this season, for reasons that are theirs. I take a percentage. You may draw your own conclusions about how that shapes my patience, and I would draw them too.",
        reveals: ["f-consignment"],
        rapportDelta: 0.06,
      },
      {
        match: ["before", "previously offered", "on the market", "bought in", "unsold", "history of sale", "auction before", "tried to sell"],
        reply: "It was offered at a regional sale two years ago with an estimate I thought optimistic, and it was bought in. That is public, if one knows where to look. Unsold at auction is not a verdict on the picture, but it is a fact about the price, and it is why it is on my easel rather than under a hammer.",
        reveals: ["f-bought-in"],
        rapportDelta: 0.05,
      },
      {
        match: ["when", "date", "1880", "how do you know the date", "timeline", "how old", "when was it painted"],
        reply: "The costume and the handling put it around 1880; Boudin worked Trouville for decades, so the date is a judgement, not a document. The relining in the seventies and the Geneva collection from 1951 are documented. Everything before 1951 is a sale catalogue and a photograph.",
        rapportDelta: 0.03,
      },
      {
        match: ["what do you mean", "clarify", "define", "explain", "in plain terms"],
        reply: "Let me be plainer. There are three questions with any picture: is it what it says, where has it been, and what state is it in. I can answer the third completely, the second mostly, and the first with an opinion.",
        rapportDelta: 0.05,
      },
      {
        match: ["why should i", "why buy", "convince me", "what is the case"],
        reply: "I would not try to convince you; it goes badly with pictures. I would say that if Schmit's committee ever accepts it, one has bought a Boudin at forty percent, and if they never do, one has a very good painting of a beach. Whether that is a bet you want is not my question to answer.",
        rapportDelta: 0.03,
      },
    ],
    fallbackReplies: [
      "That is a question for the folder rather than for me; shall I fetch it?",
      "One could answer that in several ways and I would rather answer the one you mean. Ask it again, narrower.",
      "I do not know, and I have learned not to guess about pictures in front of buyers.",
      "Look at the sky for a moment before you ask that. It changes the question.",
      "That is not the sort of thing one says on an easel. Ask me what you actually want to know.",
    ],
    difficulty: 5,
    subskills: ["social.question_quality", "social.incentive_recognition", "social.ambiguity", "inference.information_value"],
    estimatedMinutes: 11,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 6. The diplomat                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-diplomat-statement",
    title: "Both sides regret",
    setting:
      "A small meeting room in a neutral embassy, a draft joint statement on the table with three bracketed phrases. Ten days ago a coast guard vessel of Counsellor Amara Diallo's country boarded two fishing boats from yours in disputed waters and detained the crews. You are negotiating the wording of the statement that lets both governments say the matter is closed. She has a red pen and a flight tomorrow evening.",
    character: {
      name: "Amara Diallo",
      role: "Counsellor and deputy head of mission, negotiating for her foreign ministry",
      goal: "Agree a statement her minister can read out before a parliamentary question on Tuesday, conceding nothing on the maritime boundary and appearing to win the release of the crews as a concession.",
      knowledge: [
        "Her side's account: the patrol vessel challenged the boats by radio at 04:10, received no response, and boarded at 05:30 after the boats moved further into the disputed zone.",
        "The phrase 'shared waters' is unacceptable because it could be cited in the pending boundary arbitration; 'the waters of the gulf' is acceptable and was cleared by her legal adviser.",
        "Unilateral 'regret' is impossible for her side; 'both sides regret the incident' has been pre-cleared by her capital.",
        "The detained crews are to be released on Friday whatever the statement says; the decision has been taken at ministerial level to avoid a court hearing.",
        "Her minister faces a parliamentary question on Tuesday and wants a signed statement before then; the timing is worth more to her side than any single word.",
        "Her coast guard would welcome a technical annex on a joint hotline for future incidents; the foreign ministry has not yet approved it but has not refused.",
      ],
      privateMotivations: [
        "Her instructions are a week old and give her more latitude than she is showing; she has been told to reach agreement, not to win.",
        "She is tired of the file and wants the annex, because it is the only part of the statement that will prevent the next incident.",
        "She would like to be seen in her capital as the person who closed this without drama, which argues for speed over triumph.",
      ],
      style:
        "Courteous, formal, unhurried. Refers to 'my authorities' and 'my capital'. Never says no; says 'that would be difficult'. Uses silence and the red pen. Warms noticeably when the other side shows it has read the draft.",
      constraints: [
        "Will not reveal that release is already decided unless rapport is high and the question is direct.",
        "Will not disclose the parliamentary timetable unless asked about her side's constraints.",
        "Will not discuss her instructions in detail; will confirm she has authority to sign once trust is established.",
      ],
      misconceptions: [
        "Believes the other side's main interest is the crews, when it may be the boundary language; she has not asked.",
        "Believes 'both sides regret' will read as balanced in your press; it may read as an admission by your side.",
      ],
    },
    objectives: [
      {
        id: "obj-redline",
        text: "Discover which phrase is the true red line and which is tradeable.",
        requiresFacts: ["f-redline", "f-regret"],
      },
      {
        id: "obj-clock",
        text: "Learn what she needs by when, and why.",
        requiresFacts: ["f-domestic"],
      },
      {
        id: "obj-annex",
        text: "Find a practical element both sides want that is not yet in the draft.",
        requiresFacts: ["f-annex"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-redline",
        fact: "'Shared waters' is the red line: it could be cited in the boundary arbitration. 'The waters of the gulf' is acceptable and already cleared by her legal adviser.",
        triggers: ["shared waters", "boundary", "wording", "phrase", "red line", "arbitration"],
      },
      {
        id: "f-regret",
        fact: "Unilateral regret is impossible for her side. 'Both sides regret the incident' has been pre-cleared by her capital and she can sign it today.",
        triggers: ["regret", "apolog", "sorry", "responsibility", "blame", "fault"],
      },
      {
        id: "f-crew",
        fact: "The crews will be released on Friday regardless of the statement; the decision was taken at ministerial level to avoid a court hearing. Her minister wants the release to look like a concession.",
        triggers: ["crew", "detain", "release", "sailors", "prisoners", "fishermen"],
        guarded: true,
      },
      {
        id: "f-domestic",
        fact: "Her minister faces a parliamentary question on Tuesday. A signed statement before then is worth more to her side than any single word in it.",
        triggers: ["minister", "parliament", "domestic", "political", "your capital", "by when"],
        guarded: true,
      },
      {
        id: "f-annex",
        fact: "Her coast guard wants a technical annex establishing a hotline and notification procedure for future incidents. The foreign ministry has not approved it, but she thinks it would be welcomed if the other side proposed it.",
        triggers: ["hotline", "patrol", "technical", "annex", "coast guard", "future incidents"],
      },
      {
        id: "f-instructions",
        fact: "Her instructions are a week old and instruct her to reach agreement. She has authority to sign a text containing 'both sides regret' and 'waters of the gulf' without referring back.",
        triggers: ["instructions", "authority", "mandate", "latitude", "authorised", "sign today"],
        guarded: true,
      },
      {
        id: "f-timeline",
        fact: "Her side's account of the incident: radio challenge at 04:10, no response, boats moved further into the disputed zone, boarding at 05:30. She concedes the radio frequency used is not one small fishing boats commonly monitor.",
        triggers: ["what happened", "sequence", "timeline", "incident", "radio", "boarded"],
      },
    ],
    opening:
      "Thank you for agreeing to a small room; large rooms produce large statements. We have three brackets left, which is fewer than we had on Monday. I would like to leave tomorrow evening with none. Which would you like to begin with?",
    script: [
      {
        match: ["thank you", "good morning", "good afternoon", "appreciate", "pleasure", "constructive", "we have read the draft"],
        reply: "You are kind. And you have read the draft, which places you ahead of several delegations I have met. Let us make use of that.",
        rapportDelta: 0.08,
      },
      {
        match: ["piracy", "illegal", "kidnap", "hostage", "outrage", "aggression", "you attacked", "violation"],
        reply: "I understand that language is in use in your press. It is not in use in this room, and if it were, my authorities would have to respond to it, which would not shorten our afternoon. Shall we return to the brackets?",
        rapportDelta: -0.15,
      },
      {
        match: ["surely you can", "you must accept", "you have no choice", "obviously you", "you will have to"],
        reply: "I would not wish to speculate about what I must do; my authorities are quite specific about it. Tell me what you are proposing and I will tell you whether it is difficult.",
        rapportDelta: -0.08,
      },
      {
        match: ["shared waters", "boundary", "wording", "phrase", "language", "acceptable", "red line", "cannot accept", "arbitration", "which bracket"],
        reply: "'Shared waters' would be difficult; I will be candid and say it would be impossible, because it would be quoted in the arbitration within the week. 'The waters of the gulf' describes the same sea without deciding whose it is. My legal adviser has already seen that phrase and did not reach for his pen.",
        reveals: ["f-redline"],
        rapportDelta: 0.06,
      },
      {
        match: ["regret", "apolog", "sorry", "responsibility", "blame", "fault", "concern"],
        reply: "A statement in which my side alone regrets is not a statement I could carry home. 'Both sides regret the incident' I can sign this afternoon; it has been read in my capital. Whether it reads well in yours is a question you know better than I do.",
        reveals: ["f-regret"],
        rapportDelta: 0.05,
      },
      {
        match: ["crew", "detain", "release", "sailors", "prisoners", "fishermen", "when will they be freed"],
        reply: "Between us, and I would prefer it stayed between us: the crews go home on Friday whatever we write. The decision was taken above my level to avoid a hearing. My minister would like the statement to make that look like a gift; you may decide how much that is worth to you.",
        reveals: ["f-crew"],
        rapportDelta: 0.08,
      },
      {
        match: ["minister", "parliament", "domestic", "political", "pressure", "at home", "your capital", "constraints", "by when", "why the hurry"],
        reply: "My minister takes a question in parliament on Tuesday. A signed text in her hand before then is worth more to us than any adjective in it. I tell you this because it is the kind of thing one finds out anyway, and I would rather you heard it from me.",
        reveals: ["f-domestic"],
        rapportDelta: 0.07,
      },
      {
        match: ["hotline", "patrol", "technical", "annex", "mechanism", "practical", "coast guard", "future incidents", "prevent", "next time"],
        reply: "Now that is a question I hoped someone would ask. Our coast guard has wanted a hotline and a notification procedure for two years. My ministry has not approved it, but it has not refused, and if the proposal came from your side I think it would be received warmly. It is the only part of any statement that would stop the next boarding.",
        reveals: ["f-annex"],
        rapportDelta: 0.08,
      },
      {
        match: ["instructions", "authority", "mandate", "latitude", "authorised", "can you agree", "decide", "refer back", "sign today"],
        reply: "I can sign a text with 'both sides regret' and 'the waters of the gulf' without going back to my capital. My instructions are a week old and they say to reach agreement. I have not been showing you all of that, for reasons you will understand.",
        reveals: ["f-instructions"],
        rapportDelta: 0.06,
      },
      {
        match: ["what happened", "sequence", "timeline", "incident", "that morning", "facts", "radio", "boarded"],
        reply: "Our account: a radio challenge at ten past four, no reply, the boats moved further into the zone, boarding at half past five. I will add, since you will find it in the log, that the frequency used is not one a small fishing boat commonly listens to. That is not in the statement and I would rather it were not.",
        reveals: ["f-timeline"],
        rapportDelta: 0.04,
      },
      {
        match: ["what do you mean", "define", "clarify", "difficult means", "specifically", "which word"],
        reply: "When I say difficult, I mean that I would have to telephone; when I say impossible, I mean that the telephone would not help. I try to use the two words carefully. Which phrase are you asking about?",
        rapportDelta: 0.05,
      },
      {
        match: ["why does your side", "what do you want", "what matters to you", "your interest", "priority"],
        reply: "In order: nothing that touches the arbitration, a text before Tuesday, and something that stops us meeting again in six months about the same boats. The order is deliberate.",
        rapportDelta: 0.05,
      },
      {
        match: ["what if we", "suppose", "hypothetically", "would you accept", "if we drop"],
        reply: "Put it on paper and I will read it as if it were the final text; that is the only way I can answer. Hypotheticals are cheap on both sides of this table.",
        rapportDelta: 0.02,
      },
    ],
    fallbackReplies: [
      "That is a matter on which my authorities have a view, and I would not wish to anticipate it.",
      "I note the point. Shall we return to the text?",
      "I would rather answer that with a draft than with an adjective. What are you proposing?",
      "That would be difficult. Not impossible; difficult. Ask me something more specific and I will tell you which.",
      "I am not certain I understand the question, which in my experience means it has two questions inside it.",
    ],
    difficulty: 6,
    subskills: ["social.incentive_recognition", "social.perspective", "social.ambiguity", "social.question_quality", "inference.information_value"],
    estimatedMinutes: 12,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 7. The hiring manager                                             */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-hiring-manager-concern",
    title: "Anything else you want to ask me",
    setting:
      "The last fifteen minutes of a second interview for a planning manager role at a regional logistics firm. Rosalind Achebe, director of operations, has finished her questions and has just said, 'That is everything from me. What would you like to ask?' You are the candidate. She is friendly, and she has not decided.",
    character: {
      name: "Rosalind Achebe",
      role: "Director of operations; the hiring manager",
      goal: "Decide whether you will stay at least two years and whether you can manage a team lead who wanted your job, without asking either question directly.",
      knowledge: [
        "Your CV shows three roles in four years. HR has advised her not to ask about tenure directly; she wants you to raise it.",
        "The previous holder of the role left after seven months, citing 'scope'; in practice the role had no budget authority and every decision went through her.",
        "The role now carries budget authority up to a set limit, changed after the previous exit; that is not in the job description because the description was written before the change.",
        "Dev Malhotra, the team lead, applied internally, was interviewed and was not appointed. He will report to whoever gets the job and has been told he was not appointed but not why.",
        "The firm needs someone in post before the October peak; she intends to decide by the end of next week and has one other candidate.",
        "Success at twelve months, in her mind: on-time delivery from 91 to 96 percent and keeping the two senior planners who are being courted by a competitor.",
      ],
      privateMotivations: [
        "Her own director questioned her judgement after the last hire; she cannot afford a second short tenure and is more risk-averse than she sounds.",
        "She likes you and is looking for a reason to stop worrying; she would rather you gave her one than that she had to invent it.",
        "She is slightly ashamed that Dev was not told why he was rejected, and does not want the new hire to inherit that conversation cold.",
      ],
      style:
        "Warm, direct, economical. Asks follow-ups that start with 'and then what happened'. Uses the candidate's own phrases back at them. Pauses before answering questions about the team.",
      constraints: [
        "Will not raise the tenure concern herself; will confirm it if the candidate names it.",
        "Will not disclose the other candidate's identity or strength.",
        "Will not badmouth the predecessor; will describe what changed after they left.",
      ],
      misconceptions: [
        "Assumes a candidate who moved three times was pushed or restless; two of the moves could have been the same company reorganising, and she has not asked.",
        "Assumes Dev will be difficult for the new manager; he might be relieved not to have the job.",
      ],
    },
    objectives: [
      {
        id: "obj-concern",
        text: "Surface the concern she has not stated.",
        requiresFacts: ["f-tenure"],
      },
      {
        id: "obj-why-open",
        text: "Understand why the role is open and what has changed about it since.",
        requiresFacts: ["f-predecessor", "f-budget"],
      },
      {
        id: "obj-process",
        text: "Learn how and when she will decide.",
        requiresFacts: ["f-timeline"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-tenure",
        fact: "Her unstated concern is your three roles in four years. HR told her not to ask about it directly; she is waiting for you to address it.",
        triggers: ["concern", "worried", "hesitat", "reservation", "tenure", "moved around"],
        guarded: true,
      },
      {
        id: "f-internal",
        fact: "Dev Malhotra, the team lead, applied for the role and was not appointed. He will report to the new hire and has not been told why he was turned down.",
        triggers: ["internal", "other candidates", "team lead", "report to me", "who applied", "dev"],
        guarded: true,
      },
      {
        id: "f-predecessor",
        fact: "The previous planning manager left after seven months, citing scope. The real problem was that the role had no budget authority and every decision came back to Rosalind.",
        triggers: ["predecessor", "previous", "before me", "why is the role open", "last person", "why did they leave"],
      },
      {
        id: "f-budget",
        fact: "The role now carries budget authority up to a set limit. This was changed after the previous exit and is not reflected in the job description.",
        triggers: ["budget", "authority", "sign off", "resources", "autonomy", "scope"],
      },
      {
        id: "f-timeline",
        fact: "She needs someone in post before the October peak, intends to decide by the end of next week, and has one other candidate at the same stage.",
        triggers: ["when", "decision", "timeline", "next steps", "start date", "how soon"],
      },
      {
        id: "f-her-stake",
        fact: "Her own director questioned her judgement after the last hire ended early. A second short tenure would be a problem for her personally.",
        triggers: ["for you", "your boss", "your director", "pressure on you", "stake for you", "risk to you"],
        guarded: true,
      },
      {
        id: "f-success",
        fact: "Success at twelve months: on-time delivery from 91 to 96 percent and no loss of the two senior planners, who are being courted by a competitor.",
        triggers: ["success", "measure", "first year", "twelve months", "what does good look like", "priorities"],
      },
    ],
    opening:
      "That is everything from me, and thank you; the warehouse example was useful. We have about fifteen minutes. What would you like to ask me? Anything at all, and I would rather the awkward ones than the polite ones.",
    script: [
      {
        match: ["thank you", "appreciate", "enjoyed", "good to meet", "thanks for your time", "interesting conversation"],
        reply: "Likewise. You asked better questions in the first interview than most people ask in the second, which is why you are here.",
        rapportDelta: 0.08,
      },
      {
        match: ["you don't trust", "you think i", "discriminat", "unfair", "you've already decided", "you're judging"],
        reply: "I have not decided anything; that is what the fifteen minutes are for. If there is something you think I am holding against you, name it and we can talk about it. I would rather that than guessing at each other.",
        rapportDelta: -0.12,
      },
      {
        match: ["you'd agree i'm", "surely i'm", "obviously i'm the", "i think we both know", "wouldn't you say i"],
        reply: "I would not say that yet, no. Ask me what you want to know and I will tell you where I am.",
        rapportDelta: -0.08,
      },
      {
        match: ["concern", "worried", "hesitat", "reservation", "doubt", "holding you back", "tenure", "moved around", "three jobs", "job hopping", "stay"],
        reply: "Since you ask: three roles in four years. I have been told not to ask about it, so I have not, and it has sat in the room the whole time. If you can tell me what each move was, I will listen properly. I need someone who is still here in two years.",
        reveals: ["f-tenure"],
        rapportDelta: 0.1,
      },
      {
        match: ["internal", "other candidates", "who else", "team lead", "report to me", "the team", "who applied", "dev"],
        reply: "Dev, the team lead, applied for this role. He was interviewed and not appointed; he will report to whoever gets it. He knows he did not get it and he has not been told why, which is something I should have done and have not. You should know that before you accept anything.",
        reveals: ["f-internal"],
        rapportDelta: 0.08,
      },
      {
        match: ["predecessor", "previous", "before me", "why is the role open", "why vacant", "last person", "who had the role", "why did they leave"],
        reply: "The last planning manager left after seven months and said it was about scope. She was not wrong. The role had no budget of its own, so every decision came back to me, and she was managing a team without being able to buy it a printer. That has changed, and I will tell you how if you ask.",
        reveals: ["f-predecessor"],
        rapportDelta: 0.05,
      },
      {
        match: ["budget", "authority", "decision", "sign off", "resources", "autonomy", "scope", "what can i decide"],
        reply: "The role now has budget authority up to a limit, which is new since the last exit and is not in the description you read, because the description was written before we changed it. Within that limit, you decide; above it, we decide together.",
        reveals: ["f-budget"],
        rapportDelta: 0.05,
      },
      {
        match: ["when", "decision", "timeline", "next steps", "start date", "how soon", "process"],
        reply: "I want someone in post before the October peak, which means a decision by the end of next week. There is one other candidate at this stage. You will hear from me, not from HR, either way.",
        reveals: ["f-timeline"],
        rapportDelta: 0.04,
      },
      {
        match: ["success", "measure", "expect", "first year", "12 months", "twelve months", "goals", "what does good look like", "priorities"],
        reply: "Two things. On-time delivery from ninety-one percent to ninety-six, which is hard but not heroic. And keeping the two senior planners, who are being courted by a competitor and who will decide within a month whether their new manager is worth staying for.",
        reveals: ["f-success"],
        rapportDelta: 0.05,
      },
      {
        match: ["for you", "your boss", "your director", "pressure on you", "your position", "stake for you", "risk to you", "what happens if"],
        reply: "Honestly? My director asked some pointed questions when the last hire left at seven months. If this one goes the same way, they will be asked of me, not of you. So I am more careful than I sound, and you should read the next week in that light.",
        reveals: ["f-her-stake"],
        rapportDelta: 0.08,
      },
      {
        match: ["what do you mean by", "define", "clarify", "specifically", "which", "how do you define"],
        reply: "Fair; let me be specific. By planning I mean the weekly load plan and the exceptions on the day, and by managing the team I mean five planners, two of them senior, one of them Dev. Which part did you want?",
        rapportDelta: 0.05,
      },
      {
        match: ["why do you", "what made you", "how long have you been here", "your career", "why this company"],
        reply: "Eleven years, three roles, all here, which I mention because it is the opposite of your CV and I am aware of that. I stayed because the problems kept changing. Ask me about the peak and I will show you what I mean.",
        rapportDelta: 0.04,
      },
      {
        match: ["feedback", "first interview", "panel", "what did they say", "how did i do", "impression"],
        reply: "The panel liked your process answers and wrote 'strong on method' twice. One of them wrote a question mark next to the CV and did not say what it meant. I know what it meant. I would like to hear you answer it before I answer it for you.",
        reveals: ["f-tenure"],
        rapportDelta: 0.05,
      },
    ],
    fallbackReplies: [
      "That is a fair question and I want to give you a real answer rather than a brochure one. Can you narrow it?",
      "I would rather not guess at that. What is the thing behind the question?",
      "Hm. Ask me that again in a way that lets me be specific.",
      "You can ask me that after you have the offer; for now, ask me the thing you are actually worried about.",
    ],
    difficulty: 4,
    subskills: ["social.perspective", "social.ambiguity", "social.question_quality", "social.rapport", "inference.information_value"],
    estimatedMinutes: 9,
    origin: "seeded",
  },

  /* ---------------------------------------------------------------- */
  /* 8. The difficult customer                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "sal-customer-table",
    title: "The finish is wrong",
    setting:
      "The showroom telephone at a small bespoke furniture workshop, Tuesday morning. Callum Reyes took delivery of an oak dining table on Saturday, a commission worth several months of the workshop's turnover. He has telephoned twice, emailed once, and is now calling a third time to say the finish is wrong and there is a mark. You run the workshop and have picked up.",
    character: {
      name: "Callum Reyes",
      role: "Customer who commissioned a dining table delivered four days ago",
      goal: "Get the workshop to take the table back and refund at least part of the price, without saying what the real problem is.",
      knowledge: [
        "The table matches the finish sample he approved in the workshop; in his dining room, which faces north, it reads darker than he expected.",
        "The table is 2.4 metres long; the room allows chairs at the ends to be pulled out only if the sideboard is moved. He gave the measurement and signed the drawing.",
        "The mark is a pale ring near one end; it appeared on Sunday morning after a dinner on Saturday night. He suspects the finish is at fault.",
        "His partner Sasha wanted to commission a different maker; he insisted on this workshop, and Sasha has said nothing about the table, which is worse than a complaint.",
        "A roof repair quote arrived on Monday for a sum close to the table's price. A partial refund would matter more to him now than a fix.",
        "The delivery crew were an hour late and left the packaging in the hall; it was the first thing that went wrong and it coloured the rest.",
      ],
      privateMotivations: [
        "He is embarrassed that the table does not fit the room the way he told Sasha it would, and that the measurement was his.",
        "He needs money for the roof and cannot say so; a complaint about the finish feels like a legitimate way to open the door to a refund.",
        "He wants to be treated as a serious person, not as a difficult customer, and escalates when he feels handled.",
      ],
      style:
        "Clipped, formal, prepared; has notes. Escalates when he hears policy language or a scripted apology. Softens noticeably when asked a real question about the room. Says 'I would have thought' when annoyed.",
      constraints: [
        "Will not admit the measurement was his unless the conversation has become collaborative.",
        "Will not mention the roof or money unless asked directly what resolution he wants, and then only if he feels respected.",
        "Will not lie about when the mark appeared if asked precisely.",
      ],
      misconceptions: [
        "Believes a pale ring from a hot dish is evidence of a faulty finish; on an oiled oak surface it is a known and usually repairable heat mark.",
        "Believes the workshop will refuse anything short of a full-price defence, so he has prepared for a fight that may not be necessary.",
      ],
    },
    objectives: [
      {
        id: "obj-real-problem",
        text: "Identify the problem underneath the complaint.",
        requiresFacts: ["f-fit", "f-measure"],
      },
      {
        id: "obj-resolution",
        text: "Discover what resolution he actually wants.",
        requiresFacts: ["f-money"],
      },
      {
        id: "obj-mark",
        text: "Establish when and how the mark appeared.",
        requiresFacts: ["f-mark"],
      },
    ],
    hiddenFacts: [
      {
        id: "f-fit",
        fact: "The table is too long for the room as furnished: the chairs at the ends cannot be pulled out without moving the sideboard.",
        triggers: ["fit", "space", "the room", "size", "length", "chairs"],
      },
      {
        id: "f-measure",
        fact: "He supplied the room measurement himself and signed off the drawing showing 2.4 metres. He knows this.",
        triggers: ["drawing", "sign off", "signed", "approved", "who measured", "spec"],
        guarded: true,
      },
      {
        id: "f-mark",
        fact: "The pale ring appeared on Sunday morning after a dinner on Saturday night; something hot or wet stood on the table. He suspects the finish rather than the dish.",
        triggers: ["mark", "stain", "ring", "when did", "noticed", "appeared"],
      },
      {
        id: "f-partner",
        fact: "His partner Sasha wanted a different maker. He pushed for this workshop, and Sasha's silence about the table is what he is really reacting to.",
        triggers: ["partner", "sasha", "household", "who chose", "at home", "anyone else"],
        guarded: true,
      },
      {
        id: "f-money",
        fact: "He would rather have a partial refund than a repair. A roof repair quote arrived on Monday for a sum close to the table's price.",
        triggers: ["refund", "money", "what would make", "resolution", "what do you want", "put this right"],
        guarded: true,
      },
      {
        id: "f-finish",
        fact: "The finish matches the sample he approved in the workshop. His dining room faces north and the oak reads darker there than it did under the workshop lights.",
        triggers: ["sample", "finish", "colour", "color", "dark", "north"],
      },
      {
        id: "f-delivery",
        fact: "The delivery crew were an hour late and left the packaging in the hall. It was the first thing that went wrong on Saturday and set the tone.",
        triggers: ["delivery", "crew", "arrived", "packaging", "late", "saturday"],
      },
    ],
    opening:
      "Good, a person at last. This is Callum Reyes, the oak table, delivered Saturday. I have emailed and called twice. The finish is not what we agreed, there is a mark on it already, and I would have thought a workshop at your prices would have called me back by now. What are you going to do about it?",
    script: [
      {
        match: ["i'm sorry you", "apologise", "thank you for calling", "glad you rang", "i'm glad", "you're right to call"],
        reply: "Well. That is a better start than the voicemail. Go on.",
        rapportDelta: 0.08,
      },
      {
        match: ["your fault", "you signed", "you approved", "you measured", "not our problem", "policy", "terms and conditions", "as per"],
        reply: "I would have thought you would at least look at it before quoting terms at me. I have a table I cannot use and a mark on it after four days. If this is going to be a conversation about policy, tell me now and I will have it with someone else.",
        rapportDelta: -0.15,
      },
      {
        match: ["surely you", "you must have", "obviously you", "i assume you", "don't tell me you"],
        reply: "You can assume what you like. I am telling you what is in my dining room.",
        rapportDelta: -0.08,
      },
      {
        match: ["tell me what happened", "talk me through", "from the beginning", "what's wrong", "describe", "help me understand"],
        reply: "Saturday: it arrives late, they leave the boxes in my hall, and when it is in the room it is darker than the piece we looked at in your workshop. Sunday morning there is a pale ring near one end. That is what happened. I have photographs.",
        reveals: ["f-delivery"],
        rapportDelta: 0.05,
      },
      {
        match: ["sample", "finish", "colour", "color", "dark", "match", "light", "north", "compare"],
        reply: "I have put the sample next to it. In daylight, yes, it is the same colour; I am not blind. But the room faces north and the table reads two shades darker than anything we discussed, and I was relying on you to know that.",
        reveals: ["f-finish"],
        rapportDelta: 0.04,
      },
      {
        match: ["mark", "stain", "ring", "damage", "when did", "noticed", "scratch", "appeared", "first see"],
        reply: "Sunday morning. We had people over Saturday night, and I noticed it when I was clearing up. A pale ring, about the size of a serving dish. I am not saying I know what caused it; I am saying a finish that marks after one dinner is not a finish.",
        reveals: ["f-mark"],
        rapportDelta: 0.04,
      },
      {
        match: ["fit", "space", "the room", "size", "length", "dimensions", "chairs", "how does it sit"],
        reply: "Since you ask. It is bigger in the room than it was in the workshop, which I know is what everyone says. The chairs at the ends do not come out unless we move the sideboard. So it is a table for six that seats four, in a room I told everyone would take eight.",
        reveals: ["f-fit"],
        rapportDelta: 0.06,
      },
      {
        match: ["drawing", "sign off", "signed", "approved", "confirm", "who measured", "specification", "spec", "2.4"],
        reply: "Yes, I measured it, and yes, I signed the drawing. I measured wall to wall and forgot the sideboard, and I have known that since about ten past two on Saturday. I would rather you had asked me that than told me.",
        reveals: ["f-measure"],
        rapportDelta: 0.06,
      },
      {
        match: ["partner", "sasha", "household", "who chose", "at home", "anyone else", "family"],
        reply: "Sasha wanted the other workshop, the one in the city. I said yours was better and I was the one who pushed. Sasha has not said a word about the table since Saturday, which I am sure you can imagine is not the same as approval.",
        reveals: ["f-partner"],
        rapportDelta: 0.06,
      },
      {
        match: ["refund", "money", "cost", "what would make", "resolution", "what do you want", "outcome", "compensation", "put this right", "ideal"],
        reply: "If I am honest, I do not want you to send someone to polish it. I want you to take some of the price back, because something else has come up at the house and I cannot afford both. I know that is not your problem. I was hoping the finish would make it your problem.",
        reveals: ["f-money"],
        rapportDelta: 0.08,
      },
      {
        match: ["delivery", "crew", "install", "arrived", "packaging", "late", "saturday", "how did it go"],
        reply: "An hour late, no call, and they left the packaging in my hall for me to deal with. It is a small thing and I know it is a small thing. It was also the first thing, and the day did not improve.",
        reveals: ["f-delivery"],
        rapportDelta: 0.03,
      },
      {
        match: ["what do you mean", "which end", "clarify", "specifically", "can you describe", "how large"],
        reply: "The ring is at the end nearest the window, about fifteen centimetres across, paler than the surrounding wood, no texture to it. The darkness is across the whole top. Do you want the photographs?",
        rapportDelta: 0.05,
      },
      {
        match: ["what have you tried", "have you", "did you", "hot", "dish", "wet", "cloth"],
        reply: "There was a serving dish on that end of the table, yes, on a mat. If you are about to tell me the mat was not thick enough, I would rather you told me how to get the ring out first.",
        rapportDelta: 0.03,
      },
      {
        match: ["options", "we could", "what if we", "would it help", "repair", "come and look", "visit"],
        reply: "Come and look, by all means. But I want you to understand before you get in the van that I may not want the thing fixed. Ask me why when you are here, not now.",
        rapportDelta: 0.04,
      },
    ],
    fallbackReplies: [
      "That is not what I asked. I asked what you are going to do.",
      "I have the photographs and the drawing in front of me. Ask me something I can answer from them.",
      "I would have thought that was obvious from the email. Which part do you want me to repeat?",
      "I am not trying to be difficult. I am trying to get a straight answer, and so far I have had a voicemail.",
      "Ask me a specific question and you will get a specific answer.",
    ],
    difficulty: 3,
    subskills: ["social.listening", "social.ambiguity", "social.perspective", "social.rapport", "social.incentive_recognition"],
    estimatedMinutes: 8,
    origin: "seeded",
  },
];
