export type CruxType = "evidence" | "value";

export type CruxBodyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "list"; items: string[] };

export interface Crux {
  id: string;
  title: string;
  type: CruxType;
  surfacesAs: string[];
  body: CruxBodyBlock[];
}

export type SessionMode = "group" | "solo";
export type ParticipantRole = "host" | "participant";
export type RoundPhase = "drafting" | "sealed" | "revealed" | "closed";
export type ClaimType = "evidence" | "value";

export interface RoundState {
  id: string;
  sessionId: string;
  parentRoundId: string | null;
  depth: number;
  claimText: string;
  claimType: ClaimType | null;
  phase: RoundPhase;
}

export interface ParticipantState {
  id: string;
  displayName: string;
  role: ParticipantRole;
  active: boolean;
  accepted: boolean;
}

export interface SessionStatePayload {
  round: RoundState;
  participants: ParticipantState[];
}

export interface ParticipantCredentials {
  sessionId: string;
  participantId: string;
  token: string;
  role: ParticipantRole;
  roundId: string;
}
