import { describe, expect, it } from "vitest";
import { CONFIDENCE_LABEL, STATE_META, formatClock } from "@/components/ui/v2";
import { CONCEPT_STATES } from "@/lib/v2/types";

describe("V2 interface helpers", () => {
  it("names and explains every concept state", () => {
    for (const state of CONCEPT_STATES) {
      expect(STATE_META[state].label, state).toBeTruthy();
      expect(STATE_META[state].note, state).toBeTruthy();
    }
    const labels = CONCEPT_STATES.map((s) => STATE_META[s].label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(STATE_META.fragile.label).toBe("Fragile");
    expect(STATE_META.not_started.label).toBe("Not started");
  });

  it("labels the three evidence confidence levels", () => {
    expect(CONFIDENCE_LABEL.low).toContain("low");
    expect(CONFIDENCE_LABEL.medium).toContain("medium");
    expect(CONFIDENCE_LABEL.high).toContain("high");
  });

  it("formats a clock as m:ss and h:mm:ss, rounding up and never below zero", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(-4)).toBe("0:00");
    expect(formatClock(59.2)).toBe("1:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(600)).toBe("10:00");
    expect(formatClock(3600)).toBe("1:00:00");
    expect(formatClock(3725)).toBe("1:02:05");
  });
});
