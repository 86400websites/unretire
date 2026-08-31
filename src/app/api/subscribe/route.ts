import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Mailchimp config, read lazily inside the request instead of at import
 * time, so builds/environments without these env vars don't crash on load.
 */
function mailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) throw new Error("Mailchimp env vars are not set");
  const dc = apiKey.split("-")[1]; // e.g. "us22"
  return {
    listId,
    base: `https://${dc}.api.mailchimp.com/3.0`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
}

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
const ALLOWED_MERGE_FIELDS = new Set([
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

export async function POST(req: NextRequest) {
  try {
    // Known issue 5, SECURITY-CHECKLIST §5. This endpoint is fully public and
    // writes to a LIVE Mailchimp audience shared by every environment (D-22),
    // so an unthrottled loop could stuff the list or burn the send quota. Ten
    // submissions a minute is far above what a person does and far below what a
    // script does. Fails CLOSED — see src/lib/rate-limit.ts.
    const { limited, retryAfter } = await checkRateLimit(
      req.headers,
      "subscribe",
      { limit: 10, windowSeconds: 60 },
    );
    if (limited) return rateLimitedResponse(retryAfter);

    const { email, firstName, tag, mergeFields } = await req.json();

    // §5 also calls for server-side validation: the browser's `type="email"`
    // check is a convenience for honest users, not a control — nothing stops a
    // script POSTing here directly.
    if (!email || typeof email !== "string" || !EMAIL.test(email.trim())) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 },
      );
    }
    if (email.length > MAX_EMAIL) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }
    if (firstName !== undefined && typeof firstName !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (typeof firstName === "string" && firstName.length > MAX_NAME) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    if (tag !== undefined && (typeof tag !== "string" || !TAG.test(tag))) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { listId, base, headers } = mailchimpConfig();

    // Build the merge fields. FNAME stays for backward compatibility; the
    // assessment passes WEAKEST / WEAKLOW / SCORE via mergeFields.
    const merge_fields: Record<string, string | number> = {};
    if (firstName) merge_fields.FNAME = firstName;

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
        } else if (
          typeof value === "string" &&
          value.length <= MAX_MERGE_VALUE
        ) {
          merge_fields[key] = value;
        }
        // Anything else — nested objects, arrays, oversized strings — is dropped.
      }
    }

    // Mailchimp identifies a contact by the MD5 of the lowercased email.
    const subscriberHash = crypto
      .createHash("md5")
      .update(email.toLowerCase().trim())
      .digest("hex");

    // Upsert: creates the contact if new (subscribed), or updates their merge
    // fields if they already exist. status_if_new avoids resurrecting anyone
    // who previously unsubscribed (compliance-safe).
    const upsertRes = await fetch(
      `${base}/lists/${listId}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          email_address: email,
          status_if_new: "subscribed",
          merge_fields,
        }),
      },
    );

    const upsertData = await upsertRes.json();

    if (!upsertRes.ok) {
      console.error("Mailchimp upsert error:", upsertData);
      return NextResponse.json(
        { error: upsertData.detail || "Subscription failed" },
        { status: 500 },
      );
    }

    // Add the tag (this is what triggers the right Customer Journey).
    // Works for both new and existing contacts and is idempotent.
    if (tag) {
      const tagRes = await fetch(
        `${base}/lists/${listId}/members/${subscriberHash}/tags`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ tags: [{ name: tag, status: "active" }] }),
        },
      );
      // Tags endpoint returns 204 on success. If it fails, the contact is
      // still saved — log it but don't fail the whole request.
      if (!tagRes.ok) {
        const tagData = await tagRes.json().catch(() => ({}));
        console.error("Mailchimp tag error:", tagData);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
