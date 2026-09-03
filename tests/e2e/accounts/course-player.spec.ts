import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";

/**
 * Launch Gate — Sprint S5.1a discovery probe.
 * Covers docs/FEATURE-LIST.md line IN-005.
 *
 * Runs in the roles-chromium project (a stored fixture session, no credential
 * typed here). The lesson VIDEO is the thing a paying customer bought, so
 * "the player renders a playable lesson for an entitled member" is the line
 * that proves the product actually delivers.
 */

test.describe("IN-005 — lesson video for an entitled member", () => {
  test.use({ storageState: storageStatePath("course") });

  test("IN-005 an entitled member gets a playable lesson", async ({ page }) => {
    await page.goto("/learn/course/module-1");

    // The player is unlocked: lesson rows are selectable, not disabled.
    //
    // S4.5c: this used to be `page.locator("button:not([disabled])")` over the
    // WHOLE page, which matches the site's own header and footer chrome — the
    // menu toggle alone satisfies it. The count could therefore never reach
    // zero, on this page or any other, so it was the same
    // assertion-that-cannot-fail as the AC-015 one the pre-launch review
    // caught. Scoped to the player, and stated as the thing that actually
    // matters: an entitled member has NO locked rows.
    const player = page.locator("main");
    expect(
      await player.locator("button[disabled]").count(),
      "no lesson row should be disabled for an entitled member",
    ).toBe(0);
    expect(
      await player.locator("button:not([disabled])").count(),
      "an entitled member should have selectable lessons",
    ).toBeGreaterThan(0);

    // And the lesson surface embeds the video the customer paid for.
    const frame = page.locator('iframe[src*="youtube"]').first();
    await expect(
      frame,
      "an entitled member should see the lesson video embed",
    ).toBeVisible({ timeout: 15_000 });

    const src = await frame.getAttribute("src");
    expect(src, "the embed should carry a real video id").toMatch(
      /youtube(-nocookie)?\.com\/embed\/[A-Za-z0-9_-]{5,}/,
    );
  });
});
