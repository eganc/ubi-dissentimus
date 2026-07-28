import { NextResponse } from "next/server";
import {
  acceptClaim,
  EmptyClaimError,
  RoundNotDraftingError,
  RoundNotFoundError,
  UnauthorizedError,
} from "@/lib/db/rounds";
import { copy } from "@/lib/copy";

interface AcceptBody {
  participantId?: unknown;
  token?: unknown;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params;
  const body = (await request.json().catch(() => null)) as AcceptBody | null;

  const participantId = typeof body?.participantId === "string" ? body.participantId : "";
  const token = typeof body?.token === "string" ? body.token : "";

  if (!participantId || !token) {
    return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 400 });
  }

  try {
    const state = await acceptClaim({ roundId, participantId, token });
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
    if (error instanceof EmptyClaimError) {
      return NextResponse.json({ error: copy.errors.invalidRequest }, { status: 409 });
    }
    throw error;
  }
}
