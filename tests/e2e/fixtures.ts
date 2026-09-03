import {
  test as base,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
} from "@playwright/test";

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
export const test = base.extend<{ api: APIRequestContext }>({
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

  /**
   * `api` — for asserting an HTTP contract directly (a status code, a
   * content-type) rather than through a rendered page.
   *
   * Why this exists (S5.1a): `context.route` above intercepts only
   * BROWSER-initiated requests. Playwright's APIRequestContext — `page.request`
   * — is not routed, so on a protected Preview those calls arrive with no
   * bypass and **Vercel answers 401 before the app is ever reached**. Five
   * specs asserted the app's own 400/403 and got Vercel's 401 instead. The two
   * that passed did so only because a bypass COOKIE happened to be in the jar
   * from a prior navigation or a stored role session — an accident, not a
   * design, and the kind of order-dependence `docs/ENVIRONMENT-PARITY.md` §6 C4
   * rules out. Nothing was observable locally: `localhost` has no protection.
   *
   * Why `extraHTTPHeaders` is safe HERE but not on the page context: this
   * context loads no third-party assets — it issues exactly the requests a spec
   * asks for. Specs pass **relative paths only**, which resolve against
   * `baseURL`, and `baseURL` is already validated by `resolveTarget()` in
   * `playwright.config.ts` to be one of this project's Vercel hosts (never
   * Production, never the production-branch alias). So the header cannot leave
   * the deployment under test. Pass a relative path — never an absolute URL.
   *
   * With no secret set (a local self-check) the context is created without the
   * header, so `pnpm test:e2e` still runs against localhost with no credentials.
   */
  api: async ({ baseURL }, provide) => {
    if (!baseURL) throw new Error("baseURL is not configured.");
    const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    const apiContext = await playwrightRequest.newContext({
      baseURL: new URL(baseURL).origin,
      extraHTTPHeaders: secret
        ? { "x-vercel-protection-bypass": secret }
        : undefined,
    });
    await provide(apiContext);
    await apiContext.dispose();
  },
});

export { expect };
