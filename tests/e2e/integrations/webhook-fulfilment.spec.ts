import type Stripe from "stripe";
import { test, expect } from "../fixtures";
import {
  grantFromSession,
  syncSubscription,
} from "../../../src/app/api/stripe/webhook/route";
import { STRIPE_APP_ID } from "@/lib/stripe/checkout";

/**
 * Sprint S4.5c — the red→green proof for pre-launch review Findings 1, 2, 3
 * and 4, and for invariant I4.
 *
 * WHY THIS IS NOT AN HTTP SPEC, which is the whole point of the file.
 * Every branch under test sits BEHIND `constructEvent`, so it is reached only
 * by an event carrying a valid Stripe signature. The test runner holds no
 * endpoint signing secret (.github/workflows/e2e-preview.yml passes the bypass
 * secret, the fixture credentials and E2E_PARITY — nothing from Stripe), so a
 * forged request can only ever be answered 400. That is exactly what
 * stripe-webhook.spec.ts asserts, and it is why those two tests would pass
 * identically against the money-losing code this sprint replaced.
 *
 * So the decision is asserted directly against its real inputs, the way
 * security/redirect-guard.spec.ts and security/origin-guard.spec.ts already do
 * for the auth guards. The admin client was already the first parameter of both
 * helpers, so a recording stub goes in without touching the production path,
 * and the stub also lets us assert the thing an HTTP status never could: that
 * a refused event performs NO WRITE AT ALL.
 *
 * Every test below is written to FAIL against the pre-231b637 code. Where that
 * is not obvious the comment says which line makes it red.
 */

type Row = Record<string, unknown>;

type StubOptions = {
  upsertError?: { code?: string } | null;
  updateRows?: { id: string }[] | null;
  updateError?: { code?: string } | null;
};

type UpdateCall = { patch: Row; column: string; value: unknown };

/**
 * A stand-in for the Supabase admin client that records what was asked of it.
 * Only the two call shapes the handler actually uses are implemented — an
 * `upsert` and an `update().eq().select()` — so an unexpected call throws
 * rather than silently returning a plausible answer.
 */
function stubAdmin(options: StubOptions = {}) {
  const upserts: Row[] = [];
  const updates: UpdateCall[] = [];

  const client = {
    from(table: string) {
      if (table !== "entitlements") {
        throw new Error(`unexpected table "${table}"`);
      }
      return {
        upsert(row: Row) {
          upserts.push(row);
          return Promise.resolve({ error: options.upsertError ?? null });
        },
        update(patch: Row) {
          return {
            eq(column: string, value: unknown) {
              return {
                select() {
                  updates.push({ patch, column, value });
                  return Promise.resolve({
                    data: options.updateRows ?? [],
                    error: options.updateError ?? null,
                  });
                },
              };
            },
          };
        },
      };
    },
  };

  return {
    upserts,
    updates,
    // The helpers only ever call the two shapes above; the cast keeps the
    // production signature honest without importing the real client.
    client: client as unknown as Parameters<typeof grantFromSession>[0],
  };
}

const USER_ID = "11111111-2222-3333-4444-555555555555";

/** A Checkout Session the handler SHOULD fulfil, before any field is overridden. */
function session(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_s45c",
    payment_status: "paid",
    customer: "cus_test_s45c",
    subscription: null,
    metadata: {
      supabase_user_id: USER_ID,
      product: "course",
      app: STRIPE_APP_ID,
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

/** A subscription in the given status, stamped as ours unless told otherwise. */
function subscription(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_test_s45c",
    status: "active",
    metadata: { app: STRIPE_APP_ID },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

/** One hour from now / one hour ago, in Stripe's epoch-seconds form. */
const IN_AN_HOUR = () => Math.floor(Date.now() / 1000) + 3600;
const AN_HOUR_AGO = () => Math.floor(Date.now() / 1000) - 3600;

/* ───────────────────────── Finding 1 — the app stamp ─────────────────────── */

test.describe("IN-002 — only events stamped as ours are fulfilled", () => {
  test("IN-002 an event with NO app stamp grants nothing", async () => {
    // THE FINDING. The first version rejected an event only when `app` was
    // present AND different, so an unstamped event fell through to the upsert
    // and the 23503 guard was the only thing standing between another project's
    // customer and a free entitlement here. Red before 231b637.
    const admin = stubAdmin();
    const outcome = await grantFromSession(
      admin.client,
      session({ metadata: { supabase_user_id: USER_ID, product: "course" } }),
      "evt_no_app",
    );

    expect(outcome).toBe("ignored");
    expect(admin.upserts, "an unstamped event must write nothing").toEqual([]);
  });

  test("IN-002 an event stamped for another application grants nothing", async () => {
    const admin = stubAdmin();
    const outcome = await grantFromSession(
      admin.client,
      session({
        metadata: {
          supabase_user_id: USER_ID,
          product: "premium",
          app: "some-other-project",
        },
      }),
      "evt_foreign_app",
    );

    expect(outcome).toBe("ignored");
    expect(admin.upserts).toEqual([]);
  });

  test("IN-002 our own event is still fulfilled", async () => {
    // The counterweight. A discriminator that refused everything would pass
    // both tests above and silently stop granting access to real customers.
    const admin = stubAdmin();
    const outcome = await grantFromSession(admin.client, session(), "evt_ours");

    expect(outcome).toBe("granted");
    expect(admin.upserts).toHaveLength(1);
    expect(admin.upserts[0]).toMatchObject({
      user_id: USER_ID,
      product: "course",
      status: "active",
    });
  });
});

/* ──────────────────── Finding 2 — settle before you grant ────────────────── */

test.describe("PY-010 — access follows settled funds, not a closed checkout", () => {
  test("PY-010 an unpaid session grants nothing", async () => {
    // THE FINDING. checkout.session.completed fires when CHECKOUT completes,
    // which for a delayed-notification method is BEFORE the money arrives. The
    // pre-fix handler granted anyway. Red before 231b637.
    const admin = stubAdmin();
    const outcome = await grantFromSession(
      admin.client,
      session({ payment_status: "unpaid" }),
      "evt_unpaid",
    );

    expect(outcome).toBe("ignored");
    expect(admin.upserts, "unsettled funds must grant nothing").toEqual([]);
  });

  test("PY-010 a zero-cost session is still fulfilled", async () => {
    // A 100%-off coupon produces no_payment_required, and that customer really
    // is entitled. Guarding on "paid" alone would have locked them out.
    const admin = stubAdmin();
    const outcome = await grantFromSession(
      admin.client,
      session({ payment_status: "no_payment_required" }),
      "evt_free",
    );

    expect(outcome).toBe("granted");
    expect(admin.upserts).toHaveLength(1);
  });
});

/* ──────────────── Known issue 22 / invariant I4 — no silent loss ─────────── */

test.describe("PY-008 — a failed write is never answered as success", () => {
  test("PY-008 a write failure asks Stripe to retry", async () => {
    // I4. supabase-js returns {error} rather than throwing, so this result was
    // once discarded and the handler answered 200: Stripe never retried and the
    // customer paid for nothing.
    const admin = stubAdmin({ upsertError: { code: "40001" } });
    const outcome = await grantFromSession(
      admin.client,
      session(),
      "evt_write_failed",
    );

    expect(outcome, "a failed entitlement write must be retried").toBe("retry");
  });

  test("PY-008 a user who does not exist here is acknowledged, not retried for ever", async () => {
    // 23503 is a foreign-key violation: the user id is not in OUR auth.users,
    // so no amount of retrying can make it ours.
    const admin = stubAdmin({ upsertError: { code: "23503" } });
    const outcome = await grantFromSession(
      admin.client,
      session(),
      "evt_foreign_user",
    );

    expect(outcome).toBe("ignored");
  });

  test("PY-008 metadata we cannot act on is ignored without a write", async () => {
    const admin = stubAdmin();
    for (const metadata of [
      { product: "course", app: STRIPE_APP_ID },
      { supabase_user_id: USER_ID, app: STRIPE_APP_ID },
      { supabase_user_id: USER_ID, product: "tote-bag", app: STRIPE_APP_ID },
    ]) {
      expect(
        await grantFromSession(admin.client, session({ metadata }), "evt_junk"),
      ).toBe("ignored");
    }
    expect(admin.upserts).toEqual([]);
  });
});

/* ───────────────── Finding 3 — past_due grace has a deadline ─────────────── */

test.describe("PY-010 — a failed renewal eventually ends access", () => {
  test("PY-010 past_due keeps access while the paid period is still running", async () => {
    // Cutting a customer off over a bank decline they have not yet had a chance
    // to fix would be worse than a few days' grace.
    const admin = stubAdmin();
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "past_due", current_period_end: IN_AN_HOUR() }),
      "evt_past_due_in_period",
      "customer.subscription.updated",
    );

    expect(outcome).toBe("ignored");
    expect(admin.updates, "access should be retained, not rewritten").toEqual(
      [],
    );
  });

  test("PY-010 past_due revokes once the paid period has elapsed unpaid", async () => {
    // THE FINDING. The pre-fix handler left past_due ACTIVE indefinitely on the
    // assumption that Stripe would move it on. Stripe's terminal dunning action
    // can be configured to leave it past_due for ever, so that assumption gave
    // Premium away. Red before 231b637.
    const admin = stubAdmin({ updateRows: [{ id: "ent_1" }] });
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "past_due", current_period_end: AN_HOUR_AGO() }),
      "evt_past_due_elapsed",
      "customer.subscription.updated",
    );

    expect(outcome).toBe("granted");
    expect(admin.updates).toHaveLength(1);
    expect(admin.updates[0].patch).toEqual({ status: "canceled" });
  });

  test("PY-010 every terminal status revokes, and a recovered one restores", async () => {
    for (const status of [
      "unpaid",
      "canceled",
      "incomplete_expired",
      "paused",
    ]) {
      const admin = stubAdmin({ updateRows: [{ id: "ent_1" }] });
      await syncSubscription(
        admin.client,
        subscription({ status }),
        `evt_${status}`,
        "customer.subscription.updated",
      );
      expect(admin.updates[0].patch, `${status} should revoke`).toEqual({
        status: "canceled",
      });
    }

    for (const status of ["active", "trialing"]) {
      const admin = stubAdmin({ updateRows: [{ id: "ent_1" }] });
      await syncSubscription(
        admin.client,
        subscription({ status }),
        `evt_${status}`,
        "customer.subscription.updated",
      );
      expect(admin.updates[0].patch, `${status} should restore`).toEqual({
        status: "active",
      });
    }
  });

  test("PY-010 a deletion revokes whatever the status says", async () => {
    const admin = stubAdmin({ updateRows: [{ id: "ent_1" }] });
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "active" }),
      "evt_deleted",
      "customer.subscription.deleted",
    );

    expect(outcome).toBe("granted");
    expect(admin.updates[0].patch).toEqual({ status: "canceled" });
    expect(admin.updates[0].column).toBe("stripe_subscription_id");
  });
});

/* ────────────── Finding 4 — lifecycle events arrive out of order ─────────── */

test.describe("PY-010 — an out-of-order revoke is not lost", () => {
  test("PY-010 a revoke for OUR subscription with no row yet is redelivered", async () => {
    // THE FINDING. Stripe does not guarantee order. A cancellation arriving
    // before the grant updated zero rows, was answered 200, and was lost for
    // ever — after which the retried grant restored a cancelled subscription.
    // Red before 231b637: the pre-fix code treated zero rows as success.
    const admin = stubAdmin({ updateRows: [] });
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "canceled" }),
      "evt_revoke_early",
      "customer.subscription.deleted",
    );

    expect(outcome, "a revoke of ours must not be dropped").toBe("retry");
  });

  test("PY-010 a foreign subscription with no row is ignored, never looped", async () => {
    // The counterweight to the test above. Retrying everything that matches
    // nothing would put another project's events into a permanent retry loop.
    const admin = stubAdmin({ updateRows: [] });
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "canceled", metadata: { app: "someone-else" } }),
      "evt_foreign_sub",
      "customer.subscription.deleted",
    );

    expect(outcome).toBe("ignored");
  });

  test("PY-010 a sync write failure is retried, not swallowed", async () => {
    const admin = stubAdmin({ updateError: { code: "40001" } });
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "canceled" }),
      "evt_sync_failed",
      "customer.subscription.updated",
    );

    expect(outcome).toBe("retry");
  });

  test("PY-010 a status we have no opinion on changes nothing", async () => {
    const admin = stubAdmin();
    const outcome = await syncSubscription(
      admin.client,
      subscription({ status: "incomplete" }),
      "evt_incomplete",
      "customer.subscription.updated",
    );

    expect(outcome).toBe("ignored");
    expect(admin.updates).toEqual([]);
  });
});
