import type { SourceKey } from "@/lib/webinar/sources";

/**
 * Every string /report shows — Sprint S6.2, as the owner simplified it at
 * Gate B on 2026-11-20 (PROJECT-STATUS D-65).
 *
 * Copied character for character from docs/content/page-copy/report.md. Change
 * the copy file first, then this file to match — never the other way round.
 * The entries carry no comments on purpose: the copy file holds each string's
 * source and status.
 *
 * The webinar's name under the heading is not here: it is the sign-up page's
 * own title (COPY.hero.title in src/app/conversation/copy.ts), so the two can
 * never differ.
 */
export const REPORT_COPY = {
  meta: {
    title: "Webinar report",
  },
  header: {
    title: "Webinar report",
  },
  cards: {
    visits: "Visits to the sign-up page",
    registered: "Registered",
    conversion: "Conversion",
  },
  table: {
    heading: "Where people came from",
    source: "Where from",
    visits: "Visits",
    registered: "Registered",
    conversion: "Conversion",
    total: "Total",
  },
  noConversion: "—",
  sources: {
    linkedin: "LinkedIn",
    instagram: "Instagram",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    email: "Email newsletter",
    "meta-ads": "Instagram & Facebook ads",
    "linkedin-ads": "LinkedIn ads",
    other: "Other / unknown",
  } satisfies Record<SourceKey, string>,
  reset: {
    heading: "Start again for a new webinar",
    intro:
      "Type the report password and click the button. All visits and sign-ups are deleted, and counting starts again from zero.",
    keep: "Want to keep these numbers? Take a screenshot first: a reset cannot be undone.",
    button: "Reset the numbers",
    done: "Done. Counting starts again from zero.",
  },
  login: {
    intro: "This page is private. Type the report password to open it.",
    button: "Open the report",
  },
  messages: {
    wrong: "That password didn't work. Try again.",
    busy: "Too many tries in a short time. Wait 10 minutes and try again.",
    error: "Something went wrong. Try again in a minute.",
    resetWrong: "That password didn't work, so nothing was reset.",
    resetFailed: "That didn't reset. Try again in a minute.",
    resetStale:
      "The report changed after you opened this page, so nothing was reset. Check the numbers, then try again.",
    off: "This report isn't switched on yet.",
    loadFailed: "The report couldn't load. Refresh the page in a minute.",
  },
} as const;

/** What a sign-in redirect may carry in ?e= — anything else is ignored. */
export type LoginMessageCode = "wrong" | "busy" | "error";

const LOGIN_CODES: readonly LoginMessageCode[] = ["wrong", "busy", "error"];

export function isLoginMessageCode(value: unknown): value is LoginMessageCode {
  return (
    typeof value === "string" &&
    (LOGIN_CODES as readonly string[]).includes(value)
  );
}

/** What a reset redirect may carry in ?r= — anything else is ignored. */
export type ResetResultCode = "done" | "wrong" | "busy" | "error" | "stale";

const RESET_CODES: readonly ResetResultCode[] = [
  "done",
  "wrong",
  "busy",
  "error",
  "stale",
];

export function isResetResultCode(value: unknown): value is ResetResultCode {
  return (
    typeof value === "string" &&
    (RESET_CODES as readonly string[]).includes(value)
  );
}
