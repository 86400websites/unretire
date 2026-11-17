import { test, expect } from "../fixtures";
import {
  HONEYPOT_FIELD,
  REGISTRATION_FORMS,
  validateRegistrationPayload,
  type RegistrationErrorCode,
} from "../../../src/lib/webinar/registration-payload";

/**
 * Sprint S6.1 — what POST /api/conversation accepts, asserted against the
 * validator and not over HTTP, for the reason
 * tests/e2e/forms/subscribe-payload.spec.ts gives: a request that got far
 * enough to prove a payload is ACCEPTED would write a real contact into the
 * one live Mailchimp audience (D-22) and start a real e-mail flow, on every
 * pull request. The route's reachability, its 400 and its rate limit are
 * covered over HTTP by tests/e2e/abuse/public-write-endpoints.spec.ts, with
 * payloads this file proves are refused before any fetch.
 */

/** Narrow an accepted result, failing loudly instead of silently skipping. */
function accept(body: unknown) {
  const parsed = validateRegistrationPayload(body);
  if (!parsed.ok) {
    throw new Error(`expected this payload to be accepted: ${parsed.code}`);
  }
  return parsed;
}

/** The rejection code, or a marker that fails the comparison if accepted. */
function rejection(body: unknown): RegistrationErrorCode | "ACCEPTED" {
  const parsed = validateRegistrationPayload(body);
  return parsed.ok ? "ACCEPTED" : parsed.code;
}

const VALID = {
  form: "register",
  firstName: "Maher",
  email: "reader@example.com",
};

test.describe("S6.1 registration payload — what is accepted", () => {
  test("both forms are accepted, and only what may leave the server survives", () => {
    expect(accept(VALID)).toEqual({
      ok: true,
      form: "register",
      email: "reader@example.com",
      firstName: "Maher",
    });
    expect(accept({ ...VALID, form: "toolkit" }).form).toBe("toolkit");
    expect([...REGISTRATION_FORMS]).toEqual(["register", "toolkit"]);

    // Anything else a caller adds is dropped — in particular a tag. The
    // server picks the tag from `form`; the client never names one.
    const parsed = accept({
      ...VALID,
      tag: "purchased-course",
      tags: ["premium"],
      mergeFields: { STATUS: "subscribed" },
      status: "subscribed",
      __proto__: { polluted: true },
    });
    expect(Object.keys(parsed).sort()).toEqual([
      "email",
      "firstName",
      "form",
      "ok",
    ]);
    expect(
      ({} as Record<string, unknown>).polluted,
      "prototype pollution must not survive",
    ).toBeUndefined();
  });

  test("surrounding whitespace is trimmed, not treated as a rejection", () => {
    const parsed = accept({
      form: "register",
      firstName: "  Maher  ",
      email: "  reader@example.com  ",
    });
    expect(parsed.email).toBe("reader@example.com");
    expect(parsed.firstName).toBe("Maher");
  });

  test("the first name is optional; an empty anti-spam field is fine", () => {
    expect(
      accept({ form: "toolkit", email: "reader@example.com" }).firstName,
    ).toBe("");
    expect(accept({ ...VALID, firstName: "" }).firstName).toBe("");
    // The real form always sends the hidden field, empty.
    expect(accept({ ...VALID, [HONEYPOT_FIELD]: "" }).ok).toBe(true);
    // Length limits are inclusive.
    expect(accept({ ...VALID, firstName: "n".repeat(100) }).ok).toBe(true);
    const longest = `${"a".repeat(242)}@example.com`;
    expect(longest).toHaveLength(254);
    expect(accept({ ...VALID, email: longest }).ok).toBe(true);
  });
});

test.describe("S6.1 registration payload — what is refused", () => {
  test("a body that is not an object", () => {
    for (const body of [null, undefined, "string", 7, true, ["a"], []]) {
      expect(rejection(body), `${JSON.stringify(body)}`).toBe(
        "invalid-request",
      );
    }
    // The dormant-state smoke sends exactly this.
    expect(rejection({})).toBe("invalid-request");
  });

  test("a missing or unknown form — the caller cannot invent a third one", () => {
    for (const form of [
      undefined,
      null,
      "",
      "Register",
      "register ",
      "purchased-course",
      "conv1-registered",
      "premium",
      42,
      ["register"],
      { toString: () => "register" },
    ]) {
      expect(
        rejection({ ...VALID, form }),
        `form ${JSON.stringify(form)} must be refused`,
      ).toBe("invalid-request");
    }
  });

  test("a filled anti-spam field is refused like any other invalid payload", () => {
    // Never a pretend success: the route answers 400 for this, exactly as it
    // does for a missing form.
    for (const value of [
      "x",
      " ",
      "https://spam.example",
      0,
      1,
      false,
      null,
      {},
      [],
    ]) {
      expect(
        rejection({ ...VALID, [HONEYPOT_FIELD]: value }),
        `${HONEYPOT_FIELD}=${JSON.stringify(value)} must be refused`,
      ).toBe("invalid-request");
    }
    // It outranks the address check: a bot's otherwise perfect payload is
    // refused for the field, whatever else it sent.
    expect(
      rejection({ form: "register", email: "nope", [HONEYPOT_FIELD]: "x" }),
    ).toBe("invalid-request");
  });

  test("a missing or malformed address", () => {
    for (const email of [
      undefined,
      null,
      "",
      "   ",
      "not-an-email",
      "no-at-sign.example",
      "spaces in@example.com",
      "trailing@",
      "@example.com",
      "two@@example.com",
      42,
      ["a@b.co"],
      { toString: () => "x@y.z" },
    ]) {
      expect(
        rejection({ ...VALID, email }),
        `"${String(email)}" must be refused`,
      ).toBe("invalid-email");
    }
  });

  test("oversized input is refused, not truncated and sent", () => {
    expect(
      rejection({ ...VALID, email: `${"a".repeat(243)}@example.com` }),
    ).toBe("email-too-long");
    expect(rejection({ ...VALID, firstName: "n".repeat(101) })).toBe(
      "name-too-long",
    );
  });

  test("a first name of the wrong type", () => {
    for (const firstName of [42, null, ["Maher"], { name: "Maher" }, true]) {
      expect(rejection({ ...VALID, firstName })).toBe("invalid-request");
    }
  });

  test("a rejection is one of four fixed codes and never echoes the input", () => {
    const CODES = new Set<string>([
      "invalid-request",
      "invalid-email",
      "email-too-long",
      "name-too-long",
    ]);
    const hostile = [
      { ...VALID, form: "<script>alert(1)</script>" },
      { ...VALID, email: "'; DROP TABLE members; --" },
      { ...VALID, firstName: "<img src=x onerror=alert(1)>".repeat(10) },
      { ...VALID, [HONEYPOT_FIELD]: "<script>" },
      "not-an-object",
    ];
    for (const body of hostile) {
      const parsed = validateRegistrationPayload(body);
      expect(parsed.ok).toBe(false);
      // The whole rejection is { ok, code } — there is no message to leak into.
      expect(Object.keys(parsed).sort()).toEqual(["code", "ok"]);
      const { code } = parsed as { code: string };
      expect(CODES.has(code), `unexpected code: "${code}"`).toBe(true);
    }
  });
});
