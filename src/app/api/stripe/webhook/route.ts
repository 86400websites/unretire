import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { STRIPE_APP_ID } from "@/lib/stripe/checkout";

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

        // Known issue 41. If the event names an application and it is not
        // ours, it belongs to another project on this shared account. Ignore
        // it. Events with NO `app` key still fall through to the checks below,
        // so sessions created before this stamp existed are not stranded.
        const app = session.metadata?.app;
        if (app && app !== STRIPE_APP_ID) {
          console.warn(
            `Ignoring ${event.type} ${event.id}: belongs to application "${app}", not ${STRIPE_APP_ID}.`,
          );
          break;
        }

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
          // 23503 = foreign_key_violation: the user id is not in OUR auth.users,
          // so this is another project's event wearing a familiar-looking
          // metadata shape. Retrying can never make it ours, and the S3.1 fix
          // that answers 500 on a write failure would otherwise have Stripe
          // redeliver a foreign event for days. Acknowledge and move on.
          if (upsertError.code === "23503") {
            console.warn(
              `Ignoring ${event.type} ${event.id}: supabase_user_id is not a user of this project (foreign key violation).`,
            );
            break;
          }
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

      /**
       * Known issue 39 — the renewal hole.
       *
       * Access was granted on checkout and revoked ONLY on
       * customer.subscription.deleted. A Premium subscription whose renewal
       * payment failed therefore kept working: Stripe moved it to past_due and
       * then unpaid, neither of which this handler listened for, so the member
       * kept full access indefinitely without paying. Premium was being given
       * away.
       *
       * customer.subscription.updated is the authoritative status feed, so it
       * is what we follow.
       *
       * A NOTE ON past_due, which is deliberate and not an oversight. The
       * production CHECK constraint admits exactly three values — 'active',
       * 'canceled', 'expired' (supabase/migrations/0001_entitlements.sql) — so
       * there is no state for "paying, but this month's charge bounced". We
       * therefore leave past_due members ACTIVE: Stripe is still retrying the
       * card, and cutting off a paying customer over a bank decline they have
       * not yet had a chance to fix would be worse than a few days' grace. When
       * dunning finally fails Stripe moves the subscription to unpaid or
       * canceled, and the line below revokes. Representing past_due properly
       * would mean altering a Production constraint — an owner decision, not a
       * side effect of this sprint.
       */
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const REVOKE = ["unpaid", "canceled", "incomplete_expired", "paused"];
        const RESTORE = ["active", "trialing"];

        // past_due and incomplete are the grace states — leave them untouched.
        if (!REVOKE.includes(sub.status) && !RESTORE.includes(sub.status))
          break;

        const nextStatus = REVOKE.includes(sub.status) ? "canceled" : "active";
        const { error: syncError } = await admin
          .from("entitlements")
          .update({ status: nextStatus })
          .eq("stripe_subscription_id", sub.id);

        if (syncError) {
          console.error(
            `Entitlement sync FAILED for ${event.id} (stripe status ${sub.status} → ${nextStatus}): ${syncError.code ?? "unknown"} — returning 500 so Stripe retries.`,
          );
          return NextResponse.json(
            { error: "Entitlement sync failed" },
            { status: 500 },
          );
        }
        break;
      }

      /**
       * A renewal that bounced. No state change — see the past_due note above;
       * Stripe is still retrying and customer.subscription.updated is what
       * decides the outcome. Logged so there is a breadcrumb, because this
       * project ships without error tracking (D-28).
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `Invoice payment failed (${event.id}, invoice ${invoice.id}). Access unchanged; awaiting customer.subscription.updated.`,
        );
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
