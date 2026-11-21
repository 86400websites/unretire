import crypto from "crypto";
import { NextRequest } from "next/server";
import { test, expect } from "../fixtures";
import { POST } from "../../../src/app/api/conversation/route";
import { COPY } from "../../../src/app/conversation/copy";

/**
 * Sprint S6.1 — POST /api/conversation, every branch, in the order the route
 * promises them, with NO request ever leaving this machine.
 * FEATURE-LIST lines FM-011, FM-012, PG-013, PG-014 and PR-007.
 *
 * WHY THIS IS A FUNCTION-LEVEL SPEC. What the route does with an ACCEPTED
 * sign-up cannot be asserted over HTTP: one live Mailchimp audience serves
 * Production, Preview and local (D-22), and a tag on a contact starts a real
 * e-mail flow. So the handler is imported and called directly, and
 * `globalThis.fetch` is replaced before every test by a stub that answers
 * only what the test scripted and COUNTS anything else — the test then fails
 * on that count. Two upstreams sit behind that one stub:
 *
 *   • the rate limiter's database (src/lib/rate-limit.ts), answered by
 *     default with "this is the caller's first request";
 *   • Mailchimp, which has no default at all.
 *
 * Every configuration value is an obviously fake string, set in beforeEach
 * and put back in afterEach — Playwright reuses a worker across files.
 *
 * The client's own classification of an upstream answer is proven in
 * mailchimp-client.spec.ts. This file proves what the ROUTE turns each
 * outcome into, and that nothing from upstream reaches a response or a log.
 *
 * Sprint S6.2 adds the last block — draft FEATURE-LIST line IN-009, the
 * webinar report's registration count. Every block above runs with
 * REPORT_SECRET cleared (it is in ENV_NAMES), so the report's counting is off
 * and their unscripted-request check proves the route makes no request beyond
 * S6.1's; the last block sets an obviously fake one and proves what the
 * counting does.
 */

const KEY = "dummy-not-a-real-key-us99";
const LIST = "dummylist00";
const MAILCHIMP = `https://us99.api.mailchimp.com/3.0/lists/${LIST}`;
const SUPABASE = "https://dummy-project-ref.supabase.co";
const ZOOM = "https://zoom.us/j/0000000000";
const EMAIL = "reader@example.com";
const CALLER_IP = "203.0.113.7";

/**
 * Typed out on purpose rather than read from the config: the owner's two
 * Mailchimp flows are triggered by these exact names, so a renamed constant
 * must turn this file red instead of quietly following it.
 */
const TAG_REGISTERED = "conv1-registered";
const TAG_TOOLKIT = "conv1-toolkit";

/** Planted in scripted upstream bodies; must never be seen again. */
const UPSTREAM_TEXT =
  "UPSTREAM-SENTINEL reader@example.com is already a list member";

const OPEN_START = "2099-12-10T16:00:00+02:00";
const PAST_START = "2020-01-02T16:00:00+02:00";

const ENV_NAMES = [
  "MAILCHIMP_API_KEY",
  "MAILCHIMP_LIST_ID",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "WEBINAR_STARTS_AT",
  "WEBINAR_OFFER_ENDS_AT",
  "WEBINAR_OFFER_CODE",
  "WEBINAR_ZOOM_URL",
  "WEBINAR_REPLAY_URL",
  // S6.2: cleared like the rest, so a value in the shell can never switch the
  // report's counting on inside the S6.1 tests.
  "REPORT_SECRET",
  // S6.2, D-67: what this site's own hosts are (src/lib/auth/safe-origin.ts).
  // All unset here, so only http://localhost counts as this site.
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
];

type Recorded = {
  url: string;
  method: string;
  body: Record<string, unknown>;
  signal: AbortSignal | null;
};

const realFetch = globalThis.fetch;
const realError = console.error;
const realWarn = console.warn;
const savedEnv = new Map<string, string | undefined>();
/** Requests to Mailchimp, in order. */
let calls: Recorded[] = [];
/** Requests to the limiter's increment function, in order. */
let limiterCalls: Recorded[] = [];
let logged: string[] = [];
let unscripted = 0;
/** Bodies of every response a test received, checked in afterEach. */
let answered: string[] = [];

type Responder = (
  call: Recorded,
  index: number,
) => Response | Promise<Response>;

/** What the limiter's database says. The default: the caller's first request. */
let limiter: () => Response = () => json(200, 1);
let mailchimp: Responder | null = null;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Mailchimp's problem-detail shape, with the sentinel as its explanation. */
function problem(
  status: number,
  title: string,
  extra: Record<string, unknown> = {},
): Response {
  return json(status, {
    type: "https://mailchimp.com/developer/marketing/docs/errors/",
    title,
    status,
    detail: UPSTREAM_TEXT,
    instance: "00000000-0000-0000-0000-000000000000",
    ...extra,
  });
}

/** A member as Mailchimp returns one, with the sentinel planted in it. */
function member(status: string): Response {
  return json(200, {
    id: "0".repeat(32),
    email_address: EMAIL,
    status,
    note: UPSTREAM_TEXT,
  });
}

const tagged = () => new Response(null, { status: 204 });

function hashOf(email: string): string {
  return crypto.createHash("md5").update(email).digest("hex");
}

/** Script Mailchimp's answers, one per call, in order. */
function script(...answers: (() => Response | Promise<Response>)[]): void {
  mailchimp = (_call, index) => {
    const answer = answers[index];
    if (!answer) {
      unscripted += 1;
      throw new Error("unscripted Mailchimp call");
    }
    return answer();
  };
}

/** The funnel as a deployment would have it configured. */
function configure(start: string | null): void {
  if (start === null) delete process.env.WEBINAR_STARTS_AT;
  else process.env.WEBINAR_STARTS_AT = start;
}

const VALID = { form: "register", firstName: "Maher", email: EMAIL };

async function send(
  body: unknown,
  raw?: string,
  // S6.2, D-67: the headers that say where a request came from.
  {
    contentType = "application/json",
    origin,
    fetchSite,
  }: { contentType?: string | null; origin?: string; fetchSite?: string } = {},
): Promise<{ status: number; text: string; headers: Headers }> {
  const headers: Record<string, string> = { "x-forwarded-for": CALLER_IP };
  if (contentType !== null) headers["content-type"] = contentType;
  if (origin !== undefined) headers.origin = origin;
  if (fetchSite !== undefined) headers["sec-fetch-site"] = fetchSite;
  const payload = raw ?? JSON.stringify(body);
  const response = await POST(
    new NextRequest("http://localhost:3000/api/conversation", {
      method: "POST",
      headers,
      // A string body would make the request say text/plain by itself; bytes
      // say nothing, so "no content type" really sends none.
      body: contentType === null ? new TextEncoder().encode(payload) : payload,
    }),
  );
  const text = await response.text();
  answered.push(text);
  return { status: response.status, text, headers: response.headers };
}

function parse(text: string): Record<string, unknown> {
  return JSON.parse(text) as Record<string, unknown>;
}

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  process.env.MAILCHIMP_API_KEY = KEY;
  process.env.MAILCHIMP_LIST_ID = LIST;
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE;
  process.env.SUPABASE_SECRET_KEY = "dummy-not-a-real-secret";
  process.env.WEBINAR_ZOOM_URL = ZOOM;
  configure(OPEN_START);

  calls = [];
  limiterCalls = [];
  logged = [];
  answered = [];
  unscripted = 0;
  limiter = () => json(200, 1);
  mailchimp = null;

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
      limiterCalls.push(call);
      return limiter();
    }
    // The limiter's housekeeping sweep of old windows.
    if (
      url.startsWith(`${SUPABASE}/rest/v1/rate_limits`) &&
      call.method === "DELETE"
    ) {
      return new Response(null, { status: 204 });
    }
    if (url.startsWith(`${MAILCHIMP}/`) && mailchimp) {
      calls.push(call);
      return mailchimp(call, calls.length - 1);
    }
    // Anything else — including a Mailchimp call no test scripted — is a
    // request this file must never make.
    unscripted += 1;
    throw new Error("unscripted network call");
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

  // Checked after EVERY test, whatever it scripted. No response and no log
  // line may carry the key, the audience id, a host, the address, the Zoom
  // link or a word of what upstream said.
  const secrets = [
    KEY,
    LIST,
    "api.mailchimp.com",
    "supabase.co",
    hashOf(EMAIL),
    "UPSTREAM-SENTINEL",
    "already a list member",
    "zoom.us",
  ];
  for (const text of [...answered, ...logged]) {
    for (const secret of secrets) {
      expect(text, "upstream or secret text leaked").not.toContain(secret);
    }
  }
  for (const line of logged) {
    expect(line, "a log line carries the address").not.toContain(EMAIL);
  }
  // A response is `{ ok, emailable }` or `{ error }` with an approved
  // sentence — or the empty body of a 404. Nothing else, ever.
  const approved = new Set<string>([
    ...Object.values(COPY.errors),
    COPY.closed.text,
  ]);
  for (const text of answered) {
    if (text === "") continue;
    const reply = parse(text);
    if ("error" in reply) {
      expect(Object.keys(reply)).toEqual(["error"]);
      expect(approved.has(String(reply.error)), `"${reply.error}"`).toBe(true);
    } else {
      expect(Object.keys(reply).sort()).toEqual(["emailable", "ok"]);
    }
  }
  // Every Mailchimp request carried a timeout and stayed on the member.
  for (const call of calls) {
    expect(call.signal, "a call was made without a timeout").toBeInstanceOf(
      AbortSignal,
    );
    expect(
      call.url.startsWith(`${MAILCHIMP}/members/${hashOf(EMAIL)}`),
      "a call left the one member this request is about",
    ).toBe(true);
  }
});

test.describe("S6.1 sign-up route — step 1: dormant is 404 before anything else", () => {
  test("PG-014 no start configured: 404, an empty body, and NO work — not even the limiter", async () => {
    configure(null);

    for (const body of [{}, VALID, { ...VALID, form: "toolkit" }]) {
      const reply = await send(body);
      expect(reply.status).toBe(404);
      expect(reply.text).toBe("");
    }
    // A body that is not JSON is not read either.
    expect((await send(null, "{not json")).status).toBe(404);

    expect(limiterCalls, "a switched-off route consulted the limiter").toEqual(
      [],
    );
    expect(calls).toEqual([]);
  });

  test("PG-014 a start with no usable Zoom address is dormant too", async () => {
    delete process.env.WEBINAR_ZOOM_URL;
    expect((await send(VALID)).status).toBe(404);
    expect(limiterCalls).toEqual([]);
    expect(calls).toEqual([]);
  });
});

test.describe("S6.1 sign-up route — step 2: the rate limit, in a bucket of its own", () => {
  test("PR-007 the limiter is asked once per request, for the 'conversation' bucket, in 60-second windows", async () => {
    expect((await send({ form: "no-such-form" })).status).toBe(400);

    expect(limiterCalls).toHaveLength(1);
    const { p_bucket, p_window_start } = limiterCalls[0]!.body;
    // The bucket is a hash of endpoint + caller: no address is stored.
    expect(p_bucket).toBe(
      crypto
        .createHash("sha256")
        .update(`conversation:${CALLER_IP}`)
        .digest("hex"),
    );
    expect(new Date(String(p_window_start)).getTime() % 60_000).toBe(0);
  });

  test("PR-007 the tenth request in a window is served and the eleventh is refused", async () => {
    limiter = () => json(200, 10);
    expect((await send({ form: "no-such-form" })).status).toBe(400);

    limiter = () => json(200, 11);
    const refused = await send(VALID);
    expect(refused.status).toBe(429);
    expect(parse(refused.text)).toEqual({
      error: COPY.errors.tooManyRequests,
    });
    expect(Number(refused.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(Number(refused.headers.get("retry-after"))).toBeLessThanOrEqual(60);
    // Refused BEFORE the body is used: nothing reached Mailchimp.
    expect(calls).toEqual([]);
  });

  test("PR-007 it fails closed: a limiter that cannot answer refuses the request", async () => {
    limiter = () => json(500, { message: "limiter unavailable" });
    const refused = await send(VALID);
    expect(refused.status).toBe(429);
    expect(Number(refused.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(calls).toEqual([]);
  });
});

test.describe("S6.1 sign-up route — steps 3 and 4: the body, then the validator", () => {
  test("PR-007 a body that is not JSON is a 400, after the limiter and before Mailchimp", async () => {
    const reply = await send(null, "{not json");
    expect(reply.status).toBe(400);
    expect(parse(reply.text)).toEqual({ error: COPY.errors.invalidRequest });
    expect(limiterCalls).toHaveLength(1);
    expect(calls).toEqual([]);
  });

  test("PR-007 each refusal is the validator's own, in its approved sentence", async () => {
    const cases: [unknown, string][] = [
      [[], COPY.errors.invalidRequest],
      [{ ...VALID, form: "newsletter" }, COPY.errors.invalidRequest],
      [{ form: "register" }, COPY.errors.invalidEmail],
      [{ ...VALID, email: "not-an-email" }, COPY.errors.invalidEmail],
      [
        { ...VALID, email: `${"a".repeat(250)}@example.com` },
        COPY.errors.emailTooLong,
      ],
      [{ ...VALID, firstName: "n".repeat(101) }, COPY.errors.nameTooLong],
      [{ ...VALID, firstName: 7 }, COPY.errors.invalidRequest],
    ];
    for (const [body, sentence] of cases) {
      const reply = await send(body);
      expect(reply.status, JSON.stringify(body).slice(0, 60)).toBe(400);
      expect(parse(reply.text)).toEqual({ error: sentence });
    }
    expect(calls, "an invalid payload reached Mailchimp").toEqual([]);
  });

  test("PR-007 a filled anti-spam field gets the same 400 — never a pretend success", async () => {
    const reply = await send({ ...VALID, topic: "filled by a script" });
    expect(reply.status).toBe(400);
    expect(parse(reply.text)).toEqual({ error: COPY.errors.invalidRequest });
    expect(reply.text).not.toContain("ok");
    expect(calls).toEqual([]);
  });

  test("PR-007 a caller cannot name a tag: the server picks it from the form", async () => {
    script(() => member("subscribed"), tagged);
    const reply = await send({
      ...VALID,
      tag: "purchased-course",
      tags: ["premium", "purchased-course"],
      status: "subscribed",
    });
    expect(reply.status).toBe(200);
    expect(calls).toHaveLength(2);
    expect(calls[1]!.body).toEqual({
      tags: [{ name: TAG_REGISTERED, status: "active" }],
    });
    expect(JSON.stringify(calls.map((call) => call.body))).not.toContain(
      "purchased-course",
    );
  });
});

test.describe("S6.1 sign-up route — step 5: from the start, registration is closed", () => {
  test("PG-013 a valid sign-up after the start is a 409 with the closed text, and nothing is sent", async () => {
    configure(PAST_START);
    for (const form of ["register", "toolkit"]) {
      const reply = await send({ ...VALID, form });
      expect(reply.status).toBe(409);
      expect(parse(reply.text)).toEqual({ error: COPY.closed.text });
    }
    expect(calls, "a closed funnel reached Mailchimp").toEqual([]);
  });

  test("PG-013 the order holds when closed: limiter, then the validator's 400, then the 409", async () => {
    configure(PAST_START);
    expect((await send({})).status).toBe(400);
    expect((await send({ ...VALID, email: "nope" })).status).toBe(400);
    expect(limiterCalls).toHaveLength(2);

    limiter = () => json(200, 11);
    expect((await send(VALID)).status).toBe(429);
    expect(calls).toEqual([]);
  });
});

test.describe("S6.1 sign-up route — step 6: Mailchimp not configured is a 503, before any request", () => {
  test("FM-011 either value unset, or a key with no data centre: 503, the fixed message, the NAME logged", async () => {
    const broken: [() => void, string][] = [
      [() => delete process.env.MAILCHIMP_API_KEY, "MAILCHIMP_API_KEY"],
      [() => delete process.env.MAILCHIMP_LIST_ID, "MAILCHIMP_LIST_ID"],
      [
        () => {
          process.env.MAILCHIMP_API_KEY = "dummykeywithnodatacentre";
        },
        "MAILCHIMP_API_KEY",
      ],
      [
        () => {
          process.env.MAILCHIMP_LIST_ID = "   ";
        },
        "MAILCHIMP_LIST_ID",
      ],
    ];

    for (const [breakIt, name] of broken) {
      process.env.MAILCHIMP_API_KEY = KEY;
      process.env.MAILCHIMP_LIST_ID = LIST;
      logged = [];
      breakIt();

      const reply = await send(VALID);
      expect(reply.status, name).toBe(503);
      expect(parse(reply.text)).toEqual({ error: COPY.errors.signUpFailed });
      expect(reply.text).not.toContain("ok");
      expect(
        logged.some((line) => line.includes(name)),
        `the log should name ${name}`,
      ).toBe(true);
      expect(logged.join("\n")).not.toContain("dummykeywithnodatacentre");
    }
    // Decided before any fetch: with a responder that would answer, none ran.
    expect(calls).toEqual([]);
  });

  test("FM-011 an invalid payload is still a 400 when Mailchimp is not configured", async () => {
    delete process.env.MAILCHIMP_API_KEY;
    expect((await send({ ...VALID, email: "nope" })).status).toBe(400);
  });
});

test.describe("S6.1 sign-up route — step 7: every Mailchimp outcome", () => {
  test("FM-011 subscribed: upsert, then the registered tag — ok and emailable", async () => {
    script(() => member("subscribed"), tagged);
    const reply = await send({ ...VALID, email: `  ${EMAIL}  ` });

    expect(reply.status).toBe(200);
    expect(parse(reply.text)).toEqual({ ok: true, emailable: true });
    expect(calls.map((call) => call.method)).toEqual(["PUT", "POST"]);
    expect(calls[0]!.url).toBe(`${MAILCHIMP}/members/${hashOf(EMAIL)}`);
    // `status_if_new`, never `status`: an existing contact keeps its status.
    expect(calls[0]!.body).toEqual({
      email_address: EMAIL,
      status_if_new: "subscribed",
      merge_fields: { FNAME: "Maher" },
    });
    expect(calls[1]!.url).toBe(`${MAILCHIMP}/members/${hashOf(EMAIL)}/tags`);
    expect(calls[1]!.body).toEqual({
      tags: [{ name: TAG_REGISTERED, status: "active" }],
    });
  });

  test("FM-012 the Toolkit form gets the toolkit tag, and only that tag", async () => {
    script(() => member("subscribed"), tagged);
    const reply = await send({ form: "toolkit", email: EMAIL });

    expect(parse(reply.text)).toEqual({ ok: true, emailable: true });
    expect(calls[1]!.body).toEqual({
      tags: [{ name: TAG_TOOLKIT, status: "active" }],
    });
    // No first name was given, so none is sent: an existing one is not blanked.
    expect(calls[0]!.body).toEqual({
      email_address: EMAIL,
      status_if_new: "subscribed",
    });
  });

  test("FM-011 unsubscribed, cleaned, pending, transactional: tagged, NOT emailable, never resubscribed", async () => {
    for (const status of [
      "unsubscribed",
      "cleaned",
      "pending",
      "transactional",
    ]) {
      calls = [];
      script(() => member(status), tagged);
      const reply = await send(VALID);

      expect(reply.status, status).toBe(200);
      expect(parse(reply.text), status).toEqual({ ok: true, emailable: false });
      // Exactly two calls: the upsert and the tag. No third call that sets a
      // status, and no `status` field anywhere.
      expect(calls.map((call) => call.method)).toEqual(["PUT", "POST"]);
      for (const call of calls) expect(call.body).not.toHaveProperty("status");
      expect(calls[1]!.body).toEqual({
        tags: [{ name: TAG_REGISTERED, status: "active" }],
      });
    }
  });

  test("FM-011 archived: ONE update back to subscribed, then the tag — ok and emailable", async () => {
    script(
      () => member("archived"),
      () => member("subscribed"),
      tagged,
    );
    const reply = await send(VALID);

    expect(reply.status).toBe(200);
    expect(parse(reply.text)).toEqual({ ok: true, emailable: true });
    expect(calls.map((call) => call.method)).toEqual(["PUT", "PUT", "POST"]);
    expect(calls[1]!.url).toBe(`${MAILCHIMP}/members/${hashOf(EMAIL)}`);
    expect(calls[1]!.body).toMatchObject({ status: "subscribed" });
    expect(calls[2]!.body).toEqual({
      tags: [{ name: TAG_REGISTERED, status: "active" }],
    });
  });

  test("FM-011 archived, and Mailchimp refuses the update: still tagged, ok, NOT emailable, no retry", async () => {
    const refusals: (() => Response)[] = [
      () => problem(400, "Member In Compliance State"),
      () => member("archived"),
      () => problem(500, "Internal Server Error"),
      () => {
        throw new TypeError(`fetch failed for ${MAILCHIMP}`);
      },
    ];
    for (const refuse of refusals) {
      calls = [];
      script(() => member("archived"), refuse, tagged);
      const reply = await send(VALID);

      expect(reply.status).toBe(200);
      expect(parse(reply.text)).toEqual({ ok: true, emailable: false });
      expect(calls.map((call) => call.method)).toEqual(["PUT", "PUT", "POST"]);
    }
  });

  test("FM-011 a forgotten or compliance-state address: the ONE ok without a tag, not emailable", async () => {
    for (const title of [
      "Forgotten Email Not Subscribed",
      "Member In Compliance State",
    ]) {
      calls = [];
      script(() => problem(400, title));
      const reply = await send(VALID);

      expect(reply.status, title).toBe(200);
      expect(parse(reply.text), title).toEqual({ ok: true, emailable: false });
      // Nobody may add this address by API: there is no contact to tag.
      expect(calls.map((call) => call.method)).toEqual(["PUT"]);
    }
  });

  test("FM-011 an address Mailchimp judges not real: 400 with the 'check your email address' text", async () => {
    script(() =>
      problem(400, "Invalid Resource", {
        errors: [{ field: "email_address", message: UPSTREAM_TEXT }],
      }),
    );
    const reply = await send(VALID);

    expect(reply.status).toBe(400);
    expect(parse(reply.text)).toEqual({ error: COPY.errors.checkEmail });
    expect(calls).toHaveLength(1);
  });

  test("FM-011 any other upsert failure is a 502 with the one fixed message — never a success", async () => {
    const failures: (() => Response)[] = [
      () => problem(400, "Invalid Resource", { errors: [{ field: "FNAME" }] }),
      () => problem(400, "Bad Request"),
      () => problem(401, "API Key Invalid"),
      () => problem(403, "Forbidden"),
      () => problem(404, "Resource Not Found"),
      () => problem(429, "Too Many Requests"),
      () => problem(500, "Internal Server Error"),
      () => new Response("<html>Bad gateway</html>", { status: 502 }),
      () => json(200, { email_address: EMAIL }), // a success that cannot be read
      () => {
        throw new TypeError(`fetch failed for ${MAILCHIMP}`);
      },
    ];
    for (const fail of failures) {
      calls = [];
      script(fail);
      const reply = await send(VALID);

      expect(reply.status).toBe(502);
      expect(parse(reply.text)).toEqual({ error: COPY.errors.signUpFailed });
      // The failed upsert is the only call: nothing is tagged on a guess.
      expect(calls).toHaveLength(1);
    }
  });

  test("FM-011 a sign-up whose tag did not land is NOT a sign-up: 502, whatever the member status", async () => {
    const tagFailures: (() => Response)[] = [
      () => problem(404, "Resource Not Found"),
      () => problem(500, "Internal Server Error"),
      () => {
        throw new TypeError(`fetch failed for ${MAILCHIMP}`);
      },
    ];
    for (const status of ["subscribed", "unsubscribed"]) {
      for (const failTag of tagFailures) {
        calls = [];
        script(() => member(status), failTag);
        const reply = await send(VALID);

        expect(reply.status, status).toBe(502);
        expect(parse(reply.text)).toEqual({ error: COPY.errors.signUpFailed });
        expect(reply.text).not.toContain("emailable");
      }
    }

    // Archived, resubscribed, and THEN the tag fails: still not a sign-up.
    calls = [];
    script(
      () => member("archived"),
      () => member("subscribed"),
      () => problem(500, "Internal Server Error"),
    );
    expect((await send(VALID)).status).toBe(502);
  });
});

/**
 * Sprint S6.2 — draft FEATURE-LIST line IN-009: the webinar report's
 * registration count. The route calls recordSignup
 * (src/lib/webinar/report-store.ts) immediately before each of its two
 * success answers, and nowhere else.
 *
 * Every test here runs with REPORT_SECRET set to an obviously fake value, and
 * with the file's stub wrapped so that it ALSO answers the record function,
 * recording each call. Every other request still goes to the file's stub,
 * which counts one no test scripted — and the file's afterEach, with all its
 * leak checks, still runs after each of these tests.
 */
test.describe("S6.2 — every accepted sign-up is counted for the report, and nothing else is", () => {
  /** Obviously fake, and 40 characters: the counting needs 32 or more. */
  const FAKE_REPORT_SECRET = "dummy-report-secret-not-a-real-one-00000";
  const RECORD = `${SUPABASE}/rest/v1/rpc/record_campaign_person`;

  /**
   * The report's eight keys, typed out on purpose: the link contract is fixed,
   * so a renamed or dropped key must turn this file red.
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
  ];

  /** D-22 test addresses: both prefixes, and the rule ignores case. */
  const TEST_ADDRESSES = [
    "reader+ur-test-s62@example.com",
    "reader+ur-e2e-run-7@example.com",
    "Reader+UR-TEST-Caps@Example.com",
  ];

  type Answer = Awaited<ReturnType<typeof send>>;
  type Answers = (() => Response | Promise<Response>)[];
  type RecordResponder = (call: Recorded) => Response | Promise<Response>;

  /** Each record call, in order. */
  let records: Recorded[] = [];
  /** Every request, in order, by kind — WHEN the record call happens. */
  let sequence: string[] = [];
  /** What the record function answers. The default: done (it returns void). */
  let recorder: RecordResponder = () => new Response(null, { status: 204 });

  /**
   * The keyed code the route must send instead of the address:
   * base64url(HMAC-SHA256(REPORT_SECRET, "conv-person:v1:" + the trimmed,
   * lower-cased address)) — the sprint record, step 5. Typed out, so a
   * change to the code turns this file red.
   */
  function personCode(email: string): string {
    return crypto
      .createHmac("sha256", FAKE_REPORT_SECRET)
      .update(`conv-person:v1:${email.trim().toLowerCase()}`, "utf8")
      .digest("base64url");
  }

  function kindOf(url: string, method: string): string {
    if (url.startsWith(`${SUPABASE}/rest/v1/rpc/increment_rate_limit`)) {
      return "limiter";
    }
    if (url.startsWith(`${SUPABASE}/rest/v1/rate_limits`)) return "sweep";
    if (url.startsWith(`${MAILCHIMP}/`)) return `mailchimp ${method}`;
    return "unexpected";
  }

  /**
   * The same request twice, Mailchimp answering the same way both times:
   * counted (REPORT_SECRET set), then uncounted (unset).
   */
  async function sendTwice(body: unknown, ...answers: Answers) {
    const recordsBefore = records.length;

    calls = [];
    script(...answers);
    const countedLogsFrom = logged.length;
    const counted = await send(body);
    const countedLogs = logged.slice(countedLogsFrom);
    const countedCalls = calls;
    const countedRecords = records.length - recordsBefore;

    delete process.env.REPORT_SECRET;
    calls = [];
    script(...answers);
    const uncountedLogsFrom = logged.length;
    const uncounted = await send(body);
    const uncountedLogs = logged.slice(uncountedLogsFrom);
    const uncountedCalls = calls;
    const uncountedRecords = records.length - recordsBefore - countedRecords;
    process.env.REPORT_SECRET = FAKE_REPORT_SECRET;

    return {
      counted,
      uncounted,
      countedRecords,
      uncountedRecords,
      countedCalls,
      uncountedCalls,
      countedLogs,
      uncountedLogs,
    };
  }

  /** Status, body and headers, byte for byte. */
  function expectSameAnswer(
    actual: Answer,
    expected: Answer,
    label: string,
  ): void {
    expect(actual.status, label).toBe(expected.status);
    expect(actual.text, label).toBe(expected.text);
    expect([...actual.headers], label).toEqual([...expected.headers]);
  }

  test.beforeEach(() => {
    // REPORT_SECRET is in ENV_NAMES: the file's beforeEach cleared it, and
    // the file's afterEach puts back whatever the shell had.
    process.env.REPORT_SECRET = FAKE_REPORT_SECRET;
    records = [];
    sequence = [];
    recorder = () => new Response(null, { status: 204 });

    const fileStub = globalThis.fetch;
    globalThis.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const url =
        typeof input === "string" || input instanceof URL
          ? String(input)
          : input.url;
      const method = init?.method ?? "GET";
      if (url.startsWith(RECORD)) {
        const call: Recorded = {
          url,
          method,
          body: init?.body ? JSON.parse(String(init.body)) : {},
          signal: init?.signal ?? null,
        };
        sequence.push("record");
        records.push(call);
        return recorder(call);
      }
      sequence.push(kindOf(url, method));
      // Everything else is the file's stub's business — including counting
      // a request no test scripted.
      return fileStub(input, init);
    }) as typeof fetch;
  });

  test.afterEach(() => {
    // Every record call: four parameters, a timeout, and never the address
    // or any part of it, in any case.
    const addresses = [EMAIL, ...TEST_ADDRESSES].map((address) =>
      address.toLowerCase(),
    );
    const forbidden = [
      ...addresses,
      ...addresses.map((address) => address.split("@")[0]!),
      hashOf(EMAIL),
    ];
    for (const call of records) {
      expect(call.url, "the record call went somewhere else").toBe(RECORD);
      expect(call.method).toBe("POST");
      expect(
        call.signal,
        "a record call was made without a timeout",
      ).toBeInstanceOf(AbortSignal);
      expect(Object.keys(call.body).sort()).toEqual([
        "p_campaign",
        "p_person",
        "p_registered",
        "p_source",
      ]);
      // The shape migration 0005 enforces on campaign_people.person.
      expect(String(call.body.p_person)).toMatch(/^[A-Za-z0-9_-]{43}$/);
      const sent = JSON.stringify(call.body).toLowerCase();
      for (const text of forbidden) {
        expect(sent, "the record call carried the address").not.toContain(text);
      }
    }
  });

  test("IN-009 a tagged register sign-up is counted once, after Mailchimp, as registered, under the source it carried", async () => {
    let count = 0;
    for (const key of KEYS) {
      calls = [];
      sequence = [];
      script(() => member("subscribed"), tagged);

      const reply = await send({ ...VALID, source: key });
      expect(reply.status, key).toBe(200);
      expect(parse(reply.text), key).toEqual({ ok: true, emailable: true });
      // Once, and last: after the upsert AND the tag have landed.
      expect(sequence, key).toEqual([
        "limiter",
        "sweep",
        "mailchimp PUT",
        "mailchimp POST",
        "record",
      ]);
      count += 1;
      expect(records, key).toHaveLength(count);
      expect(records[count - 1]!.body, key).toEqual({
        p_campaign: "conv1",
        p_person: personCode(EMAIL),
        p_source: key,
        p_registered: true,
      });
    }
  });

  test("IN-009 every other accepted outcome is counted once and last: not emailable, archived, or archived and refused", async () => {
    const PUT = "mailchimp PUT";
    const POST = "mailchimp POST";
    const outcomes: [string, Answers, string[]][] = [
      ["unsubscribed", [() => member("unsubscribed"), tagged], [PUT, POST]],
      ["cleaned", [() => member("cleaned"), tagged], [PUT, POST]],
      ["pending", [() => member("pending"), tagged], [PUT, POST]],
      ["transactional", [() => member("transactional"), tagged], [PUT, POST]],
      [
        "archived, then resubscribed",
        [() => member("archived"), () => member("subscribed"), tagged],
        [PUT, PUT, POST],
      ],
      [
        "archived, and the update refused",
        [
          () => member("archived"),
          () => problem(400, "Member In Compliance State"),
          tagged,
        ],
        [PUT, PUT, POST],
      ],
    ];
    for (const [label, answers, mailchimpCalls] of outcomes) {
      calls = [];
      sequence = [];
      script(...answers);

      const reply = await send({ ...VALID, source: "facebook" });
      expect(reply.status, label).toBe(200);
      expect(sequence, label).toEqual([
        "limiter",
        "sweep",
        ...mailchimpCalls,
        "record",
      ]);
      expect(records[records.length - 1]!.body, label).toEqual({
        p_campaign: "conv1",
        p_person: personCode(EMAIL),
        p_source: "facebook",
        p_registered: true,
      });
    }
    expect(records).toHaveLength(outcomes.length);
  });

  test("IN-009 the Toolkit form is counted as a sign-up, not as a registration", async () => {
    script(() => member("subscribed"), tagged);
    const reply = await send({
      form: "toolkit",
      email: EMAIL,
      source: "instagram",
    });

    expect(parse(reply.text)).toEqual({ ok: true, emailable: true });
    expect(sequence).toEqual([
      "limiter",
      "sweep",
      "mailchimp PUT",
      "mailchimp POST",
      "record",
    ]);
    expect(records).toHaveLength(1);
    expect(records[0]!.body).toEqual({
      p_campaign: "conv1",
      p_person: personCode(EMAIL),
      p_source: "instagram",
      p_registered: false,
    });
  });

  test("IN-009 no source, or one that is not a key, is counted under 'other' and changes nothing else", async () => {
    const bodies: unknown[] = [
      VALID,
      { ...VALID, source: "tiktok" },
      { ...VALID, source: "LinkedIn" },
      { ...VALID, source: "newsletter" },
      { ...VALID, source: "" },
      { ...VALID, source: 42 },
      { ...VALID, source: null },
      { ...VALID, source: ["linkedin"] },
      { ...VALID, source: { key: "linkedin" } },
    ];
    for (const body of bodies) {
      calls = [];
      script(() => member("subscribed"), tagged);

      const reply = await send(body);
      const label = JSON.stringify(body);
      expect(parse(reply.text), label).toEqual({ ok: true, emailable: true });
      expect(records[records.length - 1]!.body, label).toEqual({
        p_campaign: "conv1",
        p_person: personCode(EMAIL),
        p_source: "other",
        p_registered: true,
      });
    }
    expect(records).toHaveLength(bodies.length);
  });

  test("IN-009 the one success without a tag — a forgotten or compliance-state address — is counted once too", async () => {
    for (const title of [
      "Forgotten Email Not Subscribed",
      "Member In Compliance State",
    ]) {
      for (const form of ["register", "toolkit"]) {
        const label = `${title}, ${form}`;
        calls = [];
        sequence = [];
        script(() => problem(400, title));

        const reply = await send({ ...VALID, form, source: "whatsapp" });
        expect(reply.status, label).toBe(200);
        expect(parse(reply.text), label).toEqual({
          ok: true,
          emailable: false,
        });
        expect(sequence, label).toEqual([
          "limiter",
          "sweep",
          "mailchimp PUT",
          "record",
        ]);
        expect(records[records.length - 1]!.body, label).toEqual({
          p_campaign: "conv1",
          p_person: personCode(EMAIL),
          p_source: "whatsapp",
          p_registered: form === "register",
        });
      }
    }
    expect(records).toHaveLength(4);
  });

  test("IN-009 no refusal is ever counted: 400, 404, 409, 429, 502 or 503", async () => {
    const SOURCED = { ...VALID, source: "linkedin" };

    // 400 — the body, then the validator.
    expect((await send(null, "{not json")).status).toBe(400);
    expect((await send({ ...SOURCED, form: "no-such-form" })).status).toBe(400);
    expect((await send({ ...SOURCED, email: "nope" })).status).toBe(400);
    expect(
      (await send({ ...SOURCED, topic: "filled by a script" })).status,
    ).toBe(400);

    // 400 — Mailchimp judged the address not real.
    calls = [];
    script(() =>
      problem(400, "Invalid Resource", {
        errors: [{ field: "email_address", message: UPSTREAM_TEXT }],
      }),
    );
    const checkEmail = await send(SOURCED);
    expect(checkEmail.status).toBe(400);
    expect(parse(checkEmail.text)).toEqual({ error: COPY.errors.checkEmail });

    // 502 — the upsert failed; the tag did not land; archived, resubscribed,
    // and then the tag did not land.
    const upstreamFailures: Answers[] = [
      [() => problem(500, "Internal Server Error")],
      [() => member("subscribed"), () => problem(500, "Internal Server Error")],
      [
        () => member("archived"),
        () => member("subscribed"),
        () => problem(500, "Internal Server Error"),
      ],
    ];
    for (const answers of upstreamFailures) {
      calls = [];
      script(...answers);
      expect((await send(SOURCED)).status).toBe(502);
    }

    // 503 — Mailchimp is not configured.
    delete process.env.MAILCHIMP_API_KEY;
    expect((await send(SOURCED)).status).toBe(503);
    process.env.MAILCHIMP_API_KEY = KEY;

    // 429 — limited, and a limiter that cannot answer.
    limiter = () => json(200, 11);
    expect((await send(SOURCED)).status).toBe(429);
    limiter = () => json(500, { message: "limiter unavailable" });
    expect((await send(SOURCED)).status).toBe(429);
    limiter = () => json(200, 1);

    // 409 — the webinar has started.
    configure(PAST_START);
    expect((await send(SOURCED)).status).toBe(409);

    // 404 — dormant.
    configure(null);
    expect((await send(SOURCED)).status).toBe(404);

    expect(records, "a refusal was counted").toEqual([]);
    expect(sequence).not.toContain("record");
  });

  test("IN-009 counting that works, answers 500, throws, or never answers before its timeout leaves the answer byte-identical", async () => {
    let cutOff = 0;
    const outcomes: [string, RecordResponder, number][] = [
      ["the count is stored", () => new Response(null, { status: 204 }), 0],
      [
        "the record function answers 500",
        () =>
          json(500, {
            code: "42P01",
            message: UPSTREAM_TEXT,
            details: UPSTREAM_TEXT,
            hint: UPSTREAM_TEXT,
          }),
        1,
      ],
      [
        "the record request throws",
        () => {
          throw new TypeError(`fetch failed for ${SUPABASE} ${UPSTREAM_TEXT}`);
        },
        1,
      ],
      [
        "the record request never answers",
        (call) =>
          new Promise<Response>((_, reject) => {
            const signal = call.signal;
            if (!signal) {
              // The afterEach names the missing timeout; do not hang the run.
              reject(new TypeError("no timeout on the record call"));
              return;
            }
            signal.addEventListener(
              "abort",
              () => {
                const reason = signal.reason as { name?: unknown } | undefined;
                if (reason?.name === "TimeoutError") cutOff += 1;
                reject(signal.reason);
              },
              { once: true },
            );
          }),
        1,
      ],
    ];
    // The two places a sign-up is accepted.
    const successes: [string, Answers, boolean][] = [
      ["tagged", [() => member("subscribed"), tagged], true],
      [
        "an address Mailchimp may not add",
        [() => problem(400, "Member In Compliance State")],
        false,
      ],
    ];

    for (const [outcome, respond, logLines] of outcomes) {
      for (const [point, answers, emailable] of successes) {
        const label = `${outcome}, ${point}`;
        recorder = respond;

        const started = Date.now();
        const run = await sendTwice(
          { ...VALID, source: "linkedin" },
          ...answers,
        );
        expect(
          Date.now() - started,
          `${label}: the visitor was kept waiting`,
        ).toBeLessThan(10_000);

        expect(run.countedRecords, label).toBe(1);
        expect(run.uncountedRecords, label).toBe(0);
        expectSameAnswer(run.counted, run.uncounted, label);
        expect(parse(run.counted.text), label).toEqual({ ok: true, emailable });
        // The log is the uncounted request's log — the route's own lines,
        // unchanged — plus, for a failure, ONE line at the end naming a code
        // or an error's name: nothing from upstream.
        expect(
          run.countedLogs.slice(0, run.uncountedLogs.length),
          label,
        ).toEqual(run.uncountedLogs);
        const added = run.countedLogs.slice(run.uncountedLogs.length);
        expect(added, label).toHaveLength(logLines);
        for (const line of added) {
          expect(line, label).toMatch(
            /^Sign-up not counted for the report: [A-Za-z0-9_]+\.$/,
          );
        }
      }
    }
    expect(
      cutOff,
      "the record call that never answered must end on its own timeout",
    ).toBe(successes.length);
  });

  test("IN-009 a +ur-test- or +ur-e2e- address is never counted, and gets the same answer", async () => {
    for (const address of TEST_ADDRESSES) {
      const run = await sendTwice(
        { ...VALID, email: address, source: "linkedin" },
        () => member("subscribed"),
        tagged,
      );
      expect(run.countedRecords, address).toBe(0);
      expect(run.uncountedRecords, address).toBe(0);
      expectSameAnswer(run.counted, run.uncounted, address);
      expect(parse(run.counted.text), address).toEqual({
        ok: true,
        emailable: true,
      });
      // The file's afterEach pins every Mailchimp call to EMAIL's member;
      // these went to the test address's own, so that check is made here.
      for (const call of [...run.countedCalls, ...run.uncountedCalls]) {
        expect(call.signal, address).toBeInstanceOf(AbortSignal);
        expect(
          call.url.startsWith(
            `${MAILCHIMP}/members/${hashOf(address.toLowerCase())}`,
          ),
          address,
        ).toBe(true);
      }
    }
    expect(sequence, "a test sign-up reached the report").not.toContain(
      "record",
    );
    expect(logged, "a test sign-up was logged").toEqual([]);

    // The control: the same sign-up from an ordinary address IS counted, so
    // the zero above is the rule's doing.
    calls = [];
    script(() => member("subscribed"), tagged);
    expect((await send({ ...VALID, source: "linkedin" })).status).toBe(200);
    expect(records).toHaveLength(1);
  });

  test("IN-009 one person is one code, whatever the spelling or the form, so the database can keep their first source", async () => {
    const signUps: unknown[] = [
      { ...VALID, email: "  Reader@Example.COM  ", source: "linkedin" },
      { form: "toolkit", email: EMAIL, source: "instagram" },
      { ...VALID, email: EMAIL.toUpperCase() },
    ];
    for (const body of signUps) {
      calls = [];
      script(() => member("subscribed"), tagged);
      expect((await send(body)).status).toBe(200);
    }

    expect(records.map((call) => call.body.p_person)).toEqual(
      signUps.map(() => personCode(EMAIL)),
    );
    // Each call names the source of ITS sign-up; record_campaign_person keeps
    // the person's first one (migration 0005).
    expect(records.map((call) => call.body.p_source)).toEqual([
      "linkedin",
      "instagram",
      "other",
    ]);
    expect(records.map((call) => call.body.p_registered)).toEqual([
      true,
      false,
      true,
    ]);
  });

  test("IN-009 with REPORT_SECRET unset or too short the counting is off: no record call, and the same requests as S6.1", async () => {
    const settings: [string, string | undefined][] = [
      ["unset", undefined],
      ["31 characters", FAKE_REPORT_SECRET.slice(0, 31)],
    ];
    for (const [label, value] of settings) {
      if (value === undefined) delete process.env.REPORT_SECRET;
      else process.env.REPORT_SECRET = value;
      calls = [];
      sequence = [];
      script(() => member("subscribed"), tagged);

      const reply = await send({ ...VALID, source: "linkedin" });
      expect(parse(reply.text), label).toEqual({ ok: true, emailable: true });
      expect(sequence, label).toEqual([
        "limiter",
        "sweep",
        "mailchimp PUT",
        "mailchimp POST",
      ]);
    }
    expect(records).toEqual([]);
  });
});

test.describe("PR-007 — only this site's own page can sign up (S6.2, D-67: the gap the Codex review found in the visit counter)", () => {
  /** This site, as src/lib/auth/safe-origin.ts sees it outside Production. */
  const OWN = "http://localhost:3000";

  test("PR-007 a sign-up from another site's page is refused with 403 and the approved sentence, before the limiter: nothing reaches Mailchimp", async () => {
    const cases: [string, { origin?: string; fetchSite?: string }][] = [
      ["an Origin that is not this site", { origin: "https://evil.example" }],
      ["an opaque Origin", { origin: "null" }],
      ["Sec-Fetch-Site: cross-site, no Origin", { fetchSite: "cross-site" }],
      [
        "this site's Origin, but Sec-Fetch-Site: cross-site",
        { origin: OWN, fetchSite: "cross-site" },
      ],
    ];
    for (const [label, headers] of cases) {
      const reply = await send(VALID, undefined, headers);
      expect(reply.status, label).toBe(403);
      expect(parse(reply.text), label).toEqual({
        error: COPY.errors.invalidRequest,
      });
    }
    expect(limiterCalls, "the limiter was asked").toHaveLength(0);
    expect(calls, "Mailchimp was called").toHaveLength(0);
  });

  test("PR-007 a body not declared as JSON is refused with 415 before the limiter — even a valid sign-up sent as plain text", async () => {
    const cases: [string, string | null][] = [
      [
        "text/plain, as another site's page can send without asking",
        "text/plain",
      ],
      ["a form", "application/x-www-form-urlencoded"],
      ["no content type", null],
    ];
    for (const [label, contentType] of cases) {
      const reply = await send(VALID, undefined, { contentType });
      expect(reply.status, label).toBe(415);
      expect(parse(reply.text), label).toEqual({
        error: COPY.errors.invalidRequest,
      });
    }
    expect(limiterCalls, "the limiter was asked").toHaveLength(0);
    expect(calls, "Mailchimp was called").toHaveLength(0);
  });

  test("PR-007 the site's own form passes both checks: its Origin, same-origin, JSON — on to the limiter and the validator", async () => {
    const reply = await send({ form: "no-such-form" }, undefined, {
      origin: OWN,
      fetchSite: "same-origin",
      contentType: "application/json; charset=utf-8",
    });
    expect(reply.status).toBe(400);
    expect(limiterCalls, "the limiter was not asked").toHaveLength(1);
    expect(calls).toHaveLength(0);
  });

  test("PR-007 dormant still comes first: another site's request to a switched-off funnel is a bodiless 404", async () => {
    configure(null);
    const reply = await send(VALID, undefined, {
      origin: "https://evil.example",
      contentType: "text/plain",
    });
    expect(reply.status).toBe(404);
    expect(reply.text).toBe("");
    expect(limiterCalls).toHaveLength(0);
  });
});
