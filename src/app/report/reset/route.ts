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
import { resetReport } from "@/lib/webinar/report-store";

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
 *      constant time → else ?r=wrong. A session alone can never reset.
 * Then the reset (one statement, both tables), and back to /report?r=done, or
 * ?r=error if the database refused.
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
    let typed = "";
    try {
      const value = (await req.formData()).get("password");
      typed = typeof value === "string" ? value : "";
    } catch {
      return seeOther("/report?r=wrong");
    }
    if (typed.length > MAX_PASSWORD_INPUT || !passwordMatches(typed, config)) {
      return seeOther("/report?r=wrong");
    }

    return seeOther(
      (await resetReport()) ? "/report?r=done" : "/report?r=error",
    );
  } catch (err) {
    console.error(
      `Webinar report reset failed: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return seeOther("/report?r=error");
  }
}
