import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/provider";
import { OPS, type OpName } from "@/lib/ai/schemas";
import { runOp, streamOp } from "@/lib/ai/ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/[op]  body: { input: {...}, stream?: boolean }
 * All model calls happen here. Keys never reach the client.
 */
export async function POST(req: Request, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  if (!(op in OPS)) return NextResponse.json({ ok: false, reason: "unknown_op" }, { status: 404 });
  const cfg = aiConfig();
  if (!cfg.configured) return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 200 });

  let body: { input?: Record<string, unknown>; stream?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const input = body.input ?? {};

  if (body.stream && (op === "curatorRespond" || op === "continueSalonConversation")) {
    const encoder = new TextEncoder();
    const gen = streamOp(op, input);
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await gen.next();
          if (done) controller.close();
          else controller.enqueue(encoder.encode(value));
        } catch (e) {
          controller.enqueue(encoder.encode(`\n[error: ${e instanceof Error ? e.message : "model error"}]`));
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
  }

  try {
    const data = await runOp(op as OpName, input);
    return NextResponse.json({ ok: true, data, model: cfg.model });
  } catch (e) {
    const message = e instanceof Error ? e.message : "model error";
    return NextResponse.json({ ok: false, reason: "model_error", message }, { status: 200 });
  }
}
