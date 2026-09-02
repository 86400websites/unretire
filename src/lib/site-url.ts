/**
 * The canonical public origin, resolved the same way `src/app/layout.tsx`
 * resolves it for `metadataBase` — so the sitemap, robots directives and Open
 * Graph URLs can never disagree about what this site's address is.
 *
 *   1. NEXT_PUBLIC_SITE_URL — the owner-configured production domain
 *      (https://www.unretireproject.com), set Production-scoped in Vercel.
 *   2. VERCEL_URL — the deployment's own hostname, set by the platform at build
 *      time. This is what keeps a DEPLOYED Preview build from ever advertising
 *      localhost (Known issue 19 / 54), even though NEXT_PUBLIC_SITE_URL is not
 *      Preview-scoped.
 *   3. localhost — the last resort, correct only for a local dev server.
 *
 * Returned without a trailing slash so callers can append paths safely.
 */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
