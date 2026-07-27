# Product Brief: Ubi Dissentimus

*"Where we disagree" — the deliverable, named literally. Short form: **Ubi**. "Let's run an Ubi."*

*Naming history: an earlier candidate, Ad Crucem, was dropped — crux literally means cross, and the phrase is heavily used by Christian organizations and merchandise. Devotional Latin is a bad fit for a tool whose viability depends on feeling like nobody's project.*

**Motivation mode:** Hobby / Interest. Built because it should exist. Success is a working thing the builder is proud of, used by people he cares about. Monetization is explicitly out of scope.

---

## The Problem

Five friends with near-identical backgrounds — same country, same university, same professional class — can no longer resolve a factual disagreement. Not because anyone reasons badly, but because each person runs a private, unshared retrieval on their own phone, with a query written by someone who already knows what they want back, and then presents the output as neutral. The dueling citations usually aren't even contradictory. The argument ends in raised hands, and the friendship absorbs a little damage each time.

The failure is one level below reasoning. It isn't a logic problem and can't be fixed by naming fallacies.

The friendship is not what's at risk here — it will hold. It's the instrument. This is a durable, decades-old group with unusual tolerance for argument, deliberately turning that tolerance on a problem that is visibly breaking more fragile relationships elsewhere: friendships going quiet, family gatherings quietly stopped, topics ruled off-limits. If five people with every advantage — shared upbringing, shared education, mutual affection, a genuine appetite for debate — cannot locate why they diverge, that is diagnostic. And if they can, the method might travel to tables that don't have those advantages.

## The User

Five middle-aged Canadian professionals — doctors, engineers, entrepreneurs — who genuinely enjoy arguing and have for decades. They admire logic and reason when they see it and are frustrated by their own inability to sustain it in the heat of the moment. They like each other, durably, and that isn't in question. What they want is not to win and not to reconcile — it's to understand why five people this similar, arguing in good faith, can't get to a shared answer. They are a willing test group for a problem they see costing other people their relationships.

Secondarily: a parent at a dinner table with teenagers, who wants his kids to reason well without being beaten at it by an adult with better vocabulary.

Solo, the same person the night before — about to research something he already leans on, or about to forward something he found persuasive.

## The Status Quo

Phones come out under the table. Everyone searches privately. Screenshots get presented as evidence. Nobody agrees on what question was being asked, so the answers don't meet. Eventually the group either drops the topic to preserve the evening or ends on "we can't even agree on this," which is corrosive because it's stated as a fact about the group rather than a locatable difference.

The alternative status quo — fallacy references, media bias charts, chatbot argument analysis — all share one defect: they adjudicate. Every one of them becomes an arsenal used to evaluate other people.

## The Solution

A structured ritual, run async by link or passed around a table, that locates *where two people diverge* and refuses to say who is right.

The loop:

1. **State the claim.** The group edits the wording until every participant accepts it. Nobody proceeds while answering their own question.
2. **The veil.** Each participant privately commits to two things: what answer would change my mind, and which sources I would refuse. Simultaneous reveal, nothing visible until all have submitted.
3. **Look together.** If the accepted-source sets overlap, the group examines one shared thing. If they don't overlap, that's the finding — the disagreement was never about the number.
4. **Descend.** The revealed disagreement becomes the next claim, but only if it can be phrased as something observable. "Is StatsCan trustworthy" fails the gate; "has StatsCan published corrections, and can we see them" passes.
5. **Stop.** Capped at three levels. If no observation can distinguish the two positions, that is bedrock — an irreducible difference in priors, not an error by either party. The session ends there, deliberately, and produces a symmetric artifact naming the seam.

**Solo mode** plays the veil against your future self: commit before you research, then be shown your own commitment afterward and asked whether you found what you said would move you, and whether you moved. A timestamped note you wrote yourself is very hard to argue with.

**The crux library** is the accumulating layer — recurring human disagreements (institutions self-correcting vs. captured; precaution vs. proof; liberty vs. collective risk) rendered into checkable questions. Sessions consume from it and contribute back. Seeded by hand at launch; contribution is a bonus, never a dependency.

## The Differentiator

Every other tool in this space tells you who is wrong. This one structurally cannot. The moat is the veil — pre-commitment before you can see which way the evidence cuts — and it works for the same reason pre-registration works in science: it removes the incentive to choose the test after seeing which test favours you.

Symmetry is not a nice-to-have. It is the viability condition. The moment a participant detects a house position, the tool is a partisan artifact and that person will never open it again. Two design decisions enforce this structurally rather than by good intentions: the group writes the question, and nothing the facilitator emits enters the session without unanimous ratification.

The second moat is editorial. A well-written library of operationalized cruxes is a real intellectual asset, hard to replicate quickly, and valuable independent of the software.

## MVP Scope

*Post-cold-read position: scope held, not compressed. The cold read argued this MVP was too large and could be tested with a form and a group chat. That objection priced the wrong resource. Build cost is low and falling; what's scarce is the number of times you can credibly ask five busy friends to try something. A janky test burns one of those asks on something that feels like homework and makes the builder the proctor — the exact failure mode the product is designed to avoid. Build the real thing. Two constraints hold regardless: no realtime sync, and the writing comes before the code.*

**In:**

| Feature | AI complexity | One-shot risk | Deferral risk | Call |
|---|---|---|---|---|
| Session/round/entry data model with recursion + veil state machine | Architectural | — | High | Design first |
| Veil mechanic (hidden until all submitted) | One-shot | Low | — | Core — it *is* the product |
| Claim-wording consensus step | One-shot | Low | Low | In |
| Disqualified-sources input (free text v1) | 2–3 pass | Low | Med | In, observe before formalizing |
| Async link-based session, no realtime sync | 2–3 pass | Low | High | In — WhatsApp requires it |
| Solo mode as a session with one participant | One-shot | Low | Low *if schema is unified* | In |
| Operationalization gate on descent | 2–3 pass | Med | High | In — prevents the infinite regress |
| Seeded crux library (~15, hand-written) | N/A — writing | — | — | In. Not engineering |
| Worked examples (read-only, static) | One-shot | Low | Low | In — the only indexable surface |
| Shareable seam artifact | One-shot | Low | Med | In — the distribution bet |
| LLM as ratifiable facilitator | Design first | High | Med | In, prompt-first |

**Out:**

- Realtime multi-device sync — architectural, doesn't test the hypothesis, one device passed around or an async link proves the same thing
- Any verdict, score, grade, or fallacy label attached to a participant
- Named public figures' positions — use unattributed positions, or direct quotes with links and no interpretation
- Zeitgeist / current-events content — maintenance treadmill, and the recurring cruxes don't go stale
- Browser extension that flags fallacies as you surf — rejected: unreliable, makes the tool the judge, and structurally can only point outward
- Real-time mediation inside a live argument — escalates rather than de-escalates
- The fallacy encyclopedia — defer freely; it is the least valuable thing here and the first thing instinct says to build
- Accounts and auth beyond what a session link requires

## The Core Hypothesis

**This works if** people who are stuck will accept a structured ritual that makes them commit to what would change their mind *before* they see the evidence — and if locating the divergence, without resolving it, feels like progress rather than a stalemate.

## Distribution Plan

Hobby mode, so this is "who do I want to share this with," not a growth strategy.

**Primary path: the podcast.** *Ubi* as a show — two guests apply, the builder facilitates them through the ritual live, and the episode ends at the seam rather than at a winner. This resolves the contradiction the cold read identified, structurally rather than by hope:

- It is the indexable, linkable surface the product otherwise lacks. A podcast episode is a worked example that people already know how to consume.
- It removes the multiplayer opt-in cap. A viewer with nobody to argue with still gets the value by watching someone hold their position honestly.
- **Applying inverts the ask.** Instead of persuading people to try the tool, participants volunteer — and self-select for willingness to state what would change their mind.
- It generates the training corpus for the facilitator prompt. Ten episodes of live facilitation transcripts beats any amount of speculative prompt design.

**Sequencing implication: the podcast probably precedes the app.** The show can run with a document and a video call. The app becomes the thing the show points at, not the thing that needs to exist first.

**Podcast-specific risks:**

1. *The host becomes the neutrality.* On the page, symmetry is structural — the group writes the question. On camera it is a person, and one visible flicker of preference taints the tool for half the audience. Mitigation: publish both guests' sealed pre-commitments verbatim alongside each episode so viewers can verify the host did not steer.
2. *No winner is a hard sell.* Debate content is consumed for the knockout. The hook has to be the reveal — two people simultaneously realizing they were answering different questions. That is a genuine dramatic moment but the first episode has to land it.
3. *Podcasts are a treadmill.* Most die around episode seven, usually from guest sourcing. Decide up front whether this is a finite season of six with people who can already be named.

*Post-cold-read position: the cold read found a real contradiction — the ambition assumed reach, and no listed mechanism reliably produces it. Resolved by demotion rather than by solving it. This is built unapologetically for one table. The crux library stays because it makes the tool better for those five and because it's the most interesting part to write, not because strangers are required to fill it. Reach is upside that is not designed around. If the method does travel, it travels because it worked somewhere small and visible first.*

1. **The five friends are the alpha.** They already articulated the problem out loud and are motivated. One-shot social risk: introduce it as a *game* with rules everyone submits to equally, not as a tool the builder wants to test on them. Being the proctor kills it.
2. **Async by WhatsApp link** — create session, drop link in the group, everyone submits when they can. Better than in-person for sincerity; nobody is three drinks in and the pre-commitment has time to be honest.
3. **Kids at the dinner table** — the ritual is a way to argue with a teenager without winning by equipment.
4. **Worked examples are the public surface.** Static, linkable, indexable, readable by a stranger who would never convene five people. Everything else in the product is ephemeral.
5. **Solo mode is the on-ramp.** It removes the multiplayer opt-in barrier that otherwise caps reach at zero for anyone outside an existing group.
6. **The seam artifact is the lottery ticket.** "Here is exactly where we honestly split" is postable in a way that argument-winning screenshots are not, because posting it costs nothing socially. Treat it as upside, not as a plan.

## Realistic Outcome

**This wants to be open source, with the podcast as the front door.** Most likely path: it runs two or three times with the five friends, works well enough that the *concept* sticks even if the app doesn't, and the durable artifact is the crux library — fifteen recurring human disagreements, carefully operationalized, useful and citable whether or not anyone ever loads the site. Public repo, plain markdown, app as one interface onto it rather than the point of it.

The honest downside case is not failure but obsolescence: the group finds the source-trust seam once, everyone recognizes it, and from then on they skip straight to it in conversation without opening anything. That is a success for the builder and a failure for the product. Worth knowing in advance so it gets read correctly if it happens.

Given hobby motivation, both outcomes are acceptable. Neither justifies building the realtime sync layer.

## Key Risks

1. **Multiplayer opt-in.** Every participant must agree to the format before anything is produced. Groups are worst at exactly this — and the groups who need it most are the ones already avoiding the topic, who will never convene. This group can, which is why it's the right test and also why the test is generous. Solo mode is the mitigation and it is doing heavy lifting.
2. **Asymmetric use of a symmetric output.** The seam map is designed to be neutral; nothing stops someone using it as a tidy summary of the other side's epistemic sin. Mitigate by ending every worked example at bedrock with both positions intact.
3. **Fake pre-commitment.** The veil stops reasoning backward from evidence; it does not stop performing open-mindedness. Only real defence is the operationalization gate — commitments must name an observation, not a feeling. "If there were good evidence" must be rejected.
4. **Facilitator drift.** The model will slide toward adjudicating. This is the highest one-shot risk in the build and the prompt needs adversarial iteration before any UI wraps it.
5. **The infinite regress.** Descending naively lands at "what is truth" by level four — the same endless-Givens debate, now with a UI. The gate and the three-level cap exist for this.

## Next Steps

0. **Decide whether the podcast is real.** If yes, it reorders everything below — name six people you could plausibly get on episode one, and run a pilot with two friends before building anything.
1. **Write the crux library.** ~15 cruxes, each with three or four operationalized questions. Pure writing, doable from a plane or a car. Markdown in the repo. This is the actual intellectual work of the product, and it is the piece with value independent of the software.
2. **Design the facilitator prompt adversarially.** In conversation, not in code. Play the most suspicious participant and try to catch the model taking a position. Ship nothing until it reliably produces questions and candidate phrasings only.
3. **Run `tech-stack`.** Vercel + Firebase is probably right, but the async-session-by-link pattern and the anonymous-participant model deserve an explicit call.
4. **Run `eng-review`.** The session/round/entry schema with recursion, the veil state machine, and unified solo/group sessions are genuinely architectural and expensive to retrofit.
5. **Run `project-context`** to produce CLAUDE.md — then hand off to Claude Code over Remote Control.
6. **Do not open Claude Code before steps 1 and 2 are done.** Building the app around an unwritten prompt and an unwritten taxonomy is the main way this goes sideways.

---

*Ubi Dissentimus — pronounced OO-bee dis-en-TEE-mus. Verify domain availability (ubidissentimus / ubi.* variants) and check for conflicts before committing. Repo suggestion: `eganc/ubi`.*
