import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  MAX_PASSWORD_INPUT,
  passwordMatches,
  reportConfig,
  sessionCookieHeader,
  sessionToken,
} from "@/lib/webinar/report-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /report/login — the /report password form. Sprint S6.2.
 *
 * In order: report off → back to /report (which says so); rate limit, failing
 * closed (10 tries per 10 minutes per address) → ?e=busy; the typed password
 * against REPORT_PASSWORD, compared in constant time → ?e=wrong; right → the
 * session cookie (src/lib/webinar/report-auth.ts) and back to /report.
 *
 * Every answer is a 303 with a RELATIVE Location: no address is ever built
 * from a request header (Known issue 42). The password is never logged and
 * never put in an address.
 */

function seeOther(location: string, setCookie?: string): Response {
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store",
  });
  if (setCookie) headers.append("Set-Cookie", setCookie);
  return new Response(null, { status: 303, headers });
}

export async function POST(req: NextRequest) {
  try {
    const config = reportConfig();
    if (!config) return seeOther("/report");

    // The window must stay at most ten times the shortest window any route
    // uses (60 s): every call's housekeeping in src/lib/rate-limit.ts deletes
    // the rows of ALL endpoints older than ten of its own windows, so a longer
    // window here could be wiped mid-window by anyone visiting /conversation —
    // and the count of tries would start again.
    const { limited } = await checkRateLimit(req.headers, "report-login", {
      limit: 10,
      windowSeconds: 600,
    });
    if (limited) return seeOther("/report?e=busy");

    let typed = "";
    try {
      const value = (await req.formData()).get("password");
      typed = typeof value === "string" ? value : "";
    } catch {
      return seeOther("/report?e=wrong");
    }
    if (typed.length > MAX_PASSWORD_INPUT || !passwordMatches(typed, config)) {
      return seeOther("/report?e=wrong");
    }

    return seeOther("/report", sessionCookieHeader(sessionToken(config)));
  } catch (err) {
    console.error(
      `Report sign-in failed: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return seeOther("/report?e=error");
  }
}
