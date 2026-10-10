import { test, expect } from "../fixtures";
import { storageStatePath } from "../helpers/auth";

/**
 * Launch Gate — docs/FEATURE-LIST.md line AC-002.
 *
 * THIS SPEC IS DESTRUCTIVE, AND THAT IS WHY IT LIVES ALONE.
 *
 * `logout()` calls `supabase.auth.signOut()` with no options
 * (src/app/auth/actions.ts:178), and supabase-js defaults that to the `global`
 * scope: it revokes EVERY session belonging to that user, not merely the one in
 * this browser. The three fixture accounts are shared by the whole suite, so
 * running this in parallel with anything else using the `signed-in` fixture
 * signs that other spec out mid-test.
 *
 * That is not theoretical. On PR #21 runs #103/#104 it produced two false
 * failures — PY-003 and PY-004 both looked broken, when in fact their session
 * had been revoked underneath them by this test. The same mechanism had already
 * caused a cross-run false failure in S5.1a (runs #96/#97), fixed there by
 * keying CI concurrency on the commit; this is the same bug one level down,
 * between specs inside a single run.
 *
 * The fix is ordering, not weakening: `logout-chromium` declares a dependency
 * on `roles-chromium`, so every spec that needs a live fixture session has
 * finished before this one destroys it. Do not move this spec back in with the
 * others, and do not add a second spec here that expects a live session.
 */

test.describe("AC-002 — a member can log out", () => {
  test.use({ storageState: storageStatePath("signed-in") });

  test("AC-002 logging out ends the session", async ({ page }) => {
    await page.goto("/account");
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();

    await page.getByRole("button", { name: /log ?out|sign ?out/i }).click();
    await page.waitForURL(/\/login/);

    // The session is genuinely gone, not just navigated away from: the gated
    // route must bounce us again.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });
});
