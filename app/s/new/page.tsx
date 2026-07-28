"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { errorMessageFrom } from "@/lib/http";
import { saveCredentials } from "@/lib/session-storage";
import type { SessionMode } from "@/lib/types";

interface CreatedState {
  sessionId: string;
  link: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<SessionMode>("group");
  const [created, setCreated] = useState<CreatedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, mode }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(errorMessageFrom(response, body));
      setSubmitting(false);
      return;
    }

    const data = (await response.json()) as {
      sessionId: string;
      participantId: string;
      token: string;
      role: "host";
      roundId: string;
    };

    saveCredentials({
      sessionId: data.sessionId,
      participantId: data.participantId,
      token: data.token,
      role: data.role,
      roundId: data.roundId,
    });

    setCreated({ sessionId: data.sessionId, link: `${window.location.origin}/s/${data.sessionId}` });
    setSubmitting(false);
  }

  async function handleCopyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  if (created) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{copy.create.afterH1}</h1>
        <p className="mt-2 text-sm text-neutral-600">{copy.create.linkHelper}</p>
        <div className="mt-4 break-all rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
          {created.link}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCopyLink(created.link)}
            className="rounded border border-neutral-900 px-4 py-2 text-sm text-neutral-900"
          >
            {copied ? copy.create.copyLinkCopied : copy.create.copyLink}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/s/${created.sessionId}`)}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            {copy.create.continue}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{copy.create.h1}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-900">
            {copy.create.nameLabel}
          </label>
          <input
            id="displayName"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={copy.create.namePlaceholder}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-base"
          />
          <p className="mt-1 text-sm text-neutral-500">{copy.create.nameHelper}</p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-900">
            {copy.create.modeQuestion}
          </legend>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="mode"
                checked={mode === "group"}
                onChange={() => setMode("group")}
              />
              {copy.create.modeGroup}
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="mode"
                checked={mode === "solo"}
                onChange={() => setMode("solo")}
              />
              {copy.create.modeSolo}
            </label>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {copy.create.button}
        </button>
      </form>
    </main>
  );
}
