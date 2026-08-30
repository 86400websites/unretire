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

        if (!userId || !(product === "course" || product === "premium")) {
          // Not one of ours. The live Stripe account is shared with other
          // projects (Known issue 41), so their events reach this endpoint too
          // and carry no supabase_user_id. Retrying can never make such an
          // event ours, so acknowledge it — a non-2xx here would make Stripe
          // redeliver a foreign event against this endpoint for days.
          console.warn(
            `Ignoring ${event.type} ${event.id}: no recognised supabase_user_id/product metadata.`,
          );
          break;
        }

        const { error: upsertError } = await admin.from("entitlements").upsert(
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

        // Known issue 22 / SECURITY-CHECKLIST §9 invariant I4. supabase-js v2
        // returns {data, error} and does NOT throw on an API error, so this
        // result was previously discarded and the handler still answered 200 —
        // Stripe saw success, never retried, and the customer paid for nothing.
        // Answering non-2xx puts the event back on Stripe's retry schedule and
        // surfaces it in the Stripe dashboard's failed-delivery list.
        if (upsertError) {
          console.error(
            `Entitlement upsert FAILED for ${event.id} (${product}): ${upsertError.code ?? "unknown"} — returning 500 so Stripe retries.`,
          );
          return NextResponse.json(
            { error: "Entitlement write failed" },
            { status: 500 },
          );
        }
        break;
      }

      // Premium subscription ended or was cancelled → revoke access.
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { error: revokeError } = await admin
          .from("entitlements")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);

        // Same rule in the other direction (Known issue 22): a failed revoke
        // that answered 200 would leave a cancelled member with live access and
        // no further attempt to take it away. Matching zero rows is NOT an
        // error — a subscription belonging to another project on this shared
        // account simply matches nothing here.
        if (revokeError) {
          console.error(
            `Entitlement revoke FAILED for ${event.id}: ${revokeError.code ?? "unknown"} — returning 500 so Stripe retries.`,
          );
          return NextResponse.json(
            { error: "Entitlement revoke failed" },
            { status: 500 },
          );
        }
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

  // 200 once the event has been verified AND fully handled. Every path that
  // failed to write returns non-2xx above, so a 200 from here means the
  // entitlement really changed (Known issue 22).
  return NextResponse.json({ received: true });
}
