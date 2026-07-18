import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

// Map the product the user picked → the Stripe price + checkout mode.
// Prices come from env so we can swap test → live without code changes.
const PRODUCTS = {
  course: { price: process.env.STRIPE_PRICE_COURSE, mode: "payment" as const },
  premium: { price: process.env.STRIPE_PRICE_PREMIUM, mode: "subscription" as const },
};

export async function POST(request: NextRequest) {
  // 1) Must be logged in. We tie the purchase to the Supabase user.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Validate the product — never trust the client beyond this choice.
  let body: { product?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = body.product;
  if (product !== "course" && product !== "premium") {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const config = PRODUCTS[product];
  if (!config.price) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  // 3) Build absolute return URLs from the current origin.
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  // 4) Create the Checkout Session, stamped with the user id so the
  //    webhook can match the completed payment back to this user.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: config.price, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, product },
      // Show the "Add promotion code" field on Stripe Checkout. Works for
      // both one-off (course) and subscription (premium) modes. The codes
      // themselves are created in the Stripe dashboard, per environment.
      allow_promotion_codes: true,
      success_url: `${origin}/unretire/account?checkout=success`,
      cancel_url: `${origin}/unretire/premium?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }
}
