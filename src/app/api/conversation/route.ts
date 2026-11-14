import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import {
  addTags,
  mailchimpMissingEnv,
  resubscribeArchived,
  upsertMember,
} from "@/lib/mailchimp/client";
import { CAMPAIGN, getWebinar } from "@/lib/webinar/config";
import { validateRegistrationPayload } from "@/lib/webinar/registration-payload";
import { decideWrite, webinarState } from "@/lib/webinar/state";
import { COPY, REJECTION_COPY } from "@/app/conversation/copy";

export const runtime = "nodejs";
// The answer follows the clock (open before the start, closed from it), so it
// can never be decided at build time.
export const dynamic = "force-dynamic";

/**
 * POST /api/conversation — the webinar funnel's one write. Sprint S6.1.
 *
 * Both forms on /conversation post here. The body says which FORM was
 * submitted; the server chooses the tag. A caller can never name one.
 *
 * THE ORDER IS THE CONTRACT. Each step is placed where it is for a reason, and
 * tests/e2e/webinar/conversation-route.spec.ts asserts every one of them:
 *
 *   1. dormant → 404. Decided first, before the limiter and before the body is
 *      read: with no webinar configured (Production until go-live) this route
 *      does not exist, and a route that does not exist does no work.
 *   2. rate limit — the /api/subscribe allowance, in a bucket of its own. It
 *      fails closed (src/lib/rate-limit.ts).
 *   3. the body must be JSON → 400.
 *   4. the validator → 400. A filled anti-spam field is refused HERE, with the
 *      same 400 as any other invalid payload. It is never answered with a
 *      pretend success.
 *   5. the webinar has started → 409 with the approved "registration has
 *      closed" text.
 *   6. Mailchimp is not configured → 503, decided before any request leaves.
 *   7. Mailchimp.
 *
 * WHAT A CALLER IS TOLD. `{ ok: true, emailable }` or `{ error }`, where the
 * error is always one of the fixed, approved sentences in the copy file.
 * Nothing from Mailchimp is ever passed on — not a status code, not a word —
 * and the Zoom address is not known to this file at all.
 *
 * `emailable: false` is still a success, and it is honest: the sign-up was
 * recorded, but Mailchimp will not deliver to that address, so the page tells
 * the visitor to save the link now instead of promising an email.
 */

function refuse(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}

function accepted(emailable: boolean): NextResponse {
  return NextResponse.json({ ok: true, emailable });
}

/** The one message for every failure on our side or Mailchimp's. */
function upstreamFailed(): NextResponse {
  return refuse(502, COPY.errors.signUpFailed);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Dormant. Nothing above this line, and nothing below it runs.
    const decision = decideWrite(webinarState(getWebinar(), new Date()));
    if (decision === 404) return new NextResponse(null, { status: 404 });

    // 2. Public, and it writes to the one LIVE Mailchimp audience every
    //    environment shares (D-22) — and here a tag starts an email flow.
    const { limited, retryAfter } = await checkRateLimit(
      req.headers,
      "conversation",
      { limit: 10, windowSeconds: 60 },
    );
    if (limited) return rateLimitedResponse(retryAfter);

    // 3.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return refuse(400, COPY.errors.invalidRequest);
    }

    // 4.
    const parsed = validateRegistrationPayload(body);
    if (!parsed.ok) return refuse(400, REJECTION_COPY[parsed.code]);

    // 5. Understood, and refused: the webinar has started.
    if (decision === 409) return refuse(409, COPY.closed.text);

    // 6. Fail closed BEFORE any fetch. Only the variable's NAME is logged.
    const missing = mailchimpMissingEnv();
    if (missing) {
      console.error(
        `Conversation sign-up refused: ${missing} is not set or not usable.`,
      );
      return refuse(503, COPY.errors.signUpFailed);
    }

    // 7. The tag is the server's choice, from the form that was submitted.
    const tag =
      parsed.form === "register"
        ? CAMPAIGN.tags.registered
        : CAMPAIGN.tags.toolkit;

    const upsert = await upsertMember(parsed.email, parsed.firstName);

    // Mailchimp judged the address itself to be not real: ask them to check it.
    if (upsert.kind === "invalid-address") {
      return refuse(400, COPY.errors.checkEmail);
    }

    // A forgotten address, or one in a compliance state: nobody may add it by
    // API, so there is no contact to tag. This is the ONE success without a
    // tag — not our failure, not the visitor's mistake — and it is reported as
    // an address that cannot be emailed.
    if (upsert.kind === "refused-address") return accepted(false);

    if (upsert.kind !== "ok") return upstreamFailed();

    // Only `subscribed` can be emailed. Unsubscribed, cleaned, pending and
    // transactional contacts keep the status they have — a form never
    // resubscribes someone who said no — and are still tagged below.
    let emailable = upsert.status === "subscribed";

    // Archived is different: archiving is the audience owner's housekeeping,
    // not an opt-out, and this person has just signed up afresh. ONE update;
    // if Mailchimp refuses it, the address is reported as not emailable.
    if (upsert.status === "archived") {
      emailable = await resubscribeArchived(parsed.email);
    }

    // The tag is what starts the email flow and what the saved segments are
    // built on. A sign-up whose tag did not land is NOT a sign-up: say so.
    const tagged = await addTags(parsed.email, [tag]);
    if (!tagged) return upstreamFailed();

    return accepted(emailable);
  } catch (err) {
    // Nothing above is expected to throw. If something does, the caller gets
    // the fixed message and the log gets the error's NAME only — a message can
    // quote a request URL, and that URL contains the audience id.
    console.error(
      `Conversation sign-up failed: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return upstreamFailed();
  }
}
