import { isAllowedHost } from "@/lib/auth/safe-origin";

/**
 * Is a POST to one of the webinar funnel's public write routes from this
 * site's own page? Sprint S6.2, after the Codex review (round 1, Finding 3);
 * the sign-up route uses it too (PROJECT-STATUS D-67).
 *
 * Any web page can make its visitors' browsers send a "simple" cross-site
 * POST — plain text or a form, no permission asked — and a route would act on
 * it even though that page can never read the answer. So the visit counter
 * (POST /api/conversation/arrival) and the sign-up (POST /api/conversation)
 * refuse, before their rate limits:
 *
 *   - a browser request that says it comes from another site:
 *     Sec-Fetch-Site: cross-site, an Origin that is not one of this site's own
 *     hosts (isAllowedHost — the check the report's reset uses), or an opaque
 *     or unreadable Origin. A request with no Origin at all is not a browser's
 *     cross-site POST: browsers send Origin with every one;
 *   - a body not declared as application/json. A page on another site cannot
 *     send that without asking first (a CORS preflight), and no route here
 *     ever grants one.
 *
 * This site's own forms send a same-origin JSON fetch, so they pass both.
 */

/** A browser request that says it was made by another site's page. */
export function fromAnotherSite(headers: Headers): boolean {
  if (headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = headers.get("origin");
  if (origin === null) return false;
  try {
    return !isAllowedHost(new URL(origin).host);
  } catch {
    // "null" (a sandboxed page, a file) or anything unreadable.
    return true;
  }
}

/** The declared media type is JSON (parameters such as charset allowed). */
export function declaredJson(headers: Headers): boolean {
  const type = headers.get("content-type") ?? "";
  return type.split(";")[0].trim().toLowerCase() === "application/json";
}
