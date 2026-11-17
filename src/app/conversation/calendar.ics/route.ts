import { siteOrigin } from "@/lib/site-url";
import { asciiFilename, buildIcs, joinUrl } from "@/lib/webinar/calendar";
import { CAMPAIGN, getWebinar } from "@/lib/webinar/config";
import { webinarState } from "@/lib/webinar/state";
import { COPY, calendarDescription } from "../copy";

export const runtime = "nodejs";
// Built per request from the Vercel values, so a changed date reaches the next
// download without a code change.
export const dynamic = "force-dynamic";

/**
 * GET /conversation/calendar.ics — the webinar as a calendar file.
 * Sprint S6.1.
 *
 * 404 when no webinar is configured. Otherwise one valid iCalendar event whose
 * start comes from WEBINAR_STARTS_AT, whose length is the session length in
 * config, and whose location and link are {site}/conversation/join — never the
 * Zoom address, which this file is not given.
 *
 * EVERY HEADER VALUE IS ASCII. The file name is derived from approved copy,
 * and approved copy is full of curly quotes and em-dashes; one of those in a
 * Content-Disposition header made a download route answer 500 to everyone in
 * S5.1c. `asciiFilename` returns letters, digits and hyphens only, so the
 * quoted name below needs no escaping. The BODY is UTF-8 and may carry any
 * character the copy uses.
 */
export function GET(): Response {
  const webinar = getWebinar();
  const state = webinarState(webinar, new Date());
  if (state.funnel === "dormant" || !webinar.startsAt) {
    return new Response(null, { status: 404 });
  }

  const site = siteOrigin();
  const body = buildIcs({
    start: webinar.startsAt,
    sessionMinutes: CAMPAIGN.sessionMinutes,
    summary: COPY.calendar.summary,
    description: calendarDescription(joinUrl(site)),
    site,
    now: new Date(),
  });

  const filename = `${asciiFilename(COPY.calendar.summary, "webinar")}.ics`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
