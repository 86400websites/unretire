import { createHash } from "node:crypto";
import { getStripe } from "@/lib/stripe/server";

/**
 * Identifies sessions created by THIS application inside a Stripe account that
 * is shared with other projects (Known issue 41). Not a secret — a label.
 */
export const STRIPE_APP_ID = "unretire";

export type PaidProduct = "course" | "premium";

export function isPaidProduct(v: unknown): v is PaidProduct {
  return v === "course" || v === "premium";
}

// Map the product → Stripe price + checkout mode + where "Back" lands.
// Prices come from env so we can swap test → live without code changes.
const PRODUCT_CONFIG = {
  course: {
    priceEnv: () => process.env.STRIPE_PRICE_COURSE,
    mode: "payment" as const,
    cancelPath: "/learn/course",
  },
  premium: {
    priceEnv: () => process.env.STRIPE_PRICE_PREMIUM,
    mode: "subscription" as const,
    cancelPath: "/premium",
  },
};

/**
 * Single source of truth for creating a Stripe Checkout Session.
 * Used by BOTH /api/checkout (logged-in buys) and the register/login
 * server actions (brand-new buys). Returns the Stripe URL to send the
 * user to. Throws on misconfiguration or Stripe errors — callers
 * decide how to surface that.
 */
export async function createCheckoutSession(opts: {
  userId: string;
  email: string | null;
  product: PaidProduct;
  origin: string;
}): Promise<string> {
  const config = PRODUCT_CONFIG[opts.product];
  const price = config.priceEnv();
  if (!price)
    throw new Error(`Stripe price not configured for ${opts.product}`);

  // Known issue 40, revised for pre-launch review Finding 5 (Blocking).
  //
  // The first version bucketed the key by minute, which meant it did NOT cover
  // the case it was added for: two tabs, or an impatient retry, either side of
  // a minute boundary produced two DIFFERENT keys and therefore two payable
  // sessions. An idempotency key should identify one operation, not one moment.
  //
  // The key is stable for a given buyer and product, so a double-click, a
  // retry, or a second tab all land on the SAME Checkout Session and only one
  // of them can be paid.
  //
  // …AND ON THE PARAMETERS. Added in S4.5c after the first parity run that
  // actually reached Stripe. `success_url` and `cancel_url` embed
  // `opts.origin`, so the same buyer arriving from a different origin — a new
  // Preview deployment, apex instead of www — produced the same key with
  // DIFFERENT parameters. Stripe rejects that outright ("keys for idempotent
  // requests can only be used with the same parameters"), the route 500s, and
  // the buyer cannot pay at all. An idempotency key must identify one
  // operation *including its inputs*; keying on the buyer alone was only half
  // the identity. Two tabs on the same origin still share a key, which is the
  // case Known issue 40 is about.
  const paramsFingerprint = (payload: unknown) =>
    createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex")
      .slice(0, 16);

  // Extracted so the self-heal below can re-issue the IDENTICAL parameters;
  // Stripe rejects a reused idempotency key whose payload differs.
  const params = {
    mode: config.mode,
    line_items: [{ price, quantity: 1 }],
    // Shows the "Add promotion code" field at checkout so guests can enter
    // a Stripe promotion code (e.g. FREE during the preview). Discounts are
    // configured entirely in the Stripe dashboard — no code changes to add,
    // change, or expire a coupon.
    allow_promotion_codes: true,
    // For subscriptions only: don't force a card when nothing is due now.
    // A 100%-off ("Forever") coupon makes the subscription $0, so with this
    // set Stripe completes checkout without asking for a card. One-time
    // payments (the course) don't need this and already skip the card at $0.
    ...(config.mode === "subscription"
      ? {
          payment_method_collection: "if_required" as const,
          // Pre-launch review Finding 4. Checkout metadata lands on the
          // SESSION, but customer.subscription.* events carry the
          // SUBSCRIPTION, which had none — so lifecycle handlers could only
          // match on stripe_subscription_id and had no way to tell "not ours"
          // from "ours, but the grant has not landed yet". Stamping the
          // subscription makes every later event self-identifying.
          subscription_data: {
            metadata: {
              supabase_user_id: opts.userId,
              product: opts.product,
              app: STRIPE_APP_ID,
            },
          },
        }
      : {}),
    customer_email: opts.email ?? undefined,
    client_reference_id: opts.userId,
    // `app` is Known issue 41's discriminator. The LIVE Stripe account is
    // shared with other projects, so their events reach our webhook too;
    // stamping our own name lets the handler tell them apart by something
    // better than "this user id happens to look like one of ours".
    metadata: {
      supabase_user_id: opts.userId,
      product: opts.product,
      app: STRIPE_APP_ID,
    },
    // Known issue 2: this was `/unretire/account`, a path the promote-to-root
    // refactor removed — so every paying customer landed on a 404 at the most
    // important moment of the journey.
    success_url: `${opts.origin}/account?checkout=success`,
    cancel_url: `${opts.origin}${config.cancelPath}?checkout=cancelled`,
  };

  const idempotencyKey = `checkout:${opts.userId}:${opts.product}:${paramsFingerprint(params)}`;

  /**
   * A stable key means Stripe may replay a session created earlier. If that
   * session is no longer open — already completed, or expired after 24 h — it
   * carries NO url at all (verified against the sandbox: every session whose
   * status is not `open` returns `url: null`), so the buyer must be given a
   * genuinely new one, keyed on the stale session they were just handed.
   *
   * THIS IS A LOOP, and that matters. The first version healed exactly once:
   * `key:after:<A>` is itself deterministic, so as soon as that second session
   * also completed, the replay returned it with a null url and the route threw
   * — a buyer who had reached that state could never pay again, for ever.
   * Caught on 2026-08-31 when the parity suite bought Premium twice in an hour
   * and the second attempt 500'd. Each stale session has a distinct id, so
   * chaining on it terminates; the bound is belt and braces against a Stripe
   * behaviour change, and exhausting it is a real error rather than a silent
   * dead link.
   */
  const stripe = getStripe();
  let session = await stripe.checkout.sessions.create(params, {
    idempotencyKey,
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!session.status || session.status === "open") break;
    session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: `${idempotencyKey}:after:${session.id}`,
    });
  }

  if (!session.url) {
    throw new Error(
      `Stripe returned no checkout URL for ${opts.product} (last session status: ${session.status ?? "unknown"})`,
    );
  }
  return session.url;
}
