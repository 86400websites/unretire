import crypto from "crypto";
import { test, expect } from "../fixtures";
import {
  addTags,
  mailchimpConfigured,
  mailchimpMissingEnv,
  resubscribeArchived,
  upsertMember,
} from "../../../src/lib/mailchimp/client";

/**
 * Sprint S6.1 — the Mailchimp client, every branch, with NO request ever
 * leaving this machine.
 *
 * One live audience serves Production, Preview and local (D-22), so a spec
 * that reached Mailchimp would write to the owner's real list. This file
 * therefore never does: `globalThis.fetch` is replaced before every test by a
 * stub that FAILS the test if it is called without a scripted answer, and the
 * two configuration values are set to obviously fake strings whose data
 * centre ("us99") is not one this project uses. Both are put back in
 * afterEach — Playwright reuses a worker across files, and
 * tests/e2e/integrations/ imports the webhook into the same process.
 *
 * What is proven here cannot be seen over HTTP at all: which outcome each
 * upstream answer is turned into, and that nothing from upstream — a body, a
 * title, a URL, an error message — reaches a return value or a log line.
 */

const KEY = "dummy-not-a-real-key-us99";
const LIST = "dummylist00";
const EMAIL = "reader@example.com";
const BASE = `https://us99.api.mailchimp.com/3.0/lists/${LIST}`;

/** Planted in scripted upstream bodies; must never be seen again. */
const UPSTREAM_TEXT =
  "UPSTREAM-SENTINEL reader@example.com is already a list member";

function hashOf(email: string): string {
  return crypto.createHash("md5").update(email).digest("hex");
}

type Recorded = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  signal: AbortSignal | null;
};

const realFetch = globalThis.fetch;
const realError = console.error;
const realWarn = console.warn;
const savedEnv = new Map<string, string | undefined>();
let calls: Recorded[] = [];
let logged: string[] = [];
let unscripted = 0;

/** Script the next upstream answers. Anything unscripted fails the test. */
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
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: init?.body ? JSON.parse(String(init.body)) : {},
      signal: init?.signal ?? null,
    };
    calls.push(call);
    return responder(call, calls.length - 1);
  }) as typeof fetch;
}

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

test.beforeEach(() => {
  for (const name of ["MAILCHIMP_API_KEY", "MAILCHIMP_LIST_ID"]) {
    savedEnv.set(name, process.env[name]);
  }
  process.env.MAILCHIMP_API_KEY = KEY;
  process.env.MAILCHIMP_LIST_ID = LIST;

  calls = [];
  logged = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  // The default: no test may reach the network by accident. The client
  // contains a thrown fetch by design, so the throw alone would be swallowed;
  // the counter is what afterEach fails the test on.
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

  // Checked after EVERY test, whatever it scripted: no log line may carry
  // the key, the audience id, the host, the address or anything upstream said.
  for (const line of logged) {
    for (const secret of [
      KEY,
      LIST,
      "api.mailchimp.com",
      EMAIL,
      hashOf(EMAIL),
      "UPSTREAM-SENTINEL",
      "already a list member",
    ]) {
      expect(line, "a log line leaked upstream or secret text").not.toContain(
        secret,
      );
    }
  }
  // Every request that was made carried a timeout signal.
  for (const call of calls) {
    expect(call.signal, "a call was made without a timeout").toBeInstanceOf(
      AbortSignal,
    );
    expect(call.url.startsWith(`${BASE}/members/`)).toBe(true);
  }
});

test.describe("S6.1 Mailchimp client — configuration is read lazily and fails closed", () => {
  test("configured only when both values are set and the key names a data centre", () => {
    expect(mailchimpConfigured()).toBe(true);
    expect(mailchimpMissingEnv()).toBeNull();

    const broken: Array<[string, string | undefined, string]> = [
      ["MAILCHIMP_API_KEY", undefined, "MAILCHIMP_API_KEY"],
      ["MAILCHIMP_API_KEY", "", "MAILCHIMP_API_KEY"],
      ["MAILCHIMP_API_KEY", "   ", "MAILCHIMP_API_KEY"],
      // No data-centre suffix: there is no host to send it to.
      ["MAILCHIMP_API_KEY", "nosuffixatall", "MAILCHIMP_API_KEY"],
      ["MAILCHIMP_API_KEY", "trailing-hyphen-", "MAILCHIMP_API_KEY"],
      // A suffix that is not a data centre must never choose the host.
      ["MAILCHIMP_API_KEY", "key-evil.example/x", "MAILCHIMP_API_KEY"],
      ["MAILCHIMP_API_KEY", "key-us99.evil.example", "MAILCHIMP_API_KEY"],
      ["MAILCHIMP_LIST_ID", undefined, "MAILCHIMP_LIST_ID"],
      ["MAILCHIMP_LIST_ID", "  ", "MAILCHIMP_LIST_ID"],
    ];
    for (const [name, value, expected] of broken) {
      process.env.MAILCHIMP_API_KEY = KEY;
      process.env.MAILCHIMP_LIST_ID = LIST;
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
      expect(mailchimpConfigured(), `${name}=${String(value)}`).toBe(false);
      // The NAME of what is wrong — never a value.
      expect(mailchimpMissingEnv()).toBe(expected);
    }
  });

  test("when it is not configured, no function makes a request", async () => {
    delete process.env.MAILCHIMP_API_KEY;
    expect(await upsertMember(EMAIL, "Maher")).toEqual({
      kind: "error",
      httpStatus: null,
    });
    expect(await resubscribeArchived(EMAIL)).toBe(false);
    expect(await addTags(EMAIL, ["conv1-registered"])).toBe(false);

    process.env.MAILCHIMP_API_KEY = "key-evil.example/x";
    expect((await upsertMember(EMAIL, "Maher")).kind).toBe("error");
    expect(await addTags(EMAIL, ["conv1-registered"])).toBe(false);

    expect(calls).toEqual([]);
  });

  test("a value set after import is picked up: nothing is read at load time", async () => {
    delete process.env.MAILCHIMP_LIST_ID;
    expect(mailchimpConfigured()).toBe(false);
    process.env.MAILCHIMP_LIST_ID = LIST;
    stubFetch(() => new Response(null, { status: 204 }));
    expect(await addTags(EMAIL, ["conv1-toolkit"])).toBe(true);
    expect(calls).toHaveLength(1);
  });
});

test.describe("S6.1 Mailchimp client — upsertMember", () => {
  test("the request: PUT by address hash, subscribed only IF NEW, first name", async () => {
    stubFetch(() => json(200, { status: "subscribed" }));
    const result = await upsertMember("  Reader@Example.com ", "  Maher ");

    expect(result).toEqual({
      kind: "ok",
      status: "subscribed",
      httpStatus: 200,
    });
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call.method).toBe("PUT");
    // The hash is of the trimmed, lowercased address.
    expect(call.url).toBe(`${BASE}/members/${hashOf(EMAIL)}`);
    expect(call.body).toEqual({
      email_address: "Reader@Example.com",
      status_if_new: "subscribed",
      merge_fields: { FNAME: "Maher" },
    });
    // `status` would overwrite an existing contact's own choice.
    expect(call.body).not.toHaveProperty("status");
    expect(call.headers.Authorization).toBe(`Bearer ${KEY}`);
  });

  test("no first name means no merge fields — an existing name is not blanked", async () => {
    stubFetch(() => json(200, { status: "subscribed" }));
    await upsertMember(EMAIL, "");
    await upsertMember(EMAIL, "   ");
    for (const call of calls) {
      expect(call.body).not.toHaveProperty("merge_fields");
    }
  });

  test("every member status comes back as itself", async () => {
    for (const status of [
      "subscribed",
      "unsubscribed",
      "cleaned",
      "pending",
      "transactional",
      "archived",
    ] as const) {
      stubFetch(() =>
        json(200, {
          id: "x",
          email_address: EMAIL,
          status,
          detail: UPSTREAM_TEXT,
        }),
      );
      const result = await upsertMember(EMAIL, "Maher");
      expect(result).toEqual({ kind: "ok", status, httpStatus: 200 });
    }
  });

  test("a success that cannot be read is NOT reported as a success", async () => {
    const unreadable: Array<() => Response> = [
      () => json(200, { status: "something-new" }),
      () => json(200, {}),
      () => json(200, null),
      () => json(200, [{ status: "subscribed" }]),
      () => json(200, { status: 1 }),
      () => new Response("<html>gateway</html>", { status: 200 }),
      () => new Response(null, { status: 204 }),
    ];
    for (const respond of unreadable) {
      stubFetch(respond);
      const result = await upsertMember(EMAIL, "Maher");
      expect(result.kind).toBe("error");
    }
  });

  test("400 — a forgotten address or one in a compliance state is refused-address", async () => {
    for (const title of [
      "Forgotten Email Not Subscribed",
      "Member In Compliance State",
      // Matched without regard to case or stray spacing.
      "member in compliance state",
      "  FORGOTTEN EMAIL NOT SUBSCRIBED ",
    ]) {
      stubFetch(() => problem(400, title));
      const result = await upsertMember(EMAIL, "Maher");
      expect(result, title).toEqual({
        kind: "refused-address",
        httpStatus: 400,
      });
      expect(JSON.stringify(result)).not.toContain("UPSTREAM");
    }
  });

  test("400 — Invalid Resource that points at the address is invalid-address", async () => {
    const pointing: Array<() => Response> = [
      () =>
        problem(400, "Invalid Resource", {
          errors: [{ field: "email_address", message: UPSTREAM_TEXT }],
        }),
      () =>
        problem(400, "Invalid Resource", {
          errors: [
            { field: "merge_fields", message: UPSTREAM_TEXT },
            { field: "email address", message: UPSTREAM_TEXT },
          ],
        }),
      // No field list at all, only the fixed "looks fake" explanation.
      () =>
        json(400, {
          title: "Invalid Resource",
          status: 400,
          detail: `${EMAIL} looks fake or invalid, please enter a real email address.`,
        }),
    ];
    for (const respond of pointing) {
      stubFetch(respond);
      const result = await upsertMember(EMAIL, "Maher");
      expect(result).toEqual({ kind: "invalid-address", httpStatus: 400 });
      expect(JSON.stringify(result)).not.toContain("fake");
    }
  });

  test("400 — Invalid Resource about anything else is OUR error, not the visitor's", async () => {
    const notTheAddress: Array<() => Response> = [
      // A merge field failed validation: asking the visitor to "check your
      // email address" would be wrong, and they could never fix it.
      () =>
        problem(400, "Invalid Resource", {
          errors: [{ field: "FNAME", message: UPSTREAM_TEXT }],
        }),
      () => problem(400, "Invalid Resource"),
      () => problem(400, "Invalid Resource", { errors: [] }),
      () => problem(400, "Invalid Resource", { errors: "email_address" }),
      () => problem(400, "Invalid Resource", { errors: [null, 7, "x"] }),
    ];
    for (const respond of notTheAddress) {
      stubFetch(respond);
      expect(await upsertMember(EMAIL, "Maher")).toEqual({
        kind: "error",
        httpStatus: 400,
      });
    }
  });

  test("400 — any other title, or no readable title, is an error", async () => {
    const others: Array<() => Response> = [
      () => problem(400, "Bad Request"),
      () => problem(400, "Invalid Action"),
      () => problem(400, "JSON Parse Exception"),
      () => problem(400, "Member Exists"),
      () => problem(400, "Something Mailchimp Adds Next Year"),
      () => json(400, { detail: "looks fake or invalid" }),
      () => json(400, { title: 400 }),
      () => json(400, null),
      () => new Response("<html>bad request</html>", { status: 400 }),
      () => new Response(null, { status: 400 }),
    ];
    for (const respond of others) {
      stubFetch(respond);
      expect(await upsertMember(EMAIL, "Maher")).toEqual({
        kind: "error",
        httpStatus: 400,
      });
    }
  });

  test("the compliance titles only count on a 400", async () => {
    // The same words on another status are not the same answer.
    for (const status of [401, 403, 404, 500]) {
      stubFetch(() => problem(status, "Member In Compliance State"));
      expect(await upsertMember(EMAIL, "Maher")).toEqual({
        kind: "error",
        httpStatus: status,
      });
    }
  });

  test("every other non-2xx is an error carrying only its status code", async () => {
    for (const status of [401, 403, 404, 405, 422, 429, 500, 502, 503]) {
      stubFetch(() => problem(status, "Whatever Mailchimp Calls It"));
      const result = await upsertMember(EMAIL, "Maher");
      expect(result).toEqual({ kind: "error", httpStatus: status });
      expect(logged.join("\n")).toContain(`HTTP ${status}`);
    }
  });

  test("a thrown fetch is an error, and only the error's NAME is logged", async () => {
    stubFetch(() => {
      // A real fetch failure can quote the URL — and so the audience id.
      throw new TypeError(`fetch failed: ${BASE}/members/${hashOf(EMAIL)}`);
    });
    expect(await upsertMember(EMAIL, "Maher")).toEqual({
      kind: "error",
      httpStatus: null,
    });
    expect(logged.join("\n")).toContain("TypeError");
    expect(logged.join("\n")).not.toContain("fetch failed");
  });

  test("something thrown that is not an Error is still contained", async () => {
    stubFetch(() => {
      throw `string thrown with ${KEY}`;
    });
    expect(await upsertMember(EMAIL, "Maher")).toEqual({
      kind: "error",
      httpStatus: null,
    });
    expect(logged.join("\n")).toContain("unknown");
  });

  test("the timeout path: a hung upstream ends as an error, on time", async () => {
    // Never answers; settles only when the call's own signal aborts.
    stubFetch(
      (call) =>
        new Promise<Response>((_resolve, reject) => {
          call.signal?.addEventListener("abort", () =>
            reject(call.signal?.reason),
          );
        }),
    );
    const started = Date.now();
    const result = await upsertMember(EMAIL, "Maher", { timeoutMs: 50 });
    const elapsed = Date.now() - started;

    expect(result).toEqual({ kind: "error", httpStatus: null });
    expect(elapsed).toBeLessThan(3000);
    expect(logged.join("\n")).toContain("TimeoutError");
  });
});

test.describe("S6.1 Mailchimp client — resubscribeArchived", () => {
  test("one PUT that sets the status, true only when Mailchimp says subscribed", async () => {
    stubFetch(() => json(200, { status: "subscribed" }));
    expect(await resubscribeArchived(" Reader@Example.com ")).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].url).toBe(`${BASE}/members/${hashOf(EMAIL)}`);
    expect(calls[0].body).toEqual({
      email_address: "Reader@Example.com",
      status_if_new: "subscribed",
      status: "subscribed",
    });
  });

  test("a refusal, an unexpected status or a failure is false — never a retry", async () => {
    const refusals: Array<() => Response | Promise<Response>> = [
      () => problem(400, "Member In Compliance State"),
      () => problem(400, "Forgotten Email Not Subscribed"),
      // Accepted, but not actually subscribed.
      () => json(200, { status: "pending" }),
      () => json(200, { status: "archived" }),
      () => json(200, {}),
      () => problem(404, "Resource Not Found"),
      () => problem(500, "InternalServerError"),
      () => {
        throw new TypeError(`fetch failed: ${BASE}`);
      },
    ];
    for (const respond of refusals) {
      calls = [];
      stubFetch(respond);
      expect(await resubscribeArchived(EMAIL)).toBe(false);
      expect(calls, "exactly one attempt").toHaveLength(1);
    }
  });

  test("it times out like every other call", async () => {
    stubFetch(
      (call) =>
        new Promise<Response>((_resolve, reject) => {
          call.signal?.addEventListener("abort", () =>
            reject(call.signal?.reason),
          );
        }),
    );
    expect(await resubscribeArchived(EMAIL, { timeoutMs: 50 })).toBe(false);
    expect(logged.join("\n")).toContain("TimeoutError");
  });
});

test.describe("S6.1 Mailchimp client — addTags", () => {
  test("a tags-only POST: no member upsert, every tag active", async () => {
    stubFetch(() => new Response(null, { status: 204 }));
    expect(
      await addTags(" Reader@Example.com ", ["conv1-registered", "extra"]),
    ).toBe(true);

    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe(`${BASE}/members/${hashOf(EMAIL)}/tags`);
    expect(calls[0].body).toEqual({
      tags: [
        { name: "conv1-registered", status: "active" },
        { name: "extra", status: "active" },
      ],
    });
    // It can neither create a contact nor change a status.
    expect(JSON.stringify(calls[0].body)).not.toContain("status_if_new");
    expect(JSON.stringify(calls[0].body)).not.toContain("email_address");
  });

  test("true only on a 2xx; a buyer who is not in the audience is simply false", async () => {
    const failures: Array<() => Response | Promise<Response>> = [
      () => problem(404, "Resource Not Found"),
      () => problem(400, "Invalid Resource"),
      () => problem(401, "API Key Invalid"),
      () => problem(429, "TooManyRequests"),
      () => problem(500, "InternalServerError"),
      () => {
        throw new TypeError(`fetch failed: ${BASE}`);
      },
    ];
    for (const respond of failures) {
      stubFetch(respond);
      expect(await addTags(EMAIL, ["purchased-course"])).toBe(false);
    }
    stubFetch(() => json(200, {}));
    expect(await addTags(EMAIL, ["purchased-course"])).toBe(true);
  });

  test("no address or no tag means no request at all", async () => {
    for (const email of [null, undefined, "", "   "]) {
      expect(await addTags(email, ["purchased-course"])).toBe(false);
    }
    expect(await addTags(EMAIL, [])).toBe(false);
    expect(calls).toEqual([]);
  });

  test("it never throws and it times out — a paid grant is never held up", async () => {
    stubFetch(
      (call) =>
        new Promise<Response>((_resolve, reject) => {
          call.signal?.addEventListener("abort", () =>
            reject(call.signal?.reason),
          );
        }),
    );
    const started = Date.now();
    expect(await addTags(EMAIL, ["purchased-course"], { timeoutMs: 50 })).toBe(
      false,
    );
    expect(Date.now() - started).toBeLessThan(3000);
    expect(logged.join("\n")).toContain("TimeoutError");
  });
});
