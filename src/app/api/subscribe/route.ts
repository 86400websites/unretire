import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, tag, mergeFields } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { listId, base, headers } = mailchimpConfig();

    // Build the merge fields. FNAME stays for backward compatibility; the
    // assessment passes WEAKEST / WEAKLOW / SCORE via mergeFields.
    const merge_fields: Record<string, unknown> = {};
    if (firstName) merge_fields.FNAME = firstName;
    if (mergeFields && typeof mergeFields === "object") {
      Object.assign(merge_fields, mergeFields);
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
      }
    );

    const upsertData = await upsertRes.json();

    if (!upsertRes.ok) {
      console.error("Mailchimp upsert error:", upsertData);
      return NextResponse.json(
        { error: upsertData.detail || "Subscription failed" },
        { status: 500 }
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
        }
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