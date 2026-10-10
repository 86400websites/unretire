/**
 * Same-origin redirect guard — Known issue 38, SECURITY-CHECKLIST §9 invariant I5.
 *
 * Lives in its own dependency-free module for two reasons: every route that
 * takes a `next`-style parameter should use the SAME guard rather than write its
 * own, and a function with no imports can be tested directly
 * (tests/e2e/security/redirect-guard.spec.ts) instead of only through a flow
 * that needs a valid auth token to reach.
 */

export const SAFE_FALLBACK = "/account";

/**
 * Resolve a caller-supplied redirect target, or fall back to a safe path.
 *
 * The guard this replaces was `raw.startsWith("/") ? raw : fallback`, which
 * reads like a same-origin check and is not one:
 *
 *   "//evil.example"   starts with "/"  →  resolves to https://evil.example
 *   "/\evil.example"   starts with "/"  →  resolves to https://evil.example
 *                                          (the WHATWG URL parser treats a
 *                                          backslash as a slash for http(s))
 *
 * That turned the single link in every account e-mail into an open redirect —
 * the victim clicks a genuine link on the real domain, arrives authenticated,
 * and is bounced to an attacker's page with every visible detail up to that
 * point legitimate.
 *
 * Rather than enumerate hostile prefixes — which is exactly how the original
 * went wrong — this RESOLVES the candidate against the request's own URL and
 * refuses anything whose origin differs. Whatever syntax is invented, it either
 * resolves to this origin or it is discarded. It then returns a PATH, never an
 * absolute URL, so the value handed to a redirect cannot carry an origin at all.
 */
export function safeNext(
  raw: string | null | undefined,
  requestUrl: string,
  fallback: string = SAFE_FALLBACK,
): string {
  if (!raw) return fallback;
  try {
    const base = new URL(requestUrl);
    const resolved = new URL(raw, base);
    if (resolved.origin !== base.origin) return fallback;
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path.startsWith("/") ? path : fallback;
  } catch {
    return fallback;
  }
}
