import { expect, type Page } from "@playwright/test";

/**
 * Fixture sign-in for the auth-setup projects — and proof P1.
 *
 * Each fixture account exists ONLY in the non-production Supabase project
 * `unretire-test`. Login is a Server Action (the browser never talks to
 * Supabase directly), so the only way this sign-in can succeed is if the
 * deployment under test resolves to the project that holds the account —
 * which is exactly what proof P1 (docs/ENVIRONMENT-PARITY.md §8) asks.
 *
 * Credentials come from process.env by NAME (GitHub Actions secrets). They
 * are never logged, and the password never appears in any message. Before a
 * credential is typed, the page's origin is re-checked against the validated
 * deployment under test; on ANY failure the page is closed before the runner
 * can snapshot it, so a filled password field can never reach
 * error-context.md (Round-1 review, Findings 2 and 3).
 */

export type FixtureRole = "signed-in" | "course" | "premium";

const EMAIL_VAR: Record<FixtureRole, string> = {
  "signed-in": "E2E_SIGNED_IN_EMAIL",
  course: "E2E_COURSE_EMAIL",
  premium: "E2E_PREMIUM_EMAIL",
};

const PASSWORD_VAR = "E2E_FIXTURE_PASSWORD";

export function storageStatePath(role: FixtureRole): string {
  return `tests/e2e/.auth/${role}.json`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it under GitHub → Settings → Secrets and ` +
        "variables → Actions → Secrets before running the auth setup " +
        "(docs/sprint-prompts/S2.3-playwright-harness.md, Gate 0 item 4).",
    );
  }
  return value;
}

export async function signInAs(
  page: Page,
  role: FixtureRole,
  baseURL: string | undefined,
): Promise<void> {
  const email = requireEnv(EMAIL_VAR[role]);
  const password = requireEnv(PASSWORD_VAR);
  if (!baseURL) throw new Error("baseURL is not configured.");
  const expectedOrigin = new URL(baseURL).origin;

  try {
    await page.goto("/login");

    // Never type a credential anywhere but the validated deployment under test.
    const actualOrigin = new URL(page.url()).origin;
    if (actualOrigin !== expectedOrigin) {
      throw new Error(
        `Refusing to enter credentials: /login resolved to ${actualOrigin}, ` +
          `not the deployment under test (${expectedOrigin}).`,
      );
    }

    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    // Explicit step timeouts keep an ordinary failure inside this try/catch (so the
    // page is closed below) instead of letting the whole test time out first.
    await page.waitForURL("**/account", { timeout: 15_000 });

    // The account page shows the signed-in address — the fixture's own.
    await expect(page.getByText(email, { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    await page.context().storageState({ path: storageStatePath(role) });
  } catch (err) {
    // Close before the runner's failure snapshot can see the form.
    await page.close().catch(() => undefined);
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `The "${role}" fixture could not sign in and reach /account. If this ` +
        "is a network-level failure (timeout, 5xx), the free-tier test " +
        "project may be paused — resume it in the Supabase dashboard and " +
        "re-run (docs/ENVIRONMENT-PARITY.md §6 C5). Otherwise check that the " +
        "fixture exists in unretire-test and that the deployment resolves " +
        `to it (proof P1). Detail: ${detail}`,
    );
  } finally {
    await page.close().catch(() => undefined);
  }
}
