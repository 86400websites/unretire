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
 * KNOWN ISSUE 4, still open and blocked on decision D-3.
 *
 * These eight links are live on the site today and every one of them 404s.
 * They are listed rather than tolerated, and the listing is a RATCHET: the
 * per-page tests below fail on any dead link that is not one of these, and the
 * last test fails if one of these starts resolving without the list being
 * updated. The count can only go down, and never silently.
 *
 * D-3 decides whether the seven practice pages and the journey page get built
 * or the links get removed. Neither is this sprint's call: both need approved
 * copy or an owner instruction, and S4.5c is a test-integrity sprint.
 */
const KNOWN_DEAD = [
  "/framework/practice-connect",
  "/framework/practice-contribute",
  "/framework/practice-explore",
  "/framework/practice-grow",
  "/framework/practice-ignite",
  "/framework/practice-move",
  "/framework/practice-optimize",
  "/journeys/purpose",
];

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

test("PG-002 — Known issue 4 is still exactly the eight links on record", async ({
  api,
}) => {
  // The other direction of the ratchet. If one of the eight starts resolving,
  // the exception list is out of date and the tracker needs updating. A test
  // that quietly kept passing while its own exception list rotted would be the
  // same failure this sprint exists to fix.
  //
  // Same documented budget as the crawl above, for the same reason: each of
  // these is a route the server has never compiled, and a 404 still costs a
  // compile against `next dev`.
  test.setTimeout(120_000);

  const results = await Promise.all(
    KNOWN_DEAD.map(async (path) => ({
      path,
      status: (await api.get(path, { failOnStatusCode: false })).status(),
    })),
  );
  const stillDead = results
    .filter(({ status }) => status >= 400)
    .map(({ path }) => path);

  expect(
    stillDead,
    "Known issue 4 has changed — update KNOWN_DEAD here and PROJECT-STATUS §10",
  ).toEqual(KNOWN_DEAD);
});
