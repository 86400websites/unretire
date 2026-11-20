import crypto from "crypto";
import { NextRequest } from "next/server";
import { test, expect } from "../fixtures";
import { POST } from "../../../src/app/api/conversation/arrival/route";
import { rateLimitedResponse } from "../../../src/lib/rate-limit";

/**
 * Sprint S6.2 — POST /api/conversation/arrival, the webinar report's visit
 * counter: every branch, in the order the route promises them, with NO
 * request ever leaving this machine. Draft FEATURE-LIST lines PR-010 (the
 * route: dormant and closed refusals, robots, the rate limit failing closed,
 * validation) and IN-009 (a visit is counted under its platform); the owner
 * approves both at Gate B.
 *
 * WHY THIS IS A FUNCTION-LEVEL SPEC, as conversation-route.spec.ts is. The
 * route's contract is an ORDER — dormant or closed, then robots, then the
 * limiter, then the body, then the store — and an order can only be seen by
 * counting which upstream requests each call made. So the handler is
 * imported and called directly, and `globalThis.fetch` is replaced before
 * every test by a stub that answers three requests only and COUNTS anything
 * else — the test then fails on that count:
 *
 *   • the rate limiter's increment function (src/lib/rate-limit.ts), answered
 *     by default with "this is the caller's first request";
 *   • the limiter's housekeeping sweep, a DELETE on rate_limits;
 *   • the insert into campaign_visits (src/lib/webinar/report-store.ts),
 *     answered by default as PostgREST answers a stored row.
 *
 * Every configuration value is an obviously fake string, set in beforeEach
 * and put back in afterEach — Playwright reuses a worker across files.
 *
 * Checked after EVERY test, whatever it sent: every answer carries
 * Cache-Control: no-store and a status the route documents; only a 429 has a
 * body, and that body is the limiter's own fixed sentence; no answer, header
 * or log line carries anything from the request (its body, its user agent,
 * its caller's address) or from upstream; and every insert carried a timeout
 * and held the campaign id and the key, nothing else.
 */

const SUPABASE = "https://dummy-project-ref.supabase.co";
const ZOOM = "https://zoom.us/j/0000000000";
const CALLER_IP = "203.0.113.7";
const ROUTE = "http://localhost:3000/api/conversation/arrival";
const VISITS = `${SUPABASE}/rest/v1/campaign_visits`;

const OPEN_START = "2099-12-10T16:00:00+02:00";
const PAST_START = "2020-01-02T16:00:00+02:00";

/**
 * The report's eight keys, typed out on purpose rather than read from
 * src/lib/webinar/sources.ts: the link contract is fixed (the sprint record's
 * "Link contract"), so a renamed or dropped key must turn this file red
 * instead of quietly following it.
 */
const KEYS = [
  "linkedin",
  "instagram",
  "facebook",
  "whatsapp",
  "email",
  "meta-ads",
  "linkedin-ads",
  "other",
] as const;

/** Planted in request bodies; must never be seen in an answer or a log. */
const BODY_SENTINEL = "BODY-SENTINEL-arrival";
/** Planted in scripted upstream bodies; must never be seen again either. */
const UPSTREAM_TEXT = "UPSTREAM-SENTINEL relation campaign_visits is missing";

/** An ordinary desktop browser. */
const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * People — including the in-app browsers the team's own platforms open a
 * link in. None may be taken for a robot: someone who taps the Instagram bio
 * link must be counted under Instagram.
 */
const PEOPLE = [
  BROWSER,
  // Safari on an iPhone.
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  // Firefox.
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  // Chrome on Android.
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  // Instagram's in-app browser.
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 357.0.0.25.101 (iPhone15,2; iOS 18_1; en_GB; en; scale=3.00; 1179x2556; 662341342)",
  // Facebook's in-app browser.
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0.0.40.107;FBBV/668829005;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBID/phone;FBLC/en_GB;FBOP/5;FBRV/0]",
  // LinkedIn's in-app browser.
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.2178",
];

/** Robots: one for each word the route's pattern matches, in any case. */
const ROBOTS = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36",
  "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5",
  "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
  "SITE-CRAWLER/1.0",
];

const ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "WEBINAR_STARTS_AT",
  "WEBINAR_OFFER_ENDS_AT",
  "WEBINAR_OFFER_CODE",
  "WEBINAR_ZOOM_URL",
  "WEBINAR_REPLAY_URL",
];

type Recorded = {
  url: string;
  method: string;
  body: Record<string, unknown>;
  signal: AbortSignal | null;
};

type Answer = { status: number; text: string; headers: Headers };

type Responder = (call: Recorded) => Response | Promise<Response>;

const realFetch = globalThis.fetch;
const realError = console.error;
const realWarn = console.warn;
const savedEnv = new Map<string, string | undefined>();
/** Every upstream request, in order, by kind: limiter, sweep or insert. */
let sequence: string[] = [];
/** Requests to the limiter's increment function, in order. */
let limiterCalls: Recorded[] = [];
/** Inserts into campaign_visits, in order. */
let inserts: Recorded[] = [];
let logged: string[] = [];
let unscripted = 0;
/** Every answer a test received, checked in afterEach. */
let answered: Answer[] = [];
/** Every user agent a test sent, checked in afterEach. */
let agents: string[] = [];

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** PostgREST's answer to a stored row when nothing is asked back. */
const stored: Responder = () => new Response(null, { status: 201 });

/** A PostgREST error, with the sentinel as every explanation. */
function pgError(status: number, code: string): Response {
  return json(status, {
    code,
    message: UPSTREAM_TEXT,
    details: UPSTREAM_TEXT,
    hint: UPSTREAM_TEXT,
  });
}

/** What the limiter's database says. The default: the caller's first request. */
let limiter: () => Response | Promise<Response> = () => json(200, 1);
let store: Responder = stored;

/** The funnel as a deployment would have it configured. */
function configure(start: string | null): void {
  if (start === null) delete process.env.WEBINAR_STARTS_AT;
  else process.env.WEBINAR_STARTS_AT = start;
}

/**
 * One visit. The user agent is an ordinary browser's unless the test names
 * one; `null` sends no user-agent header at all.
 */
async function send(
  body: unknown,
  { raw, agent = BROWSER }: { raw?: string; agent?: string | null } = {},
): Promise<Answer> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": CALLER_IP,
  };
  if (agent !== null) {
    headers["user-agent"] = agent;
    agents.push(agent);
  }
  const response = await POST(
    new NextRequest(ROUTE, {
      method: "POST",
      headers,
      body: raw ?? JSON.stringify(body),
    }),
  );
  const answer = {
    status: response.status,
    text: await response.text(),
    headers: response.headers,
  };
  answered.push(answer);
  return answer;
}

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE;
  process.env.SUPABASE_SECRET_KEY = "dummy-not-a-real-secret";
  process.env.WEBINAR_ZOOM_URL = ZOOM;
  configure(OPEN_START);

  sequence = [];
  limiterCalls = [];
  inserts = [];
  logged = [];
  answered = [];
  agents = [];
  unscripted = 0;
  limiter = () => json(200, 1);
  store = stored;

  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
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
    const call: Recorded = {
      url,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : {},
      signal: init?.signal ?? null,
    };

    if (url.startsWith(`${SUPABASE}/rest/v1/rpc/increment_rate_limit`)) {
      sequence.push("limiter");
      limiterCalls.push(call);
      return limiter();
    }
    // The limiter's housekeeping sweep of old windows.
    if (
      url.startsWith(`${SUPABASE}/rest/v1/rate_limits`) &&
      call.method === "DELETE"
    ) {
      sequence.push("sweep");
      return new Response(null, { status: 204 });
    }
    if (url.startsWith(VISITS) && call.method === "POST") {
      sequence.push("insert");
      inserts.push(call);
      return store(call);
    }
    // Anything else is a request this route must never make.
    unscripted += 1;
    throw new Error("unscripted network call");
  }) as typeof fetch;
});

test.afterEach(async () => {
  globalThis.fetch = realFetch;
  console.error = realError;
  console.warn = realWarn;
  for (const [name, value] of savedEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  savedEnv.clear();

  expect(unscripted, "a request was made that no test scripted").toBe(0);

  // Checked after EVERY test. Nothing a caller sends — its body, its user
  // agent, its address — and nothing upstream says may come back in an
  // answer or reach a log line.
  const leaks = [
    BODY_SENTINEL,
    "UPSTREAM-SENTINEL",
    "supabase.co",
    "dummy-not-a-real-secret",
    "reader@example.com",
    CALLER_IP,
    ...agents.filter((agent) => agent !== ""),
  ];
  const limitedBody = await rateLimitedResponse(60).text();
  for (const answer of answered) {
    expect(
      [204, 400, 404, 409, 429, 503],
      `${answer.status} is not a status this route documents`,
    ).toContain(answer.status);
    expect(
      answer.headers.get("cache-control"),
      `the ${answer.status} must not be cached`,
    ).toBe("no-store");
    if (answer.status === 429) {
      // The limiter's own fixed sentence, and nothing else.
      expect(answer.text).toBe(limitedBody);
      const retryAfter = Number(answer.headers.get("retry-after"));
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    } else {
      expect(answer.text, `the ${answer.status} must have no body`).toBe("");
    }
    const visible = [
      answer.text,
      ...[...answer.headers].map(([name, value]) => `${name}: ${value}`),
    ];
    for (const text of visible) {
      for (const leak of leaks) {
        expect(
          text,
          "request or upstream text reached an answer",
        ).not.toContain(leak);
      }
    }
  }
  for (const line of logged) {
    for (const leak of leaks) {
      expect(line, "request or upstream text reached a log line").not.toContain(
        leak,
      );
    }
  }
  // Every insert carried a timeout and held the campaign id and the key —
  // never a time, an address, a user agent, a referrer or a URL.
  for (const call of inserts) {
    expect(call.url, "an insert went somewhere else").toBe(VISITS);
    expect(call.method).toBe("POST");
    expect(call.signal, "an insert was made without a timeout").toBeInstanceOf(
      AbortSignal,
    );
    expect(
      Object.keys(call.body).sort(),
      "an insert stored more than the campaign and the key",
    ).toEqual(["campaign", "source"]);
    expect(call.body.campaign).toBe("conv1");
  }
});

test.describe("S6.2 arrival route — step 1: dormant is 404 and closed is 409, before anything else", () => {
  test("PR-010 no start configured: 404, no body, and NO work — not the limiter, not the store, whatever is sent", async () => {
    configure(null);

    const replies = [
      await send({ source: "linkedin" }),
      await send({ source: BODY_SENTINEL }),
      await send(null, { raw: `{not json ${BODY_SENTINEL}` }),
      // Dormant outranks the robot check too.
      await send({ source: "linkedin" }, { agent: ROBOTS[0] }),
    ];
    for (const reply of replies) expect(reply.status).toBe(404);

    expect(sequence, "a switched-off route did work").toEqual([]);
  });

  test("PR-010 a start with no usable Zoom address is dormant too", async () => {
    delete process.env.WEBINAR_ZOOM_URL;
    expect((await send({ source: "linkedin" })).status).toBe(404);
    expect(sequence).toEqual([]);
  });

  test("PR-010 from the start instant: 409, no body, no limiter call and nothing stored", async () => {
    configure(PAST_START);

    const replies = [
      await send({ source: "linkedin" }),
      await send({ source: BODY_SENTINEL }),
      await send(null, { raw: `{not json ${BODY_SENTINEL}` }),
      await send({ source: "linkedin" }, { agent: ROBOTS[0] }),
    ];
    for (const reply of replies) expect(reply.status).toBe(409);

    expect(sequence, "a closed funnel counted a visit").toEqual([]);
  });
});

test.describe("S6.2 arrival route — step 2: a robot is answered 204 and nothing is stored", () => {
  test("PR-010 every robot agent gets 204 with no limiter call and nothing stored, whatever it sent", async () => {
    for (const agent of ROBOTS) {
      expect(
        (await send({ source: "linkedin" }, { agent })).status,
        agent,
      ).toBe(204);
      expect(
        (await send(null, { agent, raw: `{not json ${BODY_SENTINEL}` })).status,
        agent,
      ).toBe(204);
    }
    expect(sequence, "a robot reached the limiter or the store").toEqual([]);
  });

  test("PR-010 people's browsers — in-app ones included — an empty agent and no agent at all go on to be counted", async () => {
    for (const agent of [...PEOPLE, "", null]) {
      sequence = [];
      const reply = await send({ source: "instagram" }, { agent });
      expect(reply.status, String(agent)).toBe(204);
      expect(sequence, String(agent)).toEqual(["limiter", "sweep", "insert"]);
    }
    expect(inserts).toHaveLength(PEOPLE.length + 2);
  });
});

test.describe("S6.2 arrival route — step 3: the rate limit, in a bucket of its own, failing closed", () => {
  test("PR-010 the limiter is asked once, for the 'conversation-arrival' bucket, in 60-second windows, before the body is read", async () => {
    expect(
      (await send(null, { raw: `{not json ${BODY_SENTINEL}` })).status,
    ).toBe(400);

    expect(limiterCalls).toHaveLength(1);
    const { p_bucket, p_window_start } = limiterCalls[0]!.body;
    // A hash of endpoint + caller: the address itself is never sent.
    const bucket = (endpoint: string) =>
      crypto
        .createHash("sha256")
        .update(`${endpoint}:${CALLER_IP}`)
        .digest("hex");
    expect(p_bucket).toBe(bucket("conversation-arrival"));
    expect(p_bucket, "the sign-up form's bucket was shared").not.toBe(
      bucket("conversation"),
    );
    expect(new Date(String(p_window_start)).getTime() % 60_000).toBe(0);
  });

  test("PR-010 the sixtieth visit in a window is counted; the sixty-first is refused with Retry-After and nothing is stored", async () => {
    limiter = () => json(200, 60);
    expect((await send({ source: "linkedin" })).status).toBe(204);
    expect(inserts).toHaveLength(1);

    limiter = () => json(200, 61);
    sequence = [];
    const refused = await send({ source: "linkedin" });
    expect(refused.status).toBe(429);
    expect(Number(refused.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(Number(refused.headers.get("retry-after"))).toBeLessThanOrEqual(60);
    expect(sequence, "a limited visit went past the limiter").toEqual([
      "limiter",
    ]);
    expect(inserts).toHaveLength(1);
  });

  test("PR-010 it fails closed: a limiter that errors, throws or answers nonsense refuses the visit and stores nothing", async () => {
    const broken: [string, () => Response][] = [
      ["a 500", () => json(500, { message: UPSTREAM_TEXT })],
      [
        "a missing function",
        () => json(404, { code: "PGRST202", message: UPSTREAM_TEXT }),
      ],
      ["a count that is not a number", () => json(200, "sixty")],
      [
        "a network failure",
        () => {
          throw new TypeError(`fetch failed for ${SUPABASE} ${UPSTREAM_TEXT}`);
        },
      ],
    ];
    for (const [label, fail] of broken) {
      limiter = fail;
      sequence = [];
      const reply = await send({ source: "linkedin" });
      expect(reply.status, label).toBe(429);
      // The whole window, since the limiter could not say how much is left.
      expect(reply.headers.get("retry-after"), label).toBe("60");
      expect(sequence, label).toEqual(["limiter"]);
    }
    expect(inserts, "a visit was stored without the limiter's say-so").toEqual(
      [],
    );
  });

  test("PR-010 a limited caller is refused before the body is read: 429, not 400", async () => {
    limiter = () => json(200, 61);
    for (const raw of [
      `{not json ${BODY_SENTINEL}`,
      JSON.stringify({ source: BODY_SENTINEL }),
    ]) {
      expect((await send(null, { raw })).status).toBe(429);
    }
    expect(inserts).toEqual([]);
  });
});

test.describe("S6.2 arrival route — steps 4 and 5: the body must be JSON naming one of the eight keys", () => {
  test("PR-010 a body that is not JSON is a 400 after the limiter, and nothing is stored", async () => {
    for (const raw of [
      `{not json ${BODY_SENTINEL}`,
      "",
      `source=linkedin&note=${BODY_SENTINEL}`,
      '{"source": "linkedin"',
    ]) {
      sequence = [];
      expect((await send(null, { raw })).status, raw).toBe(400);
      expect(sequence, raw).toEqual(["limiter", "sweep"]);
    }
    expect(inserts).toEqual([]);
  });

  test("PR-010 anything but an object whose source is one of the eight keys is a 400, and nothing is stored", async () => {
    const refused: unknown[] = [
      // Not an object.
      [],
      ["linkedin"],
      null,
      "linkedin",
      7,
      true,
      // No source.
      {},
      { Source: "linkedin" },
      { sources: ["linkedin"] },
      // A string that is not one of the eight keys — including the values
      // the links carry, which are not keys themselves.
      { source: "tiktok" },
      { source: "LinkedIn" },
      { source: "LINKEDIN" },
      { source: " linkedin" },
      { source: "linkedin " },
      { source: "" },
      { source: "Other" },
      { source: "newsletter" },
      { source: "meta" },
      { source: "paid" },
      { source: "meta_ads" },
      { source: BODY_SENTINEL },
      // A source of the wrong type.
      { source: 42 },
      { source: true },
      { source: null },
      { source: ["linkedin"] },
      { source: { key: "linkedin" } },
    ];
    for (const body of refused) {
      expect((await send(body)).status, JSON.stringify(body)).toBe(400);
    }
    // A key smuggled in through the prototype is not the body's own source.
    expect(
      (await send(null, { raw: '{"__proto__":{"source":"linkedin"}}' })).status,
    ).toBe(400);

    expect(inserts, "an invalid visit was stored").toEqual([]);
    expect(limiterCalls).toHaveLength(refused.length + 1);
  });
});

test.describe("S6.2 arrival route — step 6: a valid visit is stored once, as the campaign and the key only", () => {
  test("IN-009 each of the eight keys is stored once, under its own key, for campaign conv1", async () => {
    for (const key of KEYS) {
      sequence = [];
      const before = inserts.length;

      const reply = await send({ source: key });
      expect(reply.status, key).toBe(204);
      expect(sequence, key).toEqual(["limiter", "sweep", "insert"]);
      expect(inserts, key).toHaveLength(before + 1);
      expect(inserts[before]!.body, key).toEqual({
        campaign: "conv1",
        source: key,
      });
    }
  });

  test("PR-010 extra fields in the body are never stored: not a campaign, a time, an address or a referrer", async () => {
    const reply = await send({
      source: "whatsapp",
      campaign: "someone-elses-campaign",
      created_at: "2000-01-01T00:00:00Z",
      id: 1,
      email: "reader@example.com",
      referrer: `https://evil.example/${BODY_SENTINEL}`,
      userAgent: BODY_SENTINEL,
      ip: "198.51.100.1",
    });
    expect(reply.status).toBe(204);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]!.body).toEqual({ campaign: "conv1", source: "whatsapp" });
  });

  test("PR-010 a store that fails answers 503 — no body, no detail, one attempt, a code or a name in the log", async () => {
    const failures: [string, Responder][] = [
      ["a missing table", () => pgError(500, "42P01")],
      ["a refused row", () => pgError(400, "23514")],
      ["permission denied", () => pgError(401, "42501")],
      ["the schema cache not loaded yet", () => pgError(503, "PGRST002")],
      [
        "a network failure",
        () => {
          throw new TypeError(`fetch failed for ${SUPABASE} ${UPSTREAM_TEXT}`);
        },
      ],
    ];
    for (const [label, fail] of failures) {
      store = fail;
      const insertsBefore = inserts.length;
      const logsBefore = logged.length;

      const reply = await send({ source: "facebook" });
      expect(reply.status, label).toBe(503);
      // A write is never retried: one attempt, then the answer.
      expect(inserts.length - insertsBefore, label).toBe(1);
      const lines = logged.slice(logsBefore);
      expect(lines, label).toHaveLength(1);
      expect(lines[0], label).toMatch(/^Visit not recorded: [A-Za-z0-9_]+\.$/);
    }
  });

  test("PR-010 a store that never answers is cut off by its own timeout: 503, and the visitor is not kept waiting", async () => {
    let cutOffByTimeout = false;
    store = (call) =>
      new Promise<Response>((_, reject) => {
        const signal = call.signal;
        if (!signal) {
          // The afterEach names the missing timeout; do not hang the run.
          reject(new TypeError("no timeout on the insert"));
          return;
        }
        signal.addEventListener(
          "abort",
          () => {
            cutOffByTimeout =
              (signal.reason as { name?: unknown } | undefined)?.name ===
              "TimeoutError";
            reject(signal.reason);
          },
          { once: true },
        );
      });

    const started = Date.now();
    const reply = await send({ source: "email" });
    expect(reply.status).toBe(503);
    expect(
      cutOffByTimeout,
      "the insert must end on its own timeout signal",
    ).toBe(true);
    expect(Date.now() - started, "the wait must be bounded").toBeLessThan(
      10_000,
    );
    expect(inserts).toHaveLength(1);
  });
});

test.describe("S6.2 arrival route — every answer", () => {
  test("PR-010 each kind of answer is uncached, bodiless except the 429, and repeats nothing it was sent", async () => {
    // One of each status. The afterEach makes the same checks after every
    // other test too; this walks them in one place.
    const seen = new Map<number, Answer>();
    configure(null);
    seen.set(404, await send({ source: "linkedin", note: BODY_SENTINEL }));
    configure(PAST_START);
    seen.set(409, await send({ source: "linkedin", note: BODY_SENTINEL }));
    configure(OPEN_START);
    seen.set(204, await send({ source: "linkedin", note: BODY_SENTINEL }));
    seen.set(400, await send({ source: BODY_SENTINEL }));
    store = () => pgError(500, "42P01");
    seen.set(503, await send({ source: "linkedin", note: BODY_SENTINEL }));
    limiter = () => json(200, 61);
    seen.set(429, await send({ source: "linkedin", note: BODY_SENTINEL }));

    expect([...seen.keys()].sort((a, b) => a - b)).toEqual([
      204, 400, 404, 409, 429, 503,
    ]);
    for (const [status, answer] of seen) {
      expect(answer.status).toBe(status);
      // Only the headers the route sets: nothing else rides along.
      expect([...answer.headers.keys()].sort(), `${status}`).toEqual(
        status === 429
          ? ["cache-control", "content-type", "retry-after"]
          : ["cache-control"],
      );
      expect(answer.headers.get("cache-control")).toBe("no-store");
      expect(answer.text === "", `${status}`).toBe(status !== 429);
      expect(answer.text).not.toContain(BODY_SENTINEL);
    }
    expect(logged.join("\n")).not.toContain(BODY_SENTINEL);
  });
});
