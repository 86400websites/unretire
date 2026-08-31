import { test, expect } from "../fixtures";
import { validateSubscribePayload } from "../../../src/lib/forms/subscribe-payload";

/**
 * Sprint S4.5c — the red→green proof for pre-launch review Finding 7 (Blocking)
 * and for FEATURE-LIST lines FM-004 and PR-004.
 *
 * Asserted against the function rather than over HTTP, deliberately, and for a
 * reason that is about safety as much as coverage:
 *
 *  1. The interesting half of Finding 7 is not the status code — it is WHICH
 *     FIELDS SURVIVE into the request sent to Mailchimp. A 400 or a 200 cannot
 *     show that. This can.
 *  2. A request that got far enough to prove the allow-list works would, if the
 *     allow-list had regressed, write a real contact into the shared LIVE
 *     Mailchimp audience (D-22) — on every pull request. A test whose failure
 *     mode is "pollute the owner's production audience" is not one to ship.
 *
 * The endpoint's own reachability is covered over HTTP by
 * tests/e2e/abuse/public-write-endpoints.spec.ts.
 */

/** Narrow an accepted result, failing loudly instead of silently skipping. */
function accept(body: unknown) {
  const parsed = validateSubscribePayload(body);
  if (!parsed.ok) {
    throw new Error(`expected this payload to be accepted: ${parsed.error}`);
  }
  return parsed;
}

test.describe("FM-004 — the endpoint validates on the server, not in the browser", () => {
  test("FM-004 a malformed or missing address is refused", () => {
    for (const email of [
      undefined,
      null,
      "",
      "not-an-email",
      "no-at-sign.example",
      "spaces in@example.com",
      "trailing@",
      42,
      { toString: () => "x@y.z" },
      ["a@b.co"],
    ]) {
      const parsed = validateSubscribePayload({ email });
      expect(parsed.ok, `"${String(email)}" must be refused`).toBe(false);
    }
  });

  test("FM-004 a real address is still accepted", () => {
    // The counterweight: a validator that refused everything would pass the
    // test above and silently break every capture form on the site.
    expect(accept({ email: "reader@example.com" }).email).toBe(
      "reader@example.com",
    );
    // Surrounding whitespace is trimmed rather than treated as a rejection.
    expect(accept({ email: "  reader@example.com  " }).email).toBe(
      "reader@example.com",
    );
  });

  test("FM-004 oversized input is refused, not truncated and sent", () => {
    const long = `${"a".repeat(250)}@example.com`;
    expect(validateSubscribePayload({ email: long }).ok).toBe(false);
    expect(
      validateSubscribePayload({
        email: "reader@example.com",
        firstName: "n".repeat(101),
      }).ok,
    ).toBe(false);
  });

  test("FM-004 a non-object body is refused", () => {
    for (const body of [null, undefined, "string", 7, ["a"], true]) {
      expect(validateSubscribePayload(body).ok).toBe(false);
    }
  });
});

test.describe("PR-004 — nothing a stranger invents reaches the audience", () => {
  test("PR-004 a tag must be a short, plain identifier", () => {
    // THE FINDING, half one. `tag` had no length and no shape check, so an
    // anonymous caller could push arbitrary structured input into the tag call.
    for (const tag of [
      "x".repeat(41),
      "has space",
      "semi;colon",
      "<script>",
      "tag/with/slash",
      "",
      42,
      { name: "evil" },
      ["a"],
    ]) {
      const parsed = validateSubscribePayload({
        email: "reader@example.com",
        tag,
      });
      expect(parsed.ok, `tag ${JSON.stringify(tag)} must be refused`).toBe(
        false,
      );
    }

    // …and the tags the site really sends still pass.
    for (const tag of ["starter-plan", "assessment_result", "Newsletter1"]) {
      expect(accept({ email: "reader@example.com", tag }).tag).toBe(tag);
    }
  });

  test("PR-004 an unlisted merge field is dropped, never forwarded", () => {
    // THE FINDING, half two. `Object.assign(merge_fields, mergeFields)` copied
    // ANY key from an anonymous request straight into the live audience, so a
    // caller could supply a victim's address plus arbitrary fields and mutate
    // that contact. Red before 231b637: every key below would have survived.
    const { merge_fields } = accept({
      email: "reader@example.com",
      mergeFields: {
        WEAKEST: "Health",
        SCORE: 42,
        EMAIL: "attacker@example.com",
        STATUS: "unsubscribed",
        OPTIN_IP: "1.2.3.4",
        "interests[abc]": "yes",
        __proto__: { polluted: true },
      },
    });

    expect(Object.keys(merge_fields).sort()).toEqual(["SCORE", "WEAKEST"]);
    expect(merge_fields.WEAKEST).toBe("Health");
    expect(merge_fields.SCORE).toBe(42);
    expect(
      ({} as Record<string, unknown>).polluted,
      "prototype pollution must not survive",
    ).toBeUndefined();
  });

  test("PR-004 an allowed key with an unusable value is dropped too", () => {
    const { merge_fields } = accept({
      email: "reader@example.com",
      mergeFields: {
        WEAKEST: { nested: "object" },
        BRIGHTEST: ["array"],
        SCORE: Number.NaN,
        S_HEALTH: "v".repeat(101),
        S_MONEY: "fine",
      },
    });

    expect(Object.keys(merge_fields)).toEqual(["S_MONEY"]);
  });

  test("PR-004 the assessment's real payload still survives intact", () => {
    // The counterweight for the allow-list: /assess sends these, and an
    // over-tight list would silently break the results e-mail.
    const { merge_fields } = accept({
      email: "reader@example.com",
      firstName: "Maher",
      mergeFields: {
        WEAKEST: "Contribution",
        WEAKLOW: "Fun",
        BRIGHTEST: "Growth",
        SCORE: 61,
        S_PASSION: 8,
        S_HEALTH: 7,
        S_RELAT: 9,
        S_GROWTH: 8,
        S_SPIRIT: 6,
        S_FUN: 5,
        S_MONEY: 9,
        S_CONTRIB: 4,
      },
    });

    expect(merge_fields.FNAME).toBe("Maher");
    expect(Object.keys(merge_fields)).toHaveLength(13);
  });
});

test.describe("FM-009 — a form error never shows the provider's own words", () => {
  test("FM-009 every rejection message is one of ours", () => {
    // Known issue 44. The route used to hand the caller Mailchimp's `detail`
    // string verbatim. Nothing a validator returns may be derived from caller
    // input or from an upstream body, so the set of possible messages is small,
    // fixed, and listed here.
    const OURS = new Set([
      "Invalid request",
      "A valid email address is required",
      "Email is too long",
      "Name is too long",
    ]);

    // NOTE on what is deliberately absent: an address like
    // "<script>alert(1)</script>@example.com" is NOT in this list, because the
    // shape check accepts it — it contains no space and exactly one @. That is
    // intentional and safe: the value is never rendered as HTML by this app,
    // Mailchimp is the authority on whether an address is deliverable, and a
    // stricter local-part rule would start refusing real addresses. What
    // matters here is only that no rejection message is built from the input.
    const hostile = [
      { email: "reader@example.com", tag: "'; DROP TABLE members; --" },
      { email: "reader@example.com", firstName: "n".repeat(500) },
      { email: `${"a".repeat(250)}@example.com` },
      "not-an-object",
    ];

    for (const body of hostile) {
      const parsed = validateSubscribePayload(body);
      expect(parsed.ok).toBe(false);
      const message = (parsed as { error: string }).error;
      expect(OURS.has(message), `unexpected message: "${message}"`).toBe(true);
      // And in particular it never quotes the input back.
      expect(message).not.toContain("script");
      expect(message).not.toContain("DROP TABLE");
    }
  });
});
