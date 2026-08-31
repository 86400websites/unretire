/**
 * Validation for the public newsletter/e-mail-capture endpoint.
 *
 * WHY THIS IS A MODULE OF ITS OWN, and not inline in the route (pre-launch
 * review Finding 10). The route's only observable output is an HTTP status, and
 * the interesting half of Finding 7 is not the status — it is WHAT SURVIVES
 * into the request that goes to Mailchimp. A test cannot see that over HTTP,
 * and it must not find out by sending a request that would write to the shared
 * LIVE audience (D-22) on every pull request. So the decision is extracted here
 * and asserted directly, exactly as `safe-redirect.ts` and `safe-origin.ts` are.
 *
 * The rules themselves are unchanged from the Finding 7 fix; this file only
 * moves them somewhere a test can reach.
 */

/** RFC-shaped enough to reject junk without rejecting real addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254; // RFC 5321
const MAX_NAME = 100;

/**
 * Pre-launch review Finding 7 (Blocking).
 *
 * `mergeFields` used to be forwarded wholesale: `Object.assign(merge_fields,
 * mergeFields)` copied ANY key from an anonymous request straight into the
 * shared LIVE Mailchimp audience. A caller could supply a valid victim address
 * plus arbitrary fields and mutate that contact, trigger an unintended journey,
 * or simply consume the account's quota. Type-checking that it was an object
 * was not validation.
 *
 * These are the only keys the site itself sends — FNAME from the capture forms,
 * and the assessment's results (src/app/assess/WheelOfLife.tsx). Anything else
 * is dropped rather than forwarded.
 */
export const ALLOWED_MERGE_FIELDS = new Set([
  "FNAME",
  "WEAKEST",
  "WEAKLOW",
  "BRIGHTEST",
  "SCORE",
  "S_PASSION",
  "S_HEALTH",
  "S_RELAT",
  "S_GROWTH",
  "S_SPIRIT",
  "S_FUN",
  "S_MONEY",
  "S_CONTRIB",
]);
const MAX_MERGE_VALUE = 100;

/**
 * Tags are shape-validated rather than enumerated. An exhaustive list would be
 * one forgotten download-gate tag away from silently breaking a real form,
 * whereas a shape check still rules out oversized or structured input, which is
 * what the abuse case needs.
 */
const TAG = /^[A-Za-z0-9_-]{1,40}$/;

export type SubscribeRejection = { ok: false; error: string };
export type SubscribeAccepted = {
  ok: true;
  email: string;
  tag?: string;
  merge_fields: Record<string, string | number>;
};
export type SubscribeValidation = SubscribeAccepted | SubscribeRejection;

/**
 * Validate an anonymous subscribe request and return only what may leave this
 * server. A rejection carries a message chosen HERE — never one derived from
 * the caller's input or from an upstream response (Known issue 44).
 */
export function validateSubscribePayload(body: unknown): SubscribeValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request" };
  }

  const { email, firstName, tag, mergeFields } = body as {
    email?: unknown;
    firstName?: unknown;
    tag?: unknown;
    mergeFields?: unknown;
  };

  // SECURITY-CHECKLIST §5 calls for server-side validation: the browser's
  // `type="email"` check is a convenience for honest users, not a control —
  // nothing stops a script POSTing here directly.
  if (!email || typeof email !== "string" || !EMAIL.test(email.trim())) {
    return { ok: false, error: "A valid email address is required" };
  }
  if (email.length > MAX_EMAIL) {
    return { ok: false, error: "Email is too long" };
  }
  if (firstName !== undefined && typeof firstName !== "string") {
    return { ok: false, error: "Invalid request" };
  }
  if (typeof firstName === "string" && firstName.length > MAX_NAME) {
    return { ok: false, error: "Name is too long" };
  }
  if (tag !== undefined && (typeof tag !== "string" || !TAG.test(tag))) {
    return { ok: false, error: "Invalid request" };
  }

  // Build the merge fields. FNAME stays for backward compatibility; the
  // assessment passes WEAKEST / WEAKLOW / SCORE via mergeFields.
  const merge_fields: Record<string, string | number> = {};
  if (typeof firstName === "string" && firstName) {
    merge_fields.FNAME = firstName;
  }

  // Allow-list, not passthrough — see ALLOWED_MERGE_FIELDS above.
  if (
    mergeFields &&
    typeof mergeFields === "object" &&
    !Array.isArray(mergeFields)
  ) {
    for (const [key, value] of Object.entries(
      mergeFields as Record<string, unknown>,
    )) {
      if (!ALLOWED_MERGE_FIELDS.has(key)) continue;
      if (typeof value === "number" && Number.isFinite(value)) {
        merge_fields[key] = value;
      } else if (typeof value === "string" && value.length <= MAX_MERGE_VALUE) {
        merge_fields[key] = value;
      }
      // Anything else — nested objects, arrays, oversized strings — is dropped.
    }
  }

  return {
    ok: true,
    email: email.trim(),
    tag: typeof tag === "string" ? tag : undefined,
    merge_fields,
  };
}
