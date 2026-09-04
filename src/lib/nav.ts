import type { IconName } from "@/components/ui/icons";

export interface Room {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  description: string;
  /** Keyboard chord after "g" */
  key?: string;
  /** Appears in the mobile "Train" sheet */
  train?: boolean;
  /** Appears in the primary desktop list */
  primary?: boolean;
}

export const ROOMS: Room[] = [
  { id: "desk", label: "Desk", href: "/desk", icon: "Desk", description: "Today's file, what is due, what you have discovered.", key: "d", primary: true },
  { id: "casebook", label: "Casebook", href: "/casebook", icon: "Case", description: "Multi-stage cases that combine observation, inference, questioning and decision.", key: "c", primary: true },
  { id: "observation", label: "Observation", href: "/observation", icon: "Eye", description: "Train the ability to notice: the Glance, room scans, change detection, documents.", key: "o", train: true, primary: true },
  { id: "inference", label: "Inference", href: "/inference", icon: "Branch", description: "Reason from incomplete evidence with discipline: alternatives, base rates, updating.", key: "i", train: true, primary: true },
  { id: "salon", label: "Salon", href: "/salon", icon: "Salon", description: "Conversation with fictional characters who do not reveal everything at once.", key: "s", train: true, primary: true },
  { id: "strategy", label: "Strategy", href: "/strategy", icon: "Strategy", description: "Incentives, second-order effects, negotiation, moves ahead.", key: "t", train: true, primary: true },
  { id: "memory", label: "Memory", href: "/memory", icon: "Memory", description: "Spaced retrieval, names and details, palaces, reconstruction.", key: "m", train: true, primary: true },
  { id: "archive", label: "Archive", href: "/archive", icon: "Archive", description: "Connected world knowledge: history, geography, economics, art and more.", key: "a", primary: true },
  { id: "rhetoric", label: "Rhetoric", href: "/rhetoric", icon: "Rhetoric", description: "Clarity, brevity, argument, story, analogy.", key: "r", train: true, primary: true },
  { id: "cabinet", label: "Cabinet", href: "/cabinet", icon: "Cabinet", description: "Curiosities worth knowing, and where they connect.", key: "b", primary: true },
  { id: "investigations", label: "Investigations", href: "/investigations", icon: "Investigate", description: "Long questions pursued over weeks: claims, counterclaims, synthesis.", key: "n", primary: true },
  { id: "fieldwork", label: "Fieldwork", href: "/fieldwork", icon: "Field", description: "Safe real-world observation and conversation assignments.", key: "f", primary: true },
  { id: "forecasts", label: "Forecasts", href: "/forecasts", icon: "Forecast", description: "Predictions that eventually meet reality.", key: "p" },
  { id: "decisions", label: "Decisions", href: "/decisions", icon: "Decision", description: "A journal separating decision quality from outcome quality.", key: "j" },
  { id: "red-thread", label: "Red Thread", href: "/red-thread", icon: "Thread", description: "Recurring patterns across your mistakes, biases and blind spots.", key: "x" },
  { id: "after-action", label: "After Action", href: "/after-action", icon: "Debrief", description: "Debriefs and reflection.", key: "w" },
  { id: "profile", label: "Profile", href: "/profile", icon: "Profile", description: "How you think: the evolving map of your faculties.", key: "u" },
  { id: "curator", label: "Curator", href: "/curator", icon: "Curator", description: "Consult the intelligence of the Study.", key: "k" },
  { id: "settings", label: "Settings", href: "/settings", icon: "Settings", description: "Account, appearance, study, curator, data, privacy, AI." },
];

export const PRIMARY_ROOMS = ROOMS.filter((r) => r.primary);
export const SECONDARY_ROOMS = ROOMS.filter((r) => ["red-thread", "profile", "forecasts", "decisions", "after-action", "curator"].includes(r.id));
export const TRAIN_ROOMS = ROOMS.filter((r) => r.train);

export function roomFor(pathname: string): Room | undefined {
  return ROOMS.filter((r) => pathname === r.href || pathname.startsWith(r.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
}
