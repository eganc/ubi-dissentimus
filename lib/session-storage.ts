import type { ParticipantCredentials } from "@/lib/types";

const STORAGE_PREFIX = "ubi:session:";

export function saveCredentials(credentials: ParticipantCredentials): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_PREFIX + credentials.sessionId,
    JSON.stringify(credentials),
  );
}

export function loadCredentials(sessionId: string): ParticipantCredentials | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_PREFIX + sessionId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParticipantCredentials;
  } catch {
    return null;
  }
}
