import type { FacultyId } from "@/lib/domain/faculties";
import { ROOMS } from "@/lib/nav";

/** Where each faculty is trained: the rooms (and specific exercises) that produce its evidence. */
export const TRAINING_ROOMS: Record<FacultyId, { href: string; label: string; note: string }[]> = {
  observation: [
    { href: "/observation", label: "Observation", note: "The Glance, room scans, change detection, documents." },
    { href: "/casebook", label: "Casebook", note: "The Notice and Recall stages of every case." },
    { href: "/fieldwork", label: "Fieldwork", note: "Real rooms, real people, no replay." },
  ],
  inference: [
    { href: "/inference", label: "Inference", note: "Three stories, base rates, disconfirmation, updating." },
    { href: "/casebook", label: "Casebook", note: "Hypotheses, new evidence, update." },
    { href: "/investigations", label: "Investigations", note: "Claims weighed over weeks." },
  ],
  memory: [
    { href: "/memory", label: "Memory", note: "Spaced retrieval, names, sequences, palaces." },
    { href: "/archive", label: "Archive", note: "Entries you choose to keep become review items." },
  ],
  strategy: [
    { href: "/strategy", label: "Strategy", note: "Three moves ahead, incentive maps, red teams." },
    { href: "/decisions", label: "Decisions", note: "Decision quality kept apart from outcome quality." },
  ],
  social: [
    { href: "/salon", label: "Salon", note: "Conversations where nothing is offered unasked." },
    { href: "/casebook", label: "Casebook", note: "The Question stage: what to ask, and how." },
    { href: "/fieldwork", label: "Fieldwork", note: "Conversation assignments outside the Study." },
  ],
  knowledge: [
    { href: "/archive", label: "Archive", note: "Connected world knowledge, read and tested." },
    { href: "/cabinet", label: "Cabinet", note: "Curiosities and where they join." },
  ],
  rhetoric: [
    { href: "/rhetoric", label: "Rhetoric", note: "Clarity, brevity, argument, story, analogy." },
    { href: "/casebook", label: "Casebook", note: "The Explain stage." },
  ],
  quantitative: [
    { href: "/inference/base_rate", label: "Inference · Base rates", note: "Probability against intuition." },
    { href: "/forecasts", label: "Forecasts", note: "Numbers that meet reality." },
  ],
  calibration: [
    { href: "/inference/how_sure", label: "Inference · How sure?", note: "Confidence against accuracy." },
    { href: "/forecasts", label: "Forecasts", note: "Resolved predictions." },
    { href: "/casebook", label: "Casebook", note: "Confidence before and after new evidence." },
  ],
  composure: [
    { href: "/observation/glance?pressure=1", label: "Observation · Pressure", note: "Precision when the clock is running." },
    { href: "/casebook", label: "Casebook", note: "Ambiguous material, timed exposure." },
  ],
  synthesis: [
    { href: "/archive/graph", label: "Archive · Graph", note: "Connections across domains." },
    { href: "/investigations", label: "Investigations", note: "Synthesis across claims." },
  ],
  curiosity: [
    { href: "/cabinet", label: "Cabinet", note: "Following what catches the eye." },
    { href: "/investigations", label: "Investigations", note: "Questions kept open on purpose." },
    { href: "/archive", label: "Archive", note: "Breadth of reading." },
  ],
};

export function roomLabel(href: string): string {
  const base = href.split(/[?#]/)[0];
  return ROOMS.filter((r) => base === r.href || base.startsWith(r.href + "/")).sort((a, b) => b.href.length - a.href.length)[0]?.label ?? href;
}
