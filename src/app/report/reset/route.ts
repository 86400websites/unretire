import type { NextRequest } from "next/server";
import { isAllowedHost } from "@/lib/auth/safe-origin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  isValidSession,
  MAX_PASSWORD_INPUT,
  passwordMatches,
  REPORT_COOKIE,
  reportConfig,
} from "@/lib/webinar/report-auth";
import { CAMPAIGN } from "@/lib/webinar/config";
import { isPeriodStamp, resetReport } from "@/lib/webinar/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /report/reset — "Start again for a new webinar" on /report. Sprint
 * S6.2, added when the owner simplified the report at Gate B (D-65).
 *
 * DELETES every counted visit and every counted person of the current
 * campaign, for good. Nothing is deleted unless EVERY check passes, in this
 * order:
 *   1. the report is on, and the session cookie is valid → else back to
 *      /report (which shows the password form);
 *   2. the browser's Origin header names one of this site's own hosts
 *      (isAllowedHost — the existing helper) → else 403. With the
 *      SameSite=Lax cookie this stops another site from posting the form on a
 *      signed-in visitor's behalf;
 *   3. rate limit, failing closed (5 tries per 10 minutes per address; at most
 *      ten times the shortest window any route uses — see ../login/route.ts);
 *   4. the report password, typed again into this form and compared in
 *      constant time → else ?r=wrong. A session alone can never reset;
 *   5. the page's own campaign and `since` (hidden in the form): the campaign
 *      must still be the current one and `since` well-formed → else
 *      ?r=stale. A form from before a new webinar, or from before this
 *      check existed, deletes nothing.
 * Then the reset — one statement, both tables, and only if the campaign's
 * counting still began at that `since` (the database checks it in the same
 * statement; else ?r=stale) — and back to /report?r=done, or ?r=error if the
 * database refused.
 *
 * Every redirect has a RELATIVE Location: no address is built from a request
 * header (Known issue 42). The password is never logged.
 */

function seeOther(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store" },
  });
}

function fromOwnSite(origin: string | null): boolean {
  if (!origin) return false;
  try {
    return isAllowedHost(new URL(origin).host);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1.
    const config = reportConfig();
    if (!config) return seeOther("/report");
    if (!isValidSession(req.cookies.get(REPORT_COOKIE)?.value, config)) {
      return seeOther("/report");
    }

    // 2.
    if (!fromOwnSite(req.headers.get("origin"))) {
      return new Response(null, {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // 3.
    const { limited } = await checkRateLimit(req.headers, "report-reset", {
      limit: 5,
      windowSeconds: 600,
    });
    if (limited) return seeOther("/report?r=busy");

    // 4.
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return seeOther("/report?r=wrong");
    }
    const value = form.get("password");
    const typed = typeof value === "string" ? value : "";
    if (typed.length > MAX_PASSWORD_INPUT || !passwordMatches(typed, config)) {
      return seeOther("/report?r=wrong");
    }

    // 5.
    const campaign = form.get("campaign");
    const since = form.get("since");
    if (campaign !== CAMPAIGN.id) return seeOther("/report?r=stale");
    if (since !== "" && !isPeriodStamp(since)) {
      return seeOther("/report?r=stale");
    }

    const outcome = await resetReport(since === "" ? null : since);
    return seeOther(
      outcome === "done"
        ? "/report?r=done"
        : outcome === "stale"
          ? "/report?r=stale"
          : "/report?r=error",
    );
  } catch (err) {
    console.error(
      `Webinar report reset failed: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return seeOther("/report?r=error");
  }
}
