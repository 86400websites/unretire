import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const API_KEY = process.env.MAILCHIMP_API_KEY!;
const LIST_ID = process.env.MAILCHIMP_LIST_ID!;
const DC = API_KEY.split("-")[1]; // e.g. "us22"
const BASE = `https://${DC}.api.mailchimp.com/3.0`;

function authHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, tag, mergeFields } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

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
      `${BASE}/lists/${LIST_ID}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: authHeaders(),
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
        `${BASE}/lists/${LIST_ID}/members/${subscriberHash}/tags`,
        {
          method: "POST",
          headers: authHeaders(),
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
