import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = aiConfig();
  return NextResponse.json({
    configured: cfg.configured,
    model: cfg.configured ? cfg.model : null,
    provider: cfg.configured ? "anthropic" : null,
  });
}
