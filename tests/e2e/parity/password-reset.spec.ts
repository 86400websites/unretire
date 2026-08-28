import { test, expect } from "../fixtures";
import { assertOrigin, requireEnv } from "../helpers/parity";

/**
 * Proof P3 — docs/ENVIRONMENT-PARITY.md §8: an auth e-mail requested on the Preview must
 * link back to the Preview's own origin, never to Production and never to localhost.
 *
 * This spec only REQUESTS the e-mail: a password reset for the signed-in fixture (an
 * owner-owned address, so the mail lands in the owner's inbox). The observation — the
 * host of the link in the delivered e-mail — is the owner's read, recorded with the
 * token redacted. The link's path is the stale /unretire/reset-password (Known issue 2)
 * and lands on a 404 today; the host is the whole proof. requestPasswordReset() answers
 * with the same message whether or not the address exists (enumeration protection), so
 * that message is all a spec can assert.
 */
test("P3 — a password reset requested on the Preview sends its link back to the Preview", async ({
  page,
  baseURL,
}) => {
  const email = requireEnv(
    "E2E_SIGNED_IN_EMAIL",
    "docs/sprint-prompts/S2.3-playwright-harness.md, Gate 0 item 4",
  );

  await page.goto("/forgot-password");
  await assertOrigin(page, baseURL);

  await page.locator("#email").fill(email);
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();

  await expect(
    page.getByText(
      "If an account exists for that email, a reset link is on its way. Check your inbox.",
      { exact: true },
    ),
  ).toBeVisible({ timeout: 20_000 });
});
