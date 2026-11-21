import { createHmac } from "node:crypto";
import { test, expect } from "../fixtures";
import {
  MAX_PASSWORD_INPUT,
  MIN_PASSWORD_LENGTH,
  MIN_SECRET_LENGTH,
  REPORT_COOKIE,
  isValidSession,
  passwordMatches,
  reportConfig,
  reportSecret,
  sessionCookieHeader,
  sessionToken,
  type ReportConfig,
} from "../../../src/lib/webinar/report-auth";

/**
 * Sprint S6.2 — the /report password gate (src/lib/webinar/report-auth.ts):
 * when the report is switched on at all, the session token, the password
 * check and the session cookie.
 * FEATURE-LIST line PG-016 (a draft until the owner approves it at Gate B).
 *
 * Asserted against the functions, as env.spec.ts asserts the webinar values:
 * the interesting inputs — a forged or altered cookie, a value one character
 * short, a ten-thousand-character password — are tried directly rather than
 * hoped for, and none of them needs a server. The page and the two routes
 * that use these functions are covered over HTTP by the report spec.
 *
 * Every value below is an obviously fake string, set for one test and put
 * back in afterEach (Playwright reuses a worker across files). After EVERY
 * test, no log line may carry any of them: only a variable's NAME is ever
 * logged.
 */

/** Long enough: 21 and 45 characters. */
const PASSWORD = "dummy-report-password";
const SECRET = "dummy-report-secret-not-a-real-one-0000000000";
const OTHER_PASSWORD = "dummy-other-password";
const OTHER_SECRET = "dummy-report-secret-another-fake-one-11111111";

/** One character short of each minimum, and exactly each minimum. */
const SHORT_PASSWORD = "short-pw-11";
const PASSWORD_12 = "twelve-chars";
const SHORT_SECRET = "dummy-secret-thirty-one-chars-x";
const SECRET_32 = "dummy-secret-thirty-two-chars-xy";

const FAKE_VALUES = [
  PASSWORD,
  SECRET,
  OTHER_PASSWORD,
  OTHER_SECRET,
  SHORT_PASSWORD,
  PASSWORD_12,
  SHORT_SECRET,
  SECRET_32,
];

const CONFIG: ReportConfig = { password: PASSWORD, secret: SECRET };

const ENV_NAMES = ["REPORT_PASSWORD", "REPORT_SECRET"] as const;

const realError = console.error;
const savedEnv = new Map<string, string | undefined>();
let logged: string[] = [];

/** The two values as a deployment would have them; undefined = not set. */
function configure(
  password: string | undefined,
  secret: string | undefined,
): void {
  if (password === undefined) delete process.env.REPORT_PASSWORD;
  else process.env.REPORT_PASSWORD = password;
  if (secret === undefined) delete process.env.REPORT_SECRET;
  else process.env.REPORT_SECRET = secret;
}

test.beforeEach(() => {
  for (const name of ENV_NAMES) {
    savedEnv.set(name, process.env[name]);
    delete process.env[name];
  }
  logged = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
});

test.afterEach(() => {
  console.error = realError;
  for (const [name, value] of savedEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  savedEnv.clear();

  for (const line of logged) {
    for (const value of FAKE_VALUES) {
      expect(line, "a log line carries a configured value").not.toContain(
        value,
      );
    }
  }
});

test.describe("S6.2 report gate — switched on only by two long-enough values", () => {
  test("PG-016 off when REPORT_PASSWORD is unset, empty or shorter than 12 — the log names it", () => {
    expect(SHORT_PASSWORD).toHaveLength(MIN_PASSWORD_LENGTH - 1);
    for (const password of [undefined, "", SHORT_PASSWORD]) {
      configure(password, SECRET);
      logged = [];
      const label = `REPORT_PASSWORD ${JSON.stringify(password)}`;
      expect(reportConfig(), label).toBeNull();
      expect(logged, label).toHaveLength(1);
      expect(logged[0]).toContain("REPORT_PASSWORD");
      expect(logged[0], "the usable value is not blamed").not.toContain(
        "REPORT_SECRET",
      );
    }
  });

  test("PG-016 off when REPORT_SECRET is unset, empty or shorter than 32 — the log names it", () => {
    expect(SHORT_SECRET).toHaveLength(MIN_SECRET_LENGTH - 1);
    for (const secret of [undefined, "", SHORT_SECRET]) {
      configure(PASSWORD, secret);
      logged = [];
      const label = `REPORT_SECRET ${JSON.stringify(secret)}`;
      expect(reportConfig(), label).toBeNull();
      expect(logged, label).toHaveLength(1);
      expect(logged[0]).toContain("REPORT_SECRET");
      expect(logged[0], "the usable value is not blamed").not.toContain(
        "REPORT_PASSWORD",
      );
    }
  });

  test("PG-016 off when both are unusable — one line naming both", () => {
    for (const [password, secret] of [
      [undefined, undefined],
      [SHORT_PASSWORD, SHORT_SECRET],
    ]) {
      configure(password, secret);
      logged = [];
      expect(reportConfig()).toBeNull();
      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain("REPORT_PASSWORD");
      expect(logged[0]).toContain("REPORT_SECRET");
    }
  });

  test("PG-016 on from exactly 12 and 32 characters, and nothing is logged", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(12);
    expect(MIN_SECRET_LENGTH).toBe(32);
    expect(PASSWORD_12).toHaveLength(12);
    expect(SECRET_32).toHaveLength(32);

    configure(PASSWORD_12, SECRET_32);
    expect(reportConfig()).toEqual({
      password: PASSWORD_12,
      secret: SECRET_32,
    });
    configure(PASSWORD, SECRET);
    expect(reportConfig()).toEqual(CONFIG);
    expect(logged).toEqual([]);
  });

  test("PG-016 reportSecret: the secret from 32 characters, null below — the password plays no part, and it never logs", () => {
    for (const secret of [undefined, "", SHORT_SECRET]) {
      configure(PASSWORD, secret);
      expect(reportSecret(), JSON.stringify(secret)).toBeNull();
    }
    // The visit and sign-up counting needs only the secret.
    configure(undefined, SECRET_32);
    expect(reportSecret()).toBe(SECRET_32);
    configure(PASSWORD, SECRET);
    expect(reportSecret()).toBe(SECRET);
    // Called on every sign-up: it must stay silent whatever it finds.
    expect(logged).toEqual([]);
  });
});

test.describe("S6.2 report gate — the session token", () => {
  test("PG-016 the token is 43 base64url characters, the documented HMAC, the same every time", () => {
    const token = sessionToken(CONFIG);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // base64url(HMAC-SHA256(REPORT_SECRET, "report-session:v1:" + REPORT_PASSWORD))
    expect(token).toBe(
      createHmac("sha256", SECRET)
        .update(`report-session:v1:${PASSWORD}`, "utf8")
        .digest("base64url"),
    );
    expect(sessionToken({ password: PASSWORD, secret: SECRET })).toBe(token);
    expect(token).not.toContain(PASSWORD);
    expect(token).not.toContain(SECRET);
  });

  test("PG-016 changing either value changes the token — everyone is signed out", () => {
    const token = sessionToken(CONFIG);
    for (const changed of [
      { password: OTHER_PASSWORD, secret: SECRET },
      { password: PASSWORD, secret: OTHER_SECRET },
      { password: `${PASSWORD}x`, secret: SECRET },
      { password: PASSWORD, secret: `${SECRET}0` },
      { password: SECRET, secret: PASSWORD },
    ]) {
      expect(sessionToken(changed), JSON.stringify(changed)).not.toBe(token);
      // Yesterday's cookie is worthless under the new values.
      expect(isValidSession(token, changed), JSON.stringify(changed)).toBe(
        false,
      );
    }
  });

  test("PG-016 isValidSession is true for the exact token and for nothing else", () => {
    const token = sessionToken(CONFIG);
    expect(isValidSession(token, CONFIG)).toBe(true);

    const oneCharacterChanged = `${token[0] === "A" ? "B" : "A"}${token.slice(1)}`;
    const refused: [string, string | null | undefined][] = [
      ["no cookie", undefined],
      ["null", null],
      ["an empty cookie", ""],
      ["a forged token of the right shape", "A".repeat(43)],
      [
        "another configuration's token",
        sessionToken({ password: OTHER_PASSWORD, secret: SECRET }),
      ],
      [
        "a token made with another secret",
        sessionToken({ password: PASSWORD, secret: OTHER_SECRET }),
      ],
      ["the token with one character changed", oneCharacterChanged],
      ["the token one character short", token.slice(0, -1)],
      ["the token with one character added", `${token}A`],
      ["the token between spaces", ` ${token} `],
      ["the token twice", `${token}${token}`],
      ["the password itself", PASSWORD],
      ["the secret itself", SECRET],
      ["a 10 000-character string", "A".repeat(10_000)],
    ];
    for (const [label, value] of refused) {
      expect(isValidSession(value, CONFIG), label).toBe(false);
    }
  });
});

test.describe("S6.2 report gate — the password check and the cookie", () => {
  test("PG-016 the exact password matches; anything else does not", () => {
    expect(passwordMatches(PASSWORD, CONFIG)).toBe(true);

    const lastChanged = `${PASSWORD.slice(0, -1)}${PASSWORD.endsWith("x") ? "y" : "x"}`;
    const refused: [string, string][] = [
      ["an empty password", ""],
      ["a wrong password", "wrong-password"],
      ["one character off", lastChanged],
      ["one character short", PASSWORD.slice(0, -1)],
      ["one character more", `${PASSWORD}x`],
      ["a leading space", ` ${PASSWORD}`],
      ["a trailing space", `${PASSWORD} `],
      ["in capitals", PASSWORD.toUpperCase()],
      ["the secret", SECRET],
      ["the session token", sessionToken(CONFIG)],
    ];
    for (const [label, candidate] of refused) {
      expect(passwordMatches(candidate, CONFIG), label).toBe(false);
    }
  });

  test("PG-016 a typed password longer than 200 characters is refused; at 200 it is still compared", () => {
    expect(MAX_PASSWORD_INPUT).toBe(200);
    for (const length of [MAX_PASSWORD_INPUT + 1, 10_000]) {
      expect(
        passwordMatches("x".repeat(length), CONFIG),
        `${length} characters`,
      ).toBe(false);
    }
    // The limit is inclusive: a 200-character password still matches itself.
    const longest: ReportConfig = {
      password: "p".repeat(MAX_PASSWORD_INPUT),
      secret: SECRET,
    };
    expect(passwordMatches(longest.password, longest)).toBe(true);
    expect(passwordMatches(`${longest.password}p`, longest)).toBe(false);
  });

  test("PG-016 the session cookie: only under /report, for 30 days, HttpOnly, Secure, SameSite=Lax", () => {
    expect(REPORT_COOKIE).toBe("ur_report");
    const token = sessionToken(CONFIG);
    // Max-Age is in seconds: 2592000 = 30 days × 24 hours × 3600 seconds.
    expect(sessionCookieHeader(token)).toBe(
      `ur_report=${token}; Path=/report; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
    );
  });
});
