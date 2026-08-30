/**
 * Trusted-origin resolution — Known issue 42.
 *
 * The site builds absolute URLs from request headers: Stripe's return URLs and,
 * more seriously, the link in every password-reset and confirmation e-mail.
 * `x-forwarded-host` is a HEADER, and a header is whatever the caller says it
 * is. If a forged one is trusted, an attacker requests a reset for someone
 * else's address and the e-mail that lands in that person's inbox carries a
 * link to the attacker's server — with a valid token on it. The victim never
 * sees anything suspicious, because the e-mail genuinely came from us.
 *
 * The platform normally overwrites this header, but "the host normally does
 * that for us" is not a control, it is an assumption about someone else's
 * infrastructure. So the host is validated here before any URL is built from it.
 *
 * Deliberately ADDITIVE: every host this project legitimately runs on is
 * allow-listed, so behaviour is unchanged for real traffic. Only a host that is
 * none of ours is refused, and then we fall back to the configured site URL
 * rather than echoing the attacker's.
 */

/**
 * Preview deployments have generated hostnames, so they cannot be listed one by
 * one — but the shape is specific to this Vercel team. Note the required
 * `-86400-s-projects` suffix: without it, `unretire-anything.vercel.app` is a
 * name any stranger could claim. The same pattern guards the test harness in
 * playwright.config.ts.
 */
const PROJECT_PREVIEW_HOST =
  /^unretire-[a-z0-9-]+-86400-s-projects\.vercel\.app$/;

const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

function siteHosts(): string[] {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return [];
  try {
    const host = new URL(configured).host.toLowerCase();
    // Accept the apex and www form of the same domain, since either may serve.
    const bare = host.replace(/^www\./, "");
    return [host, bare, `www.${bare}`];
  } catch {
    return [];
  }
}

export function isAllowedHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const candidate = host.toLowerCase();

  if (siteHosts().includes(candidate)) return true;

  // Set by the platform, not by the caller, so it cannot be forged.
  const vercelUrl = process.env.VERCEL_URL?.toLowerCase();
  if (vercelUrl && candidate === vercelUrl) return true;

  if (PROJECT_PREVIEW_HOST.test(candidate)) return true;

  // Local development only — never a valid production host.
  if (process.env.VERCEL_ENV !== "production" && LOCAL_HOST.test(candidate)) {
    return true;
  }

  return false;
}

/**
 * Build an origin from a request's host/proto, refusing any host that is not
 * ours. `fallback` is used when the host is missing or rejected.
 */
export function safeOrigin(
  host: string | null | undefined,
  proto: string | null | undefined,
  fallback: string,
): string {
  if (!isAllowedHost(host)) {
    if (host) {
      console.error(
        `Refusing to build a URL from untrusted host "${host}"; using the configured site URL instead.`,
      );
    }
    return fallback;
  }
  // Never take the scheme from a header for a real host: a forged
  // x-forwarded-proto would otherwise downgrade an e-mail link to http.
  const scheme = LOCAL_HOST.test(host!.toLowerCase())
    ? (proto ?? "http")
    : "https";
  return `${scheme}://${host}`;
}
