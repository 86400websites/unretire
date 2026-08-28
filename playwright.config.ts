import { defineConfig, devices } from "@playwright/test";

/**
 * (Un)Retire — Playwright harness (Sprint S2.3).
 *
 * The deployment under test is named by PLAYWRIGHT_BASE_URL — a deployed
 * Vercel Preview in CI, or http://localhost:3000 for a local self-check.
 * When VERCEL_AUTOMATION_BYPASS_SECRET is present (GitHub Actions secrets
 * only — never a local file), every request carries Vercel's sanctioned
 * Protection Bypass for Automation header. The value is read from
 * process.env by name and is never logged, titled or reported.
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error(
    "PLAYWRIGHT_BASE_URL is not set. Point it at the deployment under test — " +
      "a deployed Vercel Preview URL, or http://localhost:3000 for a local self-check.",
  );
}

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHTTPHeaders = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : undefined;

const desktop = devices["Desktop Chrome"];

/** 390 px mobile profile on Chromium, so CI installs one browser only. */
const mobile390 = {
  ...desktop,
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

type FixtureRole = "signed-in" | "course" | "premium";

/**
 * One auth-setup project per role. Each signs in one fixture account and
 * stores its session under tests/e2e/.auth/ (gitignored). Setup projects
 * never record a trace or screenshot, so a filled password field can never
 * reach an artefact.
 *
 * The two browser projects carry NO `dependencies` in S2.3: the smoke needs
 * no session, so it can run locally without credentials. S5.1 adds the
 * dependencies when role specs arrive.
 */
function setupProject(role: FixtureRole) {
  return {
    name: `setup:${role}`,
    testMatch: `**/auth/${role}.setup.ts`,
    use: { ...desktop, trace: "off" as const, screenshot: "off" as const },
  };
}

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A test that only passes on a retry or with a longer timeout is a defect,
  // not a tuning problem (docs/ENVIRONMENT-PARITY.md §6 C4).
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    extraHTTPHeaders,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    setupProject("signed-in"),
    setupProject("course"),
    setupProject("premium"),
    {
      name: "desktop-chromium",
      testMatch: "**/*.spec.ts",
      use: { ...desktop },
    },
    {
      name: "mobile-390",
      testMatch: "**/*.spec.ts",
      use: mobile390,
    },
  ],
});
