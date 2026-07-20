import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Stripe webhook. Stripe (not the browser) calls this after a payment.
 * 1) Verify the signature so we KNOW it's really Stripe.
 * 2) Read the supabase_user_id we stamped on the Checkout Session.
 * 3) Grant/adjust the entitlement using the admin client (bypasses RLS).
 */
export async function POST(request: NextRequest) {
  const body = await request.text(); // raw body required for signature check
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      // Fires for both one-time (course) and subscription (premium) checkouts.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const product = session.metadata?.product;

        if (userId && (product === "course" || product === "premium")) {
          await admin.from("entitlements").upsert(
            {
              user_id: userId,
              product,
              status: "active",
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
              stripe_subscription_id:
                typeof session.subscription === "string"
                  ? session.subscription
                  : null,
            },
            { onConflict: "user_id,product" },
          );
        }
        break;
      }

      // Premium subscription ended or was cancelled → revoke access.
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await admin
          .from("entitlements")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  // Always 200 once verified, so Stripe stops retrying.
  return NextResponse.json({ received: true });
}
