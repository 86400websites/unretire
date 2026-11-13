import type { APIRequestContext } from "@playwright/test";
import { test, expect } from "../fixtures";

/**
 * Sprint S6.1 — FEATURE-LIST line PR-008: /conversation/join sends people only
 * to the real Zoom meeting, and only while a webinar is configured.
 *
 * This is the site's one off-site redirect, so the contract is asserted over
 * HTTP, state-aware like the page spec: a dormant deployment must answer 404
 * (Production holds a Zoom address from the day this ships, so this route is
 * the one that proves the guard), and any other must answer a plain 307.
 *
 * THREE RULES THIS FILE KEEPS, each for a reason:
 *
 *   • THE REDIRECT IS NEVER FOLLOWED. `api` carries the Vercel Protection
 *     Bypass secret as a header; following the redirect would send that
 *     header to another company's server. Every request here sets
 *     `maxRedirects: 0`.
 *   • THE LOCATION IS NEVER PRINTED OR ATTACHED. The address is a meeting
 *     link — whoever has it can join. It is parsed in memory and reduced to
 *     true/false answers, and only those reach an `expect`, so a failure
 *     message cannot quote it either.
 *   • NO PAGE IS OPENED. A browser would follow the redirect by itself.
 */

/** Is the funnel dormant here? Anything but the app's own 200 or 404 is an error. */
async function isDormant(api: APIRequestContext): Promise<boolean> {
  const page = await api.get("/conversation", { failOnStatusCode: false });
  const status = page.status();
  expect(
    [200, 404],
    "/conversation answered neither 200 nor 404 — on a protected Preview a 401 " +
      "means the bypass header did not reach the deployment",
  ).toContain(status);
  return status === 404;
}

test.describe("PR-008 — the join link goes to Zoom, and only while a webinar is configured", () => {
  test("PR-008 dormant: /conversation/join does not exist", async ({ api }) => {
    test.skip(
      !(await isDormant(api)),
      "a webinar is configured on this deployment; the dormant check does not apply",
    );

    const response = await api.get("/conversation/join", {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    expect(
      response.status(),
      "with no start date the join route must answer 404, whatever else is set",
    ).toBe(404);
    expect(
      "location" in response.headers(),
      "a 404 must not carry a Location header",
    ).toBe(false);
  });

  test("PR-008 configured: a plain 307 to an https zoom.us address, never cached", async ({
    api,
  }) => {
    test.skip(
      await isDormant(api),
      "this deployment's funnel is dormant; there is no join link to check",
    );

    const response = await api.get("/conversation/join", {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    expect(response.status(), "the join route must answer exactly 307").toBe(
      307,
    );

    const headers = response.headers();
    // A browser or a proxy that remembered last week's meeting would send
    // people to the wrong room.
    expect(headers["cache-control"]).toBe("no-store");

    // Reduced to booleans BEFORE any assertion — see the header of this file.
    let https = false;
    let zoomHost = false;
    let noCredentials = false;
    try {
      const target = new URL(headers["location"] ?? "");
      const host = target.host.toLowerCase();
      https = target.protocol === "https:";
      zoomHost = host === "zoom.us" || host.endsWith(".zoom.us");
      noCredentials = target.username === "" && target.password === "";
    } catch {
      // Not an absolute address: all three stay false.
    }
    expect(https, "the join redirect must be an https address").toBe(true);
    expect(
      zoomHost,
      "the join redirect must go to zoom.us or one of its subdomains",
    ).toBe(true);
    expect(
      noCredentials,
      "the join redirect must not carry a username or password",
    ).toBe(true);

    // Nothing a caller sends can change where it goes: no parameter is read.
    const steered = await api.get(
      "/conversation/join?next=https://example.test/&url=https://example.test/",
      { maxRedirects: 0, failOnStatusCode: false },
    );
    expect(steered.status()).toBe(307);
    expect(
      (steered.headers()["location"] ?? "") === (headers["location"] ?? ""),
      "a query string changed the redirect target",
    ).toBe(true);

    // Only GET is offered; a form can never be posted through this route.
    const posted = await api.post("/conversation/join", {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    expect(posted.status()).toBe(405);
  });
});
