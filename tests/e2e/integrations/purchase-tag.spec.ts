import crypto from "crypto";
import type Stripe from "stripe";
import { test, expect } from "../fixtures";
import { grantFromSession } from "../../../src/app/api/stripe/webhook/route";
import { DEFAULT_TIMEOUT_MS } from "../../../src/lib/mailchimp/client";
import { CAMPAIGN } from "../../../src/lib/webinar/config";
import { STRIPE_APP_ID } from "@/lib/stripe/checkout";

/**
 * Sprint S6.1 — FEATURE-LIST line IN-007: a course or Premium purchase marks
 * the buyer `purchased-course` in Mailchimp, and can never break a paid grant.
 *
 * WHY THIS IS A FUNCTION-LEVEL SPEC. For the reason webhook-fulfilment.spec.ts
 * gives — the branch sits behind a Stripe signature the runner cannot produce
 * — and for a second one that is about safety: one live Mailchimp audience
 * serves Production, Preview and local (D-22), so a test that let the webhook
 * make its real request would write to the owner's real list. Nothing here
 * does. `globalThis.fetch` is replaced before every test by a recording stub
 * that FAILS the test if it is called without a scripted answer, and the two
 * Mailchimp values are set to obviously fake strings whose data centre
 * ("us99") is not one this project uses. Both are put back in afterEach:
 * Playwright reuses a worker across files, and webhook-fulfilment.spec.ts
 * imports the same route into the same process.
 *
 * What the tag must NOT be able to do is most of this file. The entitlement
 * is already written when the tag is attempted, so every way Mailchimp can
 * misbehave — a refusal, a thrown fetch, an answer that never comes — has to
 * end in "granted".
 */

const KEY = "dummykey-us99";
const LIST = "dummylist00";
const BASE = `https://us99.api.mailchimp.com/3.0/lists/${LIST}`;
const BUYER = "buyer@example.com";

/**
 * Typed out on purpose rather than read from the config: the saved segment
 * "Conv1 - Registered, not bought" is built on this exact name, so a renamed
 * constant must turn this file red instead of quietly following it.
 */
const PURCHASED = "purchased-course";

function hashOf(email: string): string {
  return crypto.createHash("md5").update(email).digest("hex");
}

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
let calls: Recorded[] = [];
let logged: string[] = [];
/** "upsert" and "fetch", in the order they happened. */
let events: string[] = [];
let unscripted = 0;

/** Script the upstream answers. Anything unscripted fails the test. */
function stubFetch(
  responder: (call: Recorded, index: number) => Response | Promise<Response>,
): void {
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const call: Recorded = {
      url: String(input),
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : {},
      signal: init?.signal ?? null,
    };
    calls.push(call);
    events.push("fetch");
    return responder(call, calls.length - 1);
  }) as typeof fetch;
}

const noContent = () => new Response(null, { status: 204 });

/** Mailchimp's problem-detail shape. */
function problem(status: number, title: string): Response {
  return new Response(
    JSON.stringify({ title, status, detail: `${BUYER} — upstream detail` }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

/** Does this request add the purchase tag? */
function namesPurchaseTag(call: Recorded): boolean {
  const tags = call.body.tags;
  return (
    Array.isArray(tags) &&
    tags.some((tag) => (tag as { name?: unknown } | null)?.name === PURCHASED)
  );
}

type Row = Record<string, unknown>;

/**
 * The same recording stand-in for the Supabase admin client that
 * webhook-fulfilment.spec.ts uses, reduced to the one call a grant makes. Any
 * other call throws rather than returning a plausible answer.
 */
type AdminOptions = { upsertError?: { code?: string } | null };

function stubAdmin(options: AdminOptions = {}) {
  const upserts: Row[] = [];
  const client = {
    from(table: string) {
      if (table !== "entitlements") {
        throw new Error(`unexpected table "${table}"`);
      }
      return {
        upsert(row: Row) {
          upserts.push(row);
          events.push("upsert");
          return Promise.resolve({ error: options.upsertError ?? null });
        },
      };
    },
  };
  return {
    upserts,
    client: client as unknown as Parameters<typeof grantFromSession>[0],
  };
}

/** A paid Checkout Session of ours, for the given product. */
function session(
  product: "course" | "premium",
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "cs_test_s61",
    payment_status: "paid",
    customer: "cus_test_s61",
    subscription: product === "premium" ? "sub_test_s61" : null,
    metadata: {
      supabase_user_id: "11111111-2222-3333-4444-555555555555",
      product,
      app: STRIPE_APP_ID,
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

/** The usual buyer: the address Stripe collected at checkout. */
const withBuyer = { customer_details: { email: BUYER } };

test.beforeEach(() => {
  for (const name of ["MAILCHIMP_API_KEY", "MAILCHIMP_LIST_ID"]) {
    savedEnv.set(name, process.env[name]);
  }
  process.env.MAILCHIMP_API_KEY = KEY;
  process.env.MAILCHIMP_LIST_ID = LIST;

  calls = [];
  logged = [];
  events = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  // The default: no test may reach the network by accident. The code under
  // test contains a thrown fetch by design, so the throw alone would be
  // swallowed; the counter is what afterEach fails the test on.
  unscripted = 0;
  stubFetch(() => {
    unscripted += 1;
    throw new Error("unscripted network call");
  });
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

  for (const call of calls) {
    if (!namesPurchaseTag(call)) continue;
    // Every purchase-tag request is a tags-only POST, and carries a timeout.
    expect(call.method).toBe("POST");
    expect(call.url.startsWith(`${BASE}/members/`)).toBe(true);
    expect(call.url.endsWith("/tags")).toBe(true);
    expect(
      call.signal,
      "the tag call was made without a timeout",
    ).toBeInstanceOf(AbortSignal);
  }

  // The purchase tag logs a status code or an error NAME, never more. Lines
  // written by tagPremiumMember are left out: it logs the whole error object,
  // it is older than this sprint, and this sprint may not edit it.
  for (const line of logged) {
    if (line.startsWith("Mailchimp premium tag failed")) continue;
    for (const secret of [
      KEY,
      LIST,
      "api.mailchimp.com",
      BUYER,
      hashOf(BUYER),
      "upstream detail",
    ]) {
      expect(line, "a log line leaked upstream or secret text").not.toContain(
        secret,
      );
    }
  }
});

test.describe("IN-007 — a purchase marks the buyer in Mailchimp", () => {
  test("IN-007 a course purchase sends exactly one request: a tags-only POST naming purchased-course", async () => {
    expect(CAMPAIGN.tags.purchased).toBe(PURCHASED);
    stubFetch(noContent);
    const admin = stubAdmin();

    const outcome = await grantFromSession(
      admin.client,
      // Mixed case and stray spaces: Mailchimp identifies a contact by the
      // hash of the trimmed, lowercased address.
      session("course", { customer_details: { email: " Buyer@Example.com " } }),
      "evt_course_tag",
    );

    expect(outcome).toBe("granted");
    expect(admin.upserts).toHaveLength(1);

    expect(calls, "exactly one request").toHaveLength(1);
    const [call] = calls;
    expect(call.method).toBe("POST");
    expect(call.url).toBe(`${BASE}/members/${hashOf(BUYER)}/tags`);
    expect(call.body).toEqual({
      tags: [{ name: PURCHASED, status: "active" }],
    });
    // No member upsert: paying must never ADD anyone to the audience.
    expect(calls.filter((made) => made.method === "PUT")).toEqual([]);
    expect(JSON.stringify(call.body)).not.toContain("status_if_new");
    expect(JSON.stringify(call.body)).not.toContain("email_address");
    // The entitlement is written first; the tag is only ever attempted after.
    expect(events).toEqual(["upsert", "fetch"]);
    // And the helper is still called the way the route calls it.
    expect(grantFromSession).toHaveLength(3);
  });

  test("IN-007 a Premium purchase is marked too — once, after the premium block's own calls", async () => {
    // Premium includes the course, so a Premium buyer must leave the sales
    // e-mails as well. tagPremiumMember's own PUT and POST are tolerated here,
    // whatever they are; what is asserted is the one request this sprint adds.
    stubFetch((call) =>
      call.method === "PUT"
        ? new Response(JSON.stringify({ status: "subscribed" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        : noContent(),
    );
    const admin = stubAdmin();

    const outcome = await grantFromSession(
      admin.client,
      session("premium", withBuyer),
      "evt_premium_tag",
    );

    expect(outcome).toBe("granted");
    expect(admin.upserts).toHaveLength(1);

    const purchase = calls.filter(namesPurchaseTag);
    expect(purchase, "exactly one purchased-course request").toHaveLength(1);
    expect(purchase[0].method).toBe("POST");
    expect(purchase[0].url).toBe(`${BASE}/members/${hashOf(BUYER)}/tags`);
    expect(purchase[0].body).toEqual({
      tags: [{ name: PURCHASED, status: "active" }],
    });
    // It comes after the existing premium block, not before or inside it.
    expect(calls[calls.length - 1]).toBe(purchase[0]);
    expect(events[0]).toBe("upsert");
  });

  test("IN-007 the address is the one Stripe collected, then the one the session was created with", async () => {
    stubFetch(noContent);

    await grantFromSession(
      stubAdmin().client,
      session("course", {
        customer_details: { email: "typed-at-checkout@example.com" },
        customer_email: "account@example.com",
      }),
      "evt_both_addresses",
    );
    await grantFromSession(
      stubAdmin().client,
      session("course", {
        customer_details: { email: null },
        customer_email: "account@example.com",
      }),
      "evt_details_null",
    );
    await grantFromSession(
      stubAdmin().client,
      session("course", { customer_email: "account@example.com" }),
      "evt_no_details",
    );

    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/members/${hashOf("typed-at-checkout@example.com")}/tags`,
      `${BASE}/members/${hashOf("account@example.com")}/tags`,
      `${BASE}/members/${hashOf("account@example.com")}/tags`,
    ]);
  });
});

test.describe("IN-007 — the tag is skipped without a request when it cannot apply", () => {
  test("IN-007 no address means no request, and the grant stands", async () => {
    for (const product of ["course", "premium"] as const) {
      for (const overrides of [
        {},
        { customer_details: null, customer_email: null },
        { customer_details: { email: null }, customer_email: null },
        { customer_details: {} },
        { customer_details: { email: "" } },
        { customer_email: "" },
      ]) {
        const admin = stubAdmin();
        const outcome = await grantFromSession(
          admin.client,
          session(product, overrides),
          "evt_no_address",
        );
        expect(outcome, `${product} ${JSON.stringify(overrides)}`).toBe(
          "granted",
        );
        expect(admin.upserts).toHaveLength(1);
      }
    }
    // A blank address reaches only the new call, which refuses it itself.
    expect(
      await grantFromSession(
        stubAdmin().client,
        session("course", { customer_details: { email: "   " } }),
        "evt_blank_address",
      ),
    ).toBe("granted");

    expect(calls, "no request of any kind").toEqual([]);
  });

  test("IN-007 either Mailchimp value unset means no request, and the grant stands", async () => {
    const unusable: Array<[string, string | undefined]> = [
      ["MAILCHIMP_API_KEY", undefined],
      ["MAILCHIMP_API_KEY", ""],
      ["MAILCHIMP_LIST_ID", undefined],
      ["MAILCHIMP_LIST_ID", ""],
      // A key with no data-centre suffix has no host to be sent to.
      ["MAILCHIMP_API_KEY", "nosuffixatall"],
    ];
    for (const [name, value] of unusable) {
      process.env.MAILCHIMP_API_KEY = KEY;
      process.env.MAILCHIMP_LIST_ID = LIST;
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;

      for (const product of ["course", "premium"] as const) {
        const admin = stubAdmin();
        const outcome = await grantFromSession(
          admin.client,
          session(product, withBuyer),
          "evt_not_configured",
        );
        expect(outcome, `${product}, ${name}=${String(value)}`).toBe("granted");
        expect(admin.upserts).toHaveLength(1);
      }
    }
    expect(calls, "no request of any kind").toEqual([]);
  });

  test("IN-007 an event that grants nothing tags nothing", async () => {
    // The tag says "this person has bought". It may only follow a grant.
    const refused: Array<[Stripe.Checkout.Session, AdminOptions, string]> = [
      [
        session("course", { ...withBuyer, payment_status: "unpaid" }),
        {},
        "ignored",
      ],
      [
        session("course", {
          ...withBuyer,
          metadata: {
            supabase_user_id: "11111111-2222-3333-4444-555555555555",
            product: "course",
            app: "some-other-project",
          },
        }),
        {},
        "ignored",
      ],
      [
        session("course", {
          ...withBuyer,
          metadata: {
            supabase_user_id: "11111111-2222-3333-4444-555555555555",
            product: "tote-bag",
            app: STRIPE_APP_ID,
          },
        }),
        {},
        "ignored",
      ],
      // The write failed: Stripe will retry, and the retry tags.
      [
        session("course", withBuyer),
        { upsertError: { code: "40001" } },
        "retry",
      ],
      [
        session("premium", withBuyer),
        { upsertError: { code: "40001" } },
        "retry",
      ],
      // Not a user of this project.
      [
        session("course", withBuyer),
        { upsertError: { code: "23503" } },
        "ignored",
      ],
    ];
    for (const [checkout, adminOptions, expected] of refused) {
      const outcome = await grantFromSession(
        stubAdmin(adminOptions).client,
        checkout,
        "evt_no_grant",
      );
      expect(outcome).toBe(expected);
    }
    expect(calls, "no request of any kind").toEqual([]);
  });
});

test.describe("IN-007 — nothing Mailchimp does can break a paid grant", () => {
  test("IN-007 whatever Mailchimp answers, the grant stands and the tag is tried once", async () => {
    const answers: Array<() => Response> = [
      noContent,
      // The buyer is not in the audience: the ordinary case for a tags-only
      // call, and the reason it is one.
      () => problem(404, "Resource Not Found"),
      () => problem(400, "Invalid Resource"),
      () => problem(401, "API Key Invalid"),
      () => problem(403, "Forbidden"),
      () => problem(429, "TooManyRequests"),
      () => problem(500, "InternalServerError"),
      () => new Response("<html>bad gateway</html>", { status: 502 }),
    ];
    for (const respond of answers) {
      calls = [];
      stubFetch(respond);
      const admin = stubAdmin();
      const outcome = await grantFromSession(
        admin.client,
        session("course", withBuyer),
        "evt_any_answer",
      );
      expect(outcome).toBe("granted");
      expect(admin.upserts).toHaveLength(1);
      expect(calls, "one attempt, never a retry").toHaveLength(1);
    }
    // A refusal is logged by its status code only.
    expect(logged.join("\n")).toContain("HTTP 404");
    expect(logged.join("\n")).not.toContain("Resource Not Found");
  });

  test("IN-007 a fetch that throws still yields granted, and only the error's name is logged", async () => {
    stubFetch((call) => {
      // A real fetch failure can quote the URL — and so the audience id.
      throw new TypeError(`fetch failed: ${call.url}`);
    });
    expect(
      await grantFromSession(
        stubAdmin().client,
        session("course", withBuyer),
        "evt_fetch_throws",
      ),
    ).toBe("granted");
    expect(calls).toHaveLength(1);
    expect(logged.join("\n")).toContain("TypeError");
    expect(logged.join("\n")).not.toContain("fetch failed");

    // Something thrown that is not an Error at all.
    stubFetch(() => {
      throw `string thrown with ${KEY}`;
    });
    expect(
      await grantFromSession(
        stubAdmin().client,
        session("course", withBuyer),
        "evt_fetch_throws_string",
      ),
    ).toBe("granted");
  });

  test("IN-007 a Premium grant survives every Mailchimp call failing", async () => {
    stubFetch(() => {
      throw new TypeError("fetch failed");
    });
    const admin = stubAdmin();
    expect(
      await grantFromSession(
        admin.client,
        session("premium", withBuyer),
        "evt_premium_all_fail",
      ),
    ).toBe("granted");
    expect(admin.upserts).toHaveLength(1);
    // The premium block failing does not stop the purchase tag being tried.
    expect(calls.filter(namesPurchaseTag)).toHaveLength(1);
  });

  test("IN-007 a Mailchimp that never answers is cut off by the timeout, and the grant stands", async () => {
    // Never answers; settles only when the call's own signal aborts. A course
    // purchase, because the older premium block has no timeout of its own.
    stubFetch(
      (call) =>
        new Promise<Response>((_resolve, reject) => {
          call.signal?.addEventListener("abort", () =>
            reject(call.signal?.reason),
          );
        }),
    );
    const admin = stubAdmin();
    const started = Date.now();
    const outcome = await grantFromSession(
      admin.client,
      session("course", withBuyer),
      "evt_hung_upstream",
    );
    const elapsed = Date.now() - started;

    expect(outcome).toBe("granted");
    expect(admin.upserts).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
    // Held for the client's limit and no longer — far inside the time Stripe
    // allows a webhook to answer.
    expect(elapsed).toBeLessThan(DEFAULT_TIMEOUT_MS + 3000);
    expect(logged.join("\n")).toContain("TimeoutError");
  });

  test("IN-007 an address the client was never written for cannot break the grant", async () => {
    // Stripe sends a string or null. This is the second layer being tested:
    // if the tag call itself ever throws, the webhook contains it.
    for (const email of [12345, { toString: () => BUYER }, [BUYER], true]) {
      const admin = stubAdmin();
      const outcome = await grantFromSession(
        admin.client,
        session("course", { customer_details: { email } }),
        "evt_unexpected_address",
      );
      expect(outcome, `email ${JSON.stringify(email)}`).toBe("granted");
      expect(admin.upserts).toHaveLength(1);
    }
    expect(calls, "no request of any kind").toEqual([]);
  });
});
