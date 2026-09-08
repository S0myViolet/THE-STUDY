import type { FacultyId } from "@/lib/domain/faculties";
import { V1_ROOMS } from "@/lib/nav";

/** Where each faculty is trained: the rooms (and specific exercises) that produce its evidence. */
export const TRAINING_ROOMS: Record<FacultyId, { href: string; label: string; note: string }[]> = {
  observation: [
    { href: "/v1/observation", label: "Observation", note: "The Glance, room scans, change detection, documents." },
    { href: "/v1/casebook", label: "Casebook", note: "The Notice and Recall stages of every case." },
    { href: "/v1/fieldwork", label: "Fieldwork", note: "Real rooms, real people, no replay." },
  ],
  inference: [
    { href: "/v1/inference", label: "Inference", note: "Three stories, base rates, disconfirmation, updating." },
    { href: "/v1/casebook", label: "Casebook", note: "Hypotheses, new evidence, update." },
    { href: "/v1/investigations", label: "Investigations", note: "Claims weighed over weeks." },
  ],
  memory: [
    { href: "/v1/memory", label: "Memory", note: "Spaced retrieval, names, sequences, palaces." },
    { href: "/v1/archive", label: "Archive", note: "Entries you choose to keep become review items." },
  ],
  strategy: [
    { href: "/v1/strategy", label: "Strategy", note: "Three moves ahead, incentive maps, red teams." },
    { href: "/decisions", label: "Decisions", note: "Decision quality kept apart from outcome quality." },
  ],
  social: [
    { href: "/v1/salon", label: "Salon", note: "Conversations where nothing is offered unasked." },
    { href: "/v1/casebook", label: "Casebook", note: "The Question stage: what to ask, and how." },
    { href: "/v1/fieldwork", label: "Fieldwork", note: "Conversation assignments outside the Study." },
  ],
  knowledge: [
    { href: "/v1/archive", label: "Archive", note: "Connected world knowledge, read and tested." },
    { href: "/v1/cabinet", label: "Cabinet", note: "Curiosities and where they join." },
  ],
  rhetoric: [
    { href: "/v1/rhetoric", label: "Rhetoric", note: "Clarity, brevity, argument, story, analogy." },
    { href: "/v1/casebook", label: "Casebook", note: "The Explain stage." },
  ],
  quantitative: [
    { href: "/v1/inference/base_rate", label: "Inference · Base rates", note: "Probability against intuition." },
    { href: "/forecasts", label: "Forecasts", note: "Numbers that meet reality." },
  ],
  calibration: [
    { href: "/v1/inference/how_sure", label: "Inference · How sure?", note: "Confidence against accuracy." },
    { href: "/forecasts", label: "Forecasts", note: "Resolved predictions." },
    { href: "/v1/casebook", label: "Casebook", note: "Confidence before and after new evidence." },
  ],
  composure: [
    { href: "/v1/observation/glance?pressure=1", label: "Observation · Pressure", note: "Precision when the clock is running." },
    { href: "/v1/casebook", label: "Casebook", note: "Ambiguous material, timed exposure." },
  ],
  synthesis: [
    { href: "/v1/archive/graph", label: "Archive · Graph", note: "Connections across domains." },
    { href: "/v1/investigations", label: "Investigations", note: "Synthesis across claims." },
  ],
  curiosity: [
    { href: "/v1/cabinet", label: "Cabinet", note: "Following what catches the eye." },
    { href: "/v1/investigations", label: "Investigations", note: "Questions kept open on purpose." },
    { href: "/v1/archive", label: "Archive", note: "Breadth of reading." },
  ],
};

export function roomLabel(href: string): string {
  const base = href.split(/[?#]/)[0];
  return V1_ROOMS.filter((r) => base === r.href || base.startsWith(r.href + "/")).sort((a, b) => b.href.length - a.href.length)[0]?.label ?? href;
}
