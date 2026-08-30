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

    // Read-modify-write. Two simultaneous requests can read the same count and
    // both be allowed, so the effective limit is "limit, give or take the
    // concurrency". That is an accepted trade: this exists to stop scripted
    // floods, not to meter billing to the exact request.
    const { data, error: readError } = await admin
      .from("rate_limits")
      .select("hits")
      .eq("bucket", bucket)
      .eq("window_start", windowStart.toISOString())
      .maybeSingle();

    if (readError) throw readError;

    const hits = (data?.hits ?? 0) + 1;
    if (hits > limit) return { limited: true, retryAfter };

    const { error: writeError } = await admin
      .from("rate_limits")
      .upsert(
        { bucket, window_start: windowStart.toISOString(), hits },
        { onConflict: "bucket,window_start" },
      );

    if (writeError) throw writeError;

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
