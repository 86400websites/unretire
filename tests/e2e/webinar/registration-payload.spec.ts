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
 *
 * Sprint S6.2 adds the optional `source` field — draft FEATURE-LIST line
 * IN-009 (the sign-up carries the tab's source). The last block proves it can
 * never decide a sign-up: one of the report's eight keys passes through,
 * anything else or nothing becomes "other", a valid source never rescues an
 * invalid payload, and an invalid one never refuses a valid payload.
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
      // `source` arrived in S6.2 (the webinar report); none was sent: "other".
      source: "other",
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
      // `source` arrived in S6.2 (the webinar report).
      "source",
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

test.describe("S6.2 registration payload — the optional source", () => {
  /**
   * The report's eight keys, typed out on purpose: the link contract is fixed
   * (the sprint record's "Link contract"), so a renamed or dropped key must
   * turn this file red instead of quietly following src/lib/webinar/sources.ts.
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

  /**
   * Values that are not a key, of every type a caller can send — including
   * the values the links carry (utm_source=newsletter, utm_medium=paid),
   * which are not keys themselves.
   */
  const NOT_KEYS: unknown[] = [
    "tiktok",
    "LinkedIn",
    "LINKEDIN",
    " linkedin",
    "linkedin ",
    "newsletter",
    "meta",
    "paid",
    "Other",
    "meta_ads",
    "",
    "constructor",
    "__proto__",
    42,
    0,
    true,
    false,
    null,
    undefined,
    {},
    { key: "linkedin" },
    ["linkedin"],
    { toString: () => "linkedin" },
  ];

  /** Every shape the S6.1 cases above accept. */
  const ACCEPTED: Record<string, unknown>[] = [
    VALID,
    { ...VALID, form: "toolkit" },
    { form: "toolkit", email: "reader@example.com" },
    {
      form: "register",
      firstName: "  Maher  ",
      email: "  reader@example.com  ",
    },
    { ...VALID, firstName: "" },
    { ...VALID, [HONEYPOT_FIELD]: "" },
    { ...VALID, firstName: "n".repeat(100) },
    { ...VALID, email: `${"a".repeat(242)}@example.com` },
  ];

  /** A value, written out for an expect message. */
  function label(value: unknown): string {
    return JSON.stringify(value) ?? String(value);
  }

  test("IN-009 each of the eight keys passes through as the source, on both forms, and changes nothing else", () => {
    for (const body of ACCEPTED) {
      for (const key of KEYS) {
        expect(accept({ ...body, source: key }), key).toEqual({
          ...accept(body),
          source: key,
        });
      }
    }
  });

  test("IN-009 an unknown string, a number, an object, null, an empty string or no source at all is 'other' — never a refusal", () => {
    for (const body of ACCEPTED) {
      // No source at all.
      expect(accept(body).source).toBe("other");
      // `accept` throws if any of these is refused.
      for (const source of NOT_KEYS) {
        expect(accept({ ...body, source }), label(source)).toEqual({
          ...accept(body),
          source: "other",
        });
      }
    }
    // A key smuggled in through the prototype of a JSON body is not the
    // body's own source.
    expect(
      accept(
        JSON.parse(
          '{"form":"register","email":"reader@example.com","__proto__":{"source":"linkedin"}}',
        ),
      ).source,
    ).toBe("other");
  });

  test("IN-009 a valid source never rescues an invalid payload: every S6.1 refusal keeps its code, and carries no source", () => {
    // The S6.1 refusals above, case for case. A body that is not an object
    // (null, a string, a number) cannot carry a source at all; an ARRAY can
    // be given one as a property, and is still refused.
    const refused: [
      Record<string, unknown> | unknown[],
      RegistrationErrorCode,
    ][] = [
      [{}, "invalid-request"],
      [[], "invalid-request"],
      [["a"], "invalid-request"],
      [
        { form: "register", email: "nope", [HONEYPOT_FIELD]: "x" },
        "invalid-request",
      ],
      [{ ...VALID, email: `${"a".repeat(243)}@example.com` }, "email-too-long"],
      [{ ...VALID, firstName: "n".repeat(101) }, "name-too-long"],
    ];
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
      refused.push([{ ...VALID, form }, "invalid-request"]);
    }
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
      refused.push([{ ...VALID, [HONEYPOT_FIELD]: value }, "invalid-request"]);
    }
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
      refused.push([{ ...VALID, email }, "invalid-email"]);
    }
    for (const firstName of [42, null, ["Maher"], { name: "Maher" }, true]) {
      refused.push([{ ...VALID, firstName }, "invalid-request"]);
    }

    for (const [body, code] of refused) {
      expect(rejection(body), `${label(body)} without a source`).toBe(code);
      for (const source of [...KEYS, ...NOT_KEYS]) {
        const withSource = Array.isArray(body)
          ? Object.assign([...body], { source })
          : { ...body, source };
        const parsed = validateRegistrationPayload(withSource);
        expect(
          parsed.ok ? "ACCEPTED" : parsed.code,
          `${label(body)} with source ${label(source)}`,
        ).toBe(code);
        // Still only { ok, code }: a source never rides out on a refusal.
        expect(Object.keys(parsed).sort()).toEqual(["code", "ok"]);
      }
    }
  });
});
