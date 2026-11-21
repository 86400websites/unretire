import { test, expect } from "../fixtures";
import {
  isPreviewHost,
  isTestDatabase,
  isWorkflowPreview,
  TEST_DATABASE_ORIGIN,
} from "./test-database";

/**
 * Sprint S6.2 — the guards behind the report spec's writing half
 * (report-page.spec.ts), asserted rather than trusted, as
 * tests/e2e/security/target-guard.spec.ts does for the harness's targets. The
 * report spec stores a visit and deletes every count, so it may do so only
 * against the Preview the workflow resolved, and only when that deployment
 * says its report uses the test database (the independent review of S6.2:
 * round 1, Finding 2; round 2, Finding 1; round 3, Finding 1). A CI run
 * always meets both, so without this file a weakened guard would stay green.
 */

const PREVIEW = "https://unretire-abc123-86400-s-projects.vercel.app";
/** unretire-prod's origin (its project ref is in supabase/migrations/README.md). */
const PRODUCTION_DATABASE_ORIGIN = "https://hcjivvlwxltyiycfbttc.supabase.co";

test("S6.2 harness — a host has a Preview's shape, and the production branch's alias and every other host do not", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "www.unretireproject.com",
    "unretireproject.com",
    // The Vercel default alias of Production (Known issue 58).
    "unretire.vercel.app",
    // The production branch's alias.
    "unretire-git-master-abc123-86400-s-projects.vercel.app",
    "evil.example",
    "unretire-abc123-86400-s-projects.vercel.app.evil.example",
    "x-unretire-abc123-86400-s-projects.vercel.app",
  ]) {
    expect(isPreviewHost(host), host).toBe(false);
  }
  for (const host of [
    "unretire-abc123-86400-s-projects.vercel.app",
    "unretire-cwofgm30s-86400-s-projects.vercel.app",
    "unretire-git-claude-s62-webinar-report-86400-s-projects.vercel.app",
  ]) {
    expect(isPreviewHost(host), host).toBe(true);
  }
});

test("S6.2 harness — the test password and the writes go only to the Preview the workflow resolved: a deployment address typed by hand is never enough", () => {
  // The workflow's own run: the target is the origin it resolved.
  expect(isWorkflowPreview(PREVIEW, PREVIEW)).toBe(true);
  expect(isWorkflowPreview(`${PREVIEW}/`, PREVIEW)).toBe(true);

  const refused: [string, string | undefined, string | undefined][] = [
    // A Production deployment's own address has exactly a Preview's shape.
    // Typed by hand, nothing says GitHub recorded it as a Preview.
    [
      "a deployment address with no proof from the workflow",
      PREVIEW,
      undefined,
    ],
    ["an empty proof", PREVIEW, ""],
    [
      "another deployment than the one the workflow resolved",
      "https://unretire-prod999-86400-s-projects.vercel.app",
      PREVIEW,
    ],
    ["a local server", "http://localhost:3000", "http://localhost:3000"],
    [
      "the live site",
      "https://www.unretireproject.com",
      "https://www.unretireproject.com",
    ],
    [
      "the production branch's alias",
      "https://unretire-git-master-abc123-86400-s-projects.vercel.app",
      "https://unretire-git-master-abc123-86400-s-projects.vercel.app",
    ],
    ["http, not https", PREVIEW.replace("https:", "http:"), PREVIEW],
    ["a proof that is not an address", PREVIEW, "preview"],
    ["no target at all", undefined, PREVIEW],
  ];
  for (const [label, target, proof] of refused) {
    expect(isWorkflowPreview(target, proof), label).toBe(false);
  }
});

test("S6.2 harness — nothing is stored or reset unless the deployment names EXACTLY the test database's origin", () => {
  expect(isTestDatabase(TEST_DATABASE_ORIGIN)).toBe(true);
  // The test project, by its whole address — a changed constant must turn
  // this red.
  expect(TEST_DATABASE_ORIGIN).toBe("https://dtdadtggahjsrmevwvbu.supabase.co");

  const refused: [string, string | null | undefined][] = [
    ["a Preview given the live database", PRODUCTION_DATABASE_ORIGIN],
    ["a deployment that carries no marker (any other database)", null],
    ["nothing read yet", undefined],
    ["an empty value", ""],
    ["another project", "https://abcdefghijklmnopqrst.supabase.co"],
    // The independent review's round 3, Finding 1: the right first label on
    // another domain — a gateway that could route anywhere — is not the test
    // database.
    [
      "the right first label on a different domain",
      "https://dtdadtggahjsrmevwvbu.gateway.invalid",
    ],
    [
      "the right host as a label of another domain",
      "https://dtdadtggahjsrmevwvbu.supabase.co.evil.invalid",
    ],
    ["the project's name alone", "dtdadtggahjsrmevwvbu"],
    ["the host without its scheme", "dtdadtggahjsrmevwvbu.supabase.co"],
    ["http, not https", "http://dtdadtggahjsrmevwvbu.supabase.co"],
    ["a port", "https://dtdadtggahjsrmevwvbu.supabase.co:8443"],
    ["a trailing slash", `${TEST_DATABASE_ORIGIN}/`],
    ["a path", `${TEST_DATABASE_ORIGIN}/rest/v1`],
    ["another case", TEST_DATABASE_ORIGIN.toUpperCase()],
  ];
  for (const [label, origin] of refused) {
    expect(isTestDatabase(origin), label).toBe(false);
  }
});
