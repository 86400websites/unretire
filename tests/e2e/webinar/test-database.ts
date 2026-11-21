import { PRODUCTION_BRANCH_ALIAS, PROJECT_HOST } from "../helpers/target";

/**
 * Where the report spec may write — Sprint S6.2, after the independent
 * review (round 1, Finding 2; round 2, Finding 1).
 *
 * tests/e2e/webinar/report-page.spec.ts stores one visit and then RESETS the
 * report, deleting every count of the campaign. That is safe only on the test
 * database, unretire-test, and a hostname cannot prove a database: a
 * Production deployment's own address has the same shape as a Preview's, and a
 * Preview could be given the wrong database values. So the spec needs TWO
 * proofs, and skips its writing half, by name, when either is missing:
 *
 *   1. The target is the Preview the "E2E — Preview" workflow resolved through
 *      GitHub's Deployments API (isWorkflowPreview): only that workflow sets
 *      E2E_PREVIEW_ORIGIN, to the address GitHub recorded for a successful
 *      Preview deployment of the tested commit. Without it the test password
 *      is never sent anywhere.
 *   2. The deployment itself says its report uses the test database
 *      (isTestDatabase): the signed-in report page names the Supabase project
 *      its numbers come from (data-report-db, from the address every request
 *      of src/lib/webinar/report-store.ts goes to), and the spec reads it
 *      before it stores or deletes anything.
 */

/**
 * unretire-test's Supabase project ref (supabase/migrations/README.md). A
 * literal, on purpose, like the production host in ../helpers/target.ts: a
 * value the environment could rewrite would be the target checking itself.
 * Not a secret — it is the public part of the project's address.
 */
export const TEST_DATABASE_REF = "dtdadtggahjsrmevwvbu";

/** A host with the shape of this project's Vercel deployments, never the production branch's alias. */
export function isPreviewHost(host: string): boolean {
  return PROJECT_HOST.test(host) && !PRODUCTION_BRANCH_ALIAS.test(host);
}

/**
 * Proof 1: the target is exactly the origin the workflow resolved as a
 * successful Preview — and still has a Preview's shape, over https.
 */
export function isWorkflowPreview(
  baseURL: string | undefined,
  resolvedPreviewOrigin: string | undefined,
): boolean {
  if (!baseURL || !resolvedPreviewOrigin) return false;
  let target: URL;
  let resolved: URL;
  try {
    target = new URL(baseURL);
    resolved = new URL(resolvedPreviewOrigin);
  } catch {
    return false;
  }
  return (
    target.protocol === "https:" &&
    target.origin === resolved.origin &&
    isPreviewHost(target.hostname)
  );
}

/** Proof 2: what the signed-in report says its database is — the test one. */
export function isTestDatabase(ref: string | null | undefined): boolean {
  return ref === TEST_DATABASE_REF;
}
