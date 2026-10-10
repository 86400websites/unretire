import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";
import { assertOrigin, expectedOrigin } from "../helpers/parity";

/**
 * FEATURE-LIST lines PY-005 and PY-006 — the two money-path lines the S5.1a
 * report carried to S5.1b ("Still owed (8)"), written for the launch-gate
 * verdict (Sprint S5.1b).
 *
 * Runs as the SIGNED-IN fixture — the member who owns nothing — because both
 * lines are about a purchase that must NOT result in access: a declined card
 * (PY-005) and a duplicate click that must not become a second payable session
 * (PY-006). The course/premium fixtures cannot carry these specs: they own
 * their products, so /api/checkout short-circuits to the already-owned
 * redirect and no Stripe session is ever created for them.
 *
 * Dispatch-only (D-25): each run creates a real SANDBOX Checkout Session and
 * the declined attempt is recorded in the sandbox dashboard. No money moves:
 * the only card ever submitted here is Stripe's public decline card, and the
 * final assertion is that the fixture still owns nothing afterwards.
 *
 * The card-form fill below deliberately mirrors, rather than refactors,
 * helpers/parity.ts completeStripeCheckout: that helper is the proven,
 * money-moving path for the P4/P5 purchase proofs, and the verdict run itself
 * is the wrong moment to destabilise it. The same reporting discipline applies
 * (Known issues 49/51): on failure report STRUCTURE, never page text — Stripe
 * pre-fills the fixture's e-mail on its hosted page.
 */

test.use({ storageState: storageStatePath("signed-in") });
// Stripe's hosted page — the same documented budget the purchase proofs use.
test.setTimeout(180_000);

/**
 * SERIAL, deliberately. Both tests drive the SAME fixture buying the SAME
 * product, and the idempotency key is buyer+product+params — so run in
 * parallel (CI uses 2 workers) they would share one Checkout Session and
 * PY-005's decline would land on the session PY-006 is asserting. Serial makes
 * the order defined rather than lucky. The cost — a failure skips the rest —
 * is acceptable here: the verdict's GO standard already fails on the first
 * failure, so nothing is hidden by the skip.
 */
test.describe.configure({ mode: "serial" });

/** Stripe's public generic-decline TEST card (docs.stripe.com/testing). Not a secret. */
const DECLINE_CARD = {
  number: "4000000000000002",
  expiry: "12/34",
  cvc: "123",
  name: "E2E Fixture",
  postalCode: "10001",
};

test("PY-006 — a double-click cannot open two payable sessions", async ({
  page,
  baseURL,
}) => {
  const origin = expectedOrigin(baseURL);
  // Land on the deployment first so page.request shares its cookie jar (the
  // member session must ride along — the same reasoning AC-013 records).
  await page.goto("/learn/course");
  await assertOrigin(page, baseURL);

  // page.request (not the `api` fixture) so the member's session rides along,
  // and an explicit Origin because Playwright's request context sends none —
  // both for the reasons PY-007 records in payments/money-paths.spec.ts.
  const click = () =>
    page.request.post("/api/checkout", {
      data: { product: "course" },
      headers: { Origin: origin },
      failOnStatusCode: false,
    });

  const first = await click();
  expect(first.status(), "the first click must start a checkout").toBe(200);
  const firstUrl = new URL(((await first.json()) as { url: string }).url);
  expect(
    firstUrl.hostname,
    "the signed-in fixture must own NOTHING — an already-owned redirect here " +
      "means a past run completed a purchase this fixture must never make; " +
      "clear its entitlement row in unretire-test before re-dispatching",
  ).toBe("checkout.stripe.com");

  const second = await click();
  expect(second.status(), "the duplicate click must not fail").toBe(200);
  const secondUrl = new URL(((await second.json()) as { url: string }).url);

  // Known issue 40 / pre-launch review Finding 5: the idempotency key is
  // buyer + product + parameters (src/lib/stripe/checkout.ts:126), so the
  // duplicate click REPLAYS the same open session instead of opening a second
  // one that could also be paid. Only one of them can ever be charged.
  expect(
    secondUrl.toString(),
    "a duplicate click must land on the SAME session, not a second payable one",
  ).toBe(firstUrl.toString());
});

test("PY-005 — a declined card is an honest failure and grants nothing", async ({
  page,
  baseURL,
}) => {
  await page.goto("/learn/course");
  await assertOrigin(page, baseURL);

  // Both CTAs render twice on this page (hero + CTA band) — scope to .first(),
  // the same strict-mode note checkout-course.spec.ts carries.
  const alreadyOwned = page
    .getByRole("link", { name: "Start the course →" })
    .first();
  const buy = page
    .getByRole("button", { name: "Buy the course — $99" })
    .first();
  await expect(buy.or(alreadyOwned).first()).toBeVisible();
  expect(
    await alreadyOwned.count(),
    "the signed-in fixture must own NOTHING before this spec runs — see PY-006",
  ).toBe(0);

  await buy.click();
  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, {
    timeout: 30_000,
  });
  await page
    .waitForLoadState("networkidle", { timeout: 10_000 })
    .catch(() => undefined);

  // If Stripe offers its Link wallet for the pre-filled e-mail, pay as a guest.
  const noLink = page.getByRole("button", {
    name: /pay without link|continue without link|not now|use a different/i,
  });
  if (await noLink.count()) await noLink.first().click();

  const cardNumber = page.locator("#cardNumber");
  await cardNumber.waitFor({ state: "visible", timeout: 45_000 });
  await cardNumber.fill(DECLINE_CARD.number);
  await page.locator("#cardExpiry").fill(DECLINE_CARD.expiry);
  await page.locator("#cardCvc").fill(DECLINE_CARD.cvc);
  await page.locator("#billingName").fill(DECLINE_CARD.name);
  const country = page.locator("#billingCountry");
  if (await country.count()) await country.selectOption("US");
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill(DECLINE_CARD.postalCode);
  const saveWithLink = page.locator("#enableStripePass");
  if ((await saveWithLink.count()) && (await saveWithLink.isChecked())) {
    await saveWithLink.uncheck();
  }

  await page.getByTestId("hosted-payment-submit-button").click();

  // The honest failure: Stripe tells the customer, on its own page…
  await expect(
    page.getByText(/declined/i).first(),
    "the customer must be told the card was declined",
  ).toBeVisible({ timeout: 30_000 });
  // …and the customer is never sent to the success page.
  expect(
    new URL(page.url()).hostname,
    "a declined card must never reach the success redirect",
  ).toBe("checkout.stripe.com");

  // And grants nothing: back on the deployment, the fixture still owns nothing.
  await page.goto("/learn/course");
  await expect(
    page.getByRole("button", { name: "Buy the course — $99" }).first(),
    "a declined card must leave the member un-entitled",
  ).toBeVisible();
  expect(
    await page.getByRole("link", { name: "Start the course →" }).count(),
    "no entitlement may exist after a declined payment",
  ).toBe(0);
});
