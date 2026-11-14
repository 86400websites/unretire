import { test, expect } from "../fixtures";
import {
  WEBINAR_ENV_NAMES,
  assertWebinarEnv,
  parseOfferCode,
  parseOfferEndsAt,
  parseReplayUrl,
  parseStartsAt,
  parseZoomUrl,
  readWebinarEnv,
} from "../../../src/lib/webinar/env";
import {
  CAMPAIGN,
  formatDisplayParts,
  formatOfferDeadline,
  getWebinar,
} from "../../../src/lib/webinar/config";

/**
 * Sprint S6.1 — the five WEBINAR_* values: the strict rules the BUILD applies,
 * the lenient read a REQUEST applies, and the display strings made from them.
 *
 * Asserted against the functions, as tests/e2e/security/redirect-guard.spec.ts
 * asserts the redirect guard, and for the same reason: the interesting cases
 * here cannot be reached through a deployment. A malformed value stops the
 * build, so no deployed page ever holds one; and the Zoom-address rule is a
 * security boundary (it is the site's only off-site redirect target) whose
 * hostile inputs must be tried directly, not hoped for.
 *
 * Every value below is fake: a far-future date, a zero-filled meeting number.
 * No real link, code or date belongs in this file.
 */

const START = "2029-12-13T16:00:00+02:00";
const OFFER_END = "2029-12-20T23:59:00+02:00";
const ZOOM = "https://zoom.us/j/0000000000";
const REPLAY = "https://www.youtube.com/watch?v=00000000000";
const CODE = "TESTCODE";

const ALL_VALID = {
  WEBINAR_STARTS_AT: START,
  WEBINAR_OFFER_ENDS_AT: OFFER_END,
  WEBINAR_OFFER_CODE: CODE,
  WEBINAR_ZOOM_URL: ZOOM,
  WEBINAR_REPLAY_URL: REPLAY,
};

/** A literal backslash, built from its character code — see redirect-guard.spec.ts. */
const BS = String.fromCharCode(92);

/** The message a strict read throws, or null when it does not throw. */
function failure(env: Record<string, string | undefined>): string | null {
  try {
    assertWebinarEnv(env);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "not an Error";
  }
}

test.describe("S6.1 env — each value is validated on its own", () => {
  test("WEBINAR_STARTS_AT must be ISO 8601 with an explicit offset, on the quarter-hour", () => {
    for (const good of [
      START,
      "2029-12-13T16:00+02:00",
      "2029-12-13T14:00:00Z",
      "2029-12-13T16:15:00+02:00",
      "2029-12-13T16:30:00.000+02:00",
      "2029-12-13T09:45:00-05:00",
      `  ${START}  `,
    ]) {
      expect(parseStartsAt(good), `"${good}" must be accepted`).not.toBeNull();
    }

    for (const bad of [
      "tomorrow",
      "2029-12-13",
      "2029-12-13T16:00:00", // no offset: the server's zone would decide
      "2029-12-13 16:00:00+02:00", // a space is not the ISO separator
      "2029-12-13T16:00:00+0200",
      "2029-12-13T16:00:00 +02:00",
      "13/12/2029 16:00",
      "2029-13-13T16:00:00+02:00", // month 13
      "2029-02-30T16:00:00+02:00", // Date.parse would roll this into March
      "2029-12-13T24:00:00+02:00",
      "2029-12-13T16:60:00+02:00",
      "2029-12-13T16:00:00+24:00",
      "2029-12-13T16:10:00+02:00", // not on the quarter-hour
      "2029-12-13T16:00:30+02:00", // seconds
      "2029-12-13T16:00:00.500+02:00", // a fraction of a second
      "1765634400000",
    ]) {
      expect(parseStartsAt(bad), `"${bad}" must be refused`).toBeNull();
    }
  });

  test("the offset is honoured: the same instant however it is written", () => {
    const utc = Date.UTC(2029, 11, 13, 14, 0, 0);
    expect(parseStartsAt(START)?.getTime()).toBe(utc);
    expect(parseStartsAt("2029-12-13T14:00:00Z")?.getTime()).toBe(utc);
    expect(parseStartsAt("2029-12-13T09:00:00-05:00")?.getTime()).toBe(utc);
    // A leap day that exists is accepted; one that does not is refused.
    expect(parseStartsAt("2028-02-29T10:00:00+02:00")).not.toBeNull();
    expect(parseStartsAt("2029-02-29T10:00:00+02:00")).toBeNull();
  });

  test("WEBINAR_OFFER_ENDS_AT needs the offset but not the quarter-hour", () => {
    expect(parseOfferEndsAt(OFFER_END)?.getTime()).toBe(
      Date.UTC(2029, 11, 20, 21, 59, 0),
    );
    expect(parseOfferEndsAt("2029-12-20T23:59:59+02:00")).not.toBeNull();
    for (const bad of [
      "Thursday at midnight",
      "2029-12-20",
      "2029-12-20T23:59",
    ]) {
      expect(parseOfferEndsAt(bad), `"${bad}" must be refused`).toBeNull();
    }
  });

  test("WEBINAR_OFFER_CODE is 3–40 letters, digits and hyphens", () => {
    for (const good of ["ABC", "TESTCODE", "conv1-2029", "a".repeat(40)]) {
      expect(parseOfferCode(good), `"${good}" must be accepted`).toBe(good);
    }
    for (const bad of [
      "AB",
      "a".repeat(41),
      "HAS SPACE",
      "under_score",
      "SAVE20%",
      "<b>X</b>",
      "CODE;",
    ]) {
      expect(parseOfferCode(bad), `"${bad}" must be refused`).toBeNull();
    }
  });

  test("WEBINAR_ZOOM_URL is https on zoom.us or a subdomain, and nothing else", () => {
    for (const good of [
      ZOOM,
      "https://us02web.zoom.us/j/0000000000?pwd=0000",
      "https://example.zoom.us/my/room",
      "HTTPS://ZOOM.US/j/0000000000",
    ]) {
      const parsed = parseZoomUrl(good);
      expect(parsed, `"${good}" must be accepted`).not.toBeNull();
      // What comes back is what a redirect may use: re-parse and re-check it.
      const host = new URL(parsed as string).host;
      expect(host === "zoom.us" || host.endsWith(".zoom.us")).toBe(true);
    }

    for (const bad of [
      "http://zoom.us/j/0000000000", // not https
      "//zoom.us/j/0000000000",
      "zoom.us/j/0000000000",
      "https://zoom.us.evil.example/j/0000000000",
      "https://evilzoom.us/j/0000000000",
      "https://zoom.us@evil.example/", // "zoom.us" is the USERNAME here
      "https://user:pass@zoom.us/j/0000000000", // credentials
      "https://user@zoom.us/j/0000000000",
      "https://evil.example/?next=https://zoom.us/j/0000000000",
      "https://evil.example/#@zoom.us",
      `https://evil.example${BS}@zoom.us/`,
      "https://zoom.us:8443/j/0000000000", // an unusual port is not the same host
      "https://zoom.us./j/0000000000",
      "javascript:alert(1)//zoom.us",
      "ftp://zoom.us/j/0000000000",
      "not a url",
    ]) {
      expect(parseZoomUrl(bad), `"${bad}" must be refused`).toBeNull();
    }
  });

  test("WEBINAR_REPLAY_URL is https with no credentials, on any host", () => {
    for (const good of [
      REPLAY,
      "https://youtu.be/00000000000",
      "https://vimeo.com/000000000",
      "https://example.zoom.us/rec/share/0000",
    ]) {
      expect(parseReplayUrl(good), `"${good}" must be accepted`).not.toBeNull();
    }
    for (const bad of [
      "http://www.youtube.com/watch?v=00000000000",
      "https://user:pass@www.youtube.com/watch?v=00000000000",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "www.youtube.com/watch?v=00000000000",
      "soon",
    ]) {
      expect(parseReplayUrl(bad), `"${bad}" must be refused`).toBeNull();
    }
  });
});

test.describe("S6.1 env — the build's strict read", () => {
  test("nothing set is a valid configuration: the funnel is dormant", () => {
    expect(failure({})).toBeNull();
    expect(readWebinarEnv({})).toEqual({
      values: {
        startsAt: null,
        offerEndsAt: null,
        offerCode: null,
        zoomUrl: null,
        replayUrl: null,
      },
      malformed: [],
    });
  });

  test("empty and whitespace-only values count as unset", () => {
    // Vercel stores a cleared field as an empty string; that must not read as
    // "set but malformed" and stop the next deployment.
    const blank = Object.fromEntries(
      WEBINAR_ENV_NAMES.map((name, index) => [name, index % 2 ? "" : "   "]),
    );
    expect(failure(blank)).toBeNull();
    expect(readWebinarEnv(blank).malformed).toEqual([]);
    expect(readWebinarEnv(blank).values.startsAt).toBeNull();
  });

  test("all five set and valid passes, and every value is read", () => {
    expect(failure(ALL_VALID)).toBeNull();
    const { values, malformed } = readWebinarEnv(ALL_VALID);
    expect(malformed).toEqual([]);
    expect(values.startsAt?.toISOString()).toBe("2029-12-13T14:00:00.000Z");
    expect(values.offerEndsAt?.toISOString()).toBe("2029-12-20T21:59:00.000Z");
    expect(values.offerCode).toBe(CODE);
    expect(values.zoomUrl).toBe(ZOOM);
    expect(values.replayUrl).toBe(REPLAY);
  });

  test("a malformed value throws, naming the VARIABLE and never the value", () => {
    const cases: Array<[string, string]> = [
      ["WEBINAR_STARTS_AT", "tomorrow"],
      ["WEBINAR_OFFER_ENDS_AT", "Thursday-at-midnight"],
      ["WEBINAR_OFFER_CODE", "NOT A CODE!"],
      ["WEBINAR_ZOOM_URL", "https://evil.example/j/5550001111"],
      ["WEBINAR_REPLAY_URL", "http://insecure.example/replay-5550002222"],
    ];
    for (const [name, value] of cases) {
      const message = failure({ ...ALL_VALID, [name]: value });
      expect(message, `${name} must stop the build`).not.toBeNull();
      expect(message).toContain(name);
      expect(message, `${name}: the value must not be printed`).not.toContain(
        value,
      );
      // Nor any other value that happens to be set — above all the Zoom one.
      for (const other of Object.values(ALL_VALID)) {
        expect(message).not.toContain(other);
      }
    }
  });

  test("every problem is reported in one message, not one per deploy", () => {
    const message = failure({
      WEBINAR_STARTS_AT: "tomorrow",
      WEBINAR_OFFER_CODE: "x",
      WEBINAR_ZOOM_URL: ZOOM,
    });
    expect(message).toContain("WEBINAR_STARTS_AT");
    expect(message).toContain("WEBINAR_OFFER_CODE");
    expect(message).not.toContain("WEBINAR_REPLAY_URL");
  });

  test("cross-field rule 1 — the offer must end after the webinar starts", () => {
    for (const offerEnd of [START, "2029-12-13T15:59:00+02:00"]) {
      const message = failure({
        ...ALL_VALID,
        WEBINAR_OFFER_ENDS_AT: offerEnd,
      });
      expect(message).toContain("WEBINAR_OFFER_ENDS_AT");
      expect(message).toContain("later than WEBINAR_STARTS_AT");
    }
    // One minute later is enough.
    expect(
      failure({
        ...ALL_VALID,
        WEBINAR_OFFER_ENDS_AT: "2029-12-13T16:01:00+02:00",
      }),
    ).toBeNull();
  });

  test("cross-field rule 2 — a start needs a valid Zoom address", () => {
    const unset = failure({ WEBINAR_STARTS_AT: START });
    expect(unset).toContain("WEBINAR_ZOOM_URL");
    expect(unset).toContain("must be set whenever WEBINAR_STARTS_AT is set");

    const blank = failure({ WEBINAR_STARTS_AT: START, WEBINAR_ZOOM_URL: "  " });
    expect(blank).toContain("WEBINAR_ZOOM_URL");

    const malformed = failure({
      WEBINAR_STARTS_AT: START,
      WEBINAR_ZOOM_URL: "https://evil.example/j/5550001111",
    });
    expect(malformed).toContain("WEBINAR_ZOOM_URL");
    expect(malformed).not.toContain("evil.example");
  });

  test("anything else may be set while the start is unset — simply dormant", () => {
    // Production holds WEBINAR_ZOOM_URL today with no start: that must build.
    expect(failure({ WEBINAR_ZOOM_URL: ZOOM })).toBeNull();
    expect(failure({ WEBINAR_OFFER_ENDS_AT: OFFER_END })).toBeNull();
    expect(failure({ WEBINAR_OFFER_CODE: CODE })).toBeNull();
    expect(failure({ WEBINAR_REPLAY_URL: REPLAY })).toBeNull();
    const { WEBINAR_STARTS_AT: _start, ...withoutStart } = ALL_VALID;
    void _start;
    expect(failure(withoutStart)).toBeNull();
    expect(readWebinarEnv(withoutStart).values.startsAt).toBeNull();
  });
});

test.describe("S6.1 env — a request's lenient read", () => {
  test("a malformed value is treated as unset and only its NAME is listed", () => {
    const read = readWebinarEnv({
      ...ALL_VALID,
      WEBINAR_OFFER_CODE: "NOT A CODE!",
      WEBINAR_REPLAY_URL: "http://insecure.example/replay",
    });
    expect(read.malformed).toEqual([
      "WEBINAR_OFFER_CODE",
      "WEBINAR_REPLAY_URL",
    ]);
    expect(read.values.offerCode).toBeNull();
    expect(read.values.replayUrl).toBeNull();
    // The valid values are untouched.
    expect(read.values.startsAt).not.toBeNull();
    expect(read.values.zoomUrl).toBe(ZOOM);
  });

  test("a malformed start leaves the funnel dormant rather than throwing", () => {
    const read = readWebinarEnv({
      ...ALL_VALID,
      WEBINAR_STARTS_AT: "tomorrow",
    });
    expect(read.malformed).toEqual(["WEBINAR_STARTS_AT"]);
    expect(read.values.startsAt).toBeNull();
  });

  test("an offer that ends before the start is dropped; the webinar stays", () => {
    const read = readWebinarEnv({ ...ALL_VALID, WEBINAR_OFFER_ENDS_AT: START });
    expect(read.malformed).toEqual(["WEBINAR_OFFER_ENDS_AT"]);
    expect(read.values.offerEndsAt).toBeNull();
    expect(read.values.startsAt).not.toBeNull();
  });

  test("a start with no usable Zoom address is dormant, never half-open", () => {
    // An open page whose "Join on Zoom" link has nowhere to go is worse than
    // a 404. Both shapes of the same mistake end the same way.
    for (const zoom of [undefined, "https://evil.example/j/5550001111"]) {
      const read = readWebinarEnv({ ...ALL_VALID, WEBINAR_ZOOM_URL: zoom });
      expect(read.malformed).toEqual(["WEBINAR_ZOOM_URL"]);
      expect(read.values.startsAt).toBeNull();
      expect(read.values.zoomUrl).toBeNull();
    }
  });
});

test.describe("S6.1 config — constants, the runtime read and the display strings", () => {
  // Playwright reuses a worker across files, so anything this block changes on
  // process.env or console is put back exactly as it was found.
  const saved = new Map<string, string | undefined>();
  const realError = console.error;
  let logged: string[] = [];

  test.beforeEach(() => {
    for (const name of WEBINAR_ENV_NAMES) {
      saved.set(name, process.env[name]);
      delete process.env[name];
    }
    logged = [];
    console.error = (...args: unknown[]) => {
      logged.push(args.map(String).join(" "));
    };
  });

  test.afterEach(() => {
    console.error = realError;
    for (const name of WEBINAR_ENV_NAMES) {
      const value = saved.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    saved.clear();
  });

  test("one campaign id, and the three tags the Mailchimp side is built on", () => {
    expect(CAMPAIGN.id).toBe("conv1");
    expect(CAMPAIGN.tags).toEqual({
      registered: "conv1-registered",
      toolkit: "conv1-toolkit",
      purchased: "purchased-course",
    });
    expect(CAMPAIGN.sessionMinutes).toBe(60);
    expect(CAMPAIGN.timeZone).toBe("Africa/Johannesburg");
  });

  test("getWebinar is dormant with nothing set, and logs nothing", () => {
    expect(getWebinar().startsAt).toBeNull();
    expect(logged).toEqual([]);
  });

  test("getWebinar reads valid values from the environment", () => {
    Object.assign(process.env, ALL_VALID);
    const webinar = getWebinar();
    expect(webinar.startsAt?.toISOString()).toBe("2029-12-13T14:00:00.000Z");
    expect(webinar.offerCode).toBe(CODE);
    expect(logged).toEqual([]);
  });

  test("getWebinar never throws on a malformed value, and logs the NAME only", () => {
    Object.assign(process.env, ALL_VALID, {
      WEBINAR_STARTS_AT: "tomorrow",
      WEBINAR_ZOOM_URL: "https://evil.example/j/5550001111",
    });
    const webinar = getWebinar();
    expect(webinar.startsAt).toBeNull();
    expect(webinar.zoomUrl).toBeNull();

    const output = logged.join("\n");
    expect(output).toContain("WEBINAR_STARTS_AT");
    expect(output).toContain("WEBINAR_ZOOM_URL");
    for (const value of [
      "tomorrow",
      "evil.example",
      "5550001111",
      ...Object.values(ALL_VALID),
    ]) {
      expect(output, `a value reached the log`).not.toContain(value);
    }
  });

  test("the display tokens follow the owner's own style, in the campaign's zone", () => {
    // The owner writes "Thursday 10 December" and a 24-hour time.
    const start = parseStartsAt(START) as Date;
    expect(formatDisplayParts(start)).toEqual({
      weekday: "Thursday",
      date: "13 December",
      time: "16:00",
    });
    // The zone is the campaign's, not the offset the value was typed in and
    // not the machine's: 14:00 UTC is 16:00 in Johannesburg.
    expect(
      formatDisplayParts(parseStartsAt("2029-12-13T14:00:00Z") as Date).time,
    ).toBe("16:00");
    // Late in the UTC day the Johannesburg DATE has already moved on.
    expect(
      formatDisplayParts(parseStartsAt("2029-12-13T23:30:00Z") as Date),
    ).toEqual({ weekday: "Friday", date: "14 December", time: "01:30" });
    // A single-digit day has no leading zero; midnight is 00:00, never 24:00.
    expect(
      formatDisplayParts(parseStartsAt("2029-12-06T00:00:00+02:00") as Date),
    ).toEqual({ weekday: "Thursday", date: "6 December", time: "00:00" });
    expect(
      formatDisplayParts(parseStartsAt("2029-12-06T09:15:00+02:00") as Date)
        .time,
    ).toBe("09:15");
  });

  test("{offer deadline} is weekday, date, 'at', the clock time and the label", () => {
    const offerEnd = parseOfferEndsAt(OFFER_END) as Date;
    // The label is approved copy and is supplied by the caller.
    expect(formatOfferDeadline(offerEnd, "SAST")).toBe(
      "Thursday 20 December at 23:59 SAST",
    );
  });
});
