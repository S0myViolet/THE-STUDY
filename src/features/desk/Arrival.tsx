"use client";

import React, { useState } from "react";
import { Button, useCountdown } from "@/components/ui/primitives";

const INSTRUCTIONS = [
  "Choose one object within reach. Look at it for the whole minute. Find three things about it you had not noticed.",
  "Listen. Count the distinct sounds you can hear, nearest to farthest. Do not name them yet; just count.",
  "Look at the room as if you will be asked about it later. Where is the light coming from? What is out of place?",
  "Breathe out slowly. Notice what your attention keeps returning to. That is the thing to set aside for an hour.",
];

/** Sixty seconds of attention before the work. Silent, full-width, one instruction. */
export function Arrival({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const instruction = INSTRUCTIONS[new Date().getDate() % INSTRUCTIONS.length];
  const left = useCountdown(60, running, () => setFinished(true));

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center p-8">
      <div className="max-w-[46ch] text-center anim-fade">
        <div className="eyebrow">Arrival</div>
        <p className="serif text-[26px] md:text-[30px] leading-snug mt-6 text-ink">{instruction}</p>
        <div className="mt-10 numeral text-[64px] text-ink leading-none" aria-live="off">
          {finished ? "0" : Math.ceil(left)}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {!running ? (
            <Button size="lg" onClick={() => setRunning(true)}>Begin the minute</Button>
          ) : finished ? (
            <Button size="lg" onClick={onDone}>Enter</Button>
          ) : (
            <Button variant="ghost" onClick={onDone}>Skip</Button>
          )}
        </div>
      </div>
    </div>
  );
}
