import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { validateSubscribePayload } from "@/lib/forms/subscribe-payload";

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

/**
 * The single message an anonymous caller ever gets when the upstream fails.
 *
 * Known issue 44 / FEATURE-LIST FM-009, scoped to S4.5 and closed here.
 * The route used to `console.error("Mailchimp upsert error:", upsertData)` —
 * the whole parsed response — and then return `upsertData.detail` to the
 * browser as the `error` field. Mailchimp `detail` strings carry operational
 * and contact-level specifics: existing-subscriber state, compliance and abuse
 * status, list identifiers, quota conditions. That is upstream text this
 * application has not vetted, echoed to an anonymous caller and written
 * verbatim into logs. CLAUDE.md's security rules are explicit: error responses
 * must not expose internals or upstream bodies.
 */
const UPSTREAM_FAILED = "We could not sign you up just now. Please try again.";

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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Validation, the tag shape check and the merge-field allow-list all live in
    // src/lib/forms/subscribe-payload.ts so they can be asserted directly —
    // an HTTP test cannot see which fields survived, and must not find out by
    // writing to the live audience. Pre-launch review Findings 7 and 10.
    const parsed = validateSubscribePayload(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email, tag, merge_fields } = parsed;

    const { listId, base, headers } = mailchimpConfig();

    // Mailchimp identifies a contact by the MD5 of the lowercased email.
    const subscriberHash = crypto
      .createHash("md5")
      .update(email.toLowerCase())
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

    if (!upsertRes.ok) {
      // A safe identifier only — the status code and nothing from the body.
      console.error(`Mailchimp upsert failed with HTTP ${upsertRes.status}.`);
      // Status unchanged from before this fix — only the body and the log are.
      return NextResponse.json({ error: UPSTREAM_FAILED }, { status: 500 });
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
      // still saved — log the status only and don't fail the whole request.
      if (!tagRes.ok) {
        console.error(
          `Mailchimp tag request failed with HTTP ${tagRes.status}.`,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Never the upstream body, and never the error's own message: a thrown
    // fetch error can carry the request URL, which contains the audience id.
    console.error(
      `Subscribe error: ${err instanceof Error ? err.name : "unknown"}`,
    );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
