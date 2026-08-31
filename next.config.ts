import type { NextConfig } from "next";

/**
 * Security headers — Known issue 46, SECURITY-CHECKLIST §6 and §9 invariant I8.
 *
 * The config was empty and the deployed response carried only HSTS, which the
 * platform adds by itself. §6 makes deployed-header verification a blocking
 * item, so launch could not pass the security gate without this.
 *
 * The CSP allow-list is deliberately short, because §6 requires only origins
 * the site actually loads. Each entry below was verified against the code
 * rather than added defensively:
 *
 *   • youtube.com  \u2014 lesson videos and the free course-intro preview, embedded
 *                    as iframes. `frame-src` only; nothing is fetched from it.
 *   • formspree.io \u2014 the contact, community and enterprise forms POST here via
 *                    fetch(), so it belongs in `connect-src`, not `form-action`.
 *
 * NOT included, and why \u2014 so the next reader does not "helpfully" widen it:
 *   • Supabase: the browser never talks to it. src/lib/supabase/client.ts
 *     exists but is imported by nothing, and `supabase.co` appears in no client
 *     chunk (verified in the built output, S4.5). All auth runs through Server
 *     Actions. If a browser client is ever wired up, add https://*.supabase.co
 *     to connect-src as a recorded decision.
 *   • Google Fonts: next/font/google downloads and self-hosts at build time, so
 *     the fonts come from /_next/static \u2014 no external font origin is used.
 *   • Stripe: checkout is a top-level navigation to checkout.stripe.com, which
 *     CSP does not govern; api.stripe.com is only ever called server-side.
 *   • amazon.com: ordinary links. A link is not a load.
 *
 * KNOWN LIMITATION, recorded rather than hidden: `script-src` needs
 * 'unsafe-inline' because Next's App Router injects inline hydration scripts and
 * this project does not yet issue per-request nonces. The CSP therefore does not
 * stop injected INLINE script, though it still blocks script from any external
 * origin, object/embed, base-tag hijacking and framing. Moving to a nonce-based
 * policy is a follow-up, not a launch blocker.
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Vercel injects its preview-comments toolbar (vercel.live) into NON-PRODUCTION
 * deployments only. The first version of this CSP blocked it, and every page on
 * the Preview then logged
 *
 *   Refused to load the script 'https://vercel.live/_next-live/feedback/
 *   feedback.js' because it violates ... script-src 'self' 'unsafe-inline'
 *
 * which failed PG-001 ("no console errors") across the whole suite on PR #24.
 * Local testing could not have caught it: localhost has no such injection, so
 * the toolbar only exists on a real Vercel preview.
 *
 * These origins are therefore added ONLY when the build is not Production, so
 * the live policy stays exactly as narrow as SECURITY-CHECKLIST §6 requires.
 * The toolbar is a build-time tool, not a site dependency; if Vercel Preview
 * Comments is ever switched off for the project, this block can go with it.
 */
const isProduction = process.env.VERCEL_ENV === "production";
const vercelToolbar = isProduction
  ? { script: "", connect: "", img: "", frame: "", style: "", font: "" }
  : {
      script: " https://vercel.live",
      // Vercel Live carries its realtime channel over Pusher.
      connect: " https://vercel.live wss://*.pusher.com https://*.pusher.com",
      img: " https://vercel.live https://vercel.com",
      frame: " https://vercel.live",
      style: " https://vercel.live",
      font: " https://vercel.live https://assets.vercel.com",
    };

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is required by the dev-mode React refresh runtime only.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelToolbar.script}`,
  `style-src 'self' 'unsafe-inline'${vercelToolbar.style}`,
  `img-src 'self' data: blob:${vercelToolbar.img}`,
  `font-src 'self' data:${vercelToolbar.font}`,
  `connect-src 'self' https://formspree.io${isDev ? " ws: http://localhost:*" : ""}${vercelToolbar.connect}`,
  `frame-src https://www.youtube.com https://www.youtube-nocookie.com${vercelToolbar.frame}`,
  // This site is never meant to be framed by anyone.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Redundant with frame-ancestors above, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    // Catch-all rule, as §6 requires.
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
