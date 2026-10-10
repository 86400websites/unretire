import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Webinar registration → Mailchimp.
 *
 * Mirrors /api/subscribe (same lazy config + MD5 upsert pattern) but is
 * dedicated to the live-webinar campaign:
 *   • fields: firstName, lastName, email, country (+ honeypot `website`)
 *   • merge fields: FNAME, LNAME, COUNTRY — with a graceful retry that drops
 *     COUNTRY if the audience has no such merge field (so a missing field can
 *     never block a registration)
 *   • tags: "webinar" (the standing audience tag) + "webinar-nov4-1900"
 *     (the single-session journey trigger)
 *   • honest fail-closed: returns 503 if Mailchimp env vars aren't set, so the
 *     UI never shows a fake "you're registered" when nothing was saved.
 *
 * The honeypot field `website` is hidden from humans. If it arrives filled, a
 * bot submitted the form: we return success WITHOUT touching Mailchimp.
 */
function mailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) return null;
  const dc = apiKey.split("-")[1]; // e.g. "us22"
  if (!dc) return null;
  return {
    listId,
    base: `https://${dc}.api.mailchimp.com/3.0`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
}

const WEBINAR_TAGS = ["webinar", "webinar-nov4-1900"];

function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) &&
    value.trim().length <= 320
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName =
    typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";

  // Bot trap: a filled honeypot means a bot. Pretend success, save nothing.
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  // Server-side validation (never trust the client).
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 },
    );
  }
  if (!firstName) {
    return NextResponse.json(
      { error: "First name is required" },
      { status: 400 },
    );
  }

  const config = mailchimpConfig();
  // Honest fail-closed: if the integration isn't configured, say so (503).
  if (!config) {
    console.error("Webinar: Mailchimp env vars are not set");
    return NextResponse.json(
      { error: "Registration is temporarily unavailable" },
      { status: 503 },
    );
  }
  const { listId, base, headers } = config;

  const subscriberHash = crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");

  const memberUrl = `${base}/lists/${listId}/members/${subscriberHash}`;

  const baseMerge: Record<string, string> = {};
  if (firstName) baseMerge.FNAME = firstName;
  if (lastName) baseMerge.LNAME = lastName;

  async function upsert(mergeFields: Record<string, string>) {
    const res = await fetch(memberUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: mergeFields,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  try {
    // First attempt includes COUNTRY.
    const withCountry = country
      ? { ...baseMerge, COUNTRY: country }
      : baseMerge;
    let { res, data } = await upsert(withCountry);

    // If Mailchimp rejects because the audience has no COUNTRY merge field,
    // retry without it rather than failing the registration.
    if (!res.ok && country) {
      const detail = JSON.stringify(data).toLowerCase();
      const looksLikeMergeIssue =
        detail.includes("merge") ||
        detail.includes("country") ||
        res.status === 400;
      if (looksLikeMergeIssue) {
        ({ res, data } = await upsert(baseMerge));
      }
    }

    if (!res.ok) {
      console.error("Webinar Mailchimp upsert error:", data);
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 502 },
      );
    }

    // Apply both tags in one call. The tags endpoint returns 204 on success.
    // A tag failure shouldn't lose the registration — log and continue.
    const tagRes = await fetch(`${memberUrl}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tags: WEBINAR_TAGS.map((name) => ({ name, status: "active" })),
      }),
    });
    if (!tagRes.ok) {
      const tagData = await tagRes.json().catch(() => ({}));
      console.error("Webinar Mailchimp tag error:", tagData);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webinar registration error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
