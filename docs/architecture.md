# Architecture Review: Ubi Dissentimus

Stack: Next.js (App Router) on Vercel · Neon Postgres (Vercel Marketplace, billed through Vercel) · Drizzle · no auth · cruxes as markdown in repo.

*Revised from an earlier Firestore version. Once "the client never touches the database" was locked, Firestore's realtime client SDK — its main advantage — went unused, leaving security rules to maintain for no benefit. Postgres gives real transactions for the reveal race and a real foreign key for the round tree.*

---

## The one decision everything else follows from

**The client never touches the database. All reads and writes go through Next.js route handlers.**

The veil is the product. If a participant can open devtools and read another participant's sealed entry before reveal, the product is not merely buggy — its single differentiating claim is false. With no auth, anyone holding the session link is an authenticated-enough client, so any client-side data access puts the core guarantee in a rules file.

Server-only access removes that entire class of failure, and with Postgres it removes the rules layer altogether: the database is reachable only via `DATABASE_URL`, which never leaves the server.

**Vendors: GitHub, Vercel, Neon (billed inside Vercel), Anthropic API.** Deploys are git-push; preview deployments get their own database branch, so an agent opening a PR gets an isolated schema to test against.

## Data model

```sql
create table sessions (
  id              text primary key,          -- 22-char crypto-random, this is the capability
  mode            text not null check (mode in ('group','solo')),
  status          text not null default 'open' check (status in ('open','closed')),
  crux_id         text,                      -- slug matching a markdown file; nullable
  root_round_id   uuid,
  active_round_id uuid,
  publish_state   text not null default 'private'
                  check (publish_state in ('private','pending','published')),
  share_id        text unique,               -- separate id, only when published
  host_token_hash text not null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null       -- TTL sweep, 90 days
);

create table participants (
  id           uuid primary key default gen_random_uuid(),
  session_id   text not null references sessions(id) on delete cascade,
  display_name text not null,
  token_hash   text not null,
  role         text not null check (role in ('host','participant')),
  active       boolean not null default true,   -- host can mark absent to unblock reveal
  joined_at    timestamptz not null default now()
);
create index on participants (session_id);

create table rounds (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null references sessions(id) on delete cascade,
  parent_round_id uuid references rounds(id) on delete cascade,   -- null == root
  depth           int  not null check (depth between 0 and 2),    -- the cap, enforced by the DB
  claim_text      text not null default '',
  claim_hash      text,                        -- invalidates ratifications when wording changes
  claim_type      text check (claim_type in ('evidence','value')),
  phase           text not null default 'drafting'
                  check (phase in ('drafting','sealed','revealed','closed')),
  expected_count  int,                         -- snapshotted at seal
  revealed_at     timestamptz,
  outcome         text check (outcome in ('descended','bedrock','converged')),
  created_at      timestamptz not null default now()
);
create index on rounds (session_id);
create index on rounds (parent_round_id);

create table entries (
  round_id             uuid not null references rounds(id) on delete cascade,
  participant_id       uuid not null references participants(id) on delete cascade,
  would_change_my_mind text not null,
  refused_sources      text not null default '',
  submitted_at         timestamptz not null default now(),
  primary key (round_id, participant_id)       -- idempotent submit by construction
);

create table claim_acceptances (
  round_id       uuid not null references rounds(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  claim_hash     text not null,
  primary key (round_id, participant_id)
);

create table proposals (
  id         uuid primary key default gen_random_uuid(),
  round_id   uuid not null references rounds(id) on delete cascade,
  kind       text not null check (kind in ('claim-wording','question')),
  body       text not null,
  status     text not null default 'pending'
             check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now()
);

create table ratifications (
  proposal_id    uuid not null references proposals(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  primary key (proposal_id, participant_id)
);
```

What the move to Postgres buys, concretely:

- **The denormalised `submittedCount` is gone.** Reveal is `count(*) from entries where round_id = $1`, computed inside the transaction. One less field to drift.
- **`depth between 0 and 2` is a check constraint**, not application logic. The recursion cap can't be bypassed by a direct API call.
- **`parent_round_id` is a real foreign key** with cascade delete. Orphaned rounds stop being possible.
- **Composite primary key on `entries`** makes double-tap submission an upsert rather than a duplicate.
- **`claim_hash` on acceptances** means editing the claim wording silently invalidates prior ratifications — which is correct behaviour and would otherwise be a subtle bug.

**Solo mode is a session with one participant.** Same tables, same phases. The only difference is that reveal is gated on the participant pressing "I've looked into it" rather than on a count. Do not fork the schema.

## Auth and identity

**There is no auth, and that is the correct call** — but it is a deliberate design, not an absence.

- **Session link** = the capability. 22 characters of crypto-random. Anyone holding it can join. This matches how the product will actually be used: a link dropped into a WhatsApp group.
- **Participant token** issued on join, stored in `localStorage`, sent with every request. Server stores only a hash. It is the sole thing distinguishing you from the other people on the link.
- **Roles: `host` and `participant`.** Defined now because adding roles later means a migration. Host can: mark a participant absent, force reveal, close a session, initiate publish. Host cannot: see sealed entries early. Worth stating explicitly in the code, because the temptation to give the host a peek for "moderation" will arise and it would be fatal.
- **Losing the token means losing your seat.** Cleared browser storage, different device, private tab — you're a new participant. Mitigation is a "resume" link the host can reissue. Accept this; the alternative is accounts.

**First session walkthrough:** host creates → session + root round (`phase: drafting`) + host participant → host shares link → each joiner posts a display name, gets a participant doc and token → when all have ratified the claim wording, host seals → phase `sealed`, `expectedCount` snapshotted → each submits → on final submission, reveal.

---

## API surface

All server-side, all in Next.js route handlers. None of these are safe client-side.

| Operation | Notes |
|---|---|
| `POST /api/session` | Create; returns host token + link |
| `POST /api/session/:id/join` | Returns participant token |
| `POST /api/round/:id/claim` | Propose/edit wording while `drafting` |
| `POST /api/round/:id/accept` | Ratify wording; appends to `acceptedBy` |
| `POST /api/round/:id/seal` | Host only; snapshots `expectedCount` |
| `POST /api/round/:id/entry` | **The critical one.** Interactive transaction, see below |
| `GET /api/round/:id/state` | Returns phase + `submittedCount`/`expectedCount` only. **Never entry contents while sealed** |
| `GET /api/round/:id/reveal` | Returns all entries; refuses unless `phase == 'revealed'` |
| `POST /api/round/:id/descend` | Creates child round; enforces depth cap |
| `POST /api/round/:id/close` | Sets outcome |
| `POST /api/session/:id/publish` | Requires unanimous consent (below) |
| `POST /api/facilitate` | Calls Anthropic API; returns proposals only |

**Polling, not realtime.** `GET state` every 3–5 seconds while a round is open. At five participants this is trivially cheap, and it avoids both the client SDK and a websocket layer. If the async-over-WhatsApp pattern dominates, most sessions won't even have two people present simultaneously.

**Driver choice matters here.** Use `@neondatabase/serverless` — the HTTP driver for simple single-statement reads, and the WebSocket `Pool` for the submit endpoint, which needs a genuine interactive transaction (`select … from rounds where id = $1 for update`, insert the entry, count, conditionally flip phase, commit).

**Do not try to collapse the submit into one CTE statement.** The obvious-looking version — insert the entry in one CTE, count entries in another, update the round based on the count — is wrong, because all CTEs in a statement see the same snapshot and the counting CTE will not observe the row the inserting CTE just wrote. It will appear to work with one participant and fail with five. This is the single most likely subtle bug in the build.

**External integrations:** Anthropic API only. Key server-side, never in the client bundle. On failure the facilitator degrades to absent — the ritual must work with no model at all, since that was the v1 design before the facilitator was added back. Never block a round on an API call.

---

## Architectural decisions (locked)

1. **Client never accesses the database.** `DATABASE_URL` is server-side only; every read and write goes through a route handler.
2. **Veil enforcement is server-side.** Sealed entry contents never leave the server before `phase == 'revealed'`. Not hidden in the UI — not sent.
3. **Solo is a session with one participant.** One schema, one set of phases.
4. **Recursion is `parentRoundId` + `depth`, capped at 3 levels, enforced server-side.**
5. **Cruxes are markdown in the repo**, parsed at build time. Not database records. They are versioned, diffable, and reviewable in a PR — which matters because they are the editorial asset.
6. **The facilitator only ever emits proposals, and proposals require unanimous ratification to enter a round.** No verdicts, no scores, no labels attached to a participant. This is a product constraint expressed in the data model so it can't erode.
7. **Publishing requires unanimous consent from every active participant.** Sessions contain people's sincere positions.
8. **Sessions are ephemeral by default** — TTL delete after 90 days unless published.

---

## High one-shot-risk items

Two items from the Firestore version are now gone: security-rule misconfiguration (no rules layer exists) and counter drift (no denormalised count exists). What remains:

**1. The submit-and-reveal transaction.** Two people submitting simultaneously must not both fail to trigger reveal, or both trigger it. Requires `select … for update` on the round row, and must not use the CTE shortcut described above. *Verify:* fire five concurrent submissions in a script and assert exactly one transition to `revealed`.

**2. Leakage through the state endpoint.** The obvious failure is returning entry rows to the client and hiding them in the UI. *Verify:* with a round sealed, curl the state endpoint and grep the raw response for a known entry string. Make this an automated test — it's the product's core claim.

**3. Facilitator drift.** Will slide toward adjudicating under pressure, especially when one side's position is weaker. Not fixable by one careful prompt. *Verify:* a fixture set of ten lopsided claims; assert every output is interrogative and names no winner. Build this before wiring the model to the UI.

**4. Token handling.** Store hashes, never raw tokens; compare in constant time. Small surface, easy to get subtly wrong, and it's the only thing standing between a participant and someone else's seat.

**5. Serverless connection handling.** Long-lived pooled clients and serverless functions don't mix. Use the Neon serverless driver as described rather than a classic `pg` pool.

## Edge cases to handle in MVP

- **Someone joins and never submits.** Blocks reveal indefinitely. Host needs "mark absent" — which decrements `expectedCount` — and the UI must show *who* everyone is waiting on.
- **Everyone writes the same thing.** Not a failure. It means you agree and the argument is over. Needs its own outcome (`converged`) and its own screen, or it will render as an error.
- **Nobody can name an observation.** The operationalization gate rejects the descent. That's bedrock, and it needs a dignified terminal screen, not a validation error.
- **The session resumes four days later.** The async WhatsApp case is the normal case. Every screen must be resumable from a cold link with no memory of what happened.
- **Empty crux match.** Most sessions won't map to one of the thirteen. "No crux matched" must be a first-class state, not a blank panel.
- **Mobile.** This is a phone product used by people standing in a kitchen. Design at 390px first; the reveal screen showing five entries side by side is the layout that will break.
- **Long text.** Cap entries at ~500 characters. Partly document hygiene, mostly because a 2,000-word position paper defeats the format.
- **Deletion.** No accounts means no account deletion, but the host needs a delete-session button, and TTL handles the rest.

---

## What to build first

1. **Crux markdown loader + reader UI.** Static, no database, immediately useful as the "worksheet" — and it's shippable on its own.
2. **Session/participant/round creation and the join flow.** No veil yet.
3. **The seal → submit → reveal transaction.** With the concurrency test and the leakage test written alongside. This is the product; everything before it is scaffolding and everything after is elaboration.
4. **Recursion and the descent gate.**
5. **Outcome screens** — descended, bedrock, converged.
6. **Facilitator, behind a flag, off by default.** Ship a working sessionless-of-AI version first; if the ritual only works with the model, that's worth knowing.
7. **Publish and the seam artifact.** Last, and only after the consent flow is thought through.
