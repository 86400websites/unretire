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

/**
 * PG-007 reads: "Testimonials and community numbers on /book, /stories and
 * /community are real — no placeholder text; stats traceable to locked-facts."
 *
 * THE FIRST VERSION OF THIS TEST ASSERTED SOMETHING WEAKER, and the difference
 * mattered. It swept all three pages for words like "placeholder" and "swap in
 * real", so it was satisfied by deleting the LABEL rather than the invented
 * content — and that is exactly what S4.5c then did to /stories, turning the
 * test green while six invented archetypes stayed on a page whose own metadata
 * calls them "Real people who refused to fade". Known issue 9 has a name for
 * that state: "strictly worse than the labelled state it replaced". PR #7 did
 * it once and S1.7 was created to revert it.
 *
 * So the property is split in two, because the two pages are in different
 * states and pretending otherwise is what caused the mistake:
 *
 *  • /book and /community — issue 9 IS closed. The invented content was
 *    removed, so BOTH the content and any admission must be absent.
 *  • /stories — issue 9 is NOT closed. The archetypes are still there pending
 *    an owner decision, so the page must be honestly LABELLED. A page carrying
 *    invented stories with no label fails; so does a page still labelled once
 *    the stories are real. It can only move to a better state, never quietly
 *    to a worse one.
 */
const ADMITS_PLACEHOLDER = [
  /placeholder/i,
  /swap in real/i,
  /lorem ipsum/i,
  /coming soon/i,
  /\bTBD\b/,
  /\bTK\b/,
];

test("PG-007 — /book and /community carry no invented content and no admission", async ({
  page,
}) => {
  for (const route of ["/book", "/community"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const text = await page.locator("body").innerText();

    // The content itself: the four testimonials were all bylined "Reader name".
    expect(text, `${route} still shows a placeholder testimonial`).not.toMatch(
      /reader name/i,
    );

    const admitted = ADMITS_PLACEHOLDER.filter((p) => p.test(text)).map(String);
    expect(admitted, `${route} still admits to placeholder copy`).toEqual([]);
  }
});

test("PG-007 — /stories is either real or honestly labelled, never invented-and-unlabelled", async ({
  page,
}) => {
  await page.goto("/stories", { waitUntil: "domcontentloaded" });
  const text = await page.locator("body").innerText();

  // The archetype titles are the invented content. If they are gone, the owner
  // has resolved Known issue 9 and the label must go with them.
  const INVENTED = ["The Mentor", "The Artist", "The Athlete"];
  const stillInvented = INVENTED.filter((title) => text.includes(title));
  const labelled = ADMITS_PLACEHOLDER.some((p) => p.test(text));

  if (stillInvented.length > 0) {
    expect(
      labelled,
      `/stories renders invented stories (${stillInvented.join(", ")}) on a page whose ` +
        "metadata calls them real, with nothing telling the visitor they are placeholders. " +
        "Known issue 9 — either replace them with real, attributable stories or restore the label.",
    ).toBe(true);
  } else {
    expect(
      labelled,
      "/stories no longer shows the invented archetypes, so the placeholder label is stale — " +
        "remove it and close Known issue 9 in PROJECT-STATUS §10",
    ).toBe(false);
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
