import { getWebinar } from "@/lib/webinar/config";
import { webinarState } from "@/lib/webinar/state";

export const runtime = "nodejs";
// Read per request: the destination is a Vercel value the owner can change
// with a Redeploy, and whether this route exists at all follows that value.
export const dynamic = "force-dynamic";

/**
 * GET /conversation/join — the one place that knows the Zoom address.
 * Sprint S6.1.
 *
 * Every "Join on Zoom" link — on the thank-you state, in the emails, in the
 * calendar file — points HERE, never at Zoom. So the meeting can be changed
 * with one Vercel value and every link already sent keeps working, and the raw
 * address never has to appear in an email, a page, a JSON response or a log.
 *
 * DORMANT IS CHECKED FIRST. Production holds a Zoom address from the day this
 * ships (the build requires one whenever a start is set), but no start: so
 * this is the route that proves the guard. With no webinar configured it
 * answers 404 and reads nothing else.
 *
 * THE REDIRECT TARGET IS NOT CALLER-CONTROLLED. No query parameter, header or
 * path segment is read. The destination is the configured value, already
 * validated by src/lib/webinar/env.ts — https, no credentials, and a host that
 * is zoom.us or ends in ".zoom.us" — and it is the NORMALISED address that
 * check returned, so what is sent is precisely what was validated. This is the
 * site's only off-site redirect.
 *
 * `no-store` because the answer changes with a Redeploy: a browser or a proxy
 * that remembered last week's meeting would send people to the wrong room.
 * It stays open after the start on purpose — people join late.
 */
export function GET(): Response {
  const webinar = getWebinar();
  const state = webinarState(webinar, new Date());
  if (state.funnel === "dormant" || !webinar.zoomUrl) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: webinar.zoomUrl,
      "Cache-Control": "no-store",
    },
  });
}
