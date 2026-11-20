import type { NextRequest } from "next/server";
import { isAllowedHost } from "@/lib/auth/safe-origin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  isValidSession,
  REPORT_COOKIE,
  reportConfig,
} from "@/lib/webinar/report-auth";
import {
  parseReportInputs,
  saveReportInputs,
} from "@/lib/webinar/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /report/save — the owner's two boxes on /report. Sprint S6.2.
 *
 * Nothing is written unless EVERY check passes, in this order:
 *   1. the report is on, and the session cookie is valid → else back to
 *      /report (which shows the password form);
 *   2. the browser's Origin header names one of this site's own hosts
 *      (isAllowedHost — the existing helper, not a second one) → else 403.
 *      With the SameSite=Lax cookie this stops another site from posting the
 *      form on a signed-in visitor's behalf;
 *   3. rate limit, failing closed (30 saves per 10 minutes per address);
 *   4. both values valid (parseReportInputs) → else back with the error code.
 * Then the save, and back to /report?saved=1.
 *
 * Every redirect has a RELATIVE Location: no address is built from a request
 * header (Known issue 42).
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

    // 3. At most ten times the shortest window any route uses (60 s) — see
    //    the note in ../login/route.ts.
    const { limited } = await checkRateLimit(req.headers, "report-save", {
      limit: 30,
      windowSeconds: 600,
    });
    if (limited) return seeOther("/report?e=busy");

    // 4.
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return seeOther("/report?e=error");
    }
    const parsed = parseReportInputs({
      countFrom: form.get("countFrom"),
      showedUp: form.get("showedUp"),
    });
    if (!parsed.ok) return seeOther(`/report?e=${parsed.code}`);

    const saved = await saveReportInputs(parsed.value);
    return seeOther(saved ? "/report?saved=1" : "/report?e=save");
  } catch (err) {
    console.error(
      `Report numbers not saved: ${err instanceof Error ? err.name : "unknown"}.`,
    );
    return seeOther("/report?e=error");
  }
}
