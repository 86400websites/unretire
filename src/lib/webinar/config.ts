import { readWebinarEnv, type WebinarEnvValues } from "./env";

/**
 * The webinar funnel's fixed facts, and the one place the five Vercel values
 * are read at request time — Sprint S6.1.
 *
 * WHAT LIVES HERE AND WHAT DOES NOT. The owner's rule for this funnel is that
 * a date, a link or a code is changed with a Vercel value and a Redeploy, and
 * never with a commit. So nothing per-webinar is typed in this file: no date,
 * no time, no weekday, no code, no address. What IS here is what stays the
 * same from one webinar to the next unless a developer changes it on purpose —
 * the campaign id, the Mailchimp tag names, the session length and the zone
 * the times are shown in.
 *
 * The time-zone LABEL beside a displayed time is approved copy
 * (docs/content/page-copy/conversation.md, section 2), so it is passed in by
 * the caller and is not defined here.
 */
export const CAMPAIGN = {
  /** One id everywhere: tags, segment names, Mailchimp campaign names, the script. */
  id: "conv1",
  tags: {
    /** Applied by the register form. Starts the flow that sends Email 1. */
    registered: "conv1-registered",
    /** Applied by the Toolkit form. Starts the flow that sends Email 2. */
    toolkit: "conv1-toolkit",
    /** Applied by the Stripe webhook. Keeps buyers out of Emails 8 and 9. */
    purchased: "purchased-course",
  },
  /**
   * Length of the session itself; the calendar event ends this long after the
   * start. The approved copy says "60 minutes" and "one hour" in several
   * places, so changing this number means changing those rows too.
   */
  sessionMinutes: 60,
  /** Every time on the site is shown in this zone, whatever the server's own. */
  timeZone: "Africa/Johannesburg",
  /** Day-before-month order and English names, as the owner writes his dates. */
  locale: "en-GB",
} as const;

/** The five values as the app sees them. `null` means "not configured". */
export type Webinar = WebinarEnvValues;

/**
 * Read the five values for this request. LENIENT by design: a value that is
 * set but malformed is treated as unset, so the worst a bad value can do at
 * request time is leave the funnel dormant.
 *
 * In practice the build has already refused a malformed value
 * (`assertWebinarEnv`, run from next.config.ts), so the log line below should
 * never appear on a deployment. It exists for the environments that do not go
 * through that build — a local dev server above all.
 *
 * Only the variable NAME is logged. The values include the Zoom address,
 * which must never reach a log.
 */
export function getWebinar(): Webinar {
  const { values, malformed } = readWebinarEnv(process.env);
  for (const name of malformed) {
    console.error(
      `Webinar config: ${name} is missing or not valid; the value was ignored.`,
    );
  }
  return values;
}

/**
 * Dates and times are formatted HERE, once, on the server — with an explicit
 * locale, time zone and 24-hour cycle — and handed to components as finished
 * strings. A client component that formatted a Date itself would use the
 * visitor's own zone and locale, and the page would disagree with the e-mails
 * (and with the server-rendered HTML, which is a hydration error).
 */
export type DisplayParts = {
  /** {weekday} — for example "Thursday". */
  weekday: string;
  /** {date} — day and month, for example "10 December". */
  date: string;
  /** {time} — 24-hour clock, for example "16:00". */
  time: string;
};

const DISPLAY_FORMAT = new Intl.DateTimeFormat(CAMPAIGN.locale, {
  timeZone: CAMPAIGN.timeZone,
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * The three display tokens for one instant, in the campaign's zone.
 *
 * Built from `formatToParts` rather than from a formatted sentence: the
 * separators a locale puts between the parts (commas, "at") vary between
 * runtimes and ICU versions, and the approved copy supplies its own.
 */
export function formatDisplayParts(instant: Date): DisplayParts {
  const parts = new Map<string, string>();
  for (const part of DISPLAY_FORMAT.formatToParts(instant)) {
    parts.set(part.type, part.value);
  }
  const part = (type: string) => parts.get(type) ?? "";
  return {
    weekday: part("weekday"),
    date: `${part("day")} ${part("month")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

/**
 * {offer deadline} — defined by the approved copy's token table as
 * "{weekday} {date} at {time}" of WEBINAR_OFFER_ENDS_AT followed by the
 * time-zone label. The label is copy, so the caller supplies it.
 */
export function formatOfferDeadline(
  offerEndsAt: Date,
  timeZoneLabel: string,
): string {
  const { weekday, date, time } = formatDisplayParts(offerEndsAt);
  return `${weekday} ${date} at ${time} ${timeZoneLabel}`;
}
