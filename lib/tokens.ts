import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

// 16 random bytes as unpadded base64url = 22 characters. This is the
// session capability — anyone holding it can join. See docs/architecture.md.
export function generateSessionId(): string {
  return randomBytes(16).toString("base64url");
}

// Participant/host tokens. Store only the hash (hashToken below); the raw
// value is returned once, to the client, and never logged.
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function compareTokenHash(rawToken: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashToken(rawToken), "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(candidate, stored);
}

// Invalidates prior claim_acceptances rows when the wording changes — see
// docs/architecture.md's claim_hash note.
export function hashClaim(claimText: string): string {
  return createHash("sha256").update(claimText.trim()).digest("hex");
}
