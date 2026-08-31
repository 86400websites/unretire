import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Server proxy for the three Formspree-backed forms — contact, community join
 * and enterprise discovery.
 *
 * Pre-launch review Finding 8 (Blocking). SECURITY-CHECKLIST §5 requires that
 * "any internet-facing public form ships with at least one enforced abuse
 * control". S4.5 added a rate limiter to /api/subscribe and stopped there, so
 * three of the four public forms still POSTed straight from the browser to
 * Formspree: no rate limit, no validation, no server involvement whatsoever.
 * An attacker did not even need the site — the endpoint was in the page source.
 *
 * Routing them through here gives all four forms the same control, and keeps
 * the Formspree endpoint server-side instead of shipping it to every visitor.
 */

/**
 * Which forms exist, and exactly which fields each may send. An allow-list, not
 * a filter: a key that is not named here is dropped rather than forwarded, so a
 * caller cannot smuggle extra fields into the owner's inbox or into Formspree's
 * own reserved parameters (_cc, _replyto, _next and friends).
 */
const FORMS = {
  contact: {
    required: ["name", "email", "message"],
    optional: ["reason"],
    subject: (f: Record<string, string>) =>
      `Contact — ${f.reason || "general"} — ${f.name}`,
  },
  community: {
    required: ["name", "email"],
    optional: ["message"],
    subject: (f: Record<string, string>) =>
      `Community join request — ${f.name}`,
  },
  enterprise: {
    required: ["name", "email"],
    optional: ["company", "phone"],
    subject: (f: Record<string, string>) =>
      `Discovery Call request — ${f.company || f.name}`,
  },
} as const;

type FormKind = keyof typeof FORMS;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { email: 254, name: 100, short: 200, message: 5000 } as const;

function limitFor(field: string): number {
  if (field === "email") return MAX.email;
  if (field === "message") return MAX.message;
  if (field === "name") return MAX.name;
  return MAX.short;
}

/**
 * The Formspree endpoint. Read from the environment by NAME, with the existing
 * hard-coded value as the fallback so behaviour does not change if the variable
 * is unset — it is a public form endpoint, not a secret, but it no longer needs
 * to be in the client bundle.
 */
function endpoint(): string {
  return (
    process.env.FORMSPREE_ENDPOINT ??
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
    "https://formspree.io/f/mgogyqey"
  );
}

export async function POST(request: NextRequest) {
  // Abuse control first, before any parsing or upstream call. Five a minute is
  // well above a person filling in a contact form and well below a script.
  const { limited, retryAfter } = await checkRateLimit(
    request.headers,
    "form",
    { limit: 5, windowSeconds: 60 },
  );
  if (limited) return rateLimitedResponse(retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const kind = String(raw.form ?? "");
  if (!Object.prototype.hasOwnProperty.call(FORMS, kind)) {
    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  }
  const spec = FORMS[kind as FormKind];

  // Build the payload from the allow-list only. Anything else the caller sent
  // is silently discarded rather than forwarded.
  const clean: Record<string, string> = {};
  for (const field of [...spec.required, ...spec.optional] as string[]) {
    const value = raw[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const trimmed = value.trim();
    if (trimmed.length > limitFor(field)) {
      return NextResponse.json(
        { error: `That ${field} is too long.` },
        { status: 400 },
      );
    }
    if (trimmed) clean[field] = trimmed;
  }

  for (const field of spec.required as readonly string[]) {
    if (!clean[field]) {
      return NextResponse.json(
        { error: "Please fill in every required field." },
        { status: 400 },
      );
    }
  }
  if (!EMAIL.test(clean.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(endpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...clean, _subject: spec.subject(clean) }),
    });

    if (!upstream.ok) {
      // Log a safe identifier only — never the upstream body (Known issue 44).
      console.error(
        `Formspree rejected the "${kind}" form with HTTP ${upstream.status}.`,
      );
      return NextResponse.json(
        { error: "We could not send that just now. Please try again shortly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    console.error(`Formspree request failed for the "${kind}" form.`);
    return NextResponse.json(
      { error: "We could not send that just now. Please try again shortly." },
      { status: 502 },
    );
  }
}
