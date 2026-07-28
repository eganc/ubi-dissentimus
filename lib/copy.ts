// Generated from docs/copy-deck.md. Do not inline user-facing text in components —
// add it here first.
//
// NOTE: docs/copy-deck.md does not have a section for the crux index/reader
// pages. The strings under `cruxes` below are plain structural labels (not
// voice copy) invented to unblock the scaffold — replace them once the copy
// deck covers this screen. `create`, `join`, `claim`, and `errors` are
// copied verbatim from copy-deck.md sections 2-4 and 13, except
// `errors.invalidRequest`, which is noted inline.
export const copy = {
  site: {
    title: "Ubi Dissentimus",
    description:
      "Ubi is a structure for arguments that have stopped going anywhere. It doesn't decide who's right. It finds the point where two people's reasoning parted, and stops there.",
  },
  cruxes: {
    indexTitle: "Cruxes",
    backLink: "Back to cruxes",
    typeLabel: {
      evidence: "Evidence",
      value: "Value",
    },
  },
  create: {
    h1: "Start a session",
    nameLabel: "Your name",
    namePlaceholder: "How your friends know you",
    nameHelper: "No account, no email. This is only so people can tell the answers apart.",
    modeQuestion: "Who's taking part?",
    modeGroup: "A group",
    modeSolo: "Just me",
    button: "Create",
    afterH1: "Send this link to everyone arguing.",
    linkHelper: "Anyone with this link can join. Only send it to people in the argument.",
    copyLink: "Copy link",
    copyLinkCopied: "Copied",
    continue: "Continue",
  },
  join: {
    h1: "You've been invited to a session.",
    body: "Someone wants to work out where the two of you actually disagree. It takes about ten minutes.",
    nameLabel: "Your name",
    button: "Join",
  },
  claim: {
    h1: "What exactly is the claim?",
    body: "Write the disputed statement as plainly as you can. Everyone has to accept the wording before anyone answers — including the people who think it's false.",
    placeholder: "Vaccine mandates were justified during the pandemic.",
    helper:
      'One sentence. No hedging, no "some people say". If you can\'t agree on the wording, you\'ve already found something useful.',
    ratificationWaiting: "Waiting for everyone to accept this wording.",
    statusAccepted: "Accepted",
    statusNotYet: "Not yet",
    acceptButton: "Accept this wording",
    onEdit: "The wording changed. Everyone needs to accept it again.",
    typeQuestion: "Is this something we could look up?",
    typeEvidence: "Yes — we could check it, if we agreed where to look",
    typeValue: "No — we could agree on every fact and still disagree",
    typeHelper:
      "This changes the questions asked next. If you're unsure, the second one is more often true than people expect.",
  },
  errors: {
    sessionExpired:
      "This session has been deleted. Sessions are removed after 90 days unless they're published.",
    lostToken:
      "This browser doesn't have a seat in this session. If you had one, ask the host to send you a resume link.",
    emptySession: "Nobody's joined yet. Send them the link.",
    // Not in docs/copy-deck.md — plain, technical fallbacks for cases the
    // deck doesn't name. invalidRequest is for malformed requests, which
    // normal use of the UI should never trigger. serverError is for
    // unexpected failures (a 5xx) — kept distinct so it's never confused
    // with the client having done something wrong.
    invalidRequest: "That request was missing something required.",
    serverError: "The server couldn't complete that. Nothing was saved. Try again.",
  },
} as const;
