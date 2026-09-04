import type { CaseDefinition } from "@/lib/domain/types";

/**
 * Cases 0106–0110.
 *
 * Five multi-stage cases: a train-station disruption with conflicting announcements
 * (procedural scene), a lease renewal whose stated reason does not fit its timeline,
 * an art dealer's provenance sheet, a student society's budget shortfall, and a
 * "miracle" productivity result reported in the press.
 *
 * All people, companies and paintings are fictional. Historical and technical facts
 * (four-track Padova–Mestre section, Le Havre bombing of September 1944, pigment
 * chronology, the Washington Principles, the Art Loss Register) are accurate.
 */
export const CASES_B: CaseDefinition[] = [
  /* ------------------------------------------------------------------ */
  /* 0106 · The Padova Stop                                              */
  /* ------------------------------------------------------------------ */
  {
    id: "case-0106-padova-stop",
    number: "0106",
    title: "The Padova Stop",
    setting: "Regionale Veloce 2247, Bologna to Venice, held at Padova on a Thursday evening in late October.",
    summary:
      "Three sources tell you three different things about whether your train will reach Venice. Only one of them is describing your train.",
    difficulty: 3,
    estimatedMinutes: 18,
    faculties: ["observation", "inference", "social", "composure"],
    subskills: [
      "observation.detail",
      "observation.separation",
      "inference.hypothesis",
      "inference.alternatives",
      "inference.information_value",
      "inference.updating",
      "social.question_quality",
      "composure.ambiguity",
    ],
    conceptLinks: ["bayes-theorem", "falsifiability"],
    safetyTags: ["fictional-people", "no-body-language", "no-protected-characteristics"],
    origin: "seeded",
    tags: ["travel", "conflicting-sources", "scene", "ask-first"],
    groundTruth:
      "A signalling failure closed the two conventional-line tracks between Padova and Venezia Mestre. Regional stopping services on that line were suspended and replaced by buses; the station's recorded announcement described those services. Long-distance trains and fast regionals were routed over the parallel high-speed tracks with delays of twenty to forty minutes. The board's cancelled train was REG 2233, not RV 2247. The app was showing a scheduled state it had not updated. RV 2247 left Padova at 19:02 and arrived at Venezia Santa Lucia at 19:36. The conductor knew all of this from 18:41; nobody in the carriage asked her.",
    stages: [
      {
        id: "case-0106-enter",
        kind: "enter",
        title: "A stopped train",
        setting: "Carriage 4, window seat, Regionale Veloce 2247. Padova, platform 3. 18:31.",
        narrative:
          "You have a dinner in Venice at 20:00 that took three months to arrange. The train stopped at Padova on time at 18:25 and has not moved since. The doors are open. The carriage has gone quiet in the particular way of thirty people checking their phones at once. You have perhaps fifteen minutes to make a decision that will either get you there or not.",
      },
      {
        id: "case-0106-notice",
        kind: "notice",
        title: "Look, then read",
        narrative:
          "First, thirty seconds on the compartment around you. Then the log of everything you have heard and seen since the stop, exactly as it came, in order:\n\n— 18:25 RV 2247 arrives Padova, platform 3, on time. Scheduled departure 18:27.\n— 18:31 On-board announcement, the conductor's voice: 'Sosta prolungata per motivi operativi. Ci scusiamo.' (Extended stop for operational reasons. We apologise.)\n— 18:33 Station PA, recorded voice, Italian then English: 'Due to a signalling failure between Padova and Venezia Mestre, regional services to Venezia are suspended. Passengers are invited to use the replacement bus service from Piazzale Stazione.'\n— 18:34 Trenitalia app, train 2247: 'In orario. Arrivo previsto Venezia S. Lucia 18:58.'\n— 18:36 Platform board, visible through the window, top two lines: '18:40 VENEZIA S. LUCIA · REG 2233 · CANCELLATO' and '18:52 VENEZIA MESTRE · REG 2239 · RITARDO 25'.\n— 18:37 Roughly a third of the passengers in your carriage collect their bags and leave.\n— 18:38 Station PA repeats the 18:33 message, word for word.\n— 18:39 The conductor walks through towards the rear, radio at her ear, and says to no one in particular: 'Aspettiamo il via libera.' (We're waiting for clearance.)\n— 18:40 The doors are still open.",
        material: {
          kind: "scene",
          scene: { template: "train-compartment", seed: 7731 },
          title: "Carriage 4, Regionale Veloce 2247",
          seconds: 30,
        },
        subskills: ["observation.detail", "observation.spatial", "observation.text"],
      },
      {
        id: "case-0106-recall",
        kind: "recall",
        title: "What was there",
        narrative: "The compartment first. The questions come from the scene you were shown; answer only what you saw.",
        questions: [],
        subskills: ["observation.detail", "observation.spatial", "observation.precision", "memory.recall"],
      },
      {
        id: "case-0106-separate",
        kind: "separate",
        title: "What you know and what you have decided",
        narrative: "Nine minutes of announcements. Sort what they actually established from what you have filled in.",
        statements: [
          {
            id: "s1",
            text: "The platform board shows REG 2233, the 18:40 to Venezia Santa Lucia, as cancelled.",
            truth: "observation",
            why: "That is what the board said. It says nothing about RV 2247.",
          },
          {
            id: "s2",
            text: "Your train has been cancelled.",
            truth: "inference",
            why: "No source has said so. The board cancelled a different train, the PA spoke about regional services generically, and the conductor said she is waiting for clearance, which is what you say about a train that is expected to move.",
          },
          {
            id: "s3",
            text: "The station announcement at 18:38 was identical to the one at 18:33.",
            truth: "observation",
            why: "Word for word, on a recorded voice. A recording repeating on a loop is a bulletin, not a live update about your situation.",
          },
          {
            id: "s4",
            text: "The app's 'in orario' means the railway expects 2247 to run on time.",
            truth: "inference",
            why: "The app said on time at 18:34 for a train that had already been stationary for seven minutes past its departure. The likelier reading is that the app has not been updated, which tells you about the app, not about the train.",
          },
          {
            id: "s5",
            text: "The people who left the carriage know something you do not.",
            truth: "unknown",
            why: "They heard the same PA you did. Some may have been on a stopping service's ticket, some may simply be nearer the bus, some may be guessing. You cannot tell from watching them leave.",
          },
          {
            id: "s6",
            text: "The conductor said the train is waiting for clearance.",
            truth: "observation",
            why: "Her words, at 18:39, radio at her ear. What 'clearance' means here is the question worth asking.",
          },
          {
            id: "s7",
            text: "The signalling failure affects every train between Padova and Mestre.",
            truth: "unknown",
            why: "The PA said regional services are suspended. Whether the failure covers all tracks on the section or only some is not stated. The Padova–Mestre section has four tracks; a failure can affect a pair.",
          },
          {
            id: "s8",
            text: "Taking the replacement bus would get you to Venice sooner than staying on the train.",
            truth: "inference",
            why: "You do not know when the bus leaves, how long it takes into Piazzale Roma, or when 2247 will move. It is a guess dressed as a plan.",
          },
        ],
        subskills: ["observation.separation", "inference.evidence_weighting"],
      },
      {
        id: "case-0106-hypotheses",
        kind: "hypotheses",
        title: "What could be going on",
        narrative:
          "Give at least two explanations that account for all four sources — the on-board announcement, the recorded PA, the app and the board — not just the loudest one.",
        rubric: {
          minimum: 2,
          plausible: [
            {
              title: "Full closure — your train is cancelled",
              keywords: ["cancelled", "cancellato", "line closed", "suspended", "replacement bus", "buses", "closed", "not running"],
              note: "The reading the PA and the board invite at first glance. It has to explain why the board cancelled a different train and why the conductor is waiting for clearance rather than emptying the train.",
            },
            {
              title: "Partial failure — some tracks affected, your train waiting for a path",
              keywords: ["signal", "signalling", "one track", "some tracks", "other tracks", "fast line", "fast tracks", "waiting", "clearance", "path", "diverted", "rerouted", "reroute", "four tracks", "partial"],
              note: "Padova–Mestre is a four-track section. A failure on the conventional pair suspends stopping services while long-distance and fast regionals queue for the other pair. 'Aspettiamo il via libera' fits this exactly.",
            },
            {
              title: "Stale or generic information — the PA and the app are not describing your train",
              keywords: ["stale", "not updated", "out of date", "outdated", "generic", "recorded", "automatic", "pre-recorded", "loop", "different train", "not about", "old information", "app lag"],
              note: "The PA is a recording that repeats; the app reported 'on time' for a train visibly not on time. Neither is a statement about 2247 by anyone who knows.",
            },
            {
              title: "A problem on board 2247 itself",
              keywords: ["technical", "fault", "crew", "driver", "door", "on-board", "onboard", "mechanical", "brake", "operational", "the train itself"],
              note: "'Motivi operativi' is what railways say for many things, including a crew change or a fault. Less likely given the PA's signalling message, but not excluded by anything you have heard.",
            },
          ],
        },
        subskills: ["inference.hypothesis", "inference.alternatives"],
      },
      {
        id: "case-0106-question",
        kind: "question",
        title: "The conductor is passing",
        narrative:
          "She is walking back through the carriage, radio still at her ear. You get one question before she is gone. Which one?",
        allowFreeQuestion: true,
        questionOptions: [
          {
            id: "q1",
            text: "Is this train cancelled?",
            informationValue: 0.3,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "Closed, and answerable with a 'no' that tells you nothing about when you will move or by which route. She may also not know yet, in which case you have spent your question on a shrug.",
          },
          {
            id: "q2",
            text: "Which trains does the signalling failure affect — regional only, or everything through Mestre?",
            informationValue: 0.85,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "This is the question the sources disagree about. Her answer separates the PA (regional services) from your train (a fast regional) and tells you whether a path exists.",
          },
          {
            id: "q3",
            text: "You're going to send us to the buses, aren't you?",
            informationValue: 0.2,
            rapportCost: 0.45,
            leading: true,
            feedback:
              "Leading, faintly accusatory, and it invites a reflexive 'no, no' from someone who is busy. You have told her what you expect; she has told you nothing.",
          },
          {
            id: "q4",
            text: "I need to be at Santa Lucia by 19:45. What would you do?",
            informationValue: 0.7,
            rapportCost: 0.05,
            leading: false,
            feedback:
              "Open, specific, and it asks for her private judgement rather than an official line. Conductors know things they will not announce. Slightly lower value than the direct question only because her answer bundles the facts with her advice.",
          },
          {
            id: "q5",
            text: "What does 'operational reasons' mean this time?",
            informationValue: 0.5,
            rapportCost: 0.15,
            leading: false,
            feedback:
              "Gets you the category of the problem, which is useful. It does not by itself get you the thing you need, which is whether 2247 has a route tonight.",
          },
        ],
        subskills: ["social.question_quality", "inference.information_value"],
      },
      {
        id: "case-0106-evidence",
        kind: "evidence",
        title: "A second look at the board",
        narrative: "Before she can answer, the radio crackles and she raises a hand — un attimo — and steps into the vestibule. You look out of the window again.",
        reveal: {
          title: "18:44",
          text:
            "The board has refreshed. The cancelled service is still REG 2233, the 18:40 stopping train. Your train, RV 2247, is not on the platform board at all — it is already 'in station'. Below the cancelled line, REG 2239 has moved from 'ritardo 25' to 'ritardo 40'. At 18:44 a Frecciarossa passes through on the far track without stopping, heading east towards Venice. The recorded PA plays a third time, unchanged.",
          undermines: ["Full closure — your train is cancelled"],
          supports: ["Partial failure — some tracks affected, your train waiting for a path", "Stale or generic information — the PA and the app are not describing your train"],
        },
        subskills: ["observation.anomaly", "inference.evidence_weighting"],
      },
      {
        id: "case-0106-update",
        kind: "update",
        title: "Where you stand now",
        updatePrompt:
          "Before the second look, how confident were you that 2247 would not reach Venice tonight? Set it again now. A train has just passed eastward; a different train is still cancelled; nobody has told you anything about yours.",
        subskills: ["inference.updating", "calibration.confidence"],
      },
      {
        id: "case-0106-decision",
        kind: "decision",
        title: "Fifteen minutes",
        narrative: "It is 18:45. The doors are open. The conductor is in the vestibule, radio down. The bus stop is a four-minute walk.",
        decisionOptions: [
          {
            id: "d1",
            text: "Leave now for the replacement bus. Buses are certain; this train is not.",
            quality: 0.25,
            errorType: "PREMATURE_CLOSURE",
            feedback:
              "The bus exists for passengers of the cancelled stopping services. Into Piazzale Roma it is an hour on a good evening, and you would be trading a seat on a train that has a plausible path for a certainty that is not actually certain. You decided before the one person who knows had spoken.",
          },
          {
            id: "d2",
            text: "Stay in your seat. The app says on time.",
            quality: 0.35,
            errorType: "ASSUMPTION",
            feedback:
              "Staying may well be right, but not for this reason: the app is demonstrably stale. You would sit for twenty minutes learning nothing while the alternative closes, and if the train is then cancelled you will have missed both.",
          },
          {
            id: "d3",
            text: "Step to the vestibule and ask the conductor the one specific question — which services the failure affects, and whether 2247 has a route tonight — then decide.",
            quality: 0.95,
            feedback:
              "The sources conflict because they describe different things. The conductor is the only channel that reaches the dispatcher, the question costs forty seconds, and the answer settles nearly everything. Acting first was never the strong move here.",
          },
          {
            id: "d4",
            text: "Get off, read the full board and ask at the station information desk.",
            quality: 0.5,
            errorType: "INFORMATION_VALUE",
            feedback:
              "Not wrong, but the desk knows about the station's services; the conductor knows about your train. You also give up your seat and risk the doors closing while you queue. Lower information for a higher price than the question ten feet away.",
          },
        ],
        subskills: ["inference.information_value", "composure.ambiguity", "strategy.optionality"],
      },
      {
        id: "case-0106-explain",
        kind: "explain",
        title: "Say what happened",
        explainPrompt:
          "In four sentences: what were the three sources actually disagreeing about, and what was the single fact that would have resolved it?",
        subskills: ["rhetoric.clarity", "rhetoric.precision"],
      },
      {
        id: "case-0106-debrief",
        kind: "debrief",
        title: "Debrief",
        expertReasoning:
          "The PA, the app and the board were not contradicting each other about the same object. The PA was a recording about regional stopping services on the failed line. The app was reporting a scheduled state it had not refreshed. The board was cancelling a different train. Each was a partial truth from a separate system, and the passengers who left were acting on the loudest one. The conductor's 'we are waiting for clearance' was the only sentence spoken by someone with live information, and it described a train that is expected to move. The Frecciarossa passing eastward was the physical fact that a route existed. From there the value of one specific question was obvious: it cost nothing, it could not be answered by the recording, and it distinguished between the hypotheses. The error most people made was not a bad inference but a skipped step — deciding while the person who knew was walking past.",
        keyInsight:
          "When sources conflict, first ask whether they are describing the same thing. Often they are not, and the cheapest move is a question to whoever actually is.",
        subskills: ["inference.updating", "synthesis.integration"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 0107 · The Insurance Reason                                         */
  /* ------------------------------------------------------------------ */
  {
    id: "case-0107-insurance-reason",
    number: "0107",
    title: "The Insurance Reason",
    setting: "A ground-floor picture-framing workshop at 14 Cranbourne Street, six years into a lease that ends on 30 September.",
    summary:
      "Your landlord wants 22 per cent more and blames an insurance premium that doubled after a flood. The dates in the thread do not agree with him. That is not the same as him lying.",
    difficulty: 4,
    estimatedMinutes: 24,
    faculties: ["observation", "inference", "strategy", "social"],
    subskills: [
      "observation.text",
      "observation.chronology",
      "observation.separation",
      "inference.alternatives",
      "inference.evidence_weighting",
      "strategy.negotiation",
      "strategy.incentives",
      "social.question_quality",
      "quantitative.arithmetic",
    ],
    conceptLinks: ["game-theory", "english-auction"],
    safetyTags: ["fictional-people", "no-protected-characteristics"],
    origin: "seeded",
    tags: ["negotiation", "timeline", "business", "lease"],
    groundTruth:
      "The insurer reclassified the postcode's surface-water flood risk in January and warned Moore on 12 January that the 1 April renewal would come in near £7,300. The March flood did not cause the increase; it made it vivid, and Moore compressed the story. Unit B's floor-area share of the £3,200 rise is about £990 a year, roughly £83 a month, against the £220 a month he asked for. The remainder was market pressure: a coffee chain surveyed the unit in February and indicated it would pay about £1,350 a month, but wanted a nine-month fit-out at reduced rent and had signed nothing. Moore preferred a known tenant at a lower figure to a chain with a void. Priya's 9 per cent reflected a smaller floor-area share and a lease that had been re-based two years earlier. A counter at £1,100 a month with a documented insurance pass-through and a five-year term closed in June.",
    stages: [
      {
        id: "case-0107-enter",
        kind: "enter",
        title: "Twenty-two per cent",
        setting: "Your workbench, late May, the renewal thread open on a laptop between two half-cut mounts.",
        narrative:
          "Six years ago you took the ground-floor unit at 14 Cranbourne Street because of the north light and the loading door. The fit-out — bench, guillotine, the flat files — is yours and would not survive a move intact. The lease ends on 30 September. Declan Moore, who owns the building, wants an answer by the end of the month and has given a reason for the number. You have a meeting with him on Thursday.",
      },
      {
        id: "case-0107-notice",
        kind: "notice",
        title: "The thread",
        narrative: "Read it once, carefully. Dates matter more than tone.",
        material: {
          kind: "thread",
          title: "Renewal — 14 Cranbourne St, Unit B",
          seconds: 40,
          lines: [
            "14 Jan · Declan Moore: Wanted to flag early that the renewal from 1 October will need to reflect building costs, which have moved a lot. Let's talk properly in the spring.",
            "3 Feb · You: Happy to talk. Which costs? Rates and the service charge were flat last year.",
            "20 Feb · Declan Moore: Insurance mainly. I'll send the detail when I have it.",
            "11 Mar · Declan Moore: Pump's done, basement of No. 14 dried out by Friday. Your unit unaffected. Sorry for the noise.",
            "22 Apr · Declan Moore: Insurer has doubled the premium after the March flood. Renewal will need to be £1,220 a month from 1 October on a three-year term. Not my choice, sorry.",
            "23 Apr · You: Understood. Can you share the premium figures so I can see how it's split?",
            "6 May · Declan Moore: Premium on the building going from £4,100 to £7,300. Four units. You can see the maths.",
            "6 May · Priya Nair (12A, upstairs): Did you get a letter too? Ours went up 9%. Also — did you see the two people measuring your frontage in Feb? Chain-cafe lanyards.",
            "12 May · Declan Moore: To confirm: three years, landlord-only break at 18 months. I need an answer by 31 May.",
            "Lease schedule, para 4.2 (your copy): building insurance renews annually on 1 April.",
            "Current rent: £1,000 a month, fixed since October three years ago.",
          ],
        },
        subskills: ["observation.text", "observation.chronology", "observation.detail"],
      },
      {
        id: "case-0107-recall",
        kind: "recall",
        title: "The particulars",
        narrative: "From the thread only. If it was not there, say so.",
        questions: [
          {
            id: "r1",
            prompt: "The proposed monthly rent from 1 October, in pounds.",
            kind: "number",
            answer: "1220",
            accept: ["£1,220", "1,220", "1220"],
            subskill: "observation.text",
          },
          {
            id: "r2",
            prompt: "When did Moore first mention insurance specifically?",
            kind: "mcq",
            options: ["14 January", "20 February", "22 April", "6 May"],
            answer: "20 February",
            subskill: "observation.chronology",
          },
          {
            id: "r3",
            prompt: "The new building premium Moore quoted, in pounds.",
            kind: "number",
            answer: "7300",
            accept: ["£7,300", "7,300", "7300"],
            subskill: "observation.detail",
          },
          {
            id: "r4",
            prompt: "Priya's increase upstairs.",
            kind: "short",
            answer: "9%",
            accept: ["9", "9 per cent", "9 percent", "nine per cent", "nine percent"],
            subskill: "memory.names",
          },
          {
            id: "r5",
            prompt: "Moore's deadline for an answer.",
            kind: "short",
            answer: "31 May",
            accept: ["31st may", "may 31", "31/5", "end of may"],
            subskill: "observation.detail",
          },
          {
            id: "r6",
            prompt: "According to the lease schedule, the building insurance renews on which date?",
            kind: "short",
            answer: "1 April",
            accept: ["1st april", "april 1", "1/4", "1 apr"],
            subskill: "observation.text",
          },
          {
            id: "r7",
            prompt: "Who can exercise the 18-month break?",
            kind: "mcq",
            options: ["You only", "The landlord only", "Either party", "The thread does not say"],
            answer: "The landlord only",
            subskill: "observation.precision",
          },
        ],
        subskills: ["observation.text", "observation.chronology", "memory.recall"],
      },
      {
        id: "case-0107-separate",
        kind: "separate",
        title: "Fact, reading, unknown",
        narrative: "Some of these are in the thread. Some are what you have concluded. Some you cannot know from here.",
        statements: [
          {
            id: "s1",
            text: "Moore raised insurance on 20 February, eighteen days before the flood.",
            truth: "observation",
            why: "Two dated messages. The order is not in dispute; what it means is.",
          },
          {
            id: "s2",
            text: "Moore is inventing the insurance story to justify a rent rise.",
            truth: "inference",
            why: "The timeline shows the story is imprecise — he blamed a flood that came after he first mentioned insurance. Imprecise is not invented. You have his figures and no reason yet to think they are false.",
          },
          {
            id: "s3",
            text: "Priya reports a 9 per cent increase on 12A.",
            truth: "observation",
            why: "Her message says so. Whether her lease, floor area or timing make that comparable to yours is a separate question.",
          },
          {
            id: "s4",
            text: "A coffee chain wants your unit.",
            truth: "inference",
            why: "Two people with chain-cafe lanyards measured your frontage. That is consistent with a rival tenant, with a chain surveying several streets, or with a franchisee who never came back. Interest is not an offer.",
          },
          {
            id: "s5",
            text: "Split evenly across four units, the premium rise is about £67 a month; you are being asked for £220.",
            truth: "observation",
            why: "Arithmetic on the figures Moore gave: £3,200 a year, four ways, twelve months. The observation is the gap; the explanation of the gap is what you are trying to find.",
          },
          {
            id: "s6",
            text: "Moore is under financial pressure.",
            truth: "inference",
            why: "A cost increase and a firm deadline are consistent with pressure and also with a landlord who simply wants a better return. Nothing in the thread distinguishes them.",
          },
          {
            id: "s7",
            text: "Moore has an alternative tenant lined up at a higher rent.",
            truth: "unknown",
            why: "The measuring visit was in February; his first cost message was in January. You cannot tell whether he has an offer, a conversation, or nothing.",
          },
          {
            id: "s8",
            text: "The insurer repriced the building because of the March flood.",
            truth: "unknown",
            why: "Possible: renewal was 1 April, three weeks after the flood. But Moore had insurance in mind in February, which suggests the increase was expected earlier. The thread cannot settle which.",
          },
        ],
        subskills: ["observation.separation", "inference.evidence_weighting", "quantitative.arithmetic"],
      },
      {
        id: "case-0107-hypotheses",
        kind: "hypotheses",
        title: "Why 22 per cent",
        narrative:
          "At least two explanations for the number he asked for. Each must survive the February date and Priya's 9 per cent.",
        rubric: {
          minimum: 2,
          plausible: [
            {
              title: "Pretext — the insurance story is cover for a market rent rise",
              keywords: ["pretext", "excuse", "cover", "lying", "invented", "made up", "made-up", "justif", "gouging", "gouge", "not true", "story"],
              note: "The reading the timeline invites. It has to explain why he would give you checkable figures and offer to send the detail.",
            },
            {
              title: "Genuine cost, clumsily told",
              keywords: ["genuine", "real cost", "reclassif", "flood zone", "flood risk", "expected", "anticipated", "earlier", "pass-through", "pass through", "premium really", "shorthand", "compressed", "simplif"],
              note: "Insurers reprice flood-zone postcodes on reclassification, not on individual floods. If Moore was warned in January, 'after the flood' is a shorthand for a rise he already knew was coming.",
            },
            {
              title: "A rival tenant — the market has moved",
              keywords: ["coffee", "chain", "another tenant", "other tenant", "rival", "market rent", "higher offer", "competitor", "measuring", "surveyors", "survey", "alternative tenant", "offer"],
              note: "The February measuring visit. If a chain would pay more, the insurance is the reason he can say out loud and the chain is the reason for the size of the number.",
            },
            {
              title: "Uneven allocation — you are carrying more than your share",
              keywords: ["share", "allocation", "apportion", "priya", "9%", "unequal", "other units", "frontage", "floor area", "bigger unit", "ground floor"],
              note: "Priya's 9 per cent could reflect a smaller unit, a lease re-based more recently, or Moore's judgement about who can absorb more. All three are common.",
            },
          ],
        },
        subskills: ["inference.hypothesis", "inference.alternatives", "strategy.incentives"],
      },
      {
        id: "case-0107-question",
        kind: "question",
        title: "Thursday",
        narrative:
          "Moore's office, a mug of tea each. He opens with 'So — are we good for October?' You get to steer the next five minutes with one question.",
        allowFreeQuestion: true,
        questionOptions: [
          {
            id: "q1",
            text: "Can I see the insurer's renewal letter and the schedule that shows how the premium is split between the units?",
            informationValue: 0.85,
            rapportCost: 0.15,
            leading: false,
            feedback:
              "Specific, verifiable, and it separates the part of his number that is cost from the part that is ask. A landlord with a real letter produces it; one without will say something interesting instead.",
          },
          {
            id: "q2",
            text: "Are you trying to get me out for a coffee chain?",
            informationValue: 0.3,
            rapportCost: 0.6,
            leading: true,
            feedback:
              "You have told him what you suspect and given him the easy denial. Even if true, he will not confirm it, and you have spent the goodwill you need for the counter-offer.",
          },
          {
            id: "q3",
            text: "Beyond the number, what would make a three-year deal work for you?",
            informationValue: 0.6,
            rapportCost: 0.05,
            leading: false,
            feedback:
              "Open and useful: it reveals his constraints — a lender, a fear of voids, a plan for the building. It does not test the insurance claim, so it is better as a second question than a first.",
          },
          {
            id: "q4",
            text: "Why did Priya get 9 per cent and I get 22?",
            informationValue: 0.55,
            rapportCost: 0.35,
            leading: false,
            feedback:
              "Informative — he has to explain the allocation — but it exposes Priya as your source and starts the meeting with him defending. The same fact comes out of the apportionment schedule without the cost.",
          },
          {
            id: "q5",
            text: "Did the flood actually cause the increase?",
            informationValue: 0.35,
            rapportCost: 0.2,
            leading: false,
            feedback:
              "A closed question to which he will say yes, because he believes it, more or less. It does not get you the document that would show what happened.",
          },
        ],
        subskills: ["social.question_quality", "inference.information_value", "social.rapport"],
      },
      {
        id: "case-0107-evidence",
        kind: "evidence",
        title: "The letter",
        narrative: "He finds it on his phone, mildly irritated to be asked, and forwards it while you wait.",
        reveal: {
          title: "Insurer to D. Moore, dated 12 January",
          text:
            "'Following the Environment Agency's reclassification of surface-water flood risk for your postcode, we anticipate the premium at your 1 April renewal to fall in the range £6,900–£7,400. This is not related to any claim on your policy.' The attached apportionment schedule splits the premium by floor area: Unit B (ground floor, yours) 31 per cent; 12A 18 per cent; the two others 26 and 25. Your share of the £3,200 rise is therefore about £990 a year — roughly £83 a month. He asked for £220.",
          undermines: ["Pretext — the insurance story is cover for a market rent rise"],
          supports: ["Genuine cost, clumsily told", "Uneven allocation — you are carrying more than your share"],
        },
        subskills: ["inference.evidence_weighting", "quantitative.arithmetic", "observation.chronology"],
      },
      {
        id: "case-0107-update",
        kind: "update",
        title: "Recalculate",
        updatePrompt:
          "Before the letter, how confident were you that the insurance reason was a pretext? Set it again. Then notice what the letter did not explain: about £137 a month of the increase is still unaccounted for.",
        subskills: ["inference.updating", "calibration.confidence"],
      },
      {
        id: "case-0107-decision",
        kind: "decision",
        title: "Your counter",
        narrative: "He is waiting. He has a deadline, a real cost, a bigger number than the cost, and possibly a chain in his pocket. So do you know what you have.",
        decisionOptions: [
          {
            id: "d1",
            text: "Accept £1,220. The cost is real and you cannot afford to move the workshop.",
            quality: 0.3,
            errorType: "ASSUMPTION",
            feedback:
              "You have let 'the cost is real' stand in for 'the number is justified'. The letter shows about £83 of cost. The rest is a market claim he has not had to make, and you have paid it without hearing it.",
          },
          {
            id: "d2",
            text: "Refuse. Tell him you will leave in September unless the rent stays at £1,000.",
            quality: 0.35,
            errorType: "STRATEGIC_SHORTSIGHTEDNESS",
            feedback:
              "A bluff a landlord with a possible rival tenant may simply call. Your fit-out is sunk, the north light is not portable, and you have made the next conversation about who blinks rather than about the unit.",
          },
          {
            id: "d3",
            text: "Counter: £1,090 from October, indexed annually; a pass-through clause for documented insurance above £4,100 at your 31 per cent share; five-year term, mutual break at 30 months.",
            quality: 0.9,
            feedback:
              "You have paid the verifiable cost in full and priced the rest as what it is, an ask. The pass-through makes his stated reason contractual, which a landlord with a genuine cost accepts easily and one with a pretext resists. The longer term is worth more to him than the last £50, which gives you room.",
          },
          {
            id: "d4",
            text: "Ask for a two-month extension at the current rent while you 'consider options', and quietly find out what the chain would pay.",
            quality: 0.5,
            errorType: "INFORMATION_VALUE",
            feedback:
              "Buys optionality, and knowing the rival's number would be useful. But his deadline and the landlord-only break say he reads delay as departure, and the chain's number is hard to obtain and harder to use without revealing that you have it.",
          },
        ],
        subskills: ["strategy.negotiation", "strategy.incentives", "strategy.second_order"],
      },
      {
        id: "case-0107-explain",
        kind: "explain",
        title: "The paragraph",
        explainPrompt:
          "Write the paragraph you would send Moore after the meeting: what you accept, what you do not, and the one clause that turns his reason into a term.",
        subskills: ["rhetoric.clarity", "rhetoric.argument", "rhetoric.concision"],
      },
      {
        id: "case-0107-debrief",
        kind: "debrief",
        title: "Debrief",
        expertReasoning:
          "The timeline told you the reason was compressed, not that it was false. Moore first raised insurance in February; the flood was in March; the letter shows the insurer warned him in January. 'After the flood' was the shorthand a busy landlord uses for a rise he already expected. The strong move was to ask for the document rather than to argue with the story, because the document did two things at once: it confirmed the cost was real and it showed the cost was £83 a month, not £220. That left about £137 unexplained, which is where the rival tenant lives — and you did not need him to admit it to price it. A counter that pays the documented cost in full and converts the stated reason into a pass-through clause is hard to refuse honestly. It also gives you a test: a landlord who resists a clause that pays him exactly what he claimed never wanted to be paid for that.",
        keyInsight:
          "A reason that does not fit the timeline is usually a compression, not a lie. Decompress it before you react — and then make the reason a term.",
        subskills: ["strategy.negotiation", "synthesis.integration"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 0108 · Estuary at Low Tide                                          */
  /* ------------------------------------------------------------------ */
  {
    id: "case-0108-estuary-provenance",
    number: "0108",
    title: "Estuary at Low Tide",
    setting: "Galerie Aubert, rue de Seine, Paris. A February afternoon, advising a collector on a small oil sketch with a twelve-year hole in its history.",
    summary:
      "A dealer's provenance sheet for a minor Honfleur-circle painting has no owner between 1937 and 1949. The obvious reading is the wrong one; the right question costs nothing.",
    difficulty: 5,
    estimatedMinutes: 30,
    faculties: ["observation", "inference", "knowledge", "calibration"],
    subskills: [
      "observation.text",
      "observation.separation",
      "inference.hypothesis",
      "inference.disconfirmation",
      "inference.evidence_weighting",
      "inference.information_value",
      "knowledge.art",
      "knowledge.history",
      "calibration.uncertainty",
    ],
    conceptLinks: ["impressionism", "falsifiability", "bayes-theorem"],
    safetyTags: ["fictional-people", "fictional-artwork", "no-protected-characteristics"],
    origin: "seeded",
    tags: ["art", "provenance", "verification", "history"],
    groundTruth:
      "The painting is a genuine late-1880s canvas from the Honfleur circle. The 1949 Zürich invoice names the seller as Mme veuve Lesage of Le Havre; the family's house was destroyed in the bombardment of September 1944 and the painting survived in a cellar, which is why the sheet had no entry for those years — the family had no papers, not no painting. The Art Loss Register and the French spoliation databases return no match. An independent examination in March found lead white and zinc white, no titanium white, a Paris colourman's stamp on a surviving fragment of original tacking margin, and a signature applied over fully dry paint — consistent with a signature added after the fact, by the artist's estate or by a dealer. So: genuine period, clean title, uncertain name. Hedberg bought at €29,000 with a warranty limited to title. The 1891 studio-inventory reference has never been produced.",
    stages: [
      {
        id: "case-0108-enter",
        kind: "enter",
        title: "A small painting",
        setting: "Galerie Aubert, first floor, the painting on an easel by the window. Mireille Aubert has left you alone with the sheet.",
        narrative:
          "Your client, Nils Hedberg, buys quietly and under €50,000, and pays you to be the person in the room who is not in love with the picture. This one is 24 by 33 centimetres, an estuary at low tide, grey and silver and very good. Aubert wants €38,000. She has given you the provenance sheet and twenty minutes.",
      },
      {
        id: "case-0108-notice",
        kind: "notice",
        title: "The sheet",
        narrative: "A provenance sheet is a chain. Read it for the links, and for where the links are not.",
        material: {
          kind: "document",
          title: "Provenance — Estuary at Low Tide (Galerie Aubert, ref. 26-014)",
          seconds: 45,
          lines: [
            "Estuary at Low Tide. Oil on canvas, 24 × 33 cm. Signed lower left 'H. Delorme'. c. 1884.",
            "1884–1891: the artist's studio, Honfleur. Listed as no. 112 in the studio inventory of 1891 (reference from Aubert file; inventory not reproduced).",
            "1891: sold to M. Édouard Lesage, ship-broker, Le Havre. Receipt dated 14 May 1891, 300 francs.",
            "1891–1936: Lesage family, Le Havre. By descent.",
            "1937: exhibited, 'Peintres de l'estuaire', Galerie Marchal, Paris, no. 41. Label verso.",
            "1937–1949: private collection.",
            "1949: sold, Kunsthandlung Berger, Zürich, to Dr Anton Ruegg, Zürich. Invoice 3 November 1949, CHF 1,800.",
            "1949–2008: Ruegg family, Zürich. By descent.",
            "2008: sold from the Ruegg estate to the present owner, private collection, Geneva.",
            "2025: consigned to Galerie Aubert, Paris. Asking price €38,000.",
            "Condition: relined c. 1950. Small area of retouching upper right. Original stretcher lost.",
            "Technical note (Galerie Aubert, March 2026): pigments consistent with the period; no titanium white detected.",
            "Comparable: H. Delorme, 'Bateaux à Honfleur', 27 × 35 cm, sold at auction, Rouen, June 2023, €29,500.",
          ],
        },
        subskills: ["observation.text", "observation.detail", "observation.anomaly"],
      },
      {
        id: "case-0108-recall",
        kind: "recall",
        title: "The links",
        narrative: "From the sheet alone.",
        questions: [
          {
            id: "r1",
            prompt: "The painting's dimensions.",
            kind: "short",
            answer: "24 × 33 cm",
            accept: ["24 x 33", "24x33", "24 by 33", "24 × 33"],
            subskill: "observation.detail",
          },
          {
            id: "r2",
            prompt: "The price paid by Lesage in 1891, in francs.",
            kind: "number",
            answer: "300",
            subskill: "observation.detail",
          },
          {
            id: "r3",
            prompt: "Which period has no named owner?",
            kind: "mcq",
            options: ["1891–1936", "1937–1949", "1949–2008", "2008–2025"],
            answer: "1937–1949",
            subskill: "observation.anomaly",
          },
          {
            id: "r4",
            prompt: "Where was the painting sold in 1949?",
            kind: "short",
            answer: "Zürich",
            accept: ["zurich", "berger", "kunsthandlung berger", "zürich, berger"],
            subskill: "memory.names",
          },
          {
            id: "r5",
            prompt: "Who wrote the technical note?",
            kind: "mcq",
            options: ["An independent laboratory", "Galerie Aubert", "The Ruegg estate", "The Rouen auction house"],
            answer: "Galerie Aubert",
            subskill: "observation.precision",
          },
          {
            id: "r6",
            prompt: "The 2023 comparable sold for how many euros?",
            kind: "number",
            answer: "29500",
            accept: ["29,500", "€29,500", "29500"],
            subskill: "observation.text",
          },
          {
            id: "r7",
            prompt: "What does the sheet say about the 1891 studio inventory?",
            kind: "mcq",
            options: ["It is reproduced in full", "It is referenced but not reproduced", "It was destroyed in 1944", "The sheet does not mention it"],
            answer: "It is referenced but not reproduced",
            subskill: "observation.precision",
          },
        ],
        subskills: ["observation.text", "observation.detail", "memory.recall"],
      },
      {
        id: "case-0108-separate",
        kind: "separate",
        title: "What the sheet proves",
        narrative: "A provenance sheet is a set of claims. Sort what it shows from what a reader supplies.",
        statements: [
          {
            id: "s1",
            text: "The sheet names no owner between 1937 and 1949.",
            truth: "observation",
            why: "'Private collection' is a placeholder, not a name. The gap is on the page.",
          },
          {
            id: "s2",
            text: "The painting changed hands under duress during the Occupation.",
            truth: "unknown",
            why: "A gap covering 1940–44 is, under the Washington Principles, a reason to investigate. It is not evidence of a forced sale; it is an absence of evidence about anything.",
          },
          {
            id: "s3",
            text: "The technical note was written by the seller.",
            truth: "observation",
            why: "It says so: Galerie Aubert, March 2026. An honest note, perhaps; not an independent one.",
          },
          {
            id: "s4",
            text: "Because no titanium white was detected, the painting dates from the 1880s.",
            truth: "inference",
            why: "The absence of a pigment that became available in the 1920s is consistent with the 1880s. It is also consistent with 1900, 1915, and with any forger who knows what titanium white is. Absence rules out; it does not rule in.",
          },
          {
            id: "s5",
            text: "A label on the back records a 1937 Paris exhibition.",
            truth: "observation",
            why: "The sheet says 'label verso'. That a label exists is observable; that it belongs to this canvas rather than having travelled from another is a further question, especially on a relined picture.",
          },
          {
            id: "s6",
            text: "The Lesage family sold the painting because Le Havre was bombed in 1944.",
            truth: "unknown",
            why: "Plausible: much of the city was destroyed in September 1944. But the sheet says nothing about who sold in 1949 or why. You are supplying a story that fits.",
          },
          {
            id: "s7",
            text: "At €38,000 the asking price is about 29 per cent above the 2023 comparable.",
            truth: "observation",
            why: "Arithmetic on two figures on the sheet. Whether the comparable is comparable — size, subject, condition, the auction's buyer's premium — is a separate matter.",
          },
          {
            id: "s8",
            text: "The relining around 1950 was done to hide something.",
            truth: "inference",
            why: "Relining was routine conservation for a canvas of that age at that date. It does destroy evidence — stamps, inscriptions on the original canvas — which is a cost of the relining, not a motive for it.",
          },
        ],
        subskills: ["observation.separation", "inference.evidence_weighting", "knowledge.art"],
      },
      {
        id: "case-0108-hypotheses",
        kind: "hypotheses",
        title: "What the gap could be",
        narrative: "At least two accounts of the sheet as a whole. Each must say something about the gap and something about the signature.",
        rubric: {
          minimum: 2,
          plausible: [
            {
              title: "Forgery or later pastiche",
              keywords: ["fake", "forg", "pastiche", "later work", "not period", "copy", "imitation", "modern", "fabricated"],
              note: "The reading a thin sheet and a seller's own lab note invite. It has to explain an 1891 receipt, a 1937 label and a 1949 Swiss invoice that all agree, for a painter whose works fetch €30,000.",
            },
            {
              title: "Genuine, with a wartime gap that may conceal a forced sale or loss",
              keywords: ["looted", "spoliat", "forced sale", "occupation", "wartime", "war", "restitution", "washington principles", "claim", "gap", "1940", "confiscat"],
              note: "A painting in Paris in 1937 and in Zürich in 1949 with no named owner between is the pattern that restitution claims are made of. The pattern is common and usually innocent, and worth checking every time.",
            },
            {
              title: "Genuine and continuous; the gap is a paperwork gap",
              keywords: ["records", "destroyed", "bomb", "le havre", "family", "descent", "paperwork", "lost", "archive", "continuous", "same family", "widow", "estate", "papers"],
              note: "Le Havre was largely destroyed in September 1944. A family with a painting and no surviving papers looks, on a sheet, exactly like a gap.",
            },
            {
              title: "Period painting, wrong name — a misattribution",
              keywords: ["misattribut", "wrong artist", "another hand", "attribution", "signature added", "different painter", "studio", "follower", "circle", "unsigned", "anonymous"],
              note: "The name rests on a signature and an inventory number the sheet cannot produce. Minor painters' signatures were routinely added to unsigned period canvases to make them saleable. This hypothesis survives a clean title.",
            },
          ],
        },
        subskills: ["inference.hypothesis", "inference.alternatives", "knowledge.history"],
      },
      {
        id: "case-0108-question",
        kind: "question",
        title: "Aubert returns",
        narrative: "She sits, pours water, and asks how you find it. You have one question that she will answer fully before the conversation becomes a negotiation.",
        allowFreeQuestion: true,
        questionOptions: [
          {
            id: "q1",
            text: "Who was the consignor to Berger in 1949 — and may I see the invoice?",
            informationValue: 0.9,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "The one document that could close the gap from the far side. A name on the 1949 invoice either connects to Lesage, in which case the chain is continuous, or does not, in which case you know what to investigate. Cheap, specific, decisive.",
          },
          {
            id: "q2",
            text: "Has the painting been checked against the Art Loss Register and the French spoliation databases?",
            informationValue: 0.7,
            rapportCost: 0.15,
            leading: false,
            feedback:
              "Any serious dealer has done this and can show the certificate. A yes with paper is strong; a no is very informative. It does not, however, tell you who owned the picture in 1943.",
          },
          {
            id: "q3",
            text: "You are not seriously telling me this has a clean wartime history?",
            informationValue: 0.2,
            rapportCost: 0.6,
            leading: true,
            feedback:
              "You have accused her sheet of concealment and given her the easy reply. She will defend; you will learn her tone and nothing else. The gap is a question, not a charge.",
          },
          {
            id: "q4",
            text: "Would you allow an independent conservator to examine it, at my client's expense, before any offer?",
            informationValue: 0.75,
            rapportCost: 0.2,
            leading: false,
            feedback:
              "A test of her confidence rather than of the painting. A refusal is data. But an examination answers the pigment question, which you have half-answered, and not the ownership question, which you have not.",
          },
          {
            id: "q5",
            text: "Is the price negotiable?",
            informationValue: 0.15,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "It tells you about her margin, not about the painting, and it signals that you have already decided to buy. Ask it last, if at all.",
          },
        ],
        subskills: ["social.question_quality", "inference.information_value"],
      },
      {
        id: "case-0108-evidence",
        kind: "evidence",
        title: "From the Ruegg papers",
        narrative: "She has it. She has, she says, been waiting for someone to ask.",
        reveal: {
          title: "Invoice, Kunsthandlung Berger, Zürich, 3 November 1949",
          text:
            "'Vendeur: Mme veuve Lesage, Le Havre. Acheteur: Dr A. Ruegg. Delorme, Estuaire à marée basse, 24 × 33.' Attached from the same folder: a letter of March 1946 from Mme Lesage to a cousin in Zürich mentioning 'the little Delorme that survived the cellar, which I should like to sell when I can'. And an Art Loss Register certificate dated last month: no match. The chain now runs Lesage to Lesage to Ruegg without an unknown hand. What it does not touch is the name on the canvas: the 1891 inventory is still 'reference from Aubert file'.",
          undermines: ["Forgery or later pastiche", "Genuine, with a wartime gap that may conceal a forced sale or loss"],
          supports: ["Genuine and continuous; the gap is a paperwork gap"],
        },
        subskills: ["inference.evidence_weighting", "inference.disconfirmation", "knowledge.history"],
      },
      {
        id: "case-0108-update",
        kind: "update",
        title: "Two words",
        updatePrompt:
          "You set a confidence that the sheet described a genuine Delorme with a clean title. Set it again — and say which of the two words, genuine or clean, the invoice moved. They are not the same claim.",
        subskills: ["inference.updating", "calibration.confidence", "calibration.uncertainty"],
      },
      {
        id: "case-0108-decision",
        kind: "decision",
        title: "What you tell Hedberg",
        narrative: "He will do what you advise. Aubert has another viewing on Friday, or says she does.",
        decisionOptions: [
          {
            id: "d1",
            text: "Walk away. Too many gaps.",
            quality: 0.3,
            errorType: "PREMATURE_CLOSURE",
            feedback:
              "The gap has closed; you watched it close. What remains is attribution risk, which is ordinary for a minor painter and is exactly what the price is for. You are responding to the sheet you read at 14:00, not the one you have now.",
          },
          {
            id: "d2",
            text: "Buy at €38,000. The chain is continuous and the register is clear.",
            quality: 0.45,
            errorType: "ASSUMPTION",
            feedback:
              "Title is clean. The name rests on a seller's lab note, a signature, and an inventory nobody has seen — and the price is 29 per cent above the only comparable. You have let the resolved question pay for the unresolved one.",
          },
          {
            id: "d3",
            text: "Offer €30,000, conditional on an independent technical examination and on sight of the 1891 inventory entry or the 1937 catalogue, with a written warranty of title and attribution.",
            quality: 0.92,
            feedback:
              "You pay for what is established, make the seller carry the unproved part, and give her a way to earn the higher price by producing the document she cites. If the inventory does not exist, the warranty is what you were actually negotiating.",
          },
          {
            id: "d4",
            text: "Ask Aubert to hold it for a month while you consult the Delorme catalogue raisonné.",
            quality: 0.5,
            errorType: "INFORMATION_VALUE",
            feedback:
              "You would find in an afternoon that there is no catalogue raisonné for a painter of this rank. A month is a great deal to pay for an afternoon, and the Friday viewing may be real.",
          },
        ],
        subskills: ["inference.evidence_weighting", "strategy.optionality", "calibration.uncertainty"],
      },
      {
        id: "case-0108-explain",
        kind: "explain",
        title: "Three sentences",
        explainPrompt:
          "Write Hedberg three sentences: what the gap was, what closed it, and what remains open. He will not read a fourth.",
        subskills: ["rhetoric.concision", "rhetoric.precision", "rhetoric.explanation"],
      },
      {
        id: "case-0108-debrief",
        kind: "debrief",
        title: "Debrief",
        expertReasoning:
          "The sheet raised two questions that look like one: is it genuine, and is the title clean. The 1937–1949 gap bore on the second and, because gaps in those years are the pattern that spoliation claims follow, it deserved a check every time — which is a different thing from a conclusion. The cheapest test with the highest information value was to ask for the far side of the gap: the 1949 consignor. One name closed it. What the invoice could not do was prove the signature, because nothing on the sheet could: the technical note was the seller's and proved only what was absent, the inventory was a reference to a document nobody had produced, and a label on a relined canvas travels. An expert separates what each document is capable of proving from what the sheet implies by placing them in a row. The right price paid for the proved part and made the seller carry the rest.",
        keyInsight:
          "Ask what each document can prove. A lab note proves what is not there; an invoice proves who signed; neither proves a name.",
        subskills: ["inference.disconfirmation", "synthesis.integration", "knowledge.art"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 0109 · The Society's Missing Money                                  */
  /* ------------------------------------------------------------------ */
  {
    id: "case-0109-society-shortfall",
    number: "0109",
    title: "The Society's Missing Money",
    setting: "The students' union building on a Tuesday evening in February, two weeks after you became treasurer of the Photography Society.",
    summary:
      "The ledger says the society should have £2,410. The bank says £1,240. A gap invites one story; this one is made of three.",
    difficulty: 4,
    estimatedMinutes: 22,
    faculties: ["observation", "inference", "quantitative", "strategy"],
    subskills: [
      "observation.detail",
      "observation.separation",
      "inference.alternatives",
      "inference.base_rates",
      "inference.causal",
      "quantitative.arithmetic",
      "social.question_quality",
      "strategy.planning",
    ],
    conceptLinks: ["double-entry-bookkeeping", "base-rate-fallacy", "availability-heuristic"],
    safetyTags: ["fictional-people", "no-protected-characteristics"],
    origin: "seeded",
    tags: ["finance", "decomposition", "student-society", "base-rates"],
    groundTruth:
      "The £1,170 gap between budgeted closing balance and the bank decomposes exactly: £800 duplicate deposit to Arch Gallery (a card payment on 3 February that appeared to fail and was repeated by transfer on 5 February; the gallery confirmed the duplicate on 6 February and refunded on 4 March); £420 membership shortfall (112 paid against a budget of 140 at £15, a structural miss, not a loss); £120 paid to Tomasz Nowak on 22 January for darkroom chemicals and never entered in the ledger, which is the whole of the ledger-to-bank difference; minus a £65 print-sale surplus and £30 speaker under-spend, plus £45 socials over-spend. Nobody took anything. The previous treasurer's handover folder contained the gallery's email. The exhibition went ahead in April.",
    stages: [
      {
        id: "case-0109-enter",
        kind: "enter",
        title: "Handover",
        setting: "A committee room with a broken radiator. The president, Leah Brennan, has just said the word 'missing'.",
        narrative:
          "You inherited the books from Ben Whitlock two weeks ago along with a folder, a spreadsheet and the online banking login. Tonight Leah has asked, in front of the committee, why the bank balance is more than a thousand pounds below what the budget said it would be. Tomasz Nowak, who runs the darkroom, is looking at his shoes. The spring exhibition is in eight weeks and the venue wants its balance.",
      },
      {
        id: "case-0109-notice",
        kind: "notice",
        title: "The ledger",
        narrative: "Budget against ledger, with Ben's notes. Read the numbers, then the notes, then the numbers again.",
        material: {
          kind: "table",
          title: "Photography Society — year to 17 February",
          seconds: 45,
          columns: ["Line", "Budget (£)", "Ledger (£)", "Note"],
          rows: [
            ["Opening balance, 1 Oct", "1,140", "1,140", "carried from last year"],
            ["Membership", "2,100", "1,680", "budget 140 × £15; 112 paid"],
            ["Union grant", "900", "900", "received 18 Nov"],
            ["Print sale, 5 Dec", "350", "415", "cash, banked 9 Dec"],
            ["Darkroom chemicals & paper", "-600", "-480", "T. Nowak claim, Jan — 'pending'"],
            ["Guest speaker travel", "-220", "-190", ""],
            ["Exhibition deposit — Arch Gallery", "-800", "-1,600", "3 Feb (card) and 5 Feb (transfer)"],
            ["Socials", "-260", "-305", ""],
            ["Website & hosting", "-95", "-95", "annual, Oct"],
            ["Union insurance levy", "-105", "-105", ""],
            ["Closing balance", "2,410", "1,360", ""],
            ["Bank balance, 17 Feb", "—", "1,240", "online statement"],
          ],
        },
        subskills: ["observation.detail", "observation.text", "quantitative.arithmetic"],
      },
      {
        id: "case-0109-recall",
        kind: "recall",
        title: "The figures",
        narrative: "From the table. Exact numbers.",
        questions: [
          {
            id: "r1",
            prompt: "How many members have paid?",
            kind: "number",
            answer: "112",
            subskill: "observation.detail",
          },
          {
            id: "r2",
            prompt: "Total recorded as paid to Arch Gallery, in pounds.",
            kind: "number",
            answer: "1600",
            accept: ["1,600", "£1,600", "1600"],
            subskill: "observation.detail",
          },
          {
            id: "r3",
            prompt: "The two deposit payments were made on:",
            kind: "mcq",
            options: ["3 and 5 February", "3 and 5 January", "5 and 7 February", "1 and 3 February"],
            answer: "3 and 5 February",
            subskill: "observation.chronology",
          },
          {
            id: "r4",
            prompt: "The bank balance on 17 February, in pounds.",
            kind: "number",
            answer: "1240",
            accept: ["1,240", "£1,240", "1240"],
            subskill: "observation.detail",
          },
          {
            id: "r5",
            prompt: "Whose expense claim is marked 'pending'?",
            kind: "short",
            answer: "Nowak",
            accept: ["tomasz", "t. nowak", "tomasz nowak", "t nowak"],
            subskill: "memory.names",
          },
          {
            id: "r6",
            prompt: "The budgeted closing balance, in pounds.",
            kind: "number",
            answer: "2410",
            accept: ["2,410", "£2,410", "2410"],
            subskill: "observation.detail",
          },
          {
            id: "r7",
            prompt: "By how much did the print sale beat its budget, in pounds?",
            kind: "number",
            answer: "65",
            subskill: "quantitative.arithmetic",
          },
        ],
        subskills: ["observation.detail", "memory.recall", "quantitative.arithmetic"],
      },
      {
        id: "case-0109-separate",
        kind: "separate",
        title: "Numbers and stories",
        narrative: "The table shows some things. The room has already decided others.",
        statements: [
          {
            id: "s1",
            text: "The ledger closing balance is £120 higher than the bank balance.",
            truth: "observation",
            why: "1,360 against 1,240. This is the only number on the page that is a discrepancy rather than a variance; everything else is budget against actual.",
          },
          {
            id: "s2",
            text: "Someone has taken £120.",
            truth: "inference",
            why: "A ledger higher than the bank is exactly what a payment made but not entered looks like. Theft is one explanation, the rarest, and the one Leah's word 'missing' put in the room.",
          },
          {
            id: "s3",
            text: "The ledger records two £800 payments to Arch Gallery, on 3 and 5 February.",
            truth: "observation",
            why: "It is in the row and in the note. Why there are two is not.",
          },
          {
            id: "s4",
            text: "The second gallery payment was a mistake by the previous treasurer.",
            truth: "inference",
            why: "Likely: a card payment that seemed to fail and was repeated. Also possible: the gallery asked for the balance early, or the card payment was declined and both later cleared. The table cannot say.",
          },
          {
            id: "s5",
            text: "Membership fell short of budget by 28 people, or £420.",
            truth: "observation",
            why: "140 budgeted, 112 paid, £15 each. Arithmetic on the row.",
          },
          {
            id: "s6",
            text: "Membership fell because the society raised the fee.",
            truth: "unknown",
            why: "Nothing in the table says what the fee was last year or how many joined. You have a shortfall and no cause.",
          },
          {
            id: "s7",
            text: "Nowak's chemicals claim has been paid.",
            truth: "unknown",
            why: "The note says 'pending'. The £120 bank gap is consistent with it having been paid and not entered — but consistent-with is not shown-by.",
          },
          {
            id: "s8",
            text: "The society cannot afford the exhibition.",
            truth: "inference",
            why: "Depends entirely on whether £800 comes back. If it does, the society is £370 under budget on a £2,410 plan; if not, the picture is different. You do not know yet.",
          },
        ],
        subskills: ["observation.separation", "inference.base_rates", "quantitative.arithmetic"],
      },
      {
        id: "case-0109-hypotheses",
        kind: "hypotheses",
        title: "What the gap is made of",
        narrative:
          "The committee wants one explanation. Give at least two, and say how much of the £1,170 each one accounts for.",
        rubric: {
          minimum: 2,
          plausible: [
            {
              title: "Money has gone missing — misappropriation",
              keywords: ["stolen", "theft", "embezzl", "misappropriat", "dipping", "fraud", "pocketed", "took the money", "taken"],
              note: "The explanation the £120 ledger-to-bank gap invites and the word 'missing' encourages. Rare in societies audited by a union, and it explains at most £120 of £1,170.",
            },
            {
              title: "A duplicate payment to the gallery",
              keywords: ["duplicate", "twice", "double", "two payments", "refund", "card and transfer", "paid twice", "repeat", "retried", "recoverable"],
              note: "£800 of the gap in a single row, with two dates two days apart and two payment methods. The most common way money 'disappears' from a small account is that it went somewhere twice.",
            },
            {
              title: "The membership forecast was too optimistic",
              keywords: ["membership", "fewer members", "112", "140", "forecast", "overestimat", "optimistic", "assumed", "sign-ups", "signups", "recruit", "structural"],
              note: "£420 that was never going to arrive. Not a loss, a planning error, and the only part of the gap that does not come back.",
            },
            {
              title: "Bookkeeping lag — payments made but not entered",
              keywords: ["not entered", "unrecorded", "lag", "pending", "not yet", "bookkeeping", "reconcil", "missing entry", "claim paid", "nowak", "not recorded", "handover"],
              note: "The £120 exactly. A claim marked pending, a treasurer mid-handover, a payment that went out and was never written down.",
            },
          ],
        },
        subskills: ["inference.hypothesis", "inference.alternatives", "inference.base_rates"],
      },
      {
        id: "case-0109-question",
        kind: "question",
        title: "One message tonight",
        narrative: "Ben is reachable. So is Tomasz, the union finance office, and Leah. Which single message do you send before the meeting ends?",
        allowFreeQuestion: true,
        questionOptions: [
          {
            id: "q1",
            text: "To Ben: 'Walk me through what happened with the gallery deposit between 3 and 5 February.'",
            informationValue: 0.85,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "Open, dated, and pointed at the biggest row. He will tell you about the card that seemed to fail, and probably about the email from the gallery he meant to hand over.",
          },
          {
            id: "q2",
            text: "To Ben: 'Did you pay the gallery twice by mistake?'",
            informationValue: 0.5,
            rapportCost: 0.3,
            leading: true,
            feedback:
              "You have supplied the answer and the word 'mistake'. He will say yes or get defensive; either way you learn less than the open version, and he may not mention the refund email.",
          },
          {
            id: "q3",
            text: "To Tomasz: 'Has your January claim been paid, and how?'",
            informationValue: 0.7,
            rapportCost: 0.05,
            leading: false,
            feedback:
              "Settles the £120 in one reply and takes the word 'missing' out of the room. Good — but it resolves the smallest piece.",
          },
          {
            id: "q4",
            text: "To the union finance office: 'Please send the society's full bank statement since 1 October.'",
            informationValue: 0.8,
            rapportCost: 0.05,
            leading: false,
            feedback:
              "The one document that settles the duplicate, the £120 and any other surprise at once. Slightly below Ben's account only because it will not tell you whether the gallery has agreed to refund.",
          },
          {
            id: "q5",
            text: "To Leah: 'Do you think Ben was on top of things?'",
            informationValue: 0.15,
            rapportCost: 0.3,
            leading: false,
            feedback:
              "An invitation to gossip. It produces an opinion about a person and no number, and the person will hear about it.",
          },
        ],
        subskills: ["social.question_quality", "inference.information_value"],
      },
      {
        id: "case-0109-evidence",
        kind: "evidence",
        title: "The statement",
        narrative: "You open the online banking while Leah is still talking.",
        reveal: {
          title: "Transactions, 15 January – 17 February",
          text:
            "22 Jan · Faster payment out, £120.00, T NOWAK, ref CHEMICALS. 3 Feb · Card payment, £800.00, ARCH GALLERY, ref PHOTOSOC DEPOSIT. 5 Feb · Faster payment out, £800.00, ARCH GALLERY LTD, ref PHOTOSOC DEPOSIT. Nothing else unaccounted for. In Ben's handover folder, an email from Arch Gallery dated 6 February: 'We've received your deposit twice — the card payment cleared after all. Refund will be processed within 30 days.' The ledger-to-bank gap is Tomasz's £120, paid and never entered. The £800 is a receivable with a date on it.",
          undermines: ["Money has gone missing — misappropriation"],
          supports: ["A duplicate payment to the gallery", "Bookkeeping lag — payments made but not entered"],
        },
        subskills: ["inference.evidence_weighting", "observation.detail", "inference.causal"],
      },
      {
        id: "case-0109-update",
        kind: "update",
        title: "What moved",
        updatePrompt:
          "Before the statement, how likely did you think it was that money had been taken? Set it again. Then notice that the statement said nothing at all about the £420 of membership — has your view of that moved, and should it have?",
        subskills: ["inference.updating", "calibration.confidence"],
      },
      {
        id: "case-0109-decision",
        kind: "decision",
        title: "What you do",
        narrative: "Leah has stopped talking. The committee is waiting for the treasurer.",
        decisionOptions: [
          {
            id: "d1",
            text: "Report the previous treasurer to the union for the missing money.",
            quality: 0.1,
            errorType: "PREMATURE_CLOSURE",
            feedback:
              "There is no missing money. There is a duplicate with a refund email, an unentered claim and a forecast that was wrong. You would have acted on the word Leah used rather than the statement you read.",
          },
          {
            id: "d2",
            text: "Cancel the exhibition to protect the balance.",
            quality: 0.3,
            errorType: "OVER_UPDATE",
            feedback:
              "The £800 is a receivable, not a loss, and the exhibition is the society's main income event. You have swung from 'theft' to 'ruin' on a table that says neither.",
          },
          {
            id: "d3",
            text: "Reconcile line by line: write to the gallery tonight to confirm the refund date, enter Nowak's £120, re-forecast the year on 112 members, and present the three numbers to the committee.",
            quality: 0.95,
            feedback:
              "The gap is a sum; you have treated it as one. £800 comes back, £120 was a bookkeeping miss, £420 is the real shortfall and needs a decision about the summer. The committee leaves with three numbers instead of one word.",
          },
          {
            id: "d4",
            text: "Ask the union finance office for a formal audit before saying anything.",
            quality: 0.45,
            errorType: "INFORMATION_VALUE",
            feedback:
              "Legitimate, slow, and it would find what you have already found. Keep it in reserve for the day the refund does not arrive; tonight it postpones an answer you can give.",
          },
        ],
        subskills: ["strategy.planning", "inference.causal", "quantitative.arithmetic"],
      },
      {
        id: "case-0109-explain",
        kind: "explain",
        title: "Three lines",
        explainPrompt:
          "Write the three-line summary for the committee minutes: what the shortfall is made of, what comes back, and what does not.",
        subskills: ["rhetoric.concision", "rhetoric.clarity", "rhetoric.explanation"],
      },
      {
        id: "case-0109-debrief",
        kind: "debrief",
        title: "Debrief",
        expertReasoning:
          "A shortfall is a sum, and the first discipline is to refuse to explain it with one cause. The table contained three separate things that had been collapsed into a single word: a variance against budget, a duplicate payment, and a discrepancy between two records. Only the last of those — £120 — was the kind of thing that theft produces, and it was also exactly what an unentered payment produces, which is far more common. Base rates did the work: in a small society with union oversight, duplicate payments and bookkeeping lags happen every year; misappropriation almost never does, and when it does it is not £120. The bank statement was the single document with the most information per minute, and Ben's open-ended question was the cheapest way to learn what the statement would not show — that the refund was already agreed. The piece that deserved the committee's attention was the one nobody was looking at: £420 that was never going to arrive.",
        keyInsight:
          "Decompose before you explain. A gap made of three ordinary things looks, from a distance, like one extraordinary one.",
        subskills: ["inference.base_rates", "synthesis.integration"],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 0110 · The Rested Company                                            */
  /* ------------------------------------------------------------------ */
  {
    id: "case-0110-rested-company",
    number: "0110",
    title: "The Rested Company",
    setting: "Your desk at a 300-person logistics firm, Monday 08:40. The COO has forwarded a news story with one line: 'Why aren't we doing this? Views by Wednesday.'",
    summary:
      "A software company says a four-day week lifted output 38 per cent. Every fact in the article is probably true. The number is still not usable — and some of the smaller numbers are.",
    difficulty: 6,
    estimatedMinutes: 34,
    faculties: ["observation", "inference", "quantitative", "calibration", "rhetoric"],
    subskills: [
      "observation.text",
      "observation.separation",
      "inference.causal",
      "inference.alternatives",
      "inference.disconfirmation",
      "inference.base_rates",
      "social.incentive_recognition",
      "quantitative.statistics",
      "calibration.uncertainty",
      "rhetoric.argument",
    ],
    conceptLinks: ["availability-heuristic", "falsifiability", "base-rate-fallacy", "bayes-theorem"],
    safetyTags: ["fictional-company", "fictional-people", "no-protected-characteristics"],
    origin: "seeded",
    tags: ["verification", "news", "statistics", "incentives", "business"],
    groundTruth:
      "Larkspur's 38 per cent compared twelve weeks of story points, back-estimated from ticket counts for the baseline, during a product launch, against a quarter containing a two-week shutdown, for volunteer teams, with no comparison group. The design Dr Raman reviewed specified matched comparison teams, a single metric for both periods and six months; none of it was followed. The sick-day figures (41 to 19) were company-wide and covered periods of different length. Two resignations against six was real but is two numbers. Larkspur's own report, published in November, dropped the 38 per cent figure and described output as 'maintained', while keeping the attrition claim. Feld's book sold well. Your firm ran a six-month pilot in one depot with a comparison depot and its existing throughput metric; output was flat, sick days fell modestly, and retention improved enough to matter.",
    stages: [
      {
        id: "case-0110-enter",
        kind: "enter",
        title: "Views by Wednesday",
        setting: "An open-plan floor, a forwarded link, and a COO who has already told two people he likes the idea.",
        narrative:
          "You are the person the COO sends things to when he wants to be told whether they are true. He has attached a regional business story about a software firm in Bristol and a four-day week. He is not asking whether the story is true. He is asking why you are not already doing it, which is a different question, and you will need to answer both.",
      },
      {
        id: "case-0110-notice",
        kind: "notice",
        title: "The article",
        narrative: "Read it the way a good sub-editor would: for what each sentence actually asserts, and who is asserting it.",
        material: {
          kind: "document",
          title: "Four-day week lifts output 38% at software firm — Regional Business Post, 28 August",
          seconds: 45,
          lines: [
            "Larkspur Systems, a 94-person software company in Bristol, moved 22 engineers to a four-day, 32-hour week for twelve weeks from 6 April.",
            "Output rose 38 per cent against the previous quarter, the company said on Thursday.",
            "Sick days fell from 41 to 19, and there were two resignations against six in the same period last year.",
            "'People do their best work rested,' said chief executive Dana Feld. 'The numbers speak for themselves.'",
            "Larkspur sells workforce-analytics software. Its new product, Cadence, launched on 14 May.",
            "The participating teams were volunteers from the platform and mobile groups.",
            "The comparison quarter, January to March, included the company's two-week January shutdown.",
            "Output was measured in 'delivered story points', a metric Larkspur adopted in March.",
            "An academic adviser, Dr Priya Raman of the University of Bath, reviewed the trial design but did not analyse the data.",
            "Feld's book, The Rested Company, is published on 2 September.",
            "The remaining 72 staff continued on five days; Larkspur said it would 'consider extending' the scheme.",
            "Full results will be published 'later this year', a spokesperson said.",
          ],
        },
        subskills: ["observation.text", "observation.detail", "observation.anomaly"],
      },
      {
        id: "case-0110-recall",
        kind: "recall",
        title: "What it said",
        narrative: "The article only. The COO will quote it back at you.",
        questions: [
          {
            id: "r1",
            prompt: "How many engineers moved to the four-day week?",
            kind: "number",
            answer: "22",
            subskill: "observation.detail",
          },
          {
            id: "r2",
            prompt: "Larkspur's total headcount.",
            kind: "number",
            answer: "94",
            subskill: "observation.detail",
          },
          {
            id: "r3",
            prompt: "Sick days, before and after.",
            kind: "mcq",
            options: ["41 to 19", "19 to 41", "46 to 21", "41 to 12"],
            answer: "41 to 19",
            subskill: "observation.detail",
          },
          {
            id: "r4",
            prompt: "The metric used to measure output.",
            kind: "short",
            answer: "delivered story points",
            accept: ["story points", "delivered story points"],
            subskill: "observation.text",
          },
          {
            id: "r5",
            prompt: "When did Larkspur adopt that metric?",
            kind: "mcq",
            options: ["January", "March", "April", "May"],
            answer: "March",
            subskill: "observation.chronology",
          },
          {
            id: "r6",
            prompt: "Publication date of Feld's book.",
            kind: "short",
            answer: "2 September",
            accept: ["2nd september", "september 2", "2 sep", "2/9"],
            subskill: "observation.detail",
          },
          {
            id: "r7",
            prompt: "What did the academic adviser do?",
            kind: "mcq",
            options: ["Analysed the data", "Reviewed the design but did not analyse the data", "Co-authored the results", "The article does not say"],
            answer: "Reviewed the design but did not analyse the data",
            subskill: "observation.precision",
          },
        ],
        subskills: ["observation.text", "observation.detail", "memory.recall"],
      },
      {
        id: "case-0110-separate",
        kind: "separate",
        title: "Asserted, inferred, unknown",
        narrative: "The article reports; you have been reading. Separate the two.",
        statements: [
          {
            id: "s1",
            text: "The company reports a 38 per cent rise in output against the previous quarter.",
            truth: "observation",
            why: "That is the claim, attributed. 'The company said' is doing a great deal of work in that sentence.",
          },
          {
            id: "s2",
            text: "The four-day week caused a 38 per cent rise in output.",
            truth: "inference",
            why: "The headline invites it and the article never quite says it. Between the claim and the cause sit a changed metric, a shutdown in the baseline, a product launch and no comparison group.",
          },
          {
            id: "s3",
            text: "The baseline quarter included a two-week shutdown.",
            truth: "observation",
            why: "Line seven. Two of the thirteen baseline weeks produced nothing; a fair comparison would adjust for that, and the article does not say whether anyone did.",
          },
          {
            id: "s4",
            text: "The output metric was adopted one month before the trial began.",
            truth: "observation",
            why: "March, then April. So the baseline quarter was mostly measured before the metric existed. Someone reconstructed it — how is not stated.",
          },
          {
            id: "s5",
            text: "Larkspur benefits commercially from the result being believed.",
            truth: "inference",
            why: "A workforce-analytics product launched during the trial and a book five days after the story. Strong, and still an inference: the article does not say the story was placed to sell either.",
          },
          {
            id: "s6",
            text: "The volunteer teams were the more productive engineers to begin with.",
            truth: "unknown",
            why: "Volunteers often differ from non-volunteers, in either direction. Nothing in the article says which, or by how much.",
          },
          {
            id: "s7",
            text: "Sick days among the 22 participants fell from 41 to 19.",
            truth: "unknown",
            why: "The article gives the figures without saying whose they are or over what periods. Company-wide, over two different spans, they would mean something else entirely.",
          },
          {
            id: "s8",
            text: "A four-day week would produce a similar result at your firm.",
            truth: "unknown",
            why: "Twenty-two software engineers on story points; you run depots on throughput. Even a real effect at Larkspur says little about transfer.",
          },
        ],
        subskills: ["observation.separation", "inference.causal", "social.incentive_recognition"],
      },
      {
        id: "case-0110-hypotheses",
        kind: "hypotheses",
        title: "Why 38",
        narrative: "At least two accounts of where a 38 per cent figure could come from, including the one where it is simply true.",
        rubric: {
          minimum: 2,
          plausible: [
            {
              title: "Real effect — rested people do more",
              keywords: ["real", "genuine", "rest", "rested", "fatigue", "focus", "fewer meetings", "causal", "it works", "true effect", "compressed"],
              note: "Not absurd. Shorter weeks can cut meetings and idle time, and the published evidence on compressed weeks is mixed rather than empty. But 38 per cent from one change would be extraordinary anywhere.",
            },
            {
              title: "Measurement artefact — a new metric against a weak baseline",
              keywords: ["metric", "story points", "baseline", "shutdown", "january", "measurement", "inflation", "apples", "comparison", "different measure", "holiday", "reconstruct", "back-estimat", "estimated"],
              note: "The metric was adopted in March; the baseline is January to March with two dead weeks. Story points are estimates made by the team being measured. This alone could produce 38 per cent from nothing.",
            },
            {
              title: "Selection and novelty — volunteers, attention, a launch",
              keywords: ["volunteer", "selection", "hawthorne", "novelty", "launch", "crunch", "chosen", "self-select", "attention", "observed", "cadence", "deadline"],
              note: "Volunteer teams, watched closely, shipping a product launch in the middle of the trial. Launch quarters are when everything gets counted.",
            },
            {
              title: "Marketing — the result exists to sell a product and a book",
              keywords: ["marketing", "sell", "book", "product", "cadence", "press release", "incentive", "promotion", "pr", "spin", "publicity", "conflict of interest"],
              note: "Explains why the number was announced, not how it was produced. Incentives tell you to check; they do not tell you what you will find.",
            },
          ],
        },
        subskills: ["inference.hypothesis", "inference.alternatives", "social.incentive_recognition"],
      },
      {
        id: "case-0110-question",
        kind: "question",
        title: "One email before lunch",
        narrative: "You can reach Larkspur's press office, Dr Raman, or the COO. One email, sent now, that you expect an answer to by Wednesday.",
        allowFreeQuestion: true,
        questionOptions: [
          {
            id: "q1",
            text: "To Larkspur press office: 'How were story points counted for the baseline quarter, given the metric was adopted in March?'",
            informationValue: 0.85,
            rapportCost: 0.15,
            leading: false,
            feedback:
              "The question the 38 per cent cannot survive without an answer to. Specific enough that a non-answer is itself informative.",
          },
          {
            id: "q2",
            text: "To Dr Raman: 'What did the design you reviewed specify for the comparison group and the metric — and was it followed?'",
            informationValue: 0.8,
            rapportCost: 0.1,
            leading: false,
            feedback:
              "The one person named who has no product to sell and did not produce the number. Academics answer this kind of email; the gap between design and execution is usually where the story is.",
          },
          {
            id: "q3",
            text: "To Larkspur press office: 'Isn't this just marketing for the book?'",
            informationValue: 0.1,
            rapportCost: 0.7,
            leading: true,
            feedback:
              "You will get a paragraph about Larkspur's commitment to its people. You have told them what you think and learned nothing you did not already suspect.",
          },
          {
            id: "q4",
            text: "To the COO: 'What would we need to be true about our own operation before copying this?'",
            informationValue: 0.5,
            rapportCost: 0.05,
            leading: false,
            feedback:
              "A good reframing that moves the conversation from their result to your decision. It does not test the claim, and he asked you to.",
          },
          {
            id: "q5",
            text: "To Larkspur press office: 'Could you share output and sick-day figures per team, including the teams that stayed on five days?'",
            informationValue: 0.75,
            rapportCost: 0.2,
            leading: false,
            feedback:
              "A control-group question, which is the right instinct. Slightly lower value than the baseline question only because 'later this year' is the likely reply.",
          },
        ],
        subskills: ["social.question_quality", "inference.information_value", "inference.disconfirmation"],
      },
      {
        id: "case-0110-evidence",
        kind: "evidence",
        title: "Dr Raman replies",
        narrative: "Within the hour, and at some length.",
        reveal: {
          title: "Email, Tuesday 09:52",
          text:
            "'The design I reviewed specified two matched comparison teams on five days, a single metric defined before the trial and applied identically to both periods, and six months. Larkspur ran twelve weeks. The comparison teams' figures were not collected — I was told resourcing. Story points for January to March were back-estimated from ticket counts in July, by the participating teams. I would also note the platform team shipped the Cadence launch during the trial, and launch periods are when everything gets counted. I have asked that my name not be attached to the 38 per cent figure. The sick-day and resignation numbers I have not seen the basis for; I would not dismiss them, but I would want to know the denominators.'",
          undermines: ["Real effect — rested people do more"],
          supports: ["Measurement artefact — a new metric against a weak baseline", "Selection and novelty — volunteers, attention, a launch"],
        },
        subskills: ["inference.evidence_weighting", "inference.disconfirmation", "quantitative.statistics"],
      },
      {
        id: "case-0110-update",
        kind: "update",
        title: "Two confidences",
        updatePrompt:
          "Before Raman's reply, how likely did you think the 38 per cent reflected a real gain of roughly that size? Set it again. Then set a separate confidence that a four-day week would reduce sick days at your firm — and notice that Raman's email barely touched that one.",
        subskills: ["inference.updating", "calibration.confidence", "calibration.uncertainty"],
      },
      {
        id: "case-0110-decision",
        kind: "decision",
        title: "Wednesday",
        narrative: "The COO has ten minutes and has already used the phrase 'the numbers speak for themselves' in a meeting.",
        decisionOptions: [
          {
            id: "d1",
            text: "Recommend a company-wide four-day week pilot. The evidence is strong.",
            quality: 0.2,
            errorType: "OVERCONFIDENCE",
            feedback:
              "The one number that made the evidence look strong is the one that does not survive. You would be committing 300 people on a figure its own academic adviser has disowned.",
          },
          {
            id: "d2",
            text: "Tell the COO the article is marketing and there is nothing in it.",
            quality: 0.35,
            errorType: "OVER_UPDATE",
            feedback:
              "The 38 per cent is uninterpretable; the attrition and sick-day figures are weak but not nothing, and the wider evidence on shorter weeks is mixed, not absent. You have swung from his certainty to its mirror image.",
          },
          {
            id: "d3",
            text: "Reply: the 38 per cent is not usable — metric changed, shutdown in the baseline, no comparison group, adviser has withdrawn; the sick-day and retention figures are worth noting; propose a six-month pilot in one depot with a comparison depot and a throughput metric we already collect.",
            quality: 0.95,
            feedback:
              "You have separated the number that cannot be used from the ones that might, said why in terms he can repeat, and turned a borrowed result into a test of your own. That is what he actually asked for, even if he did not ask it.",
          },
          {
            id: "d4",
            text: "Ask Larkspur for the full dataset before saying anything.",
            quality: 0.5,
            errorType: "INFORMATION_VALUE",
            feedback:
              "They have said 'later this year'. You have enough to answer the question you were asked; the data request belongs in a footnote, not in place of the answer.",
          },
        ],
        subskills: ["inference.causal", "strategy.planning", "calibration.uncertainty", "rhetoric.argument"],
      },
      {
        id: "case-0110-explain",
        kind: "explain",
        title: "The reply",
        explainPrompt:
          "Write the four-sentence reply to the COO. He will read the first sentence and the last. Make the first one the verdict on the number and the last one what you propose to do.",
        subskills: ["rhetoric.argument", "rhetoric.concision", "rhetoric.clarity"],
      },
      {
        id: "case-0110-debrief",
        kind: "debrief",
        title: "Debrief",
        expertReasoning:
          "Every sentence in the article was probably true, which is what makes this kind of story hard: the falsehood is not in any line but in the arrangement. Verification here meant four questions in order. Who measured — the participating teams, estimating their own baseline months later. What was measured — a metric adopted a month before the trial. Against what — a quarter with two dead weeks and no comparison group. Who benefits — a company with a product launch and a chief executive with a book. Each answer alone would have been a caveat; together they make the headline number uninterpretable, not false. The discipline the case rewards is refusing the two easy positions: taking the 38 per cent, and dismissing the whole story because of it. The sick-day and resignation numbers are smaller, cheaper claims with a different evidential status, and Raman's caution about denominators is the right one. Base rates did the rest: 38 per cent productivity gains from a single organisational change are, across the literature, very close to nonexistent, so a claim of one starts with a heavy burden. The move that ends well is the one that converts someone else's unrepeatable result into your own repeatable test.",
        keyInsight:
          "A story can be true in every sentence and false in its arrangement. Ask who measured, what, against what, and who benefits — then keep the small claims that survive.",
        subskills: ["inference.disconfirmation", "inference.base_rates", "synthesis.integration"],
      },
    ],
  },
];
