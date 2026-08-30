import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";

/**
 * Sprint S4.3 — Known issue 37, the paid-content leak.
 * Covers docs/FEATURE-LIST.md lines AC-011 and AC-012.
 *
 * These are 🔴 lines that failed before this sprint. The $99 course was
 * protected only by its own user interface: CoursePlayer is a `"use client"`
 * component and it imported courseData.ts directly, so every visitor — signed
 * out, signed in, paid or not — received all 58 lesson video ids in the
 * JavaScript bundle, and the four worksheets sat in public/ as ordinary static
 * files. The padlock was decoration drawn over content the browser already had.
 *
 * SECURITY-CHECKLIST §9 invariant I2: paid content is never obtainable
 * anonymously through any path — UI, API, static file, or client bundle. The
 * bundle is the one that matters most here, because it is the path a padlock
 * cannot cover, so this spec checks the shipped JavaScript and not merely the
 * rendered page.
 */

/**
 * Lesson video ids, copied from src/app/learn/course/courseData.ts. They are
 * already committed in that file, so naming them here exposes nothing new — and
 * a hard-coded list is the point: the test must fail if ANY of these reaches an
 * unentitled browser, whatever the delivery mechanism.
 *
 * COURSE_INTRO_YOUTUBE_ID is deliberately NOT here. That one is the free
 * preview and is supposed to be public.
 */
const PAID_VIDEO_IDS = [
  "r81jMzTX0uI", // module 1, lesson 1
  "EUaQQ8p0EH8", // module 1, lesson 2
  "N44pfLLWiTw", // module 1, lesson 3
  "ilShYAJFc6o", // module 1 intro
  "d4ZrqHh6wN4", // module 2, lesson 1
];

const FREE_PREVIEW_ID = "yfADRqlETUU";

/** Every paid id found in a blob of text. */
function leaks(text: string): string[] {
  return PAID_VIDEO_IDS.filter((id) => text.includes(id));
}

test.describe("AC-012 — paid content is unobtainable without paying", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // anonymous

  test("AC-012 no lesson video id reaches an anonymous browser", async ({
    page,
    api,
  }) => {
    await page.goto("/learn/course/module-1");

    // 1. The rendered page, which also carries the props serialised for the
    //    client component.
    const html = await page.content();
    expect(leaks(html), "paid video ids found in the page source").toEqual([]);

    // 2. The JavaScript the page actually loads. This is where Known issue 37
    //    lived: the ids were in the bundle regardless of what the page showed,
    //    so checking only the HTML would have declared the bug fixed while it
    //    was still fully exploitable.
    const scripts = await page
      .locator("script[src]")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLScriptElement).getAttribute("src") ?? ""),
      );
    const chunks = scripts.filter((s) => s.includes("/_next/static/"));
    expect(
      chunks.length,
      "the page should load some JS chunks",
    ).toBeGreaterThan(0);

    const found: string[] = [];
    for (const src of chunks) {
      const res = await api.get(src, { failOnStatusCode: false });
      if (res.status() !== 200) continue;
      for (const id of leaks(await res.text())) found.push(`${id} in ${src}`);
    }
    expect(found, "paid video ids found in the shipped JavaScript").toEqual([]);
  });

  test("AC-012 the free preview is still public", async ({ page }) => {
    // The counterweight. A fix that hid everything would also pass the test
    // above, so assert that the deliberate free preview still reaches visitors.
    await page.goto("/learn/course");
    expect(
      (await page.content()).includes(FREE_PREVIEW_ID),
      "the free course-intro preview should remain public",
    ).toBe(true);
  });

  test("AC-012 worksheets are not fetchable anonymously", async ({ api }) => {
    for (const doc of ["m1-intro", "m1-l1", "m1-l2", "m1-l3"]) {
      const res = await api.get(`/api/course-worksheet?doc=${doc}`, {
        failOnStatusCode: false,
      });
      expect(res.status(), `worksheet ${doc} must be refused`).toBe(403);
    }

    // And the static paths they used to occupy must be gone, not merely
    // unlinked — an unlinked file is still a file.
    const stale = await api.get(
      "/assets/unretire/course/Module1_Lesson1_Worksheet.pdf",
      { failOnStatusCode: false },
    );
    expect(
      stale.status(),
      "the old public worksheet path must no longer serve the PDF",
    ).toBe(404);
  });
});

test.describe("AC-011 — a member without the course cannot reach its content", () => {
  test.use({ storageState: storageStatePath("signed-in") });

  test("AC-011 a signed-in non-buyer gets the outline, never the content", async ({
    page,
    api,
  }) => {
    await page.goto("/learn/course/module-1");

    // The outline is legitimately visible — that is the sales pitch. What must
    // not be there is the product.
    await expect(
      page.locator('svg[aria-label="Locked"]').first(),
      "a non-buyer should see the locked affordance",
    ).toBeVisible();
    expect(
      leaks(await page.content()),
      "paid video ids reached a signed-in non-buyer",
    ).toEqual([]);

    const res = await api.get("/api/course-worksheet?doc=m1-l1", {
      failOnStatusCode: false,
    });
    expect(
      res.status(),
      "a signed-in non-buyer must be refused the worksheet",
    ).toBe(403);
  });
});

test.describe("AC-011 — an entitled member DOES get the content", () => {
  test.use({ storageState: storageStatePath("course") });

  test("AC-011 the allowed half: a buyer receives the lesson video", async ({
    page,
  }) => {
    // The denied half above is worthless without this: a fix that served nobody
    // would satisfy every assertion in this file except the two below.
    await page.goto("/learn/course/module-1");
    expect(
      leaks(await page.content()).length,
      "an entitled member should receive the paid lesson data",
    ).toBeGreaterThan(0);
  });
});
