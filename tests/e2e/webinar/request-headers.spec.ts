import { request as playwrightRequest } from "@playwright/test";
import { test, expect, withQuietErrors } from "../fixtures";

/**
 * Known issue 69 (found in S6.2, 2026-11-20) — a failed request never prints
 * its headers.
 *
 * Function-level: no server and no deployment. A request context carrying a
 * marker header (a stand-in for the deployment's bypass header, which the
 * shared `api` fixture adds) asks a closed local port, so every request
 * fails. Playwright's own error lists the request's headers — the first test
 * proves that, so this spec can fail — and the wrapper the `api` fixture uses
 * (`withQuietErrors`, tests/e2e/fixtures.ts) must replace it with the method,
 * the path and the error's class name only.
 */

const MARKER = "s62-fake-bypass-value-not-a-secret";
const HEADER = "x-vercel-protection-bypass";
/** Nothing listens on the discard port, so the connection is refused. */
const CLOSED = "http://127.0.0.1:9";

async function messageOf(call: () => Promise<unknown>): Promise<string> {
  try {
    await call();
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  return "";
}

test.describe("Known issue 69 — a failed request never prints its headers", () => {
  test("Playwright's own error for a failed request does list the header (why the wrapper exists)", async () => {
    const raw = await playwrightRequest.newContext({
      baseURL: CLOSED,
      extraHTTPHeaders: { [HEADER]: MARKER },
    });
    try {
      const message = await messageOf(() => raw.get("/conversation"));
      expect(message, "the request was expected to fail").not.toBe("");
      expect(message, "Playwright's error lists the request headers").toContain(
        MARKER,
      );
    } finally {
      await raw.dispose();
    }
  });

  test("through withQuietErrors every request method fails with the method and path only", async () => {
    const raw = await playwrightRequest.newContext({
      baseURL: CLOSED,
      extraHTTPHeaders: { [HEADER]: MARKER },
    });
    const api = withQuietErrors(raw);
    try {
      const calls: [string, () => Promise<unknown>][] = [
        ["GET", () => api.get("/conversation?utm_source=linkedin")],
        ["POST", () => api.post("/api/conversation/arrival", { data: {} })],
        ["PUT", () => api.put("/report/save")],
        ["PATCH", () => api.patch("/report/save")],
        ["DELETE", () => api.delete("/report/save")],
        ["HEAD", () => api.head("/report")],
        ["FETCH", () => api.fetch("/report/login", { method: "POST" })],
      ];
      for (const [method, call] of calls) {
        const message = await messageOf(call);
        expect(message, `${method} was expected to fail`).toMatch(
          new RegExp(`^${method} /[a-z/]* did not complete \\(\\w+\\);`),
        );
        expect(message, `${method}: the header's value`).not.toContain(MARKER);
        expect(
          message.toLowerCase(),
          `${method}: the header's name`,
        ).not.toContain(HEADER);
        expect(message, `${method}: the query string`).not.toContain(
          "utm_source",
        );
      }
    } finally {
      await raw.dispose();
    }
  });

  test("the wrapper leaves everything else of the context working", async () => {
    const raw = await playwrightRequest.newContext({ baseURL: CLOSED });
    const api = withQuietErrors(raw);
    // A non-request member is passed through, bound to the real context.
    const state = await api.storageState();
    expect(state).toEqual({ cookies: [], origins: [] });
    await api.dispose();
  });
});
