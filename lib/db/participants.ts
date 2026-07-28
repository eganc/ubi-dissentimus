import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { participants, sessions } from "@/lib/db/schema";
import { compareTokenHash, generateToken, hashToken } from "@/lib/tokens";

export class SessionNotJoinableError extends Error {}

export interface JoinedParticipant {
  participantId: string;
  token: string;
  roundId: string | null;
}

export async function joinSession(
  sessionId: string,
  displayName: string,
): Promise<JoinedParticipant> {
  const db = getDb();
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

  if (!session || session.status !== "open" || session.expiresAt.getTime() < Date.now()) {
    throw new SessionNotJoinableError();
  }

  const token = generateToken();
  const [participant] = await db
    .insert(participants)
    .values({
      sessionId,
      displayName,
      tokenHash: hashToken(token),
      role: "participant",
    })
    .returning({ id: participants.id });

  if (!participant) {
    throw new Error("Failed to create participant");
  }

  return {
    participantId: participant.id,
    token,
    roundId: session.activeRoundId,
  };
}

export type AuthenticatedParticipant = typeof participants.$inferSelect;

export async function authenticateParticipant(
  participantId: string,
  token: string,
): Promise<AuthenticatedParticipant | undefined> {
  const db = getDb();
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!participant || !compareTokenHash(token, participant.tokenHash)) {
    return undefined;
  }
  return participant;
}
