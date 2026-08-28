import { test, expect } from "../fixtures";
import { assertOrigin, ownerAddress, requireEnv } from "../helpers/parity";

/**
 * Proof P2 (and the trigger for P3) — docs/ENVIRONMENT-PARITY.md §8.
 *
 * A signup on the Preview must create its auth.users row in unretire-test and NOT in
 * unretire-prod; the builder reads both projects (a count only) after the run, using the
 * address attached below, then deletes the throwaway account from unretire-test. If
 * "Confirm email" is ON in the test project, Supabase also sends a confirmation e-mail to
 * this owner-owned address — its link host is the owner's P3 read.
 *
 * register() in src/app/auth/actions.ts has exactly two success outcomes, decided by the
 * dashboard setting; this spec accepts exactly those two and annotates which one it saw so
 * the P9 parity table can be cross-checked against observed behaviour.
 */
test("P2 — a signup on the Preview lands in unretire-test", async ({
  page,
  baseURL,
}) => {
  const address = ownerAddress("ur-e2e-p2");
  const password = requireEnv(
    "E2E_FIXTURE_PASSWORD",
    "docs/sprint-prompts/S2.3-playwright-harness.md, Gate 0 item 4",
  );
  await test.info().attach("p2-signup-address", {
    body: address,
    contentType: "text/plain",
  });

  await page.goto("/signup");
  await assertOrigin(page, baseURL);

  await page.locator("#reg-email").fill(address);
  await page.locator("#reg-password").fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();

  // Outcome (a): "Confirm email" OFF — a live session, redirected to /account, which shows
  // the signed-in address. Outcome (b): ON — the degraded-mode notice, no session.
  const confirmOff = page.getByText(address, { exact: true });
  const confirmOn = page.getByText(
    "Account created. Please confirm your email from your inbox, then log in.",
    { exact: true },
  );
  await expect(confirmOff.or(confirmOn)).toBeVisible({ timeout: 20_000 });

  const outcome = (await confirmOn.count()) > 0 ? "ON" : "OFF";
  if (outcome === "OFF") await expect(page).toHaveURL(/\/account$/);
  test.info().annotations.push({
    type: "confirm-email",
    description: outcome,
  });
});
