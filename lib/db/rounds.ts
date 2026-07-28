import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { claimAcceptances, participants, rounds } from "@/lib/db/schema";
import { authenticateParticipant } from "@/lib/db/participants";
import { hashClaim } from "@/lib/tokens";
import type {
  ClaimType,
  ParticipantRole,
  ParticipantState,
  RoundPhase,
  RoundState,
  SessionStatePayload,
} from "@/lib/types";

export class RoundNotFoundError extends Error {}
export class RoundNotDraftingError extends Error {}
export class UnauthorizedError extends Error {}
export class EmptyClaimError extends Error {}

type RoundRecord = typeof rounds.$inferSelect;

function toRoundState(round: RoundRecord): RoundState {
  return {
    id: round.id,
    sessionId: round.sessionId,
    parentRoundId: round.parentRoundId,
    depth: round.depth,
    claimText: round.claimText,
    claimType: round.claimType as ClaimType | null,
    phase: round.phase as RoundPhase,
  };
}

async function requireDraftingRound(roundId: string): Promise<RoundRecord> {
  const db = getDb();
  const [round] = await db.select().from(rounds).where(eq(rounds.id, roundId)).limit(1);
  if (!round) {
    throw new RoundNotFoundError();
  }
  if (round.phase !== "drafting") {
    throw new RoundNotDraftingError();
  }
  return round;
}

async function requireParticipantInRound(
  round: RoundRecord,
  participantId: string,
  token: string,
) {
  const participant = await authenticateParticipant(participantId, token);
  if (!participant || participant.sessionId !== round.sessionId) {
    throw new UnauthorizedError();
  }
  return participant;
}

export async function getRoundState(roundId: string): Promise<SessionStatePayload> {
  const db = getDb();
  const [round] = await db.select().from(rounds).where(eq(rounds.id, roundId)).limit(1);
  if (!round) {
    throw new RoundNotFoundError();
  }

  const roundParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.sessionId, round.sessionId));

  const acceptances = round.claimHash
    ? await db
        .select({ participantId: claimAcceptances.participantId })
        .from(claimAcceptances)
        .where(
          and(
            eq(claimAcceptances.roundId, roundId),
            eq(claimAcceptances.claimHash, round.claimHash),
          ),
        )
    : [];
  const acceptedIds = new Set(acceptances.map((a) => a.participantId));

  const participantStates: ParticipantState[] = roundParticipants.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    role: p.role as ParticipantRole,
    active: p.active,
    accepted: acceptedIds.has(p.id),
  }));

  return { round: toRoundState(round), participants: participantStates };
}

export async function proposeClaim(params: {
  roundId: string;
  participantId: string;
  token: string;
  claimText: string;
  claimType: ClaimType | null;
}): Promise<SessionStatePayload> {
  const { roundId, participantId, token, claimText, claimType } = params;
  const db = getDb();

  const round = await requireDraftingRound(roundId);
  await requireParticipantInRound(round, participantId, token);

  const trimmed = claimText.trim();
  const claimHash = trimmed === "" ? null : hashClaim(trimmed);

  await db
    .update(rounds)
    .set({
      claimText: trimmed,
      claimHash,
      claimType: claimType ?? round.claimType,
    })
    .where(eq(rounds.id, roundId));

  return getRoundState(roundId);
}

export async function acceptClaim(params: {
  roundId: string;
  participantId: string;
  token: string;
}): Promise<SessionStatePayload> {
  const { roundId, participantId, token } = params;
  const db = getDb();

  const round = await requireDraftingRound(roundId);
  await requireParticipantInRound(round, participantId, token);

  if (!round.claimHash) {
    throw new EmptyClaimError();
  }

  await db
    .insert(claimAcceptances)
    .values({ roundId, participantId, claimHash: round.claimHash })
    .onConflictDoUpdate({
      target: [claimAcceptances.roundId, claimAcceptances.participantId],
      set: { claimHash: round.claimHash },
    });

  return getRoundState(roundId);
}
