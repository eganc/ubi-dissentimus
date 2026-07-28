"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { copy } from "@/lib/copy";
import { errorMessageFrom } from "@/lib/http";
import { loadCredentials, saveCredentials } from "@/lib/session-storage";
import type { ClaimType, ParticipantCredentials, SessionStatePayload } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;
const CLAIM_TEXT_FIELD_ID = "claimText";

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [credentials, setCredentials] = useState<ParticipantCredentials | null | undefined>(
    undefined,
  );
  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const [state, setState] = useState<SessionStatePayload | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);

  const [claimDraft, setClaimDraft] = useState("");
  const [claimType, setClaimType] = useState<ClaimType | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [claimActionError, setClaimActionError] = useState<string | null>(null);

  useEffect(() => {
    setCredentials(loadCredentials(sessionId));
  }, [sessionId]);

  const fetchState = useCallback(async (roundId: string) => {
    const response = await fetch(`/api/round/${roundId}/state`);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStateError(
        response.status >= 500 ? copy.errors.serverError : (body?.error ?? copy.errors.sessionExpired),
      );
      return;
    }
    const data = (await response.json()) as SessionStatePayload;
    setState(data);
    setStateError(null);
    if (typeof document !== "undefined" && document.activeElement?.id !== CLAIM_TEXT_FIELD_ID) {
      setClaimDraft(data.round.claimText);
    }
    setClaimType(data.round.claimType);
  }, []);

  useEffect(() => {
    if (!credentials?.roundId) return;
    fetchState(credentials.roundId);
    const interval = setInterval(() => fetchState(credentials.roundId), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [credentials?.roundId, fetchState]);

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    setJoining(true);
    setJoinError(null);

    const response = await fetch(`/api/session/${sessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: joinName }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setJoinError(errorMessageFrom(response, body));
      setJoining(false);
      return;
    }

    const data = (await response.json()) as {
      participantId: string;
      token: string;
      roundId: string;
      role: "participant";
    };

    const next: ParticipantCredentials = {
      sessionId,
      participantId: data.participantId,
      token: data.token,
      role: data.role,
      roundId: data.roundId,
    };
    saveCredentials(next);
    setCredentials(next);
    setJoining(false);
  }

  async function saveClaim(overrides?: { claimText?: string; claimType?: ClaimType | null }) {
    if (!credentials) return;
    const nextText = overrides?.claimText ?? claimDraft;
    const nextType = overrides?.claimType !== undefined ? overrides.claimType : claimType;

    const response = await fetch(`/api/round/${credentials.roundId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: credentials.participantId,
        token: credentials.token,
        claimText: nextText,
        claimType: nextType,
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as SessionStatePayload;
      setState(data);
      setClaimActionError(null);
    } else {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setClaimActionError(errorMessageFrom(response, body));
    }
  }

  async function handleAccept() {
    if (!credentials) return;
    setAccepting(true);
    const response = await fetch(`/api/round/${credentials.roundId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: credentials.participantId,
        token: credentials.token,
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as SessionStatePayload;
      setState(data);
      setClaimActionError(null);
    } else {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setClaimActionError(errorMessageFrom(response, body));
    }
    setAccepting(false);
  }

  if (credentials === undefined) {
    return null;
  }

  if (!credentials) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{copy.join.h1}</h1>
        <p className="mt-2 text-sm text-neutral-600">{copy.join.body}</p>
        <form onSubmit={handleJoin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="joinName" className="block text-sm font-medium text-neutral-900">
              {copy.join.nameLabel}
            </label>
            <input
              id="joinName"
              required
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-base"
            />
          </div>
          {joinError && <p className="text-sm text-red-700">{joinError}</p>}
          <button
            type="submit"
            disabled={joining}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {copy.join.button}
          </button>
        </form>
      </main>
    );
  }

  if (stateError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-700">{stateError}</p>
      </main>
    );
  }

  if (!state) {
    return null;
  }

  const me = state.participants.find((participant) => participant.id === credentials.participantId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{copy.claim.h1}</h1>
      <p className="mt-2 text-sm text-neutral-600">{copy.claim.body}</p>

      <textarea
        id={CLAIM_TEXT_FIELD_ID}
        value={claimDraft}
        onChange={(event) => setClaimDraft(event.target.value)}
        onBlur={() => saveClaim()}
        placeholder={copy.claim.placeholder}
        rows={3}
        className="mt-4 w-full rounded border border-neutral-300 px-3 py-2 text-base"
      />
      <p className="mt-1 text-sm text-neutral-500">{copy.claim.helper}</p>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-neutral-900">{copy.claim.typeQuestion}</legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-start gap-2 text-sm text-neutral-800">
            <input
              type="radio"
              name="claimType"
              className="mt-1"
              checked={claimType === "evidence"}
              onChange={() => {
                setClaimType("evidence");
                saveClaim({ claimType: "evidence" });
              }}
            />
            {copy.claim.typeEvidence}
          </label>
          <label className="flex items-start gap-2 text-sm text-neutral-800">
            <input
              type="radio"
              name="claimType"
              className="mt-1"
              checked={claimType === "value"}
              onChange={() => {
                setClaimType("value");
                saveClaim({ claimType: "value" });
              }}
            />
            {copy.claim.typeValue}
          </label>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{copy.claim.typeHelper}</p>
      </fieldset>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-neutral-900">{copy.claim.ratificationWaiting}</h2>
        <ul className="mt-2 divide-y divide-neutral-200">
          {state.participants.map((participant) => (
            <li key={participant.id} className="flex items-center justify-between py-2 text-sm">
              <span>{participant.displayName}</span>
              <span className="text-neutral-500">
                {participant.accepted ? copy.claim.statusAccepted : copy.claim.statusNotYet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {claimActionError && <p className="mt-4 text-sm text-red-700">{claimActionError}</p>}

      <button
        type="button"
        onClick={handleAccept}
        disabled={accepting || !state.round.claimText || me?.accepted}
        className="mt-6 rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {copy.claim.acceptButton}
      </button>
    </main>
  );
}
