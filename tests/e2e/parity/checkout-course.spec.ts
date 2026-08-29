import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";
import {
  assertOrigin,
  completeStripeCheckout,
  expectEntitled,
  expectedOrigin,
} from "../helpers/parity";

/**
 * Proofs P4 and P5 for the one-time Course product — docs/ENVIRONMENT-PARITY.md §8.
 *
 * Runs as the course fixture (session stored by setup:course — proof P1). A real Stripe
 * SANDBOX checkout with the public test card; Stripe delivers checkout.session.completed
 * to the Sandbox endpoint on the `staging` deployment, which writes the entitlement into
 * unretire-test; this Preview then renders the entitled state. The redirect lands on the
 * stale /unretire/account path (Known issue 2) — asserted as a URL only. The success
 * banner and the HTTP status prove nothing on this codebase (Known issues 22, 45) and are
 * never asserted; the row itself is read by the builder after the run.
 *
 * Re-run safe: once the fixture owns the course, /learn/course renders "Start the course →"
 * instead of the buy button, so the spec asserts the entitled state and pays nothing
 * (docs/ENVIRONMENT-PARITY.md §5.5 fixture 7's path).
 */
test.use({ storageState: storageStatePath("course") });
// Stripe's hosted page plus the asynchronous webhook hop — a documented budget, not a tuning knob.
test.setTimeout(180_000);

test("P4/P5 — a Course purchase on the Preview reaches Stripe sandbox and grants access in unretire-test", async ({
  page,
  baseURL,
}) => {
  const origin = expectedOrigin(baseURL);
  await page.goto("/learn/course");
  await assertOrigin(page, baseURL);

  // Both CTAs render twice on this page (hero + CTA band) — an unqualified locator is a
  // Playwright strict-mode violation, so every one is scoped to its first match.
  const alreadyOwned = page
    .getByRole("link", { name: "Start the course →" })
    .first();
  const buy = page
    .getByRole("button", { name: "Buy the course — $99" })
    .first();
  await expect(alreadyOwned.or(buy).first()).toBeVisible();

  if ((await alreadyOwned.count()) > 0) {
    await expectEntitled(page, "Course");
    return;
  }

  await buy.click();
  await completeStripeCheckout(page, origin);
  await expectEntitled(page, "Course");
});
