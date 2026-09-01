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

/**
 * Every variable isAllowedHost() reads is reset here, not just some of them.
 * The first version cleared VERCEL_ENV and VERCEL_URL and left VERCEL_BRANCH_URL
 * and VERCEL_PROJECT_PRODUCTION_URL set, so a value assigned by one test stayed
 * visible to the next and the hostile-host test could have been passing because
 * of what a different test happened to leave behind (S4.5c).
 */
test.beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_BRANCH_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
});

test("AC-014 — a forged host never becomes a link in our e-mail", () => {
  const hostile = [
    "evil.example",
    "www.unretireproject.com.evil.example",
    "evil.example:443",
    // vercel.app subdomains are handed out from project names on a first-come
    // basis, so ANY pattern over that namespace describes a shape a stranger
    // can occupy rather than deployments that are ours. Pre-launch review
    // Finding 9: the guard used to trust
    // /^unretire-[a-z0-9-]+-86400-s-projects\.vercel\.app$/, so the third entry
    // below — which matches that pattern exactly — was ACCEPTED. It must not be.
    "unretire-evil.vercel.app",
    "unretire-anything.vercel.app",
    "unretire-attacker-86400-s-projects.vercel.app",
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
  // Preview hosts are trusted by EXACT match against what the platform itself
  // reports, never by shape. These are set by Vercel at runtime and a caller
  // cannot influence them.
  process.env.VERCEL_URL = "unretire-abc123-86400-s-projects.vercel.app";
  process.env.VERCEL_BRANCH_URL =
    "unretire-git-branch-86400-s-projects.vercel.app";
  expect(isAllowedHost("unretire-abc123-86400-s-projects.vercel.app")).toBe(
    true,
  );
  expect(isAllowedHost("unretire-git-branch-86400-s-projects.vercel.app")).toBe(
    true,
  );
  // ...and a same-shaped host the platform did NOT report is still refused.
  expect(
    isAllowedHost("unretire-someoneelse-86400-s-projects.vercel.app"),
    "shape alone must never confer trust",
  ).toBe(false);

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
