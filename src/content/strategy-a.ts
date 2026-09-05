import type { StrategyScenario } from "@/lib/domain/types";

/**
 * Strategy Table scenarios 1–5. Decision trees where consequences follow incentives,
 * not hopes. Information-gathering before irreversible action is sometimes the best
 * move and sometimes a costly delay.
 */
export const STRATEGY_A: StrategyScenario[] = [
  {
    id: "st-society-sponsor",
    title: "The Sponsor Withdraws",
    mode: "story",
    setting: "A university debating society, two weeks before its flagship annual dinner for 180 guests.",
    summary: "The bank that has sponsored the dinner for six years emails to withdraw, citing 'a review of community spending'. The deposit for the venue is paid; the balance of 9,000 is due in ten days. You are the society's president.",
    actors: [
      { name: "You (president)", goals: ["Hold the dinner", "Protect the society's reputation and finances", "Keep the committee together"], constraints: ["Ten days to the balance", "No personal funds", "Exams in three weeks"], leverage: ["Six-year relationship with the bank", "Alumni network", "180 ticket holders who want the event"], fears: ["Cancelling and refunding at a loss", "Being the president who lost the sponsor"], alternatives: ["Scale down", "Postpone", "Find a replacement sponsor", "Raise ticket prices"] },
      { name: "The bank's community manager", goals: ["Execute a budget cut with minimal noise", "Avoid a story about a bank abandoning students"], constraints: ["The cut is decided above her level", "She has discretionary funds for small items"], leverage: ["The money"], fears: ["Bad press", "Being blamed for a cancelled event"], alternatives: ["Partial sponsorship", "In-kind support", "A clean exit"] },
      { name: "The venue manager", goals: ["Fill the date", "Get paid"], constraints: ["Other bookings possible if released early"], leverage: ["Holds the deposit", "Sets the cancellation terms"], fears: ["An empty Saturday in the season"], alternatives: ["Move the date", "Reduce the minimum spend"] },
      { name: "The committee treasurer", goals: ["Not be personally exposed", "Balance the books"], constraints: ["Signed the venue contract"], leverage: ["Knows the reserve balance"], fears: ["A deficit reported to the union"], alternatives: ["Cancel now, cut losses"] },
    ],
    rootNodeId: "n1",
    difficulty: 3,
    estimatedMinutes: 12,
    subskills: ["strategy.optionality", "strategy.incentives", "strategy.second_order", "social.perspective", "strategy.negotiation"],
    conceptLinks: ["game-theory", "english-auction"],
    origin: "seeded",
    nodes: [
      {
        id: "n1",
        situation: "The email arrived at 16:05. Your treasurer has already replied-all to the committee suggesting cancellation. Nobody outside the committee knows yet. What is your first move?",
        moves: [
          { id: "m1", text: "Reply to the bank immediately, expressing disappointment and asking them to reconsider.", quality: 0.35, consequence: "The community manager replies within the hour with a polite restatement: the decision was made above her. You have used your one direct approach on a request she could not grant.", counterpartyReply: "I understand this is difficult. The review applies across all our regional commitments.", nextNodeId: "n2", errorType: "STRATEGIC_SHORTSIGHTEDNESS" },
          { id: "m2", text: "Before replying, phone the community manager and ask what 'review of community spending' actually means and whether anything survives the cut.", quality: 0.9, consequence: "She is relieved to be asked rather than accused. The full sponsorship is gone, but she mentions a discretionary 'small grants' line of up to 2,000 that has not been cut, and that a named speaker from the bank would still be welcome.", counterpartyReply: "Between us, the big line is dead. But I have a smaller pot, and I'd like to keep our name on something.", reveals: "The withdrawal is a budget cut, not a judgement on the society. There is a smaller pot and a face-saving interest on the bank's side.", nextNodeId: "n3" },
          { id: "m3", text: "Call the venue and cancel now to limit losses, before the balance is due.", quality: 0.15, consequence: "The venue keeps the deposit and releases the date. Twelve hours later two alumni email offering to help. The event is already gone.", errorType: "PREMATURE_CLOSURE", nextNodeId: "n6" },
          { id: "m4", text: "Post on the society's social accounts that the bank has abandoned the dinner, to pressure them.", quality: 0.1, consequence: "It gets attention. The bank's press office sends a stiff note; the community manager, who was your only ally inside the bank, stops replying. Two alumni who work at the bank quietly withdraw their own support.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n6" },
        ],
      },
      {
        id: "n2",
        situation: "The bank has said no in writing. The committee is split between cancelling and pressing ahead. The venue balance is due in nine days.",
        moves: [
          { id: "m1", text: "Ask the venue manager, in person, what flexibility exists on the balance and minimum spend.", quality: 0.75, consequence: "He would rather fill the date than lose it. He offers to drop the minimum spend by 1,500 if you confirm within a week, and to accept the balance in two instalments.", nextNodeId: "n4" },
          { id: "m2", text: "Raise ticket prices by 40% to cover the gap and announce it.", quality: 0.3, consequence: "Forty guests cancel. The gap widens rather than closes, and the story circulating is that the dinner is in trouble.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n4" },
          { id: "m3", text: "Email the whole alumni list asking for donations.", quality: 0.45, consequence: "Some money arrives, slowly, in small amounts. The mailing also reaches the bank's alumni employees, who now feel awkward. It is not enough on its own.", nextNodeId: "n4" },
        ],
      },
      {
        id: "n3",
        situation: "You know the shape of the bank's position: a small pot, a wish to keep a name on something. The venue balance is due in nine days.",
        moves: [
          { id: "m1", text: "Propose to the bank a 2,000 'speaker sponsorship' with their name on the programme, and use that as the anchor to approach two other local firms for matching amounts.", quality: 0.9, consequence: "The bank agrees; it costs them little and reads well. With a named sponsor already in place, a law firm and a consultancy each offer 2,500 within four days. Sponsorship becomes a pattern rather than a rescue.", counterpartyReply: "If our name is on the programme and the speaker is ours, I can sign that off today.", nextNodeId: "n5" },
          { id: "m2", text: "Accept the 2,000 and scale the dinner down to 100 guests to fit.", quality: 0.5, consequence: "The dinner survives, smaller. Eighty ticket holders are refunded, some annoyed. The society's reserve absorbs a modest loss.", nextNodeId: "n5" },
          { id: "m3", text: "Decline the small pot as insulting and look for a single replacement sponsor at the original level.", quality: 0.2, consequence: "Ten days is not enough to find a new principal sponsor. You lose the small pot and the bank's goodwill together.", errorType: "ASSUMPTION", nextNodeId: "n6" },
        ],
      },
      {
        id: "n4",
        situation: "You have some flexibility from the venue and some money trickling in, but no anchor sponsor. Six days remain.",
        moves: [
          { id: "m1", text: "Go back to the bank with a specific, small, face-saving ask: name a speaker, sponsor the programme.", quality: 0.8, consequence: "It works, later than it might have. The bank puts in 2,000. Combined with the venue's flexibility and the alumni money, the dinner runs at a small surplus.", nextNodeId: "n5" },
          { id: "m2", text: "Commit to the full event on the strength of the alumni money and hope the rest follows.", quality: 0.3, consequence: "It does not follow. The dinner runs; the society ends the year with a deficit the union asks you to explain.", errorType: "OVERCONFIDENCE", nextNodeId: "n6" },
        ],
      },
      {
        id: "n5",
        situation: "The dinner runs with three sponsors named on the programme, the bank's speaker gives a warm talk, and the treasurer's deficit never appears.",
        moves: [],
        terminal: true,
        debrief: "The decisive move was the phone call before the reply. It converted a refusal into information: a budget cut, a smaller pot, a wish to save face. Everything after that was leverage: a small named sponsorship anchored the larger ones, because firms sponsor what other firms already sponsor. The second-order effect of cancelling early, or of going public, was to destroy the relationships that made the recovery possible.",
      },
      {
        id: "n6",
        situation: "The dinner is cancelled or run at a loss, and the story of how it happened follows the society into next year.",
        moves: [],
        terminal: true,
        debrief: "Two failure modes appear here. The first is acting irreversibly (cancelling, going public) before gathering the cheap information a phone call would have produced. The second is treating a refusal as the whole of the other side's position: the bank had a smaller pot and an interest in keeping its name on something. Incentives, not hopes, told you where the money was.",
      },
    ],
  },
  {
    id: "st-retainer",
    title: "The Retainer",
    mode: "negotiation",
    setting: "A video call between a freelance designer and the marketing director of a mid-sized software company.",
    summary: "After three well-received projects, the director proposes a monthly retainer. She opens with 3,000 a month for 'roughly two days a week'. Your day rate on the projects was 550. You do not know how badly she needs you or what her alternatives are.",
    actors: [
      { name: "You (designer)", goals: ["Stable income without underpricing", "Keep the relationship warm", "Protect time for other clients"], constraints: ["Two days a week at 550 would be about 4,800 a month", "No idea of her budget or alternatives"], leverage: ["Three successful projects", "Her team knows your work"], fears: ["Losing the client", "Being locked into an underpriced deal"], alternatives: ["Project-by-project pricing", "A smaller retainer with overflow at day rate", "Walk away"] },
      { name: "Marketing director", goals: ["Predictable design capacity", "Stay inside a budget she has already promised her CFO"], constraints: ["Approval needed above 3,500 a month", "An agency quoted 6,000 for similar capacity"], leverage: ["The steady work", "The agency alternative, which she considers worse"], fears: ["Losing you to a competitor", "Explaining a higher number to finance"], alternatives: ["The agency", "A junior in-house hire", "Ad hoc projects with you"] },
    ],
    rootNodeId: "n1",
    difficulty: 4,
    estimatedMinutes: 10,
    subskills: ["strategy.negotiation", "strategy.incentives", "social.question_quality", "strategy.optionality"],
    conceptLinks: ["game-theory", "english-auction"],
    origin: "seeded",
    nodes: [
      {
        id: "n1",
        situation: "She has just said: 'We were thinking 3,000 a month for roughly two days a week. Does that work?'",
        moves: [
          { id: "m1", text: "Accept. Stable income is worth the discount.", quality: 0.25, consequence: "She is pleased. Within two months 'roughly two days' has become three, and the number does not move because you agreed to it without a scope.", counterpartyReply: "Wonderful. I'll get the paperwork over today.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n5" },
          { id: "m2", text: "Counter immediately at 5,000 and hold firm.", quality: 0.4, consequence: "She goes quiet, then says she will need to take that upstairs. You do not know whether 5,000 is above her limit, and neither of you has said what two days means.", counterpartyReply: "That's more than I can sign off myself. Let me see.", nextNodeId: "n3" },
          { id: "m3", text: "Ask what 'roughly two days a week' means in practice: what kind of work, over what horizon, with what alternatives if you were not available.", quality: 0.9, consequence: "She describes a launch every quarter, a steady stream of campaign assets, and, unprompted, that an agency quoted 6,000 for the same capacity and she would rather work with you.", counterpartyReply: "Honestly, the agency wanted six for what feels like less. I'd rather have you.", reveals: "Her alternative is worse and more expensive. Her constraint is a number she has promised finance.", nextNodeId: "n2" },
          { id: "m4", text: "Say you need to think and end the call.", quality: 0.5, consequence: "Reasonable, but you leave without learning anything. The next conversation starts from the same 3,000.", nextNodeId: "n1b" },
        ],
      },
      {
        id: "n1b",
        situation: "Two days later. You have thought. She emails: 'Any thoughts on the retainer?'",
        moves: [
          { id: "m1", text: "Propose a call to understand the scope before talking numbers.", quality: 0.8, consequence: "On the call she describes the quarterly launches and mentions the agency's 6,000 quote.", reveals: "The agency alternative costs 6,000.", nextNodeId: "n2" },
          { id: "m2", text: "Reply with a number: 4,800, your day rate times two days.", quality: 0.55, consequence: "She replies that she can do 3,500 without approval and would need to justify anything more. You now know her limit but have anchored yourself to a formula.", nextNodeId: "n3" },
        ],
      },
      {
        id: "n2",
        situation: "You know the agency alternative is 6,000 and that she has a budget promise to finance. She is waiting for your response to 3,000.",
        moves: [
          { id: "m1", text: "Propose 4,200 for a defined scope (up to eight days a month, launches prioritised), with additional days at 550, and a review after three months.", quality: 0.95, consequence: "She can sell 4,200 as a 30% saving against the agency. The defined scope protects you from creep; the overflow rate makes extra work a choice rather than a favour. She asks for 4,000 and you agree.", counterpartyReply: "Four thousand I can defend to anyone. Done.", nextNodeId: "n4" },
          { id: "m2", text: "Point out that the agency quoted 6,000 and ask for 5,500.", quality: 0.4, consequence: "Using her own confidence against her feels sharp. She agrees to 4,000 after taking it upstairs, but the tone has changed; the next renewal is negotiated by procurement.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n4" },
          { id: "m3", text: "Accept 3,000 but limit it to six days a month with overflow at day rate.", quality: 0.6, consequence: "A defensible deal. You have left money on the table relative to what she could pay, but the scope protection is worth something.", nextNodeId: "n4" },
        ],
      },
      {
        id: "n3",
        situation: "A number is on the table above her sign-off limit. She is deciding whether to fight for it upstairs.",
        moves: [
          { id: "m1", text: "Make it easy for her to argue upstairs: send a one-paragraph comparison of scope against the agency's quote.", quality: 0.8, consequence: "Armed with a document, she gets 4,000 approved in a day. Helping the other side win internally is often the fastest route to your own outcome.", nextNodeId: "n4" },
          { id: "m2", text: "Wait for her to come back.", quality: 0.4, consequence: "A week passes. Finance approves 3,500. You accept, without a scope.", nextNodeId: "n5" },
        ],
      },
      {
        id: "n4",
        situation: "A retainer at around 4,000 a month with defined scope and overflow at day rate, reviewed quarterly.",
        moves: [],
        terminal: true,
        debrief: "The negotiation was won by a question, not a number. 'What does two days mean, and what would you do otherwise?' revealed her alternative (worse, dearer) and her constraint (a number promised to finance). The best proposal then solved her problem as well as yours: a figure she could defend, a scope that protected you, and an overflow rate that made creep expensive for her rather than free. Notice the second-order effect of using her confidence against her: it won the number and lost the relationship.",
      },
      {
        id: "n5",
        situation: "A retainer at 3,000–3,500 a month with no defined scope. Within a quarter the work has grown and the number has not.",
        moves: [],
        terminal: true,
        debrief: "Accepting the opening offer, or a formula, without understanding scope or alternatives is the classic error. The number was never the problem; the missing scope was. A retainer without a definition of 'a day' is an option the other side holds over you, for free.",
      },
    ],
  },
  {
    id: "st-cancelled-flight",
    title: "Three Routes Home",
    mode: "option_value",
    setting: "An airport departure hall at 18:40 on a Sunday in December.",
    summary: "Your 19:30 flight home is cancelled. The airline's desk has a forty-minute queue. You have a meeting at 10:00 tomorrow that matters. Three routes present themselves, and information arrives over time. Some choices close others.",
    actors: [
      { name: "You", goals: ["Be at the meeting", "Spend as little as possible", "Sleep"], constraints: ["Phone at 30% battery", "Rebooking must go through the airline for a refund", "Trains stop at 22:00"], leverage: ["Airline owes you rebooking or refund", "A flexible credit card"], fears: ["Choosing a route that fails and having no fallback"], alternatives: ["Wait for rebooking", "Train", "Hire car", "Hotel and the first flight tomorrow"] },
      { name: "The airline", goals: ["Clear the disruption cheaply", "Avoid compensation claims"], constraints: ["One rebooking desk", "Limited seats tomorrow"], leverage: ["Controls rebooking and refunds"], fears: ["Passengers stranded overnight at their cost"], alternatives: ["Rebook on partner carriers", "Refund"] },
    ],
    rootNodeId: "n1",
    difficulty: 3,
    estimatedMinutes: 9,
    subskills: ["strategy.optionality", "strategy.second_order", "composure.ambiguity", "strategy.planning"],
    conceptLinks: ["containerization"],
    origin: "seeded",
    nodes: [
      {
        id: "n1",
        situation: "18:40. The cancellation was announced two minutes ago. The rebooking queue is forming. Trains to your city leave at 19:20 and 21:05 (four hours). The hire-car desk closes at 20:00.",
        moves: [
          { id: "m1", text: "Join the rebooking queue and wait to see what the airline offers.", quality: 0.4, consequence: "Forty minutes later you reach the desk. The next available flight is 14:10 tomorrow. The 19:20 train has gone; the hire desk has closed. One option remains: the 21:05 train.", nextNodeId: "n3", errorType: "STRATEGIC_SHORTSIGHTEDNESS" },
          { id: "m2", text: "Open the airline app and the rail app on your phone while walking toward the station, and book a refundable train ticket for 21:05 before deciding anything else.", quality: 0.9, consequence: "The refundable ticket costs 12 extra and holds a seat. The app shows the airline will only rebook for tomorrow afternoon. You now have a guaranteed route and an hour to improve on it.", reveals: "The airline cannot get you home tonight. The train can. A refundable booking buys time.", nextNodeId: "n2" },
          { id: "m3", text: "Run for the 19:20 train.", quality: 0.55, consequence: "You make it, sweating, without a ticket; on board you pay full fare. You are home by midnight. You never learn what the airline would have offered, and you claim the refund later. A good outcome from a hurried decision.", nextNodeId: "n4" },
          { id: "m4", text: "Book a hotel and take whatever flight the airline offers tomorrow.", quality: 0.2, consequence: "The airline's flight tomorrow is 14:10. You miss the meeting, comfortably.", errorType: "PREMATURE_CLOSURE", nextNodeId: "n5" },
        ],
      },
      {
        id: "n2",
        situation: "19:00. You hold a refundable 21:05 train seat. The hire-car desk is open until 20:00. Battery at 18%.",
        moves: [
          { id: "m1", text: "Ask the hire desk about a one-way car and whether they can hold one for thirty minutes while you check with the airline.", quality: 0.7, consequence: "They can, for a small fee. But a four-hour night drive in December after a long day is not obviously better than a four-hour train with a seat. You keep the train.", nextNodeId: "n4" },
          { id: "m2", text: "Charge the phone, eat, and take the 21:05 train.", quality: 0.85, consequence: "Home by 01:30, with a seat, a refund claim filed from the train, and the meeting intact.", nextNodeId: "n4" },
          { id: "m3", text: "Cancel the train and join the airline queue in case a partner airline has a seat tonight.", quality: 0.2, consequence: "There is no seat tonight. You have released the one certain route to chase an uncertain one.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n3" },
        ],
      },
      {
        id: "n3",
        situation: "20:20. The only remaining route home tonight is the 21:05 train, and it is filling.",
        moves: [
          { id: "m1", text: "Book it now, whatever it costs.", quality: 0.8, consequence: "A seat, at a premium. Home by 01:30.", nextNodeId: "n4" },
          { id: "m2", text: "Keep waiting in case the airline finds something.", quality: 0.1, consequence: "It does not. The train sells out. A hotel, and a missed meeting.", errorType: "PREMATURE_CLOSURE", nextNodeId: "n5" },
        ],
      },
      {
        id: "n4",
        situation: "You are at the meeting at 10:00, tired but present.",
        moves: [],
        terminal: true,
        debrief: "The valuable move was to buy an option early: a refundable ticket that guaranteed a route while other information arrived. Options are cheap when bought before the crowd realises it needs them. Waiting in the queue felt responsible and was actually the irreversible choice, because it spent the hour in which every alternative closed.",
      },
      {
        id: "n5",
        situation: "You miss the meeting.",
        moves: [],
        terminal: true,
        debrief: "Two things went wrong: an early irreversible commitment (a hotel) or a late one (a queue that consumed the window). Under uncertainty, the first question is which choices close others and which keep them open. A refundable ticket at 18:45 would have made every later decision safe.",
      },
    ],
  },
  {
    id: "st-cafe-price-war",
    title: "The Rival's Price Cut",
    mode: "three_moves",
    setting: "A small independent cafe on a high street with two other coffee shops within 200 metres.",
    summary: "The chain cafe opposite has cut its flat white from 3.60 to 2.90 with a banner in the window. Your flat white is 3.40. Your regulars are loyal; your morning commuter trade is not. Your co-owner wants to match by Monday.",
    actors: [
      { name: "You (co-owner)", goals: ["Keep margin", "Keep commuter volume", "Not start a war you cannot win"], constraints: ["Margins are thinner than the chain's", "Rent review in six months"], leverage: ["Regulars", "Quality", "Speed at the counter", "A loyalty card"], fears: ["Losing the commuters permanently"], alternatives: ["Match", "Ignore", "Compete on something other than price", "Loyalty incentives"] },
      { name: "The chain's regional manager", goals: ["Hit a quarterly footfall target", "Justify the cut to head office as temporary"], constraints: ["Promotion approved for six weeks", "Cannot cut further without approval"], leverage: ["Deep pockets", "Marketing budget"], fears: ["A permanent margin cut", "A promotion that shows no lift"], alternatives: ["Extend the promotion", "End it", "Switch to a loyalty app push"] },
      { name: "Commuters", goals: ["Fast, decent coffee"], constraints: ["Ninety seconds to spare"], leverage: ["Their feet"], fears: ["Queues"], alternatives: ["Whichever counter is fastest"] },
    ],
    rootNodeId: "n1",
    difficulty: 4,
    estimatedMinutes: 10,
    subskills: ["strategy.second_order", "strategy.incentives", "strategy.adversarial", "strategy.planning"],
    conceptLinks: ["prisoners-dilemma", "game-theory", "coffeehouses"],
    origin: "seeded",
    nodes: [
      {
        id: "n1",
        situation: "Saturday. The banner went up yesterday. Your co-owner says 'if we don't match by Monday we lose the commuters'. What do you do?",
        moves: [
          { id: "m1", text: "Match at 2.90 from Monday.", quality: 0.25, consequence: "Commuter numbers hold. Margin per cup drops by a third. Two weeks later the chain adds a free pastry with any coffee before nine. Then what?", counterpartyReply: "Head office: 'The independent matched. Extend the promotion; add the pastry.'", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n2" },
          { id: "m2", text: "Find out first whether the cut is a six-week promotion or a new price, and what the chain's promotions usually look like.", quality: 0.9, consequence: "A friendly barista over the road mentions it is 'a six-week thing from head office'. Their previous promotions ended on schedule. You are facing a temporary tactic, not a new price.", reveals: "The chain's cut is a scheduled six-week promotion, not a permanent price.", nextNodeId: "n3" },
          { id: "m3", text: "Ignore it. Quality wins.", quality: 0.4, consequence: "Regulars stay. Commuter trade falls about 15% for a month; some of those people do not come back when the promotion ends, because they have a new habit.", nextNodeId: "n4" },
          { id: "m4", text: "Cut to 2.80 to undercut them.", quality: 0.1, consequence: "You win the week. The chain, with deeper pockets, goes to 2.50 for the rest of the quarter. You cannot follow.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n5" },
        ],
      },
      {
        id: "n2",
        situation: "You have matched. The chain has added a free pastry before nine. Your margin cannot absorb pastries. Then what?",
        moves: [
          { id: "m1", text: "Stop competing on price; raise the flat white back to 3.40 and introduce a 'sixth coffee free' commuter card.", quality: 0.7, consequence: "Some commuters stay for the card and the speed. You have lost a month of margin but stopped the descent.", nextNodeId: "n4" },
          { id: "m2", text: "Add a free pastry too.", quality: 0.1, consequence: "You are now losing money on every commuter. The rent review arrives.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n5" },
        ],
      },
      {
        id: "n3",
        situation: "You know the cut is a six-week promotion. Your co-owner still wants to match. Then what?",
        moves: [
          { id: "m1", text: "Hold the price. Launch a commuter card (sixth coffee free) and a faster 'pre-order by text' lane, timed to outlast the promotion.", quality: 0.95, consequence: "Commuter trade dips 8% for three weeks, then recovers as the card matures. When the promotion ends the chain's price returns to 3.60 and you are 20p cheaper with a queue that moves faster. Some of their commuters cross the road.", nextNodeId: "n6" },
          { id: "m2", text: "Match for exactly six weeks and announce it as a 'winter price'.", quality: 0.5, consequence: "Volume holds, margin suffers for six weeks, and the chain's manager reads the match as a response and extends by two weeks. You end it anyway; a few customers grumble.", nextNodeId: "n4" },
          { id: "m3", text: "Do nothing at all for six weeks.", quality: 0.45, consequence: "The promotion ends on schedule. Commuter trade is down 10% and slow to return, because nothing gave the lost customers a reason to come back.", nextNodeId: "n4" },
        ],
      },
      {
        id: "n4",
        situation: "The promotion is over. Prices across the street are back to normal. Your margin took a hit and your commuter trade is a little below where it was.",
        moves: [],
        terminal: true,
        debrief: "A survivable result. The question 'then what?' is the whole exercise: a match invites the next move, and the chain can always make one more move than you can. The best lines compete where the chain is weak (speed, habit, a card) and time the response to the promotion's known end. The chain's manager had a target and a six-week window; knowing that told you how long you had to hold.",
      },
      {
        id: "n5",
        situation: "A price war with a competitor whose pockets are deeper than yours. Your margin is gone before the rent review.",
        moves: [],
        terminal: true,
        debrief: "Undercutting a larger rival invites the one move you cannot answer. In a repeated game the question is not who wins this round but who can afford the next one. The incentive map said the chain's manager wanted a footfall lift for six weeks; you gave her a war instead.",
      },
      {
        id: "n6",
        situation: "Six weeks later the promotion ends, your card has a hundred holders, and your morning queue is the faster one.",
        moves: [],
        terminal: true,
        debrief: "The winning line was to learn the promotion's shape, then compete on a dimension the chain could not cheaply match, timed to outlast the tactic. Three moves ahead: if I hold, they run the promotion to its end; if I add habit and speed, the end of the promotion becomes my advantage; if they extend, my card has matured. Each of your moves made their next move less attractive.",
      },
    ],
  },
  {
    id: "st-shared-engineer",
    title: "One Engineer, Two Managers",
    mode: "incentive_map",
    setting: "A forty-person software company. A quarterly planning meeting is in three days.",
    summary: "Two managers, Dana (platform) and Rafael (customer features), both want Ines, the company's strongest engineer, on their team next quarter. You lead engineering and must decide. Both have made their case in writing; both cases are reasonable. Ines has not been asked.",
    actors: [
      { name: "Dana (platform lead)", goals: ["Stabilise a payments migration that has slipped twice", "Not be the manager whose project fails"], constraints: ["Her team is two juniors and a contractor"], leverage: ["The migration is on the CEO's list"], fears: ["A third slip"], alternatives: ["Delay the migration", "Hire a contractor", "Borrow Ines part-time"] },
      { name: "Rafael (features lead)", goals: ["Ship the feature a big customer was promised", "Grow his team's profile"], constraints: ["A contractual date in eleven weeks"], leverage: ["The customer relationship, and sales's support"], fears: ["The customer walking"], alternatives: ["Cut scope", "Add a mid-level engineer", "Borrow Ines part-time"] },
      { name: "Ines", goals: ["Interesting work", "Not being split in two", "A promotion she has been promised twice"], constraints: ["One person"], leverage: ["Could leave; has offers"], fears: ["Being the fix for everyone's slips"], alternatives: ["Ask for the promotion now", "Leave"] },
      { name: "You (head of engineering)", goals: ["Both projects survive", "Keep Ines", "Not decide on volume of complaint"], constraints: ["Three days", "No new headcount this quarter"], leverage: ["The decision"], fears: ["Losing Ines", "Being seen to favour one manager"], alternatives: ["Assign fully to one", "Split", "Restructure the problem"] },
    ],
    rootNodeId: "n1",
    difficulty: 4,
    estimatedMinutes: 11,
    subskills: ["strategy.incentives", "social.perspective", "social.incentive_recognition", "strategy.second_order", "strategy.planning"],
    conceptLinks: ["game-theory"],
    origin: "seeded",
    nodes: [
      {
        id: "n1",
        situation: "Both memos are on your desk. Dana's says the migration will fail without Ines. Rafael's says the customer will walk. What is your first move?",
        moves: [
          { id: "m1", text: "Decide on the memos: payments is on the CEO's list, so Dana gets Ines.", quality: 0.35, consequence: "Rafael escalates to sales, who escalate to the CEO, who asks why the customer commitment was not considered. Ines learns of the decision from Dana. She was not asked.", errorType: "PREMATURE_CLOSURE", nextNodeId: "n3" },
          { id: "m2", text: "Split Ines fifty-fifty so neither manager loses.", quality: 0.2, consequence: "Both projects get half of an engineer and all of her context-switching. Both slip. Ines is exhausted by week four and mentions, lightly, that she has had an offer.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n5" },
          { id: "m3", text: "Before deciding, map what each person actually wants and fears, and ask Ines what she wants.", quality: 0.9, consequence: "Dana fears a third slip more than she wants Ines specifically; a senior contractor she trusts is available. Rafael's date is contractual but the scope is not; the customer mostly wants one workflow. Ines wants the migration, because it is hard and she was promised a promotion after 'a big technical delivery'.", reveals: "Dana's underlying need is risk cover; Rafael's is one workflow, not the whole feature; Ines wants the migration and the promotion it would justify.", nextNodeId: "n2" },
          { id: "m4", text: "Ask the CEO to decide.", quality: 0.15, consequence: "She decides, quickly and without the detail. Both managers now believe decisions are made by whoever gets to the CEO first. Your authority has been spent.", errorType: "STRATEGIC_SHORTSIGHTEDNESS", nextNodeId: "n5" },
        ],
      },
      {
        id: "n2",
        situation: "You know what each of them actually needs. Planning is in two days.",
        moves: [
          { id: "m1", text: "Put Ines on the migration as tech lead with the promotion attached to its completion; fund Dana's trusted contractor from the budget saved by cutting Rafael's feature to the one workflow the customer needs, which a mid-level engineer can ship in eleven weeks.", quality: 0.95, consequence: "Dana gets risk cover and a lead. Rafael gets a shippable scope and a story for sales. Ines gets the work she wanted and a visible path. Everyone's underlying need is met; nobody got what they asked for in writing.", nextNodeId: "n4" },
          { id: "m2", text: "Give Ines to Rafael because the contractual date is the hardest constraint, and give Dana the contractor.", quality: 0.55, consequence: "Defensible. The feature ships; the migration limps with the contractor. Ines, who wanted the migration, does competent work she finds dull and starts taking calls from recruiters.", nextNodeId: "n3" },
          { id: "m3", text: "Give Ines to Dana and tell Rafael to cut scope.", quality: 0.6, consequence: "Rafael cuts scope resentfully; the customer is fine with one workflow. Ines is happy. Rafael feels he lost, and remembers.", nextNodeId: "n3" },
        ],
      },
      {
        id: "n3",
        situation: "The quarter proceeds. Both projects survive, one manager feels they lost, and the next allocation fight has already begun.",
        moves: [],
        terminal: true,
        debrief: "Deciding on the memos treated the stated demands as the real interests. They rarely are. Dana wanted risk cover, Rafael wanted one workflow, and Ines, the one person nobody asked, wanted the migration. The second-order effect of every 'winner takes all' decision is that the losing manager plays the next round harder.",
      },
      {
        id: "n4",
        situation: "The migration lands with Ines as lead; the customer gets the workflow they needed; the promotion is announced at the quarter's end.",
        moves: [],
        terminal: true,
        debrief: "An incentive map dissolved a zero-sum fight. The written positions (I need Ines) concealed different needs (risk cover, a shippable scope, interesting work with a promotion attached). Asking the person being fought over was the cheapest and most neglected move. Restructuring the problem beat choosing a side.",
      },
      {
        id: "n5",
        situation: "Ines resigns in week seven. Both projects slip.",
        moves: [],
        terminal: true,
        debrief: "Splitting a person, or outsourcing the decision upward, both protect you from blame in the short run and cost you the engineer in the long run. Ines's alternatives were the strongest of anyone's in the room, and nobody in the room was thinking about them.",
      },
    ],
  },
];
