import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers docs/FEATURE-LIST.md lines AC-002, AC-010, AC-013 and AC-015.
 *
 * Every one of these reuses a session stored by an auth-setup project. No
 * credential is ever typed in this file: the setup projects already prove
 * "a member can log in" (proof P1, helpers/auth.ts), so re-typing a password
 * inside a browser project would add no coverage and would put the value in
 * reach of the runner's failure artefacts (Known issues 49 and 51).
 *
 * AC-011 and AC-012 (the paid-content boundary, Known issue 37) are 🔴 lines
 * and are NOT written here — they belong to the S4.3 fix sprint.
 */

test.describe("AC-010 — a signed-out visitor is denied the account area", () => {
  // Explicitly no stored session: this is the anonymous case.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("AC-010 /account redirects an anonymous visitor to /login", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);

    // Never the content. The signed-in heading must not appear.
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toHaveCount(0);
  });

  test("AC-010 /api/book-download refuses an anonymous request", async ({
    api,
  }) => {
    // `api`, not `page.request`: the latter is not routed, so on a protected
    // Preview it never reaches the app — Vercel answers 401 first. This test in
    // particular carries an empty storageState, so it has no bypass cookie to
    // fall back on (S5.1a; see tests/e2e/fixtures.ts).
    const response = await api.post("/api/book-download", {
      data: { name: "E2E Fixture", type: "book" },
      failOnStatusCode: false,
    });
    expect(response.status(), "anonymous download must be refused").toBe(403);
  });
});

/*
 * AC-002 used to live here. It moved to tests/e2e/logout/ in S3.1 because it is
 * DESTRUCTIVE to a shared fixture: `logout()` calls supabase signOut() at its
 * default `global` scope (src/app/auth/actions.ts:178), which revokes every
 * session belonging to that user — not just the one in this browser. Running in
 * parallel with any other spec that uses the same fixture, it silently signed
 * that spec out mid-test. It cost run #103/#104 two false failures (PY-003 and
 * PY-004) before the cause was found.
 *
 * The logout project depends on this one, so it now runs strictly afterwards.
 */

test.describe("AC-013 — the book download is Premium-only", () => {
  test.use({ storageState: storageStatePath("course") });

  test("AC-013 a course-only member is refused the book download", async ({
    page,
  }) => {
    // The course fixture holds a real 'course' entitlement and no 'premium'
    // one. ownsProduct() deliberately does NOT promote course → premium
    // (src/lib/auth/entitlements.ts), so this must be a 403.
    //
    // `page.request` here, NOT the `api` fixture — the opposite of AC-010
    // above. This call must carry the member's session, and `page.request`
    // shares the browser context's cookie jar; a standalone APIRequestContext
    // would be anonymous and would return 403 for the wrong reason, making the
    // test pass while proving nothing. The Vercel bypass rides along in the
    // same jar: the auth setup navigates with `x-vercel-set-bypass-cookie`,
    // so the stored role session contains the bypass cookie by design.
    const response = await page.request.post("/api/book-download", {
      data: { name: "E2E Fixture", type: "book" },
      failOnStatusCode: false,
    });
    expect(
      response.status(),
      "a course-only member must not reach the Premium book",
    ).toBe(403);
  });
});

test.describe("AC-015 — Premium includes the course", () => {
  test.use({ storageState: storageStatePath("premium") });

  test("AC-015 a Premium member reaches course content", async ({ page }) => {
    await page.goto("/learn/course");

    // ownsProduct('course', ['premium']) === true, so the page must show the
    // entitled state, not the sales state.
    await expect(
      page.getByText("You're enrolled.").or(page.getByText("You’re enrolled.")),
      "a Premium member should see the enrolled state on the course page",
    ).toBeVisible();

    const response = await page.goto("/learn/course/module-1");
    expect(response?.status()).toBe(200);

    // S4.3: this previously counted svg[aria-label="Locked"] and expected 0 —
    // which was true on every run for the wrong reason. That label exists on
    // the course HUB, never in the player, so the selector matched nothing
    // whatever the entitlement was. A test that cannot fail proves nothing.
    // The real signals are that the lesson rows are enabled and the video the
    // member paid for is actually there.
    expect(
      await page.locator("button[disabled]").count(),
      "no lesson row should be disabled for an entitled member",
    ).toBe(0);
    await expect(
      page.locator('iframe[src*="youtube"]').first(),
      "an entitled member should be served the lesson video",
    ).toBeVisible({ timeout: 15_000 });
  });

  test("AC-015 a Premium member is allowed the book download", async ({
    page,
  }) => {
    // The allowed half of the boundary. AC-013 proved the denied half.
    //
    // Known issue 1 was CONFIRMED here on PR #20 (runs #94/#95: content-type
    // came back `application/json`) and then CONFIRMED FIXED on PR #21 run
    // #103, which returned a real watermarked PDF and left the first-ever row
    // in `book_downloads` — the table had been empty since the project began.
    //
    // WHY THIS ASSERTION IS SHAPED THIS WAY. The route enforces one download
    // per user per document (route.ts:77-90). Having proved the PDF path once,
    // this fixture can NEVER obtain that document again, so asserting
    // "content-type is application/pdf" would make the spec pass exactly once
    // in the project's lifetime and fail on every run after — which is what
    // happened on run #104, an hour after it first went green.
    //
    // So the assertion is the invariant that must hold on EVERY run: the member
    // is authorised, and the route is capable of producing the document. A
    // "you already downloaded this" refusal is a legitimate business rule and
    // is accepted. Known issue 1's signature — the route being unable to read
    // its master at all — is not.
    //
    // `page.request`, not `api`, for the same reason as AC-013 above: the call
    // must carry this member's session.
    const response = await page.request.post("/api/book-download", {
      data: { name: "E2E Fixture", type: "book" },
      failOnStatusCode: false,
    });

    expect(
      response.status(),
      "a Premium member must be authorised for the book download",
    ).not.toBe(403);

    const contentType = response.headers()["content-type"] ?? "";
    if (contentType.includes("application/pdf")) return; // fresh download — the strongest pass

    // Otherwise the only acceptable answer is the one-per-document rule:
    // route.ts:88-95 answers 409 "You've already downloaded this". Known issue
    // 1's signature was a 500 from route.ts:97-101 — "the book is not available
    // right now" — so a 500 here means the master PDF path has regressed.
    const body = await response.text();
    expect(
      response.status(),
      "a non-PDF answer must be the 409 one-time-download rule, never a 500 (Known issue 1)",
    ).toBe(409);
    expect(
      body,
      "the route must not be failing to read its master PDF (Known issue 1)",
    ).not.toMatch(/not available right now/i);
    expect(
      body,
      "the only acceptable non-PDF answer is the one-download-per-document rule",
    ).toMatch(/already downloaded/i);
  });
});
