import { test, expect, type Page } from "@playwright/test";

/**
 * Launch Gate smoke (docs/testing-setup/SETUP-CHECKLIST.md Part 4): the
 * homepage loads with no errors. Runs in both browser profiles.
 *
 * The "not the Vercel login page" assertion is what proves the sanctioned
 * Protection Bypass reached the deployment — a protected Preview answers
 * every request with `Login – Vercel` otherwise.
 */

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

test(
  "the homepage loads with no errors",
  { tag: "@smoke" },
  async ({ page }) => {
    const errors = collectErrors(page);

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page).not.toHaveTitle(/Login – Vercel/);
    await expect(page).toHaveTitle(/\(Un\)Retire/);
    await expect(page.locator("h1").first()).toBeVisible();

    expect(errors).toEqual([]);
  },
);
