/**
 * The D-22 test-address rule — Sprint S6.2.
 *
 * Every automated or practice sign-up uses the owner's own mailbox with a
 * plus-tag that starts "ur-e2e-" or "ur-test-" (docs/PROJECT-STATUS.md D-22).
 * The webinar report must never count one.
 *
 * PURE AND IMPORT-FREE. The same rule already lives in
 * scripts/webinar-funnel.mjs (a dependency-free script, which cannot import
 * TypeScript) and in tests/e2e/helpers/parity.ts; a spec in
 * tests/e2e/webinar/ reads both files and proves the three copies agree.
 *
 * Case-insensitive, like the script's copy: a test address typed in capitals
 * is still a test address.
 */
export const TEST_ADDRESS = /^[^@+\s]+\+ur-(e2e|test)-[a-z0-9-]+@[^@\s]+$/i;

export function isTestAddress(email: string): boolean {
  return TEST_ADDRESS.test(email.trim());
}
