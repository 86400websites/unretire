import { test, expect } from "../fixtures";

/**
 * Sprint S4.5c — the red→green proof for Known issue 46, SECURITY-CHECKLIST §6,
 * invariant I8 and FEATURE-LIST line PR-005.
 *
 * Issue 46 was closed in 0792bd9 on the strength of a manual probe, and the
 * tracker records the headers as "verified on the response". Nothing in the
 * suite read them, so the claim was true on the day it was made and unguarded
 * every day after: a later change to next.config.ts could drop the whole block
 * and every test would still pass.
 *
 * §6 requires the headers on the DEPLOYED response, which is why this asserts
 * what the deployment actually sent rather than what the config file says.
 */

/**
 * The directives §6 requires, and the reason each is here — so a future reader
 * widening the policy has to argue with a specific line rather than a vague one.
 */
const REQUIRED_CSP_DIRECTIVES = [
  // Nothing loads from an origin we did not name.
  "default-src 'self'",
  // No <object>/<embed> — a classic script-execution bypass.
  "object-src 'none'",
  // A <base> tag cannot be injected to re-root every relative URL.
  "base-uri 'self'",
  // Clickjacking: the modern half of the X-Frame-Options pair.
  "frame-ancestors",
  // Forms cannot be made to post somewhere else.
  "form-action 'self'",
];

test(
  "PR-005 — the deployed response carries every required security header",
  { tag: "@morning" },
  async ({ page }) => {
    const response = await page.goto("/");
    expect(response, "the home page must respond").not.toBeNull();
    const headers = response!.headers();

    // Present, and with the value §6 names — not merely present.
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]?.toUpperCase()).toMatch(
      /^(DENY|SAMEORIGIN)$/,
    );
    expect(
      headers["referrer-policy"],
      "a referrer policy that leaks the full URL cross-origin is not a policy",
    ).toMatch(/no-referrer|same-origin|strict-origin/);

    // Permissions-Policy must actually deny something; an empty header is a
    // header, not a control.
    expect(
      headers["permissions-policy"],
      "Permissions-Policy is missing",
    ).toBeTruthy();
    expect(headers["permissions-policy"]).toMatch(/=\(\)/);

    const csp = headers["content-security-policy"];
    expect(csp, "Content-Security-Policy is missing").toBeTruthy();
    for (const directive of REQUIRED_CSP_DIRECTIVES) {
      expect(csp, `CSP is missing "${directive}"`).toContain(directive);
    }
  },
);

test("PR-005 — the policy allows only origins this site actually loads", async ({
  page,
  baseURL,
}) => {
  const response = await page.goto("/");
  const csp = response!.headers()["content-security-policy"] ?? "";

  // §6 requires the allow-list to be narrow. These are the origins the code was
  // audited against in 0792bd9; anything else appearing here is a widening that
  // was never argued for.
  const ALLOWED_EXTERNAL = [
    "youtube.com", // lesson video iframes
    "youtube-nocookie.com",
    "vercel.live", // preview toolbar — non-production builds only, see below
    "vercel.com",
    "pusher.com", // vercel.live's realtime channel
    "assets.vercel.com",
    // Not an external origin at all: `next dev` adds http://localhost:* to
    // connect-src for its own hot-reload socket. It cannot appear on a
    // deployed build, which is what the launch gate actually judges.
    "localhost",
    "127.0.0.1",
  ];

  const origins = csp.match(/https?:\/\/[^\s;]+|wss:\/\/[^\s;]+/g) ?? [];
  const unexpected = origins.filter(
    (origin) => !ALLOWED_EXTERNAL.some((allowed) => origin.includes(allowed)),
  );
  expect(unexpected, "the CSP names an origin the site does not load").toEqual(
    [],
  );

  // formspree.io in particular must be gone: pre-launch review Finding 8 moved
  // all three forms behind /api/form, so the browser never reaches Formspree
  // and connect-src has no business naming it.
  expect(
    csp,
    "formspree.io should have left connect-src with Finding 8",
  ).not.toContain("formspree");

  // vercel.live is a build-time tool, permitted on preview builds only. The
  // deployment under test IS a preview or a local build: the harness points at
  // Production only in the S5.2 morning lane, and this test is deliberately not
  // in that lane (its allow-list names preview-only origins). Its absence in
  // Production is asserted by the production probe recorded in PROJECT-STATUS §6.
  expect(baseURL, "this test never runs against the production host").toMatch(
    /vercel\.app|localhost|127\.0\.0\.1/,
  );
});

test("PR-005 — an API response is protected too, not just the pages", async ({
  api,
}) => {
  // Headers applied to page routes but not to /api would leave every JSON
  // response unprotected — worth asserting, because the two are configured in
  // one place and it is easy to scope them to pages by accident.
  const res = await api.get("/api/course-worksheet?doc=m1-l1", {
    failOnStatusCode: false,
  });

  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
});
