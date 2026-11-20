import { createHmac } from "node:crypto";
import { test, expect } from "../fixtures";
import {
  personCode,
  readReport,
  recordArrival,
  recordSignup,
  resetReport,
} from "../../../src/lib/webinar/report-store";
import { SOURCE_KEYS } from "../../../src/lib/webinar/sources";

/**
 * Sprint S6.2 — the webinar report's data (src/lib/webinar/report-store.ts),
 * every request it makes, with NO request ever leaving this machine.
 * FEATURE-LIST lines (drafts until the owner approves them at Gate B):
 *   IN-009  the registration count: one keyed code per person, the source the
 *           sign-up carried, and test addresses never counted (recordSignup,
 *           personCode);
 *   PR-010  a counted visit is stored as a campaign id and a source key and
 *           nothing else (recordArrival);
 *   PG-016  the report's numbers come from one aggregate call (readReport);
 *   FM-013  "Start again for a new webinar": one call deletes the campaign's
 *           counted visits and people, and is never retried (resetReport).
 *           The owner's reset took the place of the report's two boxes at
 *           Gate B (PROJECT-STATUS D-65) and keeps their ID.
 *
 * As in conversation-route.spec.ts, `globalThis.fetch` is replaced before
 * every test by a stub that records each request and answers only what the
 * test scripted — anything else is counted, and afterEach fails the test on
 * that count — and every configuration value is an obviously fake string,
 * put back in afterEach. The Supabase client itself is the real one, so what
 * is asserted below is what @supabase/postgrest-js really sends for each
 * call: the URL and query, the method, the body, the Prefer header and the
 * abort signal.
 *
 * PRIVACY IS CHECKED AFTER EVERY TEST: no request body and no log line —
 * console.error, warn, info or log — may carry the address or either half of
 * it, the report secret, the service key or a word of what the database said.
 */

const SUPABASE = "https://dummy-project-ref.supabase.co";
const REST = `${SUPABASE}/rest/v1`;
const SERVICE_KEY = "dummy-not-a-real-secret";
const SECRET = "dummy-report-secret-not-a-real-one-0000000000";
const OTHER_SECRET = "dummy-report-secret-another-fake-one-11111111";
const EMAIL = "reader@example.com";
/** The address and each half of it: none may leave this machine. */
const ADDRESS_PARTS = [EMAIL, "reader", "example.com"];
/** Planted in scripted database answers; must never be seen again. */
const UPSTREAM_TEXT = "UPSTREAM-SENTINEL reader@example.com";

const RECORD_PERSON = `POST ${REST}/rpc/record_campaign_person`;
const INSERT_VISIT = `POST ${REST}/campaign_visits`;
const REPORT_RPC = `POST ${REST}/rpc/campaign_report`;
const RESET_RPC = `POST ${REST}/rpc/reset_campaign_report`;

const ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "REPORT_SECRET",
  "REPORT_PASSWORD",
];

type Recorded = {
  url: string;
  method: string;
  headers: Headers;
  /** The body exactly as sent; "" when there was none. */
  raw: string;
  body: unknown;
  signal: AbortSignal | null;
};

type Answer = (call: Recorded) => Response | Promise<Response>;

const realFetch = globalThis.fetch;
const realError = console.error;
const realWarn = console.warn;
const realInfo = console.info;
const realLog = console.log;
const savedEnv = new Map<string, string | undefined>();
/** Requests and log lines since the test (or its current case) began. */
let calls: Recorded[] = [];
let logged: string[] = [];
/** The console method that wrote each line of `logged`, in the same order. */
let levels: string[] = [];
/** Every request and log line of the test, for the checks in afterEach. */
let allCalls: Recorded[] = [];
let allLogged: string[] = [];
let unscripted = 0;
/** How the Data API answers. Null: every request is one no test scripted. */
let database: Answer | null = null;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** A Postgres error as the Data API returns one, with the sentinel planted in it. */
function postgresError(status: number, code: string): Response {
  return json(status, {
    code,
    message: UPSTREAM_TEXT,
    details: UPSTREAM_TEXT,
    hint: UPSTREAM_TEXT,
  });
}

const created = () => new Response(null, { status: 201 });
const noContent = () => new Response(null, { status: 204 });

/**
 * Answer by "METHOD origin+path" (the query string is asserted by the test
 * itself); a request to anything else is one no test scripted.
 */
function routes(table: Record<string, () => Response>): Answer {
  return (call) => {
    const url = new URL(call.url);
    const answer = table[`${call.method} ${url.origin}${url.pathname}`];
    if (answer) return answer();
    unscripted += 1;
    throw new Error("unscripted network call");
  };
}

/** Start a new case inside a test: fresh request and log lists. */
function freshCase(): void {
  calls = [];
  logged = [];
  levels = [];
}

/**
 * Every way a write can fail, and what the log may say: the Postgres code
 * when there is one, otherwise one word — never upstream's own text.
 */
const WRITE_FAILURES: {
  label: string;
  answer: () => Response;
  code: string | null;
}[] = [
  {
    label: "a missing table (500, 42P01)",
    answer: () => postgresError(500, "42P01"),
    code: "42P01",
  },
  {
    label: "a refused value (400, 23514)",
    answer: () => postgresError(400, "23514"),
    code: "23514",
  },
  {
    label: "a refused key (401, PGRST301)",
    answer: () => postgresError(401, "PGRST301"),
    code: "PGRST301",
  },
  {
    label: "a gateway's HTML page (502)",
    answer: () => new Response("<html>Bad gateway</html>", { status: 502 }),
    code: null,
  },
  {
    label: "a dropped connection",
    answer: () => {
      throw new TypeError(`fetch failed for ${EMAIL}`);
    },
    code: null,
  },
];

/** Exactly one log line: the prefix, then the code or one word. */
function expectOneLine(prefix: string, code: string | null, label: string) {
  expect(logged, `${label}: one log line`).toHaveLength(1);
  const line = logged[0] ?? "";
  if (code) {
    expect(line, label).toBe(`${prefix}: ${code}.`);
  } else {
    expect(line.startsWith(`${prefix}: `), `${label}: "${line}"`).toBe(true);
    expect(line.slice(prefix.length + 2), label).toMatch(/^[A-Za-z0-9_]+\.$/);
  }
}

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE;
  process.env.SUPABASE_SECRET_KEY = SERVICE_KEY;
  process.env.REPORT_SECRET = SECRET;

  calls = [];
  logged = [];
  levels = [];
  allCalls = [];
  allLogged = [];
  unscripted = 0;
  database = null;

  // Every console method a line can leave by: a reset's success line is
  // console.info, and the privacy checks in afterEach must see it too.
  const capture =
    (level: string) =>
    (...args: unknown[]) => {
      const line = args.map(String).join(" ");
      logged.push(line);
      levels.push(level);
      allLogged.push(line);
    };
  console.error = capture("error");
  console.warn = capture("warn");
  console.info = capture("info");
  console.log = capture("log");

  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const raw = typeof init?.body === "string" ? init.body : "";
    const call: Recorded = {
      url:
        typeof input === "string" || input instanceof URL
          ? String(input)
          : input.url,
      method: init?.method ?? "GET",
      headers: new Headers(init?.headers),
      raw,
      body: raw === "" ? undefined : JSON.parse(raw),
      signal: init?.signal ?? null,
    };
    calls.push(call);
    allCalls.push(call);
    if (!database) {
      unscripted += 1;
      throw new Error("unscripted network call");
    }
    return database(call);
  }) as typeof fetch;
});

test.afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
  console.warn = realWarn;
  console.info = realInfo;
  console.log = realLog;
  for (const [name, value] of savedEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  savedEnv.clear();

  expect(unscripted, "a request was made that no test scripted").toBe(0);

  for (const call of allCalls) {
    expect(
      call.url.startsWith(`${REST}/`),
      "a request went somewhere other than the Data API",
    ).toBe(true);
    expect(call.signal, "a request was made without a timeout").toBeInstanceOf(
      AbortSignal,
    );
    expect(
      call.headers.get("apikey"),
      "a request did not come from the service-role client",
    ).toBe(SERVICE_KEY);
    const sent = call.raw.toLowerCase();
    for (const part of ADDRESS_PARTS) {
      expect(sent, "a request body carries the address").not.toContain(part);
    }
    expect(call.raw, "a request body carries the secret").not.toContain(SECRET);
  }

  for (const line of allLogged) {
    const text = line.toLowerCase();
    for (const part of ADDRESS_PARTS) {
      expect(text, "a log line carries the address").not.toContain(part);
    }
    for (const secret of [
      SECRET,
      SERVICE_KEY,
      "supabase.co",
      "UPSTREAM-SENTINEL",
    ]) {
      expect(
        line,
        "a log line carries a secret or upstream text",
      ).not.toContain(secret);
    }
  }
});

test.describe("S6.2 report store — one code per person", () => {
  test("IN-009 the person code is 43 base64url characters, the documented HMAC, the same whatever the case", () => {
    const code = personCode(EMAIL, SECRET);
    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // base64url(HMAC-SHA256(REPORT_SECRET, "conv-person:v1:" + trimmed, lower-cased address))
    expect(code).toBe(
      createHmac("sha256", SECRET)
        .update(`conv-person:v1:${EMAIL}`, "utf8")
        .digest("base64url"),
    );
    // The same person, however they typed it, is counted once.
    expect(personCode(" Reader@Example.COM ", SECRET)).toBe(code);
    expect(personCode("\treader@example.com\n", SECRET)).toBe(code);
    // Another person, or another secret, is another code: without the
    // server's secret nobody can make the code for a guessed address.
    expect(personCode("reader2@example.com", SECRET)).not.toBe(code);
    expect(personCode(EMAIL, OTHER_SECRET)).not.toBe(code);
    // Neither half of the address survives in it.
    for (const part of ["reader", "example"]) {
      expect(code.toLowerCase()).not.toContain(part);
    }
  });
});

test.describe("S6.2 report store — counting a sign-up", () => {
  test("IN-009 a test address is never counted: no request at all", async () => {
    database = routes({ [RECORD_PERSON]: noContent });
    for (const email of [
      "owner+ur-test-x@example.com",
      "owner+ur-e2e-run1@example.com",
      "Owner+UR-TEST-Seat1@Example.com",
      "  owner+ur-test-x@example.com  ",
    ]) {
      for (const form of ["register", "toolkit"] as const) {
        await recordSignup({ form, email, source: "linkedin" });
      }
    }
    expect(calls).toEqual([]);
  });

  test("IN-009 nothing is sent while REPORT_SECRET is unset or shorter than 32", async () => {
    database = routes({ [RECORD_PERSON]: noContent });
    // The password alone switches nothing on.
    process.env.REPORT_PASSWORD = "dummy-report-password";
    for (const secret of [undefined, "", "dummy-secret-thirty-one-chars-x"]) {
      if (secret === undefined) delete process.env.REPORT_SECRET;
      else process.env.REPORT_SECRET = secret;
      await recordSignup({ form: "register", email: EMAIL, source: "email" });
    }
    expect(calls).toEqual([]);
  });

  test("IN-009 an accepted sign-up is ONE call to record_campaign_person: the code, the source, registered or not", async () => {
    database = routes({ [RECORD_PERSON]: noContent });
    const code = personCode(EMAIL, SECRET);

    for (const form of ["register", "toolkit"] as const) {
      for (const source of SOURCE_KEYS) {
        freshCase();
        await recordSignup({ form, email: EMAIL, source });
        const label = `${form} from ${source}`;
        expect(calls, label).toHaveLength(1);
        const call = calls[0]!;
        expect(call.method, label).toBe("POST");
        expect(call.url, label).toBe(`${REST}/rpc/record_campaign_person`);
        expect(call.body, label).toEqual({
          p_campaign: "conv1",
          p_person: code,
          p_source: source,
          // The Toolkit form alone is a sign-up, not a registration.
          p_registered: form === "register",
        });
        expect(call.headers.get("content-type")).toBe("application/json");
        // Nothing is asked back: no count, no row.
        expect(call.headers.get("prefer")).toBeNull();
        expect(call.signal).toBeInstanceOf(AbortSignal);
      }
    }

    // The same person typed differently sends the same code, so the database
    // keeps one row — and with it the source of their FIRST sign-up.
    freshCase();
    await recordSignup({
      form: "register",
      email: " Reader@Example.COM ",
      source: "whatsapp",
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.body).toMatchObject({ p_person: code });
    expect(allLogged).toEqual([]);
  });

  test("IN-009 a failing database never fails the sign-up: it resolves, is not retried, and logs a code only", async () => {
    for (const failure of WRITE_FAILURES) {
      freshCase();
      database = routes({ [RECORD_PERSON]: failure.answer });
      await expect(
        recordSignup({ form: "register", email: EMAIL, source: "linkedin" }),
        failure.label,
      ).resolves.toBeUndefined();
      expect(calls, `${failure.label}: one request, no retry`).toHaveLength(1);
      expectOneLine(
        "Sign-up not counted for the report",
        failure.code,
        failure.label,
      );
    }
  });

  test("IN-009 a database that never answers costs the sign-up at most the write timeout", async () => {
    database = (call) =>
      new Promise<Response>((_, reject) => {
        const signal = call.signal;
        if (!signal) {
          reject(new Error("no abort signal: this request could hang"));
          return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });

    const started = Date.now();
    await recordSignup({ form: "toolkit", email: EMAIL, source: "instagram" });
    const waited = Date.now() - started;

    expect(calls).toHaveLength(1);
    expect(calls[0]!.signal?.aborted, "the request was given up").toBe(true);
    expect(waited, "milliseconds the sign-up waited").toBeLessThan(10_000);
    expectOneLine("Sign-up not counted for the report", null, "a hung request");
  });
});

test.describe("S6.2 report store — counting a visit", () => {
  test("PR-010 a visit is ONE insert into campaign_visits: the campaign and the source, nothing else", async () => {
    database = routes({ [INSERT_VISIT]: created });
    for (const source of SOURCE_KEYS) {
      freshCase();
      expect(await recordArrival(source), source).toBe(true);
      expect(calls, source).toHaveLength(1);
      const call = calls[0]!;
      expect(call.method).toBe("POST");
      // No query string: no columns list, nothing selected back.
      expect(call.url).toBe(`${REST}/campaign_visits`);
      expect(call.body, source).toEqual({ campaign: "conv1", source });
      expect(call.headers.get("prefer")).toBeNull();
      expect(call.signal).toBeInstanceOf(AbortSignal);
    }
    expect(allLogged).toEqual([]);
  });

  test("PR-010 true only when stored: an error answer or a dropped connection is false, never a rejection", async () => {
    for (const failure of WRITE_FAILURES) {
      freshCase();
      database = routes({ [INSERT_VISIT]: failure.answer });
      await expect(recordArrival("linkedin"), failure.label).resolves.toBe(
        false,
      );
      expect(calls, `${failure.label}: one request, no retry`).toHaveLength(1);
      expectOneLine("Visit not recorded", failure.code, failure.label);
    }
  });
});

test.describe("S6.2 report store — reading the report", () => {
  test("PG-016 ONE aggregate call: eight rows in order, zeros filled in, an unknown source folded into other", async () => {
    database = routes({
      [REPORT_RPC]: () =>
        json(200, [
          { source: "linkedin", visits: 12, registered: 3 },
          { source: "other", visits: 5, registered: 1 },
          // Never written by this site; folded into "other", so the totals
          // still add up.
          { source: "tiktok", visits: 2, registered: 1 },
        ]),
    });

    // The rows and the totals, and nothing else: toStrictEqual also fails on
    // an extra key whose value is undefined.
    expect(await readReport()).toStrictEqual({
      rows: [
        { source: "linkedin", visits: 12, registered: 3 },
        { source: "instagram", visits: 0, registered: 0 },
        { source: "facebook", visits: 0, registered: 0 },
        { source: "whatsapp", visits: 0, registered: 0 },
        { source: "email", visits: 0, registered: 0 },
        { source: "meta-ads", visits: 0, registered: 0 },
        { source: "linkedin-ads", visits: 0, registered: 0 },
        { source: "other", visits: 7, registered: 2 },
      ],
      totals: { visits: 19, registered: 5 },
    });

    // Exactly one request. No table is read row by row: every number comes
    // from the aggregate (a plain select stops at the project's row cap).
    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    expect(call.method).toBe("POST");
    // No query string: the campaign travels in the body.
    expect(call.url).toBe(`${REST}/rpc/campaign_report`);
    expect(call.body).toEqual({ p_campaign: "conv1" });
    expect(call.headers.get("content-type")).toBe("application/json");
    // Nothing is asked for but the rows: no count.
    expect(call.headers.get("prefer")).toBeNull();
    expect(call.signal).toBeInstanceOf(AbortSignal);
    expect(logged).toEqual([]);
  });

  test("PG-016 nothing counted yet, as just after a reset: eight rows of zeros", async () => {
    database = routes({ [REPORT_RPC]: () => json(200, []) });
    expect(await readReport()).toStrictEqual({
      rows: SOURCE_KEYS.map((source) => ({ source, visits: 0, registered: 0 })),
      totals: { visits: 0, registered: 0 },
    });
    expect(calls).toHaveLength(1);
    expect(logged).toEqual([]);
  });

  test("PG-016 an error answer or a dropped connection is null, never a rejection, and is not retried", async () => {
    const scenarios: {
      label: string;
      answer: () => Response;
      code: string | null;
    }[] = [
      {
        label: "the aggregate fails (500, 42883)",
        answer: () => postgresError(500, "42883"),
        code: "42883",
      },
      {
        label: "the aggregate is refused (403, 42501)",
        answer: () => postgresError(403, "42501"),
        code: "42501",
      },
      {
        label: "the aggregate's connection drops",
        answer: () => {
          throw new TypeError(`fetch failed for ${SUPABASE}`);
        },
        code: null,
      },
    ];
    for (const scenario of scenarios) {
      freshCase();
      database = routes({ [REPORT_RPC]: scenario.answer });
      await expect(readReport(), scenario.label).resolves.toBeNull();
      expect(calls, `${scenario.label}: one request, no retry`).toHaveLength(1);
      expectOneLine(
        "Webinar report could not be read",
        scenario.code,
        scenario.label,
      );
      expect(levels, `${scenario.label}: console.error`).toEqual(["error"]);
    }
  });
});

test.describe("S6.2 report store — starting again for a new webinar", () => {
  test("FM-013 a reset is ONE call to reset_campaign_report for this campaign: true, and one line with the numbers deleted", async () => {
    database = routes({
      [RESET_RPC]: () => json(200, [{ visits: 13, people: 6 }]),
    });
    expect(await resetReport()).toBe(true);

    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    expect(call.method).toBe("POST");
    // No query string: the campaign travels in the body, and it is the only
    // thing sent. The function deletes that campaign's visits and people.
    expect(call.url).toBe(`${REST}/rpc/reset_campaign_report`);
    expect(call.body).toEqual({ p_campaign: "conv1" });
    expect(call.headers.get("content-type")).toBe("application/json");
    expect(call.headers.get("prefer")).toBeNull();
    expect(call.signal).toBeInstanceOf(AbortSignal);

    // Numbers only, written with console.info: a reset that worked is not an
    // error.
    expect(logged).toEqual([
      "Webinar report reset: 13 visits and 6 people deleted.",
    ]);
    expect(levels).toEqual(["info"]);
  });

  test("FM-013 a failed reset is false, never a rejection: one request, no retry, and a code only in the log", async () => {
    for (const failure of WRITE_FAILURES) {
      freshCase();
      database = routes({ [RESET_RPC]: failure.answer });
      await expect(resetReport(), failure.label).resolves.toBe(false);
      expect(calls, `${failure.label}: one request, no retry`).toHaveLength(1);
      expectOneLine("Webinar report not reset", failure.code, failure.label);
      expect(levels, `${failure.label}: console.error`).toEqual(["error"]);
    }
  });

  test("FM-013 a database that never answers is given up by the reset's own time limit", async () => {
    database = (call) =>
      new Promise<Response>((_, reject) => {
        const signal = call.signal;
        if (!signal) {
          reject(new Error("no abort signal: this request could hang"));
          return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });

    const started = Date.now();
    await expect(resetReport()).resolves.toBe(false);
    const waited = Date.now() - started;

    expect(calls, "one request, no retry").toHaveLength(1);
    expect(calls[0]!.signal?.aborted, "the request was given up").toBe(true);
    expect(waited, "milliseconds the reset waited").toBeLessThan(15_000);
    expectOneLine("Webinar report not reset", null, "a hung request");
    expect(levels, "a hung request: console.error").toEqual(["error"]);
  });
});
