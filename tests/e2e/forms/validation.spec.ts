import { test, expect } from "../fixtures";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers docs/FEATURE-LIST.md lines FM-001 and FM-008.
 *
 * These are the two halves of the email-capture contract that can be proved
 * WITHOUT writing anything: a malformed address must not submit, and a failed
 * submission must not be reported as a success.
 *
 * Updated in S4.5c. The rest of the family is no longer "deferred to parity":
 *   • FM-004 / PR-004 — server-side validation, the tag shape check and the
 *     merge-field allow-list: tests/e2e/forms/subscribe-payload.spec.ts.
 *   • FM-005 / FM-006 — the three Formspree forms now posting to /api/form:
 *     tests/e2e/forms/form-proxy.spec.ts.
 *   • FM-009 (Known issue 44) — S4.5 was supposed to close it and did not. The
 *     leak is fixed in S4.5c and asserted in subscribe-payload.spec.ts.
 * What genuinely still needs a real write — FM-002, FM-003, FM-007 delivery —
 * stays in tests/e2e/parity/ under D-25 and never runs on a pull request.
 */

/** A page that carries the shared EmailCaptureBand (src/app/about/page.tsx). */
const CAPTURE_PAGE = "/about";

test("FM-001 — a malformed address is rejected and never submitted", async ({
  page,
}) => {
  // Record any attempt to reach the subscribe endpoint. The assertion is that
  // there is none: rejection must happen before the network, not after.
  const attempts: string[] = [];
  await page.route("**/api/subscribe", async (route) => {
    attempts.push(route.request().url());
    // Never let a malformed-address test actually write to the live audience.
    await route.abort();
  });

  await page.goto(CAPTURE_PAGE);

  const email = page.locator('form input[type="email"]').first();
  await expect(
    email,
    "the capture form should use an email input so the browser validates it",
  ).toBeVisible();

  await email.fill("not-an-email");
  await email.press("Enter");

  // The form is still on screen — it did not pretend to succeed.
  await expect(email).toBeVisible();
  await expect(
    page.getByText(/you're in|you’re in/i),
    "a malformed address must never reach the success state",
  ).toHaveCount(0);

  expect(
    attempts,
    "a malformed address must not be sent to /api/subscribe",
  ).toEqual([]);
});

test("FM-008 — a failed submission is reported honestly, never as success", async ({
  page,
}) => {
  // Force the endpoint to fail the way it would if Mailchimp were down or a
  // required key were missing. Nothing is written: the request never leaves
  // the browser. This is the SECURITY-CHECKLIST §5 "fail closed" promise seen
  // from the visitor's side — an honest error, never a silent drop.
  await page.route("**/api/subscribe", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Server error" }),
    });
  });

  await page.goto(CAPTURE_PAGE);

  const email = page.locator('form input[type="email"]').first();
  await email.fill("s51a-probe@example.test");
  await email.press("Enter");

  // The success state must NOT appear.
  await expect(
    page.getByText(/you're in|you’re in/i),
    "a failed submission must never show the success message",
  ).toHaveCount(0);

  // And the visitor must be told something went wrong.
  await expect(
    page.getByText(/something went wrong|try again|error/i).first(),
    "a failed submission must show an honest error",
  ).toBeVisible();
});
