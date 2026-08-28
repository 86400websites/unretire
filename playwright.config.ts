import { defineConfig, devices } from "@playwright/test";

/**
 * (Un)Retire — Playwright harness (Sprint S2.3).
 *
 * The deployment under test is named by PLAYWRIGHT_BASE_URL and is validated
 * before anything runs: only this project's Vercel Preview hosts over https,
 * or plain http://localhost for a credential-free local self-check. When
 * VERCEL_AUTOMATION_BYPASS_SECRET is present (GitHub Actions secrets only —
 * never a local file) the target MUST be a Preview host, and the secret is
 * attached only to same-origin requests by tests/e2e/fixtures.ts — never
 * context-wide. The value is read from process.env by name and is never
 * logged, titled or reported.
 */

const PREVIEW_HOST = /^unretire-[a-z0-9-]+-86400-s-projects\.vercel\.app$/;
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)$/;

function resolveTarget(raw: string | undefined, bypassPresent: boolean) {
  if (!raw) {
    throw new Error(
      "PLAYWRIGHT_BASE_URL is not set. Point it at the deployment under test — " +
        "a deployed Vercel Preview URL, or http://localhost:3000 for a local self-check.",
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`PLAYWRIGHT_BASE_URL is not an absolute URL: ${raw}`);
  }
  const isPreview =
    url.protocol === "https:" && PREVIEW_HOST.test(url.hostname);
  const isLocal = url.protocol === "http:" && LOCAL_HOST.test(url.hostname);
  if (bypassPresent ? !isPreview : !(isPreview || isLocal)) {
    throw new Error(
      `Refusing to test ${url.origin}: the harness only targets this project's ` +
        "Vercel Preview hosts (https://unretire-*-86400-s-projects.vercel.app)" +
        (bypassPresent
          ? " while a bypass secret is present — the secret must never be sent anywhere else."
          : ", or http://localhost for a local self-check. Production is never a target."),
    );
  }
  // Origin only: no path or query can ride along into every request.
  return url.origin;
}

// Playwright attaches a failure-time ARIA snapshot of the page (error-context.md)
// that renders form field values — including a filled password field. This is
// the documented switch that skips it; it is defaulted here so EVERY run is
// covered, not only the workflow (Round-1 review, Finding 2). A page close in
// the auth helper is a second layer, but it cannot cover a test-timeout abort.
if (!process.env.PLAYWRIGHT_NO_COPY_PROMPT) {
  process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";
}

const bypassPresent = Boolean(process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
const baseURL = resolveTarget(process.env.PLAYWRIGHT_BASE_URL, bypassPresent);

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
 * never record a trace or screenshot, and the helper closes the page on any
 * failure so Playwright's error-context snapshot can never contain a filled
 * password field (Round-1 review, Finding 2).
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
