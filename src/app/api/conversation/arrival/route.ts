import type { NextRequest } from "next/server";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { getWebinar } from "@/lib/webinar/config";
import { declaredJson, fromAnotherSite } from "@/lib/webinar/own-site";
import { recordArrival } from "@/lib/webinar/report-store";
import { isSourceKey } from "@/lib/webinar/sources";
import { decideWrite, webinarState } from "@/lib/webinar/state";

export const runtime = "nodejs";
// The answer follows the clock (open before the start, closed from it).
export const dynamic = "force-dynamic";

/**
 * POST /api/conversation/arrival — one counted visit to /conversation, for the
 * owner's webinar report. Sprint S6.2.
 *
 * Sent by src/app/conversation/ArrivalCounter.tsx once per browser tab, with a
 * body of exactly { "source": "<one of the report's eight keys>" }. The name
 * avoids the words public blocklists match (collect, events, track, beacon,
 * pageview, stats, analytics), so a content blocker does not silently remove
 * a real visitor from the count.
 *
 * THE ORDER IS THE CONTRACT (tests/e2e/webinar/arrival-route.spec.ts asserts
 * it):
 *   1. dormant → 404, closed → 409. Decided first: a switched-off funnel does
 *      no work, and nothing is counted once the webinar has started.
 *   2. a robot's user agent → 204 and nothing stored.
 *   3. a browser request that says it comes from ANOTHER site → 403, and
 *   4. a body not declared as application/json → 415 — both from
 *      src/lib/webinar/own-site.ts, which says why. Without them any web page
 *      could make its own visitors' browsers count visits here (Codex review,
 *      round 1, Finding 3). Both come before the limiter: a refused request
 *      costs nothing.
 *   5. rate limit, in a bucket of its own; it fails closed.
 *   6. the body must be JSON → 400.
 *   7. `source` must be one of the eight keys → 400.
 *   8. store it → 204; a database failure → 503.
 * Our own counter (ArrivalCounter.tsx) sends a same-origin JSON fetch, so it
 * passes 3 and 4. Every answer is bodiless except the 429, which carries the
 * site's shared rate-limit sentence (src/lib/rate-limit.ts). Nothing from the request is
 * ever echoed or logged. Stored: the campaign id, the key and the time —
 * never the caller's IP address, user agent, referrer or address.
 */

const ROBOT = /bot|crawl|spider|slurp|facebookexternalhit|headless|preview/i;

function answer(status: number): Response {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1.
    const decision = decideWrite(webinarState(getWebinar(), new Date()));
    if (decision === 404) return answer(404);
    if (decision === 409) return answer(409);

    // 2. Robots are not visitors. Most never run the counter at all; this
    //    catches the ones that do.
    if (ROBOT.test(req.headers.get("user-agent") ?? "")) return answer(204);

    // 3.
    if (fromAnotherSite(req.headers)) return answer(403);

    // 4.
    if (!declaredJson(req.headers)) return answer(415);

    // 5. A visitor sends one of these per tab; 60 a minute per address is far
    //    above any real household or office, and far below a flood.
    const { limited, retryAfter } = await checkRateLimit(
      req.headers,
      "conversation-arrival",
      { limit: 60, windowSeconds: 60 },
    );
    if (limited) {
      const refused = rateLimitedResponse(retryAfter);
      refused.headers.set("Cache-Control", "no-store");
      return refused;
    }

    // 6.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return answer(400);
    }

    // 7.
    const source =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? (body as Record<string, unknown>).source
        : undefined;
    if (!isSourceKey(source)) return answer(400);

    // 8.
    return answer((await recordArrival(source)) ? 204 : 503);
  } catch (err) {
    console.error(
      `Visit not recorded: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return answer(503);
  }
}
