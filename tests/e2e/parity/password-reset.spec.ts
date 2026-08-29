import { test, expect } from "../fixtures";
import { assertOrigin, requireEnv } from "../helpers/parity";

/**
 * Proof P3 — docs/ENVIRONMENT-PARITY.md §8: an auth e-mail requested on the Preview must
 * link back to the Preview's own origin, never to Production and never to localhost.
 *
 * This spec only REQUESTS the e-mail: a password reset for the signed-in fixture (an
 * owner-owned address, so the mail lands in the owner's inbox). The observation is the
 * owner's, recorded with the token redacted — and it is the origin the link RESOLVES to,
 * never the link's own host: under Supabase's default {{ .ConfirmationURL }} template the
 * href points at <project-ref>.supabase.co/auth/v1/verify?…&redirect_to=<origin>/auth/confirm…,
 * so the host is always Supabase. Read the `redirect_to` parameter, or follow the link and
 * read the address bar (it lands on the stale /unretire/reset-password — a 404 today,
 * Known issue 2 — which is expected and not part of the proof). requestPasswordReset() answers
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
