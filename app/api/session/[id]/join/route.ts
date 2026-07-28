import { NextResponse } from "next/server";
import { joinSession, SessionNotJoinableError } from "@/lib/db/participants";
import { copy } from "@/lib/copy";

interface JoinBody {
  displayName?: unknown;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const body = (await request.json().catch(() => null)) as JoinBody | null;
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!displayName) {
    return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 400 });
  }

  try {
    const result = await joinSession(sessionId, displayName);
    return NextResponse.json({
      sessionId,
      participantId: result.participantId,
      token: result.token,
      roundId: result.roundId,
      role: "participant",
    });
  } catch (error) {
    if (error instanceof SessionNotJoinableError) {
      return NextResponse.json({ error: copy.errors.sessionExpired }, { status: 404 });
    }
    throw error;
  }
}
