# Ubi (Ubi Dissentimus)

A structured ritual for arguments that have stopped going anywhere. Two or more people commit privately to what would change their mind, reveal simultaneously, and descend until they find the exact point where their reasoning diverged. It never decides who is right.

**Stage:** MVP
**Distribution:** Direct web (PWA-capable), shared by link
**Motivation:** Hobby — built because it should exist. No monetization. Open source.

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript strict
- **Database:** Neon Postgres via Vercel Marketplace integration
- **Driver:** `@neondatabase/serverless` — HTTP for simple reads, WebSocket `Pool` for transactions
- **ORM:** Drizzle + drizzle-kit for migrations
- **Styling:** Tailwind, no component library
- **Auth:** None. Capability-based access via unguessable tokens
- **Hosting:** Vercel, git-push deploys from GitHub
- **External APIs:** Anthropic API (facilitator, optional and flag-gated)

Do not suggest switching any of these without being asked. Do not add Firebase, Supabase, Prisma, NextAuth, or a UI component library.

---

## Architecture

### The decision everything follows from

**The client never touches the database.** `DATABASE_URL` is server-side only. Every read and write goes through a route handler in `app/api/`. No client-side database access, ever, for any reason.

This is not a style preference. The product's single differentiating claim is that sealed answers are invisible until reveal. If entry contents are sent to a client and hidden in the UI, that claim is false and the product is pointless.

### Data model

Tables: `sessions`, `participants`, `rounds`, `entries`, `claim_acceptances`, `proposals`, `ratifications`.

Full schema in `/docs/architecture.md`. Key points:

- `sessions.id` is a 22-char crypto-random string and **is** the access capability.
- `rounds.parent_round_id` self-references `rounds.id` — this is the recursion. `depth` has a check constraint `between 0 and 2`.
- `entries` primary key is `(round_id, participant_id)` — submission is idempotent by construction, so a double-tap upserts rather than duplicating.
- `claim_acceptances` stores `claim_hash`. Editing the claim wording invalidates prior acceptances. This is correct behaviour, not a bug.
- There is no denormalised submission counter. Reveal is `count(*)` inside the transaction.

### Key flows

**Claim ratification.** Host creates session → shares link → participants join with a display name → claim wording is edited until every active participant has accepted the current `claim_hash` → host seals, which snapshots `expected_count`.

**Seal → submit → reveal.** Each participant submits two private answers. On each submit, a transaction takes `select ... from rounds where id = $1 for update`, upserts the entry, counts entries, and flips `phase` to `revealed` if the count has reached `expected_count`. Entry contents are never returned by any endpoint while `phase = 'sealed'`.

**Descent.** After reveal, the group names what sits underneath. The new claim must pass the operationalization gate — it has to describe something observable. Failing the gate twice is a legitimate terminal outcome (`bedrock`), not an error state.

**Solo.** A session with `mode = 'solo'` and one participant. Reveal is gated on the participant pressing "I've looked" rather than on a count. Same tables, same phases.

### Architectural decisions (locked)

1. Client never accesses the database. All access via route handlers.
2. Sealed entry contents never leave the server before `phase = 'revealed'`. Not hidden client-side — not sent.
3. Solo is a session with one participant. Do not fork the schema or the phase machine.
4. Recursion is `parent_round_id` + `depth`, capped at 3 levels, enforced by check constraint.
5. Cruxes are markdown files in `/content/cruxes/`, parsed at build time. Never database records.
6. The facilitator emits proposals only. Proposals require unanimous ratification to enter a round. No verdicts, no scores, no labels attached to a participant, ever.
7. Publishing requires unanimous consent from every active participant.
8. Sessions expire 90 days after creation unless published.
9. Polling, not realtime. `GET state` every 3–5s while a round is open. No websockets, no realtime subscriptions.

---

## Project structure

```
app/
  (marketing)/          landing, worked examples
  s/[sessionId]/        the session UI
  api/                  all route handlers — the only DB access point
content/
  cruxes/               13 markdown files, the editorial asset
lib/
  db/                   drizzle schema + client
  tokens.ts             generation, hashing, constant-time compare
  facilitator/          Anthropic calls + prompt + eval fixtures
docs/
  architecture.md       full ADR
  copy-deck.md          every user-facing string
```

Key conventions:

- Every string shown to a user comes from `lib/copy.ts`, which is generated from the copy deck. Do not inline user-facing text in components.
- Shared types live in `lib/types.ts`. Do not redefine.
- All DB access goes through `lib/db/`. Route handlers call those functions; they do not write SQL inline.

---

## Commands

- `npm run dev` — local dev server
- `npm run db:generate` — drizzle-kit migration from schema changes
- `npm run db:migrate` — apply migrations
- `npm run test` — vitest, including the two mandatory tests below
- Deploy: push to `main`. Vercel builds. Do not deploy from the CLI.

---

## MVP scope

**In scope:**

- Crux markdown loader + reader UI (ship this first, it works standalone)
- Session creation, join by link, participant tokens
- Claim wording + ratification
- Seal → submit → reveal transaction
- Recursion with operationalization gate
- Terminal screens: bedrock, converged, different-questions
- Solo mode
- Publish with unanimous consent + seam artifact

**Explicitly out of scope — do not implement or scaffold for:**

- User accounts, email, password, OAuth, magic links
- Realtime sync, websockets, presence indicators
- Any fallacy detection, labelling, or scoring
- A browser extension
- Notifications or email of any kind
- Analytics beyond Vercel's defaults
- Admin dashboard
- Internationalization
- Payments

**The core hypothesis:** people who are stuck will accept a structure that makes them commit to what would change their mind before they see the evidence — and locating the divergence, without resolving it, will feel like progress rather than a stalemate.

---

## Conventions

- TypeScript strict. No `any` without a comment explaining why.
- **Do not collapse the submit transaction into a single CTE statement.** Insert-in-one-CTE and count-in-another looks elegant and is wrong: all CTEs share a snapshot, so the count will not see the row just inserted. Works with one participant, breaks with five. Use `for update` and a real interactive transaction over the WebSocket pool.
- Tokens: store hashes only, compare in constant time, never log a raw token.
- Errors are user-visible and specific. Never "Something went wrong."
- Mobile first at 390px. The reveal screen is the layout most likely to break.
- Entry text capped at 500 characters, enforced server-side.
- Conventional commits.

**Voice — this matters as much as the code.** Copy is plain, unhurried, slightly formal; the register of a referee. Never congratulate. Never imply anyone erred. No therapeutic warmth, no gamification, no exclamation marks. "Seal my answer", not "Submit". The full spec is in `docs/copy-deck.md` and it governs the facilitator prompt too.

---

## Two tests that must exist

1. **Leakage test.** With a round sealed, assert that no endpoint returns entry contents. Grep the raw response body for a known entry string. This test protects the product's core claim.
2. **Concurrency test.** Fire five simultaneous submissions; assert exactly one transition to `revealed` and `count(entries) = 5`.

Do not mark the submit flow complete without both passing.

---

## Ask before doing

- Any schema change
- Adding an npm dependency
- Anything that changes what the facilitator is allowed to emit
- Any change to the phase state machine
- Adding a feature from the out-of-scope list, however reasonable it seems
