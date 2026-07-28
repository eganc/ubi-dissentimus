import { NextResponse } from "next/server";
import {
  proposeClaim,
  RoundNotDraftingError,
  RoundNotFoundError,
  UnauthorizedError,
} from "@/lib/db/rounds";
import { copy } from "@/lib/copy";
import type { ClaimType } from "@/lib/types";

interface ClaimBody {
  participantId?: unknown;
  token?: unknown;
  claimText?: unknown;
  claimType?: unknown;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params;
  const body = (await request.json().catch(() => null)) as ClaimBody | null;

  const participantId = typeof body?.participantId === "string" ? body.participantId : "";
  const token = typeof body?.token === "string" ? body.token : "";
  const claimText = typeof body?.claimText === "string" ? body.claimText : "";
  const claimType: ClaimType | null =
    body?.claimType === "evidence" ? "evidence" : body?.claimType === "value" ? "value" : null;

  if (!participantId || !token) {
    return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 400 });
  }

  try {
    const state = await proposeClaim({ roundId, participantId, token, claimText, claimType });
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof RoundNotFoundError) {
      return NextResponse.json({ error: copy.errors.sessionExpired }, { status: 404 });
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: copy.errors.lostToken }, { status: 403 });
    }
    if (error instanceof RoundNotDraftingError) {
      return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 409 });
    }
    throw error;
  }
}
