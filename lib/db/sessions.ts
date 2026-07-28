import { eq } from "drizzle-orm";
import { getDb, getPooledDb } from "@/lib/db/client";
import { participants, rounds, sessions } from "@/lib/db/schema";
import { generateSessionId, generateToken, hashToken } from "@/lib/tokens";
import type { SessionMode } from "@/lib/types";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export interface CreatedSession {
  sessionId: string;
  roundId: string;
  participantId: string;
  hostToken: string;
}

export async function createSession(
  displayName: string,
  mode: SessionMode,
): Promise<CreatedSession> {
  const db = getPooledDb();
  const sessionId = generateSessionId();
  const hostToken = generateToken();
  const hostTokenHash = hashToken(hostToken);
  const expiresAt = new Date(Date.now() + NINETY_DAYS_MS);

  return db.transaction(async (tx) => {
    await tx.insert(sessions).values({
      id: sessionId,
      mode,
      hostTokenHash,
      expiresAt,
    });

    const [round] = await tx
      .insert(rounds)
      .values({ sessionId, depth: 0 })
      .returning({ id: rounds.id });
    if (!round) {
      throw new Error("Failed to create root round");
    }

    const [participant] = await tx
      .insert(participants)
      .values({
        sessionId,
        displayName,
        tokenHash: hostTokenHash,
        role: "host",
      })
      .returning({ id: participants.id });
    if (!participant) {
      throw new Error("Failed to create host participant");
    }

    await tx
      .update(sessions)
      .set({ rootRoundId: round.id, activeRoundId: round.id })
      .where(eq(sessions.id, sessionId));

    return {
      sessionId,
      roundId: round.id,
      participantId: participant.id,
      hostToken,
    };
  });
}

export type SessionRecord = typeof sessions.$inferSelect;

export async function getSessionById(sessionId: string): Promise<SessionRecord | undefined> {
  const db = getDb();
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return session;
}
