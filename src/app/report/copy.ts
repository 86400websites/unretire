import type { SourceKey } from "@/lib/webinar/sources";

/**
 * Every string /report shows — Sprint S6.2.
 *
 * Copied character for character from docs/content/page-copy/report.md. Change
 * the copy file first, then this file to match — never the other way round.
 * The entries carry no comments on purpose: the copy file holds each string's
 * source and status.
 *
 * Tokens in braces are filled at request time: {weekday} and {date} from
 * WEBINAR_STARTS_AT, {count from} from the day the owner saves.
 */
export const REPORT_COPY = {
  meta: {
    title: "Webinar report",
  },
  header: {
    title: "Webinar report",
    webinar: "For the webinar on {weekday} {date}",
    countingFrom: "Counting from {count from}.",
    countingFromStart: "Counting from the beginning.",
    howItCounts:
      "Each visit is counted once per browser tab, and each person once. Test sign-ups are left out.",
  },
  cards: {
    visits: "Visits to the sign-up page",
    registered: "Registered",
    showedUp: "Showed up",
    showedUpEmpty: "Add it after the webinar",
  },
  table: {
    heading: "Where people came from",
    source: "Where from",
    visits: "Visits",
    registered: "Registered",
    total: "Total",
  },
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
  inputs: {
    heading: "Your numbers",
    countFrom: "Counting from",
    countFromHint:
      "The day your team starts posting. Visits and sign-ups before it are left out. Leave it empty to count everything.",
    showedUp: "Showed up",
    showedUpHint:
      "After the webinar: the number of people in Zoom's participant report, each person counted once, without your team.",
    button: "Save",
    saved: "Saved.",
  },
  login: {
    intro: "This page is private. Type the report password to open it.",
    button: "Open the report",
  },
  messages: {
    wrong: "That password didn't work. Try again.",
    busy: "Too many tries in a short time. Wait 10 minutes and try again.",
    date: "That date doesn't look right. Pick a day from the calendar.",
    number: "Type a whole number, for example 74.",
    save: "That didn't save. Try again in a minute.",
    error: "Something went wrong. Try again in a minute.",
    off: "This report isn't switched on yet.",
    loadFailed: "The report couldn't load. Refresh the page in a minute.",
  },
} as const;

/** The codes a redirect may carry in ?e= — anything else is ignored. */
export type ReportMessageCode =
  | "wrong"
  | "busy"
  | "date"
  | "number"
  | "save"
  | "error";

const MESSAGE_CODES: readonly ReportMessageCode[] = [
  "wrong",
  "busy",
  "date",
  "number",
  "save",
  "error",
];

export function isReportMessageCode(
  value: unknown,
): value is ReportMessageCode {
  return (
    typeof value === "string" &&
    (MESSAGE_CODES as readonly string[]).includes(value)
  );
}

/** Replace {token}s with their values; a token with no value stays as typed. */
export function fillReport(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([a-z ]+)\}/g, (whole, name: string) =>
    name in values ? values[name]! : whole,
  );
}
