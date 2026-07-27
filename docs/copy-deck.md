# Ubi — Copy Deck

Every user-facing string. This doubles as the tone spec for the facilitator prompt: the model and the interface must sound like the same product.

---

## Voice

**Plain, unhurried, and slightly formal.** The register of a good referee: present, neutral, not your friend. It should read as though the software has no opinion about the argument, because it doesn't.

**Rules:**

- **Never congratulate.** No "Great!", no "Nice work", no checkmarks that celebrate. Submitting an answer is not an achievement.
- **Never imply anyone erred.** No "you were wrong about", no "actually", no scores, no labels attached to a person.
- **No therapeutic warmth.** "Let's explore what's really going on here" is worse than saying nothing. The tool is not on anyone's side, including the side of everyone getting along.
- **No gamification.** No streaks, no progress bars framed as achievement, no badges. A progress indicator that counts submissions is fine; one that praises you is not.
- **Second person, sparingly.** "Name what would change your mind" rather than "You should now think about what might change your mind."
- **Short sentences. Few adverbs.** If a string has two clauses, try one.
- **Say "the claim", not "your argument".** The claim is a shared object on the table. An argument belongs to someone.
- **Never use "just".** It's the tell of software apologising for itself.

**Banned strings:** "Oops", "Something went wrong" (say what went wrong), "Let's get started", "You're all set", "Awesome", "Hang tight", any exclamation mark anywhere.

---

## 1 · Landing

**H1:** Find out where you actually disagree.

**Sub:** Ubi is a structure for arguments that have stopped going anywhere. It doesn't decide who's right. It finds the point where two people's reasoning parted, and stops there.

**How it works (three lines):**
- Agree on the exact claim in dispute.
- Everyone privately writes what would change their mind. Nobody sees anyone else's until all are in.
- Compare. Then go one level down, or agree you've hit the bottom.

**Primary button:** Start a session
**Secondary:** Try it alone
**Tertiary link:** Read a worked example

---

## 2 · Create

**H1:** Start a session

**Field label:** Your name
**Placeholder:** How your friends know you
**Helper:** No account, no email. This is only so people can tell the answers apart.

**Radio:** Who's taking part?
- A group
- Just me

**Button:** Create

**After creation — H1:** Send this link to everyone arguing.
**Link block helper:** Anyone with this link can join. Only send it to people in the argument.
**Button:** Copy link
**Secondary:** Continue

---

## 3 · Join

**H1:** You've been invited to a session.
**Body:** Someone wants to work out where the two of you actually disagree. It takes about ten minutes.
**Field label:** Your name
**Button:** Join

---

## 4 · The claim

**H1:** What exactly is the claim?

**Body:** Write the disputed statement as plainly as you can. Everyone has to accept the wording before anyone answers — including the people who think it's false.

**Field placeholder:** Vaccine mandates were justified during the pandemic.

**Helper under field:** One sentence. No hedging, no "some people say". If you can't agree on the wording, you've already found something useful.

**Ratification state:** Waiting for everyone to accept this wording. — *(followed by names and status)*
**Per-person status:** Accepted · Not yet · Suggested a change

**Buttons:** Accept this wording · Suggest a change

**On edit:** The wording changed. Everyone needs to accept it again.

**Claim type prompt — H2:** Is this something we could look up?
**Option A:** Yes — we could check it, if we agreed where to look
**Option B:** No — we could agree on every fact and still disagree
**Helper:** This changes the questions asked next. If you're unsure, the second one is more often true than people expect.

---

## 5 · Seal

**Host-only — H1:** Ready to seal?
**Body:** Once sealed, the wording is fixed and everyone answers privately. Nothing is visible until all {n} of you have submitted.
**Button:** Seal the claim
**Secondary:** Not yet

---

## 6 · Behind the veil — the commitment

**H1:** Answer privately.
**Sub:** Nobody sees this — including the host — until everyone has submitted.

**Question 1 label:** What would change your mind?
**Placeholder:** Name something you could observe. "Better evidence" doesn't count.
**Helper:** The test: could someone go and find out whether this happened? If not, rewrite it.

**Question 2 label:** Whose account of this would you not accept, and why?
**Placeholder:** Be specific. Naming a source you distrust is more useful than naming ones you like.

*(For value-type claims, Q1 and Q2 are replaced:)*
**Question 1 label:** Where's your line?
**Placeholder:** Name a case where you'd go the other way.
**Question 2 label:** What would have to be different for your answer to change?

**Character counter (at limit):** 500 characters. Say the shorter version.

**Button:** Seal my answer
**Confirm:** Once submitted this can't be edited. Submit?

---

## 7 · Waiting

**H1:** Waiting on {n}.
**Body:** Answers open when everyone has submitted.
**List:** {Name} — submitted · {Name} — not yet

**Idle 24h+:** Still waiting on {names}. This session stays open — come back to it whenever.

**Host-only control:** Someone not coming back?
**Button:** Mark {name} absent
**Confirm:** {Name} will be left out of this round. Their answer, if they submit later, won't be included. Continue?

---

## 8 · The reveal

**H1:** Here's what everyone said.

*(No transition copy. No drumroll. The answers are the moment; anything written on top of them cheapens it.)*

**Column headers:** {Name} would change their mind if… · {Name} would not accept…

**Prompt below — H2:** Read them before you talk.

**Then:**
**H2:** Where does this leave you?
**Option A:** We're asking different questions — *(helper:* Common. Often the whole disagreement.*)*
**Option B:** We want the same thing but disagree about a fact — *(helper:* Go find it together.*)*
**Option C:** We disagree about something underneath this — *(helper:* Go one level down.*)*
**Option D:** We actually agree — *(helper:* It happens.*)*

---

## 9 · Going down a level

**H1:** What's underneath?

**Body:** Name the thing you disagree about that sits below the claim you just made. It has to be something you could check.

**Field placeholder:** Whether this agency corrects its own errors.

**Gate failure:** That can't be checked as written. Can you name something you'd observe if it were true — or if it were false?
**Gate failure, second attempt:** Still not checkable. That may mean you've reached the bottom, which is a real result.
**Button:** Go down a level
**Secondary:** We've hit the bottom

**At depth limit:** Three levels is as far as this goes. If you're still descending, what's left is probably a difference in priors rather than a question with an answer.

---

## 10 · Endings

**Bedrock — H1:** You've reached the bottom.
**Body:** You disagree about {claim}, and neither of you can name an observation that would settle it. That's not a failure of the argument. It means the difference is in what you each start from, and it was never going to be resolved by looking something up.
**Sub:** Worth saying out loud: this is where you'll end up again next time. Knowing that is the point.

**Converged — H1:** You agree.
**Body:** Both of you named the same thing as decisive. Whatever you were arguing about, it wasn't this.

**Different questions — H1:** You were answering different questions.
**Body:** {Name} was arguing about {a}. {Name} was arguing about {b}. Both can be true.

**All endings:**
**Button:** Save this session
**Secondary:** Start another claim

---

## 11 · Solo mode

**Commit — H1:** Before you look.
**Body:** Write down what would change your mind now, while you don't yet know what you'll find.
**Button:** Seal it

**Interstitial — H1:** Go and look.
**Body:** Come back when you have. This stays here.
**Button:** I've looked

**Reveal — H1:** Here's what you said would change your mind.
**Blockquote:** {their commitment, verbatim, with the date}
**Prompt:** Did you find it?
**Options:** I found it and I've changed my mind · I found it and I haven't · I didn't find it · I found something else

**On "found it and I haven't":** Worth sitting with. Either the thing you named wasn't really decisive, or something else is holding the position up. Both are useful to know.

---

## 12 · Publishing

**H1:** Share this session?
**Body:** Everyone who took part has to agree. Your answers would be visible to anyone with the link, exactly as written.
**Status:** {n} of {m} have agreed.
**Button:** I agree to share this
**Secondary:** No

**On refusal:** {Name} declined. The session stays private.

---

## 13 · Edges and errors

**Session expired:** This session has been deleted. Sessions are removed after 90 days unless they're published.

**Lost token:** This browser doesn't have a seat in this session. If you had one, ask the host to send you a resume link.

**No crux matched:** No pattern matched this one. That's fine — most arguments don't fit a template.

**Network failure on submit:** Your answer didn't save. Nothing was sent. Try again.

**Sealed round, direct link:** Answers are sealed until everyone has submitted.

**Empty session (nobody joined):** Nobody's joined yet. Send them the link.

**Facilitator unavailable:** Suggestions are unavailable right now. The session works without them.
