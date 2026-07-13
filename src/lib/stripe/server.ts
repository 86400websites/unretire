import Stripe from "stripe";

/**
 * Server-only Stripe client. Uses the secret key, which must never be
 * exposed to the browser. Import this only in Route Handlers / server code.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 apiVersion: "2026-06-24.dahlia",
});
