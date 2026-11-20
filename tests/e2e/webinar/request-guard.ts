/**
 * Keep request headers out of test errors — Sprint S6.2 (Known issue 69).
 *
 * When one of Playwright's own requests fails (a timeout, a dropped
 * connection, the test running out of time), its error message lists every
 * request and response header. The shared `api` fixture
 * (tests/e2e/fixtures.ts) adds the deployment's bypass header to every
 * request, and the specs here can add the report's session cookie. That
 * message is printed and written to error-context.md, which the "E2E —
 * Preview" workflow uploads, and GitHub masks secrets in logs, not in
 * uploaded files.
 *
 * Every request the S6.2 specs make goes through guarded(): a response that
 * arrives is returned untouched, and an error is replaced by the request's
 * name and the error's class. The fixture itself is fixed separately (Known
 * issue 69). Not a spec: Playwright collects only *.spec.ts files.
 */
export async function guarded<T>(
  what: string,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (err) {
    throw new Error(
      `${what} did not complete (${err instanceof Error ? err.name : "unknown error"}); ` +
        "the details are withheld because they list the request's headers",
    );
  }
}
