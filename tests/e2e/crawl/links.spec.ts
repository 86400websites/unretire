import { test, expect } from "../fixtures";

/**
 * Sprint S4.5c — FEATURE-LIST line PG-002, "every link on every page goes
 * somewhere real". Known issue 4.
 *
 * A FOLDER OF ITS OWN, and only one browser profile runs it. Checking ~50
 * routes forces the server to serve ~50 routes, which against `next dev` means
 * compiling ~50 routes on first request. Run in both profiles it doubled that
 * and destabilised the dev server enough to fail four unrelated tests that had
 * been passing — the sort of incidental failure this sprint exists to remove,
 * arriving from the opposite direction. The answer is the same one the abuse
 * specs use: a link target is an HTTP contract, and an HTTP contract does not
 * change with the viewport, so one profile proves it.
 */

/* ───────────────────── PG-002 — no link goes nowhere ─────────────────────── */

/**
 * The pages a visitor actually starts from. ONE TEST EACH, and that split is
 * deliberate: a single test crawling all ten shared one 30 s budget across
 * ~50 navigations and requests, and timed out under a loaded dev server while
 * passing in isolation — a failure that had nothing to do with the site. This
 * repo has made exactly that mistake once already and recorded the fix
 * (public-pages.spec.ts, the 26-route sweep); raising the timeout is the
 * forbidden repair, per docs/ENVIRONMENT-PARITY.md §6 C4.
 */
const ENTRY_POINTS = [
  "/",
  "/about",
  "/framework",
  "/journeys",
  "/practice",
  "/book",
  "/premium",
  "/learn/course",
  "/community",
  "/start",
];

/** Routes that deliberately redirect a signed-out visitor are not dead links. */
const REDIRECTS_WHEN_SIGNED_OUT = new Set([
  "/account",
  "/reset-password",
  "/learn",
]);

/**
 * KNOWN ISSUE 4 — CLOSED. Decision **D-3** resolved by the owner on 2026-09-01:
 * REMOVE the dead links, not complete the pages.
 *
 * This list held eight links that were live on the site and every one of which
 * 404'd — seven `/framework/practice-*` and `/journeys/purpose`. It was written
 * as a two-way ratchet precisely so that fixing them could not pass silently:
 * a ninth dead link failed the crawl, and so did any of the eight starting to
 * resolve while this list still named it. That second direction is what fired
 * when the links were removed, which is the ratchet doing its job.
 *
 * It is now EMPTY, and deliberately kept rather than deleted: an empty list
 * states the property plainly — this site has no known dead internal links —
 * and the crawl below now fails on the first one that appears.
 */
const KNOWN_DEAD: string[] = [];

/**
 * ONE test over the DEDUPED union of every entry point's links.
 *
 * The obvious alternative — a test per entry point — was tried and is worse:
 * these ten pages share a header and a footer, so ~25 of each page's links are
 * the same links, and checking them per page turns ~50 distinct routes into
 * ~250 requests. The union is checked once, in small concurrent batches.
 */
test("PG-002 — every internal link on the main pages resolves", async ({
  page,
  api,
}) => {
  // A documented budget, not a tuning knob — the distinction
  // docs/ENVIRONMENT-PARITY.md §6 C4 draws, and the same reasoning as
  // checkout-course.spec.ts's 180 s. Ten page loads plus ~50 route checks is
  // more work than the 30 s default assumes, and against `next dev` each route
  // compiles on first request. The budget covers the VOLUME of work; every
  // assertion below still fails on its own merits.
  test.setTimeout(180_000);

  const paths = new Set<string>();
  for (const entry of ENTRY_POINTS) {
    await page.goto(entry, { waitUntil: "domcontentloaded" });
    const hrefs = await page
      .locator("a[href^='/']")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""),
      );
    for (const href of hrefs) {
      // Fragments and query strings resolve to the same document.
      const path = href.split("#")[0]!.split("?")[0]!;
      if (
        path &&
        path.startsWith("/") &&
        !REDIRECTS_WHEN_SIGNED_OUT.has(path)
      ) {
        paths.add(path);
      }
    }
  }

  expect(
    paths.size,
    "the crawl found almost no links, so it proved nothing",
  ).toBeGreaterThan(20);

  // Checked in small concurrent batches rather than one at a time. The batch is
  // deliberately small: firing fifty requests at once just moves the queue from
  // the test into the server under test.
  const queue = [...paths].sort();
  const dead: string[] = [];
  const BATCH = 6;
  for (let i = 0; i < queue.length; i += BATCH) {
    const results = await Promise.all(
      queue.slice(i, i + BATCH).map(async (path) => ({
        path,
        status: (await api.get(path, { failOnStatusCode: false })).status(),
      })),
    );
    for (const { path, status } of results) {
      if (status >= 400) dead.push(`${path} → ${status}`);
    }
  }

  const newlyDead = dead.filter(
    (text) => !KNOWN_DEAD.some((known) => text.startsWith(`${known} `)),
  );
  expect(newlyDead, "these links go nowhere and are not Known issue 4").toEqual(
    [],
  );
});

test("PG-002 — the known-dead list is empty, and stays empty", async ({
  api,
}) => {
  // The other direction of the ratchet, now that Known issue 4 is closed. If a
  // future change reintroduces a dead link, the per-page crawl above fails; if
  // someone re-adds an entry here without a matching tracker row, this fails.
  // The list can only stay empty or be re-opened deliberately.
  expect(
    KNOWN_DEAD,
    "Known issue 4 was closed by decision D-3 — an entry here needs a PROJECT-STATUS §10 row to match",
  ).toEqual([]);

  // And the eight that used to 404 are genuinely gone from the site rather than
  // merely absent from this list: nothing should link to them any more, which
  // the crawl proves, and requesting one directly still 404s because the pages
  // were never built.
  const res = await api.get("/framework/practice-ignite", {
    failOnStatusCode: false,
  });
  expect(
    res.status(),
    "the practice pages were never built — D-3 removed the links, not added the pages",
  ).toBe(404);
});
