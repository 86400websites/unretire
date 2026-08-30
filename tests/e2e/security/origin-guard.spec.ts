import { test, expect } from "../fixtures";
import { isAllowedHost, safeOrigin } from "../../../src/lib/auth/safe-origin";

/**
 * Sprint S4.4 — Known issue 42, host-header injection.
 * Covers the origin half of docs/FEATURE-LIST.md line AC-014.
 *
 * Tested directly, for the same reason as the redirect guard: the value this
 * function returns ends up inside a password-reset e-mail, and there is no way
 * to observe that end-to-end without sending real mail to a real inbox. The
 * parity suite covers delivery; this covers the decision.
 */

const SITE = "https://www.unretireproject.com";
const FALLBACK = SITE;

test.beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_URL;
});

test("AC-014 — a forged host never becomes a link in our e-mail", () => {
  const hostile = [
    "evil.example",
    "www.unretireproject.com.evil.example",
    "evil.example:443",
    // The one that makes a loose pattern dangerous. vercel.app subdomains are
    // claimable by anyone, so "starts with unretire-" is not ownership — only
    // the team suffix is. A guard written as /^unretire-.+\.vercel\.app$/ would
    // hand an attacker a trusted origin for the price of a free deployment.
    "unretire-evil.vercel.app",
    "unretire-anything.vercel.app",
    "notunretire-x-86400-s-projects.vercel.app",
    "unretireproject.com.attacker.net",
  ];

  const accepted = hostile.filter((h) => isAllowedHost(h));
  expect(accepted, "these forged hosts were trusted").toEqual([]);

  for (const h of hostile) {
    expect(safeOrigin(h, "https", FALLBACK), `${h} should fall back`).toBe(
      FALLBACK,
    );
  }
});

test("AC-014 — the hosts we really run on are still accepted", () => {
  // Without this, a guard that rejected everything would pass the test above
  // and silently break every password-reset e-mail in production.
  expect(isAllowedHost("www.unretireproject.com")).toBe(true);
  expect(isAllowedHost("unretireproject.com")).toBe(true);
  expect(isAllowedHost("UNRETIREPROJECT.COM")).toBe(true); // case-insensitive
  expect(isAllowedHost("unretire-abc123-86400-s-projects.vercel.app")).toBe(
    true,
  );

  expect(safeOrigin("www.unretireproject.com", "https", FALLBACK)).toBe(SITE);
});

test("AC-014 — a forged scheme cannot downgrade a real host to http", () => {
  // x-forwarded-proto is a header too. Trusting it would let an attacker turn
  // an e-mail link into plain http even on a host we do trust.
  expect(safeOrigin("www.unretireproject.com", "http", FALLBACK)).toBe(SITE);
});

test("AC-014 — localhost is allowed off-platform and refused in production", () => {
  expect(isAllowedHost("localhost:3000")).toBe(true);
  expect(safeOrigin("localhost:3000", "http", FALLBACK)).toBe(
    "http://localhost:3000",
  );

  process.env.VERCEL_ENV = "production";
  expect(
    isAllowedHost("localhost:3000"),
    "localhost must never be a valid production host",
  ).toBe(false);
});

test("AC-014 — a missing host falls back rather than guessing", () => {
  for (const h of [null, undefined, ""]) {
    expect(safeOrigin(h, "https", FALLBACK)).toBe(FALLBACK);
  }
});
