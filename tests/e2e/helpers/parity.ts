import { expect, type Page } from "@playwright/test";

/**
 * Helpers for the S2.5 parity specs (docs/ENVIRONMENT-PARITY.md §8; sprint record
 * docs/sprint-prompts/S2.5-environment-parity.md).
 *
 * These specs write real things — a signup in unretire-test, a Stripe SANDBOX payment,
 * one contact in the live Mailchimp audience — so they exist only in the `parity-chromium`
 * project, which playwright.config.ts includes only when E2E_PARITY=1, which only the
 * workflow_dispatch input `parity: on` sets (decision D-25). Never on pull_request,
 * never in the @morning set.
 *
 * Every address a parity spec types is built from E2E_OWNER_MAILBOX — the owner's own,
 * deliverable mailbox — with a plus-tag. The subscribe spec's Mailchimp submission is
 * governed by D-22 rules 1 and 2a–2e (docs/PROJECT-STATUS.md §8 — cited, not restated);
 * the signup spec's Supabase account uses the same owner-owned mailbox for the reason
 * docs/ENVIRONMENT-PARITY.md §6 C7 gives. No fabricated address is ever used. Values come
 * from process.env by NAME and are never logged; the two plus-tag addresses are attached
 * to their tests deliberately, so the builder can find the rows they created.
 */

export function requireEnv(name: string, whereItComesFrom: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it under GitHub → Settings → Secrets and variables → ` +
        `Actions → Secrets (${whereItComesFrom}) before dispatching the parity run.`,
    );
  }
  return value;
}

/** The only address shape the parity specs may use: <owner>+ur-<e2e|test>-<unique>@<domain>. */
const PLUS_TAG_SHAPE = /^[^@+\s]+\+ur-(e2e|test)-[a-z0-9-]+@[^@\s]+$/;

/**
 * Build a unique, owner-owned, plus-tagged address for one run. The run id makes every
 * run's address distinct (so P2's "new row" is unambiguous and the Mailchimp contact is
 * findable); Gmail-style plus addressing delivers all of them to the owner's inbox.
 */
export function ownerAddress(tag: "ur-e2e-p2" | "ur-test-s25"): string {
  const base = requireEnv(
    "E2E_OWNER_MAILBOX",
    "docs/sprint-prompts/S2.5-environment-parity.md, Gate 0 item 3",
  );
  const at = base.lastIndexOf("@");
  if (at < 1) {
    throw new Error(
      "E2E_OWNER_MAILBOX is not an e-mail address (expected local@domain).",
    );
  }
  const local = base.slice(0, at).split("+")[0];
  const domain = base.slice(at + 1);
  const runId = (process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  const address = `${local}+${tag}-${runId}@${domain}`;
  if (!PLUS_TAG_SHAPE.test(address)) {
    throw new Error(
      "Refusing to use an address outside the owner-plus-tag shape " +
        "(<owner>+ur-…-<unique>@…). Check E2E_OWNER_MAILBOX.",
    );
  }
  return address;
}

export function expectedOrigin(baseURL: string | undefined): string {
  if (!baseURL) throw new Error("baseURL is not configured.");
  return new URL(baseURL).origin;
}

/**
 * Never type an address or a credential anywhere but the validated deployment under
 * test (the same check tests/e2e/helpers/auth.ts makes before a sign-in).
 */
export async function assertOrigin(
  page: Page,
  baseURL: string | undefined,
): Promise<void> {
  const expected = expectedOrigin(baseURL);
  const actual = new URL(page.url()).origin;
  if (actual !== expected) {
    throw new Error(
      `Refusing to continue: the page resolved to ${actual}, not the deployment ` +
        `under test (${expected}).`,
    );
  }
}

/** Stripe's public TEST card (docs.stripe.com/testing). Sandbox only; not a secret. */
const TEST_CARD = {
  number: "4242424242424242",
  expiry: "12/34",
  cvc: "123",
  name: "E2E Fixture",
  postalCode: "10001",
};

/**
 * Complete Stripe's hosted Checkout with the test card and wait for the redirect back to
 * the deployment under test.
 *
 * THE TARGET IS `/account?checkout=success` — src/lib/stripe/checkout.ts:106.
 *
 * It used to be the stale `/unretire/account?checkout=success`, and this helper was
 * written against that: "the redirect target is the stale success_url (Known issue 2)".
 * S3.1 fixed the success_url and did not update this file, so from that sprint onward the
 * helper waited sixty seconds for a URL the site would never produce and then threw. It
 * was never noticed because the two specs that call it stopped calling it — see the
 * already-owned note in checkout-course.spec.ts — so the money path's only real proof was
 * broken and silent at the same time. Found by the S4.5c audit, not by a run.
 *
 * The bypass header never reaches checkout.stripe.com: the shared fixture attaches it to
 * same-origin requests only.
 */
export async function completeStripeCheckout(
  page: Page,
  origin: string,
): Promise<void> {
  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, {
    timeout: 30_000,
  });
  await page.waitForLoadState("networkidle").catch(() => undefined);

  // If Stripe offers its Link wallet for the pre-filled e-mail, decline it and pay as a guest.
  const noLink = page.getByRole("button", {
    name: /pay without link|continue without link|not now|use a different/i,
  });
  if (await noLink.count()) await noLink.first().click();

  const cardNumber = page.locator("#cardNumber");
  await cardNumber.waitFor({ state: "visible", timeout: 30_000 });
  await cardNumber.fill(TEST_CARD.number);
  await page.locator("#cardExpiry").fill(TEST_CARD.expiry);
  await page.locator("#cardCvc").fill(TEST_CARD.cvc);
  await page.locator("#billingName").fill(TEST_CARD.name);
  const country = page.locator("#billingCountry");
  if (await country.count()) await country.selectOption("US");
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill(TEST_CARD.postalCode);

  // Stripe's "Save my info for 1-click checkout" (Link) box, when pre-checked, makes a phone
  // number mandatory and blocks submission with a validation error. Pay as a plain guest.
  const saveWithLink = page.locator("#enableStripePass");
  if ((await saveWithLink.count()) && (await saveWithLink.isChecked())) {
    await saveWithLink.uncheck();
  }

  await page.getByTestId("hosted-payment-submit-button").click();

  // Either Stripe redirects back to the deployment under test, or it stops on a visible
  // validation / processing error. Fail fast with that error text (never a silent 60 s wait).
  const backOnOrigin = (url: URL) =>
    url.origin === origin &&
    url.pathname === "/account" &&
    url.searchParams.get("checkout") === "success";
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (backOnOrigin(new URL(page.url()))) return;
    const problem = await visibleStripeProblem(page);
    if (problem) {
      throw new Error(
        `Stripe Checkout did not complete — the page reports: "${problem}" ` +
          `(${await safeWhereAmI(page)})`,
      );
    }
    await page.waitForTimeout(1_000);
  }
  throw new Error(
    `Stripe Checkout did not redirect back within 60 s and showed no error text ` +
      `(${await safeWhereAmI(page)})`,
  );
}

/** Any visible error/alert text on Stripe's hosted page (validation, decline, Link prompt). */
async function visibleStripeProblem(page: Page): Promise<string | null> {
  const candidates = page.locator(
    '[role="alert"], .FieldError, [id$="-fieldset-error"], [data-testid*="error" i]',
  );
  const n = await candidates.count();
  const texts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const el = candidates.nth(i);
    if (await el.isVisible().catch(() => false)) {
      const t = (await el.innerText().catch(() => ""))
        .replace(/\s+/g, " ")
        .trim();
      if (t) texts.push(t);
    }
  }
  return texts.length ? texts.join(" | ").slice(0, 400) : null;
}

/**
 * Where the page is, without leaking anything: origin + first path segment only (a Stripe
 * Checkout URL carries the session id in its path; a Preview URL may carry a query string).
 */
async function safeWhereAmI(page: Page): Promise<string> {
  const url = new URL(page.url());
  const first = url.pathname.split("/").filter(Boolean)[0] ?? "";
  const title = (await page.title().catch(() => "")).slice(0, 80);
  return `at ${url.origin}/${first}${first ? "/…" : ""}; title "${title}"`;
}

/**
 * Proof P5's rendered half: the fixture's /account "Your access" card shows the entitled
 * state. This is a DESIGNED wait for third-party asynchrony — Stripe delivers
 * checkout.session.completed to the Sandbox endpoint (the `staging` deployment), which
 * writes unretire-test, which this Preview then reads. It is not a lengthened timeout for
 * a flaky assertion (docs/ENVIRONMENT-PARITY.md §6 C4): the ceiling is fixed at 90 s and
 * a run that needs more is a defect to investigate, not a number to raise. The database
 * row itself is read by the builder through supabase-test after the run — never inferred
 * from this page, the redirect or the banner (Known issues 22 and 45; §7 callout).
 */
export async function expectEntitled(
  page: Page,
  badge: "Course" | "Premium",
): Promise<void> {
  await expect
    .poll(
      async () => {
        await page.goto("/account");
        const access = page.locator(".card", { hasText: "Your access" });
        const cta = access.getByRole("link", { name: "Go to the course →" });
        const label = access.getByText(badge, { exact: true });
        return (await cta.count()) > 0 && (await label.count()) > 0;
      },
      { intervals: [3_000], timeout: 90_000 },
    )
    .toBe(true);
}
