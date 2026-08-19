import { getStripe } from "@/lib/stripe/server";

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
    cancelPath: "/unretire/learn/course",
  },
  premium: {
    priceEnv: () => process.env.STRIPE_PRICE_PREMIUM,
    mode: "subscription" as const,
    cancelPath: "/unretire/premium",
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
  if (!price) throw new Error(`Stripe price not configured for ${opts.product}`);

  const session = await getStripe().checkout.sessions.create({
    mode: config.mode,
    line_items: [{ price, quantity: 1 }],
    // Shows the "Add promotion code" field at checkout so guests can enter
    // a Stripe promotion code (e.g. FREE during the preview). Discounts are
    // configured entirely in the Stripe dashboard — no code changes to add,
    // change, or expire a coupon.
    allow_promotion_codes: true,
    customer_email: opts.email ?? undefined,
    client_reference_id: opts.userId,
    metadata: { supabase_user_id: opts.userId, product: opts.product },
    success_url: `${opts.origin}/unretire/account?checkout=success`,
    cancel_url: `${opts.origin}${config.cancelPath}?checkout=cancelled`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}