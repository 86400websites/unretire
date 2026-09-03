import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limiting for public write endpoints.
 * Known issue 5, SECURITY-CHECKLIST §5, invariant I7.
 *
 * The endpoints had NO abuse control at all: anyone could POST to /api/subscribe
 * in a loop and stuff the Mailchimp audience, or burn the account's send quota.
 * §5 makes at least one enforced control a launch requirement.
 *
 * WHY THE DATABASE. Serverless functions do not share memory, so an in-process
 * counter resets on every cold start and lets a burst straight through — a
 * control that appears to exist and does nothing. The database is the only
 * state every instance already shares. Chosen by the owner over Turnstile +
 * Upstash (D-9): no new vendor, no new account, no new secret.
 *
 * IT FAILS CLOSED. §5 requires that a control which cannot be applied REFUSES
 * the request rather than waving it through. If the counter cannot be read or
 * written — table missing, database unreachable, credentials wrong — this
 * returns `limited`. That is deliberate and it has a cost: a database outage
 * stops newsletter signups. The alternative is that the same outage silently
 * removes the protection, which is exactly the failure mode Known issue 43 had.
 */

export type RateLimitResult = {
  limited: boolean;
  /** Seconds until the current window ends. Only meaningful when limited. */
  retryAfter: number;
};

/**
 * The caller's IP, as seen through the platform proxy.
 *
 * Trusted ONLY for rate limiting, never for authorisation or for building URLs
 * (that is what safe-origin.ts exists for). A forged x-forwarded-for can move a
 * caller into a different bucket, which lets them evade their own limit — but
 * it cannot grant access to anything, and the alternative of no limit at all is
 * strictly worse.
 */
function callerIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/**
 * The IP is HASHED before storage. The table only ever needs to know "is this
 * the same caller as before", which a hash answers, so there is no reason to
 * keep an identifier that is personal data and would have to be described in
 * the privacy policy and deleted on request.
 */
function bucketFor(ip: string, endpoint: string): string {
  return createHash("sha256").update(`${endpoint}:${ip}`).digest("hex");
}

/**
 * Delete windows old enough that nothing will ever look them up again.
 *
 * Without this the table grows for ever — one row per caller per window, never
 * removed — which is why migration 0003 indexes window_start. Found in a
 * self-audit before review: the migration's comment already promised a sweep
 * that did not exist.
 *
 * It swallows every failure, and that is the point. It is CALLED from inside
 * checkRateLimit's try block, but because nothing escapes this function it can
 * never reach that fail-closed handler — so a tidy-up failure cannot refuse a
 * legitimate request. This is housekeeping, not the control: by the time it
 * runs the limiter has already decided. A stale row is harmless anyway, because
 * every lookup is scoped to the current window.
 */
async function sweepExpired(
  admin: ReturnType<typeof createAdminClient>,
  cutoffMs: number,
): Promise<void> {
  try {
    const { error } = await admin
      .from("rate_limits")
      .delete()
      .lt("window_start", new Date(cutoffMs).toISOString());
    if (error) {
      console.warn(
        `rate_limits sweep skipped: ${error.code ?? "unknown"} (no effect on limiting).`,
      );
    }
  } catch {
    // Never allowed to affect the caller.
  }
}

export async function checkRateLimit(
  headers: Headers,
  endpoint: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  // Fixed window: round down to the window boundary so every instance agrees on
  // which window it is in without needing to coordinate.
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const retryAfter = Math.ceil((windowStart.getTime() + windowMs - now) / 1000);

  try {
    const admin = createAdminClient();
    const bucket = bucketFor(callerIp(headers), endpoint);

    // ATOMIC increment — pre-launch review Finding 6 (Blocking).
    //
    // This used to read the count, add one, and write it back: three round
    // trips with no lock, so N concurrent requests all read the same value, all
    // passed the check, and all wrote the same number. A hundred simultaneous
    // requests read hits=0, were ALL admitted, and stored hits=1. The original
    // comment called that "the limit, give or take the concurrency"; the excess
    // is in fact unbounded, which made the control close to useless against the
    // scripted flood it exists to stop.
    //
    // increment_rate_limit (migration 0004) does it in ONE statement, so
    // Postgres serialises callers on the row lock and each gets a distinct,
    // correct count. Execute is granted to service_role only — verified that
    // both anon and authenticated get "permission denied", so a signed-in user
    // cannot drive someone else's bucket up to lock them out.
    const { data: hits, error: rpcError } = await admin.rpc(
      "increment_rate_limit",
      {
        p_bucket: bucket,
        p_window_start: windowStart.toISOString(),
      },
    );

    if (rpcError) throw rpcError;
    if (typeof hits !== "number") {
      throw new Error("increment_rate_limit returned a non-numeric count");
    }

    // The decision uses the count the DATABASE returned for THIS caller, not a
    // value read a moment earlier and possibly shared with others.
    if (hits > limit) return { limited: true, retryAfter };

    // Housekeeping, after the decision and in its own guard — see sweepExpired().
    // (Re-added: the Finding 6 rewrite of this function dropped the call, which
    // would have quietly restored the unbounded-growth problem it was written
    // to solve. Caught by lint reporting sweepExpired as unused.)
    await sweepExpired(admin, windowStart.getTime() - windowMs * 10);

    return { limited: false, retryAfter };
  } catch (err) {
    // FAIL CLOSED (§5). Log a safe identifier only — never the caller's IP,
    // never the upstream error body.
    console.error(
      `Rate limit for "${endpoint}" could not be applied; refusing the request. Reason: ${
        err instanceof Error ? err.message.slice(0, 120) : "unknown"
      }`,
    );
    return { limited: true, retryAfter: windowSeconds };
  }
}

/** The response a limited caller gets. Deliberately says nothing useful. */
export function rateLimitedResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  );
}
