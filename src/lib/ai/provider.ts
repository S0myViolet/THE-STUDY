import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/**
 * Server-side model provider. Keys never reach the browser.
 * Model id and effort are configurable via environment.
 */

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface CompletionRequest<T extends z.ZodTypeAny> {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  schema?: T;
  effort?: Effort;
  maxTokens?: number;
}

export function aiConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-fable-5-1";
  const fastModel = process.env.ANTHROPIC_FAST_MODEL || model;
  return { configured: !!apiKey, apiKey, model, fastModel };
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  const cfg = aiConfig();
  if (!cfg.apiKey) throw new Error("AI is not configured (ANTHROPIC_API_KEY missing)");
  if (!client) client = new Anthropic({ apiKey: cfg.apiKey });
  return client;
}

const EFFORT_TOKENS: Record<Effort, number> = { low: 1500, medium: 3000, high: 6000, xhigh: 10000, max: 16000 };

const ORDER: Effort[] = ["low", "medium", "high", "xhigh", "max"];

/**
 * Which effort levels a model accepts. Sending `effort` to a model that does not
 * take it is a 400, so a cheaper model stays a one-line change in the environment.
 */
function effortLevels(model: string): Effort[] {
  if (/^claude-(fable|mythos)-5/.test(model)) return ORDER;
  if (/^claude-opus-(5|4-[678])/.test(model)) return ORDER;
  if (/^claude-sonnet-5/.test(model)) return ORDER;
  if (/^claude-sonnet-4-6/.test(model)) return ["low", "medium", "high", "max"];
  if (/^claude-opus-4-5/.test(model)) return ["low", "medium", "high"];
  return []; // Haiku 4.5, Sonnet 4.5 and older: no effort parameter
}

/** The nearest level the model accepts, or undefined when it takes none. */
function effortFor(model: string, effort: Effort): Effort | undefined {
  const levels = effortLevels(model);
  if (!levels.length) return undefined;
  if (levels.includes(effort)) return effort;
  for (let i = ORDER.indexOf(effort); i >= 0; i--) {
    const down = ORDER[i];
    if (down && levels.includes(down)) return down;
  }
  return levels[0];
}

/** Structured completion: returns parsed, schema-validated output. */
export async function completeStructured<T extends z.ZodTypeAny>(req: CompletionRequest<T> & { schema: T }): Promise<z.infer<T>> {
  const cfg = aiConfig();
  const c = getClient();
  const effort = req.effort ?? "medium";
  const model = effort === "low" ? cfg.fastModel : cfg.model;
  const maxTokens = req.maxTokens ?? EFFORT_TOKENS[effort];
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const level = effortFor(model, effort);
      const res = await c.messages.parse({
        model,
        max_tokens: maxTokens,
        system: req.system,
        messages: req.messages,
        output_config: { ...(level ? { effort: level } : {}), format: zodOutputFormat(req.schema) },
      });
      if (res.parsed_output) return res.parsed_output as z.infer<T>;
      // Fallback: try to parse the first text block.
      const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      return req.schema.parse(JSON.parse(text));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Model output could not be parsed");
}

/** Plain text completion. */
export async function completeText(req: Omit<CompletionRequest<never>, "schema">): Promise<string> {
  const cfg = aiConfig();
  const c = getClient();
  const effort = req.effort ?? "medium";
  const model = effort === "low" ? cfg.fastModel : cfg.model;
  const level = effortFor(model, effort);
  const res = await c.messages.create({
    model,
    max_tokens: req.maxTokens ?? EFFORT_TOKENS[effort],
    system: req.system,
    messages: req.messages,
    ...(level ? { output_config: { effort: level } } : {}),
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

/** Streaming text completion as an async iterable of text deltas. */
export async function* streamText(req: Omit<CompletionRequest<never>, "schema">): AsyncGenerator<string> {
  const cfg = aiConfig();
  const c = getClient();
  const effort = req.effort ?? "medium";
  const model = effort === "low" ? cfg.fastModel : cfg.model;
  const level = effortFor(model, effort);
  const stream = c.messages.stream({
    model,
    max_tokens: req.maxTokens ?? EFFORT_TOKENS[effort],
    system: req.system,
    messages: req.messages,
    ...(level ? { output_config: { effort: level } } : {}),
  });
  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") yield ev.delta.text;
  }
}
