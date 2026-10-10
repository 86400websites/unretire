import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Server-only Stripe client, created lazily on FIRST USE instead of at
 * import time. This matters for builds/environments where
 * STRIPE_SECRET_KEY isn't set (e.g. Preview deployments): importing this
 * module must never throw — only actually calling Stripe may.
 * The secret key must never be exposed to the browser; import this only
 * in Route Handlers / server code.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return _stripe;
}
