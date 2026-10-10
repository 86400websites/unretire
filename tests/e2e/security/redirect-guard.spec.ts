import { test, expect } from "../fixtures";
import { safeNext, SAFE_FALLBACK } from "../../../src/lib/auth/safe-redirect";

/**
 * Sprint S4.4 — Known issue 38, the open redirect in the account-email link.
 * Covers docs/FEATURE-LIST.md line AC-014.
 *
 * This tests the guard DIRECTLY rather than through the route, and that is a
 * deliberate choice. /auth/confirm only consults `next` after a token has been
 * successfully exchanged, so an end-to-end attempt with a bogus token never
 * reaches the branch under test — it would pass identically before and after
 * the fix. That is precisely the kind of test-that-cannot-fail this project has
 * already been bitten by four times, so the guard was extracted into a
 * dependency-free module and is asserted against its real inputs here.
 *
 * The end-to-end half rides with tests/e2e/parity/password-reset.spec.ts, which
 * holds a genuine recovery token.
 */

const ORIGIN = "https://www.unretireproject.com";
const REQUEST_URL = `${ORIGIN}/auth/confirm?token_hash=x&type=recovery`;

/**
 * Every one of these passed the ORIGINAL guard, which asked only
 * `raw.startsWith("/")`. The first four then resolved to a different site.
 */
/**
 * A literal backslash, built from its character code.
 *
 * This is not fussiness. Earlier drafts of this file wrote the backslash cases
 * as string escapes and lost them twice over — first to shell quoting, then to
 * TypeScript reading "\e" as a plain "e". Both times the input silently
 * became an ordinary same-origin path, the assertion passed, and it proved
 * nothing about the escape it was named after. Verified with node that every
 * entry below genuinely resolves off-origin under the ORIGINAL guard.
 */
const BS = String.fromCharCode(92);

const HOSTILE = [
  "//evil.example",
  "//evil.example/path",
  `/${BS}evil.example`,
  `/${BS}/evil.example`,
  `${BS}${BS}evil.example`,
  `${BS}/evil.example`,
  // Backslash rewritten to "/", so the host becomes evil.example and the rest
  // is just a path. Without the backslash this exact string is SAME-ORIGIN —
  // see LEGITIMATE below. One character decides it.
  `//evil.example${BS}@www.unretireproject.com`,
  "//user:pass@evil.example",
  "https://evil.example",
  "http://evil.example/reset",
  "javascript:alert(1)",
];

const LEGITIMATE: Array<[string, string]> = [
  ["/account", "/account"],
  ["/reset-password", "/reset-password"],
  ["/learn/course?module=1", "/learn/course?module=1"],
  ["/account#downloads", "/account#downloads"],
  // Absolute, but same-origin — allowed, and reduced to a path.
  [`${ORIGIN}/reset-password`, "/reset-password"],
  // Userinfo pointing at an attacker domain while the HOST is still ours. This
  // genuinely IS same-origin and must be allowed — it looks alarming and is not.
  // Pinned deliberately: it is one backslash away from the hostile case above,
  // and the pair together prove the guard reads the resolved ORIGIN rather than
  // pattern-matching scary-looking text.
  ["//evil.example@www.unretireproject.com/account", "/account"],
];

test("AC-014 — no hostile redirect target escapes the origin", () => {
  const escaped: string[] = [];
  for (const raw of HOSTILE) {
    const out = safeNext(raw, REQUEST_URL);
    // Two independent checks: the guard returned the fallback, AND the value it
    // returned cannot resolve off-origin even if something later re-resolves it.
    if (out !== SAFE_FALLBACK) escaped.push(`${raw} -> ${out}`);
    else if (new URL(out, ORIGIN).origin !== ORIGIN) {
      escaped.push(`${raw} -> ${out} (resolves off-origin)`);
    }
  }
  expect(escaped, "these redirect targets escaped the origin").toEqual([]);
});

test("AC-014 — legitimate destinations still work", () => {
  // Without this, a guard that returned the fallback unconditionally would pass
  // the test above while breaking password reset for every real user.
  for (const [raw, expected] of LEGITIMATE) {
    expect(safeNext(raw, REQUEST_URL), `${raw} should be preserved`).toBe(
      expected,
    );
  }
});

test("AC-014 — missing or malformed input falls back safely", () => {
  for (const raw of [null, undefined, "", "   ", "\u0000"]) {
    const out = safeNext(raw, REQUEST_URL);
    expect(new URL(out, ORIGIN).origin, `${JSON.stringify(raw)}`).toBe(ORIGIN);
  }
});
