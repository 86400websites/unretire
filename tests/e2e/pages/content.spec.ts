import { test, expect } from "../fixtures";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers docs/FEATURE-LIST.md lines PG-005, PG-008, PG-009 and PG-010.
 *
 * PG-006 (lesson-count inconsistency, Known issue 8) and PG-007 (placeholder
 * testimonials, Known issue 9) were deferred from here to the S4.5 fix sprint.
 * S4.5 landed the fixes and never wrote the specs, which the pre-launch
 * review'''s Finding 10 caught. They are now in
 * tests/e2e/pages/links-and-copy.spec.ts, together with PG-002 and PG-003.
 */

test(
  "PG-005 — home shows the course and Premium offers at the prices /premium states",
  { tag: "@morning" },
  async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Both offers appear on the home page at their approved prices.
    await expect(page.getByText("$99", { exact: false }).first()).toBeVisible();
    await expect(
      page.getByText("$199", { exact: false }).first(),
    ).toBeVisible();

    // The same two numbers must appear on /premium. A price that disagrees
    // between the landing page and the sales page is a conversion defect, and
    // LAUNCH-CHECKLIST.md:20 requires every exact claim to be identical site-wide.
    await page.goto("/premium", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("$199", { exact: false }).first(),
    ).toBeVisible();

    await page.goto("/learn/course", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("$99", { exact: false }).first()).toBeVisible();
  },
);

test("PG-008 — the blog lists posts and every listed post opens", async ({
  page,
  api,
}) => {
  await page.goto("/blog");

  const postLinks = page.locator('a[href^="/blog/"]');
  const count = await postLinks.count();
  expect(count, "/blog should list at least one post").toBeGreaterThan(0);

  // Collect the hrefs first — navigating invalidates the locators.
  const hrefs = new Set<string>();
  for (let i = 0; i < count; i += 1) {
    const href = await postLinks.nth(i).getAttribute("href");
    if (href && href !== "/blog/") hrefs.add(href);
  }

  // Reachability is an HTTP question, so ask it over HTTP — rendering each post
  // in a browser would add nothing to this assertion. Issued concurrently
  // because fourteen sequential fetches exceed a single test budget on a dev
  // server that compiles each route on first hit, and reachability has no
  // ordering requirement.
  //
  // Via the `api` fixture rather than `page.request`: these are anonymous
  // fetches, and `page.request` would only reach a protected Preview because
  // the goto above happened to leave a bypass cookie in the jar. That made the
  // test silently order-dependent — it would have started failing the moment
  // the navigation moved or was removed.
  const results = await Promise.all(
    [...hrefs].map(async (href) => ({
      href,
      status: (await api.get(href, { failOnStatusCode: false })).status(),
    })),
  );
  const broken = results
    .filter((r) => r.status !== 200)
    .map((r) => `${r.href} → ${r.status}`);
  expect(broken, "these listed posts do not open").toEqual([]);
});

test(
  "PG-009 — an unpaid visitor sees ten locked modules and a buy CTA",
  { tag: "@morning" },
  async ({ page }) => {
    await page.goto("/learn/course");

    const moduleLinks = page.locator('a[href^="/learn/course/module-"]');
    await expect(
      moduleLinks.first(),
      "the curriculum list should render",
    ).toBeVisible();
    expect(
      await moduleLinks.count(),
      "the course should list ten modules",
    ).toBe(10);

    // Not signed in and not entitled → every module shows the locked affordance,
    // never the open-arrow one.
    await expect(
      page.locator('svg[aria-label="Locked"]').first(),
      "modules should show the locked icon to an unpaid visitor",
    ).toBeVisible();
    expect(
      await page.locator('svg[aria-label="Open"]').count(),
      "no module should show the unlocked icon to an unpaid visitor",
    ).toBe(0);

    // And the page must actually offer the purchase.
    await expect(
      page.getByRole("button", { name: /buy the course/i }).first(),
    ).toBeVisible();
  },
);

/**
 * PG-010 — the marketing pages render real content, not scaffolding.
 *
 * This asserts the launch-checklist promise that is machine-checkable
 * (LAUNCH-CHECKLIST.md:19 — "zero placeholder text, zero [placeholder] tokens,
 * zero stock lorem"). It deliberately does not assert exact approved copy
 * string-by-string: the shipped site is the approved baseline, so pinning
 * sentences here would make every future copy edit a test failure.
 */
const MARKETING_ROUTES = [
  "/about",
  "/framework",
  "/practice",
  "/journeys",
  "/start",
  "/tools",
  "/speaking",
  "/podcast",
  "/newsletter",
  "/enterprise",
  "/articles",
];

/**
 * Scaffolding tokens only — text that means "nobody wrote this yet".
 *
 * "Coming soon" is deliberately NOT here. /podcast carries an approved
 * COMING SOON badge and the approved line "The first episodes are coming
 * soon", which is a true statement about a real page, not a placeholder. An
 * earlier draft flagged it and was wrong. Whether a page advertising a podcast
 * with no episodes belongs in the launch navigation is an owner judgement, and
 * it is raised in the test report rather than asserted here.
 */
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\[placeholder\]/i,
  /\bTODO\b/,
  /\bTBD\b/,
  /\bFIXME\b/,
];

// One test per route — same reason as PG-001: eleven full page loads do not fit
// one budget, and splitting names the offending page directly in the report.
test.describe("PG-010 — marketing pages carry real content", () => {
  for (const route of MARKETING_ROUTES) {
    test(`PG-010 ${route} has real copy and no placeholder tokens`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const findings: string[] = [];

      const heading = (await page.locator("h1").first().innerText()).trim();
      if (!heading) findings.push(`${route}: empty <h1>`);

      const body = await page.locator("main, body").first().innerText();
      if (body.trim().length < 400) {
        findings.push(`${route}: only ${body.trim().length} chars of copy`);
      }

      for (const pattern of PLACEHOLDER_PATTERNS) {
        const match = body.match(pattern);
        if (match) findings.push(`${route}: placeholder text "${match[0]}"`);
      }

      expect(findings, `${route} has content problems`).toEqual([]);
    });
  }
});
