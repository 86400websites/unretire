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
): Promise<{ status: number; text: string; headers: Headers }> {
  const response = await POST(
    new NextRequest("http://localhost:3000/api/conversation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": CALLER_IP,
      },
      body: raw ?? JSON.stringify(body),
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
