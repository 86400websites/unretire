import { test, expect } from "../fixtures";

/**
 * Sprint S4.5c — the red→green proofs that S4.5 promised and never wrote.
 * Covers docs/FEATURE-LIST.md lines PG-003, PG-006 and PG-007.
 * PG-002 (the link crawl) lives in tests/e2e/crawl/links.spec.ts — see the
 * note there on why it is a project of its own.
 *
 * All four were 🔴 lines whose fix sprint was supposed to write the spec in its
 * own branch. Known issues 3, 8 and 9 were then marked FIXED on the strength of
 * a build report and a manual read, and the pre-launch review's Finding 10
 * caught that: "several claimed closures have no red→green spec". A closure
 * nothing guards is a closure that will quietly reopen.
 */

/* ─────────────── PG-003 — the pages you cannot take money without ────────── */

test("PG-003 — the footer's Privacy and Terms links open real pages", async ({
  page,
}) => {
  // Known issue 3: both 404'd, which is why it was launch-blocking. Asserting
  // the ROUTES alone would not have caught it — the pages could exist while the
  // footer pointed somewhere else — so this follows the links a visitor uses.
  await page.goto("/");

  for (const [name, path] of [
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ] as const) {
    const link = page.locator(`footer a[href="${path}"]`).first();
    await expect(link, `the footer must link to ${path}`).toHaveCount(1);

    const response = await page.goto(path);
    expect(response?.status(), `${path} must not 404`).toBe(200);

    // A page that renders its shell and no content would still return 200.
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${path} must render a real page, not an empty shell`,
    ).toBeVisible();
    expect(
      (await page.locator("main").innerText()).length,
      `${path} must carry substantive copy`,
    ).toBeGreaterThan(500);

    await page.goBack();
    expect(name).toBeTruthy();
  }
});

/* ──────────────── PG-006 — one lesson count, everywhere ──────────────────── */

test("PG-006 — the lesson count is the same claim on every page", async ({
  page,
}) => {
  // Known issue 8: the home page said "Thirty-one lessons" while the course
  // page said forty-eight, and courseData totals 48. LAUNCH-CHECKLIST.md:20
  // requires every exact claim to be identical site-wide. Red before af092f3.
  const WRONG = /thirty-one lessons|31 lessons/i;
  const RIGHT = /forty-eight lessons|48 lessons/i;

  for (const route of ["/", "/learn/course", "/terms"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const text = await page.locator("body").innerText();

    expect(text, `${route} still states the old lesson count`).not.toMatch(
      WRONG,
    );
    if (route !== "/terms") {
      expect(text, `${route} should state the lesson count`).toMatch(RIGHT);
    }
  }

  // And the number the course page renders from the data must agree with the
  // prose, so the two cannot drift apart again.
  await page.goto("/learn/course", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("48", { exact: true }).first(),
    "the course page's Lessons stat is rendered from courseData",
  ).toBeVisible();
});

/* ─────────────── PG-007 — nothing on the site is a placeholder ───────────── */

test("PG-007 — no page admits to showing placeholder content", async ({
  page,
}) => {
  // Known issue 9. S4.5 removed the four "Reader name" testimonials and the
  // unverified "340+ Members / 18 Countries" figures from /book and
  // /community — and left /stories still telling visitors, in the page's own
  // words, that its cards are placeholders. This sweep is over all three pages
  // named by FEATURE-LIST PG-007, which is what the single-page fix missed.
  const PLACEHOLDER = [
    /placeholder/i,
    /reader name/i,
    /lorem ipsum/i,
    /swap in real/i,
    /coming soon/i,
    /\bTBD\b/,
    /\bTK\b/,
  ];

  for (const route of ["/book", "/stories", "/community"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const text = await page.locator("body").innerText();

    const admitted = PLACEHOLDER.filter((pattern) => pattern.test(text)).map(
      (pattern) => String(pattern),
    );
    expect(admitted, `${route} still shows placeholder copy`).toEqual([]);
  }
});

test("PG-007 — community numbers are not invented", async ({ page }) => {
  // The second half of Known issue 9: "340+ Members" and "18 Countries" were
  // stated as fact and traceable to nothing. docs/content/locked-facts.md is
  // the only source an exact claim may come from.
  await page.goto("/community", { waitUntil: "domcontentloaded" });
  const text = await page.locator("body").innerText();

  for (const invented of [/340\+?\s*members/i, /18\s*countries/i]) {
    expect(text, `an unverified figure is back on /community`).not.toMatch(
      invented,
    );
  }
});
