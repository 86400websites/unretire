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
    page,
  }) => {
    const response = await page.request.post("/api/book-download", {
      data: { name: "E2E Fixture", type: "book" },
      failOnStatusCode: false,
    });
    expect(response.status(), "anonymous download must be refused").toBe(403);
  });
});

test.describe("AC-002 — a member can log out", () => {
  test.use({ storageState: storageStatePath("signed-in") });

  test("AC-002 logging out ends the session", async ({ page }) => {
    await page.goto("/account");
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();

    await page.getByRole("button", { name: /log ?out|sign ?out/i }).click();
    await page.waitForURL(/\/login/);

    // The session is genuinely gone, not just navigated away from: the gated
    // route must now bounce us again.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("AC-013 — the book download is Premium-only", () => {
  test.use({ storageState: storageStatePath("course") });

  test("AC-013 a course-only member is refused the book download", async ({
    page,
  }) => {
    // The course fixture holds a real 'course' entitlement and no 'premium'
    // one. ownsProduct() deliberately does NOT promote course → premium
    // (src/lib/auth/entitlements.ts), so this must be a 403.
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
    expect(
      await page.locator('svg[aria-label="Locked"]').count(),
      "no module should read as locked for a Premium member",
    ).toBe(0);
  });

  test("AC-015 a Premium member is allowed the book download", async ({
    page,
  }) => {
    // The allowed half of the boundary. AC-013 proved the denied half.
    // NOTE: this is expected to FAIL today for a reason that is NOT an access
    // problem — Known issue 1, the route reads its master PDFs from a stale
    // path. A 500 here confirms #1; a 403 would mean the entitlement check
    // itself regressed, which is a different and worse finding.
    const response = await page.request.post("/api/book-download", {
      data: { name: "E2E Fixture", type: "book" },
      failOnStatusCode: false,
    });
    expect(
      response.status(),
      "a Premium member must be authorised for the book download",
    ).not.toBe(403);
    expect(
      response.headers()["content-type"],
      "the download should return a PDF (Known issue 1 breaks this today)",
    ).toContain("application/pdf");
  });
});
