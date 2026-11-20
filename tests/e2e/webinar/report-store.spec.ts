import { createHmac } from "node:crypto";
import { test, expect } from "../fixtures";
import {
  parseReportInputs,
  personCode,
  readReport,
  recordArrival,
  recordSignup,
  saveReportInputs,
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
 *   PG-016  the report's numbers come from one aggregate call and the inputs
 *           row (readReport);
 *   FM-013  the report's two boxes: what is accepted, and the save
 *           (parseReportInputs, saveReportInputs).
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
 * PRIVACY IS CHECKED AFTER EVERY TEST: no request body and no log line may
 * carry the address or either half of it, the report secret, the service key
 * or a word of what the database said.
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
const INPUTS_READ = `GET ${REST}/campaign_report_inputs`;
const INPUTS_UPSERT = `POST ${REST}/campaign_report_inputs`;

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
const savedEnv = new Map<string, string | undefined>();
/** Requests and log lines since the test (or its current case) began. */
let calls: Recorded[] = [];
let logged: string[] = [];
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
  allCalls = [];
  allLogged = [];
  unscripted = 0;
  database = null;

  const capture = (...args: unknown[]) => {
    const line = args.map(String).join(" ");
    logged.push(line);
    allLogged.push(line);
  };
  console.error = capture;
  console.warn = capture;

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
  test("PG-016 one aggregate call and the inputs row: eight rows in order, zeros filled in, an unknown source folded into other", async () => {
    database = routes({
      [REPORT_RPC]: () =>
        json(200, [
          { source: "linkedin", visits: 12, registered: 3 },
          { source: "other", visits: 5, registered: 1 },
          // Never written by this site; folded into "other", so the totals
          // still add up.
          { source: "tiktok", visits: 2, registered: 1 },
        ]),
      [INPUTS_READ]: () =>
        json(200, [{ count_from: "2026-11-23", showed_up: 41 }]),
    });

    expect(await readReport()).toEqual({
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
      countFrom: "2026-11-23",
      showedUp: 41,
    });

    // Exactly two requests. No table is read row by row: every number comes
    // from the aggregate (a plain select stops at the project's row cap).
    expect(calls).toHaveLength(2);
    const rpc = calls.find((call) => call.method === "POST")!;
    expect(rpc.url).toBe(`${REST}/rpc/campaign_report`);
    expect(rpc.body).toEqual({ p_campaign: "conv1" });
    expect(rpc.headers.get("prefer")).toBeNull();

    const read = calls.find((call) => call.method === "GET")!;
    const url = new URL(read.url);
    expect(`${url.origin}${url.pathname}`).toBe(
      `${REST}/campaign_report_inputs`,
    );
    expect([...url.searchParams]).toEqual([
      ["select", "count_from,showed_up"],
      ["campaign", "eq.conv1"],
    ]);
    expect(read.raw).toBe("");
    // .maybeSingle() in this postgrest-js asks for a LIST and checks the
    // count itself — which is why the scripted answer above is an array.
    expect(read.headers.get("accept") ?? "").not.toContain("vnd.pgrst.object");
    expect(logged).toEqual([]);
  });

  test("PG-016 nothing saved yet: counting from the beginning, and Showed up not added", async () => {
    database = routes({
      [REPORT_RPC]: () => json(200, []),
      [INPUTS_READ]: () => json(200, []),
    });
    expect(await readReport()).toEqual({
      rows: SOURCE_KEYS.map((source) => ({ source, visits: 0, registered: 0 })),
      totals: { visits: 0, registered: 0 },
      countFrom: null,
      showedUp: null,
    });
  });

  test("PG-016 an error answer from either call is null — never a partial report", async () => {
    const scenarios: {
      label: string;
      table: Record<string, () => Response>;
      code: string | null;
    }[] = [
      {
        label: "the aggregate fails",
        table: {
          [REPORT_RPC]: () => postgresError(500, "42883"),
          [INPUTS_READ]: () => json(200, []),
        },
        code: "42883",
      },
      {
        label: "the inputs row cannot be read",
        table: {
          [REPORT_RPC]: () => json(200, []),
          [INPUTS_READ]: () => postgresError(403, "42501"),
        },
        code: "42501",
      },
      {
        label: "the aggregate's connection drops",
        table: {
          [REPORT_RPC]: () => {
            throw new TypeError(`fetch failed for ${SUPABASE}`);
          },
          [INPUTS_READ]: () => json(200, []),
        },
        code: null,
      },
    ];
    for (const scenario of scenarios) {
      freshCase();
      database = routes(scenario.table);
      expect(await readReport(), scenario.label).toBeNull();
      expectOneLine(
        "Webinar report could not be read",
        scenario.code,
        scenario.label,
      );
    }
  });
});

test.describe("S6.2 report store — the two boxes", () => {
  test("FM-013 dates: empty, or a real calendar day from 2026-01-01 to 2100-12-31", () => {
    const accepted: [string, string | null][] = [
      ["", null],
      ["2026-11-23", "2026-11-23"],
      ["2026-01-01", "2026-01-01"],
      ["2100-12-31", "2100-12-31"],
      ["2028-02-29", "2028-02-29"],
      [" 2026-11-23 ", "2026-11-23"],
      ["   ", null],
    ];
    for (const [countFrom, value] of accepted) {
      expect(
        parseReportInputs({ countFrom, showedUp: "" }),
        JSON.stringify(countFrom),
      ).toEqual({ ok: true, value: { countFrom: value, showedUp: null } });
    }

    for (const countFrom of [
      "2026-02-30",
      "2027-02-29",
      "2026-13-01",
      "2026-00-10",
      "2026-11-00",
      "2026-11-31",
      "2025-12-31",
      "2101-01-01",
      "23/11/2026",
      "2026-1-5",
      "2026-11-23T00:00",
      "2026/11/23",
      "20261123",
      "２０２６-１１-２３",
      "tomorrow",
    ]) {
      expect(
        parseReportInputs({ countFrom, showedUp: "" }),
        JSON.stringify(countFrom),
      ).toEqual({ ok: false, code: "date" });
    }
  });

  test("FM-013 numbers: empty, or whole digits from 0 to 100000", () => {
    const accepted: [string, number | null][] = [
      ["", null],
      ["0", 0],
      ["74", 74],
      ["007", 7],
      ["100000", 100000],
      [" 74 ", 74],
      ["   ", null],
    ];
    for (const [showedUp, value] of accepted) {
      expect(
        parseReportInputs({ countFrom: "", showedUp }),
        JSON.stringify(showedUp),
      ).toEqual({ ok: true, value: { countFrom: null, showedUp: value } });
    }

    for (const showedUp of [
      "100001",
      "1000000",
      "-1",
      "+5",
      "1.5",
      "1e3",
      "0x10",
      "Infinity",
      "abc",
      "1 000",
      "1,000",
      "٧٤",
    ]) {
      expect(
        parseReportInputs({ countFrom: "", showedUp }),
        JSON.stringify(showedUp),
      ).toEqual({ ok: false, code: "number" });
    }
  });

  test("FM-013 both boxes together: both empty clears both, both valid saves both, the date is checked first", () => {
    expect(parseReportInputs({ countFrom: "", showedUp: "" })).toEqual({
      ok: true,
      value: { countFrom: null, showedUp: null },
    });
    expect(
      parseReportInputs({ countFrom: "2026-11-23", showedUp: "41" }),
    ).toEqual({ ok: true, value: { countFrom: "2026-11-23", showedUp: 41 } });
    expect(parseReportInputs({ countFrom: "nope", showedUp: "nope" })).toEqual({
      ok: false,
      code: "date",
    });
    expect(
      parseReportInputs({ countFrom: "2026-11-23", showedUp: "nope" }),
    ).toEqual({ ok: false, code: "number" });
  });

  /**
   * What /report/save hands over is FormData.get(…): a string, a File, or
   * null when the field is missing from the post. Anything but an empty box
   * or a valid value is refused with a code — a value that is not a string
   * too, so a post without a box can never clear what was saved. (Found by
   * these two tests while they were written; fixed in report-store.ts before
   * the first commit.)
   */
  const NOT_TEXT: [string, unknown][] = [
    ["a missing field (FormData.get gives null)", null],
    ["undefined", undefined],
    ["a number", 41],
    ["a file", new File(["41"], "upload.txt")],
    ["an array", ["41"]],
    ["an object that prints as a value", { toString: () => "41" }],
    ["a boolean", true],
  ];

  test("FM-013 a date box that is not text is refused, not read as empty", () => {
    for (const [label, countFrom] of NOT_TEXT) {
      expect(parseReportInputs({ countFrom, showedUp: "" }), label).toEqual({
        ok: false,
        code: "date",
      });
    }
  });

  test("FM-013 a number box that is not text is refused, not read as empty", () => {
    for (const [label, showedUp] of NOT_TEXT) {
      expect(parseReportInputs({ countFrom: "", showedUp }), label).toEqual({
        ok: false,
        code: "number",
      });
    }
  });

  test("FM-013 saving is ONE upsert of the campaign's row, merged on campaign", async () => {
    database = routes({ [INPUTS_UPSERT]: created });
    const before = Date.now();
    expect(
      await saveReportInputs({ countFrom: "2026-11-23", showedUp: 41 }),
    ).toBe(true);
    const after = Date.now();

    expect(calls).toHaveLength(1);
    const call = calls[0]!;
    const url = new URL(call.url);
    expect(`${url.origin}${url.pathname}`).toBe(
      `${REST}/campaign_report_inputs`,
    );
    expect([...url.searchParams]).toEqual([["on_conflict", "campaign"]]);
    expect(call.headers.get("prefer")).toBe("resolution=merge-duplicates");
    expect(call.signal).toBeInstanceOf(AbortSignal);

    const body = call.body as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual([
      "campaign",
      "count_from",
      "showed_up",
      "updated_at",
    ]);
    expect(body).toMatchObject({
      campaign: "conv1",
      count_from: "2026-11-23",
      showed_up: 41,
    });
    const stamped = Date.parse(String(body.updated_at));
    expect(Number.isNaN(stamped), "updated_at is a date").toBe(false);
    expect(new Date(stamped).toISOString()).toBe(body.updated_at);
    expect(stamped).toBeGreaterThanOrEqual(before);
    expect(stamped).toBeLessThanOrEqual(after);
    expect(logged).toEqual([]);
  });

  test("FM-013 empty boxes are saved as nulls, which clear the saved values", async () => {
    database = routes({ [INPUTS_UPSERT]: created });
    expect(await saveReportInputs({ countFrom: null, showedUp: null })).toBe(
      true,
    );
    expect(calls).toHaveLength(1);
    // Sent as null, not left out: a merge leaves an absent column alone.
    expect(calls[0]!.body).toMatchObject({
      campaign: "conv1",
      count_from: null,
      showed_up: null,
    });
  });

  test("FM-013 an error answer or a dropped connection is false, never a rejection", async () => {
    for (const failure of WRITE_FAILURES) {
      freshCase();
      database = routes({ [INPUTS_UPSERT]: failure.answer });
      await expect(
        saveReportInputs({ countFrom: "2026-11-23", showedUp: 41 }),
        failure.label,
      ).resolves.toBe(false);
      expect(calls, `${failure.label}: one request, no retry`).toHaveLength(1);
      expectOneLine("Report numbers not saved", failure.code, failure.label);
    }
  });
});
