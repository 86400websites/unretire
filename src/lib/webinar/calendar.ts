/**
 * The webinar's calendar file and its Google Calendar link — Sprint S6.1.
 *
 * Pure text in, pure text out, and no imports: the caller supplies the start,
 * the session length, the approved summary and description, the site's own
 * origin and (for the file) the current time, so every byte this produces can
 * be asserted in tests/e2e/webinar/calendar.spec.ts without a server.
 *
 * THE ONE RULE THAT MATTERS HERE: the event points at {site}/conversation/join
 * and never at the Zoom address. A calendar entry is copied, forwarded and
 * synced to other people's devices for as long as it exists; the join route is
 * the single place that knows the real address, so changing the meeting later
 * is one Vercel value and every calendar entry already out there keeps
 * working. Nothing in this file is given the Zoom address at all.
 */

export type CalendarEvent = {
  start: Date;
  sessionMinutes: number;
  /** Approved copy — the event's name. */
  summary: string;
  /** Approved copy — plain text; "\n" separates lines. */
  description: string;
  /** The site's own origin, for example the value of siteOrigin(). */
  site: string;
};

/** {site}/conversation/join — the event's location and its link. */
export function joinUrl(site: string): string {
  return `${site.trim().replace(/\/+$/, "")}/conversation/join`;
}

/** UTC in the iCalendar basic form: 20291213T140000Z. */
function utcStamp(instant: Date): string {
  return instant
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function endOf(event: Pick<CalendarEvent, "start" | "sessionMinutes">): Date {
  return new Date(event.start.getTime() + event.sessionMinutes * 60_000);
}

/**
 * RFC 5545 §3.3.11 TEXT escaping: backslash, semicolon and comma are escaped,
 * and a line break becomes the two characters "\n". Backslash goes first, or
 * the escapes added afterwards would be escaped again.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Octets a code point takes in UTF-8. */
function utf8Length(codePoint: number): number {
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

/**
 * RFC 5545 §3.1 line folding. A content line is at most 75 OCTETS, not 75
 * characters, and a continuation line starts with one space that counts
 * toward its own 75. Counting characters would be wrong the moment the copy
 * contains a curly apostrophe (three octets), and splitting by octet could
 * cut a character in half — so this walks whole code points and measures
 * each one.
 */
function fold(line: string): string[] {
  const folded: string[] = [];
  let current = "";
  let octets = 0;
  for (const character of line) {
    const size = utf8Length(character.codePointAt(0) ?? 0);
    if (octets + size > 75) {
      folded.push(current);
      current = " ";
      octets = 1;
    }
    current += character;
    octets += size;
  }
  folded.push(current);
  return folded;
}

/** The host part of the site, for the UID. Never throws. */
function uidDomain(site: string): string {
  try {
    return new URL(site).host || "conversation";
  } catch {
    return "conversation";
  }
}

/**
 * A complete, valid iCalendar file for the webinar.
 *
 *   • CRLF line endings throughout, including after the last line.
 *   • UTC times with a trailing "Z" and therefore no VTIMEZONE block: an
 *     instant in UTC is unambiguous in every calendar app, and each app shows
 *     it in its owner's own zone.
 *   • DTSTAMP comes from the injected `now`, so the output is deterministic.
 *   • The UID is stable for a given start and site, so opening the file twice
 *     updates the one event instead of adding a second.
 *   • LOCATION and URL are both {site}/conversation/join.
 */
export function buildIcs(event: CalendarEvent & { now: Date }): string {
  const join = joinUrl(event.site);
  const start = utcStamp(event.start);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UnRetire//Conversation//EN",
    "BEGIN:VEVENT",
    `UID:conversation-${start}@${uidDomain(event.site)}`,
    `DTSTAMP:${utcStamp(event.now)}`,
    `DTSTART:${start}`,
    `DTEND:${utcStamp(endOf(event))}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(join)}`,
    // URL is a URI value, not TEXT (RFC 5545 §3.8.4.6), so it is not escaped.
    `URL:${join}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.flatMap(fold).join("\r\n") + "\r\n";
}

/**
 * The "Add to Google Calendar" link: Google's own event-template address with
 * the same summary, description, times and location as the file above.
 * `URLSearchParams` does the encoding, so nothing in the copy can break out
 * of its parameter.
 */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${utcStamp(event.start)}/${utcStamp(endOf(event))}`,
    details: event.description,
    location: joinUrl(event.site),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * A file-name stem that is safe inside an HTTP header.
 *
 * A header value may only contain characters up to U+00FF: anything beyond
 * throws inside the Response constructor. An em-dash in a Content-Disposition
 * file name did exactly that to the worksheet route in S5.1c, and every
 * download answered 500. The approved copy is full of em-dashes and curly
 * quotes, so any name derived from it goes through here first.
 *
 * Returns letters, digits and single hyphens only — no dot, no quote, no
 * space — so the caller can append its own extension and quote the result
 * without escaping anything.
 */
export function asciiFilename(text: string, fallback = "event"): string {
  const stem = text
    // Split an accented letter into the letter plus its mark, then drop the mark.
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return stem || fallback;
}
