import { test, expect } from "../fixtures";

/**
 * Sprint S4.5c — the red→green proof for Known issue 5, pre-launch review
 * Findings 6 and 8, SECURITY-CHECKLIST §5, invariant I7, and FEATURE-LIST lines
 * PR-001, PR-002 and PR-004.
 *
 * Before this file the abuse controls had NO coverage of any kind. The limiter
 * was written in S4.5, rewritten twice (the sweep in 128e6a5, the atomic
 * increment in 231b637), and /api/form — a brand-new public write endpoint —
 * shipped with nothing asserting that it exists, validates, or throttles.
 *
 * TWO ASSERTIONS, AND BOTH HALVES MATTER. §5 says the control must be enforced;
 * it also says a control that cannot be applied must REFUSE the request. Those
 * pull in opposite directions, and only testing one of them hides the other:
 *
 *   • "blocked is the PASS" — a burst past the limit must be refused (429).
 *   • "not blocked is also the PASS" — the FIRST honest request must get the
 *     app's own 400, not a 429. If the limiter cannot reach its table it fails
 *     closed, which is correct behaviour but means EVERY public form on the
 *     site is dead. That is not hypothetical: migrations 0003 and 0004 are
 *     applied to `unretire-test` only, so this exact assertion is what stands
 *     between a Production deploy and four silently broken forms.
 *
 * NOTHING HERE REACHES A THIRD PARTY. Every payload is rejected by /api/form
 * before its `fetch` to Formspree — an unknown form name, a missing required
 * field, a malformed address. No owner inbox receives a test message, and no
 * contact is written to the live Mailchimp audience (D-22).
 */

/**
 * SERIAL, and in one describe, because these tests share a counter. The bucket
 * is keyed on caller IP + endpoint, so running them in parallel would make the
 * order of the 400s and the 429 undefined. This is an ordering constraint, not
 * a softened assertion — each test still fails on its own merits.
 */
test.describe.configure({ mode: "serial" });

/** /api/form's configured allowance — src/app/api/form/route.ts. */
const FORM_LIMIT = 5;

test.describe("PR-001/PR-002 — the public write endpoints are guarded", () => {
  /**
   * The limiter's state lives in Postgres, so a target with no database
   * configured legitimately fails closed and answers 429 to everything. That is
   * the correct behaviour, not a defect, and it makes these assertions
   * meaningless — so on a local self-check they are SKIPPED, visibly, rather
   * than silently passing. The authoritative run is "E2E — Preview", which
   * always tests a real deployment and therefore always runs them.
   */
  test.beforeEach(({ baseURL }) => {
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(baseURL ?? "");
    test.skip(
      isLocal,
      "the rate limiter needs its database; asserted on the deployed Preview",
    );
  });

  test("PR-001 an honest request is answered by the app, not by a failed control", async ({
    api,
  }) => {
    // THE FAIL-CLOSED TRIPWIRE. 400 means the limiter consulted its table and
    // let the request through to the app's own validation. 429 here means the
    // control could not be applied at all — rate_limits or increment_rate_limit
    // is missing — and every public form on this deployment is refusing
    // everyone. Migration state is the usual cause.
    const res = await api.post("/api/form", {
      data: { form: "no-such-form" },
      failOnStatusCode: false,
    });

    expect(
      res.status(),
      "429 here means the abuse control is failing closed and every public form is dead — " +
        "check that migrations 0003 and 0004 are applied to this environment's database",
    ).toBe(400);
  });

  test("PR-004 /api/form refuses anything it was not asked for", async ({
    api,
  }) => {
    // ⚠ EVERY PAYLOAD HERE MUST BE INVALID, AND INVALID FOR A REASON THE ROUTE
    // CHECKS BEFORE ITS `fetch` TO FORMSPREE.
    //
    // The first version of this test got that wrong and it was not theoretical:
    // `{ form: "community", name: "E2E", email: "e2e@example.com", extra: 1 }`
    // supplies BOTH of community's required fields with a well-formed address,
    // so the route accepted it, forwarded it, and returned 200 — sending a real
    // "Community join request" into the owner's Formspree inbox from CI. The
    // comment underneath it even said the status depended on "something else
    // being missing", which was a doubt written down and shipped anyway.
    //
    // The rule now: invalid form name, or a missing required field, or a
    // malformed address, or a field of the wrong TYPE. Never a complete,
    // well-formed submission. Three requests, so the burst below still has room
    // inside the same window.
    const rejected = [
      { form: "contact" }, // required fields missing
      { form: "contact", name: "E2E", email: "nope", message: "hi" }, // bad address
      { form: "community", name: "E2E", email: "e2e@example.test", message: 7 }, // wrong type
    ];

    const statuses: number[] = [];
    for (const data of rejected) {
      const res = await api.post("/api/form", {
        data,
        failOnStatusCode: false,
      });
      statuses.push(res.status());
      const body = await res.text();
      // The backstop for the mistake above: the proxy answers `{"ok":true}`
      // only when it has actually forwarded a message. If any payload in this
      // list ever earns that, the list has drifted back into sending real mail.
      expect(
        body,
        "a payload in this list was ACCEPTED and forwarded",
      ).not.toContain('"ok":true');
      // Never the provider's words, and never an upstream body (Known issue 44).
      expect(body).not.toContain("formspree");
      expect(body).not.toContain("mailchimp");
    }

    // Every one must be a client error, and none may be a 429 — a 429 would
    // mean the control answered rather than the validation.
    for (const status of statuses) {
      expect(status, `unexpected status ${status}`).toBeGreaterThanOrEqual(400);
      expect(status, "a 429 here means the limit fired too early").not.toBe(
        429,
      );
      expect(status).toBeLessThan(500);
    }
  });

  test("PR-002 a burst past the limit is refused, and says when to come back", async ({
    api,
  }) => {
    // "Blocked is the PASS." Four requests have already been spent above, so
    // the allowance is nearly gone; a handful more must cross it. The loop is
    // bounded — a limiter that never fires fails the test rather than hanging.
    let limited: { status: number; retryAfter: string | null } | null = null;

    for (let attempt = 0; attempt < FORM_LIMIT * 3 && !limited; attempt += 1) {
      const res = await api.post("/api/form", {
        data: { form: "no-such-form" },
        failOnStatusCode: false,
      });
      if (res.status() === 429) {
        limited = {
          status: res.status(),
          retryAfter: res.headers()["retry-after"] ?? null,
        };
      }
    }

    expect(
      limited,
      `no 429 after ${FORM_LIMIT * 3} extra requests — the abuse control is not enforced`,
    ).not.toBeNull();
    expect(
      Number(limited!.retryAfter),
      "a refused caller must be told when to come back",
    ).toBeGreaterThan(0);
  });

  test("PR-004 /api/subscribe validates on the server", async ({ api }) => {
    // A different bucket (endpoint "subscribe", allowance 10), so the burst
    // above does not reach it. The address is malformed, so the request is
    // refused before mailchimpConfig() is read and before any fetch — nothing
    // is written to the live audience.
    const res = await api.post("/api/subscribe", {
      data: { email: "not-an-email" },
      failOnStatusCode: false,
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("A valid email address is required");
  });

  /**
   * PR-007 — POST /api/conversation, the webinar sign-up (Sprint S6.1).
   *
   * A bucket of its own (endpoint "conversation"), with /api/subscribe's
   * allowance — src/app/api/conversation/route.ts. Nothing above touches it,
   * and nothing else in the suite does either: the page spec answers its form
   * submissions in the browser, and its one real POST is refused before the
   * limiter runs.
   *
   * ⚠ THE SAME RULE AS /api/form ABOVE, AND IT MATTERS MORE HERE. A payload
   * this route ACCEPTS writes a contact into the one live Mailchimp audience
   * (D-22) and tags it, and the tag starts a real e-mail flow. So every
   * payload below is invalid by its `form` value or by the SHAPE of its
   * address — the two things the validator checks before the route reads its
   * Mailchimp configuration, let alone fetches. The filled anti-spam field is
   * asserted too, but it is never what keeps a payload safe: that payload's
   * address is malformed as well.
   */
  const CONVERSATION_LIMIT = 10;

  /** The route's fixed sentences for a refused payload — the approved copy. */
  const CONVERSATION_REFUSALS = [
    "Invalid request",
    "A valid email address is required",
  ];

  /**
   * With no webinar start configured the whole funnel is switched off and
   * this route answers 404 before it does any work — there is no limiter and
   * no validation to assert. So each test below first asks for the page with
   * a GET, which costs the bucket nothing, and skips, visibly, on a 404.
   */
  const DORMANT_SKIP =
    "the webinar funnel is dormant on this deployment; /api/conversation answers 404 to everything";

  test("PR-007 an invalid sign-up is answered by the app, not by a failed control", async ({
    api,
  }) => {
    const funnel = await api.get("/conversation", { failOnStatusCode: false });
    test.skip(funnel.status() === 404, DORMANT_SKIP);

    // The fail-closed tripwire again, for this bucket: 400 means the limiter
    // let the request through to the validator; 429 on the FIRST request
    // means the control could not be applied and nobody can register.
    const res = await api.post("/api/conversation", {
      data: { form: "no-such-form" },
      failOnStatusCode: false,
    });

    expect(
      res.status(),
      "429 here means the abuse control is failing closed and the sign-up form is dead",
    ).toBe(400);
    expect((await res.json()).error).toBe("Invalid request");
  });

  test("PR-007 /api/conversation refuses anything it was not asked for", async ({
    api,
  }) => {
    const funnel = await api.get("/conversation", { failOnStatusCode: false });
    test.skip(funnel.status() === 404, DORMANT_SKIP);

    // Six requests, so with the one above the burst below still starts inside
    // the allowance. Never a complete, well-formed sign-up — see the note above.
    const rejected = [
      { form: "no-such-form", email: "e2e@example.test" }, // unknown form
      { form: "register" }, // no address
      { form: "register", firstName: "E2E", email: "not-an-email" }, // bad address
      { form: "toolkit", firstName: "E2E", email: "nope@" }, // bad address
      // A filled anti-spam field gets the same 400 — never a fake success.
      // The address is malformed too, so this cannot be accepted either way.
      { form: "register", email: "not-an-email", topic: "filled by a script" },
      // A caller cannot name a tag; and this address is malformed as well.
      { form: "register", email: "not-an-email", tag: "purchased-course" },
    ];

    for (const data of rejected) {
      const res = await api.post("/api/conversation", {
        data,
        failOnStatusCode: false,
      });
      const body = await res.text();

      // The app's own 400 — not the limiter's 429, and not a success.
      expect(
        res.status(),
        `unexpected status for ${JSON.stringify(data)}`,
      ).toBe(400);
      expect(
        body,
        "a payload in this list was ACCEPTED and sent to Mailchimp",
      ).not.toContain('"ok":true');
      // One of the fixed sentences, and nothing else in the answer.
      const parsed = JSON.parse(body) as Record<string, unknown>;
      expect(Object.keys(parsed)).toEqual(["error"]);
      expect(CONVERSATION_REFUSALS).toContain(parsed.error);
      // Never the provider's words, never the meeting's address.
      expect(body.toLowerCase()).not.toContain("mailchimp");
      expect(body.toLowerCase()).not.toContain("zoom");
    }
  });

  test("PR-007 a burst of sign-ups past the limit is refused, and says when to come back", async ({
    api,
  }) => {
    const funnel = await api.get("/conversation", { failOnStatusCode: false });
    test.skip(funnel.status() === 404, DORMANT_SKIP);

    // Seven requests are already spent. The loop is bounded: a limiter that
    // never fires fails the test rather than hanging.
    let limited: { retryAfter: string | null; body: string } | null = null;

    for (
      let attempt = 0;
      attempt < CONVERSATION_LIMIT * 3 && !limited;
      attempt += 1
    ) {
      const res = await api.post("/api/conversation", {
        data: { form: "no-such-form" },
        failOnStatusCode: false,
      });
      if (res.status() === 429) {
        limited = {
          retryAfter: res.headers()["retry-after"] ?? null,
          body: await res.text(),
        };
      } else {
        // Until the limit is reached, the validator is what answers.
        expect(res.status()).toBe(400);
      }
    }

    expect(
      limited,
      `no 429 after ${CONVERSATION_LIMIT * 3} extra requests — the sign-up endpoint is not rate limited`,
    ).not.toBeNull();
    expect(
      Number(limited!.retryAfter),
      "a refused caller must be told when to come back",
    ).toBeGreaterThan(0);
    expect(limited!.body.toLowerCase()).not.toContain("mailchimp");
    expect(limited!.body.toLowerCase()).not.toContain("zoom");
    expect(limited!.body).not.toContain('"ok":true');
  });
});
