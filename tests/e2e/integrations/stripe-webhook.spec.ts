import { test, expect } from "../fixtures";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers the refusal half of docs/FEATURE-LIST.md line IN-001.
 *
 * The ACCEPT half — a genuinely signed test-mode event is processed and writes
 * an entitlement — is already proved by tests/e2e/parity/checkout-course.spec.ts
 * and checkout-premium.spec.ts (proofs P4/P5), which run only under E2E_PARITY=1.
 * This file proves the half that needs no Stripe account and writes nothing:
 * a forged event must be refused before it can touch the database.
 *
 * IN-002 (no application discriminator on inbound events, Known issue 41) is a
 * 🔴 line and belongs to the S4.4 fix sprint.
 */

/**
 * A well-formed Stripe event body that would grant a course entitlement if it
 * were ever trusted. The point is that it must NOT be: the signature is absent
 * or wrong, so `constructEvent` must throw before the switch is reached.
 */
const FORGED_EVENT = JSON.stringify({
  id: "evt_s51a_probe",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_s51a_probe",
      metadata: {
        supabase_user_id: "00000000-0000-0000-0000-000000000000",
        product: "course",
      },
    },
  },
});

test("IN-001 — an unsigned webhook event is refused", async ({ api }) => {
  const response = await api.post("/api/stripe/webhook", {
    headers: { "Content-Type": "application/json" },
    data: FORGED_EVENT,
    failOnStatusCode: false,
  });

  expect(
    response.status(),
    "an event with no Stripe signature must be refused",
  ).toBe(400);
});

test("IN-001 — a wrongly-signed webhook event is refused", async ({ api }) => {
  const response = await api.post("/api/stripe/webhook", {
    headers: {
      "Content-Type": "application/json",
      // Shaped like a real Stripe signature header, but not a valid signature
      // for this body under this endpoint's secret.
      "stripe-signature": "t=1756512000,v1=" + "0".repeat(64),
    },
    data: FORGED_EVENT,
    failOnStatusCode: false,
  });

  expect(
    response.status(),
    "an event with an invalid signature must be refused",
  ).toBe(400);

  // The error must not hand an attacker the upstream library's words. CLAUDE.md:
  // "Error responses must not expose internals or upstream bodies."
  const body = await response.text();
  expect(
    body,
    "the refusal must not leak internals (stack, secret name, upstream detail)",
  ).not.toMatch(/whsec_|sk_live|sk_test|at Object\.|node_modules|\/var\/task/);
});
