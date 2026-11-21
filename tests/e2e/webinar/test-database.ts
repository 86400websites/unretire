import { PRODUCTION_BRANCH_ALIAS, PROJECT_HOST } from "../helpers/target";

/**
 * Whether a target host is a Vercel Preview of this project — the only kind
 * of deployment whose database is known to be unretire-test: the hosting
 * configuration binds Preview to it, and tests/e2e/parity/signup.spec.ts
 * proves the binding. A spec that writes to or deletes from the webinar
 * report's tables runs only there (the Codex review of S6.2, Finding 2): a
 * local server's database cannot be seen from a spec, and the live site is
 * never a target for a write.
 */
export function isPreviewHost(host: string): boolean {
  return PROJECT_HOST.test(host) && !PRODUCTION_BRANCH_ALIAS.test(host);
}
