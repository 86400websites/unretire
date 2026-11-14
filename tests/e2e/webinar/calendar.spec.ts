import { test, expect } from "../fixtures";
import {
  asciiFilename,
  buildIcs,
  googleCalendarUrl,
  joinUrl,
} from "../../../src/lib/webinar/calendar";

/**
 * Sprint S6.1 — the calendar file and the Google Calendar link.
 *
 * A calendar file that is "nearly valid" fails silently and differently in
 * every app: one drops the description, another refuses the import, a third
 * shows the event an hour out. None of that is visible to an HTTP test that
 * checks for a 200 and a content type, so the bytes themselves are asserted
 * here against RFC 5545 — line endings, folding by OCTET, escaping, UTC times.
 *
 * It also holds the allowed half of the header lesson from S5.1c: a file name
 * derived from copy must be ASCII, proven by actually building the header.
 */

const SITE = "https://www.unretireproject.com";
const JOIN = `${SITE}/conversation/join`;
const START = new Date("2029-12-13T14:00:00.000Z");
const NOW = new Date("2026-11-13T09:30:15.000Z");
const SUMMARY = "When Work No Longer Defines You, What Does?";
const DESCRIPTION = [
  "One hour to work out what defines you once work no longer does.",
  "Join on Zoom",
  JOIN,
  "Keep a pen and paper handy. Microphones stay off, the chat is where we talk, and taking part is up to you.",
].join("\n");

const EVENT = {
  start: START,
  sessionMinutes: 60,
  summary: SUMMARY,
  description: DESCRIPTION,
  site: SITE,
};

/** Physical lines, exactly as a calendar app receives them. */
function physicalLines(ics: string): string[] {
  expect(ics.endsWith("\r\n"), "the file must end with CRLF").toBe(true);
  return ics.slice(0, -2).split("\r\n");
}

/** RFC 5545 §3.1 unfolding: a line starting with a space continues the last. */
function unfold(ics: string): string[] {
  const logical: string[] = [];
  for (const line of physicalLines(ics)) {
    if (line.startsWith(" ") && logical.length > 0) {
      logical[logical.length - 1] += line.slice(1);
    } else {
      logical.push(line);
    }
  }
  return logical;
}

/** The value of one property, unfolded and still escaped. */
function property(ics: string, name: string): string {
  const matches = unfold(ics).filter((line) => line.startsWith(`${name}:`));
  expect(matches, `exactly one ${name}`).toHaveLength(1);
  return matches[0].slice(name.length + 1);
}

/** RFC 5545 §3.3.11 TEXT unescaping. */
function unescapeText(value: string): string {
  return value.replace(/\\([\\;,nN])/g, (_, character: string) =>
    character === "n" || character === "N" ? "\n" : character,
  );
}

const BS = String.fromCharCode(92);

test.describe("S6.1 calendar — the .ics file is valid iCalendar", () => {
  test("CRLF line endings everywhere, and no bare CR or LF inside a line", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    for (const line of physicalLines(ics)) {
      expect(line).not.toContain("\n");
      expect(line).not.toContain("\r");
      expect(line.length, "no empty lines").toBeGreaterThan(0);
    }
    // The description's own line breaks became the two characters "\n".
    expect(ics).toContain(`${BS}n`);
  });

  test("the envelope and the required properties are all present, once", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    const lines = unfold(ics);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines[lines.length - 1]).toBe("END:VCALENDAR");
    expect(property(ics, "VERSION")).toBe("2.0");
    expect(property(ics, "PRODID").length).toBeGreaterThan(0);
    expect(lines.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(1);
    expect(lines.filter((line) => line === "END:VEVENT")).toHaveLength(1);
    expect(lines.indexOf("BEGIN:VEVENT")).toBeLessThan(
      lines.indexOf("END:VEVENT"),
    );
    expect(property(ics, "UID")).toMatch(/^[^\s@]+@www\.unretireproject\.com$/);
  });

  test("times are UTC with a Z, and there is no VTIMEZONE", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    expect(property(ics, "DTSTART")).toBe("20291213T140000Z");
    // The session length decides the end.
    expect(property(ics, "DTEND")).toBe("20291213T150000Z");
    expect(
      property(buildIcs({ ...EVENT, sessionMinutes: 90, now: NOW }), "DTEND"),
    ).toBe("20291213T153000Z");
    expect(ics).not.toContain("VTIMEZONE");
    expect(ics).not.toContain("TZID");
  });

  test("DTSTAMP comes from the injected clock, so the output is deterministic", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    expect(property(ics, "DTSTAMP")).toBe("20261113T093015Z");
    expect(buildIcs({ ...EVENT, now: new Date(NOW) })).toBe(ics);

    const later = buildIcs({
      ...EVENT,
      now: new Date("2027-01-02T03:04:05Z"),
    });
    expect(property(later, "DTSTAMP")).toBe("20270102T030405Z");
    // Nothing but the stamp moved — in particular not the UID, so opening the
    // file a second time updates the one event instead of adding another.
    expect(property(later, "UID")).toBe(property(ics, "UID"));
    expect(later.replace("20270102T030405Z", "20261113T093015Z")).toBe(ics);
  });

  test("a different start is a different event", () => {
    const moved = buildIcs({
      ...EVENT,
      start: new Date("2029-12-14T14:00:00Z"),
      now: NOW,
    });
    expect(property(moved, "UID")).not.toBe(
      property(buildIcs({ ...EVENT, now: NOW }), "UID"),
    );
  });

  test("no line is longer than 75 OCTETS, and unfolding restores the text", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    const lines = physicalLines(ics);
    for (const line of lines) {
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    }
    // The description is far longer than one line, so folding really happened.
    expect(lines.some((line) => line.startsWith(" "))).toBe(true);
    expect(unescapeText(property(ics, "DESCRIPTION"))).toBe(DESCRIPTION);
    expect(unescapeText(property(ics, "SUMMARY"))).toBe(SUMMARY);
  });

  test("folding counts octets, not characters, and never splits a character", () => {
    // Curly marks are three octets each, an emoji four (and two UTF-16 units).
    // Seventy of them are 70 characters and 210+ octets: a fold that counted
    // characters would emit one over-long line.
    const curly = "’".repeat(70);
    const emoji = "🎉".repeat(40);
    const description = `${curly}\n${emoji} done`;
    const ics = buildIcs({ ...EVENT, description, now: NOW });
    for (const line of physicalLines(ics)) {
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
      // A split surrogate pair does not survive an encode/decode round trip.
      expect(Buffer.from(line, "utf8").toString("utf8")).toBe(line);
    }
    expect(unescapeText(property(ics, "DESCRIPTION"))).toBe(description);
  });

  test("TEXT values are escaped: backslash, semicolon, comma, line break", () => {
    const summary = `Work; rest, and a back${BS}slash`;
    const description = `one, two; three${BS}four\r\nfive\nsix`;
    const ics = buildIcs({ ...EVENT, summary, description, now: NOW });
    expect(property(ics, "SUMMARY")).toBe(
      `Work${BS}; rest${BS}, and a back${BS}${BS}slash`,
    );
    expect(property(ics, "DESCRIPTION")).toBe(
      `one${BS}, two${BS}; three${BS}${BS}four${BS}nfive${BS}nsix`,
    );
    // A value cannot smuggle in a property of its own.
    const injected = buildIcs({
      ...EVENT,
      summary: "Title\r\nATTENDEE:mailto:someone@example.com",
      now: NOW,
    });
    expect(
      unfold(injected).filter((line) => line.startsWith("ATTENDEE")),
    ).toEqual([]);
  });

  test("the location and the link are the site's own join address", () => {
    const ics = buildIcs({ ...EVENT, now: NOW });
    expect(unescapeText(property(ics, "LOCATION"))).toBe(JOIN);
    expect(property(ics, "URL")).toBe(JOIN);
    // A trailing slash on the origin does not produce a double slash.
    expect(joinUrl(`${SITE}/`)).toBe(JOIN);
    expect(joinUrl(` ${SITE}// `)).toBe(JOIN);
    expect(
      property(buildIcs({ ...EVENT, site: `${SITE}/`, now: NOW }), "URL"),
    ).toBe(JOIN);
  });

  test("a Preview or local origin is used as given", () => {
    const local = buildIcs({
      ...EVENT,
      site: "http://localhost:3000",
      now: NOW,
    });
    expect(property(local, "URL")).toBe(
      "http://localhost:3000/conversation/join",
    );
    expect(property(local, "UID")).toMatch(/@localhost:3000$/);
    // An origin that cannot be parsed still yields a file, not a crash.
    expect(() => buildIcs({ ...EVENT, site: "", now: NOW })).not.toThrow();
  });
});

test.describe("S6.1 calendar — the Google Calendar link", () => {
  test("it carries the same event, on Google's own host", () => {
    const url = new URL(googleCalendarUrl(EVENT));
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.pathname).toBe("/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe(SUMMARY);
    expect(url.searchParams.get("dates")).toBe(
      "20291213T140000Z/20291213T150000Z",
    );
    expect(url.searchParams.get("details")).toBe(DESCRIPTION);
    expect(url.searchParams.get("location")).toBe(JOIN);
  });

  test("copy cannot break out of its parameter", () => {
    const hostile = "A & B = C # D ? E\n&location=https://evil.example";
    const url = new URL(googleCalendarUrl({ ...EVENT, summary: hostile }));
    expect(url.searchParams.get("text")).toBe(hostile);
    expect(url.searchParams.getAll("location")).toEqual([JOIN]);
    expect(url.hash).toBe("");
  });
});

test.describe("S6.1 calendar — a file name that is safe in a header", () => {
  test("copy with an em-dash and curly quotes becomes plain ASCII", () => {
    const fromCopy = asciiFilename(
      "You’ll leave with: “what do you do?” — one hour",
    );
    expect(fromCopy).toMatch(/^[A-Za-z0-9-]+$/);
    expect(fromCopy).toBe("You-ll-leave-with-what-do-you-do-one-hour");
    expect(asciiFilename(SUMMARY)).toBe(
      "When-Work-No-Longer-Defines-You-What-Does",
    );
    expect(asciiFilename("Café à la crème")).toBe("Cafe-a-la-creme");
  });

  test("the header it is used in can actually be built", () => {
    // The allowed half. The raw copy throws — that is the S5.1c crash — and
    // the sanitised name does not.
    const raw = "Module 1 — worksheet";
    expect(
      () => new Headers({ "Content-Disposition": `inline; filename="${raw}"` }),
    ).toThrow();
    const safe = `${asciiFilename(raw)}.ics`;
    const headers = new Headers({
      "Content-Disposition": `attachment; filename="${safe}"`,
    });
    expect(headers.get("Content-Disposition")).toBe(
      'attachment; filename="Module-1-worksheet.ics"',
    );
  });

  test("nothing usable falls back, and the result is bounded", () => {
    expect(asciiFilename("")).toBe("event");
    expect(asciiFilename("— “ ” …")).toBe("event");
    expect(asciiFilename("…", "conversation")).toBe("conversation");
    const long = asciiFilename("word ".repeat(100));
    expect(long.length).toBeLessThanOrEqual(80);
    expect(long).toMatch(/^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/);
  });
});
