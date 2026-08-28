import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";
import {
  assertOrigin,
  completeStripeCheckout,
  expectEntitled,
  expectedOrigin,
} from "../helpers/parity";

/**
 * Proofs P4 and P5 for the yearly Premium subscription — docs/ENVIRONMENT-PARITY.md §8.
 *
 * Runs as the premium fixture (session stored by setup:premium). Same mechanism as the
 * course spec, in Stripe's `subscription` mode: a $199/year sandbox subscription with the
 * public test card (a card is required — no promotion code is used, so
 * payment_method_collection: "if_required" collects one). Re-run safe: an owning fixture
 * sees the CheckoutButton's owned state ("Go to your course →") and pays nothing.
 */
test.use({ storageState: storageStatePath("premium") });
test.setTimeout(180_000);

test("P4/P5 — a Premium subscription on the Preview reaches Stripe sandbox and grants access in unretire-test", async ({
  page,
  baseURL,
}) => {
  const origin = expectedOrigin(baseURL);
  await page.goto("/premium");
  await assertOrigin(page, baseURL);

  const alreadyOwned = page
    .getByRole("button", { name: "Go to your course →" })
    .first();
  // The owned CTA renders twice on /premium (hero + band) once the fixture owns it, hence
  // `.first()` above; the hero's "Join Premium — $199/year" label is unique (the band reads
  // "Join Premium").
  const join = page.getByRole("button", { name: "Join Premium — $199/year" });
  await expect(alreadyOwned.or(join).first()).toBeVisible();

  if ((await alreadyOwned.count()) > 0) {
    await expectEntitled(page, "Premium");
    return;
  }

  await join.click();
  await completeStripeCheckout(page, origin);
  await expectEntitled(page, "Premium");
});
