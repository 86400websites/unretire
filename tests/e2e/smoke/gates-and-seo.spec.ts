import { test, expect } from "../fixtures";
import { PRODUCTION_HOST } from "../helpers/target";

/**
 * Sprint S5.2 — three `@morning` lines that had no credential-free spec.
 *
 * The morning check runs the owner-approved `@morning` subset against
 * PRODUCTION every day, anonymous and read-only (docs/testing-setup/templates/
 * MORNING-CHECK-TEMPLATE.md). The existing assertions for two of its lines —
 * AC-010 (/account sends a stranger to /login) and AC-012 (worksheets are not
 * fetchable anonymously) — live in tests/e2e/accounts/, a project that exists
 * only when the fixture password is present, because its OTHER tests need a
 * stored session. No fixture account exists on Production, and the morning run
 * carries no secret by design (playwright.config.ts), so those files cannot be
 * the morning check. The anonymous halves are restated here, byte-for-byte in
 * intent, in a file the credential-free browser projects run. The third test
 * covers the launch-day SEO surface S5.1c added (sitemap, robots, the Search
 * Console token) and the "no accidental noindex" line of
 * docs/LAUNCH-CHECKLIST.md Phase 3.
 *
 * Nothing here writes: every request is a GET, no form is submitted, no
 * account is created, no e-mail is sent. That is the rule for a test that runs
 * against the live site every morning.
 */

const WORKSHEETS = ["m1-intro", "m1-l1", "m1-l2", "m1-l3"];
const SEARCH_CONSOLE_TOKEN = "google777f049a86d5990c.html";

test(
  "AC-012 — a stranger is refused every worksheet",
  { tag: "@morning" },
  async ({ api }) => {
    // The route Known issue 57 fixed: it must answer a stranger with 403 —
    // never 500 (the old crash) and never the PDF.
    for (const doc of WORKSHEETS) {
      const res = await api.get(`/api/course-worksheet?doc=${doc}`, {
        failOnStatusCode: false,
      });
      expect(
        res.status(),
        `worksheet ${doc} must be refused to an anonymous caller`,
      ).toBe(403);
    }
  },
);

test(
  "AC-010 — /account sends a stranger to /login",
  { tag: "@morning" },
  async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);

    // Never the content. The signed-in heading must not appear.
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toHaveCount(0);
  },
);

test(
  "SEO — sitemap, robots and the Search Console token answer on one canonical origin",
  { tag: "@morning" },
  async ({ api, baseURL }) => {
    const target = new URL(baseURL!);
    const isLocal = /^(localhost|127\.0\.0\.1)$/.test(target.hostname);
    const isProduction = target.hostname === PRODUCTION_HOST;

    // sitemap.xml — served, well-formed, and every URL on ONE origin.
    const sitemap = await api.get("/sitemap.xml", { failOnStatusCode: false });
    expect(sitemap.status(), "/sitemap.xml must be served").toBe(200);
    expect(sitemap.headers()["content-type"]).toMatch(/xml/);
    const locs = [
      ...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
    ].map((m) => m[1]);
    expect(
      locs.length,
      "the sitemap should list the public pages",
    ).toBeGreaterThanOrEqual(20);
    const origins = new Set(locs.map((loc) => new URL(loc).origin));
    expect(
      [...origins],
      "every sitemap URL must share one origin",
    ).toHaveLength(1);
    const [origin] = origins;
    // A deployed build must never advertise localhost (Known issues 19 / 54),
    // and on Production the origin must be the canonical host itself — a
    // sitemap pointing at any other host would index the wrong site.
    if (!isLocal) {
      expect(origin).toMatch(/^https:\/\//);
      expect(origin).not.toMatch(/localhost|127\.0\.0\.1/);
    }
    if (isProduction) expect(origin).toBe(target.origin);

    // robots.txt — crawlable, the two gated prefixes blocked, and the Sitemap
    // line on the same origin as the sitemap's own URLs.
    const robots = await api.get("/robots.txt", { failOnStatusCode: false });
    expect(robots.status(), "/robots.txt must be served").toBe(200);
    const rules = await robots.text();
    expect(rules).toContain("Disallow: /api/");
    expect(rules).toContain("Disallow: /account");
    expect(rules).toContain(`Sitemap: ${origin}/sitemap.xml`);

    // The Search Console verification file — Google re-checks it; if it stops
    // answering, the property un-verifies (docs/GOOGLE-SEARCH-CONSOLE.md §2b).
    const token = await api.get(`/${SEARCH_CONSOLE_TOKEN}`, {
      failOnStatusCode: false,
    });
    expect(token.status(), "the Search Console token must be served").toBe(200);
    expect((await token.text()).trim()).toBe(
      `google-site-verification: ${SEARCH_CONSOLE_TOKEN}`,
    );

    // No accidental noindex (LAUNCH-CHECKLIST Phase 3) — in two halves,
    // because only one of them is meaningful off Production.
    //
    // The HEADER half is asserted ONLY against the production host. Vercel
    // stamps `X-Robots-Tag: noindex` on every Preview deployment — verified
    // 2026-09-03: a Preview answers 302 with that header while
    // https://www.unretireproject.com carries none — and that is correct: a
    // Preview must never be indexed. Asserting its absence on a Preview would
    // fail the E2E — Preview lane for doing the right thing.
    //
    // The META half is asserted everywhere. The application emits no robots
    // meta tag on any route, so one appearing in its own HTML is a defect
    // whatever the deployment.
    const home = await api.get("/", { failOnStatusCode: false });
    expect(home.status()).toBe(200);
    if (isProduction) {
      expect(
        home.headers()["x-robots-tag"] ?? "",
        "the live site must not be told to deindex itself",
      ).not.toMatch(/noindex/i);
    }
    expect(await home.text()).not.toMatch(
      /<meta[^>]+name="robots"[^>]+noindex/i,
    );
  },
);
