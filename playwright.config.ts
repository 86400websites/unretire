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
const ROLE_SPECS = ["**/accounts/**", "**/payments/**", "**/logout/**"];

/**
 * tests/e2e/abuse/ asserts the rate limiter, whose counter is keyed on caller
 * IP + endpoint — one bucket shared by everything the runner sends. Running the
 * same file in a second browser profile would put two independent sequences
 * into that one counter, and the order of the 400s and the 429 would stop being
 * defined. So these specs belong to ONE profile. Excluding them from mobile-390
 * costs no coverage: they assert HTTP contracts through the `api` fixture and
 * never render a page, so a viewport cannot change the answer.
 */
const ABUSE_SPECS = "**/abuse/**";

/**
 * tests/e2e/crawl/ is excluded from the second profile for a related reason —
 * see the note at the top of tests/e2e/crawl/links.spec.ts. A link target is an
 * HTTP contract and does not change with the viewport, and running the crawl
 * twice doubles a genuinely expensive sweep.
 */
const CRAWL_SPECS = "**/crawl/**";

/**
 * tests/e2e/logout/ is a project of its own, and it must stay that way.
 *
 * `logout()` calls supabase `signOut()` at its default `global` scope
 * (src/app/auth/actions.ts:178), revoking EVERY session for that user rather
 * than just this browser's. The three fixture accounts are shared suite-wide,
 * so running AC-002 alongside anything else that uses the `signed-in` fixture
 * signs that spec out mid-test. It cost two false failures on PR #21 (runs
 * #103/#104) before the cause was found — the same mechanism that produced a
 * cross-run false failure in S5.1a, one level further down.
 *
 * `dependencies: ["roles-chromium"]` is the fix, and it is an ORDERING fix, not
 * a weakened assertion: everything needing a live fixture session completes
 * before this project destroys one.
 */
const logoutProject = {
  name: "logout-chromium",
  testMatch: "**/logout/*.spec.ts",
  dependencies: ["setup:signed-in", "roles-chromium"],
  use: { ...desktop, trace: "off" as const },
};

const parityEnabled = process.env.E2E_PARITY === "1";

/**
 * On a parity run, the role specs must wait for the PURCHASES.
 *
 * S4.5c. `roles-chromium` asserts what an entitled member can see; the parity
 * checkout specs are what MAKE the fixtures entitled when they own nothing. The
 * two projects used to run concurrently, which was invisible while the fixture
 * accounts permanently owned their products — and became a guaranteed failure
 * the moment those rows were cleared so a real purchase could be exercised.
 *
 * Without this the parity suite cannot be green in either direction: leave the
 * fixtures owning their products and the checkout specs correctly refuse to
 * report a purchase they did not make; clear them and five entitled-member
 * specs race the purchase and lose. Ordering resolves it, and it is the same
 * remedy — and the same reasoning — as `logout-chromium` depending on
 * `roles-chromium` below. No assertion is weakened; only the order is fixed.
 *
 * On an ordinary run E2E_PARITY is unset, the parity project does not exist,
 * and these dependencies are exactly what they always were.
 */
const rolesProject = {
  name: "roles-chromium",
  testMatch: ["**/accounts/*.spec.ts", "**/payments/*.spec.ts"],
  dependencies: [
    "setup:signed-in",
    "setup:course",
    "setup:premium",
    ...(parityEnabled ? ["parity-chromium"] : []),
  ],
  use: { ...desktop, trace: "off" as const },
};
const rolesEnabled = Boolean(process.env.E2E_FIXTURE_PASSWORD);

/**
 * A run that silently drops half the suite must never report success.
 *
 * `rolesEnabled` is what makes every access-boundary, paid-content, money-path
 * and logout spec exist. With the fixture password absent those projects are
 * simply not created — Playwright finds fewer tests, passes all of them, and
 * prints a green total. That is the shape of failure this project has already
 * been bitten by repeatedly: a suite that passes for an incidental reason. It
 * is fine locally, where a credential-free self-check is the whole point, and
 * it is never acceptable in CI, where the secrets are supposed to be present.
 */
if (process.env.CI && !rolesEnabled) {
  throw new Error(
    "E2E_FIXTURE_PASSWORD is not set in CI, so the role, payment and logout " +
      "projects would be skipped and the run would report green having never " +
      "asserted a single access boundary. Refusing to run a partial suite.",
  );
}

const parityProject = {
  name: "parity-chromium",
  testMatch: "**/parity/*.spec.ts",
  // setup:signed-in added in S5.1b: the declined-card/idempotency specs
  // (checkout-declined.spec.ts) run as the un-entitled fixture, because the
  // course/premium fixtures own their products and never reach Stripe.
  dependencies: ["setup:signed-in", "setup:course", "setup:premium"],
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
      testIgnore: [PARITY_SPECS, ABUSE_SPECS, CRAWL_SPECS, ...ROLE_SPECS],
      use: mobile390,
    },
    ...(rolesEnabled ? [rolesProject, logoutProject] : []),
    ...(parityEnabled ? [parityProject] : []),
  ],
});
