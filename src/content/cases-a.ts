/**
 * Casebook — set A (cases 0101–0105).
 *
 * Five multi-stage cases. Each runs the full eleven-stage arc:
 * enter · notice · recall · separate · hypotheses · question · evidence · update · decision · explain · debrief.
 *
 * All people, companies, vessels and hotels are fictional. Historical and scientific
 * background is accurate to the best of current knowledge; where it is contested, the text says so.
 */
import type { CaseDefinition } from "@/lib/domain/types";

/* ------------------------------------------------------------------ */
/* 0101 · The wall at 412                                               */
/* ------------------------------------------------------------------ */

const CASE_0101: CaseDefinition = {
  id: "case-0101-wall-at-412",
  number: "0101",
  title: "The Wall at 412",
  setting: "A 140-room city hotel, the front desk, 06:40 on a Friday.",
  summary:
    "A guest wants a full refund for a night of noise she says came through the wall from room 414. The night log says the corridor was quiet both times someone checked. You have four minutes before she leaves.",
  difficulty: 2,
  estimatedMinutes: 18,
  faculties: ["observation", "inference", "social", "calibration"],
  subskills: [
    "observation.detail",
    "observation.chronology",
    "observation.separation",
    "inference.hypothesis",
    "inference.alternatives",
    "inference.information_value",
    "inference.updating",
    "social.question_quality",
    "calibration.confidence",
  ],
  groundTruth:
    "Genuinely undetermined. The most likely source is room 512, directly above 412, where a family of four arrived at 01:03 after a delayed flight; a cot was delivered at 01:20 and a desk moved at 01:38. That fits the 'dragging' and the timing of her second call, though nothing records whether 512 stayed quiet afterwards. The two door events at 414 remain unexplained: reached by phone that afternoon, Mr Okafor said he went down to the lobby vending machine twice because he could not sleep, and that he had asked for a second card because the first had stopped working. Plausible, unverified. Probability that the noise came mainly from 512: perhaps 55–60 percent. From 414: perhaps 20 percent.",
  conceptLinks: ["base-rate-fallacy", "availability-heuristic"],
  safetyTags: ["fictional", "no-real-persons"],
  origin: "seeded",
  tags: ["business", "travel", "psychology"],
  stages: [
    {
      id: "0101-enter",
      kind: "enter",
      title: "Six-forty",
      setting: "The Ashgrove, a 140-room hotel near the station. Friday, 06:40.",
      narrative:
        "You are the duty manager. You came on at six, and the night team's handover was two sentences and a look. Now a woman in a coat over pyjamas is at the desk with her key card face down on the marble. Ms Halvorsen, room 412. She did not sleep, she says, because room 414 was 'at it' from midnight until three, and she called the desk three times, and she would like the night refunded in full, and she has a train at 07:30.\n\nPriya, who worked the desk overnight, is putting on her jacket. She says the floor was quiet when she checked. Twice. Then she says, more carefully, 'It was quiet when I was standing there.'\n\nYou have the night log on the screen in front of you. Read it as if you will have to defend every word of it later.",
    },
    {
      id: "0101-notice",
      kind: "notice",
      title: "The night log",
      narrative: "You have thirty-five seconds with the log before Ms Halvorsen asks what you intend to do.",
      subskills: ["observation.detail", "observation.chronology"],
      material: {
        kind: "thread",
        title: "Night log — Thursday 12 into Friday 13 June",
        seconds: 35,
        lines: [
          "23:52 · Priya (desk): 414 Mr Okafor back from the bar, collected a second key card. Wake-up call booked 07:15.",
          "00:18 · Priya (desk): 412 Ms Halvorsen rang. 'Music or a TV through the wall.' Will walk the floor.",
          "00:31 · Priya (floor 4): Quiet at 414. Faint TV audible from 416. Knocked 416; guest lowered volume.",
          "01:12 · Key system: 414 door opened (guest card).",
          "01:40 · Key system: 414 door opened (guest card).",
          "01:47 · Dan (porter, covering break): 412 rang again. 'Talking, laughing, something being dragged across the floor.'",
          "01:55 · Dan (floor 4): Corridor quiet. Nothing audible at 414 door. Rosa (night cleaner) moving trolley from service lift to 4th-floor store.",
          "02:10 · Lift 2 fault alarm. Engineer line called. Reset 02:35.",
          "03:05 · Priya (desk): 412 rang a third time. 'Still going on. I want another room.' Offered 207 (second floor, street side). Declined: 'I'm not packing at three in the morning.'",
          "05:58 · Key system: 414 door opened (guest card). Mr Okafor checked out at desk 06:04, airport taxi.",
          "06:40 · Ms Halvorsen at desk. Requests full refund of £189. Says she will 'write about this'. Duty manager called.",
        ],
      },
    },
    {
      id: "0101-recall",
      kind: "recall",
      title: "What the log said",
      narrative: "The screen has gone to the booking view. Answer from memory.",
      subskills: ["observation.detail", "observation.chronology", "observation.text"],
      questions: [
        {
          id: "0101-r1",
          prompt: "At what time did Ms Halvorsen first call the desk?",
          kind: "mcq",
          options: ["23:52", "00:18", "00:31", "01:47"],
          answer: "00:18",
          subskill: "observation.chronology",
        },
        {
          id: "0101-r2",
          prompt: "How many times did the key system record 414's door opening before Mr Okafor left for his taxi?",
          kind: "number",
          answer: "2",
          accept: ["two"],
          subskill: "observation.detail",
        },
        {
          id: "0101-r3",
          prompt: "Which room did Priya find faint TV sound coming from?",
          kind: "short",
          answer: "416",
          accept: ["room 416"],
          subskill: "observation.detail",
        },
        {
          id: "0101-r4",
          prompt: "What did Ms Halvorsen report hearing on her second call?",
          kind: "mcq",
          options: [
            "Music or a TV through the wall",
            "Talking, laughing and something dragged across the floor",
            "A door slamming repeatedly",
            "The lift alarm",
          ],
          answer: "Talking, laughing and something dragged across the floor",
          subskill: "observation.text",
        },
        {
          id: "0101-r5",
          prompt: "Which room was Ms Halvorsen offered at 03:05?",
          kind: "short",
          answer: "207",
          accept: ["room 207"],
          subskill: "observation.detail",
        },
        {
          id: "0101-r6",
          prompt: "Who took the 01:47 call?",
          kind: "mcq",
          options: ["Priya", "Dan", "Rosa", "The duty manager"],
          answer: "Dan",
          subskill: "observation.text",
        },
        {
          id: "0101-r7",
          prompt: "What refund did she ask for, in pounds?",
          kind: "number",
          answer: "189",
          accept: ["£189", "189.00"],
          subskill: "observation.detail",
        },
      ],
    },
    {
      id: "0101-separate",
      kind: "separate",
      title: "What you saw and what you are telling yourself",
      narrative:
        "Ms Halvorsen is checking the time on her phone. Before you say anything, sort these. Which are things the log shows, which are readings of it, and which does the log simply not settle?",
      subskills: ["observation.separation"],
      statements: [
        {
          id: "0101-s1",
          text: "Ms Halvorsen rang the desk three times during the night.",
          truth: "observation",
          why: "Three calls are logged: 00:18, 01:47, 03:05.",
        },
        {
          id: "0101-s2",
          text: "Room 414's door was opened with a guest card at 01:12 and at 01:40.",
          truth: "observation",
          why: "The key system records both events. What they mean is a separate question.",
        },
        {
          id: "0101-s3",
          text: "Mr Okafor had a visitor in his room.",
          truth: "inference",
          why: "Two door events and a second key card are consistent with a visitor. They are equally consistent with one man going to the vending machine twice.",
        },
        {
          id: "0101-s4",
          text: "The noise Ms Halvorsen heard came from 414.",
          truth: "inference",
          why: "That is her reading of where the sound came from. Nobody else heard anything at 414, and sound through walls and ceilings is notoriously hard to place from inside a room.",
        },
        {
          id: "0101-s5",
          text: "Neither staff member heard noise at 414 when they walked the floor.",
          truth: "observation",
          why: "Priya at 00:31, Dan at 01:55: both logged nothing audible at the door. Note how short each check was.",
        },
        {
          id: "0101-s6",
          text: "Ms Halvorsen is exaggerating to get a refund.",
          truth: "inference",
          why: "Consistent with the facts. So is a woman kept awake all night by real noise who has a train to catch. The log does not decide between them.",
        },
        {
          id: "0101-s7",
          text: "The room directly above 412 was occupied that night.",
          truth: "unknown",
          why: "The log says nothing about the fifth floor at all. That silence is itself worth noticing.",
        },
        {
          id: "0101-s8",
          text: "The second key card was the one used at 01:12 and 01:40.",
          truth: "unknown",
          why: "The system logged that a guest card opened the door. It did not log which of the two.",
        },
      ],
    },
    {
      id: "0101-hypotheses",
      kind: "hypotheses",
      title: "Where the noise could have come from",
      narrative:
        "Give three explanations: the one you find most likely, a real alternative, and one that is unlikely but possible. Each should account for the timing of the second call and the 'dragging'.",
      subskills: ["inference.hypothesis", "inference.alternatives"],
      rubric: {
        minimum: 2,
        plausible: [
          {
            title: "Guests in 414",
            keywords: ["visitor", "visitors", "guests in 414", "party", "second key", "okafor", "friends"],
            note: "The obvious story: second key card, two door events, a man back from the bar. It explains 'talking, laughing' well and 'dragging' badly, and neither staff check supports it.",
          },
          {
            title: "Noise from a different room — above, or two doors down",
            keywords: ["above", "upstairs", "512", "fifth floor", "ceiling", "416", "next door", "another room", "different room", "other room"],
            note: "Footsteps and furniture on the floor above are the commonest source of 'something dragged'. Guests reliably point at the wall because the wall is what they can see.",
          },
          {
            title: "Service corridor and night cleaning",
            keywords: ["trolley", "cleaner", "cleaning", "service corridor", "store", "rosa", "housekeeping", "lift", "staff"],
            note: "A trolley into the fourth-floor store at 01:55 and a lift fault at 02:10 put staff activity right in her window. It does not explain laughter.",
          },
          {
            title: "The complaint is inflated",
            keywords: ["exaggerat", "refund", "inflat", "review", "leverage", "light sleeper", "sensitive", "complain"],
            note: "Some fraction of refund requests are strategic. Most are not. Keep it on the list; do not let it lead.",
          },
        ],
      },
    },
    {
      id: "0101-question",
      kind: "question",
      title: "One question before you decide",
      narrative:
        "You can ask one thing, of one person or of the property system, before you answer her. Choose the one that most changes what you believe, at the least cost to the conversation.",
      subskills: ["social.question_quality", "inference.information_value"],
      allowFreeQuestion: true,
      questionOptions: [
        {
          id: "0101-q1",
          text: "To Ms Halvorsen: 'Can you tell me exactly what it sounded like, and where in the room it seemed loudest?'",
          informationValue: 0.8,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Good. Character and direction are the two things that separate 'next door' from 'upstairs', and she is the only witness. Asking her to describe rather than accuse also lowers the temperature.",
        },
        {
          id: "0101-q2",
          text: "To the property system: 'Who checked in after midnight, and to which rooms?'",
          informationValue: 0.85,
          rapportCost: 0,
          leading: false,
          feedback:
            "The best single query. Late arrivals are the base-rate explanation for noise between one and two, and the log is silent about anything but floor four.",
        },
        {
          id: "0101-q3",
          text: "To Mr Okafor, by phone: 'Did you have visitors in your room last night?'",
          informationValue: 0.35,
          rapportCost: 0.6,
          leading: false,
          feedback:
            "He will say no whether or not it is true, and you will have accused a guest from his taxi. A closed question with one likely answer buys little.",
        },
        {
          id: "0101-q4",
          text: "To Priya: 'Did she sound angry when she called, or more upset?'",
          informationValue: 0.15,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Tone of voice tells you almost nothing about where a sound came from, and Priya's memory of tone at 03:05 is not evidence of much.",
        },
        {
          id: "0101-q5",
          text: "To Ms Halvorsen: 'You'd agree we responded every time you called, wouldn't you?'",
          informationValue: 0.1,
          rapportCost: 0.7,
          leading: true,
          feedback:
            "This is a defence, not a question. It tells her what you have decided and invites her to argue with it.",
        },
      ],
    },
    {
      id: "0101-evidence",
      kind: "evidence",
      title: "The arrivals list",
      narrative: "Whatever you asked, this is what turns up while you are still talking to her.",
      subskills: ["inference.evidence_weighting"],
      reveal: {
        title: "Arrivals after midnight",
        text: "Room 512, directly above 412, checked in at 01:03: a family of four off a delayed flight, booked as a late arrival. Dan's porter log, which was not in the night log you read, has two further lines: '01:20 cot to 512' and '01:38 helped 512 move desk to make room for cot, guest apologised for the hour.' Floor five has the same room layout as floor four. Nothing in either log says whether 512 stayed quiet after 01:40.",
        supports: ["Noise from a different room — above, or two doors down"],
        undermines: ["Guests in 414"],
      },
    },
    {
      id: "0101-update",
      kind: "update",
      title: "How far did you move?",
      subskills: ["inference.updating", "calibration.confidence"],
      updatePrompt:
        "Before the arrivals list, how confident were you that room 414 was the source of the noise? Set it again now. Then look at the gap — and ask whether the two 414 door events still need an explanation, or whether you have stopped needing one because a better story arrived.",
    },
    {
      id: "0101-decision",
      kind: "decision",
      title: "What you say to her",
      narrative: "07:02. She needs to leave in eight minutes. Choose.",
      subskills: ["inference.base_rates", "composure.ambiguity", "strategy.second_order"],
      decisionOptions: [
        {
          id: "0101-d1",
          text: "Refund the night in full, and add a note to Mr Okafor's guest profile: 'noise complaint, visitors after midnight'.",
          quality: 0.25,
          errorType: "PREMATURE_CLOSURE",
          feedback:
            "The refund may be right. The note is not. You would be recording an accusation the log cannot carry, against a guest who has already left and cannot answer it, on the strength of two door events you have not explained.",
        },
        {
          id: "0101-d2",
          text: "Decline the refund: the floor was walked twice and nothing was heard at 414.",
          quality: 0.15,
          errorType: "ASSUMPTION",
          feedback:
            "Two thirty-second checks at a door are not evidence of a quiet night. And 'we heard nothing at 414' answers a question she did not ask. She asked why she could not sleep.",
        },
        {
          id: "0101-d3",
          text: "Apologise for the night she had, take the room off the bill as a goodwill gesture without assigning blame, and flag the 512 late arrival and the missing porter log for the general manager's review.",
          quality: 0.9,
          feedback:
            "This separates the two decisions that were tangled together: what the guest is owed for a bad night, and what actually happened. You can settle the first now with what you know. The second needs the porter log, the fifth floor, and a phone call — none of which she should have to wait for.",
        },
        {
          id: "0101-d4",
          text: "Hold the refund until the general manager arrives at nine; ask Ms Halvorsen to wait or to email.",
          quality: 0.4,
          errorType: "STRATEGIC_SHORTSIGHTEDNESS",
          feedback:
            "Delay costs you the guest and gains you nothing: at nine the manager will have the same log you have now. Deferring feels safe; it is just slower.",
        },
      ],
    },
    {
      id: "0101-explain",
      kind: "explain",
      title: "The nine o'clock version",
      subskills: ["rhetoric.explanation", "rhetoric.clarity", "rhetoric.concision"],
      explainPrompt:
        "In four or five sentences, write what you will tell the general manager at nine: what happened, what you did about it, and what you still do not know. Keep the observations and the guesses in separate sentences.",
    },
    {
      id: "0101-debrief",
      kind: "debrief",
      title: "Debrief",
      expertReasoning:
        "An experienced night manager reads this log for what it records and what it does not. It records three calls, two door events, two brief checks, and a trolley. It does not record the fifth floor, the porter's own log, or the direction of any sound. The obvious story — Mr Okafor and his second key card — arrives first because it is vivid and because 412 pointed at the wall. But the base rate for noise between one and two in a city hotel is late arrivals and furniture, and guests locate sound badly: a cot being wedged past a desk on the floor above is exactly what 'something dragged' sounds like from below. The expert also refuses to let 'we heard nothing' do work it cannot do; a quiet doorway at 01:55 is a sample of one moment. Then the two decisions get separated. The guest's bad night is real whoever caused it, so the goodwill decision can be made now. The question of blame needs evidence that does not yet exist — and the two door events at 414 are left standing as an open item, not quietly dropped because a better story came along.",
      keyInsight:
        "Nobody in the log heard what she heard; the only fact about direction is that she pointed at the wall, and walls are rarely where night noise comes from.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 0102 · Four thousand eight hundred and fifty, twice                  */
/* ------------------------------------------------------------------ */

const CASE_0102: CaseDefinition = {
  id: "case-0102-meridian-twice",
  number: "0102",
  title: "Four Thousand Eight Hundred and Fifty, Twice",
  setting: "A fourteen-person design studio. Tuesday evening, month-end reconciliation.",
  summary:
    "The June bank statement shows two payments of £4,850 to a supplier the ledger names differently and records only once. The amount sits just under the studio's single-signature limit. You are the only finance person, and you work two days a week.",
  difficulty: 4,
  estimatedMinutes: 26,
  faculties: ["inference", "quantitative", "observation", "strategy"],
  subskills: [
    "observation.detail",
    "observation.text",
    "observation.separation",
    "inference.hypothesis",
    "inference.base_rates",
    "inference.information_value",
    "inference.updating",
    "quantitative.arithmetic",
    "strategy.second_order",
    "rhetoric.clarity",
  ],
  groundTruth:
    "A duplicate payment of a genuine invoice. Meridian Print & Paper is a trading name of Meridian Office Supply Ltd; invoice 2291 (£4,850, 20,000 brochures for the Hallam pitch) was paid on 17 June from the banking app by Tomasz, the office manager, who then dated the ledger entry to the day he got round to it. Meridian's system posted the receipt under the studio's old trading name and generated an 'overdue' reminder on 23 June; Tomasz paid it again the next morning without checking the bank. Meridian refunded the unallocated £4,850 within the week. No diversion, no fake supplier. The real finding was the one the anomaly distracted from: the account fell to £923.75 on 19 June and three of June's four receipts came from one client.",
  conceptLinks: ["double-entry-bookkeeping", "base-rate-fallacy", "availability-heuristic"],
  safetyTags: ["fictional", "no-real-persons"],
  origin: "seeded",
  tags: ["business", "economics"],
  stages: [
    {
      id: "0102-enter",
      kind: "enter",
      title: "The line that is there twice",
      setting: "Fennel & Vane, a brand-design studio of fourteen people. The kitchen table that serves as the finance desk.",
      narrative:
        "You look after the money at Fennel & Vane two days a week. Tomasz, the office manager, raises purchase orders and can authorise payments up to £5,000 on his own; above that, a director has to co-sign. It is a rule you wrote.\n\nTonight you are reconciling June. The ledger has one supplier payment you do not recognise by name: 'Meridian Print & Paper', £4,850, dated 19 June, approved by Tomasz, coded to the Hallam pitch. The bank statement has no line by that name. It has two lines — 17 June and 24 June — to 'MERIDIAN OFFICE SUPPLY LTD', each for exactly £4,850.\n\nOne ledger entry. Two bank payments. A different name. An amount one hundred and fifty pounds under the limit that would have needed a second signature. You notice that your pulse has changed. Notice that, and then read the statement properly.",
    },
    {
      id: "0102-notice",
      kind: "notice",
      title: "June, from the bank's side",
      narrative: "Forty seconds with the statement. Read the numbers, not just the names.",
      subskills: ["observation.detail", "observation.text"],
      material: {
        kind: "table",
        title: "Business current account — June statement",
        seconds: 40,
        columns: ["Date", "Description", "Out (£)", "In (£)", "Balance (£)"],
        rows: [
          ["02 Jun", "HALLAM & CO — INV 1042", "", "18,000.00", "41,220.15"],
          ["05 Jun", "PAYROLL BACS", "31,400.00", "", "9,820.15"],
          ["09 Jun", "HMRC PAYE", "8,150.00", "", "1,670.15"],
          ["11 Jun", "RUDD STUDIOS — INV 1039", "", "12,500.00", "14,170.15"],
          ["13 Jun", "ADOBE SYSTEMS", "1,196.40", "", "12,973.75"],
          ["17 Jun", "MERIDIAN OFFICE SUPPLY LTD", "4,850.00", "", "8,123.75"],
          ["19 Jun", "WORKSPACE RENT — Q3", "7,200.00", "", "923.75"],
          ["23 Jun", "HALLAM & CO — INV 1047", "", "9,600.00", "10,523.75"],
          ["24 Jun", "MERIDIAN OFFICE SUPPLY LTD", "4,850.00", "", "5,673.75"],
          ["26 Jun", "TFL TRAVEL", "214.30", "", "5,459.45"],
          ["30 Jun", "HALLAM & CO — INV 1051", "", "9,600.00", "15,059.45"],
        ],
      },
    },
    {
      id: "0102-recall",
      kind: "recall",
      title: "What the statement said",
      narrative: "Close the statement. Answer from memory; the numbers matter here.",
      subskills: ["observation.detail", "observation.text", "observation.chronology"],
      questions: [
        {
          id: "0102-r1",
          prompt: "What was the closing balance on 19 June, in pounds?",
          kind: "number",
          answer: "923.75",
          accept: ["923", "£923.75", "923.75"],
          subskill: "observation.detail",
        },
        {
          id: "0102-r2",
          prompt: "Which client paid in three times during June?",
          kind: "mcq",
          options: ["Hallam & Co", "Rudd Studios", "Meridian Office Supply", "Workspace"],
          answer: "Hallam & Co",
          subskill: "observation.text",
        },
        {
          id: "0102-r3",
          prompt: "How many days apart were the two Meridian payments?",
          kind: "number",
          answer: "7",
          accept: ["seven", "a week"],
          subskill: "observation.chronology",
        },
        {
          id: "0102-r4",
          prompt: "What was the payroll BACS amount, in pounds?",
          kind: "number",
          answer: "31400",
          accept: ["31,400", "31,400.00", "£31,400"],
          subskill: "observation.detail",
        },
        {
          id: "0102-r5",
          prompt: "Which payment took the balance below £1,000?",
          kind: "mcq",
          options: ["HMRC PAYE", "Workspace rent — Q3", "Meridian (17 June)", "Adobe Systems"],
          answer: "Workspace rent — Q3",
          subskill: "observation.detail",
        },
        {
          id: "0102-r6",
          prompt: "Under what exact name did the Meridian payments appear on the statement?",
          kind: "short",
          answer: "Meridian Office Supply Ltd",
          accept: ["meridian office supply", "meridian office supply ltd"],
          subskill: "observation.text",
        },
        {
          id: "0102-r7",
          prompt: "How much did Rudd Studios pay on 11 June, in pounds?",
          kind: "number",
          answer: "12500",
          accept: ["12,500", "12,500.00", "£12,500"],
          subskill: "observation.detail",
        },
      ],
    },
    {
      id: "0102-separate",
      kind: "separate",
      title: "Facts, readings, gaps",
      narrative:
        "Your pulse has settled. Now sort what you have. Some of these are on the page; some are stories you brought to the page; some are questions nobody has answered yet.",
      subskills: ["observation.separation"],
      statements: [
        {
          id: "0102-s1",
          text: "Two payments of £4,850 to Meridian Office Supply Ltd left the account in June.",
          truth: "observation",
          why: "17 June and 24 June, on the statement.",
        },
        {
          id: "0102-s2",
          text: "The ledger records one payment of £4,850 to Meridian Print & Paper, dated 19 June.",
          truth: "observation",
          why: "That is what the ledger says. Whether the date means anything is another matter.",
        },
        {
          id: "0102-s3",
          text: "Someone has diverted £4,850 to a fake supplier.",
          truth: "inference",
          why: "One reading of the mismatch. It requires a fake supplier whose registered name happens to share a word with a real one, which is not impossible, and not the only story.",
        },
        {
          id: "0102-s4",
          text: "The account fell below £1,000 on 19 June.",
          truth: "observation",
          why: "£923.75 after the rent. This is the line the Meridian question is pulling your eye away from.",
        },
        {
          id: "0102-s5",
          text: "£4,850 was chosen to stay under the £5,000 single-signature limit.",
          truth: "inference",
          why: "Vivid, and possibly true. It is also what a 20,000-unit print run can cost. The number is consistent with fraud; it is not evidence of it.",
        },
        {
          id: "0102-s6",
          text: "Meridian Print & Paper and Meridian Office Supply Ltd are the same company.",
          truth: "unknown",
          why: "Trading names and registered names differ all the time. Nothing you have read tonight says whether they do here.",
        },
        {
          id: "0102-s7",
          text: "The studio is dangerously dependent on one client for cash.",
          truth: "inference",
          why: "Three of four June receipts came from Hallam. That is a reasonable reading of one month, not a fact about the business.",
        },
        {
          id: "0102-s8",
          text: "Both Meridian payments went to the same bank account.",
          truth: "unknown",
          why: "The statement shows the payee name, not the account. This is the single fact that would split your hypotheses most cleanly.",
        },
      ],
    },
    {
      id: "0102-hypotheses",
      kind: "hypotheses",
      title: "What produces one entry and two payments",
      narrative:
        "Before you write to anyone, list the explanations. Your most likely, a genuine alternative, and one you would be embarrassed to have missed. Each should explain both the second payment and the different name.",
      subskills: ["inference.hypothesis", "inference.alternatives", "inference.base_rates"],
      rubric: {
        minimum: 2,
        plausible: [
          {
            title: "Duplicate payment of a genuine invoice",
            keywords: ["duplicate", "paid twice", "double payment", "twice", "reminder", "again", "repeat"],
            note: "The base-rate answer. Small companies without a reconcile-before-pay step pay the same invoice twice more often than anyone admits, usually after an automated reminder.",
          },
          {
            title: "Diversion by someone with payment authority",
            keywords: ["fraud", "fake supplier", "diverted", "embezzl", "theft", "misappropriat", "stolen", "personal account"],
            note: "Rare, serious, and the story the £4,850 figure invites. It needs a payee account that is not Meridian's. Test that before you believe it.",
          },
          {
            title: "Two genuine invoices, one not yet in the ledger",
            keywords: ["second invoice", "two orders", "reprint", "not yet entered", "unrecorded", "lag", "second order", "another invoice"],
            note: "A reprint or second run for the Hallam pitch would produce exactly this, with the ledger simply behind. Ask whether anything else arrived from Meridian.",
          },
          {
            title: "Two names, one company",
            keywords: ["trading name", "registered name", "same company", "legal name", "trading as", "t/a"],
            note: "Explains the name mismatch entirely and the second payment not at all. Necessary for the innocent stories, and cheap to check on the invoice footer.",
          },
        ],
      },
    },
    {
      id: "0102-question",
      kind: "question",
      title: "One enquiry before you sleep",
      narrative:
        "It is 21:10. You can send one message tonight and expect an answer by morning. Choose the one that most cleanly separates your hypotheses — and think about what each one signals to the person you send it to.",
      subskills: ["social.question_quality", "inference.information_value", "strategy.second_order"],
      allowFreeQuestion: true,
      questionOptions: [
        {
          id: "0102-q1",
          text: "To the bank: 'Please confirm the payee sort code and account number for the payments of 17 and 24 June.'",
          informationValue: 0.9,
          rapportCost: 0,
          leading: false,
          feedback:
            "The cleanest split available. Same account as the invoice: duplicate or second order. Different account: a different evening. Nobody inside the studio is alerted.",
        },
        {
          id: "0102-q2",
          text: "To Meridian's accounts team: 'Could you send a statement of account showing what you have received from us against invoice 2291?'",
          informationValue: 0.85,
          rapportCost: 0.1,
          leading: false,
          feedback:
            "Nearly as good, and faster in practice: a supplier's statement shows receipts, allocations and any unallocated cash. It also settles the trading-name question in the footer.",
        },
        {
          id: "0102-q3",
          text: "To Tomasz: 'Did you pay Meridian twice?'",
          informationValue: 0.5,
          rapportCost: 0.5,
          leading: true,
          feedback:
            "If it was a slip he will tell you and be mortified. If it was not, you have just told him what you are looking at, tonight, before you know anything. Order matters.",
        },
        {
          id: "0102-q4",
          text: "To the design lead: 'Did the Hallam brochures arrive, and how many?'",
          informationValue: 0.3,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Confirms one real order, which almost nobody doubted. It does not distinguish a duplicate from a diversion, since a fraud can sit beside a genuine invoice.",
        },
        {
          id: "0102-q5",
          text: "To Tomasz: 'You do know the two-signature rule applies over £5,000?'",
          informationValue: 0.1,
          rapportCost: 0.8,
          leading: true,
          feedback:
            "An accusation shaped like a question. It gains no information and, if he is innocent, costs you the office manager's goodwill for a year.",
        },
      ],
    },
    {
      id: "0102-evidence",
      kind: "evidence",
      title: "The remittance",
      narrative: "By 09:40 the next morning you have two replies.",
      subskills: ["inference.evidence_weighting"],
      reveal: {
        title: "Statement of account, and the bank",
        text: "Meridian's accounts team sends a statement of account. Invoice 2291 — £4,850, '20,000 A5 brochures, Hallam pitch' — is marked paid on 17 June. A second receipt of £4,850 on 24 June sits on a line labelled 'unallocated — please advise'. The footer of the statement reads: 'Meridian Print & Paper is a trading name of Meridian Office Supply Ltd.' The bank confirms that both payments went to the same sort code and account number, and it is the one printed on Meridian's invoice.",
        supports: ["Duplicate payment of a genuine invoice", "Two names, one company"],
        undermines: ["Diversion by someone with payment authority"],
      },
    },
    {
      id: "0102-update",
      kind: "update",
      title: "Where your number came from",
      subskills: ["inference.updating", "calibration.confidence"],
      updatePrompt:
        "Before the remittance, how confident were you that money had been diverted? Set it again now. If your first number was above 50 percent, ask what in the statement earned it — and whether it was the £4,850 sitting just under the limit, a detail that would look identical in an honest print run.",
    },
    {
      id: "0102-decision",
      kind: "decision",
      title: "What you do with it",
      narrative: "You have the facts by mid-morning. The directors have a board call at four. Choose.",
      subskills: ["strategy.second_order", "inference.base_rates", "composure.revision"],
      decisionOptions: [
        {
          id: "0102-d1",
          text: "Report suspected fraud to the directors and suspend Tomasz's payment access this afternoon.",
          quality: 0.25,
          errorType: "PREMATURE_CLOSURE",
          feedback:
            "The evidence now points the other way, and you would be acting on the version of events you had before it arrived. Suspending access is not reversible in the way a spreadsheet is.",
        },
        {
          id: "0102-d2",
          text: "Ask Meridian to refund the unallocated £4,850, record the duplicate, and propose two changes: reconcile the bank before paying any reminder, and dual approval on all supplier payments regardless of size.",
          quality: 0.95,
          feedback:
            "Recover the cash, record what happened truthfully, and fix the process that made it possible rather than the person it happened to. The dual-approval change also quietly closes the door you were worried about, without an accusation.",
        },
        {
          id: "0102-d3",
          text: "Post the second payment to office supplies so the ledger matches the bank.",
          quality: 0.05,
          errorType: "ASSUMPTION",
          feedback:
            "The ledger would match, and it would be wrong. Double-entry exists so that a false balance is harder to produce than a true one; do not use it to manufacture one.",
        },
        {
          id: "0102-d4",
          text: "Wait for the July statement to see whether the pattern repeats before raising it.",
          quality: 0.2,
          errorType: "INFORMATION_VALUE",
          feedback:
            "July cannot tell you anything the remittance has not already told you, and £4,850 stays in someone else's account while you wait.",
        },
      ],
    },
    {
      id: "0102-explain",
      kind: "explain",
      title: "The note to the directors",
      subskills: ["rhetoric.clarity", "rhetoric.concision", "rhetoric.explanation"],
      explainPrompt:
        "Write the note you will send the two directors before their four o'clock: three or four sentences, no jargon, saying what happened, what it was not, what changes — and the one thing about June's cash you think they should actually be worried about.",
    },
    {
      id: "0102-debrief",
      kind: "debrief",
      title: "Debrief",
      expertReasoning:
        "An experienced bookkeeper meets this mismatch with a base rate, not a feeling. In a small company with one person raising and paying invoices, the overwhelming majority of bank-to-ledger discrepancies are naming differences, timing differences and duplicates; diversion is real but rare. The £4,850 figure is the kind of detail that makes the rare story feel likely — it is vivid, it fits a plot, and it is exactly what an honest print run of that size costs. So the expert does not ask 'is this fraud?' but 'what single fact separates the innocent stories from the guilty one?' The answer is the payee account, obtainable from the bank or the supplier without alerting anyone inside the firm. Only after that does the conversation with Tomasz happen, and by then it is about process. The expert also refuses to let the anomaly monopolise the evening: the same statement shows a balance of £923.75 on the 19th and three receipts out of four from a single client. That is the finding a director should lose sleep over.",
      keyInsight:
        "Ask the question that splits your hypotheses before the question that alarms a person; the account number was cheap, and the accusation would not have been.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 0103 · The port that was not there                                   */
/* ------------------------------------------------------------------ */

const CASE_0103: CaseDefinition = {
  id: "case-0103-port-not-there",
  number: "0103",
  title: "The Port That Was Not There",
  setting: "A maritime museum's reading room. The papers of a Liverpool shipping firm, 1888–1921.",
  summary:
    "A 1907 outward manifest for a Caribbean steamer lists Saint-Pierre, Martinique, as a port of call. Saint-Pierre was destroyed by Mont Pelée in May 1902. You have to write the catalogue entry, and researchers will trust it.",
  difficulty: 5,
  estimatedMinutes: 30,
  faculties: ["observation", "inference", "knowledge", "calibration"],
  subskills: [
    "observation.text",
    "observation.detail",
    "observation.separation",
    "inference.hypothesis",
    "inference.alternatives",
    "inference.disconfirmation",
    "inference.information_value",
    "inference.updating",
    "knowledge.history",
    "knowledge.geography",
    "calibration.uncertainty",
  ],
  groundTruth:
    "Most probably no call was made. The manifest is on a stock form printed in November 1899 that lists the firm's pre-1902 itinerary; the consignee, Maison Delaunay, had moved from Saint-Pierre to Fort-de-France after the eruption, and the clerk's pencil note 'St P — see Fort de F' shows he knew it. The following voyage's manifest strikes 'St. Pierre' through in ink and gives Delaunay's Fort-de-France address. The customs stamp fixes the year as 1907 and rules out a misdating. What the document cannot show is that the Corrib did not anchor off the ruins on the way in: some traffic to the Saint-Pierre roadstead did resume in the years after 1902, on a scale sources disagree about. Stationery plus relocated consignee, roughly 75 percent; an actual call at Saint-Pierre, perhaps 15 percent; something else, 10 percent. A check of Lloyd's List arrivals for April 1907 would narrow it further.",
  conceptLinks: ["falsifiability", "containerization", "reading-evidence"],
  safetyTags: ["fictional-firm", "real-historical-context", "no-real-persons"],
  origin: "seeded",
  tags: ["history", "geopolitics", "travel"],
  stages: [
    {
      id: "0103-enter",
      kind: "enter",
      title: "Box 14",
      setting: "The Merrow Maritime Collection. Reading room, a Tuesday in February. Pencils only.",
      narrative:
        "You are cataloguing the papers of Bramhall & Sons, a Liverpool firm that ran two small steamers to the West Indies from the 1880s until the war finished them. Box 14 is outward manifests, 1905–1909: a clerk's list of what each ship carried, for whom, and where it was bound.\n\nThe seventh item stops you. An outward manifest for the S.S. Corrib, cleared Liverpool in March 1907, gives its ports of call as Barbados, St. Pierre, Fort de France, Demerara. Saint-Pierre, Martinique, was the island's commercial capital until the morning of 8 May 1902, when Mont Pelée destroyed it in minutes and killed almost everyone in it — the usual figure is around 28,000, and it is not precise. By 1907 the town was rubble with a few hundred people living in it. Fort-de-France had taken its trade.\n\nSo why does a 1907 manifest send cargo to a port that had ceased to exist? The head archivist, Dr Ferris, puts her head round the door: 'Anything interesting?' You are about to find out. First, read the thing.",
    },
    {
      id: "0103-notice",
      kind: "notice",
      title: "Item 14/7",
      narrative: "Forty-five seconds with the manifest. Read it like a document, not a story: what is printed, what is written, what is stamped.",
      subskills: ["observation.text", "observation.detail"],
      material: {
        kind: "document",
        title: "Outward manifest — S.S. Corrib — Bramhall & Sons",
        seconds: 45,
        lines: [
          "[printed] BRAMHALL & SONS, 21 Water Street, Liverpool. OUTWARD MANIFEST.",
          "[printed] S.S. CORRIB, 1,840 tons. Master: [ms.] J. Deasy.",
          "[ms.] Cleared Liverpool 14 March 1907. Voyage No. 31.",
          "[printed] Ports of call: BARBADOS — ST. PIERRE — FORT DE FRANCE — DEMERARA.",
          "[ms.] Cargo: 400 bbls. Portland cement (Barbados); 120 cases Manchester cottons (St. Pierre); 60 hhds. salt beef (Fort de France); 2,000 ft. pitch pine fittings (Demerara).",
          "[ms.] Passengers: 6 saloon, 14 steerage.",
          "[ms.] Freight paid at Liverpool: £1,212 4s. 6d.",
          "[ms.] Insured: Lloyd's policy no. 4471, at 35s. per cent.",
          "[ms.] Consignee at St. Pierre: Maison Delaunay, Rue Victor Hugo.",
          "[stamp] CUSTOM HOUSE LIVERPOOL — 15 MAR 1907.",
          "[pencil, margin] St P — see Fort de F.",
          "[printed, foot] Form B/S 12 — 5,000 — 11/99.",
          "[ms.] For Bramhall & Sons: W. H. Tate, clerk.",
        ],
      },
    },
    {
      id: "0103-recall",
      kind: "recall",
      title: "What the manifest said",
      narrative: "Dr Ferris has taken the folder to look at it herself. Answer from memory.",
      subskills: ["observation.text", "observation.detail", "observation.chronology"],
      questions: [
        {
          id: "0103-r1",
          prompt: "On what date was the Corrib cleared from Liverpool?",
          kind: "short",
          answer: "14 March 1907",
          accept: ["14 march", "march 14", "14/3/1907", "14 mar 1907", "14th march"],
          subskill: "observation.chronology",
        },
        {
          id: "0103-r2",
          prompt: "What was the Corrib's tonnage?",
          kind: "number",
          answer: "1840",
          accept: ["1,840"],
          subskill: "observation.detail",
        },
        {
          id: "0103-r3",
          prompt: "How many cases of Manchester cottons were consigned to St. Pierre?",
          kind: "number",
          answer: "120",
          subskill: "observation.detail",
        },
        {
          id: "0103-r4",
          prompt: "Which line on the manifest was printed rather than handwritten?",
          kind: "mcq",
          options: ["The cargo list", "The ports of call", "The consignee at St. Pierre", "The voyage number"],
          answer: "The ports of call",
          subskill: "observation.text",
        },
        {
          id: "0103-r5",
          prompt: "What was the printer's imprint at the foot of the form?",
          kind: "short",
          answer: "Form B/S 12 — 5,000 — 11/99",
          accept: ["11/99", "5,000 — 11/99", "b/s 12", "5000 11/99", "form b/s 12"],
          subskill: "observation.text",
        },
        {
          id: "0103-r6",
          prompt: "What did the pencil note in the margin say?",
          kind: "mcq",
          options: ["Cancelled — see voyage 32", "St P — see Fort de F.", "Delaunay — no longer trading", "Check with Lloyd's"],
          answer: "St P — see Fort de F.",
          subskill: "observation.text",
        },
        {
          id: "0103-r7",
          prompt: "How many steerage passengers were listed?",
          kind: "number",
          answer: "14",
          accept: ["fourteen"],
          subskill: "observation.detail",
        },
      ],
    },
    {
      id: "0103-separate",
      kind: "separate",
      title: "What the paper shows",
      narrative:
        "Cataloguing is the discipline of not writing down what you think happened. Sort these: what the document shows, what you are inferring from it, and what it cannot settle.",
      subskills: ["observation.separation"],
      statements: [
        {
          id: "0103-s1",
          text: "The form's printed ports of call include St. Pierre.",
          truth: "observation",
          why: "Printed, not written. That distinction is the hinge of the case.",
        },
        {
          id: "0103-s2",
          text: "The Custom House stamp is dated 15 March 1907.",
          truth: "observation",
          why: "A stamp applied by a third party, the day after the clerk's date. It is the strongest dating evidence on the page.",
        },
        {
          id: "0103-s3",
          text: "The Corrib called at Saint-Pierre in March or April 1907.",
          truth: "unknown",
          why: "A manifest is a declaration made before sailing. Nothing on it records an arrival anywhere.",
        },
        {
          id: "0103-s4",
          text: "The form was printed in November 1899, before the eruption.",
          truth: "inference",
          why: "Reading '11/99' as month and year is the conventional reading of a printer's imprint, and a strong inference. It is still an inference.",
        },
        {
          id: "0103-s5",
          text: "Maison Delaunay was still trading in Saint-Pierre in 1907.",
          truth: "unknown",
          why: "The manifest gives the consignee an address there. It does not say the address was current, and the pencil note hints it was not.",
        },
        {
          id: "0103-s6",
          text: "The clerk knew Saint-Pierre had been destroyed.",
          truth: "inference",
          why: "'St P — see Fort de F' reads like a man correcting a form he cannot reprint. A Liverpool shipping clerk in 1907 would almost certainly have known; but 'almost certainly' is not the document telling you.",
        },
        {
          id: "0103-s7",
          text: "120 cases of Manchester cottons were consigned to a St. Pierre address.",
          truth: "observation",
          why: "In the clerk's hand, in the cargo list and again in the consignee line.",
        },
        {
          id: "0103-s8",
          text: "The document is a misread 1901 manifest.",
          truth: "inference",
          why: "A hypothesis, not a reading. Hold it against the stamp before you let it stand.",
        },
      ],
    },
    {
      id: "0103-hypotheses",
      kind: "hypotheses",
      title: "Why a dead port is on a live form",
      narrative:
        "Give your most likely explanation, a genuine alternative, and one you would rather rule out than assume away. Each must account for the printed itinerary, the handwritten St. Pierre consignee, and the pencil note.",
      subskills: ["inference.hypothesis", "inference.alternatives", "knowledge.history"],
      rubric: {
        minimum: 2,
        plausible: [
          {
            title: "Stock stationery outlived the port",
            keywords: ["pre-printed", "preprinted", "printed form", "stationery", "old form", "1899", "template", "stock", "printed before"],
            note: "Five thousand forms printed in 1899 for a two-ship firm would last a decade. Edwardian offices used up what they had. This explains the printed line completely and the handwritten consignee not at all.",
          },
          {
            title: "Consignee's old address, cargo landed elsewhere",
            keywords: ["fort-de-france", "fort de france", "relocated", "moved", "consignee", "delaunay", "landed elsewhere", "transhipped", "new address", "customer"],
            note: "Merchants who survived 1902 mostly re-established themselves in Fort-de-France, and a shipping firm's customer ledger might carry the old address for years. The pencil note is the clerk's own version of this hypothesis.",
          },
          {
            title: "The document is misdated",
            keywords: ["1901", "misdated", "misread", "wrong year", "date", "earlier voyage", "1 and 7"],
            note: "A 1 and a 7 in an Edwardian hand can be close. Worth listing precisely because it is cheap to test: the customs stamp is a second, independent date.",
          },
          {
            title: "The ship actually called at the ruins",
            keywords: ["actually called", "roadstead", "anchorage", "resettle", "returned", "rebuilding", "salvage", "did call", "still a port", "anchored"],
            note: "Some vessels did anchor off Saint-Pierre after 1902 — for salvage, for the small returning population, for rum from the surviving distilleries nearby. How much, and how soon, is disputed. Not to be dismissed; not evidenced by this page.",
          },
        ],
      },
    },
    {
      id: "0103-question",
      kind: "question",
      title: "One afternoon of research",
      narrative:
        "Dr Ferris gives you the rest of the afternoon. You can pursue one line properly. Choose the one that best distinguishes your hypotheses, not the one that best confirms your favourite.",
      subskills: ["inference.information_value", "inference.disconfirmation", "curiosity.questioning"],
      allowFreeQuestion: true,
      questionOptions: [
        {
          id: "0103-q1",
          text: "Search Lloyd's List for arrivals and sailings of the Corrib at Barbados, Martinique and Demerara in April 1907.",
          informationValue: 0.85,
          rapportCost: 0,
          leading: false,
          feedback:
            "The right instinct: a manifest is a plan, Lloyd's List is a record. If the Corrib is reported at Fort-de-France with no mention of Saint-Pierre, the 'actual call' story weakens; if she is reported off Saint-Pierre, everything changes. Slow, but decisive.",
        },
        {
          id: "0103-q2",
          text: "Pull the other Bramhall manifests from 1903 to 1910 and see whether, and when, the printed itinerary changes.",
          informationValue: 0.8,
          rapportCost: 0,
          leading: false,
          feedback:
            "Excellent and cheap. If every form through 1909 carries the same printed line, the stationery story is nearly proven. If the forms change in 1903 and this one is an outlier, you have a different puzzle.",
        },
        {
          id: "0103-q3",
          text: "Ask Dr Ferris whether any item in this collection has ever been re-dated.",
          informationValue: 0.3,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Useful background about the collection; almost no information about this document, which carries its own second date in the stamp.",
        },
        {
          id: "0103-q4",
          text: "Ask Dr Ferris: 'This has to be a misdated 1901 form, surely?'",
          informationValue: 0.1,
          rapportCost: 0.5,
          leading: true,
          feedback:
            "You have proposed an answer to the one person whose job is to doubt it, and the answer ignores the stamp. She will be polite about it.",
        },
        {
          id: "0103-q5",
          text: "Search the firm's correspondence boxes for letters to or from Maison Delaunay after 1902.",
          informationValue: 0.75,
          rapportCost: 0,
          leading: false,
          feedback:
            "Good. A single letter with a Fort-de-France letterhead settles the consignee question. It does not settle whether the ship called at Saint-Pierre on the way past.",
        },
      ],
    },
    {
      id: "0103-evidence",
      kind: "evidence",
      title: "Voyage 32",
      narrative: "Whatever you chose, the next item in the box was waiting for you.",
      subskills: ["inference.evidence_weighting"],
      reveal: {
        title: "Item 14/8",
        text: "The manifest for voyage 32, cleared 2 May 1907, is on the same 1899 form. This time 'ST. PIERRE' in the printed itinerary is struck through in ink and 'Fort de France' is written above it. Eighty cases of cottons are consigned to 'Maison Delaunay, Rue Blénac, Fort-de-France (late of St. Pierre)'. In the reference shelf, a colonial trade directory for 1906 lists Delaunay, marchand de tissus, at Rue Blénac, Fort-de-France. Nothing in either document says where the Corrib actually anchored.",
        supports: ["Stock stationery outlived the port", "Consignee's old address, cargo landed elsewhere"],
        undermines: ["The document is misdated", "The ship actually called at the ruins"],
      },
    },
    {
      id: "0103-update",
      kind: "update",
      title: "How much did voyage 32 buy you?",
      subskills: ["inference.updating", "calibration.uncertainty"],
      updatePrompt:
        "Before item 14/8, how confident were you that the Corrib did not call at Saint-Pierre in 1907? Set it again now. Then notice what the new document actually shows: the consignee moved and the clerk fixed the form. It does not show where the ship went. Did your number move further than that evidence can carry?",
    },
    {
      id: "0103-decision",
      kind: "decision",
      title: "The catalogue entry",
      narrative: "Dr Ferris wants the entry by five. Researchers will read it in fifty years without you there to explain. Choose the shape of it.",
      subskills: ["calibration.uncertainty", "composure.ambiguity", "rhetoric.precision"],
      insufficientEvidenceIsCorrect: true,
      decisionOptions: [
        {
          id: "0103-d1",
          text: "Catalogue as: 'Outward manifest, S.S. Corrib, 1907, calling at Barbados, Saint-Pierre (Martinique), Fort-de-France and Demerara.'",
          quality: 0.2,
          errorType: "ASSUMPTION",
          feedback:
            "You have turned a printed line on stock stationery into a voyage. A researcher fifty years from now would cite this as evidence that Saint-Pierre received Liverpool cargo in 1907. It may have. Your document does not show it.",
        },
        {
          id: "0103-d2",
          text: "Catalogue as misdated: 'probably 1901; the 7 is a misread 1.'",
          quality: 0.1,
          errorType: "OBSERVATION_MISS",
          feedback:
            "The Custom House stamp says 15 MAR 1907 in a different hand and a different ink. A theory that requires ignoring the strongest date on the page is not a theory; it is a preference.",
        },
        {
          id: "0103-d3",
          text: "Catalogue as 1907; note that the itinerary is pre-printed on an 1899 form, that the Saint-Pierre consignee had relocated to Fort-de-France by 1906, that the clerk's pencil note and the next manifest show the goods redirected, and that no call at Saint-Pierre is evidenced. Flag for cross-check against Lloyd's List arrivals, April 1907.",
          quality: 0.95,
          feedback:
            "This is what a catalogue entry is for: the document's facts, your inference marked as inference, and the open question left open with a pointer to where it could be closed. It says less than you believe, and everything you can show.",
        },
        {
          id: "0103-d4",
          text: "Withhold the item from the catalogue until the question is settled.",
          quality: 0.4,
          errorType: "UNDERCONFIDENCE",
          feedback:
            "Caution that costs the reader everything. You know enough to describe the document accurately; withholding it hides good evidence because one question remains — and most archival questions remain.",
        },
      ],
    },
    {
      id: "0103-explain",
      kind: "explain",
      title: "Write the entry",
      subskills: ["rhetoric.precision", "rhetoric.concision", "rhetoric.clarity"],
      explainPrompt:
        "Write the catalogue note itself: two or three sentences a researcher could trust without you, separating what the document shows from what you infer, and naming the one check that would settle what is left.",
    },
    {
      id: "0103-debrief",
      kind: "debrief",
      title: "Debrief",
      expertReasoning:
        "An archivist reads the page in layers before reading it as a story. Printed, handwritten, stamped, pencilled: four hands, four moments, and each carries different evidential weight. The printed itinerary is the firm's past, set in type in 1899 and never revised; the clerk's hand is March 1907; the stamp is an independent witness to the date; the pencil is somebody's afterthought. Once the layers are separated, the anomaly mostly dissolves — a form outlived a port, a customer moved, a clerk improvised. The expert then looks for the cheapest disconfirmation of each remaining story: the stamp kills the misdating; the next manifest and a trade directory settle the consignee. What survives is the one question the document was never able to answer, because a manifest declares intent and records nothing about where a ship went. A different Saint-Pierre — the French islands off Newfoundland — was worth a moment's thought and no more; the cargo and the neighbouring ports place this one in the Antilles. The catalogue entry that results is hedged, dated, and honest about its edge, which is what makes it useful to someone who will never meet you.",
      keyInsight:
        "A document is several documents in different hands; separate them by who made each mark and when, and most 'impossibilities' turn out to be stationery.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 0104 · Forty-two percent                                             */
/* ------------------------------------------------------------------ */

const CASE_0104: CaseDefinition = {
  id: "case-0104-forty-two-percent",
  number: "0104",
  title: "Forty-two Percent",
  setting: "A cell biology lab, a university building. The week before a grant renewal is due.",
  summary:
    "In March a graduate student found that a compound cut cancer-cell migration by 42 percent. In August a technician repeated the experiment with better controls and found 6 percent. The principal investigator wants to know, by Friday, whether the result is real.",
  difficulty: 5,
  estimatedMinutes: 32,
  faculties: ["inference", "observation", "quantitative", "calibration"],
  subskills: [
    "observation.detail",
    "observation.text",
    "observation.separation",
    "inference.hypothesis",
    "inference.alternatives",
    "inference.causal",
    "inference.information_value",
    "inference.updating",
    "inference.disconfirmation",
    "quantitative.statistics",
    "calibration.confidence",
    "knowledge.science",
  ],
  groundTruth:
    "Both numbers are honest and neither is the answer. The compound probably has a real, modest effect — somewhere around 20 to 25 percent at 18 hours in low-passage cells — which the August experiment concealed by measuring at 24 hours, when control cells had already closed 88 percent of the wound and there was no headroom left for a difference to show. The March figure of 42 percent was inflated by three plates, unblinded manual scoring and the ordinary fact that a result selected for being striking regresses toward its true size when repeated. Passage drift (p.14 versus p.41) and the two compound lots remain unexcluded contributors. The 18-hour reanalysis of Marcus's data is suggestive and post hoc; it cannot stand as a replication. Insufficient evidence is the correct verdict, and the third experiment — endpoint fixed in advance, low-passage cells, both lots side by side, blinded — is the correct next step. When it was run, KX-114 reduced closure at 18 hours by 23 percent, p = 0.008, n = 6.",
  conceptLinks: ["falsifiability", "bayes-theorem", "base-rate-fallacy"],
  safetyTags: ["fictional", "no-real-persons", "no-medical-advice"],
  origin: "seeded",
  tags: ["science", "psychology"],
  stages: [
    {
      id: "0104-enter",
      kind: "enter",
      title: "Two numbers",
      setting: "The Okonjo lab, fourth floor. A whiteboard with two numbers on it and a circle around each.",
      narrative:
        "You are the senior postdoc. In March, Lena — second-year graduate student, capable, working too many hours — ran a scratch-wound assay: a confluent sheet of breast cancer cells, a straight scratch through it, and a measurement of how far the cells migrate to close the gap. With the compound KX-114 in the medium, the wound closed 42 percent less than with vehicle alone. Three plates per arm, p equals 0.01. The lab was pleased. A paragraph about it went into the grant renewal.\n\nIn August Marcus, a new technician with a reputation for doing things properly, repeated it. Six plates per arm, blinded, scored by machine. Six percent, not significant.\n\nThe PI, Dr Okonjo, has asked you to tell her by Friday whether KX-114 does anything. Lena has stopped coming to lab meeting. Marcus is careful not to look pleased. Before you talk to either of them, read the two protocols side by side, and read them for differences, not for blame.",
    },
    {
      id: "0104-notice",
      kind: "notice",
      title: "Side by side",
      narrative: "Forty-five seconds with the comparison table. Everything that differs between the columns is a candidate explanation.",
      subskills: ["observation.detail", "observation.text"],
      material: {
        kind: "table",
        title: "Scratch-wound assay, KX-114 — March vs August",
        seconds: 45,
        columns: ["", "March (Lena)", "August (Marcus)"],
        rows: [
          ["Cell line, passage", "MDA-MB-231, p.14", "MDA-MB-231, p.41"],
          ["Compound", "KX-114 lot 0322, 10 µM", "KX-114 lot 0719, 10 µM"],
          ["Serum", "FBS lot A88, 10%", "FBS lot C12, 10%"],
          ["Plates per arm", "3", "6"],
          ["Closure measured at", "18 h", "24 h"],
          ["Closure, vehicle", "61%", "88%"],
          ["Closure, KX-114", "35%", "83%"],
          ["Reduction", "42% (p = 0.01)", "6% (n.s.)"],
          ["Imaging and scoring", "Manual, ImageJ, scored by Lena", "Automated, IncuCyte"],
          ["Blinded", "No", "Yes"],
          ["Mycoplasma test", "12 Feb: negative", "30 Jul: negative"],
          ["Incubator", "Inc. 2, 5% CO2", "Inc. 4, 5% CO2"],
        ],
      },
    },
    {
      id: "0104-recall",
      kind: "recall",
      title: "What differed",
      narrative: "The table is closed. What do you actually remember of the differences?",
      subskills: ["observation.detail", "observation.text"],
      questions: [
        {
          id: "0104-r1",
          prompt: "What passage number were the cells in August?",
          kind: "number",
          answer: "41",
          accept: ["p.41", "p41", "passage 41"],
          subskill: "observation.detail",
        },
        {
          id: "0104-r2",
          prompt: "At what time point did Lena measure closure?",
          kind: "mcq",
          options: ["12 h", "18 h", "24 h", "36 h"],
          answer: "18 h",
          subskill: "observation.detail",
        },
        {
          id: "0104-r3",
          prompt: "What percentage of the wound had vehicle-treated cells closed in August?",
          kind: "number",
          answer: "88",
          accept: ["88%"],
          subskill: "observation.detail",
        },
        {
          id: "0104-r4",
          prompt: "How many plates per arm did Lena run?",
          kind: "number",
          answer: "3",
          accept: ["three"],
          subskill: "observation.detail",
        },
        {
          id: "0104-r5",
          prompt: "Which experiment was blinded?",
          kind: "mcq",
          options: ["March only", "August only", "Both", "Neither"],
          answer: "August only",
          subskill: "observation.text",
        },
        {
          id: "0104-r6",
          prompt: "What imaging system did Marcus use?",
          kind: "short",
          answer: "IncuCyte",
          accept: ["incucyte", "automated", "automated incucyte"],
          subskill: "observation.text",
        },
        {
          id: "0104-r7",
          prompt: "Which serum lot did Lena use?",
          kind: "short",
          answer: "A88",
          accept: ["lot a88", "fbs a88", "fbs lot a88"],
          subskill: "observation.text",
        },
      ],
    },
    {
      id: "0104-separate",
      kind: "separate",
      title: "What the table shows",
      narrative:
        "The lab is already telling two stories: that Lena fooled herself, or that Marcus killed the effect with old cells. Neither is on the table. Sort these.",
      subskills: ["observation.separation"],
      statements: [
        {
          id: "0104-s1",
          text: "The August experiment used twice as many plates per arm as March.",
          truth: "observation",
          why: "Six against three. It is in the table.",
        },
        {
          id: "0104-s2",
          text: "Lena's result was a false positive.",
          truth: "inference",
          why: "One reading of 42 percent followed by 6. Small n and unblinded scoring make it plausible; the table does not show it.",
        },
        {
          id: "0104-s3",
          text: "Control cells had closed 88 percent of the wound by 24 hours in August.",
          truth: "observation",
          why: "In the table. Look at what it leaves room for.",
        },
        {
          id: "0104-s4",
          text: "The compound lost potency between lot 0322 and lot 0719.",
          truth: "unknown",
          why: "Nothing here tests the compound itself. Lot 0719 may be identical, weaker or stronger; the table only tells you it is different.",
        },
        {
          id: "0104-s5",
          text: "Lena scored the images knowing which plates were treated.",
          truth: "observation",
          why: "Manual scoring, by Lena, not blinded — three cells of the table say so. That is a fact about the method, not a verdict on her.",
        },
        {
          id: "0104-s6",
          text: "The high-passage cells in August migrated differently from Lena's cells.",
          truth: "unknown",
          why: "Vehicle closure differs (61 percent versus 88), but so does the time point. This table cannot separate passage from timing.",
        },
        {
          id: "0104-s7",
          text: "The 24-hour endpoint left little room for a drug effect to show.",
          truth: "inference",
          why: "If controls are at 88 percent, the largest possible reduction is 12 points. A sound inference from the numbers, and the one most people miss.",
        },
        {
          id: "0104-s8",
          text: "The replication was more rigorous than the original.",
          truth: "inference",
          why: "More plates, blinded, automated: reasonable. But rigour in a different assay window is rigour about a different question.",
        },
      ],
    },
    {
      id: "0104-hypotheses",
      kind: "hypotheses",
      title: "How 42 becomes 6",
      narrative:
        "Give your most likely explanation, a genuine alternative, and an unlikely one you would still want excluded. Each must account for both numbers, not just the one you distrust.",
      subskills: ["inference.hypothesis", "inference.alternatives", "inference.causal"],
      rubric: {
        minimum: 2,
        plausible: [
          {
            title: "The original was a false positive",
            keywords: ["false positive", "chance", "small n", "p-hack", "noise", "fluke", "unblinded", "bias", "winner", "three plates", "expectation"],
            note: "Three plates, a hopeful scorer and an unblinded ruler can produce 42 percent from nothing. It is the story everyone reaches for first, which is not the same as it being wrong.",
          },
          {
            title: "The assay window changed — ceiling at 24 hours",
            keywords: ["ceiling", "24 h", "24h", "time point", "timepoint", "already closed", "dynamic range", "18 h", "18h", "endpoint", "window", "headroom", "saturat"],
            note: "A scratch assay measures a race. Read it after the race is over and every runner finishes. 88 percent in controls means the August experiment could not have seen a large effect if there was one.",
          },
          {
            title: "Reagents and cells drifted",
            keywords: ["passage", "serum", "fbs", "lot", "batch", "compound lot", "drift", "reagent", "cells changed", "incubator", "different cells"],
            note: "Passage 41 is old for this line; serum lots differ; the compound lot differs. Each is a real, boring, common reason replications fail — and none of them is tested by the table.",
          },
          {
            title: "Real effect, smaller than reported",
            keywords: ["smaller", "regression to the mean", "overestimat", "inflated", "true effect", "attenuat", "both right", "both", "modest"],
            note: "The result that got written into a grant was selected for being striking. Repeated, it shrinks. A true effect of 20 percent could produce 42 by luck once and near-zero at a ceiling.",
          },
        ],
      },
    },
    {
      id: "0104-question",
      kind: "question",
      title: "One question, one person",
      narrative:
        "You have an hour before Dr Okonjo's meeting. You can ask one thing. Weigh what it tells you against what it does to the two people who ran these experiments.",
      subskills: ["social.question_quality", "inference.information_value", "social.rapport"],
      allowFreeQuestion: true,
      questionOptions: [
        {
          id: "0104-q1",
          text: "To Marcus: 'Did the IncuCyte record intermediate time points? Can you pull the 18-hour numbers?'",
          informationValue: 0.9,
          rapportCost: 0,
          leading: false,
          feedback:
            "The best question in the building. Automated imagers usually record hourly. If the data exist, you can read the August experiment in Lena's window without running anything — and Marcus will be glad to be asked something technical rather than something personal.",
        },
        {
          id: "0104-q2",
          text: "To Lena: 'Were there any plates you ran in March that aren't in the analysis?'",
          informationValue: 0.5,
          rapportCost: 0.6,
          leading: false,
          feedback:
            "A fair question that must be asked eventually, and a hard one to hear from a senior colleague in a week like this. Ask it after you have the hourly data, when it can be a detail and not a verdict.",
        },
        {
          id: "0104-q3",
          text: "To Lena: 'You didn't just keep the plates that worked, did you?'",
          informationValue: 0.2,
          rapportCost: 0.9,
          leading: true,
          feedback:
            "This tells her what you think and gives her no way to answer it. Nobody says yes; you learn nothing; and she stops coming to lab meeting for good.",
        },
        {
          id: "0104-q4",
          text: "To the lab manager: 'What passage were the vials Marcus thawed, and is any low-passage stock left in the freezer?'",
          informationValue: 0.6,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Useful, mostly for the experiment you will need to run next. It does not tell you what happened in August.",
        },
        {
          id: "0104-q5",
          text: "To Marcus: 'How wide were your scratches, and what tip did you use?'",
          informationValue: 0.45,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "A real source of variance in this assay, and a sensible protocol check. It ranks below the hourly data because it explains scale, not the 88 percent ceiling.",
        },
      ],
    },
    {
      id: "0104-evidence",
      kind: "evidence",
      title: "The hourly series",
      narrative: "Whatever you asked, Marcus comes to find you forty minutes later with a laptop.",
      subskills: ["inference.evidence_weighting", "quantitative.statistics"],
      reveal: {
        title: "IncuCyte export, hourly closure",
        text: "The machine imaged every hour. At 18 hours, vehicle plates were at 63 percent closure and KX-114 plates at 49 percent — a 22 percent reduction, p of about 0.04 across the six plates. By 22 hours both arms were above 80 percent and the difference had collapsed. Marcus, to his credit, says it first: 'I picked 24 hours because the protocol sheet said overnight. I never looked at 18.' He also points out that this comparison was chosen after seeing the data.",
        supports: ["The assay window changed — ceiling at 24 hours", "Real effect, smaller than reported"],
        undermines: ["The original was a false positive"],
      },
    },
    {
      id: "0104-update",
      kind: "update",
      title: "A post hoc number",
      subskills: ["inference.updating", "calibration.confidence", "quantitative.probability"],
      updatePrompt:
        "Before the hourly series, how confident were you that KX-114 does nothing? Set it again now. Then hold your new number against two facts: the 18-hour comparison was chosen after the data were in, and p of 0.04 in a reanalysis is not p of 0.04 in a planned test. Did you move the right distance, or all the way?",
    },
    {
      id: "0104-decision",
      kind: "decision",
      title: "What you tell the PI",
      narrative: "Friday, 14:00. Dr Okonjo has fifteen minutes and a grant deadline. Choose what you recommend.",
      subskills: ["inference.disconfirmation", "calibration.uncertainty", "composure.ambiguity"],
      insufficientEvidenceIsCorrect: true,
      decisionOptions: [
        {
          id: "0104-d1",
          text: "Record it as a failed replication and move KX-114 off the project.",
          quality: 0.2,
          errorType: "PREMATURE_CLOSURE",
          feedback:
            "You would be abandoning a compound on the strength of a measurement taken after the race had finished. The August experiment did not test the March claim; it tested a different one.",
        },
        {
          id: "0104-d2",
          text: "Insufficient evidence either way. Run a third, pre-registered experiment: 18-hour endpoint fixed in advance, low-passage cells from frozen stock, both compound lots side by side, blinded automated scoring, six plates per arm.",
          quality: 0.95,
          feedback:
            "The honest answer and the useful one. Neither existing experiment can decide the question, and you now know exactly which variables the third must pin down. Fixing the endpoint before the data arrive is what turns the 18-hour hint into a test.",
        },
        {
          id: "0104-d3",
          text: "Add the 18-hour reanalysis of Marcus's data to the grant as a successful replication.",
          quality: 0.3,
          errorType: "OVERCONFIDENCE",
          feedback:
            "A comparison chosen after looking at the data is not a replication; it is a hypothesis. Reviewers will ask why 18 hours, and the true answer — because that is where the difference was — is the one they are trained to distrust.",
        },
        {
          id: "0104-d4",
          text: "Ask Lena to repeat her March protocol exactly, herself, to see whether she gets 42 percent again.",
          quality: 0.25,
          errorType: "CONFIRMATION_BIAS",
          feedback:
            "Repeating an unblinded protocol with the same scorer tests whether Lena can reproduce Lena. It cannot tell the lab whether the compound works, and it puts the weight of the week on the person least able to carry it.",
        },
      ],
    },
    {
      id: "0104-explain",
      kind: "explain",
      title: "Both numbers are honest",
      subskills: ["rhetoric.explanation", "rhetoric.clarity", "rhetoric.analogy"],
      explainPrompt:
        "Explain to Dr Okonjo, in five sentences, why 42 percent and 6 percent can both be honest numbers from the same compound, and what the third experiment must fix in advance. An analogy is welcome if it is exact.",
    },
    {
      id: "0104-debrief",
      kind: "debrief",
      title: "Debrief",
      expertReasoning:
        "An experienced experimentalist treats 'did not replicate' as the beginning of a question, not the end of one. The first move is to refuse the two personal stories on offer — the student who fooled herself, the technician who killed the effect — and read the two protocols as a list of differences, each a hypothesis. Most are boring and real: passage, serum lot, compound lot. One is structural, and it hides in plain sight in the control numbers: at 24 hours, control cells had already closed 88 percent of the wound, so the August assay had no dynamic range left in which an effect could appear. The expert also carries a prior about striking first results: a finding written into a grant was selected for being large, and selected findings shrink on repetition even when they are true. So the expectation before any new data is 'real but smaller', and the hourly series fits that expectation rather than proving it. The final discipline is not to let a post hoc reanalysis masquerade as a planned test. The evidence is insufficient, and saying so, with a precise design for the experiment that would make it sufficient, is the expert answer.",
      keyInsight:
        "Before asking whether an effect replicated, ask whether the replication could have seen it; a control at 88 percent had already answered.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 0105 · Three rain checks                                             */
/* ------------------------------------------------------------------ */

const CASE_0105: CaseDefinition = {
  id: "case-0105-three-rain-checks",
  number: "0105",
  title: "Three Rain Checks",
  setting: "A message thread with a friend of eight years. Tuesday evening, two days after the third cancellation.",
  summary:
    "Sam has cancelled or moved dinner three times in nine days, each time with a different reason. You are trying to work out what is going on without turning a friendship into a case. That is harder than it sounds.",
  difficulty: 3,
  estimatedMinutes: 20,
  faculties: ["social", "inference", "calibration", "composure"],
  subskills: [
    "observation.detail",
    "observation.chronology",
    "observation.separation",
    "inference.hypothesis",
    "inference.alternatives",
    "inference.base_rates",
    "inference.updating",
    "social.perspective",
    "social.question_quality",
    "social.ambiguity",
    "calibration.uncertainty",
    "composure.ambiguity",
  ],
  groundTruth:
    "Genuinely undetermined at the point of decision, and that is the point. What emerged over the following month: Sam had started a new job, was doing an evening course two nights a week, and had been given notice on the flat; the Saturday 'work call' was a handover call for the old job, the Sunday 'not feeling great' was real and was mostly exhaustion. Sam had told Jo about the flat because Jo had asked about it, and had not told you because dinner kept being the thing that got cancelled and the explanation felt like one more apology. None of that was avoidance of you in particular. It could have been; nothing in the thread ruled it out, and the case rewards you for holding that open while acting kindly anyway. Probability, on the evidence in hand at decision time, that the cancellations were about you specifically: perhaps 15 to 20 percent.",
  conceptLinks: ["base-rate-fallacy", "availability-heuristic"],
  safetyTags: ["fictional", "no-real-persons", "no-protected-characteristics"],
  origin: "seeded",
  tags: ["psychology", "philosophy"],
  stages: [
    {
      id: "0105-enter",
      kind: "enter",
      title: "The third one",
      setting: "Your kitchen, Tuesday, 21:15. The thread is open on your phone.",
      narrative:
        "Sam has been your friend for eight years. You have eaten in the same three restaurants a hundred times, and you cannot remember Sam cancelling anything before this month.\n\nNow it has happened three times in nine days. A work call. A mother's visit. Not feeling great. Each reason was plausible, each was different, and after the third you sat with the phone in your hand for a full minute before typing 'Hope you feel better'.\n\nYou are aware of two things at once. One is that a story has already formed — Sam is avoiding you — and that it arrived without your permission. The other is that you would like to know what is actually going on, and that the way you find out will matter more to the friendship than the answer. Read the thread again, slowly, as if it were someone else's.",
    },
    {
      id: "0105-notice",
      kind: "notice",
      title: "The thread",
      narrative: "Thirty seconds. Read the times as carefully as the words.",
      subskills: ["observation.detail", "observation.chronology"],
      material: {
        kind: "thread",
        title: "Sam",
        seconds: 30,
        lines: [
          "Sat 8 Mar, 23:41 · Sam: Brilliant night. Same again soon.",
          "Thu 3 Apr, 18:12 · Sam: Sat still on? Thinking that Vietnamese place on Brook Street, 7?",
          "Thu 3 Apr, 18:20 · You: Yes. 7 works.",
          "Sat 5 Apr, 15:48 · Sam: So sorry. Work thing has blown up, I have to be on a call at 7. Rain check?",
          "Sat 5 Apr, 16:02 · You: No problem. Next Saturday?",
          "Sat 5 Apr, 16:40 · Sam: Yes. Definitely.",
          "Mon 7 Apr, 08:15 · Sam: First day at the new place. Wish me luck.",
          "Wed 9 Apr, 22:31 · Sam: Can we push Sat to Sunday lunch? Mum's coming down Saturday, completely forgot.",
          "Wed 9 Apr, 22:45 · You: Sure. Sunday 1pm, same place?",
          "Wed 9 Apr, 23:10 · Sam: Perfect.",
          "Sun 13 Apr, 11:05 · Sam: I'm so sorry. Not feeling great, going to stay in. I will make it up to you, promise.",
          "Sun 13 Apr, 11:30 · You: Okay. Hope you feel better.",
        ],
      },
    },
    {
      id: "0105-recall",
      kind: "recall",
      title: "What was actually said",
      narrative: "Phone face down. What do you remember, as opposed to what you feel?",
      subskills: ["observation.detail", "observation.chronology", "observation.text"],
      questions: [
        {
          id: "0105-r1",
          prompt: "What reason did Sam give for the first cancellation?",
          kind: "mcq",
          options: ["A work call at 7", "Mum visiting", "Not feeling well", "Car trouble"],
          answer: "A work call at 7",
          subskill: "observation.text",
        },
        {
          id: "0105-r2",
          prompt: "On which day did Sam write 'First day at the new place'?",
          kind: "short",
          answer: "Monday 7 April",
          accept: ["7 april", "mon 7 apr", "7 apr", "april 7", "monday", "monday 7 april", "the 7th"],
          subskill: "observation.chronology",
        },
        {
          id: "0105-r3",
          prompt: "How many minutes after your 'Next Saturday?' did Sam reply 'Yes. Definitely.'?",
          kind: "number",
          answer: "38",
          accept: ["thirty-eight", "38 minutes"],
          subskill: "observation.chronology",
        },
        {
          id: "0105-r4",
          prompt: "At what time did Sam ask to move Saturday to Sunday?",
          kind: "mcq",
          options: ["18:12", "22:31", "23:10", "11:05"],
          answer: "22:31",
          subskill: "observation.chronology",
        },
        {
          id: "0105-r5",
          prompt: "Where were you going to eat?",
          kind: "short",
          answer: "The Vietnamese place on Brook Street",
          accept: ["brook street", "vietnamese", "brook st", "the vietnamese place", "vietnamese place on brook street"],
          subskill: "observation.text",
        },
        {
          id: "0105-r6",
          prompt: "Which of these did Sam write on Sunday 13 April?",
          kind: "mcq",
          options: ["Rain check?", "I will make it up to you, promise.", "Wish me luck.", "Same again soon."],
          answer: "I will make it up to you, promise.",
          subskill: "observation.text",
        },
        {
          id: "0105-r7",
          prompt: "How many messages did Sam send in the thread you saw?",
          kind: "number",
          answer: "8",
          accept: ["eight"],
          subskill: "observation.detail",
        },
      ],
    },
    {
      id: "0105-separate",
      kind: "separate",
      title: "What you know and what you have decided",
      narrative: "The story arrived before the evidence. Take it apart. Which of these did you read, which did you conclude, and which cannot be settled from a phone?",
      subskills: ["observation.separation", "social.ambiguity"],
      statements: [
        {
          id: "0105-s1",
          text: "Sam changed or cancelled the plan three times between 5 and 13 April.",
          truth: "observation",
          why: "Cancelled on the 5th, moved on the 9th, cancelled on the 13th. Three, in the thread.",
        },
        {
          id: "0105-s2",
          text: "Sam is avoiding you.",
          truth: "inference",
          why: "The story that formed first. It fits the facts. So do several others, and this one has the disadvantage of being about you.",
        },
        {
          id: "0105-s3",
          text: "Sam wrote that Monday 7 April was the first day at a new place.",
          truth: "observation",
          why: "That is what the message says. The message is the observation; the new job is Sam's report of it.",
        },
        {
          id: "0105-s4",
          text: "Sam's third reason was untrue.",
          truth: "unknown",
          why: "'Not feeling great' is unverifiable from where you sit, and you would not want to verify it. Its truth is unknown, not doubtful.",
        },
        {
          id: "0105-s5",
          text: "Sam proposed the original dinner.",
          truth: "observation",
          why: "3 April, 18:12. Worth holding next to the avoidance story: people who are avoiding you do not usually pick the restaurant.",
        },
        {
          id: "0105-s6",
          text: "Something is going on in Sam's life that Sam has not told you.",
          truth: "inference",
          why: "Consistent with everything, and vague enough that almost nothing could disprove it. Still an inference, and a gentle one.",
        },
        {
          id: "0105-s7",
          text: "Sam is overwhelmed by the new job.",
          truth: "inference",
          why: "A new job, a late-night reschedule, a Sunday of not feeling great: a plausible chain. The thread never says it.",
        },
        {
          id: "0105-s8",
          text: "Sam has cancelled on other friends this month too.",
          truth: "unknown",
          why: "Nothing in the thread. This is the fact that would most change the meaning of the other facts.",
        },
      ],
    },
    {
      id: "0105-hypotheses",
      kind: "hypotheses",
      title: "What three rain checks can mean",
      narrative:
        "Give your most likely explanation, a real alternative, and one that is unlikely but possible. Include the one that is about you; then notice how much weight you gave it compared with the others.",
      subskills: ["inference.hypothesis", "inference.alternatives", "social.perspective"],
      rubric: {
        minimum: 2,
        plausible: [
          {
            title: "Sam is pulling away from the friendship",
            keywords: ["avoid", "distanc", "pulling away", "drifting", "doesn't want", "does not want", "friendship", "cooling", "excuse"],
            note: "The vivid story, and the first to arrive because it is about you. Three different reasons can look like a pattern of excuses; they can also look like a life.",
          },
          {
            title: "Sam is overwhelmed — new job, family, no slack",
            keywords: ["overwhelmed", "new job", "busy", "stretched", "exhausted", "too much", "stress", "capacity", "tired", "no time"],
            note: "The base-rate story. A first week in a new job, a parent visiting, a reschedule typed at 22:31 — this is what overload looks like in a message thread, and it is far more common than a friendship ending.",
          },
          {
            title: "Something Sam is not ready to say",
            keywords: ["not ready", "private", "something else", "going on", "money", "afford", "struggling", "low", "hard time", "can't say"],
            note: "Shifting reasons are sometimes what a true reason looks like when someone cannot yet say it. Dinner out costs money and energy; the choice of a walk instead is a way of finding out without asking.",
          },
          {
            title: "Three honest reasons in a row",
            keywords: ["coincidence", "genuine", "true", "honest", "bad luck", "all real", "unlucky", "just happened", "each"],
            note: "Unlikely for a reliable person, but not rare. Three independent small events in nine days happens to everyone eventually; the mistake is treating the cluster as a signal because it clusters.",
          },
        ],
      },
    },
    {
      id: "0105-question",
      kind: "question",
      title: "What you send",
      narrative:
        "You are going to send one message tonight. It is also a question. Choose the one that gives Sam the most room to tell you something true, and costs the least if the answer is 'nothing is wrong'.",
      subskills: ["social.question_quality", "social.rapport", "inference.information_value"],
      allowFreeQuestion: true,
      questionOptions: [
        {
          id: "0105-q1",
          text: "'Is everything okay? You don't have to explain — just checking.'",
          informationValue: 0.6,
          rapportCost: 0.05,
          leading: false,
          feedback:
            "Warm and open. Its weakness is that 'everything okay?' is easy to answer with 'yes, fine, sorry again' — which tells you nothing and closes the door politely.",
        },
        {
          id: "0105-q2",
          text: "'Would something lower-key suit better at the moment — a walk, or coffee near yours?'",
          informationValue: 0.7,
          rapportCost: 0,
          leading: false,
          feedback:
            "The best of these. It quietly tests money, energy and avoidance at once — someone who is stretched says yes to a walk; someone avoiding you finds a reason not to — and it asks nothing Sam has to confess.",
        },
        {
          id: "0105-q3",
          text: "'How's the new job going?'",
          informationValue: 0.55,
          rapportCost: 0,
          leading: false,
          feedback:
            "A door rather than a question. Sam may walk through it with everything, or reply 'busy!'. Good, and a little passive.",
        },
        {
          id: "0105-q4",
          text: "'Are you avoiding me?'",
          informationValue: 0.3,
          rapportCost: 0.6,
          leading: true,
          feedback:
            "A closed question with one answer available. 'No' tells you nothing, and now Sam knows the last nine days have been read as a verdict.",
        },
        {
          id: "0105-q5",
          text: "'Were you actually ill on Sunday, or was it something else?'",
          informationValue: 0.25,
          rapportCost: 0.8,
          leading: true,
          feedback:
            "You have asked a friend to defend a sick day. Whatever the answer, the friendship has just acquired a witness stand.",
        },
      ],
    },
    {
      id: "0105-evidence",
      kind: "evidence",
      title: "Jo, on the bus",
      narrative: "Before you press send, something arrives from outside the thread.",
      subskills: ["inference.evidence_weighting", "inference.base_rates"],
      reveal: {
        title: "A mutual friend",
        text: "Jo, who knows you both, sits down next to you on the bus and says, unprompted: 'Have you managed to see Sam? They've bailed on me twice this month. The job's eating them, and did you hear about the flat? Landlord's selling — they've got until the end of May.' You had not heard about the flat. Sam told Jo. Sam did not tell you.",
        supports: ["Sam is overwhelmed — new job, family, no slack", "Something Sam is not ready to say"],
        undermines: ["Sam is pulling away from the friendship"],
      },
    },
    {
      id: "0105-update",
      kind: "update",
      title: "Which way does Jo move you?",
      subskills: ["inference.updating", "calibration.uncertainty"],
      updatePrompt:
        "Before Jo, how confident were you that Sam is pulling away from you in particular? Set it again now. Then ask yourself which way the fact that Sam told Jo about the flat, and not you, should move you — and whether it should move you at all, given that Jo asked and you did not.",
    },
    {
      id: "0105-decision",
      kind: "decision",
      title: "What you do",
      narrative: "Still Tuesday, 21:40. Choose what you send, or do not send.",
      subskills: ["composure.ambiguity", "social.perspective", "calibration.uncertainty"],
      insufficientEvidenceIsCorrect: true,
      decisionOptions: [
        {
          id: "0105-d1",
          text: "Stop initiating. If Sam wants the friendship, Sam can make the next plan.",
          quality: 0.2,
          errorType: "PREMATURE_CLOSURE",
          feedback:
            "You have decided the avoidance story is true and are acting on it — by avoiding. If Sam is drowning, this is the month you disappeared.",
        },
        {
          id: "0105-d2",
          text: "Message: 'That's three cancellations. Is something going on, or is it me?'",
          quality: 0.35,
          errorType: "QUESTION_QUALITY",
          feedback:
            "Honest, and it puts Sam in front of two doors you chose. The count reads as a charge sheet, and 'or is it me' asks Sam to manage your feelings on a night when Sam has none to spare.",
        },
        {
          id: "0105-d3",
          text: "Insufficient evidence to conclude anything about you. Message, with no plan attached: 'Sounds like a lot at the moment. No pressure on dinner — happy to do a walk near yours, or nothing for a while. Here either way.' Then wait.",
          quality: 0.9,
          feedback:
            "This is what acting well under uncertainty looks like. It does not require you to know what is going on, it lowers the cost of Sam telling you, and it is the right message under every hypothesis except the one you cannot fix anyway.",
        },
        {
          id: "0105-d4",
          text: "Book the Vietnamese place for the following Saturday and tell Sam it is non-negotiable.",
          quality: 0.15,
          errorType: "INSUFFICIENT_UPDATE",
          feedback:
            "Three cancellations of the same plan have told you something about the plan. Booking it a fourth time treats the evidence as noise.",
        },
      ],
    },
    {
      id: "0105-explain",
      kind: "explain",
      title: "To yourself, honestly",
      subskills: ["rhetoric.precision", "rhetoric.clarity", "calibration.uncertainty"],
      explainPrompt:
        "In three or four sentences, as if to yourself: what you actually know about the last nine days, what you suspect and how strongly, and what you have decided to do about it. Keep the three apart.",
    },
    {
      id: "0105-debrief",
      kind: "debrief",
      title: "Debrief",
      expertReasoning:
        "Someone good at people reads this thread with the same discipline as a ledger. The observations are few: three changes of plan, three stated reasons, one message about a new job, one reschedule typed near midnight. Everything else is story, and the first story to arrive is the one about you — because it is the most vivid and the most available, not because it is the best supported. The base rate is that reliable friends who suddenly cancel three times are usually in a bad month, not out of a friendship; the fact that Sam proposed the dinner in the first place sits awkwardly with avoidance. Jo's information does not settle the case; it shifts the base rate further toward overload and adds one uncomfortable fact — that Sam told Jo something and not you — whose meaning depends on who asked. The expert's decision does not require the question to be answered. It requires an action that is right across all the live hypotheses: lower the cost of the next step, remove the deadline, and stay. Insufficient evidence is the honest verdict, and the message that follows from it is also the kind one.",
      keyInsight:
        "When the story that arrives first is about you, treat that as a reason to weigh it more carefully, not more heavily.",
    },
  ],
};

export const CASES_A: CaseDefinition[] = [CASE_0101, CASE_0102, CASE_0103, CASE_0104, CASE_0105];
