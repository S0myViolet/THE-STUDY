import type { IconName } from "@/components/ui/icons";

/**
 * Navigation model for THE STUDY V2.
 *
 * SECTIONS are the six primary functions (Today is the front door). ROOMS are the
 * secondary rooms. V1_ROOMS are the archived V1 rooms, reachable under /v1 from
 * Settings and the palette but absent from primary navigation.
 */

export type SectionId = "today" | "learn" | "train" | "build" | "prove" | "review";

export interface Room {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  description: string;
  /** Keyboard chord after "g". */
  key?: string;
}

export interface Section extends Room {
  id: SectionId;
  /** Short line for the PageHeader eyebrow. */
  eyebrow: string;
  /** Room title as shown on its index page. */
  title: string;
  /** One or two sentences for the PageHeader lede. */
  lede: string;
}

export const SECTIONS: Section[] = [
  {
    id: "today",
    label: "Today",
    href: "/today",
    icon: "Today",
    key: "t",
    description: "The plan for today, built from what you know, what is due and what is slipping.",
    eyebrow: "Today",
    title: "The plan for today",
    lede: "Generated from your learning state, not a fixed timetable. Every item on the agenda says why it is there.",
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learn",
    icon: "Learn",
    key: "l",
    description: "The curriculum: domains, courses, modules, concepts, lessons and knowledge paths.",
    eyebrow: "Learn",
    title: "The curriculum",
    lede: "Domain, course, module, concept. Each lesson starts with a question and ends with retrieval scheduled; understanding moves only on evidence.",
  },
  {
    id: "train",
    label: "Train",
    href: "/train",
    icon: "Train",
    key: "r",
    description: "Deliberate practice by real ability, one problem at a time.",
    eyebrow: "Train",
    title: "Deliberate practice",
    lede: "One problem, your attempt, your confidence, then feedback that names the step where it went wrong. Errors are classified and come back later.",
  },
  {
    id: "build",
    label: "Build",
    href: "/build",
    icon: "Build",
    key: "b",
    description: "Investigations, models, essays, software, explanations, analyses, presentations.",
    eyebrow: "Build",
    title: "The studio",
    lede: "Structured projects with a question, claims, counterarguments and evidence that carries its provenance. Finishing one is evidence of application.",
  },
  {
    id: "prove",
    label: "Prove",
    href: "/prove",
    icon: "Prove",
    key: "p",
    description: "Exams, unseen problems, cumulative retrieval, oral explanations, transfer challenges, the baseline.",
    eyebrow: "Prove",
    title: "Proof",
    lede: "No teaching, no hints, no model. Weekly, monthly and quarterly exams, unseen problems, writing and oral explanations, and the transfer cases.",
  },
  {
    id: "review",
    label: "Review",
    href: "/review",
    icon: "Review",
    key: "v",
    description: "What is actually changing: progress, retention, skills, exams, errors, projects, time.",
    eyebrow: "Review",
    title: "What is actually changing",
    lede: "Progress, retention, knowledge, skills, exams, errors, projects and time. Observations rest on real evidence with a minimum sample; when n is too small, it says so.",
  },
];

export const ROOMS: Room[] = [
  { id: "library", label: "Library", href: "/library", icon: "Library", key: "y", description: "Sources read with a question in hand, recalled closed-book, and connected to what you know." },
  { id: "knowledge", label: "Knowledge", href: "/knowledge", icon: "Graph", key: "k", description: "The knowledge graph: concepts, people, places, events, institutions and how they connect." },
  { id: "memory", label: "Memory", href: "/memory", icon: "Memory", key: "m", description: "Spaced retrieval adapted to performance, and the techniques that make material stick." },
  { id: "writing", label: "Writing", href: "/writing", icon: "Pen", key: "w", description: "Seven levels from explaining clearly to an original thesis, with feedback anchored to the passage." },
  { id: "speaking", label: "Speaking", href: "/speaking", icon: "Mic", description: "Timed explanations, impromptu argument, story and analogy, transcribed and reviewed." },
  { id: "forecasts", label: "Forecasts", href: "/forecasts", icon: "Forecast", description: "Predictions that eventually meet reality." },
  { id: "decisions", label: "Decisions", href: "/decisions", icon: "Decision", description: "A journal separating decision quality from outcome quality." },
  { id: "curator", label: "Curator", href: "/curator", icon: "Curator", key: "c", description: "A tutor that asks for your attempt first, and marks what it suggests." },
  { id: "settings", label: "Settings", href: "/settings", icon: "Settings", description: "Account, appearance, study, curator, data, privacy, AI, the V1 archive." },
];

/** The V1 rooms, preserved as an archive. Hidden from primary navigation. */
export const V1_ROOMS: Room[] = [
  { id: "v1-desk", label: "Desk", href: "/v1/desk", icon: "Desk", description: "The V1 daily file: session, what was due, what you discovered." },
  { id: "v1-casebook", label: "Casebook", href: "/v1/casebook", icon: "Case", description: "Multi-stage cases combining observation, inference, questioning and decision." },
  { id: "v1-observation", label: "Observation", href: "/v1/observation", icon: "Eye", description: "The Glance, room scans, change detection, documents." },
  { id: "v1-inference", label: "Inference", href: "/v1/inference", icon: "Branch", description: "Reasoning from incomplete evidence: alternatives, base rates, updating." },
  { id: "v1-salon", label: "Salon", href: "/v1/salon", icon: "Salon", description: "Conversation with fictional characters who do not reveal everything at once." },
  { id: "v1-strategy", label: "Strategy", href: "/v1/strategy", icon: "Strategy", description: "Incentives, second-order effects, negotiation, moves ahead." },
  { id: "v1-memory", label: "Memory Palace", href: "/v1/memory", icon: "Memory", description: "The V1 palace: spaced retrieval, names and details, reconstruction." },
  { id: "v1-archive", label: "Archive", href: "/v1/archive", icon: "Archive", description: "Connected world knowledge: history, geography, economics, art and more." },
  { id: "v1-rhetoric", label: "Rhetoric", href: "/v1/rhetoric", icon: "Rhetoric", description: "Clarity, brevity, argument, story, analogy." },
  { id: "v1-cabinet", label: "Cabinet", href: "/v1/cabinet", icon: "Cabinet", description: "Curiosities worth knowing, and where they connect." },
  { id: "v1-investigations", label: "Investigations", href: "/v1/investigations", icon: "Investigate", description: "Long questions pursued over weeks: claims, counterclaims, synthesis." },
  { id: "v1-fieldwork", label: "Fieldwork", href: "/v1/fieldwork", icon: "Field", description: "Safe real-world observation and conversation assignments." },
  { id: "v1-red-thread", label: "Red Thread", href: "/v1/red-thread", icon: "Thread", description: "Recurring patterns across your mistakes, biases and blind spots." },
  { id: "v1-after-action", label: "After Action", href: "/v1/after-action", icon: "Debrief", description: "Debriefs and reflection." },
  { id: "v1-profile", label: "Profile", href: "/v1/profile", icon: "Profile", description: "The V1 map of your faculties." },
  { id: "v1-curator", label: "Curator", href: "/v1/curator", icon: "Curator", description: "The V1 Curator consultations." },
  { id: "v1-enter", label: "Entrance", href: "/v1/enter", icon: "Door", description: "The V1 entrance and baseline." },
];

/** Everything navigable, longest hrefs first so `roomFor` prefers the most specific match. */
export const ALL_ROOMS: Room[] = [...SECTIONS, ...ROOMS, ...V1_ROOMS];

/** The room (section, room or V1 room) that owns a pathname. */
export function roomFor(pathname: string): Room | undefined {
  const base = pathname.split(/[?#]/)[0];
  return ALL_ROOMS.filter((r) => base === r.href || base.startsWith(r.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
}

export function sectionFor(pathname: string): Section | undefined {
  const room = roomFor(pathname);
  return room && SECTIONS.some((s) => s.id === room.id) ? (room as Section) : undefined;
}

export function isV1Path(pathname: string): boolean {
  return pathname === "/v1" || pathname.startsWith("/v1/");
}

/** Keyboard chords: the key pressed after "g" and where it goes. */
export const CHORDS: { key: string; href: string; label: string }[] = [...SECTIONS, ...ROOMS].filter((r) => r.key).map((r) => ({ key: r.key!, href: r.href, label: r.label }));

export function chordTarget(key: string): string | undefined {
  return CHORDS.find((c) => c.key === key)?.href;
}
