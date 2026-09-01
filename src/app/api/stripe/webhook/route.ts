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
type GrantOutcome = "granted" | "ignored" | "retry";

/**
 * Fulfil a paid Checkout Session, or explain why not.
 *
 * Shared by checkout.session.completed and
 * checkout.session.async_payment_succeeded so the two cannot drift — the async
 * path exists precisely because the first one may fire before funds settle
 * (pre-launch review Finding 2).
 *
 * EXPORTED FOR TESTING, and for the same reason `safeNext` and `isAllowedHost`
 * are (pre-launch review Finding 10). Every branch below is reached only after
 * a valid Stripe signature, and the harness holds no endpoint signing secret —
 * so an HTTP-level spec stops at the 400 and cannot tell a fixed handler from a
 * broken one. The decision is therefore asserted directly against its real
 * inputs by tests/e2e/integrations/webhook-fulfilment.spec.ts, which passes a
 * recording stub in place of the admin client. `admin` was already the first
 * parameter; nothing about the production path changes.
 */
export async function grantFromSession(
  admin: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<GrantOutcome> {
  const userId = session.metadata?.supabase_user_id;
  const product = session.metadata?.product;
  const app = session.metadata?.app;

  // Finding 1 (Blocking). The first version rejected an event only when `app`
  // was present AND different, so an event with NO app still reached the
  // upsert, and the 23503 guard below only catches user ids absent from this
  // project — a foreign event carrying a product and a valid local uuid would
  // have granted access. The stamp is now REQUIRED. Safe because the site has
  // not launched, so no in-flight session predates it; any future compatibility
  // window must be explicit and time-bounded, never "missing means ours".
  if (app !== STRIPE_APP_ID) {
    console.warn(
      `Ignoring session ${session.id} (${eventId}): application "${app ?? "none"}" is not ${STRIPE_APP_ID}.`,
    );
    return "ignored";
  }

  if (!userId || !(product === "course" || product === "premium")) {
    console.warn(
      `Ignoring session ${session.id} (${eventId}): no recognised supabase_user_id/product metadata.`,
    );
    return "ignored";
  }

  // Finding 2 (Blocking). checkout.session.completed fires when CHECKOUT
  // completes, which for a delayed-notification method is BEFORE the funds
  // settle. Only a settled session — or a genuinely zero-cost one, which a
  // 100%-off coupon produces — is fulfilled here.
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    console.warn(
      `Deferring session ${session.id} (${eventId}): payment_status is "${session.payment_status}" — awaiting async settlement.`,
    );
    return "ignored";
  }

  const { error } = await admin.from("entitlements").upsert(
    {
      user_id: userId,
      product,
      status: "active",
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id:
        typeof session.subscription === "string" ? session.subscription : null,
    },
    { onConflict: "user_id,product" },
  );

  // Known issue 22 / invariant I4. supabase-js v2 returns {data, error} and
  // does NOT throw, so this result was once discarded and the handler still
  // answered 200 — Stripe saw success, never retried, and the customer paid for
  // nothing. A non-2xx puts the event back on Stripe's retry schedule.
  if (error) {
    // 23503 = foreign_key_violation: the user id is not in OUR auth.users, so
    // retrying can never make it ours. Acknowledge rather than loop for days.
    if (error.code === "23503") {
      console.warn(
        `Ignoring session ${session.id} (${eventId}): supabase_user_id is not a user of this project.`,
      );
      return "ignored";
    }
    console.error(
      `Entitlement upsert FAILED for ${eventId} (${product}): ${error.code ?? "unknown"} — returning 500 so Stripe retries.`,
    );
    return "retry";
  }
  return "granted";
}

/**
 * Apply a subscription's current Stripe status to the entitlement.
 *
 * Shared by customer.subscription.updated and .deleted so the two cannot drift.
 *
 * FINDING 3 — past_due is now BOUNDED. The previous version left past_due
 * members active on the assumption that Stripe would move the subscription to
 * unpaid or canceled once dunning finished. That assumption is not guaranteed:
 * Stripe's terminal dunning action can be configured to LEAVE the subscription
 * past_due, in which case access continued for ever without payment. The bound
 * used here is the customer's own paid period — while it still runs they keep
 * what they paid for, and once it has elapsed unpaid, access ends. It needs no
 * new column and no assumption about the owner's Dashboard settings.
 *
 * FINDING 4 — lifecycle events are order-independent. Stripe does not guarantee
 * ordering, so a cancellation could arrive BEFORE the grant, update zero rows,
 * be answered 200, and be lost for ever — after which the retried grant
 * restored a cancelled subscription. Now a zero-row update on a subscription
 * that is demonstrably OURS (it carries our metadata, stamped at checkout) is
 * treated as "the grant has not landed yet" and returns retry, so Stripe
 * redelivers until it can be applied. A subscription that is not ours still
 * matches nothing and is ignored, so no foreign event can loop.
 *
 * Exported for the same reason as grantFromSession above.
 */
export async function syncSubscription(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
  eventId: string,
  eventType: string,
): Promise<GrantOutcome> {
  const isOurs = sub.metadata?.app === STRIPE_APP_ID;

  const REVOKE = ["unpaid", "canceled", "incomplete_expired", "paused"];
  const RESTORE = ["active", "trialing"];

  let nextStatus: "active" | "canceled" | null = null;
  if (eventType === "customer.subscription.deleted") {
    nextStatus = "canceled";
  } else if (REVOKE.includes(sub.status)) {
    nextStatus = "canceled";
  } else if (RESTORE.includes(sub.status)) {
    nextStatus = "active";
  } else if (sub.status === "past_due") {
    // Bounded grace: keep access while the paid period runs, revoke once it has
    // elapsed unpaid. current_period_end is seconds since the epoch.
    const periodEnd = (sub as unknown as { current_period_end?: number })
      .current_period_end;
    if (typeof periodEnd === "number" && periodEnd * 1000 < Date.now()) {
      nextStatus = "canceled";
    } else {
      console.warn(
        `Subscription ${sub.id} (${eventId}) is past_due but its paid period has not elapsed — access retained.`,
      );
      return "ignored";
    }
  } else {
    // incomplete and any future status: no opinion.
    return "ignored";
  }

  const { data, error } = await admin
    .from("entitlements")
    .update({ status: nextStatus })
    .eq("stripe_subscription_id", sub.id)
    .select("id");

  if (error) {
    console.error(
      `Entitlement sync FAILED for ${eventId} (→ ${nextStatus}): ${error.code ?? "unknown"} — returning 500 so Stripe retries.`,
    );
    return "retry";
  }

  if (!data || data.length === 0) {
    if (isOurs) {
      // Finding 4: ours, but the row is not there yet — almost certainly the
      // grant is still in flight. Ask Stripe to redeliver rather than dropping
      // a revoke that would otherwise never be applied.
      console.warn(
        `No entitlement row yet for our subscription ${sub.id} (${eventId}) — returning 500 so Stripe redelivers.`,
      );
      return "retry";
    }
    console.warn(
      `Ignoring ${eventType} ${eventId}: subscription ${sub.id} matches no entitlement and carries no ${STRIPE_APP_ID} metadata.`,
    );
    return "ignored";
  }
  return "granted";
}

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
        const outcome = await grantFromSession(admin, session, event.id);
        if (outcome === "retry") {
          return NextResponse.json(
            { error: "Entitlement write failed" },
            { status: 500 },
          );
        }
        break;
      }

      /**
       * Pre-launch review Finding 2. A delayed-notification payment settles
       * after checkout closed, so THIS is the event that fulfils it. Same
       * checks as the completed branch; the shared helper keeps the two from
       * drifting apart.
       */
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const outcome = await grantFromSession(admin, session, event.id);
        if (outcome === "retry") {
          return NextResponse.json(
            { error: "Entitlement write failed" },
            { status: 500 },
          );
        }
        break;
      }

      /**
       * The delayed payment failed. Nothing was granted at checkout (see the
       * payment_status guard), so there is nothing to revoke — but it is logged
       * because a customer believes they bought something and did not.
       */
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn(
          `Async payment FAILED for ${event.id} (session ${session.id}). No entitlement was granted.`,
        );
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
       * A NOTE ON past_due. The production CHECK constraint admits exactly
       * three values — 'active', 'canceled', 'expired'
       * (supabase/migrations/0001_entitlements.sql) — so there is no state for
       * "paying, but this month's charge bounced". The first version of this
       * handler therefore left past_due members ACTIVE and waited for Stripe to
       * move them to unpaid or canceled.
       *
       * That was wrong, and pre-launch review Finding 3 said so: Stripe's
       * terminal dunning action can be configured to LEAVE a subscription
       * past_due for ever, in which case the wait never ends and access is free
       * from then on. syncSubscription() above now bounds the grace by the
       * customer's own paid period — see its FINDING 3 note. Access is retained
       * while the period they paid for is still running and revoked once it has
       * elapsed unpaid, which needs no new column and no assumption about the
       * owner's Dashboard settings.
       */
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const outcome = await syncSubscription(
          admin,
          sub,
          event.id,
          event.type,
        );
        if (outcome === "retry") {
          return NextResponse.json(
            { error: "Entitlement sync failed" },
            { status: 500 },
          );
        }
        break;
      }

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
        const outcome = await syncSubscription(
          admin,
          sub,
          event.id,
          event.type,
        );
        if (outcome === "retry") {
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
