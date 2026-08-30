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
    const lessonButtons = page.locator("button:not([disabled])");
    expect(
      await lessonButtons.count(),
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
