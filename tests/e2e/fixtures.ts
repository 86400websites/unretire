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

/** The request methods of an APIRequestContext. */
const REQUEST_METHODS = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "fetch",
]);

/**
 * Known issue 69 (found in S6.2, 2026-11-20). When one of Playwright's API
 * requests fails — a timeout, a dropped connection, a test that runs out of
 * time — its error message lists every request header, the bypass header of
 * the `api` context below among them. That message is printed and written to
 * error-context.md, which the "E2E — Preview" workflow uploads, and GitHub
 * masks secrets in logs, not in uploaded files. So every request method of
 * that context goes through this wrapper: a response that arrives (whatever
 * its status) is returned untouched, and an error is replaced by the method,
 * the path and the error's class name — never the headers.
 */
export function withQuietErrors(context: APIRequestContext): APIRequestContext {
  return new Proxy(context, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      if (typeof value !== "function") return value;
      if (typeof property === "string" && REQUEST_METHODS.has(property)) {
        return async (...args: unknown[]) => {
          try {
            return await value.apply(target, args);
          } catch (err) {
            let path = "a request";
            if (typeof args[0] === "string") {
              try {
                path = new URL(args[0], "http://local.invalid").pathname;
              } catch {
                // Keep "a request".
              }
            }
            throw new Error(
              `${property.toUpperCase()} ${path} did not complete (${
                err instanceof Error ? err.name : "unknown error"
              }); the details are withheld because they list the request's headers (Known issue 69)`,
            );
          }
        };
      }
      return value.bind(target);
    },
  });
}

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
   *
   * Every request method is wrapped by withQuietErrors (Known issue 69).
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
    await provide(withQuietErrors(apiContext));
    await apiContext.dispose();
  },
});

export { expect };
