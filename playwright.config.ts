import { defineConfig, devices } from "@playwright/test";

/**
 * (Un)Retire — Playwright harness (Sprint S2.3).
 *
 * The deployment under test is named by PLAYWRIGHT_BASE_URL. In CI that value
 * is never typed by hand: the "E2E — Preview" workflow resolves it from
 * GitHub's Deployments API — a deployment of a named commit whose environment
 * starts with "Preview" — because a Vercel hostname alone cannot prove
 * "Preview" (a Production deployment shares the unretire-<hash>-… shape).
 * The check below is therefore a coarse guard, not a Preview proof: it keeps
 * a bypass-bearing run off third-party hosts, the custom Production domain
 * and the production-branch alias, and allows plain http://localhost only
 * for a credential-free local self-check. When VERCEL_AUTOMATION_BYPASS_SECRET
 * is present (GitHub Actions secrets only — never a local file) it is attached
 * only to same-origin requests by tests/e2e/fixtures.ts — never context-wide.
 * Values are read from process.env by name and the specs never log, title or
 * report them. Playwright's OWN step titles do include typed values
 * (`Fill "<value>"`), and the HTML reporter embeds those titles for passing tests
 * — which is why the workflow never uploads playwright-report/ (S2.5, Known
 * issue 51); the local report is gitignored.
 */

const PROJECT_HOST = /^unretire-[a-z0-9-]+-86400-s-projects\.vercel\.app$/;
// The production branch's alias shares the project-host shape; refuse it outright.
const PRODUCTION_BRANCH_ALIAS = /^unretire-git-master-/;
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)$/;

function resolveTarget(raw: string | undefined, bypassPresent: boolean) {
  if (!raw) {
    throw new Error(
      "PLAYWRIGHT_BASE_URL is not set. In CI the E2E — Preview workflow resolves it " +
        "from GitHub's Deployments API; locally use http://localhost:3000 for a self-check.",
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`PLAYWRIGHT_BASE_URL is not an absolute URL: ${raw}`);
  }
  const isProjectHost =
    url.protocol === "https:" &&
    PROJECT_HOST.test(url.hostname) &&
    !PRODUCTION_BRANCH_ALIAS.test(url.hostname);
  const isLocal = url.protocol === "http:" && LOCAL_HOST.test(url.hostname);
  if (bypassPresent ? !isProjectHost : !(isProjectHost || isLocal)) {
    throw new Error(
      `Refusing to test ${url.origin}: the harness only targets this project's ` +
        "Vercel hosts (https://unretire-*-86400-s-projects.vercel.app, never the " +
        "production-branch alias)" +
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

/**
 * S2.5 parity specs (tests/e2e/parity/) write real things — a signup in unretire-test, a
 * Stripe SANDBOX payment, one contact in the live Mailchimp audience — so they belong to
 * a project that exists ONLY when E2E_PARITY=1, which only the "E2E — Preview" workflow's
 * dispatch input `parity: on` sets (decision D-25). pull_request runs never carry it, and
 * the two browser projects ignore the folder outright. The project depends on the course
 * and premium setups because the checkout specs run as those fixtures; it records neither
 * trace nor screenshot (credentials are typed in it — and see the note above on step
 * titles: the HTML report is the reason playwright-report/ is never uploaded).
 */
const PARITY_SPECS = "**/parity/**";

/**
 * S5.1a role specs (tests/e2e/accounts/) reuse a stored fixture session to assert the
 * access boundaries — the allowed AND denied halves the Launch Gate requires. They are
 * split out of the two browser projects for the reason the note above records: those
 * projects must stay runnable locally with no credentials, and a `dependencies` entry
 * would make every public-page spec require the fixture secrets. This project carries the
 * dependencies instead. It records no trace: a stored session is a live auth token, and a
 * trace records the cookie that carries it.
 *
 * S3.1 adds tests/e2e/payments/ to the same project: those specs also need a stored
 * session (an already-entitled member, or a signed-in member with no entitlement), and
 * they assert money-path behaviour that needs NO real payment — the paid halves stay in
 * the dispatch-only parity project.
 */
const ROLE_SPECS = ["**/accounts/**", "**/payments/**"];
const rolesProject = {
  name: "roles-chromium",
  testMatch: ["**/accounts/*.spec.ts", "**/payments/*.spec.ts"],
  dependencies: ["setup:signed-in", "setup:course", "setup:premium"],
  use: { ...desktop, trace: "off" as const },
};
const rolesEnabled = Boolean(process.env.E2E_FIXTURE_PASSWORD);

const parityEnabled = process.env.E2E_PARITY === "1";
const parityProject = {
  name: "parity-chromium",
  testMatch: "**/parity/*.spec.ts",
  dependencies: ["setup:course", "setup:premium"],
  use: { ...desktop, trace: "off" as const, screenshot: "off" as const },
};

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
    // A Playwright trace records request headers — including the bypass header the shared
    // fixture adds — and the workflow uploads test-results/ on every run. So no trace is
    // ever recorded while a bypass secret is present (reproduced with a dummy value,
    // S2.5 — Known issue 49); locally, without a secret, a failure keeps its trace.
    trace: bypassPresent ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    setupProject("signed-in"),
    setupProject("course"),
    setupProject("premium"),
    {
      name: "desktop-chromium",
      testMatch: "**/*.spec.ts",
      testIgnore: [PARITY_SPECS, ...ROLE_SPECS],
      use: { ...desktop },
    },
    {
      name: "mobile-390",
      testMatch: "**/*.spec.ts",
      testIgnore: [PARITY_SPECS, ...ROLE_SPECS],
      use: mobile390,
    },
    ...(rolesEnabled ? [rolesProject] : []),
    ...(parityEnabled ? [parityProject] : []),
  ],
});
