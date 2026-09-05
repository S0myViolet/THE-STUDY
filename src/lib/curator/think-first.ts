/**
 * Think First: when the preference is on and the user asks the Curator to reason
 * for them without offering a read of their own, the Curator asks for the attempt.
 * Deterministic; never applied to simple factual questions.
 */

const REASONING_PATTERNS: RegExp[] = [
  /\bwho (is|was|'s) (lying|right|wrong|guilty|responsible|telling the truth)\b/i,
  /\bwho (lied|did it)\b/i,
  /\bsolve\b/i,
  /\bwhat do you think\b/i,
  /\bwhich (one )?is (right|correct|true|better|more likely)\b/i,
  /\bprobability\b/i,
  /\bhow likely\b/i,
  /\bshould i\b/i,
  /\bwhat (would|should) you do\b/i,
  /\bwhat('s| is) (the )?(best|right) (move|answer|call|choice|option)\b/i,
  /\bwhat('s| is) (really )?going on\b/i,
  /\bwhat does (this|it) mean\b/i,
  /\bis (he|she|it|this|that) (lying|true|real|a scam|genuine)\b/i,
];

const FACTUAL_PATTERNS: RegExp[] = [
  /^(what|who|where|when) (is|was|are|were|does|did) (the |a |an )?[\w' -]+\??$/i,
  /^(explain|define|describe|tell me about|summari[sz]e)\b/i,
  /\bwhy does .+ matter\??$/i,
  /\bwhat year\b/i,
  /\bhow many\b/i,
  /\bwhat should i work on\b/i,
  /\bhow am i doing\b/i,
  /\bwhat('s| is) due\b/i,
];

const ATTEMPT_MARKERS = /\b(i think|my guess|my read|because|i suspect|i believe|my hypothesis|i'd say|i would say|i reckon|it seems to me|my view|my take|in my view)\b/i;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isReasoningRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (FACTUAL_PATTERNS.some((p) => p.test(t))) return false;
  return REASONING_PATTERNS.some((p) => p.test(t));
}

/** Has the user offered their own read? Length or explicit hypothesis markers. */
export function containsAttempt(text: string): boolean {
  return wordCount(text) >= 25 || ATTEMPT_MARKERS.test(text);
}

export function shouldThinkFirst(text: string, thinkFirstEnabled: boolean): boolean {
  return thinkFirstEnabled && isReasoningRequest(text) && !containsAttempt(text);
}

const REPLIES = [
  "Give me your read first. Separate what you observed from what you're inferring, then tell me which inference you trust least.",
  "Not yet. Tell me what you actually saw or know, then what you conclude from it, and how sure you are. I will meet you there.",
  "Before I weigh in: your attempt. Two lines of observation, one line of inference, and the alternative you have already rejected.",
  "Your turn first. What is the evidence, what is the explanation you favour, and what would make you drop it?",
];

/** A stable but varied reply, keyed on the message so the same question gets the same reply. */
export function thinkFirstReply(text: string): string {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return REPLIES[h % REPLIES.length];
}
