import type { RegistrationErrorCode } from "@/lib/webinar/registration-payload";

/**
 * Every string the webinar funnel shows — Sprint S6.1.
 *
 * Copied character for character from docs/content/page-copy/conversation.md,
 * which the owner approved on 2026-11-13. This is the ONLY place a page string
 * for /conversation, /conversation/replay, the calendar event or the messages
 * of POST /api/conversation may live: change the copy file first, then this
 * file to match, and never the other way round.
 *
 * The entries carry no comments on purpose. The copy file holds each string's
 * source and notes; a second set of notes here would drift from it.
 *
 * Curly marks (’ “ ”) are the owner's own, from his emails. Straight marks (')
 * belong to strings already shipped elsewhere on the site. Both are kept
 * exactly as approved.
 *
 * Per-webinar words are never typed. They are the tokens in braces, filled by
 * `fill()` from the Vercel values at request time.
 */
export const COPY = {
  brand: "(Un)Retire",
  timeZoneLabel: "SAST",
  meta: {
    title: "When Work No Longer Defines You, What Does?",
    description:
      "One hour to work out what defines you once work no longer does. Retired, nearly there, restructured, sold up or moved sideways, this hour is for you.",
    replayTitle: "Watch the replay",
    replayDescription:
      "Thank you for joining us. If you couldn’t make it, the full hour is here.",
  },
  hero: {
    eyebrow: "Free webinar",
    title: "When Work No Longer Defines You, What Does?",
    detail:
      "{weekday} {date} · {time} SAST · 60 minutes, plus 10 optional minutes of questions",
    button: "Save my seat",
  },
  problem: {
    heading:
      "You stopped working. So why do you feel like you stopped mattering?",
    opening: [
      "For years, your work told you who you were.",
      "Your title opened doors. People wanted your opinion. Your diary was full and your phone kept ringing.",
      "Then you retired, your role was restructured or you sold the business. The calls slowed down. And quietly, it started to feel as if you mattered less too.",
    ],
    pause:
      "Someone asks “So, what do you do?” and you pause before you answer.",
    closing: [
      "That pause is what our free webinar is about.",
      "On {weekday} we look at where your worth really comes from, and how to say who you are now without reaching for your old title.",
    ],
  },
  leaveWith: {
    heading: "You’ll leave with:",
    items: [
      "an answer to “what do you do?” that doesn’t start with “I used to”",
      "where your skills still meet a real need",
      "one first step you can take this week",
    ],
  },
  whoFor: {
    heading: "Who this is for",
    body: "Retired, nearly there, restructured, sold up or moved sideways, this hour is for you.",
  },
  howItRuns: {
    heading: "How the hour runs",
    pen: "Keep a pen and paper handy.",
    chat: "Microphones stay off, the chat is where we talk, and taking part is up to you.",
    closes: "Registration closes when we go live on {weekday}.",
  },
  form: {
    firstName: "First name",
    email: "Email address",
    sending: "Sending…",
    consent:
      "We’ll email you about this webinar: reminders before it, then the replay and an offer for our course. Unsubscribe anytime.",
  },
  register: {
    heading: "This hour is for you.",
    detail: "{weekday} {date} · {time} SAST · free · 60 minutes",
    button: "Save my seat",
  },
  toolkit: {
    eyebrow: "Free — sent by email",
    heading: "Get the Practice Toolkit",
    blurb:
      "28 small experiments across the seven practices — one a week for half a year. No pressure. Just forward motion.",
    button: "Email it to me",
  },
  errors: {
    invalidEmail: "A valid email address is required",
    checkEmail: "Please check your email address and try again.",
    tooManyRequests: "Too many requests. Please wait a moment and try again.",
    signUpFailed: "We could not sign you up just now. Please try again.",
    noAnswer: "Something went wrong. Please try again.",
    invalidRequest: "Invalid request",
    emailTooLong: "Email is too long",
    nameTooLong: "Name is too long",
  },
  thankYou: {
    heading: "Your seat is saved.",
    title: "When Work No Longer Defines You, What Does?",
    detail:
      "{weekday} {date} · {time} SAST · 60 minutes, plus 10 optional minutes of questions",
    join: "Join on Zoom",
    calendarFile: "Add to calendar",
    calendarGoogle: "Add to Google Calendar",
    saveNow: "Put it in your diary now. This hour is for you.",
    inbox: "Check your inbox",
    notEmailable:
      "We can’t send email to this address, so you won’t get a confirmation or reminders. Save the link below and add the hour to your calendar now.",
  },
  toolkitSent: {
    eyebrow: "You're in",
    heading: "Check your inbox",
    body: "✓ Your Practice Toolkit is on its way to your inbox. If you don't see it in a few minutes, check your spam or promotions folder.",
    lead: "Plus one free hour that takes it further.",
    link: "Save my seat",
    notEmailable:
      "We can’t send email to this address, so we can’t send the Toolkit. Please try a different email address.",
  },
  closed: {
    text: "Registration for this webinar has closed.",
    toolkitLink: "Get the Practice Toolkit",
    replayLink: "Watch the replay",
  },
  replay: {
    title: "When Work No Longer Defines You, What Does?",
    comingSoon: {
      eyebrow: "Coming Soon",
      body: "We're putting this part of the (Un)Retire experience together. Check back soon — or explore what's already here.",
      link: "Explore the Practice",
    },
    available: {
      intro:
        "Thank you for joining us. If you couldn’t make it, the full hour is here.",
      link: "Watch the replay",
    },
    offer: {
      heading: "Ready to go further?",
      course: "The (Un)Retire Course",
      facts: ["Ten modules", "forty-eight lessons"],
      price: "$99 once. Yours to keep.",
      code: "Use code {offer code} at checkout.",
      deadline: "The offer closes {offer deadline}.",
      button: "Join the course",
    },
    offerEnded: {
      text: "This offer has now closed.",
      link: "The (Un)Retire Course",
    },
  },
  calendar: {
    summary: "When Work No Longer Defines You, What Does?",
    lead: "One hour to work out what defines you once work no longer does.",
    join: "Join on Zoom",
    note: "Keep a pen and paper handy. Microphones stay off, the chat is where we talk, and taking part is up to you.",
  },
} as const;

/** The tokens the copy file defines. `{site}` is an address, handled apart. */
export type CopyToken =
  | "weekday"
  | "date"
  | "time"
  | "offer deadline"
  | "offer code";

/**
 * Put the per-webinar words into an approved sentence.
 *
 * A token with no value THROWS. A page that printed "{weekday}" — or silently
 * dropped the word — would be showing visitors a broken sentence, and the
 * owner's rule for this funnel is that a date or a code only ever comes from a
 * Vercel value. Failing here turns that mistake into an error a developer sees
 * the first time the page renders, not a sentence a visitor reads.
 */
export function fill(
  template: string,
  values: Partial<Record<CopyToken, string>>,
): string {
  return template.replace(/\{([a-z ]+)\}/g, (_match, name: string) => {
    const value = values[name as CopyToken];
    if (value === undefined || value === "") {
      throw new Error(`Copy token {${name}} was given no value.`);
    }
    return value;
  });
}

/**
 * A sentence split around ONE token, so the page can set the token's value in
 * its own element (the offer code is shown in bold) without retyping the
 * sentence around it.
 */
export function splitAt(template: string, token: CopyToken): [string, string] {
  const marker = `{${token}}`;
  const index = template.indexOf(marker);
  if (index === -1) {
    throw new Error(`Copy token ${marker} is not in the sentence.`);
  }
  return [template.slice(0, index), template.slice(index + marker.length)];
}

/**
 * The calendar event's description (copy file, section 15): the lead, then
 * "Join on Zoom" with the site's own join address on the next line, then the
 * note. The address passed in is always {site}/conversation/join — never the
 * Zoom address, which no page, file or response is ever given.
 */
export function calendarDescription(joinAddress: string): string {
  const { lead, join, note } = COPY.calendar;
  return [lead, "", join, joinAddress, "", note].join("\n");
}

/** The approved sentence for each of the validator's four refusals. */
export const REJECTION_COPY: Record<RegistrationErrorCode, string> = {
  "invalid-request": COPY.errors.invalidRequest,
  "invalid-email": COPY.errors.invalidEmail,
  "email-too-long": COPY.errors.emailTooLong,
  "name-too-long": COPY.errors.nameTooLong,
};

/**
 * Every message a form may show. A reply from the server is displayed only
 * when it is one of these exact strings; anything else — an HTML error page
 * from the platform, a message this app did not write — is replaced by the
 * generic "something went wrong" line, so no unvetted text reaches the page.
 */
export const KNOWN_MESSAGES: ReadonlySet<string> = new Set([
  ...Object.values(COPY.errors),
  COPY.closed.text,
]);
