import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers docs/FEATURE-LIST.md lines PG-001, PG-004 and PG-011.
 *
 * These are ⚪ lines: untested, outcome genuinely unknown. They are written to
 * assert the CORRECT behaviour, not today's behaviour — a failure here is a
 * finding for docs/test-reports/, not a spec to soften.
 *
 * Runs in both browser profiles (desktop-chromium and mobile-390), which is
 * how PG-001's "on desktop and on a 390px phone" half is satisfied: the same
 * spec runs twice under different viewports rather than resizing by hand.
 *
 * ONE ROUTE PER TEST, deliberately. An earlier draft looped every route inside
 * a single test and shared one 30 s budget across 26 navigations, which failed
 * for reasons that had nothing to do with the site. Splitting is the correct
 * fix; raising the timeout would have been the forbidden one
 * (docs/ENVIRONMENT-PARITY.md §6 C4).
 */

/**
 * Every public route in the app, from `find src/app -name page.tsx` at head
 * baa1d92. Routes that deliberately redirect when signed out (`/account` →
 * `/login`, `/reset-password` → `/forgot-password`) are NOT here; they are
 * asserted as access boundaries in tests/e2e/accounts/ instead.
 */
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/articles",
  "/assess",
  "/blog",
  "/book",
  "/community",
  "/contact",
  "/enterprise",
  "/forgot-password",
  "/framework",
  "/journeys",
  "/learn",
  "/learn/course",
  "/login",
  "/newsletter",
  "/podcast",
  "/practice",
  "/premium",
  "/signup",
  "/speaking",
  "/start",
  "/stories",
  "/tools",
  // Dynamic routes, one real instance each (slugs read from articlesData.ts
  // and courseData.ts — not invented).
  "/blog/why-retirement-feels-like-drift",
  "/learn/course/module-1",
] as const;

/**
 * Console noise from third-party embeds is not this site's defect. YouTube,
 * Stripe and Google font hosts are excluded by ORIGIN — never by message text,
 * which would risk hiding a real error that happens to mention them.
 */
const THIRD_PARTY = [
  "youtube.com",
  "youtube-nocookie.com",
  "ytimg.com",
  "google.com",
  "gstatic.com",
  "googleapis.com",
  "doubleclick.net",
  "stripe.com",
  "formspree.io",
];

function isThirdParty(location: string): boolean {
  return THIRD_PARTY.some((host) => location.includes(host));
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    if (isThirdParty(msg.location().url)) return;
    errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

test.describe("PG-001 — every public page loads with no errors", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`PG-001 ${route} renders cleanly`, async ({ page }) => {
      const errors = collectErrors(page);

      const response = await page.goto(route);
      expect(response?.status(), `${route} should answer 200`).toBe(200);

      // Proves the sanctioned Protection Bypass reached the deployment: a
      // protected Preview answers every request with the Vercel login page.
      await expect(page).not.toHaveTitle(/Login – Vercel/);

      await expect(
        page.locator("h1").first(),
        `${route} should render a top-level heading`,
      ).toBeVisible();

      // No horizontal scroll AT THIS PROJECT'S VIEWPORT — which is what makes
      // the mobile-390 run a genuine 390 px check rather than a repeat.
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(overflows, `${route} scrolls sideways`).toBe(false);

      expect(errors, `${route} logged browser errors`).toEqual([]);
    });
  }
});

test("PG-004 — a wrong URL shows the site's own branded 404", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist-s51a");
  expect(response?.status(), "a missing route should answer 404").toBe(404);

  // "Branded, not a blank error" (docs/FEATURE-LIST.md PG-004). The site's own
  // chrome is the proof: a visitor who mistypes a URL must still be able to get
  // back into the site. Next's built-in 404 renders neither header nor footer.
  await expect(
    page.getByRole("navigation").or(page.locator("header")).first(),
    "the 404 page should carry the site header/navigation",
  ).toBeVisible();
  await expect(
    page.locator("footer").first(),
    "the 404 page should carry the site footer",
  ).toBeVisible();
});

test("PG-011 — social and canonical URLs are absolute and not localhost", async ({
  page,
  baseURL,
}) => {
  // metadataBase resolves og:* against the deployment's own origin, so a local
  // self-check legitimately produces localhost URLs. The assertion that matters
  // — "never localhost" — is therefore made only against a deployed target
  // (Known issue 19's failure mode was Production resolving to localhost).
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(baseURL ?? "");

  await page.goto("/");
  const ogImage = page.locator('meta[property="og:image"]');

  if (await ogImage.count()) {
    const image = await ogImage.first().getAttribute("content");
    expect(image, "og:image must be absolute").toMatch(/^https?:\/\//);
    if (!isLocal) {
      expect(
        image,
        "a deployed og:image must not resolve to localhost",
      ).not.toMatch(/localhost/);
    }
  }
});

/**
 * Uniqueness is a property of the SET of titles, so it has to be asserted in
 * one test — a per-route test cannot see the others (fullyParallel puts them in
 * separate workers, each with its own module state). Five navigations sit well
 * inside one budget; the 26-route sweep above is the one that had to be split.
 */
test("PG-011 — key pages each have their own non-empty title", async ({
  page,
}) => {
  const TITLED_ROUTES = ["/", "/about", "/book", "/premium", "/learn/course"];
  const seen = new Map<string, string>();

  for (const route of TITLED_ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const title = (await page.title()).trim();
    expect(title, `${route} has no <title>`).not.toBe("");

    const clash = seen.get(title);
    expect(clash, `${route} shares its <title> with ${clash}`).toBeUndefined();
    seen.set(title, route);
  }
});
