import { NextRequest } from "next/server";
import { test, expect } from "../fixtures";
import { POST } from "../../../src/app/report/reset/route";
import {
  REPORT_COOKIE,
  reportConfig,
  sessionToken,
} from "../../../src/lib/webinar/report-auth";

/**
 * Sprint S6.2 — POST /report/reset ("Start again for a new webinar"), called
 * directly, with NO request ever leaving this machine. FEATURE-LIST line
 * FM-013. Every branch of the route's order, and above all the two the Codex
 * review of S6.2 asked for (Finding 1): a form from another campaign, and a
 * form whose numbers are no longer the database's, delete nothing.
 *
 * WHY HERE AND NOT ON THE PREVIEW. A reset that reaches the password uses one
 * of five tries per ten minutes per address, and report-page.spec.ts already
 * spends three of them on the deployed Preview (its "THE RESET'S LIMIT"),
 * one of them the stale reset only the database can refuse. Here
 * `globalThis.fetch` is replaced by a stub that answers three requests only —
 * the rate limiter's increment function, its housekeeping sweep and the reset
 * function — and COUNTS anything else; the test then fails on that count.
 *
 * Every configuration value is an obviously fake string, set in beforeEach
 * and put back in afterEach — Playwright reuses a worker across files.
 *
 * Checked after EVERY test: no request was made that the test did not script;
 * every answer is bodiless, never cached, and any redirect is relative and
 * stays on /report; no log line carries the password.
 */

const SUPABASE = "https://dummy-project-ref.supabase.co";
const ROUTE = "http://localhost:3000/report/reset";
/** This site, as src/lib/auth/safe-origin.ts sees it outside Production. */
const OWN = "http://localhost:3000";
const RESET = `${SUPABASE}/rest/v1/rpc/reset_campaign_report`;
const CALLER_IP = "203.0.113.9";
const PASSWORD = "dummy-report-password-not-real";
const SECRET = "dummy-report-secret-not-a-real-one-0123456789";
/** A `since` as PostgREST writes a timestamptz — what the page puts in the form. */
const SINCE = "2026-11-20T20:47:25.123456+00:00";

const ENV_NAMES = [
  "REPORT_PASSWORD",
  "REPORT_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  // What this site's own hosts are: all unset here, so only localhost counts.
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
];

type Answer = {
  status: number;
  location: string | null;
  cacheControl: string | null;
  text: string;
};

const realFetch = globalThis.fetch;
const realError = console.error;
const realInfo = console.info;
const savedEnv = new Map<string, string | undefined>();
/** Every upstream request, in order: limiter, sweep or reset. */
let sequence: string[] = [];
/** The bodies sent to reset_campaign_report, in order. */
let resets: Record<string, unknown>[] = [];
let unscripted = 0;
let logged: string[] = [];
let answered: Answer[] = [];

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** The limiter's database: by default, the caller's first try. */
let limiter: () => Response = () => json(200, 1);
/** The reset function's answer: by default, it reset. */
let database: () => Response = () =>
  json(200, [{ reset: true, visits: 13, people: 6 }]);

/** The fields the page's own form sends; `undefined` leaves one out. */
function pageForm(
  overrides: Record<string, string | undefined> = {},
): Record<string, string> {
  const fields: Record<string, string | undefined> = {
    campaign: "conv1",
    since: SINCE,
    password: PASSWORD,
    ...overrides,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
}

/**
 * One reset, as the browser posts the form: signed in and from this site
 * unless the test says otherwise (null leaves the header out).
 */
async function reset(
  fields: Record<string, string>,
  {
    cookie = `${REPORT_COOKIE}=${sessionToken(reportConfig()!)}`,
    origin = OWN,
  }: { cookie?: string | null; origin?: string | null } = {},
): Promise<Answer> {
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    "x-forwarded-for": CALLER_IP,
  };
  if (cookie !== null) headers.cookie = cookie;
  if (origin !== null) headers.origin = origin;
  const response = await POST(
    new NextRequest(ROUTE, {
      method: "POST",
      headers,
      body: new URLSearchParams(fields).toString(),
    }),
  );
  const answer = {
    status: response.status,
    location: response.headers.get("location"),
    cacheControl: response.headers.get("cache-control"),
    text: await response.text(),
  };
  answered.push(answer);
  return answer;
}

function seeOther(location: string) {
  return {
    status: 303,
    location,
    cacheControl: "no-store",
    text: "",
  };
}

/** The requests made, without the limiter's housekeeping. */
function upstream(): string[] {
  return sequence.filter((step) => step !== "sweep");
}

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  process.env.REPORT_PASSWORD = PASSWORD;
  process.env.REPORT_SECRET = SECRET;
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE;
  process.env.SUPABASE_SECRET_KEY = "dummy-not-a-real-secret";

  sequence = [];
  resets = [];
  unscripted = 0;
  logged = [];
  answered = [];
  limiter = () => json(200, 1);
  database = () => json(200, [{ reset: true, visits: 13, people: 6 }]);

  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  console.info = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };

  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string" || input instanceof URL
        ? String(input)
        : input.url;
    const method = init?.method ?? "GET";
    if (url.startsWith(`${SUPABASE}/rest/v1/rpc/increment_rate_limit`)) {
      sequence.push("limiter");
      return limiter();
    }
    if (
      url.startsWith(`${SUPABASE}/rest/v1/rate_limits`) &&
      method === "DELETE"
    ) {
      sequence.push("sweep");
      return new Response(null, { status: 204 });
    }
    if (url.startsWith(RESET) && method === "POST") {
      sequence.push("reset");
      resets.push(init?.body ? JSON.parse(String(init.body)) : {});
      return database();
    }
    unscripted += 1;
    throw new Error("unscripted network call");
  }) as typeof fetch;
});

test.afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
  console.info = realInfo;
  for (const [name, value] of savedEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  savedEnv.clear();

  expect(unscripted, "a request was made that no test scripted").toBe(0);
  for (const answer of answered) {
    expect(answer.cacheControl, `the ${answer.status} must not be cached`).toBe(
      "no-store",
    );
    expect(answer.text, `the ${answer.status} must have no body`).toBe("");
    if (answer.location !== null) {
      expect(
        answer.location === "/report" || answer.location.startsWith("/report?"),
        `${answer.location} is not a relative address on /report`,
      ).toBe(true);
    }
  }
  for (const line of logged) {
    expect(line, "the password reached a log line").not.toContain(PASSWORD);
  }
});

test.describe("FM-013 — the reset deletes only the numbers its page showed (Codex review of S6.2, Finding 1)", () => {
  test("FM-013 the page's own form resets: the right password, this campaign and the since the page showed — one reset for this campaign and that since, then /report?r=done", async () => {
    expect(await reset(pageForm())).toEqual(seeOther("/report?r=done"));
    expect(upstream()).toEqual(["limiter", "reset"]);
    expect(resets).toEqual([{ p_campaign: "conv1", p_since: SINCE }]);
    expect(logged).toEqual([
      "Webinar report reset: 13 visits and 6 people deleted.",
    ]);
  });

  test("FM-013 the form of a campaign with no row at all sends an empty since, and the database is asked with since null", async () => {
    database = () => json(200, [{ reset: true, visits: 0, people: 0 }]);
    expect(await reset(pageForm({ since: "" }))).toEqual(
      seeOther("/report?r=done"),
    );
    expect(resets).toEqual([{ p_campaign: "conv1", p_since: null }]);
  });

  test("FM-013 a form for another campaign deletes nothing — the campaign switch: ?r=stale, and nothing is sent to the database", async () => {
    for (const campaign of ["conv2", "", "CONV1", "conv1 "]) {
      expect(
        await reset(pageForm({ campaign })),
        `campaign ${JSON.stringify(campaign)}`,
      ).toEqual(seeOther("/report?r=stale"));
    }
    expect(resets, "a reset reached the database").toEqual([]);
  });

  test("FM-013 a form from before this check — no campaign, no since — deletes nothing: ?r=stale", async () => {
    for (const [label, form] of [
      ["neither", pageForm({ campaign: undefined, since: undefined })],
      ["no campaign", pageForm({ campaign: undefined })],
      ["no since", pageForm({ since: undefined })],
    ] as const) {
      expect(await reset(form), label).toEqual(seeOther("/report?r=stale"));
    }
    expect(resets, "a reset reached the database").toEqual([]);
  });

  test("FM-013 a since the database did not write deletes nothing: ?r=stale, and nothing is sent", async () => {
    for (const since of [
      "yesterday",
      "2026-11-20",
      `${SINCE}; select 1`,
      "2026-11-20T20:47:25.1234567+00:00",
      `${SINCE}${"0".repeat(20)}`,
    ]) {
      expect(await reset(pageForm({ since })), since).toEqual(
        seeOther("/report?r=stale"),
      );
    }
    expect(resets, "a reset reached the database").toEqual([]);
  });

  test("FM-013 when the counting began at another time — a reset elsewhere since the page opened — the database deletes nothing: ?r=stale", async () => {
    database = () => json(200, [{ reset: false, visits: 0, people: 0 }]);
    expect(await reset(pageForm())).toEqual(seeOther("/report?r=stale"));
    expect(resets).toEqual([{ p_campaign: "conv1", p_since: SINCE }]);
    expect(logged).toEqual([
      "Webinar report not reset: the page was out of date.",
    ]);
  });

  test("FM-013 a database that fails, or answers without saying it reset, is ?r=error — never done", async () => {
    for (const [label, answer] of [
      [
        "a failure",
        () =>
          json(500, { code: "XX000", message: "S62-UPSTREAM", details: "" }),
      ],
      [
        "the old function's answer",
        () => json(200, [{ visits: 3, people: 1 }]),
      ],
    ] as const) {
      database = answer;
      expect(await reset(pageForm()), label).toEqual(
        seeOther("/report?r=error"),
      );
    }
    expect(logged.join("\n")).not.toContain("S62-UPSTREAM");
  });

  test("FM-013 the order: the session, the Origin, the limiter and the password all come before the page's campaign — and none of them reaches the database", async () => {
    const stale = pageForm({ campaign: "conv2" });

    expect(await reset(stale, { cookie: null }), "no session").toEqual(
      seeOther("/report"),
    );
    expect(
      await reset(stale, { origin: "https://evil.example" }),
      "another site",
    ).toEqual({
      status: 403,
      location: null,
      cacheControl: "no-store",
      text: "",
    });
    expect(
      upstream(),
      "the limiter was asked before the session or the Origin",
    ).toEqual([]);

    // A sixth try is refused by the limit even with a wrong password and
    // another campaign: the limit comes before both.
    limiter = () => json(200, 6);
    expect(
      await reset({ ...stale, password: "a-wrong-password-123" }),
      "a sixth try in the window",
    ).toEqual(seeOther("/report?r=busy"));
    limiter = () => json(200, 1);

    expect(
      await reset({ ...stale, password: "a-wrong-password-123" }),
      "a wrong password",
    ).toEqual(seeOther("/report?r=wrong"));
    expect(resets, "a reset reached the database").toEqual([]);
  });

  test("FM-013 with the report switched off, nothing is done: back to /report", async () => {
    delete process.env.REPORT_PASSWORD;
    expect(
      await reset(pageForm(), { cookie: `${REPORT_COOKIE}=anything` }),
    ).toEqual(seeOther("/report"));
    expect(sequence).toEqual([]);
  });
});
