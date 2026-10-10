/**
 * Which deployment the harness may point at.
 *
 * Moved out of playwright.config.ts in Sprint S5.2 so the rule can be ASSERTED
 * (tests/e2e/security/target-guard.spec.ts) instead of trusted. The config
 * calls resolveTarget() once at load; the spec calls it with every combination
 * that must be refused.
 *
 * Three kinds of target, and what unlocks each:
 *
 *   Preview     https://unretire-<hash>-86400-s-projects.vercel.app — always,
 *               never the production-branch alias (unretire-git-master-…). The
 *               ONLY target a bypass-bearing run may have.
 *   Local       http://localhost — a credential-free self-check. Refused the
 *               moment a bypass secret is present.
 *   Production  https://www.unretireproject.com — ONLY for the daily morning
 *               check (E2E_MORNING=1, set by .github/workflows/morning-check.yml
 *               and nothing else) and ONLY while no bypass secret is present.
 *
 * The production host is a literal, deliberately. It could have been read from
 * an env name, but the morning workflow already takes its target URL from the
 * environment — an allow-list the same environment can rewrite is not an
 * allow-list. Moving the site to a new domain edits this one line, and that
 * edit is reviewed like any other change to the harness's reach.
 *
 * Refused in every mode: any other host — including the Vercel default alias
 * unretire.vercel.app (Known issue 58) — http on a deployed host, and any
 * Production target while a bypass secret is set: the secret must never be
 * sent anywhere but a Preview.
 */

export const PROJECT_HOST =
  /^unretire-[a-z0-9-]+-86400-s-projects\.vercel\.app$/;
// The production branch's alias shares the project-host shape; refuse it outright.
export const PRODUCTION_BRANCH_ALIAS = /^unretire-git-master-/;
export const LOCAL_HOST = /^(localhost|127\.0\.0\.1)$/;
// The canonical production host (docs/GOOGLE-SEARCH-CONSOLE.md §1; D-2 amended
// 2026-08-27). Exact match only: not the apex, not an alias, not a subdomain.
export const PRODUCTION_HOST = "www.unretireproject.com";

export interface TargetFlags {
  /** VERCEL_AUTOMATION_BYPASS_SECRET is set (GitHub Actions secrets only). */
  bypassPresent: boolean;
  /** E2E_MORNING=1 — the read-only daily check against Production. */
  morningRun: boolean;
}

export function resolveTarget(
  raw: string | undefined,
  flags: TargetFlags,
): string {
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
  const host = url.hostname;
  const https = url.protocol === "https:";
  const isProjectHost =
    https && PROJECT_HOST.test(host) && !PRODUCTION_BRANCH_ALIAS.test(host);
  const isLocal = url.protocol === "http:" && LOCAL_HOST.test(host);
  const isProduction = https && host === PRODUCTION_HOST;

  // A bypass-bearing run may target a Preview host and nothing else — whatever
  // other flag is set. Without a bypass: Preview, local, or (morning run only)
  // the one production host.
  const allowed = flags.bypassPresent
    ? isProjectHost
    : isProjectHost || isLocal || (flags.morningRun && isProduction);

  if (!allowed) {
    throw new Error(
      `Refusing to test ${url.origin}: the harness only targets this project's ` +
        "Vercel hosts (https://unretire-*-86400-s-projects.vercel.app, never the " +
        "production-branch alias)" +
        (flags.bypassPresent
          ? " while a bypass secret is present — the secret must never be sent anywhere else."
          : flags.morningRun
            ? `, http://localhost, or https://${PRODUCTION_HOST} for the morning check.`
            : ", or http://localhost for a local self-check. Production is never a target " +
              "outside the morning check (E2E_MORNING=1)."),
    );
  }
  // Origin only: no path or query can ride along into every request.
  return url.origin;
}
