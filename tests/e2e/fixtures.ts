import { test as base, expect } from "@playwright/test";

/**
 * Shared fixtures (Sprint S2.3; Round-1 review, Finding 3).
 *
 * The Vercel Protection Bypass secret must reach the deployment under test
 * and nothing else. A context-wide `extraHTTPHeaders` would also send it to
 * every third-party host a page loads (fonts, images, off-site redirects),
 * so the header is attached here through `context.route`, only to requests
 * whose origin equals the validated `baseURL` origin. Every spec and setup
 * imports `test` from this file, never from `@playwright/test` directly.
 */
export const test = base.extend({
  context: async ({ context, baseURL }, provide) => {
    const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (secret && baseURL) {
      const origin = new URL(baseURL).origin;
      await context.route(
        (url) => url.origin === origin,
        async (route) => {
          await route.continue({
            headers: {
              ...route.request().headers(),
              "x-vercel-protection-bypass": secret,
              "x-vercel-set-bypass-cookie": "true",
            },
          });
        },
      );
    }
    await provide(context);
  },
});

export { expect };
