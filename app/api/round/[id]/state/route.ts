import { NextResponse } from "next/server";
import { getRoundState, RoundNotFoundError } from "@/lib/db/rounds";
import { copy } from "@/lib/copy";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params;

  try {
    const state = await getRoundState(roundId);
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof RoundNotFoundError) {
      return NextResponse.json({ error: copy.errors.sessionExpired }, { status: 404 });
    }
    throw error;
  }
}
