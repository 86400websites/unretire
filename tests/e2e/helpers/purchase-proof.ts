/**
 * Sprint S4.5c — why a paid parity spec may not quietly stop buying things.
 *
 * Both checkout specs were written re-run safe: once the fixture owns the
 * product, the page renders the owned CTA, the spec asserts the entitled state
 * and returns. The intent was sensible — do not spend money twice — but the
 * consequence was not. From the first successful run onward, a test titled
 * "a purchase reaches Stripe sandbox and grants access" stopped reaching Stripe
 * at all, and still reported PASS. The fixtures bought their products during
 * S2.5, so every parity dispatch since has proved only that a row already
 * existed.
 *
 * That mattered more than it looks. It is why nobody noticed that S3.1 changed
 * the checkout success_url and left tests/e2e/helpers/parity.ts waiting for the
 * old one: the code path that would have failed was no longer being run. Two
 * defects, hiding each other, in the single most important flow on a site whose
 * primary conversion is a payment.
 *
 * So the early return is no longer silent. By default an already-owned fixture
 * FAILS the spec with instructions, because the purchase was not proven. The
 * owner can opt into the reduced proof for a run where resetting is not wanted,
 * and then the spec says so in its own failure-free output rather than
 * pretending it bought something.
 */

/** Set E2E_ALLOW_ALREADY_OWNED=1 to accept "already entitled" as the outcome. */
export const ALREADY_OWNED_ACCEPTED =
  process.env.E2E_ALLOW_ALREADY_OWNED === "1";

export function alreadyOwnedMessage(product: string): string {
  return [
    `The ${product} fixture already owns this product, so this run did NOT exercise a purchase.`,
    "",
    `"${product} purchase reaches Stripe sandbox and grants access" is therefore unproven by this run,`,
    "and reporting it as a pass is what hid the stale success_url for two sprints.",
    "",
    "To prove it, delete that fixture's entitlement row in unretire-test (test database only)",
    "and dispatch E2E — Preview again with parity: on.",
    "",
    "To accept the reduced proof for this run instead, set E2E_ALLOW_ALREADY_OWNED=1.",
  ].join("\n");
}
