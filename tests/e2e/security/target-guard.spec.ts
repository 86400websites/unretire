import { test, expect } from "../fixtures";
import { PRODUCTION_HOST, resolveTarget } from "../helpers/target";

/**
 * Sprint S5.2 — the harness's own reach, asserted.
 *
 * Until S5.2 the target rule lived inside playwright.config.ts and was proven
 * only by reading it. The sprint widened it — the daily `@morning` check must
 * point at Production — and a rule that governs where a secret may be sent
 * should not be widened on trust. So the rule moved to tests/e2e/helpers/target.ts
 * and this spec pins every refusal that must survive: Production without the
 * morning flag, Production with a bypass secret (morning flag or not), both
 * Vercel aliases, foreign hosts, and http on a deployed host.
 *
 * Tested directly, like the origin and redirect guards: the value under test is
 * a decision, not a page, and the failure mode (a bypass secret sent to the
 * wrong host) is exactly the one a browser run must never be allowed to produce.
 */

const PREVIEW = "https://unretire-1gbvflsep-86400-s-projects.vercel.app";
const BRANCH_ALIAS = "https://unretire-git-master-86400-s-projects.vercel.app";
const DEFAULT_ALIAS = "https://unretire.vercel.app";
const PRODUCTION = `https://${PRODUCTION_HOST}`;
const LOCAL = "http://localhost:3000";

const ordinary = { bypassPresent: false, morningRun: false };
const withBypass = { bypassPresent: true, morningRun: false };
const morning = { bypassPresent: false, morningRun: true };
const morningWithBypass = { bypassPresent: true, morningRun: true };
const EVERY_MODE = [ordinary, withBypass, morning, morningWithBypass];

test("HARNESS — Production is refused unless the run is the morning check", () => {
  expect(() => resolveTarget(PRODUCTION, ordinary)).toThrow(/Refusing to test/);
  expect(resolveTarget(PRODUCTION, morning)).toBe(PRODUCTION);
});

test("HARNESS — a bypass secret never reaches Production, morning check or not", () => {
  expect(() => resolveTarget(PRODUCTION, withBypass)).toThrow(/bypass secret/);
  expect(() => resolveTarget(PRODUCTION, morningWithBypass)).toThrow(
    /bypass secret/,
  );
  // Nor localhost: a bypass-bearing run has exactly one legitimate destination.
  expect(() => resolveTarget(LOCAL, withBypass)).toThrow(/bypass secret/);
  expect(() => resolveTarget(LOCAL, morningWithBypass)).toThrow(
    /bypass secret/,
  );
});

test("HARNESS — both Vercel aliases are refused in every mode", () => {
  for (const mode of EVERY_MODE) {
    // The production branch's alias shares the project-host shape.
    expect(() => resolveTarget(BRANCH_ALIAS, mode)).toThrow(/Refusing to test/);
    // The project's default alias — still serving 200 (Known issue 58).
    expect(() => resolveTarget(DEFAULT_ALIAS, mode)).toThrow(
      /Refusing to test/,
    );
  }
});

test("HARNESS — a foreign host is refused in every mode", () => {
  const foreign = [
    "https://evil.example",
    `https://${PRODUCTION_HOST}.evil.example`,
    `https://evil-${PRODUCTION_HOST}`,
    // The apex is not the canonical host; it redirects to www and is not a target.
    "https://unretireproject.com",
    // A deployed host is https only.
    `http://${PRODUCTION_HOST}`,
    "http://unretire-1gbvflsep-86400-s-projects.vercel.app",
  ];
  for (const mode of EVERY_MODE) {
    for (const target of foreign) {
      expect(
        () => resolveTarget(target, mode),
        `${target} should be refused`,
      ).toThrow(/Refusing to test/);
    }
  }
});

test("HARNESS — a Preview host is accepted in every mode, and only its origin is kept", () => {
  for (const mode of EVERY_MODE) {
    expect(resolveTarget(`${PREVIEW}/some/path?x=1#y`, mode)).toBe(PREVIEW);
  }
});

test("HARNESS — localhost is a credential-free self-check only", () => {
  expect(resolveTarget(LOCAL, ordinary)).toBe(LOCAL);
  // A local dry run of the morning set is allowed — it carries no secret.
  expect(resolveTarget(LOCAL, morning)).toBe(LOCAL);
  expect(() => resolveTarget(LOCAL, withBypass)).toThrow(/Refusing to test/);
});

test("HARNESS — a missing or relative target is refused before anything runs", () => {
  for (const mode of EVERY_MODE) {
    expect(() => resolveTarget(undefined, mode)).toThrow(/is not set/);
    expect(() => resolveTarget("", mode)).toThrow(/is not set/);
    expect(() => resolveTarget("/relative", mode)).toThrow(
      /not an absolute URL/,
    );
  }
});
