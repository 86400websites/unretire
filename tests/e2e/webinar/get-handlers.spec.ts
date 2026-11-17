import { test, expect } from "../fixtures";
import { GET as joinGet } from "../../../src/app/conversation/join/route";
import { GET as calendarGet } from "../../../src/app/conversation/calendar.ics/route";

/**
 * Sprint S6.1 — the two GET handlers of the funnel, called directly.
 * FEATURE-LIST lines PG-014 and PR-008.
 *
 * WHY THIS IS A FUNCTION-LEVEL SPEC. The Preview keeps a webinar configured
 * for good, so the HTTP tests of the dormant state skip there: nothing that
 * runs in CI would notice if /conversation/join lost its dormant check. And
 * that is the state Production is in from the day this ships — it holds a
 * real Zoom address and no start. So the handlers are imported and called
 * here with obviously fake values, set in beforeEach and put back in
 * afterEach (Playwright reuses a worker across files).
 *
 * The redirect is never followed and its address is never printed: every
 * assertion on it is reduced to a boolean first.
 */

const ZOOM = "https://zoom.us/j/0000000000";
const FUTURE_START = "2099-12-10T16:00:00+02:00";
const PAST_START = "2020-01-02T16:00:00+02:00";

const ENV_NAMES = [
  "WEBINAR_STARTS_AT",
  "WEBINAR_OFFER_ENDS_AT",
  "WEBINAR_OFFER_CODE",
  "WEBINAR_ZOOM_URL",
  "WEBINAR_REPLAY_URL",
];

const realError = console.error;
const realWarn = console.warn;
const savedEnv = new Map<string, string | undefined>();

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  // A malformed value is reported by NAME; keep that out of the test output.
  console.error = () => {};
  console.warn = () => {};
});

test.afterEach(() => {
  for (const name of ENV_NAMES) {
    const value = savedEnv.get(name);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  savedEnv.clear();
  console.error = realError;
  console.warn = realWarn;
});

/** What a test may know about a redirect, without ever holding its address. */
function redirectFacts(response: Response) {
  const location = response.headers.get("location");
  return {
    hasLocation: location !== null,
    isHttps: location?.startsWith("https://") ?? false,
    isTheConfiguredAddress: location === ZOOM,
  };
}

test.describe("PG-014 — with no start configured, the two GET routes do not exist", () => {
  test("PR-008 join answers 404 with no address while a Zoom address IS set (Production's state)", () => {
    process.env.WEBINAR_ZOOM_URL = ZOOM;

    const response = joinGet();

    expect(response.status).toBe(404);
    expect(redirectFacts(response).hasLocation).toBe(false);
  });

  test("the calendar file answers 404 while a Zoom address is set", async () => {
    process.env.WEBINAR_ZOOM_URL = ZOOM;

    const response = calendarGet();

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  for (const start of ["tomorrow", "2099-12-10T16:07:00+02:00", "   "]) {
    test(`a start that is not valid (${JSON.stringify(start)}) is the same as no start`, () => {
      process.env.WEBINAR_ZOOM_URL = ZOOM;
      process.env.WEBINAR_STARTS_AT = start;

      expect(joinGet().status).toBe(404);
      expect(redirectFacts(joinGet()).hasLocation).toBe(false);
      expect(calendarGet().status).toBe(404);
    });
  }

  test("a start with no Zoom address is dormant too", () => {
    process.env.WEBINAR_STARTS_AT = FUTURE_START;

    expect(joinGet().status).toBe(404);
    expect(calendarGet().status).toBe(404);
  });

  test("a start with a look-alike Zoom host is dormant too", () => {
    process.env.WEBINAR_STARTS_AT = FUTURE_START;
    process.env.WEBINAR_ZOOM_URL = "https://zoom.us.example.com/j/0000000000";

    const response = joinGet();

    expect(response.status).toBe(404);
    expect(redirectFacts(response).hasLocation).toBe(false);
  });
});

test.describe("PR-008 — with a webinar configured", () => {
  for (const [label, start] of [
    ["before the start", FUTURE_START],
    ["after the start (people join late)", PAST_START],
  ] as const) {
    test(`join forwards with a 307 to the configured address, never stored — ${label}`, () => {
      process.env.WEBINAR_STARTS_AT = start;
      process.env.WEBINAR_ZOOM_URL = ZOOM;

      const response = joinGet();
      const facts = redirectFacts(response);

      expect(response.status).toBe(307);
      expect(facts.hasLocation).toBe(true);
      expect(facts.isHttps).toBe(true);
      expect(facts.isTheConfiguredAddress).toBe(true);
      expect(response.headers.get("cache-control")).toBe("no-store");
    });
  }

  test("the calendar file is a calendar, names the join page and never the Zoom address", async () => {
    process.env.WEBINAR_STARTS_AT = FUTURE_START;
    process.env.WEBINAR_ZOOM_URL = ZOOM;

    const response = calendarGet();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/calendar; charset=utf-8",
    );
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="[A-Za-z0-9-]+\.ics"$/,
    );
    expect(body.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(body).toContain("DTSTART:20991210T140000Z");
    expect(body).toContain("/conversation/join");
    expect(body.includes("zoom.us")).toBe(false);
  });
});
