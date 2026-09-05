import type { FieldAssignment } from "@/lib/domain/types";

/**
 * Fieldwork: assignments carried out in the world and reported back.
 * Every assignment states its ethics plainly. Nothing here asks the user to
 * photograph, follow, record or profile anyone, or to infer anything about a person
 * beyond what they volunteer in ordinary conversation.
 */
export const FIELD_ASSIGNMENTS: FieldAssignment[] = [
  /* ---------------- observation ---------------- */
  {
    id: "fw-observation-walk",
    title: "The observation walk",
    kind: "observation",
    brief:
      "Walk a route you already know, ideally one you walk without looking. Your job is to come back with eight specific things: three architectural details, two sounds, one sign, one pattern, and one thing that has changed since you last walked it. Specific means someone else could go and find it.",
    steps: [
      "Choose a route of ten to twenty minutes that you have walked at least five times before.",
      "Walk at your ordinary pace. Do not take notes until the end; the exercise is attention, then recall.",
      "Look above the ground floor. Most of what is interesting about a street is above eye level: cornices, dates on gables, bricked-up windows, the join where two buildings of different ages meet.",
      "Listen for two sounds you would normally filter out and name their sources.",
      "Read one sign closely enough to quote it. Note anything odd about it: an old typeface, a phone number with too few digits, a business that no longer exists.",
      "At the end, write the eight items and mark each one 'certain' or 'think so'.",
    ],
    ethics: [
      "Look at buildings, signs and the street. Do not photograph or describe individual people.",
      "Do not linger outside private homes or look into windows.",
      "If a detail is on private property, note it from the public pavement and move on.",
    ],
    reportPrompts: [
      "List the three architectural details. Which one had you never noticed before?",
      "The two sounds and their sources. Were you sure of the sources or guessing?",
      "Quote the sign. Anything odd about it?",
      "What was the pattern, and what is one alternative explanation for it?",
      "What changed since your last walk, and how confident are you that it actually changed rather than that you never noticed it?",
    ],
    subskills: ["observation.detail", "observation.change", "observation.precision", "curiosity.exploration"],
    estimatedMinutes: 25,
  },
  {
    id: "fw-observation-square-scan",
    title: "The square scan",
    kind: "observation",
    brief:
      "Sit for ten minutes in a cafe or public square with no phone and no book. Map the space, count what can be counted, and separate what you saw from what you concluded. This is the room scan at real scale.",
    steps: [
      "Sit where you can see most of the space. Spend the first minute doing nothing but orienting: exits, counters, light sources, where the noise comes from.",
      "Count something countable: tables, chairs, lamps, people at the counter. Count it twice.",
      "Notice the flow. Where do people enter, pause, and go? Where is the bottleneck?",
      "Write three observations and three interpretations, and keep them in separate columns.",
      "Before leaving, close your eyes for ten seconds and reconstruct the layout. Open them and check.",
    ],
    ethics: [
      "Observe the space, the flow and the objects. Do not stare at, describe or take notes on individual people.",
      "No photographs of anyone. No recording.",
      "If someone notices you looking, look away; the exercise is not worth anyone's discomfort.",
    ],
    reportPrompts: [
      "Describe the layout in five sentences, as if for someone who has to find the exit in the dark.",
      "What did you count, and did the two counts agree?",
      "Your three observations and three interpretations. Was any interpretation hiding in the observation column?",
      "What did the ten-second reconstruction get wrong?",
    ],
    subskills: ["observation.spatial", "observation.separation", "observation.detail", "memory.spatial"],
    estimatedMinutes: 20,
  },

  /* ---------------- recall ---------------- */
  {
    id: "fw-recall-cafe",
    title: "Cafe recall",
    kind: "recall",
    brief:
      "Visit a cafe you do not know. Order, sit, leave. Only after you have walked at least a block away do you write: the layout, what music was playing, one item on the menu with its price, how many staff you saw, and one thing that was unusual. The delay is the exercise.",
    steps: [
      "Choose a cafe you have not been in before. Do not look at photographs of it online first.",
      "Order something and stay at least ten minutes. Do not take notes inside; behave like a customer.",
      "Walk one block away, then write everything you can recall under the five headings: layout, music, one menu item and price, staff count, something unusual.",
      "Mark each item 'certain', 'fairly sure' or 'guess'.",
      "Optional, next time you pass: check two of the items you marked 'certain'.",
    ],
    ethics: [
      "Count staff; do not describe them. No names, no appearances, no guesses about anyone.",
      "No photographs, no recordings, no note-taking that would make staff or customers uncomfortable.",
      "The 'something unusual' should be about the place or the objects in it, not a person.",
    ],
    reportPrompts: [
      "Sketch the layout in words: door, counter, seating, toilets, windows.",
      "The music, or the absence of it. Genre, volume, source if you noticed one.",
      "One menu item, with its price. Certain or guess?",
      "How many staff, and how did you arrive at that number?",
      "The unusual thing, and why it registered. If you checked later: what were you wrong about?",
    ],
    subskills: ["memory.recall", "observation.detail", "observation.text", "calibration.confidence"],
    estimatedMinutes: 30,
  },
  {
    id: "fw-recall-weekly-shop",
    title: "The shop you visit every week",
    kind: "recall",
    brief:
      "Before you next go into a shop you visit weekly, write down what you believe is there: the layout, where five specific products sit, the price of two of them, what is by the till, what is on the floor by the entrance. Then go in and check. Familiar places are where recall is most confidently wrong.",
    steps: [
      "Pick a shop you have visited at least ten times.",
      "Before going, write your predictions: aisle order, the location of five products you buy, the price of two, what is at the till, what is on the floor just inside the door.",
      "Give each prediction a confidence: 50, 70, 90 or 99 percent.",
      "Go in, shop as normal, and check your list against reality without making a performance of it.",
      "Score yourself. Note especially the 99-percent items you got wrong.",
    ],
    ethics: [
      "You are checking shelves and signage, not people. Do not describe staff or customers.",
      "No photographs inside the shop unless it is clearly permitted and you are photographing only products.",
      "Do not obstruct anyone or handle stock you are not buying.",
    ],
    reportPrompts: [
      "How many of your five product locations were right?",
      "The two prices: what you predicted, what they were.",
      "Which item did you give 90 or 99 percent that turned out wrong? What was your memory actually made of?",
      "What was by the door that you had never registered?",
    ],
    subskills: ["memory.spatial", "memory.reconstruction", "calibration.confidence", "observation.change"],
    estimatedMinutes: 25,
  },

  /* ---------------- conversation ---------------- */
  {
    id: "fw-conversation-follow-up",
    title: "One follow-up before you talk about yourself",
    kind: "conversation",
    brief:
      "In your next ordinary conversation, when the other person tells you something, ask one genuinely curious follow-up before you say anything about yourself. Not a polite noise; a question whose answer you do not know and want. Then notice what happens to the conversation.",
    steps: [
      "Choose a low-stakes conversation: a colleague at lunch, a neighbour, a friend on the phone.",
      "When they mention anything with a little substance, resist the reflex to match it with your own story.",
      "Ask a follow-up that opens rather than closes: 'How did that come about?' 'What did you make of it?' 'What happens next?'",
      "Listen to the whole answer. Then, if you like, offer your own story.",
      "Afterwards, write down the question you asked, roughly what they said, and what you nearly said instead.",
    ],
    ethics: [
      "Ask about what they raised, not about anything private. If they change the subject, let them.",
      "Curiosity is not interrogation. One follow-up, offered lightly.",
      "Write down the gist, not a transcript; no notes on the person beyond the conversation itself.",
    ],
    reportPrompts: [
      "What did they say, and what follow-up did you ask?",
      "What did you learn that you would not have learned by talking about yourself?",
      "What did you nearly say instead?",
      "Did the conversation feel different? Be honest if it did not.",
    ],
    subskills: ["social.listening", "social.question_quality", "social.rapport", "curiosity.questioning"],
    estimatedMinutes: 15,
  },
  {
    id: "fw-conversation-misunderstood",
    title: "What most people get wrong about your field",
    kind: "conversation",
    brief:
      "Find someone who knows a trade or subject well (a plumber, a pharmacist, a bus driver, a violin teacher, a friend who works in insurance) and ask: 'What do most people misunderstand about what you do?' Then ask one follow-up. Experts carry a stock of corrections that nobody asks for.",
    steps: [
      "Choose someone with whom a two-minute conversation is natural: a person you already deal with, or a friend whose work you have never asked about.",
      "Ask the question plainly. If they hesitate, offer an example of a misconception about your own work.",
      "Ask one follow-up that goes toward the mechanism: 'Why does that happen?' 'How would someone find that out?'",
      "Thank them and stop. Do not turn it into an interview.",
      "Write down the misconception and the correction while it is fresh.",
    ],
    ethics: [
      "Ask about the work, not the person. Nothing about their employer's confidential business, income or colleagues.",
      "Do not record. Do not ask for anything they seem reluctant to give.",
      "If they are working, choose a moment when you are not delaying them or anyone waiting behind you.",
    ],
    reportPrompts: [
      "What is the misconception, in their words as best you remember?",
      "What is the correction, and what is the mechanism behind it?",
      "Did the correction surprise you, or did you already half-know it?",
      "Which faculty in your own thinking made the misconception plausible: a base rate you had wrong, a vivid story, a false analogy?",
    ],
    subskills: ["social.question_quality", "curiosity.questioning", "knowledge.connections", "social.listening"],
    estimatedMinutes: 15,
  },

  /* ---------------- memory ---------------- */
  {
    id: "fw-memory-new-name",
    title: "A name and one detail",
    kind: "memory",
    brief:
      "The next time you are introduced to someone, learn their name properly and one non-sensitive detail they volunteer: where they grew up, what they are reading, the sport they play. Use the name once in the conversation. Recall both tomorrow, and again in a week.",
    steps: [
      "When you hear the name, repeat it back at once: 'Nice to meet you, Tomas.' If you did not catch it, ask again immediately; it gets harder later.",
      "Attach the name to something: a person you know with the same name, a word it resembles, the place you met.",
      "Listen for one detail they offer freely and remark on it so it registers.",
      "Use the name once more, naturally, before the conversation ends.",
      "That evening, write the name and the detail in the Memory Palace. Recall it tomorrow and in seven days without looking.",
    ],
    ethics: [
      "Only details the person volunteered in ordinary conversation. Nothing about health, family circumstances, beliefs or anything they would not expect a new acquaintance to remember.",
      "One name, one detail. This is memory practice, not a dossier; do not add to it later from other sources.",
      "Do not look the person up online to 'check'.",
    ],
    reportPrompts: [
      "The name, and the association you attached to it.",
      "The detail, and how it came up.",
      "Did you recall both the next day? In a week?",
      "What made the name hard or easy? Sound, familiarity, timing of the introduction?",
    ],
    subskills: ["memory.names", "memory.retention", "social.listening"],
    estimatedMinutes: 10,
  },

  /* ---------------- curiosity ---------------- */
  {
    id: "fw-curiosity-ordinary-object",
    title: "Five whys for an ordinary object",
    kind: "curiosity",
    brief:
      "Pick one ordinary object within reach (a coin, a paperclip, a shipping pallet, a manhole cover, a lightbulb) and ask why it is the way it is. Then ask why of the answer, five times. Stop when you reach something you genuinely cannot find out in twenty minutes; that is the interesting frontier.",
    steps: [
      "Choose the object. The duller the better; ordinariness is usually the residue of a long argument.",
      "Ask the first why: why is it this shape, this size, this material, this colour?",
      "Look up the answer, then ask why of that. Five times, or until you hit a wall.",
      "Write the chain, marking each link as 'found' (with the source) or 'guess'.",
      "Note the wall: the question you could not answer, and what kind of source would answer it.",
    ],
    ethics: [
      "Use public sources. Do not ask people for information their employer would consider confidential.",
      "Cite what you find; do not present a guess as a finding.",
    ],
    reportPrompts: [
      "The object and the five links of the chain.",
      "Which link surprised you?",
      "Where did the chain hit a wall, and what would it take to get past it?",
      "What does this object connect to in the Archive?",
    ],
    subskills: ["curiosity.questioning", "curiosity.exploration", "knowledge.connections", "inference.causal"],
    estimatedMinutes: 25,
  },

  /* ---------------- city ---------------- */
  {
    id: "fw-city-one-building",
    title: "The history of one building",
    kind: "city",
    brief:
      "Choose a building you pass regularly and know nothing about. Find out when it was built, what it was for, and one thing that has happened to it since. Then look at it again with that in mind. Cities are legible once you have read one page of them.",
    steps: [
      "Pick the building. Stand across the street and describe it before you look anything up: materials, storeys, style, anything that looks added or removed.",
      "Look for a date on the facade, a plaque, a name in the stonework, a foundation stone.",
      "Search public sources: local history society, heritage listing, old maps, newspaper archives, a planning portal.",
      "Establish three facts: when it was built (approximately), its original purpose, and one change since (a new use, a fire, an extension, a near demolition).",
      "Go back and look at it once more. Note what you can now see that you could not before.",
    ],
    ethics: [
      "Public sources only. Do not knock on doors or ask residents about their home.",
      "Photograph the facade from the public street if you wish; never people, and never through windows.",
      "If the building is a private residence, keep to what is in the public record.",
    ],
    reportPrompts: [
      "Your description before research, in five lines.",
      "The three facts and where each came from. Which source did you trust most and why?",
      "What did the second look reveal?",
      "What question about the building remains open?",
    ],
    subskills: ["knowledge.art", "knowledge.history", "curiosity.exploration", "observation.detail"],
    estimatedMinutes: 40,
  },

  /* ---------------- news ---------------- */
  {
    id: "fw-news-one-headline",
    title: "One headline, four questions",
    kind: "news",
    brief:
      "Take one headline from today's news and separate it into four parts: the claim it makes, the evidence offered, what remains uncertain, and how the same facts could be framed differently. Most headlines survive the first question and fail the third.",
    steps: [
      "Choose a headline with a factual claim in it, not an opinion piece.",
      "Write the claim in one plain sentence, stripped of adjectives.",
      "Read the article. List the evidence actually presented: numbers, sources, named people, documents. Mark each as first-hand, second-hand or unattributed.",
      "Write what is uncertain: what the article does not know, what its sources might not know, what would change the story.",
      "Write an alternative headline that is equally faithful to the evidence but points a different way.",
    ],
    ethics: [
      "Read the article, not just the headline; the exercise is about the gap between them.",
      "Do not share your alternative framing as if it were the story. It is a thinking exercise.",
    ],
    reportPrompts: [
      "The claim, stripped bare.",
      "The evidence, with each item marked first-hand, second-hand or unattributed.",
      "What is uncertain, and what would resolve it?",
      "Your alternative headline. Is it more or less honest than the original?",
    ],
    subskills: ["inference.evidence_weighting", "calibration.uncertainty", "observation.separation", "social.ambiguity"],
    estimatedMinutes: 20,
  },
  {
    id: "fw-news-one-number",
    title: "One number in the news",
    kind: "news",
    brief:
      "Find a number in today's news (a percentage, a total, a rate, a cost) and trace where it came from. Who measured it, how, over what period, and what was the denominator? Numbers travel further than their footnotes.",
    steps: [
      "Choose a specific number from an article: '40 percent', '£3 billion', 'twice as likely'.",
      "Find the original source: a report, a dataset, a survey, a company statement. If the article does not cite one, note that.",
      "Establish the denominator, the period and the method. 'Twice as likely' than what, measured how, among whom?",
      "Check whether the headline number and the source number match. They often differ by a rounding, a base year or a definition.",
      "Write a one-sentence version of the number that includes its context.",
    ],
    ethics: [
      "Use public sources; do not contact the people named in the article.",
      "Be fair: a simplified number is not necessarily a dishonest one. Note the difference between simplification and distortion.",
    ],
    reportPrompts: [
      "The number as printed, and the source you traced it to.",
      "Denominator, period, method. Which of the three was hardest to find?",
      "Did the headline number match the source? If not, how did it change on the way?",
      "The number rewritten with its context, in one sentence.",
    ],
    subskills: ["quantitative.statistics", "inference.evidence_weighting", "quantitative.estimation", "calibration.uncertainty"],
    estimatedMinutes: 25,
  },

  /* ---------------- decision ---------------- */
  {
    id: "fw-decision-sixty-second-prediction",
    title: "Sixty seconds before a decision",
    kind: "decision",
    brief:
      "Before your next medium-sized decision (which supplier, whether to take the meeting, where to spend the weekend), spend sixty seconds writing what you expect to happen, how confident you are, and what would tell you it was the wrong call. Then decide as you would anyway. The record is what trains you, not the decision.",
    steps: [
      "Notice a decision of the right size: consequential enough to remember in a month, small enough to make today.",
      "Set a sixty-second timer. Write: the options, the one you expect to choose, what you expect to happen, your confidence as a percentage, and one thing that would show you were wrong.",
      "Decide, and log it in the Decisions ledger with a review date two to eight weeks out.",
      "When the review date comes, write what actually happened and separate the quality of the decision from the quality of the outcome.",
    ],
    ethics: [
      "Your own decisions only. Do not log predictions about other people's choices or private situations.",
      "Be honest at review; a ledger that flatters you teaches nothing.",
    ],
    reportPrompts: [
      "The decision and the options as you saw them.",
      "Your expected outcome and your confidence.",
      "What would have told you it was wrong?",
      "At review: what happened, and was the outcome down to the decision or to luck?",
    ],
    subskills: ["calibration.forecasts", "composure.pausing", "strategy.second_order", "calibration.confidence"],
    estimatedMinutes: 5,
  },
];
