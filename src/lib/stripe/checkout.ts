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

  // Known issue 40: Stripe advises an idempotency key on every POST so a
  // network retry cannot create a second session. The key is scoped to the
  // buyer + product and bucketed to the minute: a double-click or an automatic
  // retry reuses the same key and Stripe replays the original session, while a
  // genuine later attempt (the buyer cancelled, then changed their mind) falls
  // into a new bucket and gets a fresh one. Stripe expires keys after 24 h.
  const idempotencyKey = `checkout:${opts.userId}:${opts.product}:${Math.floor(
    Date.now() / 60_000,
  )}`;

  const session = await getStripe().checkout.sessions.create(
    {
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
        ? { payment_method_collection: "if_required" as const }
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
    },
    { idempotencyKey },
  );

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}
