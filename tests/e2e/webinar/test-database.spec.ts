import { test, expect } from "../fixtures";
import { isPreviewHost } from "./test-database";

/**
 * Sprint S6.2 — the guard behind the report spec's writing half
 * (report-page.spec.ts, testPassword()), asserted rather than trusted, as
 * tests/e2e/security/target-guard.spec.ts does for the harness's targets. The
 * report spec stores a visit and deletes every count, so it may run only
 * against a Vercel Preview of this project (the Codex review of S6.2,
 * Finding 2). A CI run always targets a Preview, so without this file a
 * weakened guard would stay green.
 */
test("S6.2 harness — the report's writing specs run only on a Vercel Preview of this project", () => {
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
