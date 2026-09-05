/**
 * Seeded observation content: glances, room scans, change detection, documents,
 * chronology, signal-versus-noise, what-is-missing and observation-versus-story.
 *
 * Scene-based exercises reference the procedural engine in `lib/scene` by
 * template id and seed; the same pair always renders the same room.
 */
import type {
  GlanceExercise,
  ChangeExercise,
  DocumentExercise,
  ChronologyExercise,
  SignalNoiseExercise,
  MissingExercise,
  ObservationOrStoryExercise,
  RoomScanExercise,
} from "@/lib/domain/content";

/* ---------------- The Glance ---------------- */

export const GLANCE_EXERCISES: GlanceExercise[] = [
  { id: "gl-desk-1", title: "The Writing Desk", scene: { template: "desk", seed: 1042 }, seconds: 10, questionCount: 4, difficulty: 1 },
  { id: "gl-desk-2", title: "Papers at Midnight", scene: { template: "desk", seed: 7318 }, seconds: 5, questionCount: 6, difficulty: 4 },
  { id: "gl-cafe-1", title: "The Corner Table", scene: { template: "cafe", seed: 2210 }, seconds: 20, questionCount: 5, difficulty: 2 },
  { id: "gl-cafe-2", title: "Second Espresso", scene: { template: "cafe", seed: 5877 }, seconds: 10, questionCount: 7, difficulty: 4 },
  { id: "gl-lobby-1", title: "Waiting for a Key", scene: { template: "hotel-lobby", seed: 3391 }, seconds: 30, questionCount: 5, difficulty: 2 },
  { id: "gl-lobby-2", title: "The Night Porter", scene: { template: "hotel-lobby", seed: 8124 }, seconds: 10, questionCount: 6, difficulty: 4 },
  { id: "gl-office-1", title: "Someone Else's Office", scene: { template: "office", seed: 1567 }, seconds: 20, questionCount: 5, difficulty: 2 },
  { id: "gl-office-2", title: "Left in a Hurry", scene: { template: "office", seed: 6203 }, seconds: 5, questionCount: 5, difficulty: 5 },
  { id: "gl-shelf-1", title: "The Second Shelf", scene: { template: "bookshelf", seed: 4479 }, seconds: 30, questionCount: 4, difficulty: 3 },
  { id: "gl-shelf-2", title: "Spines and Gaps", scene: { template: "bookshelf", seed: 9032 }, seconds: 20, questionCount: 6, difficulty: 4 },
  { id: "gl-train-1", title: "Compartment C", scene: { template: "train-compartment", seed: 2745 }, seconds: 20, questionCount: 4, difficulty: 1 },
  { id: "gl-train-2", title: "Between Stations", scene: { template: "train-compartment", seed: 7590 }, seconds: 10, questionCount: 6, difficulty: 3 },
  { id: "gl-table-1", title: "Table for Two", scene: { template: "restaurant-table", seed: 3866 }, seconds: 20, questionCount: 5, difficulty: 2 },
  { id: "gl-table-2", title: "After the Main Course", scene: { template: "restaurant-table", seed: 8951 }, seconds: 10, questionCount: 7, difficulty: 5 },
  { id: "gl-board-1", title: "Platform 4", scene: { template: "airport-board", seed: 1918 }, seconds: 30, questionCount: 5, difficulty: 3 },
  { id: "gl-board-2", title: "Final Call", scene: { template: "airport-board", seed: 6674 }, seconds: 20, questionCount: 7, difficulty: 5 },
  { id: "gl-street-1", title: "The Crossing", scene: { template: "street", seed: 4210 }, seconds: 20, questionCount: 5, difficulty: 3 },
  { id: "gl-street-2", title: "Rain on the Awning", scene: { template: "street", seed: 9457 }, seconds: 10, questionCount: 6, difficulty: 5 },
  { id: "gl-study-1", title: "The Quiet Room", scene: { template: "study", seed: 2583 }, seconds: 60, questionCount: 6, difficulty: 2 },
  { id: "gl-study-2", title: "Lamp Still Warm", scene: { template: "study", seed: 7126 }, seconds: 10, questionCount: 7, difficulty: 4 },
];

/* ---------------- Room Scan ---------------- */

export const ROOM_SCAN_EXERCISES: RoomScanExercise[] = [
  { id: "rs-cafe", title: "Morning Rush", scene: { template: "cafe", seed: 3140 }, seconds: 30, difficulty: 2 },
  { id: "rs-lobby", title: "Check-in Closed", scene: { template: "hotel-lobby", seed: 5521 }, seconds: 45, difficulty: 3 },
  { id: "rs-office", title: "Friday, Half Past Six", scene: { template: "office", seed: 8067 }, seconds: 30, difficulty: 3 },
  { id: "rs-street", title: "Delivery Hour", scene: { template: "street", seed: 2794 }, seconds: 20, difficulty: 4 },
  { id: "rs-study", title: "The Reading Chair", scene: { template: "study", seed: 6438 }, seconds: 40, difficulty: 2 },
  { id: "rs-table", title: "Cleared for Dessert", scene: { template: "restaurant-table", seed: 9275 }, seconds: 25, difficulty: 3 },
];

/* ---------------- What Changed ---------------- */

export const CHANGE_EXERCISES: ChangeExercise[] = [
  { id: "ch-desk-1", title: "Two Minutes Later", scene: { template: "desk", seed: 1203 }, changes: 2, seconds: 15, difficulty: 2 },
  { id: "ch-cafe-1", title: "While You Ordered", scene: { template: "cafe", seed: 4406 }, changes: 3, seconds: 20, difficulty: 3 },
  { id: "ch-lobby-1", title: "Shift Change", scene: { template: "hotel-lobby", seed: 7715 }, changes: 3, seconds: 20, difficulty: 3 },
  { id: "ch-office-1", title: "Back from Lunch", scene: { template: "office", seed: 2938 }, changes: 4, seconds: 25, difficulty: 4 },
  { id: "ch-shelf-1", title: "Someone Borrowed a Book", scene: { template: "bookshelf", seed: 6152 }, changes: 2, seconds: 20, difficulty: 3 },
  { id: "ch-train-1", title: "The Tunnel", scene: { template: "train-compartment", seed: 8380 }, changes: 3, seconds: 15, difficulty: 4 },
  { id: "ch-table-1", title: "Plates Cleared", scene: { template: "restaurant-table", seed: 3594 }, changes: 4, seconds: 20, difficulty: 4 },
  { id: "ch-board-1", title: "Board Refresh", scene: { template: "airport-board", seed: 5061 }, changes: 5, seconds: 30, difficulty: 5 },
  { id: "ch-street-1", title: "The Light Turned Green", scene: { template: "street", seed: 9822 }, changes: 5, seconds: 20, difficulty: 6 },
  { id: "ch-study-1", title: "A Draught from the Door", scene: { template: "study", seed: 1479 }, changes: 3, seconds: 10, difficulty: 5 },
];

/* ---------------- Documents ---------------- */

export const DOCUMENT_EXERCISES: DocumentExercise[] = [
  {
    id: "doc-receipt-hardware",
    title: "The Hardware Receipt",
    kind: "receipt",
    seconds: 25,
    difficulty: 2,
    lines: [
      "FERRAN & DAUGHTER — HARDWARE",
      "14 Chandos Street · 020 7946 0311",
      "Sat 21 Mar 2026   11:47   Till 2   Op: MIA",
      "Brass hinges 75mm (pair) x2        £11.90",
      "Wood screws 4x40, box of 100        £4.25",
      "Danish oil 500ml                   £13.60",
      "Sandpaper, assorted pack            £3.15",
      "Masking tape 24mm x3                £5.70",
      "Subtotal                           £38.60",
      "Member discount 5%                 -£1.93",
      "TOTAL                              £36.67",
      "Visa **** 4471   Contactless",
      "Change: £0.00",
      "Returns within 28 days with this receipt.",
    ],
    questions: [
      { id: "q1", prompt: "At what time was the receipt printed?", answer: "11:47", accept: ["11.47", "1147", "eleven forty-seven"], subskill: "observation.detail" },
      { id: "q2", prompt: "How many rolls of masking tape were bought?", answer: "3", accept: ["three", "x3"], subskill: "observation.detail" },
      { id: "q3", prompt: "What was the operator's name on the till?", answer: "Mia", accept: ["MIA"], subskill: "observation.text" },
      { id: "q4", prompt: "Which item cost £13.60?", answer: "Danish oil", accept: ["danish oil 500ml", "the oil", "oil"], subskill: "observation.text" },
      { id: "q5", prompt: "What was the final total paid?", answer: "£36.67", accept: ["36.67", "36,67", "£36.67"], subskill: "observation.detail" },
      { id: "q6", prompt: "What were the last four digits of the card?", answer: "4471", accept: ["**** 4471"], subskill: "observation.detail" },
    ],
  },
  {
    id: "doc-calendar-week",
    title: "A Week in March",
    kind: "calendar",
    seconds: 40,
    difficulty: 3,
    columns: ["Time", "Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13"],
    rows: [
      ["08:30", "", "Dentist (Kerr St)", "", "", ""],
      ["09:00", "Team stand-up", "", "Team stand-up", "", "Team stand-up"],
      ["10:00", "", "Budget review — R. Okafor", "", "Site visit, Dalston", ""],
      ["11:30", "Call: Marguerite (Lyon)", "", "", "", ""],
      ["12:30", "", "", "Lunch — Ines", "", ""],
      ["14:00", "", "", "Interview: analyst role", "Interview: analyst role", ""],
      ["15:30", "Dentist — moved to Tue", "", "", "", "Ferry tickets deadline"],
      ["17:00", "", "Gym", "", "Gym", ""],
      ["18:30", "", "", "Concert, Wigmore Hall (starts 19:30)", "", "Train to Bath 18:42"],
    ],
    questions: [
      { id: "q1", prompt: "On which day and at what time is the dentist appointment actually taking place?", answer: "Tuesday 08:30", accept: ["tue 08:30", "tuesday 8:30", "tuesday at 8.30", "tue 10 08:30", "tuesday morning 08:30"], subskill: "observation.chronology" },
      { id: "q2", prompt: "Who is the budget review with?", answer: "R. Okafor", accept: ["okafor", "r okafor"], subskill: "observation.text" },
      { id: "q3", prompt: "On which two days is the analyst interview scheduled?", answer: "Wednesday and Thursday", accept: ["wed and thu", "wednesday, thursday", "wed thu", "11 and 12"], subskill: "observation.chronology" },
      { id: "q4", prompt: "What time does the train to Bath leave?", answer: "18:42", accept: ["18.42", "6:42 pm", "6.42pm"], subskill: "observation.detail" },
      { id: "q5", prompt: "How many team stand-ups are in the week?", answer: "3", accept: ["three"], subskill: "observation.detail" },
      { id: "q6", prompt: "Where is the person on the 11:30 call based?", answer: "Lyon", accept: ["lyons", "in lyon", "marguerite in lyon"], subskill: "observation.text" },
    ],
  },
  {
    id: "doc-email-container",
    title: "Revised ETA",
    kind: "email",
    seconds: 35,
    difficulty: 3,
    lines: [
      "From: Tomasz Wiśniewski <t.wisniewski@halden-logistics.eu>",
      "To: Priya Raman   Cc: Operations Desk",
      "Date: Thu 2 Apr 2026, 07:52",
      "Subject: Re: Container HLXU 448 217 0 — revised ETA",
      "",
      "Priya,",
      "Quick update after the call with the port agent at 07:30.",
      "The vessel (MV Anneliese) berthed at Felixstowe at 04:10, not 02:00 as scheduled — two hours late because of the pilot slot.",
      "Customs release is now expected by 13:00. Haulage is booked with Corbett for a 15:30 collection, latest 17:00.",
      "If it slips past 17:00 we lose the driver until Monday 6 April.",
      "Can you confirm the warehouse can accept delivery until 20:00 tonight? Yesterday Dean said 19:00 was the cut-off.",
      "I'll ring again at 12:45 once customs updates the status.",
      "Tomasz",
    ],
    questions: [
      { id: "q1", prompt: "What is the name of the vessel?", answer: "MV Anneliese", accept: ["anneliese", "the anneliese"], subskill: "observation.text" },
      { id: "q2", prompt: "At what time did the vessel actually berth?", answer: "04:10", accept: ["4:10", "04.10", "4.10 am", "ten past four"], subskill: "observation.detail" },
      { id: "q3", prompt: "Which haulage company is booked for collection?", answer: "Corbett", accept: ["corbett haulage", "corbetts"], subskill: "observation.text" },
      { id: "q4", prompt: "At what time does Tomasz say he will ring again?", answer: "12:45", accept: ["12.45", "quarter to one"], subskill: "observation.detail" },
      { id: "q5", prompt: "Put these in the order they happened or are due: the port-agent call, the berthing, the email being sent, the customs release.", answer: "berthing, port-agent call, email, customs release", accept: ["berthing, call, email, customs", "berth, call, email, customs", "berthed, port agent call, email sent, customs release", "04:10, 07:30, 07:52, 13:00"], subskill: "observation.chronology" },
      { id: "q6", prompt: "What warehouse cut-off time did Dean give yesterday?", answer: "19:00", accept: ["19.00", "7 pm", "7pm", "seven"], subskill: "observation.detail" },
    ],
  },
  {
    id: "doc-menu-evening",
    title: "The Evening Menu",
    kind: "menu",
    seconds: 40,
    difficulty: 3,
    columns: ["", "Dish", "£"],
    rows: [
      ["Starters", "Grilled leeks, romesco, hazelnuts", "9.50"],
      ["", "Cured trout, cucumber, dill oil", "12.00"],
      ["", "Ox tongue, salsa verde, pickled shallot", "11.50"],
      ["Mains", "Hake, brown shrimp butter, sea greens", "26.00"],
      ["", "Lamb shoulder for two, anchovy, flageolet beans", "58.00"],
      ["", "Pumpkin and sage lasagne (v)", "19.50"],
      ["", "Guinea fowl, girolles, tarragon", "28.50"],
      ["Sides", "Chips, rosemary salt", "5.00"],
      ["", "Bitter leaves, walnut dressing", "6.00"],
      ["Puddings", "Brown butter tart, crème fraîche", "8.50"],
      ["", "Blood orange sorbet", "6.50"],
      ["", "Cheese: Tunworth, Stichelton, oatcakes", "12.50"],
      ["", "A discretionary 12.5% service charge is added. Kitchen closes 21:45; last pudding orders 22:15.", ""],
    ],
    questions: [
      { id: "q1", prompt: "How much is the hake?", answer: "£26.00", accept: ["26", "26.00", "£26", "twenty-six"], subskill: "observation.detail" },
      { id: "q2", prompt: "What accompanies the guinea fowl?", answer: "girolles and tarragon", accept: ["girolles, tarragon", "girolles tarragon", "mushrooms and tarragon"], subskill: "observation.text" },
      { id: "q3", prompt: "Which two cheeses are on the board?", answer: "Tunworth and Stichelton", accept: ["tunworth, stichelton", "stichelton and tunworth", "tunworth stichelton"], subskill: "observation.text" },
      { id: "q4", prompt: "What is the service charge percentage?", answer: "12.5%", accept: ["12.5", "12,5%", "twelve and a half percent"], subskill: "observation.detail" },
      { id: "q5", prompt: "Which is the cheapest starter?", answer: "Grilled leeks", accept: ["leeks", "grilled leeks, romesco, hazelnuts", "the leeks"], subskill: "observation.detail" },
      { id: "q6", prompt: "Which closes first: the kitchen, or pudding orders?", answer: "The kitchen (21:45)", accept: ["kitchen", "the kitchen", "kitchen closes first", "21:45"], subskill: "observation.chronology" },
    ],
  },
  {
    id: "doc-ticket-tgv",
    title: "Coach 12, Seat 71",
    kind: "ticket",
    seconds: 20,
    difficulty: 2,
    lines: [
      "RAIL TICKET · E-TICKET",
      "Passenger: MARGUERITE DELACROIX   Adult",
      "From: PARIS GARE DE LYON   To: TORINO PORTA SUSA",
      "Train: TGV 9247   Date: Sun 17 May 2026",
      "Dep 10:46   Arr 16:26   Duration 5h40",
      "Coach 12   Seat 71   Window · Forward-facing",
      "Class: Standard   Fare: Non-flexible",
      "Price: EUR 79.00   Booking ref: KQ7M4X",
      "Present the QR code at the gate. No paper validation required.",
      "Bicycle: none   Luggage: 2 items included",
      "Issued 03 Apr 2026 at 14:08 via mobile app",
      "Exchange: not permitted. Refund: not permitted.",
    ],
    questions: [
      { id: "q1", prompt: "What is the seat number?", answer: "71", accept: ["seat 71", "seventy-one"], subskill: "observation.detail" },
      { id: "q2", prompt: "What time does the train arrive?", answer: "16:26", accept: ["16.26", "4:26 pm", "4.26pm"], subskill: "observation.detail" },
      { id: "q3", prompt: "What is the booking reference?", answer: "KQ7M4X", accept: ["kq7m4x"], subskill: "observation.text" },
      { id: "q4", prompt: "What is the train number?", answer: "TGV 9247", accept: ["9247"], subskill: "observation.detail" },
      { id: "q5", prompt: "On what date was the ticket issued?", answer: "3 April 2026", accept: ["03 apr 2026", "3 apr", "april 3", "3rd april", "03/04/2026", "3 april"], subskill: "observation.chronology" },
      { id: "q6", prompt: "How many luggage items are included?", answer: "2", accept: ["two"], subskill: "observation.detail" },
    ],
  },
  {
    id: "doc-schedule-conference",
    title: "The Conference Programme",
    kind: "schedule",
    seconds: 40,
    difficulty: 4,
    columns: ["Time", "Room A — Main hall", "Room B — Library"],
    rows: [
      ["09:00", "Registration and coffee", ""],
      ["09:30", "Opening remarks: Dr Helen Achterberg", ""],
      ["10:00", "Keynote: 'Ports before Containers' — J. Mbeki", ""],
      ["11:00", "Break", "Break"],
      ["11:20", "Panel: Insurance and risk at sea", "Workshop: Reading a bill of lading"],
      ["12:30", "Lunch (served in the atrium)", ""],
      ["13:30", "The Hanseatic archive — S. Lindqvist", "Workshop repeat: Reading a bill of lading"],
      ["14:30", "Case: The Suez blockage of 2021 — A. Farouk", "Open discussion"],
      ["15:30", "Break", "Break"],
      ["15:50", "Closing debate: Should ports be public?", ""],
      ["17:00", "Drinks (Room B)", ""],
    ],
    questions: [
      { id: "q1", prompt: "Who gives the keynote?", answer: "J. Mbeki", accept: ["mbeki", "j mbeki"], subskill: "observation.text" },
      { id: "q2", prompt: "At what time is the talk on the Hanseatic archive?", answer: "13:30", accept: ["13.30", "1:30 pm", "1.30pm", "half past one"], subskill: "observation.detail" },
      { id: "q3", prompt: "Where is lunch served?", answer: "the atrium", accept: ["atrium", "in the atrium"], subskill: "observation.text" },
      { id: "q4", prompt: "Which session is repeated in the afternoon?", answer: "Reading a bill of lading", accept: ["bill of lading", "the bill of lading workshop", "workshop: reading a bill of lading"], subskill: "observation.chronology" },
      { id: "q5", prompt: "What is happening in Room B while A. Farouk speaks?", answer: "Open discussion", accept: ["an open discussion", "discussion"], subskill: "observation.detail" },
      { id: "q6", prompt: "Which happens first: the closing debate or the drinks?", answer: "The closing debate (15:50)", accept: ["closing debate", "the debate", "debate", "15:50"], subskill: "observation.chronology" },
    ],
  },
  {
    id: "doc-map-legend-harbour",
    title: "Harbour Map Legend",
    kind: "map",
    seconds: 40,
    difficulty: 4,
    lines: [
      "CASTLEFORD HARBOUR — VISITOR MAP · LEGEND",
      "Scale 1 : 5,000 (1 cm = 50 m)",
      "Red circle — Ferry terminal. Sailings every 40 min from 06:20; last sailing 21:40",
      "Blue square — Lifeboat station (no public access)",
      "Green triangle — Viewpoint, 48 m above sea level",
      "P — Car parks: North Quay (220 spaces); Mill Lane (60 spaces, height limit 2.1 m)",
      "WC — Toilets: terminal building and Mill Lane car park",
      "i — Visitor information, open 09:00–17:00 April to October, closed Mondays",
      "Dashed line — Coastal path, 3.2 km to Bell Point",
      "Dotted line — Cycle route 41",
      "Hatched area — Tidal mudflats. Do not cross within 2 hours of high water",
      "Grey shading — Restricted port area, permit holders only",
      "Numbers in circles — Information boards 1 to 7",
      "Map revised March 2026",
    ],
    questions: [
      { id: "q1", prompt: "How often do the ferries sail?", answer: "every 40 minutes", accept: ["40 min", "every 40 min", "forty minutes", "40 minutes"], subskill: "observation.detail" },
      { id: "q2", prompt: "How high is the viewpoint above sea level?", answer: "48 m", accept: ["48", "48 metres", "48 meters", "forty-eight"], subskill: "observation.detail" },
      { id: "q3", prompt: "Which car park has a height limit, and what is it?", answer: "Mill Lane, 2.1 m", accept: ["mill lane 2.1", "mill lane, 2.1 metres", "mill lane (2.1 m)", "mill lane 2.1m"], subskill: "observation.text" },
      { id: "q4", prompt: "On which day is visitor information closed?", answer: "Monday", accept: ["mondays", "closed mondays"], subskill: "observation.text" },
      { id: "q5", prompt: "What does a dotted line mark?", answer: "Cycle route 41", accept: ["cycle route", "the cycle route", "route 41", "cycle path"], subskill: "observation.text" },
      { id: "q6", prompt: "What is the last ferry sailing time?", answer: "21:40", accept: ["21.40", "9:40 pm", "9.40pm"], subskill: "observation.detail" },
    ],
  },
  {
    id: "doc-memo-branch",
    title: "Branch Memorandum",
    kind: "memo",
    seconds: 40,
    difficulty: 4,
    lines: [
      "MEMORANDUM",
      "To: All floor staff, Ashworth Street branch",
      "From: Dana Whitcombe, Branch Manager",
      "Date: Monday 15 June 2026",
      "Re: Stocktake and revised opening hours, week of 22 June",
      "",
      "1. Stocktake takes place on Sunday 21 June from 07:00. Attendance is paid at time-and-a-half; sign up with Ravi by Thursday 18 June.",
      "2. From Monday 22 June the branch opens at 08:30 (not 09:00) and closes at 18:30 on weekdays. Saturday hours are unchanged: 09:00–17:00.",
      "3. The rear loading door is out of use from 23 to 25 June while the ramp is replaced. Deliveries in that window come through the Ashworth Street entrance before 08:15.",
      "4. Uniform: the new grey aprons arrive on Wednesday 17 June. Old green aprons may be worn until 30 June.",
      "5. The fire assembly point has moved to the corner of Ashworth Street and Bell Lane.",
      "",
      "Questions to me or to Ravi. Thank you.",
    ],
    questions: [
      { id: "q1", prompt: "When does the stocktake begin?", answer: "Sunday 21 June, 07:00", accept: ["21 june 07:00", "sunday 21 june", "21 june at 7", "7am sunday", "sunday at 07:00", "21 june 7:00"], subskill: "observation.detail" },
      { id: "q2", prompt: "By when must staff sign up for the stocktake, and with whom?", answer: "Thursday 18 June, with Ravi", accept: ["18 june ravi", "thursday, ravi", "ravi by thursday", "ravi by 18 june", "18 june with ravi"], subskill: "observation.text" },
      { id: "q3", prompt: "What is the new weekday opening time?", answer: "08:30", accept: ["8:30", "8.30", "half past eight", "08.30"], subskill: "observation.detail" },
      { id: "q4", prompt: "Which comes first: the arrival of the new aprons or the stocktake?", answer: "The aprons (Wednesday 17 June)", accept: ["aprons", "the aprons", "apron delivery", "new aprons", "17 june"], subskill: "observation.chronology" },
      { id: "q5", prompt: "Between which dates is the rear loading door out of use?", answer: "23 to 25 June", accept: ["23-25 june", "23–25 june", "23 and 25 june", "23rd to 25th"], subskill: "observation.detail" },
      { id: "q6", prompt: "Where is the new fire assembly point?", answer: "Corner of Ashworth Street and Bell Lane", accept: ["ashworth street and bell lane", "bell lane", "ashworth and bell", "corner of ashworth and bell lane"], subskill: "observation.text" },
    ],
  },
];

/* ---------------- Chronology ---------------- */

export const CHRONOLOGY_EXERCISES: ChronologyExercise[] = [
  {
    id: "chr-kitchen-morning",
    title: "The Kitchen Table",
    context:
      "Five photographs of the same kitchen table, taken on one Saturday morning by a camera that was set to fire at random. The order they were saved in has been lost. Put them in the order they were taken.",
    ordered: [
      "The cafetière is full and the plunger is up; the newspaper lies folded in its plastic sleeve; the toaster is cold.",
      "The plunger is down and one cup has been poured; the front page is spread flat; the toaster is ticking.",
      "The cafetière is a third full; the crossword page is uppermost with three clues filled in; crumbs on a plate.",
      "The cafetière is rinsed and upside down on the draining board; the crossword is two-thirds done, a pen lying across it.",
      "The newspaper is in the recycling box; the cup and plate are in the dishwasher rack; the table has been wiped.",
    ],
    explanation:
      "Three processes run in one direction only. Coffee in a cafetière goes from full to poured to rinsed. A crossword accumulates answers; nobody un-fills a clue. Objects move from storage (the sleeve) to use (the table) to disposal (the recycling box, the dishwasher). No single cue orders every frame, but each pair of frames is fixed by at least one of them. The toaster is a weak cue: it is cold before use and warm after, but it would also be cold again by the last frames, so it cannot separate the end of the sequence on its own.",
    difficulty: 2,
  },
  {
    id: "chr-restaurant-candle",
    title: "The Receipt and the Candle",
    context:
      "A waiter photographed one table six times over an evening to settle an argument about how long the guests stayed. Order the frames.",
    ordered: [
      "The table is laid for two; the candle is unlit and the wick is white; a reserved card reads 19:30.",
      "The candle is lit, almost full height; menus are open; the bread basket is full; a bottle of wine, uncorked and untouched.",
      "Two starters half eaten; the bottle two-thirds full; the candle has lost a centimetre or so.",
      "Main-course plates cleared; the bottle nearly empty; the candle at about half its height; one crust in the bread basket.",
      "A card receipt on a saucer, time-stamped 21:52; the candle guttering in a pool of wax; the chairs pushed back at an angle.",
      "Chairs pushed in, cloth removed, the candle stub in a bin liner by the service station.",
    ],
    explanation:
      "The candle is the clock: a candle only ever gets shorter, so its height orders every frame in which it appears. The wine and the bread go down for the same reason, with one caveat: a second bottle or a refilled basket would reset those cues, which is why the candle is more reliable than either. The receipt fixes an absolute time and must come after the meal, because you cannot be charged for what has not been served. The reserved card gives the start; the stripped table can only be last.",
    difficulty: 3,
  },
  {
    id: "chr-hotel-room",
    title: "Room 412",
    context:
      "Housekeeping keeps a photo log of each room. These five frames of room 412 were taken across a day and a half, but the log's timestamps were corrupted. Reconstruct the order.",
    ordered: [
      "The bed is made with tight corners; a folded welcome card sits on the pillow; the fruit bowl holds three apples and a pear; the bathroom bin is empty.",
      "A suitcase lies open on the rack; the welcome card has been moved to the desk; one apple is gone; one damp towel is on the bathroom floor.",
      "Two towels are damp; a room-service tray sits outside the door with a cloche and a slip reading 22:15; the curtains are drawn.",
      "The tray has gone; the 'please make up the room' hanger is on the door handle; the bed is unmade; a used coffee capsule is in the machine's drawer.",
      "The bed is remade; the fruit bowl has been replenished to four pieces; fresh towels are hung; the suitcase is still open on the rack.",
    ],
    explanation:
      "A hotel room alternates between a reset state and a used state. Consumables only decrease between resets, so the apples, the towels and the coffee capsule run forward until housekeeping runs them back. The room-service slip gives a clock time and the tray must be collected after it is delivered. The 'make up the room' hanger typically goes out in the morning, after the night in which the second towel was used. The final frame is a reset, but the suitcase shows the guest has not checked out, which is why it is not the first frame: the first frame has no luggage at all.",
    difficulty: 3,
  },
  {
    id: "chr-garden-rain",
    title: "The Garden After Rain",
    context:
      "A neighbour's garden camera saved five stills across one afternoon. The file names are gibberish. Put the stills in order.",
    ordered: [
      "Heavy rain on the greenhouse roof; the water butt is overflowing; the path is a sheet of water.",
      "The rain has stopped; the path shines; drips fall from the gutter; the sky is brightening from the west.",
      "The paving is dry in patches and still dark along the joints; the lawn steams in sunlight; a blackbird is pulling worms from the grass.",
      "The paving is fully dry; a wheelbarrow of cuttings stands by the compost; the lawn is half mown, with stripes reaching the middle.",
      "The whole lawn is mown; the mower is under the lean-to; the cuttings are on the compost heap; the lid is back on the water butt.",
    ],
    explanation:
      "Drying runs one way: sheet of water, shine, patches, dry. Mowing is the second clock, because nobody mows a wet lawn if they can help it, and a half-mown lawn precedes a fully mown one. The wheelbarrow of cuttings and the tidied mower place the last two frames. Weather clearing from the west is a fair regional cue in much of western Europe, where weather systems generally arrive from that direction, but it is not decisive on its own. The blackbird is atmosphere, not evidence: worms surface after rain, but a blackbird can be on a lawn at any time.",
    difficulty: 3,
  },
  {
    id: "chr-market-street",
    title: "Market Day",
    context:
      "Six frames from a street camera on a market day. Order them, and note which cue you trusted most.",
    ordered: [
      "Vans parked along the closed street; poles and canvas laid on the ground; crates stacked and unopened.",
      "The stalls are up; the fishmonger's ice is fresh and level; the price boards are blank; a first customer with a dog.",
      "The queue at the bread stall is ten deep; the fish stall's ice has sunk and streaked; three lines on its price board have been crossed out.",
      "Half the bread stall is empty; the fish stall is down to two trays and a handwritten 'half price'; flattened cardboard is piled by the kerb.",
      "Poles and canvas are back in the vans; a council sweeper works from the far end; gulls stand in the puddle where the fish stall was.",
      "The street has reopened; the sweeper has gone; one crate is left against a wall; the parking bays are full of cars again.",
    ],
    explanation:
      "Melting ice is the most reliable clock here: it only goes one way, and it does not depend on anyone's decisions. Stock depletion is nearly as good, and the 'half price' sign is a late-day signal because traders reduce prices when they would rather sell than carry stock home. Crossed-out lines on a price board accumulate. The sweeper arrives after the stalls are cleared, and cars only return once the closure is lifted. The lone crate in the last frame is a leftover, not a sign that setting up has begun; a single object out of place should not outweigh the state of the whole street.",
    difficulty: 4,
  },
  {
    id: "chr-square-shadows",
    title: "The Fountain in the Square",
    context:
      "A fixed webcam in a town square in northern Italy saved five stills on a clear day in June. Order them. The camera faces north across the square, so north is at the top of every frame.",
    ordered: [
      "The fountain's shadow stretches long toward the west side of the square; the baker's shutter is half up; the café chairs are stacked and chained.",
      "The shadow is shorter and points north-west; the café chairs are set out and one is taken; the baker's window is full of loaves.",
      "The shadow is at its shortest, a small patch just north of the fountain; every café table is occupied; the baker's trays are half empty.",
      "The shadow lengthens toward the east; the baker's shutter is down; two tables are occupied.",
      "The streetlights are on; the chairs are stacked and chained again; the fountain is lit from below.",
    ],
    explanation:
      "In the northern hemisphere the sun rises in the east, so morning shadows point west; at solar noon the sun is due south and shadows are at their shortest, pointing north; in the evening the sun is in the west and shadows point east. That alone orders the four daylight frames. The bakery is a second, independent clock: bakeries open early and often close early in the afternoon, and stock declines through the morning. The café runs the other way, filling toward lunchtime and emptying after. The streetlit frame is last. Note that shadows would give the reverse answer in the southern hemisphere; the location matters.",
    difficulty: 4,
  },
  {
    id: "chr-gate-b23",
    title: "Gate B23",
    context:
      "Six photographs of the same departure gate, saved without timestamps. Two different flights used the gate that afternoon. Put the frames in order and be careful with the times displayed on the board.",
    ordered: [
      "The board reads 'KL1012 Amsterdam — Boarding 14:05'; the seating area is a third full; the desk is unstaffed.",
      "The board reads 'KL1012 Amsterdam — Delayed, new boarding 14:35'; the seating area is two-thirds full; someone is asleep across three seats.",
      "Two agents at the desk; the board reads 'KL1012 — Now boarding, group 1'; a queue has formed.",
      "The board reads 'KL1012 — Final call'; five people remain seated; the queue has gone; the sleeper is gone too.",
      "The jet bridge has retracted; the aircraft has pushed back; the board reads 'KL1012 — Departed 15:02'.",
      "The board reads 'LH2223 Munich — Go to gate'; the seating area is nearly empty; the desk is unstaffed.",
    ],
    explanation:
      "A gate's board moves through a fixed sequence: scheduled, sometimes delayed, boarding, final call, departed, then the next flight. The trap is the displayed time. 'Boarding 14:05' is a plan, not an event; the frame showing it was taken before the delay was announced, even though 14:05 is earlier than every other number on the board. Only 'Departed 15:02' records something that has happened. The next flight's 'Go to gate' can only appear after the previous aircraft has left. The sleeping passenger is not a cue; people sleep at gates at any stage.",
    difficulty: 5,
  },
  {
    id: "chr-meeting-room",
    title: "The Pricing Review",
    context:
      "Seven frames from a meeting room's occupancy camera, which fires when the light level changes. The room's booking panel is visible by the door in every frame. Reconstruct the order.",
    ordered: [
      "The panel reads 'Pricing review 10:00–11:30 — starts in 12 min'; the whiteboard is clean; the chairs are pushed in; the blinds are half down.",
      "Six chairs pulled out; a laptop plugged in showing a slide titled 'Agenda'; six full cups on a tray; the blinds fully up.",
      "The whiteboard carries a table of prices with two columns crossed out; four cups are half empty and two untouched; a jacket hangs on a chair.",
      "One column on the whiteboard is circled and 'Agreed: option B' is written beside it; the jacket has gone; the panel reads 'Pricing review — ends in 5 min'.",
      "The whiteboard has been wiped except for the circled column and the words 'DO NOT ERASE'; one untouched cup has a skin on it; the panel reads 'Interview 11:30–12:00 — in progress'.",
      "Two people sit across one corner of the table; a single printed CV between them; the tray of cups has gone; the circled column is still on the board.",
      "The room is dark; the chairs pushed in; the whiteboard entirely clean; the panel reads 'Free until 14:00'.",
    ],
    explanation:
      "The booking panel is a literal clock, and it is the strongest cue: 'starts in 12 min', 'ends in 5 min', 'in progress' for the next booking and 'free until' are four ordered states. The whiteboard is the second cue, but it runs in two directions: it accumulates content during a meeting and is wiped after, so 'wiped except the circled column' can only follow 'circled', and 'entirely clean' can be first or last; the panel settles which. The untouched cup with a skin is a duration cue: milk skin forms as coffee cools, so that frame is well after the coffee was poured. The jacket leaving is not evidence of much on its own. Notice also that the interview frame shows the cups gone but the circled column still present: two independent processes, one of which (cleaning) has run and one of which (the board) has not.",
    difficulty: 6,
  },
];

/* ---------------- Signal and Noise ---------------- */

export const SIGNAL_EXERCISES: SignalNoiseExercise[] = [
  {
    id: "sig-flat-viewing",
    title: "The Flat Viewing",
    context:
      "You are viewing a two-bedroom flat to rent, second floor of a converted Victorian house. You have twenty minutes. Which details deserve a follow-up question before you sign anything?",
    pick: 4,
    difficulty: 3,
    details: [
      { id: "d1", text: "The smaller bedroom has been freshly painted on one wall only; the other three walls are older paint.", signal: true, why: "A single repainted wall is what you do to cover a stain, most often damp or mould. Ask what was there." },
      { id: "d2", text: "A dehumidifier stands in the hall cupboard, its tank half full.", signal: true, why: "A dehumidifier in use is direct evidence of a moisture problem somewhere in the flat. The half-full tank says it ran recently." },
      { id: "d3", text: "The agent is wearing a lanyard from a different agency.", signal: false, why: "Agents move between firms and borrow lanyards. It tells you nothing about the flat." },
      { id: "d4", text: "A notice in the stairwell, dated two months ago, asks residents to report any further water ingress to the management company.", signal: true, why: "'Further' means there has already been water ingress in the building, and recently. Ask which flats were affected and whether it was resolved." },
      { id: "d5", text: "The living-room sofa is bright yellow.", signal: false, why: "Furniture taste is not information about the tenancy, the building or the costs." },
      { id: "d6", text: "The boiler's service sticker shows the last service was fourteen months ago.", signal: true, why: "Annual gas safety checks are a legal obligation for landlords in the UK. An overdue one is a compliance and safety question, and a hint about how the landlord maintains things." },
      { id: "d7", text: "The kitchen has a view of a school playground.", signal: false, why: "Relevant to your taste in noise, perhaps, but it is not something you need to investigate; you can hear it for yourself." },
      { id: "d8", text: "There are four different takeaway menus on the fridge.", signal: false, why: "Tells you the previous tenants ordered food. It is texture, not evidence of anything you need to decide." },
      { id: "d9", text: "The flat number on the door is 2B, but the listing said 2A.", signal: false, why: "Listings often carry small errors; confirm it, but it is a clerical detail rather than a risk. Included as a tempting near-miss." },
    ],
  },
  {
    id: "sig-supplier-visit",
    title: "The Factory Visit",
    context:
      "You are visiting a small machining supplier before placing a first order worth a year of their capacity. The owner gives you a tour. What matters?",
    pick: 4,
    difficulty: 4,
    details: [
      { id: "d1", text: "The maintenance tags on the two largest CNC machines show their last service three years ago; the smaller machines were serviced this spring.", signal: true, why: "The machines you would depend on are the ones not being maintained. Either cash is tight or they are not in daily use; both matter to you." },
      { id: "d2", text: "Half of the shop-floor lights are switched off, over bays with no work in progress.", signal: true, why: "Idle bays in working hours say the shop is under-utilised. That could mean capacity for you or a business in trouble; either way, ask." },
      { id: "d3", text: "The quality board by the door was updated this morning: scrap rate 1.8%, one customer complaint open.", signal: true, why: "A board updated today shows someone is actually running a quality process. The open complaint is a fair thing to ask about directly." },
      { id: "d4", text: "The owner's office has an expensive espresso machine.", signal: false, why: "Owners buy coffee machines. It says nothing about the shop's ability to deliver your parts." },
      { id: "d5", text: "Finished parts on the dispatch racks are coated in a fine layer of dust.", signal: true, why: "Finished goods that have sat long enough to gather dust have not been collected or paid for. That is a cash-flow and customer-relationship question worth asking." },
      { id: "d6", text: "The staff uniforms carry the company's old logo.", signal: false, why: "Companies use up old uniforms. It is thrift, not a warning." },
      { id: "d7", text: "The visitors' book shows two other visitors this week.", signal: false, why: "Two visitors could be customers, auditors or a lift engineer. Not enough to be informative without more." },
      { id: "d8", text: "It is raining hard and the car park is half flooded.", signal: false, why: "Weather. Unless your parts are stored outside, it is irrelevant." },
      { id: "d9", text: "The owner mentions his daughter has just joined the business as operations manager.", signal: false, why: "Family succession is common in small firms and could be good or bad. On its own it does not bear on your order." },
    ],
  },
  {
    id: "sig-used-car",
    title: "The Used Car",
    context:
      "A private seller is showing you a seven-year-old estate car in a supermarket car park. You can look but not drive it yet. Which details should shape your next questions?",
    pick: 3,
    difficulty: 2,
    details: [
      { id: "d1", text: "The paint on the rear quarter panel is a slightly different shade from the door in front of it.", signal: true, why: "A colour mismatch on one panel is the classic sign of a repair. Ask what happened and whether it was declared to the insurer." },
      { id: "d2", text: "The front tyres are a premium brand; the rear tyres are two different budget brands.", signal: true, why: "Mismatched budget tyres suggest the car has been run on the cheapest option, which often goes with skipped maintenance elsewhere. It also costs you a set of tyres." },
      { id: "d3", text: "There is a pine-scented air freshener hanging from the mirror.", signal: false, why: "Everyone has one. It could mask a smell, but on its own it is not evidence of anything." },
      { id: "d4", text: "The service book has stamps at 12,000-mile intervals up to four years ago, then nothing.", signal: true, why: "A service history that stops is more informative than one that never existed. Three years without a recorded service is a direct question for the seller." },
      { id: "d5", text: "The radio is tuned to a classical station.", signal: false, why: "The previous owner's taste in music does not affect the car." },
      { id: "d6", text: "The seller has brought a folder of receipts, sorted by date.", signal: false, why: "Helpful, but the receipts are the evidence, not the folder. Read them before drawing conclusions." },
      { id: "d7", text: "The boot contains a child's car seat.", signal: false, why: "Tells you something about the seller's household, which is not yours to infer from and does not bear on the car's condition." },
      { id: "d8", text: "The car is parked with its nose toward a wall.", signal: false, why: "People park how they park. It might hide a scuff; then again, so might any parking spot. Walk round it." },
    ],
  },
  {
    id: "sig-restaurant-abroad",
    title: "Where to Eat",
    context:
      "You are in a port city you do not know, at half past one, choosing between restaurants on a busy square. You have thirty seconds outside each. What actually predicts a good lunch?",
    pick: 4,
    difficulty: 3,
    details: [
      { id: "d1", text: "The menu is short, handwritten, and in the local language only.", signal: true, why: "A short menu means fresh stock turned over quickly; a handwritten one changes with what came in. One language means the customers are local." },
      { id: "d2", text: "Most of the tables are occupied by people in work clothes, some with a newspaper.", signal: true, why: "Regulars at a weekday lunch are the most reliable review available. Workers who eat somewhere daily do not tolerate bad, expensive food." },
      { id: "d3", text: "There is a large photo of each dish on a laminated board outside, in six languages.", signal: true, why: "This is also a signal, the other way: it is designed for people who will never come back. It usually predicts mediocre food at tourist prices." },
      { id: "d4", text: "The awning is a handsome dark green with the name in gold script.", signal: false, why: "Design is bought. Good and bad restaurants alike have handsome awnings." },
      { id: "d5", text: "A waiter is standing outside inviting passers-by in.", signal: true, why: "A restaurant that needs to recruit customers off the street at peak lunch hour is not full of regulars. It is a mild but genuine negative." },
      { id: "d6", text: "The building is three storeys with wrought-iron balconies.", signal: false, why: "The architecture belongs to the city, not the kitchen." },
      { id: "d7", text: "A cat is asleep on a chair by the door.", signal: false, why: "Charming, and irrelevant to the food, whatever a guidebook might suggest." },
      { id: "d8", text: "The restaurant has a rating sticker from a travel website on the door.", signal: false, why: "These stickers are ordered by the restaurant, not awarded. They are decoration." },
      { id: "d9", text: "The tablecloths are paper.", signal: false, why: "Paper cloths are ordinary in many cuisines and price ranges. They predict nothing about quality." },
    ],
  },
  {
    id: "sig-viral-photo",
    title: "The Viral Photograph",
    context:
      "A photograph is circulating that claims to show a flooded street in a named coastal town 'this morning'. You have five minutes to decide whether to pass it on. What should you check?",
    pick: 4,
    difficulty: 4,
    details: [
      { id: "d1", text: "The shadows in the photo fall long and to the left, while the caption says it was taken at noon.", signal: true, why: "Long shadows mean a low sun, which means early or late in the day, not noon. Either the time is wrong or the photo is." },
      { id: "d2", text: "A shop sign in the background is in a script not used in the named country.", signal: true, why: "A sign in the wrong language is close to decisive about location. The photo may be real but somewhere else." },
      { id: "d3", text: "The earliest account you can find posting it was created two days ago and has posted nothing else.", signal: true, why: "Provenance is the strongest test. A fresh single-purpose account is a common origin for recycled or fabricated images." },
      { id: "d4", text: "A reverse image search returns a near-identical frame from a news report in 2019.", signal: true, why: "A dated earlier copy settles the question: the photo is old, whatever the caption says." },
      { id: "d5", text: "The post has been shared forty thousand times.", signal: false, why: "Share counts measure how compelling an image is, not whether it is true. False images spread faster." },
      { id: "d6", text: "The caption is in capitals and ends with three exclamation marks.", signal: false, why: "Tone is not evidence. Real emergencies produce shouting, and so do hoaxes." },
      { id: "d7", text: "The image carries a watermark resembling a broadcaster's logo.", signal: false, why: "Watermarks are trivial to add and are often faked. Confirm with the broadcaster rather than trusting the overlay." },
      { id: "d8", text: "The image is low resolution.", signal: false, why: "Compression happens to every image that passes through messaging apps. It tells you nothing about authenticity either way." },
      { id: "d9", text: "The water in the photo looks brown.", signal: false, why: "Floodwater is usually brown. It is consistent with a flood but does not distinguish this flood from any other." },
    ],
  },
  {
    id: "sig-negotiation-room",
    title: "Across the Table",
    context:
      "You arrive for a negotiation over a supply contract. The other side's team of three is already seated. Before anyone speaks, what in the room is actually informative about their position?",
    pick: 3,
    difficulty: 5,
    details: [
      { id: "d1", text: "Their printed copy of your proposal is open at page 7, the delivery-schedule page, which is heavily annotated; the pricing pages have no marks.", signal: true, why: "Where people have written is where they have thought. It suggests schedule, not price, is their live concern. Test it rather than assume it." },
      { id: "d2", text: "One of the three is introduced as from their legal department.", signal: true, why: "Bringing a lawyer to a commercial meeting usually means they expect to reach terms today or have a specific clause in mind. Either changes how you should run the meeting." },
      { id: "d3", text: "The room is booked, according to the door panel, for ninety minutes.", signal: true, why: "A hard stop is a constraint on both sides. Knowing it lets you pace the meeting and notice if they try to run the clock." },
      { id: "d4", text: "One of them is drumming his fingers on the table.", signal: false, why: "Finger-drumming is not readable. People do it when bored, cold, thinking or listening to music in their head. Do not build anything on it." },
      { id: "d5", text: "The sandwiches on the side table are from an expensive caterer.", signal: false, why: "Hospitality budgets are set by office managers, not negotiators. It does not reveal how much they want the deal." },
      { id: "d6", text: "The whiteboard has the ghost of a wiped org chart on it.", signal: false, why: "Left over from another meeting. Tempting to read, but you cannot tell whose it was or when." },
      { id: "d7", text: "Their most senior person sits at the end of the table rather than the middle.", signal: false, why: "Seating conventions vary by company and by room shape. It is not reliable evidence of hierarchy or intent." },
      { id: "d8", text: "The wall calendar shows a trade fair circled next month.", signal: false, why: "A circled fair could be theirs, a competitor's or a supplier's. Without more it is not usable." },
    ],
  },
  {
    id: "sig-missing-parcel",
    title: "The Missing Parcel",
    context:
      "A parcel was marked 'delivered, handed to resident' yesterday, but you never received it. The courier app gives you a proof-of-delivery photo and a timeline. Which details help you work out what happened?",
    pick: 4,
    difficulty: 3,
    details: [
      { id: "d1", text: "The proof-of-delivery photo shows a doormat with a pattern you do not recognise, in front of a door with a brass number 14; you live at 41.", signal: true, why: "A different doormat and a transposed number strongly suggest the parcel went to the wrong address. That is a specific, checkable claim." },
      { id: "d2", text: "The delivery timestamp is 06:12.", signal: true, why: "A residential hand-over at ten past six in the morning is unusual and worth questioning; it may be a scan error, or a driver running an unusual round." },
      { id: "d3", text: "The tracking log shows 'out for delivery' at 05:40 and 'delivered' at 06:12, a round of thirty-two minutes.", signal: true, why: "Thirty-two minutes from depot to your street is tight for a normal route. Combined with the early hour it raises the chance of a mis-scan." },
      { id: "d4", text: "The photo's metadata gives a GPS position 300 metres from your house.", signal: true, why: "A location fix is near-direct evidence of where the driver stood. Three hundred metres is another street." },
      { id: "d5", text: "The parcel tape in the photo is branded with the retailer's name.", signal: false, why: "That tells you it is your retailer's parcel, which you already knew. It does not tell you where it went." },
      { id: "d6", text: "It was raining at the time of delivery.", signal: false, why: "Weather does not change where a parcel was left." },
      { id: "d7", text: "The driver's first name is given as 'Marek'.", signal: false, why: "Knowing the driver's name is useful for the complaint, but it is not evidence about the parcel's location." },
      { id: "d8", text: "Your neighbour at 43 has a van that was parked outside all day.", signal: false, why: "A neighbour's van is a fact about the neighbour. Nothing connects it to the parcel, and reasoning from it would be pure suspicion." },
      { id: "d9", text: "The parcel was insured for the full value.", signal: false, why: "Reassuring for you, irrelevant to the question of what happened." },
    ],
  },
  {
    id: "sig-old-letter",
    title: "The Letter of 1815",
    context:
      "A dealer offers you a letter said to have been written in London in the spring of 1815. You may examine it for ten minutes without instruments. Which observations bear on whether the date is plausible?",
    pick: 4,
    difficulty: 5,
    details: [
      { id: "d1", text: "Held to the light, the paper shows a watermark with a maker's name and the date 1823.", signal: true, why: "Paper mills watermarked the year of manufacture. A letter cannot be written on paper made eight years later. This alone is close to decisive." },
      { id: "d2", text: "The writer refers to travelling by 'the railway' to Birmingham.", signal: true, why: "There was no passenger railway to Birmingham in 1815; the London and Birmingham line opened in 1838. The content contradicts the date." },
      { id: "d3", text: "The paper is a uniform bright white with no foxing or discolouration.", signal: true, why: "Early nineteenth-century rag paper usually tones with age; brilliant white paper is more typical of later wood-pulp or modern stock. Suggestive, not conclusive, because some well-stored rag paper survives pale." },
      { id: "d4", text: "The letter is folded in thirds and sealed with red wax; there is no envelope.", signal: true, why: "This is consistent with 1815: envelopes only became common after 1840 with the penny post. Consistency is weaker than contradiction, but absence of an envelope is what you would expect." },
      { id: "d5", text: "The handwriting slopes to the right.", signal: false, why: "Nearly all cursive hands slope right, in every period. It does not date anything." },
      { id: "d6", text: "The ink has faded to brown.", signal: false, why: "Iron-gall ink browns with age, but a forger can make ink brown in an afternoon. Not distinguishing." },
      { id: "d7", text: "The letter mentions the weather being unusually cold.", signal: false, why: "Tempting: 1816 was famously 'the year without a summer' after the Tambora eruption. But a cold spring is not rare, and this is 1815, so it neither supports nor refutes." },
      { id: "d8", text: "The dealer's shop has been trading for forty years.", signal: false, why: "The dealer's longevity is not evidence about this letter. Reputable dealers are sold fakes too." },
      { id: "d9", text: "The letter smells faintly of pipe smoke.", signal: false, why: "Old paper absorbs the smell of wherever it was kept. It could be last week's pipe." },
    ],
  },
];

/* ---------------- What Is Missing ---------------- */

export const MISSING_EXERCISES: MissingExercise[] = [
  {
    id: "mis-restaurant-friday",
    title: "Table for Two at Ten Past Eight",
    scene:
      "It is 20:10 on a Friday at a restaurant you booked a week ago. The dining room is three-quarters full; candles are lit on every table; a waiter takes your coat and shows you to a table by the window. The music is a little loud. You are given menus and a jug of iced water, and you look around: couples and groups of four sit with drinks in front of them, menus open, talking. The swing door to the kitchen opens twice while you look; beyond it you see bright light and steel counters. The room smells faintly of furniture polish and the candles.",
    missing: [
      { text: "The smell of cooking. A full dining room at eight on a Friday should smell of food, not polish.", keywords: ["smell", "aroma", "scent", "cooking smell", "food smell", "smell of food"], why: "Cooking produces smell before it produces plates. A kitchen that has been working for an hour fills the room with it. Its absence says the kitchen is not cooking, or not yet." },
      { text: "Kitchen noise. When the swing door opens you should hear pans, extractor fans and calls from the pass.", keywords: ["noise", "sound", "clatter", "pans", "shouting", "calls", "kitchen noise", "quiet kitchen"], why: "A working kitchen on a Friday service is loud. Bright lights and steel are the room; the sound is the activity, and it is not there." },
      { text: "Food on the tables. Three-quarters of a room seated at 20:10 should include people who are eating.", keywords: ["plates", "food on tables", "eating", "dishes", "meals", "nobody eating"], why: "Every table described has drinks and menus. Some of those guests must have arrived before 19:30, and they should have food by now. A whole room at the drinks stage is a kitchen that has not served." },
    ],
    distractors: [
      { text: "A specials board", keywords: ["specials", "blackboard", "board", "specials board"] },
      { text: "Bread on the tables", keywords: ["bread", "bread basket", "rolls"] },
      { text: "A maître d' at a lectern", keywords: ["maitre d", "host", "lectern", "front desk", "greeter"] },
    ],
    difficulty: 2,
  },
  {
    id: "mis-hotel-room-318",
    title: "Room 318",
    scene:
      "You are the duty manager. Room 318 was checked in at 15:00 yesterday by a guest booked for four nights; at 10:00 this morning the 'do not disturb' sign is still out and the room phone goes unanswered. At noon you enter with a colleague. The bed has been slept in or at least lain on: the cover is pulled back and one pillow is dented. In the bathroom, one hand towel has been used and the complimentary soap is unwrapped. The wardrobe doors are open and the shelves inside are bare; the safe is open and empty. On the desk: the welcome letter, the room-service menu, and a printout of a train timetable for tomorrow. The minibar is untouched. The window is closed and the curtains are half drawn.",
    missing: [
      { text: "Luggage. A guest on a four-night stay who has slept here should have a suitcase or bag somewhere in the room.", keywords: ["luggage", "suitcase", "bag", "case", "baggage", "no luggage"], why: "The wardrobe is open and bare, the safe is empty, and no bag is mentioned anywhere. A four-night guest with nothing to unpack is the anomaly the whole scene turns on." },
      { text: "Toiletries. Someone who has used the towel and the hotel soap but brought no toothbrush, razor or washbag.", keywords: ["toiletries", "toothbrush", "washbag", "razor", "personal items", "wash things"], why: "The bathroom shows use of what the hotel provided and nothing the guest brought. That is consistent with no luggage and sharpens it." },
    ],
    distractors: [
      { text: "A room-service tray", keywords: ["room service", "tray", "food tray"] },
      { text: "The guest's passport or identification", keywords: ["passport", "id", "identification", "documents"] },
      { text: "A phone charger", keywords: ["charger", "phone charger", "cable", "laptop"] },
    ],
    difficulty: 3,
  },
  {
    id: "mis-family-house",
    title: "The Family Home",
    scene:
      "An estate agent shows you a four-bedroom house, described in the particulars as the home of a family with two children under six who are 'moving abroad next month'. It is a weekday afternoon. The house is immaculate: a large grey sofa, a wall-mounted television, a dining table with six chairs, a kitchen with a bowl of fruit, a coffee machine and a fridge whose only magnet holds a takeaway menu. Upstairs there is a main bedroom with an en-suite, an office with a desk and a printer, a room with a double bed, and a room with a single bed and a reading lamp. The bathroom has two toothbrushes in a glass. The garden is lawn to the fence, with a shed in the corner.",
    missing: [
      { text: "Toys. Two children under six leave toys somewhere, even in a house tidied for viewings.", keywords: ["toys", "toy", "lego", "playthings", "children's things", "dolls", "books for children"], why: "A house can be tidied, but children's possessions are bulky and numerous. A single hidden box would show somewhere. There is nothing, in any room." },
      { text: "Small children's equipment: a buggy, a high chair, a car seat, a stair gate, small shoes by the door.", keywords: ["buggy", "pram", "pushchair", "high chair", "stair gate", "safety gate", "car seat", "small shoes", "children's shoes"], why: "Equipment for the under-sixes is hard to hide and rarely worth hiding. Its total absence, together with a six-chair dining table and no child's bed, suggests the description is wrong, or the family has already left with everything." },
      { text: "A child's bedroom. Four bedrooms are described: main, office, double, single with a reading lamp. None reads as a small child's room.", keywords: ["child's room", "children's bedroom", "nursery", "cot", "bunk bed", "kids room"], why: "Two children under six usually mean a cot or small beds and decorated walls. A single bed with a reading lamp is a guest room or an older child's." },
    ],
    distractors: [
      { text: "A garage", keywords: ["garage", "driveway", "parking"] },
      { text: "A dog or pet", keywords: ["dog", "pet", "cat", "animal"] },
      { text: "Family photographs", keywords: ["photographs", "photos", "pictures", "family photos"] },
    ],
    difficulty: 3,
  },
  {
    id: "mis-joiners-workshop",
    title: "The Joiner's Workshop",
    scene:
      "A joiner is selling his business and shows you the workshop, which he describes as 'busy, booked solid until September'. A bench runs the length of one wall under a rack of chisels and planes, each in its slot, their edges bright. A bandsaw and a planer-thicknesser stand under dust sheets. Timber is racked in the roof space, tied in bundles. In the small office, a whiteboard headed JOBS hangs above a landline phone and a diary closed on the desk. The concrete floor has been swept clean. A radio plays. The kettle is warm.",
    missing: [
      { text: "Sawdust and shavings. A busy joinery cannot be swept to bare concrete; it makes dust faster than a broom removes it.", keywords: ["sawdust", "shavings", "dust", "offcuts", "wood dust", "chips"], why: "The floor, the bench, the machines under sheets: none of it shows the residue that working with wood produces every hour. Clean is the opposite of busy here." },
      { text: "Work in progress. Nothing half-made on the bench, no pieces clamped, no glue-ups drying.", keywords: ["work in progress", "half-made", "current job", "pieces on the bench", "clamps", "glue-up", "unfinished work"], why: "A workshop booked until September should have the current job on the bench and the next one cut. The bench is described only by the tools above it." },
      { text: "Anything written on the jobs board. The heading is there; the jobs are not.", keywords: ["jobs board", "entries", "bookings", "names on the board", "orders", "board is blank", "empty whiteboard"], why: "The board is where a small trade keeps its order book visible. A heading with nothing under it is either a very tidy owner who keeps it all in his head, or an empty order book." },
    ],
    distractors: [
      { text: "Employees or an apprentice", keywords: ["apprentice", "staff", "employees", "workers"] },
      { text: "A van outside", keywords: ["van", "vehicle", "truck"] },
      { text: "A fire extinguisher", keywords: ["fire extinguisher", "extinguisher", "safety equipment"] },
    ],
    difficulty: 4,
  },
  {
    id: "mis-wedding-venue",
    title: "Forty-five Minutes Before",
    scene:
      "You arrive as a guest at a country-house venue at 14:15 for a wedding whose invitation said 15:00. A dozen cars stand on the gravel. In the entrance hall a young man in a waistcoat with a buttonhole directs you to the orangery, where a hundred and twenty chairs are set out in rows either side of an aisle, a table with a white cloth stands at the far end, and a string quartet is tuning. In the next room the bar is stocked and two staff are polishing glasses. A hand-lettered seating plan for the dinner stands on an easel in the hall. Through the windows, a photographer is setting up a tripod on the lawn.",
    missing: [
      { text: "Flowers. No arrangements at the ends of the rows, on the table, or in the hall.", keywords: ["flowers", "floral", "bouquets", "arrangements", "floral arrangements", "no flowers"], why: "Flowers are delivered and placed hours before a ceremony; they are among the first things in. A ceremony room with a bare table and bare chair-ends forty-five minutes out is unusual enough to ask about." },
      { text: "Other guests. A dozen cars and one usher at 14:15 for a 15:00 wedding of a hundred and twenty.", keywords: ["guests", "other guests", "people", "crowd", "arrivals", "nobody here"], why: "Guests for a large wedding arrive over the preceding half hour or more. Twelve cars, some of which belong to staff and the quartet, is very few. Either the time on your invitation is wrong, or something has changed." },
    ],
    distractors: [
      { text: "The bride or groom", keywords: ["bride", "groom", "couple"] },
      { text: "The cake", keywords: ["cake", "wedding cake"] },
      { text: "Confetti", keywords: ["confetti", "petals", "rice"] },
    ],
    difficulty: 4,
  },
  {
    id: "mis-third-floor-office",
    title: "The Third Floor",
    scene:
      "You arrive at 10:30 on a Tuesday for a meeting at a firm of thirty people that occupies the third floor of a small office building. Reception has a visitors' book, a bowl of mints and a receptionist who takes your name, offers you water and asks you to wait. Through the glass partition you see the open-plan floor: about thirty desks, each with a monitor and a chair, a large printer, a water cooler, and a kitchen at the far end with a coffee machine. The lights are on. A screen on the wall cycles through the company logo and a welcome message with your name on it. Two coats hang on a rack of twenty hooks by the door. The receptionist's phone rings once and she answers it.",
    missing: [
      { text: "People at the desks. Thirty desks, two coats, and nobody described sitting anywhere at half past ten on a Tuesday.", keywords: ["people", "staff", "employees", "workers", "anyone at the desks", "nobody working", "empty desks"], why: "A firm of thirty at mid-morning should have most of its people on the floor. Two coats on twenty hooks is the count that gives it away. Whether it is an off-site day, a layoff or a shell, the absence is the fact to notice before the meeting starts." },
      { text: "The sound of work: typing, phones on the floor, conversation.", keywords: ["noise", "sound", "typing", "phones ringing", "conversation", "silence", "quiet"], why: "The only sound described is the receptionist's phone. An occupied open-plan floor is never silent. Sound is easy to overlook because you are looking, not listening." },
      { text: "Personal clutter on the desks: mugs, papers, photographs, bags, chargers.", keywords: ["mugs", "papers", "personal items", "clutter", "bags", "belongings", "desk clutter"], why: "Desks that are used accumulate things. Thirty desks described only by monitor and chair look like a floor that is furnished rather than worked in." },
    ],
    distractors: [
      { text: "Meeting rooms", keywords: ["meeting room", "conference room", "boardroom"] },
      { text: "Plants", keywords: ["plants", "greenery", "flowers"] },
      { text: "A clock on the wall", keywords: ["clock", "wall clock", "time"] },
    ],
    difficulty: 3,
  },
];

/* ---------------- Observation or Story ---------------- */

export const OBSERVATION_OR_STORY: ObservationOrStoryExercise[] = [
  {
    id: "os-cafe-table",
    title: "The Table for Two",
    situation:
      "In a café, a woman sits alone at a table laid for two. On the table: a cappuccino whose foam has mostly collapsed, a glass of water that is full to the brim, and a second, empty cup with a used teabag on its saucer. Her phone lies face down. During the minute you watch, she looks at her watch twice. A folded coat lies on the other chair.",
    statements: [
      { id: "s1", text: "There are two cups on the table.", truth: "observation", why: "Both cups are described directly." },
      { id: "s2", text: "The water has not been drunk.", truth: "inference", why: "You saw a full glass. 'Not drunk' is the obvious reading, but it could have been refilled. A small inference, and a safe one; still not an observation." },
      { id: "s3", text: "She is waiting for someone.", truth: "inference", why: "The second cup, the coat on the other chair and the watch all point that way, but each has another explanation: the tea could be hers, the coat could be hers, and people check watches for trains." },
      { id: "s4", text: "She has been here at least twenty minutes.", truth: "unknown", why: "Collapsed foam says some time has passed since the coffee was made, not how much, and not since she sat down. No number is supported." },
      { id: "s5", text: "She is anxious.", truth: "inference", why: "Two glances at a watch are consistent with anxiety, boredom, or a meeting at half past. This is an interpretation with weak support. It is not an observation, and it would be a mistake to act on it." },
      { id: "s6", text: "The person she is meeting is late.", truth: "unknown", why: "This stacks two unknowns: that she is meeting someone, and that an agreed time has passed. Nothing in the scene gives a time." },
      { id: "s7", text: "Her phone is face down.", truth: "observation", why: "Stated directly." },
      { id: "s8", text: "The coat on the other chair is hers.", truth: "inference", why: "Plausible, but it could belong to a companion who has stepped away, which would also explain the empty teacup. Notice this reading competes with 'waiting for someone'." },
    ],
    difficulty: 3,
  },
  {
    id: "os-open-door",
    title: "The Open Door",
    situation:
      "You arrive at a friend's flat for dinner at 19:30, as arranged. The front door is unlocked and slightly open. In the hallway there are two pairs of shoes. A radio is playing in the kitchen. A pan sits on the hob with the gas off, and the flat smells of fried onions. Nobody answers when you call out.",
    statements: [
      { id: "s1", text: "The gas is off.", truth: "observation", why: "Stated directly." },
      { id: "s2", text: "Someone has been cooking recently.", truth: "inference", why: "The pan and the smell make it very likely, but 'recently' is a judgement about how long onion smell lingers. A strong inference, not a sighting." },
      { id: "s3", text: "Your friend has gone out.", truth: "unknown", why: "Nobody answering is consistent with a trip to the bins, a shower, headphones, or having left. The shoes cut neither way: people own more than two pairs." },
      { id: "s4", text: "The door was left open deliberately.", truth: "unknown", why: "An open door can be intentional, careless or blown by draught. Nothing distinguishes these." },
      { id: "s5", text: "The radio is on.", truth: "observation", why: "You can hear it." },
      { id: "s6", text: "Your friend was expecting you this evening.", truth: "inference", why: "The arrangement is given; that they still expected you is supported by the cooking and the open door, but neither proves it. Well supported, still an inference." },
      { id: "s7", text: "Something is wrong.", truth: "inference", why: "An open door and no answer is the sort of thing that feels wrong, and it is a reasonable hypothesis. It is also what taking the rubbish out looks like. Hold it lightly." },
      { id: "s8", text: "There are two people in the flat.", truth: "unknown", why: "Two pairs of shoes are two pairs of shoes. They tell you nothing about how many people are inside now." },
    ],
    difficulty: 3,
  },
  {
    id: "os-invoice",
    title: "The Invoice",
    situation:
      "An invoice from a supplier arrives, dated 3 March, for £4,800 with payment terms of 30 days. Your purchase order for the same job, dated 12 February, was for £4,200. The invoice quotes your purchase-order number. A handwritten note on it says 'as agreed with Dan'. Dan left your company on 28 February.",
    statements: [
      { id: "s1", text: "The invoice is £600 more than the purchase order.", truth: "observation", why: "Subtraction of two stated figures. Arithmetic on what is in front of you is still observation; no interpretation is added." },
      { id: "s2", text: "Dan agreed to the higher price.", truth: "unknown", why: "The note asserts it. A claim written by the party who benefits is not evidence that the thing happened, and Dan is not here to confirm or deny." },
      { id: "s3", text: "The invoice was issued after Dan left.", truth: "observation", why: "3 March is after 28 February. Both dates are stated." },
      { id: "s4", text: "The supplier is trying to overcharge you.", truth: "inference", why: "One reading of the evidence, and not an unreasonable one. Another is that the scope changed verbally and nobody wrote it down. The note is consistent with both." },
      { id: "s5", text: "Payment is due on 2 April.", truth: "inference", why: "Thirty days from 3 March is 2 April, if the thirty days run from the invoice date. Terms sometimes run from receipt or from the end of the month. A likely reading, not a fact." },
      { id: "s6", text: "The work has been completed.", truth: "unknown", why: "An invoice is a request for payment. It is not evidence that the job was done, and nothing here says it was." },
      { id: "s7", text: "The scope of the job changed after the purchase order was raised.", truth: "inference", why: "The price difference and the note suggest something changed. Whether scope, price or nothing at all is not settled." },
    ],
    difficulty: 4,
  },
  {
    id: "os-platform",
    title: "Platform 2, 06:50",
    situation:
      "A man stands on a station platform at 06:50 with a small wheeled suitcase and a paper cup with a lid. The departure board shows the 06:52 to Manchester as 'Delayed, expected 07:15'. He looks at the board, then at his phone, then walks to the far end of the platform, where the first-class coaches usually stop.",
    statements: [
      { id: "s1", text: "The 06:52 to Manchester is delayed.", truth: "observation", why: "It is on the board. Strictly you observed the board; the delay itself is what the board reports. In ordinary use this counts as observation." },
      { id: "s2", text: "He is travelling to Manchester.", truth: "inference", why: "He is on the platform for that train with a suitcase, which makes it likely. Other trains may use the platform, and he might be meeting someone." },
      { id: "s3", text: "He has a first-class ticket.", truth: "inference", why: "Walking to where first class stops is consistent with a first-class ticket. It is also where the platform is quietest. Weakly supported." },
      { id: "s4", text: "He is irritated by the delay.", truth: "unknown", why: "Looking at a board and a phone is what everyone does on a platform. Nothing here bears on his mood at all." },
      { id: "s5", text: "He is travelling for work.", truth: "unknown", why: "An early train and a small case fit a business trip and also fit visiting a parent. No evidence separates them." },
      { id: "s6", text: "He is holding a hot drink.", truth: "inference", why: "A lidded paper cup at 06:50 is usually coffee or tea. It could be water or juice. Small, reasonable, not observed." },
      { id: "s7", text: "The train is now expected at 07:15.", truth: "observation", why: "Displayed on the board." },
      { id: "s8", text: "He arrived on the platform before 06:50.", truth: "unknown", why: "You first saw him at 06:50. You did not see him arrive, and nothing indicates how long he had been there." },
    ],
    difficulty: 2,
  },
  {
    id: "os-secondhand-book",
    title: "The Second-hand Book",
    situation:
      "In a second-hand bookshop you pick up a hardback. Inside the front cover a price is pencilled: £8, crossed out, then £5. A bookplate on the same page reads 'Ex libris M. Hartley'. Pages 40 to 60 carry pencil underlining; the rest of the text is clean. The dust jacket is faded along the spine and nowhere else.",
    statements: [
      { id: "s1", text: "The book has been reduced from £8 to £5.", truth: "observation", why: "Both prices and the crossing-out are on the page." },
      { id: "s2", text: "The book once belonged to someone called M. Hartley.", truth: "inference", why: "A bookplate is a claim of ownership and is usually true. Plates can be pasted into books their owners never owned, and names can be invented. Strong inference." },
      { id: "s3", text: "The previous reader stopped reading at page 60.", truth: "inference", why: "The underlining stops there. Readers also stop underlining and carry on reading, or underline only the part they needed." },
      { id: "s4", text: "The book stood spine-out on a shelf in daylight for a long time.", truth: "inference", why: "Spine-only fading is exactly what shelf exposure does. Well supported, but it is an explanation for the fading, not the fading itself." },
      { id: "s5", text: "The book has been in the shop for months.", truth: "unknown", why: "A reduced price says time passed before the reduction. It could be a week or a year; nothing gives the scale." },
      { id: "s6", text: "The underlining is in pencil.", truth: "observation", why: "Stated directly." },
      { id: "s7", text: "M. Hartley made the underlining.", truth: "unknown", why: "Two facts, a bookplate and pencil marks, with nothing that links them. A second-hand book may have had several owners and readers." },
    ],
    difficulty: 3,
  },
  {
    id: "os-village-shop",
    title: "Back in Ten Minutes",
    situation:
      "A village shop at 15:10 on a Wednesday. A sign on the door reads 'Back in 10 minutes'. Through the window: the lights are on, a radio is playing, and a mug on the counter is steaming. On the step outside sits a bundle of newspapers still in its plastic strap; the top paper carries today's date.",
    statements: [
      { id: "s1", text: "The shop is unattended.", truth: "inference", why: "The sign says so, and you can see no one. Someone could be in the stockroom. A strong inference, and the sign is a claim, not a sighting." },
      { id: "s2", text: "The shopkeeper left within the last few minutes.", truth: "inference", why: "A steaming mug loses visible steam in a few minutes. This is good physical evidence, but it dates the mug, not the person." },
      { id: "s3", text: "The shopkeeper will be back by 15:20.", truth: "unknown", why: "'Back in 10 minutes' has no start time. You do not know when the sign went up, and such signs are notoriously optimistic." },
      { id: "s4", text: "The newspapers were delivered today.", truth: "inference", why: "You observed today's date on the paper, not the delivery. Today's edition delivered today is overwhelmingly likely, but the delivery itself was not seen." },
      { id: "s5", text: "The shop opened this morning.", truth: "unknown", why: "The strapped papers on the step at 15:10 suggest nobody brought them in all day, which cuts against opening; the mug and radio cut the other way. The evidence conflicts, and nothing settles it." },
      { id: "s6", text: "The mug on the counter is steaming.", truth: "observation", why: "Seen through the window." },
      { id: "s7", text: "It is Wednesday.", truth: "observation", why: "Given in the situation. Not everything given is interesting; it is still an observation." },
      { id: "s8", text: "The shopkeeper is fetching something from a neighbour.", truth: "unknown", why: "A story with nothing behind it. There are a hundred reasons to step out for ten minutes." },
    ],
    difficulty: 4,
  },
  {
    id: "os-colleagues-desk",
    title: "Ana's Desk, 09:40",
    situation:
      "It is 09:40. Your colleague Ana's desk: her computer is on and unlocked, showing an email draft with no recipient. Her coat is on the back of the chair. Her mug is empty and cold. Her lanyard and building pass lie on the desk. Her bag is not there. Her calendar, visible on the screen, shows 'Dentist 09:00–10:00'.",
    statements: [
      { id: "s1", text: "Ana's building pass is on the desk.", truth: "observation", why: "Stated directly." },
      { id: "s2", text: "Ana is at the dentist.", truth: "inference", why: "The calendar supports it. The coat on the chair and the unlocked screen argue that she has not gone far. Two sets of evidence pull in different directions; this is an inference with real doubt attached." },
      { id: "s3", text: "Ana is somewhere in the building.", truth: "inference", why: "The pass on the desk and the unlocked screen make it likely; the calendar and the missing bag make it less so. Same evidence, opposite inference. Neither is an observation." },
      { id: "s4", text: "Ana arrived at work before 09:00.", truth: "unknown", why: "Nothing gives an arrival time. A cold, empty mug could be yesterday's." },
      { id: "s5", text: "Ana left the desk in a hurry.", truth: "inference", why: "An unlocked screen and an unsent draft suggest interruption. They also describe every trip to the kitchen." },
      { id: "s6", text: "The email draft has no recipient.", truth: "observation", why: "Visible on the screen." },
      { id: "s7", text: "Ana's bag is not at the desk.", truth: "observation", why: "An absence you looked for and confirmed is still an observation." },
      { id: "s8", text: "Ana was writing to a client.", truth: "unknown", why: "There is no recipient and nothing is said about the content. Pure story." },
    ],
    difficulty: 5,
  },
  {
    id: "os-hotel-bill",
    title: "The Bill for Room 604",
    situation:
      "Checking out, you are handed the bill for room 604: three nights, two breakfasts, one minibar charge of £9, one laundry charge of £22 dated the second night, and a four-minute call to a Lisbon number on the first evening. You did not use the room phone and you do not remember any laundry.",
    statements: [
      { id: "s1", text: "The bill lists a four-minute call to Lisbon.", truth: "observation", why: "It is on the bill in front of you." },
      { id: "s2", text: "You have been charged for laundry on the second night.", truth: "observation", why: "The charge and its date are on the bill. Whether it is correct is another matter." },
      { id: "s3", text: "The hotel has made an error.", truth: "inference", why: "Your memory of not using the phone is good evidence, and a mistake is the likeliest reading. Charges also get misposted between rooms, and memories fail. An inference, well supported." },
      { id: "s4", text: "Someone else used the phone in your room.", truth: "inference", why: "If you did not use it, either someone else did or the charge is misposted. This picks one branch of a fork and is not the only reading." },
      { id: "s5", text: "You had breakfast on two of the three mornings.", truth: "inference", why: "The bill says two were charged. The bill is a record, not the event, and the situation does not say what you remember about breakfast." },
      { id: "s6", text: "The room phone was used on the first evening.", truth: "inference", why: "The billing system recorded a call. Systems are usually right; you also know you did not make it. What is observed is the line on the bill, not the call." },
      { id: "s7", text: "The minibar charge was for alcohol.", truth: "unknown", why: "£9 buys a small bottle of wine or two bottles of water at hotel prices. Nothing on the bill says which." },
      { id: "s8", text: "The laundry charge was really for another guest.", truth: "unknown", why: "A possible explanation with nothing to support it beyond your not remembering. The bill does not say whose laundry it was." },
    ],
    difficulty: 4,
  },
  {
    id: "os-neighbours-house",
    title: "Next Door, Mid-July",
    situation:
      "Your neighbours' house at 21:00 in mid-July: the curtains are open and no lights are on. The lawn is about a hand's height. The bins are not out, though collection is tomorrow morning. Three parcels are stacked in the porch. The car is not on the drive. A cat you have seen before is sitting on the wall.",
    statements: [
      { id: "s1", text: "There are three parcels in the porch.", truth: "observation", why: "Counted directly." },
      { id: "s2", text: "The neighbours are away.", truth: "inference", why: "Several independent cues converge: parcels, lawn, bins, car, no lights. This is about as strong as an inference gets from outside a house, and it is still not an observation." },
      { id: "s3", text: "They have been away for about two weeks.", truth: "inference", why: "A mown lawn reaches a hand's height in perhaps two to three weeks in July. A rough estimate from grass growth, dependent on when it was last cut; treat the number as loose." },
      { id: "s4", text: "They left in the car.", truth: "inference", why: "The car is absent. It could be at a garage, lent to a friend, or at the airport car park. Weakly supported." },
      { id: "s5", text: "They have forgotten the bins.", truth: "unknown", why: "'Not out' is observable. 'Forgotten' is a claim about their minds, and the rest of the evidence suggests they are away, not forgetful." },
      { id: "s6", text: "No lights are on at 21:00.", truth: "observation", why: "Stated directly, with the time." },
      { id: "s7", text: "The cat belongs to the neighbours.", truth: "unknown", why: "You have seen it on the wall before. Cats sit on any wall they like; nothing links it to this household." },
      { id: "s8", text: "It is not yet dark.", truth: "unknown", why: "Mid-July at 21:00 is light in London and dark in Lisbon. The situation gives a date and a time, not a latitude, and does not describe the sky." },
    ],
    difficulty: 4,
  },
  {
    id: "os-job-interview",
    title: "The Candidate",
    situation:
      "You are interviewing a candidate for a project-manager role. Her CV lists three employers in six years, most recently as Head of Delivery at a firm of forty people. She arrives eight minutes early with a printed portfolio. Asked about a project that failed, she describes one in detail and what she would do differently. She asks whether the role reports to the COO or the CTO.",
    statements: [
      { id: "s1", text: "She arrived early.", truth: "observation", why: "Eight minutes early, as stated." },
      { id: "s2", text: "She has had three employers in six years.", truth: "inference", why: "Her CV lists three employers; that is the observation. That she actually worked for them is what a CV claims, and it is usually true. The gap between the paper and the fact is why references exist." },
      { id: "s3", text: "She is a job-hopper.", truth: "inference", why: "Three jobs in six years averages two years each. Whether that is hopping depends on the sector and the reasons, none of which you have. A label, not a fact." },
      { id: "s4", text: "She prepared for this interview.", truth: "inference", why: "A printed portfolio and an early arrival are good evidence of preparation. Still an inference from behaviour to intent, and a safe one." },
      { id: "s5", text: "She is honest about failure.", truth: "inference", why: "Describing a failure in detail is what an honest person does. It is also what a well-coached candidate does. One answer cannot settle a character trait." },
      { id: "s6", text: "She led a team of forty.", truth: "unknown", why: "Forty is the size of the firm. Her team size is not given; Head of Delivery at a forty-person firm might lead four people or fourteen." },
      { id: "s7", text: "She asked about the reporting line.", truth: "observation", why: "You heard the question." },
      { id: "s8", text: "She is confident.", truth: "unknown", why: "Nothing described measures confidence. Arriving early and bringing a portfolio are actions; anxious people prepare more, not less. Do not read a feeling off a behaviour." },
    ],
    difficulty: 5,
  },
];
