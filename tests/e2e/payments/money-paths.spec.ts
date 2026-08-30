import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";

/**
 * Sprint S3.1 — the money paths.
 * Covers docs/FEATURE-LIST.md lines PY-003, PY-004 (the honesty half) and PY-007.
 *
 * These are 🔴 lines: each one FAILED before this sprint and passes after it.
 * That red→green flip is the proof the fix works — which is why the specs live
 * in the fix sprint's own branch rather than being written up front (D-27).
 *
 * What is deliberately NOT here: anything needing a real payment. PY-001/PY-002
 * (buying) and PY-006 (#40, the idempotency key) require a Stripe SANDBOX
 * charge, so they belong to the dispatch-only parity project under D-25. The
 * three assertions below need no money and still prove the customer-visible
 * halves of Known issues 2, 22 and 45.
 *
 * PY-009 (#1, the broken book download) needs no spec here — AC-015 in
 * tests/e2e/accounts/access-boundaries.spec.ts already asserts it and was the
 * single red on the S5.1a Preview run. It turns green with this sprint.
 */

test.describe("PY-004 — a payment claim is never made without an entitlement", () => {
  // A real member who has bought NOTHING. The session is genuine; the
  // entitlement is absent. That is exactly the state a customer is in when
  // Known issue 22 silently failed to grant access.
  test.use({ storageState: storageStatePath("signed-in") });

  test("PY-004 /account?checkout=success does not claim access that does not exist", async ({
    page,
  }) => {
    await page.goto("/account?checkout=success");

    // Known issue 45. The banner used to render from the query string alone, so
    // this exact URL told an unentitled visitor "your access is ready below".
    // Combined with Known issue 22 that made silent money loss INVISIBLE: pay,
    // receive nothing, and be reassured. The claim must now follow the
    // database, not the URL.
    await expect(
      page.getByText("your access is ready", { exact: false }),
      "an unentitled member must never be told their access is ready",
    ).toHaveCount(0);

    // ...but the payment must not appear to have vanished either. Stripe's
    // webhook lands a moment after the browser redirect, so this is the
    // legitimate in-between state and it gets an honest message of its own.
    await expect(
      page.getByText("Payment received", { exact: false }),
      "a just-paid customer should be told their access is being activated",
    ).toBeVisible();
  });

  test("PY-003 — the page Stripe returns customers to actually exists", async ({
    page,
  }) => {
    // Known issue 2: success_url pointed at /unretire/account, removed by the
    // promote-to-root refactor, so every paying customer hit a 404 at the most
    // important moment of the journey. This asserts the destination itself.
    const response = await page.goto("/account?checkout=success");
    expect(
      response?.status(),
      "the post-payment landing page must not 404",
    ).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();

    // And the path the refactor orphaned must genuinely be gone, so this spec
    // cannot quietly pass again if the old URL were ever restored.
    const stale = await page.goto("/unretire/account?checkout=success");
    expect(
      stale?.status(),
      "the stale pre-refactor path should not resolve",
    ).toBe(404);
  });
});

test.describe("PY-007 — an existing owner is not sold the same thing twice", () => {
  // This fixture already holds an active 'course' entitlement.
  test.use({ storageState: storageStatePath("course") });

  test("PY-007 buying something you already own redirects to it, not to a 404", async ({
    page,
  }) => {
    // page.request, not the `api` fixture: this call must carry the member's
    // session so /api/checkout sees an owner (see AC-013's note in
    // tests/e2e/accounts/access-boundaries.spec.ts).
    const response = await page.request.post("/api/checkout", {
      data: { product: "course" },
      failOnStatusCode: false,
    });
    expect(response.status(), "an owner's checkout call should succeed").toBe(
      200,
    );

    const { url } = (await response.json()) as { url?: string };
    expect(url, "the response should carry a redirect URL").toBeTruthy();

    // Known issue 2: this returned /unretire/learn/course — a 404. The customer
    // who had already paid was sent nowhere.
    expect(
      new URL(url as string).pathname,
      "an existing owner should be sent to the course they own",
    ).toBe("/learn/course");

    // Stripe must not have been involved at all: an owner is never re-charged.
    expect(
      url,
      "an existing owner must not be sent to Stripe Checkout",
    ).not.toMatch(/checkout\.stripe\.com/);

    // And the destination has to actually work.
    const landing = await page.goto(url as string);
    expect(landing?.status(), "the redirect target must not 404").toBe(200);
  });
});
