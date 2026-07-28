import { NextResponse } from "next/server";
import { createSession } from "@/lib/db/sessions";
import { copy } from "@/lib/copy";
import type { SessionMode } from "@/lib/types";

interface CreateSessionBody {
  displayName?: unknown;
  mode?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateSessionBody | null;
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const mode: SessionMode | null =
    body?.mode === "solo" ? "solo" : body?.mode === "group" ? "group" : null;

  if (!displayName || !mode) {
    return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 400 });
  }

  const result = await createSession(displayName, mode);

  return NextResponse.json({
    sessionId: result.sessionId,
    roundId: result.roundId,
    participantId: result.participantId,
    token: result.hostToken,
    role: "host",
  });
}
